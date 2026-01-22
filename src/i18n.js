import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// LES TEXTES (FR & EN)
// Copié directement de l'email du client
const resources = {
  fr: {
    translation: {
      title: "Prix Fondation Jardin Majorelle 2026",
      subtitle: "Concours pour jeunes architectes",
      step1: "Inscription",
      step2: "Candidature",
      fields: {
        nom: "Nom",
        prenom: "Prénom",
        naissance: "Date de naissance",
        cin: "Carte d'identité nationale (Recto/Verso)",
        adresse: "Adresse postale",
        email: "Email",
        phone: "Téléphone",
        diplome: "Diplôme d'architecte",
        ecole: "École d'architecture",
        annee: "Année d'obtention",
        ordre: "Numéro d'inscription à l'Ordre (CNOA)"
      },
      buttons: {
        verify: "S'inscrire",
        upload: "Télécharger",
        next: "Suivant",
        sending: "Envoi en cours..."
      },
      messages: {
        success: "Inscription reçue ! Un email de confirmation vous a été envoyé.",
        error: "Erreur lors de l'envoi."
      }
    }
  },
  en: {
    translation: {
      title: "Fondation Jardin Majorelle Prize 2026",
      subtitle: "Competition for young architects",
      step1: "Registration",
      step2: "Application",
      fields: {
        nom: "Last Name",
        prenom: "First Name",
        naissance: "Date of birth",
        cin: "National Identity Card (Recto/Verso)",
        adresse: "Postal address",
        email: "Email",
        phone: "Phone",
        diplome: "Architectural Degree",
        ecole: "School of Architecture",
        annee: "Graduation year",
        ordre: "Registration number (CNOA)"
      },
      buttons: {
        verify: "Register",
        upload: "Upload",
        next: "Next",
        sending: "Sending..."
      },
      messages: {
        success: "Registration received! A confirmation email has been sent.",
        error: "Error sending data."
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