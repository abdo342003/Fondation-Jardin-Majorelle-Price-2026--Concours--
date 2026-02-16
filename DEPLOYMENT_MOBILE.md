# 🚀 Guide de Déploiement Mobile

## ✅ Corrections Appliquées

### 1. Configuration Vite
- ✅ `base: './'` - Chemins relatifs pour tout hébergement
- ✅ CSS en un seul fichier
- ✅ Compression optimale
- ✅ Support ES2015 (iOS 10.3+, Android 5.1+)

### 2. HTML Optimisé
- ✅ Chemins relatifs pour les assets (`./logo.png` au lieu de `/logo.png`)
- ✅ Meta tags mobiles simplifiés
- ✅ Polices optimisées avec `display=swap`

### 3. Performance Mobile
- ✅ Console.log supprimés en production
- ✅ Minification terser
- ✅ Dépendances optimisées

## 📦 Étapes de Déploiement

### 1. Builder l'application
```powershell
npm run build
```

Cela crée un dossier `dist/` avec tous les fichiers optimisés.

### 2. Contenu du dossier dist/
Après le build, vous devriez avoir :
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── [images]
  ├── logo.png
  ├── icon-192.png
  ├── icon-512.png
  ├── apple-touch-icon.png
  ├── manifest.json
  └── .htaccess
```

### 3. Déployer sur votre serveur

**Option A : FTP/SFTP**
1. Connectez-vous à votre hébergement
2. Uploadez TOUT le contenu du dossier `dist/`
3. Assurez-vous que les fichiers sont dans le dossier racine ou `public_html`

**Option B : Git + Serveur**
```bash
git add dist/
git commit -m "Build for production"
git push origin main
```

### 4. Vérification après déploiement

Testez sur mobile :
- ✅ Ouvrir le site dans Chrome (Android) ou Safari (iOS)
- ✅ Vérifier que les polices se chargent
- ✅ Vérifier que les images s'affichent
- ✅ Tester le formulaire
- ✅ Vérifier le scroll
- ✅ Tester les boutons tactiles

## 🔧 Problèmes Courants

### Le site ne charge pas du tout
**Solution** : Vérifier les chemins dans la console du navigateur (F12)
- Les chemins doivent être relatifs : `./assets/...` pas `/assets/...`

### Les polices ne s'affichent pas
**Solution** : Vérifier que Google Fonts est accessible
- Alternative : Télécharger et héberger les polices localement

### Le CSS ne s'applique pas
**Solution** : Vider le cache du navigateur mobile
- Chrome Android : Paramètres > Confidentialité > Effacer données
- Safari iOS : Réglages > Safari > Effacer historique

### Erreur 404 sur les routes
**Solution** : S'assurer que le `.htaccess` est uploadé et actif
- Vérifier que `mod_rewrite` est activé sur le serveur

### Le site est lent sur mobile
**Solution** : Vérifier la compression
- GZIP doit être activé sur le serveur
- Images doivent être optimisées

## 📱 Test Local Mobile

Avant de déployer, tester localement :

1. Builder l'app :
```bash
npm run build
```

2. Prévisualiser :
```bash
npm run preview
```

3. Accéder depuis mobile (même WiFi) :
```
http://[VOTRE_IP_LOCAL]:4173
```

## 🌐 URLs de Test

Une fois déployé, tester sur :
- **Chrome Android** : https://votre-site.com
- **Safari iOS** : https://votre-site.com
- **Chrome DevTools Mobile** : F12 > Toggle device toolbar

## ✨ Optimisations Actives

- ✅ Chemins relatifs (fonctionne partout)
- ✅ CSS inline (chargement rapide)
- ✅ JavaScript minifié
- ✅ Console.log supprimés
- ✅ Compression GZIP
- ✅ Cache optimisé
- ✅ Touch-friendly (44px minimum)
- ✅ Font-size 16px (pas de zoom iOS)

## 📊 Checklist Finale

Avant de valider le déploiement :

- [ ] `npm run build` sans erreurs
- [ ] Tous les fichiers du dossier `dist/` uploadés
- [ ] `.htaccess` présent et actif
- [ ] Test sur Chrome Android
- [ ] Test sur Safari iOS
- [ ] Test du formulaire
- [ ] Test des boutons
- [ ] Test du scroll
- [ ] Vérification console (F12) - pas d'erreurs

## 🆘 Support

Si le site ne fonctionne toujours pas :

1. Ouvrir la console sur mobile (Remote debugging)
2. Noter les erreurs exactes
3. Vérifier les chemins des assets
4. Vérifier que le serveur supporte les SPAs (Single Page Apps)
5. S'assurer que HTTPS est actif (requis pour PWA)
