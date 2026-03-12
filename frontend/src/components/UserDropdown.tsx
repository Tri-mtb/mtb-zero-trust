'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, Moon, Globe, User } from 'lucide-react';
import { logout } from '@/app/login/actions';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Xử lý click ra ngoài để đóng menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 border border-slate-700 shadow-sm hover:border-blue-500 hover:text-white transition-all cursor-pointer"
            >
                <User className="w-5 h-5" />
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-700 py-1 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-800 mb-1 bg-slate-800/50 rounded-t-xl">
                        <p className="text-sm font-bold text-slate-200">System Admin</p>
                        <p className="text-xs text-cyan-400 font-medium mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                            Secure Connection
                        </p>
                    </div>

                    <div className="py-1 px-2 space-y-0.5">
                        <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Security Settings</span>
                        </button>
                        <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                            <Moon className="w-4 h-4 text-slate-400" />
                            <span>Dark Display</span>
                        </button>
                        <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <span>Language (ENG)</span>
                        </button>
                    </div>

                    <div className="px-2 pb-2 pt-2 border-t border-slate-800 mt-1">
                        <form action={logout}>
                            <button type="submit" className="w-full text-left px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg flex items-center gap-3 transition-colors">
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Session</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
