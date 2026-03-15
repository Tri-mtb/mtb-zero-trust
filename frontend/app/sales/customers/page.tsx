"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Lock,
  FileX,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

const mockCustomerLookups = [
  { id: "CUST-001", name: "Alice Doe", email: "a***doe@example.com", phone: "+84 901 *** 567", ltv: 2450.00, orders: 12, riskLevel: "low" },
  { id: "CUST-002", name: "Bob Smith", email: "b.sm***@gmail.com", phone: "+84 902 *** 678", ltv: 890.00, orders: 5, riskLevel: "low" },
  { id: "CUST-003", name: "Charlie Pham", email: "cp_a***@test.io", phone: "+84 903 *** 789", ltv: 5670.00, orders: 23, riskLevel: "medium" },
  { id: "CUST-004", name: "Diana Nguyen", email: "dia***@outlook.com", phone: "+84 904 *** 890", ltv: 1230.00, orders: 8, riskLevel: "low" },
  { id: "CUST-005", name: "Ethan Tran", email: "eth***@company.vn", phone: "+84 905 *** 901", ltv: 450.00, orders: 3, riskLevel: "low" },
];

export default function SalesCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomerLookups[0] | null>(null);

  const filteredCustomers = mockCustomerLookups.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Zero Trust Restriction Notice */}
      <div className="bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow p-4 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(255,232,0,0.1)] relative overflow-hidden group">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map(customer => (
          <div
            key={customer.id}
            className="bg-dark-panel border border-dark-border rounded-xl p-5 hover:border-neon-blue/30 transition-colors cursor-pointer group"
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-white font-bold">{customer.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{customer.id}</span>
                </div>
              </div>
              {customer.riskLevel === "medium" ? (
                <span className="flex items-center gap-1 text-xs text-neon-yellow px-2 py-0.5 rounded bg-neon-yellow/10 border border-neon-yellow/30">
                  <ShieldAlert className="w-3 h-3" /> Medium Risk
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-neon-green px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30">
                  <ShieldCheck className="w-3 h-3" /> Low Risk
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-xs">{customer.email}</span>
                <span className="text-[10px] bg-neon-yellow/10 text-neon-yellow px-1 py-0.5 rounded border border-neon-yellow/20">masked</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-xs">{customer.phone}</span>
                <span className="text-[10px] bg-neon-yellow/10 text-neon-yellow px-1 py-0.5 rounded border border-neon-yellow/20">masked</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-slate-500">Orders</p>
                  <p className="text-white font-bold">{customer.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">LTV</p>
                  <p className="text-neon-green font-bold">${customer.ltv.toFixed(2)}</p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-slate-400 hover:text-neon-blue hover:border-neon-blue/50 transition-colors font-semibold flex items-center gap-1">
                <Eye className="w-3 h-3" /> View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DLP Notice Footer */}
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 p-4">
        <AlertTriangle className="w-3 h-3 text-neon-yellow" />
        All customer data is protected by Zero Trust Data Loss Prevention (DLP). PII is masked for Sales role.
      </div>
    </div>
  );
}
