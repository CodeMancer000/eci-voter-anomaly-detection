"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    User,
    MapPin,
    Calendar,
    Phone,
    Mail,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Search,
    Clock,
    ArrowRight,
    Info,
    Building2,
    FileCheck,
    HelpCircle,
    Upload,
    UserCheck,
    ChevronRight,
    BadgeCheck,
} from "lucide-react";
import { submitVoterApplication, trackApplication } from "./actions";

export default function CitizenPortalPage() {
    const [citizenSession, setCitizenSession] = useState<{
        identity: string;
        electorType: string;
    } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "Rahul Gandhi",
        relativeName: "Rajiv Gandhi",
        relationType: "Father",
        dateOfBirth: "1970-06-19",
        gender: "Male",
        address: "12 Tughlak Lane, New Delhi",
        pincode: "110011",
        email: "rahul.gandhi.test@example.com",
        mobile: "9876543210",
        epicNumber: "EPIC-TEST-001",
        aadhaarOptional: "",
        photoUrl: "sample-photo-default.jpg",
        documentUrl: "residence-proof-default.pdf",
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submissionResult, setSubmissionResult] = useState<any | null>(null);

    // Tracking State
    const [trackQuery, setTrackQuery] = useState("");
    const [tracking, setTracking] = useState(false);
    const [trackResult, setTrackResult] = useState<any | null>(null);
    const [trackError, setTrackError] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("voter_citizen_session");
        if (raw) {
            try {
                setCitizenSession(JSON.parse(raw));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        setSubmissionResult(null);

        const res = await submitVoterApplication(formData);

        if (!res.success) {
            setSubmitError(res.error || "Failed to submit voter registration application.");
        } else {
            setSubmissionResult(res);
            setTrackQuery(res.applicationNumber || "");
        }
        setSubmitting(false);
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackQuery.trim()) return;
        setTracking(true);
        setTrackError(null);
        setTrackResult(null);

        const res = await trackApplication(trackQuery);
        if (!res.success) {
            setTrackError(res.error || "No voter application found matching query.");
        } else {
            setTrackResult(res.application);
        }
        setTracking(false);
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            {/* CITIZEN PORTAL HERO BANNER */}
            <div className="bg-[#0e1626] border border-slate-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/80 text-[11px] font-bold uppercase tracking-wider">
                                Official Form 6
                            </span>
                            <span className="text-xs text-slate-400">National Electoral Roll Registry</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            New Elector Registration Application
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Submit your electoral enrolment application for official verification. Applications undergo automated screening and authorized Electoral Officer review to maintain electoral roll integrity.
                        </p>
                    </div>

                    {citizenSession ? (
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 shrink-0 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Verified Citizen Session</span>
                            </div>
                            <div className="font-mono text-slate-400">{citizenSession.identity}</div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all shrink-0 flex items-center gap-2"
                        >
                            <UserCheck className="w-4 h-4 text-cyan-400" />
                            <span>Sign In with ECI OTP</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 7-STAGE PROGRESS INDICATOR */}
            <div className="bg-[#0e1626] border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-3 shadow-lg">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Electoral Screening Lifecycle Progress
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px] font-semibold">
                    {[
                        { step: "1", title: "Applicant Details", status: "COMPLETE" },
                        { step: "2", title: "Contact & Address", status: "COMPLETE" },
                        { step: "3", title: "Identity Proof", status: "COMPLETE" },
                        { step: "4", title: "Document Upload", status: "COMPLETE" },
                        { step: "5", title: "Automated Screening", status: "ACTIVE" },
                        { step: "6", title: "Human Officer Review", status: "PENDING" },
                        { step: "7", title: "Final Decision", status: "PENDING" },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1 ${item.status === "COMPLETE"
                                    ? "bg-slate-900 border-slate-700 text-slate-200"
                                    : item.status === "ACTIVE"
                                        ? "bg-blue-950/80 border-blue-700 text-blue-200"
                                        : "bg-slate-950/40 border-slate-800/80 text-slate-500"
                                }`}
                        >
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                                Stage 0{item.step}
                            </span>
                            <span className="font-bold text-[11px] leading-tight">{item.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SUCCESS SUBMISSION RESULT BANNER */}
            {submissionResult && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-100 space-y-3 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                            <h3 className="text-base font-bold text-white">Application Successfully Logged for Screening</h3>
                            <p className="text-xs text-emerald-200">
                                Your application has been assigned reference number: <strong className="font-mono font-bold text-white text-sm">{submissionResult.applicationNumber}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span>Automated Screening Score:</span>
                            <span className="font-bold font-mono text-white">{submissionResult.riskScore} / 100 ({submissionResult.riskLevel})</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Initial Processing Status:</span>
                            <span className="font-bold text-amber-400">{submissionResult.status}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                            {submissionResult.isFlagged
                                ? "Notice: Your application has been routed to the Electoral Officer Queue for verification due to potential demographic or registry overlap."
                                : "Your application is under standard verification by the Electoral Officer."}
                        </p>
                    </div>
                </div>
            )}

            {/* FORM 6 CITIZEN APPLICATION FORM */}
            <form onSubmit={handleSubmit} className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
                <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span>Form 6: Registration Details</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Please enter your legal information exactly as it appears on official government identity documents.
                    </p>
                </div>

                {submitError && (
                    <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>{submitError}</div>
                    </div>
                )}

                {/* SECTION 1: APPLICANT PERSONAL DETAILS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800/80 pb-2">
                        1. Applicant Personal Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Full Legal Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Must match legal proof of identity (e.g. Passport, Aadhaar, PAN).
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Relative Full Name & Relation Type *
                            </label>
                            <div className="flex gap-2">
                                <select
                                    name="relationType"
                                    value={formData.relationType}
                                    onChange={handleChange}
                                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                                <input
                                    type="text"
                                    name="relativeName"
                                    required
                                    value={formData.relativeName}
                                    onChange={handleChange}
                                    placeholder="Relative's Full Name"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Required for electoral roll relation indexing.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                required
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Applicant must be at least 18 years of age.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Gender *
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Third Gender">Third Gender</option>
                            </select>
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Select official gender classification.
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: CONTACT & RESIDENTIAL ADDRESS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800/80 pb-2">
                        2. Residential Address & Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Full Residential Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House No, Street, Landmark, Area"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Address used for polling station and constituency assignment.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Postal PIN Code *
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                required
                                maxLength={6}
                                value={formData.pincode}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Standard 6-digit postal code.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Mobile Number *
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                required
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Mobile number used for application updates and OTP authentication.
                            </span>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Used to deliver digital application receipt and verification updates.
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: IDENTITY PROOFS & TEST PRESETS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800/80 pb-2">
                        3. Identity Proofs & Screening Test Presets
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Existing EPIC Card Number (If Applicable)
                            </label>
                            <input
                                type="text"
                                name="epicNumber"
                                value={formData.epicNumber}
                                onChange={handleChange}
                                placeholder="e.g. ABC1234567"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Enter existing EPIC number if applying for modification or transfer.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Aadhaar Number (Voluntary / Optional)
                            </label>
                            <input
                                type="text"
                                name="aadhaarOptional"
                                value={formData.aadhaarOptional}
                                onChange={handleChange}
                                placeholder="12-digit Aadhaar (Optional)"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Optional field for voluntary identity linkage per ECI guidelines.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Photo Upload Preset (Test Anomaly Screening)
                            </label>
                            <select
                                name="photoUrl"
                                value={formData.photoUrl}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="sample-photo-default.jpg">Standard Passport Photo (Clean Match)</option>
                                <option value="sample-photo-vikram-duplicate.jpg">Vikram Malhotra Photo (97% Photo Similarity Match - PSE Flag)</option>
                                <option value="sample-photo-anil-duplicate.jpg">Anil Kumar Photo (Existing Voter Match)</option>
                            </select>
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Select preset to simulate Photo Similar Entries (PSE) engine live.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Address Proof Document Preset
                            </label>
                            <select
                                name="documentUrl"
                                value={formData.documentUrl}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="residence-proof-default.pdf">Valid Electricity Bill (Clean Document)</option>
                                <option value="residence-proof-mismatch.pdf">Rental Agreement (Metadata Address Mismatch)</option>
                            </select>
                            <span className="text-[11px] text-slate-500 mt-1 block">
                                Select preset to simulate Document Consistency screening.
                            </span>
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? (
                            <span>Running Screening Engine...</span>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Submit Application for Screening</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* INSTITUTIONAL APPLICATION TRACKING SECTION (#track) */}
            <div id="track" className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Track Application Status</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Query real-time status and screening progression of your registered application.
                    </p>
                </div>

                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        required
                        value={trackQuery}
                        onChange={(e) => setTrackQuery(e.target.value)}
                        placeholder="Enter Application Number (e.g. VOT-2026-00101) or Registered Email..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                    <button
                        type="submit"
                        disabled={tracking}
                        className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {tracking ? (
                            <span>Querying Status...</span>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                <span>Track Status</span>
                            </>
                        )}
                    </button>
                </form>

                {trackError && (
                    <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>{trackError}</div>
                    </div>
                )}

                {/* TRACK RESULT DETAIL CARD & TIMELINE */}
                {trackResult && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Reference Number</span>
                                <span className="text-xl font-extrabold text-blue-400 font-mono">{trackResult.applicationNumber}</span>
                            </div>
                            <div className="flex flex-col sm:items-end">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trackResult.status === "APPROVED"
                                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                            : trackResult.status === "REJECTED"
                                                ? "bg-red-950 text-red-300 border border-red-800"
                                                : trackResult.status === "FLAGGED_DUPLICATE"
                                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                    : "bg-blue-950 text-blue-300 border border-blue-800"
                                        }`}
                                >
                                    {trackResult.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <span className="text-slate-500 text-[10px] block">Applicant Name:</span>
                                <span className="font-bold text-white">{trackResult.fullName}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] block">Submission Date:</span>
                                <span className="font-semibold text-slate-300 font-mono">{new Date(trackResult.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] block">Calculated Anomaly Score:</span>
                                <span className="font-bold text-amber-400 font-mono">{trackResult.riskScore} / 100 ({trackResult.riskLevel})</span>
                            </div>
                            {trackResult.voterIdNumber && (
                                <div className="sm:col-span-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between">
                                    <span>Generated Official Voter ID:</span>
                                    <span className="font-extrabold font-mono text-white text-sm">{trackResult.voterIdNumber}</span>
                                </div>
                            )}
                        </div>

                        {/* TIMELINE PROGRESS STAGES */}
                        <div className="space-y-3 pt-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                Verification Stage Progression
                            </span>

                            <div className="space-y-3">
                                {[
                                    { stage: "1. Application Submitted", desc: "Form 6 received and logged in central registry.", done: true },
                                    { stage: "2. Automated Screening", desc: "10 Anomaly signal detectors evaluated record.", done: true },
                                    { stage: "3. Duplicate/Anomaly Review", desc: "System pre-screening analysis completed.", done: true },
                                    { stage: "4. Electoral Officer Review", desc: "Authorized Electoral Officer reviewing case files.", done: trackResult.status !== "PENDING" },
                                    { stage: "5. Final Decision", desc: `Final decision rendered: ${trackResult.status}`, done: trackResult.status === "APPROVED" || trackResult.status === "REJECTED" },
                                ].map((stg, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${stg.done ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                                            }`}>
                                            {stg.done ? "✓" : i + 1}
                                        </div>
                                        <div>
                                            <div className={`font-bold text-xs ${stg.done ? "text-white" : "text-slate-500"}`}>{stg.stage}</div>
                                            <div className="text-slate-400 text-[11px]">{stg.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
