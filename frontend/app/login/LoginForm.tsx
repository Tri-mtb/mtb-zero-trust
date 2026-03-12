'use client'

import { useState, useTransition } from 'react'
import { login, signup } from './actions'
import { Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react'

export default function LoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const response = mode === 'login' ? await login(formData) : await signup(formData)
            if (response?.error) {
                setError(response.error)
            }
        })
    }

    return (
        <div className="w-full relative">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`text-sm font-bold tracking-wide transition-colors ${mode === 'login' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    SIGN IN
                </button>
                <div
                    className="w-10 h-5 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700"
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300 ${mode === 'login' ? 'left-1 bg-blue-500' : 'left-5 bg-slate-400'}`} />
                </div>
                <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`text-sm font-bold tracking-wide transition-colors ${mode === 'signup' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    REGISTER
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/20 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                        />
                    </div>
                )}
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Email Address"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                    />
                </div>

                {mode === 'signup' && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                        />
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                    />
                </div>

                {mode === 'signup' && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <ShieldCheck className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                        />
                    </div>
                )}

                {mode === 'signup' && (
                    <div className="pt-1">
                        <select
                            id="role"
                            name="role"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium appearance-none"
                        >
                            <option value="customer">Role: Customer</option>
                            <option value="sales">Role: Sales representative</option>
                            <option value="shipper">Role: Logistics (Shipper)</option>
                            <option value="admin">Role: Administrator</option>
                        </select>
                    </div>
                )}

                {mode === 'login' && (
                    <div className="flex items-center justify-between text-sm mt-3 mb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                            <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                            Remember Me
                        </label>
                        <a href="#" className="font-semibold text-blue-500 hover:text-blue-400">Forgot Password?</a>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-500 focus:outline-none transition-all duration-300 shadow-[0_4px_14px_rgba(46,144,250,0.39)] disabled:opacity-50 mt-6 tracking-wider text-sm flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
                            <span className="font-normal text-lg leading-none mb-[2px]">→</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
