# 📧 Email System - Complete Guide
**Fondation Jardin Majorelle - Prix National d'Architecture 2026**

Version: 2.3 - Enhanced & Bilingual (French/English)  
Last Updated: February 9, 2026

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Email Workflows](#email-workflows)
3. [Configuration](#configuration)
4. [Testing & Monitoring](#testing--monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Admin Features](#admin-features)

---

## 🎯 System Overview

### Architecture
The email system is **fault-tolerant**, **non-blocking**, and **fully bilingual** (French & English), ensuring file uploads and database operations always succeed even if email delivery fails.

### Key Features
- ✅ **Bilingual Support**: All emails sent in both French and English simultaneously
- ✅ **Fault-Tolerant**: Email failures don't block critical operations
- ✅ **Admin BCC**: All candidate emails automatically copied to admin
- ✅ **Timeout Protection**: 10-second email timeout prevents hanging
- ✅ **Comprehensive Logging**: All email attempts logged to `error_log.txt`
- ✅ **HTML Templates**: Professional, responsive email designs
- ✅ **Security**: Proper headers, UTF-8 support, anti-spam compliance
- ✅ **Visual Language Separation**: Clear divider between French and English content

---

## 📨 Email Workflows

### 0. **Initial Registration Confirmation Email** (Bilingual)
**Trigger**: Candidate submits registration form in `register.php`

**Process**:
1. Registration data saved to database
2. CIN files uploaded successfully
3. Bilingual confirmation email sent to candidate
4. Admin receives notification for jury review

**Email Content (Bilingual)**:
- Subject: "✓ Inscription Reçue | Registration Received"
- **French Section:**
  - Personal greeting with candidate name
  - Application number and CNOA confirmation
  - Next steps (verification, jury review)
  - Professional branding
- **Visual Separator:** 🇬🇧 English Version badge
- **English Section:**
  - Complete translation of all French content
  - Same structure and information
  - Consistent professional tone

**File**: [`api/register.php`](api/register.php#L153-L265)

---

### 1. **Jury Validation Email** (Approved Candidate - Bilingual)
**Trigger**: Admin clicks "Valider & Inviter" in `admin_review.php`

**Process**:
1. Candidate status updated to `approved`
2. Secure token (64 chars) generated for Step 2
3. Bilingual email sent with personalized upload link
4. Admin receives BCC copy for tracking

**Email Content (Bilingual)**:
- Subject: "✓ Congratulations! Candidature Approuvée | Application Approved"
- **French Section:**
  - Personal greeting with candidate name
  - Validation badge and congratulations
  - Unique secure upload link
  - Instructions and deadline (March 15, 2026)
  - Professional branding
- **Visual Separator:** 🇬🇧 English Version badge
- **English Section:**
  - Complete translation of all French content
  - Same upload link (works in any language)
  - Deadline in English format
  - Matching professional tone

**File**: [`api/admin_review.php`](api/admin_review.php#L67-L157)

---

### 2. **Jury Rejection Email** (Bilingual)
**Trigger**: Admin clicks "Refuser le dossier" in `admin_review.php`

**Process**:
1. Candidate status updated to `rejected`
2. Bilingual polite rejection email sent
3. Admin receives BCC copy

**Email Content (Bilingual)**:
- Subject: "Information concernant votre candidature | About Your Application"
- **French Section:**
  - Professional, respectful tone
  - Encouragement to reapply next year
  - No personal data disclosed
- **Visual Separator:** 🇬🇧 English Version badge
- **English Section:**
  - Complete translation maintaining respectful tone
  - Same encouragement and professional courtesy

**File**: [`api/admin_review.php`](api/admin_review.php#L167-L224)

---

### 3. **Step 2 Confirmation Email** (Bilingual)
**Trigger**: Candidate successfully uploads project files in Step 2

**Process**:
1. Files uploaded to `uploads/projets/`
2. Database updated with file paths
3. Status changed to `completed`
4. Token nullified (one-time use)
5. **Bilingual email sent (isolated - won't block success response)**
6. Admin receives BCC copy

**Email Content (Bilingual)**:
- Subject: "✓ Dossier complet reçu | Application Complete"
- **French Section:**
  - Confirmation of received documents
  - List of uploaded files (Bio, Note, APS)
  - Timeline for jury review
  - Next steps and results date (May 15, 2026)
  - Success branding
- **Visual Separator:** 🇬🇧 English Version badge
- **English Section:**
  - Complete translation of confirmation
  - Same document list
  - Timeline in English
  - Professional closing

**File**: [`api/submit_project.php`](api/submit_project.php#L175-L290)

---

## ⚙️ Configuration

### Email Settings
Located in both `admin_review.php` and `submit_project.php`:

```php
// Admin email for BCC tracking
$adminEmail = "abdoraoui9@gmail.com";

// Email headers
From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>
Reply-To: contact@fondationjardinmajorelleprize.com
Bcc: abdoraoui9@gmail.com
```

### Timeout Protection
```php
set_time_limit(10);  // Max 10 seconds for email
@mail(...);          // @ suppresses warnings
set_time_limit(300); // Reset to normal
```

### Error Logging
All email operations logged to: `/home/u710497052/error_log.txt`

```php
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');
```

---

## 🧪 Testing & Monitoring

### Email Monitor Dashboard
Access: `https://fondationjardinmajorelleprize.com/api/email_monitor.php`

**Features**:
- 📊 **Live Statistics**: Total candidates, pending, approved, rejected, completed
- 📧 **Test Email**: Send test email to verify configuration
- 📋 **Error Log Viewer**: Last 50 log entries with color coding
- ⚡ **Quick Actions**: Refresh, clear display

**Usage**:
1. Open `email_monitor.php` in browser
2. Enter test email address (defaults to admin email)
3. Click "📤 Send Test Email"
4. Check inbox for confirmation
5. Review error logs for issues

---

### Manual Testing Checklist

#### Test Validation Email
1. Go to `admin_review.php?id=1`
2. Click "Valider & Inviter"
3. Check:
   - ✅ Candidate receives email with token link
   - ✅ Admin receives BCC copy
   - ✅ Token appears in database
   - ✅ Status changed to `approved`

#### Test Rejection Email
1. Go to `admin_review.php?id=2`
2. Click "Refuser le dossier"
3. Check:
   - ✅ Candidate receives polite rejection
   - ✅ Admin receives BCC copy
   - ✅ Status changed to `rejected`

#### Test Step 2 Confirmation
1. Use valid token link from validation email
2. Upload 3 PDF files (Bio, Note, APS)
3. Check:
   - ✅ Files appear in `uploads/projets/`
   - ✅ Database updated with file paths
   - ✅ Candidate receives confirmation email
   - ✅ Admin receives BCC copy
   - ✅ Token nullified in database
   - ✅ Status changed to `completed`

---

## 🔧 Troubleshooting

### Email Not Received

**Possible Causes**:
1. **Hostinger mail() function disabled**
   - Check Hostinger control panel settings
   - Enable PHP mail() function

2. **SPF/DKIM not configured**
   - Configure DNS records for domain
   - Add SPF: `v=spf1 include:hostinger.com ~all`
   - Add DKIM key from Hostinger panel

3. **Email in spam folder**
   - Check candidate's spam/junk folder
   - Whitelist `no-reply@fondationjardinmajorelleprize.com`

4. **Email blocked by server**
   - Check error_log.txt for messages
   - Look for "Email: WARNING - mail() returned false"

**Solution**:
```bash
# Check error log on Hostinger
tail -50 /home/u710497052/error_log.txt | grep "Email"
```

---

### Admin Not Receiving BCC

**Check**:
1. Verify admin email in code: `$adminEmail = "abdoraoui9@gmail.com";`
2. Check spam folder
3. Review error_log.txt for BCC failures

**Fix**:
Ensure BCC header is present:
```php
$headers .= "Bcc: $adminEmail\r\n";
```

---

### Email Sending Blocks Upload

**This is FIXED in v2.1+**

The email is now isolated in a try-catch block:
```php
try {
    // Email attempt
    @mail(...);
} catch (Throwable $e) {
    // Log error but DON'T stop execution
    error_log("Email failed: " . $e->getMessage());
}

// ✅ SUCCESS ALWAYS RETURNED
echo json_encode(["success" => true, ...]);
```

---

### Token Already Consumed Error

**Cause**: Email failed but token was nullified

**Solution**:
1. Check error_log.txt for email failure
2. Manually regenerate token:
```sql
UPDATE candidats 
SET token_step2 = CONCAT(MD5(RAND()), MD5(RAND()))
WHERE email = 'candidate@example.com';
```
3. Resend email with new token

---

## 🛡️ Admin Features

### BCC Email Tracking

**Purpose**: Admin receives copy of all candidate emails

**Benefits**:
- Track email delivery
- Monitor jury decisions
- Verify email content
- Archive communications

**Implementation**:
```php
// admin_review.php
$emailSent = sendEmailSafely($candidat['email'], $subject, $htmlMessage, $adminEmail);

// submit_project.php
$headers .= "Bcc: $adminEmail\r\n";
```

**Inbox Organization**:
Create Gmail filters:
- Label: "Majorelle - Validations" (subject contains "Félicitations")
- Label: "Majorelle - Rejections" (subject contains "Suite de votre candidature")
- Label: "Majorelle - Confirmations" (subject contains "Confirmation de dépôt")

---

### Error Log Analysis

**Access Log**:
```bash
# On Hostinger via File Manager or FTP
/home/u710497052/error_log.txt
```

**Log Format**:
```
[26-Jan-2026 14:35:22] Email: Attempting to send to candidate@example.com - Subject: Félicitations
[26-Jan-2026 14:35:24] Email: Successfully sent to candidate@example.com
[26-Jan-2026 14:35:24] Validation: Candidate #15 approved and notified
```

**Search Patterns**:
```bash
# Find all email attempts
grep "Email:" error_log.txt

# Find failures only
grep "FAILED\|WARNING" error_log.txt

# Find specific candidate
grep "candidate@example.com" error_log.txt
```

---

## 📊 Email Statistics

### Expected Volumes
- **Phase 1 (Registration)**: ~100-200 candidates
- **Phase 2 (Validation)**: ~20-30 approved, ~70-170 rejected
- **Phase 3 (Confirmation)**: ~20-30 completed

### Delivery Rates
- **Target**: >95% delivery rate
- **Acceptable**: >90% delivery rate
- **Critical**: <80% delivery rate (investigate SPF/DKIM)

### Monitoring Schedule
- **Daily**: Check error_log.txt for failures
- **Weekly**: Review admin BCC inbox
- **Monthly**: Verify email statistics match database

---

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Configure admin email in both PHP files
- [ ] Test email_monitor.php locally
- [ ] Verify SPF/DKIM DNS records
- [ ] Enable PHP mail() in Hostinger

### Production
- [ ] Upload `admin_review.php` v2.2
- [ ] Upload `submit_project.php` v2.1
- [ ] Upload `email_monitor.php`
- [ ] Set file permissions (644)
- [ ] Test validation email
- [ ] Test rejection email
- [ ] Test Step 2 confirmation
- [ ] Verify admin BCC delivery

### Post-Deployment
- [ ] Monitor error_log.txt for 24 hours
- [ ] Check admin inbox for BCC emails
- [ ] Verify candidate email delivery
- [ ] Document any issues

---

## 📞 Support

### For Technical Issues
- Check `error_log.txt` first
- Use `email_monitor.php` for diagnostics
- Review this guide's troubleshooting section

### For Hostinger Support
- Control Panel: https://hpanel.hostinger.com
- Support: Live chat 24/7
- Documentation: https://support.hostinger.com

### For Email Deliverability
- Test with: https://www.mail-tester.com
- SPF Check: https://mxtoolbox.com/spf.aspx
- DKIM Check: https://mxtoolbox.com/dkim.aspx

---

## 📝 Change Log

### Version 2.2 (January 26, 2026)
- ✅ Added admin BCC tracking to all emails
- ✅ Enhanced error logging with detailed messages
- ✅ Created email_monitor.php dashboard
- ✅ Improved email templates with better formatting
- ✅ Added timeout protection to all mail() calls

### Version 2.1 (January 25, 2026)
- ✅ Isolated email logic in submit_project.php
- ✅ Made email non-blocking for Step 2 uploads
- ✅ Added fault-tolerant email handling

### Version 2.0 (January 24, 2026)
- ✅ HTML email templates
- ✅ Professional branding
- ✅ Responsive design

---

**© 2026 Fondation Jardin Majorelle - All Rights Reserved**
