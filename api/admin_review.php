<?php
// api/admin_review.php - PRODUCTION v3.0
// Prix Fondation Jardin Majorelle 2026 - Jury Review Panel
// ═══════════════════════════════════════════════════════════════════

session_start();

require_once __DIR__ . '/db_connect.php';

// ═══════════════════════════════════════════════════════════════════
// 🔒 AUTHENTICATION CHECK - Jury must be logged in
// ═══════════════════════════════════════════════════════════════════

if (!isset($_SESSION['jury_logged_in']) || $_SESSION['jury_logged_in'] !== true) {
    // Preserve candidate ID in redirect if provided
    $redirect_url = 'admin_login.php';
    if (isset($_GET['id']) && intval($_GET['id']) > 0) {
        $redirect_url .= '?id=' . intval($_GET['id']);
    }
    header('Location: ' . $redirect_url);
    exit;
}

// Session timeout check
if (isset($_SESSION['jury_login_time']) && (time() - $_SESSION['jury_login_time']) > SESSION_LIFETIME) {
    session_destroy();
    logSecurityEvent('Session timeout', ['username' => $_SESSION['jury_username'] ?? 'jury']);
    header('Location: admin_login.php?timeout=1');
    exit;
}

// Update last activity time
$_SESSION['jury_login_time'] = time();

$message = "";
$messageType = "";

// ═══════════════════════════════════════════════════════════════════
// 🎯 PROCESS ACTIONS (VALIDATE / REJECT)
// ═══════════════════════════════════════════════════════════════════

