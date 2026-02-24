// Serverless Login.js v2.0
// Enhanced with no page reload and dynamic feedback

import { supabase, handleSupabaseError } from '../supabaseClient.js'

// DOM Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");

// Loading states
const originalSubmitText = submitBtn ? submitBtn.textContent : "Login";
const originalSubmitDisabled = submitBtn ? submitBtn.disabled : false;

// Show loading state
function setLoading(isLoading) {
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? "Logging in..." : originalSubmitText;
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

    if (!name || !email || !password) {
        showMessage("Please fill in all fields", "error");
        return false;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters", "error");
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Please enter a valid email address", "error");
        return false;
    }

    hideMessage();
    return true;
}

// Remember me functionality
function saveRememberedUser(email) {
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email }));
    } else {
        localStorage.removeItem('rememberedUser');
    }
}

function loadRememberedUser() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const user = JSON.parse(remembered);
        emailInput.value = user.email || '';
        rememberMeCheckbox.checked = true;
    }
}

// Main login function
async function login() {
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    hideMessage();

    try {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        if (data.user) {
            // Save remembered user
            saveRememberedUser(email);

            // Show success message
            showMessage("Login successful! Redirecting...", "success");

            // Redirect based on role (check user metadata)
            setTimeout(async () => {
                try {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    const userRole = userData?.role || 'customer';

                    if (userRole === 'admin') {
                        window.location.href = "/admin-info.html";
                    } else {
                        window.location.href = "/info.html";
                    }
                } catch (roleError) {
                    console.error('Error fetching user role:', roleError);
                    // Default to customer dashboard
                    window.location.href = "/info.html";
                }
            }, 1500);
        }

    } catch (error) {
        console.error('Login error:', error);
        showMessage(handleSupabaseError(error), "error");
        setLoading(false);
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    loadRememberedUser();

    // Form submission handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Prevent page reload
            login();
        });
    }

    // Real-time validation feedback
    [nameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            hideMessage(); // Hide message when user starts typing
        });
    });

    // Remember me toggle
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', function() {
            if (!this.checked) {
                localStorage.removeItem('rememberedUser');
            }
        });
    }
});
