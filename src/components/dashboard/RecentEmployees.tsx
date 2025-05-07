import React, { useEffect, useState, useMemo } from 'react';
import { useEmployees } from '../../lib/EmployeeContext';
import { Eye, Edit } from 'lucide-react';
import type { Employee } from '../../lib/EmployeeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useTheme } from '../../lib/ThemeContext';

const RecentEmployees = () => {
  const { employees, loading, error, refreshData } = useEmployees();
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const { t } = useTranslation();
  const { language } = useTheme();

  // Only update recent employees when the employees array changes
  // Use useMemo to prevent unnecessary recalculations
  const memoizedRecentEmployees = useMemo(() => {
    if (employees && employees.length > 0) {
      const sorted = [...employees].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return sorted.slice(0, 5);
    }
    return [];
  }, [employees]);
  
  useEffect(() => {
    // Always update immediately when employees data changes
    setRecentEmployees(memoizedRecentEmployees);
  }, [memoizedRecentEmployees]);

  // Format date to a more readable format
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Sesuaikan dengan bahasa yang dipilih
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Don't render until we have data to show
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{error}</p>
        <button 
          onClick={refreshData}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
        >
          {t('cancel')}
        </button>
      </div>
    );
  }

  if (recentEmployees.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>{t('no_employees_found')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_position')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_department')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_rank')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_join_date')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_status')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('employee_actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {recentEmployees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {employee.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {employee.workUnit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {employee.rank || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {formatDate(employee.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${employee.status === 'Aktif' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : employee.status === 'Cuti' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium mx-1" title={t('view_details')}>
                  <Eye size={16} />
                </button>
                <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium mx-1" title={t('edit_profile')}>
                  <Edit size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(RecentEmployees);