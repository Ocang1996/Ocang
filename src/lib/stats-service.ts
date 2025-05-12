import { supabase } from './supabase';

interface Employee {
  gender?: string;
  department?: string;
  rank?: string;
  birth_date?: string;
  employee_type?: string;
  status?: string;
  join_date?: string;
}

interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalWorkUnits: number;
}

interface DistributionData {
  label: string;
  value: number;
  percentage: number;
}

export const statsService = {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Get total employees
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get active employees
      const { count: activeEmployees, error: activeError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get inactive employees
      const { count: inactiveEmployees, error: inactiveError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'inactive');

      if (inactiveError) throw inactiveError;

      // Get total work units
      const { count: totalWorkUnits, error: workUnitsError } = await supabase
        .from('work_units')
        .select('*', { count: 'exact', head: true });

      if (workUnitsError) throw workUnitsError;

      return {
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        inactiveEmployees: inactiveEmployees || 0,
        totalWorkUnits: totalWorkUnits || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        totalWorkUnits: 0,
      };
    }
  },

  /**
   * Get gender distribution
   */
  async getGenderDistribution(): Promise<DistributionData[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('gender') as { data: Employee[], error: any };

      if (error) throw error;

      // Count gender distribution
      const genderCounts: Record<string, number> = {
        'Laki-laki': 0,
        'Perempuan': 0,
      };

      data.forEach((employee: Employee) => {
        const gender = employee.gender || 'Tidak Diketahui';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });

      const total = data.length;
      
      // Convert to distribution data format
      return Object.entries(genderCounts).map(([label, value]) => ({
        label,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error fetching gender distribution:', error);
      return [];
    }
  },

  /**
   * Get department distribution
   */
  async getDepartmentDistribution(): Promise<DistributionData[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('department') as { data: Employee[], error: any };

      if (error) throw error;

      // Count department distribution
      const deptCounts: Record<string, number> = {};

      data.forEach((employee: Employee) => {
        const dept = employee.department || 'Tidak Diketahui';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });

      const total = data.length;
      
      // Convert to distribution data format and sort by count
      return Object.entries(deptCounts)
        .map(([label, value]) => ({
          label,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching department distribution:', error);
      return [];
    }
  },

  /**
   * Get rank distribution
   */
  async getRankDistribution(): Promise<DistributionData[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('rank') as { data: Employee[], error: any };

      if (error) throw error;

      // Count rank distribution
      const rankCounts: Record<string, number> = {};

      data.forEach((employee: Employee) => {
        const rank = employee.rank || 'Tidak Diketahui';
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
      });

      const total = data.length;
      
      // Convert to distribution data format and sort by rank
      return Object.entries(rankCounts)
        .map(([label, value]) => ({
          label,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => {
          // Sort by Golongan if possible
          const getGolongan = (text: string): string => {
            const match = text.match(/Golongan\s+([IVXL]+)/i);
            return match ? match[1] : text;
          };
          
          const golA = getGolongan(a.label);
          const golB = getGolongan(b.label);
          
          return golA.localeCompare(golB);
        });
    } catch (error) {
      console.error('Error fetching rank distribution:', error);
      return [];
    }
  },

  /**
   * Get age distribution
   */
  async getAgeDistribution(): Promise<DistributionData[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('birth_date') as { data: Employee[], error: any };

      if (error) throw error;

      // Define age groups
      const ageGroups = [
        { min: 0, max: 20, label: '< 20 tahun' },
        { min: 20, max: 30, label: '20-30 tahun' },
        { min: 30, max: 40, label: '30-40 tahun' },
        { min: 40, max: 50, label: '40-50 tahun' },
        { min: 50, max: 60, label: '50-60 tahun' },
        { min: 60, max: 200, label: '> 60 tahun' },
      ];

      // Initialize counts
      const ageCounts: Record<string, number> = {};
      ageGroups.forEach((group: {min: number; max: number; label: string}) => {
        ageCounts[group.label] = 0;
      });

      // Calculate current date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // Count employees in each age group
      data.forEach((employee: Employee) => {
        if (employee.birth_date) {
          const birthYear = new Date(employee.birth_date).getFullYear();
          const age = currentYear - birthYear;
          
          const group = ageGroups.find(g => age >= g.min && age < g.max);
          if (group) {
            ageCounts[group.label]++;
          }
        }
      });

      const total = data.length;
      
      // Convert to distribution data format
      return ageGroups.map((group: {min: number; max: number; label: string}) => ({
        label: group.label,
        value: ageCounts[group.label],
        percentage: total > 0 ? (ageCounts[group.label] / total) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error fetching age distribution:', error);
      return [];
    }
  },

  /**
   * Get retirement projection data (Batas Usia Pensiun - BUP)
   */
  async getRetirementProjection(years: number = 5): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('birth_date, status')
        .eq('status', 'active') as { data: Employee[], error: any };

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const retirementAge = 58; // Usia pensiun standar (dapat disesuaikan)
      
      // Initialize yearly retirement counts
      const retirementByYear: Record<string, number> = {};
      
      for (let i = 0; i <= years; i++) {
        const year = currentYear + i;
        retirementByYear[year.toString()] = 0;
      }

      // Calculate retirement year for each employee
      data.forEach((employee: Employee) => {
        if (employee.birth_date) {
          const birthYear = new Date(employee.birth_date).getFullYear();
          const retirementYear = birthYear + retirementAge;
          
          if (retirementYear >= currentYear && retirementYear <= currentYear + years) {
            retirementByYear[retirementYear.toString()]++;
          }
        }
      });

      return retirementByYear;
    } catch (error) {
      console.error('Error fetching retirement projection:', error);
      return {};
    }
  },

  /**
   * Get detailed statistics
   */
  async getDetailedStats(): Promise<any> {
    try {
      // Fetch all data concurrently
      const [summary, genderDist, deptDist, rankDist, ageDist, retirementProj] = await Promise.all([
        this.getDashboardSummary(),
        this.getGenderDistribution(),
        this.getDepartmentDistribution(),
        this.getRankDistribution(),
        this.getAgeDistribution(),
        this.getRetirementProjection(),
      ]);

      return {
        summary,
        distributions: {
          gender: genderDist,
          department: deptDist,
          rank: rankDist,
          age: ageDist,
        },
        retirement: retirementProj,
      };
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      return {
        summary: {
          totalEmployees: 0,
          activeEmployees: 0,
          inactiveEmployees: 0,
          totalWorkUnits: 0,
        },
        distributions: {
          gender: [],
          department: [],
          rank: [],
          age: [],
        },
        retirement: {},
      };
    }
  },
};

export default statsService;
