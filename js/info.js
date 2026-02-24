// ================= GLOBAL SESSION DATA =================
let userData = null;

// ================= INITIALIZE =================
document.addEventListener("DOMContentLoaded", () => {

    // ----------------------
    // Session Check
    // ----------------------
    fetch("http://localhost:5000/api/session", { credentials: "include" })
        .then(res => res.json())
        .then(session => {
            if (!session.loggedIn || session.user.role !== "customer") {
                alert("Please login as a customer to view this page.");
                window.location.href = "/login.html";
                return;
            }
            userData = session.user;
            const userDisplay = document.getElementById("userDisplay");
            if (userDisplay) {
                userDisplay.innerText = "Welcome " + (userData.name || 'N/A');
            }
        })
        .catch(() => {
            window.location.href = "/login.html";
        });

    // ----------------------
    // Fetch Info
    // ----------------------
    fetch("http://localhost:5000/get-info", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            const callForms = document.getElementById("callForms");
            const requiredDocuments = document.getElementById("requiredDocuments");

            if (callForms) callForms.innerText = data.callForms || "No information yet.";
            if (requiredDocuments) requiredDocuments.innerText = data.requiredDocuments || "No documents listed.";
        })
        .catch(err => console.error("Error fetching info:", err));

    // ----------------------
    // Event Listeners
    // ----------------------
    const userDisplay = document.getElementById("userDisplay");
    const profileIcon = document.getElementById("profileIcon");
    const backArrow = document.getElementById("backArrow");
    const backBtn = document.getElementById("backBtn");
    const uploadBtn = document.getElementById("uploadBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

    if (userDisplay) userDisplay.addEventListener("click", openProfileModal);
    if (profileIcon) profileIcon.addEventListener("click", openProfileModal);
    if (backArrow) backArrow.addEventListener("click", () => window.history.back());
    if (backBtn) backBtn.addEventListener("click", () => window.history.back()); // Handle both back buttons
    if (uploadBtn) uploadBtn.addEventListener("click", () => window.location.href = "upload.html");
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeProfileModal);

});

// ================= PROFILE MODAL =================
function openProfileModal() {
    if (!userData) return window.location.href = "/login.html";

    document.getElementById("profileName").innerText = userData.name || "N/A";
    document.getElementById("profileEmail").innerText = userData.email || "N/A";
    document.getElementById("profileRole").innerText = userData.role === "admin" ? "Admin" : "Customer";

    const modal = document.getElementById("profileModal");
    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    loadUserDocuments();
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.classList.remove("show");
    document.body.style.overflow = "";
}

// ================= LOAD USER DOCUMENTS =================
function loadUserDocuments() {
    const list = document.getElementById("docList");
    if (!list) return;

    list.innerHTML = '<p style="color:#666;">Loading...</p>';

    fetch("/api/my-uploads", { credentials: "include" })
        .then(res => res.json())
        .then(docs => {
            if (Array.isArray(docs) && docs.length > 0) {
                const ul = document.createElement("ul");
                ul.style.listStyle = "none";
                ul.style.padding = "0";

                docs.forEach(doc => {
                    const li = document.createElement("li");
                    li.style.marginBottom = "8px";
                    li.innerHTML = `
                        <strong>${doc.originalname}</strong>
                        <small style="color:#666;">
                            (${new Date(doc.uploadedAt).toLocaleString()})
                        </small>
                    `;
                    ul.appendChild(li);
                });

                list.appendChild(ul);
            } else {
                list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
            }
        })
        .catch(() => {
            list.innerHTML = '<p style="color:#c62828;">Could not load documents.</p>';
        });
}