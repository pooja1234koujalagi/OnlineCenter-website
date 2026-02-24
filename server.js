require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser")
const supabase = require('./config/supabaseClient');
const app = express();
app.disable("x-powered-by");
const PORT = 5000;
const nodemailer = require('nodemailer');
const helmet = require("helmet");
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "img-src": ["'self'", "data:"],
      "style-src": ["'self'", "'unsafe-inline'"],
    },
  })
);
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development';
  }
});

app.use(limiter);
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many OTP attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development';
  }
});

app.use("/verify-otp", otpLimiter);

/* ===========================
MIDDLEWARE
=========================== */

/* ===========================
MIDDLEWARE
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.VERCEL_URL 
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));


app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html as default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// =====================
// AUTH MIDDLEWARE
// =====================
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// =====================
// PUBLIC PAGES
// =====================
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});
app.get('/regester.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'regester.html'));
});
app.get('/forgot-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'forgot-password.html'));
});

// =====================
// PROTECTED PAGES
// =====================
app.get('/dashboard.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});
app.get('/upload.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'upload.html'));
});
app.get('/info.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'info.html'));
});
app.get('/admin-info.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin-info.html'));
});

// =====================
// PROTECTED UPLOADS
// =====================
app.get('/uploads/:filename', authMiddleware, (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.sendFile(file);
});
/* ===========================
ENSURE UPLOAD FOLDER
=========================== */

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// Secure file upload configuration
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    }
});

// Input validation
const { body, validationResult } = require('express-validator');

// Sanitize HTML to prevent XSS
const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
        textFilter: function(text) {
            return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
    });
}

/* ===========================
DOWNLOAD FILE
=========================== */

app.get('/api/download/:filename', (req, res) => {
    try {
        // Decode URL-encoded filename
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(__dirname, 'uploads', filename);

        console.log("Download request for:", filename);
        console.log("File path:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        if (!fs.existsSync(filePath)) {
            console.log("File not found at path:", filePath);
            return res.status(404).send('File not found');
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(404).send('File not found');
            }
        });
    } catch (error) {
        console.error('Download endpoint error:', error);
        res.status(500).send('Server error');
    }
});

