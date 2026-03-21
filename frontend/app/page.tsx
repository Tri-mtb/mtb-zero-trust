"use client";

import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Cpu, Eye, ArrowRight, Activity, Globe, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// MTB Logo Component
const MtbLogo = () => (
  <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden transform hover:scale-105 transition-transform flex-shrink-0">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2228%22%20height%3D%2249%22%20viewBox%3D%220%200%2028%2049%22%3E%3Cg%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M13.99%209.25l13%207.5v15l-13%207.5L1%2031.75v-15l12.99-7.5zM3%2017.9v12.7l10.99%206.34%2011-6.35V17.9l-11-6.34L3%2017.9zM0%2015l12.98-7.5V0h-2v6.35L0%2012.69v2.3zm0%2018.5L12.98%2041v8h-2v-6.85L0%2035.81v-2.3zM15%200v7.5L27.99%2015H28v-2.31h-.01L17%206.35V0h-2zm0%2049v-8l12.99-7.5H28v2.31h-.01L17%2042.15V49h-2z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 mix-blend-overlay"></div>
    <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-sm translate-x-2 -translate-y-2"></div>
    <span className="relative z-10 text-white font-black text-xl tracking-tighter" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
      MTB
    </span>
    <svg className="absolute bottom-0 right-0 w-4 h-4 text-white opacity-80 m-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  </div>
)

