"use client";

import React, { useState } from "react";
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

const mockOrders = [
  { id: "ORD-801", customer: "Alice D.", items: 3, total: 450.00, status: "processing", date: "2026-03-12", address: "123 Tech Ave, HCMC" },
  { id: "ORD-802", customer: "Bob S.", items: 1, total: 199.00, status: "pending", date: "2026-03-12", address: "45 Cyber St, Hanoi" },
  { id: "ORD-803", customer: "Charlie P.", items: 5, total: 1250.00, status: "shipped", date: "2026-03-11", address: "89 Cloud Rd, Da Nang" },
  { id: "ORD-804", customer: "Diana N.", items: 2, total: 380.00, status: "delivered", date: "2026-03-10", address: "67 ZT Blvd, HCMC" },
  { id: "ORD-805", customer: "Ethan T.", items: 4, total: 720.00, status: "processing", date: "2026-03-12", address: "12 Secure Lane, Hanoi" },
  { id: "ORD-806", customer: "Fiona L.", items: 1, total: 89.00, status: "cancelled", date: "2026-03-09", address: "34 Gateway Ave, HCMC" },
  { id: "ORD-807", customer: "George H.", items: 2, total: 540.00, status: "pending", date: "2026-03-12", address: "56 Shield Rd, Da Nang" },
  { id: "ORD-808", customer: "Hannah K.", items: 3, total: 890.00, status: "shipped", date: "2026-03-11", address: "78 Trust St, Hanoi" },
];

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const filteredOrders = mockOrders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
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
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === "pending").length,
    processing: mockOrders.filter(o => o.status === "processing").length,
    shipped: mockOrders.filter(o => o.status === "shipped").length,
    revenue: mockOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
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

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const statusStyle = getStatusStyle(order.status);
          const StatusIcon = statusStyle.icon;
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-dark-panel border border-dark-border rounded-xl p-5 hover:border-neon-purple/30 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusStyle.bg} border ${statusStyle.border}`}>
                    <StatusIcon className={`w-5 h-5 ${statusStyle.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold font-mono">{order.id}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: <span className="text-slate-300">{order.customer}</span> • {order.items} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <p className="text-lg font-bold text-white">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{order.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon-purple transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
                <p className="text-sm text-white font-medium">{selectedOrder.customer}</p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="text-xs text-slate-500 mb-1">Shipping Address</p>
                <p className="text-sm text-white">{selectedOrder.address}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Items</p>
                  <p className="text-lg font-bold text-white">{selectedOrder.items}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-bold text-neon-green">${selectedOrder.total.toFixed(2)}</p>
                </div>
                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-bold capitalize ${getStatusStyle(selectedOrder.status).color}`}>{selectedOrder.status}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedOrder.status === "pending" && (
                <button className="flex-1 py-2.5 text-sm font-semibold bg-neon-blue text-dark-bg rounded-lg hover:bg-cyan-400 transition-colors">
                  Process Order
                </button>
              )}
              {selectedOrder.status === "processing" && (
                <button className="flex-1 py-2.5 text-sm font-semibold bg-neon-purple text-white rounded-lg hover:bg-purple-500 transition-colors">
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
