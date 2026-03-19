'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    const userRole = profile?.role || 'customer'

    revalidatePath('/', 'layout')

    // Redirect based on role
    if (userRole === 'admin') {
        redirect('/admin/dashboard')
    } else if (userRole === 'sales') {
        redirect('/sales/dashboard')
    } else if (userRole === 'shipper') {
        redirect('/shipper/dashboard')
    } else {
        // Default for customer or unknown roles
        redirect('/store')
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'customer'

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role,
                full_name: email.split('@')[0]
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')

    // Redirect based on role after signup
    if (role === 'admin') {
        redirect('/admin/dashboard')
    } else if (role === 'sales') {
        redirect('/sales/dashboard')
    } else if (role === 'shipper') {
        redirect('/shipper/dashboard')
    } else {
        redirect('/store')
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
