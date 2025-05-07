import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  Users, 
  Award, 
  BookOpen, 
  Building, 
  ArrowUpRight, 
  Calendar, 
  Filter,
  Download,
  ArrowLeft
} from 'lucide-react';
import ReportExportMenu from './ReportExportMenu';
import { useEmployees } from '../../lib/EmployeeContext';

// Import chart components
import GenderDistributionChart from '../charts/GenderDistributionChart';
import EducationLevelChart from '../charts/EducationLevelChart';
import RankDistributionChart from '../charts/RankDistributionChart';
import WorkUnitDistributionChart from '../charts/WorkUnitDistributionChart';
import PositionDistributionChart from '../charts/PositionDistributionChart';
import AgeDistributionChart from '../charts/AgeDistributionChart';
import { prepareReportData } from './ReportsUtil';
import { formatNumber } from '../../lib/utils';

interface DemographicReportDashboardProps {
  dashboardData: any;
}

// Education data interface
interface EducationData {
  sd: number;
  smp: number;
  sma: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  s1: number;
  s2: number;
  s3: number;
}

// Interface for position data
interface PositionData {
  name: string;
  value: number;
}

// Age distribution data
interface AgeRange {
  under30: number;
  between30And40: number;
  between41And50: number;
  above50: number;
}

// Mock sub-units data for drill-down functionality
const departmentSubUnits = {
  'Sekretariat Utama': [
    { name: 'Biro Perencanaan', count: 189 },
    { name: 'Biro Keuangan', count: 163 },
    { name: 'Biro Hukum', count: 121 },
    { name: 'Biro Umum', count: 215 },
    { name: 'Biro SDM', count: 135 },
  ],
  'Deputi Bidang Strategi': [
    { name: 'Direktorat Perencanaan Strategi', count: 157 },
    { name: 'Direktorat Analisis Kebijakan', count: 142 },
    { name: 'Direktorat Evaluasi Strategi', count: 165 },
    { name: 'Direktorat Riset Kebijakan', count: 138 },
    { name: 'Direktorat Pemantauan', count: 150 },
  ],
  'Deputi Bidang Kebijakan': [
    { name: 'Direktorat Kebijakan Ekonomi', count: 171 },
    { name: 'Direktorat Kebijakan Sosial', count: 184 },
    { name: 'Direktorat Kebijakan Politik', count: 125 },
    { name: 'Direktorat Kebijakan Publik', count: 198 },
  ],
  'Deputi Bidang Inovasi': [
    { name: 'Direktorat Inovasi Teknologi', count: 142 },
    { name: 'Direktorat Inovasi Proses', count: 109 },
    { name: 'Direktorat Inovasi Pelayanan', count: 128 },
    { name: 'Direktorat Inkubasi Inovasi', count: 108 },
  ]
};

