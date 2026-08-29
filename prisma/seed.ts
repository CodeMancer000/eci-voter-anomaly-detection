import { prisma } from "../src/lib/db";
import { normalizeName } from "../src/lib/normalization";
import { runAnomalyEngine } from "../src/lib/anomalyEngine";

async function main() {
  console.log("🌱 Seeding 10 Realistic Synthetic Demo Records for ECI Anomaly Detection...");

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.duplicateFlag.deleteMany();
  await prisma.voterApplication.deleteMany();
  await prisma.voter.deleteMany();

  // 1. Seed Official Registered Voters Database
  const registeredVoters = [
    {
      voterIdNumber: "VID-2025-10001",
      fullName: "Rahul Gandhi",
      normalizedName: normalizeName("Rahul Gandhi"),
      relativeName: "Feroze Gandhi",
      relationType: "Father",
      dateOfBirth: new Date("1980-06-19"),
      gender: "Male",
      address: "12 Tughlak Lane, New Delhi",
      pincode: "110011",
      email: "rahul.g@example.org",
      mobile: "9876543210",
      epicNumber: "ABC1234567",
      photoUrl: "sample-photo-1.jpg",
      isDeadOrShifted: false,
    },
    {
      voterIdNumber: "VID-2025-10002",
      fullName: "Priya Sharma",
      normalizedName: normalizeName("Priya Sharma"),
      relativeName: "Rajesh Sharma",
      relationType: "Father",
      dateOfBirth: new Date("1992-04-12"),
      gender: "Female",
      address: "Plot 42, Shanti Nagar, Sector 4",
      pincode: "110001",
      email: "priya.sharma@example.com",
      mobile: "9998887770",
      epicNumber: "XYZ9876543",
      photoUrl: "sample-photo-2.jpg",
      isDeadOrShifted: false,
    },
    {
      voterIdNumber: "VID-2025-10003",
      fullName: "Vikram Malhotra (Deceased)",
      normalizedName: normalizeName("Vikram Malhotra"),
      relativeName: "Sanjay Malhotra",
      relationType: "Father",
      dateOfBirth: new Date("1955-08-25"),
      gender: "Male",
      address: "44 Model Town, Sector 9",
      pincode: "110009",
      email: "vikram.m@example.org",
      mobile: "9123456789",
      epicNumber: "DEF4567890",
      photoUrl: "sample-photo-3.jpg",
      isDeadOrShifted: true, // Marked as deceased/shifted
    },
  ];

  for (const voter of registeredVoters) {
    await prisma.voter.create({ data: voter });
  }

  // 2. Synthetic Demo Applications showcasing the 10 Anomaly Signals
  const syntheticApps = [
    // Case 1: Clean Applicant (Low Risk)
    {
      applicationNumber: "VOT-2026-00101",
      fullName: "Ananya Iyer",
      relativeName: "Suresh Iyer",
      relationType: "Father",
      dateOfBirth: new Date("1998-11-05"),
      gender: "Female",
      address: "88 Orchid Enclave, Indiranagar",
      pincode: "560038",
      email: "ananya.iyer@example.com",
      mobile: "9811223344",
      epicNumber: null,
      photoUrl: "sample-photo-clean.jpg",
      documentUrl: "residence-proof-clean.pdf",
    },
    // Case 2: Name Formatting Variation ("RAHUL GANDHI" vs "Rahul Gandhi")
    {
      applicationNumber: "VOT-2026-00102",
      fullName: "RAHUL  GANDHI", // Extra space & uppercase
      relativeName: "Feroze Gandhi",
      relationType: "Father",
      dateOfBirth: new Date("1980-06-19"),
      gender: "Male",
      address: "12 Tughlak Lane, New Delhi",
      pincode: "110011",
      email: "rahul.gandhi.new@example.com",
      mobile: "9876543210",
      epicNumber: null,
      photoUrl: "sample-photo-rg.jpg",
      documentUrl: "residence-rg.pdf",
    },
    // Case 3: Same Person Appearing at Two Locations
    {
      applicationNumber: "VOT-2026-00103",
      fullName: "Priya Sharma",
      relativeName: "Rajesh Sharma",
      relationType: "Father",
      dateOfBirth: new Date("1992-04-12"),
      gender: "Female",
      address: "105 Green Park Main, Sector 15",
      pincode: "110016",
      email: "priya.newloc@example.com",
      mobile: "9998887770",
      epicNumber: null,
      photoUrl: "sample-photo-priya2.jpg",
      documentUrl: "residence-priya2.pdf",
    },
    // Case 4: Same EPIC Assigned to Two Synthetic Records
    {
      applicationNumber: "VOT-2026-00104",
      fullName: "Rohan Varma",
      relativeName: "Sunil Varma",
      relationType: "Father",
      dateOfBirth: new Date("1990-01-15"),
      gender: "Male",
      address: "55 Sunrise Towers, Sector 62",
      pincode: "201301",
      email: "rohan.v@example.com",
      mobile: "9876001122",
      epicNumber: "XYZ9876543", // Collides with Priya Sharma's EPIC
      photoUrl: "sample-photo-rohan.jpg",
      documentUrl: "residence-rohan.pdf",
    },
    // Case 5: Photo Similarity Entry (97% Match)
    {
      applicationNumber: "VOT-2026-00105",
      fullName: "Rahul M. Gandhi",
      relativeName: "Feroze Gandhi",
      relationType: "Father",
      dateOfBirth: new Date("1980-06-19"),
      gender: "Male",
      address: "14 Connaught Place, Block C",
      pincode: "110001",
      email: "rahul.mg@example.org",
      mobile: "9876543210",
      epicNumber: null,
      photoUrl: "sample-photo-1.jpg", // Exact match with VID-2025-10001 photo
      documentUrl: "residence-cp.pdf",
    },
    // Case 6: Malformed Suspicious Name ("0.3asder")
    {
      applicationNumber: "VOT-2026-00106",
      fullName: "0.3asder", // Malformed name string
      relativeName: "Unknown",
      relationType: "Father",
      dateOfBirth: new Date("2001-07-20"),
      gender: "Male",
      address: "77 Market Road",
      pincode: "110002",
      email: "test.anomaly@example.com",
      mobile: "9812300445",
      epicNumber: null,
      photoUrl: "sample-photo-suspicious.jpg",
      documentUrl: "residence-suspicious.pdf",
    },
    // Case 7: Mobile Number Reuse Across Multiple Applications
    {
      applicationNumber: "VOT-2026-00107",
      fullName: "Deepak Sharma",
      relativeName: "Rajesh Sharma",
      relationType: "Father",
      dateOfBirth: new Date("1995-03-30"),
      gender: "Male",
      address: "Plot 42, Shanti Nagar, Sector 4",
      pincode: "110001",
      email: "deepak.sharma@example.com",
      mobile: "9998887770", // Reused mobile
      epicNumber: null,
      photoUrl: "sample-photo-deepak.jpg",
      documentUrl: "residence-deepak.pdf",
    },
    // Case 8: Address Concentration Cluster
    {
      applicationNumber: "VOT-2026-00108",
      fullName: "Kavita Sharma",
      relativeName: "Rajesh Sharma",
      relationType: "Father",
      dateOfBirth: new Date("1997-09-14"),
      gender: "Female",
      address: "Plot 42, Shanti Nagar, Sector 4", // High address cluster
      pincode: "110001",
      email: "kavita.sharma@example.com",
      mobile: "9998887770", // Reused mobile
      epicNumber: null,
      photoUrl: "sample-photo-kavita.jpg",
      documentUrl: "residence-kavita.pdf",
    },
    // Case 9: Suspicious Residence / Document Mismatch
    {
      applicationNumber: "VOT-2026-00109",
      fullName: "Siddharth Rao",
      relativeName: "Karthik Rao",
      relationType: "Father",
      dateOfBirth: new Date("1989-12-01"),
      gender: "Male",
      address: "99 Palm Avenue, Sector 56",
      pincode: "122011",
      email: "siddharth.r@example.com",
      mobile: "9899112233",
      epicNumber: null,
      photoUrl: "sample-photo-sid.jpg",
      documentUrl: "mismatch-doc.pdf", // Flagged as document mismatch
    },
    // Case 10: Combined High-Risk Anomaly Scenario
    {
      applicationNumber: "VOT-2026-00110",
      fullName: "Vikram Malhotra", // Matches deceased record
      relativeName: "Sanjay Malhotra",
      relationType: "Father",
      dateOfBirth: new Date("1955-08-25"),
      gender: "Male",
      address: "44 Model Town, Sector 9",
      pincode: "110009",
      email: "vikram.duplicate@example.com",
      mobile: "9123456789",
      epicNumber: "DEF4567890", // EPIC conflict
      photoUrl: "sample-photo-3.jpg", // Photo match with deceased record
      documentUrl: "residence-vikram.pdf",
    },
  ];

  const dbVoters = await prisma.voter.findMany();

  for (const appData of syntheticApps) {
    const normName = normalizeName(appData.fullName);

    // Screen application through 10 Anomaly Engine
    const analysis = runAnomalyEngine(
      appData,
      dbVoters,
      []
    );

    const createdApp = await prisma.voterApplication.create({
      data: {
        applicationNumber: appData.applicationNumber,
        fullName: appData.fullName,
        normalizedName: normName,
        relativeName: appData.relativeName,
        relationType: appData.relationType,
        dateOfBirth: appData.dateOfBirth,
        gender: appData.gender,
        address: appData.address,
        pincode: appData.pincode,
        email: appData.email,
        mobile: appData.mobile,
        epicNumber: appData.epicNumber,
        photoUrl: appData.photoUrl,
        documentUrl: appData.documentUrl,
        riskScore: analysis.overallRiskScore,
        duplicateScore: analysis.overallRiskScore,
        riskLevel: analysis.riskLevel as any,
        status: analysis.overallRiskScore >= 30 ? "FLAGGED_DUPLICATE" : "PENDING",
        anomalyBreakdown: analysis.anomalyBreakdown as any,
      },
    });

    // Create DuplicateFlag record if flagged
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

    // Initial Audit Log
    await prisma.auditLog.create({
      data: {
        applicationId: createdApp.id,
        action: "SUBMITTED_AND_SCANNED",
        performedBy: "System Anomaly Engine",
        notes: `Application registered. Risk Score: ${analysis.overallRiskScore}/100 (${analysis.riskLevel}). Status: ${createdApp.status}`,
      },
    });
  }

  console.log("✅ Synthetic Demo Data successfully seeded with 3 Registered Voters and 10 Synthetic Anomaly Applications!");
}

main()
  .catch((e) => {
    console.error("❌ Seed script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });