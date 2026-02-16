# 🔒 Security Checklist - Pre-Deployment

## ⚠️ CRITICAL - Must Complete Before Going Live

### 📝 Configuration

- [ ] **Change ALL default passwords**
  - [ ] Generate new JWT password hash
  - [ ] Update `JURY_PASSWORD_HASH` in config.php
  - [ ] Change database password
  - [ ] Use strong passwords (16+ characters, mixed case, numbers, symbols)

- [ ] **Update config.php**
  - [ ] Replace `DB_USER` with production database user
  - [ ] Replace `DB_PASS` with production database password
  - [ ] Replace `DB_NAME` with production database name
  - [ ] Update `MAIL_FROM` with production email
  - [ ] Update `ADMIN_EMAIL` with production email
  - [ ] Update `SITE_URL` with production domain (HTTPS)
  - [ ] Set `APP_ENV` to 'production'

- [ ] **Create .env file** (optional but recommended)
  - [ ] Copy `.env.example` to `.env`
  - [ ] Fill in production values
  - [ ] Set proper permissions: `chmod 600 .env`
  - [ ] Verify `.env` is in `.gitignore`

### 🔐 File Permissions

```bash
# Set secure permissions
chmod 755 api/
chmod 644 api/*.php
chmod 600 api/config.php  # Extra secure for config
chmod 755 uploads/
chmod 755 uploads/cin/
chmod 755 uploads/projets/
chmod 666 error_log.txt
```

- [ ] **Verify no files are 777 (world-writable)**
  ```bash
  find . -type f -perm 0777
  # Should return nothing
  ```

- [ ] **Verify no directories are 777 except temp if needed**
  ```bash
  find . -type d -perm 0777
  ```

### 🌐 Web Server Configuration

#### Apache (.htaccess)

- [ ] **Create/Update .htaccess in root:**
  ```apache
  # Protect sensitive files
  <FilesMatch "^\.env|\.git|config\.php|error_log\.txt|BACKEND_|\.md$">
      Order allow,deny
      Deny from all
  </FilesMatch>
  
  # Prevent directory listing
  Options -Indexes
  
  # Force HTTPS
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # PHP security
  php_flag display_errors Off
  php_flag log_errors On
  php_value error_log error_log.txt
  ```

- [ ] **Create .htaccess in api/ folder:**
  ```apache
  # Protect config files
  <Files "config.php">
      Order allow,deny
      Deny from all
  </Files>
  ```

- [ ] **Create .htaccess in uploads/ folder:**
  ```apache
  # Prevent PHP execution in uploads
  <FilesMatch "\.php$">
      Order allow,deny
      Deny from all
  </FilesMatch>
  
  # Only allow specific file types
  <FilesMatch "\.(jpg|jpeg|png|pdf|webp)$">
      Order allow,deny
      Allow from all
  </FilesMatch>
  ```

#### Nginx (if applicable)

- [ ] **Add to nginx.conf:**
  ```nginx
  # Block access to sensitive files
  location ~ /\.(env|git|htaccess) {
      deny all;
  }
  
  location ~ /(config|error_log)\.php {
      deny all;
  }
  
  # Prevent PHP execution in uploads
  location ^~ /uploads/ {
      location ~ \.php$ {
          deny all;
      }
  }
  
  # Force HTTPS
  if ($scheme != "https") {
      return 301 https://$host$request_uri;
  }
  ```

### 💾 Database Security

- [ ] **Create limited database user:**
  ```sql
  CREATE USER 'majorelle_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
  GRANT SELECT, INSERT, UPDATE ON majorelle_db.* TO 'majorelle_app'@'localhost';
  FLUSH PRIVILEGES;
  ```

- [ ] **Remove default/test data:**
  ```sql
  -- Delete test registrations
  DELETE FROM candidats WHERE email LIKE '%test%' OR email LIKE '%example%';
  
  -- Verify admin users
  SELECT * FROM admin_users;
  ```

- [ ] **Database backups configured:**
  - [ ] Automated daily backups
  - [ ] Backup retention policy (30 days)
  - [ ] Test restore procedure
  - [ ] Off-site backup storage

- [ ] **Database access restrictions:**
  - [ ] Bind to localhost only (127.0.0.1)
  - [ ] Firewall blocks external MySQL port (3306)
  - [ ] Strong MySQL root password

### 📧 Email Configuration

- [ ] **SPF Record configured**
  ```dns
  TXT @ "v=spf1 a mx include:your-email-provider.com ~all"
  ```

- [ ] **DKIM configured**
  - [ ] DKIM keys generated
  - [ ] DNS records added
  - [ ] Verified with email provider

- [ ] **DMARC configured**
  ```dns
  TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com"
  ```

- [ ] **Test email delivery:**
  - [ ] Send test registration email
  - [ ] Verify not in spam
  - [ ] Check all links work
  - [ ] Verify bilingual format displays correctly

### 🔥 Firewall & Network

- [ ] **Firewall rules configured:**
  ```bash
  # Allow web traffic
  ufw allow 80/tcp
  ufw allow 443/tcp
  
  # Allow SSH (change 22 to custom port in production)
  ufw allow 22/tcp
  
  # Block MySQL from external
  ufw deny 3306/tcp
  
  # Enable firewall
  ufw enable
  ```

- [ ] **Fail2ban configured (optional but recommended):**
  ```bash
  # Install
  apt-get install fail2ban
  
  # Configure to monitor error_log.txt for failed logins
  ```

### 🔍 Testing

