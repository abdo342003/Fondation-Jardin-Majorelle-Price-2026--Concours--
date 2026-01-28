<?php
// api/register.php - PRODUCTION v2.0
// Prix Fondation Jardin Majorelle 2026 - Step 1 Registration

// ═══════════════════════════════════════════════════════════════════
// 🔒 SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════

header("Access-Control-Allow-Origin: https://fondationjardinmajorelleprize.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Production: Hide errors from users
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration & database
require 'db_connect.php';

// ═══════════════════════════════════════════════════════════════════
// 🚫 METHOD CHECK
// ═══════════════════════════════════════════════════════════════════

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
    exit;
}

// ═══════════════════════════════════════════════════════════════════
// 📝 INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════════

$nom            = sanitizeInput($_POST['nom'] ?? '');
$prenom         = sanitizeInput($_POST['prenom'] ?? '');
$email          = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$date_naissance = $_POST['date_naissance'] ?? '';
$adresse        = sanitizeInput($_POST['adresse'] ?? '');
$phone_code     = sanitizeInput($_POST['phone_code'] ?? '+212');
$phone_number   = sanitizeInput($_POST['phone_number'] ?? '');
$ecole_archi    = sanitizeInput($_POST['ecole_archi'] ?? '');
$annee_obtention= intval($_POST['annee_obtention'] ?? 0);
$num_ordre      = sanitizeInput($_POST['num_ordre'] ?? '');

// ═══════════════════════════════════════════════════════════════════
// ✅ VALIDATION
// ═══════════════════════════════════════════════════════════════════

if (empty($nom) || empty($prenom) || empty($email) || empty($num_ordre) || empty($ecole_archi) || empty($date_naissance)) {
    echo json_encode(["success" => false, "message" => "Champs obligatoires manquants."]);
    exit;
}

if (!validateEmail($email)) {
    echo json_encode(["success" => false, "message" => "Format d'email invalide."]);
    exit;
}

if (!isset($_FILES['cin_recto']) || !isset($_FILES['cin_verso'])) {
    echo json_encode(["success" => false, "message" => "Les fichiers CIN (Recto et Verso) sont obligatoires."]);
    exit;
}

// ═══════════════════════════════════════════════════════════════════
// 📁 FILE UPLOAD FUNCTION
// ═══════════════════════════════════════════════════════════════════

$upload_dir = '../uploads/cin/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

function uploadCINFile($file, $prefix, $dir) {
    $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowed)) {
        throw new Exception("Format de fichier invalide ($ext). Utilisez PDF, JPG ou PNG.");
    }
    if ($file['size'] > MAX_CIN_SIZE) {
        throw new Exception("Le fichier est trop volumineux (> 5Mo).");
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Erreur lors du transfert du fichier.");
    }

    $filename = $prefix . '_' . uniqid() . '_' . time() . '.' . $ext;
    $dest = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Erreur lors de l'enregistrement sur le serveur.");
    }
    return $dest;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 MAIN PROCESSING
// ═══════════════════════════════════════════════════════════════════

