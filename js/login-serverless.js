// Serverless Login.js
// Direct Supabase Authentication - no Express backend

import { supabase, handleSupabaseError } from '../supabaseClient.js'

// Login function
async function login() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const rememberMe = document.getElementById("rememberMe").checked;
    const msg = document.getElementById("msg");

    // Validation
    if (!name || !email || !password) {
        msg.innerText = "All fields required";
        msg.className = "message error";
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        msg.innerText = "Please enter a valid email address";
        msg.className = "message error";
        return;
    }

    // Clear previous messages
    msg.innerText = "Logging in...";
    msg.className = "message info";

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            msg.innerText = "Login successful";
            msg.className = "message success";

            // Remember me: only store email, not password
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ email }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // Check user role and redirect
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            const userRole = userData?.role || 'customer';

            setTimeout(() => {
                if (userRole === "admin") {
                    window.location.href = "/admin-info.html";
                } else {
                    window.location.href = "/info.html";
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        msg.innerText = "Login failed: " + handleSupabaseError(error);
        msg.className = "message error";
    }
}

// Prefill remembered user on page load
window.addEventListener("load", function() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const user = JSON.parse(remembered);
        document.getElementById("email").value = user.email || "";
        document.getElementById("rememberMe").checked = true;
    }
});

// Handle form submit
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent page reload
    login();
});
