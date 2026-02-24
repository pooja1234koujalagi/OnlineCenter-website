const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const backBtn = document.getElementById("backBtn");
    const msg = document.getElementById("msg");

    // 🔹 SEND OTP
    if (sendOtpBtn) sendOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        if (!email) return showMessage("Email required", "error");

        // ✅ Show sending message
        showMessage("Sending OTP...", "info");

        // ✅ Disable button while sending
        sendOtpBtn.disabled = true;
        sendOtpBtn.innerText = "Sending...";

        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            showMessage(data.message, data.success ? "success" : "error");

            if (data.success) {
                document.getElementById("otpDiv").style.display = "block";
            }

        } catch (error) {
            showMessage("Server error. Please try again.", "error");
        }

        // ✅ Enable button again
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerText = "Send OTP";
    });


    // 🔹 VERIFY OTP
    if (verifyOtpBtn) verifyOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const otp = document.getElementById("otp").value.trim();

        if (!otp) return showMessage("Enter OTP", "error");

        // Show verifying message
        showMessage("Verifying OTP...", "info");

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.innerText = "Verifying...";

        try {
            const res = await fetch(`${API_BASE}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
                credentials: "include"
            });

            const data = await res.json();

            showMessage(data.message, data.success ? "success" : "error");

            if (data.success) {
                setTimeout(() => {
                    window.location.href = "reset-password.html";
                }, 1500);
            }

        } catch (error) {
            showMessage("Server error. Please try again.", "error");
        }

        verifyOtpBtn.disabled = false;
        verifyOtpBtn.innerText = "Verify OTP";
    });


    if (backBtn) backBtn.addEventListener("click", () => window.history.back());

    function showMessage(message, type) {
        msg.textContent = message;
        msg.className = `message ${type}`;
    }
});