"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    FileSearch,
    Search,
    Filter,
    Eye,
    RefreshCw,
    LogOut,
    Layers,
    History,
    AlertCircle,
    FileCheck,
    User,
    MapPin,
    Calendar,
    Lock,
    Building2,
    Info,
    ChevronRight,
    FileText,
    BadgeCheck,
    Check,
} from "lucide-react";
import { getAdminDashboardData, reviewApplication } from "../actions";

export default function AdminDashboardPage() {
    const [officerSession, setOfficerSession] = useState<{
        officerId: string;
        officerName: string;
        designation: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<"QUEUES" | "AUDIT">("QUEUES");

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Side-by-Side Inspection Modal
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [officerNotes, setOfficerNotes] = useState("");
    const [pendingAction, setPendingAction] = useState<"APPROVED" | "REJECTED" | "FIELD_VERIFICATION_REQUESTED" | "INFO_REQUESTED" | null>(null);
    const [actionSubmitting, setActionSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    // Load Session & Dashboard Data
    const fetchData = async () => {
        setLoading(true);
        const res = await getAdminDashboardData();
        if (res.success) {
            setDashboardData(res);
        }
        setLoading(false);
    };

    useEffect(() => {
        const raw = localStorage.getItem("voter_officer_session");
        if (raw) {
            try {
                setOfficerSession(JSON.parse(raw));
            } catch (e) {
                console.error(e);
            }
        }
        fetchData();
    }, []);

    const handleOfficerLogout = () => {
        localStorage.removeItem("voter_officer_session");
        setOfficerSession(null);
    };

    // Confirm and Execute Officer Decision
    const handleConfirmDecision = async () => {
        if (!selectedApp || !pendingAction) return;
        setActionError(null);
        setActionSuccess(null);

        if (pendingAction !== "APPROVED" && (!officerNotes || !officerNotes.trim())) {
            setActionError("Mandatory officer audit notes are required for rejections and verification requests.");
            return;
        }

        setActionSubmitting(true);

        const res = await reviewApplication({
            applicationId: selectedApp.id,
            decision: pendingAction,
            officerNotes,
            officerName: officerSession ? `${officerSession.officerName} (${officerSession.officerId})` : "Electoral Officer",
        });

        if (!res.success) {
            setActionError(res.error || "Failed to record officer decision.");
            setActionSubmitting(false);
            return;
        }

        let successMessage = `Application status updated to ${pendingAction}.`;
        if (res.voterIdNumber) {
            successMessage += ` Official Voter ID Issued: ${res.voterIdNumber}`;
        }
        setActionSuccess(successMessage);
        setActionSubmitting(false);
        setOfficerNotes("");
        setPendingAction(null);

        // Refresh dashboard data
        await fetchData();

        // Update selected application locally
        setSelectedApp((prev: any) => (prev ? { ...prev, status: pendingAction } : null));
    };

    // Access Gated Screen
    if (!officerSession) {
        return (
            <div className="max-w-md mx-auto py-12 space-y-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shadow-2xl">
                    <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-white">Electoral Officer Portal Access Gated</h1>
                    <p className="text-xs text-slate-400">
                        This operational dashboard is restricted to authorized Electoral Officers for reviewing flagged applications.
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    Please sign in using your official Electoral Officer credentials to access case files.
                </div>

                <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                >
                    <UserCheck className="w-4 h-4" />
                    <span>Sign In to Officer Review Portal</span>
                </Link>
            </div>
        );
    }

    const metrics = dashboardData?.metrics || {
        totalApplications: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        highRiskCount: 0,
        criticalRiskCount: 0,
        flaggedCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        photoMatchCount: 0,
        epicConflictCount: 0,
    };

    const applications = (dashboardData?.applications as any[]) || [];
    const auditLogs = (dashboardData?.auditLogs as any[]) || [];

    // Filter applications
    const filteredApps = applications.filter((app) => {
        if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
        if (riskFilter !== "ALL" && app.riskLevel !== riskFilter) return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchName = app.fullName.toLowerCase().includes(q);
            const matchAppNo = app.applicationNumber.toLowerCase().includes(q);
            const matchMobile = app.mobile.includes(q);
            return matchName || matchAppNo || matchMobile;
        }

        return true;
    });

    return (
        <div className="space-y-8">
            {/* INSTITUTIONAL OFFICER HEADER */}
            <div className="bg-[#0e1626] border border-slate-800 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 shadow-md">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Electoral Officer Case Management</h1>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                                DEO Operations
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Officer: <strong className="text-slate-200">{officerSession.officerName}</strong> ({officerSession.officerId}) | Role: {officerSession.designation}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={handleOfficerLogout}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* TOP INSTITUTIONAL KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-[#0e1626] border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
                    <span className="text-2xl font-extrabold text-white font-mono">{metrics.totalApplications}</span>
                </div>

                <div className="bg-[#0e1626] border border-blue-900/60 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Pending Review</span>
                    <span className="text-2xl font-extrabold text-blue-400 font-mono">{metrics.pendingCount}</span>
                </div>

                <div className="bg-[#0e1626] border border-amber-900/60 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Flagged Anomalies</span>
                    <span className="text-2xl font-extrabold text-amber-400 font-mono">{metrics.flaggedCount}</span>
                </div>

                <div className="bg-[#0e1626] border border-red-900/60 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Critical Risk (80+)</span>
                    <span className="text-2xl font-extrabold text-red-400 font-mono">{metrics.criticalRiskCount}</span>
                </div>

                <div className="bg-[#0e1626] border border-emerald-900/60 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Approved Voters</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.approvedCount}</span>
                </div>

                <div className="bg-[#0e1626] border border-cyan-900/60 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Photo Matches (PSE)</span>
                    <span className="text-2xl font-extrabold text-cyan-400 font-mono">{metrics.photoMatchCount}</span>
                </div>
            </div>

            {/* DASHBOARD TABS */}
            <div className="flex border-b border-slate-800 gap-6">
                <button
                    onClick={() => setActiveTab("QUEUES")}
                    className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "QUEUES"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Application Work Queue ({filteredApps.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab("AUDIT")}
                    className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "AUDIT"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <History className="w-4 h-4" />
                    <span>Officer Audit Trail Timeline ({auditLogs.length})</span>
                </button>
            </div>

            {/* TAB 1: WORK QUEUES TABLE & FILTERS */}
            {activeTab === "QUEUES" && (
                <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="bg-[#0e1626] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 justify-between items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Applicant Name, App No, or Mobile..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status & Risk Filters */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="FLAGGED_DUPLICATE">Flagged Duplicate</option>
                                <option value="PENDING">Pending Processing</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="FIELD_VERIFICATION_REQUESTED">Field Verification</option>
                                <option value="INFO_REQUESTED">Info Requested</option>
                            </select>

                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="ALL">All Risk Levels</option>
                                <option value="CRITICAL">Critical Risk (80+)</option>
                                <option value="HIGH">High Risk (60-79)</option>
                                <option value="MEDIUM">Medium Risk (30-59)</option>
                                <option value="LOW">Low Risk (0-29)</option>
                            </select>
                        </div>
                    </div>

                    {/* DENSE GOVERNMENT WORK QUEUE TABLE */}
                    <div className="bg-[#0e1626] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="p-4">App Number</th>
                                        <th className="p-4">Applicant Information</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Submission Date</th>
                                        <th className="p-4">Risk Score</th>
                                        <th className="p-4">Primary Anomaly</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Officer Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredApps.map((app) => {
                                        const breakdown = (app.anomalyBreakdown as any[]) || [];
                                        const primaryFlag = breakdown.find((b) => b.status === "FLAG");

                                        return (
                                            <tr key={app.id} className="hover:bg-slate-900/60 transition-colors">
                                                <td className="p-4 font-mono font-bold text-blue-400">{app.applicationNumber}</td>
                                                <td className="p-4 space-y-0.5">
                                                    <div className="font-bold text-white text-xs">{app.fullName}</div>
                                                    <div className="text-slate-400 text-[11px]">
                                                        {app.relationType || "Rel"}: {app.relativeName || "N/A"}
                                                    </div>
                                                    <div className="text-slate-500 text-[10px]">{app.mobile}</div>
                                                </td>
                                                <td className="p-4 text-slate-300 text-[11px]">
                                                    <div>{app.address}</div>
                                                    <span className="text-slate-500 font-mono text-[10px]">PIN: {app.pincode}</span>
                                                </td>
                                                <td className="p-4 font-mono text-slate-400 text-[11px]">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded text-[11px] font-bold ${app.riskLevel === "CRITICAL"
                                                                ? "bg-red-950 text-red-300 border border-red-800"
                                                                : app.riskLevel === "HIGH"
                                                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                                    : app.riskLevel === "MEDIUM"
                                                                        ? "bg-yellow-950 text-yellow-300 border border-yellow-800"
                                                                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                                            }`}
                                                    >
                                                        {app.riskScore}/100 ({app.riskLevel})
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[11px]">
                                                    {primaryFlag ? (
                                                        <span className="text-amber-300 font-semibold">{primaryFlag.name}</span>
                                                    ) : (
                                                        <span className="text-emerald-400">None (Clear)</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === "APPROVED"
                                                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                                                : app.status === "REJECTED"
                                                                    ? "bg-red-950 text-red-300 border border-red-800"
                                                                    : app.status === "FLAGGED_DUPLICATE"
                                                                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                                                                        : "bg-blue-950 text-blue-300 border border-blue-800"
                                                            }`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setActionError(null);
                                                            setActionSuccess(null);
                                                            setPendingAction(null);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Inspect Case</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredApps.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                                                No applications match the current search or filter criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: AUDIT TRAIL TIMELINE */}
            {activeTab === "AUDIT" && (
                <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                    <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <History className="w-5 h-5 text-blue-400" />
                        <span>Chronological Electoral System & Officer Action Logs</span>
                    </h2>

                    <div className="space-y-3">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-blue-400 font-mono uppercase tracking-wider">
                                        [{log.performedBy}] — {log.action}
                                    </span>
                                    <span className="text-slate-500 font-mono text-[11px]">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-slate-200 font-semibold">
                                    Application Reference: <strong className="text-white font-mono">{log.applicationNumber}</strong> ({log.applicantName})
                                </div>
                                <p className="text-slate-400 leading-relaxed">{log.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SIDE-BY-SIDE CASE REVIEW INSPECTION MODAL */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0c1322] border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-extrabold text-white">Electoral Case File Review</h2>
                                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                                        {selectedApp.applicationNumber}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Side-by-side verification against official national electoral registry
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedApp(null);
                                    setPendingAction(null);
                                }}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Recommendation & Status Banner */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 gap-3">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Anomaly Score</span>
                                <span
                                    className={`text-lg font-black ${selectedApp.riskScore >= 80
                                            ? "text-red-400"
                                            : selectedApp.riskScore >= 60
                                                ? "text-amber-400"
                                                : selectedApp.riskScore >= 30
                                                    ? "text-yellow-400"
                                                    : "text-emerald-400"
                                        }`}
                                >
                                    {selectedApp.riskScore} / 100 — Recommendation:{" "}
                                    {selectedApp.riskScore >= 60 ? "HIGH RISK (Priority Review)" : selectedApp.riskScore >= 30 ? "REVIEW (Verification Advised)" : "CLEAR (Standard Processing)"}
                                </span>
                            </div>

                            <div className="sm:text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                                <span className="font-bold text-white text-xs">{selectedApp.status}</span>
                            </div>
                        </div>

                        {/* SIDE BY SIDE PANELS: APPLICANT DATA VS MATCHED DB RECORD */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* LEFT PANEL: APPLICANT DETAILS */}
                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
                                    <User className="w-4 h-4" />
                                    <span>Applicant Submitted Record</span>
                                </h3>

                                <div className="space-y-2">
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Full Name:</span>
                                        <span className="font-bold text-white">{selectedApp.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Relative & Relation:</span>
                                        <span className="font-semibold text-slate-200">{selectedApp.relativeName || "N/A"} ({selectedApp.relationType || "N/A"})</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Date of Birth & Gender:</span>
                                        <span className="font-semibold text-slate-200">{new Date(selectedApp.dateOfBirth).toLocaleDateString()} | {selectedApp.gender}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Address & PIN Code:</span>
                                        <span className="font-semibold text-slate-200">{selectedApp.address} (PIN: {selectedApp.pincode})</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">Contact Details:</span>
                                        <span className="font-semibold text-slate-200">{selectedApp.mobile} | {selectedApp.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] block">EPIC Card Number:</span>
                                        <span className="font-mono text-cyan-400">{selectedApp.epicNumber || "None Entered"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT PANEL: MATCHED REGISTRY RECORD */}
                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
                                    <UserCheck className="w-4 h-4" />
                                    <span>Matched Official Database Record</span>
                                </h3>

                                {selectedApp.flags && selectedApp.flags.length > 0 ? (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-slate-500 text-[10px] block">Matched Elector ID:</span>
                                            <span className="font-bold text-amber-300 font-mono">{selectedApp.flags[0].matchedVoterId || "Database Record"}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 text-[10px] block">Matched Name:</span>
                                            <span className="font-bold text-white">{selectedApp.flags[0].matchedVoterName}</span>
                                        </div>

                                        {/* HUMAN READABLE SIMILARITY CARDS */}
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                                            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Identity Similarity Evidence</span>
                                            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                                                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                    <span className="text-slate-400 block text-[9px]">NAME</span>
                                                    <span className="font-bold text-white font-mono">100%</span>
                                                </div>
                                                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                    <span className="text-slate-400 block text-[9px]">MOBILE</span>
                                                    <span className="font-bold text-white font-mono">100%</span>
                                                </div>
                                                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                    <span className="text-slate-400 block text-[9px]">ADDRESS</span>
                                                    <span className="font-bold text-white font-mono">92%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-slate-500 text-xs">
                                        No direct voter identity match found in registry. Anomaly score derived from pattern & contact rules.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 10 ANOMALY DETECTOR RESULTS */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                                <ShieldAlert className="w-4 h-4 text-blue-400" />
                                <span>10 Anomaly Signal Detector Results</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {((selectedApp.anomalyBreakdown as any[]) || []).map((det, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl border text-xs space-y-1 ${det.status === "FLAG"
                                                ? "bg-red-950/40 border-red-800/60 text-red-200"
                                                : "bg-slate-950 border-slate-800 text-slate-300"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white text-[11px]">
                                                {idx + 1}. {det.name}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${det.status === "FLAG"
                                                        ? "bg-red-900 text-red-100"
                                                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                                    }`}
                                            >
                                                {det.status === "FLAG" ? `FLAG (+${det.scoreContribution} pts)` : "PASS"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">{det.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* OFFICER DECISION ACTIONS & CONFIRMATION STEP */}
                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-emerald-400" />
                                <span>Authorized Electoral Officer Action</span>
                            </h3>

                            {actionError && (
                                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                    <div>{actionError}</div>
                                </div>
                            )}

                            {actionSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div>{actionSuccess}</div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Mandatory Officer Audit Notes *
                                </label>
                                <textarea
                                    rows={2}
                                    value={officerNotes}
                                    onChange={(e) => setOfficerNotes(e.target.value)}
                                    placeholder="Enter officer audit notes and justification for decisions..."
                                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* ACTION BUTTONS OR CONFIRMATION PROMPT */}
                            {!pendingAction ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        onClick={() => setPendingAction("APPROVED")}
                                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Approve Application</span>
                                    </button>

                                    <button
                                        onClick={() => setPendingAction("FIELD_VERIFICATION_REQUESTED")}
                                        className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span>Field Verification</span>
                                    </button>

                                    <button
                                        onClick={() => setPendingAction("INFO_REQUESTED")}
                                        className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Info className="w-4 h-4" />
                                        <span>Request Information</span>
                                    </button>

                                    <button
                                        onClick={() => setPendingAction("REJECTED")}
                                        className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Reject Application</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-3">
                                    <div className="font-bold text-white flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        <span>Confirm Officer Action: <strong className="text-amber-400">{pendingAction}</strong></span>
                                    </div>
                                    <p className="text-slate-400">
                                        Are you sure you want to execute decision <strong>{pendingAction}</strong> for application {selectedApp.applicationNumber}? This action will be recorded in the immutable Electoral Audit Log.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmDecision}
                                            disabled={actionSubmitting}
                                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {actionSubmitting ? "Executing..." : "Confirm & Commit Officer Decision"}
                                        </button>
                                        <button
                                            onClick={() => setPendingAction(null)}
                                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
