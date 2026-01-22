<?php
// api/register.php

// --- CONFIGURATION ---
header("Access-Control-Allow-Origin: *"); // ⚠️ A sécuriser en prod (mettre ton domaine React)
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'db_connect.php';

// EMAIL JURY
$jury_email = "abdoraoui9@gmail.com"; 

// --- 1. VERIFICATION DES DONNEES ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
    exit;
}

// Récupération des champs textes
$nom = $_POST['nom'] ?? '';
$prenom = $_POST['prenom'] ?? '';
$email = $_POST['email'] ?? '';
$date_naissance = $_POST['date_naissance'] ?? '';
// ... autres champs (je simplifie pour la lisibilité, mais ajoute tout)

// Vérification basique
if (empty($nom) || empty($email) || !isset($_FILES['cin_recto'])) {
    echo json_encode(["success" => false, "message" => "Champs manquants"]);
    exit;
}

// --- 2. GESTION DES UPLOADS (SÉCURITÉ CYBER) ---
$upload_dir = '../uploads/cin/'; // Dossier hors racine web si possible, sinon protéger avec .htaccess
if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

function uploadFile($file, $prefix, $dir) {
    $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowed)) throw new Exception("Format fichier invalide ($ext)");
    if ($file['size'] > 5 * 1024 * 1024) throw new Exception("Fichier trop volumineux (>5Mo)");

    // Renommage sécurisé : UUID ou Timestamp_Random
    $new_name = $prefix . '_' . uniqid() . '.' . $ext;
    $dest = $dir . $new_name;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Erreur upload serveur");
    }
    return $dest; // On stocke le chemin
}

try {
    $pdo->beginTransaction();

    // Upload CIN Recto
    $path_recto = uploadFile($_FILES['cin_recto'], 'RECTO', $upload_dir);
    // Upload CIN Verso
    $path_verso = uploadFile($_FILES['cin_verso'], 'VERSO', $upload_dir);

    // --- 3. INSERTION BASE DE DONNEES ---
    $sql = "INSERT INTO candidats (nom, prenom, date_naissance, cin_recto, cin_verso, adresse, email, phone_code, phone_number, ecole_archi, annee_obtention, num_ordre, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $_POST['nom'],
        $_POST['prenom'],
        $_POST['date_naissance'],
        $path_recto,
        $path_verso,
        $_POST['adresse'],
        $_POST['email'],
        $_POST['phone_code'],
        $_POST['phone_number'],
        $_POST['ecole_archi'],
        $_POST['annee_obtention'],
        $_POST['num_ordre']
    ]);

    $candidat_id = $pdo->lastInsertId();
    $pdo->commit();

    // --- 4. ENVOI EMAILS ---

    // A. Email au Candidat (Accusé réception)
    $subject_candidat = "Confirmation Inscription - Prix Jardin Majorelle";
    $message_candidat = "Bonjour $prenom,\n\nVotre dossier d'inscription a bien été reçu. Il est en cours d'étude par notre jury.\n\nCordialement,\nLa Fondation.";
    mail($email, $subject_candidat, $message_candidat, "From: no-reply@jardinmajorelle.com");

    // B. Email au JURY (abdoraoui9@gmail.com)
    $validation_link = "http://ton-site-hostinger.com/api/admin_review.php?id=" . $candidat_id; // Lien à créer plus tard
    
    $subject_jury = "ACTION REQUISE : Nouveau Candidat ($prenom $nom)";
    $message_jury = "Nouveau dossier reçu !\n\n" .
                    "Nom : $nom $prenom\n" .
                    "École : " . $_POST['ecole_archi'] . "\n\n" .
                    "Cliquez ici pour valider le dossier et voir la CIN :\n" .
                    $validation_link;

    // Envoi
    mail($jury_email, $subject_jury, $message_jury, "From: no-reply@jardinmajorelle.com");

    // Réponse Succès pour React
    echo json_encode(["success" => true, "message" => "Inscription réussie"]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
}
?>