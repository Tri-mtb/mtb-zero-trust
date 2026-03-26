"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Eye,
  Clock,
  Package,
  CheckCircle,
  Truck,
  AlertTriangle,
  Lock,
  Filter,
  ChevronRight
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

        if (!ordRes.ok) {
           const errData = await ordRes.json().catch(() => ({}));
           throw new Error(errData.error || `Gateway Error ${ordRes.status}`);
        }

        const ordData = await ordRes.json();
        setOrders(ordData);

        if (custRes.ok) {
           const custData = await custRes.json();
           const cMap: Record<string, string> = {};
           custData.forEach((c: any) => { cMap[c.id] = c.name });
           setCustomersMap(cMap);
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [gatewayUrl]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${gatewayUrl}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update status");
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e: any) {
      alert("Error updating order: " + e.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = customersMap[order.customer_id] || order.customer_id || "";
    const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/30", icon: Clock };
      case "processing": return { color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/30", icon: Package };
      case "shipped": return { color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/30", icon: Truck };
      case "delivered": return { color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/30", icon: CheckCircle };
      case "cancelled": return { color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/30", icon: AlertTriangle };
      default: return { color: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700", icon: Package };
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    revenue: orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-neon-purple" /> Manage Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">View and process orders assigned to your region</p>
        </div>
      </div>

      {/* Restriction Notice */}
      <div className="bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow p-3 rounded-lg flex items-center gap-3 shadow-[0_0_10px_rgba(255,232,0,0.05)]">
        <Lock className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">Zero Trust Policy: Export and bulk operations are restricted for Sales role.</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Orders</p>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-neon-yellow">{stats.pending}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Processing</p>
          <p className="text-xl font-bold text-neon-blue">{stats.processing}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Shipped</p>
          <p className="text-xl font-bold text-neon-purple">{stats.shipped}</p>
        </div>
        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Revenue</p>
          <p className="text-xl font-bold text-neon-green">${stats.revenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
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
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red p-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Error: {errorMsg}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {filteredOrders.length > 0 ? filteredOrders.map(order => {
            const statusStyle = getStatusStyle(order.status);
            const StatusIcon = statusStyle.icon;
            const customerName = customersMap[order.customer_id] || order.customer_id;
            const itemsCount = order.order_items?.length || 0;
            
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-dark-panel border border-dark-border rounded-xl p-5 hover:border-neon-purple/30 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusStyle.bg} border ${statusStyle.border} flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${statusStyle.color}`} />
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold font-mono truncate max-w-[120px]" title={order.id}>{order.id}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} flex-shrink-0`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]" title={customerName}>
                        Customer: <span className="text-slate-300">{customerName}</span> • {itemsCount} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:text-right flex-shrink-0">
                    <div>
                      <p className="text-lg font-bold text-white">${(order.total_amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon-purple transition-colors" />
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-dark-border rounded-xl">
              No orders found.
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Order {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="text-sm text-white font-medium">{customersMap[selectedOrder.customer_id] || selectedOrder.customer_id}</p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Shipping Address</p>
                <p className="text-sm text-white">{selectedOrder.shipping_address}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Items</p>
                  <p className="text-lg font-bold text-white">{selectedOrder.order_items?.length || 0}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-bold text-neon-green">${(selectedOrder.total_amount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-bold capitalize ${getStatusStyle(selectedOrder.status).color}`}>{selectedOrder.status}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedOrder.status === "pending" && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, "processing")} className="flex-1 py-2.5 text-sm font-semibold bg-neon-blue text-dark-bg rounded-lg hover:bg-cyan-400 transition-colors">
                  Process Order
                </button>
              )}
              {selectedOrder.status === "processing" && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, "shipped")} className="flex-1 py-2.5 text-sm font-semibold bg-neon-purple text-white rounded-lg hover:bg-purple-500 transition-colors">
                  Mark Shipped
                </button>
              )}
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 text-sm font-semibold bg-dark-bg border border-dark-border text-slate-300 rounded-lg hover:text-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
