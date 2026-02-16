<?php
// api/email_templates_approval.php - Production v4.0
// Approval & Rejection Email Templates - Bilingual FR/EN side-by-side
// Table-based layout with 100% inline styles for email client compatibility

require_once __DIR__ . '/email_templates.php';

/**
 * Get application approval email templates - Vertical FR/EN format
 */
function getApprovalEmailTemplates($language, $data) {
    $prenom = htmlspecialchars($data['prenom']);
    $nom    = htmlspecialchars($data['nom']);
    $id     = htmlspecialchars($data['candidat_id']);
    $num    = htmlspecialchars($data['num_ordre']);
    $email  = htmlspecialchars($data['email']);
    $link   = htmlspecialchars($data['submission_link']);

    $subject = "Candidature Validée | Application Approved – Prix Fondation Jardin Majorelle 2026";

    $inner = '
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:35px 40px;font-family:Georgia,\'Times New Roman\',serif;color:#1e293b;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Title FR -->
<tr><td style="color:#7dafab;font-size:24px;font-weight:600;padding-bottom:5px;text-align:center;">Candidature Valid&eacute;e</td></tr>
<!-- Title EN -->
<tr><td style="color:#7dafab;font-size:20px;font-weight:500;padding-bottom:25px;text-align:center;opacity:0.9;">Application Approved</td></tr>

<!-- Greeting FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Cher&middot;e <strong>' . $prenom . '</strong>,</td></tr>
<!-- Greeting EN -->
<tr><td style="padding-bottom:20px;font-size:15px;opacity:0.85;">Dear <strong>' . $prenom . '</strong>,</td></tr>

<!-- Body text FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">F&eacute;licitations &mdash; votre candidature au Prix Fondation Jardin Majorelle 2026 a &eacute;t&eacute; approuv&eacute;e.</td></tr>
<!-- Body text EN -->
<tr><td style="padding-bottom:25px;font-size:15px;opacity:0.85;">Congratulations &mdash; your application to the Fondation Jardin Majorelle Prize 2026 has been approved.</td></tr>

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

<!-- Button FR -->
<tr><td align="center" style="padding:25px 0 5px 0;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="' . $link . '" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="16%" fillcolor="#f8b200" stroke="f">
<w:anchorlock/><center style="color:#2d2d2d;font-family:Georgia,serif;font-size:15px;font-weight:bold;">ACC&Eacute;DER &Agrave; MON ESPACE</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="' . $link . '" style="background:#f8b200;color:#2d2d2d;padding:16px 35px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;font-family:Georgia,\'Times New Roman\',serif;">ACC&Eacute;DER &Agrave; MON ESPACE</a>
<!--<![endif]-->
</td></tr>
<!-- Button EN -->
<tr><td align="center" style="padding:5px 0 10px 0;opacity:0.85;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="' . $link . '" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="16%" fillcolor="#7dafab" stroke="f">
<w:anchorlock/><center style="color:#ffffff;font-family:Georgia,serif;font-size:15px;font-weight:bold;">ACCESS MY SPACE</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="' . $link . '" style="background:#7dafab;color:#ffffff;padding:16px 35px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;font-family:Georgia,\'Times New Roman\',serif;">ACCESS MY SPACE</a>
<!--<![endif]-->
</td></tr>
<!-- Link warning FR/EN -->
<tr><td align="center" style="font-size:12px;color:#64748b;padding:0 0 25px 0;">&#9888; Lien personnel et unique | Personal and unique link</td></tr>

<!-- Next steps title FR -->
<tr><td style="color:#7dafab;font-size:18px;font-weight:600;padding:30px 0 5px 0;border-bottom:2px solid #f8b200;">Prochaines &eacute;tapes</td></tr>
<!-- Next steps title EN -->
<tr><td style="color:#7dafab;font-size:17px;font-weight:500;padding:5px 0 15px 0;opacity:0.9;">Next steps</td></tr>

<!-- Step 1 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>1</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">Acc&eacute;dez &agrave; votre espace candidat</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Access your candidate space</td></tr>

<!-- Step 2 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>2</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">Pr&eacute;parez vos documents</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Prepare your documents</td></tr>

<!-- Step 3 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>3</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">T&eacute;l&eacute;versez votre projet avant la date limite</td></tr>
<tr><td style="padding:0 0 15px 20px;font-size:14px;opacity:0.85;">Upload your project before the deadline</td></tr>

<!-- Deadline box -->
<tr><td style="padding:25px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff5e6;border-left:4px solid #f8b200;text-align:center;">
<tr><td style="padding:20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Deadline FR -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:16px;padding-bottom:5px;">Date limite de soumission</td></tr>
<!-- Deadline EN -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:15px;padding-bottom:10px;opacity:0.85;">Submission Deadline</td></tr>
<!-- Date -->
<tr><td style="font-size:22px;font-weight:700;color:#f8b200;">15 mars 2026</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Good luck FR -->
<tr><td style="padding:10px 0 3px 0;font-size:15px;">Nous vous souhaitons bonne chance !</td></tr>
<!-- Good luck EN -->
<tr><td style="padding:0 0 25px 0;font-size:15px;opacity:0.85;">We wish you the best of luck!</td></tr>

<!-- Signature FR -->
<tr><td style="padding:10px 0 3px 0;font-size:15px;">Cordialement,</td></tr>
<!-- Signature EN -->
<tr><td style="padding:0 0 8px 0;font-size:15px;opacity:0.85;">Sincerely,</td></tr>
<!-- Team name FR -->
<tr><td style="padding:0;font-size:15px;"><strong>Le Comit&eacute; d&#8217;Organisation</strong></td></tr>
<!-- Team name EN -->
<tr><td style="padding:0;font-size:15px;opacity:0.85;"><strong>The Organizing Committee</strong></td></tr>

</table>
</td></tr>
</table>';

    return [
        'candidateSubject' => $subject,
        'candidateBody'    => emailWrap($inner, 'Candidature Validée', 'Application Approved')
    ];
}

