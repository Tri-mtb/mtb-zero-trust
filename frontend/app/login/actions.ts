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

    const userRole = profile?.role || data.user.user_metadata?.role || 'customer'

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
    

    // SECURITY: Server-side validation — prevent role injection
    // Only non-privileged roles are allowed via self-registration
    const role = 'customer'

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

    redirect('/store')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
