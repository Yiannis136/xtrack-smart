import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('el'); // 'el' for Greek, 'en' for English

  const translations = {
    el: {
      login: "Σύνδεση",
      heroTitle1: "Επαγγελματική Διαχείριση",
      heroTitle2: "Στόλου Οχημάτων",
      heroDescription: "Το XTrackSmart είναι η ολοκληρωμένη λύση για τη διαχείριση του στόλου οχημάτων σας. Παρακολουθήστε τα ταξίδια, διαχειριστείτε τους οδηγούς και δημιουργήστε αναλυτικές αναφορές με έναν απλό και φιλικό τρόπο.",
      registerNow: "Εγγραφή Τώρα",
      buySubscription: "Αγορά Συνδρομής",
      featuresTitle: "Βασικές Δυνατότητες",
      featuresSubtitle: "Όλα όσα χρειάζεστε για την αποτελεσματική διαχείριση του στόλου σας",
      howItWorksTitle: "Πώς Λειτουργεί",
      ctaTitle: "Έτοιμοι να Ξεκινήσετε;",
      ctaDescription: "Ξεκινήστε τη δωρεάν δοκιμή σας σήμερα και ανακαλύψτε πόσο εύκολη μπορεί να είναι η διαχείριση του στόλου σας.",
      startNow: "Ξεκινήστε Τώρα",
      seePrices: "Δείτε Τιμές",
      copyright: "© 2025 XTrackSmart. Όλα τα δικαιώματα κατοχυρωμένα.",
      footerTagline: "Επαγγελματική λύση διαχείρισης στόλου οχημάτων",
      features: [
        {
          title: "Διαχείριση Αδειών Χρήσης",
          description: "Πλήρης έλεγχος των αδειών χρήσης και συνδρομών με ειδοποιήσεις λήξης και εύκολη ανανέωση."
        },
        {
          title: "Διαχείριση Χρηστών & Ρόλων",
          description: "Υποστήριξη διαφορετικών ρόλων (Admin/User) με ξεχωριστά δικαιώματα και δυνατότητες."
        },
        {
          title: "Εισαγωγή Δεδομένων Tracking",
          description: "Ανέβασμα αρχείων CSV για οδηγούς (iButton) και οχήματα με αυτόματη επεξεργασία."
        },
        {
          title: "Αναφορές & Στατιστικά",
          description: "Αναλυτικές αναφορές ταξιδιών, ωρών εργασίας οδηγών και πλήρη στατιστικά στοιχεία."
        },
        {
          title: "Εξαγωγή σε PDF/Excel",
          description: "Εξαγωγή όλων των αναφορών σε μορφή PDF ή Excel για εύκολη διαχείριση και αρχειοθέτηση."
        },
        {
          title: "Backup & Restore",
          description: "Ασφαλής δημιουργία αντιγράφων ασφαλείας και επαναφορά όλων των δεδομένων σας."
        }
      ],
      howItWorks: [
        {
          title: "Εγγραφή & Ενεργοποίηση",
          description: "Εγγραφείτε στην πλατφόρμα και επιλέξτε το πρόγραμμα συνδρομής που σας ταιριάζει (1, 6 ή 12 μήνες)."
        },
        {
          title: "Εισαγωγή Δεδομένων",
          description: "Ανεβάστε τα αρχεία CSV με τα δεδομένα tracking των οδηγών (iButton) και των οχημάτων σας. Το σύστημα τα επεξεργάζεται αυτόματα."
        },
        {
          title: "Δημιουργία Αναφορών",
          description: "Δημιουργήστε αναφορές ταξιδιών και ωρών εργασίας, και εξάγετε τα αποτελέσματα σε PDF ή Excel για περαιτέρω ανάλυση."
        },
        {
          title: "Backup & Ασφάλεια",
          description: "Δημιουργήστε αντίγραφα ασφαλείας των δεδομένων σας ανά πάσα στιγμή και επαναφέρετε τα όποτε χρειαστεί."
        }
      ]
    },
    en: {
      login: "Login",
      heroTitle1: "Professional Fleet",
      heroTitle2: "Management",
      heroDescription: "XTrackSmart is the comprehensive solution for managing your vehicle fleet. Track trips, manage drivers, and generate detailed reports in a simple and user-friendly way.",
      registerNow: "Register Now",
      buySubscription: "Buy Subscription",
      featuresTitle: "Key Features",
      featuresSubtitle: "Everything you need for effective fleet management",
      howItWorksTitle: "How It Works",
      ctaTitle: "Ready to Get Started?",
      ctaDescription: "Start your free trial today and discover how easy fleet management can be.",
      startNow: "Start Now",
      seePrices: "See Pricing",
      copyright: "© 2025 XTrackSmart. All rights reserved.",
      footerTagline: "Professional fleet management solution",
      features: [
        {
          title: "License Management",
          description: "Full control of licenses and subscriptions with expiration notifications and easy renewal."
        },
        {
          title: "User & Role Management",
          description: "Support for different roles (Admin/User) with separate permissions and capabilities."
        },
        {
          title: "Tracking Data Import",
          description: "Upload CSV files for drivers (iButton) and vehicles with automatic processing."
        },
        {
          title: "Reports & Statistics",
          description: "Detailed reports on trips, driver work hours, and comprehensive statistics."
        },
        {
          title: "PDF/Excel Export",
          description: "Export all reports to PDF or Excel format for easy management and archiving."
        },
        {
          title: "Backup & Restore",
          description: "Secure backup creation and restoration of all your data."
        }
      ],
      howItWorks: [
        {
          title: "Register & Activate",
          description: "Sign up to the platform and choose the subscription plan that suits you (1, 6, or 12 months)."
        },
        {
          title: "Import Data",
          description: "Upload CSV files with tracking data for drivers (iButton) and your vehicles. The system processes them automatically."
        },
        {
          title: "Generate Reports",
          description: "Create trip and work hours reports, and export the results to PDF or Excel for further analysis."
        },
        {
          title: "Backup & Security",
          description: "Create backups of your data at any time and restore them whenever needed."
        }
      ]
    }
  };

  const t = translations[language];
  
  const features = [
    { icon: "🔑" },
    { icon: "👥" },
    { icon: "📤" },
    { icon: "📊" },
    { icon: "📄" },
    { icon: "💾" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">XTrackSmart</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('el')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    language === 'el'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ΕΛ
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t.login}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.heroTitle1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.heroTitle2}
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {t.heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.registerNow}
            </button>
            <button
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.buySubscription}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{t.featuresTitle}</h3>
          <p className="text-lg text-gray-600">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{t.features[index].title}</h4>
              <p className="text-gray-600 leading-relaxed">{t.features[index].description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.howItWorksTitle}</h3>
          
          <div className="space-y-6">
            {t.howItWorks.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h5>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            {t.ctaTitle}
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.startNow}
            </button>
            <button
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.seePrices}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">{t.copyright}</p>
          <p className="text-sm text-gray-400">
            {t.footerTagline}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
