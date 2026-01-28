<?php
// api/db_connect.php - PRODUCTION READY v2.0
// Fondation Jardin Majorelle - Prix Architecture 2026

// ═══════════════════════════════════════════════════════════════════
// 🔒 PRODUCTION DATABASE CONFIGURATION - HOSTINGER
// ═══════════════════════════════════════════════════════════════════

define('DB_HOST', 'localhost');
define('DB_USER', 'u710497052_Majorelle');
define('DB_PASS', 'JardinMajorelle@26');
define('DB_NAME', 'u710497052_Majorelle');
define('DB_CHARSET', 'utf8mb4');

// ═══════════════════════════════════════════════════════════════════
// 📧 EMAIL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

define('MAIL_FROM', 'contact@fondationjardinmajorelleprize.com');
define('MAIL_FROM_NAME', 'Prix Fondation Jardin Majorelle');
define('MAIL_REPLY_TO', 'contact@fondationjardinmajorelleprize.com');
define('ADMIN_EMAIL', 'abdoraoui9@gmail.com');

// ═══════════════════════════════════════════════════════════════════
// 🌐 DOMAIN CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

define('SITE_URL', 'https://fondationjardinmajorelleprize.com');
define('API_URL', SITE_URL . '/api');

// ═══════════════════════════════════════════════════════════════════
// 📁 FILE UPLOAD LIMITS (in bytes)
// ═══════════════════════════════════════════════════════════════════

define('MAX_CIN_SIZE', 5 * 1024 * 1024);      // 5 MB
define('MAX_BIO_SIZE', 2 * 1024 * 1024);      // 2 MB
define('MAX_NOTE_SIZE', 2 * 1024 * 1024);     // 2 MB
define('MAX_APS_SIZE', 10 * 1024 * 1024);     // 10 MB

// ═══════════════════════════════════════════════════════════════════
// 🔗 PDO DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch (PDOException $e) {
    // Log error securely (never expose to user)
    error_log("DATABASE CONNECTION ERROR: " . $e->getMessage());
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "message" => "Service temporairement indisponible. Veuillez réessayer."
    ]);
    exit;
}

// ═══════════════════════════════════════════════════════════════════
// 📧 HELPER: Send Email Function (Reusable across all API files)
// ═══════════════════════════════════════════════════════════════════

function sendEmail($to, $subject, $htmlBody, $isHighPriority = false) {
    try {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
        $headers .= "Reply-To: " . MAIL_REPLY_TO . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: " . ($isHighPriority ? "1" : "3") . "\r\n";
        
        $additionalParams = "-f" . MAIL_FROM;
        
        set_time_limit(15);
        $result = @mail($to, $subject, $htmlBody, $headers, $additionalParams);
        set_time_limit(300);
        
        if ($result) {
            error_log("EMAIL SENT: To=$to | Subject=$subject");
            return true;
        } else {
            error_log("EMAIL FAILED: To=$to | Subject=$subject");
            return false;
        }
    } catch (Throwable $e) {
        error_log("EMAIL EXCEPTION: " . $e->getMessage());
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🛡️ HELPER: Security Functions
// ═══════════════════════════════════════════════════════════════════

function sanitizeInput($input) {
    return htmlspecialchars(trim($input ?? ''), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function generateSecureToken() {
    return bin2hex(random_bytes(32));
}
?>