
import Step2 from './Step2';
import MaintenancePage from './MaintenancePage';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Import du logo
import logo from './assets/logo.png';

function App() {
  const { t, i18n } = useTranslation();
  
  // Check maintenance mode
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    return <MaintenancePage />;
  }
  
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
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Parallax scroll tracking (throttled via rAF)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          setShowScrollTop(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // useRef for smooth scrolling to error message
  const errorMessageRef = useRef(null);
  const formTopRef = useRef(null);

  // Refs for file inputs (to programmatically reset them)
  const cinRectoInputRef = useRef(null);
  const cinVersoInputRef = useRef(null);

  // Enhanced CSS classes for dark glass design
  const labelClass = "block text-[#7dafab] font-medium mb-2 text-sm sm:text-xs uppercase tracking-widest";
  const inputClass = "w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:border-[#7dafab] focus:ring-2 focus:ring-[#7dafab]/30 transition-all duration-200 font-sans bg-white/5 text-white placeholder:text-white/40";
  const sectionTitleClass = "flex items-center mb-6 pb-3 border-b border-white/10";
  const sectionNumberClass = "w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center mr-4";
  const sectionHeaderClass = "text-2xl font-serif font-bold text-white";

  // --- CUSTOM FILE UPLOAD COMPONENT - FLAT DESIGN ---
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
        <label className="block text-[#7dafab] font-medium mb-2 text-xs uppercase tracking-widest">
          {label} {required && <span className="text-amber-600">*</span>}
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
          // EMPTY STATE - Glassmorphism dashed upload zone
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-[#7dafab]/40 rounded-lg p-8 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-[#7dafab]/60 cursor-pointer transition-all duration-300 text-center group/upload"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 border border-[#7dafab]/40 bg-[#7dafab]/10 rounded-lg flex items-center justify-center group-hover/upload:bg-[#7dafab]/20 transition-all duration-300">
                <svg className="w-6 h-6 text-[#7dafab]/70 group-hover/upload:text-[#7dafab] transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-white/70 font-medium text-sm group-hover/upload:text-white/90 transition-colors duration-300">
                  {i18n.language === 'fr' ? 'Cliquez pour télécharger' : 'Click to upload'}
                </p>
                <p className="text-white/35 text-xs mt-1">
                  (Max 5 MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          // FILLED STATE - Glassmorphism with file info
          <div className="border border-[#f8b200]/30 bg-white/5 backdrop-blur-sm rounded-lg p-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-[#f8b200]/15 border border-[#f8b200]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#f8b200]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 font-medium text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-4 flex-shrink-0 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg font-medium text-sm sm:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{i18n.language === 'fr' ? 'Supprimer' : 'Remove'}</span>
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
    // Add selected language
    data.append('language', i18n.language);

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
    <div className="min-h-screen font-sans" style={{background: 'linear-gradient(180deg, #87CEEB 0%, #183230 50%, #183230 100%)'}}>
      
{/* --- HEADER LOGO (TRANSPARENT OVERLAY — Charte Graphique) --- */}
      <header className="absolute top-0 inset-x-0 z-50">
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-2 sm:mt-4 px-3 sm:px-6 py-2 sm:py-3 flex justify-between items-center rounded-2xl bg-transparent border-none shadow-none">
            
            {/* Logo à Gauche — Bigger & More Visible */}
            <div className="flex-shrink-0 flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src={logo} alt="Fondation Jardin Majorelle" className="relative h-10 sm:h-14 md:h-18 lg:h-22 max-w-[80px] sm:max-w-[120px] md:max-w-none w-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
                </div>
            </div>

            {/* Titre Centre */}
            <div className="hidden md:flex flex-1 flex-col items-center text-center mx-6 lg:mx-10">
                <h1 className="font-serif text-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-[0.15em] sm:tracking-[0.2em] uppercase leading-tight font-bold" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)'}}>

                    {t('title')}
                </h1>
                <div className="mt-2 h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
            </div>

            {/* Language Switcher */}
            <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={() => changeLanguage('fr')} 
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                      i18n.language === 'fr' 
                        ? 'bg-[#f8b200] text-white border border-[#f8b200] shadow-[0_4px_16px_rgba(248,178,0,0.4)]' 
                        : 'text-white hover:bg-white/15 border border-white/30 hover:border-white/60'
                    }`}
                >
                    FR
                </button>
                <button 
                    onClick={() => changeLanguage('en')} 
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                      i18n.language === 'en' 
                        ? 'bg-[#f8b200] text-white border border-[#f8b200] shadow-[0_4px_16px_rgba(248,178,0,0.4)]' 
                        : 'text-white hover:bg-white/15 border border-white/30 hover:border-white/60'
                    }`}
                >
                    EN
                </button>
            </div>
        </div>
      </header>




