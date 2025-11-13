import { useState } from 'react';
import LicenseManagement from '../components/LicenseManagement';
import UserManagement from '../components/UserManagement';
import BackupRestore from '../components/BackupRestore';
import TrackingDashboard from '../components/TrackingDashboard';
import LicenseWarning from '../components/LicenseWarning';
import NotificationService from '../components/NotificationService';
import CompanyManagement from '../components/CompanyManagement';
import VehicleManagement from '../components/VehicleManagement';
import SubscriptionManagement from '../components/SubscriptionManagement';

function AdminDashboard({ user, token, onLogout, systemStatus, onStatusUpdate }) {
  const [activeTab, setActiveTab] = useState('tracking');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* License Warning Banner */}
      <LicenseWarning systemStatus={systemStatus} />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Vehicle Tracking System</h1>
              <p className="text-sm text-gray-600">Administrator Dashboard</p>
            </div>
            <div className="flex items-center gap-6">
              {/* License Expiry Info */}
              {systemStatus && systemStatus.license_expiry && (
                <div className="hidden md:block text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Λήξη Άδειας</p>
                  <p className="text-sm font-bold text-blue-900">
                    {new Date(systemStatus.license_expiry).toLocaleDateString('el-GR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-blue-700">
                    ({systemStatus.days_remaining} ημέρες απομένουν)
                  </p>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-600">Admin</p>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-600 rounded-lg hover:bg-red-50 transition"
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid="tracking-tab"
            >
              Tracking & Reports
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Εταιρείες
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Οχήματα
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Συνδρομές
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ειδοποιήσεις
            </button>
            <button
              onClick={() => setActiveTab('license')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'license'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid="license-tab"
            >
              License Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid="users-tab"
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid="backup-tab"
            >
              Backup & Restore
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tracking' && <TrackingDashboard token={token} user={user} />}
        {activeTab === 'companies' && <CompanyManagement />}
        {activeTab === 'vehicles' && <VehicleManagement />}
        {activeTab === 'subscriptions' && <SubscriptionManagement />}
        {activeTab === 'notifications' && <NotificationService />}
        {activeTab === 'license' && <LicenseManagement token={token} onUpdate={onStatusUpdate} />}
        {activeTab === 'users' && <UserManagement token={token} />}
        {activeTab === 'backup' && <BackupRestore token={token} />}
      </main>
    </div>
  );
}

export default AdminDashboard;