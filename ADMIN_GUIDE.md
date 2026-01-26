# 🎯 Admin Quick Reference - Prix Fondation Jardin Majorelle

## 📋 System Overview

### Candidate Journey:
1. **Step 1**: Registration → Status: `pending`
2. **Admin Review**: Accept/Reject → Status: `approved` or `rejected`  
3. **Step 2**: Project Upload (if approved) → Status: `completed`

---

## 🔑 Admin Access URLs

### Review Candidates:
```
https://fondationjardinmajorelleprize.com/api/admin_review.php?id=CANDIDATE_ID
```
Replace `CANDIDATE_ID` with the actual ID from database.

### Database Migration (ONE TIME ONLY):
```
https://fondationjardinmajorelleprize.com/database_migration.php
```
⚠️ **DELETE THIS FILE AFTER RUNNING IT!**

---

## 👥 Candidate Status Flow

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Waiting for review | Admin reviews and accepts/rejects |
| `approved` | Accepted by jury | Candidate uploads project (Step 2) |
| `rejected` | Not selected | No further action |
| `completed` | Project submitted | Ready for jury evaluation |

---

## ✅ Validating a Candidate

### Process:
1. Open review page with candidate ID
2. Review their information:
   - Name, Email, School
   - CNOA Number
   - CIN Documents (click to view)
3. Click **"VALIDER & INVITER"** button
4. Confirm action

### What Happens:
- ✅ Status changes to `'approved'`
- ✅ Unique token generated (64 characters)
- ✅ Email sent to candidate with Step 2 link
- ✅ Candidate can now upload project

### Email Contains:
- Welcome message
- Unique access link: `https://fondationjardinmajorelleprize.com/?token=XXXXX`
- Instructions for Step 2

---

## ❌ Rejecting a Candidate

### Process:
1. Open review page with candidate ID
2. Click **"REFUSER"** button
3. Confirm action

### What Happens:
- ❌ Status changes to `'rejected'`
- ❌ Polite rejection email sent
- ❌ No Step 2 access provided

---

## 📊 Database Columns Explained

### Main Columns:
- `id`: Unique candidate ID
- `nom`, `prenom`: Full name
- `email`: Contact email
- `ecole_archi`: Architecture school
- `num_ordre`: CNOA registration number
- `cin_recto`, `cin_verso`: ID card scans
- `status`: Current status (pending/approved/rejected/completed)

### Step 2 Columns:
- `token_step2`: Secure access token (NULL after submission)
- `bio_file`: Biography PDF path
- `presentation_file`: Note d'intention PDF path
- `aps_file`: APS (Avant-Projet Sommaire) PDF path
- `date_submission_step2`: Submission timestamp

---

## 📁 File Upload Specifications

### Step 2 Requirements:
| Document | Max Size | Format |
|----------|----------|--------|
| Biographie | 2 MB | PDF only |
| Note d'intention | 2 MB | PDF only |
| APS | 10 MB | PDF only |

### Storage Location:
```
uploads/cin/          - ID card scans (Step 1)
uploads/projets/      - Project files (Step 2)
```

---

## 🔍 Finding Candidates in Database

### Using phpMyAdmin:

**All pending candidates:**
```sql
SELECT id, nom, prenom, email, ecole_archi, num_ordre 
FROM candidats 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

**All approved candidates:**
```sql
SELECT id, nom, prenom, email, token_step2 
FROM candidats 
WHERE status = 'approved' 
ORDER BY updated_at DESC;
```

**All completed submissions:**
```sql
SELECT id, nom, prenom, email, date_submission_step2 
FROM candidats 
WHERE status = 'completed' 
ORDER BY date_submission_step2 DESC;
```

**View candidate files:**
```sql
SELECT id, nom, prenom, bio_file, presentation_file, aps_file 
FROM candidats 
WHERE status = 'completed';
```

---

## 📧 Email Templates

### Acceptance Email:
- **Subject**: Félicitations ! Vous êtes sélectionné(e)
- **Content**: Welcome + Token Link + Instructions
- **Sent From**: no-reply@fondationjardinmajorelleprize.com

### Rejection Email:
- **Subject**: Suite de votre candidature
- **Content**: Polite rejection + Encouragement
- **Sent From**: no-reply@fondationjardinmajorelleprize.com

### Confirmation Email (Auto):
- **Subject**: Confirmation de dépôt
- **Content**: Project received + Results date (15 Mai 2026)
- **Sent From**: no-reply@fondationjardinmajorelleprize.com

---

## 🛠️ Common Admin Tasks

### 1. Review New Applications:
```
1. Check database for status = 'pending'
2. Open admin_review.php?id=X for each
3. Review documents
4. Accept or Reject
```

### 2. Check Step 2 Submissions:
```sql
SELECT * FROM candidats WHERE status = 'completed';
```

### 3. Download Submitted Projects:
- Files are in: `uploads/projets/`
- File naming: `TYPE_uniqueid_timestamp.pdf`
- Types: `BIO_`, `NOTE_`, `APS_`

### 4. Reset a Token (if needed):
```sql
UPDATE candidats 
SET token_step2 = 'new_token_here' 
WHERE id = CANDIDATE_ID;
```

### 5. View Candidate with Token:
```sql
SELECT id, nom, prenom, token_step2, status 
FROM candidats 
WHERE id = CANDIDATE_ID;
```

---

## 🚨 Troubleshooting

### Email Not Received:
1. Check spam/junk folder
2. Verify email in database is correct
3. Check Hostinger email logs
4. Email may take 2-5 minutes to arrive

### Token Link Not Working:
1. Verify token exists in database (`token_step2` not NULL)
2. Check status is `'approved'`
3. Token becomes NULL after Step 2 submission (one-time use)

### Upload Failing:
1. Check folder permissions: `uploads/projets/` must be writable
2. Verify file size is within limits
3. Ensure file is actually a PDF

### Status Not Changing:
1. Clear browser cache
2. Check database directly in phpMyAdmin
3. Verify no PHP errors in Hostinger error logs

---

## 📈 Monitoring

### Daily Checks:
- New pending applications
- Completed Step 2 submissions
- Failed email deliveries

### Weekly Reports:
```sql
-- Applications by status
SELECT status, COUNT(*) as count 
FROM candidats 
GROUP BY status;

-- Recent submissions
SELECT nom, prenom, email, date_submission_step2 
FROM candidats 
WHERE status = 'completed' 
AND date_submission_step2 >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## 🔒 Security Notes

1. **Never share** candidate tokens publicly
2. **Delete** database_migration.php after first run
3. **Backup** database regularly
4. **Protect** admin_review.php with password (htaccess)
5. **Check** file uploads for malicious content

---

## 📞 Quick Support Commands

### View all columns for a candidate:
```sql
SELECT * FROM candidats WHERE id = CANDIDATE_ID;
```

### Count by status:
```sql
SELECT status, COUNT(*) FROM candidats GROUP BY status;
```

### Recent activity:
```sql
SELECT id, nom, prenom, status, updated_at 
FROM candidats 
ORDER BY updated_at DESC 
LIMIT 10;
```

---

**Admin Guide Version**: 1.0  
**Last Updated**: January 26, 2026  
**System Status**: ✅ Production Ready
