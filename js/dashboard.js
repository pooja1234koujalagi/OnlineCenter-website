// ================= GLOBAL SESSION DATA =================
let userData = null;
let allData = [];
let isFetching = false; // Prevent multiple API calls
let lastFetchTime = 0; // Prevent rapid refetching

// ================= FETCH FILES =================
function fetchFiles() {
    console.log('Dashboard: fetchFiles called');
    
    fetch("/api/my-uploads", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            console.log('Dashboard: Raw API data:', data);
            console.log('Dashboard: API data length:', data ? data.length : 0);
            
            if (Array.isArray(data)) {
                allData = data;
                console.log('Dashboard: allData set to:', allData.length);
                displayData(allData);
            } else {
                console.log('Dashboard: Invalid data received, clearing table');
                allData = [];
                document.getElementById("uploadTableBody").innerHTML = "";
                document.getElementById("totalCount").innerText = `Total Uploads: 0`;
            }
        })
        .catch(error => {
            console.error('Dashboard: Fetch error:', error);
            allData = [];
            document.getElementById("uploadTableBody").innerHTML = "";
            document.getElementById("totalCount").innerText = `Total Uploads: 0`;
        });
}

// ================= DISPLAY DATA =================
function displayData(data) {
    const table = document.getElementById("uploadTableBody");
    const emptyMsg = document.getElementById("emptyMsg");

    console.log('=== DASHBOARD DISPLAY DATA START ===');
    console.log('Data received:', data);
    console.log('Data length:', data ? data.length : 0);
    console.log('================================');

    // COMPLETELY CLEAR TABLE - Remove all existing content
    table.innerHTML = "";

    if (data && Array.isArray(data) && data.length > 0) {
        // Display all data without deduplication
        console.log('=== DISPLAYING ALL UPLOADS ===');
        console.log('Total uploads to display:', data.length);
        console.log('=============================');
        
        document.getElementById("totalCount").innerText = `Total Uploads: ${data.length}`;

        // Display all data
        data.forEach(doc => {
            const date = new Date(doc.uploadedat).toLocaleDateString();
            const filename = doc.filename || "";
            const originalname = doc.originalname || "";

            const viewLink = filename
                ? `<a href="http://localhost:5000/uploads/${filename}" target="_blank" class="link-btn">View</a>`
                : "No File";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${doc.user || "Unknown"}</td>
                <td>${date}</td>
                <td>${doc.extradata || "-"}</td>
                <td>${viewLink}</td>
                <td>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${filename ? `<button class="btn btn-primary download-btn" 
                            data-file="${filename}" 
                            data-original="${originalname}"
                            style="padding: 8px 15px; font-size: 14px;">
                            Download
                        </button>` : ""}
                        <button class="btn btn-primary delete-btn"
                            data-file="${filename}"
                            style="padding: 8px 15px; font-size: 14px; background: #dc3545;">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            table.appendChild(row);
        });
        
        emptyMsg.style.display = "none";
    } else {
        console.log('=== NO UPLOADS TO DISPLAY ===');
        emptyMsg.style.display = "block";
        document.getElementById("totalCount").innerText = `Total Uploads: 0`;
    }
    
    console.log('=== DASHBOARD DISPLAY DATA END ===');
    console.log('Table rows after rendering:', table.children.length);
    console.log('================================');
}

// ================= EVENT DELEGATION =================
document.addEventListener("click", function (e) {
    // Download
    if (e.target.classList.contains("download-btn")) {
        const filename = e.target.getAttribute("data-file");
        downloadFile(filename);
    }

    // Delete
    if (e.target.classList.contains("delete-btn")) {
        const filename = e.target.getAttribute("data-file");
        deleteItem(filename);
    }
});

// ================= DOWNLOAD FILE =================
function downloadFile(filename) {
    if (!filename) return;
    window.location.href = `http://localhost:5000/api/download/${filename}`;
}