// Variants for animations
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if(el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans text-slate-800 bg-slate-50">
      {/* Background aesthetics */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-200/40 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <header className={`w-full py-4 px-6 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <MtbLogo />
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">MTB <span className="text-blue-600">TrustGuard</span></span>
          </div>
          <nav className="sm:flex gap-8 hidden text-sm font-semibold tracking-wide text-slate-600">
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors cursor-pointer">Tính năng</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition-colors cursor-pointer">Giới thiệu</button>
          </nav>
          <div className="hidden sm:flex gap-4">
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all shadow-sm">
              Đăng nhập
            </Link>
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 rounded-xl transition-all shadow-md shadow-blue-500/20">
              Dùng thử ngay
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-xl sm:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              <button
                onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Tính năng
              </button>
              <button
                onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Giới thiệu
              </button>
              <div className="border-t border-slate-100 my-2"></div>
              <Link
                href="/login"
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                href="/login"
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dùng thử ngay
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full flex flex-col items-center mt-20">
        
        {/* Banner Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-start text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                Bảo mật tuyệt đối với AI Risk Engine v2.4
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Kỷ nguyên bảo mật <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 py-2 inline-block">Zero Trust</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed max-w-2xl mb-10 font-medium">
              Kiểm soát truy cập toàn diện. Phân tích hành vi theo thời gian thực được hỗ trợ bởi Trí tuệ nhân tạo (AI), ngăn chặn rủi ro nội bộ và sự cố rò rỉ dữ liệu.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/store"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                Trải nghiệm Cửa hàng
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold text-lg transition-all flex items-center justify-center shadow-sm"
              >
                Truy cập Quản trị
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }} 
            animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative lg:h-[500px] flex justify-center items-center"
            style={{ perspective: '1000px' }}
          >
            <div className="absolute inset-0 bg-blue-200/30 blur-3xl rounded-full"></div>
            <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[450px] shadow-2xl rounded-3xl overflow-hidden border border-white/40 bg-white/50 backdrop-blur-sm transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-blue-500/20">
               <Image 
                 src="/images/hero-zero-trust.png" 
                 alt="AI Zero Trust Representation" 
                 fill
                 sizes="(max-width: 768px) 100vw, 50vw"
                 className="object-cover mix-blend-multiply opacity-90"
                 priority
               />
               <div className="absolute inset-0 border border-white/50 rounded-3xl pointer-events-none"></div>
            </div>
            
            {/* Floating widget 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-6 bottom-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
              aria-label="Trạng thái bảo vệ mạng"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600"/>
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-800">Mạng đã bảo vệ</p>
                <p className="text-emerald-600 font-medium">100% An toàn</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full bg-white py-24 border-y border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
               initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
               variants={fadeInUp}
               className="order-2 lg:order-1 relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 group"
            >
               <Image 
                 src="/images/features-dashboard.png" 
                 alt="Data Dashboard UI" 
                 fill
                 sizes="(max-width: 768px) 100vw, 50vw"
                 className="object-cover transform transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
                 <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg">
                   <p className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600"/> AI Dashboard</p>
                   <p className="text-xs text-slate-500">Giám sát rủi ro tự động theo thời gian thực</p>
                 </div>
               </div>
            </motion.div>

            <motion.div 
               initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
               variants={staggerContainer}
               className="order-1 lg:order-2"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">MTB TrustGuard hoạt động ra sao?</motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-600 mb-8 leading-relaxed text-lg">
                Trong thế giới mà các cuộc tấn công mạng ngày càng tinh vi, phòng thủ tĩnh qua IP không còn hiệu quả. <strong>MTB TrustGuard</strong> sử dụng mô hình động đánh giá ngữ cảnh bảo mật liên tục, mang đến bức tường lửa không giới hạn điểm vật lý.
              </motion.p>
              
              <ul className="space-y-6">
                <motion.li variants={fadeInUp} className="flex items-start gap-5">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 mt-1 shadow-sm border border-blue-100"><Activity className="w-6 h-6"/></div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">Giám sát Hành vi 24/7</h4>
                    <p className="text-slate-600 mt-1">Đánh giá độ rủi ro liên tục cho mọi yêu cầu, dựa trên tần suất, mô hình hành động thay vì chỉ xét duyệt đăng nhập.</p>
                  </div>
                </motion.li>
                <motion.li variants={fadeInUp} className="flex items-start gap-5">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mt-1 shadow-sm border border-indigo-100"><Globe className="w-6 h-6"/></div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">Phân tích Bối cảnh Máy học</h4>
                    <p className="text-slate-600 mt-1">Isolation Forest nhận diện tự động rủi ro địa lý, thiết bị và cấu hình hệ thống mờ (Fuzzy IP Matching).</p>
                  </div>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Tính năng Cốt lõi</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Sức mạnh công nghệ hiện đại bảo vệ tài nguyên kỹ thuật số của bạn khỏi điểm mù bảo mật.</p>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
          >
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-emerald-100">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kiểm soát Quyền động (RBAC)</h3>
              <p className="text-slate-600 leading-relaxed">Cấp quyền uyển chuyển theo chức vụ. Nếu xác định hành vi trượt quyền trái với Zero Trust Model, hệ thống sẽ ngắt kết nối.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-indigo-100">
                <Cpu className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Đánh giá Rủi ro</h3>
              <p className="text-slate-600 leading-relaxed">Sử dụng mô hình AI tập trung tại Python Backend để phát hiện hành vi điểm chuẩn dữ liệu, phân tích tốc độ gọi API.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-300 group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 border border-rose-100">
                <Eye className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bảo vệ Trích xuất (DLP)</h3>
              <p className="text-slate-600 leading-relaxed">Nhận diện các nỗ lực xâm nhập tấn công brute-force. Lập tức khóa tài nguyên khi vượt ngưỡng truy cập nghi ngờ.</p>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 text-slate-600 font-medium z-10 w-full bg-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <MtbLogo />
              <span className="font-bold text-slate-900 text-xl tracking-tight">MTB TrustGuard</span>
            </div>
            <p className="text-sm">Bảo vệ tương lai không giới hạn biên.</p>
          </div>
          <div className="text-sm flex flex-col gap-2">
            <p className="font-bold text-slate-900">Liên kết nhanh</p>
            <button onClick={() => scrollToSection('features')} className="text-left w-max hover:text-blue-600">Tính năng</button>
            <button onClick={() => scrollToSection('about')} className="text-left w-max hover:text-blue-600">Giải pháp</button>
          </div>
          <div className="text-sm flex flex-col gap-2 md:items-end">
            <p className="font-bold text-slate-900">Đồ án Công nghệ 2026</p>
            <p>© {new Date().getFullYear()} MTB Zero Trust System.</p>
            <p className="text-xs text-slate-400">All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
