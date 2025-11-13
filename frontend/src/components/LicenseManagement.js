import { useState, useEffect } from 'react';
import { getCurrentLicense, renewLicense } from '../services/api';

function LicenseManagement({ token, onUpdate }) {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewDuration, setRenewDuration] = useState(1);
  const [renewing, setRenewing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLicense();
  }, []);

  const loadLicense = async () => {
    try {
      const data = await getCurrentLicense(token);
      setLicense(data);
    } catch (error) {
      console.error('Failed to load license:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    setMessage('');
    setRenewing(true);
    try {
      await renewLicense(token, renewDuration);
      setMessage('License renewed successfully!');
      await loadLicense();
      onUpdate();
    } catch (error) {
      setMessage('Failed to renew license: ' + error.message);
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const endDate = new Date(license.end_date);
  const daysRemaining = license.status_info?.days_remaining || 0;
  const status = license.status_info?.status || 'unknown';

  return (
    <div className="space-y-6">
      {/* Current License Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current License</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className={`text-2xl font-bold ${
              status === 'active' ? 'text-green-600' :
              status === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {status.toUpperCase()}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
            <p className="text-xl font-bold text-gray-800">
              {endDate.toLocaleDateString()}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
            <p className={`text-2xl font-bold ${
              daysRemaining > 30 ? 'text-green-600' :
              daysRemaining > 0 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {daysRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Renew License */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Renew License</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renewal Duration
            </label>
            <select
              value={renewDuration}
              onChange={(e) => setRenewDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              data-testid="renew-duration-select"
            >
              <option value={1}>1 Month</option>
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRenew}
              disabled={renewing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
              data-testid="renew-button"
            >
              {renewing ? 'Renewing...' : 'Renew License'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">ℹ️ Important:</p>
          <p>• Renewal starts from the current expiry date</p>
          <p>• Warning will appear 30 days before expiration</p>
          <p>• After expiration, only admin can login</p>
        </div>
      </div>
    </div>
  );
}

export default LicenseManagement;