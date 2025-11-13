import { useState } from 'react';
import { mockVehicles, mockCompanies } from '../data/mockData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [message, setMessage] = useState('');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'all' || vehicle.companyId.toString() === filterCompany;
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVehicles(filteredVehicles.map(v => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (id) => {
    if (selectedVehicles.includes(id)) {
      setSelectedVehicles(selectedVehicles.filter(vid => vid !== id));
    } else {
      setSelectedVehicles([...selectedVehicles, id]);
    }
  };

  const handleBatchUpdate = () => {
    if (selectedVehicles.length === 0) {
      setMessage('Δεν έχετε επιλέξει οχήματα');
      return;
    }
    console.log('Batch update for vehicles:', selectedVehicles);
    setMessage(`Ενημερώθηκαν ${selectedVehicles.length} οχήματα`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchRenew = () => {
    if (selectedVehicles.length === 0) {
      setMessage('Δεν έχετε επιλέξει οχήματα');
      return;
    }
    console.log('Batch renew for vehicles:', selectedVehicles);
    setMessage(`Ανανεώθηκαν ${selectedVehicles.length} οχήματα`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchDisable = () => {
    if (selectedVehicles.length === 0) {
      setMessage('Δεν έχετε επιλέξει οχήματα');
      return;
    }
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε ${selectedVehicles.length} οχήματα;`)) {
      console.log('Batch disable for vehicles:', selectedVehicles);
      setMessage(`Απενεργοποιήθηκαν ${selectedVehicles.length} οχήματα`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const exportToExcel = () => {
    const data = filteredVehicles.map(vehicle => ({
      'Εταιρεία': vehicle.companyName,
      'Μοντέλο': vehicle.model,
      'Πινακίδα': vehicle.plate,
      'Κατάσταση': vehicle.status,
      'Ημ/νία Συνδρομής': new Date(vehicle.subscriptionDate).toLocaleDateString('el-GR'),
      'Ημ/νία Λήξης': new Date(vehicle.expiryDate).toLocaleDateString('el-GR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Οχήματα');
    XLSX.writeFile(wb, 'vehicles.xlsx');
    console.log('Exported to Excel');
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Πίνακας Οχημάτων', 14, 15);
      
      // Prepare table data
      const tableData = filteredVehicles.map(vehicle => [
        vehicle.companyName,
        vehicle.model,
        vehicle.plate,
        getStatusLabel(vehicle.status),
        new Date(vehicle.subscriptionDate).toLocaleDateString('el-GR'),
        new Date(vehicle.expiryDate).toLocaleDateString('el-GR')
      ]);

      doc.autoTable({
        startY: 25,
        head: [['Εταιρεία', 'Μοντέλο', 'Πινακίδα', 'Κατάσταση', 'Ημ/νία Συνδρομής', 'Ημ/νία Λήξης']],
        body: tableData,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          fontStyle: 'normal'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { top: 25 }
      });

      doc.save('vehicles.pdf');
      setMessage('Το PDF δημιουργήθηκε επιτυχώς!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setMessage('Σφάλμα κατά τη δημιουργία του PDF');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ενεργό',
      warning: 'Προειδοποίηση',
      inactive: 'Ανενεργό'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Διαχείριση Οχημάτων</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            📊 Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Αναζήτηση</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Αναζήτηση οχήματος..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Εταιρεία</label>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Όλες</option>
              {mockCompanies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Κατάσταση</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Όλα</option>
              <option value="active">Ενεργά</option>
              <option value="warning">Προειδοποίηση</option>
              <option value="inactive">Ανενεργά</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedVehicles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">
              Επιλεγμένα: {selectedVehicles.length} οχήματα
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBatchUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Ενημέρωση
              </button>
              <button
                onClick={handleBatchRenew}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Ανανέωση
              </button>
              <button
                onClick={handleBatchDisable}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Απενεργοποίηση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Εταιρεία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Μοντέλο
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Πινακίδα
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ημ/νία Συνδρομής
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ημ/νία Λήξης
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleSelectVehicle(vehicle.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vehicle.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {vehicle.plate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                      {getStatusLabel(vehicle.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(vehicle.subscriptionDate).toLocaleDateString('el-GR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(vehicle.expiryDate).toLocaleDateString('el-GR')}
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

export default VehicleManagement;
