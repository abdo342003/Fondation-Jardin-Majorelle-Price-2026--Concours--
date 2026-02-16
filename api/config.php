<?php
// api/config.php - PRODUCTION Configuration v3.0
// Prix Fondation Jardin Majorelle 2026
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// 🔒 SECURITY: Use environment variables in production
// ═══════════════════════════════════════════════════════════════════
// For production, use $_ENV or getenv() to load from .env file
// Example: define('DB_HOST', getenv('DB_HOST') ?: 'localhost');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'u710497052_Majorelle');
define('DB_PASS', getenv('DB_PASS') ?: 'JardinMajorelle@26');
define('DB_NAME', getenv('DB_NAME') ?: 'u710497052_Majorelle');
define('DB_CHARSET', 'utf8mb4');

// Email Configuration
define('MAIL_FROM', getenv('MAIL_FROM') ?: 'contact@fondationjardinmajorelleprize.com');
define('MAIL_FROM_NAME', 'Prix Fondation Jardin Majorelle');
define('MAIL_REPLY_TO', getenv('MAIL_REPLY_TO') ?: 'contact@fondationjardinmajorelleprize.com');
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'fjmprize2026@jardinmajorelle.com');

// Domain Configuration
define('SITE_URL', getenv('SITE_URL') ?: 'https://fondationjardinmajorelleprize.com');
define('API_URL', SITE_URL . '/api');

// File Upload Limits (in bytes)
define('MAX_CIN_SIZE', 5 * 1024 * 1024);      // 5 MB
define('MAX_BIO_SIZE', 2 * 1024 * 1024);      // 2 MB
define('MAX_NOTE_SIZE', 2 * 1024 * 1024);     // 2 MB
define('MAX_APS_SIZE', 10 * 1024 * 1024);     // 10 MB

// Security Settings
define('SESSION_LIFETIME', 2 * 60 * 60);      // 2 hours

// Admin Credentials (use PASSWORD_DEFAULT in production)
define('JURY_USERNAME', getenv('JURY_USERNAME') ?: 'fjmprize2026@jardinmajorelle.com');
define('JURY_PASSWORD_HASH', getenv('JURY_PASSWORD_HASH') ?: '$2y$12$OnTlxQtgzkUw9EQbQQMAVe9Tc8RkZ/KayWLAKvNZxBAf2ptP7HY5S');

// Allowed Origins for CORS
define('ALLOWED_ORIGINS', [
    'https://fondationjardinmajorelleprize.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);

// Application Settings
define('APP_ENV', getenv('APP_ENV') ?: 'production'); // 'production' or 'development'
define('APP_DEBUG', APP_ENV === 'development');
define('APP_VERSION', '3.0.0');
define('APP_NAME', 'Prix Fondation Jardin Majorelle 2026');

// Paths
define('UPLOAD_DIR_CIN', __DIR__ . '/../uploads/cin/');
define('UPLOAD_DIR_PROJECTS', __DIR__ . '/../uploads/projets/');
define('LOG_FILE', __DIR__ . '/../error_log.txt');

// Competition Dates
define('SUBMISSION_DEADLINE', '2026-03-15 23:59:59');
define('RESULTS_ANNOUNCEMENT', '2026-05-15');

// ═══════════════════════════════════════════════════════════════════
// 🔧 ENVIRONMENT SETUP
// ═══════════════════════════════════════════════════════════════════

// Error Reporting based on environment
if (APP_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL);
}

// Always log errors
ini_set('log_errors', 1);
ini_set('error_log', LOG_FILE);

// Set timezone
date_default_timezone_set('Africa/Casablanca');

// Set memory limit
ini_set('memory_limit', '256M');

// Set max execution time
set_time_limit(300);

// ═══════════════════════════════════════════════════════════════════
// 🛡️ SECURITY HEADERS FUNCTION
// ═══════════════════════════════════════════════════════════════════

function setSecurityHeaders($allowedOrigin = null) {
    // CORS
    if ($allowedOrigin && in_array($allowedOrigin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $allowedOrigin");
    } else {
        header("Access-Control-Allow-Origin: " . ALLOWED_ORIGINS[0]);
    }
    
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    
    // Security headers
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    if (!APP_DEBUG) {
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    }
}

?>
