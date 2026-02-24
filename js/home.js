// home.js

// ================= MODERN ENHANCEMENTS =================

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animate');
            }, index * 100);
        }
    });
}, observerOptions);

// Observe service cards when page loads
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => observer.observe(card));
});

// Password toggle functionality
function togglePassword(inputId, eyeId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(eyeId);
    
    if (input.type === 'password') {
        input.type = 'text';
        eye.textContent = '🙈';
    } else {
        input.type = 'password';
        eye.textContent = '�️';
    }
}

// Upload message functions
function showUploadingMessage() {
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) {
        loadingMsg.style.display = 'block';
    }
}

function hideUploadingMessage() {
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) {
        loadingMsg.style.display = 'none';
    }
}

// Export functions for global use
window.showUploadingMessage = showUploadingMessage;
window.hideUploadingMessage = hideUploadingMessage;
window.togglePassword = togglePassword;

// ================= ORIGINAL HOME.JS CODE =================

// ================= GLOBAL DATA =================
let userData = {};
let globalUploadData = [];
let isProfileLoading = false; // Prevent multiple profile loads
let lastProfileLoadTime = 0; // Prevent rapid profile loads

// ================= MODERN ENHANCEMENTS =================

document.addEventListener("DOMContentLoaded", () => {

    checkSession();

    // Event Listeners (CSP SAFE)

    const logoutBtn = document.getElementById("logoutBtn");
    const logoutBtn2 = document.getElementById("logoutBtn2");
    const userDisplay = document.getElementById("userDisplay");
    const profileIcon = document.getElementById("profileIcon");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const profileModal = document.getElementById("profileModal");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (logoutBtn2) {
        logoutBtn2.addEventListener("click", logout);
    }

    if (userDisplay) {
        userDisplay.addEventListener("click", openProfileModal);
    }

    if (profileIcon) {
        profileIcon.addEventListener("click", openProfileModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeProfileModal);
    }

    // Close modal when clicking outside
    if (profileModal) {
        profileModal.addEventListener("click", (event) => {
            if (event.target === profileModal) {
                closeProfileModal();
            }
        });
    }
    // if (closeModalBtn) {
    //     closeModalBtn.addEventListener("click", closeProfileModal);
    // }
});


// ----------------------
// Session Check
// ----------------------

function checkSession() {
    fetch("http://localhost:5000/api/session", { credentials: "include" })
        .then(res => res.json())
        .then(data => {

            const authButtons = document.getElementById("authButtons");
            const uploadButtons = document.getElementById("uploadButtons");
            const userDisplay = document.getElementById("userDisplay");
            const profileIcon = document.getElementById("profileIcon");
            const logoutBtn = document.getElementById("logoutBtn");
            const logoutBtn2 = document.getElementById("logoutBtn2");

            if (data.loggedIn) {

                userData = data.user;
                
                // Load uploads data into global variable (only once)
                if (globalUploadData.length === 0) {
                    fetch("/api/my-uploads", { credentials: "include" })
                        .then(res => res.json())
                        .then(uploadData => {
                            if (Array.isArray(uploadData)) {
                                globalUploadData = uploadData;
                                console.log('Home - Loaded upload data:', uploadData.length);
                            }
                        })
                        .catch(err => console.error('Error loading uploads:', err));
                }

                if (authButtons) authButtons.style.display = "none";
                if (uploadButtons) uploadButtons.style.display = "flex";

                if (userDisplay) {
                    userDisplay.textContent = `Welcome, ${data.user.name}!`;
                    userDisplay.style.display = "inline";
                }

                if (profileIcon) profileIcon.style.display = "flex";
                if (logoutBtn) logoutBtn.style.display = "inline-block"; // Always visible
                if (logoutBtn2) logoutBtn2.style.display = "inline-block"; // Always visible

            } else {

                if (authButtons) authButtons.style.display = "flex";
                if (uploadButtons) uploadButtons.style.display = "none";
                if (userDisplay) userDisplay.style.display = "none";
                if (profileIcon) profileIcon.style.display = "none";
                if (logoutBtn) logoutBtn.style.display = "inline-block"; // Still visible for logout
                if (logoutBtn2) logoutBtn2.style.display = "inline-block"; // Still visible for logout
            }
        })
        .catch(err => console.error("Session check error:", err));
}


// ----------------------
// Logout
// ----------------------

function logout() {
    fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        window.location.href = "/index.html";
    });
}

// ----------------------
// Profile Modal
// ----------------------

function openProfileModal() {

    document.getElementById("profileName").innerText = userData.name || "N/A";
    document.getElementById("profileEmail").innerText = userData.email || "N/A";
    document.getElementById("profileRole").innerText =
        userData.role === "admin" ? "Admin" : "Customer";

    document.getElementById("profileModal").classList.add("show");

    loadUserDocuments();
}

function closeProfileModal() {
    document.getElementById("profileModal").classList.remove("show");
}


// ----------------------
// Load User Documents
// ----------------------

function loadUserDocuments() {
    const list = document.getElementById("docList");
    if (!list) return;

    // Prevent multiple simultaneous loads
    const now = Date.now();
    if (isProfileLoading) {
        console.log('Home Profile: Already loading, skipping...');
        return;
    }
    
    // Prevent rapid loads (wait at least 1 second)
    if (now - lastProfileLoadTime < 1000) {
        console.log('Home Profile: Too soon to reload, skipping...');
        return;
    }
    
    isProfileLoading = true;
    lastProfileLoadTime = now;
    
    console.log('Home Profile: loadUserDocuments called');
    list.innerHTML = '<p style="color:#666;">Loading...</p>';

    // Fetch fresh data instead of using potentially stale global data
    fetch("/api/my-uploads", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            console.log('=== HOME PROFILE FRESH DATA ===');
            console.log('Fresh data received:', data);
            console.log('Fresh data count:', data ? data.length : 0);
            console.log('===============================');
            
            if (data && data.length) {
                console.log('=== HOME PROFILE DISPLAYING ALL UPLOADS ===');
                console.log('Total uploads for profile:', data.length);
                console.log('======================================');
                
                const ul = document.createElement('ul');
                ul.style.listStyle = 'none';
                ul.style.padding = '0';
                ul.style.maxHeight = '300px';
                ul.style.overflowY = 'auto';
                ul.style.border = '1px solid #ddd';
                ul.style.borderRadius = '5px';
                ul.style.padding = '10px';

                // Display all uploads
                data.forEach(d => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '8px';
                    li.innerHTML = `<strong>${d.originalname}</strong> <small style="color:#666;">(${new Date(d.uploadedat).toLocaleDateString()})</small>`;
                    ul.appendChild(li);
                });

                list.appendChild(ul);
            } else {
                list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
            }
        })
        .catch(error => {
            console.error('Home Profile fetch error:', error);
            list.innerHTML = '<p style="color:#c62828;">Could not load documents.</p>';
        })
        .finally(() => {
            isProfileLoading = false;
        });
}