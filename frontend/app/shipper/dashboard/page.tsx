"use client";

import React, { useState } from "react";
import { 
  Truck, 
  MapPin, 
  CheckCircle,
  Clock,
  Navigation
} from "lucide-react";

export default function ShipperDashboard() {
  const [deliveries, setDeliveries] = useState([
    { id: "DLV-901", address: "123 Tech Avenue, Block B, Floor 4", status: "pending", time: "" },
    { id: "DLV-902", address: "45 Cyber Street, Unit 2A", status: "pending", time: "" },
    { id: "DLV-903", address: "89 Cloud Gateway Rd", status: "delivered", time: "10:45 AM" },
  ]);

  const markDelivered = (id: string) => {
    setDeliveries(deliveries.map(d => 
      d.id === id ? { ...d, status: "delivered", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } : d
    ));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-6 h-6 text-neon-green" /> Deliveries
          </h1>
          <p className="text-slate-400 text-sm mt-1">Role Constraint: Only Route Info Provided</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {deliveries.map(delivery => (
          <div key={delivery.id} className={`bg-dark-panel border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${delivery.status === 'delivered' ? 'border-neon-green/30 opacity-70' : 'border-dark-border hover:border-slate-600'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${delivery.status === 'delivered' ? 'bg-neon-green/10 text-neon-green' : 'bg-dark-bg text-slate-400'}`}>
                {delivery.status === 'delivered' ? <CheckCircle className="w-6 h-6" /> : <PackageIcon />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">{delivery.id}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-neon-blue" />
                  {delivery.address}
                </p>
                {/* Notice the absence of customer name/phone - Zero Trust Privacy */}
                <p className="text-xs text-slate-500 mt-2 oblique uppercase tracking-widest border border-slate-700 inline-block px-1 rounded bg-dark-bg select-none">PII Omitted // No Identity Policy</p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-dark-border pt-4 sm:pt-0">
              {delivery.status === 'pending' ? (
                <>
                  <button className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-dark-bg border border-slate-700 hover:border-neon-blue text-white text-sm font-semibold rounded-lg transition-colors">
                    <Navigation className="w-4 h-4 text-neon-blue" /> Map Route
                  </button>
                  <button onClick={() => markDelivered(delivery.id)} className="flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 bg-neon-green/90 hover:bg-neon-green text-dark-bg text-sm font-bold rounded-lg transition-colors shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                    <CheckCircle className="w-4 h-4" /> Mark Delivered
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-end">
                   <span className="text-neon-green font-bold text-lg flex items-center gap-1"><CheckCircle className="w-5 h-5"/> Delivered</span>
                   <span className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {delivery.time}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );
}
