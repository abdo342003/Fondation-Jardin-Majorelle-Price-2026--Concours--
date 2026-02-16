// Script utilitaire pour gérer la maintenance
// Vous pouvez utiliser ces fonctions dans la console du navigateur

import { setMaintenanceMode, updateProgressPercentage, updateMaintenanceMessages } from './maintenanceConfig';

// Exposer les fonctions globalement pour faciliter les tests
window.maintenanceUtils = {
  // Activer la maintenance
  enable: () => {
    setMaintenanceMode(true);
    window.location.reload();
  },
  
  // Désactiver la maintenance
  disable: () => {
    setMaintenanceMode(false);
    window.location.reload();
  },
  
  // Mettre à jour le pourcentage de progression
  setProgress: (percentage) => {
    updateProgressPercentage(percentage);
    console.log(`Progression mise à jour à ${percentage}%`);
  },
  
  // Instructions d'utilisation
  help: () => {
    console.log(`
🔧 MAINTENANCE UTILS 🔧

Commands disponibles:
- maintenanceUtils.enable()     : Activer la maintenance
- maintenanceUtils.disable()    : Désactiver la maintenance
- maintenanceUtils.setProgress(60) : Définir la progression (0-100)
- maintenanceUtils.help()       : Afficher cette aide

Méthodes via fichier .env:
1. Modifier VITE_MAINTENANCE_MODE=true dans .env
2. Redémarrer le serveur de développement

Méthodes via configuration:
1. Modifier enabled: true dans maintenanceConfig.js
2. Recharger la page
    `);
  }
};

// Afficher l'aide au démarrage en mode développement
if (import.meta.env.DEV) {
  console.log('🔧 Maintenance Utils chargé ! Tapez maintenanceUtils.help() pour voir les commandes disponibles.');
}