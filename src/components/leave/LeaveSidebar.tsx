import React, { useState, useEffect } from 'react';
import { useLeave } from '../../lib/LeaveContext';
import { Link } from 'react-router-dom';
import { FileText, Download, AlertCircle, Check } from 'lucide-react';

interface LeaveSidebarProps {
  employeeId: string | number;
  employeeName: string;
  year?: number; // Optional year parameter, defaults to current year
}

const LeaveSidebar: React.FC<LeaveSidebarProps> = ({ 
  employeeId, 
  employeeName,
  year = new Date().getFullYear()
}) => {
  const { leaveData, leaveQuotas, getEmployeeLeaves, getEmployeeQuota } = useLeave();
  
  const [selectedYear, setSelectedYear] = useState<number>(year);
  const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  
  // Mendapatkan data cuti dan kuota cuti saat komponen dimuat atau tahun berubah
  useEffect(() => {
    const leaves = getEmployeeLeaves(employeeId)
      .filter(leave => new Date(leave.startDate).getFullYear() === selectedYear)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    setEmployeeLeaves(leaves);
    
    const employeeQuota = getEmployeeQuota(employeeId, selectedYear);
    setQuota(employeeQuota);
  }, [employeeId, selectedYear, leaveData, leaveQuotas, getEmployeeLeaves, getEmployeeQuota]);
  
  // Format tanggal ke format Indonesia
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Generate array of years for selection
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };
  
  // Mendapatkan warna status untuk kuota cuti
  const getQuotaStatusColor = () => {
    if (!quota) return 'text-gray-500';
    
    const { totalAvailable } = quota;
    if (totalAvailable === 0) return 'text-red-500';
    if (totalAvailable <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // Mendapatkan icon status untuk kuota cuti
  const getQuotaStatusIcon = () => {
    if (!quota) return null;
    
    const { totalAvailable } = quota;
    if (totalAvailable === 0) return <AlertCircle size={16} className="text-red-500" />;
    return <Check size={16} className="text-green-500" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-emerald-500 text-white p-4">
        <h3 className="text-lg font-semibold">Informasi Cuti Pegawai</h3>
        <p className="text-sm opacity-80">{employeeName}</p>
      </div>
      
      <div className="p-4">
        {/* Selector Tahun */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tahun
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Quota Information */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3 flex items-center justify-between">
            <span>Kuota Cuti Tahunan</span>
            {getQuotaStatusIcon()}
          </h4>
          
          {quota ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Cuti Tahunan:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{quota.annualQuota} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Dari Tahun Sebelumnya:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{quota.previousYearRemaining} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Sisa Cuti Tahun Ini:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{quota.annualRemaining} hari</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Sisa Cuti:</span>
                <span className={`text-sm font-bold ${getQuotaStatusColor()}`}>
                  {quota.totalAvailable} hari
                </span>
              </div>
              
              {quota.bigLeaveStatus && (
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-800 dark:text-blue-200">
                  Pegawai telah mengambil Cuti Besar pada tahun {quota.lastBigLeaveYear || selectedYear} dan tidak mendapatkan jatah Cuti Tahunan.
                </div>
              )}
              
              {quota.totalAvailable === 0 && !quota.bigLeaveStatus && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-xs text-red-800 dark:text-red-200">
                  Sisa cuti tahunan telah habis untuk tahun {selectedYear}.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada data kuota cuti untuk tahun {selectedYear}.</p>
          )}
        </div>
        
        {/* Leave History */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
            Riwayat Cuti
          </h4>
          
          {employeeLeaves.length > 0 ? (
            <div className="space-y-3">
              {employeeLeaves.map(leave => (
                <div key={leave.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      leave.leaveType === 'Tahunan' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      leave.leaveType === 'Sakit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      leave.leaveType === 'Besar' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      leave.leaveType === 'Melahirkan' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                    }`}>
                      {leave.leaveType}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      leave.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      leave.status === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{leave.duration} hari</span>
                    <div className="flex items-center space-x-2">
                      {leave.document && (
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                          title="Unduh dokumen pendukung"
                        >
                          <Download size={14} />
                        </button>
                      )}
                      <button 
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center"
                        title="Lihat detail cuti"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Diinput oleh: {leave.inputBy}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada riwayat cuti untuk tahun {selectedYear}.</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-center">
        <Link 
          to="/leave" 
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
        >
          Lihat Semua Data Cuti
        </Link>
      </div>
    </div>
  );
};

export default LeaveSidebar;
