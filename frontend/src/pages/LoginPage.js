import { useState } from 'react';
import { login } from '../services/api';

function LoginPage({ onLoginSuccess, systemStatus }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if license expired
  const licenseExpired = systemStatus && systemStatus.license_status === 'expired';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 text-center">
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.jpg" 
                alt="Vehicle Tracking System" 
                className="w-full h-auto rounded-lg shadow-2xl border-4 border-white"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Vehicle Tracking System</h2>
            <p className="text-blue-100 text-lg">Professional Fleet Management</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to continue</p>
          </div>

        {licenseExpired && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">⚠️ License Expired</p>
            <p className="text-sm mt-1">Only administrators can login to renew the license.</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter username"
              required
              data-testid="username-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter password"
              required
              data-testid="password-input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-gray-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            data-testid="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
