"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Briefcase } from "lucide-react";
import { API_URL } from "@/src/lib/config";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("admin@yopmail.com");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/authentication/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Authentication failed");

      // Journey Step 1 Complete: Move to OTP page, carrying the email via query param
      router.push(`/otp?email=${encodeURIComponent(email)}`);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8 text-center bg-slate-900 text-white">
          <Link href="/landing" className="inline-flex items-center justify-center gap-2 font-bold text-2xl mb-2">
            <Briefcase className="h-7 w-7 text-blue-500" />
            <span>EmployeeManagement</span>
          </Link>
          <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-2">
            <ShieldCheck className="h-4 w-4" /> Secure Employee Portal
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm text-black"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 sm:text-sm text-black"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all"
            >
              {isLoading ? "Authenticating..." : "Continue to OTP"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
