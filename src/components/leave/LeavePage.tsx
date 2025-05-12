import { useState, useEffect } from 'react';
import { useLeave } from '../../lib/LeaveContext';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useSidebar } from '../../lib/SidebarContext';
import { Search, Plus, Trash2, Eye, X, Check } from 'lucide-react';
import AddLeaveForm from './AddLeaveForm.tsx';
import LeaveDetail from './LeaveDetail.tsx';
import { isAdmin } from '../../lib/auth';

interface LeavePageProps {
  onLogout: () => void;
}

const LeavePage = ({ onLogout }: LeavePageProps) => {
  const { leaveData, deleteLeave } = useLeave();
  const { language } = useTheme();
  const { t } = useTranslation();
  const { expanded } = useSidebar(); // Menggunakan sidebar context
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Refresh komponen ketika bahasa berubah
  useEffect(() => {
    // Force re-render when language changes
  }, [language]);
  
  // Filter data cuti berdasarkan pencarian
  const filteredLeaveData = leaveData.filter(leave => 
    leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handler untuk menghapus data cuti
  const handleDeleteLeave = (id: string) => {
    const confirmMessage = language === 'id' ? 'Apakah Anda yakin ingin menghapus data cuti ini?' : 'Are you sure you want to delete this leave record?';
    if (window.confirm(confirmMessage)) {
      deleteLeave(id);
      setNotification({
        type: 'success',
        message: language === 'id' ? 'Data cuti berhasil dihapus' : 'Leave record successfully deleted'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  // Mendapatkan detail cuti
  const getLeaveDetail = (id: string) => {
    return leaveData.find(leave => leave.id === id);
  };
  
  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-[240px]' : 'ml-[88px] lg:ml-[104px]'} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        <Header title={t('leave_management')} onLogout={onLogout} />
        
        <div className="w-full px-4 sm:px-6 md:px-10 pt-24 pb-8">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('leave_title')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-6">
              {t('leave_description')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={language === 'id' ? "Cari nama pegawai..." : "Search employee name..."}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              
              {isAdmin() && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors text-xs font-medium"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  {t('leave_add')}
                </button>
              )}
            </div>
          </div>
          
          {/* Notifikasi */}
          {notification && (
            <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
              notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              <span>
                {notification.type === 'success' ? <Check size={18} className="inline mr-2" /> : <X size={18} className="inline mr-2" />}
                {notification.message}
              </span>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Tabel Data Cuti */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden mb-6">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_employee_name')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_type')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_allocation')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_duration')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_balance')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('leave_period')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeaveData.length > 0 ? (
                    filteredLeaveData.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {leave.employeeName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                          {leave.leaveType}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                          {leave.leaveType === 'Tahunan' ? '12 hari' : 
                           leave.leaveType === 'Besar' ? '90 hari' : 
                           leave.leaveType === 'Melahirkan' ? '90 hari' : 
                           leave.leaveType === 'Sakit' ? 'Sesuai kebutuhan' : 
                           leave.leaveType === 'Alasan Penting' ? '30 hari' : 
                           leave.leaveType === 'Di Luar Tanggungan Negara' ? '1095 hari' : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                          {leave.duration} hari
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                          {leave.leaveType === 'Tahunan' ? (
                            <span className="text-green-500">{12 - (leave.duration || 0)} hari</span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                          {leave.startDate && leave.endDate ? (
                            `${new Date(leave.startDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')} - ${new Date(leave.endDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}`
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-left">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setSelectedLeave(leave.id)}
                              className="text-emerald-400 hover:text-emerald-300 focus:outline-none focus:text-emerald-300 flex items-center"
                              title={t('leave_action_view')}
                            >
                              <Eye size={15} className="mr-1" />
                              <span className="text-xs">{language === 'id' ? 'Detail' : 'Details'}</span>
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteLeave(leave.id)}
                                className="text-red-400 hover:text-red-300 focus:outline-none focus:text-red-300 flex items-center"
                                title={t('leave_delete')}
                              >
                                <Trash2 size={15} className="mr-1" />
                                <span className="text-xs">{language === 'id' ? 'Hapus' : 'Delete'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-xs">
                        {searchQuery 
                          ? language === 'id' ? "Tidak ditemukan data cuti yang sesuai dengan pencarian." : "No leave records found matching your search." 
                          : language === 'id' ? "Belum ada data cuti yang tersedia." : "No leave records available yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Statistik Cuti */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">{language === 'id' ? 'Total Data Cuti' : 'Total Leave Records'}</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {leaveData.length}
                </div>
                <div className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Total data cuti dalam sistem' : 'Total leave records in system'}
                </div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">{language === 'id' ? 'Pegawai dengan Cuti' : 'Employees on Leave'}</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Set(leaveData.map(leave => leave.employeeId)).size}
                </div>
                <div className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Jumlah pegawai dengan data cuti' : 'Number of employees with leave records'}
                </div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">{language === 'id' ? 'Rata-rata Sisa Cuti' : 'Average Leave Balance'}</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {leaveData.filter(leave => leave.leaveType === 'Tahunan').length > 0 
                    ? (leaveData.filter(leave => leave.leaveType === 'Tahunan')
                        .reduce((acc, curr) => acc + (12 - (curr.duration || 0)), 0) / 
                        leaveData.filter(leave => leave.leaveType === 'Tahunan').length).toFixed(1) 
                    : "0.0"}
                </div>
                <div className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Rata-rata sisa cuti per pegawai' : 'Average remaining leave per employee'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Tambah Data Cuti */}
      {showAddForm && (
        <AddLeaveForm 
          onClose={() => setShowAddForm(false)} 
          onSuccess={() => {
            setShowAddForm(false);
            setNotification({
              type: 'success',
              message: 'Data cuti berhasil ditambahkan'
            });
            
            setTimeout(() => {
              setNotification(null);
            }, 3000);
          }}
        />
      )}
      
      {/* Detail Cuti */}
      {selectedLeave && (
        <LeaveDetail 
          leaveData={getLeaveDetail(selectedLeave)!}
          onClose={() => setSelectedLeave(null)}
        />
      )}
    </div>
  );
};

export default LeavePage;