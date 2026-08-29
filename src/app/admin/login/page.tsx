"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, UserCheck, Lock, Building2, KeyRound, AlertTriangle, ArrowRight } from "lucide-react";

export default function OfficerLoginPage() {
    const router = useRouter();
    const [officerId, setOfficerId] = useState("OFFICER-101");
    const [password, setPassword] = useState("password123");
    const [designation, setDesignation] = useState("District Electoral Officer (DEO)");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!officerId.trim() || !password.trim()) {
            setError("Please provide your Officer ID and Password.");
            return;
        }

        // Demo Officer Authentication
        if (officerId.trim().toUpperCase() !== "OFFICER-101" || password !== "password123") {
            setError("Invalid Electoral Officer Credentials. Demo ID: OFFICER-101 / Pass: password123");
            return;
        }

        localStorage.setItem(
            "voter_officer_session",
            JSON.stringify({
                officerId: officerId.toUpperCase(),
                officerName: "Rajesh Kumar (DEO)",
                designation,
                loggedAt: new Date().toISOString(),
            })
        );

        router.push("/admin");
    };

    return (
        <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
            {/* HEADER */}
            <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-xl">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Electoral Officer Sign In</h1>
                <p className="text-xs text-slate-400">
                    Authorized ECI Officer Portal for Application Review & Anomaly Screening
                </p>
            </div>

            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restricted Access Control</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        All officer decisions (Approve, Reject, Field Verification) are audit-logged with official officer credentials.
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Officer Designation Role *
                        </label>
                        <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="District Electoral Officer (DEO)">District Electoral Officer (DEO)</option>
                            <option value="Electoral Registration Officer (ERO)">Electoral Registration Officer (ERO)</option>
                            <option value="Assistant ERO (AERO)">Assistant ERO (AERO)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Officer ID Badge Number *
                        </label>
                        <input
                            type="text"
                            required
                            value={officerId}
                            onChange={(e) => setOfficerId(e.target.value)}
                            placeholder="OFFICER-101"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                            Demo Officer ID: OFFICER-101
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Security Password *
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                            Demo Password: password123
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Authenticate Officer Access</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="text-center">
                <Link href="/" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                    Return to <span className="underline font-semibold text-slate-300">Citizen Application Portal →</span>
                </Link>
            </div>
        </div>
    );
}
