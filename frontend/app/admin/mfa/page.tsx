"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, QrCode, Lock, CheckCircle2 } from "lucide-react";

export default function MFAPage() {
  const [factors, setFactors] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [status, setStatus] = useState<"loading" | "unverified" | "verified">("loading");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkMFAStatus() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("Failed to get user session. Please relogin.");
        setStatus("unverified");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const currentLevel = aalData?.currentLevel;

      if (session?.user.factors?.length && session.user.factors.length > 0) {
        setFactors(session.user.factors);
        if (currentLevel === "aal2") {
          setStatus("verified");
        } else {
          setStatus("unverified");
          setFactorId(session.user.factors[0].id);
          const { error: challengeError } = await supabase.auth.mfa.challenge({ factorId: session.user.factors[0].id });
          if (challengeError) {
            setError("Failed to create MFA challenge: " + challengeError.message);
          }
        }
      } else {
        setStatus("unverified");
      }
    }

    void checkMFAStatus();
  }, [supabase]);

  const handleEnroll = async () => {
    setError(null);
    
    // Sinh tên ngẫu nhiên để không bị báo trùng lập (Tránh lỗi: "A factor with the friendly name '' already exists")
    const friendlyName = "TrustGuard-" + Math.floor(Math.random() * 10000);

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "TrustGuard AI",
      friendlyName: friendlyName
    });

    if (error) {
      // Thử unenroll factor lỗi trước đó nếu vẫn kẹt
      setError("Enrollment failed: " + error.message + " - Pls try clicking again.");
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
  };

  const handleVerifyEnrollment = async () => {
    setError(null);
    try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

      if (error) {
        setError("Verification failed: " + error.message);
        return;
      }

      setStatus("verified");
      setQrCode(null);
      setVerifyCode("");
      alert("MFA Successfully Enrolled and Verified! Your session is now AAL2.");
    } catch (e: any) {
      setError("An unexpected error occurred: " + e.message);
    }
  };

  const handleVerifyChallenge = async () => {
    setError(null);
    try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

      if (error) {
        setError("Verification failed: " + error.message);
        return;
      }

      setStatus("verified");
      setVerifyCode("");
      alert("Session elevated to AAL2 successfully!");
    } catch (e: any) {
      setError("An unexpected error occurred: " + e.message);
    }
  };

  return (
    <div className="p-8 pb-32">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Lock className="w-8 h-8 text-neon-blue" />
          Multi-Factor Authentication (MFA)
        </h1>
        <p className="text-slate-400">
          Enforce Zero Trust identity verification using TOTP (Authenticator App).
        </p>
      </div>

      <div className="max-w-2xl bg-dark-panel border border-dark-border rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#151520_1px,transparent_1px),linear-gradient(to_bottom,#151520_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {status === "loading" && <p className="text-slate-400 animate-pulse">Checking MFA status...</p>}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {status === "verified" && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">MFA Verified</h2>
              <p className="text-green-400 font-medium">Your session is secured at AAL2 (Assurance Level 2).</p>
              <p className="text-slate-400 text-sm mt-4">You now have full access to Zero Trust protected routes.</p>
            </div>
          )}

          {status === "unverified" && factors.length === 0 && !qrCode && (
            <div className="text-center py-10">
              <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">MFA Not Enrolled</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                Your account is currently at AAL1. To access strict Zero Trust zones, you must enroll an authenticator app.
              </p>
              <button
                onClick={handleEnroll}
                className="bg-neon-blue text-black font-bold py-3 px-8 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                Enroll Authenticator App
              </button>
            </div>
          )}

          {status === "unverified" && factors.length === 0 && qrCode && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-white mb-4">Scan QR Code</h3>
              <p className="text-slate-400 text-sm mb-6 text-center">
                Scan this with Google Authenticator, Authy, or Microsoft Authenticator.
              </p>
              <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-48 h-48" />
              </div>
              <div className="w-full max-w-xs space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white text-center tracking-widest text-lg font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyEnrollment}
                  className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                >
                  Verify Enrollment
                </button>
              </div>
            </div>
          )}

          {status === "unverified" && factors.length > 0 && (
            <div className="flex flex-col items-center py-10">
              <QrCode className="w-16 h-16 text-neon-purple mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Elevate Session to AAL2</h3>
              <p className="text-slate-400 text-sm mb-8 text-center max-w-sm">
                Your account has MFA enabled. Please enter the 6-digit code from your authenticator app to upgrade this session.
              </p>
              <div className="w-full max-w-xs space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white text-center tracking-widest text-lg font-mono focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none"
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyChallenge}
                  className="w-full bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(191,0,255,0.4)]"
                >
                  Confirm Identity
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
