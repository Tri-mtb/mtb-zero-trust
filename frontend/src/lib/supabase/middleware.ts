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
                    keysToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    if (!user && !isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is logged in and tries to go to login page, redirect to their role-based dashboard
    if (user && isAuthRoute) {
        // Fetch user profile to get their role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'admin'
        const url = request.nextUrl.clone()

        if (role === 'sales') {
            url.pathname = '/sales/dashboard'
        } else if (role === 'shipper') {
            url.pathname = '/shipper/dashboard'
        } else {
            url.pathname = '/admin/dashboard'
        }

        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
