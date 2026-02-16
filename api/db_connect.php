<?php
// api/db_connect.php - PRODUCTION v3.0
// Fondation Jardin Majorelle - Prix Architecture 2026
// ═══════════════════════════════════════════════════════════════════

// Load configuration and helper functions
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// ═══════════════════════════════════════════════════════════════════
// 🔗 PDO DATABASE CONNECTION with Retry Logic
// ═══════════════════════════════════════════════════════════════════

$pdo = null;
$maxRetries = 3;
$retryDelay = 1; // seconds

for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_PERSISTENT         => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            PDO::ATTR_TIMEOUT            => 10
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        logMessage("Database connection established successfully", 'INFO');
        break;
        
    } catch (PDOException $e) {
        $errorMsg = "Database connection attempt $attempt/$maxRetries failed: " . $e->getMessage();
        logMessage($errorMsg, 'ERROR');
        
        if ($attempt === $maxRetries) {
            // Last attempt failed
            http_response_code(503);
            errorResponse(
                "Service temporairement indisponible. Veuillez réessayer dans quelques instants.",
                503
            );
        }
        
        // Wait before retry
        sleep($retryDelay);
        $retryDelay *= 2; // Exponential backoff
    }
}
?>