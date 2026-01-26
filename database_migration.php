<?php
// database_migration.php - Complete database migration for Step 2
// Upload this file to your Hostinger root directory and run it ONCE

require 'api/db_connect.php';

echo "<h2>Database Migration Script</h2>";
echo "<hr>";

try {
    $changes = [];
    
    // 1. Add token_step2 column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM candidats LIKE 'token_step2'");
    if ($checkColumn->rowCount() == 0) {
        $pdo->exec("ALTER TABLE candidats ADD COLUMN token_step2 VARCHAR(255) DEFAULT NULL AFTER status");
        $pdo->exec("ALTER TABLE candidats ADD INDEX idx_token_step2 (token_step2)");
        $changes[] = "✅ Added 'token_step2' column with index";
    } else {
        $changes[] = "ℹ️ Column 'token_step2' already exists";
    }
    
    // 2. Add bio_file column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM candidats LIKE 'bio_file'");
    if ($checkColumn->rowCount() == 0) {
        $pdo->exec("ALTER TABLE candidats ADD COLUMN bio_file VARCHAR(255) DEFAULT NULL AFTER token_step2");
        $changes[] = "✅ Added 'bio_file' column";
    } else {
        $changes[] = "ℹ️ Column 'bio_file' already exists";
    }
    
    // 3. Add presentation_file column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM candidats LIKE 'presentation_file'");
    if ($checkColumn->rowCount() == 0) {
        $pdo->exec("ALTER TABLE candidats ADD COLUMN presentation_file VARCHAR(255) DEFAULT NULL AFTER bio_file");
        $changes[] = "✅ Added 'presentation_file' column";
    } else {
        $changes[] = "ℹ️ Column 'presentation_file' already exists";
    }
    
    // 4. Add aps_file column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM candidats LIKE 'aps_file'");
    if ($checkColumn->rowCount() == 0) {
        $pdo->exec("ALTER TABLE candidats ADD COLUMN aps_file VARCHAR(255) DEFAULT NULL AFTER presentation_file");
        $changes[] = "✅ Added 'aps_file' column";
    } else {
        $changes[] = "ℹ️ Column 'aps_file' already exists";
    }
    
    // 5. Add date_submission_step2 column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM candidats LIKE 'date_submission_step2'");
    if ($checkColumn->rowCount() == 0) {
        $pdo->exec("ALTER TABLE candidats ADD COLUMN date_submission_step2 TIMESTAMP NULL DEFAULT NULL AFTER aps_file");
        $changes[] = "✅ Added 'date_submission_step2' column";
    } else {
        $changes[] = "ℹ️ Column 'date_submission_step2' already exists";
    }
    
    // 6. Update status ENUM to include 'completed'
    try {
        $pdo->exec("ALTER TABLE candidats MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending'");
        $changes[] = "✅ Updated status ENUM to include 'completed'";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'completed') !== false) {
            $changes[] = "ℹ️ Status ENUM already includes 'completed'";
        } else {
            throw $e;
        }
    }
    
    echo "<div style='background: #d4edda; padding: 20px; border-left: 5px solid #28a745; margin: 20px 0;'>";
    echo "<h3 style='color: #155724; margin-top: 0;'>Migration Results:</h3>";
    echo "<ul style='color: #155724;'>";
    foreach ($changes as $change) {
        echo "<li>$change</li>";
    }
    echo "</ul>";
    echo "</div>";
    
    echo "<div style='background: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;'>";
    echo "<strong style='color: #856404;'>⚠️ IMPORTANT: Delete this file (database_migration.php) for security!</strong>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div style='background: #f8d7da; padding: 20px; border-left: 5px solid #dc3545; margin: 20px 0;'>";
    echo "<h3 style='color: #721c24; margin-top: 0;'>❌ Error:</h3>";
    echo "<p style='color: #721c24;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
?>
