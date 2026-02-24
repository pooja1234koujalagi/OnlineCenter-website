document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("passwordForm");
    const passwordInput = document.getElementById("newPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const msg = document.getElementById("msg");
    const backBtn = document.getElementById("backBtn");

    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        if (!password || !confirm) return showMessage("All fields required", "error");
        if (password.length < 6) return showMessage("Password must be at least 6 characters", "error");
        if (password !== confirm) return showMessage("Passwords do not match", "error");

        try {
            const res = await fetch("http://localhost:5000/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
                credentials: "include"
            });
            const data = await res.json();
            showMessage(data.message, data.success ? "success" : "error");
            if (data.success) setTimeout(() => window.location.href = "/login.html", 1500);
        } catch {
            showMessage("Server not reachable", "error");
        }
    });

    if (backBtn) backBtn.addEventListener("click", () => window.history.back());

    function showMessage(message, type) {
        msg.textContent = message;
        msg.className = `message ${type}`;
    }
});