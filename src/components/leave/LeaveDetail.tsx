import { X, AlertCircle } from 'lucide-react';
import { useLeave, LeaveData } from '../../lib/LeaveContext';
import { getHolidaysInRange } from '../../lib/dateUtils';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

interface LeaveDetailProps {
  leaveData: LeaveData;
  onClose: () => void;
}

const LeaveDetail = ({ leaveData, onClose }: LeaveDetailProps) => {
  // Menggunakan context Leave
  const { } = useLeave();
  const { language } = useTheme();
  const { t } = useTranslation();

  // Format tanggal sesuai bahasa yang dipilih
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    // Gunakan locale yang sesuai dengan bahasa yang dipilih
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Verifikasi bahwa durasi cuti sesuai dengan jumlah hari kerja
  // Jika tidak sama, kita akan tetap gunakan nilai durasi dari data cuti

  // Mengambil daftar hari libur dan akhir pekan dalam rentang tanggal
  const getNonWorkingDays = () => {
    if (!leaveData.startDate || !leaveData.endDate) return [];
    
    return getHolidaysInRange(
      new Date(leaveData.startDate),
      new Date(leaveData.endDate)
    );
  };

  // Daftar hari libur dan akhir pekan
  const nonWorkingDays = getNonWorkingDays();

  return (
    <div className="fixed inset-0 z-50 bg-gray-800/60 overflow-y-auto flex items-center justify-center p-2">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl mx-auto my-2">
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">{t('leave_details_title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-2 text-gray-800 dark:text-gray-200 text-xs">
          <div className="mb-1">
            <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_employee_info')}</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_employee_name')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{leaveData.employeeName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_nip')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{leaveData.employeeNip || leaveData.employeeId}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-1 mt-1">
            <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_info')}</h3>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_type')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{leaveData.leaveType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_duration')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {leaveData.duration} {language === 'id' ? 'hari kerja' : 'working days'}
                  {nonWorkingDays.length > 0 && (
                    <span className="ml-1 cursor-help text-amber-500 dark:text-amber-400" title={language === 'id' ? "Tidak termasuk hari libur dan akhir pekan" : "Excluding holidays and weekends"}>
                      <AlertCircle className="inline w-3 h-3" />
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_status')}</p>
                <p className={`text-xs font-medium ${leaveData.status === 'Approved' ? 'text-green-600 dark:text-green-400' : leaveData.status === 'Pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {leaveData.status}
                </p>
              </div>
              {leaveData.startDate && leaveData.endDate && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_start_date')}</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatDate(leaveData.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_end_date')}</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatDate(leaveData.endDate)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>



          {/* Informasi Hari Libur dan Akhir Pekan */}
          {nonWorkingDays.length > 0 && (
            <div className="mb-1">
              <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_non_working_days')}</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-1 rounded border border-amber-100 dark:border-amber-800/40">
                <p className="text-xs text-amber-800 dark:text-amber-300 mb-1 text-[10px]">
                  {language === 'id' 
                    ? `${formatDate(leaveData.startDate)} - ${formatDate(leaveData.endDate)} mencakup ${nonWorkingDays.length} hari libur/akhir pekan:` 
                    : `${formatDate(leaveData.startDate)} - ${formatDate(leaveData.endDate)} includes ${nonWorkingDays.length} holidays/weekends:`
                  }
                </p>
                <div className="flex flex-wrap gap-0.5">
                  {nonWorkingDays.map((day, index) => (
                    <span 
                      key={index} 
                      className={`text-[10px] px-1 py-0.5 rounded ${day.isWeekend ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : day.isHoliday ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}
                    >
                      {new Date(day.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                      {day.isWeekend 
                        ? language === 'id' ? '(AP)' : '(W)' 
                        : day.isHoliday 
                          ? language === 'id' ? '(LN)' : '(H)' 
                          : language === 'id' ? '(CB)' : '(CL)'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {leaveData.reason && (
            <div className="mb-1">
              <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_reason')}</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded">
                <p className="text-gray-700 dark:text-gray-300 text-xs">{leaveData.reason}</p>
              </div>
            </div>
          )}
          
          <div className="mb-1">
            <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_quota')}</h3>
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_allocation')}</p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {leaveData.leaveType === 'Tahunan' ? '12 hari' : 
                   leaveData.leaveType === 'Besar' ? '90 hari' : 
                   leaveData.leaveType === 'Melahirkan' ? '90 hari' : 
                   leaveData.leaveType === 'Sakit' ? 'Sesuai kebutuhan' : '-'}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-1 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_used')}</p>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{leaveData.duration} {language === 'id' ? 'hari' : 'days'}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_remaining')}</p>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  {leaveData.leaveType === 'Tahunan' ? `${12 - (leaveData.duration || 0)} ${language === 'id' ? 'hari' : 'days'}` : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-1">
            <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_summary')}</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leave_type')}</th>
                    <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leave_allocation')}</th>
                    <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leave_used')}</th>
                    <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leave_remaining')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                  <tr>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{t('leave_annual')}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">12 {language === 'id' ? 'hari' : 'days'}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Tahunan' ? `${leaveData.duration} ${language === 'id' ? 'hari' : 'days'}` : `0 ${language === 'id' ? 'hari' : 'days'}`}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Tahunan' ? `${12 - (leaveData.duration || 0)} ${language === 'id' ? 'hari' : 'days'}` : `12 ${language === 'id' ? 'hari' : 'days'}`}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{t('leave_big')}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">90 {language === 'id' ? 'hari' : 'days'}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Besar' ? `${leaveData.duration} ${language === 'id' ? 'hari' : 'days'}` : `0 ${language === 'id' ? 'hari' : 'days'}`}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Besar' ? `${90 - (leaveData.duration || 0)} ${language === 'id' ? 'hari' : 'days'}` : `90 ${language === 'id' ? 'hari' : 'days'}`}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{t('leave_maternity')}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">90 {language === 'id' ? 'hari' : 'days'}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Melahirkan' ? `${leaveData.duration} ${language === 'id' ? 'hari' : 'days'}` : `0 ${language === 'id' ? 'hari' : 'days'}`}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Melahirkan' ? `${90 - (leaveData.duration || 0)} ${language === 'id' ? 'hari' : 'days'}` : `90 ${language === 'id' ? 'hari' : 'days'}`}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{t('leave_important_reason')}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">30 {language === 'id' ? 'hari' : 'days'}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Alasan Penting' ? `${leaveData.duration} ${language === 'id' ? 'hari' : 'days'}` : `0 ${language === 'id' ? 'hari' : 'days'}`}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Alasan Penting' ? `${30 - (leaveData.duration || 0)} ${language === 'id' ? 'hari' : 'days'}` : `30 ${language === 'id' ? 'hari' : 'days'}`}</td>
                  </tr>
                  <tr>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{t('leave_sick')}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{language === 'id' ? 'Sesuai kebutuhan' : 'As needed'}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">{leaveData.leaveType === 'Sakit' ? `${leaveData.duration} ${language === 'id' ? 'hari' : 'days'}` : `0 ${language === 'id' ? 'hari' : 'days'}`}</td>
                    <td className="px-1 py-0.5 text-gray-900 dark:text-white">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-1">
            <h3 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">{t('leave_system_info')}</h3>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_created_at')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatDate(leaveData.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_updated_at')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatDate(leaveData.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave_created_by')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{leaveData.inputBy || 'Admin Sistem'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end border-t border-gray-100 dark:border-gray-700 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors shadow-sm font-medium"
            >
              {language === 'id' ? 'Tutup' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetail;
