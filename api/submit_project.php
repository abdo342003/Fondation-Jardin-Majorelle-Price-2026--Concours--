<?php
// api/submit_project.php - PRODUCTION v4.0
// Prix Fondation Jardin Majorelle 2026 - Step 2 Project Submission

require_once __DIR__ . '/db_connect.php';

// Set security headers (from config.php)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
setSecurityHeaders($origin);

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ═══════════════════════════════════════════════════════════════════
//  TOKEN VALIDATION
// ═══════════════════════════════════════════════════════════════════

$token = $_POST['token'] ?? '';
$language = sanitizeInput($_POST['language'] ?? 'fr');

if (empty($token)) {
    errorResponse("Accès refusé. Token manquant.", 403);
}

// Validate token and get candidate
$stmt = $pdo->prepare("SELECT * FROM candidats WHERE token_step2 = ? AND status = 'approved'");
$stmt->execute([$token]);
$candidat = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$candidat) {
    logSecurityEvent("Invalid token attempt", ['token' => substr($token, 0, 10)]);
    errorResponse("Ce lien est invalide, a expiré ou a déjà été utilisé.", 403);
}

// Get language from database
if (empty($language) || !in_array($language, ['fr', 'en'])) {
    $language = $candidat['language'] ?? 'fr';
}

// ═══════════════════════════════════════════════════════════════════
// 📁 FILE UPLOAD CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

// Ensure upload directory exists
if (!is_dir(UPLOAD_DIR_PROJECTS)) {
    if (!mkdir(UPLOAD_DIR_PROJECTS, 0755, true)) {
        logMessage("Failed to create upload directory", 'ERROR');
        errorResponse("Erreur serveur: Impossible de créer le dossier uploads.", 500);
    }
}

// 4. --- TRAITEMENT PRINCIPAL ---
try {
    // A. Upload des fichiers avec limites appropriées (using helpers.php uploadFileSafely)
    error_log("Step2: Starting file upload for token: " . substr($token, 0, 10) . "...");
    
    $bio_path_full  = uploadFileSafely($_FILES['bio_file'], 'BIO', UPLOAD_DIR_PROJECTS, ['pdf'], MAX_BIO_SIZE);
    $note_path_full = uploadFileSafely($_FILES['presentation_file'], 'NOTE', UPLOAD_DIR_PROJECTS, ['pdf'], MAX_NOTE_SIZE);
    $aps_path_full  = uploadFileSafely($_FILES['aps_file'], 'APS', UPLOAD_DIR_PROJECTS, ['pdf'], MAX_APS_SIZE);

    // Store relative paths in database (consistent with CIN files)
    $bio_path  = 'uploads/projets/' . basename($bio_path_full);
    $note_path = 'uploads/projets/' . basename($note_path_full);
    $aps_path  = 'uploads/projets/' . basename($aps_path_full);

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
        // Convert relative file paths to full URLs for email links
        $bioUrl = SITE_URL . "/" . $bio_path;
        $noteUrl = SITE_URL . "/" . $note_path;
        $apsUrl = SITE_URL . "/" . $aps_path;
        
        // === EMAIL 1: CANDIDATE CONFIRMATION (Multi-language) ===
        error_log("STEP2: Sending confirmation email to: " . $candidat['email']);
        
        require_once 'email_templates_step2.php';
        
        $emailData = [
            'id' => $candidat['id'],
            'prenom' => $candidat['prenom'],
            'nom' => $candidat['nom'],
            'email' => $candidat['email'],
            'ecole_archi' => $candidat['ecole_archi'],
            'diplome' => $candidat['diplome'],
            'annee_obtention' => $candidat['annee_obtention'],
            'num_ordre' => $candidat['num_ordre'],
            'bioUrl' => $bioUrl,
            'noteUrl' => $noteUrl,
            'apsUrl' => $apsUrl,
            'cinRectoUrl' => SITE_URL . "/" . $candidat['cin_recto'],
            'cinVersoUrl' => SITE_URL . "/" . $candidat['cin_verso']
        ];
        
        $emailTemplates = getProjectSubmissionEmailTemplates($language, $emailData);
        
        $candidateSubject = $emailTemplates['candidateSubject'];
        $candidateMessage = $emailTemplates['candidateBody'];

        // Send candidate confirmation using centralized function
        $candidateEmailSent = sendEmail($candidat['email'], $candidateSubject, $candidateMessage);
        
        if ($candidateEmailSent) {
            error_log("STEP2: Candidate confirmation sent to: " . $candidat['email']);
        } else {
            error_log("STEP2: WARNING - Candidate confirmation failed");
        }
        
    } catch (Throwable $emailError) {
        error_log("STEP2: Candidate email exception: " . $emailError->getMessage());
    }

    // === EMAIL 2: JURY NOTIFICATION (using branded template) ===
    try {
        error_log("STEP2: Sending jury notification");
        
        $jurySubject = $emailTemplates['jurySubject'];
        $juryMessage = $emailTemplates['juryBody'];

        $juryEmailSent = sendEmail(ADMIN_EMAIL, $jurySubject, $juryMessage, true);
        
        if ($juryEmailSent) {
            error_log("STEP2: Jury notification sent to: " . ADMIN_EMAIL);
        } else {
            error_log("STEP2: WARNING - Jury notification failed");
        }
    } catch (Throwable $emailError) {
        error_log("STEP2: Jury email exception: " . $emailError->getMessage());
    }

    // ✅ SUCCESS RESPONSE (files + database OK)
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Félicitations ! Votre projet a été déposé avec succès."
    ], JSON_UNESCAPED_UNICODE);
    
    error_log("STEP2: SUCCESS - Candidate ID: " . $candidat['id'] . " | " . $candidat['email']);
    exit;

} catch (Exception $e) {
    // CRITICAL ERROR (file upload or database failed)
    error_log("STEP2: CRITICAL ERROR - " . $e->getMessage());
    
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("STEP2: Database transaction rolled back");
    }
    
    // Clean up uploaded files if any
    if (isset($bio_path_full) && file_exists($bio_path_full)) {
        @unlink($bio_path_full);
        error_log("Step2: Cleaned up bio_file: $bio_path_full");
    }
    if (isset($note_path_full) && file_exists($note_path_full)) {
        @unlink($note_path_full);
        error_log("Step2: Cleaned up presentation_file: $note_path_full");
    }
    if (isset($aps_path_full) && file_exists($aps_path_full)) {
        @unlink($aps_path_full);
        error_log("Step2: Cleaned up aps_file: $aps_path_full");
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