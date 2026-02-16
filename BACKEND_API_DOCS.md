# Backend API Documentation - v3.0
Prix Fondation Jardin Majorelle 2026

## 📚 Table of Contents
- [Architecture Overview](#architecture-overview)  
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [File Uploads](#file-uploads)
- [Email System](#email-system)
- [Security](#security)

---

## 🏗️ Architecture Overview

### File Structure
```
api/
├── config.php                    # Configuration & constants
├── helpers.php                   # Helper functions
├── db_connect.php                # Database connection
├── register.php                  # Step 1: Registration endpoint
├── admin_login.php               # Admin authentication
├── admin_review.php              # Admin review panel
├── admin_panel.php               # Admin dashboard
├── submit_project.php            # Step 2: Project submission
├── email_templates.php           # Registration email templates
├── email_templates_step2.php    # Project submission templates
└── email_templates_approval.php  # Approval email templates
```

### Key Features
- ✅ RESTful API design
- ✅ Rate limiting
- ✅ CORS support
- ✅ Transaction-based operations
- ✅ Comprehensive error logging
- ✅ Input validation & sanitization
- ✅ Secure file uploads
- ✅ Multi-language support (FR/EN/AR)

---

## 🌐 API Endpoints

### 1. Registration Endpoint

**URL:** `POST /api/register.php`

**Purpose:** Step 1 - Candidate registration

**Parameters:**
```json
{
  "nom": "string (required)",
  "prenom": "string (required)",
  "email": "email (required)",
  "date_naissance": "YYYY-MM-DD (required)",
  "adresse": "string",
  "phone_code": "string (default: +212)",
  "phone_number": "string",
  "ecole_archi": "string (required)",
  "diplome": "string (required)",
  "annee_obtention": "integer (required)",
  "num_ordre": "string (required, CNOA number)",
  "language": "string (fr|en|ar, default: fr)",
  "cin_recto": "file (jpg|jpeg|png|pdf|webp, max: 5MB)",
  "cin_verso": "file (jpg|jpeg|png|pdf|webp, max: 5MB)"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Inscription réussie ! Vérifiez vos emails.",
  "data": {
    "candidat_id": 123
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Validation échouée",
  "errors": [
    "Le nom est obligatoire.",
    "Format d'email invalide."
  ]
}
```

**Rate Limit:** 5 attempts per hour per IP

---

### 2. Admin Login

**URL:** `POST /api/admin_login.php`

**Purpose:** Authenticate jury/admin users

**Parameters:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response:** Redirects to admin panel on success

**Rate Limit:** 5 attempts per 15 minutes per IP

**Session:** Creates session with 2-hour timeout

---

### 3. Admin Review Actions

**URL:** `GET /api/admin_review.php?action={action}&id={candidat_id}`

**Actions:**
- `valider` - Approve candidate, send unique submission link
- `refuser` - Reject candidate, send rejection email

**Authentication:** Required (session-based)

**Response:** Redirects back to review page with status message

---

### 4. Project Submission Endpoint

**URL:** `POST /api/submit_project.php`

**Purpose:** Step 2 - Project file submission

**Parameters:**
```json
{
  "token": "string (required, from approval email)",
  "language": "string (fr|en|ar)",
  "bio_file": "file (PDF only, max: 2MB)",
  "presentation_file": "file (PDF only, max: 2MB)",
  "aps_file": "file (PDF only, max: 10MB)"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Projet soumis avec succès !"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Ce lien est invalide, a expiré ou a déjà été utilisé."
}
```

**Rate Limit:** 3 attempts per 10 minutes per IP

**Important:** Token is single-use and invalidated after successful submission

---

## 🔐 Authentication

### Session-Based Authentication
- Used for admin panel
- Session timeout: 2 hours
- IP address validation
- Automatic session refresh on activity

### Token-Based Authentication
- Used for project submission (Step 2)
- Tokens: 64-character random hex
- Single-use tokens
- No expiration date (controlled by status)

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Optional array of specific errors"]
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (invalid token/access denied)
- `405` - Method Not Allowed
- `409` - Conflict (duplicate registration)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection)

### Error Logging
All errors logged to `error_log.txt`:
```
[2026-02-12 10:30:45] [ERROR] [IP:192.168.1.1] Registration error: File upload failed
[2026-02-12 10:31:12] [WARNING] [IP:192.168.1.2] SECURITY: Rate limit exceeded
[2026-02-12 10:32:00] [INFO] [IP:192.168.1.3] NEW REGISTRATION SUCCESS | ID: 123
```

---

## 🚦 Rate Limiting

### Implementation
Rate limits stored in temporary files (system temp directory)

### Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/register.php` | 5 attempts | 1 hour |
| `/admin_login.php` | 5 attempts | 15 min |
| `/submit_project.php` | 3 attempts | 10 min |

### Rate Limit Response
```json
{
  "success": false,
  "message": "Trop de tentatives. Réessayez dans 23 minutes."
}
```

HTTP Status: `429 Too Many Requests`

---

## 📁 File Uploads

### Validation Rules

#### CIN Files (Registration)
- **Formats:** JPG, JPEG, PNG, PDF, WEBP
- **Max Size:** 5 MB per file
- **Required:** Both recto and verso
- **MIME Validation:** Enforced

#### Project Files (Submission)
- **Formats:** PDF only
- **Max Sizes:**
  - Biography: 2 MB
  - Presentation: 2 MB
  - APS: 10 MB
- **MIME Validation:** Enforced (application/pdf)

### Security Measures
- Filename sanitization
- Unique filename generation (prefix_uniqid_timestamp.ext)
- Directory traversal prevention
- MIME type verification
- File size validation
- Virus scanning (recommended for production)

### Upload Directory Structure
```
uploads/
├── cin/
│   ├── RECTO_abc123_1707734400.jpg
│   └── VERSO_def456_1707734401.jpg
└── projets/
    ├── BIO_ghi789_1707820800.pdf
    ├── NOTE_jkl012_1707820801.pdf
    └── APS_mno345_1707820802.pdf
```

---

## 📧 Email System

### Email Templates
1. **Registration Confirmation** (`email_templates.php`)
   - Sent to: Candidate  
   - Bilingual (FR/EN)
   - Contains: Application number, CNOA number, next steps

2. **Jury Notification** (`email_templates.php`)
   - Sent to: Admin
   - Contains: Candidate details, review link

3. **Approval Email** (`email_templates_approval.php`)
   - Sent to: Approved candidate
   - Bilingual (FR/EN)
   - Contains: Unique submission link, deadline, instructions

4. **Project Confirmation** (`email_templates_step2.php`)
   - Sent to: Candidate after submission
   - Bilingual (FR/EN)
   - Contains: Confirmation, next steps, timeline

### Email Function
```php
sendEmail($to, $subject, $htmlBody, $isHighPriority = false)
```

### Features
- HTML email support
- UTF-8 encoding
- BCC to admin (optional)
- Timeout protection (15s)
- Error logging
- Non-blocking (doesn't halt operations on failure)

---

## 🔒 Security

### Input Sanitization
```php
// All user inputs sanitized
$clean = sanitizeInput($input);  // HTML entities, trim, UTF-8
$email = validateEmail($email);  // Email validation
```

### SQL Injection Prevention
- Prepared statements (PDO)
- Parameter binding
- No dynamic SQL construction

### XSS Prevention
- HTML entities encoding
- Content Security Policy headers
- Output escaping

### CSRF Protection
```php
$token = generateCSRFToken();  // Session-based tokens
verifyCSRFToken($token);       // Token verification
```

### File Upload Security
- Extension whitelist
- MIME type check
- File size limits
- Filename sanitization
- Unique filenames

### Password Hashing
```php
// Using Argon2ID (strongest available)
$hash = hashPassword($password);
password_verify($password, $hash);
```

### Security Headers
```php
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### Session Security
- HTTPOnly cookies
- Secure cookies (HTTPS)
- Session timeout
- IP validation
- Session regeneration after login

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST https://yourdomain.com/api/register.php \
  -F "nom=Doe" \
  -F "prenom=John" \
  -F "email=john@example.com" \
  -F "date_naissance=1995-01-15" \
  -F "ecole_archi=ENA" \
  -F "diplome=Architecte DPLG" \
  -F "annee_obtention=2020" \
  -F "num_ordre=CNOA12345" \
  -F "language=fr" \
  -F "cin_recto=@/path/to/recto.jpg" \
  -F "cin_verso=@/path/to/verso.jpg"
```

### Test Rate Limiting
```bash
# Send 6 requests rapidly (should trigger rate limit)
for i in {1..6}; do
  curl -X POST https://yourdomain.com/api/register.php \
    -F "email=test$i@example.com" \
    -F "nom=Test" -F "prenom=User"
done
```

---

## 📊 Database Schema

### Candidats Table
```sql
CREATE TABLE candidats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  date_naissance DATE,
  cin_recto VARCHAR(255),
  cin_verso VARCHAR(255),
  adresse TEXT,
  email VARCHAR(150) UNIQUE,
  phone_code VARCHAR(10),
  phone_number VARCHAR(20),
  ecole_archi VARCHAR(200),
  diplome VARCHAR(150),
  annee_obtention INT,
  num_ordre VARCHAR(50) UNIQUE,
  language VARCHAR(2),
  status ENUM('pending', 'approved', 'rejected', 'completed'),
  token_step2 VARCHAR(64),
  bio_file VARCHAR(255),
  presentation_file VARCHAR(255),
  aps_file VARCHAR(255),
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_approved DATETIME,
  date_rejected DATETIME,
  date_submission_step2 DATETIME,
  INDEX idx_email (email),
  INDEX idx_num_ordre (num_ordre),
  INDEX idx_status (status),
  INDEX idx_token (token_step2)
);
```

---

## 🔄 Workflow

```
1. Candidate Registration
   ↓ (submit form + CIN files)
   ↓ → API validates
   ↓ → Files uploaded
   ↓ → Database record created
   ↓ → Confirmation email sent to candidate
   ↓ → Notification email sent to admin
   ↓ → Response: Success

2. Admin Review
   ↓ (admin logs in)
   ↓ → Views candidate list
   ↓ → Reviews candidate details
   ↓ → Action: Approve OR Reject
   
   If APPROVED:
   ↓ → Generate unique token
   ↓ → Update status to 'approved'
   ↓ → Send approval email with link
   ↓ → Candidate receives submission link
   
   If REJECTED:
   ↓ → Update status to 'rejected'
   ↓ → Send polite rejection email
   ↓ → End

3. Project Submission
   ↓ (candidate clicks unique link)
   ↓ → Token validated
   ↓ → Upload form displayed
   ↓ → Submit 3 PDF files
   ↓ → API validates files
   ↓ → Files uploaded
   ↓ → Database updated
   ↓ → Token invalidated
   ↓ → Confirmation email sent
   ↓ → Status: 'completed'
```

---

## 🆘 Troubleshooting

### Common Issues

**Problem:** Database connection fails  
**Solution:** Check credentials in config.php, verify MySQL running, check firewall

**Problem:** Emails not sending  
**Solution:** Check SMTP settings, verify `mail()` function works, check spam folder

**Problem:** File upload fails  
**Solution:** Check directory permissions (755 for dirs, 644 for files), verify upload limits in php.ini

**Problem:** Rate limiting too aggressive  
**Solution:** Adjust limits in config.php, clear rate limit cache in /tmp/

**Problem:** Session timeout too short  
**Solution:** Increase SESSION_LIFETIME in config.php

**Problem:** CORS errors  
**Solution:** Add your domain to ALLOWED_ORIGINS in config.php

---

**Version:** 3.0.0  
**Last Updated:** February 2026
