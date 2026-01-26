<?php
// api/admin_review.php - PRODUCTION VERSION FOR HOSTINGER
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'db_connect.php';

$message = "";
$messageType = "";

// ✅ PRODUCTION DOMAIN
$domaine = "https://fondationjardinmajorelleprize.com";

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

                // 6. Configuration des en-têtes email
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
                $headers .= "Reply-To: contact@fondationjardinmajorelleprize.com\r\n";
                
                // 7. Envoi de l'email
                $emailSent = mail($candidat['email'], $subject, $htmlMessage, $headers);
                
                if ($emailSent) {
                    $message = "✅ Candidat VALIDÉ avec succès ! Email d'invitation envoyé à " . htmlspecialchars($candidat['email']);
                    $messageType = "success";
                } else {
                    $message = "⚠️ Candidat validé mais l'email n'a pas pu être envoyé. Vérifiez la configuration mail du serveur.";
                    $messageType = "warning";
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

                // 4. Configuration des en-têtes email
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
                $headers .= "Reply-To: contact@fondationjardinmajorelleprize.com\r\n";
                
                // 5. Envoi de l'email
                $emailSent = mail($candidat['email'], $subject, $htmlMessage, $headers);
                
                if ($emailSent) {
                    $message = "❌ Candidat REFUSÉ. Email de notification envoyé.";
                    $messageType = "error";
                } else {
                    $message = "❌ Candidat refusé mais l'email n'a pas pu être envoyé.";
                    $messageType = "error";
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
    <title>Jury | Review Candidat #<?php echo htmlspecialchars($id ?? ''); ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --majorelle-blue: #1d4e89; /* Deep Architectural Blue */
            --majorelle-yellow: #f7b538; /* Accent */
            --success-green: #10b981;
            --danger-red: #ef4444;
            --glass-bg: rgba(255, 255, 255, 0.95);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Outfit', sans-serif; 
            /* ✅ BACKGROUND IMAGE INTEGRATION */
            background: url('../Background.png') no-repeat center center fixed;
            background-size: cover;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            color: #333;
        }

        /* Overlay to ensure text readability over the image */
        body::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.4); /* Dark overlay */
            z-index: -1;
        }

        .container {
            width: 100%;
            max-width: 900px;
            animation: fadeIn 0.6s ease-out;
        }

        .card { 
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 16px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.5);
        }

        .card-header {
            background: var(--majorelle-blue);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }

        .card-header h1 {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .card-header p {
            font-size: 14px;
            opacity: 0.8;
            font-weight: 300;
        }

        .card-body {
            padding: 40px;
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
            letter-spacing: 0.5px;
            font-weight: 600;
            display: block;
            margin-bottom: 5px;
        }

        .value {
            font-size: 16px;
            font-weight: 500;
            color: #222;
            word-break: break-word;
        }

        /* Document Links */
        .doc-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        a.file-btn { 
            text-decoration: none;
            background: white;
            border: 1px solid #ddd;
            color: #333;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        a.file-btn:hover {
            border-color: var(--majorelle-blue);
            color: var(--majorelle-blue);
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        /* Status Badge */
        .status-container {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }

        .status-badge {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .status-pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
        .status-accepted { background: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }
        .status-rejected { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }

        /* Actions */
        .actions-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
        }

        .btn {
            padding: 15px 30px;
            border: none;
            cursor: pointer;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px rgba(0,0,0,0.15);
        }

        .btn-accept { 
            background: var(--success-green); 
            color: white;
        }

        .btn-reject { 
            background: white; 
            color: var(--danger-red);
            border: 2px solid var(--danger-red);
        }
        
        .btn-reject:hover {
            background: var(--danger-red);
            color: white;
        }

        /* Alerts */
        .msg { 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 8px; 
            text-align: center;
            font-weight: 500;
        }
        .success { background: #d1fae5; color: #065f46; border-left: 5px solid #059669; }
        .error { background: #fee2e2; color: #991b1b; border-left: 5px solid #dc2626; }

        /* Token Link Style */
        .token-box {
            background: #f0f9ff;
            border: 1px dashed #0ea5e9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
        }
        .token-link { color: #0284c7; font-weight: bold; word-break: break-all; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .card-body { padding: 20px; }
            .actions-container { flex-direction: column; }
            .btn { width: 100%; justify-content: center; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<div class="container">
    <?php if ($message): ?>
        <div class="msg <?php echo $messageType === 'error' ? 'error' : 'success'; ?>">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <?php if ($candidat): ?>
        <div class="card">
            <div class="card-header">
                <h1>Espace Jury</h1>
                <p>Concours National Fondation Jardin Majorelle 2026</p>
                <div style="margin-top: 10px; font-size: 12px; opacity: 0.7;">Dossier ID #<?php echo $candidat['id']; ?></div>
            </div>

            <div class="card-body">
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Nom & Prénom</span>
                        <div class="value"><?php echo htmlspecialchars($candidat['nom'] . ' ' . $candidat['prenom']); ?></div>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">École d'Architecture</span>
                        <div class="value"><?php echo htmlspecialchars($candidat['ecole_archi']); ?> (<?php echo htmlspecialchars($candidat['annee_obtention']); ?>)</div>
                    </div>

                    <div class="info-item">
                        <span class="label">Numéro CNOA</span>
                        <div class="value"><?php echo htmlspecialchars($candidat['num_ordre']); ?></div>
                    </div>

                    <div class="info-item">
                        <span class="label">Contact</span>
                        <div class="value"><?php echo htmlspecialchars($candidat['email']); ?></div>
                    </div>
                </div>

                <div class="info-item" style="border-left-color: var(--majorelle-yellow);">
                    <span class="label" style="margin-bottom: 10px;">Pièces Justificatives (CIN)</span>
                    <div class="doc-links">
                        <?php if ($candidat['cin_recto']): ?>
                            <a href="<?php echo htmlspecialchars($candidat['cin_recto']); ?>" target="_blank" class="file-btn">
                                📄 Voir CIN Recto
                            </a>
                        <?php endif; ?>
                        <?php if ($candidat['cin_verso']): ?>
                            <a href="<?php echo htmlspecialchars($candidat['cin_verso']); ?>" target="_blank" class="file-btn">
                                📄 Voir CIN Verso
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="status-container">
                    <span class="label" style="margin-bottom: 10px;">Décision Actuelle</span>
                    <span class="status-badge status-<?php echo strtolower($candidat['status']); ?>">
                        <?php 
                        $statusLabels = [
                            'pending' => '⏳ En attente de validation',
                            'accepted' => '✅ Dossier Validé',
                            'rejected' => '❌ Dossier Refusé'
                        ];
                        echo $statusLabels[$candidat['status']] ?? $candidat['status'];
                        ?>
                    </span>

                    <?php if ($candidat['status'] === 'accepted' && $candidat['token_step2']): ?>
                        <div class="token-box">
                            <p style="font-size: 13px; color: #555;">Lien d'upload généré pour le candidat :</p>
                            <a href="<?php echo $domaine; ?>/?token=<?php echo htmlspecialchars($candidat['token_step2']); ?>" target="_blank" class="token-link">
                                <?php echo $domaine; ?>/?token=<?php echo substr($candidat['token_step2'], 0, 15); ?>...
                            </a>
                        </div>
                    <?php endif; ?>
                </div>

                <?php if ($candidat['status'] === 'pending'): ?>
                    <div class="actions-container">
                        <a href="?action=valider&id=<?php echo $candidat['id']; ?>" 
                           class="btn btn-accept" 
                           onclick="return confirm('Êtes-vous sûr de vouloir VALIDER ce candidat ?\n\nUn email contenant le lien de dépôt sera envoyé immédiatement.')">
                           <span>✅</span> Valider & Inviter
                        </a>
                        
                        <a href="?action=refuser&id=<?php echo $candidat['id']; ?>" 
                           class="btn btn-reject" 
                           onclick="return confirm('Êtes-vous sûr de vouloir REFUSER ce candidat ?\n\nCette action est irréversible.')">
                           <span>❌</span> Refuser le dossier
                        </a>
                    </div>
                <?php else: ?>
                    <div style="text-align:center; color: #999; margin-top: 20px; font-style: italic;">
                        Ce dossier a été clôturé. Aucune action requise.
                    </div>
                <?php endif; ?>

            </div>
        </div>
    <?php else: ?>
        <div class="card" style="text-align: center; padding: 50px;">
            <h1 style="color: #666;">Dossier Introuvable</h1>
            <p style="margin-top: 15px;">L'identifiant demandé n'existe pas dans la base de données.</p>
        </div>
    <?php endif; ?>
</div>

</body>
</html>