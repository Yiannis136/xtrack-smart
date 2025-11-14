import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import RegisterNow from './pages/RegisterNow'; // <-- ΝΕΟ import
import { checkSystemStatus } from './services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    loadSystemStatus();
    loadUserFromToken();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await checkSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFromToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  };

  const handleLoginSuccess = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    loadSystemStatus();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleSetupComplete = () => {
    loadSystemStatus();
  };

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading system...</p>
      </div>
    </div>
  );

  const SubscribePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Αγορά Συνδρομής</h2>
        <p className="text-gray-600 mb-6">Η λειτουργία αγοράς συνδρομής θα είναι διαθέσιμη σύντομα.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Επιστροφή στην Αρχική
        </button>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Landing Page - First route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Register δείχνει στο πραγματικό component */}
        <Route path="/register" element={<RegisterNow />} />

        {/* Subscribe placeholder */}
        <Route path="/subscribe" element={<SubscribePage />} />

        {/* Setup */}
        <Route 
          path="/setup" 
          element={
            loading ? <LoadingScreen /> :
            systemStatus && !systemStatus.is_setup_complete ? 
              <SetupPage onSetupComplete={handleSetupComplete} /> :
              <Navigate to="/login" replace />
          } 
        />

        {/* Login */}
        <Route 
          path="/login" 
          element={
            loading ? <LoadingScreen /> :
            !user || !token ? 
              <LoginPage onLoginSuccess={handleLoginSuccess} systemStatus={systemStatus} /> :
              <Navigate to="/dashboard" replace />
          } 
        />

        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            loading ? <LoadingScreen /> :
            !user || !token ? <Navigate to="/login" replace /> :
            user.role === 'admin' ? 
              <AdminDashboard 
                user={user} 
                token={token} 
                onLogout={handleLogout}
                systemStatus={systemStatus}
                onStatusUpdate={loadSystemStatus}
              /> :
              <UserDashboard 
                user={user} 
                token={token} 
                onLogout={handleLogout}
                systemStatus={systemStatus}
                onStatusUpdate={loadSystemStatus}
              />
          } 
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
