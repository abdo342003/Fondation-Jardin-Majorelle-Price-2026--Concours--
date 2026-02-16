<?php
// api/register.php - PRODUCTION v3.0
// Prix Fondation Jardin Majorelle 2026 - Step 1 Registration
// ═══════════════════════════════════════════════════════════════════

require_once __DIR__ . '/db_connect.php';

// Set security headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
setSecurityHeaders($origin);

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse("Méthode non autorisée", 405);
}



// ═══════════════════════════════════════════════════════════════════
// 📥 INPUT VALIDATION & SANITIZATION
// ═══════════════════════════════════════════════════════════════════

$nom            = sanitizeInput($_POST['nom'] ?? '');
$prenom         = sanitizeInput($_POST['prenom'] ?? '');
$email          = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$date_naissance = trim($_POST['date_naissance'] ?? '');
$adresse        = sanitizeInput($_POST['adresse'] ?? '');
$phone_code     = sanitizeInput($_POST['phone_code'] ?? '+212');
$phone_number   = sanitizeInput($_POST['phone_number'] ?? '');
$ecole_archi    = sanitizeInput($_POST['ecole_archi'] ?? '');
$diplome        = sanitizeInput($_POST['diplome'] ?? '');
$annee_obtention= intval($_POST['annee_obtention'] ?? 0);
$num_ordre      = sanitizeInput($_POST['num_ordre'] ?? '');
$language       = sanitizeInput($_POST['language'] ?? 'fr');

// Validate language
if (!in_array($language, ['fr', 'en'])) {
    $language = 'fr';
}

// Validation errors array
$errors = [];

if (empty($nom)) $errors[] = "Le nom est obligatoire.";
if (empty($prenom)) $errors[] = "Le prénom est obligatoire.";
if (empty($email)) $errors[] = "L'email est obligatoire.";
if (empty($num_ordre)) $errors[] = "Le numéro CNOA est obligatoire.";
if (empty($ecole_archi)) $errors[] = "L'école d'architecture est obligatoire.";
if (empty($diplome)) $errors[] = "Le diplôme est obligatoire.";
if (empty($date_naissance)) $errors[] = "La date de naissance est obligatoire.";

if (!validateEmail($email)) {
    $errors[] = "Format d'email invalide.";
}

if (!validateDate($date_naissance)) {
    $errors[] = "Format de date invalide.";
}

if ($annee_obtention < 1950 || $annee_obtention > date('Y')) {
    $errors[] = "Année d'obtention invalide.";
}

if (!empty($errors)) {
    errorResponse("Validation échouée", 400, $errors);
}

// ═══════════════════════════════════════════════════════════════════
// 📁 FILE UPLOAD VALIDATION
// ═══════════════════════════════════════════════════════════════════

if (!isset($_FILES['cin_recto']) || !isset($_FILES['cin_verso'])) {
    errorResponse("Les fichiers CIN (recto et verso) sont obligatoires.", 400);
}
// ═══════════════════════════════════════════════════════════════════
// 💾 DATABASE OPERATIONS WITH TRANSACTION
// ═══════════════════════════════════════════════════════════════════

try {
    // Check for duplicate registrations
    $stmt = $pdo->prepare("SELECT id, email, num_ordre FROM candidats WHERE email = ? OR num_ordre = ? LIMIT 1");
    $stmt->execute([$email, $num_ordre]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        logSecurityEvent("Duplicate registration attempt", [
            'email' => $email,
            'num_ordre' => $num_ordre,
            'ip' => getClientIP()
        ]);
        errorResponse(
            "Ce numéro CNOA ou cette adresse email est déjà enregistré. Chaque participant ne peut s'inscrire qu'une seule fois.",
            409
        );
    }

    // Start transaction
    $pdo->beginTransaction();

    // Upload CIN files
    $path_recto_full = uploadFileSafely(
        $_FILES['cin_recto'], 
        'RECTO', 
        UPLOAD_DIR_CIN,
        ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
        MAX_CIN_SIZE
    );
    
    $path_verso_full = uploadFileSafely(
        $_FILES['cin_verso'], 
        'VERSO', 
        UPLOAD_DIR_CIN,
        ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
        MAX_CIN_SIZE
    );
    
    // Store relative paths in database
    $path_recto = 'uploads/cin/' . basename($path_recto_full);
    $path_verso = 'uploads/cin/' . basename($path_verso_full);

    // Insert into database
    $sql = "INSERT INTO candidats 
            (nom, prenom, date_naissance, cin_recto, cin_verso, adresse, email, 
             phone_code, phone_number, ecole_archi, diplome, annee_obtention, 
             num_ordre, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $nom, $prenom, $date_naissance, $path_recto, $path_verso, 
        $adresse, $email, $phone_code, $phone_number, 
        $ecole_archi, $diplome, $annee_obtention, $num_ordre
    ]);

    $candidat_id = $pdo->lastInsertId();
    $pdo->commit();
    
    logMessage("NEW REGISTRATION SUCCESS", 'INFO', [
        'id' => $candidat_id,
        'name' => "$prenom $nom",
        'email' => $email,
        'language' => $language
    ]);

    // ═══════════════════════════════════════════════════════════════════
    // 📧 SEND CONFIRMATION EMAILS (Non-blocking)
    // ═══════════════════════════════════════════════════════════════════
    
    require_once __DIR__ . '/email_templates.php';
    
    $emailData = [
        'candidat_id' => $candidat_id,
        'prenom' => $prenom,
        'nom' => $nom,
        'email' => $email,
        'num_ordre' => $num_ordre,
        'ecole_archi' => $ecole_archi,
        'diplome' => $diplome,
        'annee_obtention' => $annee_obtention,
        'validation_link' => API_URL . "/admin_login.php?id=" . $candidat_id
    ];
    
    $emailTemplates = getRegistrationEmailTemplates($language, $emailData);
    
    // Send to candidate (not high priority — no BCC to admin)
    sendEmail($email, $emailTemplates['candidateSubject'], $emailTemplates['candidateBody'], false);
    
    // Send to jury (high priority)
    sendEmail(ADMIN_EMAIL, $emailTemplates['jurySubject'], $emailTemplates['juryBody'], true);

    // Success response
    successResponse(
        "Inscription réussie ! Vérifiez vos emails pour les prochaines étapes.",
        ['candidat_id' => $candidat_id]
    );

} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    logMessage("REGISTRATION ERROR: " . $e->getMessage(), 'ERROR', [
        'email' => $email,
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    errorResponse(
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        500
    );
}
