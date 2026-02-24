// Supabase Client Configuration
// This file replaces the Express backend with direct Supabase integration

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yqoabzheqfnvyrpwzutt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_4Yd64u2Gr0y-YsyYCUpBVw_qMQguNPn'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})

export function handleSupabaseError(error) {
    console.error('Supabase Error:', error)
    if (error.message) {
        return error.message
    }
    return 'An unexpected error occurred'
}

export async function isAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
    
    return userData?.role === 'admin'
}

export async function getCurrentUserWithRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: userData } = await supabase
        .from('users')
        .select('role, name, email')
        .eq('id', user.id)
        .single()
    
    return {
        ...user,
        role: userData?.role || 'customer',
        name: userData?.name || user.email,
        email: userData?.email || user.email
    }
}

// Helper function to get current user with role
export async function getCurrentUserWithRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: userData } = await supabase
        .from('users')
        .select('role, name, email')
        .eq('id', user.id)
        .single()
    
    return {
        ...user,
        role: userData?.role || 'customer',
        name: userData?.name || user.email,
        email: userData?.email || user.email
    }
}
