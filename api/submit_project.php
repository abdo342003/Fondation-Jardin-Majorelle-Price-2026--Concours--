<?php
// api/submit_project.php

// 1. --- HEADERS & CONFIG ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Désactiver l'affichage des erreurs brutes (on renvoie du JSON)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Gestion du Preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db_connect.php';
 
// 2. --- VERIFICATION DU TOKEN ---
$token = $_POST['token'] ?? '';

if (empty($token)) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Accès refusé. Token manquant."]);
    exit;
}

// Vérifier si le token est valide et appartient à un candidat accepté
$stmt = $pdo->prepare("SELECT id, nom, prenom FROM candidats WHERE token_step2 = ? AND status = 'accepted'");
$stmt->execute([$token]);
$candidat = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$candidat) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Ce lien est invalide ou a déjà été utilisé."]);
    exit;
}

// 3. --- CONFIGURATION UPLOAD ---
$upload_dir = '../uploads/projets/'; 

// Création du dossier s'il n'existe pas
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Fonction d'upload (Modifiée pour accepter IMAGES + PDF pour le test)
function uploadFile($file, $type, $dir, $maxSize) {
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // ✅ LISTE DES EXTENSIONS AUTORISÉES (PDF + IMAGES pour le test)
    $allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    
    if (!in_array($ext, $allowed)) {
        throw new Exception("Le fichier $type doit être un PDF, JPG ou PNG.");
    }
    
    if ($file['size'] > $maxSize) {
        throw new Exception("Le fichier $type est trop volumineux (Max autorisé dépassé).");
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Erreur technique lors de l'upload du fichier $type.");
    }

    // Nom unique pour éviter les conflits
    $filename = $type . '_' . uniqid() . '.' . $ext;
    $dest = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Impossible d'enregistrer le fichier. Vérifiez les permissions du dossier 'uploads'.");
    }
    
    return $dest; // On retourne le chemin
}

// 4. --- TRAITEMENT PRINCIPAL ---
try {
    $pdo->beginTransaction();

    // Vérification de la présence des fichiers
    if (!isset($_FILES['bio_file']) || !isset($_FILES['presentation_file']) || !isset($_FILES['aps_file'])) {
        throw new Exception("Tous les fichiers (Bio, Note, APS) sont obligatoires.");
    }

    // A. Upload des fichiers
    // Limites : 2Mo pour Bio/Note, 10Mo pour APS
    $bio_path  = uploadFile($_FILES['bio_file'], 'BIO', $upload_dir, 2 * 1024 * 1024);
    $note_path = uploadFile($_FILES['presentation_file'], 'NOTE', $upload_dir, 2 * 1024 * 1024);
    $aps_path  = uploadFile($_FILES['aps_file'], 'APS', $upload_dir, 10 * 1024 * 1024);

    // B. Mise à jour Base de Données
    // On passe le status à 'completed' et on supprime le token (token_step2 = NULL)
    $sql = "UPDATE candidats SET 
            bio_file = ?, 
            presentation_file = ?, 
            aps_file = ?, 
            status = 'completed',
            token_step2 = NULL,
            date_submission_step2 = NOW() 
            WHERE id = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$bio_path, $note_path, $aps_path, $candidat['id']]);

    $pdo->commit();

    // 5. --- SUCCÈS ---
    echo json_encode([
        "success" => true, 
        "message" => "Félicitations ! Votre projet a été déposé avec succès."
    ]);

} catch (Exception $e) {
    // En cas d'erreur, on annule tout
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erreur Serveur : " . $e->getMessage()
    ]);
}
?>