// login.js

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

// ================= LOGIN FUNCTION =================
function login() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    // Validation
    if (!name || !email || !password) {
        msg.innerText = "All fields required";
        msg.className = "message error";
        return;
    }

    // Clear previous messages
    msg.innerText = "Logging in...";
    msg.className = "message info";

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        msg.innerText = data.message;
        if (data.success) {
            msg.className = "message success";

            setTimeout(() => {
                if (data.role === "admin") {
                    window.location.href = "/admin-info.html";
                } else {
                    window.location.href = "/info.html";
                }
            }, 1000);
        } else {
            msg.className = "message error";
        }
    })
    .catch(() => {
        msg.innerText = "Server not reachable";
        msg.className = "message error";
    });
}

// Prefill remembered user on page load
window.addEventListener("load", function() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const user = JSON.parse(remembered);
        document.getElementById("name").value = user.name || "";
        document.getElementById("email").value = user.email || "";
    }
});

// Handle form submit
document.addEventListener("DOMContentLoaded", function() {
    // Password eye event listeners
    const passwordEye = document.getElementById("passwordEye");
    if (passwordEye) {
        // Add both click and touch events for mobile compatibility
        passwordEye.addEventListener("click", function() {
            togglePassword('password', 'passwordEye');
        });
        passwordEye.addEventListener("touchstart", function(e) {
            e.preventDefault();
            togglePassword('password', 'passwordEye');
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // prevent page reload
            login();
        });
    }

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }
});
