"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Mail, CreditCard, RefreshCw, Lock, ArrowRight, CheckCircle2, Building2 } from "lucide-react";

export default function CitizenLoginPage() {
    const router = useRouter();
    const [electorType, setElectorType] = useState<"RESIDENT" | "OVERSEAS">("RESIDENT");
    const [identityInput, setIdentityInput] = useState("9876543210");
    const [captchaInput, setCaptchaInput] = useState("");
    const [generatedCaptcha, setGeneratedCaptcha] = useState("7K8M2P");
    const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
    const [otpInput, setOtpInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    const refreshCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGeneratedCaptcha(code);
    };

    const handleRequestOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!identityInput.trim()) {
            setError("Please enter your Mobile Number, Email, or EPIC ID.");
            return;
        }
        if (captchaInput.trim().toUpperCase() !== generatedCaptcha) {
            setError("Incorrect Security CAPTCHA code. Please try again.");
            refreshCaptcha();
            return;
        }
        setStep("OTP");
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (otpInput.trim() !== "123456") {
            setError("Invalid OTP entered. For prototype testing, use demo OTP: 123456");
            return;
        }

        // Save citizen session
        localStorage.setItem(
            "voter_citizen_session",
            JSON.stringify({
                identity: identityInput,
                electorType,
                loggedAt: new Date().toISOString(),
            })
        );

        router.push("/");
    };

    return (
        <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
            {/* INSTITUTIONAL LOGIN BANNER */}
            <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 shadow-xl">
                    <Building2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Citizen E-Services Authentication</h1>
                <p className="text-xs text-slate-400">
                    Election Commission of India Digital Identity Verification Portal
                </p>
            </div>

            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* ELECTOR TYPE SELECTOR */}
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                        type="button"
                        onClick={() => setElectorType("RESIDENT")}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${electorType === "RESIDENT"
                                ? "bg-blue-700 text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        Indian Resident Elector
                    </button>
                    <button
                        type="button"
                        onClick={() => setElectorType("OVERSEAS")}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${electorType === "OVERSEAS"
                                ? "bg-blue-700 text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        Overseas Elector
                    </button>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs leading-relaxed">
                        {error}
                    </div>
                )}

                {step === "DETAILS" ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Mobile Number / Email / EPIC Card Number *
                            </label>
                            <input
                                type="text"
                                required
                                value={identityInput}
                                onChange={(e) => setIdentityInput(e.target.value)}
                                placeholder="Enter 10-digit Mobile, Email, or EPIC ID"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                        </div>

                        {/* CAPTCHA SECTION */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Security CAPTCHA Verification *
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-base font-black tracking-widest text-cyan-400 select-none text-center">
                                    {generatedCaptcha}
                                </div>
                                <button
                                    type="button"
                                    onClick={refreshCaptcha}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                                    title="Refresh Security CAPTCHA"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                placeholder="Enter 6-character Security Code"
                                className="w-full mt-2 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Send OTP Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            OTP sent to <strong className="text-white font-mono">{identityInput}</strong>. Enter 6-digit code below.
                            <span className="block text-[11px] text-emerald-400 mt-1 font-mono">Demo Testing OTP: 123456</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Enter 6-Digit Security OTP *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                placeholder="123456"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-widest text-center"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Authenticate & Access Citizen Portal</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("DETAILS")}
                            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                        >
                            ← Back to Details
                        </button>
                    </form>
                )}
            </div>

            <div className="text-center">
                <Link href="/admin/login" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                    Are you an Electoral Officer? <span className="underline font-semibold text-slate-300">Sign in to Officer Review Portal →</span>
                </Link>
            </div>
        </div>
    );
}
