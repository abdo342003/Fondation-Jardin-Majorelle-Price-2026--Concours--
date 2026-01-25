<?php
// api/admin_review.php
require 'db_connect.php';

$id = $_GET['id'] ?? null;
$message = "";

// TRAITEMENT DU FORMULAIRE (VALIDER / REFUSER)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'], $_POST['candidat_id'])) {
    $candidat_id = $_POST['candidat_id'];
    $action = $_POST['action'];

    if ($action === 'accept') {
        // 1. Générer un token unique pour l'étape 2
        $token = bin2hex(random_bytes(32)); // Code secret long
        
        // 2. Mettre à jour la base
        $stmt = $pdo->prepare("UPDATE candidats SET status = 'accepted', token_step2 = ? WHERE id = ?");
        $stmt->execute([$token, $candidat_id]);

        // 3. Récupérer l'email du candidat pour lui envoyer le lien
        $stmt = $pdo->prepare("SELECT nom, prenom, email FROM candidats WHERE id = ?");
        $stmt->execute([$candidat_id]);
        $candidat = $stmt->fetch();

        // 4. Envoyer l'email d'invitation Etape 2
        // ⚠️ REMPLACE 'ton-site.com' PAR TON VRAI DOMAINE
        $link_step2 = "http://ton-site.com/candidature-etape2?token=" . $token;
        
        $subject = "Félicitations ! Accès à l'étape 2 - Prix Fondation Jardin Majorelle";
        $msg = "Bonjour " . $candidat['prenom'] . ",\n\n" .
               "Votre candidature a été retenue par notre comité.\n" .
               "Vous pouvez désormais accéder au formulaire de dépôt de projet via ce lien sécurisé :\n\n" .
               $link_step2 . "\n\n" .
               "Bonne chance,\nLa Fondation.";
               
        mail($candidat['email'], $subject, $msg, "From: no-reply@jardinmajorelle.com");
        
        $message = "✅ Candidat VALIDÉ. Invitation envoyée.";

    } elseif ($action === 'reject') {
        $stmt = $pdo->prepare("UPDATE candidats SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$candidat_id]);
        $message = "❌ Candidat REFUSÉ.";
    }
}

