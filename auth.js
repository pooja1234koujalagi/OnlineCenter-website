// Authentication Module for Supabase
// Handles login, register, logout, and session management

import { supabase, handleSupabaseError } from './supabaseClient.js'

class AuthManager {
    constructor() {
        this.currentUser = null
        this.init()
    }

    async init() {
        // Check for existing session on page load
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            this.currentUser = await this.getUserWithRole(session.user)
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = await this.getUserWithRole(session.user)
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null
            }
        })
    }

    async getUserWithRole(authUser) {
        try {
            const { data: userData, error } = await supabase
                .from('users')
                .select('role, name, email')
                .eq('id', authUser.id)
                .single()

            if (error) throw error

            return {
                id: authUser.id,
                email: authUser.email,
                name: userData?.name || authUser.email,
                role: userData?.role || 'customer'
            }
        } catch (error) {
            console.error('Error fetching user role:', error)
            return {
                id: authUser.id,
                email: authUser.email,
                name: authUser.email,
                role: 'customer'
            }
        }
    }

    async register(name, email, password, mobile = null) {
        try {
            // Validate input
            if (!name || !email || !password) {
                throw new Error('All fields are required')
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters')
            }

            // Check if email already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single()

            if (existingUser) {
                throw new Error('Email already registered')
            }

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        mobile
                    }
                }
            })

            if (authError) throw authError

            // Create user record in users table
            if (authData.user) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        name,
                        email,
                        mobile,
                        role: 'customer'
                    }])

                if (insertError) throw insertError
            }

            return { success: true, message: 'Registration successful! Please check your email to verify your account.' }
        } catch (error) {
            return { success: false, message: handleSupabaseError(error) }
        }
    }

    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required')
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            if (data.user) {
                this.currentUser = await this.getUserWithRole(data.user)
            }

            return { 
                success: true, 
                message: 'Login successful',
                user: this.currentUser
            }
        } catch (error) {
            return { success: false, message: handleSupabaseError(error) }
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            
            this.currentUser = null
            return { success: true, message: 'Logged out successfully' }
        } catch (error) {
            return { success: false, message: handleSupabaseError(error) }
        }
    }

    async getCurrentUser() {
        if (this.currentUser) return this.currentUser

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                this.currentUser = await this.getUserWithRole(user)
            }
            return this.currentUser
        } catch (error) {
            console.error('Error getting current user:', error)
            return null
        }
    }

    async isAdmin() {
        const user = await this.getCurrentUser()
        return user?.role === 'admin'
    }

    // Password reset functionality
    async requestPasswordReset(email) {
        try {
            if (!email) {
                throw new Error('Email is required')
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            })

            if (error) throw error

            return { success: true, message: 'Password reset link sent to your email' }
        } catch (error) {
            return { success: false, message: handleSupabaseError(error) }
        }
    }

    async updatePassword(newPassword) {
        try {
            if (!newPassword || newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters')
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            return { success: true, message: 'Password updated successfully' }
        } catch (error) {
            return { success: false, message: handleSupabaseError(error) }
        }
    }
}

// Export singleton instance
export const auth = new AuthManager()

// Export for easy access in other files
export default auth