/**
 * Get rejection email templates - Vertical FR/EN format
 */
function getRejectionEmailTemplates($data) {
    $prenom = htmlspecialchars($data['prenom']);
    $nom    = htmlspecialchars($data['nom']);

    $subject = "Information concernant votre candidature | About Your Application – Prix Fondation Jardin Majorelle 2026";

    $inner = '
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:35px 40px;font-family:Georgia,\'Times New Roman\',serif;color:#1e293b;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Title FR -->
<tr><td style="color:#7dafab;font-size:24px;font-weight:600;padding-bottom:5px;text-align:center;">Information concernant votre candidature</td></tr>
<!-- Title EN -->
<tr><td style="color:#7dafab;font-size:20px;font-weight:500;padding-bottom:25px;text-align:center;opacity:0.9;">About Your Application</td></tr>

<!-- Greeting FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Cher(e) <strong>' . $prenom . ' ' . $nom . '</strong>,</td></tr>
<!-- Greeting EN -->
<tr><td style="padding-bottom:20px;font-size:15px;opacity:0.85;">Dear <strong>' . $prenom . ' ' . $nom . '</strong>,</td></tr>

<!-- Body text 1 FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Nous vous remercions de l&#8217;int&eacute;r&ecirc;t port&eacute; au Prix Fondation Jardin Majorelle 2026.</td></tr>
<!-- Body text 1 EN -->
<tr><td style="padding-bottom:20px;font-size:15px;opacity:0.85;">Thank you for your interest in the Fondation Jardin Majorelle Prize 2026.</td></tr>

<!-- Body text 2 FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Apr&egrave;s examen de votre dossier, nous avons le regret de vous informer que votre candidature n&#8217;a pas &eacute;t&eacute; retenue pour cette &eacute;dition.</td></tr>
<!-- Body text 2 EN -->
<tr><td style="padding-bottom:20px;font-size:15px;opacity:0.85;">After review, we regret to inform you that your application has not been selected for this edition.</td></tr>

<!-- Body text 3 FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Nous vous encourageons &agrave; participer aux prochaines &eacute;ditions.</td></tr>
<!-- Body text 3 EN -->
<tr><td style="padding-bottom:30px;font-size:15px;opacity:0.85;">We encourage you to participate in future editions.</td></tr>

<!-- Signature FR -->
<tr><td style="padding:10px 0 3px 0;font-size:15px;">Cordialement,</td></tr>
<!-- Signature EN -->
<tr><td style="padding:0 0 8px 0;font-size:15px;opacity:0.85;">Sincerely,</td></tr>
<!-- Team name FR -->
<tr><td style="padding:0;font-size:15px;"><strong>Le Comit&eacute; d&#8217;Organisation</strong></td></tr>
<!-- Team name EN -->
<tr><td style="padding:0;font-size:15px;opacity:0.85;"><strong>The Organizing Committee</strong></td></tr>

</table>
</td></tr>
</table>';

    return [
        'subject' => $subject,
        'body'    => emailWrap($inner, 'Information sur votre candidature', 'About Your Application')
    ];
}
?>
