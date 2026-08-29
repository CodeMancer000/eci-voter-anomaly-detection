import { prisma } from "./prisma";

export interface ApplicationInput {
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: string;
    address: string;
    pincode: string;
    email: string;
    mobile: string;
}

export interface FieldBreakdown {
    nameScore: number;
    dobScore: number;
    addressScore: number;
    pincodeScore: number;
    contactScore: number;
    flagReasons: string[];
}

export interface DuplicateDetectionResult {
    isDuplicateFlagged: boolean;
    highestMatchScore: number;
    matchedVoterId?: string;
    matchedVoterName?: string;
    matchedVoterDetails?: any;
    fieldBreakdown?: FieldBreakdown;
}

/**
 * Calculates string similarity between 0.0 and 1.0 using Levenshtein distance & Token overlap
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();

    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    // Token set matching (e.g. "Alice Smith" vs "Smith Alice")
    const tokens1 = new Set(s1.split(/\s+/));
    const tokens2 = new Set(s2.split(/\s+/));
    let intersectionCount = 0;

    tokens1.forEach((t) => {
        if (tokens2.has(t)) intersectionCount++;
    });

    const tokenScore = (2 * intersectionCount) / (tokens1.size + tokens2.size);

    // Levenshtein distance
    const len1 = s1.length;
    const len2 = s2.length;
    const track = Array(len2 + 1)
        .fill(null)
        .map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i += 1) track[0][i] = i;
    for (let j = 0; j <= len2; j += 1) track[j][0] = j;

    for (let j = 1; j <= len2; j += 1) {
        for (let i = 1; i <= len1; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator // substitution
            );
        }
    }

    const levDistance = track[len2][len1];
    const maxLen = Math.max(len1, len2);
    const levScore = (maxLen - levDistance) / maxLen;

    // Return highest of tokenScore or levScore
    return Math.max(tokenScore, levScore);
}

/**
 * Calculates DOB similarity
 */
