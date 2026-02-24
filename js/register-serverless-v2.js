// Serverless Register.js v2.0
// Enhanced with no page reload and dynamic feedback

import { supabase, handleSupabaseError } from '../supabaseClient.js'

// DOM Elements
const nameInput = document.getElementById("rname");
const emailInput = document.getElementById("remail");
const passwordInput = document.getElementById("rpassword");
const confirmInput = document.getElementById("rconfirm");
const mobileInput = document.getElementById("rmobile");
const msg = document.getElementById("rmsg");
const submitBtn = document.getElementById("submitBtn");

// Loading states
const originalSubmitText = submitBtn ? submitBtn.textContent : "Register";
const originalSubmitDisabled = submitBtn ? submitBtn.disabled : false;

// Show loading state
function setLoading(isLoading) {
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? "Registering..." : originalSubmitText;
    }
}

// Show message dynamically
function showMessage(message, type = 'info') {
    if (msg) {
        msg.textContent = message;
        msg.className = `message ${type}`;
        msg.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                msg.style.display = 'none';
            }, 3000);
        }
    }
}

// Hide message
function hideMessage() {
    if (msg) {
        msg.style.display = 'none';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            input.value = input.getAttribute('data-password') || '';
        } else {
            const currentPassword = input.value;
            input.type = 'password';
            input.setAttribute('data-password', currentPassword);
            setTimeout(() => input.focus(), 0);
        }
    }
}

// Validate form
function validateForm() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

    if (!name || !email || !password || !confirm) {
        showMessage("Please fill in all fields", "error");
        return false;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters", "error");
        return false;
    }

    if (password !== confirm) {
        showMessage("Passwords do not match", "error");
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Please enter a valid email address", "error");
        return false;
    }

    // Name validation
    if (name.length < 2) {
        showMessage("Name must be at least 2 characters", "error");
        return false;
    }

    hideMessage();
    return true;
}

// Check if email already exists
async function checkEmailExists(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error;
        }

        return data; // Returns null if not found, user data if found
    } catch (error) {
        console.error('Email check error:', error);
        return null;
    }
}

// Main registration function
async function register() {
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    hideMessage();

    try {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const mobile = mobileInput.value.trim();

        // Check if email already exists
        showMessage("Checking if email is available...", "info");
        const existingUser = await checkEmailExists(email);

        if (existingUser) {
            showMessage("Email already registered", "error");
            setLoading(false);
            return;
        }

        showMessage("Creating account...", "info");

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

        if (authError) {
            throw authError;
        }

        if (authData.user) {
            // Create user record in database
            const { error: dbError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    name,
                    email,
                    mobile,
                    role: 'customer'
                }]);

            if (dbError) {
                throw dbError;
            }

            // Show success message
            showMessage("Registration successful! Redirecting to login...", "success");

            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            confirmInput.value = '';
            mobileInput.value = '';

            // Redirect to login
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2000);
        }

    } catch (error) {
        console.error('Registration error:', error);
        showMessage(handleSupabaseError(error), "error");
        setLoading(false);
    }
}

// Real-time validation feedback
function setupRealtimeValidation() {
    [nameInput, emailInput, passwordInput, confirmInput].forEach(input => {
        input.addEventListener('input', function() {
            hideMessage(); // Hide message when user starts typing
            
            // Real-time validation
            if (input.id === 'confirm') {
                const password = passwordInput.value;
                if (password && input.value !== password) {
                    showMessage("Passwords do not match", "error");
                } else if (password && input.value === password && password.length >= 6) {
                    hideMessage(); // Hide error when passwords match
                }
            }
        });

        input.addEventListener('blur', function() {
            // Final validation when user leaves field
            validateForm();
        });
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    // Form submission handler
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Prevent page reload
            register();
        });
    }

    // Setup real-time validation
    setupRealtimeValidation();

    // Back & Forward buttons
    const backBtn = document.getElementById("backBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    
    if (backBtn) {
        backBtn.addEventListener("click", () => window.history.back());
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener("click", () => window.history.forward());
    }
});