// RECUPERATION DES INFOS CANDIDAT POUR AFFICHAGE
if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
    $stmt->execute([$id]);
    $candidat = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Review Candidat #<?php echo $id; ?></title>
    <style>
        body { font-family: sans-serif; padding: 40px; background: #f4f4f4; }
        .card { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0055B8; }
        .row { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .label { font-weight: bold; color: #555; display: block; }
        .btn { padding: 10px 20px; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; margin-right: 10px; }
        .btn-accept { background: #28a745; }
        .btn-reject { background: #dc3545; }
        .msg { padding: 15px; margin-bottom: 20px; border-radius: 5px; text-align: center; font-weight: bold; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        a.file-link { color: #0055B8; text-decoration: underline; }
    </style>
</head>
<body>

<?php if ($message): ?>
    <div class="msg <?php echo strpos($message, 'VALIDÉ') !== false ? 'success' : 'error'; ?>">
        <?php echo $message; ?>
    </div>
<?php endif; ?>

<?php if ($candidat): ?>
    <div class="card">
        <h1>Dossier : <?php echo htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']); ?></h1>
        
        <div class="row">
            <span class="label">École :</span>
            <?php echo htmlspecialchars($candidat['ecole_archi']); ?> (Promo <?php echo $candidat['annee_obtention']; ?>)
        </div>
        
        <div class="row">
            <span class="label">CNOA :</span>
            <?php echo htmlspecialchars($candidat['num_ordre']); ?>
        </div>

        <div class="row">
            <span class="label">Documents CIN :</span>
            <a href="../uploads/cin/<?php echo basename($candidat['cin_recto']); ?>" target="_blank" class="file-link">Voir Recto</a> | 
            <a href="../uploads/cin/<?php echo basename($candidat['cin_verso']); ?>" target="_blank" class="file-link">Voir Verso</a>
        </div>

        <div class="row">
            <span class="label">Statut Actuel :</span>
            <strong><?php echo strtoupper($candidat['status']); ?></strong>
        </div>

        <?php if ($candidat['status'] === 'pending'): ?>
            <form method="POST" style="margin-top: 20px;">
                <input type="hidden" name="candidat_id" value="<?php echo $candidat['id']; ?>">
                <button type="submit" name="action" value="accept" class="btn btn-accept" onclick="return confirm('Êtes-vous sûr de valider ce candidat ? Il recevra le lien pour l\'étape 2.')">✅ VALIDER & INVITER</button>
                <button type="submit" name="action" value="reject" class="btn btn-reject" onclick="return confirm('Refuser ce candidat ?')">❌ REFUSER</button>
            </form>
        <?php else: ?>
            <p style="color: gray; margin-top: 20px;">Ce dossier a déjà été traité.</p>
        <?php endif; ?>
    </div>
<?php else: ?>
    <p style="text-align:center">Candidat introuvable.</p>
<?php endif; ?>

</body>
</html><?php
// api/admin_review.php
require 'db_connect.php';

$id = $_GET['id'] ?? null;
$message = "";

// TRAITEMENT DU FORMULAIRE (VALIDER / REFUSER)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'], $_POST['candidat_id'])) {
    $candidat_id = $_POST['candidat_id'];
    $action = $_POST['action'];

    if ($action === 'accept') {
        // 1. Générer un token unique pour l'étape 2
        $token = bin2hex(random_bytes(32)); // Code secret long
        
        // 2. Mettre à jour la base
        $stmt = $pdo->prepare("UPDATE candidats SET status = 'accepted', token_step2 = ? WHERE id = ?");
        $stmt->execute([$token, $candidat_id]);

        // 3. Récupérer l'email du candidat pour lui envoyer le lien
        $stmt = $pdo->prepare("SELECT nom, prenom, email FROM candidats WHERE id = ?");
        $stmt->execute([$candidat_id]);
        $candidat = $stmt->fetch();

        // 4. Envoyer l'email d'invitation Etape 2
        // ⚠️ REMPLACE 'ton-site.com' PAR TON VRAI DOMAINE
        $link_step2 = "http://ton-site.com/candidature-etape2?token=" . $token;
        
        $subject = "Félicitations ! Accès à l'étape 2 - Prix Fondation Jardin Majorelle";
        $msg = "Bonjour " . $candidat['prenom'] . ",\n\n" .
               "Votre candidature a été retenue par notre comité.\n" .
               "Vous pouvez désormais accéder au formulaire de dépôt de projet via ce lien sécurisé :\n\n" .
               $link_step2 . "\n\n" .
               "Bonne chance,\nLa Fondation.";
               
        mail($candidat['email'], $subject, $msg, "From: no-reply@jardinmajorelle.com");
        
        $message = "✅ Candidat VALIDÉ. Invitation envoyée.";

    } elseif ($action === 'reject') {
        $stmt = $pdo->prepare("UPDATE candidats SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$candidat_id]);
        $message = "❌ Candidat REFUSÉ.";
    }
}

// RECUPERATION DES INFOS CANDIDAT POUR AFFICHAGE
if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM candidats WHERE id = ?");
    $stmt->execute([$id]);
    $candidat = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Review Candidat #<?php echo $id; ?></title>
    <style>
        body { font-family: sans-serif; padding: 40px; background: #f4f4f4; }
        .card { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0055B8; }
        .row { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .label { font-weight: bold; color: #555; display: block; }
        .btn { padding: 10px 20px; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; margin-right: 10px; }
        .btn-accept { background: #28a745; }
        .btn-reject { background: #dc3545; }
        .msg { padding: 15px; margin-bottom: 20px; border-radius: 5px; text-align: center; font-weight: bold; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        a.file-link { color: #0055B8; text-decoration: underline; }
    </style>
</head>
<body>

<?php if ($message): ?>
    <div class="msg <?php echo strpos($message, 'VALIDÉ') !== false ? 'success' : 'error'; ?>">
        <?php echo $message; ?>
    </div>
<?php endif; ?>

<?php if ($candidat): ?>
    <div class="card">
        <h1>Dossier : <?php echo htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']); ?></h1>
        
        <div class="row">
            <span class="label">École :</span>
            <?php echo htmlspecialchars($candidat['ecole_archi']); ?> (Promo <?php echo $candidat['annee_obtention']; ?>)
        </div>
        
        <div class="row">
            <span class="label">CNOA :</span>
            <?php echo htmlspecialchars($candidat['num_ordre']); ?>
        </div>

        <div class="row">
            <span class="label">Documents CIN :</span>
            <a href="../uploads/cin/<?php echo basename($candidat['cin_recto']); ?>" target="_blank" class="file-link">Voir Recto</a> | 
            <a href="../uploads/cin/<?php echo basename($candidat['cin_verso']); ?>" target="_blank" class="file-link">Voir Verso</a>
        </div>

        <div class="row">
            <span class="label">Statut Actuel :</span>
            <strong><?php echo strtoupper($candidat['status']); ?></strong>
        </div>

        <?php if ($candidat['status'] === 'pending'): ?>
            <form method="POST" style="margin-top: 20px;">
                <input type="hidden" name="candidat_id" value="<?php echo $candidat['id']; ?>">
                <button type="submit" name="action" value="accept" class="btn btn-accept" onclick="return confirm('Êtes-vous sûr de valider ce candidat ? Il recevra le lien pour l\'étape 2.')">✅ VALIDER & INVITER</button>
                <button type="submit" name="action" value="reject" class="btn btn-reject" onclick="return confirm('Refuser ce candidat ?')">❌ REFUSER</button>
            </form>
        <?php else: ?>
            <p style="color: gray; margin-top: 20px;">Ce dossier a déjà été traité.</p>
        <?php endif; ?>
    </div>
<?php else: ?>
    <p style="text-align:center">Candidat introuvable.</p>
<?php endif; ?>

</body>
</html>