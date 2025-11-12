import { useState, useEffect } from 'react';
import SetupPage από './pages/SetupPage';
import LoginPage από './pages/LoginPage';
import AdminDashboard από './pages/AdminDashboard';
import UserDashboard από './pages/UserDashboard';
import { checkSystemStatus } από './services/api';
import './App.css';

function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await checkSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  const handleSetupComplete = () => {
    loadSystemStatus();
  };

  const handleStatusUpdate = () => {
    loadSystemStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!systemStatus?.is_setup_complete) {
    return <SetupPage onSetupComplete={handleSetupComplete} />;
  }

  if (!user) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        systemStatus={systemStatus}
      />
    );
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        systemStatus={systemStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  } else {
    return (
      <UserDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        systemStatus={systemStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  }
}

export default App;
