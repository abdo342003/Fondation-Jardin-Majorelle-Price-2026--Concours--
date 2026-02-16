# 🚀 Quick Deployment Checklist

## Current Issue: 404 Error on main.jsx

**Problem**: Production server is serving development files instead of built files.

**Root Cause**: The `dist/` folder contents were not uploaded correctly to `public_html/`.

---

## ✅ Fix Steps (Do This Now)

### 1. Rebuild Project
```bash
npm run build
```

### 2. Upload to Hostinger

Connect to your Hostinger via File Manager or FTP and:

**Upload these files FROM `dist/` TO `public_html/`:**

- [ ] `dist/index.html` → Replace `public_html/index.html`
- [ ] `dist/assets/` → Upload entire folder to `public_html/assets/` (replace old one)
- [ ] `dist/logo.svg` → Upload to `public_html/logo.svg`

**Also upload this configuration file:**

- [ ] `.htaccess` (from project root) → Upload to `public_html/.htaccess`
  - This enables React Router and proper URL handling

**DO NOT touch these existing folders:**
- [ ] Keep `public_html/api/` as is
- [ ] Keep `public_html/uploads/` as is

### 3. Verify Files

After upload, check in Hostinger File Manager:

```
✅ public_html/index.html exists (should contain: src="/assets/index-[hash].js")
✅ public_html/assets/ folder exists
✅ public_html/assets/index-[hash].js exists
✅ public_html/assets/index-[hash].css exists
```

### 4. Test

Visit: `https://fondationjardinmajorelleprize.com`

- Should load the React app
- No 404 errors in browser console
- Form should be functional

---

## 🔄 Future Deployments

Every time you make changes to the frontend:

1. **Make your changes** in `src/` files
2. **Build**: `npm run build`
3. **Upload contents of `dist/` folder** to `public_html/`
4. **Test**: Visit your production URL

---

## ❌ Common Mistakes to Avoid

1. **DON'T**: Upload the `dist/` folder itself
   - ❌ Results in: `public_html/dist/index.html`
   
2. **DON'T**: Upload root project files (`src/`, `node_modules/`, etc.)
   - These are development files, not needed in production

3. **DON'T**: Forget to rebuild before deploying
   - Always run `npm run build` first

---

## 📝 What Gets Uploaded Where

| Local File | Production Location |
|------------|---------------------|
| `dist/index.html` | `public_html/index.html` |
| `dist/assets/*` | `public_html/assets/*` |
| `dist/logo.svg` | `public_html/logo.svg` |
| `.htaccess` | `public_html/.htaccess` |
| `api/*.php` | `public_html/api/*.php` |

---

## 🆘 Still Having Issues?

1. **Clear browser cache**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Check File Manager**: Verify `public_html/index.html` contains compiled references
3. **Check Console**: Open browser DevTools → Console tab for errors
4. **Check .env.production**: Ensure API URL is correct

---

**Last Updated**: February 9, 2026
