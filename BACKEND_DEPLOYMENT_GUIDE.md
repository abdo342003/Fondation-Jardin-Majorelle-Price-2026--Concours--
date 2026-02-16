# 🚀 Production Deployment Guide - Backend v3.0
Prix Fondation Jardin Majorelle 2026

## ✅ Pre-Deployment Checklist

### 1. **Files to Review**
- [ ] Update credentials in `api/config.php`
- [ ] Verify email settings (MAIL_FROM, ADMIN_EMAIL)
- [ ] Update SITE_URL to production domain
- [ ] Review file upload limits
- [ ] Check deadline dates

### 2. **Security Checks**
- [ ] All passwords changed from defaults
- [ ] `.env` file created with production values
- [ ] `.gitignore` includes `.env` and sensitive files
- [ ] Error display disabled in production
- [ ] HTTPS enabled
- [ ] Database credentials secured

### 3. **File Permissions**
```bash
# Set correct permissions
chmod 755 api/
chmod 644 api/*.php
chmod 755 uploads/
chmod 755 uploads/cin/
chmod 755 uploads/projets/
chmod 666 error_log.txt
```

### 4. **Directory Structure**
Ensure these directories exist:
```
/uploads/
  /cin/
  /projets/
/api/
  config.php
  helpers.php
  db_connect.php
  register.php
  admin_login.php
  admin_review.php
  admin_panel.php
  submit_project.php
  email_templates.php
  email_templates_step2.php
  email_templates_approval.php
error_log.txt
```

## 📝Configuration Steps

### Step 1: Update `api/config.php`

Replace these values:
```php
// Database
define('DB_HOST', 'your_host');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

// Email
define('MAIL_FROM', 'contact@yourdomain.com');
define('ADMIN_EMAIL', 'admin@yourdomain.com');

// Domain
define('SITE_URL', 'https://yourdomain.com');

// Admin Password (generate new hash)
define('JURY_PASSWORD_HASH', 'YOUR_NEW_HASH_HERE');
```

### Step 2: Generate New Admin Password Hash

```bash
# Generate password hash
php -r "echo password_hash('YourStrongPassword', PASSWORD_ARGON2ID);"

# Or use this PHP script:
<?php
echo password_hash('YourStrongPassword', PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,
    'time_cost' => 4,
    'threads' => 3
]);
?>
```

### Step 3: Database Setup

Run the SQL scripts in order:
```bash
mysql -u username -p database_name < database_setup.sql
mysql -u username -p database_name < migration_add_diplome.sql
mysql -u username -p database_name < migration_add_language.sql
```

### Step 4: Test Email Configuration

Create `test_email.php`:
```php
<?php
require 'api/config.php';
require 'api/helpers.php';

$result = sendEmail(
    'test@example.com',
    'Test Email',
    '<h1>Test</h1><p>If you receive this, email works!</p>',
    false
);

echo $result ? "✓ Email sent!" : "✗ Email failed!";
?>
```

Run and verify email is received.

### Step 5: PHP Configuration

Update `php.ini` or `.htaccess`:
```ini
# Increase upload limits
upload_max_filesize = 20M
post_max_size = 25M
max_execution_time = 300
memory_limit = 256M

# Enable error logging
log_errors = On
error_log = /path/to/error_log.txt
display_errors = Off

# Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

## 🔒 Security Hardening

### 1. Block Direct Access to Sensitive Files

Add to `.htaccess` in root:
```apache
# Protect sensitive files
<FilesMatch "^\.env|\.git|config\.php|error_log\.txt">
    Order allow,deny
    Deny from all
</FilesMatch>

# Prevent directory listing
Options -Indexes

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. Database User Privileges

Create limited database user:
```sql
-- Create user with minimal privileges
CREATE USER 'majorelle_app'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant only needed privileges
GRANT SELECT, INSERT, UPDATE ON majorelle_db.candidats TO 'majorelle_app'@'localhost';
GRANT SELECT, INSERT ON majorelle_db.admin_users TO 'majorelle_app'@'localhost';

FLUSH PRIVILEGES;
```

