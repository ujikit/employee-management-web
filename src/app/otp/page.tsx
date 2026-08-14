"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Briefcase, ArrowLeft } from "lucide-react";
import { API_URL } from "@/src/lib/config";

// Form logic extracted to properly wrap useSearchParams in a Suspense boundary (Next.js requirement)
function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("0000");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Session lost. Please return to login.");
      return;
    }

    if (otp.length < 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setIsLoading(true);

    const res = await fetch(`${API_URL}/api/v1/authentication/signin-verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp_code: otp }),
    });

    const result = await res.json();
    console.log('result', result);


    if (!res.ok) {
      setIsLoading(false);
      return setError(result.message)
    }

    // Extract access_token from response data
    const token = result?.data?.access_token;

    if (token) {
      // Save token directly into browser cookies so Next.js middleware reads it immediately
      document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }

    // Journey Complete: Send user to dashboard
    router.refresh(); // Forces middleware to re-evaluate the new cookie
    router.push("/dashboard");


    // try {

    // } catch (err: any) {
    //   console.log('err',err);

    //   setError(err);
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Two-Factor Verification</h2>
      <p className="text-sm text-slate-500 text-center mb-6">
        Enter the 4-digit code sent to <br />
        <span className="font-medium text-slate-700">{email || "your email"}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleOtpSubmit} className="space-y-5">
        <div className="space-y-2">
          <div className="relative pt-2">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="otp"
              type="text"
              maxLength={4}
              autoFocus
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full pl-10 pr-3 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 transition-colors text-black"
              placeholder="0000"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length < 4}
          className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all mt-4"
        >
          {isLoading ? "Verifying..." : "Verify & Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function OtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 text-center bg-slate-900 text-white relative">
          <Link
            href="/login"
            className="absolute left-6 top-8 text-slate-400 hover:text-white transition-colors"
            title="Back to login"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="inline-flex items-center justify-center gap-2 font-bold text-2xl mb-2">
            <Briefcase className="h-7 w-7 text-blue-500" />
            <span>EmployeeManagement</span>
          </div>
          <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-2">
            <ShieldCheck className="h-4 w-4" /> Secure Employee Portal
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
          <OtpForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
