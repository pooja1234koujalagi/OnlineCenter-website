// Serverless Register.js
// Direct Supabase Authentication - no Express backend

import { supabase, handleSupabaseError } from '../supabaseClient.js'

async function register() {
    const name = document.getElementById("rname").value.trim();
    const email = document.getElementById("remail").value.trim();
    const password = document.getElementById("rpassword").value.trim();
    const confirm = document.getElementById("rconfirm").value.trim();
    const mobile = document.getElementById("rmobile").value.trim();
    const msg = document.getElementById("rmsg");

    if (!name || !email || !password || !confirm) {
        msg.innerText = "All fields required";
        msg.className = "message error";
        return;
    }

    if (password.length < 6) {
        msg.innerText = "Password must be at least 6 characters";
        msg.className = "message error";
        return;
    }

    if (password !== confirm) {
        msg.innerText = "Passwords do not match";
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

    msg.innerText = "Registering...";
    msg.className = "message info";

    try {
        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingUser) {
            msg.innerText = "Email already registered";
            msg.className = "message error";
            return;
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
        });

        if (authError) throw authError;

        if (authData.user) {
            // Create user record in database
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    name,
                    email,
                    mobile,
                    role: 'customer'
                }]);

            if (insertError) throw insertError;

            msg.innerText = "Registration successful! Please check your email to verify your account.";
            msg.className = "message success";

            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        msg.innerText = "Registration failed: " + handleSupabaseError(error);
        msg.className = "message error";
    }
}

// Handle form submission securely
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent page reload
    register();
});

// Back & Forward buttons
document.getElementById("backBtn").addEventListener("click", () => {
    window.history.back();
});

document.getElementById("forwardBtn").addEventListener("click", () => {
    window.history.forward();
});
