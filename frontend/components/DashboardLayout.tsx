"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  Activity, 
  Users, 
  ShoppingCart, 
  Box, 
  FileText, 
  Cpu, 
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  ShieldAlert,
  Truck,
  Search,
  Package
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ 
  children, 
  role = "admin" 
}: { 
  children: React.ReactNode, 
  role?: "admin" | "sales" | "shipper" 
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || role;
        setUserName(name);
      }
    };
    fetchUser();
  }, [role]);

  // Menu items per role
  let actMenuItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [];

  if (role === "admin") {
    actMenuItems = [
      { href: "/admin/dashboard", label: "Security Overview", icon: Activity },
      { href: "/admin/mfa", label: "MFA Verification", icon: ShieldAlert },
      { href: "/admin/ecommerce", label: "E-Commerce Ops", icon: ShoppingCart },
      { href: "/admin/users", label: "Users & Customers", icon: Users },
      { href: "/admin/threat-detection", label: "AI Threat Detection", icon: Cpu, badge: "AI" },
      { href: "/admin/logs", label: "Security Logs", icon: FileText },
      { href: "/architecture", label: "Architecture", icon: Box },
      { href: "/admin/settings", label: "System Settings", icon: Settings },
    ];
  } else if (role === "sales") {
    actMenuItems = [
      { href: "/sales/dashboard", label: "Sales Dashboard", icon: Activity },
      { href: "/sales/orders", label: "Manage Orders", icon: ShoppingCart },
      { href: "/sales/customers", label: "Customer Lookups", icon: Users },
      { href: "/architecture", label: "Architecture Demo", icon: Box },
    ];
  } else if (role === "shipper") {
    actMenuItems = [
      { href: "/shipper/dashboard", label: "Delivery Dashboard", icon: Activity },
      { href: "/shipper/deliveries", label: "My Deliveries", icon: Package },
    ];
  }

  const roleLabel = role === "admin" ? "Administrator" : role === "sales" ? "Sales Staff" : "Shipper";
  const roleColor = role === "admin" ? "text-neon-purple" : role === "sales" ? "text-neon-blue" : "text-neon-green";

  return (
    <div className="flex h-screen bg-dark-bg text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-dark-panel border-r border-dark-border flex flex-col z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
          <Link href={`/${role}/dashboard`} className={`flex items-center gap-2 ${!isSidebarOpen && "justify-center w-full"}`}>
            <Shield className="w-8 h-8 text-neon-blue" />
            {isSidebarOpen && <span className="font-bold text-white tracking-wide">TrustGuard AI</span>}
          </Link>
        </div>

        {/* Role Badge */}
        {isSidebarOpen && (
          <div className="px-4 py-3 border-b border-dark-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <div>
                <p className={`text-xs font-bold ${roleColor} uppercase tracking-wider`}>{roleLabel}</p>
                <p className="text-[10px] text-slate-500">Zero Trust Session Active</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 py-4 overflow-y-auto w-full">
          <div className="px-3 space-y-1">
            {isSidebarOpen && (
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            )}
            {actMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive ? "bg-neon-blue/10 text-neon-blue" : "hover:bg-dark-bg text-slate-400 hover:text-white"
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-neon-blue" : "text-slate-500 group-hover:text-neon-blue"}`} />
                  {isSidebarOpen && (
                    <span className="flex-1 flex items-center justify-between font-medium text-sm">
                      {item.label}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-dark-border">
          <form action={logout}>
            <button 
              type="submit"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-neon-red hover:bg-neon-red/10 transition-colors w-full ${!isSidebarOpen && "justify-center"}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-dark-panel/80 backdrop-blur-md border-b border-dark-border flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb / Path */}
            <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
              <span className="capitalize">{role}</span>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-white capitalize">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Security Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-semibold shadow-[0_0_10px_rgba(0,255,65,0.1)]">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
              Gateway: Active
            </div>

            {/* Notification Alert Simulation */}
            {role === "admin" && (
              <button 
                onClick={() => setShowAlertModal(!showAlertModal)}
                className="relative text-slate-400 hover:text-neon-yellow transition-colors"
                title="View Latest Alerts"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-red rounded-full border-2 border-dark-panel animate-bounce"></span>
              </button>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-2 cursor-pointer" title={userName}>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400 hover:border-neon-blue transition-colors">
                {userName ? userName.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block text-sm text-slate-400 font-medium max-w-[120px] truncate">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-dark-bg relative">
          <div className="p-6 h-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Floating AI Notification Modal Demo */}
        {showAlertModal && (
          <div className="absolute top-20 right-6 w-96 bg-dark-panel border border-neon-red/50 rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-neon-red font-bold">
                <ShieldAlert className="w-5 h-5" />
                <span>Security Event Alert</span>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-white font-medium mb-1">Access Blocked due to Suspicious Activity</p>
              <div className="text-sm font-mono text-slate-400 space-y-1 mt-2">
                <p>User ID: <span className="text-white">staff_092 (Sales)</span></p>
                <p>IP Address: <span className="text-white">192.168.4.15</span></p>
                <p>Login Time: <span className="text-white">02:14 AM (Unusual)</span></p>
                <p>Risk Score: <span className="text-neon-red font-bold">92/100 (Critical)</span></p>
                <p className="text-neon-yellow mt-2 block">Reason: Abnormal request frequency & unusual geolocation</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/admin/logs" onClick={() => setShowAlertModal(false)} className="flex-1 py-1.5 text-xs font-semibold bg-dark-bg border border-dark-border text-slate-300 hover:text-white rounded hover:border-neon-blue transition-colors text-center">Investigate Logs</Link>
              <button className="flex-1 py-1.5 text-xs font-semibold bg-neon-red/20 text-neon-red border border-neon-red/50 hover:bg-neon-red hover:text-white rounded transition-colors">Permanently Block</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
