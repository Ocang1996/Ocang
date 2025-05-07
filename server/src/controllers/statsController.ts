import { Request, Response } from 'express';
import Employee from '../models/Employee.js';
import WorkUnit from '../models/WorkUnit.js';

/**
 * Get overview statistics
 */
export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    // Count total employees
    const totalEmployees = await Employee.countDocuments();
    
    // Count new employees in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newEmployees = await Employee.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Count pending approvals
    const pendingApprovals = await Employee.countDocuments({
      status: 'pending'
    });
    
    // Count departments/work units
    const totalDepartments = await WorkUnit.countDocuments();
    
    res.status(200).json({
      totalEmployees,
      newEmployees,
      pendingApprovals,
      totalDepartments
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching overview statistics',
      error: error.message
    });
  }
};

/**
 * Get employee type distribution statistics
 */
export const getEmployeeTypeStats = async (req: Request, res: Response) => {
  try {
    // Get counts by employee type
    const pnsCount = await Employee.countDocuments({ employeeType: 'pns' });
    const p3kCount = await Employee.countDocuments({ employeeType: 'p3k' });
    const nonAsnCount = await Employee.countDocuments({ employeeType: 'nonAsn' });
    
    res.status(200).json({
      pns: pnsCount,
      p3k: p3kCount,
      nonAsn: nonAsnCount
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching employee type statistics',
      error: error.message
    });
  }
};

/**
 * Get gender distribution statistics
 */
export const getGenderDistributionStats = async (req: Request, res: Response) => {
  try {
    const maleCount = await Employee.countDocuments({ gender: 'male' });
    const femaleCount = await Employee.countDocuments({ gender: 'female' });
    
    res.status(200).json({
      male: maleCount,
      female: femaleCount
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching gender distribution statistics',
      error: error.message
    });
  }
};

/**
 * Get age distribution statistics
 */
export const getAgeDistributionStats = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    
    // Calculate birth date cutoffs for age ranges
    const age30Date = new Date(currentDate);
    age30Date.setFullYear(currentDate.getFullYear() - 30);
    
    const age40Date = new Date(currentDate);
    age40Date.setFullYear(currentDate.getFullYear() - 40);
    
    const age50Date = new Date(currentDate);
    age50Date.setFullYear(currentDate.getFullYear() - 50);
    
    // Count employees in different age ranges
    const under30 = await Employee.countDocuments({
      birthDate: { $gt: age30Date }
    });
    
    const between30And40 = await Employee.countDocuments({
      birthDate: { $lte: age30Date, $gt: age40Date }
    });
    
    const between41And50 = await Employee.countDocuments({
      birthDate: { $lte: age40Date, $gt: age50Date }
    });
    
    const above50 = await Employee.countDocuments({
      birthDate: { $lte: age50Date }
    });
    
    res.status(200).json({
      under30,
      between30And40,
      between41And50,
      above50
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching age distribution statistics',
      error: error.message
    });
  }
};

/**
 * Get work unit distribution statistics
 */
export const getWorkUnitDistributionStats = async (req: Request, res: Response) => {
  try {
    // Get top-level work units
    const topLevelUnits = await WorkUnit.find({ level: 1 });
    
    // Build work unit statistics with counts
    const unitsWithStats = await Promise.all(
      topLevelUnits.map(async (unit) => {
        const unitCount = await Employee.countDocuments({ workUnit: unit.id });
        
        // Find sub-units for this unit
        const subUnits = await WorkUnit.find({ parentUnit: unit._id });
        
        // Get counts for each sub-unit
        const subUnitsWithCounts = await Promise.all(
          subUnits.map(async (subUnit) => {
            const count = await Employee.countDocuments({ subUnit: subUnit.id });
            return {
              name: subUnit.name,
              count
            };
          })
        );
        
        return {
          name: unit.name,
          count: unitCount,
          subUnits: subUnitsWithCounts
        };
      })
    );
    
    res.status(200).json({
      units: unitsWithStats
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching work unit distribution statistics',
      error: error.message
    });
  }
};

/**
 * Get retirement prediction statistics
 */
export const getRetirementPredictionStats = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Calculate retirement dates
    const thisYearEnd = new Date(currentYear, 11, 31);
    const nextYearEnd = new Date(currentYear + 1, 11, 31);
    const fiveYearsEnd = new Date(currentYear + 5, 11, 31);
    
    // Count retirements
    const retiringThisYear = await Employee.countDocuments({
      retirementDate: { $lte: thisYearEnd }
    });
    
    const retiringNextYear = await Employee.countDocuments({
      retirementDate: { $gt: thisYearEnd, $lte: nextYearEnd }
    });
    
    const retiringNext5Years = await Employee.countDocuments({
      retirementDate: { $gt: currentDate, $lte: fiveYearsEnd }
    });
    
    // Generate yearly retirement data for the next 10 years
    const yearlyData = [];
    for (let i = 0; i < 10; i++) {
      const yearStart = new Date(currentYear + i, 0, 1);
      const yearEnd = new Date(currentYear + i, 11, 31);
      
      const count = await Employee.countDocuments({
        retirementDate: { $gte: yearStart, $lte: yearEnd }
      });
      
      yearlyData.push({
        year: currentYear + i,
        count
      });
    }
    
    res.status(200).json({
      thisYear: retiringThisYear,
      nextYear: retiringNextYear,
      next5Years: retiringNext5Years,
      yearlyData
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching retirement prediction statistics',
      error: error.message
    });
  }
};

