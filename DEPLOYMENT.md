# Deployment Guide - Hostinger

This guide will help you deploy the Prix Fondation Jardin Majorelle 2026 application to Hostinger.

## Prerequisites

- Hostinger hosting account with PHP and MySQL
- FTP/SFTP access credentials
- Domain name configured

## Step-by-Step Deployment

### 1. Database Setup

1. **Log in to Hostinger Control Panel**
   - Go to your Hostinger hPanel

2. **Access MySQL Databases**
   - Navigate to "Databases" → "MySQL Databases"
   - Your database is already created: `u710497052_concours`

3. **Import Database Schema**
   - Click "phpMyAdmin" next to your database
   - Select your database from the left sidebar
   - Click "Import" tab
   - Upload `database_setup.sql` file
   - Click "Go" to execute

### 2. Backend (PHP) Deployment

1. **Connect via FTP/File Manager**
   - Use Hostinger File Manager or FTP client (FileZilla)
   - Navigate to `public_html/` directory

2. **Create API Directory**
   ```
   public_html/
   └── api/
       ├── db_connect.php
       └── register.php
   ```

3. **Upload PHP Files**
   - Upload `api/db_connect.php`
   - Upload `api/register.php`

4. **Create Uploads Directory**
   ```
   public_html/
   └── uploads/
       └── cin/
   ```
   
   Set permissions to **755** for `uploads/` and `cin/` directories

5. **Update CORS Settings in register.php**
   
   Replace:
   ```php
   header("Access-Control-Allow-Origin: *");
   ```
   
   With your actual domain:
   ```php
   header("Access-Control-Allow-Origin: https://your-domain.com");
   ```

### 3. Frontend (React) Deployment

1. **Update Environment Variables**
   
   Edit `.env.production`:
   ```env
   VITE_API_URL=https://your-domain.com/api/register.php
   ```

2. **Build the Project**
   
   On your local machine:
   ```bash
   npm run build
   ```
   
   This creates a `dist/` folder with optimized files.

3. **Upload to Hostinger**
   
   ⚠️ **IMPORTANT**: Upload ONLY the **CONTENTS** of the `dist/` folder, not the dist folder itself!
   
   **What to upload:**
   - `dist/index.html` → Upload to `public_html/index.html`
   - `dist/assets/` → Upload to `public_html/assets/`
   - `dist/logo.svg` → Upload to `public_html/logo.svg`
   - Any other files in `dist/` → Upload to `public_html/`

   ❌ **WRONG**: Uploading `dist/` folder itself (creates `public_html/dist/`)
   ✅ **CORRECT**: Uploading contents of `dist/` to `public_html/` directly

   **File structure after upload:**
   ```
   public_html/
   ├── index.html          ← FROM dist/index.html (contains compiled JS references)
   ├── logo.svg            ← FROM dist/
   ├── assets/             ← FROM dist/assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── [other assets]
   ├── api/                ← Your PHP files (already there)
   │   ├── db_connect.php
   │   ├── register.php
   │   └── ...
   └── uploads/            ← Upload directory (already there)
       ├── cin/
       └── projets/
   ```

   **Common Mistake**: 
   - ❌ Having `public_html/dist/index.html` 
   - ✅ Should be `public_html/index.html`

4. **Upload .htaccess File**

   Upload the `.htaccess` file from your project root to `public_html/.htaccess`
   
   This file enables:
   - React Router URL handling (prevents 404 on page refresh)
   - Gzip compression for faster loading
   - Browser caching
   - Security headers
   
   **Note**: The `.htaccess` file is hidden. In File Manager, enable "Show Hidden Files" to see it.

### 4. Domain Configuration

1. **If using subdomain:**
   - Go to hPanel → Domains → Subdomains
   - Create: `concours.your-domain.com`
   - Point to `/public_html/concours/`

2. **If using main domain:**
   - Upload files directly to `/public_html/`

### 5. SSL Certificate

1. **Enable HTTPS:**
   - Go to hPanel → SSL
   - Install free Let's Encrypt SSL certificate
   - Enable "Force HTTPS" option

### 6. Testing

1. **Test Backend API:**
   ```
   https://your-domain.com/api/register.php
   ```
   Should return a JSON error (method not allowed) - this confirms PHP is working

2. **Test Frontend:**
   ```
   https://your-domain.com/
   ```
   The registration form should load

3. **Test Form Submission:**
   - Fill out the form
   - Upload test CIN files
   - Submit
   - Check database in phpMyAdmin for new entry
   - Check email for confirmation

### 7. Security Checklist

- [ ] Update database credentials in `db_connect.php`
- [ ] Change CORS settings from `*` to your domain
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enable HTTPS/SSL
- [ ] Test file upload size limits (check php.ini settings)
- [ ] Remove any test/debug code
- [ ] Update admin email in `register.php`

### 8. PHP Configuration (if needed)

If file uploads fail, update PHP settings in hPanel:

1. **Go to:** Advanced → PHP Configuration
2. **Update these values:**
   ```
   upload_max_filesize = 10M
   post_max_size = 10M
   max_execution_time = 300
   ```

### 9. Email Configuration

1. **Verify PHP mail() function is enabled**
   - Most Hostinger plans support it by default

2. **Alternative: Use PHPMailer (recommended)**
   
   If mail() doesn't work, install PHPMailer:
   ```bash
   composer require phpmailer/phpmailer
   ```
   
   Update `register.php` to use SMTP:
   ```php
   use PHPMailer\PHPMailer\PHPMailer;
   
   $mail = new PHPMailer();
   $mail->isSMTP();
   $mail->Host = 'smtp.hostinger.com';
   $mail->SMTPAuth = true;
   $mail->Username = 'your-email@your-domain.com';
   $mail->Password = 'your-password';
   $mail->SMTPSecure = 'tls';
   $mail->Port = 587;
   ```

## Troubleshooting

### Issue: 404 on API calls

**Solution:** Check `.htaccess` file or ensure `/api/` directory exists

### Issue: CORS errors

**Solution:** Update CORS headers in `register.php`

### Issue: File upload fails

**Solution:** 
- Check directory permissions (755)
- Increase PHP upload limits
- Verify `uploads/cin/` exists

### Issue: Database connection fails

**Solution:** 
- Verify credentials in `db_connect.php`
- Check if database exists in phpMyAdmin
- Ensure database user has proper privileges

### Issue: Blank page after deployment

**Solution:**
- Check browser console for errors
- Verify all assets loaded correctly
- Check if index.html exists in root

## Monitoring

1. **Check Error Logs:**
   - hPanel → Files → Error Logs
   - Look for PHP errors

2. **Database Monitoring:**
   - Use phpMyAdmin to check submissions
   - Monitor table size

3. **Email Delivery:**
   - Test email functionality regularly
   - Consider using email logging

## Maintenance

- Regular database backups (weekly)
- Monitor disk space (uploads folder)
- Update dependencies periodically
- Review and clean up old uploads

## Support

For deployment issues:
- Hostinger Support: https://www.hostinger.com/support
- Technical Contact: abdoraoui9@gmail.com

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Domain:** _____________  
**Status:** [ ] Deployed [ ] Tested [ ] Live
