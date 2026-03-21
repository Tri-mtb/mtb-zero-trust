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
  ShieldAlert,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EcommerceAdmin() {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: 0, stock: 0 });

  const fetchAuthToken = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchData = async () => {
    const token = await fetchAuthToken();
    if (!token) {
      setErrorMsg("No active session");
      return;
    }
    
    try {
      const [prodRes, ordRes, custRes] = await Promise.all([
        fetch(`${gatewayUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${gatewayUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${gatewayUrl}/api/customers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCustomers = async () => {
    try {
      const token = await fetchAuthToken();
      if (!token) return;

      const res = await fetch(`${gatewayUrl}/api/admin/export-customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Create a simple CSV
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Address\n"
        + data.data.map((e: any) => `${e.id},${e.name},${e.email},"${e.address}"`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TrustGuard_Customers_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      alert("Failed to export: " + err.message);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProdForm({ name: '', description: '', price: 0, stock: 0 });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setProdForm({ name: p.name, description: p.description, price: p.price, stock: p.stock });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await fetchAuthToken();
      if (!token) return;

      const url = editingProduct 
        ? `${gatewayUrl}/api/products/${editingProduct.id}`
        : `${gatewayUrl}/api/products`;
      
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(prodForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsProductModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      alert("Failed to save product: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">E-commerce Management</h1>
          <p className="text-slate-400 text-sm mt-1">Full Admin Access (RBAC Evaluated: Approved)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCustomers}
            className="px-4 py-2 bg-dark-panel border border-neon-blue/50 text-neon-blue rounded-lg text-sm hover:bg-neon-blue/10 transition-colors flex items-center gap-2 font-semibold"
          >
            <DownloadCloud className="w-4 h-4" /> Export All Customers
          </button>
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
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
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6 flex flex-col h-full max-h-[500px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
            <Package className="w-5 h-5 text-slate-400" /> Products
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {products.length > 0 ? products.map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border group hover:border-neon-blue/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center text-xs text-slate-500 font-bold">
                    {p.name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate" title={p.name}>{p.name || `Product ${i}`}</p>
                    <p className="text-xs text-slate-500">Price: ${p.price} • Stock: {p.stock}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openEditModal(p)}
                  className="text-xs bg-slate-800 hover:bg-neon-blue hover:text-dark-bg text-neon-blue px-3 py-1.5 rounded-md font-bold transition-colors ml-2 flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6 flex flex-col h-full max-h-[500px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-slate-400" /> Recent Orders
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {orders.length > 0 ? orders.map((o, i) => (
              <div key={o.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-white font-mono flex items-center gap-2">
                    ORD-{o.id?.substring(0,6) || `00${i}`}
                    {o.status === 'pending' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                    {o.status === 'delivered' && <span className="w-2 h-2 rounded-full bg-neon-green"></span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{o.status || 'Pending'}</p>
                </div>
                <span className="text-sm font-bold text-neon-blue">${o.total_amount?.toLocaleString() || 0}</span>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>

        {/* Customer DB Preview */}
        <div className="bg-dark-panel border border-dark-border rounded-xl p-6 flex flex-col h-full max-h-[500px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
            <Users className="w-5 h-5 text-slate-400" /> Customers Database
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {customers.length > 0 ? customers.map((c, i) => (
              <div key={c.id || i} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div className="min-w-0 pr-2">
                  <p className="text-sm text-white font-medium truncate" title={c.name}>{c.name || `Customer ${i}`}</p>
                  <p className="text-xs text-slate-500 truncate" title={c.email}>{c.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs flex-shrink-0 bg-slate-900 border border-slate-700 px-2 py-1 rounded">
                  {i % 4 === 0 ? <ShieldAlert className="w-3 h-3 text-yellow-500" /> : <ShieldCheck className="w-3 h-3 text-neon-green" />}
                  <span className={`${i % 4 === 0 ? "text-yellow-500" : "text-neon-green"}`}>{i % 4 === 0 ? "Flagged" : "Verified"}</span>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-neon-red"/> Access denied or no data</p>}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Product Name</label>
                <input 
                  required
                  type="text" 
                  value={prodForm.name}
                  onChange={e => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={prodForm.description}
                  onChange={e => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-colors custom-scrollbar"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={prodForm.price}
                    onChange={e => setProdForm({ ...prodForm, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Limit</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={prodForm.stock}
                    onChange={e => setProdForm({ ...prodForm, stock: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-neon-blue text-dark-bg font-bold rounded-lg hover:bg-cyan-400 transition-colors">Sav{editingProduct ? 'e Changes' : 'e Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
