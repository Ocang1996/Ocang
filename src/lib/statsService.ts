import api from './api';
import { API_CONFIG } from './config';

export interface OverviewStats {
  totalEmployees: number;
  newEmployees: number;
  pendingApprovals: number;
  totalDepartments: number;
}

export interface EmployeeTypeStats {
  pns: number;
  p3k: number;
  nonAsn: number;
}

export interface GenderDistributionStats {
  male: number;
  female: number;
}

export interface AgeDistributionStats {
  under30: number;
  between30And40: number;
  between41And50: number;
  above50: number;
}

export interface WorkUnitDistributionStats {
  units: Array<{
    name: string;
    count: number;
    subUnits?: { name: string; count: number }[];
  }>;
}

export interface RetirementPredictionStats {
  thisYear: number;
  nextYear: number;
  next5Years: number;
  yearlyData: { year: number; count: number }[];
}

export interface EducationLevelStats {
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

export interface RankDistributionStats {
  data: Array<{
    golongan: string;
    count: number;
    subGroups?: { pangkat: string; count: number }[];
  }>;
}

export interface PositionDistributionStats {
  data: Array<{
    type: string;
    count: number;
    subPositions?: { name: string; count: number; unit?: string }[];
  }>;
}

export interface RetirementBupStats {
  administrasi: number[];
  fungsionalPertamaMuda: number[];
  fungsionalKeterampilan: number[];
  penelitiPerekayasaPertamaMuda: number[];
  pimpinanTinggi: number[];
  fungsionalMadya: number[];
  fungsionalUtama: number[];
  years: number[];
}

/**
 * Get overview statistics
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  try {
    return await api.get<OverviewStats>(API_CONFIG.ENDPOINTS.STATS.OVERVIEW);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    throw error;
  }
}

/**
 * Get employee type statistics
 */
export async function getEmployeeTypeStats(): Promise<EmployeeTypeStats> {
  try {
    return await api.get<EmployeeTypeStats>(API_CONFIG.ENDPOINTS.STATS.EMPLOYEE_TYPES);
  } catch (error) {
    console.error('Error fetching employee type stats:', error);
    throw error;
  }
}

/**
 * Get gender distribution statistics
 */
export async function getGenderDistributionStats(): Promise<GenderDistributionStats> {
  try {
    return await api.get<GenderDistributionStats>(API_CONFIG.ENDPOINTS.STATS.GENDER_DISTRIBUTION);
  } catch (error) {
    console.error('Error fetching gender distribution stats:', error);
    throw error;
  }
}

/**
 * Get age distribution statistics
 */
export async function getAgeDistributionStats(): Promise<AgeDistributionStats> {
  try {
    return await api.get<AgeDistributionStats>(API_CONFIG.ENDPOINTS.STATS.AGE_DISTRIBUTION);
  } catch (error) {
    console.error('Error fetching age distribution stats:', error);
    throw error;
  }
}

/**
 * Get work unit distribution statistics
 */
export async function getWorkUnitDistributionStats(): Promise<WorkUnitDistributionStats> {
  try {
    return await api.get<WorkUnitDistributionStats>(API_CONFIG.ENDPOINTS.STATS.WORK_UNIT_DISTRIBUTION);
  } catch (error) {
    console.error('Error fetching work unit distribution stats:', error);
    throw error;
  }
}

/**
 * Get retirement prediction statistics
 */
export async function getRetirementPredictionStats(): Promise<RetirementPredictionStats> {
  try {
    return await api.get<RetirementPredictionStats>(API_CONFIG.ENDPOINTS.STATS.RETIREMENT_PREDICTION);
  } catch (error) {
    console.error('Error fetching retirement prediction stats:', error);
    throw error;
  }
}

/**
 * Get education level statistics
 */
export async function getEducationLevelStats(): Promise<EducationLevelStats> {
  try {
    return await api.get<EducationLevelStats>(API_CONFIG.ENDPOINTS.STATS.EDUCATION_LEVELS);
  } catch (error) {
    console.error('Error fetching education level stats:', error);
    throw error;
  }
}

/**
 * Get rank distribution statistics
 */
export async function getRankDistributionStats(): Promise<RankDistributionStats> {
  try {
    return await api.get<RankDistributionStats>(API_CONFIG.ENDPOINTS.STATS.RANK_DISTRIBUTION);
  } catch (error) {
    console.error('Error fetching rank distribution stats:', error);
    throw error;
  }
}

/**
 * Get position distribution statistics
 */
export async function getPositionDistributionStats(): Promise<PositionDistributionStats> {
  try {
    return await api.get<PositionDistributionStats>(API_CONFIG.ENDPOINTS.STATS.POSITION_DISTRIBUTION);
  } catch (error) {
    console.error('Error fetching position distribution stats:', error);
    throw error;
  }
}

/**
 * Get retirement BUP statistics
 */
export async function getRetirementBupStats(): Promise<RetirementBupStats> {
  try {
    return await api.get<RetirementBupStats>(API_CONFIG.ENDPOINTS.STATS.RETIREMENT_BUP);
  } catch (error) {
    console.error('Error fetching retirement BUP stats:', error);
    throw error;
  }
} 