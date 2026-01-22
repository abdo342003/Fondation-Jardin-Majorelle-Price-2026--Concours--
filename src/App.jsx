import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logo from './assets/logo.png'; // Assure-toi d'avoir un logo ou retire cette ligne

function App() {
  const { t, i18n } = useTranslation();

  // --- STATE ---
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    cin_recto: null,
    cin_verso: null,
    adresse: '',
    email: '',
    phone_code: '+212', // Par défaut Maroc
    phone_number: '',
    ecole_archi: '',
    annee_obtention: '',
    num_ordre: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIQUE ---

  // Changer de langue (FR <-> EN)
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Gestion des champs textes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion des fichiers (CIN Recto/Verso)
  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  // Envoi du formulaire (Vers register.php)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Création de l'objet FormData pour l'envoi de fichiers
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
    });

    try {
      // URL de ton API PHP (à adapter selon ton hébergement)
      const response = await axios.post('http://localhost/concours-api/register.php', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || t('messages.error'));
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#Fdfbf7] text-[#003366] font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-[#0055B8] text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="font-bold text-lg leading-tight">
                {t('title').toUpperCase()}
            </div>
            <div className="flex space-x-2 text-sm">
                <button 
                    onClick={() => changeLanguage('fr')} 
                    className={`px-3 py-1 rounded transition-colors ${i18n.language === 'fr' ? 'bg-white text-[#0055B8] font-bold' : 'bg-[#004494] text-gray-200'}`}
                >
                    FR
                </button>
                <button 
                    onClick={() => changeLanguage('en')} 
                    className={`px-3 py-1 rounded transition-colors ${i18n.language === 'en' ? 'bg-white text-[#0055B8] font-bold' : 'bg-[#004494] text-gray-200'}`}
                >
                    EN
                </button>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-3xl mx-auto p-6 my-8">
        
        {/* TITRE ET SOUS-TITRE */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#0055B8] mb-2">{t('step1')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* --- MESSAGE SUCCÈS --- */}
        {success ? (
            <div className="bg-white border-l-4 border-green-500 p-10 rounded-xl shadow-lg text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📩</span>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-4">
                    {t('messages.success')}
                </h2>
                <p className="text-gray-600 mb-6">
                    Votre dossier d'inscription a bien été reçu. Vous recevrez bientôt un email confirmant votre éligibilité.
                </p>
                <button onClick={() => window.location.reload()} className="text-[#0055B8] underline hover:text-blue-800">
                    Retour à l'accueil
                </button>
            </div>
        ) : (
            
            /* --- FORMULAIRE --- */
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        🚨 {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* BLOC 1 : IDENTITÉ */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
                            1. Identité / Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.nom')} *</label>
                                <input required type="text" name="nom" onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.prenom')} *</label>
                                <input required type="text" name="prenom" onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">{t('fields.naissance')} *</label>
                            <input required type="date" name="date_naissance" onChange={handleChange} 
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                        </div>
                    </div>

                    {/* BLOC 2 : CIN (DOCUMENTS) */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-4">
                        <h3 className="text-sm font-bold text-[#0055B8] uppercase tracking-wider">
                            2. {t('fields.cin')} *
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">Formats: JPG, PNG, PDF (Max 5Mo)</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase">Recto</label>
                                <input required type="file" name="cin_recto" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} 
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0055B8] hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase">Verso</label>
                                <input required type="file" name="cin_verso" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} 
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0055B8] hover:file:bg-blue-100" />
                            </div>
                        </div>
                    </div>

                    {/* BLOC 3 : CONTACT */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
                            3. Contact
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold mb-1">{t('fields.adresse')} *</label>
                            <textarea required name="adresse" rows="2" onChange={handleChange} 
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.email')} *</label>
                                <input required type="email" name="email" onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.phone')} *</label>
                                <div className="flex">
                                    <select name="phone_code" onChange={handleChange} className="p-3 border border-gray-300 rounded-l bg-gray-50 text-sm">
                                        <option value="+212">🇲🇦 +212</option>
                                        <option value="+33">🇫🇷 +33</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    <input required type="tel" name="phone_number" placeholder="6 00 00 00 00" onChange={handleChange} 
                                        className="w-full p-3 border border-l-0 border-gray-300 rounded-r focus:ring-2 focus:ring-[#0055B8] outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOC 4 : STATUT PRO */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
                            4. Statut Professionnel / Professional Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.ecole')} *</label>
                                <input required type="text" name="ecole_archi" onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">{t('fields.annee')} *</label>
                                <input required type="number" min="2000" max="2026" name="annee_obtention" onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">{t('fields.ordre')} (CNOA) *</label>
                            <input required type="text" name="num_ordre" onChange={handleChange} 
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0055B8] outline-none" />
                        </div>
                    </div>

                    {/* BOUTON ENVOI */}
                    <div className="pt-4">
                        <button 
                            disabled={loading} 
                            type="submit" 
                            className="w-full bg-[#CC0000] hover:bg-[#aa0000] text-white font-bold py-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                        >
                            {loading ? t('buttons.sending') : t('buttons.verify')}
                        </button>
                    </div>

                </form>
            </div>
        )}
      </main>

      {/* FOOTER SIMPLE */}
      <footer className="bg-gray-100 text-center p-6 text-xs text-gray-500 mt-10">
        &copy; 2026 Fondation Jardin Majorelle. Tous droits réservés.
      </footer>

    </div>
  );
}

export default App;