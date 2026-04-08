"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  Cpu, 
  Bell, 
  Lock,
  Globe,
  Monitor,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Server,
  Database,
  Key
} from "lucide-react";

export default function SettingsPage() {
  const [aiThreshold, setAiThreshold] = useState(80);
  const [rateLimitPerMin, setRateLimitPerMin] = useState(20);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [geoBlocking, setGeoBlocking] = useState(true);
  const [afterHoursAlert, setAfterHoursAlert] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [logRetentionDays, setLogRetentionDays] = useState(90);
  const [alertEmail, setAlertEmail] = useState("admin@trustguard.ai");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="transition-colors">
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-neon-green" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-slate-600" />
      )}
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Settings className="w-6 h-6 text-neon-blue" /> System Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure Zero Trust policies and security parameters</p>
        </div>
        <button 
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${saved ? 'bg-neon-green text-dark-bg' : 'bg-neon-blue text-dark-bg hover:bg-cyan-400'}`}
        >
          {saved ? <><RefreshCw className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* AI Engine Settings */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-neon-purple" /> AI Risk Engine Configuration
        </h2>
        <p className="text-sm text-slate-400 mb-6">Control the behavior of the Isolation Forest anomaly detection model</p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 font-medium">Block Threshold (Risk Score)</label>
              <span className={`text-sm font-mono font-bold ${aiThreshold >= 90 ? 'text-neon-red' : aiThreshold >= 70 ? 'text-neon-yellow' : 'text-neon-green'}`}>{aiThreshold}/100</span>
            </div>
            <input 
              type="range" 
              min="40" max="100" 
              value={aiThreshold}
              onChange={(e) => setAiThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neon-purple"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Strict (40)</span>
              <span>Default (80)</span>
              <span>Lenient (100)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 font-medium">Rate Limit (requests/minute before block)</label>
              <span className="text-sm font-mono font-bold text-neon-blue">{rateLimitPerMin} req/min</span>
            </div>
            <input 
              type="range" 
              min="5" max="100" 
              value={rateLimitPerMin}
              onChange={(e) => setRateLimitPerMin(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neon-blue"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Aggressive (5)</span>
              <span>Default (20)</span>
              <span>Relaxed (100)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-blue" /> Security Policies
        </h2>
        <p className="text-sm text-slate-400 mb-6">Zero Trust enforcement rules applied at the Gateway (PEP)</p>

        <div className="space-y-1">
          <div className="flex items-center justify-between py-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                <Key className="w-4 h-4 text-neon-purple" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Multi-Factor Authentication (MFA)</p>
                <p className="text-xs text-slate-500">Require 2FA for all users on login</p>
              </div>
            </div>
            <ToggleSwitch enabled={mfaEnabled} onToggle={() => setMfaEnabled(!mfaEnabled)} />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
                <Globe className="w-4 h-4 text-neon-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Geo-Location Blocking</p>
                <p className="text-xs text-slate-500">Block requests from unrecognized regions</p>
              </div>
            </div>
            <ToggleSwitch enabled={geoBlocking} onToggle={() => setGeoBlocking(!geoBlocking)} />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30">
                <AlertTriangle className="w-4 h-4 text-neon-yellow" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">After-Hours Access Alerts</p>
                <p className="text-xs text-slate-500">Flag access attempts outside business hours (6AM - 8PM)</p>
              </div>
            </div>
            <ToggleSwitch enabled={afterHoursAlert} onToggle={() => setAfterHoursAlert(!afterHoursAlert)} />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
                <Lock className="w-4 h-4 text-neon-red" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Auto-Block on High Risk</p>
                <p className="text-xs text-slate-500">Automatically block when AI Risk Score exceeds threshold</p>
              </div>
            </div>
            <ToggleSwitch enabled={autoBlock} onToggle={() => setAutoBlock(!autoBlock)} />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-neon-yellow" /> Notifications & Alerting
        </h2>
        <p className="text-sm text-slate-400 mb-6">Configure how security events are reported</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-2">Alert Email Address</label>
            <input 
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white text-sm rounded-lg px-4 py-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-2">Log Retention Period</label>
            <select 
              value={logRetentionDays}
              onChange={(e) => setLogRetentionDays(parseInt(e.target.value))}
              className="w-full bg-dark-bg border border-dark-border text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-neon-blue appearance-none"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days (Recommended)</option>
              <option value={180}>180 days</option>
              <option value={365}>365 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-neon-green" /> Service Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Frontend", port: "3000", status: "online", icon: Monitor },
            { name: "Gateway (PEP)", port: "8080", status: "online", icon: Shield },
            { name: "AI Engine (PDP)", port: "5000", status: "online", icon: Cpu },
            { name: "Protected API", port: "4000", status: "online", icon: Database },
          ].map((service, i) => (
            <div key={i} className="bg-dark-bg border border-dark-border rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <service.icon className="w-4 h-4 text-neon-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{service.name}</p>
                <p className="text-xs text-slate-500 font-mono">:{service.port}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-neon-green font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Online
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
