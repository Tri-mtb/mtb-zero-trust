"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Search, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  FileX
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SalesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErrorMsg("No active session");
          setLoading(false);
          return;
        }

        const [ordRes, custRes] = await Promise.all([
           fetch(`${gatewayUrl}/api/orders`, { headers: { Authorization: `Bearer ${session.access_token}` } }),
           fetch(`${gatewayUrl}/api/customers`, { headers: { Authorization: `Bearer ${session.access_token}` } })
        ]);

        if (ordRes.ok) setOrders(await ordRes.json());
        if (custRes.ok) setCustomers(await custRes.json());
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [gatewayUrl]);

  const searchedCustomer = searchTerm.length >= 3 
    ? customers.find(c => 
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Sales Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Order management and customer lookup</p>
        </div>
      </div>

      {/* Restricted Access Indicator */}
      <div className="bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow p-4 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(255,232,0,0.1)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 pt-6 pb-0 opacity-10 bg-gradient-to-l from-neon-yellow to-transparent rotate-45 transform translate-x-4 -translate-y-4 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Lock className="w-24 h-24" />
        </div>
        <Lock className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold tracking-wide">Restricted by Zero Trust Policy</h3>
          <p className="text-sm opacity-80 mt-1 max-w-2xl">
            You are operating in a Least-Privilege Environment Context. Access to full customer databases and raw export functionalities has been disabled based on your current role mapping [<code>Role: Sales</code>].
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Lookup Tool */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-neon-blue" /> Customer Lookup
              </h3>
              <p className="text-xs text-slate-500">Query individual customers. Bulk access disabled.</p>
            </div>
            {/* Export Blocked UI Component */}
            <button disabled className="px-3 py-1.5 flex items-center gap-1.5 bg-dark-bg border border-slate-700 text-slate-600 rounded text-xs cursor-not-allowed" title="Action prevented by ZTA Policy">
              <FileX className="w-3.5 h-3.5" /> Export Data (ZTA Block)
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Enter customer email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
            />
          </div>

          {searchTerm.length >= 3 ? (
            searchedCustomer ? (
              <div className="p-4 bg-dark-bg border border-dark-border rounded-lg relative">
                <div className="flex justify-between items-center border-b border-dark-border pb-3 mb-3">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-white truncate text-sm">{searchedCustomer.name}</h4>
                    <span className="text-xs font-mono text-slate-400 truncate block mt-0.5">UID: {searchedCustomer.id}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 flex-shrink-0">Active Account</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between text-slate-400 items-center gap-2">Email: <span className="text-white truncate font-mono text-xs">{
                      searchedCustomer.email?.split("@").length === 2 
                        ? `${searchedCustomer.email.split("@")[0].substring(0, 2)}***@${searchedCustomer.email.split("@")[1]}` 
                        : "N/A"
                    }</span></p>
                  <p className="flex justify-between text-slate-400 items-center gap-2">Phone: <span className="text-white font-mono text-xs">***-***-****</span></p>
                  <p className="flex justify-between text-slate-400 items-start gap-2">Address: <span className="text-white truncate text-xs text-right max-w-[150px]" title={searchedCustomer.address}>{searchedCustomer.address || "N/A"}</span></p>
                </div>
                <div className="mt-4 pt-3 border-t border-dark-border/50 text-xs text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-neon-yellow flex-shrink-0" /> PII masked via Data Loss Prevention policy.
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-dark-border rounded-lg bg-dark-bg/50">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No customer found for `{searchTerm}`.</p>
              </div>
            )
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-dark-border rounded-lg bg-dark-bg/50">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Type at least 3 characters for strict entity lookup.</p>
            </div>
          )}
        </div>

        {/* Assigned Orders */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <ShoppingCart className="w-5 h-5 text-neon-purple" /> Active Orders
              </h3>
              <p className="text-xs text-slate-500">Orders mapped to your sales region</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-neon-red/10 border border-neon-red/30 text-neon-red p-3 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Error: {errorMsg}</span>
            </div>
          )}
          <div className="space-y-3">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading orders...</div>
            ) : orders.length > 0 ? orders.slice(0, 5).map((order) => {
              const itemsCount = order.order_items?.length || 0;
              return (
                <div key={order.id} className="flex justify-between items-center p-3 bg-dark-bg border border-dark-border rounded-lg hover:border-neon-purple/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-2 h-8 rounded-full bg-neon-purple/50 group-hover:bg-neon-purple transition-colors flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white font-mono truncate" title={order.id}>{order.id}</p>
                      <p className={`text-xs capitalize flex items-center gap-1 mt-0.5 ${
                        order.status === 'delivered' ? 'text-neon-green' : 
                        order.status === 'processing' ? 'text-neon-blue' :
                        order.status === 'cancelled' ? 'text-neon-red' :
                        'text-neon-yellow'
                      }`}>
                        {order.status}
                        {order.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow animate-pulse ml-1"></span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">${(order.total_amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{itemsCount} items</p>
                  </div>
                </div>
              );
            }) : <div className="p-4 text-center text-slate-500">No active orders found.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
