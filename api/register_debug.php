<?php
// api/register_debug.php - TEMPORARY DEBUG VERSION
// DELETE THIS FILE AFTER FIXING THE ISSUE

// ENABLE ERROR DISPLAY FOR DEBUGGING
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: https://fondationjardinmajorelleprize.com"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Gestion du Preflight Request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode(['debug' => 'Starting script...']) . "\n";

try {
    require 'db_connect.php';
    echo json_encode(['debug' => 'Database connected']) . "\n";
} catch (Exception $e) {
    echo json_encode(['error' => 'DB Connection failed: ' . $e->getMessage()]);
    exit;
}

// Test if table exists
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'candidats'");
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Table candidats does not exist. Import database_setup.sql first!']);
        exit;
    }
    echo json_encode(['debug' => 'Table candidats exists']) . "\n";
} catch (Exception $e) {
    echo json_encode(['error' => 'Table check failed: ' . $e->getMessage()]);
    exit;
}

// Check if uploads directory exists
if (!is_dir('../uploads/cin/')) {
    echo json_encode(['error' => 'Directory ../uploads/cin/ does not exist!']);
    exit;
}

if (!is_writable('../uploads/cin/')) {
    echo json_encode(['error' => 'Directory ../uploads/cin/ is not writable!']);
    exit;
}

echo json_encode(['debug' => 'Upload directory is ready']) . "\n";

// Check POST data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo json_encode(['debug' => 'POST request received', 'post_data' => array_keys($_POST), 'files' => array_keys($_FILES)]) . "\n";
}

echo json_encode(['success' => true, 'message' => 'All checks passed! The issue is likely in the form processing.']);
?>
