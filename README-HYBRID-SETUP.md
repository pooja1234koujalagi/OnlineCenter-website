# Hybrid Setup: Express + Supabase

## Overview
This setup uses **Express.js as the backend** with **Supabase as the database**. The frontend communicates with the Express server, which then handles Supabase operations.

## Architecture
```
Frontend (HTML/JS) ←→ Express Server (localhost:5000) ←→ Supabase Database
```

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root:
```env
SUPABASE_URL=https://yqoabzheqfnvyrpwzutt.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASS=your_app_password
```

### 2. Database Setup
Run the `supabase-setup.sql` script in your Supabase SQL Editor to create:
- `users` table with RLS policies
- `uploads` table for file metadata
- `admin_info` table
- Proper indexes and triggers

### 3. Storage Setup
1. Create a bucket named "uploads" in Supabase Storage
2. Make it **private**
3. Apply storage policies from `storage-policies.sql`

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

### 6. Access the Application
- Frontend: http://localhost:5000
- API endpoints: http://localhost:5000/api/*

## How It Works

### Authentication Flow
1. User submits login/register form
2. Frontend sends request to Express server
3. Express server validates with Supabase
4. Express server creates session
5. Frontend receives response

### File Upload Flow
1. User selects files and uploads
2. Frontend sends to Express server
3. Express server uploads to Supabase Storage
4. Express server saves metadata to Supabase database
5. Frontend receives success response

### Security Features
- **Express Sessions** - Server-side session management
- **Supabase RLS** - Database-level security
- **File Validation** - Type and size checking
- **Rate Limiting** - Request throttling
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP headers protection

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /api/session` - Check session

### File Operations
- `POST /upload` - Upload files
- `GET /api/my-uploads` - Get user uploads
- `DELETE /api/delete/:filename` - Delete file
- `GET /api/download/:filename` - Download file

### Admin Operations
- `GET /get-info` - Get admin info
- `POST /update-info` - Update admin info
- `POST /clear-info` - Clear admin info

### Password Reset
- `POST /forgot-password` - Request reset
- `POST /verify-otp` - Verify OTP
- `POST /set-password` - Set new password

## File Structure
```
project/
├── server.js                 # Express server
├── config/
│   └── supabaseClient.js     # Supabase client config
├── js/
│   ├── login.js             # Frontend login logic
│   ├── register.js          # Frontend register logic
│   ├── dashboard.js         # Admin dashboard
│   └── upload.js            # File upload logic
├── frontend/
│   ├── *.html               # HTML pages
│   └── style.css            # Styles
├── uploads/                 # Local file storage (backup)
└── supabase-setup.sql       # Database setup script
```

## Benefits of Hybrid Approach

### ✅ Pros
- **Familiar Architecture** - Traditional Express setup
- **Server-side Sessions** - More secure than client-side
- **Easy Debugging** - Full server control
- **File Processing** - Server-side file handling
- **Custom Logic** - Complex business logic in server
- **Rate Limiting** - Server-side protection

### 🔧 Server Features
- **Session Management** - Express sessions
- **File Upload** - Multer for multipart forms
- **Email Services** - Nodemailer integration
- **Security Headers** - Helmet protection
- **Rate Limiting** - Express-rate-limit
- **CORS** - Cross-origin handling
- **Error Handling** - Centralized error management

## Production Deployment

### Environment Setup
1. Set production environment variables
2. Configure HTTPS with SSL certificates
3. Set up reverse proxy (nginx/Apache)
4. Configure process manager (PM2)

### Security Considerations
- Use HTTPS in production
- Set secure session cookies
- Implement proper CORS
- Use environment variables for secrets
- Enable request logging
- Set up monitoring

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Check SUPABASE_URL and SUPABASE_ANON_KEY
   - Verify Supabase project is active
   - Check RLS policies

2. **File Upload Issues**
   - Check uploads folder permissions
   - Verify Supabase Storage policies
   - Check file size limits

3. **Session Issues**
   - Clear browser cookies
   - Check session secret
   - Verify session middleware

4. **Email Issues**
   - Check SMTP credentials
   - Verify app password
   - Check email service settings

### Debug Tips
- Check server console logs
- Use browser DevTools
- Test API endpoints directly
- Verify database connections
- Check file permissions

---

**Ready to Run!** 🚀

Execute `node server.js` to start your Express + Supabase application.
