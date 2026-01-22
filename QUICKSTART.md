# Quick Start Guide 🚀

## Current Status ✅

Your application is **FULLY FUNCTIONAL** and running at: http://localhost:5174/

## What's Working

✅ React frontend with bilingual support (FR/EN)  
✅ TailwindCSS styling with Majorelle theme  
✅ Form validation and file uploads  
✅ All dependencies installed  
✅ Development server running  
✅ No errors or warnings  

## Development Commands

```bash
# Start development server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Next Steps for Full Deployment

### 1. Replace Placeholder Logo ⚠️

The YSL logo is currently a placeholder SVG. Replace it with the actual logo:

**Current:** `src/assets/logo_ysl.svg` (blue SVG placeholder)  
**Action:** Add the real YSL museum logo as `logo_ysl.png`

### 2. Test Backend Locally (Optional)

If you want to test the full stack locally:

1. Install XAMPP, MAMP, or use PHP built-in server:
   ```bash
   cd api
   php -S localhost:8000
   ```

2. Update `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/register.php
   ```

3. Import database schema to local MySQL

### 3. Deploy to Hostinger

Follow the comprehensive guide in [`DEPLOYMENT.md`](./DEPLOYMENT.md)

**Quick deployment steps:**

1. **Database:**
   - Go to Hostinger phpMyAdmin
   - Import `database_setup.sql`

2. **Backend:**
   - Upload `api/` folder to `public_html/api/`
   - Create `uploads/cin/` directory (permissions: 755)

3. **Frontend:**
   - Update `.env.production` with your domain
   - Run `npm run build`
   - Upload `dist/` contents to `public_html/`

4. **Test:**
   - Visit your domain
   - Submit a test registration
   - Check database for entry

## File Structure

```
concours-archi/
├── src/               # React source code
│   ├── App.jsx       # Main component
│   ├── i18n.js       # Translations (FR/EN)
│   └── assets/       # Images and logos
├── api/              # PHP backend
│   ├── db_connect.php
│   └── register.php
├── .env              # Local config (not committed)
├── .env.production   # Production template
└── package.json      # Dependencies
```

## Documentation Files

- **SETUP.md** - Detailed setup and usage guide
- **DEPLOYMENT.md** - Step-by-step Hostinger deployment
- **PROJECT_SUMMARY.md** - Complete project overview
- **database_setup.sql** - MySQL database schema

## Important Notes

🔒 **Security:**
- Never commit `.env` with real credentials
- Update CORS headers in production
- Use SSL certificate on Hostinger

📧 **Email:**
- Jury email configured: abdoraoui9@gmail.com
- Consider using SMTP for better reliability

🎨 **Branding:**
- Replace YSL placeholder logo before production
- Ensure both logos are high quality

## Troubleshooting

**Server not starting?**
```bash
# Kill any processes on port 5173/5174
pkill -f vite
npm run dev
```

**Changes not reflecting?**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

**Build errors?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm run build
```

## Support

- **Developer:** Abdellah Erraoui
- **Email:** abdoraoui9@gmail.com
- **Database:** Configured for Hostinger

---

**You're all set! 🎉**

The development environment is ready. When you're ready to deploy, follow the DEPLOYMENT.md guide.
