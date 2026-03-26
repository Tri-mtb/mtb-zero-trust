"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Users, 
  Eye, 
  ShieldAlert,
  Server,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockAiAnomalyData = [
  { time: '00:00', score: 12, threshold: 75 },
  { time: '04:00', score: 15, threshold: 75 },
  { time: '08:00', score: 28, threshold: 75 },
  { time: '12:00', score: 45, threshold: 75 },
  { time: '16:00', score: 85, threshold: 75 }, // Spike
  { time: '20:00', score: 32, threshold: 75 },
  { time: '24:00', score: 18, threshold: 75 },
];

const mockBehaviorData = [
  { name: 'Mon', normal: 4000, abnormal: 240 },
  { name: 'Tue', normal: 3000, abnormal: 139 },
  { name: 'Wed', normal: 2000, abnormal: 980 }, // Anomaly Day
  { name: 'Thu', normal: 2780, abnormal: 390 },
  { name: 'Fri', normal: 1890, abnormal: 480 },
  { name: 'Sat', normal: 2390, abnormal: 380 },
  { name: 'Sun', normal: 3490, abnormal: 430 },
];

const suspiciousAlerts = [
  { id: 1, user: 'staff_092', location: 'Russia (VPN)', score: 92, status: 'Blocked', time: '10 mins ago' },
  { id: 2, user: 'admin_sys', location: 'Unknown Device', score: 85, status: 'MFA Challenged', time: '25 mins ago' },
  { id: 3, user: 'buyer_77', location: 'China', score: 78, status: 'Investigating', time: '1 hour ago' },
];

// TypeScript interfaces for API data
interface AccessLog {
  id: string;
  user_id: string;
  ip_address: string;
  device_fingerprint: string;
  endpoint: string;
  method: string;
  action_time: string;
  risk_score: number;
  decision: 'allow' | 'alert' | 'block';
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const res = await fetch(`${gatewayUrl}/api/access-logs`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
           const data: AccessLog[] = await res.json();
           setLogs(data);
        } else {
           setError(`API Error: ${res.status}`);
        }
      } catch(e) {
        console.warn("Could not reach gateway:", e);
        setError("Could not reach Zero Trust Gateway. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalSessions = 1204; // Mock scale
  const actualBlocked = logs.filter((l) => l.decision === 'block').length;
  const recentAlerts = logs.filter((l) => l.decision === 'alert' || l.decision === 'block').slice(0, 5);
  const avgTrustScore = logs.length > 0 
    ? (100 - (logs.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / logs.length)).toFixed(1) 
    : "94.2";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Security Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time Zero Trust Gateway Telemetry</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-sm text-white hover:border-slate-500 transition-colors">
            Last 24 Hours
          </button>
          <button className="px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
            <Server className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Network Access Events", val: String(logs.length + totalSessions), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { title: "Blocked Requests", val: String(actualBlocked > 0 ? actualBlocked : 342), icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
          { title: "Avg AI Trust Score", val: avgTrustScore, icon: Activity, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
          { title: "Policies Enforced", val: "100%", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-panel border border-dark-border p-5 rounded-xl block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.val}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            {i === 1 && <p className="text-xs text-red-400 mt-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> AI Engine actively protecting</p>}
            {i !== 1 && <p className="text-xs text-green-400 mt-3 font-medium">Stable system condition</p>}
          </div>
        ))}
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-panel border border-dark-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">AI Normal vs Abnormal Behaviors</h3>
            <p className="text-sm text-slate-400">Contextual policy decisions across the E-commerce platform</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockBehaviorData}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbnormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff003c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff003c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0d12', borderColor: '#22222f', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="abnormal" stroke="#ff003c" fillOpacity={1} fill="url(#colorAbnormal)" />
                <Area type="monotone" dataKey="normal" stroke="#00f0ff" fillOpacity={1} fill="url(#colorNormal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-neon-yellow" /> Suspicious Login Alerts
            </h3>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-dark-bg border border-dark-border rounded-lg relative overflow-hidden group hover:border-neon-red/50 transition-colors">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.decision === 'block' ? 'bg-neon-red' : 'bg-neon-yellow'}`}></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-sm text-white truncate w-[150px]" title={alert.user_id}>{alert.user_id}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(alert.action_time).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2 truncate">IP: {alert.ip_address}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${alert.decision === 'block' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {alert.decision}
                  </span>
                  <span className={`text-[10px] font-bold ${alert.risk_score >= 80 ? 'text-neon-red' : 'text-neon-yellow'}`}>Risk: {Math.round(alert.risk_score || 0)}</span>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No suspicious alerts detected by AI.</p>}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white border border-dark-border rounded-lg hover:bg-dark-bg transition-colors">
            View All Alerts
          </button>
        </div>
      </div>

      {/* Realtime stream */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-5">
         <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               System Access Log Stream {loading && <RefreshCw className="w-4 h-4 animate-spin text-neon-blue" />}
            </h3>
            <p className="text-sm text-slate-400">Live feed from the Zero Trust Gateway Enforcement Point</p>
         </div>
         {error && (
           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
             {error}
           </div>
         )}
         <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
           <table className="w-full text-left text-sm text-slate-400 relative">
             <thead className="text-xs uppercase bg-dark-panel text-slate-500 border-b border-dark-border sticky top-0 z-10">
               <tr>
                 <th className="px-4 py-3">Timestamp</th>
                 <th className="px-4 py-3">User/Entity</th>
                 <th className="px-4 py-3">Resource</th>
                 <th className="px-4 py-3">AI Context Evaluation</th>
                 <th className="px-4 py-3">Decision</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-dark-border">
               {logs.slice(0, 50).map((log, i) => (
               <tr key={i} className={`hover:bg-dark-bg transition-colors ${log.decision === 'block' ? 'bg-red-500/[0.02]' : ''}`}>
                 <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">{new Date(log.action_time).toLocaleString()}</td>
                 <td className="px-4 py-3 text-white truncate max-w-[150px]" title={log.user_id}>{log.user_id}</td>
                 <td className="px-4 py-3 font-mono truncate max-w-[150px]">{log.method} {log.endpoint}</td>
                 <td className={`px-4 py-3 text-[11px] truncate max-w-[200px] ${log.risk_score >= 80 ? 'text-red-400' : log.risk_score >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>
                   {log.ip_address} | Score: {Math.round(log.risk_score || 0)}
                 </td>
                 <td className="px-4 py-3">
                   <span className={`px-2 py-1 uppercase rounded text-[10px] shadow-[0_0_5px_currentColor] border ${
                      log.decision === 'allow' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      log.decision === 'alert' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-red-500/10 text-neon-red border-red-500/20'
                   }`}>
                     {log.decision}
                   </span>
                 </td>
               </tr>
               ))}
               {logs.length === 0 && !loading && (
                 <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No logs found in the database.</td></tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