/**
 * Get education level statistics
 */
export const getEducationLevelStats = async (req: Request, res: Response) => {
  try {
    // Count employees by education level
    const sd = await Employee.countDocuments({ educationLevel: 'sd' });
    const smp = await Employee.countDocuments({ educationLevel: 'smp' });
    const sma = await Employee.countDocuments({ educationLevel: 'sma' });
    const d1 = await Employee.countDocuments({ educationLevel: 'd1' });
    const d2 = await Employee.countDocuments({ educationLevel: 'd2' });
    const d3 = await Employee.countDocuments({ educationLevel: 'd3' });
    const d4 = await Employee.countDocuments({ educationLevel: 'd4' });
    const s1 = await Employee.countDocuments({ educationLevel: 's1' });
    const s2 = await Employee.countDocuments({ educationLevel: 's2' });
    const s3 = await Employee.countDocuments({ educationLevel: 's3' });
    
    res.status(200).json({
      sd, smp, sma, d1, d2, d3, d4, s1, s2, s3
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching education level statistics',
      error: error.message
    });
  }
};

/**
 * Get rank (golongan) distribution statistics
 */
export const getRankDistributionStats = async (req: Request, res: Response) => {
  try {
    // Define the ranks and corresponding pangkat
    const rankStructure = [
      {
        golongan: 'I',
        subGroups: [
          { pangkat: 'Juru Muda', rankCode: 'I/a' },
          { pangkat: 'Juru Muda Tingkat I', rankCode: 'I/b' },
          { pangkat: 'Juru', rankCode: 'I/c' },
          { pangkat: 'Juru Tingkat I', rankCode: 'I/d' }
        ]
      },
      {
        golongan: 'II',
        subGroups: [
          { pangkat: 'Pengatur Muda', rankCode: 'II/a' },
          { pangkat: 'Pengatur Muda Tingkat I', rankCode: 'II/b' },
          { pangkat: 'Pengatur', rankCode: 'II/c' },
          { pangkat: 'Pengatur Tingkat I', rankCode: 'II/d' }
        ]
      },
      {
        golongan: 'III',
        subGroups: [
          { pangkat: 'Penata Muda', rankCode: 'III/a' },
          { pangkat: 'Penata Muda Tingkat I', rankCode: 'III/b' },
          { pangkat: 'Penata', rankCode: 'III/c' },
          { pangkat: 'Penata Tingkat I', rankCode: 'III/d' }
        ]
      },
      {
        golongan: 'IV',
        subGroups: [
          { pangkat: 'Pembina', rankCode: 'IV/a' },
          { pangkat: 'Pembina Tingkat I', rankCode: 'IV/b' },
          { pangkat: 'Pembina Utama Muda', rankCode: 'IV/c' },
          { pangkat: 'Pembina Utama Madya', rankCode: 'IV/d' },
          { pangkat: 'Pembina Utama', rankCode: 'IV/e' }
        ]
      }
    ];
    
    // Count employees for each rank
    const rankDistribution = await Promise.all(
      rankStructure.map(async (rankGroup) => {
        // Count total for this golongan
        const rankPattern = new RegExp(`^${rankGroup.golongan}/`);
        const golonganCount = await Employee.countDocuments({
          rank: { $regex: rankPattern }
        });
        
        // Count for each subgroup
        const subGroupsWithCounts = await Promise.all(
          rankGroup.subGroups.map(async (subGroup) => {
            const count = await Employee.countDocuments({
              rank: subGroup.rankCode
            });
            
            return {
              pangkat: subGroup.pangkat,
              count
            };
          })
        );
        
        return {
          golongan: rankGroup.golongan,
          count: golonganCount,
          subGroups: subGroupsWithCounts
        };
      })
    );
    
    res.status(200).json({
      data: rankDistribution
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching rank distribution statistics',
      error: error.message
    });
  }
};

/**
 * Get position distribution statistics
 */
