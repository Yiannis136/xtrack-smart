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
      setMessage('No subscriptions selected');
      return;
    }
    console.log('Batch update for subscriptions:', selectedSubscriptions);
    setMessage(`Updated ${selectedSubscriptions.length} subscriptions`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchRenew = () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('No subscriptions selected');
      return;
    }
    console.log('Batch renew for subscriptions:', selectedSubscriptions);
    setMessage(`Renewed ${selectedSubscriptions.length} subscriptions`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchDisable = () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('No subscriptions selected');
      return;
    }
    if (window.confirm(`Are you sure you want to disable ${selectedSubscriptions.length} subscriptions?`)) {
      console.log('Batch disable for subscriptions:', selectedSubscriptions);
      setMessage(`Disabled ${selectedSubscriptions.length} subscriptions`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const exportToExcel = () => {
    const data = filteredSubscriptions.map(sub => ({
      'Company': sub.companyName,
      'Type': sub.type,
      'Price': sub.price,
      'Vehicle Limit': sub.vehicleLimit,
      'Start': new Date(sub.startDate).toLocaleDateString('en-US'),
      'Expiry': new Date(sub.expiryDate).toLocaleDateString('en-US'),
      'Status': sub.status,
      'Auto Renew': sub.autoRenew ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
    XLSX.writeFile(wb, 'subscriptions.xlsx');
    console.log('Exported to Excel');
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Subscriptions Table', 14, 15);
      
      // Prepare table data
      const tableData = filteredSubscriptions.map(sub => [
        sub.companyName,
        sub.type,
        sub.price,
        sub.vehicleLimit.toString(),
        new Date(sub.expiryDate).toLocaleDateString('en-US'),
        getStatusLabel(sub.status),
        sub.autoRenew ? 'Yes' : 'No'
      ]);

      doc.autoTable({
        startY: 25,
        head: [['Company', 'Type', 'Price', 'Vehicle Limit', 'Expiry', 'Status', 'Auto Renew']],
        body: tableData,
        styles: {
          font: 'helvetica',
          fontSize: 9,
          fontStyle: 'normal',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { top: 25 },
        theme: 'striped'
      });

      doc.save('subscriptions.pdf');
      setMessage('PDF created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setMessage('Error creating PDF');
      setTimeout(() => setMessage(''), 3000);
    }
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
      active: 'Active',
      expiring: 'Expiring Soon',
      expired: 'Expired'
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
        <h2 className="text-2xl font-semibold text-gray-800">Subscription Management</h2>
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
              <p className="text-sm text-green-600 font-medium">Active Subscriptions</p>
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
              <p className="text-sm text-yellow-600 font-medium">Expiring Soon</p>
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
              <p className="text-sm text-red-600 font-medium">Expired</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search subscription..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">
              Selected: {selectedSubscriptions.length} subscriptions
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBatchUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Update
              </button>
              <button
                onClick={handleBatchRenew}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Renew
              </button>
              <button
                onClick={handleBatchDisable}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Disable
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
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-Renew
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                      {new Date(sub.expiryDate).toLocaleDateString('en-US')}
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
