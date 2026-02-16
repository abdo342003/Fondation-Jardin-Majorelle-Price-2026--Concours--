<?php
// api/admin_login.php - PRODUCTION v3.0
// Prix Fondation Jardin Majorelle 2026 - Jury Login System
// ═══════════════════════════════════════════════════════════════════

session_start();

require_once __DIR__ . '/db_connect.php';

// Capture redirect URL
if (isset($_GET['redirect'])) {
    $_SESSION['redirect_after_login'] = sanitizeInput($_GET['redirect']);
} elseif (isset($_GET['id'])) {
    $_SESSION['redirect_after_login'] = 'admin_review.php?id=' . intval($_GET['id']);
}

$error = '';
$clientIP = getClientIP();

// Process login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if ($username === JURY_USERNAME && password_verify($password, JURY_PASSWORD_HASH)) {
        $_SESSION['jury_logged_in'] = true;
        $_SESSION['jury_login_time'] = time();
        $_SESSION['jury_ip'] = $clientIP;
        $_SESSION['jury_username'] = 'jury';
        
        logMessage("Jury login successful", 'INFO', ['ip' => $clientIP]);
        
        $redirect = $_SESSION['redirect_after_login'] ?? 'admin_review.php';
        unset($_SESSION['redirect_after_login']);
        header('Location: ' . $redirect);
        exit;
    } else {
        // Try admin users table
        try {
            $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
            $stmt->execute([$username]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($admin && password_verify($password, $admin['password_hash'])) {
                $_SESSION['jury_logged_in'] = true;
                $_SESSION['jury_login_time'] = time();
                $_SESSION['jury_ip'] = $clientIP;
                $_SESSION['jury_username'] = $admin['username'];
                
                logMessage("Admin login successful", 'INFO', ['username' => $admin['username'], 'ip' => $clientIP]);
                
                $redirect = $_SESSION['redirect_after_login'] ?? 'admin_review.php';
                unset($_SESSION['redirect_after_login']);
                header('Location: ' . $redirect);
                exit;
            }
        } catch (Exception $e) {
            logMessage("Admin login DB error: " . $e->getMessage(), 'ERROR');
        }
        
        $error = "Identifiants incorrects. Veuillez réessayer.";
        logSecurityEvent("Failed login attempt", ['username' => $username, 'ip' => $clientIP]);
    }
}