export const getPositionDistributionStats = async (req: Request, res: Response) => {
  try {
    // Define position categories
    const positionCategories = [
      {
        type: 'Struktural',
        positions: ['Kepala Biro', 'Kepala Bagian', 'Kepala Subbagian', 'Direktur', 'Kepala Bidang', 'Kepala Seksi']
      },
      {
        type: 'Fungsional',
        positions: ['Analis', 'Auditor', 'Peneliti', 'Widyaiswara', 'Dokter', 'Perawat', 'Pranata Komputer']
      },
      {
        type: 'Pelaksana',
        positions: ['Staff', 'Pengadministrasi', 'Pengelola', 'Petugas']
      }
    ];
    
    // Count employees for each position category
    const positionDistribution = await Promise.all(
      positionCategories.map(async (category) => {
        // Get total count using regex for matching any position in this category
        const positionPattern = new RegExp(category.positions.join('|'), 'i');
        const count = await Employee.countDocuments({
          position: { $regex: positionPattern }
        });
        
        // Get counts for specific positions
        const subPositionsWithCounts = await Promise.all(
          category.positions.map(async (position) => {
            const posRegex = new RegExp(position, 'i');
            const posCount = await Employee.countDocuments({
              position: { $regex: posRegex }
            });
            
            return {
              name: position,
              count: posCount
            };
          })
        );
        
        // Filter out positions with zero counts
        const filteredSubPositions = subPositionsWithCounts.filter(pos => pos.count > 0);
        
        return {
          type: category.type,
          count,
          subPositions: filteredSubPositions
        };
      })
    );
    
    res.status(200).json({
      data: positionDistribution
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching position distribution statistics',
      error: error.message
    });
  }
};

/**
 * Get retirement BUP statistics
 */
export const getRetirementBupStats = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const years = [];
    const administrasi = [];
    const fungsionalPertamaMuda = [];
    const fungsionalKeterampilan = [];
    const penelitiPerekayasaPertamaMuda = [];
    const pimpinanTinggi = [];
    const fungsionalMadya = [];
    const fungsionalUtama = [];
    
    // Calculate for 10 years
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      years.push(year);
      
      // Get birth year cutoffs for different BUP ages
      // Administrasi (58 years)
      const adminBirthYear = year - 58;
      const adminBirthDate = new Date(adminBirthYear, 0, 1);
      const adminCount = await Employee.countDocuments({
        position: { $regex: /staff|pengadministrasi|pengelola/i },
        birthDate: { $lte: adminBirthDate, $gt: new Date(adminBirthYear - 1, 0, 1) }
      });
      administrasi.push(adminCount);
      
      // Fungsional Pertama/Muda (58 years)
      const funcPertamaBirthYear = year - 58;
      const funcPertamaBirthDate = new Date(funcPertamaBirthYear, 0, 1);
      const funcPertamaCount = await Employee.countDocuments({
        position: { $regex: /analis|auditor|pranata/i },
        birthDate: { $lte: funcPertamaBirthDate, $gt: new Date(funcPertamaBirthYear - 1, 0, 1) }
      });
      fungsionalPertamaMuda.push(funcPertamaCount);
      
      // Fungsional Keterampilan (58 years)
      const funcKetBirthYear = year - 58;
      const funcKetBirthDate = new Date(funcKetBirthYear, 0, 1);
      const funcKetCount = await Employee.countDocuments({
        position: { $regex: /teknisi|terampil/i },
        birthDate: { $lte: funcKetBirthDate, $gt: new Date(funcKetBirthYear - 1, 0, 1) }
      });
      fungsionalKeterampilan.push(funcKetCount);
      
      // Peneliti/Perekayasa Pertama/Muda (60 years)
      const penelitiBirthYear = year - 60;
      const penelitiBirthDate = new Date(penelitiBirthYear, 0, 1);
      const penelitiCount = await Employee.countDocuments({
        position: { $regex: /peneliti|perekayasa/i },
        birthDate: { $lte: penelitiBirthDate, $gt: new Date(penelitiBirthYear - 1, 0, 1) }
      });
      penelitiPerekayasaPertamaMuda.push(penelitiCount);
      
      // Pimpinan Tinggi (60 years)
      const pimpinanBirthYear = year - 60;
      const pimpinanBirthDate = new Date(pimpinanBirthYear, 0, 1);
      const pimpinanCount = await Employee.countDocuments({
        position: { $regex: /direktur|kepala biro|kepala bagian/i },
        birthDate: { $lte: pimpinanBirthDate, $gt: new Date(pimpinanBirthYear - 1, 0, 1) }
      });
      pimpinanTinggi.push(pimpinanCount);
      
      // Fungsional Madya (60 years)
      const madyaBirthYear = year - 60;
      const madyaBirthDate = new Date(madyaBirthYear, 0, 1);
      const madyaCount = await Employee.countDocuments({
        position: { $regex: /madya/i },
        birthDate: { $lte: madyaBirthDate, $gt: new Date(madyaBirthYear - 1, 0, 1) }
      });
      fungsionalMadya.push(madyaCount);
      
      // Fungsional Utama (65 years)
      const utamaBirthYear = year - 65;
      const utamaBirthDate = new Date(utamaBirthYear, 0, 1);
      const utamaCount = await Employee.countDocuments({
        position: { $regex: /utama/i },
        birthDate: { $lte: utamaBirthDate, $gt: new Date(utamaBirthYear - 1, 0, 1) }
      });
      fungsionalUtama.push(utamaCount);
    }
    
    res.status(200).json({
      years,
      administrasi,
      fungsionalPertamaMuda,
      fungsionalKeterampilan,
      penelitiPerekayasaPertamaMuda,
      pimpinanTinggi,
      fungsionalMadya,
      fungsionalUtama
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching retirement BUP statistics',
      error: error.message
    });
  }
}; 