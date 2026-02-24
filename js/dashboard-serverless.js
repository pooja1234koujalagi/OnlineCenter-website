// Serverless Dashboard.js
// Real-time dashboard with direct Supabase integration

import { supabase, handleSupabaseError, isAdmin, getCurrentUserWithRole } from '../supabaseClient.js'

// ================= GLOBAL SESSION DATA =================
let userData = null;
let allData = [];
let subscription = null;

// ================= FETCH FILES =================
async function fetchFiles() {
    try {
        const currentUser = await getCurrentUserWithRole();
        if (!currentUser) {
            window.location.href = '/index.html';
            return;
        }

        let query = supabase.from('uploads').select('*');
        
        if (currentUser.role === 'admin') {
            query = query.order('uploadedat', { ascending: false });
        } else {
            query = query.eq('useremail', currentUser.email).order('uploadedat', { ascending: false });
        }

        const { data: result, error } = await query;
        
        if (error) throw error;
        
        if (Array.isArray(result)) {
            allData = result;
            displayData(allData);
        } else {
            document.getElementById("uploadTableBody").innerHTML = "";
            document.getElementById("totalCount").innerText = `Total Uploads: 0`;
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        document.getElementById("uploadTableBody").innerHTML = "";
        document.getElementById("totalCount").innerText = `Total Uploads: 0`;
        alert('Failed to load files: ' + handleSupabaseError(error));
    }
}

// ================= DISPLAY DATA =================
function displayData(data) {
    const table = document.getElementById("uploadTableBody");
    const emptyMsg = document.getElementById("emptyMsg");

    table.innerHTML = "";

    if (data.length === 0) {
        emptyMsg.style.display = "block";
    } else {
        emptyMsg.style.display = "none";
    }

    document.getElementById("totalCount").innerText = `Total Uploads: ${data.length}`;

    data.forEach(doc => {
        const date = new Date(doc.uploadedat).toLocaleDateString();
        const filename = doc.filename || "";
        const originalname = doc.originalname || "";

        const viewLink = filename
            ? `<a href="#" onclick="downloadFile('${filename}'); return false;" class="link-btn">View</a>`
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
async function downloadFile(filename) {
    if (!filename) return;
    
    try {
        const { data, error } = await supabase.storage
            .from('uploads')
            .createSignedUrl(filename, 60); // 60 seconds expiry
        
        if (error) throw error;
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download file: ' + handleSupabaseError(error));
    }
}

// ================= DELETE FILE =================
async function deleteItem(filename) {
    if (!filename) return;
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        // Delete file from storage
        const { error: storageError } = await supabase.storage
            .from('uploads')
            .remove([filename]);
        
        if (storageError) throw storageError;

        // Delete metadata from database
        const { error: dbError } = await supabase
            .from('uploads')
            .delete()
            .eq('filename', filename);

        if (dbError) throw dbError;

        alert('File deleted successfully');
        allData = allData.filter(file => file.filename !== filename);
        displayData(allData); // Refresh dashboard immediately
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file: ' + handleSupabaseError(error));
    }
}

// ================= PROFILE MODAL =================
async function openProfileModal() {
    if (!userData) return window.location.href = 'index.html';

    document.getElementById('profileName').innerText = userData.name || 'N/A';
    document.getElementById('profileEmail').innerText = userData.email || 'N/A';
    document.getElementById('profileRole').innerText = userData.role === 'admin' ? 'Admin' : 'Customer';

    const modal = document.getElementById('profileModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    const list = document.getElementById('docList');
    list.innerHTML = '<p style="color:#666;">Loading...</p>';

    try {
        const { data: uploads, error } = await supabase
            .from('uploads')
            .select('*')
            .eq('useremail', userData.email)
            .order('uploadedat', { ascending: false });
        
        if (error) throw error;
        
        if (Array.isArray(uploads) && uploads.length) {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            ul.style.maxHeight = '300px';
            ul.style.overflowY = 'auto';
            uploads.forEach(d => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.innerHTML = `<strong>${d.originalname}</strong> 
                    <small style="color:#666;">(${new Date(d.uploadedat).toLocaleString()})</small>`;
                ul.appendChild(li);
            });

            list.appendChild(ul);
        } else {
            list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        list.innerHTML = '<p style="color:#c62828;">Could not load documents.</p>';
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}
// ================= INITIALIZE =================
document.addEventListener("DOMContentLoaded", async function () {
    // SESSION CHECK
    try {
        userData = await getCurrentUserWithRole();
        
        if (!userData || userData.role !== "admin") {
            window.location.href = "/index.html";
            return;
        }

        const userDisplay = document.getElementById("userDisplay");
        if (userDisplay) {
            userDisplay.innerText = "Welcome " + (userData.name || "N/A");
        }
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = "/index.html";
        return;
    }
    
    // FETCH FILES
    fetchFiles();
    
    // BACK / FORWARD
    const backBtn = document.getElementById("backBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    if (backBtn) backBtn.addEventListener("click", () => window.history.back());
    if (forwardBtn) forwardBtn.addEventListener("click", () => window.history.forward());

    // PROFILE MODAL
    const profileIcon = document.getElementById("profileIcon");
    const userDisplay = document.getElementById("userDisplay");
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (profileIcon) profileIcon.addEventListener("click", openProfileModal);
    if (userDisplay) userDisplay.addEventListener("click", openProfileModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeProfileModal);

    // LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    // SEARCH
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const value = this.value.toLowerCase().trim();
            displayData(value ? allData.filter(doc =>
                (doc.user || "").toLowerCase().includes(value) ||
                (doc.extradata || "").toLowerCase().includes(value) ||
                (doc.originalname || "").toLowerCase().includes(value) ||
                (doc.filename || "").toLowerCase().includes(value)
            ) : allData);
        });

        searchInput.addEventListener("focus", function () {
            this.style.boxShadow = "0 0 8px rgba(0,0,0,0.1)";
        });
        searchInput.addEventListener("blur", function () {
            this.style.boxShadow = "none";
        });
    }
});

// Cleanup subscription on page unload
window.addEventListener('beforeunload', () => {
    if (subscription) {
        supabase.removeChannel(subscription);
    }
});