{/* ═══════ HERO SECTION (Dynamic & Professional Design) ═══════ */}
<section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#87CEEB] via-[#E0F6FF] to-[#7dafab]">

  {/* LAYER 0: Cinematic Animated Sky Background */}
  <div className="absolute inset-0 z-0 overflow-hidden">
    
    {/* Base gradient — richer sunset palette with animation */}
    <div className="absolute inset-0 animate-[gradientShift_20s_ease-in-out_infinite]" style={{
      background: 'linear-gradient(135deg, #6AB8E7 0%, #B8E4FF 15%, #FFD8A0 35%, #FFCB8E 50%, #E8D5F0 65%, #B8E4FF 80%, #6AB8E7 100%)',
      backgroundSize: '300% 300%'
    }}></div>
    
    {/* Warm horizon glow — golden band near lower third */}
    <div className="absolute inset-0 animate-[horizonPulse_10s_ease-in-out_infinite]" style={{
      background: 'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,180,80,0.15) 55%, rgba(248,178,0,0.2) 65%, rgba(255,140,60,0.12) 75%, transparent 100%)'
    }}></div>
    
    {/* Aurora-like color band — subtle iridescence */}
    <div className="absolute inset-0 opacity-20 animate-[auroraDrift_30s_ease-in-out_infinite]" style={{
      background: 'linear-gradient(120deg, transparent 15%, rgba(120,200,255,0.15) 25%, rgba(200,160,255,0.12) 35%, rgba(255,200,150,0.1) 45%, rgba(120,200,255,0.15) 55%, transparent 70%)',
      filter: 'blur(40px)'
    }}></div>
    
    {/* ═══════ GOLDEN DUST PARTICLES — Sunset magic ═══════ */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large golden motes */}
      <div className="absolute w-1.5 h-1.5 rounded-full animate-[goldenDustRise1_14s_ease-in-out_infinite]" style={{bottom: '10%', left: '12%', background: 'radial-gradient(circle, rgba(248,178,0,0.9) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 6px rgba(248,178,0,0.5)'}}></div>
      <div className="absolute w-2 h-2 rounded-full animate-[goldenDustRise2_18s_ease-in-out_infinite]" style={{bottom: '15%', left: '28%', background: 'radial-gradient(circle, rgba(248,178,0,0.8) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 8px rgba(248,178,0,0.4)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise3_12s_ease-in-out_infinite_1s]" style={{bottom: '5%', left: '45%', background: 'radial-gradient(circle, rgba(248,178,0,0.85) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 5px rgba(248,178,0,0.5)'}}></div>
      <div className="absolute w-1.5 h-1.5 rounded-full animate-[goldenDustRise1_16s_ease-in-out_infinite_3s]" style={{bottom: '8%', left: '62%', background: 'radial-gradient(circle, rgba(248,178,0,0.75) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 6px rgba(248,178,0,0.4)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise2_20s_ease-in-out_infinite_2s]" style={{bottom: '12%', left: '78%', background: 'radial-gradient(circle, rgba(248,178,0,0.9) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 5px rgba(248,178,0,0.5)'}}></div>
      <div className="absolute w-2 h-2 rounded-full animate-[goldenDustRise3_15s_ease-in-out_infinite_4s]" style={{bottom: '18%', left: '90%', background: 'radial-gradient(circle, rgba(248,178,0,0.7) 0%, rgba(248,178,0,0) 70%)', boxShadow: '0 0 8px rgba(248,178,0,0.3)'}}></div>
      
      {/* Small subtle motes */}
      <div className="absolute w-0.5 h-0.5 rounded-full animate-[goldenDustRise1_10s_ease-in-out_infinite_5s]" style={{bottom: '20%', left: '20%', background: 'radial-gradient(circle, rgba(248,178,0,0.95) 0%, transparent 70%)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise2_13s_ease-in-out_infinite_6s]" style={{bottom: '6%', left: '35%', background: 'radial-gradient(circle, rgba(248,178,0,0.8) 0%, transparent 70%)', boxShadow: '0 0 4px rgba(248,178,0,0.4)'}}></div>
      <div className="absolute w-0.5 h-0.5 rounded-full animate-[goldenDustRise3_11s_ease-in-out_infinite_7s]" style={{bottom: '14%', left: '55%', background: 'radial-gradient(circle, rgba(248,178,0,0.85) 0%, transparent 70%)'}}></div>
      <div className="absolute w-1.5 h-1.5 rounded-full animate-[goldenDustRise1_17s_ease-in-out_infinite_8s]" style={{bottom: '3%', left: '72%', background: 'radial-gradient(circle, rgba(248,178,0,0.7) 0%, transparent 70%)', boxShadow: '0 0 6px rgba(248,178,0,0.35)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise2_19s_ease-in-out_infinite_2.5s]" style={{bottom: '22%', left: '85%', background: 'radial-gradient(circle, rgba(248,178,0,0.9) 0%, transparent 70%)'}}></div>
      <div className="absolute w-0.5 h-0.5 rounded-full animate-[goldenDustRise3_9s_ease-in-out_infinite_1.5s]" style={{bottom: '9%', left: '8%', background: 'radial-gradient(circle, rgba(248,178,0,0.8) 0%, transparent 70%)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise1_14s_ease-in-out_infinite_9s]" style={{bottom: '16%', left: '50%', background: 'radial-gradient(circle, rgba(248,178,0,0.75) 0%, transparent 70%)', boxShadow: '0 0 5px rgba(248,178,0,0.3)'}}></div>
      <div className="absolute w-2 h-2 rounded-full animate-[goldenDustRise2_22s_ease-in-out_infinite_4.5s]" style={{bottom: '2%', left: '42%', background: 'radial-gradient(circle, rgba(248,178,0,0.65) 0%, transparent 70%)', boxShadow: '0 0 10px rgba(248,178,0,0.25)'}}></div>
    </div>

    {/* ═══════ LIGHT RAYS — Soft oasis sunbeams from above ═══════ */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primary ray — wide warm beam */}
      <div className="absolute animate-[sunRaySway1_12s_ease-in-out_infinite]" style={{
        top: '-10%', left: '25%', width: '18%', height: '120%',
        background: 'linear-gradient(180deg, rgba(248,178,0,0.18) 0%, rgba(248,178,0,0.08) 30%, rgba(248,178,0,0.02) 60%, transparent 100%)',
        transform: 'rotate(-8deg)', transformOrigin: 'top center',
        filter: 'blur(20px)', mixBlendMode: 'screen'
      }}></div>
      {/* Secondary ray — narrower, offset */}
      <div className="absolute animate-[sunRaySway2_15s_ease-in-out_infinite]" style={{
        top: '-10%', left: '55%', width: '12%', height: '120%',
        background: 'linear-gradient(180deg, rgba(248,178,0,0.14) 0%, rgba(248,178,0,0.06) 35%, rgba(248,178,0,0.01) 65%, transparent 100%)',
        transform: 'rotate(5deg)', transformOrigin: 'top center',
        filter: 'blur(18px)', mixBlendMode: 'screen'
      }}></div>
      {/* Tertiary ray — subtle fill */}
      <div className="absolute animate-[sunRaySway1_18s_ease-in-out_infinite_2s]" style={{
        top: '-10%', left: '75%', width: '15%', height: '120%',
        background: 'linear-gradient(180deg, rgba(248,178,0,0.1) 0%, rgba(248,178,0,0.04) 40%, transparent 70%)',
        transform: 'rotate(10deg)', transformOrigin: 'top center',
        filter: 'blur(25px)', mixBlendMode: 'screen'
      }}></div>
      {/* Left fill ray */}
      <div className="absolute animate-[sunRaySway2_20s_ease-in-out_infinite_4s]" style={{
        top: '-10%', left: '8%', width: '10%', height: '120%',
        background: 'linear-gradient(180deg, rgba(248,178,0,0.08) 0%, rgba(248,178,0,0.03) 40%, transparent 70%)',
        transform: 'rotate(-12deg)', transformOrigin: 'top center',
        filter: 'blur(22px)', mixBlendMode: 'screen'
      }}></div>
      
      {/* Warm radial glow at top — sun source */}
      <div className="absolute animate-[sunGlowPulse_8s_ease-in-out_infinite]" style={{
        top: '-15%', left: '30%', right: '30%', height: '50%',
        background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(248,178,0,0.2) 0%, rgba(248,178,0,0.08) 40%, transparent 70%)',
        filter: 'blur(30px)'
      }}></div>
    </div>

    {/* ═══════ FLOATING LEAF SHADOWS — Gentle breeze on edges ═══════ */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Left edge — palm / tropical leaf shadow cluster */}
      <svg className="absolute top-0 left-0 w-[35%] h-full opacity-[0.06] animate-[leafSwayLeft_10s_ease-in-out_infinite]" viewBox="0 0 400 800" preserveAspectRatio="xMinYMin slice" style={{filter: 'blur(3px)', transformOrigin: 'top left'}}>
        <defs>
          <linearGradient id="leafGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#183230" stopOpacity="1"/>
            <stop offset="100%" stopColor="#183230" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Large palm frond */}
        <path d="M0,100 Q60,80 100,150 Q130,200 90,280 Q60,340 0,360" fill="url(#leafGradL)"/>
        <path d="M0,50 Q80,30 140,90 Q180,140 150,220 Q120,280 40,300 Q10,310 0,300" fill="url(#leafGradL)" opacity="0.7"/>
        {/* Smaller leaves */}
        <path d="M0,380 Q50,360 80,400 Q100,440 70,500 Q40,540 0,550" fill="url(#leafGradL)" opacity="0.5"/>
        <path d="M0,200 Q40,185 70,210 Q90,240 60,290 Q30,320 0,330" fill="url(#leafGradL)" opacity="0.6"/>
        {/* Thin dangling leaf */}
        <path d="M30,0 Q45,40 35,90 Q28,130 15,150 Q5,160 0,155" fill="url(#leafGradL)" opacity="0.4"/>
      </svg>
      
      {/* Right edge — leaf shadows mirrored */}
      <svg className="absolute top-0 right-0 w-[30%] h-full opacity-[0.05] animate-[leafSwayRight_12s_ease-in-out_infinite_1s]" viewBox="0 0 350 800" preserveAspectRatio="xMaxYMin slice" style={{filter: 'blur(3px)', transform: 'scaleX(-1)', transformOrigin: 'top right'}}>
        <defs>
          <linearGradient id="leafGradR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#183230" stopOpacity="1"/>
            <stop offset="100%" stopColor="#183230" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,150 Q70,120 120,180 Q160,240 110,340 Q70,400 0,420" fill="url(#leafGradR)"/>
        <path d="M0,80 Q50,60 90,100 Q120,140 80,210 Q50,260 0,280" fill="url(#leafGradR)" opacity="0.6"/>
        <path d="M0,440 Q40,425 65,460 Q80,490 55,540 Q30,570 0,580" fill="url(#leafGradR)" opacity="0.5"/>
        <path d="M20,0 Q35,50 25,110 Q18,150 5,165" fill="url(#leafGradR)" opacity="0.35"/>
      </svg>
      
      {/* Top edge — overhanging branch shadows */}
      <svg className="absolute top-0 left-[15%] w-[70%] h-[25%] opacity-[0.04] animate-[leafSwayTop_14s_ease-in-out_infinite_2s]" viewBox="0 0 800 200" preserveAspectRatio="xMidYMin slice" style={{filter: 'blur(4px)', transformOrigin: 'top center'}}>
        <defs>
          <linearGradient id="leafGradT" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#183230" stopOpacity="1"/>
            <stop offset="100%" stopColor="#183230" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M200,0 Q220,30 260,50 Q310,65 330,45 Q350,25 380,0" fill="url(#leafGradT)" opacity="0.7"/>
        <path d="M450,0 Q460,40 500,60 Q540,70 570,45 Q590,20 600,0" fill="url(#leafGradT)" opacity="0.5"/>
        <path d="M100,0 Q110,20 140,35 Q170,45 190,30 Q200,15 210,0" fill="url(#leafGradT)" opacity="0.6"/>
        <path d="M620,0 Q635,25 660,40 Q690,50 710,30 Q720,10 730,0" fill="url(#leafGradT)" opacity="0.4"/>
      </svg>
    </div>

    {/* Subtle noise texture overlay for organic feel */}
    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      backgroundSize: '128px 128px'
    }}></div>
  </div>

  {/* LAYER 1 : BACKGROUND SKY — Cinematic Parallax */}
  <div 
    className="absolute inset-0 z-5 pointer-events-none animate-[floatFromBottom_2.5s_ease-out_forwards]"
    style={{ 
      transform: `translateY(${scrollY * 0.25}px) scale(1.05)`,
      transformOrigin: 'center'
    }}
  >
    <img 
      src="/sunset-sky.jpg" 
      alt="Sunset Sky" 
      className="w-full h-full object-cover transition-transform duration-1000"
      style={{ filter: 'brightness(1.12) contrast(1.12) saturate(1.25) hue-rotate(-3deg)' }}
    />
    
    {/* Warm golden-hour color wash */}
    <div className="absolute inset-0 mix-blend-soft-light animate-[fadeIn_2s_ease-out_forwards]"
      style={{
        background: 'linear-gradient(180deg, rgba(248,178,0,0.18) 0%, rgba(255,140,50,0.12) 35%, rgba(125,175,171,0.08) 70%, transparent 100%)'
      }}
    ></div>
    
    {/* Multi-layer Professional Overlay — enhanced depth */}
    <div className="absolute inset-0 bg-gradient-to-b 
      from-black/35 via-black/10 via-30% to-transparent animate-[fadeIn_2s_ease-out_forwards]"
    ></div>
    <div className="absolute inset-0 bg-gradient-to-t 
      from-[#7dafab]/55 via-[#7dafab]/20 via-40% to-transparent animate-[fadeIn_2.5s_ease-out_forwards]"
    ></div>
    
    {/* Horizontal warmth bands */}
    <div className="absolute inset-0 opacity-20 animate-[fadeIn_3s_ease-out_forwards]"
      style={{
        background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 80px, rgba(248,178,0,0.06) 80px, rgba(248,178,0,0.06) 82px)'
      }}
    ></div>
    
    {/* Cinematic vignette */}
    <div className="absolute inset-0 animate-[fadeIn_3s_ease-out_forwards]"
      style={{
        background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 40%, rgba(0,0,0,0.45) 100%)'
      }}
    ></div>
    
    {/* Subtle Radial Light Effect — sun bloom */}
    <div className="absolute inset-0 opacity-30 animate-[lightPulse_6s_ease-in-out_infinite]"
      style={{
        background: 'radial-gradient(circle at 50% 35%, rgba(255,220,120,0.35) 0%, rgba(255,180,80,0.12) 25%, transparent 60%)'
      }}
    ></div>
    
    {/* Secondary bloom ring */}
    <div className="absolute inset-0 opacity-15 animate-[lightPulse_8s_ease-in-out_infinite_0.5s]"
      style={{
        background: 'radial-gradient(circle at 50% 35%, transparent 15%, rgba(248,178,0,0.1) 25%, transparent 45%)'
      }}
    ></div>
    
    {/* Animated sun rays effect — more rays, softer */}
    <div className="absolute inset-0 opacity-12 animate-[rotateRays_60s_linear_infinite]"
      style={{
        background: 'conic-gradient(from 0deg at 50% 32%, transparent 0deg, rgba(255,200,80,0.25) 2deg, transparent 5deg, transparent 28deg, rgba(255,200,80,0.2) 30deg, transparent 33deg, transparent 58deg, rgba(255,200,80,0.18) 60deg, transparent 63deg, transparent 88deg, rgba(255,200,80,0.22) 90deg, transparent 93deg, transparent 118deg, rgba(255,200,80,0.15) 120deg, transparent 123deg, transparent 148deg, rgba(255,200,80,0.2) 150deg, transparent 153deg, transparent 178deg, rgba(255,200,80,0.25) 180deg, transparent 183deg, transparent 208deg, rgba(255,200,80,0.18) 210deg, transparent 213deg, transparent 238deg, rgba(255,200,80,0.22) 240deg, transparent 243deg, transparent 268deg, rgba(255,200,80,0.15) 270deg, transparent 273deg, transparent 298deg, rgba(255,200,80,0.2) 300deg, transparent 303deg, transparent 328deg, rgba(255,200,80,0.18) 330deg, transparent 333deg, transparent 358deg, rgba(255,200,80,0.25) 360deg)',
        mixBlendMode: 'overlay'
      }}
    ></div>
    
    {/* Counter-rotating subtle secondary rays */}
    <div className="absolute inset-0 opacity-8 animate-[rotateRaysReverse_90s_linear_infinite]"
      style={{
        background: 'conic-gradient(from 45deg at 50% 35%, transparent 0deg, rgba(255,255,255,0.08) 4deg, transparent 8deg, transparent 88deg, rgba(255,255,255,0.06) 92deg, transparent 96deg, transparent 178deg, rgba(255,255,255,0.08) 182deg, transparent 186deg, transparent 268deg, rgba(255,255,255,0.06) 272deg, transparent 276deg)',
        mixBlendMode: 'screen'
      }}
    ></div>
    
    {/* Golden dust particles in sky layer */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise1_16s_ease-in-out_infinite_1s]" style={{bottom: '30%', left: '18%', background: 'radial-gradient(circle, rgba(248,178,0,0.7) 0%, transparent 70%)', boxShadow: '0 0 4px rgba(248,178,0,0.3)'}}></div>
      <div className="absolute w-1.5 h-1.5 rounded-full animate-[goldenDustRise2_20s_ease-in-out_infinite_3s]" style={{bottom: '25%', left: '60%', background: 'radial-gradient(circle, rgba(248,178,0,0.6) 0%, transparent 70%)', boxShadow: '0 0 6px rgba(248,178,0,0.25)'}}></div>
      <div className="absolute w-0.5 h-0.5 rounded-full animate-[goldenDustRise3_13s_ease-in-out_infinite_5s]" style={{bottom: '35%', left: '40%', background: 'radial-gradient(circle, rgba(248,178,0,0.8) 0%, transparent 70%)'}}></div>
      <div className="absolute w-1 h-1 rounded-full animate-[goldenDustRise1_18s_ease-in-out_infinite_7s]" style={{bottom: '20%', left: '82%', background: 'radial-gradient(circle, rgba(248,178,0,0.65) 0%, transparent 70%)', boxShadow: '0 0 4px rgba(248,178,0,0.2)'}}></div>
    </div>
    
    {/* Horizontal lens flare streak */}
    <div className="absolute opacity-20 animate-[lensFlare_8s_ease-in-out_infinite]"
      style={{
        top: '32%',
        left: '30%',
        right: '30%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(255,220,150,0.8) 20%, rgba(255,255,255,0.9) 50%, rgba(255,220,150,0.8) 80%, transparent)',
        filter: 'blur(2px)'
      }}
    ></div>
    
    {/* Anamorphic flare glow */}
    <div className="absolute opacity-10 animate-[lensFlare_8s_ease-in-out_infinite]"
      style={{
        top: '30%',
        left: '25%',
        right: '25%',
        height: '12px',
        background: 'linear-gradient(90deg, transparent, rgba(100,180,255,0.3) 30%, rgba(255,200,100,0.4) 50%, rgba(100,180,255,0.3) 70%, transparent)',
        filter: 'blur(6px)'
      }}
    ></div>
    
    {/* Warm golden ambient glow */}
    <div className="absolute inset-0 opacity-12 animate-[sunGlowPulse_8s_ease-in-out_infinite]"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 45% 30%, rgba(248,178,0,0.15) 0%, rgba(248,178,0,0.05) 40%, transparent 70%)',
        filter: 'blur(20px)'
      }}
    ></div>
  </div>

  {/* LAYER 1.5 : BIRDS FLOCK — Realistic flying birds with SMIL wing rotation */}
  <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
    {/* Flock 1 — main group, loose V-formation, 7 birds */}
    <div className="absolute animate-[birdsDrift1_38s_linear_infinite]" style={{top: '10%', left: '-15%'}}>
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-36 sm:w-44 md:w-56" style={{overflow: 'visible'}}>
        {/* Bird 1 - Leader */}
        <g opacity="0.5">
          <path d="M80,45 Q72,36 63,40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 80 45;28 80 45;-10 80 45;0 80 45" keyTimes="0;0.35;0.75;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M80,45 Q88,36 97,40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 80 45;-28 80 45;10 80 45;0 80 45" keyTimes="0;0.35;0.75;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 2 - Left flank */}
        <g opacity="0.45">
          <path d="M56,54 Q49,46 41,49" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 56 54;30 56 54;-8 56 54;0 56 54" keyTimes="0;0.35;0.75;1" dur="1.1s" repeatCount="indefinite" begin="0.15s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M56,54 Q63,46 71,49" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 56 54;-30 56 54;8 56 54;0 56 54" keyTimes="0;0.35;0.75;1" dur="1.1s" repeatCount="indefinite" begin="0.15s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 3 - Right flank */}
        <g opacity="0.43">
          <path d="M106,51 Q99,43 91,46" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 106 51;26 106 51;-9 106 51;0 106 51" keyTimes="0;0.35;0.75;1" dur="0.95s" repeatCount="indefinite" begin="0.3s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M106,51 Q113,43 121,46" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 106 51;-26 106 51;9 106 51;0 106 51" keyTimes="0;0.35;0.75;1" dur="0.95s" repeatCount="indefinite" begin="0.3s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 4 - Higher left */}
        <g opacity="0.4">
          <path d="M66,34 Q60,27 53,30" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 66 34;32 66 34;-7 66 34;0 66 34" keyTimes="0;0.35;0.75;1" dur="0.85s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M66,34 Q72,27 79,30" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 66 34;-32 66 34;7 66 34;0 66 34" keyTimes="0;0.35;0.75;1" dur="0.85s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 5 - Higher right */}
        <g opacity="0.42">
          <path d="M94,32 Q88,25 81,28" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 94 32;29 94 32;-11 94 32;0 94 32" keyTimes="0;0.35;0.75;1" dur="1.05s" repeatCount="indefinite" begin="0.4s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M94,32 Q100,25 107,28" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 94 32;-29 94 32;11 94 32;0 94 32" keyTimes="0;0.35;0.75;1" dur="1.05s" repeatCount="indefinite" begin="0.4s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 6 - Far left trailing */}
        <g opacity="0.38">
          <path d="M36,62 Q30,55 23,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 36 62;27 36 62;-10 36 62;0 36 62" keyTimes="0;0.35;0.75;1" dur="1.15s" repeatCount="indefinite" begin="0.1s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M36,62 Q42,55 49,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 36 62;-27 36 62;10 36 62;0 36 62" keyTimes="0;0.35;0.75;1" dur="1.15s" repeatCount="indefinite" begin="0.1s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Bird 7 - Far right trailing */}
        <g opacity="0.4">
          <path d="M130,58 Q124,51 117,54" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 130 58;25 130 58;-9 130 58;0 130 58" keyTimes="0;0.35;0.75;1" dur="0.9s" repeatCount="indefinite" begin="0.25s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M130,58 Q136,51 143,54" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 130 58;-25 130 58;9 130 58;0 130 58" keyTimes="0;0.35;0.75;1" dur="0.9s" repeatCount="indefinite" begin="0.25s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
      </svg>
    </div>

    {/* Flock 2 — distant small group, higher and slower */}
    <div className="absolute animate-[birdsDrift2_52s_linear_infinite_8s]" style={{top: '5%', left: '-10%'}}>
      <svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg" className="w-20 sm:w-24 md:w-28" style={{overflow: 'visible'}}>
        {/* Distant Bird 1 */}
        <g opacity="0.3">
          <path d="M60,35 Q55,29 49,32" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 60 35;30 60 35;-8 60 35;0 60 35" keyTimes="0;0.35;0.75;1" dur="0.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M60,35 Q65,29 71,32" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 60 35;-30 60 35;8 60 35;0 60 35" keyTimes="0;0.35;0.75;1" dur="0.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Distant Bird 2 */}
        <g opacity="0.26">
          <path d="M44,43 Q40,38 35,40" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 44 43;28 44 43;-10 44 43;0 44 43" keyTimes="0;0.35;0.75;1" dur="0.85s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M44,43 Q48,38 53,40" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 44 43;-28 44 43;10 44 43;0 44 43" keyTimes="0;0.35;0.75;1" dur="0.85s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Distant Bird 3 */}
        <g opacity="0.28">
          <path d="M80,38 Q76,33 72,35" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 80 38;32 80 38;-7 80 38;0 80 38" keyTimes="0;0.35;0.75;1" dur="0.75s" repeatCount="indefinite" begin="0.35s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M80,38 Q84,33 88,35" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 80 38;-32 80 38;7 80 38;0 80 38" keyTimes="0;0.35;0.75;1" dur="0.75s" repeatCount="indefinite" begin="0.35s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Distant Bird 4 - tiny */}
        <g opacity="0.22">
          <path d="M62,24 Q59,20 56,22" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 62 24;35 62 24;-6 62 24;0 62 24" keyTimes="0;0.35;0.75;1" dur="0.7s" repeatCount="indefinite" begin="0.1s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M62,24 Q65,20 68,22" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 62 24;-35 62 24;6 62 24;0 62 24" keyTimes="0;0.35;0.75;1" dur="0.7s" repeatCount="indefinite" begin="0.1s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
      </svg>
    </div>

    {/* Flock 3 — mid-screen, immediately visible */}
    <div className="absolute animate-[birdsDrift3_42s_linear_infinite]" style={{top: '14%', left: '30%'}}>
      <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg" className="w-24 sm:w-32 md:w-36" style={{overflow: 'visible'}}>
        {/* Mid Bird 1 */}
        <g opacity="0.38">
          <path d="M65,38 Q58,30 50,34" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 65 38;27 65 38;-9 65 38;0 65 38" keyTimes="0;0.35;0.75;1" dur="0.95s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M65,38 Q72,30 80,34" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 65 38;-27 65 38;9 65 38;0 65 38" keyTimes="0;0.35;0.75;1" dur="0.95s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Mid Bird 2 */}
        <g opacity="0.35">
          <path d="M46,47 Q41,41 36,43" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 46 47;30 46 47;-8 46 47;0 46 47" keyTimes="0;0.35;0.75;1" dur="1.05s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M46,47 Q51,41 56,43" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 46 47;-30 46 47;8 46 47;0 46 47" keyTimes="0;0.35;0.75;1" dur="1.05s" repeatCount="indefinite" begin="0.2s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Mid Bird 3 */}
        <g opacity="0.36">
          <path d="M88,42 Q83,36 77,38" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 88 42;25 88 42;-10 88 42;0 88 42" keyTimes="0;0.35;0.75;1" dur="0.88s" repeatCount="indefinite" begin="0.3s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M88,42 Q93,36 99,38" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 88 42;-25 88 42;10 88 42;0 88 42" keyTimes="0;0.35;0.75;1" dur="0.88s" repeatCount="indefinite" begin="0.3s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
        {/* Mid Bird 4 - smaller, higher */}
        <g opacity="0.32">
          <path d="M70,26 Q66,21 61,23" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 70 26;33 70 26;-7 70 26;0 70 26" keyTimes="0;0.35;0.75;1" dur="0.82s" repeatCount="indefinite" begin="0.15s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
          <path d="M70,26 Q74,21 79,23" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 70 26;-33 70 26;7 70 26;0 70 26" keyTimes="0;0.35;0.75;1" dur="0.82s" repeatCount="indefinite" begin="0.15s" calcMode="spline" keySplines="0.4 0 0.6 1;0.3 0 0.7 1;0.4 0 0.6 1" />
          </path>
        </g>
      </svg>
    </div>
  </div>

  {/* LAYER 2 : TITRE — Smaller, Single Line */}
  <div 
    className="relative z-[25] text-center px-4 w-full flex flex-col items-center mb-16 sm:mb-20 md:mb-28 lg:mb-36 pointer-events-none animate-[fadeInScale_1.8s_ease-out_0.3s_forwards]"
    style={{ 
      transform: `translateY(${scrollY * 0.12}px) scale(${1 - scrollY * 0.0001})`,
      transformOrigin: 'center',
      opacity: Math.max(0.3, 1 - scrollY * 0.001)
    }}
  >
    {/* Dark contrast backdrop behind text */}
    <div className="absolute inset-0 blur-[60px] opacity-40"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 65%)',
        transform: 'scale(1.5)'
      }}
    ></div>
    
    {/* Golden glow behind text */}
    <div className="absolute inset-0 blur-[80px] opacity-40 animate-[breathingGlow_5s_ease-in-out_infinite]"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(248,178,0,0.5) 0%, rgba(248,178,0,0.2) 40%, transparent 60%)',
        transform: 'scale(1.3)'
      }}
    ></div>
    
    {/* Main Title — Single line, smaller */}
    <h1 
      className="font-serif italic font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-none tracking-tight relative z-10 text-[#f8b200] animate-[titleReveal_1.2s_ease-out_0.4s_forwards] opacity-0"
      style={{
        fontFamily: "'IvyPresto Display', 'Playfair Display', Georgia, serif",
        letterSpacing: '-0.02em',
        textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), 0 0 40px rgba(248,178,0,0.5), 0 0 80px rgba(248,178,0,0.25)',
        WebkitTextStroke: '1px rgba(0,0,0,0.12)',
        paintOrder: 'stroke fill'
      }}
    >
      Pavillon Temporaire
    </h1>
    
    {/* Decorative line under title */}
    <div className="flex items-center gap-3 mt-4 sm:mt-6 animate-[titleReveal_1s_ease-out_0.8s_forwards] opacity-0">
      <div className="w-10 sm:w-20 h-[2px] bg-gradient-to-r from-transparent to-[#f8b200]/70 rounded-full"></div>
      <div className="w-2 h-2 rounded-full bg-[#f8b200] shadow-[0_0_10px_rgba(248,178,0,0.6)]"></div>
      <div className="w-10 sm:w-20 h-[2px] bg-gradient-to-l from-transparent to-[#f8b200]/70 rounded-full"></div>
    </div>
  </div>

  {/* LAYER 3 : FOREGROUND (Villa Oasis) — Enhanced Parallax with Float Animation */}
  <div 
    className="absolute inset-x-0 bottom-0 z-20 pointer-events-none flex justify-center animate-[floatUpFromBottom_3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
    style={{ 
      transform: `translateY(${scrollY * -0.08}px) scale(${1 + scrollY * 0.00005})`
    }}
  >
    <div className="relative w-full flex justify-center">
      <img 
        src="/oasisROOFTOP-transparent.png"
        alt="Villa Oasis" 
        className="w-full h-auto max-h-[70vh] sm:max-h-[75vh] md:max-h-[80vh] lg:max-h-[85vh] object-cover object-bottom select-none animate-[gentleFloat_7s_ease-in-out_infinite]"
        draggable="false"
        style={{
          filter: 'drop-shadow(0 -25px 50px rgba(0,0,0,0.3)) drop-shadow(0 -15px 30px rgba(125,175,171,0.2)) brightness(1.05) contrast(1.03)'
        }}
      />
      
      {/* Subtle atmospheric haze — minimal to keep building clean */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7dafab]/40 via-[#7dafab]/15 to-transparent animate-[fadeIn_3s_ease-out_forwards]"></div>
      </div>
    </div>
    
    {/* Clean bottom edge transition */}
    <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 pointer-events-none animate-[fadeIn_3s_ease-out_forwards]"
      style={{
        background: 'linear-gradient(to top, #7dafab 0%, rgba(125,175,171,0.5) 50%, transparent 100%)'
      }}
    ></div>
  </div>

  {/* LAYER 4 : BOUTONS ET TEXTES AU PREMIER PLAN */}
  <div 
    className="absolute z-30 bottom-0 left-0 right-0 flex flex-col items-center w-full pointer-events-auto"
    style={{
      transform: `translateY(${scrollY * 0.05}px)`,
      opacity: Math.max(0.5, 1 - scrollY * 0.0008)
    }}
  >
    {/* Dark gradient backdrop for readability */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.25) 60%, transparent 100%)'
    }}></div>
    
    <div className="relative z-10 flex flex-col items-center pb-6 sm:pb-10 pt-16 sm:pt-24 px-4">
    
    {/* Subtitle — Animated with Entrance Effect */}
    <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 animate-fadeInUp opacity-0" style={{ animationDelay: '1.2s' }}>
      <div className="h-[1px] w-0 sm:w-0 bg-gradient-to-r from-transparent to-[#f8b200]/70 animate-[expandLine_1.2s_ease-out_1.2s_forwards] origin-right"></div>
      <h3 className="text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm md:text-base font-sans font-bold text-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/30" style={{fontFamily: "'Effra', 'Inter', system-ui, sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.6)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)'}}>
        {i18n.language === 'fr' ? 'Fondation Jardin Majorelle Prize 2026' : 'Fondation Jardin Majorelle Prize 2026'}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmerMove_3s_ease-in-out_infinite] pointer-events-none rounded-full"></span>
      </h3>
      <div className="h-[1px] w-0 sm:w-0 bg-gradient-to-l from-transparent to-[#f8b200]/70 animate-[expandLine_1.2s_ease-out_1.2s_forwards] origin-left"></div>
    </div>

    {/* Enhanced Buttons with Advanced Hover Effects */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7 w-full sm:w-auto animate-fadeInUp opacity-0 mb-6" style={{ animationDelay: '1.4s' }}>
      
      {/* Bouton Inscription — Premium Gold Style */}
      <a 
        href="#inscription"
        className="group/btn relative px-12 py-5 bg-gradient-to-br from-[#f8b200] via-[#e5a400] to-[#d99900] text-white uppercase tracking-[0.25em] text-sm sm:text-xs font-bold rounded-xl transition-all duration-500 hover:from-[#ffbe1a] hover:via-[#f8b200] hover:to-[#e5a400] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(248,178,0,0.5)] w-full sm:w-auto text-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-2 border-white/40 hover:border-white/60 overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 bg-white/30 rounded-xl scale-0 group-hover/btn:scale-110 opacity-0 group-hover/btn:opacity-20 transition-all duration-700 blur-md"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
        
        <span className="relative z-10 flex items-center justify-center gap-3" style={{fontFamily: "'Effra', 'Inter', system-ui, sans-serif"}}>
          <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          {i18n.language === 'fr' ? 'Inscription' : 'Register'}
          <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </span>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/60 rounded-tl-xl opacity-0 group-hover/btn:opacity-100 group-hover/btn:w-6 group-hover/btn:h-6 transition-all duration-300"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/60 rounded-br-xl opacity-0 group-hover/btn:opacity-100 group-hover/btn:w-6 group-hover/btn:h-6 transition-all duration-300"></div>
      </a>

      {/* Bouton Télécharger — Ultra Premium Glass Effect */}
      <a 
        href="/Cahier_des_Charges_Jardin_Majorelle_2026.pdf" 
        target="_blank"
        className="group/btn relative px-12 py-5 border-2 border-white/90 bg-white/15 backdrop-blur-xl text-white hover:bg-white hover:text-[#336d68] uppercase tracking-[0.25em] text-sm sm:text-xs font-bold rounded-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,255,255,0.4)] w-full sm:w-auto flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-white overflow-hidden"
      >
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
        
        {/* Multiple shimmer layers */}
        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"></div>
        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1200 delay-150 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
        
        <svg className="relative z-10 w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="relative z-10 font-bold" style={{fontFamily: "'Effra', 'Inter', system-ui, sans-serif"}}>{i18n.language === 'fr' ? 'Télécharger le brief' : 'Download Brief'}</span>
        <svg className="relative z-10 w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        
        {/* Expanding circle on hover */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 group-hover/btn:w-full group-hover/btn:h-full bg-white/30 rounded-xl transition-all duration-700 -z-10"></div>
      </a>
    </div>

    {/* Scroll Indicator — Clean */}
    <div 
      className="mt-6 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer animate-fadeInUp opacity-0 group/scroll" 
      style={{ animationDelay: '1.6s' }} 
      onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}
    >
      <p className="text-white/90 text-xs sm:text-[10px] uppercase tracking-[0.3em] font-bold" style={{fontFamily: "'Effra', 'Inter', system-ui, sans-serif", textShadow: '0 1px 4px rgba(0,0,0,0.5)'}}>
        {i18n.language === 'fr' ? 'Découvrir' : 'Discover'}
      </p>
      <svg className="w-5 h-5 text-white/80 animate-[bounce_2s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>

    </div>
  </div>

  <style dangerouslySetInnerHTML={{__html: `
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      33% { background-position: 100% 25%; }
      66% { background-position: 50% 75%; }
    }
    
    @keyframes horizonPulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
    
    @keyframes auroraDrift {
      0%, 100% { transform: translateX(-5%) skewX(-2deg); opacity: 0.15; }
      50% { transform: translateX(5%) skewX(2deg); opacity: 0.25; }
    }

    /* ═══ BIRDS — flock drift across the sky with natural bobbing ═══ */
    @keyframes birdsDrift1 {
      0%   { transform: translateX(0) translateY(0); }
      10%  { transform: translateX(12vw) translateY(-14px); }
      22%  { transform: translateX(26vw) translateY(-4px); }
      35%  { transform: translateX(42vw) translateY(10px); }
      48%  { transform: translateX(58vw) translateY(2px); }
      62%  { transform: translateX(74vw) translateY(-12px); }
      78%  { transform: translateX(94vw) translateY(-5px); }
      90%  { transform: translateX(110vw) translateY(6px); }
      100% { transform: translateX(125vw) translateY(0); }
    }
    @keyframes birdsDrift2 {
      0%   { transform: translateX(0) translateY(0); }
      15%  { transform: translateX(14vw) translateY(10px); }
      32%  { transform: translateX(32vw) translateY(-6px); }
      50%  { transform: translateX(56vw) translateY(12px); }
      68%  { transform: translateX(76vw) translateY(-3px); }
      85%  { transform: translateX(100vw) translateY(-9px); }
      100% { transform: translateX(125vw) translateY(3px); }
    }
    @keyframes birdsDrift3 {
      0%   { transform: translateX(0) translateY(0); }
      18%  { transform: translateX(18vw) translateY(-8px); }
      38%  { transform: translateX(38vw) translateY(6px); }
      55%  { transform: translateX(55vw) translateY(-10px); }
      72%  { transform: translateX(72vw) translateY(4px); }
      88%  { transform: translateX(92vw) translateY(-6px); }
      100% { transform: translateX(115vw) translateY(0); }
    }

    /* ═══ GOLDEN DUST — floating upward like sunset pollen ═══ */
    @keyframes goldenDustRise1 {
      0%   { transform: translate(0, 0) scale(1); opacity: 0; }
      8%   { opacity: 0.7; }
      50%  { transform: translate(30px, -45vh) scale(1.2); opacity: 0.85; }
      85%  { opacity: 0.4; }
      100% { transform: translate(50px, -80vh) scale(0.6); opacity: 0; }
    }
    @keyframes goldenDustRise2 {
      0%   { transform: translate(0, 0) scale(1); opacity: 0; }
      10%  { opacity: 0.6; }
      50%  { transform: translate(-40px, -50vh) scale(0.9); opacity: 0.75; }
      90%  { opacity: 0.3; }
      100% { transform: translate(-20px, -85vh) scale(0.5); opacity: 0; }
    }
    @keyframes goldenDustRise3 {
      0%   { transform: translate(0, 0) scale(1); opacity: 0; }
      12%  { opacity: 0.55; }
      50%  { transform: translate(20px, -40vh) scale(1.4); opacity: 0.7; }
      88%  { opacity: 0.25; }
      100% { transform: translate(-10px, -75vh) scale(0.7); opacity: 0; }
    }

    /* ═══ SUN RAYS — gentle swaying beams ═══ */
    @keyframes sunRaySway1 {
      0%, 100% { transform: rotate(-8deg) scaleX(1); opacity: 0.7; }
      50%      { transform: rotate(-4deg) scaleX(1.15); opacity: 1; }
    }
    @keyframes sunRaySway2 {
      0%, 100% { transform: rotate(5deg) scaleX(1); opacity: 0.6; }
      50%      { transform: rotate(8deg) scaleX(1.1); opacity: 0.9; }
    }
    @keyframes sunGlowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50%      { opacity: 0.8; transform: scale(1.05); }
    }

    /* ═══ LEAF SHADOWS — breeze sway ═══ */
    @keyframes leafSwayLeft {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      30%      { transform: translate(5px, 3px) rotate(1.5deg); }
      70%      { transform: translate(-3px, -2px) rotate(-1deg); }
    }
    @keyframes leafSwayRight {
      0%, 100% { transform: scaleX(-1) translate(0, 0) rotate(0deg); }
      40%      { transform: scaleX(-1) translate(-4px, 2px) rotate(-1.2deg); }
      60%      { transform: scaleX(-1) translate(3px, -3px) rotate(0.8deg); }
    }
    @keyframes leafSwayTop {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      35%      { transform: translate(3px, 2px) rotate(0.6deg); }
      65%      { transform: translate(-2px, -1px) rotate(-0.4deg); }
    }
    
    @keyframes scrollBounce {
      0%, 100% { opacity: 0; transform: translateY(-12px); }
      50% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes floatFromBottom {
      from {
        opacity: 0;
        transform: translateY(30%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1.05);
      }
    }
    
    @keyframes floatUpFromBottom {
      from {
        opacity: 0;
        transform: translateY(120px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes gentleFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.85) translateY(40px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes titleReveal {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
        filter: blur(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0px);
      }
    }
    
    @keyframes breathingGlow {
      0%, 100% { 
        opacity: 0.4;
        transform: scale(1.5);
      }
      50% { 
        opacity: 0.65;
        transform: scale(1.7);
      }
    }
    
    @keyframes sparkle {
      0%, 100% { 
        opacity: 0;
        transform: scale(0) rotate(0deg);
      }
      50% { 
        opacity: 1;
        transform: scale(1) rotate(180deg);
      }
    }
    
    @keyframes lightPulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
    
    @keyframes rotateRays {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes rotateRaysReverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    
    @keyframes expandLine {
      from { width: 0; }
      to { width: 3rem; }
    }
    
    @media (min-width: 640px) {
      @keyframes expandLine {
        from { width: 0; }
        to { width: 5rem; }
      }
    }
    
    @keyframes shimmerMove {
      0% { transform: translateX(-150%) skew(-12deg); }
      100% { transform: translateX(150%) skew(-12deg); }
    }
    
    @keyframes buttonGlow {
      0%, 100% { 
        box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 0 rgba(125,175,171,0.4);
      }
      50% { 
        box-shadow: 0 15px 40px rgba(0,0,0,0.4), 0 0 30px rgba(125,175,171,0.5);
      }
    }
    
    @keyframes waterShimmer {
      0%, 100% { 
        opacity: 0.3;
        transform: translateX(0);
      }
      50% { 
        opacity: 0.5;
        transform: translateX(10px);
      }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 1s ease-out forwards;
    }
  `}} />

</section>






{/* --- ABOUT SECTION --- */}
<section className="relative py-16 sm:py-20 md:py-24 overflow-hidden" style={{backgroundColor: '#7dafab'}}>
  
  <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
    
    {/* Section Header — Centré comme dans la photo */}
    <div className="text-center mb-16 sm:mb-20 md:mb-28 animate-fadeInUp">
      <span className="inline-block bg-[#f8b200] text-white text-xs sm:text-sm uppercase tracking-[0.3em] font-bold px-6 py-2 rounded mb-6 sm:mb-8">
        {i18n.language === 'fr' ? 'À PROPOS' : 'ABOUT'}
      </span>
      <h2 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1]">
        {t('about.title')}
      </h2>
    </div>
    
    
    {/* Cards Grid — Style carte beige comme dans la photo */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
      
      {/* CARD 1: Le Défi */}
      <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.1s', backgroundColor: '#fffae3'}}>
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7dafab" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183230] text-center mb-4 uppercase tracking-wider" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.05em', fontWeight: 900}}>
            {t('about.challenge')}
          </h3>
          <div className="w-24 h-[2px] bg-[#7dafab] mx-auto mb-6"></div>
          <p className="font-sans text-[#183230] leading-relaxed text-sm sm:text-base text-justify">
            {t('about.challengeDesc')}
          </p>
        </div>
      </div>
      
      {/* CARD 2: Pourquoi Participer */}
      <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.2s', backgroundColor: '#fffae3'}}>
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7dafab" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v7.125M12 3.75v-1.5" />
              </svg>
            </div>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183230] text-center mb-4 uppercase tracking-wider" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.05em', fontWeight: 900}}>
            {t('about.why')}
          </h3>
          <div className="w-24 h-[2px] bg-[#7dafab] mx-auto mb-6"></div>
          <p className="font-sans text-[#183230] leading-relaxed text-sm sm:text-base text-justify">
            {t('about.whyDesc')}
          </p>
        </div>
      </div>
    </div>

    {/* Eligibility & Calendar — Side by side */}
    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
      
      {/* CALENDAR — Calendrier du Concours */}
      <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.3s', backgroundColor: '#fffae3'}}>
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7dafab" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183230] text-center mb-4 uppercase tracking-wider" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.05em', fontWeight: 900}}>
            {t('calendar.title')}
          </h3>
          <div className="w-24 h-[2px] bg-[#7dafab] mx-auto mb-8"></div>
          
          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7dafab] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">1</div>
              <span className="font-sans text-[#183230] text-sm sm:text-base leading-relaxed pt-1">{t('calendar.announcement')}</span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7dafab] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">2</div>
              <span className="font-sans text-[#183230] text-sm sm:text-base leading-relaxed pt-1">{t('calendar.deadline')}</span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7dafab] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">3</div>
              <span className="font-sans text-[#183230] text-sm sm:text-base leading-relaxed pt-1">{t('calendar.selection')}</span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7dafab] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">4</div>
              <span className="font-sans text-[#183230] text-sm sm:text-base leading-relaxed pt-1">{t('calendar.opening')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ELIGIBILITY — Critères d'Éligibilité */}
      <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.4s', backgroundColor: '#fffae3'}}>
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7dafab" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183230] text-center mb-4 uppercase tracking-wider" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.05em', fontWeight: 900}}>
            {t('about.eligibility')}
          </h3>
          <div className="w-24 h-[2px] bg-[#7dafab] mx-auto mb-8"></div>
          
          <ul className="space-y-4">
            {t('about.eligibilityItems', { returnObjects: true }).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#183230] font-bold text-lg leading-none mt-0.5">•</span>
                <span className="font-sans text-[#183230] leading-relaxed text-sm sm:text-base text-justify">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* CAHIER DES CHARGES — Full-width CTA */}
    <div className="relative rounded-2xl overflow-hidden animate-fadeInUp" style={{animationDelay: '0.5s', backgroundColor: '#fffae3'}}>
      <div className="relative z-10 p-8 sm:p-10 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#7dafab" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#183230] mb-4 uppercase tracking-wider" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.05em', fontWeight: 900}}>
          {i18n.language === 'fr' ? 'Cahier des Charges' : 'Terms of Reference'}
        </h3>
        <div className="w-24 h-[2px] bg-[#7dafab] mx-auto mb-6"></div>
        <p className="font-sans text-[#183230] leading-relaxed text-sm sm:text-base max-w-2xl mx-auto mb-8 text-justify">
          {i18n.language === 'fr' 
            ? "Consultez le document détaillé comprenant toutes les spécifications techniques, le règlement complet et les plans de la Villa Oasis."
            : "Access the detailed document including all technical specifications, full regulations, and Villa Oasis plans."
          }
        </p>

        <a 
          href="/Cahier_des_Charges_Jardin_Majorelle_2026.pdf" 
          download="Cahier_des_Charges_Jardin_Majorelle_2026.pdf"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 hover:scale-105 text-white bg-[#f8b200] hover:bg-[#ffbe1a] shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{i18n.language === 'fr' ? 'Consulter le Cahier des Charges' : 'View Terms of Reference'}</span>
        </a>
      </div>
    </div>
  </div>

  {/* Add fadeInUp animation */}
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeInUp {
      animation: fadeInUp 0.8s ease-out forwards;
    }
  `}} />
</section>





{/* --- MAIN CONTENT --- */}
<main id="inscription" className="max-w-6xl mx-auto px-6 my-12">
  
  {/* Titre Mobile (Visible seulement sur petit écran) */}
  <div className="text-center md:hidden mb-8">
    <h1 className="font-serif font-bold text-deepTeal-800 text-xl tracking-widest uppercase">
      {t('title')}
    </h1>
  </div>

  {/* --- ÉCRAN SUCCÈS --- */}
  {success ? (
    <div className="relative bg-gradient-to-br from-white via-amber-50/40 to-white border-t-4 border-amber-500 p-12 md:p-16 rounded-3xl shadow-2xl text-center animate-fade-in-up overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-full filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 rounded-full filter blur-3xl opacity-15 -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Success icon with animation */}
      <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/40 animate-bounce-once">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-25"></div>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-deepTeal-800 mb-4 tracking-tight">
        {t('messages.success')}
      </h2>
      <p className="text-deepTeal-700 mb-8 leading-relaxed text-lg max-w-2xl mx-auto text-justify">
        {t('messages.successDetail')}
      </p>
      
      {/* Next steps card */}
      <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl mb-8 border-2 border-teal-100 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="font-serif font-bold text-deepTeal-800 mb-3 text-xl">
          {t('messages.nextStep')}
        </h3>
        <p className="text-deepTeal-700 text-sm sm:text-base leading-relaxed text-justify">
          {t('messages.nextStepDetail')}
        </p>
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{i18n.language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
      </button>
    </div>
  ) : (
    
    /* --- FORMULAIRE --- */
    <div ref={formTopRef} className="relative rounded-2xl overflow-hidden" style={{background: 'linear-gradient(165deg, #183230 0%, #1f4a46 30%, #2a5f5a 60%, #336d68 100%)'}}>
      
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{background: 'radial-gradient(circle, rgba(248,178,0,0.08) 0%, transparent 70%)'}}></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full" style={{background: 'radial-gradient(circle, rgba(125,175,171,0.12) 0%, transparent 70%)'}}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)'}}></div>
      </div>
      
      <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20">
      
      {/* Section Header */}
      <div className="mb-16 sm:mb-20 md:mb-24">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[#f8b200] shadow-lg">
                <span className="text-[#183230] font-bold text-lg sm:text-xl">1</span>
              </div>
              <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f8b200] animate-ping opacity-25"></div>
            </div>
            <div className="h-[2px] w-16 sm:w-20 bg-gradient-to-r from-[#f8b200] to-white/20 rounded-full"></div>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
            <span className="text-white/60 font-bold text-lg sm:text-xl">2</span>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-2 text-[#f8b200] text-[10px] sm:text-xs uppercase tracking-[0.4em] font-bold px-6 py-2 rounded-full bg-[#f8b200]/10 border border-[#f8b200]/20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            {i18n.language === 'fr' ? 'Pré-Inscription' : 'Pre-Registration'}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white text-center mb-5 sm:mb-6 tracking-tight leading-tight">
          {t('step1')}
        </h2>
        
        {/* Subtitle */}
        <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-center leading-relaxed mb-8 font-light">
          {t('subtitle')}
        </p>
        
        {/* Description */}
        <p className="text-white/60 text-sm sm:text-base max-w-3xl mx-auto text-center leading-relaxed mb-10 font-light">
          {t('intro')}
        </p>

        {/* Deadline badge — Enhanced Design */}
        <div className="flex justify-center">
          <div className="group relative inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer" style={{background: 'linear-gradient(135deg, rgba(248,178,0,0.15) 0%, rgba(248,178,0,0.08) 100%)', border: '2px solid rgba(248,178,0,0.4)'}}>
            {/* Animated glow background */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg" style={{background: 'radial-gradient(circle, rgba(248,178,0,0.3) 0%, transparent 70%)'}}></div>
            
            {/* Pulsing inner border */}
            <div className="absolute inset-0 rounded-full border-2 border-[#f8b200]" style={{boxShadow: '0 0 20px rgba(248,178,0,0.4), inset 0 0 20px rgba(248,178,0,0.1)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
            
            {/* Clock icon with animation */}
            <div className="relative z-10">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#f8b200] group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* Animated pulse dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#f8b200] rounded-full animate-pulse shadow-[0_0_8px_rgba(248,178,0,0.8)]"></div>
            </div>
            
            {/* Text with gradient */}
            <span className="relative z-10 text-white font-bold text-sm sm:text-base bg-gradient-to-br from-white via-[#f8b200]/40 to-white bg-clip-text text-transparent group-hover:from-[#f8b200] group-hover:to-[#ffc940] transition-all duration-500">
              {t('deadline')}
            </span>
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 rounded-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
      {error && (
        <div ref={errorMessageRef} className="mb-8 p-5 sm:p-6 rounded-xl border-l-4 border-red-500 text-red-100 text-sm relative backdrop-blur-sm animate-shake" style={{background: 'rgba(220, 38, 38, 0.15)'}}>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold mb-1 text-white">{i18n.language === 'fr' ? 'Erreur' : 'Error'}</h3>
              <span className="leading-relaxed text-red-100">{error}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* 1. Identité */}
        <div className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7dafab] to-[#7dafab]/30 rounded-l-2xl group-hover:w-1.5 transition-all duration-500"></div>
          
          <div className="relative z-10 p-7 sm:p-9">
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#7dafab" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">{i18n.language === 'fr' ? 'Identité' : 'Identity'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>{t('fields.nom')} *</label>
                <input required type="text" name="nom" onChange={handleChange} className={inputClass} minLength="2" maxLength="100" pattern="[A-Za-zÀ-ÿ\s\-']+" title="Please enter a valid last name (letters only)" />
              </div>
              <div>
                <label className={labelClass}>{t('fields.prenom')} *</label>
                <input required type="text" name="prenom" onChange={handleChange} className={inputClass} minLength="2" maxLength="100" pattern="[A-Za-zÀ-ÿ\s\-']+" title="Please enter a valid first name (letters only)" />
              </div>
            </div>
            <div className="mt-6">
              <label className={labelClass}>{t('fields.naissance')} *</label>
              <input required type="date" name="date_naissance" onChange={handleChange} className={inputClass} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} min={new Date(new Date().setFullYear(new Date().getFullYear() - 39)).toISOString().split('T')[0]} />
            </div>
          </div>
        </div>

        {/* 2. Documents (CIN) */}
        <div className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f8b200] to-[#f8b200]/30 rounded-l-2xl group-hover:w-1.5 transition-all duration-500"></div>
          
          <div className="relative z-10 p-7 sm:p-9">
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#f8b200]/15 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#f8b200" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">{t('fields.cin')} *</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-6">
              <CustomFileUpload label="Recto" name="cin_recto" file={formData.cin_recto} inputRef={cinRectoInputRef} required={true} />
              <CustomFileUpload label="Verso" name="cin_verso" file={formData.cin_verso} inputRef={cinVersoInputRef} required={true} />
            </div>
            <div className="p-4 rounded-xl border border-[#f8b200]/20" style={{background: 'rgba(248,178,0,0.08)'}}>
              <p className="text-sm text-[#f8b200]/90 flex items-start">
                <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">{t('messages.fileSize')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Contact */}
        <div className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7dafab] to-[#7dafab]/30 rounded-l-2xl group-hover:w-1.5 transition-all duration-500"></div>
          
          <div className="relative z-10 p-7 sm:p-9">
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#7dafab]/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#7dafab" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">Contact</h3>
            </div>
            <div className="mb-6">
              <label className={labelClass}>{t('fields.adresse')} *</label>
              <textarea required name="adresse" rows="3" onChange={handleChange} className={inputClass + " resize-none"} minLength="10" maxLength="500" placeholder="Enter your complete address"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>{t('fields.email')} *</label>
                <input required type="email" name="email" onChange={handleChange} className={inputClass} pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}" title="Please enter a valid email address" placeholder="example@email.com" />
              </div>
              <div>
                <label className={labelClass}>{t('fields.phone')} *</label>
                <div className="flex">
                  <select name="phone_code" onChange={handleChange} className="px-3 py-3 border border-r-0 border-white/10 rounded-l-lg bg-white/5 text-xs font-bold text-white outline-none focus:border-[#7dafab] transition-colors">
                    <option value="+212">🇲🇦 +212</option>
                  </select>
                  <input required type="tel" name="phone_number" onChange={handleChange} className={`${inputClass} rounded-l-none border-l-0`} pattern="[0-9]{9,10}" title="Please enter a valid phone number (9-10 digits)" placeholder="6XXXXXXXX" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Statut */}
        <div className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f8b200] to-[#f8b200]/30 rounded-l-2xl group-hover:w-1.5 transition-all duration-500"></div>
          
          <div className="relative z-10 p-7 sm:p-9">
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#f8b200]/15 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#f8b200" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">Statut Professionnel</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>{t('fields.ecole')} *</label>
                <input required type="text" name="ecole_archi" onChange={handleChange} className={inputClass} minLength="3" maxLength="200" placeholder="Architecture School Name" />
              </div>
              <div>
                <label className={labelClass}>{t('fields.diplome')} *</label>
                <input required type="text" name="diplome" onChange={handleChange} className={inputClass} placeholder="e.g., State Architect Degree" minLength="5" maxLength="255" />
              </div>
              <div>
                <label className={labelClass}>{t('fields.annee')} *</label>
                <input required type="number" name="annee_obtention" onChange={handleChange} className={inputClass} min="1980" max={new Date().getFullYear()} placeholder={new Date().getFullYear().toString()} />
              </div>
              <div>
                <label className={labelClass}>{t('fields.ordre')} (CNOA) *</label>
                <input required type="text" name="num_ordre" onChange={handleChange} className={inputClass} pattern="[A-Za-z0-9\-]+" title="Please enter a valid CNOA number" placeholder="CNOA Number" />
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="pt-8">
          <label className="flex items-start cursor-pointer p-5 sm:p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all" style={{background: 'rgba(255,255,255,0.04)'}}>
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded border-2 border-white/30 text-[#f8b200] focus:ring-2 focus:ring-[#f8b200]/30 cursor-pointer flex-shrink-0 bg-white/5" />
            <span className="ml-4 text-white/80 text-sm leading-relaxed">
              {i18n.language === 'fr' ? (
                <>
                  J'accepte les{' '}
                  <a href="/Reglement.pdf" target="_blank" rel="noopener noreferrer" className="font-bold text-[#f8b200] hover:text-[#ffc940] underline transition-colors">termes et conditions</a>
                  {' '}du concours et confirme que toutes les informations fournies sont exactes.
                </>
              ) : (
                <>
                  I accept the{' '}
                  <a href="/Reglement.pdf" target="_blank" rel="noopener noreferrer" className="font-bold text-[#f8b200] hover:text-[#ffc940] underline transition-colors">terms and conditions</a>
                  {' '}of the competition and confirm that all information provided is accurate.
                </>
              )}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <button disabled={loading || !acceptedTerms} type="submit" className="relative w-full font-bold py-5 sm:py-6 px-6 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest text-sm sm:text-base flex items-center justify-center gap-4 group overflow-hidden text-[#183230] bg-[#f8b200] hover:bg-[#ffbe1a] shadow-[0_4px_20px_rgba(248,178,0,0.3)] hover:shadow-[0_8px_30px_rgba(248,178,0,0.4)] hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="relative z-10">{i18n.language === 'fr' ? 'Traitement en cours...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <span className="relative z-10">{i18n.language === 'fr' ? 'Soumettre Inscription' : 'Submit Registration'}</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          <p className="text-center text-sm text-white/60 mt-6 leading-relaxed font-light">
            {t('messages.footer')}
          </p>
        </div>

      </form>
      </div>
    </div>
  )}
</main>

{/* Add custom animations */}
<style dangerouslySetInnerHTML={{__html: `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in-left {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fade-in-right {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes bounce-once {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  
  .animate-fade-in-left {
    animation: fade-in-left 0.6s ease-out forwards;
  }
  
  .animate-fade-in-right {
    animation: fade-in-right 0.6s ease-out forwards;
  }
  
  .animate-bounce-once {
    animation: bounce-once 1s ease-in-out;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`}} />







      {/* Footer */}
      <footer className="relative text-deepTeal-800 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10 overflow-hidden" style={{background: 'linear-gradient(135deg, #f8b200 0%, #d99900 50%, #f8b200 100%)'}}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full blur-3xl opacity-20" style={{background: 'radial-gradient(circle, #336d68 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full blur-3xl opacity-20" style={{background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* About */}
            <div className="group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-ivory-200 hover:border-teal-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: '#fff9d4'}}>
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background: 'linear-gradient(135deg, #336d68 0%, #183230 100%)'}}>
                  {/* SVG Building/Museum Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[#183230]">
                  FONDATION JARDIN MAJORELLE
                </h3>
              </div>
              <p className="text-[#183230] leading-relaxed text-base sm:text-lg md:text-xl text-justify">
                {i18n.language === 'fr' ? 
                  "Institution culturelle dédiée à la botanique, aux cultures berbères, à la mode, aux arts décoratifs et à la création contemporaine." :
                  "Cultural institution dedicated to botany, Berber cultures, fashion, decorative arts and contemporary creation."
                }
              </p>
              {/* Logo in footer */}
           
            </div>
            
            {/* Contact */}
            <div className="group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-ivory-200 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: '#fff9d4'}}>
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3" style={{background: 'linear-gradient(135deg, #f8b200 0%, #d99900 100%)'}}>
                  {/* SVG Mail Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[#183230]">
                  Contact
                </h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-base sm:text-lg md:text-xl">
                {/* Email */}
                <li className="flex items-center text-[#183230] hover:text-amber-700 transition-colors cursor-pointer font-normal text-justify">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {t('contact.email')}
                </li>

                {/* Lien 1 : Jardin Majorelle */}
                <li className="flex items-center text-[#183230] hover:text-amber-700 transition-colors font-normal text-justify">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <a href="https://www.jardinmajorelle.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    www.jardinmajorelle.com
                  </a>
                </li>

                {/* Lien 2 : Musée YSL */}
                <li className="flex items-center text-[#183230] hover:text-amber-700 transition-colors font-normal text-justify">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <a href="https://www.museeyslmarrakech.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    www.museeyslmarrakech.com
                  </a>
                </li>

                {/* Adresse */}
                <li className="flex items-start text-[#183230] font-normal text-justify">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Jardin Majorelle & musée YVES SAINT LAURENT marrakech</span>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div className="group p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-ivory-200 hover:border-teal-400 transition-all duration-300 hover:shadow-2xl shadow-xl hover:-translate-y-1" style={{background: '#fff9d4'}}>
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background: 'linear-gradient(135deg, #336d68 0%, #183230 100%)'}}>
                  {/* SVG Scale/Legal Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[#183230]">
                  {i18n.language === 'fr' ? 'Informations Légales' : 'Legal Information'}
                </h3>
              </div>
              <p className="text-[#183230] text-base sm:text-lg md:text-xl leading-relaxed text-justify">
                {i18n.language === 'fr' ?
                  "Ce concours est organisé par la Fondation Jardin Majorelle conformément à la réglementation en vigueur. Les données collectées sont utilisées uniquement dans le cadre du concours." :
                  "This competition is organized by the Fondation Jardin Majorelle in accordance with current regulations. Data collected is used solely for competition purposes."
                }
              </p>
            </div>
          </div>
          
          {/* Enhanced Copyright Section with Logo - Centered Professional Design */}
          <div className="pt-5 sm:pt-6 md:pt-7 mt-4 sm:mt-5 md:mt-6 border-t-2 border-ivory-300">
            <div className="relative p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-deepTeal-600 overflow-hidden" style={{background: 'linear-gradient(135deg, #2C3E3B 0%, #1a2928 100%)'}}>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{background: 'radial-gradient(circle, #f8b200 0%, transparent 70%)'}}></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 blur-3xl" style={{background: 'radial-gradient(circle, #7dafab 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10 text-center">
                
                {/* Logo - Centered */}
                <div className="flex justify-center mb-4">
                  <img 
                    src={logo} 
                    alt="Fondation Jardin Majorelle" 
                    className="h-12 sm:h-16 md:h-20 w-auto object-contain opacity-95 hover:opacity-100 transition-all duration-300 hover:scale-105 drop-shadow-[0_0_20px_rgba(248,178,0,0.3)]" 
                  />
                </div>
                
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#f8b200] to-transparent"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f8b200] animate-pulse"></div>
                  <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#f8b200] to-transparent"></div>
                </div>
                
                {/* Copyright - Centered */}
                <div className="mb-4">
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wide flex items-center justify-center gap-2 flex-wrap">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#f8b200]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                      <path d="M9.5 9.5a1.5 1.5 0 011.5-1.5h.01a1.5 1.5 0 010 3H11a1.5 1.5 0 01-1.5-1.5z" />
                    </svg>
                    <span>{new Date().getFullYear()} Fondation Jardin Majorelle - {i18n.language === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}</span>
                  </p>
                </div>
                
                {/* Competition Title - Centered */}
                <div className="pt-4 border-t border-white/10 max-w-4xl mx-auto">
                  <h4 className="text-white text-base sm:text-lg md:text-xl font-bold mb-2 tracking-wide text-center" style={{textShadow: '0 2px 10px rgba(248,178,0,0.2)'}}>
                    {i18n.language === 'fr' ? 'Prix Fondation Jardin Majorelle' : 'Fondation Jardin Majorelle Prize'}
                  </h4>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg font-medium opacity-90 leading-relaxed px-4 text-center mx-auto max-w-3xl">
                    {i18n.language === 'fr' 
                      ? 'Pour la Conception du Nouveau Pavillon Temporaire de la Villa Oasis'
                      : 'For the Design of the New Temporary Pavilion of Villa Oasis'
                    }
                  </p>
                  
                  {/* Decorative Bottom Elements */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-1 h-1 rounded-full bg-[#7dafab] opacity-60"></div>
                    <div className="w-20 sm:w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="w-2 h-2 rounded-full border border-[#f8b200] opacity-70"></div>
                    <div className="w-20 sm:w-32 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent"></div>
                    <div className="w-1 h-1 rounded-full bg-[#7dafab] opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(248,178,0,0.6)] group animate-bounce-gentle"
          style={{background: 'linear-gradient(135deg, #f8b200 0%, #d99900 100%)'}}>
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-white group-hover:translate-y-[-2px] transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;