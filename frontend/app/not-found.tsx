"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-7xl font-black text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-3">Truy cập bị từ chối</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Trang bạn tìm không tồn tại hoặc đã bị hạn chế bởi chính sách Zero Trust.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
