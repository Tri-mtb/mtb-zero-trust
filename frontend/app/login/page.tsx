"use client";

import React, { useState } from "react";
import { Shield, Lock, Fingerprint, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "credentials") {
      setStep("mfa");
    } else {
      // Mock routing based on email role convention for demo
      if (email.includes("sales")) router.push("/sales/dashboard");
      else if (email.includes("shipper")) router.push("/shipper/dashboard");
      else router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[150px] opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] opacity-60"></div>
        <div className="absolute inset-0 bg-[url('/hex-pattern.svg')] bg-[length:40px_40px] opacity-5"></div>
      </div>

      <div className="flex w-full max-w-5xl bg-dark-panel border border-dark-border rounded-2xl overflow-hidden shadow-2xl z-10">
        
        {/* Left Form Side */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-10">
            <Shield className="w-8 h-8 text-neon-blue" />
            <h1 className="text-2xl font-bold tracking-wider uppercase text-white">TrustGuard <span className="text-neon-blue text-lg">AI</span></h1>
          </div>
          
          <h2 className="text-3xl font-semibold mb-2">Secure Access</h2>
          <p className="text-slate-400 mb-8 text-sm">
            AI-Enhanced Zero Trust E-commerce Platform. Please authenticate to proceed.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {step === "credentials" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Enterprise Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@trustguard.ai" 
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-xs uppercase tracking-wider text-neon-purple font-semibold flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> 2FA Verification
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="Enter 6-digit MFA Code" 
                    className="w-full bg-dark-bg border border-neon-purple/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all tracking-widest text-center text-lg neon-border-blue"
                    required
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Open your authenticator app to view your code.</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-neon-blue hover:bg-cyan-400 text-dark-bg font-bold rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {step === "credentials" ? "Verify Credentials" : "Authorize Access"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-8 flex items-center gap-2 justify-center">
            <Lock className="w-3 h-3 text-neon-green" /> 
            <span className="text-neon-green font-medium animate-pulse">All access is continuously verified</span>
          </p>
        </div>

        {/* Right Illustration Side */}
        <div className="hidden lg:flex w-1/2 bg-black relative flex-col items-center justify-center p-12 overflow-hidden border-l border-dark-border">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#151520_1px,transparent_1px),linear-gradient(to_bottom,#151520_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 z-0" />
          
          <div className="z-10 text-center flex flex-col items-center">
            <div className="relative w-64 h-64 mb-8">
              {/* Abstract Zero Trust Illustration */}
              <div className="absolute inset-0 border border-neon-blue rounded-full animate-[spin_10s_linear_infinite] opacity-30 border-dashed"></div>
              <div className="absolute inset-4 border-2 border-neon-purple rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-20"></div>
              <div className="absolute inset-8 bg-dark-bg border border-neon-blue rounded-full shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center">
                <Shield className="w-20 h-20 text-neon-blue neon-text-blue" />
              </div>
              
              {/* Floating nodes representing contextual verification */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-12 h-12 bg-dark-panel border border-neon-green rounded-lg flex items-center justify-center text-xs text-neon-green neon-border-green shadow-[0_0_15px_rgba(0,255,65,0.3)]">ID</div>
              <div className="absolute bottom-1/4 -right-4 w-12 h-12 bg-dark-panel border-neon-purple border rounded-lg flex items-center justify-center text-xs text-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.3)]">Loc</div>
              <div className="absolute bottom-1/4 -left-4 w-12 h-12 bg-dark-panel border border-neon-blue rounded-lg flex items-center justify-center text-xs text-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]">Dev</div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Zero Trust Architecture</h3>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Trust no user, no device, and no network. Contextual AI verification runs on every request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