/* ===========================
SESSION CHECK
=========================== */

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: {
                id: req.session.user,
                name: req.session.name,
                role: req.session.role,
                email: req.session.email
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

/* ===========================
REGISTER
=========================== */

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

        const { data: existing, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (selectError) throw selectError;

        if (existing && existing.length > 0) return res.status(400).json({ success: false, message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if this should be admin user
        let userRole = 'customer';
        if (email === 'admin@example.com' || email === 'admin@janani.com' || name.toLowerCase().includes('admin')) {
            userRole = 'admin';
        }

        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
                mobile,
                role: userRole
            }]);

        if (insertError) throw insertError;

        res.json({ success: true, message: 'Registration successful!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

/* ===========================
LOGIN (with hashed password)
=========================== */

app.post('/login', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const { data: rows, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) throw error;

        if (!rows || rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        req.session.user = user.id;
        req.session.role = user.role;
        req.session.email = user.email;
        req.session.name = user.name;

        res.json({
            success: true,
            message: 'Login successful',
            role: user.role,
            name: user.name
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//DELETE==================



// ===========================
// DELETE FILE
// ===========================

app.delete('/api/delete/:filename', authMiddleware, async (req, res) => {
    try {
        // Decode URL-encoded filename
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(__dirname, 'uploads', filename);

        console.log("Delete request for:", filename);
        console.log("File path:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        // First try to delete from database (this will work even if file doesn't exist)
        const { error: dbError } = await supabase
            .from('uploads')
            .delete()
            .eq('filename', filename);

        if (dbError) {
            console.error("Database delete error:", dbError);
            // If database delete fails, try to find the file by partial match
            const { data: matchingFiles } = await supabase
                .from('uploads')
                .select('*')
                .ilike('filename', `%${filename.split('-')[0]}%`);
            
            if (matchingFiles && matchingFiles.length > 0) {
                console.log("Found matching files:", matchingFiles.map(f => f.filename));
                // Delete the first matching file
                const { error: deleteError } = await supabase
                    .from('uploads')
                    .delete()
                    .eq('id', matchingFiles[0].id);
                
                if (deleteError) {
                    throw deleteError;
                }
                
                // Try to delete the actual file if it exists
                const actualFilePath = path.join(__dirname, 'uploads', matchingFiles[0].filename);
                if (fs.existsSync(actualFilePath)) {
                    fs.unlinkSync(actualFilePath);
                    console.log("Actual file deleted from filesystem:", matchingFiles[0].filename);
                }
                
                return res.json({ message: "File deleted successfully" });
            }
            throw dbError;
        }

        console.log("File deleted from database");

        // Then try to delete from filesystem if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("File deleted from filesystem");
        } else {
            console.log("File not found in filesystem, but database record deleted");
        }

        res.json({ message: "File deleted successfully" });

    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Server error while deleting file" });
    }
});

// Get Info
app.get('/get-info', async (req, res) => {
    try {
        const { data: result, error } = await supabase
            .from('admin_info')
            .select('callforms, required_documents')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!result || result.length === 0) {
            return res.json({ callForms: "No information added yet.", requiredDocuments: "No documents listed yet." });
        }
        
        res.json({ callForms: result[0].callforms, requiredDocuments: result[0].required_documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Update Info (Admin Only)
app.post('/update-info', async (req, res) => {
    if (!req.session.user || req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized', success: false });
    }
    
    const { callForms, requiredDocuments } = req.body;
    console.log('Update Info - Received:', { callForms, requiredDocuments });
    
    try {
        // Get all existing records and delete them
        const { data: existingRecords, error: fetchError } = await supabase
            .from('admin_info')
            .select('id');
            
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.log('Fetch error:', fetchError);
        }
        
        // Delete existing records if any exist
        if (existingRecords && existingRecords.length > 0) {
            const { error: deleteError } = await supabase
                .from('admin_info')
                .delete()
                .in('id', existingRecords.map(r => r.id));

            if (deleteError) {
                console.log('Delete error:', deleteError);
            }
        }

        // Insert new info
        const { error: insertError } = await supabase
            .from('admin_info')
            .insert([{
                callforms: sanitizeInput(callForms),
                required_documents: sanitizeInput(requiredDocuments)
            }]);

        if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
        }

        console.log('Info updated successfully');
        res.json({ message: 'Information updated successfully', success: true });
    } catch (error) {
        console.error('Update info error:', error);
        res.status(500).json({ message: 'Error updating information', success: false });
    }
});

// Clear Info (Admin Only)
app.post('/clear-info', async (req, res) => {
    if (!req.session.user || req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized', success: false });
    }
    
    console.log('Clear Info - Admin user clearing info');
    
    try {
        // Get all existing records and delete them
        const { data: existingRecords, error: fetchError } = await supabase
            .from('admin_info')
            .select('id');
            
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.log('Fetch error:', fetchError);
        }
        
        // Delete existing records if any exist
        if (existingRecords && existingRecords.length > 0) {
            const { error } = await supabase
                .from('admin_info')
                .delete()
                .in('id', existingRecords.map(r => r.id));

            if (error) {
                console.error('Clear info error:', error);
                throw error;
            }
        }

        console.log('Info cleared successfully');
        res.json({ message: 'Information cleared successfully', success: true });
    } catch (error) {
        console.error('Clear info error:', error);
        res.status(500).json({ message: 'Error clearing information', success: false });
    }
});

/* ===========================
UPLOADS
=========================== */

app.post('/upload', upload.array('files', 10), async (req, res) => {
    console.log('=== UPLOAD ATTEMPT ===');
    console.log('Session user ID:', req.session.user);
    console.log('Session user name:', req.session.name);
    console.log('Session user email:', req.session.email);
    console.log('Session user role:', req.session.role);
    console.log('Is authenticated:', !!req.session.user);
    
    if (!req.session.user) {
        console.log('Upload rejected: No session found');
        return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!req.files || req.files.length === 0) {
        console.log('Upload rejected: No files provided');
        return res.status(400).json({ message: 'No files uploaded' });
    }
    
    try {
        // Try multiple approaches to clear schema cache
        try {
            await supabase.rpc('invalidate_schema_cache');
        } catch (cacheError) {
            console.log('Cache invalidation failed:', cacheError);
        }
        
        // Alternative: Force schema refresh
        await supabase.from('uploads').select('*').limit(1);
        
        for (let file of req.files) {
            console.log('Uploading file:', file.originalname);
            console.log('Extra data:', req.body.extraData);
            console.log('User:', req.session.name);
            console.log('Email:', req.session.email);
            
            const { error } = await supabase
                .from('uploads')
                .insert([{
                    user: req.session.name,
                    useremail: req.session.email,
                    filename: file.filename,
                    originalname: file.originalname,
                    extradata: req.body.extraData || '',
                    uploadedat: new Date()
                }]);

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }
            
            console.log('File uploaded successfully for:', req.session.name);
        }
        res.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

/* ===========================
CLEAN DUPLICATE UPLOADS
=========================== */

app.delete('/api/clean-duplicates', async (req, res) => {
    if (!req.session.user || req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    
    try {
        console.log('=== CLEANING DUPLICATE UPLOADS ===');
        
        // Get all uploads
        const { data: allUploads, error: fetchError } = await supabase
            .from('uploads')
            .select('*');
            
        if (fetchError) throw fetchError;
        
        console.log('Total uploads found:', allUploads.length);
        
        // Group by filename to find duplicates
        const filenameGroups = {};
        allUploads.forEach(upload => {
            const filename = upload.filename;
            if (!filenameGroups[filename]) {
                filenameGroups[filename] = [];
            }
            filenameGroups[filename].push(upload);
        });
        
        // Find duplicates and keep only the first occurrence
        const duplicatesToDelete = [];
        const uniqueFilenames = new Set();
        
        Object.keys(filenameGroups).forEach(filename => {
            const uploads = filenameGroups[filename];
            if (uploads.length > 1) {
                console.log(`Found ${uploads.length} duplicates for filename: ${filename}`);
                // Keep the first one, delete the rest
                for (let i = 1; i < uploads.length; i++) {
                    duplicatesToDelete.push(uploads[i].id);
                }
                uniqueFilenames.add(filename);
            }
        });
        
        console.log('Duplicates to delete:', duplicatesToDelete.length);
        console.log('Unique filenames to keep:', uniqueFilenames.size);
        
        // Delete duplicates
        if (duplicatesToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('uploads')
                .delete()
                .in('id', duplicatesToDelete);
                
            if (deleteError) {
                console.error('Error deleting duplicates:', deleteError);
                throw deleteError;
            }
            
            console.log('Successfully deleted', duplicatesToDelete.length, 'duplicate uploads');
        }
        
        res.json({ 
            message: `Cleaned ${duplicatesToDelete.length} duplicate uploads. Kept ${uniqueFilenames.size} unique files.`,
            duplicatesDeleted: duplicatesToDelete.length,
            uniqueFilesKept: uniqueFilenames.size
        });
        
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
        res.status(500).json({ message: 'Error cleaning duplicates' });
    }
});

/* ===========================
GET MY UPLOADS
=========================== */

app.get('/api/my-uploads', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });
    
    console.log('=== API MY-UPLOADS CALLED ===');
    console.log('API call from user:', req.session.name);
    console.log('User role:', req.session.role);
    console.log('User email:', req.session.email);
    console.log('============================');
    
    try {
        let result;
        
        // Fetch uploads based on user role
        console.log('=== DEBUG USER INFO ===');
        console.log('Session user:', req.session.user);
        console.log('Session email:', req.session.email);
        console.log('Session role:', req.session.role);
        console.log('=====================');
        
        if (req.session.role === 'admin') {
            console.log('Fetching ALL uploads for admin');
            const { data, error } = await supabase
                .from('uploads')
                .select('*')
                .order('uploadedat', { ascending: false });
            result = data;
        } else {
            console.log('Fetching customer uploads for:', req.session.email);
            const { data, error } = await supabase
                .from('uploads')
                .select('*')
                .eq('useremail', req.session.email)
                .order('uploadedat', { ascending: false });
            result = data;
        }
        
        // For admin dashboard, also fetch all users' uploads to show complete picture
        if (req.session.role === 'admin') {
            console.log('Admin dashboard: Fetching all user uploads for complete view');
            // Already fetched all uploads above, so result contains all users' uploads
        }

        console.log('=== RAW DATABASE RESULTS ===');
        console.log('Raw data from Supabase:', result);
        console.log('Total records from DB:', result ? result.length : 0);
        console.log('============================');
        
        // Return all uploads without deduplication
        // Users should see all their uploaded files
        console.log('=== RETURNING ALL UPLOADS ===');
        console.log('Total uploads returned:', result ? result.length : 0);
        finalData = result;
        
        console.log('=== FINAL RESPONSE DATA ===');
        console.log('Final data count:', finalData ? finalData.length : 0);
        console.log('========================');
        
        res.json(finalData || []);
    } catch (error) {
        console.error('Error in /api/my-uploads:', error);
        res.status(500).json({ success: false });
    }
});

/* ===========================
LOGOUT
=========================== */

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

// ==================== MIDDLEWARE ====================

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.VERCEL_URL || 'https://your-domain.vercel.app'] 
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
};
app.use(cors(corsOptions));

// Secure session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));




// Nodemailer transporter using App Password
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASS
    }
});

// ----------------------
// SEND OTP
// ----------------------
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        const { data: rows, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (selectError) throw selectError;

        if (!rows || rows.length === 0) return res.json({ success: false, message: "Email not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expire = new Date(Date.now() + 10 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('users')
            .update({ reset_otp: hashedOtp, otp_expire: expire })
            .eq('email', email);

        if (updateError) throw updateError;

        console.log("OTP saved to DB (hashed):", hashedOtp);

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Janani Enterprise Password Reset OTP",
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>
                   <p>It will expire in 10 minutes.</p>`
        });

        res.json({ success: true, message: "OTP sent to your email" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ----------------------
// VERIFY OTP
app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.json({ success: false, message: "Email & OTP required" });

        const { data: rows, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) throw error;

        if (!rows || rows.length === 0) return res.json({ success: false, message: "Invalid request" });

        const user = rows[0];

        console.log("User input OTP:", otp);
        console.log("Hashed OTP in DB:", user.reset_otp);
        console.log("OTP expire:", user.otp_expire);
        console.log("Current time:", new Date());

        if (new Date() > new Date(user.otp_expire)) {
            console.log("OTP expired");
            return res.json({ success: false, message: "OTP expired" });
        }

        const match = await bcrypt.compare(otp, user.reset_otp);
        console.log("OTP match result:", match);

        if (!match) return res.json({ success: false, message: "Invalid OTP" });

        req.session.resetEmail = email;
        console.log("Session resetEmail set:", req.session.resetEmail);

        res.json({ success: true, message: "OTP verified successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// RESET PASSWORD
// ----------------------
app.post("/set-password", async (req, res) => {
    try {
        const email = req.session.resetEmail;
        const { password } = req.body;

        if (!email) return res.status(403).json({ success: false, message: "OTP verification required" });
        if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword, reset_otp: null, otp_expire: null })
            .eq('email', email);

        if (error) throw error;

        req.session.resetEmail = null;

        res.json({ success: true, message: "Password reset successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
