import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// LES TEXTES (FR & EN)
// Copié directement de l'email du client
const resources = {
  fr: {
    translation: {
      title: "Fondation Jardin Majorelle Prize",
      subtitle: "Concours National – Pavillon Temporaire de la Villa Oasis",
      hero: {
        title: "Entre Tradition et Avant-Garde",
        description: "Le Jardin Majorelle lance le concours national pour la conception du second Pavillon Temporaire de la Villa Oasis",
        cta: "S'INSCRIRE"
      },
      intro: "Jeunes architectes marocain.e.s de moins de 40 ans, le Jardin Majorelle vous invite à imaginer le second pavillon temporaire de la Villa Oasis. Une opportunité unique d'inscrire votre créativité dans l'un des lieux les plus emblématiques du Royaume.",
      deadline: "Date limite d'inscription : 15 avril 2026",
      step1: "Étape 1 : Pré-inscription",
      step2: "Étape 2 : Candidature Complète",
      about: {
        title: "Le Concours",
        context: "Cette initiative s'inscrit dans le sillage vibrant du centenaire du Jardin Majorelle. Le concours 2026 invite les candidats à imaginer le successeur du premier pavillon : une œuvre capable de dialoguer avec l'histoire tout en répondant aux enjeux architecturaux de demain.",
        challenge: "Le Défi : Une Écriture Architecturale entre Nature et Éphémère",
        challengeDesc: "Ce concours s'adresse exclusivement aux jeunes architectes marocain.e.s diplômé.e.s de moins de 40 ans. Le cahier des charges invite à une réflexion fondée sur une intégration harmonieuse au cœur de la luxuriance végétale du jardin, sur une approche écologique rigoureuse, et sur la capacité à susciter l'émotion.",
        why: "Pourquoi Participer ?",
        whyDesc: "Être lauréat de ce concours, c'est inscrire son nom dans l'histoire du Jardin Majorelle. C'est bénéficier d'une visibilité médiatique nationale et internationale et voir sa vision se concrétiser dans un cadre prestigieux.",
        eligibility: "Critères d'Éligibilité",
        eligibilityItems: [
          "Architectes marocain.e.s diplômé.e.s",
          "Âge : Moins de 40 ans",
          "Inscription au CNOA requise"
        ]
      },
      fields: {
        nom: "Nom",
        prenom: "Prénom(s)",
        naissance: "Date de naissance",
        cin: "Carte d'identité nationale (Recto/Verso)",
        adresse: "Adresse postale",
        email: "Email",
        phone: "Téléphone",
        diplome: "Diplôme d'architecte",
        ecole: "École d'architecture",
        annee: "Année d'obtention du diplôme",
        ordre: "Numéro d'inscription au CNOA"
      },
      buttons: {
        verify: "VALIDER MA PRÉ-INSCRIPTION",
        upload: "Télécharger",
        next: "Suivant",
        sending: "Envoi en cours..."
      },
      messages: {
        success: "Pré-inscription Validée !",
        successDetail: "Votre candidature a été enregistrée avec succès. Nous avons bien reçu vos informations d'identité et de parcours. Vous recevrez prochainement par email un lien pour soumettre votre dossier complet.",
        nextStep: "Prochaine étape : Dossier Complet",
        nextStepDetail: "Un email de confirmation vous a été envoyé avec les instructions pour la phase 2 (à envoyer avant le 15 avril 2026 à concours2026@jardinmajorelle.com).",
        error: "Erreur lors de l'envoi. Veuillez réessayer.",
        footer: "En validant, vous acceptez le règlement du concours Fondation Jardin Majorelle Prize 2026.",
        fileSize: "Formats acceptés : PDF, JPG, PNG. Taille max : 5 Mo par fichier."
      },
      calendar: {
        title: "Calendrier du Concours",
        announcement: "Annonce officielle : 30 janvier 2026",
        deadline: "Date limite de candidature : 15 avril 2026",
        selection: "Sélection du projet gagnant : 15 mai 2026",
        opening: "Ouverture du Pavillon : 30 septembre 2026"
      },
      contact: {
        title: "Contact",
        email: "concours2026@jardinmajorelle.com",
        website: "info@jardinmajorelle.com",
        social: "@jardinmajorellemarrakech"
      },
      footer: {
        copyright: "© 2026 Fondation Jardin Majorelle. Tous droits réservés.",
        legal: "Mentions légales"
      }
    }
  },
  en: {
    translation: {
      title: "Fondation Jardin Majorelle Prize",
      subtitle: "National Competition – Villa Oasis Temporary Pavilion",
      hero: {
        title: "Between Tradition and Avant-Garde",
        description: "Jardin Majorelle launches the national competition for the design of the second Temporary Pavilion at Villa Oasis",
        cta: "REGISTER"
      },
      intro: "Young Moroccan architects under 40, Jardin Majorelle invites you to design the second temporary pavilion of Villa Oasis. A unique opportunity to showcase your creativity in one of the Kingdom's most iconic locations.",
      deadline: "Registration deadline: April 15, 2026",
      step1: "Step 1: Pre-registration",
      step2: "Step 2: Full Application",
      about: {
        title: "The Competition",
        context: "This initiative follows the vibrant celebration of Jardin Majorelle's centenary. The 2026 competition invites candidates to imagine the successor to the first pavilion: a work capable of dialoguing with history while addressing tomorrow's architectural challenges.",
        challenge: "The Challenge: Architectural Expression between Nature and Ephemeral",
        challengeDesc: "This competition is exclusively for young Moroccan architects under 40. The specifications invite reflection based on harmonious integration within the garden's lush vegetation, a rigorous ecological approach, and the ability to evoke emotion.",
        why: "Why Participate?",
        whyDesc: "Being the winner of this competition means inscribing your name in the history of Jardin Majorelle. It means benefiting from national and international media visibility and seeing your vision realized in a prestigious setting.",
        eligibility: "Eligibility Criteria",
        eligibilityItems: [
          "Moroccan licensed architects",
          "Age: Under 40 years old",
          "CNOA registration required"
        ]
      },
      fields: {
        nom: "Last Name",
        prenom: "First Name(s)",
        naissance: "Date of Birth",
        cin: "National Identity Card (Front/Back)",
        adresse: "Postal Address",
        email: "Email",
        phone: "Phone",
        diplome: "Architecture Degree",
        ecole: "School of Architecture",
        annee: "Graduation Year",
        ordre: "CNOA Registration Number"
      },
      buttons: {
        verify: "VALIDATE PRE-REGISTRATION",
        upload: "Upload",
        next: "Next",
        sending: "Sending..."
      },
      messages: {
        success: "Pre-registration Validated!",
        successDetail: "Your application has been successfully registered. We have received your identity and background information. You will soon receive an email with a link to submit your complete application.",
        nextStep: "Next Step: Complete Application",
        nextStepDetail: "A confirmation email has been sent with instructions for phase 2 (to be submitted before April 15, 2026 to concours2026@jardinmajorelle.com).",
        error: "Submission error. Please try again.",
        footer: "By validating, you accept the regulations of the Fondation Jardin Majorelle Prize 2026 competition.",
        fileSize: "Accepted formats: PDF, JPG, PNG. Max size: 5 MB per file."
      },
      calendar: {
        title: "Competition Calendar",
        announcement: "Official announcement: January 30, 2026",
        deadline: "Application deadline: April 15, 2026",
        selection: "Winner selection: May 15, 2026",
        opening: "Pavilion opening: September 30, 2026"
      },
      contact: {
        title: "Contact",
        email: "concours2026@jardinmajorelle.com",
        website: "info@jardinmajorelle.com",
        social: "@jardinmajorellemarrakech"
      },
      footer: {
        copyright: "© 2026 Fondation Jardin Majorelle. All rights reserved.",
        legal: "Legal Notice"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr", // Langue par défaut
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;