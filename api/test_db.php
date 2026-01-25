<?php
// api/test_db.php
require 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT DATABASE()");
    $name = $stmt->fetchColumn();
    echo "<h1>✅ M3allem! Connexion Réussie.</h1>";
    echo "<p>Rak connecté l la base de données : <strong>$name</strong> 3la Hostinger.</p>";
} catch (Exception $e) {
    echo "<h1>❌ Erreur</h1>";
    echo $e->getMessage();
}
?>