if (isset($_SESSION['jury_logged_in']) && $_SESSION['jury_logged_in'] === true) {
    $redirect = $_SESSION['redirect_after_login'] ?? 'admin_review.php';
    unset($_SESSION['redirect_after_login']);
    header('Location: ' . $redirect);
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espace Jury | Prix Fondation Jardin Majorelle 2026</title>
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
            --danger: #9b2c2c;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Effra', -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #7dafab 0%, #5a8884 100%);
            position: relative;
            overflow-x: hidden;
            overflow-y: auto;
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

        .login-container {
            width: 100%;
            max-width: 440px;
            position: relative;
            z-index: 1;
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .login-card {
            background: var(--surface-ivory);
            border-radius: 4px;
            box-shadow: 0 30px 60px rgba(15, 36, 66, 0.25), 0 0 0 1px rgba(125, 175, 171, 0.1);
            overflow: hidden;
        }

        .login-header {
            background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-teal-dark) 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
        }

        .login-header::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, var(--secondary-amber), transparent);
        }

        .logo-emblem {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-emblem::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 2px solid var(--secondary-amber);
            border-radius: 50%;
            animation: pulse 3s ease-in-out infinite;
            box-shadow: 0 0 20px rgba(248, 178, 0, 0.3);
        }

        .logo-emblem::after {
            content: '';
            position: absolute;
            inset: -8px;
            border: 1px solid var(--secondary-amber);
            border-radius: 50%;
            opacity: 0.2;
            animation: rotateBorder 8s linear infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes rotateBorder {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .logo-emblem svg {
            width: 100%;
            height: 100%;
            color: var(--gold-accent);
            filter: drop-shadow(0 4px 8px rgba(45, 212, 79, 0.2)) drop-shadow(2px 2px 4px rgba(15, 36, 66, 0.4)) drop-shadow(-2px -2px 4px rgba(255, 255, 255, 0.1));
            animation: float 3s ease-in-out infinite, rotate3d 6s linear infinite;
            z-index: 1;
            transform-style: preserve-3d;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
        }

        @keyframes rotate3d {
            0% { transform: rotateX(0deg) rotateY(-20deg) rotateZ(0deg); }
            25% { transform: rotateX(10deg) rotateY(-35deg) rotateZ(5deg); }
            50% { transform: rotateX(0deg) rotateY(-20deg) rotateZ(10deg); }
            75% { transform: rotateX(-10deg) rotateY(-5deg) rotateZ(5deg); }
            100% { transform: rotateX(0deg) rotateY(-20deg) rotateZ(0deg); }
        }

        .login-header h1 {
            font-family: 'Ivy Presto Display', Georgia, serif;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }

        .login-header p {
            font-size: 13px;
            opacity: 0.8;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .login-body {
            padding: 45px 40px;
            background: #d4a574;
        }

        .form-group {
            margin-bottom: 28px;
        }

        .form-label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            color: var(--warm-gray);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .input-wrapper {
            position: relative;
        }

        .input-wrapper svg {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            color: var(--warm-gray);
            transition: color 0.3s ease;
        }

        .form-input {
            width: 100%;
            padding: 18px 20px 18px 52px;
            border: 1px solid #e0ddd8;
            border-radius: 4px;
            font-size: 15px;
            font-family: inherit;
            transition: all 0.3s ease;
            background: white;
            color: var(--charcoal);
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary-teal);
            box-shadow: 0 0 0 3px rgba(125, 175, 171, 0.08);
        }

        .form-input:focus ~ svg {
            color: var(--majorelle-blue);
        }

        .form-input::placeholder {
            color: #b8b5b0;
        }

        .btn-login {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-teal-dark) 100%);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }

        .btn-login::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--secondary-amber) 0%, #d99505 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .btn-login:hover::before {
            opacity: 1;
        }

        .btn-login span,
        .btn-login svg {
            position: relative;
            z-index: 1;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(125, 175, 171, 0.25);
        }

        .btn-login svg {
            width: 18px;
            height: 18px;
        }

        .error-message {
            background: #fdf2f2;
            border: 1px solid #f5c6c6;
            border-left: 3px solid var(--danger);
            color: var(--danger);
            padding: 16px 18px;
            border-radius: 4px;
            margin-bottom: 28px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .error-message svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .security-note {
            text-align: center;
            padding-top: 25px;
            border-top: 1px solid #e0ddd8;
        }

        .security-note p {
            font-size: 12px;
            color: var(--warm-gray);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .security-note svg {
            width: 14px;
            height: 14px;
            color: var(--secondary-amber);
        }

        .footer-text {
            text-align: center;
            margin-top: 35px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            letter-spacing: 1px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 30px 15px;
                align-items: flex-start;
            }
            .login-container {
                margin-top: 20px;
                margin-bottom: 20px;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 20px 12px;
            }
            .login-header { 
                padding: 35px 20px; 
            }
            .login-body { 
                padding: 30px 20px; 
            }
            .login-header h1 { 
                font-size: 22px; 
            }
            .login-header p {
                font-size: 11px;
                letter-spacing: 1.5px;
            }
            .logo-emblem {
                width: 65px;
                height: 65px;
                margin-bottom: 18px;
            }
            .form-group {
                margin-bottom: 22px;
            }
            .form-input {
                padding: 16px 18px 16px 48px;
                font-size: 14px;
            }
            .btn-login {
                padding: 16px;
                font-size: 12px;
            }
            .footer-text {
                margin-top: 25px;
                font-size: 11px;
            }
        }

        @media (max-height: 700px) {
            body {
                align-items: flex-start;
            }
            .login-container {
                margin-top: 15px;
                margin-bottom: 15px;
            }
            .login-header {
                padding: 30px 25px;
            }
            .logo-emblem {
                width: 60px;
                height: 60px;
                margin-bottom: 15px;
            }
            .login-body {
                padding: 30px;
            }
        }
    </style>
</head>
<body>

<div class="login-container">
    <div class="login-card">
        <div class="login-header">
            <div class="logo-emblem">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/>
                    <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" fill="currentColor" opacity="0.9"/>
                    <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
            </div>
            <h1>Espace Jury</h1>
            <p>Fondation Jardin Majorelle</p>
        </div>

        <div class="login-body">
            <?php if ($error): ?>
                <div class="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span><?php echo htmlspecialchars($error); ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label class="form-label">Identifiant</label>
                    <div class="input-wrapper">
                        <input type="text" name="username" class="form-input" placeholder="Entrez votre identifiant" required autocomplete="username">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Mot de passe</label>
                    <div class="input-wrapper">
                        <input type="password" name="password" class="form-input" placeholder="Entrez votre mot de passe" required autocomplete="current-password">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                </div>

                <button type="submit" class="btn-login">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    <span>Connexion</span>
                </button>
            </form>

            <div class="security-note">
                <p>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    Connexion sécurisée • Accès réservé aux membres du jury
                </p>
            </div>
        </div>
    </div>

    <p class="footer-text">
        © 2026 Fondation Jardin Majorelle • Prix National d'Architecture
    </p>
</div>

</body>
</html>
