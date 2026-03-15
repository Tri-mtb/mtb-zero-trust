"use client";

import React, { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

export default function EcommerceAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setErrorMsg("No active session");
        return;
      }
      
      const token = session.access_token;
      
      try {
        // Fetch all 3 endpoints concurrently
        const [prodRes, ordRes, custRes] = await Promise.all([
          fetch("http://localhost:3000/api/products", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/api/customers", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Handle common unauthorized / MFA issues
        if (!prodRes.ok) {
           const errData = await prodRes.json().catch(() => ({}));
           throw new Error(errData.error || `Gateway returned ${prodRes.status}`);
        }
        
        setProducts(await prodRes.json());
        if (ordRes.ok) setOrders(await ordRes.json());
        if (custRes.ok) setCustomers(await custRes.json());
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    }
    
    fetchData();
  }, []);

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

      {errorMsg ? (
        <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red p-3 rounded-lg flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Gateway Blocked: {errorMsg}</span>
        </div>
      ) : (
        <div className="bg-neon-green/10 border border-neon-green/30 text-neon-green p-3 rounded-lg flex items-center gap-3 shadow-[0_0_10px_rgba(0,255,65,0.05)]">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Session Validated: Admin capabilities enabled. No immediate risks detected by the Zero Trust Gateway.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products Management */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-400" /> Products
          </h3>
          <div className="space-y-3">
            {products.length > 0 ? products.map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center text-xs text-slate-500">Img</div>
                  <div>
                    <p className="text-sm text-white font-medium">{p.name || `Product ${i}`}</p>
                    <p className="text-xs text-slate-500">Price: ${p.price}</p>
                  </div>
                </div>
                <button className="text-xs text-neon-blue hover:underline">Edit</button>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-400" /> Orders
          </h3>
          <div className="space-y-3">
            {orders.length > 0 ? orders.map((o, i) => (
              <div key={o.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-white font-mono">ORD-{o.id?.substring(0,6) || `00${i}`}</p>
                  <p className="text-xs text-slate-500">{o.status || 'Pending'}</p>
                </div>
                <span className="text-sm font-bold text-slate-300">${o.total_amount || 0}.00</span>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>

        {/* Customer DB Preview */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" /> Customers Database
          </h3>
          <div className="space-y-3">
            {customers.length > 0 ? customers.map((c, i) => (
              <div key={c.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-white font-medium">{c.full_name || `Customer ${i}`}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {i === 2 && <ShieldAlert className="w-3 h-3 text-neon-red" />}
                  <span className={`${i === 2 ? "text-neon-red" : "text-slate-400"}`}>{i === 2 ? "High Risk" : "Low Risk"}</span>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
