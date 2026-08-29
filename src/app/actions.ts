"use server";

import { prisma } from "../lib/db";
import { normalizeName } from "../lib/normalization";
import { runAnomalyEngine } from "../lib/anomalyEngine";

/**
 * Submit New Voter Registration Application
 */
export async function submitVoterApplication(data: {
    fullName: string;
    relativeName?: string;
    relationType?: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    pincode: string;
    email: string;
    mobile: string;
    epicNumber?: string;
    aadhaarOptional?: string;
    photoUrl?: string;
    documentUrl?: string;
}) {
    try {
        if (!data.fullName || !data.dateOfBirth || !data.address || !data.pincode || !data.email || !data.mobile) {
            return { success: false, error: "Please fill out all required application fields." };
        }

        const applicationNumber = `VOT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const normName = normalizeName(data.fullName);

        // Retrieve existing voters and applications for cross-screening
        const existingVoters = await prisma.voter.findMany();
        const existingApplications = await prisma.voterApplication.findMany();

        // Run 10 Anomaly Signal Engine
        const analysis = runAnomalyEngine(
            {
                fullName: data.fullName,
                relativeName: data.relativeName,
                relationType: data.relationType,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                address: data.address,
                pincode: data.pincode,
                email: data.email,
                mobile: data.mobile,
                epicNumber: data.epicNumber,
                photoUrl: data.photoUrl,
                documentUrl: data.documentUrl,
            },
            existingVoters,
            existingApplications
        );

        const initialStatus = analysis.overallRiskScore >= 30 ? "FLAGGED_DUPLICATE" : "PENDING";

        const createdApp = await prisma.voterApplication.create({
            data: {
                applicationNumber,
                fullName: data.fullName,
                normalizedName: normName,
                relativeName: data.relativeName || null,
                relationType: data.relationType || null,
                dateOfBirth: new Date(data.dateOfBirth),
                gender: data.gender,
                address: data.address,
                pincode: data.pincode,
                email: data.email,
                mobile: data.mobile,
                epicNumber: data.epicNumber || null,
                aadhaarOptional: data.aadhaarOptional || null,
                photoUrl: data.photoUrl || "sample-photo-default.jpg",
                documentUrl: data.documentUrl || "residence-proof-default.pdf",
                riskScore: analysis.overallRiskScore,
                duplicateScore: analysis.overallRiskScore,
                riskLevel: analysis.riskLevel as any,
                status: initialStatus as any,
                anomalyBreakdown: analysis.anomalyBreakdown as any,
            },
        });

        if (analysis.overallRiskScore >= 30 && analysis.matchedVoterName) {
            await prisma.duplicateFlag.create({
                data: {
                    applicationId: createdApp.id,
                    matchedVoterId: analysis.matchedVoterId || null,
                    matchedVoterName: analysis.matchedVoterName,
                    matchedVoterDetails: (analysis.matchedVoterDetails || {}) as any,
                    overallScore: analysis.overallRiskScore,
                    fieldBreakdown: analysis.anomalyBreakdown as any,
                },
            });
        }

        await prisma.auditLog.create({
            data: {
                applicationId: createdApp.id,
                action: "APPLICATION_SUBMITTED",
                performedBy: "Citizen Portal",
                notes: `Application registered. Risk Score: ${analysis.overallRiskScore}/100 (${analysis.riskLevel}). System Status: ${initialStatus}`,
            },
        });

        return {
            success: true,
            applicationNumber: createdApp.applicationNumber,
            status: createdApp.status,
            riskScore: createdApp.riskScore,
            riskLevel: createdApp.riskLevel,
            isFlagged: analysis.overallRiskScore >= 30,
        };
    } catch (err: any) {
        console.error("submitVoterApplication error:", err);
        return { success: false, error: "Application submission could not be processed. Please check your information and try again." };
    }
}

/**
 * Track Application Status by Application Number or Email
 */
export async function trackApplication(query: string) {
    try {
        const trimmed = query.trim();
        if (!trimmed) {
            return { success: false, error: "Please provide an application number or email." };
        }

        const application = await prisma.voterApplication.findFirst({
            where: {
                OR: [
                    { applicationNumber: { equals: trimmed, mode: "insensitive" } },
                    { email: { equals: trimmed, mode: "insensitive" } },
                ],
            },
            include: {
                flags: true,
                auditLogs: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!application) {
            return { success: false, error: "No voter application found matching your query." };
        }

        // Retrieve generated Voter ID if approved
        let voterIdNumber: string | null = null;
        if (application.status === "APPROVED") {
            const voter = await prisma.voter.findFirst({
                where: { email: application.email },
            });
            if (voter) voterIdNumber = voter.voterIdNumber;
        }

        return {
            success: true,
            application: {
                ...application,
                voterIdNumber,
            },
        };
    } catch (err: any) {
        console.error("trackApplication error:", err);
        return { success: false, error: "Failed to query application status." };
    }
}

/**
 * Fetch Admin Dashboard Metrics & Queues
 */
export async function getAdminDashboardData() {
    try {
        const applications = await prisma.voterApplication.findMany({
            include: {
                flags: true,
                auditLogs: {
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const totalApplications = applications.length;
        const lowRiskCount = applications.filter((a) => a.riskLevel === "LOW").length;
        const mediumRiskCount = applications.filter((a) => a.riskLevel === "MEDIUM").length;
        const highRiskCount = applications.filter((a) => a.riskLevel === "HIGH").length;
        const criticalRiskCount = applications.filter((a) => a.riskLevel === "CRITICAL").length;

        const flaggedCount = applications.filter((a) => a.status === "FLAGGED_DUPLICATE").length;
        const pendingCount = applications.filter((a) => a.status === "PENDING").length;
        const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
        const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

        // Specific anomaly detector counts
        let photoMatchCount = 0;
        let epicConflictCount = 0;

        applications.forEach((app) => {
            const breakdown = (app.anomalyBreakdown as any[]) || [];
            if (breakdown.some((b) => b.detectorId === "PHOTO_SIMILARITY" && b.status === "FLAG")) {
                photoMatchCount++;
            }
            if (breakdown.some((b) => b.detectorId === "EPIC_CONFLICT" && b.status === "FLAG")) {
                epicConflictCount++;
            }
        });

        const auditLogs = await prisma.auditLog.findMany({
            include: {
                application: {
                    select: {
                        applicationNumber: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return {
            success: true,
            metrics: {
                totalApplications,
                lowRiskCount,
                mediumRiskCount,
                highRiskCount,
                criticalRiskCount,
                flaggedCount,
                pendingCount,
                approvedCount,
                rejectedCount,
                photoMatchCount,
                epicConflictCount,
            },
            applications,
            auditLogs: auditLogs.map((log) => ({
                id: log.id,
                applicationId: log.applicationId,
                applicationNumber: log.application?.applicationNumber || "N/A",
                applicantName: log.application?.fullName || "N/A",
                action: log.action,
                performedBy: log.performedBy,
                notes: log.notes,
                createdAt: log.createdAt,
            })),
        };
    } catch (err: any) {
        console.error("getAdminDashboardData error:", err);
        return { success: false, error: "Failed to fetch admin dashboard metrics." };
    }
}

/**
 * Electoral Officer Review Decision Action
 */
export async function reviewApplication(data: {
    applicationId: string;
    decision: "APPROVED" | "REJECTED" | "FIELD_VERIFICATION_REQUESTED" | "INFO_REQUESTED";
    officerNotes?: string;
    officerName?: string;
}) {
    try {
        const { applicationId, decision, officerNotes, officerName = "Electoral Officer" } = data;

        const application = await prisma.voterApplication.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            return { success: false, error: "Target voter application not found." };
        }

        if (decision !== "APPROVED" && (!officerNotes || !officerNotes.trim())) {
            return { success: false, error: "Officer notes are mandatory for rejections and verification requests." };
        }

        let generatedVoterId: string | null = null;

        if (decision === "APPROVED") {
            generatedVoterId = `VID-2026-${Math.floor(100000 + Math.random() * 900000)}`;

            await prisma.voterApplication.update({
                where: { id: applicationId },
                data: { status: "APPROVED" },
            });

            // Upsert into official Voter registry
            await prisma.voter.create({
                data: {
                    voterIdNumber: generatedVoterId,
                    fullName: application.fullName,
                    normalizedName: application.normalizedName,
                    relativeName: application.relativeName,
                    relationType: application.relationType,
                    dateOfBirth: application.dateOfBirth,
                    gender: application.gender,
                    address: application.address,
                    pincode: application.pincode,
                    email: application.email,
                    mobile: application.mobile,
                    epicNumber: application.epicNumber || `EPIC-${Math.floor(100000 + Math.random() * 900000)}`,
                    photoUrl: application.photoUrl,
                },
            });

            await prisma.auditLog.create({
                data: {
                    applicationId,
                    action: "OFFICER_APPROVED",
                    performedBy: officerName,
                    notes: `Application APPROVED. Generated Official Voter ID: ${generatedVoterId}. ${officerNotes || ""}`,
                },
            });
        } else if (decision === "REJECTED") {
            await prisma.voterApplication.update({
                where: { id: applicationId },
                data: { status: "REJECTED" },
            });

            await prisma.auditLog.create({
                data: {
                    applicationId,
                    action: "OFFICER_REJECTED",
                    performedBy: officerName,
                    notes: `Application REJECTED by officer. Reason: ${officerNotes}`,
                },
            });
        } else if (decision === "FIELD_VERIFICATION_REQUESTED") {
            await prisma.voterApplication.update({
                where: { id: applicationId },
                data: { status: "FIELD_VERIFICATION_REQUESTED" },
            });

            await prisma.auditLog.create({
                data: {
                    applicationId,
                    action: "FIELD_VERIFICATION_REQUESTED",
                    performedBy: officerName,
                    notes: `Field verification dispatch requested by officer. Notes: ${officerNotes}`,
                },
            });
        } else if (decision === "INFO_REQUESTED") {
            await prisma.voterApplication.update({
                where: { id: applicationId },
                data: { status: "INFO_REQUESTED" },
            });

            await prisma.auditLog.create({
                data: {
                    applicationId,
                    action: "INFO_REQUESTED",
                    performedBy: officerName,
                    notes: `Additional documentation requested from applicant. Notes: ${officerNotes}`,
                },
            });
        }

        return {
            success: true,
            newStatus: decision,
            voterIdNumber: generatedVoterId,
        };
    } catch (err: any) {
        console.error("reviewApplication error:", err);
        return { success: false, error: err.message || "Failed to submit review decision." };
    }
}