- [ ] **Functionality tests:**
  - [ ] Registration form works
  - [ ] CIN files upload successfully (both sides)
  - [ ] Email confirmation received
  - [ ] Admin login works
  - [ ] Candidate list displays
  - [ ] Approve candidate works
  - [ ] Approval email received with valid link
  - [ ] Project submission works
  - [ ] All 3 PDFs upload successfully
  - [ ] Submission confirmation email received
  - [ ] Rejection flow works
  - [ ] Rejection email received

- [ ] **Security tests:**
  - [ ] SQL injection attempts blocked
  - [ ] XSS attempts blocked
  - [ ] Invalid file types rejected
  - [ ] File size limits enforced
  - [ ] Rate limiting works (trigger it)
  - [ ] Invalid tokens rejected
  - [ ] Used tokens cannot be reused
  - [ ] Session timeout works
  - [ ] Direct file access blocked (.env, config.php)
  - [ ] PHP execution in uploads/ blocked

- [ ] **Email tests:**
  - [ ] All emails arrive (not in spam)
  - [ ] Links in emails work
  - [ ] Bilingual format displays correctly
  - [ ] BCC to admin works
  - [ ] Email logs show success

### 📊 Monitoring Setup

- [ ] **Log monitoring:**
  ```bash
  # Set up log rotation
  touch /etc/logrotate.d/concours-archi
  
  # Add configuration
  /path/to/project/error_log.txt {
      weekly
      rotate 4
      compress
      missingok
      notifempty
  }
  ```

- [ ] **Monitoring script:**
  ```bash
  # Create monitor.sh
  #!/bin/bash
  
  # Check for errors in last hour
  ERRORS=$(grep -c "ERROR" error_log.txt | tail -100)
  if [ $ERRORS -gt 10 ]; then
      echo "High error count: $ERRORS" | mail -s "Alert" admin@domain.com
  fi
  
  # Check disk space
  DISK_USAGE=$(df -h | grep '/uploads' | awk '{print $5}' | sed 's/%//')
  if [ $DISK_USAGE -gt 80 ]; then
      echo "Disk usage high: ${DISK_USAGE}%" | mail -s "Disk Alert" admin@domain.com
  fi
  ```

- [ ] **Set up cron jobs:**
  ```bash
  # Daily database backup
  0 2 * * * /path/to/backup_script.sh
  
  # Hourly monitoring
  0 * * * * /path/to/monitor.sh
  
  # Weekly cleanup of old rate limit files
  0 0 * * 0 find /tmp -name "ratelimit_*" -mtime +7 -delete
  ```

### 🔒 SSL/TLS Certificate

- [ ] **SSL certificate installed:**
  - [ ] Valid certificate from trusted CA
  - [ ] Certificate not self-signed
  - [ ] Certificate includes www subdomain
  - [ ] Auto-renewal configured (Let's Encrypt)

- [ ] **SSL configuration:**
  - [ ] TLS 1.2+ only
  - [ ] Strong cipher suites
  - [ ] HSTS header enabled
  - [ ] SSL Labs grade A or higher

- [ ] **Test SSL:**
  - [ ] Visit https://yourdomain.com (no warnings)
  - [ ] Check https://www.ssllabs.com/ssltest/

### 🧹 Cleanup

- [ ] **Remove development files:**
  ```bash
  rm -f test*.php
  rm -f debug*.php
  rm -f phpinfo.php
  rm -rf .git  # If deploying without git
  ```

- [ ] **Remove sensitive data:**
  - [ ] Clear error_log.txt of sensitive info
  - [ ] Remove test database records
  - [ ] Clear any debug output

### 📝 Documentation

- [ ] **Create admin credentials document (offline):**
  ```
  Admin Panel: https://yourdomain.com/api/admin_login.php
  Username: jury@fondationjardinmajorelle.com
  Password: [STORED IN PASSWORD MANAGER]
  
  Database:
  Host: localhost
  User: majorelle_app
  Password: [STORED IN PASSWORD MANAGER]
  Database: majorelle_db
  ```

- [ ] **Emergency contact list ready:**
  - [ ] Hosting support number
  - [ ] Database admin contact
  - [ ] Email service support
  - [ ] Developer contact

### 🎯 Final Verification

- [ ] **Pre-launch checklist:**
  - [ ] All passwords changed
  - [ ] All credentials secured
  - [ ] HTTPS working
  - [ ] Emails sending
  - [ ] Database working
  - [ ] File uploads working
  - [ ] Admin panel accessible
  - [ ] Error logging working
  - [ ] Backups configured
  - [ ] Monitoring active

- [ ] **Post-launch monitoring (first 24h):**
  - [ ] Check error logs every 2 hours
  - [ ] Verify registrations working
  - [ ] Monitor email delivery
  - [ ] Watch database growth
  - [ ] Check disk space
  - [ ] Verify no security alerts

### 🚨 Incident Response Plan

- [ ] **Document emergency procedures:**
  1. How to disable registration (if under attack)
  2. How to restore from backup
  3. How to contact hosting support
  4. How to check database integrity
  5. How to investigate security breach

- [ ] **Backup contacts:**
  - Primary: [Name, Phone, Email]
  - Secondary: [Name, Phone, Email]
  - Hosting: [Support Number]

---

## ✅ Sign-Off

| Check | Item | Date | Initials |
|-------|------|------|----------|
| [ ] | All configuration updated | ____ | ____ |
| [ ] | All passwords changed | ____ | ____ |
| [ ] | Security tests passed | ____ | ____ |
| [ ] | Backups configured | ____ | ____ |
| [ ] | Monitoring active | ____ | ____ |
| [ ] | SSL certificate valid | ____ | ____ |
| [ ] | Documentation complete | ____ | ____ |

**Final Approval:**

Approved by: ________________  Date: _________

Ready for production: ☐ YES  ☐ NO

---

**Last Updated:** February 2026  
**Version:** 3.0.0
