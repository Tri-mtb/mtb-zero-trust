"use client";

import React from "react";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  DownloadCloud, 
  Plus, 
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export default function EcommerceAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">E-commerce Management</h1>
          <p className="text-slate-400 text-sm mt-1">Full Admin Access (RBAC Evaluated: Approved)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-dark-panel border border-neon-blue/50 text-neon-blue rounded-lg text-sm hover:bg-neon-blue/10 transition-colors flex items-center gap-2 font-semibold">
            <DownloadCloud className="w-4 h-4" /> Export All Customers
          </button>
          <button className="px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Access Control Notice */}
      <div className="bg-neon-green/10 border border-neon-green/30 text-neon-green p-3 rounded-lg flex items-center gap-3 shadow-[0_0_10px_rgba(0,255,65,0.05)]">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-sm font-medium">Session Validated: Admin capabilities enabled. No immediate risks detected by the Zero Trust Gateway.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products Management */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-400" /> Products
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-white font-medium">Cyber Deck Pro v{i}</p>
                    <p className="text-xs text-slate-500">In Stock: {i * 12}</p>
                  </div>
                </div>
                <button className="text-xs text-neon-blue hover:underline">Edit</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-400" /> Orders
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-white font-mono">ORD-00{i}</p>
                  <p className="text-xs text-slate-500">Pending Shipment</p>
                </div>
                <span className="text-sm font-bold text-slate-300">${199 * i}.00</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer DB Preview */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" /> Customers Database
          </h3>
          <div className="space-y-3">
            {[
              { n: "Alice D.", e: "alice@corp.net", r: "Low Risk" },
              { n: "Bob S.", e: "b.smith@gmail.com", r: "Medium Risk" },
              { n: "Charlie P.", e: "cp_admin@test.io", r: "High Risk" }
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-white font-medium">{c.n}</p>
                  <p className="text-xs text-slate-500">{c.e}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {i === 2 && <ShieldAlert className="w-3 h-3 text-neon-red" />}
                  <span className={`${i === 2 ? "text-neon-red" : "text-slate-400"}`}>{c.r}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
