function LicenseWarning({ systemStatus }) {
  if (!systemStatus || !systemStatus.days_remaining) return null;

  const daysRemaining = systemStatus.days_remaining;
  const status = systemStatus.license_status;

  if (status === 'expired') {
    return (
      <div className="bg-red-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-bold text-lg">Η Άδεια Έχει Λήξει!</div>
                <div className="text-sm opacity-90 mt-1">
                  Παρακαλώ επικοινωνήστε με την εταιρεία <strong>XTrackSmart</strong> για να ανανεώσετε την άδειά σας
                </div>
              </div>
            </div>
            <div className="text-right">
              <a href="tel:+35799999999" className="text-white hover:underline font-semibold block">
                📞 +357-XXXX-XXXX
              </a>
              <a href="mailto:support@xtrack.com.cy" className="text-white hover:underline text-sm block mt-1">
                ✉️ support@xtrack.com.cy
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'warning' && daysRemaining <= 30) {
    return (
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-bold text-lg">Η Άδεια Λήγει Σύντομα!</div>
                <div className="text-sm opacity-95 mt-1">
                  Απομένουν <strong>{daysRemaining} ημέρες</strong>. Παρακαλώ επικοινωνήστε με την εταιρεία <strong>XTrackSmart</strong> για ανανέωση
                </div>
              </div>
            </div>
            <div className="text-right">
              <a href="tel:+35799999999" className="text-white hover:underline font-semibold block">
                📞 +357-XXXX-XXXX
              </a>
              <a href="mailto:support@xtrack.com.cy" className="text-white hover:underline text-sm block mt-1">
                ✉️ support@xtrack.com.cy
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default LicenseWarning;
