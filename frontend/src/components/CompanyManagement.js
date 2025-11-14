import { useState } from 'react';
import { mockCompanies } from '../data/mockData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function CompanyManagement() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [message, setMessage] = useState('');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.subscription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCompanies(filteredCompanies.map(c => c.id));
    } else {
      setSelectedCompanies([]);
    }
  };

  const handleSelectCompany = (id) => {
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter(cid => cid !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  const handleBatchUpdate = () => {
    if (selectedCompanies.length === 0) {
      setMessage('No companies selected');
      return;
    }
    console.log('Batch update for companies:', selectedCompanies);
    setMessage(`Updated ${selectedCompanies.length} companies`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchRenew = () => {
    if (selectedCompanies.length === 0) {
      setMessage('No companies selected');
      return;
    }
    console.log('Batch renew for companies:', selectedCompanies);
    setMessage(`Renewed licenses for ${selectedCompanies.length} companies`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBatchDisable = () => {
    if (selectedCompanies.length === 0) {
      setMessage('No companies selected');
      return;
    }
    if (window.confirm(`Are you sure you want to disable ${selectedCompanies.length} companies?`)) {
      console.log('Batch disable for companies:', selectedCompanies);
      setMessage(`Disabled ${selectedCompanies.length} companies`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const exportToExcel = () => {
    const data = filteredCompanies.map(company => ({
      'Company': company.name,
      'Subscription': company.subscription,
      'Vehicles': `${company.vehicleCount}/${company.vehicleLimit}`,
      'Users': company.userCount,
      'Status': company.status,
      'Expiry': new Date(company.expiryDate).toLocaleDateString('en-US'),
      'Days Remaining': company.daysRemaining
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Companies');
    XLSX.writeFile(wb, 'companies.xlsx');
    console.log('Exported to Excel');
  };

  const exportToPDF = () => {
    try {
      // Check if there is data to export
      if (!filteredCompanies || filteredCompanies.length === 0) {
        setMessage('No data to export. Please adjust your filters or add companies first.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Companies Table', 14, 15);
      
      // Prepare table data with safe fallbacks for undefined/null values
      const tableData = filteredCompanies.map(company => [
        company.name || '',
        company.subscription || '',
        `${company.vehicleCount || 0}/${company.vehicleLimit || 0}`,
        (company.userCount !== undefined && company.userCount !== null) ? company.userCount.toString() : '0',
        getStatusLabel(company.status) || '',
        company.expiryDate ? new Date(company.expiryDate).toLocaleDateString('en-US') : '',
        (company.daysRemaining !== undefined && company.daysRemaining !== null) ? company.daysRemaining.toString() : '0'
      ]);

      doc.autoTable({
        startY: 25,
        head: [['Company', 'Subscription', 'Vehicles', 'Users', 'Status', 'Expiry', 'Days']],
        body: tableData,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          fontStyle: 'normal',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { top: 25 },
        theme: 'striped'
      });

      doc.save('companies.pdf');
      setMessage('PDF created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setMessage('Error creating PDF: ' + (error.message || 'Unknown error'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      exceeded: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      warning: 'Warning',
      exceeded: 'Exceeded'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Company Management</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search company..."
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
              <option value="warning">Warning</option>
              <option value="exceeded">Exceeded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedCompanies.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">
              Selected: {selectedCompanies.length} companies
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

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => handleSelectCompany(company.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {company.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.vehicleCount}/{company.vehicleLimit}
                      {company.vehicleCount > company.vehicleLimit && (
                        <span className="ml-2 text-red-600">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.userCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>
                      {getStatusLabel(company.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(company.expiryDate).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      company.daysRemaining <= 15 ? 'text-red-600' :
                      company.daysRemaining <= 30 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {company.daysRemaining}
                    </span>
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

export default CompanyManagement;
