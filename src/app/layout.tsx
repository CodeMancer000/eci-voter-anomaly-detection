import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Search, UserCheck, LayoutDashboard, Activity, Building2 } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
    title: "Electoral Roll Integrity System | Election Commission of India Digital Services",
    description: "National electoral roll duplicate and anomaly screening portal with human officer verification and comprehensive audit logging.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
                {/* Subtle Government Top Tricolor Accent Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-500" />

                {/* Global Institutional Government Header */}
                <header className="sticky top-0 z-50 bg-[#0c1322]/95 border-b border-slate-800/80 backdrop-blur-md shadow-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        {/* Government Emblem & Identity */}
                        <Link href="/" className="flex items-center gap-3 group transition-all">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border border-blue-700/50 flex items-center justify-center text-blue-400 shadow-md group-hover:border-blue-500 transition-colors">
                                <Building2 className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
                                        Electoral Roll Integrity System
                                    </span>
                                    <span className="hidden md:inline-flex px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[10px] font-bold tracking-wider uppercase">
                                        National Portal
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium tracking-tight">
                                    Voter Registration & Anomaly Detection Screening
                                </span>
                            </div>
                        </Link>

                        {/* Header Right Navigation & Live System Badge */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* System Operational Indicator */}
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-semibold text-emerald-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>SYSTEM OPERATIONAL</span>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex items-center gap-1.5 sm:gap-2">
                                <Link
                                    href="/"
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="hidden sm:inline">Citizen Portal</span>
                                </Link>

                                <Link
                                    href="/#track"
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
                                >
                                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="hidden sm:inline">Application Status</span>
                                </Link>

                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
                                >
                                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="hidden sm:inline">Officer Login</span>
                                </Link>

                                <Link
                                    href="/admin"
                                    className="px-3.5 py-1.5 rounded-md text-xs font-bold text-slate-100 bg-blue-700 hover:bg-blue-600 border border-blue-500/50 shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5"
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-200" />
                                    <span>Admin Review</span>
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content Workspace */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {children}
                </main>

                {/* Global Institutional Footer */}
                <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 text-xs text-slate-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                                Election Commission Digital Services — Authorized Electoral Roll Screening Infrastructure. Human officer decision required for all status changes.
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                            <span>CONFIDENTIAL & SECURE</span>
                            <span>•</span>
                            <span>VER: 2026.2.1-PROT</span>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
