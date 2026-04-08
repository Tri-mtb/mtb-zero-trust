"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Globe,
  Monitor,
  Cpu
} from "lucide-react";

export default function SecurityLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
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
        const data = await res.json();
        // format data matching mock structure locally
        const formattedLogs = data.map((d: any) => ({
           id: d.id,
           timestamp: new Date(d.action_time).toLocaleString(),
           user: d.user_id,
           role: 'resolved in proxy',
           ip: d.ip_address,
           device: d.device_fingerprint,
           endpoint: d.endpoint,
           method: d.method,
           riskScore: Math.round(d.risk_score || 0),
           decision: d.decision,
           reason: 'AI engine dynamic decision' 
        }));
        setLogs(formattedLogs);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchSearch = String(log.user).toLowerCase().includes(searchTerm.toLowerCase()) || 
                        String(log.endpoint).includes(searchTerm) ||
                        String(log.ip).includes(searchTerm);
    const matchDecision = decisionFilter === "all" || log.decision === decisionFilter;
    return matchSearch && matchDecision;
  });

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "allow": return "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_5px_rgba(0,255,65,0.15)]";
      case "block": return "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_5px_rgba(255,0,60,0.15)]";
      case "alert": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_5px_rgba(255,232,0,0.15)]";
      default: return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  const stats = {
    total: logs.length,
    allowed: logs.filter(l => l.decision === "allow").length,
    blocked: logs.filter(l => l.decision === "block").length,
    alerted: logs.filter(l => l.decision === "alert").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-neon-blue" /> Security Access Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Zero Trust Gateway audit trail — every request is recorded</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLogs} className="px-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button className="px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700"><Clock className="w-4 h-4 text-slate-300" /></div>
          <div><p className="text-xs text-slate-500">Total Requests</p><p className="text-lg font-bold text-white">{stats.total}</p></div>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20"><ShieldCheck className="w-4 h-4 text-green-400" /></div>
          <div><p className="text-xs text-slate-500">Allowed</p><p className="text-lg font-bold text-green-400">{stats.allowed}</p></div>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-400/10 border border-red-400/20"><ShieldAlert className="w-4 h-4 text-red-400" /></div>
          <div><p className="text-xs text-slate-500">Blocked</p><p className="text-lg font-bold text-red-400">{stats.blocked}</p></div>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20"><AlertTriangle className="w-4 h-4 text-yellow-400" /></div>
          <div><p className="text-xs text-slate-500">Alerted</p><p className="text-lg font-bold text-yellow-400">{stats.alerted}</p></div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by user, endpoint, or IP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-panel border border-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
          />
        </div>
        <select 
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="bg-dark-panel border border-dark-border text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-neon-blue appearance-none min-w-[140px]"
        >
          <option value="all">All Decisions</option>
          <option value="allow">Allowed</option>
          <option value="block">Blocked</option>
          <option value="alert">Alerted</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-dark-panel border border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-dark-bg text-slate-500 border-b border-dark-border">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Endpoint</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Risk Score</th>
                <th className="px-4 py-3.5">Decision</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredLogs.map(log => (
                <tr key={log.id} className={`hover:bg-dark-bg/50 transition-colors cursor-pointer ${log.decision === 'block' ? 'bg-red-500/[0.02]' : ''}`} onClick={() => setSelectedLog(log)}>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="text-white font-medium text-sm">{log.user}</span>
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded capitalize ${log.role === 'admin' ? 'bg-neon-purple/20 text-neon-purple' : log.role === 'sales' ? 'bg-neon-blue/20 text-neon-blue' : log.role === 'shipper' ? 'bg-neon-green/20 text-neon-green' : 'bg-slate-700 text-slate-400'}`}>
                        {log.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-300">{log.method}</span>
                    <span className="font-mono text-xs text-slate-400 ml-1">{log.endpoint}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${log.riskScore >= 80 ? 'bg-neon-red shadow-[0_0_5px_rgba(255,0,60,0.5)]' : log.riskScore >= 40 ? 'bg-neon-yellow' : 'bg-neon-green'}`}
                          style={{ width: `${log.riskScore}%` }} 
                        />
                      </div>
                      <span className={`text-xs font-mono font-bold ${log.riskScore >= 80 ? 'text-neon-red' : log.riskScore >= 40 ? 'text-neon-yellow' : 'text-slate-400'}`}>{log.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${getDecisionBadge(log.decision)}`}>
                      {log.decision}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1 text-slate-400 hover:text-neon-blue transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-neon-purple" /> AI Decision Detail
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <p className="text-xs text-slate-500 mb-1">User / Entity</p>
                  <p className="text-sm font-mono text-white">{selectedLog.user}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <p className="text-xs text-slate-500 mb-1">Role</p>
                  <p className="text-sm font-mono text-white capitalize">{selectedLog.role}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> IP Address</p>
                  <p className="text-sm font-mono text-white">{selectedLog.ip}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> Device</p>
                  <p className="text-sm font-mono text-white">{selectedLog.device}</p>
                </div>
              </div>

              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Endpoint</p>
                <p className="text-sm font-mono text-white">{selectedLog.method} {selectedLog.endpoint}</p>
              </div>

              <div className={`p-4 rounded-lg border ${selectedLog.decision === 'block' ? 'bg-red-500/5 border-red-500/30' : selectedLog.decision === 'alert' ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-green-500/5 border-green-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">AI Decision</span>
                  <span className={`px-3 py-1 rounded text-xs font-bold border uppercase ${getDecisionBadge(selectedLog.decision)}`}>
                    {selectedLog.decision}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-400">Risk Score:</span>
                  <span className={`text-xl font-bold font-mono ${selectedLog.riskScore >= 80 ? 'text-neon-red' : selectedLog.riskScore >= 40 ? 'text-neon-yellow' : 'text-neon-green'}`}>{selectedLog.riskScore}/100</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">{selectedLog.reason}</p>
              </div>

              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</p>
                <p className="text-sm font-mono text-white">{selectedLog.timestamp}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 text-sm font-semibold bg-dark-bg border border-dark-border text-slate-300 rounded-lg hover:border-neon-blue hover:text-neon-blue transition-colors">
                Investigate User
              </button>
              <button onClick={() => setSelectedLog(null)} className="flex-1 py-2 text-sm font-semibold bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue hover:text-dark-bg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
