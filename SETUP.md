# Prix Fondation Jardin Majorelle 2026

A premium registration form for the Jardin Majorelle Foundation Architecture Prize, built with React, Vite, TailwindCSS, and PHP backend.

## 🎨 Features

- **Bilingual Support** (French/English) using i18next
- **Elegant Design** with Majorelle Blue color palette
- **Responsive Layout** optimized for all devices
- **File Upload** for identity documents (CIN)
- **PHP Backend** for form processing and database storage
- **Email Notifications** for candidates and jury

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- PHP 7.4+ (for backend API)
- MySQL database (configured on Hostinger)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env` and update with your API URL:
   ```bash
   # For local development
   VITE_API_URL=http://localhost/concours-api/register.php
   ```

   For production, update `.env.production`:
   ```bash
   VITE_API_URL=https://your-domain.com/api/register.php
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or next available port)

### Build for Production

```bash
npm run build
```

The production files will be in the `dist/` folder.

## 📁 Project Structure

```
concours-archi/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   ├── i18n.js              # Internationalization config
│   ├── index.css            # Global styles
│   └── assets/              # Images and static files
├── api/
│   ├── db_connect.php       # Database connection
│   └── register.php         # Registration endpoint
├── uploads/
│   └── cin/                 # Uploaded identity documents
├── .env                     # Environment variables (local)
├── .env.production          # Environment variables (production)
├── tailwind.config.js       # TailwindCSS configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## 🎨 Design System

### Color Palette

- **Primary (Majorelle Blue)**: `#0055B8`
- **Accent (Terracotta)**: `#C2571A`
- **Sand (Background)**: `#FDFBF7`

### Typography

- **Headings**: Playfair Display (serif)
- **Body**: Montserrat (sans-serif)

## 🔧 Backend Setup (PHP)

### Database Configuration

1. Update `api/db_connect.php` with your Hostinger credentials:
   ```php
   $host = "your-db-host";
   $user = "your-db-user";
   $pass = "your-db-password";
   $dbname = "your-db-name";
   ```

2. Create the database table:
   ```sql
   CREATE TABLE candidats (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nom VARCHAR(100) NOT NULL,
       prenom VARCHAR(100) NOT NULL,
       date_naissance DATE NOT NULL,
       cin_recto VARCHAR(255) NOT NULL,
       cin_verso VARCHAR(255) NOT NULL,
       adresse TEXT NOT NULL,
       email VARCHAR(150) NOT NULL,
       phone_code VARCHAR(10),
       phone_number VARCHAR(20),
       ecole_archi VARCHAR(200),
       annee_obtention INT,
       num_ordre VARCHAR(50),
       status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### File Uploads

- Files are stored in `uploads/cin/` directory
- Supports: JPG, JPEG, PNG, PDF
- Max file size: 5MB
- Files are renamed with unique IDs for security

## 🌐 Deployment

### Frontend (Hostinger)

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist/` folder contents to your Hostinger public_html

### Backend (PHP)

1. Upload the `api/` folder to your server
2. Create the `uploads/cin/` directory with write permissions (755)
3. Update database credentials in `db_connect.php`
4. Update CORS settings in `register.php` for production

## 📧 Email Configuration

Update the jury email in `api/register.php`:
```php
$jury_email = "your-jury-email@example.com";
```

## 🔒 Security Notes

- CIN files are stored with unique filenames
- File type validation (only images and PDFs)
- File size limit enforced (5MB)
- SQL injection protection with prepared statements
- Update CORS settings for production

## 📝 Missing Assets

**Important**: Replace the placeholder YSL logo with the actual logo:
- Current: `src/assets/logo_ysl.svg` (SVG placeholder)
- Replace with: `src/assets/logo_ysl.png` (actual YSL museum logo)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technologies Used

- **Frontend**: React 19, Vite, TailwindCSS 4
- **i18n**: i18next, react-i18next
- **HTTP Client**: Axios
- **Backend**: PHP, MySQL

## 📄 License

© 2026 Fondation Jardin Majorelle. All rights reserved.

## 👥 Support

For technical issues or questions, contact: abdoraoui9@gmail.com
