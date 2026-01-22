import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Import des logos (Assure-toi qu'ils sont dans src/assets/)
import logoJardin from './assets/logo_jardin.png';
import logoYSL from './assets/logo_ysl.png';

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
    phone_code: '+212',
    phone_number: '',
    ecole_archi: '',
    annee_obtention: '',
    num_ordre: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Enhanced CSS classes for consistent styling
  const labelClass = "block text-sand-800 font-semibold mb-2 text-sm uppercase tracking-wider";
  const inputClass = "w-full px-5 py-4 border-2 border-sand-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 font-sans";
  const sectionTitleClass = "flex items-center mb-6 pb-3 border-b-2 border-primary-100";
  const sectionNumberClass = "w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-4";
  const sectionHeaderClass = "text-2xl font-serif font-bold text-primary-800";

  // --- LOGIQUE ---
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file && file.size > maxSize) {
      setError("Le fichier dépasse la taille maximale autorisée (5 Mo). / File exceeds maximum size (5 MB).");
      e.target.value = '';
      return;
    }
    
    setFormData({ ...formData, [e.target.name]: file });
  };

  const validateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate age
    const age = validateAge(formData.date_naissance);
    if (age >= 40) {
      setError("Vous devez avoir moins de 40 ans pour participer. / You must be under 40 years old to participate.");
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
    });

    try {
      // URL API - Uses environment variable
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost/concours-api/register.php';
      const response = await axios.post(apiUrl, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(true);
        window.scrollTo(0, 0);
      } else {
        setError(response.data.message || t('messages.error'));
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion. Veuillez réessayer.");
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans selection:bg-primary-100 selection:text-primary-900" style={{backgroundImage: 'url(/Background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      
      {/* --- HEADER LOGOS (Style Luxe) --- */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            
            {/* Logo Jardin Majorelle (Gauche) */}
            <div className="flex-shrink-0">
                <img src={logoJardin} alt="Jardin Majorelle" className="h-16 md:h-20 w-auto object-contain hover:scale-105 transition-transform" />
            </div>

            {/* Titre & Langue (Centre) */}
            <div className="flex flex-col items-center text-center mx-4">
                 {/* Boutons Langue */}
                 <div className="flex space-x-2 text-xs mb-2">
                    <button onClick={() => changeLanguage('fr')} className={`px-2 py-0.5 rounded ${i18n.language === 'fr' ? 'bg-primary-600 text-white font-bold' : 'text-sand-500 hover:text-primary-600'}`}>FR</button>
                    <span className="text-sand-300">|</span>
                    <button onClick={() => changeLanguage('en')} className={`px-2 py-0.5 rounded ${i18n.language === 'en' ? 'bg-primary-600 text-white font-bold' : 'text-sand-500 hover:text-primary-600'}`}>EN</button>
                </div>
                <h1 className="font-serif font-bold text-primary-800 text-sm md:text-lg tracking-widest uppercase hidden md:block">
                    {t('title')}
                </h1>
            </div>

            {/* Logo YSL (Droite) */}
            <div className="flex-shrink-0">
                 <img src={logoYSL} alt="Musée YSL" className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform" />
            </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-800/80 to-primary-700/75 z-10"></div>
        <div className="absolute inset-0 bg-[url('/Background.png')] bg-cover bg-center opacity-20 z-0"></div>
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-block">
            <span className="text-sm uppercase tracking-[0.3em] font-sans text-sand-100 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">
              {i18n.language === 'fr' ? 'Concours National 2026' : 'National Competition 2026'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-5xl md:text-7xl mb-6 animate-fade-in-up leading-tight">
            {t('hero.title')}
          </h1>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed text-sand-50">
            {t('hero.description')}
          </p>
          <a href="#inscription" className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold px-12 py-5 rounded-full shadow-2xl hover:shadow-accent-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 uppercase tracking-[0.2em] text-sm">
            {t('hero.cta')}
          </a>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section className="bg-white/95 backdrop-blur-sm py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm uppercase tracking-[0.3em] font-sans text-primary-600 mb-4 block">
              {i18n.language === 'fr' ? 'À Propos' : 'About'}
            </span>
            <h2 className="font-serif font-bold text-5xl text-primary-800 mb-4">
              {t('about.title')}
            </h2>
            <div className="w-20 h-1 bg-accent-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group bg-gradient-to-br from-white to-sand-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sand-100 hover:border-primary-200">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-primary-700 mb-4">
                {t('about.challenge')}
              </h3>
              <p className="text-sand-700 leading-relaxed">
                {t('about.challengeDesc')}
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-sand-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sand-100 hover:border-primary-200">
              <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent-200 transition-colors">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-primary-700 mb-4">
                {t('about.why')}
              </h3>
              <p className="text-sand-700 leading-relaxed">
                {t('about.whyDesc')}
              </p>
            </div>
          </div>

          {/* Eligibility & Calendar */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-10 rounded-2xl border-l-4 border-primary-600 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">✓</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-primary-800">
                  {t('about.eligibility')}
                </h3>
              </div>
              <ul className="space-y-3">
                {t('about.eligibilityItems', { returnObjects: true }).map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-primary-600 mr-3 font-bold">•</span>
                    <span className="text-sand-800 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 p-10 rounded-2xl border-l-4 border-accent-600 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📅</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-accent-800">
                  {t('calendar.title')}
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start text-sand-800">
                  <span className="text-2xl mr-3">📅</span>
                  <span className="leading-relaxed">{t('calendar.announcement')}</span>
                </li>
                <li className="flex items-start text-sand-800">
                  <span className="text-2xl mr-3">⏱️</span>
                  <span className="leading-relaxed font-bold text-accent-700">{t('calendar.deadline')}</span>
                </li>
                <li className="flex items-start text-sand-800">
                  <span className="text-2xl mr-3">🏆</span>
                  <span className="leading-relaxed">{t('calendar.selection')}</span>
                </li>
                <li className="flex items-start text-sand-800">
                  <span className="text-2xl mr-3">🎉</span>
                  <span className="leading-relaxed">{t('calendar.opening')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main id="inscription" className="max-w-3xl mx-auto p-6 my-8">
        
        {/* Titre Mobile (Visible seulement sur petit écran) */}
        <div className="text-center md:hidden mb-8">
            <h1 className="font-serif font-bold text-primary-800 text-xl tracking-widest uppercase">
                 {t('title')}
            </h1>
        </div>

        {/* --- ÉCRAN SUCCÈS --- */}
        {success ? (
            <div className="bg-gradient-to-br from-white to-accent-50/30 border-t-4 border-accent-500 p-12 md:p-16 rounded-2xl shadow-2xl text-center animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-100 rounded-full filter blur-3xl opacity-20 -z-10"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-primary-800 mb-4">
                    {t('messages.success')}
                </h2>
                <p className="text-sand-700 mb-6 leading-relaxed">
                    {t('messages.successDetail')}
                </p>
                <div className="bg-primary-50 p-6 rounded-lg mb-6">
                    <h3 className="font-serif font-bold text-primary-800 mb-3">
                        {t('messages.nextStep')}
                    </h3>
                    <p className="text-sand-700 text-sm leading-relaxed">
                        {t('messages.nextStepDetail')}
                    </p>
                </div>
                <button onClick={() => window.location.reload()} className="text-primary-600 underline hover:text-primary-800 font-medium">
                    Retour à l'accueil
                </button>
            </div>
        ) : (
            
            /* --- FORMULAIRE --- */
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border-t-4 border-primary-600 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full filter blur-3xl opacity-30 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50 rounded-full filter blur-3xl opacity-30 -z-10"></div>
                
                {/* Section Header - Now Inside White Card for Maximum Readability */}
                <div className="text-center mb-12 pb-8 border-b-2 border-sand-100">
                    <span className="text-sm uppercase tracking-[0.3em] font-sans text-primary-600 mb-4 block">
                      {i18n.language === 'fr' ? 'Inscription' : 'Registration'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-800 mb-4">
                        {t('step1')}
                    </h2>
                    <div className="w-20 h-1 bg-accent-500 mx-auto mb-6"></div>
                    <p className="text-sand-800 text-xl font-light mb-6 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                    <p className="text-sand-700 text-base max-w-2xl mx-auto leading-relaxed mb-8">
                        {t('intro')}
                    </p>
                    <div className="inline-block bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-4 rounded-full shadow-lg">
                        <p className="text-white font-bold text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('deadline')}
                        </p>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                        🚨 {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* 1. Identité */}
                    <div>
                        <div className={sectionTitleClass}>
                            <div className={sectionNumberClass}>
                                <span className="text-white font-bold">1</span>
                            </div>
                            <h3 className={sectionHeaderClass}>Identité / Identity</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.nom')} *</label>
                                <input required type="text" name="nom" onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.prenom')} *</label>
                                <input required type="text" name="prenom" onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className={labelClass}>{t('fields.naissance')} *</label>
                            <input required type="date" name="date_naissance" onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    {/* 2. Documents (CIN) */}
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-8 rounded-2xl border-l-4 border-primary-600 shadow-lg">
                        <div className="flex items-center mb-6">
                            <div className={sectionNumberClass}>
                                <span className="text-white font-bold">2</span>
                            </div>
                            <h3 className={sectionHeaderClass}>
                                {t('fields.cin')} *
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-primary-800 uppercase mb-3 tracking-wider">Recto</label>
                                <input required type="file" name="cin_recto" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="block w-full text-sm text-sand-600 border-2 border-dashed border-primary-300 rounded-xl p-4 bg-white hover:bg-primary-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary-800 uppercase mb-3 tracking-wider">Verso</label>
                                <input required type="file" name="cin_verso" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="block w-full text-sm text-sand-600 border-2 border-dashed border-primary-300 rounded-xl p-4 bg-white hover:bg-primary-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer transition-all" />
                            </div>
                        </div>
                        <div className="bg-white/70 p-4 rounded-lg border-l-4 border-primary-500">
                            <p className="text-sm text-primary-800 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {t('messages.fileSize')}
                            </p>
                        </div>
                    </div>

                    {/* 3. Contact */}
                    <div>
                        <div className={sectionTitleClass}>
                            <div className={sectionNumberClass}>
                                <span className="text-white font-bold">3</span>
                            </div>
                            <h3 className={sectionHeaderClass}>Contact</h3>
                        </div>
                        <div className="mb-6">
                            <label className={labelClass}>{t('fields.adresse')} *</label>
                            <textarea required name="adresse" rows="3" onChange={handleChange} className={inputClass}></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.email')} *</label>
                                <input required type="email" name="email" onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.phone')} *</label>
                                <div className="flex">
                                    <select name="phone_code" onChange={handleChange} className="px-4 py-4 border-2 border-r-0 border-sand-200 rounded-l-xl bg-sand-50 text-sm font-bold text-primary-700 outline-none focus:border-primary-500">
                                        <option value="+212">🇲🇦 +212</option>
                                        <option value="+33">🇫🇷 +33</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    <input required type="tel" name="phone_number" onChange={handleChange} className={`${inputClass} rounded-l-none border-l-0`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Statut */}
                    <div>
                        <div className={sectionTitleClass}>
                            <div className={sectionNumberClass}>
                                <span className="text-white font-bold">4</span>
                            </div>
                            <h3 className={sectionHeaderClass}>Statut Professionnel</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.ecole')} *</label>
                                <input required type="text" name="ecole_archi" onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.annee')} *</label>
                                <input required type="number" name="annee_obtention" onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className={labelClass}>{t('fields.ordre')} (CNOA) *</label>
                            <input required type="text" name="num_ordre" onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    {/* Bouton Envoi */}
                    <div className="pt-10 mt-10 border-t-2 border-sand-100">
                        <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold py-5 px-8 rounded-full shadow-2xl hover:shadow-accent-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm relative overflow-hidden group">
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                            <span className="relative flex items-center justify-center">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('buttons.sending')}
                                    </>
                                ) : (
                                    <>
                                        {t('buttons.verify')}
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="text-center text-sm text-sand-600 mt-6 leading-relaxed">
                            {t('messages.footer')}
                        </p>
                    </div>

                </form>
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-serif font-bold text-xl">
                  FONDATION JARDIN MAJORELLE
                </h3>
              </div>
              <p className="text-sand-100 leading-relaxed text-sm">
                {i18n.language === 'fr' ? 
                  "Institution culturelle dédiée à la botanique, aux cultures berbères, à la mode, aux arts décoratifs et à la création contemporaine." :
                  "Cultural institution dedicated to botany, Berber cultures, fashion, decorative arts and contemporary creation."
                }
              </p>
            </div>
            
            {/* Contact */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-serif font-bold text-xl">
                  Contact
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-sand-100 hover:text-white transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {t('contact.email')}
                </li>
                <li className="flex items-center text-sand-100 hover:text-white transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  {t('contact.website')}
                </li>
                <li className="flex items-start text-sand-100">
                  <svg className="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('contact.location')}</span>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="font-serif font-bold text-xl">
                  {i18n.language === 'fr' ? 'Informations Légales' : 'Legal Information'}
                </h3>
              </div>
              <p className="text-sand-100 text-sm leading-relaxed">
                {i18n.language === 'fr' ?
                  "Ce concours est organisé par la Fondation Jardin Majorelle conformément à la réglementation en vigueur. Les données collectées sont utilisées uniquement dans le cadre du concours." :
                  "This competition is organized by the Fondation Jardin Majorelle in accordance with current regulations. Data collected is used solely for competition purposes."
                }
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/20">
            <div className="text-center">
              <p className="text-sand-200 text-sm mb-3">
                © {new Date().getFullYear()} Fondation Jardin Majorelle - {i18n.language === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
              </p>
              <p className="text-sand-300 text-xs">
                Prix Fondation Jardin Majorelle pour la Conception du Nouveau Pavillon Temporaire de la Villa Oasis
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;