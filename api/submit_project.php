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
// ✅ ENHANCED: Fetch ALL candidate data for comprehensive jury notification
$stmt = $pdo->prepare("SELECT * FROM candidats WHERE token_step2 = ? AND status = 'approved'");
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
        
        // === EMAIL 2: JURY NOTIFICATION WITH COMPLETE CANDIDATE PROFILE ===
        error_log("Step2: Sending comprehensive notification to jury: $adminEmail");
        
        // Format CIN URLs if files exist
        $cinRectoUrl = !empty($candidat['cin_recto']) ? $domaine . "/" . str_replace("../", "", $candidat['cin_recto']) : null;
        $cinVersoUrl = !empty($candidat['cin_verso']) ? $domaine . "/" . str_replace("../", "", $candidat['cin_verso']) : null;
        
        $jurySubject = "[NOUVEAU PROJET] " . $candidat['prenom'] . " " . $candidat['nom'] . " - École " . $candidat['ecole_archi'] . " (ID #" . $candidat['id'] . ")";
        
        $juryMessage = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\">
<head>
    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>
    <title>Nouveau Projet - Prix Fondation Jardin Majorelle 2026</title>
</head>
<body style=\"margin:0; padding:0; background-color:#f5f5f0; font-family:Arial, Helvetica, sans-serif;\">
    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f5f5f0;\">
        <tr>
            <td align=\"center\" style=\"padding:20px 10px;\">
                <!-- Main Container -->
                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background-color:#ffffff; box-shadow:0 4px 16px rgba(0,0,0,0.08); border-radius:8px; overflow:hidden;\">
                    
                    <!-- Header -->
                    <tr>
                        <td align=\"center\" style=\"background-color:#ffffff; padding:30px 20px; border-bottom:4px solid #f7b538;\">
                            <h1 style=\"margin:0; color:#1d4e89; font-size:26px; font-weight:700; letter-spacing:-0.5px;\">
                                Fondation Jardin Majorelle
                            </h1>
                            <p style=\"margin:10px 0 0 0; color:#666; font-size:14px; font-weight:500;\">
                                Prix National d'Architecture 2026
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Alert Badge -->
                    <tr>
                        <td style=\"padding:25px 30px 0 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#10b981; border-radius:6px;\">
                                <tr>
                                    <td align=\"center\" style=\"padding:15px; color:#ffffff; font-size:15px; font-weight:700;\">
                                        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:8px;\">
                                            <path d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                        </svg>
                                        Nouveau dossier complet reçu
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Candidate Name -->
                    <tr>
                        <td style=\"padding:30px 30px 10px 30px;\">
                            <h2 style=\"margin:0; color:#1d4e89; font-size:22px; font-weight:700;\">" . htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']) . "</h2>
                            <p style=\"margin:5px 0 0 0; color:#666; font-size:14px;\">" . htmlspecialchars($candidat['ecole_archi']) . " • Promo " . htmlspecialchars($candidat['annee_obtention']) . "</p>
                        </td>
                    </tr>
                    
                    <!-- Identity Section -->
                    <tr>
                        <td style=\"padding:25px 30px 0 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>
                                    <td style=\"padding-bottom:12px; border-bottom:2px solid #e5e5e5;\">
                                        <span style=\"color:#1d4e89; font-size:16px; font-weight:700;\">
                                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:6px;\">
                                                <path d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\" fill=\"#1d4e89\"/>
                                            </svg>
                                            Informations du candidat
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding:15px 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>
                                    <td width=\"50%\" style=\"padding:10px 10px 10px 0; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border-left:3px solid #1d4e89;\">
                                            <tr>
                                                <td style=\"padding:12px;\">
                                                    <p style=\"margin:0 0 5px 0; font-size:11px; color:#6c757d; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;\">Email</p>
                                                    <p style=\"margin:0; font-size:14px; color:#212529; font-weight:600;\">" . htmlspecialchars($candidat['email']) . "</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td width=\"50%\" style=\"padding:10px 0 10px 10px; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border-left:3px solid #1d4e89;\">
                                            <tr>
                                                <td style=\"padding:12px;\">
                                                    <p style=\"margin:0 0 5px 0; font-size:11px; color:#6c757d; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;\">Téléphone</p>
                                                    <p style=\"margin:0; font-size:14px; color:#212529; font-weight:600;\">" . htmlspecialchars($candidat['phone_code'] . ' ' . ($candidat['phone_number'] ?? 'N/A')) . "</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width=\"50%\" style=\"padding:10px 10px 10px 0; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border-left:3px solid #1d4e89;\">
                                            <tr>
                                                <td style=\"padding:12px;\">
                                                    <p style=\"margin:0 0 5px 0; font-size:11px; color:#6c757d; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;\">Date de naissance</p>
                                                    <p style=\"margin:0; font-size:14px; color:#212529; font-weight:600;\">" . htmlspecialchars($candidat['date_naissance'] ?? 'Non spécifié') . "</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td width=\"50%\" style=\"padding:10px 0 10px 10px; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border-left:3px solid #1d4e89;\">
                                            <tr>
                                                <td style=\"padding:12px;\">
                                                    <p style=\"margin:0 0 5px 0; font-size:11px; color:#6c757d; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;\">CNOA</p>
                                                    <p style=\"margin:0; font-size:14px; color:#212529; font-weight:600;\">" . htmlspecialchars($candidat['num_ordre']) . "</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Files Section -->
                    <tr>
                        <td style=\"padding:25px 30px 0 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>
                                    <td style=\"padding-bottom:12px; border-bottom:2px solid #e5e5e5;\">
                                        <span style=\"color:#1d4e89; font-size:16px; font-weight:700;\">
                                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:6px;\">
                                                <path d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" stroke=\"#1d4e89\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                            </svg>
                                            Documents du projet
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding:15px 30px 25px 30px;\">
                            <!-- Bio File -->
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-bottom:12px; background-color:#f8f9fa; border-radius:6px;\">
                                <tr>
                                    <td style=\"padding:15px;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                            <tr>
                                                <td width=\"70%\" style=\"vertical-align:middle;\">
                                                    <p style=\"margin:0 0 4px 0; font-size:15px; color:#212529; font-weight:700;\">
                                                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:8px;\">
                                                            <path d=\"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z\" fill=\"#dc2626\"/>
                                                            <path d=\"M9 13h6M9 17h6M13 3v6h6\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>
                                                        </svg>
                                                        Biographie professionnelle
                                                    </p>
                                                    <p style=\"margin:0; font-size:12px; color:#6c757d;\">Format PDF</p>
                                                </td>
                                                <td width=\"30%\" align=\"right\" style=\"vertical-align:middle;\">
                                                    <a href=\"" . $bioUrl . "\" style=\"display:inline-block; background-color:#1d4e89; color:#ffffff; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:700; font-size:13px;\">
                                                        <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:5px;\">
                                                            <path d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                                        </svg>
                                                        Télécharger
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Note File -->
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-bottom:12px; background-color:#f8f9fa; border-radius:6px;\">
                                <tr>
                                    <td style=\"padding:15px;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                            <tr>
                                                <td width=\"70%\" style=\"vertical-align:middle;\">
                                                    <p style=\"margin:0 0 4px 0; font-size:15px; color:#212529; font-weight:700;\">
                                                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:8px;\">
                                                            <path d=\"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z\" fill=\"#dc2626\"/>
                                                            <path d=\"M9 13h6M9 17h6M13 3v6h6\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>
                                                        </svg>
                                                        Note d'intention
                                                    </p>
                                                    <p style=\"margin:0; font-size:12px; color:#6c757d;\">Format PDF</p>
                                                </td>
                                                <td width=\"30%\" align=\"right\" style=\"vertical-align:middle;\">
                                                    <a href=\"" . $noteUrl . "\" style=\"display:inline-block; background-color:#1d4e89; color:#ffffff; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:700; font-size:13px;\">
                                                        <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:5px;\">
                                                            <path d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                                        </svg>
                                                        Télécharger
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- APS File -->
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#fff7ed; border-radius:6px; border:2px solid #f7b538;\">
                                <tr>
                                    <td style=\"padding:15px;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                            <tr>
                                                <td width=\"70%\" style=\"vertical-align:middle;\">
                                                    <p style=\"margin:0 0 4px 0; font-size:15px; color:#212529; font-weight:700;\">
                                                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:8px;\">
                                                            <path d=\"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z\" fill=\"#dc2626\"/>
                                                            <path d=\"M9 13h6M9 17h6M13 3v6h6\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>
                                                        </svg>
                                                        Avant-Projet Sommaire (APS)
                                                    </p>
                                                    <p style=\"margin:0; font-size:12px; color:#92400e; font-weight:600;\">Projet principal • Max 10 Mo</p>
                                                </td>
                                                <td width=\"30%\" align=\"right\" style=\"vertical-align:middle;\">
                                                    <a href=\"" . $apsUrl . "\" style=\"display:inline-block; background-color:#f7b538; color:#1d4e89; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:700; font-size:14px;\">
                                                        <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:5px;\">
                                                            <path d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\" stroke=\"#1d4e89\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                                        </svg>
                                                        Télécharger APS
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CIN Section -->
                    <tr>
                        <td style=\"padding:25px 30px 0 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>
                                    <td style=\"padding-bottom:12px; border-bottom:2px solid #e5e5e5;\">
                                        <span style=\"color:#1d4e89; font-size:16px; font-weight:700;\">
                                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle; margin-right:6px;\">
                                                <path d=\"M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2\" stroke=\"#1d4e89\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                            </svg>
                                            Pièces d'identité (CIN)
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding:15px 30px;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>";
                    
                    if ($cinRectoUrl) {
                        $juryMessage .= "
                                    <td width=\"50%\" style=\"padding:0 10px 0 0; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border:1px solid #dee2e6;\">
                                            <tr>
                                                <td align=\"center\" style=\"padding:15px;\">
                                                    <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
                                                        <path d=\"M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2\" stroke=\"#1d4e89\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                                    </svg>
                                                    <p style=\"margin:10px 0 8px 0; font-size:13px; color:#212529; font-weight:700;\">CIN Recto</p>
                                                    <a href=\"" . $cinRectoUrl . "\" style=\"color:#1d4e89; text-decoration:none; font-size:12px; font-weight:600;\">Voir le document →</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>";
                    } else {
                        $juryMessage .= "
                                    <td width=\"50%\" style=\"padding:0 10px 0 0; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#fef2f2; border-radius:4px; border:1px solid #fecaca;\">
                                            <tr>
                                                <td align=\"center\" style=\"padding:15px;\">
                                                    <p style=\"margin:0; font-size:12px; color:#991b1b;\">Non disponible</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>";
                    }
                    
                    if ($cinVersoUrl) {
                        $juryMessage .= "
                                    <td width=\"50%\" style=\"padding:0 0 0 10px; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f8f9fa; border-radius:4px; border:1px solid #dee2e6;\">
                                            <tr>
                                                <td align=\"center\" style=\"padding:15px;\">
                                                    <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
                                                        <path d=\"M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2\" stroke=\"#1d4e89\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                                                    </svg>
                                                    <p style=\"margin:10px 0 8px 0; font-size:13px; color:#212529; font-weight:700;\">CIN Verso</p>
                                                    <a href=\"" . $cinVersoUrl . "\" style=\"color:#1d4e89; text-decoration:none; font-size:12px; font-weight:600;\">Voir le document →</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>";
                    } else {
                        $juryMessage .= "
                                    <td width=\"50%\" style=\"padding:0 0 0 10px; vertical-align:top;\">
                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#fef2f2; border-radius:4px; border:1px solid #fecaca;\">
                                            <tr>
                                                <td align=\"center\" style=\"padding:15px;\">
                                                    <p style=\"margin:0; font-size:12px; color:#991b1b;\">Non disponible</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>";
                    }
                    
                $juryMessage .= "
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style=\"background-color:#f8f9fa; padding:25px 30px; border-top:1px solid #e5e5e5;\">
                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                                <tr>
                                    <td align=\"center\">
                                        <p style=\"margin:0 0 8px 0; color:#1d4e89; font-size:15px; font-weight:700;\">Prix Fondation Jardin Majorelle 2026</p>
                                        <p style=\"margin:0; color:#6c757d; font-size:13px;\">Concours National d'Architecture</p>
                                        <p style=\"margin:15px 0 0 0; color:#adb5bd; font-size:11px;\">© 2026 Fondation Jardin Majorelle • Tous droits réservés</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
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