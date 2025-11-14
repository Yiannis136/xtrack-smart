import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

const RegisterNow = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // Translations object
  const translations = {
    el: {
      title: 'Δημιουργία Λογαριασμού',
      subtitle: 'Γίνετε μέλος του XTrack Smart και ξεκλειδώστε το dashboard σας!',
      fullName: 'Πλήρες Όνομα',
      fullNamePlaceholder: 'Το όνομά σας',
      email: 'Email',
      emailPlaceholder: 'το-email-σας@example.com',
      password: 'Κωδικός',
      passwordPlaceholder: 'Επιλέξτε έναν ισχυρό κωδικό',
      registerButton: 'Εγγραφή',
      registering: 'Εγγραφή σε εξέλιξη...',
      successMessage: 'Επιτυχής εγγραφή! 🚀',
      alreadyRegistered: 'Έχετε ήδη λογαριασμό;',
      loginHere: 'Συνδεθείτε εδώ',
      backToHome: 'Επιστροφή στην Αρχική',
    },
    en: {
      title: 'Create Your Account',
      subtitle: 'Join XTrack Smart and unlock your dashboard!',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your Name',
      email: 'Email',
      emailPlaceholder: 'you@email.com',
      password: 'Password',
      passwordPlaceholder: 'Choose a strong password',
      registerButton: 'Register',
      registering: 'Registering...',
      successMessage: 'Registration successful! 🚀',
      alreadyRegistered: 'Already registered?',
      loginHere: 'Login here',
      backToHome: 'Back to Home',
    },
  };

  const t = translations[language];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(0);

    // Simulate progress for demo purposes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Simulate registration delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsSubmitting(false);
      setSuccess(true);
      // Εδώ θα βάλεις το backend registration σου με fetch/axios
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-violet-400 to-blue-300 flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        {/* Glamorous Shine Overlay */}
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-gradient-to-tr from-violet-300 via-indigo-200 to-blue-100 opacity-30 rounded-full pointer-events-none blur-2xl"></div>
        
        {/* Language Toggle - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 rounded-lg p-1 z-10">
          <button
            onClick={() => setLanguage('el')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              language === 'el'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ΕΛ
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              language === 'en'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 p-4 shadow-lg">
            <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-3 bg-gradient-to-r from-indigo-700 via-violet-500 to-blue-500 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {t.subtitle}
        </p>

        {!success ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t.fullName}</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={t.fullNamePlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Progress Bar */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-gray-600">{t.registering}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-400 text-white font-bold rounded-lg shadow-md hover:scale-105 hover:from-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.registering}
                </>
              ) : (
                t.registerButton
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{t.successMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t.backToHome}
            </button>
          </div>
        )}

        {!success && (
          <div className="mt-8 text-center text-sm text-gray-400">
            {t.alreadyRegistered}{' '}
            <a href="/login" className="text-indigo-600 underline transition hover:text-indigo-900">
              {t.loginHere}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterNow;
