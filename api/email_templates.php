<?php
// api/email_templates.php - Production v4.0
// Registration Email Templates - Bilingual FR/EN side-by-side
// Table-based layout with 100% inline styles for email client compatibility

define('LOGO_URL', SITE_URL . '/logo.png');

/**
 * Shared email wrapper - header + footer with brand styling
 * Table-based, inline styles only, no CSS classes
 */
function emailWrap($innerHtml, $headerTitle, $headerSubtitle = '') {
    $logoUrl = LOGO_URL;
    $subtitleRow = $headerSubtitle
        ? "<tr><td style=\"text-align:center;color:#ffffff;font-size:16px;opacity:0.9;padding:8px 0 0 0;font-family:Georgia,'Times New Roman',serif;\">$headerSubtitle</td></tr>"
        : '';

    return '<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' . htmlspecialchars($headerTitle) . '</title></head>
<body style="margin:0;padding:0;background-color:#f9f4d5;font-family:Georgia,\'Times New Roman\',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9f4d5;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="800" cellpadding="0" cellspacing="0" border="0" style="max-width:800px;width:100%;background:#ffffff;border-collapse:collapse;">
<!-- HEADER -->
<tr><td style="background-color:#7dafab;padding:35px 30px;text-align:center;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding-bottom:25px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;border:4px solid #f8b200;">
<tr><td style="padding:15px;">
<img src="' . $logoUrl . '" alt="Fondation Jardin Majorelle" width="120" height="120" style="display:block;width:120px;height:120px;border:0;" />
</td></tr>
</table>
</td></tr>
<tr><td style="text-align:center;color:#ffffff;font-size:26px;font-weight:600;font-family:Georgia,\'Times New Roman\',serif;margin:0;">' . $headerTitle . '</td></tr>
' . $subtitleRow . '
</table>
</td></tr>
<!-- CONTENT -->
<tr><td style="padding:0;">
' . $innerHtml . '
</td></tr>
<!-- FOOTER -->
<tr><td style="background-color:#2d2d2d;padding:30px;text-align:center;font-family:Georgia,\'Times New Roman\',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="text-align:center;font-size:14px;padding-bottom:8px;"><strong style="color:#f8b200;">Fondation Jardin Majorelle</strong></td></tr>
<tr><td style="text-align:center;font-size:12px;color:#94a3b8;padding:4px 0;">contact@fondationjardinmajorelleprize.com</td></tr>
<tr><td style="text-align:center;font-size:12px;color:#94a3b8;padding:4px 0;">www.fondationjardinmajorelleprize.com</td></tr>
<tr><td style="text-align:center;font-size:12px;color:#94a3b8;padding:12px 0 0 0;">&copy; 2026 Fondation Jardin Majorelle &ndash; Tous droits r&eacute;serv&eacute;s | All rights reserved</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>';
}

/**
 * Get registration confirmation email templates (Step 1)
 */
function getRegistrationEmailTemplates($language, $data) {
    $candidateEmail = getCandidateRegistrationEmail($data);
    $juryEmail = getJuryRegistrationEmail($data);

    return [
        'candidateSubject' => $candidateEmail['subject'],
        'candidateBody'    => $candidateEmail['body'],
        'jurySubject'      => $juryEmail['subject'],
        'juryBody'         => $juryEmail['body']
    ];
}

/**
 * Candidate registration email - Vertical FR/EN format
 */
