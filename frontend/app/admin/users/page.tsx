"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Shield, 
  Search, 
  UserPlus, 
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Filter,
  MoreVertical,
  UserX,
  UserCheck
} from "lucide-react";

const mockSystemUsers = [
  { id: "USR-001", name: "Nguyễn Admin", email: "admin@trustguard.ai", role: "admin", status: "active", lastLogin: "2 phút trước", clearance: 3, riskScore: 5 },
  { id: "USR-002", name: "Trần Sales", email: "sales@trustguard.ai", role: "sales", status: "active", lastLogin: "15 phút trước", clearance: 2, riskScore: 12 },
  { id: "USR-003", name: "Lê Shipper", email: "shipper@trustguard.ai", role: "shipper", status: "active", lastLogin: "1 giờ trước", clearance: 1, riskScore: 8 },
  { id: "USR-004", name: "Phạm Staff", email: "staff2@trustguard.ai", role: "sales", status: "suspended", lastLogin: "3 ngày trước", clearance: 2, riskScore: 92 },
  { id: "USR-005", name: "Hồ Admin", email: "admin2@trustguard.ai", role: "admin", status: "active", lastLogin: "30 phút trước", clearance: 3, riskScore: 3 },
];

const mockCustomers = [
  { id: "CUST-001", name: "Alice Doe", email: "alice@corp.net", phone: "+84 901 234 567", address: "123 Tech Avenue, HCMC", totalOrders: 12, ltv: 2450.00 },
  { id: "CUST-002", name: "Bob Smith", email: "b.smith@gmail.com", phone: "+84 902 345 678", address: "45 Cyber Street, Hanoi", totalOrders: 5, ltv: 890.00 },
  { id: "CUST-003", name: "Charlie Pham", email: "cp_admin@test.io", phone: "+84 903 456 789", address: "89 Cloud Gateway Rd, Da Nang", totalOrders: 23, ltv: 5670.00 },
  { id: "CUST-004", name: "Diana Nguyen", email: "diana.n@outlook.com", phone: "+84 904 567 890", address: "67 Zero Trust Blvd, HCMC", totalOrders: 8, ltv: 1230.00 },
  { id: "CUST-005", name: "Ethan Tran", email: "ethan.t@company.vn", phone: "+84 905 678 901", address: "12 Secure Lane, Hanoi", totalOrders: 3, ltv: 450.00 },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"system" | "customers">("system");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = mockSystemUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
      sales: "bg-neon-blue/20 text-neon-blue border-neon-blue/50",
      shipper: "bg-neon-green/20 text-neon-green border-neon-green/50",
      customer: "bg-slate-700/50 text-slate-300 border-slate-600",
    };
    return styles[role] || styles.customer;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Users & Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Identity Management & Access Control</p>
        </div>
        <button className="px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-dark-panel border border-dark-border rounded-xl p-1">
        <button 
          onClick={() => { setActiveTab("system"); setSearchTerm(""); setRoleFilter("all"); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === "system" ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/30" : "text-slate-400 hover:text-white"}`}
        >
          <Shield className="w-4 h-4" /> System Users ({mockSystemUsers.length})
        </button>
        <button 
          onClick={() => { setActiveTab("customers"); setSearchTerm(""); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === "customers" ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/30" : "text-slate-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" /> Customers ({mockCustomers.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={activeTab === "system" ? "Search by name, email, or ID..." : "Search customers..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-panel border border-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
          />
        </div>
        {activeTab === "system" && (
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-panel border border-dark-border text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-neon-blue appearance-none min-w-[140px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
            <option value="shipper">Shipper</option>
          </select>
        )}
      </div>

      {/* System Users Tab */}
      {activeTab === "system" && (
        <div className="bg-dark-panel border border-dark-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-dark-bg text-slate-500 border-b border-dark-border">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Clearance</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Risk Score</th>
                <th className="px-5 py-4">Last Login</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${user.status === 'active' ? 'bg-slate-800 text-white' : 'bg-red-500/10 text-red-400'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(lvl => (
                        <div key={lvl} className={`w-4 h-1.5 rounded-full ${lvl <= user.clearance ? 'bg-neon-blue' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Level {user.clearance}</span>
                  </td>
                  <td className="px-5 py-4">
                    {user.status === "active" ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-red">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-red" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${user.riskScore >= 80 ? 'bg-neon-red shadow-[0_0_5px_rgba(255,0,60,0.5)]' : user.riskScore >= 40 ? 'bg-neon-yellow' : 'bg-neon-green'}`}
                          style={{ width: `${user.riskScore}%` }} 
                        />
                      </div>
                      <span className={`text-xs font-mono font-bold ${user.riskScore >= 80 ? 'text-neon-red' : user.riskScore >= 40 ? 'text-neon-yellow' : 'text-slate-400'}`}>{user.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">{user.lastLogin}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-dark-bg rounded text-slate-400 hover:text-neon-blue transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button className="p-1.5 hover:bg-neon-red/10 rounded text-slate-400 hover:text-neon-red transition-colors" title="Suspend User">
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-1.5 hover:bg-neon-green/10 rounded text-slate-400 hover:text-neon-green transition-colors" title="Reactivate User">
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-dark-panel border border-dark-border rounded-xl p-5 hover:border-neon-blue/30 transition-colors group">
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
                <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Orders</p>
                    <p className="text-white font-bold">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">LTV</p>
                    <p className="text-neon-green font-bold">${customer.ltv.toFixed(2)}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-slate-400 hover:text-neon-blue hover:border-neon-blue/50 transition-colors font-semibold">
                  View Orders
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
