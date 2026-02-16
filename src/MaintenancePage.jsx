import { useTranslation } from 'react-i18next';
import logo from './assets/logo.png';

const MaintenancePage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-sand-50 to-accent-50 flex items-center justify-center p-4 font-sans">
      {/* Language Selector - Fixed position */}
      <div className="fixed top-6 right-6 z-50">
        <div className="flex bg-white rounded-full shadow-lg border-2 border-primary-100 overflow-hidden">
          <button
            onClick={() => changeLanguage('fr')}
            className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
              i18n.language === 'fr'
                ? 'bg-primary-600 text-white shadow-inner'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => changeLanguage('ar')}
            className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
              i18n.language === 'ar'
                ? 'bg-primary-600 text-white shadow-inner'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-6 py-3 text-sm font-bold transition-all duration-300 ${
              i18n.language === 'en'
                ? 'bg-primary-600 text-white shadow-inner'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-100">
            <img 
              src={logo} 
              alt="Logo Fondation Jardin Majorelle" 
              className="h-24 w-auto mx-auto"
            />
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-accent-100 rounded-full p-6">
            <svg className="w-16 h-16 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-primary-100 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-800 mb-6">
            {i18n.language === 'fr' && 'Maintenance en cours'}
            {i18n.language === 'ar' && 'جاري الصيانة'}
            {i18n.language === 'en' && 'Under Maintenance'}
          </h1>
          
          <div className="space-y-4 text-lg text-primary-600">
            {i18n.language === 'fr' && (
              <>
                <p>Notre site est actuellement en maintenance pour vous offrir une meilleure expérience.</p>
                <p className="font-semibold">Nous serons bientôt de retour !</p>
                <p className="text-sm text-primary-500 mt-4">
                  Pour toute question urgente, veuillez nous contacter à l'adresse email suivante.
                </p>
              </>
            )}
            {i18n.language === 'ar' && (
              <>
                <p>موقعنا قيد الصيانة حالياً لتقديم تجربة أفضل لك.</p>
                <p className="font-semibold">سنعود قريباً!</p>
                <p className="text-sm text-primary-500 mt-4">
                  لأي سؤال عاجل، يرجى التواصل معنا عبر البريد الإلكتروني.
                </p>
              </>
            )}
            {i18n.language === 'en' && (
              <>
                <p>Our website is currently under maintenance to provide you with a better experience.</p>
                <p className="font-semibold">We'll be back soon!</p>
                <p className="text-sm text-primary-500 mt-4">
                  For any urgent questions, please contact us via email.
                </p>
              </>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-8 p-6 bg-sand-50 rounded-2xl border border-sand-200">
            <p className="text-primary-700 font-medium">
              📧 contact@fondationjardinmajorelleprize.com
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="bg-primary-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full animate-pulse" 
                 style={{width: '60%'}}>
            </div>
          </div>
          <p className="text-primary-600 text-sm mt-3 font-medium">
            {i18n.language === 'fr' && 'Maintenance en cours...'}
            {i18n.language === 'ar' && 'جاري الصيانة...'}
            {i18n.language === 'en' && 'Maintenance in progress...'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-primary-500 text-sm">
          <p>© 2025 Fondation Jardin Majorelle - Prix d'Architecture 2026</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;