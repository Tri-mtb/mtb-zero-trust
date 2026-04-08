import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(keysToSet) {
                    keysToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    keysToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const unprotectedRoutes = ['/', '/login', '/signup', '/auth/callback']
    const isAuthRoute = unprotectedRoutes.includes(request.nextUrl.pathname)
    const isLoginSignup = ['/login', '/signup'].includes(request.nextUrl.pathname)

    function redirectWithCookies(url: URL) {
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
            response.cookies.set(cookie.name, cookie.value)
        })
        return response
    }

    if (!user && !isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return redirectWithCookies(url)
    }

    // If user is logged in and tries to go to login page, redirect to their role-based dashboard
    if (user && isLoginSignup) {
        // Fetch user profile to get their role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || user.user_metadata?.role || 'customer'
        const url = request.nextUrl.clone()

        if (role === 'sales') {
            url.pathname = '/sales/dashboard'
        } else if (role === 'shipper') {
            url.pathname = '/shipper/dashboard'
        } else if (role === 'admin') {
            url.pathname = '/admin/dashboard'
        } else {
            // Default customer / user role
            url.pathname = '/store'
        }

        return redirectWithCookies(url)
    }

    // Role-based Access Control (RBAC) for protected routes
    if (user && !isAuthRoute) {
        const pathname = request.nextUrl.pathname;
        if (pathname.startsWith('/admin') || pathname.startsWith('/sales') || pathname.startsWith('/shipper') || pathname.startsWith('/store')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role || user.user_metadata?.role || 'customer'
            
            // Allow admin to access everything for convenience, or restrict strictly?
            // Strict restriction as requested in Zero Trust!
            if (pathname.startsWith('/admin') && role !== 'admin') {
                const url = request.nextUrl.clone();
                url.pathname = role === 'customer' ? '/store' : `/${role}/dashboard`;
                return redirectWithCookies(url);
            }
            if (pathname.startsWith('/sales') && role !== 'sales' && role !== 'admin') {
                const url = request.nextUrl.clone();
                url.pathname = role === 'customer' ? '/store' : `/${role}/dashboard`;
                return redirectWithCookies(url);
            }
            if (pathname.startsWith('/shipper') && role !== 'shipper' && role !== 'admin') {
                const url = request.nextUrl.clone();
                url.pathname = role === 'customer' ? '/store' : `/${role}/dashboard`;
                return redirectWithCookies(url);
            }
        }
    }

    return supabaseResponse
}
