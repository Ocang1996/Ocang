export type EmployeeType = 'PNS' | 'P3K' | 'NON_ASN';
export type Gender = 'Laki-laki' | 'Perempuan';
export type Education = 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3';
export type PositionType = 'Struktural' | 'Fungsional' | 'Pelaksana';

export interface GolonganPangkat {
  golongan: string;
  pangkat: string;
}

export interface WorkUnit {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  code: string;
}

export interface Position {
  id: string;
  name: string;
  type: PositionType;
  level: number;
  workUnitId: string;
}

export interface Employee {
  id: string;
  nip: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  birthPlace: string;
  employeeType: EmployeeType;
  golonganPangkat?: GolonganPangkat;
  position: Position;
  workUnit: WorkUnit;
  education: Education;
  educationMajor?: string;
  hireDate: string;
  retirementDate?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  photoUrl?: string;
}

export interface EmployeeStats {
  total: number;
  byType: {
    pns: number;
    p3k: number;
    nonAsn: number;
  };
  byGender: {
    male: number;
    female: number;
  };
  byEducation: Record<Education, number>;
  byWorkUnit: Record<string, number>;
  byPosition: {
    struktural: number;
    fungsional: number;
    pelaksana: number;
  };
  byAge: {
    under30: number;
    between30And40: number;
    between41And50: number;
    above50: number;
  };
  retirementPrediction: {
    thisYear: number;
    nextYear: number;
    next5Years: number;
  };
} 