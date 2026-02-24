let userData = {};

// DOM Elements
const uploadBtn = document.getElementById("uploadBtn");
const logoutBtn = document.getElementById("logoutBtn");
const backBtn = document.getElementById("backBtn");
const profileBtn = document.getElementById("profileBtn");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const msg = document.getElementById("msg");

// ----------------------
// Check Session
// ----------------------
fetch("http://localhost:5000/api/session", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "/index.html";
    } else {
      userData = data.user;
      const userDisplay = document.getElementById("userDisplay");
      if (userDisplay) userDisplay.innerText = `Welcome, ${userData.name}!`;
    }
  })
  .catch(() => window.location.href = "/index.html");

// ----------------------
// Server Status Check
// ----------------------
function checkServerStatus() {
  return fetch("http://localhost:5000/api/session", { 
    method: "GET",
    credentials: "include"
  })
  .then(res => {
    if (res.ok) {
      console.log('✅ Server is reachable');
      return true;
    }
    throw new Error('Server not responding');
  })
  .catch(() => {
    console.log('❌ Server is NOT reachable');
    return false;
  });
}

// ----------------------
// Upload Function
// ----------------------
function upload() {
  // Check server status first
  checkServerStatus().then(isServerReachable => {
    if (!isServerReachable) {
      msg.innerText = "❌ Server not reachable. Please check if server is running on http://localhost:5000";
      msg.className = "message error";
      return;
    }
    
    const fileInput = document.getElementById("document");
    const extra = document.getElementById("extraData").value;

    if (!fileInput.files || fileInput.files.length === 0) {
      msg.innerText = "Please select at least one file";
      msg.className = "message error";
      return;
    }

    // Validate extra info is provided
    if (!extra || extra.trim() === '') {
      msg.innerText = "Please enter additional information";
      msg.className = "message error";
      return;
    }

    const formData = new FormData();
    Array.from(fileInput.files).forEach(f => formData.append("files", f));
    formData.append("extraData", extra);

    msg.innerText = "Uploading...";
    msg.className = "message info";

    // Show global uploading message
    if (window.showUploadingMessage) {
      window.showUploadingMessage();
    }

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
      credentials: "include"
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // Hide global uploading message
      if (window.hideUploadingMessage) {
        window.hideUploadingMessage();
      }
      
      msg.innerText = data.message;
      msg.className = data.message.toLowerCase().includes("success") ? "message success" : "message error";
      if (data.message.toLowerCase().includes("success")) {
        fileInput.value = "";
        document.getElementById("extraData").value = "";
        setTimeout(() => { msg.innerText = ""; }, 3000);
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      // Hide global uploading message
      if (window.hideUploadingMessage) {
        window.hideUploadingMessage();
      }
      
      if (error.message.includes('Failed to fetch')) {
        msg.innerText = "❌ Server not reachable. Please check if server is running on http://localhost:5000";
      } else {
        msg.innerText = `❌ Upload failed: ${error.message}`;
      }
      msg.className = "message error";
    });
  });
}

// ----------------------
// Logout & Back
// ----------------------
function logout() { fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" }).then(() => window.location.href = "index.html"); }
function goBack() { window.history.back(); }

// ----------------------
// Profile Modal
// ----------------------
function openProfileModal() {
    document.getElementById('profileName').innerText = userData.name || 'N/A';
    document.getElementById('profileEmail').innerText = userData.email || 'N/A';
    document.getElementById('profileRole').innerText = userData.role === 'admin' ? 'Admin' : 'Customer';
    document.getElementById('profileModal').classList.add('show');

    const list = document.getElementById('docList');
    list.innerHTML = '<p style="color:#666;">Loading...</p>';

    // Fetch user's uploads specifically for profile
    fetch('/api/my-uploads', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            console.log('Profile uploads received:', data);
            if (Array.isArray(data) && data.length) {
                const ul = document.createElement('ul');
                ul.style.listStyle = 'none';
                ul.style.padding = '0';
                data.forEach(d => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '8px';
                    li.innerHTML = `<strong>${d.originalname}</strong> <small style="color:#666;">(${new Date(d.uploadedat).toLocaleString()})</small>`;
                    ul.appendChild(li);
                });
                list.innerHTML = '';
                list.appendChild(ul);
            } else {
                list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
            }
        })
        .catch(() => { list.innerHTML = '<p style="color:#c62828;">Could not load documents.</p>'; });
}

function closeProfileModal() { document.getElementById('profileModal').classList.remove('show'); }

// ----------------------
// Event Listeners
// ----------------------
if (uploadBtn) uploadBtn.addEventListener("click", upload);
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (backBtn) backBtn.addEventListener("click", goBack);
if (profileBtn) profileBtn.addEventListener("click", openProfileModal);
if (closeProfileBtn) closeProfileBtn.addEventListener("click", closeProfileModal);

document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault();
});