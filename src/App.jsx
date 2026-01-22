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
const sectionTitleClass = "flex items-center mb-8 pb-3 border-b border-sand-200";
    const sectionNumberClass = "w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mr-4 shadow-lg text-lg font-bold shrink-0";
    const sectionHeaderClass = "text-2xl font-serif font-bold text-primary-800";
    const labelClass = "block text-xs font-bold text-primary-600 uppercase mb-3 tracking-[0.2em]";
    const inputClass = "w-full px-6 py-4 bg-sand-50 border-2 border-sand-200 rounded-xl text-primary-900 font-medium focus:outline-none focus:border-primary-500 focus:bg-white focus:shadow-lg transition-all duration-300 placeholder-sand-400";


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
      {/* 1. Bdelna 'text-white' b 'text-primary-950' f section lfo9 */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center text-primary-950 overflow-hidden">
        
        {/* Gradient: khffefnah chwia bach l'image tban */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent z-10"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/Background.png')] bg-cover bg-center opacity-100 z-0"></div>
        
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-block">
            {/* 2. Badge: Bdelna lwan bach ibanou fouq lbyad (text-primary-800) */}
            <span className="text-sm uppercase tracking-[0.3em] font-sans text-primary-800 bg-primary-900/5 backdrop-blur-sm px-6 py-2 rounded-full border border-primary-900/10">
              {i18n.language === 'fr' ? 'Concours National 2026' : 'National Competition 2026'}
            </span>
          </div>
          
          {/* 3. Titre: Zdna 'text-primary-950' (Noir/Bleu TRES foncé) */}
          <h1 className="font-serif font-bold text-5xl md:text-7xl mb-6 animate-fade-in-up leading-tight text-primary-950 drop-shadow-sm">
            {t('hero.title')}
          </h1>
          
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-8"></div>
          
          {/* 4. Description: Bdelna 'text-sand-50' b 'text-primary-800' (Gris foncé) */}
          <p className="text-xl md:text-2xl font-medium mb-12 max-w-3xl mx-auto leading-relaxed text-primary-800">
            {t('hero.description')}
          </p>
          
          {/* 5. Bouton: Deja bdelnah l 'text-black' */}
          <a href="#inscription" className="inline-block bg-accent-500 hover:bg-accent-600 text-black font-bold px-12 py-5 rounded-full shadow-2xl hover:shadow-accent-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 uppercase tracking-[0.2em] text-sm">
            {t('hero.cta')}
          </a>
        </div>
        
        {/* Flèche en bas: bdelnaha l k7al bach tban */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* CARD 1: Le Défi (Icône Architecture/Bâtiment) */}
            <div className="group bg-gradient-to-br from-white to-sand-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sand-100 hover:border-primary-200">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                {/* Remplacement de l'emoji par SVG Building/Museum */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-2xl text-primary-700 mb-4">
                {t('about.challenge')}
              </h3>
              <p className="text-sand-700 leading-relaxed">
                {t('about.challengeDesc')}
              </p>
            </div>
            
            {/* CARD 2: Pourquoi Participer (Icône Trophée/Étoile) */}
            <div className="group bg-gradient-to-br from-white to-sand-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-sand-100 hover:border-primary-200">
              <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent-200 transition-colors">
                {/* Remplacement de l'emoji par SVG Trophy */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-accent-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v7.125M12 3.75v-1.5" />
                </svg>
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
            
            {/* ELIGIBILITY BLOCK */}
            <div className="group bg-gradient-to-br from-white to-primary-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary-100 hover:border-primary-200 relative overflow-hidden">
              {/* Effet de brillance au survol */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors group-hover:scale-110 transform duration-300">
                    {/* Logo SVG Check Badge - Style unifié avec les cartes du haut */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-primary-700">
                    {t('about.eligibility')}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {t('about.eligibilityItems', { returnObjects: true }).map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary-600 mr-3 font-bold mt-1">
                          {/* Petit point stylisé SVG */}
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                      </span>
                      <span className="text-sand-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CALENDAR BLOCK */}
            <div className="group bg-gradient-to-br from-white to-accent-50 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-accent-100 hover:border-accent-200 relative overflow-hidden">
              {/* Effet de brillance au survol */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-100 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-accent-200 transition-colors group-hover:scale-110 transform duration-300">
                    {/* Logo SVG Calendar - Style unifié avec les cartes du haut */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-accent-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-accent-700">
                    {t('calendar.title')}
                  </h3>
                </div>
              <ul className="space-y-6"> {/* Espacement augmenté pour la timeline */}
                
                {/* 1. ANNONCE - Icône Megaphone */}
                <li className="flex items-center text-sand-800 group">
                  <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-accent-200 text-accent-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0118.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.816 1.035.816 1.73 0 .695-.32 1.3-.816 1.73" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-medium">{t('calendar.announcement')}</span>
                </li>

                {/* 2. DEADLINE - Icône Clock (En gras et couleur accent) */}
                <li className="flex items-center text-accent-700 bg-white/50 p-2 rounded-lg -ml-2">
                  <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-accent-100 border border-accent-300 text-accent-700 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-bold">{t('calendar.deadline')}</span>
                </li>

                {/* 3. SELECTION - Icône Clipboard/List */}
                <li className="flex items-center text-sand-800">
                  <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-accent-200 text-accent-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed">{t('calendar.selection')}</span>
                </li>

                {/* 4. OUVERTURE - Icône Sparkles/Star */}
                <li className="flex items-center text-sand-800">
                  <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-accent-200 text-accent-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed">{t('calendar.opening')}</span>
                </li>

                </ul>
              </div>
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
        /* --- FORMULAIRE D'INSCRIPTION --- */
        <div id="inscription" className="bg-white p-8 md:p-16 rounded-3xl shadow-2xl border-t-8 border-primary-600 animate-fade-in-up relative overflow-hidden max-w-5xl mx-auto -mt-20 z-30">
            
            {/* Décoration d'arrière-plan floue */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full filter blur-[100px] opacity-40 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-50 rounded-full filter blur-[100px] opacity-40 -z-10"></div>
            
            {/* EN-TÊTE DU FORMULAIRE */}
            <div className="text-center mb-16 pb-10 border-b-2 border-sand-100">
                <span className="text-sm uppercase tracking-[0.3em] font-sans text-primary-600 mb-6 block font-bold">
                  {i18n.language === 'fr' ? 'Étape 1' : 'Step 1'}
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mb-6">
                    {t('step1')}
                </h2>
                <div className="w-24 h-1.5 bg-accent-500 mx-auto mb-8 rounded-full"></div>
                
                <p className="text-primary-800 text-xl font-medium mb-6 max-w-2xl mx-auto leading-relaxed">
                    {t('subtitle')}
                </p>
                
                {/* Badge Date Limite */}
                <div className="inline-flex items-center bg-primary-50 border border-primary-100 px-6 py-3 rounded-full mt-4">
                    <svg className="w-5 h-5 mr-3 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-primary-800 font-bold text-sm tracking-wide">
                        {t('deadline')}
                    </span>
                </div>
            </div>
            
            {/* Message d'erreur */}
            {error && (
                <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center shadow-sm">
                    <svg className="w-6 h-6 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* 1. IDENTITÉ */}
                <div>
                    <div className={sectionTitleClass}>
                        <div className={sectionNumberClass}>1</div>
                        <h3 className={sectionHeaderClass}>Identité / Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                            <label className={labelClass}>{t('fields.nom')} *</label>
                            <input required type="text" name="nom" placeholder="Nom de famille" onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="group">
                            <label className={labelClass}>{t('fields.prenom')} *</label>
                            <input required type="text" name="prenom" placeholder="Prénom(s)" onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                    <div className="mt-8 group">
                        <label className={labelClass}>{t('fields.naissance')} *</label>
                        <input required type="date" name="date_naissance" onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                {/* 2. DOCUMENTS (CIN) */}
                <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                    <div className="flex items-center mb-8">
                        <div className={sectionNumberClass}>2</div>
                        <h3 className={sectionHeaderClass}>
                            {t('fields.cin')} *
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-primary-600 uppercase mb-3 tracking-[0.1em]">Recto</label>
                            <div className="relative group">
                                <input required type="file" name="cin_recto" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} 
                                    className="block w-full text-sm text-primary-600 
                                    file:mr-4 file:py-3 file:px-6 
                                    file:rounded-full file:border-0 
                                    file:text-sm file:font-bold 
                                    file:bg-primary-600 file:text-white 
                                    hover:file:bg-primary-700 
                                    cursor-pointer border-2 border-dashed border-primary-200 rounded-xl p-6 bg-white transition-all hover:border-primary-400" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-primary-600 uppercase mb-3 tracking-[0.1em]">Verso</label>
                            <div className="relative group">
                                <input required type="file" name="cin_verso" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} 
                                    className="block w-full text-sm text-primary-600 
                                    file:mr-4 file:py-3 file:px-6 
                                    file:rounded-full file:border-0 
                                    file:text-sm file:font-bold 
                                    file:bg-primary-600 file:text-white 
                                    hover:file:bg-primary-700 
                                    cursor-pointer border-2 border-dashed border-primary-200 rounded-xl p-6 bg-white transition-all hover:border-primary-400" 
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-primary-500 flex items-center justify-center font-medium opacity-80">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t('messages.fileSize')} (PDF, JPG, PNG - Max 5MB)
                    </p>
                </div>

                {/* 3. CONTACT */}
                <div>
                    <div className={sectionTitleClass}>
                        <div className={sectionNumberClass}>3</div>
                        <h3 className={sectionHeaderClass}>Contact</h3>
                    </div>
                    <div className="mb-8">
                        <label className={labelClass}>{t('fields.adresse')} *</label>
                        <textarea required name="adresse" rows="3" placeholder="Votre adresse complète" onChange={handleChange} className={inputClass}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>{t('fields.email')} *</label>
                            <input required type="email" name="email" placeholder="exemple@email.com" onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>{t('fields.phone')} *</label>
                            <div className="flex">
                                <select name="phone_code" onChange={handleChange} className="px-4 py-4 border-2 border-r-0 border-sand-200 rounded-l-xl bg-sand-100 text-sm font-bold text-primary-800 outline-none focus:border-primary-500 min-w-[100px]">
                                    <option value="+212">🇲🇦 +212</option>
                                    <option value="+33">🇫🇷 +33</option>
                                    <option value="other">🌐 Autre</option>
                                </select>
                                <input required type="tel" name="phone_number" placeholder="6 00 00 00 00" onChange={handleChange} className={`${inputClass} rounded-l-none border-l-0`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. STATUT PROFESSIONNEL */}
                <div>
                    <div className={sectionTitleClass}>
                        <div className={sectionNumberClass}>4</div>
                        <h3 className={sectionHeaderClass}>Statut Professionnel</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>{t('fields.ecole')} *</label>
                            <input required type="text" name="ecole_archi" placeholder="Nom de l'école" onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>{t('fields.annee')} *</label>
                            <input required type="number" name="annee_obtention" placeholder="YYYY" min="2000" max="2026" onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                    <div className="mt-8">
                        <label className={labelClass}>{t('fields.ordre')} (CNOA) *</label>
                        <input required type="text" name="num_ordre" placeholder="Numéro d'inscription" onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                {/* BOUTON D'ENVOI */}
                <div className="pt-12 mt-12 border-t border-sand-200">
                    <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black font-bold py-6 px-8 rounded-full shadow-xl hover:shadow-2xl hover:shadow-accent-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm relative overflow-hidden group">
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                        <span className="relative flex items-center justify-center text-base">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('buttons.sending')}
                                </>
                            ) : (
                                <>
                                    {t('buttons.verify')}
                                    <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                    <p className="text-center text-xs text-sand-500 mt-6 font-medium uppercase tracking-widest">
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