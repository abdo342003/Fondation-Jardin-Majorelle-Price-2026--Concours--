<?php
// api/db_connect.php

// ✅ PRODUCTION HOSTINGER CREDENTIALS
$host = "localhost";
$user = "u710497052_Majorelle";
$pass = "JardinMajorelle@26";
$dbname = "u710497052_Majorelle";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur de connexion base de données"]);
    exit;
}
?>