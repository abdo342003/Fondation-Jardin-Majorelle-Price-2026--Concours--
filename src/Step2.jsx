import { useState } from 'react';
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

  const handleFile = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [name]: file });
      setStatus(null); // Clear previous errors
      setMsg('');
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
    //formData.append('token', token);
    formData.append('token', token || "TEST_1234");
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
    return `(${mb.toFixed(2)} Mo)`;
  };

  // --- ECRAN SUCCES (AVEC BACKGROUND) ---
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
        <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-xl text-center max-w-2xl border border-sand-200 animate-fade-in-up">
          <div className="text-6xl mb-6">🏛️</div>
          <h2 className="text-3xl font-serif font-bold text-primary-800 mb-4">Candidature Déposée !</h2>
          <p className="text-sand-700 text-lg leading-relaxed">
            Votre projet a été transmis au Jury avec succès.<br/>
            Les résultats seront annoncés le <span className="font-bold text-primary-700">15 Mai 2026</span>.
          </p>
          <div className="mt-8">
             <a href="/" className="text-primary-600 font-bold hover:underline">Retour à l'accueil</a>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULAIRE DEPOT (AVEC BACKGROUND) ---
  return (
    <div 
        className="min-h-screen bg-sand-50 py-20 px-6 font-sans"
        style={{
            backgroundImage: 'url(/Background.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed'
        }}
    >
      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm p-10 md:p-16 rounded-3xl shadow-2xl border-t-8 border-accent-500 animate-fade-in-up">
        
        <div className="text-center mb-12">
            <span className="bg-accent-100 text-accent-800 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-accent-200">
                Étape Finale
            </span>
            <h1 className="text-4xl font-serif font-bold text-primary-900 mt-6 mb-3">Dépôt du Projet</h1>
            <p className="text-sand-600 text-lg">Veuillez soumettre vos documents techniques.</p>
        </div>

        {status === 'error' && (
             <div className="bg-red-50 text-red-800 p-6 rounded-xl mb-8 border-2 border-red-500 shadow-lg animate-shake">
                <div className="flex items-start">
                    <svg className="w-8 h-8 mr-4 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-bold text-lg mb-2 text-red-900">❌ Erreur de soumission</p>
                        <p className="text-base leading-relaxed">{msg}</p>
                        <p className="text-sm mt-3 text-red-700 italic">💡 Conseil : Vérifiez la taille et le format de vos fichiers avant de réessayer.</p>
                    </div>
                </div>
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. BIO */}
            <div className="group bg-white p-6 rounded-xl border border-sand-200 hover:border-primary-300 transition-all hover:shadow-md">
                <label className="block text-primary-800 font-bold mb-3 uppercase tracking-wider text-sm">
                    1. Biographie (PDF - Max 2 Mo)
                </label>
                <input 
                    required 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => handleFile(e, 'bio')} 
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border border-dashed border-primary-200 rounded-xl p-2" 
                />
                {files.bio && (
                    <p className="mt-2 text-xs text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {files.bio.name} {formatFileSize(files.bio.size)}
                    </p>
                )}
            </div>

            {/* 2. NOTE */}
            <div className="group bg-white p-6 rounded-xl border border-sand-200 hover:border-primary-300 transition-all hover:shadow-md">
                <label className="block text-primary-800 font-bold mb-3 uppercase tracking-wider text-sm">
                    2. Note d&apos;intention (PDF - Max 2 Mo)
                </label>
                <input 
                    required 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => handleFile(e, 'note')}
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border border-dashed border-primary-200 rounded-xl p-2" 
                />
                {files.note && (
                    <p className="mt-2 text-xs text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {files.note.name} {formatFileSize(files.note.size)}
                    </p>
                )}
            </div>

            {/* 3. APS */}
            <div className="group bg-primary-50/50 p-8 rounded-xl border border-primary-200 hover:border-primary-400 transition-all hover:shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">3</div>
                    <label className="block text-primary-900 font-bold text-lg">Avant-Projet Sommaire (APS)</label>
                </div>
                <p className="text-sm text-primary-600 mb-6 ml-14">Le dossier doit inclure : Esquisse, Plan masse, Coupes, Façades. (PDF - Max 10 Mo)</p>
                
                <input 
                    required 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => handleFile(e, 'aps')}
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border-2 border-dashed border-primary-300 bg-white rounded-xl p-4 ml-0 md:ml-12 hover:bg-white/80 transition-colors" 
                />
                {files.aps && (
                    <p className="mt-2 ml-0 md:ml-12 text-xs text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {files.aps.name} {formatFileSize(files.aps.size)}
                    </p>
                )}
            </div>

            {/* Progress bar during upload */}
            {loading && uploadProgress > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-700">Envoi en cours...</span>
                        <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <button 
                disabled={loading || !files.bio || !files.note || !files.aps} 
                type="submit" 
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black font-bold py-6 px-8 rounded-full shadow-xl hover:shadow-2xl hover:shadow-accent-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-[0.2em] text-sm mt-8"
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ENVOI EN COURS...
                    </span>
                ) : 'CONFIRMER LE DÉPÔT DU PROJET'}
            </button>

            {!files.bio || !files.note || !files.aps ? (
                <p className="text-center text-sm text-sand-500 italic">Veuillez sélectionner tous les fichiers pour continuer</p>
            ) : null}
        </form>

      </div>
    </div>
  );
}