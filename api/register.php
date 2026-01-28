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

$nom            = sanitizeInput(trim($_POST['nom'] ?? ''));
$prenom         = sanitizeInput(trim($_POST['prenom'] ?? ''));
$email          = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$date_naissance = trim($_POST['date_naissance'] ?? '');
$adresse        = sanitizeInput(trim($_POST['adresse'] ?? ''));
$phone_code     = sanitizeInput(trim($_POST['phone_code'] ?? '+212'));
$phone_number   = sanitizeInput(trim($_POST['phone_number'] ?? ''));
$ecole_archi    = sanitizeInput(trim($_POST['ecole_archi'] ?? ''));
$diplome        = sanitizeInput(trim($_POST['diplome'] ?? ''));
$annee_obtention= intval($_POST['annee_obtention'] ?? 0);
$num_ordre      = sanitizeInput(trim($_POST['num_ordre'] ?? ''));

// ═══════════════════════════════════════════════════════════════════
// ✅ VALIDATION
// ═══════════════════════════════════════════════════════════════════

if (empty($nom) || empty($prenom) || empty($email) || empty($num_ordre) || empty($ecole_archi) || empty($diplome) || empty($date_naissance)) {
    echo json_encode(["success" => false, "message" => "Required fields are missing. Please fill in all mandatory fields."]);
    exit;
}

if (!validateEmail($email)) {
    echo json_encode(["success" => false, "message" => "Invalid email format. Please provide a valid email address."]);
    exit;
}

