// Mock data for Admin Dashboard

export const mockCompanies = [
  {
    id: 1,
    name: 'Εταιρεία Α.Ε.',
    subscription: 'Premium',
    vehicleCount: 15,
    vehicleLimit: 20,
    userCount: 8,
    status: 'active',
    expiryDate: '2026-03-15',
    daysRemaining: 120
  },
  {
    id: 2,
    name: 'Logistics Pro Ε.Π.Ε.',
    subscription: 'Basic',
    vehicleCount: 5,
    vehicleLimit: 5,
    userCount: 3,
    status: 'warning',
    expiryDate: '2025-12-20',
    daysRemaining: 28
  },
  {
    id: 3,
    name: 'Transport Solutions O.E.',
    subscription: 'Enterprise',
    vehicleCount: 48,
    vehicleLimit: 50,
    userCount: 22,
    status: 'active',
    expiryDate: '2026-06-10',
    daysRemaining: 205
  },
  {
    id: 4,
    name: 'Delivery Express Α.Ε.',
    subscription: 'Basic',
    vehicleCount: 8,
    vehicleLimit: 10,
    userCount: 5,
    status: 'active',
    expiryDate: '2025-12-01',
    daysRemaining: 10
  },
  {
    id: 5,
    name: 'Fleet Management Ltd',
    subscription: 'Premium',
    vehicleCount: 33,
    vehicleLimit: 30,
    userCount: 12,
    status: 'exceeded',
    expiryDate: '2026-01-25',
    daysRemaining: 65
  }
];

export const mockVehicles = [
  // Εταιρεία Α.Ε. vehicles
  { id: 1, companyId: 1, companyName: 'Εταιρεία Α.Ε.', model: 'Mercedes Sprinter', plate: 'ΑΒΓ-1234', status: 'active', subscriptionDate: '2025-03-15', expiryDate: '2026-03-15' },
  { id: 2, companyId: 1, companyName: 'Εταιρεία Α.Ε.', model: 'Ford Transit', plate: 'ΔΕΖ-5678', status: 'active', subscriptionDate: '2025-03-15', expiryDate: '2026-03-15' },
  { id: 3, companyId: 1, companyName: 'Εταιρεία Α.Ε.', model: 'Volkswagen Crafter', plate: 'ΗΘΙ-9012', status: 'active', subscriptionDate: '2025-03-15', expiryDate: '2026-03-15' },
  
  // Logistics Pro vehicles
  { id: 4, companyId: 2, companyName: 'Logistics Pro Ε.Π.Ε.', model: 'Peugeot Boxer', plate: 'ΚΛΜ-3456', status: 'warning', subscriptionDate: '2024-12-20', expiryDate: '2025-12-20' },
  { id: 5, companyId: 2, companyName: 'Logistics Pro Ε.Π.Ε.', model: 'Citroen Jumper', plate: 'ΝΞΟ-7890', status: 'warning', subscriptionDate: '2024-12-20', expiryDate: '2025-12-20' },
  
  // Transport Solutions vehicles
  { id: 6, companyId: 3, companyName: 'Transport Solutions O.E.', model: 'Scania R450', plate: 'ΠΡΣ-2345', status: 'active', subscriptionDate: '2025-06-10', expiryDate: '2026-06-10' },
  { id: 7, companyId: 3, companyName: 'Transport Solutions O.E.', model: 'Volvo FH16', plate: 'ΤΥΦ-6789', status: 'active', subscriptionDate: '2025-06-10', expiryDate: '2026-06-10' },
  { id: 8, companyId: 3, companyName: 'Transport Solutions O.E.', model: 'MAN TGX', plate: 'ΧΨΩ-0123', status: 'active', subscriptionDate: '2025-06-10', expiryDate: '2026-06-10' },
  
  // Delivery Express vehicles
  { id: 9, companyId: 4, companyName: 'Delivery Express Α.Ε.', model: 'Fiat Ducato', plate: 'ΑΒΓ-4567', status: 'warning', subscriptionDate: '2024-12-01', expiryDate: '2025-12-01' },
  { id: 10, companyId: 4, companyName: 'Delivery Express Α.Ε.', model: 'Renault Master', plate: 'ΔΕΖ-8901', status: 'warning', subscriptionDate: '2024-12-01', expiryDate: '2025-12-01' },
  
  // Fleet Management vehicles
  { id: 11, companyId: 5, companyName: 'Fleet Management Ltd', model: 'Iveco Daily', plate: 'ΗΘΙ-2345', status: 'active', subscriptionDate: '2025-01-25', expiryDate: '2026-01-25' },
  { id: 12, companyId: 5, companyName: 'Fleet Management Ltd', model: 'Mercedes Actros', plate: 'ΚΛΜ-6789', status: 'active', subscriptionDate: '2025-01-25', expiryDate: '2026-01-25' }
];

