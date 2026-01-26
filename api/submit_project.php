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

    // C. Send notification emails (ISOLATED - won't block success)
    try {
        $adminEmail = "abdoraoui9@gmail.com";
        $domaine = "https://fondationjardinmajorelleprize.com";
        
        // Convert relative file paths to full URLs for email links
        $bioUrl = $domaine . "/" . str_replace("../", "", $bio_path);
        $noteUrl = $domaine . "/" . str_replace("../", "", $note_path);
        $apsUrl = $domaine . "/" . str_replace("../", "", $aps_path);
        
        // === EMAIL 1: CANDIDATE CONFIRMATION ===
        error_log("Step2: Sending confirmation email to candidate: " . $candidat['email']);
        
        $candidateSubject = "Confirmation de dépôt - Prix Fondation Jardin Majorelle 2026";
        
        $candidateMessage = "<!DOCTYPE html>
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

        $candidateHeaders = "MIME-Version: 1.0\r\n";
        $candidateHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
        $candidateHeaders .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
        $candidateHeaders .= "Reply-To: contact@fondationjardinmajorelleprize.com\r\n";
        $candidateHeaders .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $candidateHeaders .= "X-Priority: 3\r\n";
        
        set_time_limit(10);
        $candidateEmailSent = @mail($candidat['email'], $candidateSubject, $candidateMessage, $candidateHeaders);
        set_time_limit(300);
        
        if ($candidateEmailSent) {
            error_log("Step2: Candidate confirmation email sent successfully");
        } else {
            error_log("Step2: WARNING - Candidate email failed");
        }
        
        // === EMAIL 2: JURY NOTIFICATION WITH FILE LINKS ===
        error_log("Step2: Sending detailed notification to jury: $adminEmail");
        
        $jurySubject = "[NOUVEAU PROJET] Candidat: " . $candidat['prenom'] . " " . $candidat['nom'] . " (ID #" . $candidat['id'] . ")";
        
        $juryMessage = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1d4e89 0%, #0055B8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #0055B8; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box strong { color: #1d4e89; }
        .files-section { margin: 25px 0; }
        .file-item { background: white; border: 2px solid #e9ecef; padding: 15px; margin: 10px 0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; }
        .file-item:hover { border-color: #0055B8; }
        .file-icon { font-size: 32px; margin-right: 15px; }
        .file-info { flex: 1; }
        .file-name { font-weight: 600; color: #333; font-size: 14px; }
        .file-type { color: #777; font-size: 12px; }
        .download-btn { background: #0055B8; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
        .download-btn:hover { background: #1d4e89; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #e9ecef; }
        .badge { display: inline-block; background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📁 Nouveau Projet Soumis</h1>
            <p>Prix Fondation Jardin Majorelle 2026</p>
        </div>
        
        <div class='content'>
            <p style='font-size: 16px; color: #555;'>Un candidat a déposé son projet complet. Voici les détails :</p>
            
            <div class='info-box'>
                <p><strong>👤 Candidat:</strong> " . htmlspecialchars($candidat['prenom']) . " " . htmlspecialchars($candidat['nom']) . "</p>
                <p><strong>🆔 ID Dossier:</strong> #" . $candidat['id'] . "</p>
                <p><strong>📧 Email:</strong> " . htmlspecialchars($candidat['email']) . "</p>
                <p><strong>📅 Date de soumission:</strong> " . date('d/m/Y à H:i') . "</p>
                <p><strong>📊 Statut:</strong> <span class='badge'>Dossier Complet</span></p>
            </div>
            
            <div class='files-section'>
                <h3 style='color: #1d4e89; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;'>📎 Documents Téléchargeables</h3>
                
                <div class='file-item'>
                    <div style='display: flex; align-items: center; flex: 1;'>
                        <div class='file-icon'>📄</div>
                        <div class='file-info'>
                            <div class='file-name'>Biographie Professionnelle</div>
                            <div class='file-type'>Format: PDF</div>
                        </div>
                    </div>
                    <a href='" . $bioUrl . "' class='download-btn' target='_blank'>⬇️ Télécharger Bio</a>
                </div>
                
                <div class='file-item'>
                    <div style='display: flex; align-items: center; flex: 1;'>
                        <div class='file-icon'>📄</div>
                        <div class='file-info'>
                            <div class='file-name'>Note d'Intention</div>
                            <div class='file-type'>Format: PDF</div>
                        </div>
                    </div>
                    <a href='" . $noteUrl . "' class='download-btn' target='_blank'>⬇️ Télécharger Note</a>
                </div>
                
                <div class='file-item'>
                    <div style='display: flex; align-items: center; flex: 1;'>
                        <div class='file-icon'>📄</div>
                        <div class='file-info'>
                            <div class='file-name'>Avant-Projet Sommaire (APS)</div>
                            <div class='file-type'>Format: PDF</div>
                        </div>
                    </div>
                    <a href='" . $apsUrl . "' class='download-btn' target='_blank'>⬇️ Télécharger APS</a>
                </div>
            </div>
            
            <div style='background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 25px; border-radius: 4px;'>
                <p style='margin: 0; color: #92400e;'><strong>📌 Action requise:</strong> Merci de consulter les documents et de procéder à l'évaluation du projet selon les critères du jury.</p>
            </div>
        </div>
        
        <div class='footer'>
            <p><strong>Prix Fondation Jardin Majorelle 2026</strong></p>
            <p>Cet email est une notification automatique du système de gestion des candidatures.</p>
            <p>© 2026 Fondation Jardin Majorelle - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>";

        $juryHeaders = "MIME-Version: 1.0\r\n";
        $juryHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
        $juryHeaders .= "From: Système Prix Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
        $juryHeaders .= "Reply-To: " . $candidat['email'] . "\r\n";
        $juryHeaders .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $juryHeaders .= "X-Priority: 1\r\n"; // High priority for jury
        
        set_time_limit(10);
        $juryEmailSent = @mail($adminEmail, $jurySubject, $juryMessage, $juryHeaders);
        set_time_limit(300);
        
        if ($juryEmailSent) {
            error_log("Step2: Jury notification email sent successfully to: $adminEmail");
        } else {
            error_log("Step2: WARNING - Jury notification email failed");
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