try {
    // Check for duplicate registrations
    $check_stmt = $pdo->prepare("SELECT id FROM candidats WHERE email = ? OR num_ordre = ? LIMIT 1");
    $check_stmt->execute([$email, $num_ordre]);
    
    if ($check_stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Ce numéro CNOA ou cet email est déjà utilisé."]);
        exit;
    }

    // Start transaction
    $pdo->beginTransaction();

    // Upload files
    $path_recto = uploadCINFile($_FILES['cin_recto'], 'RECTO', $upload_dir);
    $path_verso = uploadCINFile($_FILES['cin_verso'], 'VERSO', $upload_dir);

    // Insert into database
    $sql = "INSERT INTO candidats 
            (nom, prenom, date_naissance, cin_recto, cin_verso, adresse, email, phone_code, phone_number, ecole_archi, annee_obtention, num_ordre, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $nom, $prenom, $date_naissance, $path_recto, $path_verso, 
        $adresse, $email, $phone_code, $phone_number, 
        $ecole_archi, $annee_obtention, $num_ordre
    ]);

    $candidat_id = $pdo->lastInsertId();
    $pdo->commit();
    
    error_log("NEW REGISTRATION: ID=$candidat_id | $prenom $nom | $email");

    // ═══════════════════════════════════════════════════════════════════
    // 📧 SEND EMAILS (Non-blocking)
    // ═══════════════════════════════════════════════════════════════════
    
    // Email to Candidate
    $candidateSubject = "📥 Inscription reçue - Prix Fondation Jardin Majorelle 2026";
    $candidateBody = "
    <!DOCTYPE html>
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background: linear-gradient(135deg, #1d4e89, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0;'>📥 Inscription Reçue</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Prix Fondation Jardin Majorelle 2026</p>
            </div>
            <div style='background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;'>
                <p>Bonjour <strong>$prenom $nom</strong>,</p>
                <p>Nous accusons réception de votre demande d'inscription.</p>
                
                <div style='background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3 style='margin-top: 0; color: #1d4e89;'>📋 Votre Dossier</h3>
                    <p><strong>N° Dossier:</strong> #$candidat_id<br>
                    <strong>CNOA:</strong> $num_ordre<br>
                    <strong>Email:</strong> $email</p>
                </div>
                
                <div style='background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;'>
                    <h3 style='margin-top: 0; color: #92400e;'>⏳ Prochaines Étapes</h3>
                    <ol style='margin: 0; padding-left: 20px;'>
                        <li>Vérification de votre éligibilité (48-72h)</li>
                        <li>Email avec lien unique pour déposer votre projet</li>
                        <li>Accès au formulaire de dépôt</li>
                    </ol>
                </div>
                
                <p style='margin-top: 25px;'>Surveillez votre boîte de réception (et vos spams).</p>
                <p>Cordialement,<br><strong>L'équipe du Prix Fondation Jardin Majorelle</strong></p>
            </div>
            <div style='background: #1a202c; color: #a0aec0; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;'>
                <p style='margin: 0;'>📧 contact@fondationjardinmajorelleprize.com</p>
                <p style='margin: 5px 0 0 0;'>🌐 fondationjardinmajorelleprize.com</p>
            </div>
        </div>
    </body></html>";
    
    sendEmail($email, $candidateSubject, $candidateBody);

    // Email to Jury
    $validation_link = API_URL . "/admin_review.php?id=" . $candidat_id;
    
    $jurySubject = "📂 [JURY] Nouvelle Candidature #$candidat_id - $prenom $nom";
    $juryBody = "
    <!DOCTYPE html>
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background: #f59e0b; color: #1a202c; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0;'>📂 Nouvelle Candidature</h1>
            </div>
            <div style='background: white; padding: 30px; border: 1px solid #e5e7eb;'>
                <h2 style='color: #1d4e89; margin-top: 0;'>$prenom $nom</h2>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr><td style='padding: 8px 0;'><strong>Dossier:</strong></td><td>#$candidat_id</td></tr>
                    <tr><td style='padding: 8px 0;'><strong>Email:</strong></td><td>$email</td></tr>
                    <tr><td style='padding: 8px 0;'><strong>École:</strong></td><td>$ecole_archi ($annee_obtention)</td></tr>
                    <tr><td style='padding: 8px 0;'><strong>CNOA:</strong></td><td>$num_ordre</td></tr>
                </table>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='$validation_link' style='background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>
                        📥 EXAMINER LE DOSSIER
                    </a>
                </div>
            </div>
        </div>
    </body></html>";
    
    sendEmail(ADMIN_EMAIL, $jurySubject, $juryBody, true);

    // ═══════════════════════════════════════════════════════════════════
    // ✅ SUCCESS RESPONSE
    // ═══════════════════════════════════════════════════════════════════
    
    echo json_encode([
        "success" => true, 
        "message" => "Inscription réussie ! Vérifiez vos emails."
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("REGISTRATION ERROR: " . $e->getMessage() . " | File: " . $e->getFile() . " | Line: " . $e->getLine());
    
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erreur lors du traitement. Veuillez réessayer."
    ]);
}
?>