function getCandidateRegistrationEmail($data) {
    $id     = htmlspecialchars($data['candidat_id']);
    $prenom = htmlspecialchars($data['prenom']);
    $num    = htmlspecialchars($data['num_ordre']);
    $email  = htmlspecialchars($data['email']);

    $subject = "Inscription confirmée | Registration Confirmed – Prix Fondation Jardin Majorelle 2026";

    $inner = '
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:35px 40px;font-family:Georgia,\'Times New Roman\',serif;color:#1e293b;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Title FR -->
<tr><td style="color:#7dafab;font-size:24px;font-weight:600;padding-bottom:5px;text-align:center;">Inscription confirm&eacute;e</td></tr>
<!-- Title EN -->
<tr><td style="color:#7dafab;font-size:20px;font-weight:500;padding-bottom:25px;text-align:center;opacity:0.9;">Registration Confirmed</td></tr>

<!-- Greeting FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Cher&middot;e <strong>' . $prenom . '</strong>,</td></tr>
<!-- Greeting EN -->
<tr><td style="padding-bottom:20px;font-size:15px;opacity:0.85;">Dear <strong>' . $prenom . '</strong>,</td></tr>

<!-- Body text FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Nous avons bien re&ccedil;u votre demande d&#8217;inscription.</td></tr>
<!-- Body text EN -->
<tr><td style="padding-bottom:25px;font-size:15px;opacity:0.85;">We have successfully received your registration application.</td></tr>

<!-- Info box -->
<tr><td style="padding:20px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f4d5;border-left:4px solid #7dafab;">
<tr><td style="padding:20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Box title FR -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:16px;padding-bottom:5px;">Votre candidature</td></tr>
<!-- Box title EN -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:15px;padding-bottom:15px;opacity:0.85;">Your application</td></tr>
<!-- Application number FR/EN -->
<tr><td style="padding:6px 0;font-size:14px;"><span style="color:#64748b;">Num&eacute;ro de candidature | Application number:</span> <strong>#' . $id . '</strong></td></tr>
<!-- CNOA FR/EN -->
<tr><td style="padding:6px 0;font-size:14px;"><span style="color:#64748b;">Num&eacute;ro CNOA | CNOA number:</span> <strong>' . $num . '</strong></td></tr>
<!-- Email -->
<tr><td style="padding:6px 0;font-size:14px;"><span style="color:#64748b;">Email:</span> <strong>' . $email . '</strong></td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Next steps title FR -->
<tr><td style="color:#7dafab;font-size:18px;font-weight:600;padding:30px 0 5px 0;border-bottom:2px solid #f8b200;">Prochaines &eacute;tapes</td></tr>
<!-- Next steps title EN -->
<tr><td style="color:#7dafab;font-size:17px;font-weight:500;padding:5px 0 15px 0;opacity:0.9;">Next steps</td></tr>

<!-- Step 1 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>1</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">V&eacute;rification d&#8217;&eacute;ligibilit&eacute; (48&ndash;72h)</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Eligibility verification (48&ndash;72h)</td></tr>

<!-- Step 2 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>2</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">Email avec lien unique pour soumettre votre projet.</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Email with a unique link to submit your project</td></tr>

<!-- Step 3 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>3</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">Acc&egrave;s au formulaire de soumission.</td></tr>
<tr><td style="padding:0 0 15px 20px;font-size:14px;opacity:0.85;">Access to the submission form.</td></tr>

<!-- Note FR -->
<tr><td style="font-size:13px;color:#64748b;padding:25px 0 3px 0;">Veuillez surveiller votre bo&icirc;te de r&eacute;ception (y compris les courriers ind&eacute;sirables).</td></tr>
<!-- Note EN -->
<tr><td style="font-size:13px;color:#64748b;padding:0 0 30px 0;">Please monitor your inbox (including your spam folder).</td></tr>

<!-- Signature FR -->
<tr><td style="padding:10px 0 3px 0;font-size:15px;">Cordialement,</td></tr>
<!-- Signature EN -->
<tr><td style="padding:0 0 8px 0;font-size:15px;opacity:0.85;">Best regards,</td></tr>
<!-- Team name FR -->
<tr><td style="padding:0;font-size:15px;"><strong>L&#8217;&eacute;quipe du Prix Fondation Jardin Majorelle</strong></td></tr>
<!-- Team name EN -->
<tr><td style="padding:0;font-size:15px;opacity:0.85;"><strong>The Jardin Majorelle Fondation Prize Team</strong></td></tr>

</table>
</td></tr>
</table>';

    return ['subject' => $subject, 'body' => emailWrap($inner, 'Prix Fondation Jardin Majorelle 2026')];
}

/**
 * Jury registration notification email - French only
 */
function getJuryRegistrationEmail($data) {
    $id     = htmlspecialchars($data['candidat_id']);
    $prenom = htmlspecialchars($data['prenom']);
    $nom    = htmlspecialchars($data['nom']);
    $email  = htmlspecialchars($data['email']);
    $ecole  = htmlspecialchars($data['ecole_archi']);
    $diplome= htmlspecialchars($data['diplome']);
    $annee  = htmlspecialchars($data['annee_obtention']);
    $num    = htmlspecialchars($data['num_ordre']);
    $link   = htmlspecialchars($data['validation_link']);

    $subject = "[JURY] Nouvelle Candidature #$id – $prenom $nom";

    $inner = '
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:35px 30px;font-family:Georgia,\'Times New Roman\',serif;color:#1e293b;line-height:1.7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="color:#7dafab;font-size:22px;font-weight:600;padding-bottom:20px;">' . $prenom . ' ' . $nom . '</td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
<tr><td style="padding:12px 0;color:#64748b;width:40%;border-bottom:1px solid #e2e8f0;">N&deg; de candidature</td><td style="padding:12px 0;font-weight:600;border-bottom:1px solid #e2e8f0;">#' . $id . '</td></tr>
<tr><td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">Email</td><td style="padding:12px 0;font-weight:600;border-bottom:1px solid #e2e8f0;">' . $email . '</td></tr>
<tr><td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">&Eacute;cole</td><td style="padding:12px 0;font-weight:600;border-bottom:1px solid #e2e8f0;">' . $ecole . '</td></tr>
<tr><td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">Dipl&ocirc;me</td><td style="padding:12px 0;font-weight:600;border-bottom:1px solid #e2e8f0;">' . $diplome . ' (' . $annee . ')</td></tr>
<tr><td style="padding:12px 0;color:#64748b;">CNOA</td><td style="padding:12px 0;font-weight:600;">' . $num . '</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:35px 0 10px 0;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="' . $link . '" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="16%" fillcolor="#f8b200" stroke="f">
<w:anchorlock/><center style="color:#2d2d2d;font-family:Georgia,serif;font-size:15px;font-weight:bold;">EXAMINER LA CANDIDATURE</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="' . $link . '" style="background:#f8b200;color:#2d2d2d;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;font-family:Georgia,\'Times New Roman\',serif;">EXAMINER LA CANDIDATURE</a>
<!--<![endif]-->
</td></tr>
</table>
</td></tr>
</table>';

    return ['subject' => $subject, 'body' => emailWrap($inner, 'Nouvelle Candidature Reçue')];
}
?>