export const mockSubscriptions = [
  {
    id: 1,
    companyId: 1,
    companyName: 'Εταιρεία Α.Ε.',
    type: 'Premium',
    startDate: '2025-03-15',
    expiryDate: '2026-03-15',
    status: 'active',
    autoRenew: true,
    vehicleLimit: 20,
    price: '299€/μήνα'
  },
  {
    id: 2,
    companyId: 2,
    companyName: 'Logistics Pro Ε.Π.Ε.',
    type: 'Basic',
    startDate: '2024-12-20',
    expiryDate: '2025-12-20',
    status: 'expiring',
    autoRenew: false,
    vehicleLimit: 5,
    price: '99€/μήνα'
  },
  {
    id: 3,
    companyId: 3,
    companyName: 'Transport Solutions O.E.',
    type: 'Enterprise',
    startDate: '2025-06-10',
    expiryDate: '2026-06-10',
    status: 'active',
    autoRenew: true,
    vehicleLimit: 50,
    price: '599€/μήνα'
  },
  {
    id: 4,
    companyId: 4,
    companyName: 'Delivery Express Α.Ε.',
    type: 'Basic',
    startDate: '2024-12-01',
    expiryDate: '2025-12-01',
    status: 'expiring',
    autoRenew: true,
    vehicleLimit: 10,
    price: '99€/μήνα'
  },
  {
    id: 5,
    companyId: 5,
    companyName: 'Fleet Management Ltd',
    type: 'Premium',
    startDate: '2025-01-25',
    expiryDate: '2026-01-25',
    status: 'active',
    autoRenew: true,
    vehicleLimit: 30,
    price: '299€/μήνα'
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: 'license_expiry',
    recipient: 'admin@logistics-pro.gr',
    companyName: 'Logistics Pro Ε.Π.Ε.',
    subject: 'Λήξη Άδειας σε 28 ημέρες',
    message: 'Η άδεια της εταιρείας σας λήγει στις 2025-12-20',
    sentDate: '2025-11-22T10:30:00',
    status: 'sent'
  },
  {
    id: 2,
    type: 'vehicle_limit',
    recipient: 'manager@fleet-management.com',
    companyName: 'Fleet Management Ltd',
    subject: 'Υπέρβαση Ορίου Οχημάτων',
    message: 'Έχετε 33 οχήματα ενώ το όριο είναι 30',
    sentDate: '2025-11-20T14:15:00',
    status: 'sent'
  },
  {
    id: 3,
    type: 'license_expiry',
    recipient: 'info@delivery-express.gr',
    companyName: 'Delivery Express Α.Ε.',
    subject: 'Λήξη Άδειας σε 10 ημέρες',
    message: 'Η άδεια της εταιρείας σας λήγει στις 2025-12-01',
    sentDate: '2025-11-21T09:00:00',
    status: 'sent'
  },
  {
    id: 4,
    type: 'manual_update',
    recipient: 'all@transport-solutions.gr',
    companyName: 'Transport Solutions O.E.',
    subject: 'Νέες Λειτουργίες Συστήματος',
    message: 'Το σύστημα αναβαθμίστηκε με νέες δυνατότητες αναφορών',
    sentDate: '2025-11-18T16:45:00',
    status: 'sent'
  }
];
