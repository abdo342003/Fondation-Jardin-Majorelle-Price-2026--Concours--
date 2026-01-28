
import Step2 from './Step2';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Import du logo
import logo from './assets/Logo-removebg-preview.png';

function App() {
  const { t, i18n } = useTranslation();
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  if (token) {
      return <Step2 token={token} />;
  }
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
    diplome: '',
    annee_obtention: '',
    num_ordre: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // useRef for smooth scrolling to error message
  const errorMessageRef = useRef(null);
  const formTopRef = useRef(null);

  // Refs for file inputs (to programmatically reset them)
  const cinRectoInputRef = useRef(null);
  const cinVersoInputRef = useRef(null);

  // Enhanced CSS classes for consistent styling
  const labelClass = "block text-primary-900 font-bold mb-3 text-sm uppercase tracking-wider";
  const inputClass = "w-full px-5 py-4 border-2 border-sand-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 hover:border-sand-300 transition-all duration-200 font-sans bg-white shadow-sm";
  const sectionTitleClass = "flex items-center mb-6 pb-3 border-b-2 border-primary-100";
  const sectionNumberClass = "w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-4";
  const sectionHeaderClass = "text-2xl font-serif font-bold text-primary-800";

  // --- CUSTOM FILE UPLOAD COMPONENT ---
  const CustomFileUpload = ({ label, name, file, inputRef, required = true }) => {
    const handleFileSelect = (e) => {
      const selectedFile = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (selectedFile && selectedFile.size > maxSize) {
        setError("Le fichier dépasse la taille maximale autorisée (5 Mo). / File exceeds maximum size (5 MB).");
        e.target.value = '';
        if (errorMessageRef.current) {
          errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      setFormData({ ...formData, [name]: selectedFile });
    };

    const handleRemoveFile = () => {
      setFormData({ ...formData, [name]: null });
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <div>
        <label className="block text-base font-bold text-primary-900 uppercase mb-3 tracking-wider">
          {label} {required && <span className="text-accent-600">*</span>}
        </label>
        
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          required={required && !file}
        />
        
        {/* Custom UI */}
        {!file ? (
          // EMPTY STATE - Clickable dashed box
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-primary-400 rounded-xl p-8 bg-gradient-to-br from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 cursor-pointer transition-all duration-300 text-center group hover:border-primary-600 hover:shadow-lg"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center group-hover:from-primary-300 group-hover:to-primary-400 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110">
                <svg className="w-8 h-8 text-primary-700 group-hover:text-primary-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-primary-900 font-bold text-base">
                  {i18n.language === 'fr' ? 'Cliquez pour télécharger' : 'Click to upload'}
                </p>
                <p className="text-primary-700 text-sm mt-1 font-semibold">
                  PDF, JPG, PNG (Max 5 MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          // FILLED STATE - Show file info with remove button
          <div className="border-2 border-accent-500 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-5 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-200 to-accent-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-7 h-7 text-accent-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-accent-900 font-bold text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-accent-700 text-xs mt-1 font-semibold">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-4 flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-xl transform hover:scale-105 flex items-center gap-2 shadow-lg border border-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-bold">{i18n.language === 'fr' ? 'Supprimer' : 'Remove'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- LOGIQUE ---
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleFileChange is now handled inside CustomFileUpload component

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
      setError("You must be under 40 years old to participate in this competition.");
      setLoading(false);
      // Smooth scroll to error message
      if (errorMessageRef.current) {
        errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Validate Moroccan phone number if +212 is selected
    if (formData.phone_code === '+212') {
      const phoneRegex = /^(0?[567])\d{8}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        setError("Numéro de téléphone marocain invalide. Format accepté: 9 chiffres (6XXXXXXXX) ou 10 chiffres (06XXXXXXXX). / Invalid Moroccan phone number. Accepted format: 9 digits (6XXXXXXXX) or 10 digits (06XXXXXXXX).");
        setLoading(false);
        // Smooth scroll to error message
        if (errorMessageRef.current) {
          errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
        // Only append files if they are actual File instances, not null/undefined
        if (key === 'cin_recto' || key === 'cin_verso') {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          }
        } else {
          data.append(key, formData[key]);
        }
    });

    try {
      // URL API - Uses environment variable or production domain
      const apiUrl = import.meta.env.VITE_API_URL || '/api/register.php';
      const response = await axios.post(apiUrl, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.data.message || t('messages.error'));
        // Smooth scroll to error message
        if (errorMessageRef.current) {
          errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Connection error. Please check your internet connection and try again.";
      setError(errorMessage);
      // Smooth scroll to error message
      if (errorMessageRef.current) {
        errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans selection:bg-primary-100 selection:text-primary-900" style={{backgroundImage: 'url(/Background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      
      {/* --- HEADER LOGO --- */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg shadow-primary-900/5 sticky top-0 z-50 border-b border-sand-100/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-end">
            
            {/* Logo à Gauche en bas */}
            <div className="flex-shrink-0 pb-1">
                <img src={logo} alt="Fondation Jardin Majorelle" className="h-14 md:h-16 w-auto object-contain hover:scale-105 transition-all duration-300" />
            </div>

            {/* Titre Centre */}
            <div className="flex-1 flex flex-col items-center text-center mx-6 pb-1">
                <h1 className="font-serif font-bold text-black text-sm md:text-base lg:text-lg tracking-widest uppercase leading-tight">
                    {t('title')}
                </h1>
                <div className="mt-1 h-0.5 w-20 bg-gradient-to-r from-transparent via-black/60 to-transparent"></div>
            </div>

            {/* Boutons Langue à Droite */}
            <div className="flex-shrink-0 flex items-center gap-3 pb-1">
                <button 
                    onClick={() => changeLanguage('fr')} 
                    className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${i18n.language === 'fr' ? 'text-white shadow-lg scale-105' : 'text-primary-800 hover:text-primary-900 border border-primary-300 hover:shadow-md'}`}
                    style={i18n.language === 'fr' ? {background: 'linear-gradient(135deg, #003F88 0%, #002F66 100%)'} : {background: 'rgba(255,255,255,0.8)'}}
                >
                    FR
                </button>
                <div className="w-px h-6 bg-primary-400"></div>
                <button 
                    onClick={() => changeLanguage('en')} 
                    className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${i18n.language === 'en' ? 'text-white shadow-lg scale-105' : 'text-primary-800 hover:text-primary-900 border border-primary-300 hover:shadow-md'}`}
                    style={i18n.language === 'en' ? {background: 'linear-gradient(135deg, #003F88 0%, #002F66 100%)'} : {background: 'rgba(255,255,255,0.8)'}}
                >
                    EN
                </button>
            </div>
        </div>
      </header>







{/* --- HERO SECTION --- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/Background.png')] bg-cover bg-center z-0 scale-105 transition-transform duration-[10000ms]"></div>
        
        {/* Overlay subtil avec vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-white/15 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)] z-10"></div>
        
        {/* Bouton S'inscrire - Design avec terracotta accent */}
        <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-30 animate-fade-in-scale">
          <a href="#inscription" className="group relative inline-flex items-center justify-center gap-3 text-white font-bold px-12 py-5 md:px-14 md:py-6 rounded-2xl shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.08] uppercase tracking-[0.35em] text-sm md:text-base border-2 border-white/30 hover:border-white/50 overflow-hidden" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 50%, #8B2B13 100%)'}}>
            {/* Effet de lueur */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'}}></span>
            
            <span className="relative z-10 font-bold drop-shadow-lg">{t('hero.cta')}</span>
            <svg className="relative z-10 w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            
            {/* Effet brillance premium au survol */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
            
            {/* Glow effect */}
            <span className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-lg -z-10" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}></span>
          </a>
        </div>
        
        {/* Indicateur de scroll - Design raffiné */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
          <div className="relative group cursor-pointer">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary-400/30 rounded-full blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Icon container */}
            <div className="relative bg-primary-900/80 backdrop-blur-md p-4 rounded-full border border-white/40 shadow-xl group-hover:bg-primary-900/90 group-hover:border-white/60 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>








      {/* --- ABOUT SECTION --- */}
      <section className="py-24" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(242,239,230,0.9) 50%, rgba(255,255,255,0.95) 100%)'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block text-xs uppercase tracking-[0.4em] font-bold text-white px-6 py-2 rounded-full mb-6 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
              {i18n.language === 'fr' ? 'À Propos' : 'About'}
            </span>
            <h2 className="font-serif font-bold text-5xl md:text-6xl text-primary-900 mb-6 tracking-tight">
              {t('about.title')}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-24 h-1 rounded-full" style={{background: 'linear-gradient(to right, transparent, #D64521, #D64521)'}}></div>
              <div className="w-3 h-3 rounded-full" style={{background: '#D64521'}}></div>
              <div className="w-24 h-1 rounded-full" style={{background: 'linear-gradient(to left, transparent, #D64521, #D64521)'}}></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* CARD 1: Le Défi (Icône Architecture/Bâtiment) */}
            <div className="group relative p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-sand-200 hover:border-primary-400 overflow-hidden hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #F2EFE6 50%, #EDF5FF 100%)'}}>
              {/* Decorative glow effect */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700" style={{background: 'radial-gradient(circle, #A3CFFF 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg" style={{background: 'linear-gradient(135deg, #0050AA 0%, #003F88 100%)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-2xl text-primary-800 mb-4 group-hover:text-primary-900 transition-colors">
                  {t('about.challenge')}
                </h3>
                <p className="text-sand-800 leading-relaxed">
                  {t('about.challengeDesc')}
                </p>
              </div>
            </div>
            
            {/* CARD 2: Pourquoi Participer (Icône Trophée/Étoile) */}
            <div className="group relative p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-sand-200 hover:border-accent-400 overflow-hidden hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #F2EFE6 50%, #FFF2ED 100%)'}}>
              {/* Decorative glow effect */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700" style={{background: 'radial-gradient(circle, #FFBFA6 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v7.125M12 3.75v-1.5" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-2xl text-primary-800 mb-4 group-hover:text-primary-900 transition-colors">
                  {t('about.why')}
                </h3>
                <p className="text-sand-800 leading-relaxed">
                  {t('about.whyDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility & Calendar */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* ELIGIBILITY BLOCK */}
            <div className="group relative p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-sand-200 hover:border-primary-400 overflow-hidden hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #EDF5FF 50%, #D0E6FF 100%)'}}>
              {/* Enhanced glow effect */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full filter blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700" style={{background: 'radial-gradient(circle, #71B2FF 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg" style={{background: 'linear-gradient(135deg, #0050AA 0%, #003F88 100%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-primary-800 group-hover:text-primary-900 transition-colors">
                    {t('about.eligibility')}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {t('about.eligibilityItems', { returnObjects: true }).map((item, idx) => (
                    <li key={idx} className="flex items-start group/item">
                      <span className="text-primary-600 mr-3 font-bold mt-1 group-hover/item:text-primary-700 transition-colors">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                      </span>
                      <span className="text-sand-700 leading-relaxed group-hover/item:text-sand-800 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CALENDAR BLOCK */}
            <div className="group relative p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-sand-200 hover:border-accent-400 overflow-hidden hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F0 50%, #FFE8DF 100%)'}}>
              {/* Enhanced glow effect */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full filter blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700" style={{background: 'radial-gradient(circle, #FFBFA6 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-primary-800 group-hover:text-primary-900 transition-colors">
                    {t('calendar.title')}
                  </h3>
                </div>
              <ul className="space-y-5">
                
                {/* 1. ANNONCE - Icône Megaphone */}
                <li className="flex items-center text-sand-800 group">
                  <div className="mr-4 w-11 h-11 flex items-center justify-center rounded-full shrink-0 shadow-md" style={{background: 'linear-gradient(135deg, #EBF5FF 0%, #D0E6FF 100%)', border: '2px solid #71B2FF'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0050AA" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0118.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.816 1.035.816 1.73 0 .695-.32 1.3-.816 1.73" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-medium">{t('calendar.announcement')}</span>
                </li>

                {/* 2. DEADLINE - Icône Clock (Important - highlighted) */}
                <li className="flex items-center text-white p-3 rounded-xl -ml-2 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                  <div className="mr-4 w-11 h-11 flex items-center justify-center rounded-full bg-white shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#D64521" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-bold drop-shadow-sm">{t('calendar.deadline')}</span>
                </li>

                {/* 3. SELECTION - Icône Clipboard/List */}
                <li className="flex items-center text-sand-800">
                  <div className="mr-4 w-11 h-11 flex items-center justify-center rounded-full shrink-0 shadow-md" style={{background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DF 100%)', border: '2px solid #FFBFA6'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#D64521" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-medium">{t('calendar.selection')}</span>
                </li>

                {/* 4. OUVERTURE - Icône Sparkles/Star */}
                <li className="flex items-center text-sand-800">
                  <div className="mr-4 w-11 h-11 flex items-center justify-center rounded-full shrink-0 shadow-md" style={{background: 'linear-gradient(135deg, #FFF9E6 0%, #FFF0B3 100%)', border: '2px solid #FFD700'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#B8860B" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <span className="leading-relaxed font-medium">{t('calendar.opening')}</span>
                </li>

                </ul>
              </div>
            </div>

            {/* CARD 5: Cahier des Charges - Terms of Reference */}
            <div className="group relative p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-sand-200 hover:border-sand-400 overflow-hidden hover:-translate-y-2 md:col-span-2" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F4F0 50%, #E8E6DD 100%)'}}>
              {/* Enhanced glow effect */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full filter blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-700" style={{background: 'radial-gradient(circle, #D5D2C4 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg" style={{background: 'linear-gradient(135deg, #8B7355 0%, #6B5344 100%)'}}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-primary-800 mb-4 group-hover:text-primary-900 transition-colors">
                  {i18n.language === 'fr' ? 'Cahier des Charges' : 'Terms of Reference'}
                </h3>
                
                <p className="text-sand-800 mb-6 leading-relaxed">
                  {i18n.language === 'fr' 
                    ? "Consultez le document détaillé comprenant toutes les spécifications techniques, le règlement complet et les plans de la Villa Oasis."
                    : "Access the detailed document including all technical specifications, full regulations, and Villa Oasis plans."
                  }
                </p>

                {/* Download Button */}
                <a 
                  href="/Reglement.pdf" 
                  download="Cahier_des_Charges_Jardin_Majorelle_2026.pdf"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 text-white font-medium rounded-xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{i18n.language === 'fr' ? 'Télécharger le PDF' : 'Download PDF'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main id="inscription" className="max-w-6xl mx-auto px-6 my-12">
        
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
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
            <div ref={formTopRef} className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl shadow-primary-900/10 border-2 border-sand-100/50 animate-fade-in-up relative overflow-hidden">
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-accent-100/20 rounded-full blur-3xl opacity-50 -z-0"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent-100/20 to-primary-100/20 rounded-full blur-3xl opacity-50 -z-0"></div>
                
                {/* Section Header - Enhanced Design */}
                <div className="text-center mb-16 pb-12 border-b-2 border-gradient-to-r from-transparent via-sand-200 to-transparent relative z-10">
                    {/* Step indicator with animation */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-4 ring-orange-100" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                                <span className="text-white font-bold text-lg">1</span>
                            </div>
                            <div className="h-1 w-16 rounded-full" style={{background: 'linear-gradient(90deg, #D64521 0%, #E6E0D1 100%)'}}></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-sand-200 flex items-center justify-center shadow-sm border-2 border-sand-300">
                                <span className="text-sand-600 font-bold text-lg">2</span>
                            </div>
                        </div>
                    </div>

                    {/* Badge d'inscription avec design premium */}
                    <div className="inline-block mb-6">
                        <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] font-bold text-white px-10 py-4 rounded-full shadow-xl border border-white/20" style={{background: 'linear-gradient(90deg, #003F88 0%, #002F66 50%, #D64521 100%)'}}>
                          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          {i18n.language === 'fr' ? 'Pré-Inscription' : 'Pre-Registration'}
                        </span>
                    </div>

                    {/* Main title with enhanced typography */}
                    <h2 className="text-4xl md:text-7xl font-serif font-bold bg-gradient-to-r from-primary-900 via-primary-800 to-accent-700 bg-clip-text text-transparent mb-4 tracking-tight leading-tight">
                        {t('step1')}
                    </h2>
                    
                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-primary-500 rounded-full"></div>
                        <div className="relative">
                            <div className="w-3 h-3 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full shadow-lg shadow-accent-500/50"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-accent-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div className="w-24 h-0.5 bg-gradient-to-l from-transparent via-primary-400 to-primary-500 rounded-full"></div>
                    </div>

                    {/* Subtitle with better hierarchy */}
                    <p className="text-primary-800 text-xl md:text-2xl font-semibold mb-6 max-w-3xl mx-auto tracking-wide">
                        {t('subtitle')}
                    </p>
                    
                    {/* Description with improved readability */}
                    <p className="text-sand-700 text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-10 font-light">
                        {t('intro')}
                    </p>

                    {/* Enhanced deadline badge */}
                    <div className="inline-block relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-br from-accent-50 via-accent-100/80 to-accent-200/50 border-2 border-accent-400 px-10 py-4 rounded-full hover:border-accent-500 hover:shadow-2xl hover:shadow-accent-500/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                            <p className="text-accent-900 font-bold text-sm md:text-base flex items-center gap-3">
                                <svg className="w-6 h-6 text-accent-600 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="tracking-wide">{t('deadline')}</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div ref={errorMessageRef} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg shadow-md animate-pulse">
                        🚨 {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    
                    {/* 1. Identité */}
                    <div className="bg-gradient-to-br from-white to-sand-50/30 p-8 rounded-2xl border-2 border-sand-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg shadow-sm">
                        <div className={sectionTitleClass}>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg" style={{background: 'linear-gradient(135deg, #003F88 0%, #002F66 100%)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-primary-900">{i18n.language === 'fr' ? 'Identité' : 'Identity'}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.nom')} *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="nom" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    minLength="2"
                                    maxLength="100"
                                    pattern="[A-Za-zÀ-ÿ\s\-']+"
                                    title="Please enter a valid last name (letters only)"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.prenom')} *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="prenom" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    minLength="2"
                                    maxLength="100"
                                    pattern="[A-Za-zÀ-ÿ\s\-']+"
                                    title="Please enter a valid first name (letters only)"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className={labelClass}>{t('fields.naissance')} *</label>
                            <input 
                                required 
                                type="date" 
                                name="date_naissance" 
                                onChange={handleChange} 
                                className={inputClass}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                min={new Date(new Date().setFullYear(new Date().getFullYear() - 39)).toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* 2. Documents (CIN) */}
                    <div className="bg-gradient-to-br from-white to-primary-50/20 p-10 rounded-2xl border-2 border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg shadow-sm">
                        <div className="flex items-center mb-6 pb-3 border-b-2 border-primary-100">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-primary-900">
                                {t('fields.cin')} *
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <CustomFileUpload
                              label="Recto"
                              name="cin_recto"
                              file={formData.cin_recto}
                              inputRef={cinRectoInputRef}
                              required={true}
                            />
                            <CustomFileUpload
                              label="Verso"
                              name="cin_verso"
                              file={formData.cin_verso}
                              inputRef={cinVersoInputRef}
                              required={true}
                            />
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg border border-primary-200 mt-4">
                            <p className="text-sm text-primary-700 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {t('messages.fileSize')}
                            </p>
                        </div>
                    </div>

                    {/* 3. Contact */}
                    <div className="bg-gradient-to-br from-white to-accent-50/20 p-8 rounded-2xl border-2 border-sand-100 hover:border-accent-300 transition-all duration-300 hover:shadow-lg shadow-sm">
                        <div className={sectionTitleClass}>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-primary-900">Contact</h3>
                        </div>
                        <div className="mb-6">
                            <label className={labelClass}>{t('fields.adresse')} *</label>
                            <textarea 
                                required 
                                name="adresse" 
                                rows="3" 
                                onChange={handleChange} 
                                className={inputClass}
                                minLength="10"
                                maxLength="500"
                                placeholder="Enter your complete address"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.email')} *</label>
                                <input 
                                    required 
                                    type="email" 
                                    name="email" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                    title="Please enter a valid email address"
                                    placeholder="example@email.com"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.phone')} *</label>
                                <div className="flex">
                                    <select name="phone_code" onChange={handleChange} className="px-4 py-4 border-2 border-r-0 border-sand-200 rounded-l-xl bg-sand-50 text-sm font-bold text-primary-700 outline-none focus:border-primary-500">
                                        <option value="+212">🇲🇦 +212</option>
                                    </select>
                                    <input 
                                        required 
                                        type="tel" 
                                        name="phone_number" 
                                        onChange={handleChange} 
                                        className={`${inputClass} rounded-l-none border-l-0`}
                                        pattern="[0-9]{9,10}"
                                        title="Please enter a valid phone number (9-10 digits)"
                                        placeholder="6XXXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Statut */}
                    <div className="bg-gradient-to-br from-white to-primary-50/20 p-8 rounded-2xl border-2 border-sand-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg shadow-sm">
                        <div className={sectionTitleClass}>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg" style={{background: 'linear-gradient(135deg, #003F88 0%, #002F66 100%)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-primary-900">Statut Professionnel</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('fields.ecole')} *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="ecole_archi" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    minLength="3"
                                    maxLength="200"
                                    placeholder="Architecture School Name"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.diplome')} *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="diplome" 
                                    onChange={handleChange} 
                                    className={inputClass} 
                                    placeholder="e.g., State Architect Degree"
                                    minLength="5"
                                    maxLength="255"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.annee')} *</label>
                                <input 
                                    required 
                                    type="number" 
                                    name="annee_obtention" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    min="1980"
                                    max={new Date().getFullYear()}
                                    placeholder={new Date().getFullYear().toString()}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('fields.ordre')} (CNOA) *</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="num_ordre" 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    pattern="[A-Za-z0-9\-]+"
                                    title="Please enter a valid CNOA number"
                                    placeholder="CNOA Number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Case à cocher - Acceptation des conditions */}
                    <div className="pt-8 mt-8 border-t border-sand-200">
                        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-200">
                            <label className="flex items-start cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-2 border-primary-400 text-primary-600 focus:ring-2 focus:ring-primary-300 cursor-pointer"
                                />
                                <span className="ml-4 text-sand-800 text-base leading-relaxed">
                                    {i18n.language === 'fr' ? (
                                        <>
                                            J'accepte les{' '}
                                            <a 
                                                href="/Reglement.pdf" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="font-bold text-primary-700 hover:text-primary-900 hover:underline transition-colors"
                                            >
                                                termes et conditions
                                            </a>
                                            {' '}du concours et confirme que toutes les informations fournies sont exactes.
                                        </>
                                    ) : (
                                        <>
                                            I accept the{' '}
                                            <a 
                                                href="/Reglement.pdf" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="font-bold text-primary-700 hover:text-primary-900 hover:underline transition-colors"
                                            >
                                                terms and conditions
                                            </a>
                                            {' '}of the competition and confirm that all information provided is accurate.
                                        </>
                                    )}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Bouton Envoi */}
                    <div className="pt-8">
                        <button 
                            disabled={loading || !acceptedTerms} 
                            type="submit" 
                            style={{background: 'linear-gradient(135deg, #003F88 0%, #002F66 50%, #D64521 100%)'}}
                            className="group relative w-full overflow-hidden text-white font-bold py-8 px-10 rounded-2xl shadow-2xl hover:shadow-[0_25px_70px_-10px_rgba(0,80,170,0.5)] transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 uppercase tracking-[0.3em] text-lg border-2 border-white/20">
                            {/* Animated background waves */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary-400/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1200 ease-out"></div>
                            
                            {/* Multi-layer glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-accent-400/40 via-accent-500/30 to-primary-600/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-300/20 via-transparent to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Pulse effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-white/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            
                            {/* Content */}
                            <span className="relative flex items-center justify-center gap-4 z-10">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="font-bold text-xl text-white">{i18n.language === 'fr' ? 'Traitement en cours...' : 'Processing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-bold text-xl text-white">{i18n.language === 'fr' ? 'Soumettre Inscription' : 'Submit Registration'}</span>
                                        <svg className="w-7 h-7 text-white transform group-hover:translate-x-2 transition-all duration-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            
                            {/* Top shine effect */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {/* Bottom shine effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/20 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
      <footer className="relative text-sand-900 py-16 mt-16 overflow-hidden" style={{background: 'linear-gradient(135deg, #F2EFE6 0%, #E8E6DD 30%, #FFF5F0 70%, #FFE8DF 100%)'}}>
        {/* Effet de background subtil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/Background.png')] bg-cover bg-center"></div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #FFBFA6 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #A3CFFF 0%, transparent 70%)'}}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* About */}
            <div className="group p-8 rounded-2xl border-2 border-sand-200 hover:border-primary-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(237,245,255,0.9) 100%)'}}>
              <div className="flex items-center mb-5">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background: 'linear-gradient(135deg, #0050AA 0%, #003F88 100%)'}}>
                  {/* SVG Building/Museum Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg text-primary-900">
                  FONDATION JARDIN MAJORELLE
                </h3>
              </div>
              <p className="text-sand-800 leading-relaxed text-base">
                {i18n.language === 'fr' ? 
                  "Institution culturelle dédiée à la botanique, aux cultures berbères, à la mode, aux arts décoratifs et à la création contemporaine." :
                  "Cultural institution dedicated to botany, Berber cultures, fashion, decorative arts and contemporary creation."
                }
              </p>
              
            </div>
            
            {/* Contact */}
            <div className="group p-8 rounded-2xl border-2 border-sand-200 hover:border-accent-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,245,240,0.9) 100%)'}}>
              <div className="flex items-center mb-5">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3" style={{background: 'linear-gradient(135deg, #D64521 0%, #B03618 100%)'}}>
                  {/* SVG Mail Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg text-primary-900">
                  Contact
                </h3>
              </div>
          <ul className="space-y-4 text-base">
                {/* Email */}
                <li className="flex items-center text-sand-800 hover:text-accent-700 transition-colors cursor-pointer font-medium">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {t('contact.email')}
                </li>

                {/* Lien 1 : Jardin Majorelle */}
                <li className="flex items-center text-sand-800 hover:text-accent-700 transition-colors font-medium">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <a href="https://www.jardinmajorelle.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    www.jardinmajorelle.com
                  </a>
                </li>

                {/* Lien 2 : Musée YSL */}
                <li className="flex items-center text-sand-800 hover:text-accent-700 transition-colors font-medium">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <a href="https://www.museeyslmarrakech.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    www.museeyslmarrakech.com
                  </a>
                </li>

                {/* Adresse */}
                <li className="flex items-start text-sand-800 font-medium">
                  <svg className="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Jardin Majorelle & musée YVES SAINT LAURENT marrakech</span>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div className="group p-8 rounded-2xl border-2 border-sand-200 hover:border-primary-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(237,245,255,0.9) 100%)'}}>
              <div className="flex items-center mb-5">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background: 'linear-gradient(135deg, #8B7355 0%, #6B5344 100%)'}}>
                  {/* SVG Scale/Legal Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg text-primary-900">
                  {i18n.language === 'fr' ? 'Informations Légales' : 'Legal Information'}
                </h3>
              </div>
              <p className="text-sand-800 text-base leading-relaxed">
                {i18n.language === 'fr' ?
                  "Ce concours est organisé par la Fondation Jardin Majorelle conformément à la réglementation en vigueur. Les données collectées sont utilisées uniquement dans le cadre du concours." :
                  "This competition is organized by the Fondation Jardin Majorelle in accordance with current regulations. Data collected is used solely for competition purposes."
                }
              </p>
            </div>
          </div>
          
          <div className="pt-12 mt-10 border-t-2 border-sand-300">
            <div className="text-center p-8 rounded-2xl shadow-xl border-2 border-sand-200" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(242,239,230,0.95) 100%)'}}>
              <p className="text-primary-900 text-base mb-3 font-bold tracking-wide">
                © {new Date().getFullYear()} Fondation Jardin Majorelle - {i18n.language === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
              </p>
              <p className="text-sand-700 text-sm font-semibold">
                Prix Fondation Jardin Majorelle pour la Conception du Nouveau Pavillon Temporaire de la Villa Oasis
              </p>
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to right, transparent, #D64521)'}}></div>
                <div className="w-2 h-2 rounded-full" style={{background: '#D64521'}}></div>
                <div className="w-16 h-0.5 rounded-full" style={{background: 'linear-gradient(to left, transparent, #D64521)'}}></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;