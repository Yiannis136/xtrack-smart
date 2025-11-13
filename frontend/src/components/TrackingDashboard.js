import { useState, useEffect } from 'react';
import { uploadCSV, getTrackingRecords, getUniqueIdentifiers, addManualTrip } from '../services/api';
import Select from 'react-select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function TrackingDashboard({ token, user }) {
  const [view, setView] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [identifiers, setIdentifiers] = useState({ ibuttons: [], vehicles: [] });
  const [selectedIdentifier, setSelectedIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('ibutton');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [allIdentifiers, setAllIdentifiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    date: '',
    time: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [addingTrip, setAddingTrip] = useState(false);

  useEffect(() => {
    loadIdentifiers();
    // Set end date to today by default
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today);
  }, []);

  const loadIdentifiers = async () => {
    try {
      const data = await getUniqueIdentifiers(token);
      setIdentifiers(data);
      if (data.ibuttons.length > 0) {
        setSelectedIdentifier(data.ibuttons[0]);
        setIdentifierType('ibutton');
      } else if (data.vehicles.length > 0) {
        setSelectedIdentifier(data.vehicles[0]);
        setIdentifierType('vehicle');
      }
    } catch (error) {
      console.error('Failed to load identifiers:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage('');
    setUploading(true);
    try {
      const data = await uploadCSV(token, file);
      
      let message = `✅ Upload complete!\n`;
      message += `• Total records in file: ${data.records_count}\n`;
      message += `• New records added: ${data.new_records}\n`;
      
      if (data.duplicates_skipped > 0) {
        message += `• Duplicates skipped: ${data.duplicates_skipped}\n`;
        message += `ℹ️ Duplicate records were automatically detected and skipped.`;
      }
      
      setMessage(message);
      await loadIdentifiers();
      e.target.value = '';
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const loadRecords = async () => {
    if (!selectedIdentifier || !startDate || !endDate) {
      setMessage('Please select identifier and date range');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const filters = {
        identifier: selectedIdentifier,
        start_date: startDate,
        end_date: endDate
      };
      const data = await getTrackingRecords(token, filters);
      setRecords(data.records);
      
      // If "All" is selected, store grouped data
      if (selectedIdentifier.toLowerCase() === 'all' && data.grouped) {
        setGroupedRecords(data.grouped);
        setAllIdentifiers(data.identifiers || []);
      } else {
        setGroupedRecords({});
        setAllIdentifiers([]);
      }
      
      setView('report');
    } catch (error) {
      setMessage('Failed to load records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setAddingTrip(true);
    setMessage('');

    try {
      // Combine date and time - handle both formats (HH:MM:SS and HH:MM)
      let timeValue = newTrip.time;
      if (!timeValue.includes(':')) {
        throw new Error('Invalid time format');
      }
      
      // If time doesn't have seconds, add them
      const timeParts = timeValue.split(':');
      if (timeParts.length === 2) {
        timeValue = `${timeValue}:00`;
      }
      
      const dateTime = `${newTrip.date}T${timeValue}`;
      
      const tripData = {
        record_type: identifierType,
        identifier: selectedIdentifier,
        date: new Date(dateTime).toISOString(),
        address: newTrip.address || 'Manual Entry',
        latitude: parseFloat(newTrip.latitude) || 0,
        longitude: parseFloat(newTrip.longitude) || 0,
        driver: identifierType === 'ibutton' ? getEmployeeName() : undefined,
        vehicle: identifierType === 'vehicle' ? getEmployeeName() : undefined
      };

      await addManualTrip(token, tripData);
      
      // Reset form
      setNewTrip({
        date: '',
        time: '',
        address: '',
        latitude: '',
        longitude: ''
      });
      setShowAddTrip(false);
      
      // Reload records
      await loadRecords();
      
      setMessage('✅ Trip added successfully!');
    } catch (error) {
      setMessage('❌ Failed to add trip: ' + error.message);
    } finally {
      setAddingTrip(false);
    }
  };

  const calculateDailySummary = () => {
    if (records.length === 0) return {};

    const summary = {};
    
    records.forEach(record => {
      const date = formatDate(record.date); // Use dd/MM/yyyy format
      if (!summary[date]) {
        summary[date] = {
          trips: [],
          firstTrip: null,
          lastTrip: null
        };
      }
      summary[date].trips.push(record);
    });

    // Calculate first/last trip and work hours
    Object.keys(summary).forEach(date => {
      const trips = summary[date].trips.sort((a, b) => new Date(a.date) - new Date(b.date));
      summary[date].firstTrip = trips[0];
      summary[date].lastTrip = trips[trips.length - 1];
      summary[date].tripCount = trips.length;

      // Calculate work hours
      const first = new Date(trips[0].date);
      const last = new Date(trips[trips.length - 1].date);
      const diffMs = last - first;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      summary[date].workHours = `${hours}h ${minutes}m`;
      summary[date].workHoursMs = diffMs;
    });

    return summary;
  };

  const formatDate = (date) => {
    // If already formatted, return as is
    if (typeof date === 'string' && date.includes('/')) {
      return date;
    }
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getEmployeeName = () => {
    // If "All" is selected, return a summary
    if (selectedIdentifier && selectedIdentifier.toLowerCase() === 'all') {
      if (Object.keys(groupedRecords).length > 0) {
        return `All ${identifierType === 'ibutton' ? 'Employees' : 'Vehicles'} (${Object.keys(groupedRecords).length} total)`;
      }
      return `All ${identifierType === 'ibutton' ? 'Employees' : 'Vehicles'}`;
    }
    
    if (records.length === 0) return 'N/A';
    const firstRecord = records[0];
    const name = firstRecord.driver || firstRecord.vehicle || 'N/A';
    
    // Hide names with encoding issues (question marks)
    if (name.includes('?')) {
      return identifierType === 'ibutton' ? 'Driver' : 'Vehicle';
    }
    
    return name;
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Helper function to add a single identifier's report
      const addIdentifierReport = (identifier, identifierRecords, isFirst) => {
        if (!isFirst) {
          doc.addPage();
        }
        
        // Calculate daily summary for this identifier
        const identifierDailySummary = {};
        identifierRecords.forEach(record => {
          const date = formatDate(record.date);
          if (!identifierDailySummary[date]) {
            identifierDailySummary[date] = {
              trips: [],
              firstTrip: null,
              lastTrip: null
            };
          }
          identifierDailySummary[date].trips.push(record);
        });
        
        Object.keys(identifierDailySummary).forEach(date => {
          const trips = identifierDailySummary[date].trips.sort((a, b) => new Date(a.date) - new Date(b.date));
          identifierDailySummary[date].firstTrip = trips[0];
          identifierDailySummary[date].lastTrip = trips[trips.length - 1];
          identifierDailySummary[date].tripCount = trips.length;
          
          const first = new Date(trips[0].date);
          const last = new Date(trips[trips.length - 1].date);
          const diffMs = last - first;
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          identifierDailySummary[date].workHours = `${hours}h ${minutes}m`;
        });
        
        const totalDaysForId = Object.keys(identifierDailySummary).length;
        const totalTripsForId = identifierRecords.length;
        const totalWorkHoursMsForId = Object.values(identifierDailySummary).reduce((sum, day) => {
          const [h, m] = day.workHours.split(' ');
          const hours = parseInt(h);
          const minutes = parseInt(m);
          return sum + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
        }, 0);
        const totalHoursForId = Math.floor(totalWorkHoursMsForId / (1000 * 60 * 60));
        const totalMinutesForId = Math.floor((totalWorkHoursMsForId % (1000 * 60 * 60)) / (1000 * 60));
        
        const employeeName = identifierRecords[0]?.driver || identifierRecords[0]?.vehicle || 'N/A';
        
        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Tracking Report', pageWidth / 2, 15, { align: 'center' });
        
        // Employee/Vehicle Info
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`${identifierType === 'ibutton' ? 'Employee' : 'Vehicle'}: ${employeeName.includes('?') ? '[Name Hidden]' : employeeName}`, 14, 25);
        doc.text(`${identifierType === 'ibutton' ? 'iButton' : 'Vehicle ID'}: ${identifier}`, 14, 31);
        doc.text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, 14, 37);
        
        // Summary Stats
        doc.setFontSize(9);
        doc.text(`Total Trips: ${totalTripsForId} | Days: ${totalDaysForId} | Hours: ${totalHoursForId}h ${totalMinutesForId}m | Avg: ${totalDaysForId > 0 ? Math.round(totalHoursForId / totalDaysForId) : 0}h/day`, 14, 43);
        
        // Daily Summary Table
        const tableData = Object.entries(identifierDailySummary).map(([date, data]) => [
          date,
          data.tripCount,
          formatTime(data.firstTrip.date),
          formatTime(data.lastTrip.date),
          data.workHours
        ]);
        
        autoTable(doc, {
          startY: 48,
          head: [['Date', 'Trips', 'First Trip', 'Last Trip', 'Work Hours']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [66, 139, 202],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: { 
            fontSize: 8,
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 32, halign: 'left' },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 }
          },
          margin: { left: 14, right: 14 },
          didDrawPage: function(data) {
            // Footer
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
              `Page ${doc.getCurrentPageInfo().pageNumber}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          }
        });
      };
      
      // Check if "All" is selected
      if (selectedIdentifier.toLowerCase() === 'all' && Object.keys(groupedRecords).length > 0) {
        // Generate a page for each identifier
        let isFirst = true;
        Object.entries(groupedRecords).forEach(([identifier, identifierRecords]) => {
          addIdentifierReport(identifier, identifierRecords, isFirst);
          isFirst = false;
        });
      } else {
        // Single identifier report
        addIdentifierReport(selectedIdentifier, records, true);
      }
      
      // Save the PDF
      const fileName = `Report_${selectedIdentifier}_${startDate}_${endDate}.pdf`;
      doc.save(fileName);
      setMessage('✅ PDF exported successfully!');
    } catch (error) {
      console.error('PDF Export Error:', error);
      setMessage('❌ Failed to export PDF: ' + error.message);
    }
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Helper function to create a sheet for each identifier
      const createIdentifierSheet = (identifier, identifierRecords) => {
        // Calculate daily summary for this identifier
        const identifierDailySummary = {};
        identifierRecords.forEach(record => {
          const date = formatDate(record.date);
          if (!identifierDailySummary[date]) {
            identifierDailySummary[date] = {
              trips: [],
              firstTrip: null,
              lastTrip: null
            };
          }
          identifierDailySummary[date].trips.push(record);
        });
        
        Object.keys(identifierDailySummary).forEach(date => {
          const trips = identifierDailySummary[date].trips.sort((a, b) => new Date(a.date) - new Date(b.date));
          identifierDailySummary[date].firstTrip = trips[0];
          identifierDailySummary[date].lastTrip = trips[trips.length - 1];
          identifierDailySummary[date].tripCount = trips.length;
          
          const first = new Date(trips[0].date);
          const last = new Date(trips[trips.length - 1].date);
          const diffMs = last - first;
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          identifierDailySummary[date].workHours = `${hours}h ${minutes}m`;
        });
        
        const totalDaysForId = Object.keys(identifierDailySummary).length;
        const totalTripsForId = identifierRecords.length;
        const totalWorkHoursMsForId = Object.values(identifierDailySummary).reduce((sum, day) => {
          const [h, m] = day.workHours.split(' ');
          const hours = parseInt(h);
          const minutes = parseInt(m);
          return sum + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
        }, 0);
        const totalHoursForId = Math.floor(totalWorkHoursMsForId / (1000 * 60 * 60));
        const totalMinutesForId = Math.floor((totalWorkHoursMsForId % (1000 * 60 * 60)) / (1000 * 60));
        
        const employeeName = identifierRecords[0]?.driver || identifierRecords[0]?.vehicle || 'N/A';
        
        // Create horizontal layout (rows)
        const sheetData = [
          ['Tracking Report'],
          [],
          ['Field', 'Value'],
          [identifierType === 'ibutton' ? 'Employee' : 'Vehicle', employeeName.includes('?') ? '[Name Hidden]' : employeeName],
          [identifierType === 'ibutton' ? 'iButton' : 'Vehicle ID', identifier],
          ['Period', `${formatDate(startDate)} to ${formatDate(endDate)}`],
          [],
          ['Summary'],
          ['Total Trips', totalTripsForId],
          ['Total Days', totalDaysForId],
          ['Total Work Hours', `${totalHoursForId}h ${totalMinutesForId}m`],
          ['Average Hours per Day', `${totalDaysForId > 0 ? Math.round(totalHoursForId / totalDaysForId) : 0}h`],
          [],
          [],
          ['Daily Summary'],
          ['Date', 'Total Trips', 'First Trip (Check-In)', 'Last Trip (Check-Out)', 'Work Hours']
        ];
        
        // Add daily summary data
        Object.entries(identifierDailySummary).forEach(([date, data]) => {
          sheetData.push([
            date,
            data.tripCount,
            formatTime(data.firstTrip.date),
            formatTime(data.lastTrip.date),
            data.workHours
          ]);
        });
        
        // Add spacing
        sheetData.push([]);
        sheetData.push([]);
        
        // Add all trips header
        sheetData.push(['All Trips Details']);
        sheetData.push(['Date', 'Time', 'Address', 'Latitude', 'Longitude']);
        
        // Add all trips data
        identifierRecords.forEach(record => {
          sheetData.push([
            formatDate(record.date),
            formatTime(record.date),
            record.address,
            record.latitude,
            record.longitude
          ]);
        });
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Set column widths for better formatting
        ws['!cols'] = [
          { wch: 25 }, // Column A
          { wch: 20 }, // Column B
          { wch: 20 }, // Column C
          { wch: 20 }, // Column D
          { wch: 15 }  // Column E
        ];
        
        return ws;
      };
      
      // Check if "All" is selected
      if (selectedIdentifier.toLowerCase() === 'all' && Object.keys(groupedRecords).length > 0) {
        // Create a sheet for each identifier
        Object.entries(groupedRecords).forEach(([identifier, identifierRecords]) => {
          const ws = createIdentifierSheet(identifier, identifierRecords);
          // Clean sheet name (max 31 chars, no special characters)
          const sheetName = identifier.substring(0, 31).replace(/[:\\/?*\[\]]/g, '_');
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        
        // Also create a summary sheet with all identifiers
        const summaryData = [
          ['All Identifiers Summary'],
          [],
          ['Period', `${formatDate(startDate)} to ${formatDate(endDate)}`],
          ['Total Records', records.length],
          ['Total Identifiers', Object.keys(groupedRecords).length],
          [],
          ['Identifier', 'Total Trips', 'Total Days', 'Total Hours']
        ];
        
        Object.entries(groupedRecords).forEach(([identifier, identifierRecords]) => {
          const days = new Set(identifierRecords.map(r => formatDate(r.date))).size;
          summaryData.push([
            identifier,
            identifierRecords.length,
            days,
            '' // You can calculate hours here if needed
          ]);
        });
        
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
      } else {
        // Single identifier report
        const ws = createIdentifierSheet(selectedIdentifier, records);
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
      }
      
      // Save file
      const fileName = `Report_${selectedIdentifier}_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setMessage('✅ Excel file exported successfully!');
    } catch (error) {
      console.error('Excel Export Error:', error);
      setMessage('❌ Failed to export Excel: ' + error.message);
    }
  };

  const dailySummary = calculateDailySummary();
  const totalDays = Object.keys(dailySummary).length;
  const totalTrips = records.length;
  const totalWorkHoursMs = Object.values(dailySummary).reduce((sum, day) => sum + (day.workHoursMs || 0), 0);
  const totalHours = Math.floor(totalWorkHoursMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalWorkHoursMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setView('upload')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            view === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          data-testid="upload-view-button"
        >
          Upload CSV
        </button>
        <button
          onClick={() => setView('reports')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            view === 'reports'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          data-testid="reports-view-button"
        >
          Daily Reports
        </button>
        {records.length > 0 && (
          <button
            onClick={() => setView('report')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              view === 'report'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            View Current Report
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Success') || message.includes('Success!')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Upload View */}
      {view === 'upload' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload CSV File</h2>
          <p className="text-gray-600 mb-4">
            Upload tracking data in CSV format. System will auto-detect iButton or Vehicle format.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            data-testid="csv-upload-input"
          />
          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      )}

      {/* Reports View */}
      {view === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Daily Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select
                  value={
                    identifierType === 'ibutton' 
                      ? { value: 'ibutton', label: 'iButton/Driver' } 
                      : { value: 'vehicle', label: 'Vehicle' }
                  }
                  onChange={(option) => {
                    setIdentifierType(option.value);
                    if (option.value === 'ibutton' && identifiers.ibuttons.length > 0) {
                      setSelectedIdentifier(identifiers.ibuttons[0]);
                    } else if (option.value === 'vehicle' && identifiers.vehicles.length > 0) {
                      setSelectedIdentifier(identifiers.vehicles[0]);
                    }
                  }}
                  options={[
                    ...(identifiers.ibuttons.length > 0 ? [{ value: 'ibutton', label: 'iButton/Driver' }] : []),
                    ...(identifiers.vehicles.length > 0 ? [{ value: 'vehicle', label: 'Vehicle' }] : [])
                  ]}
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  placeholder="Select type..."
                  data-testid="identifier-type-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {identifierType === 'ibutton' ? 'iButton' : 'Vehicle'}
                </label>
                <Select
                  value={
                    selectedIdentifier 
                      ? { 
                          value: selectedIdentifier, 
                          label: selectedIdentifier === 'all' ? '🌐 All' : selectedIdentifier 
                        } 
                      : null
                  }
                  onChange={(option) => setSelectedIdentifier(option.value)}
                  options={[
                    { value: 'all', label: '🌐 All' },
                    ...(identifierType === 'ibutton'
                      ? identifiers.ibuttons.map(ib => ({ value: ib, label: ib }))
                      : identifiers.vehicles.map(v => ({ value: v, label: v })))
                  ]}
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  placeholder="Search and select..."
                  data-testid="identifier-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  data-testid="start-date-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  data-testid="end-date-input"
                />
              </div>
            </div>

            <button
              onClick={loadRecords}
              disabled={loading}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-400"
              data-testid="generate-report-button"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Report View */}
      {view === 'report' && records.length > 0 && (
        <div className="space-y-6">
          {/* Employee/Vehicle Info */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-indigo-100 mb-1">
                  {identifierType === 'ibutton' ? 'Employee Details' : 'Vehicle Details'}
                </p>
                <h3 className="text-2xl font-bold mb-2">{getEmployeeName()}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {identifierType === 'ibutton' ? 'iButton:' : 'Vehicle ID:'}
                    </span>
                    <span>{selectedIdentifier}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Period: {startDate} to {endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
              onClick={() => setShowAllTrips(true)}
              data-testid="total-trips-card"
            >
              <p className="text-sm text-gray-600 mb-1">Total Trips</p>
              <p className="text-3xl font-bold text-blue-600">{totalTrips}</p>
              <p className="text-xs text-blue-500 mt-2">👆 Click to view all trips</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Days</p>
              <p className="text-3xl font-bold text-green-600">{totalDays}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Work Hours</p>
              <p className="text-3xl font-bold text-orange-600">{totalHours}h {totalMinutes}m</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Avg Hours/Day</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalDays > 0 ? Math.round(totalHours / totalDays) : 0}h
              </p>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Daily Summary</h2>
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  data-testid="export-pdf-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  data-testid="export-excel-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" data-testid="daily-summary-table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Trip (Check-In)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Trip (Check-Out)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(dailySummary).map(([date, data], index) => (
                    <tr key={index} className="hover:bg-gray-50" data-testid={`daily-row-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {data.tripCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">{formatTime(data.firstTrip.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">{formatTime(data.lastTrip.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">
                          {data.workHours}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">Report Period:</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(startDate)} to {formatDate(endDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">Total Working Days:</p>
                  <p className="text-sm font-bold text-gray-900">{totalDays} days</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">Total Work Hours (Period):</p>
                  <p className="text-sm font-bold text-gray-900">{totalHours}h {totalMinutes}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Trips Modal */}
      {showAllTrips && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAllTrips(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">All Trips Details</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {getEmployeeName()} • {selectedIdentifier} • {formatDate(startDate)} to {formatDate(endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTrip(!showAddTrip)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                    data-testid="add-trip-button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Trip
                  </button>
                  <button
                    onClick={() => setShowAllTrips(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                    data-testid="close-modal-button"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add Trip Form */}
              {showAddTrip && (
                <form onSubmit={handleAddTrip} className="bg-white bg-opacity-10 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Manual Trip Entry
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Date *</label>
                      <input
                        type="date"
                        value={newTrip.date}
                        onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
                        required
                        className="w-full px-3 py-2 rounded border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        data-testid="manual-date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Time *</label>
                      <input
                        type="time"
                        step="1"
                        value={newTrip.time}
                        onChange={(e) => setNewTrip({...newTrip, time: e.target.value})}
                        required
                        className="w-full px-3 py-2 rounded border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        data-testid="manual-time-input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">Address</label>
                      <input
                        type="text"
                        value={newTrip.address}
                        onChange={(e) => setNewTrip({...newTrip, address: e.target.value})}
                        placeholder="Enter address (optional)"
                        className="w-full px-3 py-2 rounded border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        data-testid="manual-address-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newTrip.latitude}
                        onChange={(e) => setNewTrip({...newTrip, latitude: e.target.value})}
                        placeholder="35.1721"
                        className="w-full px-3 py-2 rounded border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        data-testid="manual-latitude-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newTrip.longitude}
                        onChange={(e) => setNewTrip({...newTrip, longitude: e.target.value})}
                        placeholder="33.3232"
                        className="w-full px-3 py-2 rounded border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        data-testid="manual-longitude-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={addingTrip}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-400 flex items-center gap-2"
                      data-testid="save-trip-button"
                    >
                      {addingTrip ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Trip
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTrip(false);
                        setNewTrip({ date: '', time: '', address: '', latitude: '', longitude: '' });
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Group by Date */}
              {Object.entries(dailySummary).map(([date, dayData], dayIndex) => (
                <div key={dayIndex} className="border-b">
                  {/* Date Header */}
                  <div 
                    className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200"
                    onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {dayData.tripCount}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{date}</h3>
                        <p className="text-sm text-gray-600">
                          {dayData.tripCount} trips • Work hours: {dayData.workHours}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-6 h-6 transition-transform ${selectedDate === date ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Trips for this date */}
                  {selectedDate === date && (
                    <div className="p-4 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">#</th>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">Address</th>
                            <th className="px-4 py-2 text-left">Coordinates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayData.trips.map((trip, tripIndex) => (
                            <tr key={tripIndex} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold">{tripIndex + 1}</td>
                              <td className="px-4 py-3">
                                <span className="font-mono bg-blue-50 px-2 py-1 rounded">
                                  {formatTime(trip.date)}
                                </span>
                              </td>
                              <td className="px-4 py-3">{trip.address}</td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {trip.latitude.toFixed(4)}, {trip.longitude.toFixed(4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Total: {totalTrips} trips</span> across {totalDays} days
              </div>
              <button
                onClick={() => setShowAllTrips(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackingDashboard;
