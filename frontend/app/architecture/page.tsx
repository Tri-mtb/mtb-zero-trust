"use client";

import React from "react";
import { 
  Laptop, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  Database,
  ArrowRight,
  Server,
  KeyRound,
  Lock,
  Wifi,
  Eye,
  Activity,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function ArchitectureVisualization() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Zero Trust Architecture</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Enhanced Policy Enforcement Flow</p>
        </div>
      </div>

      {/* Main Architectural Diagram */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-8 relative overflow-hidden">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#151520_1px,transparent_1px),linear-gradient(to_bottom,#151520_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 py-12">
          
          {/* Zone 1: Untrusted Network */}
          <div className="flex flex-col items-center w-64 shrink-0">
            <h3 className="text-neon-red font-bold text-lg mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" /> Untrusted Zone
            </h3>
            <div className="w-full bg-dark-bg border border-neon-red/50 rounded-xl p-6 relative group shadow-[0_0_20px_rgba(255,0,60,0.1)]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-red/50 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 bg-neon-red/10 rounded-full border border-neon-red/30">
                  <Laptop className="w-10 h-10 text-neon-red animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white mb-1">Remote Users</p>
                  <p className="text-xs text-slate-400">Sales, Admin, Shipper, Attackers</p>
                </div>
              </div>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-600 hidden lg:block" />

          {/* Zone 2: Zero Trust Gateway */}
          <div className="flex flex-col items-center w-64 shrink-0">
            <h3 className="text-neon-blue font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Policy Enforcement (PEP)
            </h3>
            <div className="w-full bg-dark-bg border border-neon-blue rounded-xl p-6 relative group shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/50 to-neon-purple/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 bg-neon-blue/10 rounded-full border border-neon-blue/50">
                  <Server className="w-10 h-10 text-neon-blue" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white mb-1">Zero Trust Gateway</p>
                  <p className="text-xs text-slate-400">Context Collection & Intercept</p>
                </div>
              </div>
            </div>
            {/* Connection down to AI Engine */}
            <div className="h-12 w-px bg-slate-600 my-2 relative hidden lg:block">
              <div className="absolute w-2 h-2 bg-neon-purple rounded-full left-1/2 -ml-1 top-0 animate-[ping_2s_infinite]"></div>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-600 hidden lg:block" />

          {/* Zone 3: AI Engine */}
          <div className="flex flex-col items-center w-64 shrink-0 mt-8 lg:-mt-32">
            <h3 className="text-neon-purple font-bold text-lg mb-4 flex items-center gap-2">
               <Cpu className="w-5 h-5" /> Policy Decision (PDP)
            </h3>
            <div className="w-full bg-dark-panel border border-neon-purple rounded-xl p-6 relative group shadow-[0_0_30px_rgba(191,0,255,0.2)]">
               <div className="absolute -inset-0.5 bg-neon-purple/50 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
               <div className="relative flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 border border-neon-purple rounded-full animate-spin border-dashed opacity-50"></div>
                    <div className="p-4 bg-neon-purple/10 rounded-full border border-neon-purple/50 relative z-10">
                      <Cpu className="w-10 h-10 text-neon-purple" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white mb-1">AI Risk Engine</p>
                    <p className="text-xs text-slate-400">Behavior Analysis & Scoring</p>
                  </div>
               </div>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-600 hidden lg:block" />

          {/* Zone 4: Protected Resource */}
          <div className="flex flex-col items-center w-64 shrink-0">
            <h3 className="text-neon-green font-bold text-lg mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" /> Protected Zone
            </h3>
            <div className="w-full bg-dark-bg border border-neon-green rounded-xl p-6 relative group shadow-[0_0_20px_rgba(0,255,65,0.1)]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent to-neon-green/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 bg-neon-green/10 rounded-full border border-neon-green/50">
                  <Lock className="w-10 h-10 text-neon-green" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white mb-1">E-Commerce System</p>
                  <p className="text-xs text-slate-400">Microservices, DB, APIs</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Verification Flow Diagram Details */}
      <h2 className="text-xl font-bold text-white tracking-wide mt-12 mb-6">Request Verification Sequence</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, title: "1. Request Initiation", desc: "User agent attempts to access an endpoint (/api/export). No implicit trust is granted.", color: "text-slate-300", bg: "bg-slate-800", bd: "border-slate-700" },
          { icon: Eye, title: "2. Context Collection", desc: "Gateway intercepts. Gathers IP context, Device Fingerprint, Time, Geo-location, and current active Session token.", color: "text-neon-blue", bg: "bg-neon-blue/10", bd: "border-neon-blue/50" },
          { icon: Activity, title: "3. AI Risk Analysis", desc: "AI Engine evaluates context vs established behavioral baselines. Generates Anomaly Score (0-100).", color: "text-neon-purple", bg: "bg-neon-purple/10", bd: "border-neon-purple/50" },
          { icon: ShieldCheck, title: "4. Policy Decision", desc: "Based on Risk Score + RBAC policies: Allow, block, or trigger MFA step-up challenge.", color: "text-neon-green", bg: "bg-neon-green/10", bd: "border-neon-green/50" }
        ].map((step, i) => (
          <div key={i} className="bg-dark-panel border border-dark-border rounded-xl p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${step.bg} border ${step.bd}`}>
              <step.icon className={`w-6 h-6 ${step.color}`} />
            </div>
            <h3 className="font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-dark-bg border border-dark-border rounded-xl p-8 flex flex-col lg:flex-row items-center gap-8 justify-between">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold text-white mb-4">Continuous Re-Authentication</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            In our Zero Trust platform, initial login is not enough. The Gateway constantly pipelines events to the AI Engine. A sudden geographical jump or rapid scraping behavior instantly inflates the Risk Score, triggering automatic endpoint blocking without waiting for session expiry.
          </p>
        </div>
        <div className="flex gap-4 p-4 rounded-xl border border-dark-border bg-dark-panel shrink-0">
          <div className="px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center shadow-[0_0_10px_rgba(0,255,65,0.1)]">
            <CheckCircle className="w-8 h-8 text-neon-green mx-auto mb-2" />
            <span className="font-bold text-white text-sm">Score &lt; 40</span>
            <p className="text-xs text-green-400 mt-1 uppercase tracking-widest font-semibold">Allow</p>
          </div>
          <div className="px-6 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center shadow-[0_0_10px_rgba(255,232,0,0.1)]">
            <KeyRound className="w-8 h-8 text-neon-yellow mx-auto mb-2" />
            <span className="font-bold text-white text-sm">Score 40-79</span>
            <p className="text-xs text-yellow-400 mt-1 uppercase tracking-widest font-semibold">MFA Challenge</p>
          </div>
          <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center shadow-[0_0_10px_rgba(255,0,60,0.1)]">
            <XCircle className="w-8 h-8 text-neon-red mx-auto mb-2" />
            <span className="font-bold text-white text-sm">Score &gt;= 80</span>
            <p className="text-xs text-red-500 mt-1 uppercase tracking-widest font-semibold">Block Base</p>
          </div>
        </div>
      </div>
    </div>
  );
}