if (isset($_GET['action']) && isset($_GET['id'])) {
    $candidat_id = intval($_GET['id']);
    $action = $_GET['action'];

    try {
        if ($action === 'valider') {
            // Generate secure token for Step 2
            $token = generateSecureToken(32);
            
            // Update database
            $stmt = $pdo->prepare("UPDATE candidats SET status = 'approved', token_step2 = ? WHERE id = ?");
            $stmt->execute([$token, $candidat_id]);

            // Get candidate info
            $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
            $stmt->execute([$candidat_id]);
            $candidat = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($candidat) {
                $link_step2 = SITE_URL . "/?token=" . $token;
                
                // Use new approval email template
                require_once __DIR__ . '/email_templates_approval.php';
                
                $emailData = [
                    'prenom' => $candidat['prenom'],
                    'nom' => $candidat['nom'],
                    'candidat_id' => $candidat_id,
                    'num_ordre' => $candidat['num_ordre'],
                    'email' => $candidat['email'],
                    'submission_link' => $link_step2
                ];
                
                $templates = getApprovalEmailTemplates($candidat['language'] ?? 'fr', $emailData);
                
                // Send approval email to candidate (no BCC to admin)
                $emailSent = sendEmail(
                    $candidat['email'],
                    $templates['candidateSubject'],
                    $templates['candidateBody'],
                    false
                );
                
                if ($emailSent) {
                    logMessage("Approval email sent", 'INFO', ['candidat_id' => $candidat_id, 'email' => $candidat['email']]);
                } else {
                    logMessage("Approval email failed", 'WARNING', ['candidat_id' => $candidat_id, 'email' => $candidat['email']]);
                }
                
                $message = "Candidat approuvé et email envoyé avec succès.";
                $messageType = "success";
                
                logMessage("Candidate approved", 'INFO', ['candidat_id' => $candidat_id, 'name' => $candidat['prenom'] . ' ' . $candidat['nom']]);
            } else {
                $message = "Erreur: Candidat introuvable.";
                $messageType = "error";
            }

        } elseif ($action === 'refuser') {
            // Update database
            $stmt = $pdo->prepare("UPDATE candidats SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$candidat_id]);

            // Get candidate info  
            $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
            $stmt->execute([$candidat_id]);
            $candidat = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($candidat) {
                // Use branded rejection email template
                require_once __DIR__ . '/email_templates_approval.php';
                
                $rejectionData = [
                    'prenom' => $candidat['prenom'],
                    'nom' => $candidat['nom']
                ];
                
                $rejectionTemplates = getRejectionEmailTemplates($rejectionData);
                sendEmail($candidat['email'], $rejectionTemplates['subject'], $rejectionTemplates['body'], false);
                $message = "Candidat refusé et email envoyé.";
                $messageType = "warning";
                
                logMessage("Candidate rejected", 'INFO', ['candidat_id' => $candidat_id, 'name' => $candidat['prenom'] . ' ' . $candidat['nom']]);
            } else {
                $message = "Erreur: Candidat introuvable.";
                $messageType = "error";
            }
        }
    } catch (Exception $e) {
        $message = "Erreur: " . $e->getMessage();
        $messageType = "error";
        logMessage("Admin review error: " . $e->getMessage(), 'ERROR', ['action' => $action, 'candidat_id' => $candidat_id]);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 📋 RETRIEVE CANDIDATE DATA
// ═══════════════════════════════════════════════════════════════════

// Helper: convert stored DB file path to a proper URL
function fileUrl($path) {
    if (empty($path)) return '#';
    // Already a full URL
    if (strpos($path, 'http') === 0) return $path;
    // Absolute filesystem path → extract relative 'uploads/...' part
    if ($path[0] === '/' || $path[0] === '\\') {
        if (preg_match('#(uploads/.+)$#', $path, $m)) {
            return SITE_URL . '/' . $m[1];
        }
        return SITE_URL . '/uploads/' . basename($path);
    }
    // Already relative (e.g. 'uploads/cin/xxx')
    return SITE_URL . '/' . $path;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$candidat = null;

if ($id > 0) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
        $stmt->execute([$id]);
        $candidat = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $message = "Erreur de base de données.";
        $messageType = "error";
        error_log("DB Error: " . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Examen Candidature #<?php echo htmlspecialchars($id ?? ''); ?> | Jury</title>
    <link href="https://fonts.googleapis.com/css2?family=Ivy+Presto+Display&family=Effra:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-teal: #7dafab;
            --primary-teal-dark: #5a8884;
            --primary-teal-light: #9ec4c1;
            --secondary-amber: #f8b200;
            --secondary-amber-light: #fac933;
            --surface-ivory: #f9d4ff;
            --warm-gray: #8b8680;
            --charcoal: #1a1a1a;
            --success: #7dafab;
            --success-bg: #e8f5f4;
            --danger: #9b2c2c;
            --danger-bg: #fef2f2;
            --warning: #f8b200;
            --warning-bg: #fff9e6;
            --info: #7dafab;
            --info-bg: #e8f5f4;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Effra', -apple-system, sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #7dafab 0%, #5a8884 100%);
            color: var(--charcoal);
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: 
                radial-gradient(ellipse at 20% 20%, rgba(248, 178, 0, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(125, 175, 171, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(249, 212, 255, 0.05) 0%, transparent 70%);
            z-index: 0;
        }

        body::after {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f8b200' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.6;
            z-index: 0;
        }

        .page-wrapper {
            position: relative;
            z-index: 1;
            min-height: 100vh;
            padding: 40px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        /* Back Link */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 24px;
            background: #7dafab;
            backdrop-filter: blur(10px);
            color: #e6c691;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 30px;
            transition: all 0.3s ease;
            border: 1px solid rgba(212, 165, 116, 0.2);
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .back-link:hover {
            background: rgba(212, 165, 116, 0.15);
            transform: translateX(-4px);
        }

        .back-link svg {
            width: 18px;
            height: 18px;
        }

        /* Alert Messages */
        .msg { 
            padding: 18px 24px;
            margin-bottom: 25px;
            border-radius: 4px;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 14px;
            border-left: 3px solid;
        }

        .msg svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
        }

        .success { 
            background: var(--success-bg);
            border-color: var(--success);
            color: var(--success);
        }
        .error { 
            background: var(--danger-bg);
            border-color: var(--danger);
            color: var(--danger);
        }
        .warning {
            background: var(--warning-bg);
            border-color: var(--gold-accent);
            color: var(--warning);
        }

        /* Card */
        .card { 
            background: #d4a574;
            border-radius: 4px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .card-header {
            background: #7dafab;
            color: white;
            padding: 40px 35px;
            text-align: center;
            position: relative;
        }

        .card-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, #d4a574, transparent);
        }

        .card-header h1 {
            font-family: 'Ivy Presto Display', Georgia, serif;
            font-size: 26px;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .card-header p {
            font-size: 13px;
            opacity: 0.8;
            letter-spacing: 1px;
        }

        .card-id {
            display: inline-block;
            background: rgba(212, 165, 116, 0.2);
            color: #e6c691;
            padding: 8px 20px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 16px;
            letter-spacing: 1px;
            border: 1px solid rgba(212, 165, 116, 0.3);
        }

        .card-body {
            padding: 45px;
            background: #d4a574;
        }

        /* SVG constraints */
        svg {
            max-width: 24px;
            max-height: 24px;
            flex-shrink: 0;
        }

        .icon {
            width: 18px;
            height: 18px;
        }

        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 35px;
        }

        .info-item {
            background: white;
            padding: 20px;
            border-radius: 4px;
            border: 1px solid #e8e6e3;
            border-left: 3px solid #1b4332;
        }

        .label { 
            font-size: 10px;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .label svg {
            width: 16px;
            height: 16px;
            color: #1b4332;
        }

        .value {
            font-size: 15px;
            font-weight: 600;
            color: var(--charcoal);
            word-break: break-word;
        }

        /* Document Section */
        .doc-section {
            background: white;
            padding: 24px;
            border-radius: 4px;
            margin: 30px 0;
            border: 1px solid #e8e6e3;
        }

        .doc-title {
            font-size: 11px;
            font-weight: 700;
            color: #1b4332;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e8e6e3;
        }

        .doc-title svg {
            width: 20px;
            height: 20px;
        }

        .doc-links {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        a.file-btn { 
            text-decoration: none;
            background: var(--ivory-dark);
            border: 1px solid #e0ddd8;
            color: var(--charcoal);
            padding: 14px 22px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        a.file-btn:hover {
            background: #1b4332;
            color: white;
            border-color: #1b4332;
        }

        a.file-btn svg {
            width: 18px;
            height: 18px;
        }

        /* Status Container */
        .status-container {
            background: white;
            padding: 30px;
            border-radius: 4px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #e8e6e3;
        }

        .status-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .status-badge svg {
            width: 18px;
            height: 18px;
        }

        .status-pending { 
            background: var(--warning-bg);
            color: var(--warning);
        }
        .status-approved { 
            background: var(--success-bg);
            color: var(--success);
        }
        .status-rejected { 
            background: var(--danger-bg);
            color: var(--danger);
        }
        .status-completed { 
            background: var(--info-bg);
            color: var(--info);
        }

        /* Project Section */
        .project-section {
            background: #7dafab;
            border: 2px solid var(--info);
            border-radius: 4px;
            margin: 30px 0;
            overflow: hidden;
        }

        .project-header {
            background: linear-gradient(135deg, #7dafab 0%, #2d6a4f 100%);
            padding: 24px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .project-title {
            font-size: 14px;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .project-title svg {
            width: 24px;
            height: 24px;
        }

        .project-date {
            font-size: 12px;
            color: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .project-date svg {
            width: 16px;
            height: 16px;
        }

        .project-body {
            padding: 28px;
        }

        .project-files {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .project-file-card {
            background: white;
            border: 1px solid #e8e6e3;
            border-radius: 4px;
            padding: 24px;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .project-file-card:hover {
            border-color: #1b4332;
            box-shadow: 0 8px 24px rgba(27, 67, 50, 0.12);
            transform: translateY(-2px);
        }

        .file-card-header {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .file-icon-box {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .file-icon-box.bio {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
        }

        .file-icon-box.note {
            background: linear-gradient(135deg, #d6eae5 0%, #b3dcd6 100%);
            color: #1b4332;
        }

        .file-icon-box.aps {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
        }

        .file-icon-box svg {
            width: 26px;
            height: 26px;
        }

        .file-card-info {
            flex: 1;
        }

        .file-card-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }

        .file-card-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--charcoal);
        }

        .file-card-action {
            display: flex;
            gap: 10px;
        }

        .file-card-action a {
            flex: 1;
            padding: 12px 16px;
            background: var(--ivory-dark);
            border: 1px solid #e0ddd8;
            border-radius: 4px;
            color: var(--charcoal);
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .file-card-action a:hover {
            background: #1b4332;
            color: white;
            border-color: #1b4332;
        }

        .file-card-action a svg {
            width: 16px;
            height: 16px;
        }

        .no-file {
            color: var(--warm-gray);
            font-size: 13px;
            font-style: italic;
            padding: 12px;
            background: var(--ivory-dark);
            border-radius: 4px;
            text-align: center;
        }

        /* Token Box */
        .token-box {
            background: rgba(27, 67, 50, 0.08);
            border: 1px dashed #1b4332;
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
            text-align: left;
        }

        .token-label {
            font-size: 10px;
            color: #1b4332;
            font-weight: 700;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .token-label svg {
            width: 16px;
            height: 16px;
        }

        .token-link { 
            color: #1b4332;
            font-weight: 600;
            word-break: break-all;
            text-decoration: none;
            font-size: 13px;
        }

        .token-link:hover {
            text-decoration: underline;
        }

        /* Actions */
        .actions-section {
            padding-top: 35px;
            border-top: 1px solid #e8e6e3;
            margin-top: 30px;
        }

        .actions-container {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 16px;
        }

        .btn {
            padding: 18px 28px;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            font-weight: 700;
            font-size: 12px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn svg {
            width: 18px;
            height: 18px;
        }

        .btn-accept { 
            background: #1b4332;
            color: white;
        }

        .btn-accept:hover {
            background: #0b3d2c;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(45, 106, 79, 0.3);
        }

        .btn-reject { 
            background: transparent;
            color: #d4a574;
            border: 2px solid #d4a574;
        }
        
        .btn-reject:hover {
            background: #d4a574;
            color: #1a1a1a;
        }

        /* Closed Message */
        .closed-message {
            text-align: center;
            padding: 30px;
            background: var(--ivory-dark);
            border-radius: 4px;
            color: var(--warm-gray);
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .closed-message svg {
            width: 20px;
            height: 20px;
            color: var(--success);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 80px 30px;
        }

        .empty-state .empty-icon {
            width: 70px;
            height: 70px;
            max-width: 70px;
            max-height: 70px;
            color: #d1cfc9;
            margin-bottom: 24px;
        }

        .empty-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px;
            font-weight: 600;
            color: var(--charcoal);
            margin-bottom: 10px;
        }

        .empty-state p {
            color: var(--warm-gray);
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .page-wrapper { padding: 20px 15px; }
            .card-body { padding: 30px 20px; }
            .actions-container { grid-template-columns: 1fr; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<div class="page-wrapper">
<div class="container">
    <a href="admin_panel.php" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Retour au Panel
    </a>

    <?php if ($message): ?>
        <div class="msg <?php echo $messageType === 'error' ? 'error' : ($messageType === 'warning' ? 'warning' : 'success'); ?>">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <?php if ($messageType === 'success'): ?>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <?php elseif ($messageType === 'error'): ?>
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <?php else: ?>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                <?php endif; ?>
            </svg>
            <span><?php echo $message; ?></span>
        </div>
    <?php endif; ?>

    <?php if ($candidat): ?>
        <div class="card">
            <div class="card-header">
                <h1>Espace Jury</h1>
                <p>Prix Fondation Jardin Majorelle 2026 • Concours National d'Architecture</p>
                <span class="card-id">Dossier #<?php echo $candidat['id']; ?></span>
            </div>

            <div class="card-body">
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Candidat
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']); ?></div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Date de Naissance
                        </div>
                        <div class="value"><?php echo $candidat['date_naissance'] ? date('d/m/Y', strtotime($candidat['date_naissance'])) : 'Non renseigné'; ?></div>
                    </div>
                    
                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            École d'Architecture
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['ecole_archi']); ?></div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                            Diplôme
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['diplome']); ?> (<?php echo htmlspecialchars($candidat['annee_obtention']); ?>)</div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Numéro CNOA
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['num_ordre']); ?></div>
                    </div>

                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Email
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['email']); ?></div>
                    </div>

                    <?php if (!empty($candidat['phone_number'])): ?>
                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            Téléphone
                        </div>
                        <div class="value"><?php echo htmlspecialchars(($candidat['phone_code'] ?? '') . ' ' . $candidat['phone_number']); ?></div>
                    </div>
                    <?php endif; ?>

                    <?php if (!empty($candidat['adresse'])): ?>
                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Adresse
                        </div>
                        <div class="value"><?php echo htmlspecialchars($candidat['adresse']); ?></div>
                    </div>
                    <?php endif; ?>

                    <div class="info-item">
                        <div class="label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Date d'Inscription
                        </div>
                        <div class="value"><?php echo date('d/m/Y à H:i', strtotime($candidat['created_at'])); ?></div>
                    </div>
                </div>

                <?php if ($candidat['cin_recto'] || $candidat['cin_verso']): ?>
                <div class="doc-section">
                    <div class="doc-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                        </svg>
                        Pièces d'Identité (CIN)
                    </div>
                    <div class="doc-links">
                        <?php if ($candidat['cin_recto']): ?>
                            <a href="<?php echo htmlspecialchars(fileUrl($candidat['cin_recto'])); ?>" target="_blank" class="file-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    <path d="M13 3v6h6"/>
                                </svg>
                                CIN Recto
                            </a>
                        <?php endif; ?>
                        <?php if ($candidat['cin_verso']): ?>
                            <a href="<?php echo htmlspecialchars(fileUrl($candidat['cin_verso'])); ?>" target="_blank" class="file-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    <path d="M13 3v6h6"/>
                                </svg>
                                CIN Verso
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endif; ?>

                <?php 
                // Show project files if any exist, regardless of status
                $hasProjectFiles = !empty($candidat['bio_file']) || !empty($candidat['presentation_file']) || !empty($candidat['aps_file']);
                if ($hasProjectFiles): 
                ?>
                <!-- Project Files Section -->
                <div class="project-section">
                    <div class="project-header">
                        <div class="project-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            Projet Soumis
                        </div>
                        <?php if ($candidat['date_submission_step2']): ?>
                        <div class="project-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Soumis le <?php echo date('d/m/Y à H:i', strtotime($candidat['date_submission_step2'])); ?>
                        </div>
                        <?php endif; ?>
                    </div>
                    <div class="project-body">
                        <div class="project-files">
                            <!-- Bio File -->
                            <div class="project-file-card">
                                <div class="file-card-header">
                                    <div class="file-icon-box bio">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                    <div class="file-card-info">
                                        <div class="file-card-label">Document 1</div>
                                        <div class="file-card-name">Biographie</div>
                                    </div>
                                </div>
                                <?php if ($candidat['bio_file']): ?>
                                <div class="file-card-action">
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['bio_file'])); ?>" target="_blank">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                        Voir
                                    </a>
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['bio_file'])); ?>" download>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                        Télécharger
                                    </a>
                                </div>
                                <?php else: ?>
                                <div class="no-file">Non fourni</div>
                                <?php endif; ?>
                            </div>

                            <!-- Presentation/Note File -->
                            <div class="project-file-card">
                                <div class="file-card-header">
                                    <div class="file-icon-box note">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                    </div>
                                    <div class="file-card-info">
                                        <div class="file-card-label">Document 2</div>
                                        <div class="file-card-name">Note d'Intention</div>
                                    </div>
                                </div>
                                <?php if ($candidat['presentation_file']): ?>
                                <div class="file-card-action">
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['presentation_file'])); ?>" target="_blank">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                        Voir
                                    </a>
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['presentation_file'])); ?>" download>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                        Télécharger
                                    </a>
                                </div>
                                <?php else: ?>
                                <div class="no-file">Non fourni</div>
                                <?php endif; ?>
                            </div>

                            <!-- APS File -->
                            <div class="project-file-card">
                                <div class="file-card-header">
                                    <div class="file-icon-box aps">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    <div class="file-card-info">
                                        <div class="file-card-label">Document 3</div>
                                        <div class="file-card-name">Planches APS (A3)</div>
                                    </div>
                                </div>
                                <?php if ($candidat['aps_file']): ?>
                                <div class="file-card-action">
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['aps_file'])); ?>" target="_blank">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                        Voir
                                    </a>
                                    <a href="<?php echo htmlspecialchars(fileUrl($candidat['aps_file'])); ?>" download>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                        Télécharger
                                    </a>
                                </div>
                                <?php else: ?>
                                <div class="no-file">Non fourni</div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <div class="status-container">
                    <div class="status-label">Statut de la Candidature</div>
                    <span class="status-badge status-<?php echo strtolower($candidat['status']); ?>">
                        <?php 
                        $statusIcons = [
                            'pending' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                            'approved' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                            'rejected' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                            'completed' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'
                        ];
                        $statusLabels = [
                            'pending' => 'En Attente',
                            'approved' => 'Approuvé',
                            'rejected' => 'Refusé',
                            'completed' => 'Projet Soumis'
                        ];
                        echo $statusIcons[$candidat['status']] ?? '';
                        echo '<span>' . ($statusLabels[$candidat['status']] ?? strtoupper($candidat['status'])) . '</span>';
                        ?>
                    </span>

                    <?php if ($candidat['status'] === 'approved' && $candidat['token_step2']): ?>
                        <div class="token-box">
                            <p style="font-size: 12px; color: var(--warm-gray); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                                <svg style="width: 16px; height: 16px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>Email envoyé. Lien de secours ci-dessous :</span>
                            </p>
                            <div class="token-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                </svg>
                                Lien d'upload généré
                            </div>
                            <a href="<?php echo SITE_URL; ?>/?token=<?php echo htmlspecialchars($candidat['token_step2']); ?>" target="_blank" class="token-link">
                                <?php echo SITE_URL; ?>/?token=<?php echo substr($candidat['token_step2'], 0, 15); ?>...
                            </a>
                        </div>
                    <?php endif; ?>
                </div>

                <?php if ($candidat['status'] === 'pending'): ?>
                    <div class="actions-section">
                        <div class="actions-container">
                            <a href="?action=valider&id=<?php echo $candidat['id']; ?>" 
                               class="btn btn-accept" 
                               onclick="return confirm('VALIDATION CANDIDATURE\n\nUn email d\'invitation avec un lien sécurisé sera automatiquement envoyé.\n\nConfirmer la validation ?')">
                               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                   <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                               </svg>
                               Approuver & Inviter
                            </a>
                            
                            <a href="?action=refuser&id=<?php echo $candidat['id']; ?>" 
                               class="btn btn-reject" 
                               onclick="return confirm('REFUS CANDIDATURE\n\nCette action est IRRÉVERSIBLE.\nUn email de refus courtois sera envoyé.\n\nConfirmer le refus ?')">
                               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                   <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                               </svg>
                               Refuser
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="closed-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Ce dossier a été clôturé. Aucune action requise.
                    </div>
                <?php endif; ?>

            </div>
        </div>
    <?php else: ?>
        <div class="card">
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <h2 class="empty-title">Dossier Introuvable</h2>
                <p>L'identifiant demandé n'existe pas dans la base de données.</p>
            </div>
        </div>
    <?php endif; ?>
</div>
</div>

</body>
</html>
