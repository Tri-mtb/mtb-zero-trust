"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Search,
  Filter,
  UserX,
  Clock,
  Zap,
  Lock,
  ChevronDown
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockAiTimelineData = [
  { time: '10:00', score: 10 },
  { time: '10:05', score: 15 },
  { time: '10:10', score: 12 },
  { time: '10:15', score: 85 }, // Spike: Rapid API Calls
  { time: '10:20', score: 92 },
  { time: '10:25', score: 45 },
  { time: '10:30', score: 20 },
];

const riskUsers = [
  { 
    id: "staff_sales2", 
    role: "Sales", 
    score: 92, 
    status: "Blocked", 
    reason: "Accessing unauthorized admin resources",
    ip: "103.45.67.89",
    geo: "Vietnam",
    time: "2 mins ago"
  },
  { 
    id: "admin_sys_2", 
    role: "Admin", 
    score: 85, 
    status: "Challenged", 
    reason: "Unusual login time (3:00 AM)",
    ip: "192.168.1.15",
    geo: "Internal",
    time: "15 mins ago"
  },
  { 
    id: "api_service_bot", 
    role: "Service Action", 
    score: 75, 
    status: "Investigating", 
    reason: "Rapid API requests (>1000/s)",
    ip: "10.0.0.5",
    geo: "Internal AWS",
    time: "1 hour ago"
  }
];

export default function ThreatDetectionPanel() {
  const [selectedUser, setSelectedUser] = useState(riskUsers[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Cpu className="text-neon-purple w-6 h-6" /> AI Decision Engine (PDP)
          </h1>
          <p className="text-slate-400 text-sm mt-1">Behavior Monitoring & Risk Scoring Analyst</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search User ID..." 
              className="bg-dark-panel border border-dark-border text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
            />
          </div>
          <button className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Users at Risk */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-[calc(100vh-14rem)]">
            <h3 className="text-base font-bold text-white mb-4 flex justify-between items-center">
              <span>Behavioral Risk Scores</span>
              <span className="text-xs bg-neon-red/20 text-neon-red px-2 py-1 rounded">3 Critical</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {riskUsers.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedUser.id === user.id ? "bg-dark-bg border-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.15)]" : "bg-dark-bg/50 border-dark-border hover:border-slate-600"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm text-white font-bold">{user.id}</span>
                    <span className="text-xs text-slate-500">{user.time}</span>
                  </div>
                  
                  {/* Risk Meter */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Risk Meter</span>
                      <span className={`font-bold ${user.score >= 90 ? "text-neon-red" : user.score >= 80 ? "text-neon-yellow" : "text-neon-blue"}`}>{user.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${user.score >= 90 ? "bg-neon-red shadow-[0_0_10px_rgba(255,0,60,0.8)]" : user.score >= 80 ? "bg-neon-yellow shadow-[0_0_10px_rgba(255,232,0,0.8)]" : "bg-neon-blue"}`}
                        style={{ width: `${user.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-neon-yellow" /> {user.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Analytics */}
        <div className="xl:col-span-2 space-y-6">
          {/* User Behavior Analytics Dashboard */}
          <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">User Analytics: {selectedUser.id}</h2>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><UserX className="w-4 h-4"/> Role: {selectedUser.role}</span>
                  <span className="flex items-center gap-1"><Lock className="w-4 h-4"/> Status: <span className="text-neon-red">{selectedUser.status}</span></span>
                </div>
              </div>
              <button className="px-4 py-2 border border-neon-red text-neon-red hover:bg-neon-red hover:text-white rounded-lg text-sm font-semibold transition-colors shadow-[0_0_10px_rgba(255,0,60,0.2)]">
                Investigate Logs
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Context: Location</p>
                <p className="text-sm font-mono text-white">{selectedUser.geo} ({selectedUser.ip})</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Context: Device</p>
                <p className="text-sm font-mono text-white">Unrecognized Browser Agent</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg border border-neon-red/30">
                <p className="text-xs text-slate-500 mb-1">Primary Vector</p>
                <p className="text-sm font-mono text-neon-red">{selectedUser.reason}</p>
              </div>
            </div>

            {/* AI Score Graph */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> AI Anomaly Score Timeline
              </h3>
              <div className="h-48 w-full bg-dark-bg p-4 rounded-lg border border-dark-border relative">
                <div className="absolute top-0 right-4 p-2 text-xs font-mono text-neon-purple opacity-50 z-10">Real-time inference active</div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockAiTimelineData}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d12', borderColor: '#bf00ff', color: '#f8fafc' }} />
                    {/* Critical Threshold Line */}
                    <Line type="step" dataKey={() => 80} stroke="#ff003c" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                    <Line type="monotone" dataKey="score" stroke="#bf00ff" strokeWidth={2} dot={{ fill: '#0d0d12', stroke: '#bf00ff', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#00f0ff', stroke: '#00f0ff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Suspicious Activity Timeline */}
          <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neon-blue" /> Event Sequence
            </h3>
            <div className="space-y-4">
              {[
                { time: "10:15:32", msg: "Request to /admin/customers/export", type: "critical" },
                { time: "10:15:33", msg: "AI Engine Evaluated Context -> Risk Score 92", type: "ai" },
                { time: "10:15:34", msg: "Policy Enforcement: BLOCKED", type: "block" },
              ].map((ev, i) => (
                <div key={i} className="flex gap-4 items-start relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-dark-border last:before:hidden">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border bg-dark-panel ${
                    ev.type === 'critical' ? 'border-neon-yellow text-neon-yellow' : 
                    ev.type === 'ai' ? 'border-neon-purple text-neon-purple' : 
                    'border-neon-red text-neon-red shadow-[0_0_10px_rgba(255,0,60,0.3)]'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-3 flex-1 mb-2">
                    <span className="text-xs text-slate-500 font-mono block mb-1">{ev.time}</span>
                    <span className={`text-sm ${ev.type === 'block' ? 'text-neon-red font-bold' : 'text-slate-300'}`}>{ev.msg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
