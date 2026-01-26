<?php
// api/admin_review.php - ENHANCED VERSION 2.2 - Fault-Tolerant Email System
// ✅ PRODUCTION: Error logging to file
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');

require 'db_connect.php';

$message = "";
$messageType = "";

// ✅ CONFIGURATION
$domaine = "https://fondationjardinmajorelleprize.com";
$adminEmail = "abdoraoui9@gmail.com"; // BCC for admin tracking

// ✅ ENHANCED EMAIL FUNCTION with fault tolerance
function sendEmailSafely($to, $subject, $htmlMessage, $adminBCC = null) {
    try {
        error_log("Email: Attempting to send to $to - Subject: $subject");
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
        $headers .= "Reply-To: contact@fondationjardinmajorelleprize.com\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3\r\n";
        
        // ✅ BCC admin for tracking
        if ($adminBCC) {
            $headers .= "Bcc: $adminBCC\r\n";
        }
        
        set_time_limit(10); // Timeout protection
        $result = @mail($to, $subject, $htmlMessage, $headers);
        set_time_limit(300);
        
        if ($result) {
            error_log("Email: Successfully sent to $to");
            return true;
        } else {
            error_log("Email: WARNING - mail() returned false for $to");
            return false;
        }
    } catch (Throwable $e) {
        error_log("Email: EXCEPTION - " . $e->getMessage());
        return false;
    }
}