// ================= DELETE FILE =================
function deleteItem(filename) {
    if (!filename) return;
    if (!confirm("Are you sure you want to delete this record?")) return;

    fetch(`http://localhost:5000/api/delete/${filename}`, {
        method: "DELETE",
        credentials: "include"
    })
    .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
    })
    .then(data => {
        alert(data.message);

        allData = allData.filter(file => file.filename !== filename);
        displayData(allData); // Refresh dashboard immediately
    })
    .catch(err => {
        console.error("Delete error:", err);
        alert("Failed to delete file.");
    });
}

// ================= PROFILE MODAL =================
function openProfileModal() {
    if (!userData) return window.location.href = 'index.html';

    document.getElementById('profileName').innerText = userData.name || 'N/A';
    document.getElementById('profileEmail').innerText = userData.email || 'N/A';
    document.getElementById('profileRole').innerText = userData.role === 'admin' ? 'Admin' : 'Customer';

    const modal = document.getElementById('profileModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    const list = document.getElementById('docList');
    list.innerHTML = '<p style="color:#666;">Loading...</p>';

    // Use existing data instead of making another API call
    if (allData && allData.length) {
        console.log('=== PROFILE DISPLAYING ALL UPLOADS ===');
        console.log('Total uploads for profile:', allData.length);
        console.log('==================================');
        
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.maxHeight = '300px';
        ul.style.overflowY = 'auto';
        ul.style.border = '1px solid #ddd';
        ul.style.borderRadius = '5px';
        ul.style.padding = '10px';

        // Display all uploads without deduplication
        allData.forEach(d => {
            const li = document.createElement('li');
            li.style.marginBottom = '8px';
            li.innerHTML = `<strong>${d.originalname}</strong> <small style="color:#666;">(${new Date(d.uploadedat).toLocaleDateString()})</small>`;
            ul.appendChild(li);
        });

        list.appendChild(ul);
    } else {
        list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ================= LOGOUT =================
function logout() {
    fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include"
    })
        .then(() => window.location.href = "index.html")
        .catch(() => window.location.href = "index.html");
}

// ================= INITIALIZE =================
document.addEventListener("DOMContentLoaded", function () {
    // SESSION CHECK
    fetch("http://localhost:5000/api/session", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
        if (!data.loggedIn || !data.user) {
            window.location.href = "/index.html";
            return;
        }

        userData = data.user;

        const userDisplay = document.getElementById("userDisplay");
        if (userDisplay) {
            userDisplay.innerText = "Welcome " + (userData.name || "N/A");
        }
    })
    .catch(() => {
        window.location.href = "/index.html";
    });
    // FETCH FILES
    fetchFiles();

    // BACK / FORWARD
    const backBtn = document.getElementById("backBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    if (backBtn) backBtn.addEventListener("click", () => window.history.back());
    if (forwardBtn) forwardBtn.addEventListener("click", () => window.history.forward());

    // PROFILE MODAL
    const profileIcon = document.getElementById("profileIcon");
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (profileIcon) {
        console.log('Dashboard: Profile icon clicked');
        profileIcon.addEventListener("click", function(e) {
            console.log('Dashboard: Opening profile modal...');
            openProfileModal();
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeProfileModal);

    // LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    // SEARCH
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const value = this.value.toLowerCase().trim();
            console.log('Dashboard: Search triggered with value:', value);
            
            // Use the original allData for filtering, not the displayed uniqueData
            const filteredData = value ? allData.filter(doc =>
                (doc.user || "").toLowerCase().includes(value) ||
                (doc.extradata || "").toLowerCase().includes(value) ||
                (doc.originalname || "").toLowerCase().includes(value)
            ) : allData;
            
            console.log('Dashboard: Filtered data count:', filteredData.length);
            displayData(filteredData);
        });

        searchInput.addEventListener("focus", function () {
            this.style.boxShadow = "0 0 8px rgba(0,0,0,0.1)";
        });
        searchInput.addEventListener("blur", function () {
            this.style.boxShadow = "none";
        });
    }
});