"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Navigation,
  Package,
  Search,
  Filter,
  Lock,
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type DeliveryStatus = "pending" | "in_transit" | "delivered";

export default function ShipperDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErrorMsg("No active session");
          setLoading(false);
          return;
        }
        
        const res = await fetch(`${gatewayUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        if (!res.ok) {
           const err = await res.json().catch(() => ({}));
           throw new Error(err.error || "Failed to fetch deliveries");
        }
        
        const data = await res.json();
        setDeliveries(data.map((o: any) => ({
           id: o.id,
           address: o.shipping_address || "N/A",
           // API returns any status; if it's 'processing', treat as 'pending' for Shipper UI logic
           status: o.status === "processing" ? "pending" : o.status, 
           time: o.status === "delivered" && o.updated_at ? new Date(o.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
           priority: "normal",
           distance: "Unknown"
        })));
      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveries();
  }, [gatewayUrl]);

  const updateDeliveryStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${gatewayUrl}/api/orders/${id}`, {
        method: "PATCH",
        headers: { 
           "Content-Type": "application/json",
           Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update delivery status");
      }
      
      setDeliveries(deliveries.map(d =>
        d.id === id ? { ...d, status: newStatus as DeliveryStatus, time: newStatus === "delivered" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.time } : d
      ));
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const markInTransit = (id: string) => updateDeliveryStatus(id, "in_transit");
  const markDelivered = (id: string) => updateDeliveryStatus(id, "delivered");

  const filteredDeliveries = deliveries.filter(d => {
    const matchSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === "pending").length,
    inTransit: deliveries.filter(d => d.status === "in_transit").length,
    delivered: deliveries.filter(d => d.status === "delivered").length,
  };

  const getStatusInfo = (status: DeliveryStatus) => {
    switch (status) {
      case "pending": return { label: "Pending", color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/30" };
      case "in_transit": return { label: "In Transit", color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/30" };
      case "delivered": return { label: "Delivered", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-6 h-6 text-neon-green" /> My Deliveries
          </h1>
          <p className="text-slate-400 text-sm mt-1">Route management and delivery tracking</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-dark-panel border border-dark-border rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-neon-yellow flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-slate-300 font-medium">Zero Trust Privacy Enforcement</p>
          <p className="text-xs text-slate-500 mt-1">Customer names, phone numbers, and email addresses are omitted from delivery information per the No-Identity Policy. Only shipping addresses are visible to Shipper role.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-neon-yellow">{stats.pending}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">In Transit</p>
          <p className="text-xl font-bold text-neon-blue">{stats.inTransit}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Delivered</p>
          <p className="text-xl font-bold text-neon-green">{stats.delivered}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by delivery ID or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-panel border border-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-panel border border-dark-border text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-neon-blue appearance-none min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Deliveries List */}
      {errorMsg && (
        <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red p-3 rounded-lg flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Error: {errorMsg}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
          </div>
        ) : filteredDeliveries.length > 0 ? (
          filteredDeliveries.map(delivery => {
          const statusInfo = getStatusInfo(delivery.status);
          return (
            <div key={delivery.id} className={`bg-dark-panel border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${delivery.status === 'delivered' ? 'border-neon-green/20 opacity-70' : delivery.status === 'in_transit' ? 'border-neon-blue/30' : 'border-dark-border hover:border-slate-600'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.bg}`}>
                  {delivery.status === 'delivered' ? <CheckCircle className={`w-6 h-6 ${statusInfo.color}`} /> :
                   delivery.status === 'in_transit' ? <Truck className={`w-6 h-6 ${statusInfo.color}`} /> :
                   <Package className="w-6 h-6 text-slate-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white font-mono">{delivery.id}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                    {delivery.priority === "urgent" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-red/10 text-neon-red border border-neon-red/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neon-blue" />
                    {delivery.address}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500">Distance: <span className="text-slate-300">{delivery.distance}</span></span>
                    <span className="text-xs text-slate-500 italic border border-slate-700 px-1 rounded bg-dark-bg select-none">PII Omitted // No Identity Policy</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-dark-border pt-4 sm:pt-0">
                {delivery.status === 'pending' && (
                  <>
                    <button onClick={() => markInTransit(delivery.id)} className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-sm font-semibold rounded-lg hover:bg-neon-blue hover:text-dark-bg transition-colors">
                      <Truck className="w-4 h-4" /> Start Delivery
                    </button>
                    <button className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-dark-bg border border-slate-700 hover:border-neon-blue text-white text-sm font-semibold rounded-lg transition-colors">
                      <Navigation className="w-4 h-4 text-neon-blue" /> Map Route
                    </button>
                  </>
                )}
                {delivery.status === 'in_transit' && (
                  <>
                    <button onClick={() => markDelivered(delivery.id)} className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-neon-green/90 hover:bg-neon-green text-dark-bg text-sm font-bold rounded-lg transition-colors shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                      <CheckCircle className="w-4 h-4" /> Mark Delivered
                    </button>
                    <button className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-dark-bg border border-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Navigation className="w-4 h-4 text-neon-blue" /> Navigate
                    </button>
                  </>
                )}
                {delivery.status === 'delivered' && (
                  <div className="flex flex-col items-end">
                    <span className="text-neon-green font-bold text-lg flex items-center gap-1"><CheckCircle className="w-5 h-5" /> Delivered</span>
                    <span className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {delivery.time}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-slate-500 border border-dashed border-dark-border rounded-xl">
          No deliveries found.
        </div>
      )}
      </div>
    </div>
  );
}
