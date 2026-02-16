<?php
// api/email_templates_step2.php - Production v4.0
// Project Submission Email Templates (Step 2) - Bilingual FR/EN side-by-side
// Table-based layout with 100% inline styles for email client compatibility

require_once __DIR__ . '/email_templates.php';

/**
 * Get project submission confirmation email templates (Step 2)
 */
function getProjectSubmissionEmailTemplates($language, $data) {
    $candidateEmail = getProjectEmail($data);
    $juryEmail = getJuryProjectEmail($data);

    return [
        'candidateSubject' => $candidateEmail['subject'],
        'candidateBody'    => $candidateEmail['body'],
        'jurySubject'      => $juryEmail['subject'],
        'juryBody'         => $juryEmail['body']
    ];
}

/**
 * Candidate project submission confirmation - Vertical FR/EN format
 */
function getProjectEmail($data) {
    $prenom = htmlspecialchars($data['prenom']);
    $nom    = htmlspecialchars($data['nom']);

    $subject = "Projet Déposé | Project Submitted – Prix Fondation Jardin Majorelle 2026";

    $inner = '
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:35px 40px;font-family:Georgia,\'Times New Roman\',serif;color:#1e293b;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Title FR -->
<tr><td style="color:#7dafab;font-size:24px;font-weight:600;padding-bottom:5px;text-align:center;">Projet D&eacute;pos&eacute;</td></tr>
<!-- Title EN -->
<tr><td style="color:#7dafab;font-size:20px;font-weight:500;padding-bottom:25px;text-align:center;opacity:0.9;">Project Submitted</td></tr>

<!-- Congratulations FR -->
<tr><td style="padding-bottom:5px;font-size:16px;">F&eacute;licitations <strong>' . $prenom . ' ' . $nom . '</strong> !</td></tr>
<!-- Congratulations EN -->
<tr><td style="padding-bottom:20px;font-size:16px;opacity:0.85;">Congratulations <strong>' . $prenom . ' ' . $nom . '</strong>!</td></tr>

<!-- Body text FR -->
<tr><td style="padding-bottom:5px;font-size:15px;">Votre dossier de candidature complet a &eacute;t&eacute; re&ccedil;u avec succ&egrave;s.</td></tr>
<!-- Body text EN -->
<tr><td style="padding-bottom:25px;font-size:15px;opacity:0.85;">Your complete application has been successfully received.</td></tr>

<!-- Success box -->
<tr><td style="padding:20px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e6f4f1;border-left:4px solid #7dafab;">
<tr><td style="padding:20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- Box title FR -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:16px;padding-bottom:5px;">&check; Confirmation de R&eacute;ception</td></tr>
<!-- Box title EN -->
<tr><td style="font-weight:600;color:#2d2d2d;font-size:15px;padding-bottom:15px;opacity:0.85;">&check; Confirmation of Receipt</td></tr>
<!-- Documents intro FR -->
<tr><td style="font-size:14px;padding-bottom:3px;">Tous vos documents ont &eacute;t&eacute; transmis au jury :</td></tr>
<!-- Documents intro EN -->
<tr><td style="font-size:14px;padding-bottom:12px;opacity:0.85;">All your documents have been forwarded to the jury:</td></tr>
<!-- Document 1 FR -->
<tr><td style="font-size:14px;padding:3px 0 2px 15px;">&#8226; Biographie professionnelle (PDF)</td></tr>
<!-- Document 1 EN -->
<tr><td style="font-size:14px;padding:0 0 8px 15px;opacity:0.85;">&#8226; Professional Biography (PDF)</td></tr>
<!-- Document 2 FR -->
<tr><td style="font-size:14px;padding:3px 0 2px 15px;">&#8226; Note d&#8217;intention (PDF)</td></tr>
<!-- Document 2 EN -->
<tr><td style="font-size:14px;padding:0 0 8px 15px;opacity:0.85;">&#8226; Statement of Intent (PDF)</td></tr>
<!-- Document 3 FR -->
<tr><td style="font-size:14px;padding:3px 0 2px 15px;">&#8226; Avant-Projet Sommaire &ndash; APS (PDF)</td></tr>
<!-- Document 3 EN -->
<tr><td style="font-size:14px;padding:0 0 5px 15px;opacity:0.85;">&#8226; Preliminary Draft Project &ndash; APS (PDF)</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Next steps title FR -->
<tr><td style="color:#7dafab;font-size:18px;font-weight:600;padding:30px 0 5px 0;border-bottom:2px solid #f8b200;">Prochaines &Eacute;tapes</td></tr>
<!-- Next steps title EN -->
<tr><td style="color:#7dafab;font-size:17px;font-weight:500;padding:5px 0 15px 0;opacity:0.9;">Next Steps</td></tr>

<!-- Step 1 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>1</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">&Eacute;tude de votre dossier par le jury</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Review of your application by the jury</td></tr>

<!-- Step 2 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>2</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">&Eacute;valuation des projets selon les crit&egrave;res</td></tr>
<tr><td style="padding:0 0 12px 20px;font-size:14px;opacity:0.85;">Evaluation of projects according to criteria</td></tr>

<!-- Step 3 FR -->
<tr><td style="padding:8px 0 3px 0;font-size:14px;"><strong>3</strong></td></tr>
<tr><td style="padding:0 0 3px 20px;font-size:14px;">Annonce des r&eacute;sultats (date communiqu&eacute;e ult&eacute;rieurement)</td></tr>
<tr><td style="padding:0 0 15px 20px;font-size:14px;opacity:0.85;">Announcement of results (date to be communicated later)</td></tr>

<!-- Note FR -->
<tr><td style="font-size:14px;color:#64748b;padding:25px 0 3px 0;">Nous vous souhaitons bonne chance pour la suite du concours !</td></tr>
<!-- Note EN -->
<tr><td style="font-size:14px;color:#64748b;padding:0 0 30px 0;">We wish you the best of luck in the competition!</td></tr>

<!-- Signature FR -->
<tr><td style="padding:10px 0 3px 0;font-size:15px;">Cordialement,</td></tr>
<!-- Signature EN -->
<tr><td style="padding:0 0 8px 0;font-size:15px;opacity:0.85;">Best regards,</td></tr>
<!-- Team name FR -->
<tr><td style="padding:0;font-size:15px;"><strong>L&#8217;&eacute;quipe du Prix</strong></td></tr>
<!-- Team name EN -->
<tr><td style="padding:0;font-size:15px;opacity:0.85;"><strong>The Prize Team</strong></td></tr>

</table>
</td></tr>
</table>';

    return ['subject' => $subject, 'body' => emailWrap($inner, 'Projet Déposé avec Succès', 'Project Submitted Successfully')];
}

