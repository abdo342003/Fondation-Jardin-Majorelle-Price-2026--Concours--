import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// eslint-disable-next-line react/prop-types
export default function Step2({ token }) {
  const { i18n } = useTranslation();
  
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
    formData.append('language', i18n.language);

    try {
      const apiUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('register.php', 'submit_project.php') 
        : '/api/submit_project.php';

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
              backgroundColor: ['#c98f00', '#d1cdb2', '#a67800', '#fff9d4'][Math.floor(Math.random() * 4)]
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
    
    // Define icon colors based on field type - Sand/Mustard gold scheme
    const iconStyles = {
      bio: { background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)' },
      note: { background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)' },
      aps: { background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)' }
    };
    
    return (
      <div className={`group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
        isDragging 
          ? 'scale-[1.01]' 
          : error 
            ? 'hover:border-red-500'
            : file 
              ? '' 
              : ''
      }`}
        style={{
          background: '#fff9d4',
          borderColor: isDragging ? '#c98f00' : error ? '#ef4444' : file ? '#c98f00' : 'rgba(61, 104, 99, 0.2)'
        }}
        onDragEnter={(e) => handleDrag(e, name)}
        onDragLeave={(e) => handleDrag(e, name)}
        onDragOver={(e) => handleDrag(e, name)}
        onDrop={(e) => handleDrop(e, name)}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div>
            <h3 className="font-bold text-base sm:text-lg" style={{color: '#3d6863'}}>{label}</h3>
            <p className="text-[10px] sm:text-xs mt-0.5 font-medium" style={{color: '#3d6863', opacity: 0.7}}>PDF • Max {maxSize} Mo</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg" style={iconStyles[name]}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              {name === 'bio' && <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              {name === 'note' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              {name === 'aps' && <><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10M7 14h7" /></>}
            </svg>
          </div>
        </div>

        {description && (
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg" style={{color: '#3d6863', opacity: 0.8, background: 'rgba(201, 143, 0, 0.1)', border: '1px solid rgba(201, 143, 0, 0.3)'}}>{description}</p>
        )}

        {/* Zone de drop / Fichier sélectionné */}
        {!file ? (
          <div className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-8 transition-all ${
            isDragging 
              ? 'shadow-inner' 
              : ''
          }`}
            style={{
              background: 'white',
              borderColor: isDragging ? '#c98f00' : 'rgba(61, 104, 99, 0.3)'
            }}
          >
            <input 
              id={`file-${name}`}
              required 
              type="file" 
              accept="application/pdf" 
              onChange={(e) => handleFile(e, name)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            
            <div className="text-center pointer-events-none">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-semibold mb-1">
                <span className="underline decoration-2" style={{color: '#c98f00'}}>Cliquez pour parcourir</span> <span className="hidden sm:inline" style={{color: '#3d6863', opacity: 0.7}}>ou glissez-déposez</span>
              </p>
              <p className="text-[10px] sm:text-xs" style={{color: '#3d6863', opacity: 0.6}}>Format PDF uniquement</p>
            </div>
          </div>
        ) : (
          <div className="relative z-20 flex items-center justify-between rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-lg" style={{background: 'white', borderColor: '#c98f00'}}>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-md" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-xs sm:text-sm" style={{color: '#3d6863'}}>{file.name}</p>
                <p className="text-[10px] sm:text-xs mt-0.5 font-medium" style={{color: '#c98f00'}}>✓ {formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile(name);
              }}
              className="relative z-20 ml-2 sm:ml-3 p-2 sm:p-2.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all shadow-sm hover:shadow flex-shrink-0"
              aria-label="Supprimer le fichier"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative"
        style={{
            background: '#3d6863',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1cdb2' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {showConfetti && <Confetti />}

        <div className="rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 md:p-10 lg:p-14 border animate-fade-in-up" style={{background: '#fff9d4', borderColor: 'rgba(61, 104, 99, 0.2)'}}>
          {/* Icône de succès */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping" style={{background: 'rgba(201, 143, 0, 0.2)'}}></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 50%, #8a6600 100%)'}}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center mb-3 sm:mb-4" style={{color: '#3d6863'}}>
            Candidature Déposée !
          </h2>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <div className="w-10 sm:w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to right, transparent, #c98f00)'}}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{background: '#c98f00'}}></div>
            <div className="w-10 sm:w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to left, transparent, #c98f00)'}}></div>
          </div>
          
          <p className="text-center text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 px-2" style={{color: '#3d6863', opacity: 0.7}}>
            Votre projet a été transmis au Jury avec succès
          </p>

          <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-lg" style={{background: 'rgba(201, 143, 0, 0.1)', border: '2px solid rgba(201, 143, 0, 0.3)'}}>
            <p className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold mb-2" style={{color: '#3d6863', opacity: 0.8}}>
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="#c98f00"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span>Date d&apos;annonce des résultats</span>
            </p>            
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-center" style={{color: '#c98f00'}}>15 Mai 2026</p>
          </div>

          <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8" style={{background: 'rgba(201, 143, 0, 0.1)', border: '2px solid rgba(201, 143, 0, 0.3)'}}>
            <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base" style={{color: '#3d6863', opacity: 0.9}}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              Prochaines étapes
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm" style={{color: '#3d6863', opacity: 0.8}}>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Votre dossier sera évalué par le jury d&apos;experts</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span>Vous recevrez un email de confirmation prochainement</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Les résultats vous seront communiqués par email en mai 2026</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-6 sm:mt-8 animate-fade-in-up">
  
            {/* Container des Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center">
              
              {/* Bouton Principal : Retour Accueil */}
              <button 
                onClick={() => window.location.href = '/'}
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:ring-4 w-full sm:w-auto text-sm sm:text-base tracking-widest"
                style={{background: '#c98f00', boxShadow: '0 4px 6px rgba(201, 143, 0, 0.3)'}}
              >
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 w-3 bg-white/20 skew-x-[45deg] -translate-x-32 group-hover:translate-x-72 transition-transform duration-700 ease-in-out"></div>
                
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour à l'accueil</span>
              </button>
              
              {/* Bouton Secondaire : Imprimer */}
              <button 
                onClick={() => window.print()}
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 focus:ring-4 w-full sm:w-auto text-sm sm:text-base"
                style={{color: '#3d6863', borderColor: 'rgba(61, 104, 99, 0.3)'}}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="#c98f00">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimer le reçu</span>
              </button>
            </div>

            {/* Info Box "Conseil" */}
            <div className="mt-6 sm:mt-10 flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg max-w-lg text-xs sm:text-sm" style={{background: 'rgba(201, 143, 0, 0.1)', border: '2px solid rgba(201, 143, 0, 0.3)', color: '#3d6863', opacity: 0.8}}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>
                <span className="font-semibold block mb-1" style={{color: '#0050AA'}}>Conseil de sécurité</span>
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
        className="min-h-screen py-8 sm:py-12 md:py-20 px-3 sm:px-4 md:px-6 font-sans relative"
        style={{
            background: '#3d6863',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1cdb2' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec progression */}
        <div className="rounded-2xl sm:rounded-3xl shadow-2xl border border-[#3d6863]/20 p-5 sm:p-8 md:p-12 mb-4 sm:mb-6 animate-fade-in-up" style={{background: '#fff9d4'}}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg mb-4 sm:mb-6" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Étape Finale
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3" style={{color: '#3d6863'}}>
              Dépôt du Projet
            </h1>
            <p className="text-sm sm:text-base md:text-lg" style={{color: '#3d6863', opacity: 0.7}}>Veuillez soumettre vos documents techniques</p>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
              <div className="w-10 sm:w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to right, transparent, #c98f00)'}}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{background: '#c98f00'}}></div>
              <div className="w-10 sm:w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to left, transparent, #c98f00)'}}></div>
            </div>
          </div>

          {/* Barre de progression améliorée */}
          <div className="max-w-md mx-auto px-2">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-bold" style={{color: '#3d6863', opacity: 0.8}}>Progression</span>
              <span className="text-xs sm:text-sm font-bold" style={{color: '#c98f00'}}>{completionPercentage()}%</span>
            </div>
            <div className="w-full rounded-full h-2.5 sm:h-3.5 overflow-hidden shadow-inner" style={{background: 'rgba(61, 104, 99, 0.3)'}}>
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out shadow-md"
                style={{ 
                  width: `${completionPercentage()}%`,
                  background: 'linear-gradient(90deg, #c98f00 0%, #a67800 50%, #8a6600 100%)'
                }}
              >
              </div>
            </div>
            <p className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 text-center font-medium" style={{color: '#3d6863', opacity: 0.7}}>
              {completionPercentage() === 100 ? '✓ Tous les fichiers sont prêts' : `${[files.bio, files.note, files.aps].filter(Boolean).length} / 3 fichiers chargés`}
            </p>
          </div>

          {/* Message d'erreur global */}
          {status === 'error' && (
            <div className="mt-4 sm:mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-600 p-3 sm:p-5 rounded-r-lg sm:rounded-r-xl animate-shake shadow-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-red-600 flex-shrink-0 mr-2 sm:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1 sm:mb-1.5 text-sm sm:text-base">Erreur de soumission</h3>
                  <p className="text-xs sm:text-sm text-red-800">{msg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
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
            <div className="rounded-xl sm:rounded-2xl border border-[#3d6863]/20 p-4 sm:p-6 shadow-xl" style={{background: '#fff9d4'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #c98f00 0%, #a67800 100%)'}}>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold" style={{color: '#3d6863', opacity: 0.8}}>Envoi en cours...</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold" style={{color: '#c98f00'}}>{uploadProgress}%</span>
              </div>
              <div className="w-full rounded-full h-3 sm:h-4 overflow-hidden shadow-inner" style={{background: 'rgba(61, 104, 99, 0.3)'}}>
                <div 
                  className="h-3 sm:h-4 rounded-full transition-all duration-300 shadow-md" 
                  style={{ 
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, #c98f00 0%, #a67800 50%, #8a6600 100%)'
                  }}
                >
                </div>
              </div>
              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 text-center font-medium" style={{color: '#3d6863', opacity: 0.7}}>Veuillez patienter, téléchargement en cours...</p>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#3d6863]/20 p-5 sm:p-6 md:p-8 shadow-xl" style={{background: '#fff9d4'}}>
            <button 
              disabled={loading || !files.bio || !files.note || !files.aps} 
              type="submit" 
              className="w-full text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-lg sm:rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3"
              style={{
                background: (loading || !files.bio || !files.note || !files.aps) 
                  ? '#9CA3AF' 
                  : '#c98f00'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ENVOI EN COURS...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">CONFIRMER LE DÉPÔT DU PROJET</span>
                  <span className="sm:hidden">CONFIRMER LE DÉPÔT</span>
                </>
              )}
            </button>

            {(!files.bio || !files.note || !files.aps) && (
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{color: '#c98f00'}} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm font-medium text-center" style={{color: '#3d6863', opacity: 0.7}}>Veuillez sélectionner tous les fichiers pour continuer</p>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{borderTop: '1px solid rgba(61, 104, 99, 0.2)'}}>
              <details className="group">
                <summary className="cursor-pointer text-xs sm:text-sm font-semibold flex items-center justify-between" style={{color: '#3d6863', opacity: 0.8}}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{color: '#c98f00'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations importantes
                  </span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg" style={{color: '#3d6863', opacity: 0.8, background: 'rgba(201, 143, 0, 0.1)', border: '1px solid rgba(201, 143, 0, 0.3)'}}>
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