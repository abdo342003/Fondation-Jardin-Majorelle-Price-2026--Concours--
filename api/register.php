<?php
// api/register.php - VERSION PRODUCTION FINALE
// Domaine : fondationjardinmajorelleprize.com

// 1. --- SECURITY HEADERS ---
header("Access-Control-Allow-Origin: https://fondationjardinmajorelleprize.com"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Désactiver l'affichage des erreurs pour la sécurité en Prod
ini_set('display_errors', 0);
error_reporting(0);

// Gestion du Preflight Request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db_connect.php';

// 2. --- CONFIGURATION ---

// ✅ Production Domain and URLs
$domaine = "https://fondationjardinmajorelleprize.com"; 
$base_url = $domaine . "/api"; 

// ✅ Emails
$jury_email = "abdoraoui9@gmail.com"; // Email qui reçoit les notifs
$from_email = "no-reply@fondationjardinmajorelleprize.com"; // ⚠️ Doit exister sur Hostinger !

// 3. --- VERIFICATION METHODE ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
    exit;
}

// 4. --- RECUPERATION & NETTOYAGE DES DONNÉES ---
$nom            = htmlspecialchars(trim($_POST['nom'] ?? ''));
$prenom         = htmlspecialchars(trim($_POST['prenom'] ?? ''));
$email          = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$date_naissance = $_POST['date_naissance'] ?? '';
$adresse        = htmlspecialchars(trim($_POST['adresse'] ?? ''));
$phone_code     = $_POST['phone_code'] ?? '+212';
$phone_number   = htmlspecialchars(trim($_POST['phone_number'] ?? ''));
$ecole_archi    = htmlspecialchars(trim($_POST['ecole_archi'] ?? ''));
$annee_obtention= intval($_POST['annee_obtention'] ?? 0);
$num_ordre      = htmlspecialchars(trim($_POST['num_ordre'] ?? '')); // CNOA

// 5. --- VALIDATION DES CHAMPS ---
if (empty($nom) || empty($prenom) || empty($email) || empty($num_ordre) || empty($ecole_archi) || empty($date_naissance)) {
    echo json_encode(["success" => false, "message" => "Champs obligatoires manquants."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Format d'email invalide."]);
    exit;
}

// Validation Fichiers (CIN)
if (!isset($_FILES['cin_recto']) || !isset($_FILES['cin_verso'])) {
    echo json_encode(["success" => false, "message" => "Les fichiers CIN (Recto et Verso) sont obligatoires."]);
    exit;
}

// 6. --- FONCTION D'UPLOAD SÉCURISÉE ---
// Le dossier de stockage (hors api, dans uploads/cin)
$upload_dir = '../uploads/cin/'; 

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true); 
}

function uploadFile($file, $prefix, $dir) {
    $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Vérifications
    if (!in_array($ext, $allowed)) {
        throw new Exception("Format de fichier invalide ($ext). Utilisez PDF, JPG ou PNG.");
    }
    if ($file['size'] > 5 * 1024 * 1024) { // 5 Mo Max
        throw new Exception("Le fichier est trop volumineux (> 5Mo).");
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Erreur lors du transfert du fichier.");
    }

    // Renommage sécurisé (Ex: RECTO_65a4b3c2d1.pdf)
    $filename = $prefix . '_' . uniqid() . '.' . $ext;
    $dest = $dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception("Erreur lors de l'enregistrement sur le serveur.");
    }
    return $dest; // On retourne le chemin relatif
}

// 7. --- TRAITEMENT PRINCIPAL (BDD & EMAILS) ---
try {
    // ✅ SECURITY CHECK: Prevent duplicate registrations
    $check_sql = "SELECT id FROM candidats WHERE email = ? OR num_ordre = ? LIMIT 1";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([$email, $num_ordre]);
    
    if ($check_stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Erreur: Ce numéro CNOA ou cet email est déjà utilisé."]);
        exit;
    }

    // Démarrer la transaction (Tout ou rien)
    $pdo->beginTransaction();

    // A. Upload des fichiers
    $path_recto = uploadFile($_FILES['cin_recto'], 'RECTO', $upload_dir);
    $path_verso = uploadFile($_FILES['cin_verso'], 'VERSO', $upload_dir);

    // B. Insertion dans la base de données
    $sql = "INSERT INTO candidats 
            (nom, prenom, date_naissance, cin_recto, cin_verso, adresse, email, phone_code, phone_number, ecole_archi, annee_obtention, num_ordre, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $nom, 
        $prenom, 
        $date_naissance, 
        $path_recto, 
        $path_verso, 
        $adresse, 
        $email, 
        $phone_code, 
        $phone_number, 
        $ecole_archi, 
        $annee_obtention, 
        $num_ordre
    ]);

    // Récupérer l'ID du candidat créé
    $candidat_id = $pdo->lastInsertId();

    // Valider la transaction SQL
    $pdo->commit();

    // 8. --- ENVOI DES EMAILS ---
    
    $headers = "From: " . $from_email . "\r\n";
    $headers .= "Reply-To: " . $from_email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // A. Email au Candidat (Confirmation)
    $subject_candidat = "Confirmation de pré-inscription - Prix Fondation Jardin Majorelle 2026";
    $message_candidat = "Bonjour $prenom $nom,\n\n" .
                        "Nous accusons réception de votre demande d'inscription au concours.\n" .
                        "Votre numéro de dossier est le #$candidat_id.\n\n" .
                        "Votre profil (Architecte CNOA n°$num_ordre) est en cours de vérification par notre comité technique.\n" .
                        "Vous recevrez une notification dès que votre éligibilité sera validée.\n\n" .
                        "Cordialement,\nLa Fondation Jardin Majorelle.";
    
    @mail($email, $subject_candidat, $message_candidat, $headers);

    // B. Email au JURY (Notification avec lien de validation)
    $validation_link = $base_url . "/admin_review.php?id=" . $candidat_id;
    
    $subject_jury = "[JURY] Nouvelle Candidature : $prenom $nom";
    $message_jury = "Un nouveau candidat vient de s'inscrire.\n\n" .
                    "--- Détails ---\n" .
                    "Nom : $nom $prenom\n" .
                    "École : $ecole_archi ($annee_obtention)\n" .
                    "CNOA : $num_ordre\n\n" .
                    "--- Action Requise ---\n" .
                    "Veuillez cliquer sur ce lien pour vérifier la CIN et valider l'éligibilité :\n" .
                    $validation_link;

    @mail($jury_email, $subject_jury, $message_jury, $headers);

    // 9. --- RÉPONSE FINAL AU FRONTEND ---
    echo json_encode([
        "success" => true, 
        "message" => "Inscription réussie. Vérifiez vos emails."
    ]);

} catch (Exception $e) {
    // En cas d'erreur, on annule tout ce qui a été fait dans la BDD
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // ✅ PRODUCTION: Log error to file for debugging (hidden from user)
    error_log("Registration Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    // On renvoie une erreur 500
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erreur lors du traitement de votre demande. Veuillez réessayer plus tard."
    ]);
}
?>