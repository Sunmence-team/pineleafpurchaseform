import React, { useState } from 'react';
import { FaDownload, FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import assets from '../assets/assests';

// Sample data array simulating form submissions
const sampleData = [
  {
    image: 'image1.png',
    title: 'Mr',
    firstName: 'John',
    middleName: 'A',
    lastName: 'Doe',
    address: '123 Main St, Lagos',
    dateOfBirth: new Date('1990-05-15'),
    nationality: 'Nigerian',
    maritalStatus: 'Married',
    gender: 'Male',
    spouseTitle: 'Mrs',
    spouseFirstName: 'Jane',
    spouseMiddleName: 'B',
    spouseLastName: 'Doe',
    stateOfOrigin: 'Lagos',
    lga: 'Ikeja',
    occupation: 'Engineer',
    countryOfResidence: 'Nigeria',
    language: 'English',
    email: 'john.doe@example.com',
    mobileNumber: '08012345678',
    telephoneNumber: '012345678',
    nextOfKinFullName: 'Jane Doe',
    nextOfKinAddress: '123 Main St, Lagos',
    nextOfKinMobileNumber: '08087654321',
    nextOfKinEmail: 'jane.doe@example.com',
    clientDeclarationLandPrice: '5000000',
    clientDeclarationNumberOfPlots: 2,
    clientDeclarationSiteLocation: 'Lekki Phase 1',
    clientDeclarationPlotNumber: 'A123',
    clientDeclarationClientName: 'Mr John A Doe',
    clientDeclarationSignature: 'data:image/png;base64,iVBORw0KGgo...',
    clientDeclarationDate: new Date('2025-09-01'),
    referralFullName: 'Michael Smith',
    referralMobileNumber: '08055555555',
    referralDate: new Date('2025-09-02'),
    referralEmail: 'michael.smith@example.com',
  },
  {
    image: 'image2.png',
    title: 'Mrs',
    firstName: 'Sarah',
    middleName: '',
    lastName: 'Johnson',
    address: '456 Oak Ave, Abuja',
    dateOfBirth: new Date('1985-08-22'),
    nationality: 'Nigerian',
    maritalStatus: 'Single',
    gender: 'Female',
    spouseTitle: '',
    spouseFirstName: '',
    spouseMiddleName: '',
    spouseLastName: '',
    stateOfOrigin: 'Abuja',
    lga: 'Gwagwalada',
    occupation: 'Teacher',
    countryOfResidence: 'Nigeria',
    language: 'English',
    email: 'sarah.johnson@example.com',
    mobileNumber: '08098765432',
    telephoneNumber: '',
    nextOfKinFullName: 'Peter Johnson',
    nextOfKinAddress: '456 Oak Ave, Abuja',
    nextOfKinMobileNumber: '08011122233',
    nextOfKinEmail: 'peter.johnson@example.com',
    clientDeclarationLandPrice: '3000000',
    clientDeclarationNumberOfPlots: 1,
    clientDeclarationSiteLocation: 'Gwarinpa',
    clientDeclarationPlotNumber: 'B456',
    clientDeclarationClientName: 'Mrs Sarah Johnson',
    clientDeclarationSignature: 'data:image/png;base64,iVBORw0KGgo...',
    clientDeclarationDate: new Date('2025-09-03'),
    referralFullName: 'Emily Brown',
    referralMobileNumber: '08044444444',
    referralDate: new Date('2025-09-04'),
    referralEmail: 'emily.brown@example.com',
  },
  // Additional entries for pagination testing
  ...Array.from({ length: 19 }, (_, i) => ({
    image: `image${i + 3}.png`,
    title: i % 2 === 0 ? 'Mr' : 'Mrs',
    firstName: `User${i + 3}`,
    middleName: i % 2 === 0 ? `M${i + 3}` : '',
    lastName: `Test${i + 3}`,
    address: `${100 + i} Test St, Lagos`,
    dateOfBirth: new Date(`199${i % 10}-0${(i % 9) + 1}-01`),
    nationality: 'Nigerian',
    maritalStatus: i % 2 === 0 ? 'Married' : 'Single',
    gender: i % 2 === 0 ? 'Male' : 'Female',
    spouseTitle: i % 2 === 0 ? 'Mrs' : '',
    spouseFirstName: i % 2 === 0 ? `Spouse${i + 3}` : '',
    spouseMiddleName: '',
    spouseLastName: i % 2 === 0 ? `Test${i + 3}` : '',
    stateOfOrigin: 'Lagos',
    lga: 'Surulere',
    occupation: 'Professional',
    countryOfResidence: 'Nigeria',
    language: 'English',
    email: `user${i + 3}@example.com`,
    mobileNumber: `080${1000000 + i}`,
    telephoneNumber: '',
    nextOfKinFullName: `Kin${i + 3}`,
    nextOfKinAddress: `${100 + i} Kin St, Lagos`,
    nextOfKinMobileNumber: `080${2000000 + i}`,
    nextOfKinEmail: `kin${i + 3}@example.com`,
    clientDeclarationLandPrice: `${2000000 + i * 100000}`,
    clientDeclarationNumberOfPlots: i % 3 + 1,
    clientDeclarationSiteLocation: `Location ${i + 3}`,
    clientDeclarationPlotNumber: `P${i + 3}`,
    clientDeclarationClientName: `${i % 2 === 0 ? 'Mr' : 'Mrs'} User${i + 3} Test${i + 3}`,
    clientDeclarationSignature: 'data:image/png;base64,iVBORw0KGgo...',
    clientDeclarationDate: new Date(`2025-09-${10 + i}`),
    referralFullName: `Referrer${i + 3}`,
    referralMobileNumber: `080${3000000 + i}`,
    referralDate: new Date(`2025-09-${11 + i}`),
    referralEmail: `referrer${i + 3}@example.com`,
  })),
];

// Function to convert data to CSV and trigger download
const downloadCSV = (data) => {
  const headers = [
    'Image',
    'Title',
    'First Name',
    'Middle Name',
    'Last Name',
    'Address',
    'Date of Birth',
    'Nationality',
    'Marital Status',
    'Gender',
    'Spouse Title',
    'Spouse First Name',
    'Spouse Middle Name',
    'Spouse Last Name',
    'State of Origin',
    'LGA',
    'Occupation',
    'Country of Residence',
    'Language',
    'Email',
    'Mobile Number',
    'Telephone Number',
    'Next of Kin Full Name',
    'Next of Kin Address',
    'Next of Kin Mobile Number',
    'Next of Kin Email',
    'Land Price',
    'Number of Plots',
    'Site Location',
    'Plot Number',
    'Client Declaration Name',
    'Signature',
    'Declaration Date',
    'Referral Full Name',
    'Referral Mobile Number',
    'Referral Date',
    'Referral Email',
  ];

  const rows = data.map(item => [
    item.image || '',
    item.title || '',
    item.firstName || '',
    item.middleName || '',
    item.lastName || '',
    item.address || '',
    item.dateOfBirth ? item.dateOfBirth.toISOString().split('T')[0] : '',
    item.nationality || '',
    item.maritalStatus || '',
    item.gender || '',
    item.spouseTitle || '',
    item.spouseFirstName || '',
    item.spouseMiddleName || '',
    item.spouseLastName || '',
    item.stateOfOrigin || '',
    item.lga || '',
    item.occupation || '',
    item.countryOfResidence || '',
    item.language || '',
    item.email || '',
    item.mobileNumber || '',
    item.telephoneNumber || '',
    item.nextOfKinFullName || '',
    item.nextOfKinAddress || '',
    item.nextOfKinMobileNumber || '',
    item.nextOfKinEmail || '',
    item.clientDeclarationLandPrice || '',
    item.clientDeclarationNumberOfPlots || '',
    item.clientDeclarationSiteLocation || '',
    item.clientDeclarationPlotNumber || '',
    item.clientDeclarationClientName || '',
    item.clientDeclarationSignature || '',
    item.clientDeclarationDate ? item.clientDeclarationDate.toISOString().split('T')[0] : '',
    item.referralFullName || '',
    item.referralMobileNumber || '',
    item.referralDate ? item.referralDate.toISOString().split('T')[0] : '',
    item.referralEmail || '',
  ].map(field => `"${field.toString().replace(/"/g, '""')}"`));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'client_data.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [downloadDateFrom, setDownloadDateFrom] = useState(null);
  const [downloadDateTo, setDownloadDateTo] = useState(null);
  const [filteredData, setFilteredData] = useState(sampleData);
  const recordsPerPage = 20;

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Filter by date range
  const applyDateFilter = () => {
    if (!filterDateFrom || !filterDateTo) {
      setFilteredData(sampleData);
    } else {
      const filtered = sampleData.filter(item => {
        const declDate = item.clientDeclarationDate ? new Date(item.clientDeclarationDate) : null;
        const refDate = item.referralDate ? new Date(item.referralDate) : null;
        return (
          (declDate && declDate >= filterDateFrom && declDate <= filterDateTo) ||
          (refDate && refDate >= filterDateFrom && refDate <= filterDateTo)
        );
      });
      setFilteredData(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    }
    setFilterModalOpen(false);
  };

  // Reset filter
  const resetFilter = () => {
    setFilteredData(sampleData);
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  // Download CSV with date filter
  const handleDownload = () => {
    if (!downloadDateFrom || !downloadDateTo) {
      downloadCSV(filteredData);
    } else {
      const filteredForDownload = filteredData.filter(item => {
        const declDate = item.clientDeclarationDate ? new Date(item.clientDeclarationDate) : null;
        const refDate = item.referralDate ? new Date(item.referralDate) : null;
        return (
          (declDate && declDate >= downloadDateFrom && declDate <= downloadDateTo) ||
          (refDate && refDate >= downloadDateFrom && refDate <= downloadDateTo)
        );
      });
      downloadCSV(filteredForDownload);
    }
    setDownloadModalOpen(false);
    setDownloadDateFrom(null);
    setDownloadDateTo(null);
  };

  return (
    <div className="w-full">
      <div className=" mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-12 transform transition-all duration-500 ease-in-out animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 m mb-4 md:mb-8 border-b border-gray-200 pb-3 md:pb-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-start">
            <img src={assets.logo} className="w-10 md:w-12" alt="Logo" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-secClr text-center md:text-left">
              Client Management Dashboard
            </h1>
          </div>

          {/* Right: Buttons */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex items-center justify-center w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-[#2F5318] text-white font-semibold rounded-lg hover:bg-[#254015] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaFilter className="mr-2" />
              Filter by Date
            </button>
            <button
              onClick={() => setDownloadModalOpen(true)}
              className="flex items-center justify-center w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-[#2F5318] text-white font-semibold rounded-lg hover:bg-[#254015] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaDownload className="mr-2" />
              Download CSV
            </button>
          </div>
        </div>


        {/* Table Container */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DOB</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nationality</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marital Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Spouse Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State of Origin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">LGA</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Occupation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Language</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next of Kin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kin Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kin Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Land Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plots</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Site Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plot Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Signature</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Declaration Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={item.image || 'https://via.placeholder.com/50'}
                      alt="Client"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {`${item.title || ''} ${item.firstName} ${item.middleName || ''} ${item.lastName}`.trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.mobileNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.dateOfBirth ? item.dateOfBirth.toISOString().split('T')[0] : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nationality}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.maritalStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {`${item.spouseTitle || ''} ${item.spouseFirstName || ''} ${item.spouseMiddleName || ''} ${item.spouseLastName || ''}`.trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.stateOfOrigin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.lga}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.occupation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.countryOfResidence}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nextOfKinFullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nextOfKinEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nextOfKinMobileNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.clientDeclarationLandPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.clientDeclarationNumberOfPlots}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.clientDeclarationSiteLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.clientDeclarationPlotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={item.clientDeclarationSignature || 'https://via.placeholder.com/50'}
                      alt="Signature"
                      className="w-16 h-8 object-contain border border-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.clientDeclarationDate ? item.clientDeclarationDate.toISOString().split('T')[0] : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.referralFullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.referralEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.referralMobileNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.referralDate ? item.referralDate.toISOString().split('T')[0] : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition duration-300 ${currentPage === page ? 'bg-[#2F5318] text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-black/90 p-4 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 w-full md:w-[40%] transform transition-all duration-300 animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Filter by Date</h3>
            <div className="flex gap-5 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <DatePicker
                  selected={filterDateFrom}
                  onChange={date => setFilterDateFrom(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select start date"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F5318]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <DatePicker
                  selected={filterDateTo}
                  onChange={date => setFilterDateTo(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select end date"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F5318]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={resetFilter}
                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Reset
              </button>
              <button
                onClick={applyDateFilter}
                className="px-3 sm:px-4 py-2 bg-[#2F5318] text-white font-semibold rounded-lg hover:bg-[#254015] transition duration-300"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 bg-black/90 p-4 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 w-full md:w-[40%] transform transition-all duration-300 animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Download CSV by Date</h3>
            <div className="flex gap-5 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <DatePicker
                  selected={downloadDateFrom}
                  onChange={date => setDownloadDateFrom(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select start date"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F5318]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <DatePicker
                  selected={downloadDateTo}
                  onChange={date => setDownloadDateTo(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select end date"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F5318]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="px-3 sm:px-4 py-2 bg-[#2F5318] text-white font-semibold rounded-lg hover:bg-[#254015] transition duration-300"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;