const DemographicReportDashboard: React.FC<DemographicReportDashboardProps> = ({
  dashboardData
}) => {
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  const { employees } = useEmployees();
  
  const [timeframe, setTimeframe] = useState<string>('year');
  const [year, setYear] = useState<string>('2023');
  const [month, setMonth] = useState<string>('5');
  const [department, setDepartment] = useState<string>('all');
  const [reportData, setReportData] = useState<Record<string, any[]>>({});
  const [focusedDepartment, setFocusedDepartment] = useState<string | null>(null);
  const [focusedDeptData, setFocusedDeptData] = useState<any[]>([]);
  const [workUnitData, setWorkUnitData] = useState<any[]>([]);
  
  // Refs for export functionality
  const genderChartRef = useRef<HTMLDivElement>(null);
  const educationChartRef = useRef<HTMLDivElement>(null);
  const rankChartRef = useRef<HTMLDivElement>(null);
  const unitChartRef = useRef<HTMLDivElement>(null);
  const positionChartRef = useRef<HTMLDivElement>(null);
  const ageChartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prepare education data using real employee data
  const prepareEducationData = (): EducationData => {
    if (!employees || employees.length === 0) {
      return {
        sd: 0, smp: 0, sma: 0, d1: 0, d2: 0, d3: 0, d4: 0, s1: 0, s2: 0, s3: 0
      };
    }
    
    const educationCounts = {
      sd: 0, smp: 0, sma: 0, d1: 0, d2: 0, d3: 0, d4: 0, s1: 0, s2: 0, s3: 0
    };
    
    employees.forEach(emp => {
      if (emp.educationLevel && educationCounts.hasOwnProperty(emp.educationLevel)) {
        educationCounts[emp.educationLevel as keyof typeof educationCounts]++;
      }
    });
    
    return educationCounts;
  };

  // Prepare position data for the chart with proper type conversion
  const preparePositionData = () => {
    // Calculate position types from actual employees data
    if (!employees || employees.length === 0) {
      return [];
    }
    
    const positionTypes: Record<string, number> = {};
    
    employees.forEach(emp => {
      let type = 'Lainnya';
      if (emp.position.includes('Kepala') || emp.position.includes('Direktur')) {
        type = 'Pejabat Struktural';
      } else if (emp.position.includes('Fungsional')) {
        type = 'Fungsional Tertentu';
      } else if (emp.position.includes('Analis') || emp.position.includes('Pengolah')) {
        type = 'Fungsional Umum';
      } else if (emp.position.includes('Pimpinan')) {
        type = 'Pimpinan Tinggi';
      }
      
      positionTypes[type] = (positionTypes[type] || 0) + 1;
    });
    
    return Object.entries(positionTypes).map(([type, count]) => ({
      type,
      count,
      subPositions: []
    }));
  };

  // Prepare age distribution data
  const prepareAgeData = (): AgeRange => {
    if (!employees || employees.length === 0) {
      return {
        under30: 0,
        between30And40: 0,
        between41And50: 0,
        above50: 0
      };
    }
    
    const ageGroups = {
      under30: 0,
      between30And40: 0,
      between41And50: 0,
      above50: 0
    };
    
    const today = new Date();
    
    employees.forEach(emp => {
      if (emp.birthDate) {
        const birthDate = new Date(emp.birthDate);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 30) ageGroups.under30++;
        else if (age >= 30 && age <= 40) ageGroups.between30And40++;
        else if (age >= 41 && age <= 50) ageGroups.between41And50++;
        else ageGroups.above50++;
      }
    });
    
    return ageGroups;
  };

  // Handle drill down on work unit chart
  const handleWorkUnitClick = (unitName: string) => {
    // Pertama cek apakah ada data departemen sub-unit yang didefinisikan
    if (departmentSubUnits[unitName as keyof typeof departmentSubUnits]) {
      setFocusedDepartment(unitName);
      setFocusedDeptData(departmentSubUnits[unitName as keyof typeof departmentSubUnits]);
      return;
    }
    
    // Jika tidak ada sub-unit yang didefinisikan, coba ambil dari data employee
    if (employees && employees.length > 0) {
      // Cari pegawai dengan unit kerja yang sama
      const employeesInUnit = employees.filter(emp => emp.workUnit === unitName);
      
      // Jika ada pegawai di unit tersebut
      if (employeesInUnit.length > 0) {
        setFocusedDepartment(unitName);
        
        // Buat data sub-unit sederhana (misalnya berdasarkan jabatan)
        const positionCounts: Record<string, number> = {};
        
        employeesInUnit.forEach(emp => {
          positionCounts[emp.position] = (positionCounts[emp.position] || 0) + 1;
        });
        
        const subUnitData = Object.entries(positionCounts).map(([name, count]) => ({
          name,
          count
        })).sort((a, b) => b.count - a.count);
        
        setFocusedDeptData(subUnitData);
      }
    }
  };

  // Go back from drill down view
  const handleBackFromDrillDown = () => {
    setFocusedDepartment(null);
    setFocusedDeptData([]);
  };

  // Load and prepare report data
  useEffect(() => {
    if (!dashboardData) return;
    
    const reportTypes = [
      'employee-distribution',
      'rank-distribution',
      'gender-distribution',
      'education-distribution',
      'position-distribution',
      'age-distribution'
    ];
    
    const preparedData: Record<string, any[]> = {};
    
    reportTypes.forEach(type => {
      preparedData[type] = prepareReportData(type, dashboardData);
    });
    
    setReportData(preparedData);
  }, [dashboardData]);

  // Get period text for display
  const getPeriodText = () => {
    if (timeframe === 'year') {
      return year;
    } else if (timeframe === 'quarter') {
      return `Q${Math.ceil(parseInt(month) / 3)} ${year}`;
    } else {
      // Get month name
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
  };

  // Get department text
  const getDepartmentText = () => {
    return department === 'all' ? 'Semua Unit' : department;
  };

  // Mock data for department filter
  const departments = [
    'all',
    'Sekretariat Utama',
    'Deputi Bidang Strategi',
    'Deputi Bidang Kebijakan',
    'Deputi Bidang Inovasi',
    'Deputi Bidang Pengawasan',
    'Inspektorat',
    'Pusat Data dan Informasi',
    'Pusat Kajian Strategis'
  ];

  // Tambahkan fungsi untuk menyiapkan data unit kerja dari data employee
  const prepareWorkUnitData = () => {
    if (!employees || employees.length === 0) {
      return [];
    }
    
    // Menghitung jumlah karyawan per unit kerja
    const unitCounts: Record<string, number> = {};
    
    employees.forEach(emp => {
      if (emp.workUnit) {
        unitCounts[emp.workUnit] = (unitCounts[emp.workUnit] || 0) + 1;
      }
    });
    
    // Konversi ke format yang dibutuhkan WorkUnitDistributionChart
    return Object.entries(unitCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  // Tambahkan useEffect untuk memperbarui workUnitData ketika employees berubah
  useEffect(() => {
    const workUnitData = prepareWorkUnitData();
    setWorkUnitData(workUnitData);
  }, [employees]);

  // Function to calculate gender statistics
  const getGenderStats = () => {
    if (!employees || employees.length === 0) return { male: 0, female: 0 };
    
    const male = employees.filter(emp => emp.gender === 'male').length;
    const female = employees.filter(emp => emp.gender === 'female').length;
    return { male, female, malePercent: (male / employees.length * 100).toFixed(2), femalePercent: (female / employees.length * 100).toFixed(2) };
  };

  // Function to calculate education statistics
  const getEducationStats = () => {
    if (!employees || employees.length === 0) return { highest: 's1', count: 0, percent: '0%' };
    
    const educationCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.educationLevel) {
        educationCounts[emp.educationLevel] = (educationCounts[emp.educationLevel] || 0) + 1;
      }
    });
    
    // Find highest education level
    let highest = '';
    let maxCount = 0;
    
    Object.entries(educationCounts).forEach(([level, count]) => {
      if (count > maxCount) {
        highest = level;
        maxCount = count;
      }
    });
    
    const educationLabels: Record<string, string> = {
      'sd': 'SD', 'smp': 'SMP', 'sma': 'SMA/SMK', 
      'd1': 'D1', 'd2': 'D2', 'd3': 'D3', 'd4': 'D4',
      's1': 'S1', 's2': 'S2', 's3': 'S3'
    };
    
    return { 
      highest: educationLabels[highest] || highest, 
      count: maxCount, 
      percent: ((maxCount / employees.length) * 100).toFixed(1)
    };
  };

  // Function to calculate rank statistics
  const getRankStats = () => {
    if (!employees || employees.length === 0) return { highest: 'III', count: 0, percent: '0%' };
    
    // Extract golongan (I, II, III, IV) from the rank string
    const golonganCounts: Record<string, number> = {};
    
    employees.forEach(emp => {
      if (emp.rank) {
        const golonganMatch = emp.rank.match(/^([IVX]+)/);
        if (golonganMatch) {
          const golongan = golonganMatch[1];
          golonganCounts[golongan] = (golonganCounts[golongan] || 0) + 1;
        }
      }
    });
    
    // Find highest rank
    let highest = '';
    let maxCount = 0;
    
    Object.entries(golonganCounts).forEach(([golongan, count]) => {
      if (count > maxCount) {
        highest = golongan;
        maxCount = count;
      }
    });
    
    return { 
      highest, 
      count: maxCount, 
      percent: ((maxCount / employees.length) * 100).toFixed(1)
    };
  };

  // Function to calculate largest work unit
  const getLargestWorkUnit = () => {
    if (!employees || employees.length === 0) return { name: '-', count: 0, percent: '0%' };
    
    const unitCounts: Record<string, number> = {};
    
    employees.forEach(emp => {
      if (emp.workUnit) {
        unitCounts[emp.workUnit] = (unitCounts[emp.workUnit] || 0) + 1;
      }
    });
    
    // Find largest unit
    let largestUnit = '';
    let maxCount = 0;
    
    Object.entries(unitCounts).forEach(([unit, count]) => {
      if (count > maxCount) {
        largestUnit = unit;
        maxCount = count;
      }
    });
    
    return { 
      name: largestUnit, 
      count: maxCount, 
      percent: ((maxCount / employees.length) * 100).toFixed(1)
    };
  };

  // Get stats objects
  const genderStats = getGenderStats();
  const educationStats = getEducationStats();
  const rankStats = getRankStats();
  const largestUnitStats = getLargestWorkUnit();
  
  // Count newly added employees this year
  const getNewEmployeesCount = () => {
    if (!employees || employees.length === 0) return 0;
    
    const currentYear = new Date().getFullYear();
    return employees.filter(emp => 
      emp.createdAt && new Date(emp.createdAt).getFullYear() === currentYear
    ).length;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {focusedDepartment ? (
        // Drill-down view - showing subunits for the focused department
        <div>
          <button 
            onClick={handleBackFromDrillDown}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft size={16} className="mr-1" />
            {language === 'id' ? 'Kembali ke Semua Unit' : 'Back to All Units'}
          </button>
          
          <h2 className="text-2xl font-bold mt-4 mb-6 text-gray-800 dark:text-white">
            {focusedDepartment}
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {language === 'id' ? 'Sub-Unit' : 'Sub-Units'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'id' ? 'Nama Sub-Unit' : 'Sub-Unit Name'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {language === 'id' ? 'Jumlah Pegawai' : 'Employee Count'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {focusedDeptData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/40' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main dashboard view */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('demographic_report')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('demographic_report_desc')}
          </p>

          {/* Key statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {t('total_employees')}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(employees?.length || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight size={12} className="mr-1" />
                <span>
                  +{getNewEmployeesCount()} {t('new_employees_this_month')}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {t('highest_rank')}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {getRankStats().highest}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Award size={20} />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                {getRankStats().percent}% {t('of_total_employees')} ({getRankStats().count})
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {t('highest_education')}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {getEducationStats().highest}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <BookOpen size={20} />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                {getEducationStats().percent}% {t('of_total_employees')} ({getEducationStats().count})
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {t('largest_unit')}
                  </h3>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
                    {getLargestWorkUnit().name}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Building size={20} />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                {getLargestWorkUnit().percent}% {t('of_total_employees')} ({getLargestWorkUnit().count})
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('gender_distribution')}
              </h3>
              <div ref={genderChartRef} id="gender-chart" className="h-72">
                <GenderDistributionChart data={getGenderStats()} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('chart_education_level')}
              </h3>
              <div ref={educationChartRef} id="education-chart" className="h-72">
                <EducationLevelChart data={prepareEducationData()} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('chart_rank_distribution')}
              </h3>
              <div ref={rankChartRef} id="rank-chart" className="h-72">
                <RankDistributionChart data={dashboardData?.rankData || []} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('chart_age_distribution')}
              </h3>
              <div ref={ageChartRef} id="age-chart" className="h-72">
                <AgeDistributionChart data={prepareAgeData()} />
              </div>
            </div>
          </div>

          {/* Work Unit Distribution with interactive table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {t('employee_distribution')}
            </h3>
            
            <div className="mb-6">
              <div ref={unitChartRef} id="unit-chart" className="h-80">
                <WorkUnitDistributionChart 
                  data={workUnitData} 
                  onWorkUnitClick={handleWorkUnitClick} 
                />
              </div>
            </div>
            
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('employee_department')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('total')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('male')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('female')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('highest_class')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('highest_education')}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          {/* Export Report Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {t('download_demographic_report')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
              {t('download_demographic_description')}
            </p>
            <ReportExportMenu 
              reportId="demographic-dashboard" 
              reportType="demographic-dashboard" 
              chartRef={containerRef} 
              data={employees}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DemographicReportDashboard; 