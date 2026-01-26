<?php
// api/email_monitor.php - Email System Health Monitor & Test Tool
// Access: https://fondationjardinmajorelleprize.com/api/email_monitor.php
// Version: 1.0

ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');

require 'db_connect.php';

$testResults = [];
$adminEmail = "abdoraoui9@gmail.com";

// ========== ACTION: Send Test Email ==========
if (isset($_GET['action']) && $_GET['action'] === 'test_email') {
    $testEmail = $_GET['email'] ?? $adminEmail;
    
    $subject = "Test Email - Prix Fondation Jardin Majorelle";
    $message = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { background: #0055B8; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px 0; }
        .footer { color: #777; font-size: 12px; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>✅ Test Email Successful</h2>
        </div>
        <div class='content'>
            <p><strong>Congratulations!</strong></p>
            <p>Your email system is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
                <li>Server: " . $_SERVER['SERVER_NAME'] . "</li>
                <li>PHP Version: " . phpversion() . "</li>
                <li>Timestamp: " . date('Y-m-d H:i:s') . "</li>
                <li>From: no-reply@fondationjardinmajorelleprize.com</li>
            </ul>
        </div>
        <div class='footer'>
            <p>This is an automated test email from the Fondation Jardin Majorelle system.</p>
        </div>
    </div>
</body>
</html>";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Prix Fondation Jardin Majorelle <no-reply@fondationjardinmajorelleprize.com>\r\n";
    $headers .= "Reply-To: contact@fondationjardinmajorelleprize.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    
    set_time_limit(10);
    $result = @mail($testEmail, $subject, $message, $headers);
    set_time_limit(300);
    
    if ($result) {
        $testResults[] = "✅ Test email sent successfully to: $testEmail";
        error_log("EmailMonitor: Test email sent to $testEmail");
    } else {
        $testResults[] = "❌ Failed to send test email to: $testEmail";
        error_log("EmailMonitor: FAILED to send test email to $testEmail");
    }
}

// ========== FETCH EMAIL STATISTICS ==========
$stats = [
    'total_candidates' => 0,
    'pending' => 0,
    'approved' => 0,
    'rejected' => 0,
    'completed' => 0,
    'with_step2_token' => 0
];

try {
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM candidats GROUP BY status");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $stats[strtolower($row['status'])] = $row['count'];
        $stats['total_candidates'] += $row['count'];
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM candidats WHERE token_step2 IS NOT NULL");
    $stats['with_step2_token'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
} catch (Exception $e) {
    $testResults[] = "❌ Database error: " . $e->getMessage();
}

// ========== READ ERROR LOG ==========
$errorLog = [];
$logFile = '../error_log.txt';
if (file_exists($logFile)) {
    $logContent = file_get_contents($logFile);
    $lines = explode("\n", $logContent);
    // Get last 50 lines
    $errorLog = array_slice(array_reverse(array_filter($lines)), 0, 50);
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email System Monitor | Fondation Jardin Majorelle</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Outfit', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 { color: #333; font-size: 28px; margin-bottom: 10px; }
        .header p { color: #777; font-size: 14px; }
        
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-5px); }
        .card-title {
            font-size: 14px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .card-value {
            font-size: 36px;
            font-weight: 600;
            color: #333;
        }
        .card.success { border-left: 5px solid #10b981; }
        .card.warning { border-left: 5px solid #f59e0b; }
        .card.danger { border-left: 5px solid #ef4444; }
        .card.info { border-left: 5px solid #3b82f6; }
        
        .test-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .test-section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        .btn-success {
            background: #10b981;
            color: white;
        }
        .btn-success:hover {
            background: #059669;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-weight: 500;
        }
        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border-left: 5px solid #059669;
        }
        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border-left: 5px solid #dc2626;
        }
        
        .log-viewer {
            background: #1e293b;
            color: #94a3b8;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
            line-height: 1.6;
        }
        .log-viewer .error { color: #fca5a5; }
        .log-viewer .success { color: #6ee7b7; }
        .log-viewer .warning { color: #fcd34d; }
        
        input[type="email"] {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            width: 300px;
            margin-right: 10px;
        }
        
        .timestamp {
            font-size: 11px;
            color: #999;
            margin-top: 5px;
        }
    </style>
</head>
<body>
<div class="container">
    
    <div class="header">
        <h1>📧 Email System Monitor</h1>
        <p>Fondation Jardin Majorelle - Prix National d'Architecture 2026</p>
        <div class="timestamp">Last updated: <?php echo date('Y-m-d H:i:s'); ?></div>
    </div>

    <?php if (!empty($testResults)): ?>
        <?php foreach ($testResults as $result): ?>
            <div class="alert <?php echo strpos($result, '✅') !== false ? 'alert-success' : 'alert-error'; ?>">
                <?php echo htmlspecialchars($result); ?>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>

    <!-- Statistics Grid -->
    <div class="grid">
        <div class="card info">
            <div class="card-title">Total Candidates</div>
            <div class="card-value"><?php echo $stats['total_candidates']; ?></div>
        </div>
        <div class="card warning">
            <div class="card-title">Pending Review</div>
            <div class="card-value"><?php echo $stats['pending']; ?></div>
        </div>
        <div class="card success">
            <div class="card-title">Approved</div>
            <div class="card-value"><?php echo $stats['approved']; ?></div>
        </div>
        <div class="card danger">
            <div class="card-title">Rejected</div>
            <div class="card-value"><?php echo $stats['rejected']; ?></div>
        </div>
        <div class="card success">
            <div class="card-title">Completed (Step 2)</div>
            <div class="card-value"><?php echo $stats['completed']; ?></div>
        </div>
        <div class="card info">
            <div class="card-title">Active Tokens</div>
            <div class="card-value"><?php echo $stats['with_step2_token']; ?></div>
        </div>
    </div>

    <!-- Email Test Section -->
    <div class="test-section">
        <h2>🧪 Email System Testing</h2>
        <p style="margin-bottom: 20px; color: #666;">Send a test email to verify your email configuration is working correctly.</p>
        
        <form method="GET" style="margin-bottom: 20px;">
            <input type="hidden" name="action" value="test_email">
            <input type="email" name="email" placeholder="Enter test email address" value="<?php echo htmlspecialchars($adminEmail); ?>" required>
            <button type="submit" class="btn btn-success">📤 Send Test Email</button>
        </form>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
            <strong>📊 Email Configuration:</strong><br>
            <code style="display: block; margin-top: 5px; color: #555;">
                From: no-reply@fondationjardinmajorelleprize.com<br>
                Reply-To: contact@fondationjardinmajorelleprize.com<br>
                Admin BCC: <?php echo $adminEmail; ?>
            </code>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="test-section">
        <h2>⚡ Quick Actions</h2>
        <a href="?action=refresh" class="btn btn-primary">🔄 Refresh Stats</a>
        <a href="../" class="btn btn-primary">🏠 Back to Application</a>
        <button onclick="clearLogs()" class="btn btn-primary">🗑️ Clear Error Log Display</button>
    </div>

    <!-- Error Log Viewer -->
    <div class="test-section">
        <h2>📋 Recent Error Logs (Last 50 entries)</h2>
        <div class="log-viewer">
            <?php if (!empty($errorLog)): ?>
                <?php foreach ($errorLog as $line): ?>
                    <?php
                    $class = '';
                    if (stripos($line, 'error') !== false || stripos($line, 'failed') !== false) {
                        $class = 'error';
                    } elseif (stripos($line, 'success') !== false || stripos($line, 'sent') !== false) {
                        $class = 'success';
                    } elseif (stripos($line, 'warning') !== false) {
                        $class = 'warning';
                    }
                    ?>
                    <div class="<?php echo $class; ?>"><?php echo htmlspecialchars($line); ?></div>
                <?php endforeach; ?>
            <?php else: ?>
                <div style="color: #6ee7b7;">✅ No errors logged. System is running smoothly.</div>
            <?php endif; ?>
        </div>
    </div>

</div>

<script>
function clearLogs() {
    if (confirm('This will only clear the display, not the actual log file. Continue?')) {
        document.querySelector('.log-viewer').innerHTML = '<div style="color: #6ee7b7;">✅ Display cleared. Refresh page to reload logs.</div>';
    }
}
</script>

</body>
</html>
