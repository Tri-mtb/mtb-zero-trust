"use client";

import React, { useState } from "react";
import {
  Cpu,
  Activity,
  ShieldAlert,
  Search,
  Filter,
  UserX,
  UserCheck,
  Clock,
  Zap,
  Lock,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const mockAiTimelineData = [
  { time: "10:00", score: 10 },
  { time: "10:05", score: 15 },
  { time: "10:10", score: 12 },
  { time: "10:15", score: 85 },
  { time: "10:20", score: 92 },
  { time: "10:25", score: 45 },
  { time: "10:30", score: 20 },
];

export default function ThreatDetectionPanel() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [riskUsers, setRiskUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [policyActionLoading, setPolicyActionLoading] = useState<"block" | "unblock" | "mark-safe" | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;
        setCurrentUserId(session.user.id);

        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const res = await fetch(`${gatewayUrl}/api/access-logs`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load access logs");
        }

        const logs = await res.json();
        const userLogs = logs.filter((log: any) => log.risk_score >= 40);
        const grouped: Record<string, any> = {};

        userLogs.forEach((log: any) => {
          if (!grouped[log.user_id] || grouped[log.user_id].score < log.risk_score) {
            grouped[log.user_id] = {
              id: log.user_id,
              role: "Unknown",
              score: Math.round(log.risk_score),
              status:
                log.decision === "block"
                  ? "Blocked"
                  : log.decision === "alert"
                    ? "Challenged"
                    : "Investigating",
              policyStatus: log.decision === "block" ? "blocked" : "normal",
              reason:
                log.decision === "block"
                  ? "Critical Risk Threshold Exceeded"
                  : "Suspicious Context Detected",
              ip: log.ip_address,
              geo: "Resolved by AI",
              time: new Date(log.action_time).toLocaleTimeString(),
              events: logs
                .filter((entry: any) => entry.user_id === log.user_id)
                .slice(0, 10)
                .map((entry: any) => ({
                  id: entry.id,
                  time: new Date(entry.action_time).toLocaleTimeString(),
                  msg: `${entry.method} ${entry.endpoint}`,
                  type:
                    entry.decision === "block"
                      ? "block"
                      : entry.decision === "alert"
                        ? "critical"
                        : "ai",
                  admin_feedback: entry.admin_feedback,
                })),
            };
          }
        });

        const sorted = Object.values(grouped).sort((a: any, b: any) => b.score - a.score);
        setRiskUsers(sorted);
        if (sorted.length > 0) {
          setSelectedUser(sorted[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const updateSelectedUserPolicy = (policyStatus: "blocked" | "trusted" | "normal") => {
    if (!selectedUser) return;

    const nextStatus =
      policyStatus === "blocked"
        ? "Blocked"
        : policyStatus === "trusted"
          ? "Marked Safe"
          : selectedUser.status === "Blocked"
            ? "Investigating"
            : selectedUser.status;

    const updatedUser = { ...selectedUser, policyStatus, status: nextStatus };
    setSelectedUser(updatedUser);
    setRiskUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const handlePolicyAction = async (action: "block" | "unblock" | "mark-safe") => {
    if (!selectedUser) return;

    if (selectedUser.id === currentUserId && action === "block") {
      alert("Bạn không thể tự block chính tài khoản admin đang đăng nhập.");
      return;
    }

    try {
      setPolicyActionLoading(action);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const res = await fetch(`${gatewayUrl}/api/admin/users/${selectedUser.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || `Không thể ${action} user.`);
      }

      updateSelectedUserPolicy(action === "block" ? "blocked" : action === "mark-safe" ? "trusted" : "normal");
    } catch (error: any) {
      alert(error.message || "Không thể cập nhật policy cho user.");
    } finally {
      setPolicyActionLoading(null);
    }
  };

  const submitFeedback = async (logId: string, isAnomalyConfirmed: boolean) => {
    try {
      setFeedbackLoading(logId);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isAnomalyConfirmed && selectedUser?.id === currentUserId) {
        alert("Bạn không thể Confirm Threat trên chính tài khoản admin đang đăng nhập.");
        return;
      }

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const res = await fetch(`${gatewayUrl}/api/access-logs/${logId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ isAnomalyConfirmed }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(payload.error || "Không gửi được feedback tới API/AI Engine.");
        return;
      }

      if (selectedUser) {
        const newEvents = selectedUser.events.map((event: any) =>
          event.id === logId
            ? { ...event, admin_feedback: isAnomalyConfirmed ? "confirmed_threat" : "marked_safe" }
            : event
        );
        const updatedUser = { ...selectedUser, events: newEvents };
        setSelectedUser(updatedUser);
        setRiskUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi mạng khi cập nhật AI Feedback.");
    } finally {
      setFeedbackLoading(null);
    }
  };

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
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-[calc(100vh-14rem)]">
            <h3 className="text-base font-bold text-white mb-4 flex justify-between items-center">
              <span>Behavioral Risk Scores</span>
              <span className="text-xs bg-neon-red/20 text-neon-red px-2 py-1 rounded">
                {riskUsers.filter((user) => user.score >= 80).length} Critical
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loading && <div className="text-slate-500 text-center py-10">Loading AI insights...</div>}
              {!loading && riskUsers.length === 0 && (
                <div className="text-slate-500 text-center py-10">No high risk users detected.</div>
              )}
              {riskUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-dark-bg border-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.15)]"
                      : "bg-dark-bg/50 border-dark-border hover:border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm text-white font-bold truncate w-32" title={user.id}>
                      {user.id}
                    </span>
                    <span className="text-xs text-slate-500">{user.time}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Risk Meter</span>
                      <span
                        className={`font-bold ${
                          user.score >= 90 ? "text-neon-red" : user.score >= 80 ? "text-neon-yellow" : "text-neon-blue"
                        }`}
                      >
                        {user.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          user.score >= 90
                            ? "bg-neon-red shadow-[0_0_10px_rgba(255,0,60,0.8)]"
                            : user.score >= 80
                              ? "bg-neon-yellow shadow-[0_0_10px_rgba(255,232,0,0.8)]"
                              : "bg-neon-blue"
                        }`}
                        style={{ width: `${user.score}%` }}
                      />
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

        <div className="xl:col-span-2 space-y-6">
          {selectedUser ? (
            <>
              <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">User Analytics: {selectedUser.id}</h2>
                    <div className="flex gap-4 text-sm text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <UserX className="w-4 h-4" /> Role: {selectedUser.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Status: <span className="text-neon-red">{selectedUser.status}</span>
                      </span>
                      {selectedUser.policyStatus === "blocked" && <span className="text-neon-red font-semibold">AI Blocked</span>}
                      {selectedUser.policyStatus === "trusted" && <span className="text-neon-green font-semibold">Marked Safe</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {selectedUser.policyStatus === "blocked" ? (
                      <button
                        onClick={() => handlePolicyAction("unblock")}
                        disabled={policyActionLoading === "unblock"}
                        className="px-4 py-2 border border-neon-green text-neon-green hover:bg-neon-green hover:text-dark-bg rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        {policyActionLoading === "unblock" ? "Unblocking..." : "Unblock User"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePolicyAction("block")}
                        disabled={policyActionLoading === "block" || selectedUser.id === currentUserId}
                        className="px-4 py-2 border border-neon-red text-neon-red hover:bg-neon-red hover:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        {policyActionLoading === "block"
                          ? "Blocking..."
                          : selectedUser.id === currentUserId
                            ? "Cannot block self"
                            : "Block User"}
                      </button>
                    )}
                    <button
                      onClick={() => handlePolicyAction("mark-safe")}
                      disabled={policyActionLoading === "mark-safe"}
                      className="px-4 py-2 border border-neon-green text-neon-green hover:bg-neon-green hover:text-dark-bg rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      {policyActionLoading === "mark-safe" ? "Saving..." : "Mark User Safe"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <p className="text-xs text-slate-500 mb-1">Context: Location</p>
                    <p className="text-sm font-mono text-white truncate" title={`${selectedUser.geo} (${selectedUser.ip})`}>
                      {selectedUser.geo} ({selectedUser.ip})
                    </p>
                  </div>
                  <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <p className="text-xs text-slate-500 mb-1">Context: Device</p>
                    <p className="text-sm font-mono text-white">Unrecognized Browser Agent</p>
                  </div>
                  <div className="bg-dark-bg p-4 rounded-lg border border-neon-red/30">
                    <p className="text-xs text-slate-500 mb-1">Primary Vector</p>
                    <p className="text-sm font-mono text-neon-red truncate" title={selectedUser.reason}>
                      {selectedUser.reason}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> AI Anomaly Score Timeline
                  </h3>
                  <div className="h-48 w-full bg-dark-bg p-4 rounded-lg border border-dark-border relative">
                    <div className="absolute top-0 right-4 p-2 text-xs font-mono text-neon-purple opacity-50 z-10">
                      Real-time inference active
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockAiTimelineData}>
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#0d0d12", borderColor: "#bf00ff", color: "#f8fafc" }} />
                        <Line type="step" dataKey={() => 80} stroke="#ff003c" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#bf00ff"
                          strokeWidth={2}
                          dot={{ fill: "#0d0d12", stroke: "#bf00ff", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#00f0ff", stroke: "#00f0ff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neon-blue" /> Event Sequence
                </h3>
                <div className="space-y-4">
                  {selectedUser.events?.map((event: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-dark-border last:before:hidden"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border bg-dark-panel ${
                          event.type === "critical"
                            ? "border-neon-yellow text-neon-yellow"
                            : event.type === "ai"
                              ? "border-neon-purple text-neon-purple"
                              : "border-neon-red text-neon-red shadow-[0_0_10px_rgba(255,0,60,0.3)]"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                      <div className="bg-dark-bg border border-dark-border rounded-lg p-3 flex-1 mb-2">
                        <span className="text-xs text-slate-500 font-mono block mb-1">{event.time}</span>
                        <span className={`text-sm tracking-wide ${event.type === "block" ? "text-neon-red font-bold" : "text-slate-300"}`}>
                          {event.msg}
                        </span>

                        <div className="flex gap-2 mt-3 pt-2 border-t border-dark-border/50 flex-wrap">
                          {event.admin_feedback === "marked_safe" && (
                            <span className="text-xs px-2 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded flex items-center gap-1">
                              <Zap className="w-3 h-3" /> AI Override: Marked Safe
                            </span>
                          )}
                          {event.admin_feedback === "confirmed_threat" && (
                            <span className="text-xs px-2 py-1 bg-neon-red/10 text-neon-red border border-neon-red/30 rounded font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> AI Override: Confirmed Threat
                            </span>
                          )}

                          {!event.admin_feedback && (
                            <>
                              <button
                                disabled={feedbackLoading === event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  submitFeedback(event.id, false);
                                }}
                                className="text-xs px-2 py-1 bg-neon-green/5 text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/20 hover:border-neon-green/50 transition-colors disabled:opacity-50"
                              >
                                {feedbackLoading === event.id ? "Saving..." : "Mark as Safe"}
                              </button>
                              <button
                                disabled={feedbackLoading === event.id || selectedUser?.id === currentUserId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  submitFeedback(event.id, true);
                                }}
                                className="text-xs px-2 py-1 bg-neon-red/5 text-neon-red border border-neon-red/20 rounded hover:bg-neon-red/20 hover:border-neon-red/50 transition-colors disabled:opacity-50"
                              >
                                {feedbackLoading === event.id
                                  ? "Saving..."
                                  : selectedUser?.id === currentUserId
                                    ? "Cannot confirm self"
                                    : "Confirm Threat"}
                              </button>
                              {selectedUser?.id === currentUserId && (
                                <span className="text-xs text-slate-500 self-center">
                                  Self-block protection is active for your admin account.
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!selectedUser.events || selectedUser.events.length === 0) && (
                    <p className="text-slate-500 text-sm">No sequence events recorded.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-dark-panel border border-dark-border rounded-xl p-6 h-[calc(100vh-14rem)] flex items-center justify-center">
              <div className="text-center">
                <Cpu className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No Suspicious Context</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                  Select a user from the behavioral risk scores list to analyze their malicious interaction sequence.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
