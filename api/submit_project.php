<?php
// api/submit_project.php - FAULT-TOLERANT VERSION FOR HOSTINGER PRODUCTION
// Version: 2.1 - Email isolated, no blocking

// 1. --- HEADERS & CONFIG ---
$allowedOrigins = [
    'https://fondationjardinmajorelleprize.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://fondationjardinmajorelleprize.com");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');

// ✅ PRODUCTION: Disable error display for security
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Log all errors to file
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');

// Preflight CORS request
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

// ✅ FIX: Changed 'accepted' to 'approved' to match database ENUM
$stmt = $pdo->prepare("SELECT id, nom, prenom, email, status FROM candidats WHERE token_step2 = ? AND status = 'approved'");
$stmt->execute([$token]);
$candidat = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$candidat) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Ce lien est invalide, a expiré ou a déjà été utilisé."]);
    exit;
}

// 3. --- CONFIGURATION UPLOAD ---
$upload_dir = '../uploads/projets/'; 

// Création du dossier s'il n'existe pas
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur: Impossible de créer le dossier uploads."]);
        exit;
    }
}

// ✅ ENHANCED: Better upload function with validation
function uploadFile($file, $type, $dir, $maxSize) {
    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        throw new Exception("Le fichier $type est obligatoire.");
    }
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // ✅ PDF only
    if ($ext !== 'pdf') {
        throw new Exception("Le fichier $type doit être au format PDF uniquement.");
    }
    
    // Size validation
    if ($file['size'] > $maxSize) {
        $maxMB = round($maxSize / (1024 * 1024), 1);
        throw new Exception("Le fichier $type dépasse la taille maximale autorisée ($maxMB Mo).");
    }
    
    if ($file['size'] === 0) {
        throw new Exception("Le fichier $type est vide.");
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Le fichier dépasse la limite du serveur.',
            UPLOAD_ERR_FORM_SIZE => 'Le fichier dépasse la limite du formulaire.',
            UPLOAD_ERR_PARTIAL => 'Le fichier n\'a été que partiellement téléchargé.',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant sur le serveur.',
            UPLOAD_ERR_CANT_WRITE => 'Échec de l\'écriture sur le disque.',
            UPLOAD_ERR_EXTENSION => 'Une extension PHP a arrêté le téléchargement.'
        ];
        
        $errorMsg = $errorMessages[$file['error']] ?? 'Erreur inconnue lors de l\'upload.';
        throw new Exception("Erreur $type: $errorMsg");
    }

    // Vérification MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if ($mimeType !== 'application/pdf') {
        throw new Exception("Le fichier $type n'est pas un PDF valide.");
    }

    // Nom unique sécurisé
    $filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $type) . '_' . uniqid() . '_' . time() . '.pdf';
    $dest = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Impossible d'enregistrer le fichier $type. Vérifiez les permissions.");
    }
    
    return $dest;
}

// 4. --- TRAITEMENT PRINCIPAL ---
try {
    // A. Upload des fichiers avec limites appropriées
    error_log("Step2: Starting file upload for token: " . substr($token, 0, 10) . "...");
    
    $bio_path  = uploadFile($_FILES['bio_file'], 'BIO', $upload_dir, 2 * 1024 * 1024);
    $note_path = uploadFile($_FILES['presentation_file'], 'NOTE', $upload_dir, 2 * 1024 * 1024);
    $aps_path  = uploadFile($_FILES['aps_file'], 'APS', $upload_dir, 10 * 1024 * 1024);

    error_log("Step2: Files uploaded successfully - BIO: $bio_path, NOTE: $note_path, APS: $aps_path");

    // B. Mise à jour Base de Données (avec transaction)
    $pdo->beginTransaction();
    
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
    
    if ($stmt->rowCount() === 0) {
        throw new Exception("Erreur lors de la mise à jour du dossier.");
    }

    $pdo->commit();
    error_log("Step2: Database updated successfully for candidate ID: " . $candidat['id']);

    // ✅ AT THIS POINT: Files uploaded + Database updated = SUCCESS guaranteed
    // Email is now OPTIONAL and won't block the response

    // C. Send notification email (ISOLATED - won't block success)
    try {
        error_log("Step2: Attempting to send notification email to: " . $candidat['email']);
        
        $subject = "Confirmation de dépôt - Prix Fondation Jardin Majorelle 2026";
        
        $htmlMessage = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #0055B8; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 30px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✅ Projet Reçu !</h1>
        </div>
        <div class='content'>
            <p>Bonjour <strong>" . htmlspecialchars($candidat['prenom']) . " " . htmlspecialchars($candidat['nom']) . "</strong>,</p>
            
            <p>Nous avons bien reçu votre dossier de projet pour le <strong>Prix Fondation Jardin Majorelle 2026</strong>.</p>
            
            <p><strong>Documents reçus :</strong></p>
            <ul>
                <li>✅ Biographie</li>
                <li>✅ Note d'intention</li>
                <li>✅ Avant-Projet Sommaire (APS)</li>
            </ul>
            
            <p>Votre candidature est désormais <strong>complète</strong> et sera examinée par notre jury.</p>
            
            <p>Les résultats seront annoncés le <strong>15 Mai 2026</strong>.</p>
            
            <p>Nous vous souhaitons plein succès !</p>
            
            <p>Cordialement,<br><strong>L'équipe du Prix Fondation Jardin Majorelle</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Fondation Jardin Majorelle - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>";

        // ✅ ROBUST EMAIL HEADERS for Hostinger
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
        $headers .= "Reply-To: no-reply@fondationjardinmajorelleprize.com\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3\r\n";
        
        // Send email with timeout protection
        set_time_limit(10); // Max 10 seconds for email
        $emailSent = @mail($candidat['email'], $subject, $htmlMessage, $headers);
        set_time_limit(300); // Reset to normal
        
        if ($emailSent) {
            error_log("Step2: Confirmation email sent successfully to: " . $candidat['email']);
        } else {
            error_log("Step2: WARNING - Email failed to send to: " . $candidat['email']);
        }
        
    } catch (Throwable $emailError) {
        // ⚠️ CRITICAL: Email failure is logged but DOES NOT BLOCK success response
        error_log("Step2: Email exception caught: " . $emailError->getMessage());
        error_log("Step2: Email trace: " . $emailError->getTraceAsString());
        // Continue to success response below
    }

    // D. ✅ ALWAYS return success if we reached here (files + database OK)
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Félicitations ! Votre projet a été déposé avec succès."
    ], JSON_UNESCAPED_UNICODE);
    
    error_log("Step2: SUCCESS response sent to frontend for candidate ID: " . $candidat['id']);
    exit;

} catch (Exception $e) {
    // ❌ CRITICAL ERROR (file upload or database failed)
    error_log("Step2: CRITICAL ERROR - " . $e->getMessage());
    error_log("Step2: Error trace: " . $e->getTraceAsString());
    
    // Rollback database if transaction is active
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Step2: Database transaction rolled back");
    }
    
    // Clean up uploaded files if any
    if (isset($bio_path) && file_exists($bio_path)) {
        @unlink($bio_path);
        error_log("Step2: Cleaned up bio_file: $bio_path");
    }
    if (isset($note_path) && file_exists($note_path)) {
        @unlink($note_path);
        error_log("Step2: Cleaned up presentation_file: $note_path");
    }
    if (isset($aps_path) && file_exists($aps_path)) {
        @unlink($aps_path);
        error_log("Step2: Cleaned up aps_file: $aps_path");
    }
    
    // Return error to frontend
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>