### 3. Firewall Rules (if applicable)

```bash
# Allow only web traffic
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH (use non-standard port in production)

# Block database port from external access
ufw deny 3306/tcp
```

## 📧 Email Troubleshooting

### Common Issues:

1. **Emails not sending**
   - Check `error_log.txt`
   - Verify SMTP settings
   - Test with simple mail() function
   - Check spam folder

2. **Emails end up in spam**
   - Configure SPF record
   - Configure DKIM
   - Configure DMARC
   - Use dedicated sending IP

3. **Email timeout errors**
   - Increase `max_execution_time`
   - Check email function timeout (default: 15s)

## 🧪 Testing Checklist

### Functionality Tests:
- [ ] Registration form submission
- [ ] CIN file upload (both sides)
- [ ] Email confirmation received
- [ ] Admin login works
- [ ] Candidate approval works
- [ ] Approval email sent with unique link
- [ ] Project submission works (Step 2)
- [ ] PDF validation works
- [ ] File size limits enforced
- [ ] Rate limiting works
- [ ] Session timeout works
- [ ] Error logging works

### Security Tests:
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Token validation
- [ ] Rate limiting
- [ ] Session hijacking prevention

## 📊 Monitoring

### 1. Check Logs Regularly

```bash
# View recent errors
tail -f error_log.txt

# Count errors by type
grep "ERROR" error_log.txt | wc -l
grep "WARNING" error_log.txt | wc -l

# View security events
grep "SECURITY" error_log.txt

# View failed login attempts
grep "Failed login" error_log.txt
```

### 2. Database Monitoring

```sql
-- Check registrations
SELECT COUNT(*) as total, status, COUNT(*) as count 
FROM candidats 
GROUP BY status;

-- Recent registrations
SELECT id, prenom, nom, email, date_inscription, status 
FROM candidats 
ORDER BY date_inscription DESC 
LIMIT 20;

-- Completed submissions
SELECT COUNT(*) 
FROM candidats 
WHERE status = 'completed';
```

### 3. File Storage Monitoring

```bash
# Check disk usage
du -sh uploads/

# Count uploaded files
ls -la uploads/cin/ | wc -l
ls -la uploads/projets/ | wc -l

# Find large files
find uploads/ -type f -size +10M -exec ls -lh {} \;
```

## 🔄 Backup Strategy

### 1. Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
mysqldump -u username -p database_name > backup_$DATE.sql
gzip backup_$DATE.sql

# Keep only last 30 days
find backups/ -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. File Backup

```bash
# Backup uploads folder
tar -czf uploads_backup_$(date +%Y-%m-%d).tar.gz uploads/

# Sync to remote server
rsync -avz uploads/ user@backup-server:/backups/uploads/
```

## 🆘 Emergency Procedures

### Database Connection Lost:
1. Check database server status
2. Verify credentials
3. Check connection limits
4. Review firewall rules

### Site Down:
1. Check error logs
2. Verify PHP/Apache running
3. Check disk space
4. Review recent changes

### Email System Down:
1. Check SMTP server
2. Review email logs
3. Test  with simple script
4. Contact hosting provider

## 📞 Support Contacts

- Hosting Support: [your hosting provider]
- Database Admin: [DBA contact]
- Email Service: [email provider]
- Developer: [your contact]

## 🎯 Performance Optimization

### 1. Enable OPcache

```ini
; php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### 2. Enable Gzip Compression

```apache
# .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 3. Browser Caching

```apache
# .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## ✅ Post-Deployment Verification

1. Visit production URL
2. Test registration flow
3. Test admin login
4. Verify emails arrive
5. Check error logs
6. Monitor for 24 hours
7. Verify backups working

---

**Last Updated:** February 2026  
**Version:** 3.0.0
