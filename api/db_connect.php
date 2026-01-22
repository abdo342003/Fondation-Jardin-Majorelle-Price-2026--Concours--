<?php
// api/db_connect.php

// ⚠️ MODIFIER AVEC TES INFOS HOSTINGER
$host = "193.203.168.172"; // L'adresse de ton serveur de base de données
$user = "u710497052_admin"; // Ton username Hostinger
$pass = "AbdellahErraoui2026"; // Ton password
$dbname = "u710497052_concours"; // Ta base de données

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur de connexion base de données"]);
    exit;
}
?>