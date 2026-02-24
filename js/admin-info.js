// ================= SESSION CHECK =================
fetch("http://localhost:5000/api/session", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
        if (!data.loggedIn || data.user.role !== "admin") {
            window.location.href = "/index.html";
        } else {
            const userName = document.getElementById("userName");
            if (userName) {
                userName.innerText = data.user.name || "Admin";
            }
        }
    });

// ================= FETCH ADMIN INFO =================
function fetchInfo() {
    fetch("http://localhost:5000/get-info", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            const callForms = document.getElementById("callForms");
            const requiredDocuments = document.getElementById("requiredDocuments");

            if (callForms) callForms.value = data.callForms || "";
            if (requiredDocuments) requiredDocuments.value = data.requiredDocuments || "";
        });
}

// ================= UPDATE INFO =================
function updateInfo() {
    const callForms = document.getElementById("callForms").value;
    const requiredDocuments = document.getElementById("requiredDocuments").value;

    fetch("http://localhost:5000/update-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ callForms, requiredDocuments })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        // Clear form fields immediately after successful update
        document.getElementById("callForms").value = "";
        document.getElementById("requiredDocuments").value = "";
        fetchInfo();
    })
    .catch(error => {
        console.error('Update error:', error);
        alert('Error updating information');
    });
}

// ================= CLEAR INFO =================
function clearInfo() {
    if (!confirm("Are you sure you want to clear all info?")) return;

    fetch("http://localhost:5000/clear-info", {
        method: "POST",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        // Clear form fields immediately after successful clear
        document.getElementById("callForms").value = "";
        document.getElementById("requiredDocuments").value = "";
        fetchInfo();
    })
    .catch(error => {
        console.error('Clear error:', error);
        alert('Error clearing information');
    });
}

// ================= PROFILE MODAL =================
function openProfileModal() {
    console.log('Admin profile: Opening modal...');
    fetch('/api/session', { credentials: 'include' })
        .then(res => {
            console.log('Admin profile: Session response:', res);
            return res.json();
        })
        .then(data => {
            console.log('Admin profile: Session data:', data);
            if (!data.loggedIn) {
                console.log('Admin profile: Not logged in, redirecting...');
                return window.location.href = 'index.html';
            }

            document.getElementById('profileName').innerText = data.user.name || 'N/A';
            document.getElementById('profileEmail').innerText = data.user.email || 'N/A';
            document.getElementById('profileRole').innerText =
                data.user.role === 'admin' ? 'Admin' : 'Customer';

            document.getElementById('profileModal').classList.add('show');

            const list = document.getElementById('docList');
            list.innerHTML = '<p style="color:#666;">Loading...</p>';

            console.log('Admin profile: Fetching uploads...');
            fetch('/api/my-uploads', { credentials: 'include' })
                .then(r => {
                    console.log('Admin profile: API response:', r);
                    return r.json();
                })
                .then(docs => {
                    console.log('Admin profile: Documents received:', docs);
                    console.log('Admin profile: Number of documents:', docs ? docs.length : 0);
                    if (Array.isArray(docs) && docs.length) {
                        const ul = document.createElement('ul');
                        ul.style.listStyle = 'none';
                        ul.style.padding = '0';

                        docs.forEach(d => {
                            const li = document.createElement('li');
                            li.style.marginBottom = '8px';
                            li.innerHTML = `<strong>${d.originalname}</strong>
                                 <small style="color:#666;">
                                 (${new Date(d.uploadedat).toLocaleString()})
                                 </small>`;
                            ul.appendChild(li);
                        });

                        list.appendChild(ul);
                    } else {
                        list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
                    }
                })
                .catch(() => {
                    list.innerHTML = '<p style="color:#c62828;">Could not load documents.</p>';
                    list.innerHTML =
                        '<p style="color:#c62828;">Could not load documents.</p>';
                });
        });
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}

// ================= BACK FUNCTION =================
function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = "dashboard.html"; // default page
    }
}

// ================= EVENT LISTENERS =================
document.addEventListener("DOMContentLoaded", function () {
    const updateBtn = document.getElementById("updateBtn");
    const clearBtn = document.getElementById("clearBtn");
    const profileBtn = document.getElementById("profileBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const backBtn = document.getElementById("backBtn");
    const backArrow = document.getElementById("backArrow");
    const dashboardBtn = document.getElementById("dashboardBtn");
    const uploadPageBtn = document.getElementById("uploadPageBtn");

    if (updateBtn) updateBtn.addEventListener("click", updateInfo);
    if (clearBtn) clearBtn.addEventListener("click", clearInfo);
    if (profileBtn) profileBtn.addEventListener("click", openProfileModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeProfileModal);

    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => window.location.href = "dashboard.html");
    }

    if (uploadPageBtn) {
        uploadPageBtn.addEventListener("click", () => window.location.href = "upload.html");
    }

    if (backBtn) backBtn.addEventListener("click", goBack);
    if (backArrow) backArrow.addEventListener("click", goBack);

    fetchInfo();
});