/**
 * Jury project notification - French only
 */
function getJuryProjectEmail($data) {
    $id     = htmlspecialchars($data['id']);
    $prenom = htmlspecialchars($data['prenom']);
    $nom    = htmlspecialchars($data['nom']);
    $email  = htmlspecialchars($data['email']);
    $ecole  = htmlspecialchars($data['ecole_archi']);
    $diplome= htmlspecialchars($data['diplome']);
    $annee  = htmlspecialchars($data['annee_obtention']);
    $num    = htmlspecialchars($data['num_ordre']);
    $bioUrl = htmlspecialchars($data['bioUrl'] ?? '#');
    $noteUrl= htmlspecialchars($data['noteUrl'] ?? '#');
    $apsUrl = htmlspecialchars($data['apsUrl'] ?? '#');
    $cinR   = htmlspecialchars($data['cinRectoUrl'] ?? '#');
    $cinV   = htmlspecialchars($data['cinVersoUrl'] ?? '#');

    $subject = "[JURY] Nouveau Dossier Complet #$id – $prenom $nom";

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
<!-- Documents -->
<tr><td style="padding:25px 0 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f4d5;border-left:4px solid #f8b200;">
<tr><td style="padding:18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-weight:600;color:#2d2d2d;font-size:15px;padding-bottom:15px;">&#128193; Documents Soumis</td></tr>
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="padding:5px;"><a href="' . $bioUrl . '" style="display:inline-block;background:#7dafab;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif;">Biographie</a></td>
<td style="padding:5px;"><a href="' . $noteUrl . '" style="display:inline-block;background:#7dafab;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif;">Note d&#8217;intention</a></td>
<td style="padding:5px;"><a href="' . $apsUrl . '" style="display:inline-block;background:#7dafab;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif;">APS</a></td>
</tr>
<tr>
<td style="padding:5px;"><a href="' . $cinR . '" style="display:inline-block;background:#7dafab;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif;">CIN Recto</a></td>
<td style="padding:5px;"><a href="' . $cinV . '" style="display:inline-block;background:#7dafab;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif;">CIN Verso</a></td>
<td></td>
</tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>';

    return ['subject' => $subject, 'body' => emailWrap($inner, 'Nouveau Dossier Complet')];
}
?>
