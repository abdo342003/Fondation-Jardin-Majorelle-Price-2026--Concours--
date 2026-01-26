<?php
// api/test_connection.php - TEST DATABASE CONNECTION
// DELETE THIS FILE AFTER FIXING

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Database Connection Test</h1>";

// Test credentials
$host = "localhost";
$dbname = "u710497052_Majorelle";
$user = "u710497052_Majorelle";
$pass = "JardinMajorelle@26";

echo "<h2>Credentials Being Used:</h2>";
echo "Host: <strong>$host</strong><br>";
echo "Database: <strong>$dbname</strong><br>";
echo "Username: <strong>$user</strong><br>";
echo "Password: <strong>" . str_repeat('*', strlen($pass)) . "</strong><br><br>";

// Test 1: Try connection
echo "<h2>Test 1: PDO Connection</h2>";
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ <strong style='color:green'>SUCCESS!</strong> Connected to database.<br><br>";
    
    // Test 2: Check database name
    echo "<h2>Test 2: Current Database</h2>";
    $stmt = $pdo->query("SELECT DATABASE()");
    $currentDb = $stmt->fetchColumn();
    echo "Current database: <strong>$currentDb</strong><br><br>";
    
    // Test 3: List tables
    echo "<h2>Test 3: Tables in Database</h2>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (empty($tables)) {
        echo "⚠️ <strong style='color:orange'>NO TABLES FOUND!</strong><br>";
        echo "You need to import database_setup.sql<br><br>";
    } else {
        echo "Tables found:<br>";
        foreach ($tables as $table) {
            echo "- $table<br>";
        }
        echo "<br>";
    }
    
    // Test 4: Check if candidats table exists
    echo "<h2>Test 4: Candidats Table</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'candidats'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Table 'candidats' exists<br>";
        
        // Show columns
        $stmt = $pdo->query("DESCRIBE candidats");
        echo "<br>Columns:<br>";
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
            echo "- {$col['Field']} ({$col['Type']})<br>";
        }
    } else {
        echo "❌ <strong style='color:red'>Table 'candidats' DOES NOT EXIST!</strong><br>";
        echo "Import database_setup.sql first!<br>";
    }
    
} catch (PDOException $e) {
    echo "❌ <strong style='color:red'>CONNECTION FAILED!</strong><br><br>";
    echo "Error Code: " . $e->getCode() . "<br>";
    echo "Error Message: " . $e->getMessage() . "<br><br>";
    
    echo "<h3>Possible Issues:</h3>";
    echo "<ul>";
    echo "<li>Wrong password</li>";
    echo "<li>Database user doesn't have permission to access this database</li>";
    echo "<li>Database doesn't exist</li>";
    echo "<li>MySQL server is not running</li>";
    echo "</ul>";
    
    echo "<h3>What to Check in Hostinger:</h3>";
    echo "<ol>";
    echo "<li>Go to <strong>Databases → MySQL Databases</strong></li>";
    echo "<li>Check if database <strong>u710497052_Majorelle</strong> exists</li>";
    echo "<li>Check if user <strong>u710497052_Majorelle</strong> has access to this database</li>";
    echo "<li>Verify the password is correct</li>";
    echo "</ol>";
}

echo "<hr>";
echo "<p style='color:red'><strong>IMPORTANT: DELETE THIS FILE after fixing the issue for security!</strong></p>";
?>
