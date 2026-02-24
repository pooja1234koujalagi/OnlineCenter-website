// register.js

// ================= PASSWORD TOGGLE =================
function togglePassword(inputId, eyeId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(eyeId);
    
    if (input.type === 'password') {
        input.type = 'text';
        eye.textContent = '?';
    } else {
        input.type = 'password';
        eye.textContent = '👁️';
    }
}

// ================= REGISTER FUNCTION =================
function register() {
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

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, mobile }),
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        msg.innerText = data.message;
        if (data.success) {
            msg.className = "message success";
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2000);
        } else {
            msg.className = "message error";
        }
    })
    .catch(() => {
        msg.innerText = "Server not reachable";
        msg.className = "message error";
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Password eye event listeners
    const passwordEye1 = document.getElementById("passwordEye1");
    if (passwordEye1) {
        // Add both click and touch events for mobile compatibility
        passwordEye1.addEventListener("click", function() {
            togglePassword('rpassword', 'passwordEye1');
        });
        passwordEye1.addEventListener("touchstart", function(e) {
            e.preventDefault();
            togglePassword('rpassword', 'passwordEye1');
        });
    }

    const passwordEye2 = document.getElementById("passwordEye2");
    if (passwordEye2) {
        // Add both click and touch events for mobile compatibility
        passwordEye2.addEventListener("click", function() {
            togglePassword('rconfirm', 'passwordEye2');
        });
        passwordEye2.addEventListener("touchstart", function(e) {
            e.preventDefault();
            togglePassword('rconfirm', 'passwordEye2');
        });
    }

    const registerForm = document.getElementById("registerForm");
    const backBtn = document.getElementById("backBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    
    if (registerForm) registerForm.addEventListener("submit", function(e) {
        e.preventDefault(); // prevent page reload
        register();
    });
    if (backBtn) backBtn.addEventListener("click", () => {
        window.history.back();
    });
    if (forwardBtn) forwardBtn.addEventListener("click", () => {
        window.history.forward();
    });
});