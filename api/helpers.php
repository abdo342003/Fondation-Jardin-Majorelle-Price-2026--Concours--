<?php
// api/helpers.php - Helper Functions v3.0
// Prix Fondation Jardin Majorelle 2026
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// 🛡️ INPUT SANITIZATION & VALIDATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Sanitize user input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Validate email address
 */
function validateEmail($email) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 SECURITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate secure random token
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (isset($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) {
            return $_SERVER[$key];
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// ═══════════════════════════════════════════════════════════════════
// 📧 EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Send email - Production v4.0 (Hostinger compatible)
 * Simple text/html content type - no multipart/related complexity
 * Logo is served via hosted URL in templates, not embedded
 */
function sendEmail($to, $subject, $htmlBody, $isHighPriority = false) {
    try {
        if (!validateEmail($to)) {
            error_log("INVALID EMAIL ADDRESS: $to");
            return false;
        }

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
        $headers .= "Reply-To: " . MAIL_REPLY_TO . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: " . ($isHighPriority ? "1" : "3") . "\r\n";

        if ($isHighPriority && ADMIN_EMAIL !== $to) {
            $headers .= "Bcc: " . ADMIN_EMAIL . "\r\n";
        }

        $additionalParams = "-f" . MAIL_FROM;

        $originalTimeout = ini_get('max_execution_time');
        set_time_limit(15);

        $result = @mail($to, $subject, $htmlBody, $headers, $additionalParams);

        set_time_limit($originalTimeout);

        if ($result) {
            error_log("EMAIL SENT: To=$to | Subject=" . substr($subject, 0, 50));
            return true;
        } else {
            error_log("EMAIL FAILED: To=$to | Subject=" . substr($subject, 0, 50));
            return false;
        }
    } catch (Throwable $e) {
        error_log("EMAIL EXCEPTION: " . $e->getMessage() . " | To=$to");
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// 📁 FILE UPLOAD FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate uploaded file
 */
function validateUploadedFile($file, $allowedTypes, $maxSize, $fieldName = 'file') {
    $errors = [];
    
    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        $errors[] = "Le fichier $fieldName est obligatoire.";
        return ['valid' => false, 'errors' => $errors];
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Le fichier dépasse la limite du serveur.',
            UPLOAD_ERR_FORM_SIZE => 'Le fichier dépasse la limite du formulaire.',
            UPLOAD_ERR_PARTIAL => 'Le fichier n\'a été que partiellement téléchargé.',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant.',
            UPLOAD_ERR_CANT_WRITE => 'Échec de l\'écriture sur le disque.',
            UPLOAD_ERR_EXTENSION => 'Une extension PHP a bloqué le téléchargement.'
        ];
        $errors[] = $errorMessages[$file['error']] ?? 'Erreur inconnue lors de l\'upload.';
        return ['valid' => false, 'errors' => $errors];
    }
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedTypes)) {
        $errors[] = "Type de fichier non autorisé. Formats acceptés: " . implode(', ', $allowedTypes);
    }
    
    if ($file['size'] > $maxSize) {
        $maxMB = round($maxSize / (1024 * 1024), 1);
        $errors[] = "Le fichier dépasse la taille maximale ($maxMB Mo).";
    }
    
    if ($file['size'] === 0) {
        $errors[] = "Le fichier est vide.";
    }
    
    // Verify MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    // Allow multiple MIME types per extension (systems may report variants)
    $allowedMimes = [
        'pdf' => ['application/pdf', 'application/x-pdf'],
        'jpg' => ['image/jpeg', 'image/jpg', 'image/pjpeg'],
        'jpeg' => ['image/jpeg', 'image/jpg', 'image/pjpeg'],
        'png' => ['image/png', 'image/x-png'],
        'webp' => ['image/webp']
    ];
    
    if (isset($allowedMimes[$ext])) {
        if (!in_array($mimeType, $allowedMimes[$ext])) {
            // Log the detected MIME type for debugging
            error_log("MIME TYPE MISMATCH: Expected one of [" . implode(', ', $allowedMimes[$ext]) . "] for .$ext file, but detected: $mimeType | File: {$file['name']}");
            $errors[] = "Le fichier n'est pas du type attendu.";
        }
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'extension' => $ext,
        'mime_type' => $mimeType
    ];
}

/**
 * Upload file securely
 */
function uploadFileSafely($file, $prefix, $directory, $allowedTypes, $maxSize) {
    // Validate file
    $validation = validateUploadedFile($file, $allowedTypes, $maxSize, $prefix);
    
    if (!$validation['valid']) {
        throw new Exception(implode(' ', $validation['errors']));
    }
    
    // Ensure directory exists
    if (!is_dir($directory)) {
        if (!mkdir($directory, 0755, true)) {
            throw new Exception("Impossible de créer le dossier de destination.");
        }
    }
    
    // Generate secure filename
    $ext = $validation['extension'];
    $filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $prefix) . '_' . uniqid() . '_' . time() . '.' . $ext;
    $destination = $directory . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception("Échec de l'enregistrement du fichier.");
    }
    
    // Set proper permissions
    chmod($destination, 0644);
    
    return $destination;
}

// ═══════════════════════════════════════════════════════════════════
// 📤 API RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send success response
 */
function successResponse($message, $data = null) {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response, 200);
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400, $errors = null) {
    $response = ['success' => false, 'message' => $message];
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    jsonResponse($response, $statusCode);
}

// ═══════════════════════════════════════════════════════════════════
// 🪵 LOGGING HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Log with context
 */
function logMessage($message, $level = 'INFO', $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $ip = getClientIP();
    $contextStr = !empty($context) ? ' | ' . json_encode($context) : '';
    $logEntry = "[$timestamp] [$level] [IP:$ip] $message$contextStr\n";
    error_log($logEntry);
}

/**
 * Log security event
 */
function logSecurityEvent($event, $details = []) {
    logMessage("SECURITY: $event", 'WARNING', $details);
}

?>
