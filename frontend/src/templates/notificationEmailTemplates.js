// Email Templates for Notification Service

export const emailTemplates = {
  licenseExpiry30Days: (companyName, expiryDate) => ({
    subject: `Ειδοποίηση Λήξης Άδειας - ${companyName}`,
    body: `
Αγαπητέ/ή,

Σας ενημερώνουμε ότι η άδεια χρήσης του XTrackSmart για την εταιρεία ${companyName} λήγει σε 30 ημέρες.

Ημερομηνία Λήξης: ${new Date(expiryDate).toLocaleDateString('el-GR')}

Για να συνεχίσετε απρόσκοπτα τη χρήση των υπηρεσιών μας, παρακαλούμε να ανανεώσετε την άδειά σας.

Μπορείτε να προχωρήσετε στην ανανέωση μέσω του πίνακα ελέγχου ή επικοινωνώντας μαζί μας.

Με εκτίμηση,
Η Ομάδα XTrackSmart

---
Αυτό είναι ένα αυτόματο μήνυμα. Παρακαλούμε μην απαντήσετε σε αυτό το email.
    `
  }),

  licenseExpiry15Days: (companyName, expiryDate) => ({
    subject: `ΕΠΕΙΓΟΝ: Λήξη Άδειας σε 15 ημέρες - ${companyName}`,
    body: `
Αγαπητέ/ή,

⚠️ ΕΠΕΙΓΟΥΣΑ ΕΙΔΟΠΟΙΗΣΗ ⚠️

Η άδεια χρήσης του XTrackSmart για την εταιρεία ${companyName} λήγει σε μόλις 15 ημέρες.

Ημερομηνία Λήξης: ${new Date(expiryDate).toLocaleDateString('el-GR')}

Χωρίς άμεση ανανέωση, οι υπηρεσίες θα διακοπούν μετά την ημερομηνία λήξης.

Παρακαλούμε προχωρήστε ΑΜΕΣΑ στην ανανέωση για να αποφύγετε διακοπή των υπηρεσιών.

Για οποιαδήποτε απορία, επικοινωνήστε μαζί μας.

Με εκτίμηση,
Η Ομάδα XTrackSmart

---
Αυτό είναι ένα αυτόματο μήνυμα. Παρακαλούμε μην απαντήσετε σε αυτό το email.
    `
  }),

  vehicleLimitExceeded: (companyName, currentCount, limit) => ({
    subject: `Υπέρβαση Ορίου Οχημάτων - ${companyName}`,
    body: `
Αγαπητέ/ή,

Σας ενημερώνουμε ότι η εταιρεία ${companyName} έχει υπερβεί το όριο οχημάτων που προβλέπει η συνδρομή σας.

Τρέχοντα Οχήματα: ${currentCount}
Όριο Συνδρομής: ${limit}
Υπέρβαση: ${currentCount - limit} οχήματα

Για να συνεχίσετε να χρησιμοποιείτε όλα τα οχήματα, παρακαλούμε:
- Αναβαθμίστε τη συνδρομή σας σε υψηλότερο πακέτο
- Ή επικοινωνήστε μαζί μας για προσαρμοσμένη λύση

Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.

Με εκτίμηση,
Η Ομάδα XTrackSmart

---
Αυτό είναι ένα αυτόματο μήνυμα. Παρακαλούμε μην απαντήσετε σε αυτό το email.
    `
  }),

  manualUpdate: (companyName, subject, message) => ({
    subject: subject,
    body: `
Αγαπητέ/ή πελάτη της ${companyName},

${message}

Για οποιαδήποτε απορία, μη διστάσετε να επικοινωνήσετε μαζί μας.

Με εκτίμηση,
Η Ομάδα XTrackSmart

---
Αυτό είναι ένα μήνυμα από το XTrackSmart.
    `
  })
};

export const getEmailTemplate = (type, params) => {
  switch (type) {
    case 'license_expiry_30':
      return emailTemplates.licenseExpiry30Days(params.companyName, params.expiryDate);
    case 'license_expiry_15':
      return emailTemplates.licenseExpiry15Days(params.companyName, params.expiryDate);
    case 'vehicle_limit':
      return emailTemplates.vehicleLimitExceeded(params.companyName, params.currentCount, params.limit);
    case 'manual_update':
      return emailTemplates.manualUpdate(params.companyName, params.subject, params.message);
    default:
      return { subject: '', body: '' };
  }
};
