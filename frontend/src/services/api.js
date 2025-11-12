const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const checkSystemStatus = async () => {
  const response = await fetch(`${API}/system/status`);
  if (!response.ok) throw new Error('Failed to check system status');
  return response.json();
};

export const initialSetup = async (licenseData, adminPassword) => {
  const response = await fetch(`${API}/setup/initial?admin_password=${adminPassword}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(licenseData)
  });
  if (!response.ok) throw new Error('Setup failed');
  return response.json();
};

export const login = async (username, password) => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  return response.json();
};

export const createUser = async (token, userData) => {
  const response = await fetch(`${API}/users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const listUsers = async (token) => {
  const response = await fetch(`${API}/users/list`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to list users');
  return response.json();
};

export const deleteUser = async (token, username) => {
  const response = await fetch(`${API}/users/${username}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const getCurrentLicense = async (token) => {
  const response = await fetch(`${API}/license/current`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to get license');
  return response.json();
};

export const renewLicense = async (token, durationMonths) => {
  const response = await fetch(`${API}/license/renew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ duration_months: durationMonths })
  });
  if (!response.ok) throw new Error('Failed to renew license');
  return response.json();
};

export const uploadCSV = async (token, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API}/tracking/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }
  return response.json();
};

export const getTrackingRecords = async (token, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API}/tracking/records?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to get records');
  return response.json();
};

export const getUniqueIdentifiers = async (token) => {
  const response = await fetch(`${API}/tracking/identifiers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to get identifiers');
  return response.json();
};

export const createBackup = async (token) => {
  const response = await fetch(`${API}/backup/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to create backup');
  return response.json();
};

export const restoreBackup = async (token, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API}/backup/restore`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) throw new Error('Restore failed');
  return response.json();
};

export const addManualTrip = async (token, tripData) => {
  const response = await fetch(`${API}/tracking/add-manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tripData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add trip');
  }
  return response.json();
};
