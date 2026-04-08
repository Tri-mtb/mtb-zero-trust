"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Lock,
  FileX,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function SalesCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setSelectedCustomer] = useState<any | null>(null);

  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErrorMsg("No active session");
          setLoading(false);
          return;
        }

        const res = await fetch(`${gatewayUrl}/api/customers`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.error || `Gateway Error ${res.status}`);
        }

        const data = await res.json();
        setCustomers(data);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [gatewayUrl]);

  const filteredCustomers = customers.filter(c =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-blue" /> Customer Lookups
          </h1>
          <p className="text-slate-400 text-sm mt-1">Query individual customers (Bulk access restricted)</p>
        </div>
        <button disabled className="px-3 py-1.5 flex items-center gap-1.5 bg-dark-panel border border-slate-700 text-slate-600 rounded-lg text-xs cursor-not-allowed" title="Action prevented by ZTA Policy">
          <FileX className="w-3.5 h-3.5" /> Export Data (ZTA Block)
        </button>
      </div>

      {errorMsg && (
        <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red p-3 rounded-lg flex items-center gap-3 mb-4">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Error: {errorMsg}</span>
        </div>
      )}

      {/* Zero Trust Restriction Notice */}
      <div className="bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow p-4 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(255,232,0,0.1)] relative overflow-hidden group mb-6">
        <div className="absolute top-0 right-0 p-8 pt-6 pb-0 opacity-10 bg-gradient-to-l from-neon-yellow to-transparent rotate-45 transform translate-x-4 -translate-y-4 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Lock className="w-24 h-24" />
        </div>
        <Lock className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold tracking-wide">Data Loss Prevention Active</h3>
          <p className="text-sm opacity-80 mt-1 max-w-2xl">
            Personal Identifiable Information (PII) is partially masked per Zero Trust Data Loss Prevention policy. Full details are only visible to <code>Admin</code> role users.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-dark-panel border border-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
        />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {filteredCustomers.length > 0 ? filteredCustomers.map((customer, i) => {
            const riskLevel = i % 3 === 0 ? "medium" : "low";
            // Mask email and phone for Sales role display
            const emailParts = (customer.email || "").split("@");
            const maskedEmail = emailParts.length === 2 
                ? `${emailParts[0].substring(0, 2)}***@${emailParts[1]}` 
                : "N/A";
            
            return (
              <div
                key={customer.id}
                className="bg-dark-panel border border-dark-border rounded-xl p-5 hover:border-neon-blue/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                      {(customer.name || "U").substring(0,2).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-2">
                      <h3 className="text-white font-bold truncate">{customer.name || "Unknown User"}</h3>
                      <span className="text-xs text-slate-500 font-mono truncate block">{customer.id}</span>
                    </div>
                  </div>
                  {riskLevel === "medium" ? (
                    <span className="flex items-center gap-1 text-xs text-neon-yellow px-2 py-0.5 rounded bg-neon-yellow/10 border border-neon-yellow/30 flex-shrink-0">
                      <ShieldAlert className="w-3 h-3" /> Medium Risk
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-neon-green px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30 flex-shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Low Risk
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{maskedEmail}</span>
                    </div>
                    <span className="text-[10px] bg-neon-yellow/10 text-neon-yellow px-1 py-0.5 rounded border border-neon-yellow/20 flex-shrink-0 ml-2">masked</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">***-***-****</span>
                    </div>
                    <span className="text-[10px] bg-neon-yellow/10 text-neon-yellow px-1 py-0.5 rounded border border-neon-yellow/20 flex-shrink-0 ml-2">masked</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="text-white text-xs truncate max-w-[120px]" title={customer.address}>{customer.address || "N/A"}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-slate-400 hover:text-neon-blue hover:border-neon-blue/50 transition-colors font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-1 lg:col-span-2 text-center py-12 text-slate-500 border border-dashed border-dark-border rounded-xl">
              No customers found.
            </div>
          )}
        </div>
      )}

      {/* DLP Notice Footer */}
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 p-4">
        <AlertTriangle className="w-3 h-3 text-neon-yellow" />
        All customer data is protected by Zero Trust Data Loss Prevention (DLP). PII is masked for Sales role.
      </div>
    </div>
  );
}
