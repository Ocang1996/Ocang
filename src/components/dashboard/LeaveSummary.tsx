import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useLeave } from '../../lib/LeaveContext';
import AddLeaveForm from '../leave/AddLeaveForm';

interface LeaveSummaryProps {
  userRole: 'admin' | 'superadmin' | 'user';
}

const LeaveSummary: React.FC<LeaveSummaryProps> = ({ userRole }) => {
  const { leaveData, leaveQuotas } = useLeave();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Statistik ringkasan cuti
  const statsData = useMemo(() => {
    const totalLeaveUsed = leaveData.reduce((total, leave) => total + (leave.duration || 0), 0);
    return { totalLeaveUsed };
  }, [leaveData]);
  
  // Hitung jumlah pegawai dengan data cuti
  const employeesWithLeave = useMemo(() => {
    return new Set(leaveData.map(leave => leave.employeeId));
  }, [leaveData]);
    
  // Hitung rata-rata sisa cuti dari leaveQuotas
  const averageRemainingLeave = useMemo(() => {
    if (leaveQuotas.length === 0) return "0.0";
    const totalRemaining = leaveQuotas.reduce((sum, quota) => sum + quota.totalAvailable, 0);
    return (totalRemaining / leaveQuotas.length).toFixed(1);
  }, [leaveQuotas]);
  
  // Format tanggal ke format Indonesia
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Ambil 5 data cuti terbaru
  const recentLeaves = [...leaveData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
    
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="w-full">
      {/* Card ringkasan cuti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Data Cuti</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{leaveData.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total data cuti dalam sistem</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pegawai dengan Cuti</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{employeesWithLeave.size}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Jumlah pegawai dengan data cuti</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rata-rata Sisa Cuti</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{averageRemainingLeave}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Rata-rata sisa cuti per pegawai</p>
        </div>
      </div>
      
      {/* Panel data cuti terbaru dengan tombol tambah */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Cuti Terbaru</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/leave')}
              className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Lihat Semua
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Tambah Data Cuti
              </button>
            )}
          </div>
        </div>
        
        {/* Tabel data cuti terbaru */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nama Pegawai
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Jenis Cuti
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Alokasi Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Digunakan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sisa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Periode
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {leave.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {12} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {leave.duration} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${12 - leave.duration > 5 ? 'text-green-600 dark:text-green-400' : 12 - leave.duration > 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {12 - leave.duration} hari
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {leave.startDate && leave.endDate ? (
                        `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/leave?id=${leave.id}`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada data cuti yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Form tambah cuti */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddLeaveForm 
              onClose={() => setShowAddForm(false)} 
              onSuccess={() => {
                setShowAddForm(false);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveSummary;
