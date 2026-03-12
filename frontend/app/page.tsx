import Link from 'next/link'
import { Shield, Lock, Cpu, Eye } from 'lucide-react'

export const metadata = {
  title: 'TrustGuard AI | Zero Trust System',
  description: 'Nền tảng bảo mật Zero Trust thế hệ mới, được hỗ trợ bởi AI.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 relative overflow-hidden font-sans text-slate-300">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full point-events-none z-0"></div>

      <header className="w-full max-w-7xl mx-auto py-6 px-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-wide">TrustGuard <span className="text-blue-500">AI</span></span>
        </div>
        <nav className="sm:flex gap-8 hidden text-sm font-semibold tracking-wide text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
        </nav>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        {/* Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-cyan-400 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Protected by AI Risk Engine v2.4
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Security redefined with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 py-2 inline-block">Zero Trust Architecture</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mb-12 font-medium">
          Advanced authentication and access management system. Prevent threats with AI Analysis Metrics and real-time risk control.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 mb-24 justify-center w-full max-w-md mx-auto sm:max-w-none">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_4px_20px_rgba(46,144,250,0.4)] flex items-center justify-center gap-2"
          >
            System Login
            <span className="ml-1">→</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-500 font-bold text-lg transition-all flex items-center justify-center shadow-lg"
          >
            Terminal Dashboard
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors shadow-sm">
            <Shield className="w-10 h-10 text-blue-500 mb-5" />
            <h3 className="text-xl font-bold text-white mb-3">MFA Verification</h3>
            <p className="text-slate-400 text-sm leading-relaxed">The system requires strict multi-factor verification, ensuring every access is accurately monitored and authorized.</p>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-cyan-400/50 transition-colors shadow-sm">
            <Cpu className="w-10 h-10 text-cyan-400 mb-5" />
            <h3 className="text-xl font-bold text-white mb-3">AI Risk Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Integrates artificial intelligence to recognize and measure risk levels (AI Anomaly Score) in real-time.</p>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-red-500/50 transition-colors shadow-sm">
            <Eye className="w-10 h-10 text-red-500 mb-5" />
            <h3 className="text-xl font-bold text-white mb-3">Restricted Access</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Detects abnormal access and automatically triggers the Restricted Access Protocol to immediately lock down resources.</p>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t border-slate-800/50 text-sm text-slate-500 font-medium z-10 text-center w-full">
        TrustGuard AI x Zero Trust Architecture • {new Date().getFullYear()}
      </footer>
    </div>
  )
}
