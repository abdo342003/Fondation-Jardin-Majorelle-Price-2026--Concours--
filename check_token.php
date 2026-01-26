<?php
// check_token.php - Diagnostic Tool for Step 2 Tokens
// Usage: check_token.php?token=YOUR_TOKEN_HERE

header('Content-Type: text/html; charset=utf-8');

require 'api/db_connect.php';

$token = $_GET['token'] ?? '';

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Diagnostic Token Step 2</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0055B8; border-bottom: 3px solid #0055B8; padding-bottom: 10px; }
        .form-group { margin: 20px 0; }
        input[type="text"] { width: 100%; padding: 12px; font-family: monospace; font-size: 14px; border: 2px solid #ddd; border-radius: 5px; }
        button { background: #0055B8; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
        button:hover { background: #003d82; }
        .result { margin-top: 30px; padding: 20px; border-radius: 8px; }
        .success { background: #d4edda; border-left: 5px solid #28a745; color: #155724; }
        .error { background: #f8d7da; border-left: 5px solid #dc3545; color: #721c24; }
        .warning { background: #fff3cd; border-left: 5px solid #ffc107; color: #856404; }
        .info { background: #d1ecf1; border-left: 5px solid #17a2b8; color: #0c5460; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #0055B8; color: white; font-weight: bold; }
        tr:hover { background: #f5f5f5; }
        .status-badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-approved { background: #d4edda; color: #155724; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        .sql-query { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnostic Token Step 2</h1>
        
        <div class="info">
            <strong>ℹ️ Outil de diagnostic</strong><br>
            Cet outil vous aide à identifier pourquoi un token Step 2 ne fonctionne pas.
        </div>

        <form method="GET" class="form-group">
            <label for="token"><strong>🔑 Token à vérifier :</strong></label>
            <input type="text" id="token" name="token" placeholder="Collez le token ici (64 caractères)..." value="<?php echo htmlspecialchars($token); ?>">
            <button type="submit" style="margin-top: 10px;">🔍 Analyser le Token</button>
        </form>

        <?php if ($token): ?>
            <div class="result">
                <?php
                try {
                    // 1. Rechercher le candidat avec ce token
                    $stmt = $pdo->prepare("SELECT * FROM candidats WHERE token_step2 = ?");
                    $stmt->execute([$token]);
                    $candidat = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($candidat) {
                        echo '<div class="success">';
                        echo '<h3>✅ Token trouvé dans la base de données</h3>';
                        echo '<table>';
                        echo '<tr><th>Champ</th><th>Valeur</th></tr>';
                        echo '<tr><td><strong>ID</strong></td><td>' . $candidat['id'] . '</td></tr>';
                        echo '<tr><td><strong>Nom</strong></td><td>' . htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']) . '</td></tr>';
                        echo '<tr><td><strong>Email</strong></td><td>' . htmlspecialchars($candidat['email']) . '</td></tr>';
                        echo '<tr><td><strong>Status</strong></td><td><span class="status-badge status-' . $candidat['status'] . '">' . strtoupper($candidat['status']) . '</span></td></tr>';
                        echo '<tr><td><strong>Token Step 2</strong></td><td style="font-family:monospace; font-size:11px;">' . htmlspecialchars($candidat['token_step2']) . '</td></tr>';
                        echo '<tr><td><strong>Date création</strong></td><td>' . $candidat['created_at'] . '</td></tr>';
                        echo '<tr><td><strong>Date mise à jour</strong></td><td>' . $candidat['updated_at'] . '</td></tr>';
                        
                        if (isset($candidat['date_submission_step2'])) {
                            echo '<tr><td><strong>Date soumission Step 2</strong></td><td>' . ($candidat['date_submission_step2'] ?: '<em>Pas encore soumis</em>') . '</td></tr>';
                        }
                        
                        echo '</table>';
                        echo '</div>';

                        // 2. Vérifier si le statut est correct
                        if ($candidat['status'] === 'approved') {
                            echo '<div class="success">';
                            echo '<h3>✅ Statut correct (approved)</h3>';
                            echo '<p><strong>Ce candidat peut accéder au formulaire Step 2.</strong></p>';
                            echo '<p>Lien d\'accès : <code>https://fondationjardinmajorelleprize.com/?token=' . htmlspecialchars($token) . '</code></p>';
                            echo '</div>';
                        } elseif ($candidat['status'] === 'completed') {
                            echo '<div class="warning">';
                            echo '<h3>⚠️ Projet déjà soumis (completed)</h3>';
                            echo '<p>Ce candidat a déjà soumis son projet. Le token a été utilisé.</p>';
                            if ($candidat['date_submission_step2']) {
                                echo '<p>Date de soumission : <strong>' . $candidat['date_submission_step2'] . '</strong></p>';
                            }
                            echo '<p><strong>Fichiers soumis :</strong></p>';
                            echo '<ul>';
                            if ($candidat['bio_file']) echo '<li>✅ Biographie : ' . basename($candidat['bio_file']) . '</li>';
                            if ($candidat['presentation_file']) echo '<li>✅ Note d\'intention : ' . basename($candidat['presentation_file']) . '</li>';
                            if ($candidat['aps_file']) echo '<li>✅ APS : ' . basename($candidat['aps_file']) . '</li>';
                            echo '</ul>';
                            echo '<p><strong>🔧 Solution :</strong> Si vous devez permettre une nouvelle soumission, exécutez :</p>';
                            echo '<div class="sql-query">UPDATE candidats SET status = \'approved\', token_step2 = \'' . bin2hex(random_bytes(32)) . '\' WHERE id = ' . $candidat['id'] . ';</div>';
                            echo '</div>';
                        } elseif ($candidat['status'] === 'pending') {
                            echo '<div class="error">';
                            echo '<h3>❌ Statut incorrect (pending)</h3>';
                            echo '<p>Ce candidat n\'a pas encore été validé par le jury.</p>';
                            echo '<p><strong>🔧 Solution :</strong> Utilisez le panneau admin pour valider ce candidat :</p>';
                            echo '<p><a href="/api/admin_review.php?id=' . $candidat['id'] . '" target="_blank" style="color:#0055B8; font-weight:bold;">► Accéder à la page de validation</a></p>';
                            echo '</div>';
                        } elseif ($candidat['status'] === 'rejected') {
                            echo '<div class="error">';
                            echo '<h3>❌ Candidat rejeté</h3>';
                            echo '<p>Ce candidat a été refusé par le jury.</p>';
                            echo '<p><strong>🔧 Solution :</strong> Si c\'est une erreur, changez le statut :</p>';
                            echo '<div class="sql-query">UPDATE candidats SET status = \'approved\' WHERE id = ' . $candidat['id'] . ';</div>';
                            echo '</div>';
                        }

                    } else {
                        // Token pas trouvé
                        echo '<div class="error">';
                        echo '<h3>❌ Token introuvable</h3>';
                        echo '<p>Aucun candidat ne possède ce token dans la base de données.</p>';
                        echo '<p><strong>Causes possibles :</strong></p>';
                        echo '<ul>';
                        echo '<li>Le token est incorrect (vérifiez les caractères)</li>';
                        echo '<li>Le token a expiré ou a été supprimé</li>';
                        echo '<li>Le candidat a déjà soumis (token mis à NULL)</li>';
                        echo '</ul>';
                        echo '</div>';

                        // Rechercher les candidats approuvés avec un token
                        $stmt = $pdo->query("SELECT id, nom, prenom, email, status, token_step2, created_at FROM candidats WHERE status = 'approved' AND token_step2 IS NOT NULL ORDER BY created_at DESC LIMIT 5");
                        $candidatsApprouves = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        if ($candidatsApprouves) {
                            echo '<div class="info" style="margin-top: 20px;">';
                            echo '<h3>📋 Candidats approuvés récents avec token :</h3>';
                            echo '<table>';
                            echo '<tr><th>ID</th><th>Nom</th><th>Email</th><th>Token (début)</th></tr>';
                            foreach ($candidatsApprouves as $c) {
                                echo '<tr>';
                                echo '<td>' . $c['id'] . '</td>';
                                echo '<td>' . htmlspecialchars($c['prenom'] . ' ' . $c['nom']) . '</td>';
                                echo '<td>' . htmlspecialchars($c['email']) . '</td>';
                                echo '<td style="font-family:monospace; font-size:11px;">' . substr($c['token_step2'], 0, 20) . '...</td>';
                                echo '</tr>';
                            }
                            echo '</table>';
                            echo '</div>';
                        }
                    }

                } catch (PDOException $e) {
                    echo '<div class="error">';
                    echo '<h3>❌ Erreur de base de données</h3>';
                    echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
                    echo '</div>';
                }
                ?>
            </div>
        <?php else: ?>
            <div class="info">
                <h3>📝 Instructions :</h3>
                <ol>
                    <li>Collez le token dans le champ ci-dessus</li>
                    <li>Cliquez sur "Analyser le Token"</li>
                    <li>Suivez les recommandations affichées</li>
                </ol>
                
                <h4>🔍 Comment obtenir un token ?</h4>
                <p>Via phpMyAdmin, exécutez :</p>
                <div class="sql-query">SELECT id, nom, prenom, email, status, token_step2 FROM candidats WHERE id = 1;</div>
                
                <p>Ou depuis l'URL d'un lien Step 2 :</p>
                <code>https://fondationjardinmajorelleprize.com/?token=<strong>LE_TOKEN_EST_ICI</strong></code>
            </div>
        <?php endif; ?>

        <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
            <strong>⚠️ IMPORTANT :</strong> Supprimez ce fichier après utilisation pour des raisons de sécurité !
        </div>
    </div>
</body>
</html>
