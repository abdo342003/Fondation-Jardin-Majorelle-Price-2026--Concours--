import { useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line react/prop-types
export default function Step2({ token }) {
  const [files, setFiles] = useState({
    bio: null,
    note: null,
    aps: null
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [msg, setMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState('');
  const [fileErrors, setFileErrors] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Effet confetti pour le succès
  useEffect(() => {
    if (status === 'success') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Validation des tailles de fichier
  const validateFileSize = (file, maxSizeMB, name) => {
    if (!file) return { valid: false, error: `Le fichier ${name} est requis.` };
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { 
        valid: false, 
        error: `Le fichier ${name} dépasse la taille maximale de ${maxSizeMB} Mo (Taille actuelle: ${(file.size / (1024 * 1024)).toFixed(2)} Mo).` 
      };
    }
    
    if (file.size === 0) {
      return { valid: false, error: `Le fichier ${name} est vide.` };
    }
    
    if (file.type !== 'application/pdf') {
      return { valid: false, error: `Le fichier ${name} doit être au format PDF.` };
    }
    
    return { valid: true };
  };

  // Gestion du drag & drop
  const handleDrag = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(name);
    } else if (e.type === "dragleave") {
      setDragActive('');
    }
  };

  const handleDrop = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0], name);
    }
  };

  const handleFileSelection = (file, name) => {
    const maxSizes = { bio: 2, note: 2, aps: 10 };
    const labels = { bio: 'Biographie', note: "Note d'intention", aps: 'APS' };
    
    const validation = validateFileSize(file, maxSizes[name], labels[name]);
    
    if (validation.valid) {
      setFiles({ ...files, [name]: file });
      setFileErrors({ ...fileErrors, [name]: null });
      setStatus(null);
      setMsg('');
    } else {
      setFileErrors({ ...fileErrors, [name]: validation.error });
      setFiles({ ...files, [name]: null });
    }
  };

  const handleFile = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file, name);
    }
  };

  const removeFile = (name) => {
    setFiles({ ...files, [name]: null });
    setFileErrors({ ...fileErrors, [name]: null });
    // Réinitialiser l'input file
    const input = document.getElementById(`file-${name}`);
    if (input) {
      input.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setUploadProgress(0);
    setStatus(null);

    // Validation côté client
    const validations = [
      validateFileSize(files.bio, 2, 'Biographie'),
      validateFileSize(files.note, 2, "Note d'intention"),
      validateFileSize(files.aps, 10, 'APS')
    ];

    const firstError = validations.find(v => !v.valid);
    if (firstError) {
      setStatus('error');
      setMsg(firstError.error);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('token', token);
    //formData.append('token', token || "TEST_1234");
    formData.append('bio_file', files.bio);
    formData.append('presentation_file', files.note);
    formData.append('aps_file', files.aps);

    try {
      const apiUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('register.php', 'submit_project.php') 
        : '/api/submit_project.php';

      console.log('📤 Envoi vers:', apiUrl);

      const res = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 60000 // 60 seconds timeout for large files
      });

      console.log('✅ Réponse serveur:', res.data);

      if (res.data.success) {
        setStatus('success');
        setMsg(res.data.message || 'Projet déposé avec succès !');
      } else {
        // Server returned success:false
        setStatus('error');
        setMsg(res.data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('📦 Réponse:', err.response);
      
      setStatus('error');
      
      // Better error handling with specific messages
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || err.response.data?.error;
        
        if (errorMessage) {
          setMsg(errorMessage);
        } else if (err.response.status === 403) {
          setMsg("Accès refusé. Votre lien a peut-être expiré ou a déjà été utilisé.");
        } else if (err.response.status === 413) {
          setMsg("Fichier(s) trop volumineux. Veuillez réduire la taille de vos fichiers.");
        } else if (err.response.status === 500) {
          setMsg("Erreur serveur. Veuillez réessayer dans quelques instants.");
        } else {
          setMsg(`Erreur ${err.response.status}: ${err.response.statusText || 'Erreur inconnue'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setMsg("Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.");
      } else if (err.code === 'ECONNABORTED') {
        setMsg("Le délai d'attente est dépassé. Vérifiez la taille de vos fichiers et réessayez.");
      } else {
        // Something else happened
        setMsg(err.message || "Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Fonction helper pour afficher la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} Mo`;
  };

  // Calcul du pourcentage de complétion
  const completionPercentage = () => {
    const completed = [files.bio, files.note, files.aps].filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  };

  // Composant Confetti
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#D4AF37', '#C19A6B', '#85754E', '#B8860B'][Math.floor(Math.random() * 4)]
            }}
          />
        </div>
      ))}
    </div>
  );

  // Composant FileUploadZone amélioré - Style Élégant
  const FileUploadZone = ({ name, label, maxSize, description, icon, number }) => {
    const file = files[name];
    const error = fileErrors[name];
    const isDragging = dragActive === name;
    
    return (
      <div className={`group bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 ${
        isDragging 
          ? 'border-accent-400 shadow-2xl scale-[1.01] bg-accent-50/50' 
          : error 
            ? 'border-red-300 hover:border-red-400 shadow-lg'
            : file 
              ? 'border-accent-400 shadow-xl bg-gradient-to-br from-white to-accent-50/30' 
              : 'border-sand-300 hover:border-accent-300 hover:shadow-xl'
      }`}
        onDragEnter={(e) => handleDrag(e, name)}
        onDragLeave={(e) => handleDrag(e, name)}
        onDragOver={(e) => handleDrag(e, name)}
        onDrop={(e) => handleDrop(e, name)}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-primary-900 text-lg">{label}</h3>
            <p className="text-xs text-sand-600 mt-0.5 font-medium">PDF • Max {maxSize} Mo</p>
          </div>
          <div className="text-accent-400 opacity-70">
            {icon}
          </div>
        </div>

        {description && (
          <p className="text-sm text-primary-700 mb-4 bg-primary-50/50 p-3 rounded-lg border border-primary-100">{description}</p>
        )}

        {/* Zone de drop / Fichier sélectionné */}
        {!file ? (
          <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            isDragging 
              ? 'border-accent-400 bg-accent-50/50 shadow-inner' 
              : 'border-sand-300 bg-sand-50/30 hover:bg-sand-50/50 hover:border-accent-300'
          }`}>
            <input 
              id={`file-${name}`}
              required 
              type="file" 
              accept="application/pdf" 
              onChange={(e) => handleFile(e, name)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            
            <div className="text-center pointer-events-none">
              <svg className="mx-auto h-14 w-14 text-accent-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-primary-800 font-semibold mb-1">
                <span className="text-accent-600 underline decoration-2">Cliquez pour parcourir</span> ou glissez-déposez
              </p>
              <p className="text-xs text-sand-600">Format PDF uniquement</p>
            </div>
          </div>
        ) : (
          <div className="relative z-20 flex items-center justify-between bg-gradient-to-r from-accent-50 to-amber-50 rounded-xl p-4 border-2 border-accent-300 shadow-md">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center border border-red-200 shadow-sm">
                <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary-900 truncate text-sm">{file.name}</p>
                <p className="text-xs text-accent-700 mt-0.5 font-medium">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile(name);
              }}
              className="relative z-20 ml-3 p-2.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all shadow-sm hover:shadow flex-shrink-0"
              aria-label="Supprimer le fichier"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 flex items-start gap-2 text-red-800 bg-red-50 p-4 rounded-xl border-l-4 border-red-500 animate-shake shadow-md">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  };

  // --- ECRAN SUCCES ÉLÉGANT ---
  if (status === 'success') {
    return (
      <div 
        className="min-h-screen bg-sand-50 flex items-center justify-center p-6 font-sans"
        style={{
            backgroundImage: 'url(/Background.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed'
        }}
      >
        {showConfetti && <Confetti />}

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full p-10 md:p-14 border-2 border-accent-200 animate-fade-in-up">
          {/* Icône de succès */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-400/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-accent-400 via-accent-500 to-amber-500 w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 text-center mb-4">
            Candidature Déposée !
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent mx-auto mb-6"></div>
          
          <p className="text-sand-700 text-center text-lg mb-10">
            Votre projet a été transmis au Jury avec succès
          </p>

          <div className="bg-gradient-to-br from-accent-50 via-amber-50 to-accent-50 p-6 rounded-2xl border-2 border-accent-300 mb-8 shadow-lg">
            <p className="flex items-center justify-center gap-2 text-sm text-[#1d4e89] font-semibold mb-2">
              <svg 
                className="w-5 h-5 text-[#f7b538]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span>Date d&apos;annonce des résultats</span>
            </p>            
            <p className="text-4xl font-bold text-accent-600 text-center">15 Mai 2026</p>
          </div>

          <div className="bg-sand-50 p-6 rounded-2xl mb-8 border border-sand-200">
            <h3 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Prochaines étapes
            </h3>
            <ul className="space-y-3 text-sm text-sand-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Votre dossier sera évalué par le jury d&apos;experts</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Vous recevrez un email de confirmation prochainement</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Les résultats vous seront communiqués par email en mai 2026</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
  
            {/* Container des Boutons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              
              {/* Bouton Principal : Retour Accueil */}
              <button 
                onClick={() => window.location.href = '/'}
                className="group relative inline-flex items-center justify-center gap-3 bg-[#1d4e89] text-white font-bold px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#1d4e89]/30 hover:-translate-y-1 focus:ring-4 focus:ring-[#1d4e89]/20 w-full sm:w-auto"
              >
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 w-3 bg-white/20 skew-x-[45deg] -translate-x-32 group-hover:translate-x-72 transition-transform duration-700 ease-in-out"></div>
                
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour à l'accueil</span>
              </button>
              
              {/* Bouton Secondaire : Imprimer */}
              <button 
                onClick={() => window.print()}
                className="group inline-flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-[#f7b538] hover:text-[#1d4e89] transition-all duration-300 hover:shadow-md hover:-translate-y-1 focus:ring-4 focus:ring-gray-100 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#f7b538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimer le reçu</span>
              </button>
            </div>

            {/* Info Box "Conseil" */}
            <div className="mt-10 flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-lg max-w-lg text-sm text-[#1d4e89]/80">
              <svg className="w-5 h-5 text-[#1d4e89] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                <span className="font-semibold block mb-1 text-[#1d4e89]">Conseil de sécurité</span>
                Nous vous recommandons de sauvegarder cette page ou d'en faire une capture d'écran pour vos archives personnelles.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULAIRE DEPOT (AVEC BACKGROUND) ---
  return (
    <div 
        className="min-h-screen bg-sand-50 py-12 md:py-20 px-4 md:px-6 font-sans"
        style={{
            backgroundImage: 'url(/Background.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed'
        }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec progression */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-accent-200 p-8 md:p-12 mb-6 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-100 to-amber-100 text-accent-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-accent-300 shadow-lg mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Étape Finale
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mb-3">
              Dépôt du Projet
            </h1>
            <p className="text-sand-600 text-lg">Veuillez soumettre vos documents techniques</p>
          </div>

          {/* Barre de progression améliorée */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-primary-800">Progression</span>
              <span className="text-sm font-bold text-accent-600">{completionPercentage()}%</span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 transition-all duration-500 ease-out shadow-md"
                style={{ width: `${completionPercentage()}%` }}
              >
              </div>
            </div>
            <p className="text-xs text-sand-600 mt-2 text-center font-medium">
              {completionPercentage() === 100 ? '✓ Tous les fichiers sont prêts' : `${[files.bio, files.note, files.aps].filter(Boolean).length} / 3 fichiers chargés`}
            </p>
          </div>

          {/* Message d'erreur global */}
          {status === 'error' && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-600 p-5 rounded-r-xl animate-shake shadow-lg">
              <div className="flex items-start">
                <svg className="w-7 h-7 text-red-600 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1.5">Erreur de soumission</h3>
                  <p className="text-sm text-red-800">{msg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Zones de upload */}
          <FileUploadZone 
            name="bio"
            label="Biographie"
            maxSize={2}
            icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            number={1}
          />

          <FileUploadZone 
            name="note"
            label="Note d'intention"
            maxSize={2}
            icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            number={2}
          />

          <FileUploadZone 
            name="aps"
            label="Avant-Projet Sommaire (APS)"
            maxSize={10}
            description="Le dossier doit inclure : Esquisse, Plan masse, Coupes, Façades"
            icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 10h10M7 14h7" /></svg>}
            number={3}
          />

          {/* Barre de progression pendant l'upload - Toujours visible quand loading */}
          {loading && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-accent-300 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-bold text-primary-900">Envoi en cours...</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-amber-600 bg-clip-text text-transparent">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-sand-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="h-4 rounded-full bg-gradient-to-r from-accent-400 via-accent-500 to-amber-500 transition-all duration-300 shadow-md" 
                  style={{ width: `${uploadProgress}%` }}
                >
                </div>
              </div>
              <p className="text-xs text-sand-600 mt-3 text-center font-medium">Veuillez patienter, téléchargement en cours...</p>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-sand-200 p-8 shadow-xl">
            <button 
              disabled={loading || !files.bio || !files.note || !files.aps} 
              type="submit" 
              className="w-full bg-gradient-to-r from-accent-500 via-accent-600 to-amber-600 hover:from-accent-600 hover:via-accent-700 hover:to-amber-700 text-black font-bold py-5 px-8 rounded-xl shadow-2xl hover:shadow-accent-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider text-sm flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ENVOI EN COURS...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>CONFIRMER LE DÉPÔT DU PROJET</span>
                </>
              )}
            </button>

            {(!files.bio || !files.note || !files.aps) && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sand-700">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">Veuillez sélectionner tous les fichiers pour continuer</p>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="mt-6 pt-6 border-t border-sand-200">
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-primary-800 hover:text-primary-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations importantes
                  </span>
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-primary-700 space-y-2 bg-sand-50 p-4 rounded-lg border border-sand-200">
                  <p>• Tous les fichiers doivent être au format PDF</p>
                  <p>• Taille maximale : 2 Mo pour bio et note, 10 Mo pour APS</p>
                  <p>• Assurez-vous que vos fichiers sont lisibles et complets</p>
                  <p>• Une fois soumis, vous ne pourrez plus modifier votre candidature</p>
                </div>
              </details>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}