// TRAITEMENT DES ACTIONS (VALIDER / REFUSER) VIA GET PARAMETERS
if (isset($_GET['action']) && isset($_GET['id'])) {
    $candidat_id = intval($_GET['id']);
    $action = $_GET['action'];

    try {
        if ($action === 'valider') {
            // 1. Générer un token unique sécurisé pour l'étape 2
            $token = bin2hex(random_bytes(32));
            
            // 2. Mettre à jour la base de données
            $stmt = $pdo->prepare("UPDATE candidats SET status = 'approved', token_step2 = ? WHERE id = ?");
            $stmt->execute([$token, $candidat_id]);

            // 3. Récupérer les informations du candidat
            $stmt = $pdo->prepare("SELECT nom, prenom, email FROM candidats WHERE id = ?");
            $stmt->execute([$candidat_id]);
            $candidat = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($candidat) {
                // 4. Préparer le lien unique pour l'étape 2
                $link_step2 = $domaine . "/?token=" . $token;
                
                // 5. Préparer l'email HTML d'acceptation
                $subject = "Félicitations ! Vous êtes sélectionné(e) - Prix Fondation Jardin Majorelle 2026";
                
                $htmlMessage = "
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                        .header { background: #0055B8; color: white; padding: 20px; text-align: center; }
                        .content { background: white; padding: 30px; margin-top: 20px; }
                        .button { display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🎉 Félicitations !</h1>
                        </div>
                        <div class='content'>
                            <p>Bonjour <strong>" . htmlspecialchars($candidat['prenom']) . " " . htmlspecialchars($candidat['nom']) . "</strong>,</p>
                            
                            <p>Nous avons le plaisir de vous informer que votre candidature a été <strong>retenue</strong> par notre jury pour participer à la phase finale du <strong>Prix Fondation Jardin Majorelle 2026</strong>.</p>
                            
                            <p>Vous êtes maintenant invité(e) à déposer votre projet architectural via votre lien personnel sécurisé :</p>
                            
                            <div style='text-align: center;'>
                                <a href='" . $link_step2 . "' class='button'>📁 ACCÉDER AU FORMULAIRE DE DÉPÔT</a>
                            </div>
                            
                            <p><strong>Important :</strong> Ce lien est unique et personnel. Ne le partagez avec personne.</p>
                            
                            <p>Nous vous souhaitons plein succès dans cette nouvelle étape !</p>
                            
                            <p>Cordialement,<br><strong>L'équipe du Prix Fondation Jardin Majorelle</strong></p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Fondation Jardin Majorelle - Tous droits réservés</p>
                        </div>
                    </div>
                </body>
                </html>
                ";

                // 6. Envoi de l'email avec BCC admin
                $emailSent = sendEmailSafely($candidat['email'], $subject, $htmlMessage, $adminEmail);
                
                if ($emailSent) {
                    $message = "✅ Candidat VALIDÉ avec succès ! Email d'invitation envoyé à " . htmlspecialchars($candidat['email']) . " (copie admin envoyée)";
                    $messageType = "success";
                    error_log("Validation: Candidate #{$candidat_id} approved and notified");
                } else {
                    $message = "⚠️ Candidat validé mais l'email n'a pas pu être envoyé. Token généré : " . substr($token, 0, 20) . "...";
                    $messageType = "warning";
                    error_log("Validation: Candidate #{$candidat_id} approved but EMAIL FAILED. Token: $token");
                }
            } else {
                $message = "❌ Erreur : Candidat introuvable.";
                $messageType = "error";
            }

        } elseif ($action === 'refuser') {
            // 1. Mettre à jour le statut à 'rejected'
            $stmt = $pdo->prepare("UPDATE candidats SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$candidat_id]);

            // 2. Récupérer les informations du candidat pour l'email
            $stmt = $pdo->prepare("SELECT nom, prenom, email FROM candidats WHERE id = ?");
            $stmt->execute([$candidat_id]);
            $candidat = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($candidat) {
                // 3. Préparer l'email HTML de refus poli
                $subject = "Suite de votre candidature - Prix Fondation Jardin Majorelle 2026";
                
                $htmlMessage = "
                <!DOCTYPE html>
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
                            <h1>Prix Fondation Jardin Majorelle</h1>
                        </div>
                        <div class='content'>
                            <p>Bonjour <strong>" . htmlspecialchars($candidat['prenom']) . " " . htmlspecialchars($candidat['nom']) . "</strong>,</p>
                            
                            <p>Nous vous remercions sincèrement pour l'intérêt que vous portez au <strong>Prix Fondation Jardin Majorelle 2026</strong> et pour le temps consacré à votre candidature.</p>
                            
                            <p>Après une étude attentive de votre dossier, nous avons le regret de vous informer que nous ne pouvons pas donner une suite favorable à votre candidature cette année.</p>
                            
                            <p>Cette décision ne reflète en aucun cas un jugement sur vos compétences professionnelles. Le nombre élevé de candidatures reçues nous contraint à des choix difficiles.</p>
                            
                            <p>Nous vous encourageons vivement à postuler de nouveau lors des prochaines éditions et vous souhaitons beaucoup de succès dans vos projets futurs.</p>
                            
                            <p>Avec nos salutations distinguées,<br><strong>L'équipe du Prix Fondation Jardin Majorelle</strong></p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Fondation Jardin Majorelle - Tous droits réservés</p>
                        </div>
                    </div>
                </body>
                </html>
                ";

                // 4. Envoi de l'email avec BCC admin
                $emailSent = sendEmailSafely($candidat['email'], $subject, $htmlMessage, $adminEmail);
                
                if ($emailSent) {
                    $message = "❌ Candidat REFUSÉ. Email de notification envoyé (copie admin envoyée).";
                    $messageType = "error";
                    error_log("Rejection: Candidate #{$candidat_id} rejected and notified");
                } else {
                    $message = "❌ Candidat refusé mais l'email n'a pas pu être envoyé.";
                    $messageType = "error";
                    error_log("Rejection: Candidate #{$candidat_id} rejected but EMAIL FAILED");
                }
            }
        }
    } catch (Exception $e) {
        $message = "⚠️ Erreur serveur : " . htmlspecialchars($e->getMessage());
        $messageType = "error";
    }
}

// RECUPERATION DES INFOS CANDIDAT POUR AFFICHAGE
$candidat = null;
$id = $_GET['id'] ?? null;

if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
    $stmt->execute([intval($id)]);
    $candidat = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jury Review | Candidat #<?php echo htmlspecialchars($id ?? ''); ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-light: #3b82f6;
            --accent: #f59e0b;
            --success: #10b981;
            --danger: #ef4444;
            --text-dark: #1f2937;
            --text-muted: #6b7280;
            --bg-glass: rgba(255, 255, 255, 0.92);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: url('../Background.png') no-repeat center center fixed;
            background-size: cover;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px 20px;
            color: var(--text-dark);
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%);
            z-index: 0;
        }

        .container {
            width: 100%;
            max-width: 1000px;
            position: relative;
            z-index: 1;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card { 
            background: var(--bg-glass);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border-radius: 20px; 
            box-shadow: 0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255, 255, 255, 0.5);
            overflow: hidden;
        }

        .card-header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            color: white;
            padding: 35px 30px;
            text-align: center;
            position: relative;
            border-bottom: 3px solid var(--accent);
        }

        .card-header h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .card-header p {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
        }

        .card-id {
            display: inline-block;
            background: rgba(245, 158, 11, 0.3);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 12px;
        }

        .card-body {
            padding: 40px;
        }

        /* ✅ STRICT SVG SIZE CONSTRAINTS - Prevent Giant Icons */
        svg {
            max-width: 24px;
            max-height: 24px;
            width: auto;
            height: auto;
            display: inline-block;
            vertical-align: middle;
            flex-shrink: 0;
        }

        .icon {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px;
            min-height: 20px;
            max-width: 20px;
            max-height: 20px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
            flex-shrink: 0;
        }

        .icon-lg {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px;
            min-height: 24px;
            max-width: 24px;
            max-height: 24px;
        }

        /* Grid Layout for Info */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .info-item {
            background: #f8f9fc;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid var(--majorelle-blue);
        }

        .label { 
            font-size: 12px; 
            color: #666; 
            text-transform: uppercase; 
        }

            letter-spacing: 1px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .value {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-dark);
            word-break: break-word;
        }

        /* Document Links */
        .doc-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border: 2px solid #fbbf24;
        }

        .doc-title {
            font-size: 14px;
            font-weight: 700;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .doc-links {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        a.file-btn { 
            text-decoration: none;
            background: white;
            border: 2px solid #e5e7eb;
            color: var(--text-dark);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        a.file-btn:hover {
            border-color: var(--accent);
            transform: translateX(4px);
            box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
        }

        /* Status Badge */
        .status-container {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            border: 2px solid #38bdf8;
        }

        .status-label {
            font-size: 12px;
            font-weight: 700;
            color: #0369a1;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }

        .status-badge {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 14px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .status-pending { 
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #92400e;
        }
        .status-approved { 
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
        }
        .status-rejected { 
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #991b1b;
        }

        /* Actions */
        .actions-section {
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            margin-top: 25px;
        }

        .actions-container {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 15px;
        }

        .btn {
            padding: 16px 28px;
            border: none;
            cursor: pointer;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-accept { 
            background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
            color: white;
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
        }

        .btn-accept:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(16, 185, 129, 0.45);
        }

        .btn-reject { 
            background: transparent;
            color: var(--danger);
            border: 3px solid var(--danger);
        }
        
        .btn-reject:hover {
            background: var(--danger);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        /* Alerts */
        .msg { 
            background: var(--bg-glass);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 18px 25px;
            margin-bottom: 25px;
            border-radius: 12px;
            border-left: 5px solid;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            font-weight: 600;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .success { 
            border-color: var(--success);
            color: #065f46;
            background: rgba(209, 250, 229, 0.95);
        }
        .error { 
            border-color: var(--danger);
            color: #991b1b;
            background: rgba(254, 226, 226, 0.95);
        }
        .warning {
            border-color: var(--accent);
            color: #92400e;
            background: rgba(254, 243, 199, 0.95);
        }

        /* Token Link Style */
        .token-box {
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed var(--primary-light);
            padding: 18px;
            border-radius: 10px;
            margin-top: 18px;
        }

        .token-label {
            font-size: 12px;
            color: var(--primary);
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .token-link { 
            color: var(--primary-light);
            font-weight: 700;
            word-break: break-all;
            text-decoration: none;
        }

        .token-link:hover {
            text-decoration: underline;
        }

        .empty-state {
            text-align: center;
            padding: 60px 30px;
        }

        .empty-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-muted);
            margin: 15px 0;
        }

        .closed-message {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border-radius: 10px;
            color: var(--text-muted);
            font-size: 15px;
            font-weight: 500;
            font-style: italic;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            body { padding: 15px 10px; }
            .card-body { padding: 25px 20px; }
            .actions-container { grid-template-columns: 1fr; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<div class="container">
    <?php if ($message): ?>
        <div class="msg <?php echo $messageType === 'error' ? 'error' : ($messageType === 'warning' ? 'warning' : 'success'); ?>">
            <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <?php if ($messageType === 'success'): ?>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <?php elseif ($messageType === 'error'): ?>
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <?php else: ?>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <?php endif; ?>
            </svg>
            <span><?php echo $message; ?></span>
        </div>
    <?php endif; ?>

    <?php if ($candidat): ?>
        <div class="card">
            <div class="card-header">
                <h1>
                    <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 28px;">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Espace Jury
                </h1>
                <p>Prix Fondation Jardin Majorelle 2026 • Concours National d'Architecture</p>
                <span class="card-id">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Dossier #<?php echo $candidat['id']; ?>
                </span>
            </div>

            <div class="card-body">
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Candidat
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']); ?></div>
                    </div>
                    
                    <div class="info-item">
                        <div class="label">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            École d'Architecture
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['ecole_archi']); ?> (<?php echo htmlspecialchars($candidat['annee_obtention']); ?>)</div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Numéro CNOA
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['num_ordre']); ?></div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Email
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['email']); ?></div>
                    </div>
                </div>

                <?php if ($candidat['cin_recto'] || $candidat['cin_verso']): ?>
                <div class="doc-section">
                    <div class="doc-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Pièces d'Identité (CIN)
                    </div>
                    <div class="doc-links">
                        <?php if ($candidat['cin_recto']): ?>
                            <a href="<?php echo htmlspecialchars($candidat['cin_recto']); ?>" target="_blank" class="file-btn">
                                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" fill="#dc2626"/>
                                    <path d="M9 13h6M9 17h6M13 3v6h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                CIN Recto
                            </a>
                        <?php endif; ?>
                        <?php if ($candidat['cin_verso']): ?>
                            <a href="<?php echo htmlspecialchars($candidat['cin_verso']); ?>" target="_blank" class="file-btn">
                                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" fill="#dc2626"/>
                                    <path d="M9 13h6M9 17h6M13 3v6h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                CIN Verso
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endif; ?>

                <div class="status-container">
                    <div class="status-label">Statut de la Candidature</div>
                    <span class="status-badge status-<?php echo strtolower($candidat['status']); ?>">
                        <?php 
                        $statusIcons = [
                            'pending' => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                            'approved' => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                            'rejected' => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                        ];
                        $statusLabels = [
                            'pending' => 'En Attente',
                            'approved' => 'Approuvé',
                            'rejected' => 'Refusé'
                        ];
                        echo $statusIcons[$candidat['status']] ?? '';
                        echo '<span>' . ($statusLabels[$candidat['status']] ?? strtoupper($candidat['status'])) . '</span>';
                        ?>
                    </span>

                    <?php if ($candidat['status'] === 'approved' && $candidat['token_step2']): ?>
                        <div class="token-box">
                            <div class="token-label">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Lien d'upload généré
                            </div>
                            <a href="<?php echo $domaine; ?>/?token=<?php echo htmlspecialchars($candidat['token_step2']); ?>" target="_blank" class="token-link">
                                <?php echo $domaine; ?>/?token=<?php echo substr($candidat['token_step2'], 0, 15); ?>...
                            </a>
                        </div>
                    <?php endif; ?>
                </div>

                <?php if ($candidat['status'] === 'pending'): ?>
                    <div class="actions-section">
                        <div class="actions-container">
                            <a href="?action=valider&id=<?php echo $candidat['id']; ?>" 
                               class="btn btn-accept" 
                               onclick="return confirm('⚠️ VALIDATION DU CANDIDAT\n\n✅ Un email d\'invitation avec lien sécurisé sera envoyé automatiquement.\n\nConfirmer la validation ?')">
                               <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                   <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                               </svg>
                               Valider & Inviter
                            </a>
                            
                            <a href="?action=refuser&id=<?php echo $candidat['id']; ?>" 
                               class="btn btn-reject" 
                               onclick="return confirm('⚠️ REFUS DU CANDIDAT\n\n❌ Cette action est IRRÉVERSIBLE.\n❌ Un email de refus poli sera envoyé.\n\nConfirmer le refus ?')">
                               <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                   <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                               </svg>
                               Refuser
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="closed-message">
                        <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Ce dossier a été clôturé. Aucune action requise.
                    </div>
                <?php endif; ?>

            </div>
        </div>
    <?php else: ?>
        <div class="card">
            <div class="empty-state">
                <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 64px; height: 64px; margin: 0 auto 20px; color: var(--text-muted);">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h2 class="empty-title">Dossier Introuvable</h2>
                <p style="color: var(--text-muted);">L'identifiant demandé n'existe pas dans la base de données.</p>
            </div>
        </div>
    <?php endif; ?>
</div>

</body>
</html>