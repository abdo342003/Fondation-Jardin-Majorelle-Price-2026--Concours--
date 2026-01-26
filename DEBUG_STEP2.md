# 🔧 Guide de Débogage Step 2

## 🎯 Problème: "Erreur lors de l'envoi"

### Causes possibles et solutions:

---

## 1️⃣ Vérifier les erreurs serveur

### A. Activer les logs PHP
Dans `api/submit_project.php`, assurez-vous que le débogage est activé:
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

### B. Vérifier les logs Hostinger
1. Connectez-vous à cPanel
2. Allez dans "Error Logs"
3. Cherchez les erreurs liées à `submit_project.php`

---

## 2️⃣ Tester avec le fichier de test

### Upload test_upload.html:
1. Uploadez `test_upload.html` à la racine de votre serveur
2. Visitez: `https://fondationjardinmajorelleprize.com/test_upload.html`
3. Entrez un token valide
4. Testez avec de vrais PDFs
5. Regardez les messages d'erreur détaillés

### Comment obtenir un token de test:
```sql
SELECT id, nom, prenom, token_step2 
FROM candidats 
WHERE status = 'approved' 
LIMIT 1;
```

---

## 3️⃣ Vérifier la base de données

### Colonnes requises:
```sql
SHOW COLUMNS FROM candidats;
```

Vous devez avoir:
- ✅ `token_step2` VARCHAR(255)
- ✅ `bio_file` VARCHAR(255)
- ✅ `presentation_file` VARCHAR(255)
- ✅ `aps_file` VARCHAR(255)
- ✅ `date_submission_step2` TIMESTAMP
- ✅ `status` ENUM avec 'completed'

Si manquant, exécutez: `database_update.sql`

---

## 4️⃣ Vérifier les permissions de dossier

### Depuis SSH/Terminal Hostinger:
```bash
# Vérifier les permissions
ls -la uploads/

# Si uploads/projets n'existe pas:
mkdir -p uploads/projets

# Définir les bonnes permissions:
chmod 755 uploads/
chmod 755 uploads/projets/

# Vérifier propriétaire (doit être l'utilisateur web):
chown -R $USER:$USER uploads/
```

---

## 5️⃣ Vérifier les limites PHP

### Fichier php.ini (via cPanel ou .htaccess):
```ini
upload_max_filesize = 12M
post_max_size = 15M
max_execution_time = 300
max_input_time = 300
memory_limit = 128M
```

### Via .htaccess:
```apache
php_value upload_max_filesize 12M
php_value post_max_size 15M
php_value max_execution_time 300
```

---

## 6️⃣ Tester manuellement avec cURL

### Test de base:
```bash
curl -X POST \
  https://fondationjardinmajorelleprize.com/api/submit_project.php \
  -H "Content-Type: multipart/form-data" \
  -F "token=VOTRE_TOKEN_ICI" \
  -F "bio_file=@chemin/vers/bio.pdf" \
  -F "presentation_file=@chemin/vers/note.pdf" \
  -F "aps_file=@chemin/vers/aps.pdf"
```

---

## 7️⃣ Vérifier les CORS

### Ouvrir la console navigateur (F12):
```javascript
// Chercher des erreurs CORS comme:
// "Access to XMLHttpRequest blocked by CORS policy"
```

### Solution:
Le fichier `submit_project.php` a déjà les headers CORS corrects:
```php
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

---

## 8️⃣ Messages d'erreur spécifiques

### "Le fichier BIO dépasse la taille maximale autorisée (2 Mo)"
✅ **Cause**: Fichier trop gros  
✅ **Solution**: Réduire la taille du PDF ou augmenter la limite

### "Le fichier X doit être au format PDF uniquement"
✅ **Cause**: Format invalide ou extension incorrecte  
✅ **Solution**: Convertir en vrai PDF

### "Ce lien est invalide, a expiré ou a déjà été utilisé"
✅ **Cause**: Token NULL ou status pas 'approved'  
✅ **Solution**: Vérifier en BDD:
```sql
SELECT id, status, token_step2 
FROM candidats 
WHERE token_step2 = 'VOTRE_TOKEN';
```

### "Impossible de créer le dossier uploads"
✅ **Cause**: Permissions insuffisantes  
✅ **Solution**: Créer manuellement et chmod 755

### "Impossible d'enregistrer le fichier"
✅ **Cause**: move_uploaded_file échoue  
✅ **Solution**: 
1. Vérifier permissions dossier
2. Vérifier espace disque disponible
3. Vérifier open_basedir PHP

---

## 9️⃣ Console Navigateur - Debugging

### Ouvrir la console (F12) et chercher:

**Logs ajoutés dans Step2.jsx:**
```
📤 Envoi vers: /api/submit_project.php
✅ Réponse serveur: {success: true, ...}
```

**Ou en cas d'erreur:**
```
❌ Erreur complète: Error: Network Error
📦 Réponse: undefined
```

### Interpréter les erreurs:

| Message Console | Signification | Solution |
|----------------|---------------|----------|
| `Network Error` | Serveur non accessible | Vérifier URL, serveur démarré |
| `404 Not Found` | Fichier PHP inexistant | Vérifier chemin API |
| `500 Internal Server Error` | Erreur PHP | Check error logs |
| `413 Payload Too Large` | Fichier trop gros | Augmenter limites |
| `403 Forbidden` | Token invalide | Vérifier token en BDD |

---

## 🔟 Checklist complète de débogage

- [ ] Database migration exécutée (colonnes présentes)
- [ ] Token valide dans la base (status='approved')
- [ ] Dossier `uploads/projets/` existe
- [ ] Permissions 755 sur uploads/
- [ ] PHP limits suffisants (12M upload)
- [ ] Fichiers sont de vrais PDFs (< limites)
- [ ] CORS headers corrects
- [ ] Pas d'erreurs dans error_log
- [ ] Console navigateur sans erreur réseau
- [ ] Test avec test_upload.html fonctionne

---

## 🚀 Test rapide

### 1. Créer un candidat test:
```sql
INSERT INTO candidats (nom, prenom, email, status, token_step2) 
VALUES ('Test', 'User', 'test@example.com', 'approved', 'test123456789test123456789test123456789test123456789test123456');
```

### 2. Tester avec test_upload.html:
- Token: `test123456789test123456789test123456789test123456789test123456`
- Upload 3 PDFs (< limites)
- Vérifier le résultat

### 3. Vérifier en BDD:
```sql
SELECT id, nom, status, bio_file, presentation_file, aps_file 
FROM candidats 
WHERE email = 'test@example.com';
```

---

## 📧 Support

Si le problème persiste:
1. Copier les logs d'erreur
2. Copier la réponse de test_upload.html
3. Copier la sortie de SHOW COLUMNS
4. Vérifier error_log Hostinger

---

**Dernière mise à jour**: 26 Janvier 2026