if (!isset($_FILES['cin_recto']) || !isset($_FILES['cin_verso'])) {
    echo json_encode(["success" => false, "message" => "National ID files (Front and Back) are required."]);
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
        throw new Exception("Invalid file format ($ext). Please use PDF, JPG, PNG, or WEBP.");
    }
    if ($file['size'] > MAX_CIN_SIZE) {
        throw new Exception("File size exceeds maximum limit of 5MB.");
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Error occurred during file upload. Please try again.");
    }

    $filename = $prefix . '_' . uniqid() . '_' . time() . '.' . $ext;
    $dest = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Failed to save file to server. Please try again.");
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
        echo json_encode(["success" => false, "message" => "This CNOA number or email address is already registered. Each participant can only register once."]);
        exit;
    }

    // Start transaction
    $pdo->beginTransaction();

    // Upload files
    $path_recto = uploadCINFile($_FILES['cin_recto'], 'RECTO', $upload_dir);
    $path_verso = uploadCINFile($_FILES['cin_verso'], 'VERSO', $upload_dir);

    // Insert into database
    $sql = "INSERT INTO candidats 
            (nom, prenom, date_naissance, cin_recto, cin_verso, adresse, email, phone_code, phone_number, ecole_archi, diplome, annee_obtention, num_ordre, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $nom, $prenom, $date_naissance, $path_recto, $path_verso, 
        $adresse, $email, $phone_code, $phone_number, 
        $ecole_archi, $diplome, $annee_obtention, $num_ordre
    ]);

    $candidat_id = $pdo->lastInsertId();
    $pdo->commit();
    
    error_log("NEW REGISTRATION: ID=$candidat_id | $prenom $nom | $email");

    // ═══════════════════════════════════════════════════════════════════
    // 📧 SEND EMAILS (Non-blocking)
    // ═══════════════════════════════════════════════════════════════════
    
    // Email to Candidate
    $candidateSubject = "Registration Received - Prix Fondation Jardin Majorelle 2026";
    $candidateBody = "
    <!DOCTYPE html>
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff;'>
            <div style='background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center;'>
                <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" style=\"margin-bottom: 16px;\">
                    <path d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                </svg>
                <h1 style='margin: 0; font-size: 24px; font-weight: 600;'>Registration Confirmed</h1>
                <p style='margin: 12px 0 0 0; opacity: 0.9; font-size: 14px;'>Prix Fondation Jardin Majorelle 2026</p>
            </div>
            <div style='padding: 40px 30px;'>
                <p style='margin: 0 0 20px 0; font-size: 15px;'>Dear <strong>$prenom $nom</strong>,</p>
                <p style='margin: 0 0 24px 0;'>We acknowledge receipt of your registration application.</p>
                
                <div style='background: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #1d4ed8;'>
                    <h3 style='margin: 0 0 16px 0; color: #1e3a8a; font-size: 16px; font-weight: 600; display: flex; align-items: center;'>
                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" style=\"margin-right: 8px;\">
                            <path d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                        </svg>
                        Your Application
                    </h3>
                    <table style='width: 100%; font-size: 14px;'>
                        <tr><td style='padding: 4px 0; color: #64748b;'>Application Number:</td><td style='padding: 4px 0;'><strong>#$candidat_id</strong></td></tr>
                        <tr><td style='padding: 4px 0; color: #64748b;'>CNOA Number:</td><td style='padding: 4px 0;'><strong>$num_ordre</strong></td></tr>
                        <tr><td style='padding: 4px 0; color: #64748b;'>Email:</td><td style='padding: 4px 0;'><strong>$email</strong></td></tr>
                    </table>
                </div>
                
                <div style='background: #fef3c7; padding: 24px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 24px 0;'>
                    <h3 style='margin: 0 0 16px 0; color: #92400e; font-size: 16px; font-weight: 600; display: flex; align-items: center;'>
                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" style=\"margin-right: 8px;\">
                            <path d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                        </svg>
                        Next Steps
                    </h3>
                    <ol style='margin: 0; padding-left: 20px; font-size: 14px; color: #78350f;'>
                        <li style='margin-bottom: 8px;'>Eligibility verification (48-72 hours)</li>
                        <li style='margin-bottom: 8px;'>Email with unique link to submit your project</li>
                        <li>Access to submission form</li>
                    </ol>
                </div>
                
                <p style='margin: 32px 0 0 0; font-size: 14px; color: #64748b;'>Please monitor your inbox (including spam folder).</p>
                <p style='margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 14px;'>Best regards,<br><strong style='color: #1e293b;'>Prix Fondation Jardin Majorelle Team</strong></p>
            </div>
            <div style='background: #0f172a; color: #94a3b8; padding: 24px 30px; text-align: center; font-size: 12px;'>
                <p style='margin: 0 0 8px 0;'><strong style='color: #e2e8f0;'>Fondation Jardin Majorelle</strong></p>
                <p style='margin: 0;'>contact@fondationjardinmajorelleprize.com</p>
                <p style='margin: 8px 0 0 0;'>www.fondationjardinmajorelleprize.com</p>
            </div>
        </div>
    </body></html>";
    
    sendEmail($email, $candidateSubject, $candidateBody);

    // Email to Jury
    $validation_link = API_URL . "/admin_review.php?id=" . $candidat_id;
    
    $jurySubject = "[JURY] New Application #$candidat_id - $prenom $nom";
    $juryBody = "
    <!DOCTYPE html>
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff;'>
            <div style='background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 32px 30px; text-align: center;'>
                <svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" style=\"margin-bottom: 12px;\">
                    <path d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>
                </svg>
                <h1 style='margin: 0; font-size: 22px; font-weight: 600;'>New Application Received</h1>
            </div>
            <div style='padding: 32px 30px; background: white;'>
                <h2 style='color: #1e3a8a; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;'>$prenom $nom</h2>
                <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                    <tr style='border-bottom: 1px solid #e2e8f0;'><td style='padding: 12px 0; color: #64748b;'>Application ID:</td><td style='padding: 12px 0;'><strong>#$candidat_id</strong></td></tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'><td style='padding: 12px 0; color: #64748b;'>Email:</td><td style='padding: 12px 0;'><strong>$email</strong></td></tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'><td style='padding: 12px 0; color: #64748b;'>School:</td><td style='padding: 12px 0;'><strong>$ecole_archi</strong></td></tr>
                    <tr style='border-bottom: 1px solid #e2e8f0;'><td style='padding: 12px 0; color: #64748b;'>Degree:</td><td style='padding: 12px 0;'><strong>$diplome ($annee_obtention)</strong></td></tr>
                    <tr><td style='padding: 12px 0; color: #64748b;'>CNOA:</td><td style='padding: 12px 0;'><strong>$num_ordre</strong></td></tr>
                </table>
                
                <div style='text-align: center; margin: 32px 0;'>
                    <a href='$validation_link' style='background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);'>
                        REVIEW APPLICATION
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