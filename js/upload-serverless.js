// Serverless Upload.js
// Direct Supabase integration - no Express backend

import { supabase, handleSupabaseError, getCurrentUserWithRole } from '../supabaseClient.js'

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
(async () => {
    try {
        userData = await getCurrentUserWithRole();
        if (!userData) {
            window.location.href = "/index.html";
            return;
        }
        
        const userDisplay = document.getElementById("userDisplay");
        if (userDisplay) userDisplay.innerText = `Welcome, ${userData.name}!`;
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = "/index.html";
    }
})();

// ----------------------
// Upload Function
// ----------------------
async function upload() {
    const fileInput = document.getElementById("document");
    const extraInfoInput = document.getElementById("extraData");
    const extraInfo = extraInfoInput.value;

    if (!fileInput.files || fileInput.files.length === 0) {
        msg.innerText = "Please select at least one file";
        msg.className = "message error";
        return;
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let file of fileInput.files) {
        if (!allowedTypes.includes(file.type)) {
            msg.innerText = `Invalid file type: ${file.name}. Only images, PDFs, and documents are allowed.`;
            msg.className = "message error";
            return;
        }
        if (file.size > maxSize) {
            msg.innerText = `File too large: ${file.name}. Maximum size is 10MB.`;
            msg.className = "message error";
            return;
        }
    }

    msg.innerText = "Uploading...";
    msg.className = "message info";

    try {
        for (let file of fileInput.files) {
            const filePath = `${userData.email}/${file.name}`;
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    metadata: { 
                        extraData: extraInfo, 
                        userEmail: userData.email 
                    }
                });
            
            if (uploadError) throw uploadError;
            
            // Store metadata in database
            const { error: dbError } = await supabase
                .from('uploads')
                .insert([{
                    user: userData.name,
                    userEmail: userData.email,
                    filename: uploadData.path,
                    originalname: file.name,
                    extradata: extraInfo,
                    uploadedat: new Date().toISOString()
                }]);
            
            if (dbError) throw dbError;
        }
        
        msg.innerText = 'Files uploaded successfully';
        msg.className = "message success";
        
        fileInput.value = "";
        document.getElementById("extraData").value = "";
        setTimeout(() => { msg.innerText = ""; }, 3000);
        
    } catch (error) {
        console.error('Upload error:', error);
        msg.innerText = 'Upload failed: ' + handleSupabaseError(error);
        msg.className = "message error";
    }
}

// ----------------------
// Logout & Back
// ----------------------
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = "index.html";
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = "index.html";
    }
}

function goBack() { 
    window.history.back(); 
}

// ----------------------
// Profile Modal
// ----------------------
async function openProfileModal() {
    document.getElementById('profileName').innerText = userData.name || 'N/A';
    document.getElementById('profileEmail').innerText = userData.email || 'N/A';
    document.getElementById('profileRole').innerText = userData.role === 'admin' ? 'Admin' : 'Customer';
    document.getElementById('profileModal').classList.add('show');

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
            uploads.forEach(d => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.innerHTML = `<strong>${d.originalname}</strong> <small style="color:#666;">(${new Date(d.uploadedat).toLocaleString()})</small>`;
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
    document.getElementById('profileModal').classList.remove('show'); 
}

// ----------------------
// Event Listeners
// ----------------------
if (uploadBtn) uploadBtn.addEventListener("click", upload);
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (backBtn) backBtn.addEventListener("click", goBack);
if (profileBtn) profileBtn.addEventListener("click", openProfileModal);
if (closeProfileBtn) closeProfileBtn.addEventListener("click", closeProfileModal);
