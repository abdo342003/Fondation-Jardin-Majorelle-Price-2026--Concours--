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

  const handleFile = (e, name) => {
    setFiles({ ...files, [name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const formData = new FormData();
    formData.append('token', token);
    formData.append('bio_file', files.bio);
    formData.append('presentation_file', files.note);
    formData.append('aps_file', files.aps);

    try {
      const apiUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('register.php', 'submit_project.php') 
        : 'http://localhost:8000/submit_project.php';

      const res = await axios.post(apiUrl, formData);

      if (res.data.success) {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
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
             <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 border-l-4 border-red-500 flex items-center shadow-sm">
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {msg}
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. BIO */}
            <div className="group bg-white p-6 rounded-xl border border-sand-200 hover:border-primary-300 transition-all hover:shadow-md">
                <label className="block text-primary-800 font-bold mb-3 uppercase tracking-wider text-sm">1. Biographie (PDF - Max 1 Mo)</label>
                <input required type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'bio')} 
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border border-dashed border-primary-200 rounded-xl p-2" />
            </div>

            {/* 2. NOTE */}
            <div className="group bg-white p-6 rounded-xl border border-sand-200 hover:border-primary-300 transition-all hover:shadow-md">
                <label className="block text-primary-800 font-bold mb-3 uppercase tracking-wider text-sm">2. Note d'intention (PDF - Max 1 Mo)</label>
                <input required type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'note')}
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border border-dashed border-primary-200 rounded-xl p-2" />
            </div>

            {/* 3. APS */}
            <div className="group bg-primary-50/50 p-8 rounded-xl border border-primary-200 hover:border-primary-400 transition-all hover:shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">3</div>
                    <label className="block text-primary-900 font-bold text-lg">Avant-Projet Sommaire (APS)</label>
                </div>
                <p className="text-sm text-primary-600 mb-6 ml-14">Le dossier doit inclure : Esquisse, Plan masse, Coupes, Façades. (Max 10 Mo)</p>
                
                <input required type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'aps')}
                    className="block w-full text-sm text-sand-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer border-2 border-dashed border-primary-300 bg-white rounded-xl p-4 ml-0 md:ml-12 hover:bg-white/80 transition-colors" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black font-bold py-6 px-8 rounded-full shadow-xl hover:shadow-2xl hover:shadow-accent-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm mt-8">
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ENVOI EN COURS...
                    </span>
                ) : 'CONFIRMER LE DÉPÔT DU PROJET'}
            </button>
        </form>

      </div>
    </div>
  );
}