export function calculateDobSimilarity(dobStr1: string, dobStr2: string): number {
    const d1 = new Date(dobStr1);
    const d2 = new Date(dobStr2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

    const y1 = d1.getFullYear();
    const m1 = d1.getMonth();
    const date1 = d1.getDate();

    const y2 = d2.getFullYear();
    const m2 = d2.getMonth();
    const date2 = d2.getDate();

    if (y1 === y2 && m1 === m2 && date1 === date2) return 1.0; // Exact match
    if (y1 === y2 && m1 === m2) return 0.75; // Same month and year
    if (y1 === y2) return 0.4; // Same birth year

    return 0.0;
}

/**
 * Calculates Pincode similarity
 */
export function calculatePincodeSimilarity(pin1: string, pin2: string): number {
    const p1 = pin1.trim();
    const p2 = pin2.trim();

    if (p1 === p2) return 1.0;
    if (p1.length >= 3 && p2.length >= 3 && p1.substring(0, 3) === p2.substring(0, 3)) {
        return 0.5; // Same district/region
    }
    return 0.0;
}

/**
 * Calculates Mobile/Email similarity
 */
export function calculateContactSimilarity(
    email1: string,
    mobile1: string,
    email2: string,
    mobile2: string
): number {
    const em1 = email1.trim().toLowerCase();
    const em2 = email2.trim().toLowerCase();
    const mob1 = mobile1.trim();
    const mob2 = mobile2.trim();

    const emailMatch = em1 && em2 && em1 === em2;
    const mobileMatch = mob1 && mob2 && mob1 === mob2;

    if (emailMatch && mobileMatch) return 1.0;
    if (emailMatch || mobileMatch) return 0.8;

    return 0.0;
}

/**
 * Main Duplicate Detection Engine
 * Scans existing official Voter registry & pending VoterApplications to detect potential matches.
 */
export async function runDuplicateDetection(
    input: ApplicationInput
): Promise<DuplicateDetectionResult> {
    const voters = await prisma.voter.findMany();
    const pendingApps = await prisma.voterApplication.findMany({
        where: {
            status: { in: ["PENDING", "FLAGGED_DUPLICATE"] },
        },
    });

    let highestScore = 0;
    let bestMatchVoter: any = null;
    let bestFieldBreakdown: FieldBreakdown | null = null;

    // Helper to score applicant against a record
    const evaluateRecord = (record: {
        id: string;
        fullName: string;
        dateOfBirth: Date;
        gender: string;
        address: string;
        pincode: string;
        email: string;
        mobile: string;
        voterIdNumber?: string;
        applicationNumber?: string;
    }) => {
        const dobStrRecord = record.dateOfBirth.toISOString().split("T")[0];

        const nameScore = calculateStringSimilarity(input.fullName, record.fullName);
        const dobScore = calculateDobSimilarity(input.dateOfBirth, dobStrRecord);
        const addressScore = calculateStringSimilarity(input.address, record.address);
        const pincodeScore = calculatePincodeSimilarity(input.pincode, record.pincode);
        const contactScore = calculateContactSimilarity(
            input.email,
            input.mobile,
            record.email,
            record.mobile
        );

        // Weights: Name 35%, DOB 25%, Address 20%, Pincode 10%, Contact 10%
        const totalScore =
            nameScore * 0.35 +
            dobScore * 0.25 +
            addressScore * 0.2 +
            pincodeScore * 0.1 +
            contactScore * 0.1;

        const flagReasons: string[] = [];
        if (nameScore > 0.8) flagReasons.push(`High Name Match (${(nameScore * 100).toFixed(0)}%)`);
        if (dobScore === 1.0) flagReasons.push("Exact Date of Birth Match");
        if (addressScore > 0.7) flagReasons.push("Similar Address Location");
        if (pincodeScore === 1.0) flagReasons.push("Matching Postal Pincode");
        if (contactScore > 0.7) flagReasons.push("Identical Contact Info (Email/Mobile)");

        return {
            totalScore,
            breakdown: {
                nameScore: Math.round(nameScore * 100),
                dobScore: Math.round(dobScore * 100),
                addressScore: Math.round(addressScore * 100),
                pincodeScore: Math.round(pincodeScore * 100),
                contactScore: Math.round(contactScore * 100),
                flagReasons,
            },
        };
    };

    // Evaluate against registered voters
    for (const voter of voters) {
        const { totalScore, breakdown } = evaluateRecord(voter);
        if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMatchVoter = {
                id: voter.id,
                voterIdNumber: voter.voterIdNumber,
                fullName: voter.fullName,
                dateOfBirth: voter.dateOfBirth.toISOString().split("T")[0],
                gender: voter.gender,
                address: voter.address,
                pincode: voter.pincode,
                email: voter.email,
                mobile: voter.mobile,
                source: "REGISTERED_VOTER",
            };
            bestFieldBreakdown = breakdown;
        }
    }

    // Evaluate against pending applications
    for (const app of pendingApps) {
        const { totalScore, breakdown } = evaluateRecord(app);
        if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMatchVoter = {
                id: app.id,
                voterIdNumber: `APP: ${app.applicationNumber}`,
                fullName: app.fullName,
                dateOfBirth: app.dateOfBirth.toISOString().split("T")[0],
                gender: app.gender,
                address: app.address,
                pincode: app.pincode,
                email: app.email,
                mobile: app.mobile,
                source: "PENDING_APPLICATION",
            };
            bestFieldBreakdown = breakdown;
        }
    }

    const overallScorePercentage = Math.round(highestScore * 100);
    const isDuplicateFlagged = overallScorePercentage >= 65; // Threshold 65%

    return {
        isDuplicateFlagged,
        highestMatchScore: overallScorePercentage,
        matchedVoterId: bestMatchVoter?.id,
        matchedVoterName: bestMatchVoter?.fullName,
        matchedVoterDetails: bestMatchVoter,
        fieldBreakdown: bestFieldBreakdown || undefined,
    };
}
