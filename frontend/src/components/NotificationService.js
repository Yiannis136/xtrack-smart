import { useState, useEffect } from 'react';
import { getEmailTemplate } from '../templates/notificationEmailTemplates';
import { mockNotifications as initialNotifications, mockCompanies, mockSubscriptions } from '../data/mockData';

function NotificationService() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showSendForm, setShowSendForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    recipient: '',
    companyName: '',
    subject: '',
    message: ''
  });
  const [message, setMessage] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    checkForAlerts();
  }, []);

  const checkForAlerts = () => {
    const foundAlerts = [];

    // Check for expiring licenses
    mockSubscriptions.forEach(sub => {
      const daysRemaining = Math.floor((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 30 && daysRemaining > 15) {
        foundAlerts.push({
          type: 'license_expiry_30',
          companyName: sub.companyName,
          message: `Η άδεια λήγει σε ${daysRemaining} ημέρες`,
          severity: 'warning'
        });
      } else if (daysRemaining <= 15 && daysRemaining > 0) {
        foundAlerts.push({
          type: 'license_expiry_15',
          companyName: sub.companyName,
          message: `Η άδεια λήγει σε ${daysRemaining} ημέρες - ΕΠΕΙΓΟΝ`,
          severity: 'critical'
        });
      }
    });

    // Check for vehicle limit violations
    mockCompanies.forEach(company => {
      if (company.vehicleCount > company.vehicleLimit) {
        foundAlerts.push({
          type: 'vehicle_limit',
          companyName: company.name,
          message: `Υπέρβαση ορίου οχημάτων: ${company.vehicleCount}/${company.vehicleLimit}`,
          severity: 'critical'
        });
      }
    });

    setAlerts(foundAlerts);
  };

  const handleSendManualNotification = (e) => {
    e.preventDefault();
    setMessage('');

    // Simulate sending email
    const emailContent = getEmailTemplate('manual_update', {
      companyName: newNotification.companyName,
      subject: newNotification.subject,
      message: newNotification.message
    });

    console.log('=== SENDING EMAIL ===');
    console.log('To:', newNotification.recipient);
    console.log('Subject:', emailContent.subject);
    console.log('Body:', emailContent.body);
    console.log('====================');

    // Add to notifications log
    const notification = {
      id: notifications.length + 1,
      type: 'manual_update',
      recipient: newNotification.recipient,
      companyName: newNotification.companyName,
      subject: newNotification.subject,
      message: newNotification.message,
      sentDate: new Date().toISOString(),
      status: 'sent'
    };

    setNotifications([notification, ...notifications]);
    setMessage('Η ειδοποίηση στάλθηκε επιτυχώς!');
    setNewNotification({ recipient: '', companyName: '', subject: '', message: '' });
    setShowSendForm(false);
  };

  const handleSendAlert = (alert) => {
    // Find company details
    const company = mockCompanies.find(c => c.name === alert.companyName);
    const subscription = mockSubscriptions.find(s => s.companyName === alert.companyName);

    let emailContent;
    let recipient = `admin@${alert.companyName.toLowerCase().replace(/\s+/g, '-')}.gr`;

    if (alert.type === 'license_expiry_30' || alert.type === 'license_expiry_15') {
      emailContent = getEmailTemplate(alert.type, {
        companyName: alert.companyName,
        expiryDate: subscription?.expiryDate
      });
    } else if (alert.type === 'vehicle_limit') {
      emailContent = getEmailTemplate(alert.type, {
        companyName: alert.companyName,
        currentCount: company?.vehicleCount,
        limit: company?.vehicleLimit
      });
    }

    console.log('=== SENDING ALERT EMAIL ===');
    console.log('To:', recipient);
    console.log('Subject:', emailContent.subject);
    console.log('Body:', emailContent.body);
    console.log('===========================');

    // Add to notifications log
    const notification = {
      id: notifications.length + 1,
      type: alert.type,
      recipient: recipient,
      companyName: alert.companyName,
      subject: emailContent.subject,
      message: alert.message,
      sentDate: new Date().toISOString(),
      status: 'sent'
    };

    setNotifications([notification, ...notifications]);
    setMessage(`Η ειδοποίηση για ${alert.companyName} στάλθηκε επιτυχώς!`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'license_expiry':
      case 'license_expiry_30':
      case 'license_expiry_15':
        return 'Λήξη Άδειας';
      case 'vehicle_limit':
        return 'Υπέρβαση Οχημάτων';
      case 'manual_update':
        return 'Χειροκίνητη Ενημέρωση';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Σύστημα Ειδοποιήσεων</h2>
        <button
          onClick={() => setShowSendForm(!showSendForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {showSendForm ? 'Ακύρωση' : '📧 Αποστολή Ενημέρωσης'}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
          {message}
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Ενεργές Ειδοποιήσεις ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">{alert.companyName}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
                <button
                  onClick={() => handleSendAlert(alert)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    alert.severity === 'critical'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  Αποστολή Email
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Send Form */}
      {showSendForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Αποστολή Χειροκίνητης Ενημέρωσης</h3>
          <form onSubmit={handleSendManualNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Παραλήπτη
                </label>
                <input
                  type="email"
                  value={newNotification.recipient}
                  onChange={(e) => setNewNotification({ ...newNotification, recipient: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="admin@company.gr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Όνομα Εταιρείας
                </label>
                <input
                  type="text"
                  value={newNotification.companyName}
                  onChange={(e) => setNewNotification({ ...newNotification, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Εταιρεία Α.Ε."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Θέμα
              </label>
              <input
                type="text"
                value={newNotification.subject}
                onChange={(e) => setNewNotification({ ...newNotification, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Θέμα ενημέρωσης"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Μήνυμα
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows="4"
                placeholder="Κείμενο ενημέρωσης..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Αποστολή Ενημέρωσης
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Log */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Ιστορικό Ειδοποιήσεων</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Τύπος
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Εταιρεία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Παραλήπτης
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Θέμα
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ημερομηνία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTypeLabel(notification.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {notification.recipient}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(notification.sentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {notification.status === 'sent' ? 'Στάλθηκε' : notification.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NotificationService;
