import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🔑",
      title: "Διαχείριση Αδειών Χρήσης",
      description: "Πλήρης έλεγχος των αδειών χρήσης και συνδρομών με ειδοποιήσεις λήξης και εύκολη ανανέωση."
    },
    {
      icon: "👥",
      title: "Διαχείριση Χρηστών & Ρόλων",
      description: "Υποστήριξη διαφορετικών ρόλων (Admin/User) με ξεχωριστά δικαιώματα και δυνατότητες."
    },
    {
      icon: "📤",
      title: "Εισαγωγή Δεδομένων Tracking",
      description: "Ανέβασμα αρχείων CSV για οδηγούς (iButton) και οχήματα με αυτόματη επεξεργασία."
    },
    {
      icon: "📊",
      title: "Αναφορές & Στατιστικά",
      description: "Αναλυτικές αναφορές ταξιδιών, ωρών εργασίας οδηγών και πλήρη στατιστικά στοιχεία."
    },
    {
      icon: "📄",
      title: "Εξαγωγή σε PDF/Excel",
      description: "Εξαγωγή όλων των αναφορών σε μορφή PDF ή Excel για εύκολη διαχείριση και αρχειοθέτηση."
    },
    {
      icon: "💾",
      title: "Backup & Restore",
      description: "Ασφαλής δημιουργία αντιγράφων ασφαλείας και επαναφορά όλων των δεδομένων σας."
    }
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
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Σύνδεση
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Επαγγελματική Διαχείριση
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Στόλου Οχημάτων
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Το XTrackSmart είναι η ολοκληρωμένη λύση για τη διαχείριση του στόλου οχημάτων σας.
            Παρακολουθήστε τα ταξίδια, διαχειριστείτε τους οδηγούς και δημιουργήστε αναλυτικές
            αναφορές με έναν απλό και φιλικό τρόπο.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Εγγραφή Τώρα
            </button>
            <button
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Αγορά Συνδρομής
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Βασικές Δυνατότητες</h3>
          <p className="text-lg text-gray-600">
            Όλα όσα χρειάζεστε για την αποτελεσματική διαχείριση του στόλου σας
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Πώς Λειτουργεί</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Εγγραφή & Ενεργοποίηση</h5>
                <p className="text-gray-600">
                  Εγγραφείτε στην πλατφόρμα και επιλέξτε το πρόγραμμα συνδρομής που σας ταιριάζει 
                  (1, 6 ή 12 μήνες).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Εισαγωγή Δεδομένων</h5>
                <p className="text-gray-600">
                  Ανεβάστε τα αρχεία CSV με τα δεδομένα tracking των οδηγών (iButton) και των 
                  οχημάτων σας. Το σύστημα τα επεξεργάζεται αυτόματα.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Δημιουργία Αναφορών</h5>
                <p className="text-gray-600">
                  Δημιουργήστε αναφορές ταξιδιών και ωρών εργασίας, και εξάγετε τα αποτελέσματα 
                  σε PDF ή Excel για περαιτέρω ανάλυση.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Backup & Ασφάλεια</h5>
                <p className="text-gray-600">
                  Δημιουργήστε αντίγραφα ασφαλείας των δεδομένων σας ανά πάσα στιγμή και 
                  επαναφέρετε τα όποτε χρειαστεί.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Έτοιμοι να Ξεκινήσετε;
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ξεκινήστε τη δωρεάν δοκιμή σας σήμερα και ανακαλύψτε πόσο εύκολη μπορεί να είναι 
            η διαχείριση του στόλου σας.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Ξεκινήστε Τώρα
            </button>
            <button
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Δείτε Τιμές
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 XTrackSmart. Όλα τα δικαιώματα κατοχυρωμένα.</p>
          <p className="text-sm text-gray-400">
            Επαγγελματική λύση διαχείρισης στόλου οχημάτων
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
