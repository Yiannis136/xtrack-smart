import { useState } from 'react';
import { createBackup, restoreBackup } from '../services/api';

function BackupRestore({ token }) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);

  const handleCreateBackup = async () => {
    setMessage('');
    setBackupLoading(true);
    try {
      const data = await createBackup(token);
      
      // Download backup file
      const blob = new Blob([data.backup_data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.bak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setMessage(`Backup created successfully! ${data.records_count} records backed up.`);
    } catch (error) {
      setMessage('Failed to create backup: ' + error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      setMessage('Please select a backup file');
      return;
    }

    if (!window.confirm('WARNING: This will replace all current data with the backup. Continue?')) {
      return;
    }

    setMessage('');
    setRestoreLoading(true);
    try {
      const data = await restoreBackup(token, restoreFile);
      setMessage(`Restore completed! ${data.restored_records} records restored.`);
      setRestoreFile(null);
    } catch (error) {
      setMessage('Failed to restore backup: ' + error.message);
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Backup & Restore</h2>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') || message.includes('completed')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create Backup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Backup</h3>
        <p className="text-gray-600 mb-4">
          Create a full backup of all system data including users, licenses, and tracking records.
        </p>
        <button
          onClick={handleCreateBackup}
          disabled={backupLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-400 flex items-center gap-2"
          data-testid="create-backup-button"
        >
          {backupLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Backup...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Create Backup Now
            </>
          )}
        </button>
      </div>

      {/* Restore Backup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Restore from Backup</h3>
        <p className="text-gray-600 mb-4">
          Restore system data from a previous backup file. This will replace all current data.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Backup File</label>
            <input
              type="file"
              accept=".bak,.json"
              onChange={(e) => setRestoreFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              data-testid="restore-file-input"
            />
          </div>
          
          <button
            onClick={handleRestoreBackup}
            disabled={restoreLoading || !restoreFile}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-400 flex items-center gap-2"
            data-testid="restore-backup-button"
          >
            {restoreLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Restoring...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restore Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Important Notes:
        </h4>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• <strong>Automatic Backup:</strong> System creates daily backups at 00:00 to C:\tracking system\backup</li>
          <li>• <strong>Migration:</strong> Use backup/restore to move data to a new server</li>
          <li>• <strong>Backup Contains:</strong> All users, licenses, tracking records, and system configuration</li>
          <li>• <strong>Warning:</strong> Restore will overwrite ALL current data - use with caution</li>
          <li>• Store backup files in a secure location</li>
        </ul>
      </div>
    </div>
  );
}

export default BackupRestore;
