import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import StatCard from './StatCard';
import { ArrowUpRight, Users, UserPlus, FileText, Briefcase, CalendarClock, Award } from 'lucide-react';
import EmployeeTypeChart from '../charts/EmployeeTypeChart';
import GenderDistributionChart from '../charts/GenderDistributionChart';
import AgeDistributionChart from '../charts/AgeDistributionChart';
import WorkUnitDistributionChart from '../charts/WorkUnitDistributionChart';
import EducationLevelChart from '../charts/EducationLevelChart';
import RankDistributionChart from '../charts/RankDistributionChart';
import PositionDistributionChart from '../charts/PositionDistributionChart';
import RetirementBupChart from '../charts/RetirementBupChart';
import { UserRole } from '../../types/auth';
import { theme } from '../../lib/theme';
import { isDarkMode } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useEmployees, EmployeeProvider } from '../../lib/EmployeeContext';

interface DashboardProps {
  onLogout: () => void;
  userRole?: UserRole;
}

interface Stats {
  totalEmployees: number;
  newEmployees: number;
  pendingApprovals: number;
  totalDepartments: number;
  retirementSoon: number;
  newEmployeesChange: number;
  positionsChange: number;
  retirementChange: number;
}

const Dashboard = ({ onLogout, userRole = 'user' }: DashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployees: 0,
    pendingApprovals: 0,
    totalDepartments: 0,
    retirementSoon: 0,
    newEmployeesChange: 0,
    positionsChange: 0,
    retirementChange: 0
  });
  
  // Get employee data from context
  const { employees, loading: employeesLoading, error: employeesError, syncStatus } = useEmployees();
  
  // Get theme and translation functions
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [viewTransitioning, setViewTransitioning] = useState(false);
  
  // Remove scrollY state and use useRef instead to avoid rerenders
  const scrollYRef = useRef(0);
  
  // Use useMemo for state initializations to prevent unnecessary recalculations
  const [employeeTypesData, setEmployeeTypesData] = useState(useMemo(() => ({
    pns: 0,
    p3k: 0,
    nonAsn: 0
  }), []));
  
  const [genderData, setGenderData] = useState(useMemo(() => ({
    male: 0,
    female: 0
  }), []));
  
  const [ageData, setAgeData] = useState(useMemo(() => ({
    under30: 0,
    between30And40: 0,
    between41And50: 0,
    above50: 0
  }), []));
  
  const [workUnitData, setWorkUnitData] = useState<
    Array<{ name: string; count: number; subUnits?: { name: string; count: number }[] }>
  >([]);
  
  const [retirementData, setRetirementData] = useState(useMemo(() => ({
    thisYear: 0,
    nextYear: 0,
    next5Years: 0,
    yearlyData: [] as { year: number; count: number }[]
  }), []));
  
  // State baru untuk komponen baru
  const [educationData, setEducationData] = useState(useMemo(() => ({
    sd: 0,
    smp: 0,
    sma: 0,
    d1: 0,
    d2: 0,
    d3: 0,
    d4: 0,
    s1: 0,
    s2: 0,
    s3: 0
  }), []));
  
  const [rankData, setRankData] = useState<
    Array<{ 
      golongan: string; 
      count: number; 
      subGroups?: { pangkat: string; count: number }[] 
    }>
  >([]);
  
  const [positionData, setPositionData] = useState<
    Array<{ 
      type: string; 
      count: number; 
      subPositions?: { name: string; count: number; unit?: string }[] 
    }>
  >([]);
  
  const [retirementBupData, setRetirementBupData] = useState(useMemo(() => ({
    administrasi: [] as number[],
    fungsionalPertamaMuda: [] as number[],
    fungsionalKeterampilan: [] as number[],
    penelitiPerekayasaPertamaMuda: [] as number[],
    pimpinanTinggi: [] as number[],
    fungsionalMadya: [] as number[],
    fungsionalUtama: [] as number[],
    years: [] as number[],
    employeeData: {} as Record<string, Record<string, any[]>>
  }), []));
  
  // State untuk memaksa rerender komponen chart
  const [forceUpdateKey, setForceUpdateKey] = useState(Date.now());
  
  // Function khusus untuk update distribusi umur
  const updateAgeDistribution = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const ageGroups = {
      under30: 0,
      between30And40: 0,
      between41And50: 0,
      above50: 0
    };
    
    console.log('Running updateAgeDistribution for', employees.length, 'employees');
    
    // Loop melalui semua pegawai untuk menghitung distribusi umur
    employees.forEach(emp => {
      if (emp.birthDate) {
        const birthYear = new Date(emp.birthDate).getFullYear();
        const age = currentYear - birthYear;
        
        console.log(`Employee ${emp.name} age: ${age} years (born ${birthYear})`);
        
        if (age < 30) ageGroups.under30++;
        else if (age >= 30 && age <= 40) ageGroups.between30And40++;
        else if (age > 40 && age <= 50) ageGroups.between41And50++;
        else ageGroups.above50++;
      }
    });
    
    console.log('Age distribution updated:', {
      ...ageGroups,
      total: ageGroups.under30 + ageGroups.between30And40 + ageGroups.between41And50 + ageGroups.above50,
      timestamp: new Date().toISOString()
    });
    
    // Set ageData dengan nilai baru (memaksa rerender)
    setAgeData({...ageGroups});
    
    // Force key update untuk komponen AgeDistributionChart
    setForceUpdateKey(Date.now());
    
    return ageGroups;
  }, [employees]);
  
  // Check dark mode changes
  useEffect(() => {
    // No need for setIsDark here as we're using the isDark from useTheme()
    
    // Listen for dark mode changes for other functions that might need it
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Dark mode changes will be handled by ThemeContext
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Force re-render when language changes
  useEffect(() => {
    // This will re-render the component when language changes
  }, [language]);

  // Add a useEffect for the page loading animation and scroll tracking
  useEffect(() => {
    // Simulate initial page loading
    const pageLoadTimer = setTimeout(() => {
      setPageLoading(false);
    }, 1000); // Reduce initial loading time
    
    // Track scroll position for parallax effects
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(pageLoadTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Update stats based on actual employee data - use useCallback to prevent unnecessary function recreations
  const updateStats = useCallback(() => {
    if (!employeesLoading && employees.length > 0) {
      // Calculate real-time stats based on actual employee data
      const uniqueWorkUnits = new Set(employees.map(emp => emp.workUnit));
      const totalDepartments = uniqueWorkUnits.size;
      
      // Count employee types
      let pnsCount = 0;
      let p3kCount = 0;
      let nonAsnCount = 0;
      
      employees.forEach(emp => {
        // Standardize employee types from different formats
        const empType = (emp.employeeType || '').toLowerCase();
        
        if (empType === 'pns') {
          pnsCount++;
        } 
        // Handle both p3k and pppk
        else if (empType === 'p3k' || empType === 'pppk') {
          p3kCount++;
        } 
        // Handle both nonAsn and honorer
        else if (empType === 'nonasn' || empType === 'honorer') {
          nonAsnCount++;
        } else {
          console.warn(`Unknown employee type: ${empType}`);
        }
      });
      
      // Count by gender
      const maleCount = employees.filter(emp => emp.gender === 'male').length;
      const femaleCount = employees.filter(emp => emp.gender === 'female').length;
      
      // Count employees added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Count employees added in the last 60 days (for comparison)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const newEmployeesCount = employees.filter(emp => {
        if (emp.createdAt) {
          const createdDate = new Date(emp.createdAt);
          return createdDate >= thirtyDaysAgo;
        }
        return false;
      }).length;
      
      // Get employees added between 30-60 days ago (previous period)
      const previousPeriodEmployeesCount = employees.filter(emp => {
        if (emp.createdAt) {
          const createdDate = new Date(emp.createdAt);
          return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
        }
        return false;
      }).length;
      
      // Calculate percentage change in new employees
      let newEmployeesChange = 0;
      if (previousPeriodEmployeesCount > 0) {
        newEmployeesChange = parseFloat(((newEmployeesCount - previousPeriodEmployeesCount) / previousPeriodEmployeesCount * 100).toFixed(1));
      }
      
      // For pending approvals, use a more realistic estimate based on new employees
      // Assume 10% of new employees still need some approval
      const pendingApprovalsCount = Math.ceil(newEmployeesCount * 0.1);
      
      // For demo purposes, assume a slight increase in positions
      const positionsChange = 1.5;
      
      // For demo purposes, assume a decrease in retirement numbers
      const retirementChange = -8.3;
      
      // Calculate age groups
        const currentYear = new Date().getFullYear();
      const ageGroups = {
        under30: 0,
        between30And40: 0,
        between41And50: 0,
        above50: 0
      };
      
      // Count upcoming retirements and populate age groups
      let retirementThisYear = 0;
      let retirementNextYear = 0;
      let retirementNext5Years = 0;
      const retirementYearlyData: { year: number; count: number }[] = [];

      // Initialize yearly retirement counts for the next 10 years
      for (let i = 0; i <= 10; i++) {
        retirementYearlyData.push({
          year: currentYear + i,
          count: 0
        });
      }

      // Process employees for different types of statistics
      employees.forEach(emp => {
        if (emp.birthDate) {
          const birthYear = new Date(emp.birthDate).getFullYear();
          const age = currentYear - birthYear;
          
          // Populate age groups
          if (age < 30) ageGroups.under30++;
          else if (age >= 30 && age <= 40) ageGroups.between30And40++;
          else if (age > 40 && age <= 50) ageGroups.between41And50++;
          else ageGroups.above50++;
          
          // Calculate retirement year based on position and rank classification
          let retirementAge = 58; // Default retirement age
          
          // Set retirement age based on position type or rank
          if (emp.position) {
            const position = emp.position.toLowerCase();
            
            if (position.includes('kepala') || position.includes('direktur') || 
                position.includes('sekretaris') || position.includes('manager')) {
              retirementAge = 60; // Structural/leadership positions
            } else if (position.includes('ahli utama') || position.includes('peneliti utama')) {
              retirementAge = 65; // Senior specialist positions
            }
          }
          
          // Also check rank if available
          if (emp.rank) {
            const rank = emp.rank.toLowerCase();
            
            // Check for high-level positions in the rank
            if (rank.includes('iv/') || rank.includes('iv-') || 
                rank.includes('pembina') || rank.includes('ahli utama')) {
              retirementAge = Math.max(retirementAge, 60); // Higher ranks get at least 60
              
              // Check for the highest ranks
              if (rank.includes('iv/e') || rank.includes('iv-e') || 
                  rank.includes('utama') || rank.includes('ahli utama')) {
                retirementAge = 65; // Highest ranks get 65
              }
            }
          }
          
          const retirementYear = birthYear + retirementAge;
          const yearsToRetirement = retirementYear - currentYear;
          
          // Count retirements
          if (yearsToRetirement <= 0) {
            retirementThisYear++;
            const index = retirementYearlyData.findIndex(item => item.year === currentYear);
            if (index >= 0) retirementYearlyData[index].count++;
          } else if (yearsToRetirement === 1) {
            retirementNextYear++;
            const index = retirementYearlyData.findIndex(item => item.year === currentYear + 1);
            if (index >= 0) retirementYearlyData[index].count++;
          } else if (yearsToRetirement <= 5) {
            retirementNext5Years++;
            const index = retirementYearlyData.findIndex(item => item.year === currentYear + yearsToRetirement);
            if (index >= 0) retirementYearlyData[index].count++;
          }
        }
      });
      
      // Count upcoming retirements (simple calculation - those over 55)
      const retirementSoon = employees.filter(emp => {
        if (emp.birthDate) {
          const birthYear = new Date(emp.birthDate).getFullYear();
          const age = currentYear - birthYear;
          return age >= 55;
        }
        return false;
      }).length;
      
      // Process education data
      const educationCounts = {
        sd: 0,
        smp: 0,
        sma: 0,
        d1: 0,
        d2: 0,
        d3: 0,
        d4: 0,
        s1: 0,
        s2: 0,
        s3: 0
      };
      
      employees.forEach(emp => {
        if (emp.educationLevel && emp.educationLevel in educationCounts) {
          educationCounts[emp.educationLevel as keyof typeof educationCounts]++;
        }
      });
      
      // Process work unit data
      const workUnitCounts: Record<string, { count: number; subUnits: Record<string, number> }> = {};
      
      employees.forEach(emp => {
        if (emp.workUnit) {
          // Get the main department/unit by splitting at the first comma, slash, or hyphen
          const mainUnit = emp.workUnit.split(/[,\/-]/)[0].trim();
          
          if (!workUnitCounts[mainUnit]) {
            workUnitCounts[mainUnit] = { count: 0, subUnits: {} };
          }
          
          workUnitCounts[mainUnit].count++;
          
          // Also track the full work unit as a subunit
          if (emp.workUnit !== mainUnit) {
            if (!workUnitCounts[mainUnit].subUnits[emp.workUnit]) {
              workUnitCounts[mainUnit].subUnits[emp.workUnit] = 0;
            }
            workUnitCounts[mainUnit].subUnits[emp.workUnit]++;
          }
        }
      });
      
      // Convert to array for chart
      const workUnitArray = Object.entries(workUnitCounts)
        .map(([name, { count, subUnits }]) => ({
          name,
          count,
          subUnits: Object.entries(subUnits).map(([name, count]) => ({ name, count }))
        }))
        .sort((a, b) => b.count - a.count);
      
      // Process rank data with improved extraction and classification
      // Regular expressions for common rank/class formats
      const golonganPattern = /(?:golongan|gol|grade|g)\s*[.:]\s*([IVX]+)[\/\-]?([a-eA-E])?/i;
      const romanPattern = /\b([IVX]+)[\/\-]([a-eA-E])\b/i;
      const pembinaTktPattern = /\b(Pembina|Penata|Pengatur)(?:\s+(?:Tingkat|Tkt|Tk|T)\.?\s*([IVX]+))?/i;
      
      // Initialize rank/class counters
      const rankCounts: Record<string, { total: number; [key: string]: number }> = {
        'I': { total: 0 },
        'II': { total: 0 },
        'III': { total: 0 },
        'IV': { total: 0 }
      };
      
      // Track which employees have been counted to avoid duplicates
      const countedEmployees = new Set<string | number>();
      
      employees.forEach(emp => {
        // Skip if already counted
        if (countedEmployees.has(emp.id)) return;
        
        let processed = false;
        
        if (emp.rank) {
          // Try to extract golongan using different pattern matches
          let golongan = '';
          let pangkat = emp.rank.trim();
          
          // Extract from Golongan: IV/a format
          const golMatch = emp.rank.match(golonganPattern);
          if (golMatch) {
            golongan = golMatch[1]; // Roman numeral
            if (golMatch[2]) {
              golongan += '/' + golMatch[2].toLowerCase(); // Add the letter if available
            }
            processed = true;
          } 
          // Try to extract from direct roman numeral format IV/a
          else {
            const romanMatch = emp.rank.match(romanPattern);
            if (romanMatch) {
              golongan = romanMatch[1] + '/' + romanMatch[2].toLowerCase();
              processed = true;
            }
          }
          
          // Also extract from patterns like "Pembina Tingkat I (IV/b)"
          const pembinaMatch = emp.rank.match(pembinaTktPattern);
          if (pembinaMatch) {
            pangkat = pembinaMatch[0];
          }
          
          // As a fallback, check for roman numerals directly in the string
          if (!golongan) {
            if (emp.rank.includes('IV') || emp.rank.includes('iv')) golongan = 'IV';
            else if (emp.rank.includes('III') || emp.rank.includes('iii')) golongan = 'III';
            else if (emp.rank.includes('II') || emp.rank.includes('ii')) golongan = 'II';
            else if (emp.rank.includes('I') || emp.rank.includes('i')) golongan = 'I';
            
            processed = !!golongan;
          }
          
          // If golongan is still not determined, use emp.class if available
          if (!golongan && emp.class) {
            const classMatch = emp.class.match(romanPattern);
            if (classMatch) {
              golongan = classMatch[1] + '/' + classMatch[2].toLowerCase();
              processed = true;
            } else if (emp.class.includes('IV')) {
              golongan = 'IV';
              processed = true;
            }
            else if (emp.class.includes('III')) {
              golongan = 'III';
              processed = true;
            }
            else if (emp.class.includes('II')) {
              golongan = 'II';
              processed = true;
            }
            else if (emp.class.includes('I')) {
              golongan = 'I';
              processed = true;
            }
          }
          
          // If we found a golongan, increment the counters
          if (golongan) {
            // Get the base golongan (I, II, III, IV)
            const baseGolongan = golongan.match(/^([IVX]+)/)?.[1] || '';
            
            if (baseGolongan && baseGolongan in rankCounts) {
              rankCounts[baseGolongan].total++;
              
              // Also track the detailed golongan and pangkat
              if (!rankCounts[baseGolongan][golongan]) {
                rankCounts[baseGolongan][golongan] = 0;
              }
              rankCounts[baseGolongan][golongan]++;
              
              // Also track the pangkat separately if available
              if (pangkat && pangkat !== golongan) {
                if (!rankCounts[baseGolongan][pangkat]) {
                  rankCounts[baseGolongan][pangkat] = 0;
                }
                rankCounts[baseGolongan][pangkat]++;
              }
              
              // Mark this employee as counted
              countedEmployees.add(emp.id);
            }
          }
        }
        
        // Use fallback assignment if not processed yet
        if (!processed && !countedEmployees.has(emp.id)) {
          // Assign to a rank based on employee type
          let baseGolongan = 'III'; // Default for PNS
          
          if (emp.employeeType === 'pns') {
            if (emp.position) {
              const position = emp.position.toLowerCase();
              if (position.includes('kepala') || position.includes('direktur') || position.includes('manager')) {
                baseGolongan = 'IV';
              } else if (position.includes('staff') || position.includes('administrasi')) {
                baseGolongan = 'II';
              }
            }
          } else if (emp.employeeType === 'p3k') {
            baseGolongan = 'II';
          } else {
            baseGolongan = 'I';
          }
          
          rankCounts[baseGolongan].total++;
          // Mark this employee as counted
          countedEmployees.add(emp.id);
        }
      });
      
      // Convert rankCounts to the expected format for the charts
      const rankDataFormatted = Object.entries(rankCounts).map(([golongan, subGroups]) => ({
        golongan,
        count: subGroups.total,
        subGroups: Object.entries(subGroups)
          .filter(([key]) => key !== 'total')
          .map(([pangkat, count]) => ({ pangkat, count }))
      }));
      
      // Calculate position distribution with improved categorization
      const positionTypeMap: Record<string, string> = {
        // Structural positions
        'kepala': 'Struktural',
        'direktur': 'Struktural',
        'manajer': 'Struktural',
        'manager': 'Struktural',
        'kabid': 'Struktural',
        'sekretaris': 'Struktural',
        'kasubag': 'Struktural',
        'kasie': 'Struktural',
        'camat': 'Struktural',
        'lurah': 'Struktural',
        'koordinator': 'Struktural',
        'ketua': 'Struktural',
        'pimpinan': 'Struktural',
        
        // Functional positions
        'dokter': 'Fungsional',
        'guru': 'Fungsional',
        'dosen': 'Fungsional',
        'peneliti': 'Fungsional',
        'analis': 'Fungsional',
        'ahli': 'Fungsional',
        'pranata': 'Fungsional',
        'pengawas': 'Fungsional',
        'auditor': 'Fungsional',
        'penyuluh': 'Fungsional',
        'fungsional': 'Fungsional',
        'asisten': 'Fungsional',
        'tenaga': 'Fungsional',
        'pengajar': 'Fungsional',
        'operator': 'Fungsional',
        
        // Administrative positions
        'staff': 'Administrasi',
        'staf': 'Administrasi',
        'admin': 'Administrasi',
        'pengadministrasi': 'Administrasi',
        'pelaksana': 'Administrasi',
        'operasional': 'Administrasi',
        'pengelola': 'Administrasi',
        'pengumpul': 'Administrasi',
        'bendahara': 'Administrasi',
        'sekretariat': 'Administrasi',
        'pembantu': 'Administrasi',
        'petugas': 'Administrasi',
        'pembukuan': 'Administrasi',
        'arsiparis': 'Administrasi',
        'pendukung': 'Administrasi'
      };
      
      const positionCounts: Record<string, number> = {
        'Struktural': 0,
        'Fungsional': 0,
        'Administrasi': 0
      };
      
      const positionUnitMap: Record<string, Record<string, number>> = {
        'Struktural': {},
        'Fungsional': {},
        'Administrasi': {}
      };
      
      // Daftar lengkap semua posisi unik
      const allPositions: Record<string, { count: number; type: string }> = {};
      
      employees.forEach(emp => {
        if (emp.position) {
          const positionLower = emp.position.toLowerCase();
          
          // Determine position type
          let positionType = 'Administrasi'; // Default
          
          // Check if the position matches any keys in our map
          for (const [keyword, type] of Object.entries(positionTypeMap)) {
            if (positionLower.includes(keyword)) {
              positionType = type;
              break;
            }
          }
          
          // Increment counters
          positionCounts[positionType] = (positionCounts[positionType] || 0) + 1;
          
          // Track position by unit
          if (!positionUnitMap[positionType][emp.position]) {
            positionUnitMap[positionType][emp.position] = 0;
          }
          
          positionUnitMap[positionType][emp.position]++;
          
          // Track all unique positions
          if (!allPositions[emp.position]) {
            allPositions[emp.position] = { count: 0, type: positionType };
          }
          allPositions[emp.position].count++;
        }
      });
      
      // Convert position data to expected format
      const positionDataFormatted = Object.entries(positionCounts).map(([type, count]) => {
        const subPositions = positionUnitMap[type] 
          ? Object.entries(positionUnitMap[type]).map(([name, count]) => ({ name, count }))
          : [];
        
        return {
          type,
          count,
          subPositions: subPositions.sort((a, b) => b.count - a.count).slice(0, 10) // Top 10 positions
        };
      }).sort((a, b) => b.count - a.count); // Sort by count
      
      // Update retirement BUP data with improved categorization
      // BUP (Batas Usia Pensiun) categories based on position type
      const currentYearForBUP = new Date().getFullYear();
      const yearsForBUP = Array.from({length: 5}, (_, i) => currentYearForBUP + i);
      
      // Initialize retirement data structure
      const retirementBupDataFormatted = {
        administrasi: [0, 0, 0, 0, 0],
        fungsionalPertamaMuda: [0, 0, 0, 0, 0],
        fungsionalKeterampilan: [0, 0, 0, 0, 0],
        penelitiPerekayasaPertamaMuda: [0, 0, 0, 0, 0],
        pimpinanTinggi: [0, 0, 0, 0, 0],
        fungsionalMadya: [0, 0, 0, 0, 0],
        fungsionalUtama: [0, 0, 0, 0, 0],
        years: yearsForBUP,
        employeeData: {} as Record<string, Record<string, any[]>>
      };
      
      // Initialize employeeData structure for each year
      yearsForBUP.forEach(year => {
        retirementBupDataFormatted.employeeData[year] = {
          administrasi: [],
          fungsionalPertamaMuda: [],
          fungsionalKeterampilan: [],
          penelitiPerekayasaPertamaMuda: [],
          pimpinanTinggi: [],
          fungsionalMadya: [],
          fungsionalUtama: []
        };
      });
      
      // Process each employee for retirement prediction
      employees.forEach(emp => {
        if (emp.birthDate) {
          const birthDate = new Date(emp.birthDate);
          const birthYear = birthDate.getFullYear();
          const birthMonth = birthDate.getMonth();
          const birthDay = birthDate.getDate();
          
          // Determine employee category for BUP
          let category = 'administrasi'; // Default category
          let retirementAge = 58; // Default retirement age
          
          if (emp.position) {
            const position = emp.position.toLowerCase();
            
            // Structural positions (BUP 60)
            if (position.includes('kepala') || position.includes('direktur') || 
                position.includes('manager') || position.includes('sekretaris') ||
                position.includes('ketua') || position.includes('koordinator') ||
                position.includes('pimpinan') || position.includes('kabid') ||
                position.includes('kasubag') || position.includes('kasie')) {
              category = 'pimpinanTinggi';
              retirementAge = 60;
            }
            // Functional positions
            else if (position.includes('peneliti') || position.includes('perekayasa')) {
              if (position.includes('utama')) {
                category = 'fungsionalUtama';
                retirementAge = 65;
              } else if (position.includes('madya')) {
                category = 'fungsionalMadya';
                retirementAge = 60;
              } else {
                category = 'penelitiPerekayasaPertamaMuda';
                retirementAge = 58;
              }
            }
            else if (position.includes('ahli') || position.includes('fungsional')) {
              if (position.includes('utama')) {
                category = 'fungsionalUtama';
                retirementAge = 65;
              } else if (position.includes('madya')) {
                category = 'fungsionalMadya';
                retirementAge = 60;
              } else {
                category = 'fungsionalPertamaMuda';
                retirementAge = 58;
              }
            }
            else if (position.includes('terampil') || position.includes('mahir') || 
                    position.includes('penyelia')) {
              category = 'fungsionalKeterampilan';
              retirementAge = 58;
            }
          }
          
          // Also check rank for additional clues if available
          if (emp.rank) {
            const rank = emp.rank.toLowerCase();
            if (rank.includes('iv/')) {
              if (rank.includes('iv/c') || rank.includes('iv/d') || rank.includes('iv/e')) {
                if (category === 'fungsionalPertamaMuda') {
                  category = 'fungsionalMadya';
                  retirementAge = 60;
                }
              }
              if (rank.includes('iv/e')) {
                category = 'fungsionalUtama';
                retirementAge = 65;
              }
            }
          }
          
          // Calculate retirement date (last day of the month they reach retirement age)
          const retirementYear = birthYear + retirementAge;
          const retirementDate = new Date(retirementYear, birthMonth, birthDay);
          
          // Check if retirement falls within our prediction window
          for (let i = 0; i < yearsForBUP.length; i++) {
            const year = yearsForBUP[i];
            
            if (retirementYear === year) {
              // Increment the counter for this category and year
              (retirementBupDataFormatted as any)[category][i]++;
              
              // Add employee data to the detailed records
              if (retirementBupDataFormatted.employeeData[year] && 
                  retirementBupDataFormatted.employeeData[year][category]) {
                retirementBupDataFormatted.employeeData[year][category].push({
                  id: emp.id,
                  name: emp.name,
                  nip: emp.nip,
                  position: emp.position,
                  rank: emp.rank || '',
                  unit: emp.workUnit,
                  retirementDate: retirementDate.toISOString().split('T')[0],
                  age: retirementAge,
                  employeeType: emp.employeeType === 'pns' ? 'PNS' : 'PPPK',
                  gender: emp.gender === 'male' ? 'L' : 'P',
                  category
                });
              }
            }
          }
        }
      });
      
      // Update all the state
      setStats({
        totalEmployees: employees.length,
        newEmployees: newEmployeesCount,
        pendingApprovals: pendingApprovalsCount,
        totalDepartments,
        retirementSoon,
        newEmployeesChange,
        positionsChange,
        retirementChange
      });
      
      setEmployeeTypesData({
        pns: pnsCount,
        p3k: p3kCount,
        nonAsn: nonAsnCount
      });
      
      console.log('Setting employeeTypesData:', {
        pns: pnsCount,
        p3k: p3kCount,
        nonAsn: nonAsnCount,
        timestamp: new Date().toISOString()
      });
      
      setGenderData({
        male: maleCount,
        female: femaleCount
      });
      
      setAgeData(ageGroups);
      
      setWorkUnitData(workUnitArray);
      
      setEducationData(educationCounts);
      
      setRankData(rankDataFormatted);
      
      setPositionData(positionDataFormatted);
      
      setRetirementData({
        thisYear: retirementThisYear,
        nextYear: retirementNextYear,
        next5Years: retirementNext5Years,
        yearlyData: retirementYearlyData
      });
      
      setRetirementBupData(retirementBupDataFormatted);
      
      // Set loading to false when data is ready
      setLoading(false);
    }
  }, [employees, employeesLoading, syncStatus]);
  
  // Add a useEffect that triggers updateStats whenever employees or syncStatus changes
  useEffect(() => {
    console.log('Employee data or sync status changed, updating stats...', {
      employeesCount: employees.length,
      syncStatus,
      timestamp: new Date().toISOString()
    });
    
    // Force UI refresh
    setLoading(true);
    
    // Small delay to ensure all data is received
    setTimeout(() => {
      updateStats();
      setLoading(false);
    }, 50);
  }, [employees, syncStatus, updateStats]);

  // Add specific handler for syncStatus changes
  useEffect(() => {
    if (syncStatus === 'idle' && !employeesLoading) {
      // When sync is complete, refresh the data
      updateStats();
    }
  }, [syncStatus, employeesLoading, updateStats]);

  // Use static mock data if no employees data is available
  useEffect(() => {
    if (employees.length === 0 && !employeesLoading) {
      // Set mock data only once
      setLoading(false);
    }
  }, [employees, employeesLoading]);
  
  // Tambahkan handleViewDetails dan styleTab ke dalam komponen Dashboard
  const handleViewDetails = useCallback((viewName: string) => {
    if (viewName === selectedView) return;
    
    setViewTransitioning(true);
    setTimeout(() => {
    setSelectedView(viewName);
      setViewTransitioning(false);
    }, 300);
    
    // In a real app, you would fetch more detailed data here
    console.log(`Viewing details for: ${viewName}`);
  }, [selectedView]);

  // Memoize this function to prevent recreating it on each render
  const styleTab = useCallback((tabName: string) => {
    const isActive = selectedView === tabName;
    
    return {
      className: `py-3 px-6 font-medium rounded-t-lg transition-all duration-300 relative ${
        isActive 
        ? 'text-[' + theme.primary.main + '] dark:text-emerald-400 bg-white dark:bg-gray-800 border-t border-l border-r border-[' + theme.neutral.border + '] dark:border-gray-700' 
        : 'text-[' + theme.neutral.text.secondary + '] dark:text-gray-400 hover:text-[' + theme.secondary.main + '] dark:hover:text-emerald-400 bg-[' + theme.neutral.lightGray + '] dark:bg-gray-900'
      }`,
      style: isActive ? {
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)',
        borderBottom: isDark ? '2px solid #10B981' : '2px solid ' + theme.secondary.main,
      } : {},
      onClick: () => handleViewDetails(tabName)
    };
  }, [selectedView, isDark, handleViewDetails]);
  
  // Pastikan dashboard selalu diupdate saat ada perubahan employees
  useEffect(() => {
    if (!employeesLoading) {
      console.log('Employees data changed - triggering full dashboard update with', employees.length, 'employees');
      
      // Update semua statistik secara manual sesuai data terbaru
      const currentYear = new Date().getFullYear();
      const ageGroups = {
        under30: 0,
        between30And40: 0,
        between41And50: 0,
        above50: 0
      };
      
      // Count employee types
      let pnsCount = 0;
      let p3kCount = 0;
      let nonAsnCount = 0;
      
      // Loop melalui semua pegawai untuk kalkulasi data
      employees.forEach(emp => {
        // Hitung tipe pegawai
        const empType = (emp.employeeType || '').toLowerCase();
        if (empType === 'pns') {
          pnsCount++;
        } else if (empType === 'p3k' || empType === 'pppk') {
          p3kCount++;
        } else if (empType === 'nonasn' || empType === 'honorer') {
          nonAsnCount++;
        }
        
        // Hitung distribusi umur
        if (emp.birthDate) {
          const birthYear = new Date(emp.birthDate).getFullYear();
          const age = currentYear - birthYear;
          
          if (age < 30) ageGroups.under30++;
          else if (age >= 30 && age <= 40) ageGroups.between30And40++;
          else if (age > 40 && age <= 50) ageGroups.between41And50++;
          else ageGroups.above50++;
        }
      });
      
      // Log hasil perhitungan
      console.log('ONE-STOP UPDATE calculations:', {
        employeeTypes: {
          pns: pnsCount,
          p3k: p3kCount,
          nonAsn: nonAsnCount,
          total: pnsCount + p3kCount + nonAsnCount
        },
        ageGroups: {
          ...ageGroups,
          total: ageGroups.under30 + ageGroups.between30And40 + ageGroups.between41And50 + ageGroups.above50
        },
        timestamp: new Date().toISOString()
      });
      
      // Update state untuk memaksa rerender komponen
      setEmployeeTypesData({
        pns: pnsCount,
        p3k: p3kCount,
        nonAsn: nonAsnCount
      });
      
      setAgeData({...ageGroups});
      
      // Force update key untuk memaksa rerender charts
      setForceUpdateKey(Date.now());
    }
  }, [employees, employees.length, employeesLoading]);

  // Add specific effect to log employee changes and force dashboard update
  useEffect(() => {
    console.log(`Employee count changed: ${employees.length}`, {
      timestamp: new Date().toISOString()
    });
    
    // Forced update untuk counter tipe pegawai
    if (employees.length > 0) {
      const pnsCount = employees.filter(emp => emp.employeeType === 'pns').length;
      // Map both 'p3k' dan 'pppk' ke dalam counter yang sama
      const p3kCount = employees.filter(emp => 
        emp.employeeType === 'p3k' || 
        // @ts-ignore - handle different employee types from form
        emp.employeeType === 'pppk'
      ).length;
      // Map both 'nonAsn' dan 'honorer' ke dalam counter yang sama
      const nonAsnCount = employees.filter(emp => 
        emp.employeeType === 'nonAsn' || 
        // @ts-ignore - handle different employee types from form
        emp.employeeType === 'honorer'
      ).length;
      
      console.log('Manual recalculation of employee types:', {
        pns: pnsCount,
        p3k: p3kCount,
        nonAsn: nonAsnCount,
        total: pnsCount + p3kCount + nonAsnCount,
        employeeTypes: employees.map(e => e.employeeType),
        timestamp: new Date().toISOString()
      });
      
      // Force update statistik tipe pegawai
      setEmployeeTypesData({
        pns: pnsCount,
        p3k: p3kCount,
        nonAsn: nonAsnCount
      });
      
      // Juga update distribusi umur
      updateAgeDistribution();
      
      // Force rerender dengan mengupdate key
      setForceUpdateKey(Date.now());
    }
  }, [employees.length, updateAgeDistribution]);
  
  // Update bagian render dashboard dengan dark mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar onLogout={onLogout} userRole={userRole} />
      
      <div className="w-full min-h-screen">
        <Header 
          title={t('dashboard_title')} 
          onLogout={onLogout} 
        />
        
        <div className="mx-auto px-4 pt-24 pb-8 lg:ml-28 lg:mr-6 max-w-7xl">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('dashboard_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('dashboard_summary')}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex overflow-x-auto no-scrollbar">
              <button {...styleTab('overview')}>
                {t('tab_overview')}
              </button>
              <button {...styleTab('kepegawaian')}>
                {t('tab_employment')}
              </button>
              <button {...styleTab('pensiun')}>
                {t('tab_retirement')}
              </button>
            </div>
            <div className="h-0.5 bg-gray-200 dark:bg-gray-700 -mt-[1px]"></div>
          </div>

          <div className={`transition-opacity duration-300 ${viewTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm p-6 animate-pulse border border-gray-200/30 dark:border-gray-700/30">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Overview View */}
              {selectedView === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title={t('total_employees')}
                      value={stats.totalEmployees} 
                      icon={<Users size={20} />}
                      change={stats.newEmployeesChange}
                      period={language === 'id' ? "bulan" : "month"}
                    />
                    
                    <StatCard 
                      title={t('total_positions')}
                      value={positionData.reduce((total, category) => 
                        total + (category.subPositions?.length || 0), 0)}
                      icon={<Award size={20} />}
                      change={stats.positionsChange}
                      period={language === 'id' ? "bulan" : "month"}
                    />
                    
                    <StatCard 
                      title={t('total_departments')}
                      value={stats.totalDepartments} 
                      icon={<Briefcase size={20} />}
                      change={0}
                      period={language === 'id' ? "tahun" : "year"}
                    />
                    
                    <StatCard
                      title={t('retirement_soon')}
                      value={stats.retirementSoon}
                      icon={<CalendarClock size={20} />}
                      change={stats.retirementChange}
                      period={language === 'id' ? "bulan" : "month"}
                    />
                  </div>
                  
                  {/* Main dashboard grid with better organization */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Row 1: Gender and Employee Type, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <EmployeeTypeChart 
                        data={employeeTypesData} 
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        detailsPosition="bottom"
                        key={`employee-type-chart-${Date.now()}-${employees.length}-${JSON.stringify(employeeTypesData)}`}
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <GenderDistributionChart 
                        data={genderData} 
                        previousYearData={{
                          male: genderData.male * 0.95,
                          female: genderData.female * 0.96
                        }}
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        detailsPosition="bottom"
                      />
                    </div>
                    
                    {/* Row 2: Age and Work Unit Distribution, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <AgeDistributionChart 
                        data={ageData} 
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        key={`age-chart-${forceUpdateKey}-${employees.length}-${JSON.stringify(ageData)}`}
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <WorkUnitDistributionChart 
                        data={workUnitData} 
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                      />
                    </div>
                    
                    {/* Row 3: Rank and Education Level, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <RankDistributionChart 
                        data={rankData}
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        detailsPosition="bottom"
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <EducationLevelChart 
                        data={educationData}
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        detailsPosition="bottom"
                      />
                    </div>
                    
                    {/* Row 4: Retirement BUP spanning full width */}
                    <div className="col-span-12">
                      <RetirementBupChart 
                        data={retirementBupData} 
                        onViewDetails={() => handleViewDetails('pensiun')}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Kepegawaian View */}
              {selectedView === 'kepegawaian' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#3498DB] dark:from-emerald-500 dark:to-emerald-300 bg-clip-text text-transparent mb-2">
                    {t('data_employment')}
                  </h2>
                  
                  {/* Grid layout yang konsisten dengan tab overview */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Row 1: Employee Type and Gender, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <EmployeeTypeChart 
                        data={employeeTypesData}
                        detailsPosition="bottom" 
                        key={`employee-type-chart-kepegawaian-${Date.now()}-${employees.length}-${JSON.stringify(employeeTypesData)}`}
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <GenderDistributionChart 
                        data={genderData}
                        previousYearData={{
                          male: genderData.male * 0.95,
                          female: genderData.female * 0.96
                        }}
                        detailsPosition="bottom" 
                      />
                    </div>
                    
                    {/* Row 2: Age and Work Unit, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <AgeDistributionChart 
                        data={ageData} 
                        key={`age-chart-kepegawaian-${forceUpdateKey}-${employees.length}-${JSON.stringify(ageData)}`}
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <WorkUnitDistributionChart data={workUnitData} />
                    </div>
                    
                    {/* Row 3: Rank and Education, 6 columns each */}
                    <div className="col-span-12 md:col-span-6">
                      <RankDistributionChart 
                        data={rankData}
                        onViewDetails={() => handleViewDetails('kepegawaian')}
                        detailsPosition="bottom" 
                      />
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <EducationLevelChart 
                        data={educationData}
                        detailsPosition="bottom" 
                      />
                    </div>
                    
                    {/* Row 4: Position chart, full width */}
                    <div className="col-span-12">
                      <PositionDistributionChart data={positionData} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Retirement Prediction View */}
              {selectedView === 'pensiun' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#3498DB] dark:from-emerald-500 dark:to-emerald-300 bg-clip-text text-transparent">
                    {t('retirement_prediction')}
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <RetirementBupChart 
                      data={retirementBupData}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;