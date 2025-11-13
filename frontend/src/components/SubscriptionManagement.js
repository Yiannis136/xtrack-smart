import { useState } from 'react';
import { mockSubscriptions } from '../data/mockData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [message, setMessage] = useState('');

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubscriptions(filteredSubscriptions.map(s => s.id));
    } else {
      setSelectedSubscriptions([]);
    }
  };

  const handleSelectSubscription = (id) => {
    if (selectedSubscriptions.includes(id)) {
      setSelectedSubscriptions(selectedSubscriptions.filter(sid => sid !== id));
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, id]);
    }
  };

  const handleBatchUpdate = () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('Δεν έχετε επιλέξει συνδρομές');
      return;
    }
    console.log('Batch update for subscriptions:', selectedSubscriptions);
    setMessage(`Ενημερώθηκαν ${selectedSubscriptions.length} συνδρομές`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchRenew = () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('Δεν έχετε επιλέξει συνδρομές');
      return;
    }
    console.log('Batch renew for subscriptions:', selectedSubscriptions);
    setMessage(`Ανανεώθηκαν ${selectedSubscriptions.length} συνδρομές`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchDisable = () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('Δεν έχετε επιλέξει συνδρομές');
      return;
    }
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε ${selectedSubscriptions.length} συνδρομές;`)) {
      console.log('Batch disable for subscriptions:', selectedSubscriptions);
      setMessage(`Απενεργοποιήθηκαν ${selectedSubscriptions.length} συνδρομές`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const exportToExcel = () => {
    const data = filteredSubscriptions.map(sub => ({
      'Εταιρεία': sub.companyName,
      'Τύπος': sub.type,
      'Τιμή': sub.price,
      'Όριο Οχημάτων': sub.vehicleLimit,
      'Έναρξη': new Date(sub.startDate).toLocaleDateString('el-GR'),
      'Λήξη': new Date(sub.expiryDate).toLocaleDateString('el-GR'),
      'Κατάσταση': sub.status,
      'Αυτόματη Ανανέωση': sub.autoRenew ? 'Ναι' : 'Όχι'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Συνδρομές');
    XLSX.writeFile(wb, 'subscriptions.xlsx');
    console.log('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Πίνακας Συνδρομών', 14, 15);
    
    const tableData = filteredSubscriptions.map(sub => [
      sub.companyName,
      sub.type,
      sub.price,
      sub.vehicleLimit,
      new Date(sub.expiryDate).toLocaleDateString('el-GR'),
      sub.status,
      sub.autoRenew ? 'Ναι' : 'Όχι'
    ]);

    doc.autoTable({
      startY: 20,
      head: [['Εταιρεία', 'Τύπος', 'Τιμή', 'Όριο', 'Λήξη', 'Κατάσταση', 'Auto-Renew']],
      body: tableData
    });

    doc.save('subscriptions.pdf');
    console.log('Exported to PDF');
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expiring: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ενεργή',
      expiring: 'Λήγει Σύντομα',
      expired: 'Έχει Λήξει'
    };
    return labels[status] || status;
  };

  const getDaysRemaining = (expiryDate) => {
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Διαχείριση Συνδρομών</h2>
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

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✅</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Ενεργές Συνδρομές</p>
              <p className="text-2xl font-bold text-green-800">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Λήγουν Σύντομα</p>
              <p className="text-2xl font-bold text-yellow-800">
                {subscriptions.filter(s => s.status === 'expiring').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">❌</div>
            <div>
              <p className="text-sm text-red-600 font-medium">Έχουν Λήξει</p>
              <p className="text-2xl font-bold text-red-800">
                {subscriptions.filter(s => s.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Αναζήτηση</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Αναζήτηση συνδρομής..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Φίλτρο Κατάστασης</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Όλες</option>
              <option value="active">Ενεργές</option>
              <option value="expiring">Λήγουν Σύντομα</option>
              <option value="expired">Έχουν Λήξει</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">
              Επιλεγμένες: {selectedSubscriptions.length} συνδρομές
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

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Εταιρεία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Τύπος
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Τιμή
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Όριο Οχημάτων
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Λήξη
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ημέρες
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-Renew
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((sub) => {
                const daysRemaining = getDaysRemaining(sub.expiryDate);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.includes(sub.id)}
                        onChange={() => handleSelectSubscription(sub.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {sub.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.vehicleLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sub.expiryDate).toLocaleDateString('el-GR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        daysRemaining <= 15 ? 'text-red-600' :
                        daysRemaining <= 30 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {daysRemaining > 0 ? daysRemaining : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.autoRenew ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)}`}>
                        {getStatusLabel(sub.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManagement;
