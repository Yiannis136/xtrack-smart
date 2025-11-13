import { useState, useEffect } from 'react';
import './App.css';
import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system...</p>
        </div>
      </div>
    );
  }

  // Initial Setup
  if (systemStatus && !systemStatus.is_setup_complete) {
    return <SetupPage onSetupComplete={handleSetupComplete} />;
  }

  // Login
  if (!user || !token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} systemStatus={systemStatus} />;
  }

  // Dashboard based on role
  if (user.role === 'admin') {
    return (
      <AdminDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        systemStatus={systemStatus}
        onStatusUpdate={loadSystemStatus}
      />
    );
  } else {
    return (
      <UserDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        systemStatus={systemStatus}
        onStatusUpdate={loadSystemStatus}
      />
    );
  }
}

export default App;