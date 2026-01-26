<?php
// api/debug.php - Temporary debugging file
// DELETE THIS FILE AFTER FIXING THE ISSUE

header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo json_encode([
    'php_version' => phpversion(),
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'uploads_dir_writable' => is_writable('../uploads/cin/'),
    'uploads_dir_exists' => is_dir('../uploads/cin/')
]);

// Test database connection
try {
    require 'db_connect.php';
    echo "\n\nDatabase connection: SUCCESS";
    
    // Test if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'candidats'");
    if ($stmt->rowCount() > 0) {
        echo "\nTable 'candidats' exists: YES";
        
        // Show table structure
        $stmt = $pdo->query("DESCRIBE candidats");
        echo "\n\nTable structure:\n";
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
    } else {
        echo "\nTable 'candidats' exists: NO - YOU NEED TO IMPORT database_setup.sql";
    }
} catch (Exception $e) {
    echo "\n\nDatabase connection: FAILED";
    echo "\nError: " . $e->getMessage();
}
?>
