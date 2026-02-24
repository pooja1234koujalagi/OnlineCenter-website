# 🛍️ Janani Enterprise Online Center

A modern, secure, and mobile-responsive web application for online document services and form assistance.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure login/logout with session management
- **Document Upload** - Multiple file upload with validation
- **Dashboard** - User and admin dashboards with role-based access
- **Profile Management** - User profile with document history
- **Admin Panel** - Complete admin control and user management

### Security Features
- **Helmet.js** - Security headers and CSP
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Sanitization and validation
- **Secure Sessions** - HTTP-only cookies in production
- **CORS Protection** - Configured for production domains

### Mobile Optimization
- **Responsive Design** - Works on all devices
- **Hamburger Menu** - Mobile-friendly navigation
- **Touch Targets** - 48px minimum touch targets
- **Optimized Tables** - Horizontal scrolling on mobile
- **Responsive Modals** - Mobile-optimized popups

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **Multer** - File upload handling
- **Nodemailer** - Email services
- **Bcrypt** - Password hashing

### Frontend
- **HTML5/CSS3** - Modern markup and styling
- **JavaScript (ES6+)** - Client-side functionality
- **Responsive CSS** - Mobile-first design

### Security & Performance
- **Helmet.js** - Security headers
- **Express-rate-limit** - Rate limiting
- **Express-validator** - Input validation
- **Sanitize-html** - XSS protection

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd onlineshop_project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure environment variables
# Edit .env with your Supabase and email credentials
```

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASS=your_gmail_app_password

# Session Security
SESSION_SECRET=your_random_32_character_secret_key

# Environment
NODE_ENV=production
```

## 🚀 Deployment

### Local Development
```bash
# Start development server
npm run dev

# Or start production server
npm start
```

### Vercel Deployment
1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel Dashboard
4. **Deploy** - Vercel will automatically detect and deploy

#### Vercel Environment Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_EMAIL`
- `SMTP_APP_PASS`
- `SESSION_SECRET`
- `VERCEL_URL`

## 📁 Project Structure

```
onlineshop_project/
├── frontend/           # Static HTML files
│   ├── home.html       # Landing page
│   ├── login.html      # User login
│   ├── register.html    # User registration
│   ├── dashboard.html   # User dashboard
│   ├── upload.html     # File upload
│   └── style.css      # Main stylesheet
├── js/                # Client-side JavaScript
├── uploads/           # File upload directory
├── config/            # Configuration files
├── server.js          # Main server file
├── serve.js           # Static server for development
├── package.json       # Dependencies and scripts
├── vercel.json       # Vercel configuration
└── .env.example      # Environment variables template
```

## 🔧 Configuration

### Database Setup
1. Create Supabase project
2. Run provided SQL migration scripts
3. Configure environment variables

### Email Setup
1. Enable 2FA on Gmail
2. Generate App Password
3. Configure SMTP credentials

## 🌐 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /api/session` - Check session status

### Documents
- `POST /upload` - Upload documents
- `GET /api/uploads` - Get user uploads
- `DELETE /api/uploads/:id` - Delete document

### User Management
- `GET /api/users` - Get users (admin)
- `PUT /api/users/:id` - Update user (admin)

## 📱 Mobile Features

- **Responsive Navigation** - Hamburger menu for mobile
- **Touch Optimization** - Large touch targets
- **Mobile Tables** - Horizontal scrolling
- **Responsive Modals** - Optimized for small screens
- **Mobile Forms** - Touch-friendly inputs

## 🔒 Security Measures

- **CSRF Protection** - Cross-site request forgery prevention
- **XSS Protection** - Input sanitization
- **SQL Injection** - Parameterized queries via Supabase
- **Rate Limiting** - API abuse prevention
- **Secure Headers** - Helmet.js protection
- **Session Security** - HTTP-only, secure cookies

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] File upload functionality
- [ ] Dashboard navigation
- [ ] Mobile responsiveness
- [ ] Admin functionality
- [ ] Error handling

### Security Testing
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting

## 📊 Performance

### Optimization Features
- **Static File Caching** - Optimized asset delivery
- **Image Compression** - Reduced file sizes
- **Database Optimization** - Efficient queries
- **CDN Ready** - Vercel edge network

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and inquiries:
- **Phone**: +91 81471 93304
- **Email**: [your-email@example.com]

## 🌟 Services Offered

- **Government Form Assistance** - PAN, Aadhar, Voter ID, Passport
- **Educational Applications** - Admissions, scholarships, exams
- **Job & Recruitment** - Applications and resume building
- **Online Portal Support** - Form filling and navigation
- **Digital Document Services** - Scanning and conversion
- **Consultation & Guidance** - Expert assistance

---

**Built with ❤️ for Janani Enterprise**
