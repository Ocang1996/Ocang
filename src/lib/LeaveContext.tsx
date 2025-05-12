import React, { createContext, useContext, useState, useEffect } from 'react';
import { isNonWorkingDay } from './dateUtils';
import { addDays } from 'date-fns';

// Definisi tipe data cuti sesuai PP No. 11/2017 dan Peraturan BKN No. 7/2021
export type LeaveType = 
  | 'Tahunan' // Cuti tahunan (12 hari)
  | 'Sakit' // Cuti sakit (sesuai kebutuhan/surat dokter)
  | 'Besar' // Cuti besar (3 bulan setelah bekerja 5 tahun)
  | 'Melahirkan' // Cuti melahirkan (3 bulan)
  | 'Alasan Penting' // Cuti karena alasan penting (keluarga)
  | 'Di Luar Tanggungan Negara'; // CLTN (hingga 3 tahun)

// Data regulasi cuti
export const LEAVE_REGULATIONS = {
  'Tahunan': {
    maxDuration: 12, // 12 hari kerja
    minServiceYears: 1, // Minimum 1 tahun bekerja
    description: 'Cuti tahunan selama 12 hari kerja setelah bekerja minimal 1 tahun. Dapat diakumulasi hingga maksimal 18 hari.'
  },
  'Sakit': {
    maxDuration: 365, // 1 tahun
    extension: 180, // Dapat diperpanjang 6 bulan
    requiresDocument: true,
    description: 'Cuti sakit diberikan sesuai surat keterangan dokter. Maksimal 1 tahun dan dapat diperpanjang 6 bulan.'
  },
  'Besar': {
    maxDuration: 90, // 3 bulan
    minServiceYears: 5, // Minimum 5 tahun bekerja
    description: 'Cuti besar selama 3 bulan setelah bekerja minimal 5 tahun secara terus-menerus.'
  },
  'Melahirkan': {
    maxDuration: 90, // 3 bulan
    preBirth: 45, // 1,5 bulan sebelum melahirkan
    postBirth: 45, // 1,5 bulan setelah melahirkan
    description: 'Cuti melahirkan selama 3 bulan, terdiri dari 1,5 bulan sebelum dan 1,5 bulan setelah melahirkan.'
  },
  'Alasan Penting': {
    maxDuration: 30, // Fleksibel, biasanya maksimal 1 bulan
    requiresDocument: true,
    description: 'Cuti karena alasan penting seperti keluarga sakit keras, meninggal dunia, atau alasan penting lainnya.'
  },
  'Di Luar Tanggungan Negara': {
    maxDuration: 1095, // 3 tahun
    minServiceYears: 5, // Minimum 5 tahun bekerja
    description: 'Cuti di luar tanggungan negara hingga 3 tahun, untuk alasan pribadi yang mendesak, setelah bekerja minimal 5 tahun.'
  }
};

export interface LeaveData {
  id: string;
  employeeId: string | number;
  employeeName: string;
  employeeNip?: string; // NIP pegawai
  leaveType: LeaveType;
  duration: number; // Lama cuti dalam hari
  startDate: string; // Tanggal mulai cuti
  endDate: string; // Tanggal selesai cuti
  document?: string; // Link atau nama dokumen pendukung
  documentRequired: boolean; // Apakah memerlukan dokumen pendukung
  reason: string; // Alasan atau dasar cuti (mis. SK, surat dokter)
  status: 'Approved' | 'Pending' | 'Rejected' | 'Completed';
  approvedBy?: string; // Admin yang menyetujui
  inputBy: string; // Admin yang menginput
  year: number; // Tahun cuti
  serviceYears?: number; // Lama bekerja (untuk cuti besar/CLTN)
  accumulatedFromPrevYear?: boolean; // Apakah termasuk akumulasi dari tahun sebelumnya
  extendedLeave?: boolean; // Apakah merupakan perpanjangan cuti
  createdAt: string;
  updatedAt: string;
}

// Data awal untuk contoh
const initialLeaveData: LeaveData[] = [
  {
    id: '1',
    employeeId: 1,
    employeeNip: '197506152001121003',
    employeeName: 'Dr. Ahmad Fauzi, S.T., M.T.',
    leaveType: 'Tahunan',
    duration: 4,
    startDate: '2025-03-15',
    endDate: '2025-03-18',
    documentRequired: false,
    reason: 'Cuti tahunan - SK No. 123/ASN/III/2025',
    status: 'Completed',
    inputBy: 'Admin Sistem',
    year: 2025,
    serviceYears: 24,
    accumulatedFromPrevYear: false,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-03-10T00:00:00Z'
  },
  {
    id: '2',
    employeeId: 2,
    employeeNip: '198312102009022001',
    employeeName: 'Indah Permata Sari, S.E.',
    leaveType: 'Sakit',
    duration: 2,
    startDate: '2025-04-05',
    endDate: '2025-04-06',
    document: 'Surat dokter No. RS/MED/425/2025',
    documentRequired: true,
    reason: 'Sakit - Surat Dokter Rumah Sakit Medika',
    status: 'Completed',
    inputBy: 'Admin Sistem',
    year: 2025,
    serviceYears: 16,
    createdAt: '2025-04-03T00:00:00Z',
    updatedAt: '2025-04-03T00:00:00Z'
  },
  {
    id: '3',
    employeeId: 3,
    employeeNip: '199006202015012005',
    employeeName: 'Ratna Juwita, S.Sos.',
    leaveType: 'Besar',
    duration: 90,
    startDate: '2025-05-01',
    endDate: '2025-07-29',
    documentRequired: false,
    reason: 'Cuti besar - Ibadah Haji',
    status: 'Approved',
    approvedBy: 'Kepala Kantor',
    inputBy: 'Admin Sistem',
    year: 2025,
    serviceYears: 10,
    createdAt: '2025-04-15T00:00:00Z',
    updatedAt: '2025-04-20T00:00:00Z'
  }
];

// Definisi tipe data jatah cuti untuk pegawai
export interface LeaveQuota {
  id: string;
  employeeId: string | number;
  employeeName: string;
  employeeNip?: string; // NIP pegawai
  year: number; // Tahun jatah cuti
  annualQuota: number; // Jatah cuti tahunan (12 hari)
  annualUsed: number; // Penggunaan cuti tahunan 
  annualRemaining: number; // Sisa cuti tahunan
  previousYearRemaining: number; // Sisa cuti tahun sebelumnya
  totalAvailable: number; // Total cuti yang dapat diambil
  serviceYears: number; // Masa kerja dalam tahun
  bigLeaveEligible: boolean; // Apakah berhak cuti besar (masa kerja ≥ 5 tahun)
  bigLeaveStatus: boolean; // Status cuti besar (sudah/belum pernah)
  lastBigLeaveYear?: number; // Tahun cuti besar terakhir
  sickLeaveUsed: number; // Penggunaan cuti sakit
  maternityLeaveUsed: number; // Penggunaan cuti melahirkan
  importantLeaveUsed: number; // Penggunaan cuti alasan penting
  createdAt: string;
  updatedAt: string;
}

// Utility function moved to code where it's actively used

// Data awal jatah cuti
const initialLeaveQuotas: LeaveQuota[] = [
  {
    id: '1',
    employeeId: 1,
    employeeNip: '197506152001121003',
    employeeName: 'Dr. Ahmad Fauzi, S.T., M.T.',
    year: 2025,
    annualQuota: 12,
    annualUsed: 4,
    annualRemaining: 8,
    previousYearRemaining: 0,
    totalAvailable: 12,
    serviceYears: 24,
    bigLeaveEligible: true,
    bigLeaveStatus: false,
    sickLeaveUsed: 0,
    maternityLeaveUsed: 0,
    importantLeaveUsed: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-03-18T00:00:00Z'
  },
  {
    id: '2',
    employeeId: 2,
    employeeNip: '198312102009022001',
    employeeName: 'Indah Permata Sari, S.E.',
    year: 2025,
    annualQuota: 12,
    annualUsed: 0,
    annualRemaining: 12,
    previousYearRemaining: 0,
    totalAvailable: 12,
    serviceYears: 16,
    bigLeaveEligible: true,
    bigLeaveStatus: false,
    sickLeaveUsed: 2,
    maternityLeaveUsed: 0,
    importantLeaveUsed: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-04-06T00:00:00Z'
  },
  {
    id: '3',
    employeeId: 3,
    employeeNip: '199006202015012005',
    employeeName: 'Ratna Juwita, S.Sos.',
    year: 2025,
    annualQuota: 0,
    annualUsed: 0,
    annualRemaining: 0,
    previousYearRemaining: 0,
    totalAvailable: 0,
    serviceYears: 10,
    bigLeaveEligible: true,
    bigLeaveStatus: true,
    lastBigLeaveYear: 2025,
    sickLeaveUsed: 0,
    maternityLeaveUsed: 0,
    importantLeaveUsed: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-04-06T00:00:00Z'
  }
];

// Interface for context
export interface LeaveContextType {
  leaveData: LeaveData[];
  leaveQuotas: LeaveQuota[];
  loading: boolean;
  error: string | null;
  addLeave: (leave: Omit<LeaveData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeave: (id: string, leave: Partial<LeaveData>) => void;
  deleteLeave: (id: string) => void;
  getEmployeeLeaves: (employeeId: string | number) => LeaveData[];
  getEmployeeQuota: (employeeId: string | number, year: number) => LeaveQuota | null;
  updateLeaveQuota: (employeeId: string | number, year: number, quotaUpdate: Partial<Omit<LeaveQuota, 'id' | 'employeeId' | 'year' | 'createdAt' | 'updatedAt'>>) => void;
  calculateLeaveBalance: (employeeId: string | number, year: number) => void;
  calculateActualWorkingDays: (startDate: string, endDate: string) => number;
}

// Create context
const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Provider component
export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveData, setLeaveData] = useState<LeaveData[]>(initialLeaveData);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveQuota[]>(initialLeaveQuotas);
  const [loading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulasi load data dari API atau localStorage
  useEffect(() => {
    // Di implementasi nyata, kita bisa menggunakan API call di sini
    // Untuk sekarang, kita gunakan data awal dan localStorage
    const savedLeaves = localStorage.getItem('leaveData');
    const savedQuotas = localStorage.getItem('leaveQuotas');
    
    if (savedLeaves) {
      try {
        setLeaveData(JSON.parse(savedLeaves));
      } catch (e) {
        setError('Error parsing leave data');
      }
    }
    
    if (savedQuotas) {
      try {
        setLeaveQuotas(JSON.parse(savedQuotas));
      } catch (e) {
        setError('Error parsing leave quotas');
      }
    }
  }, []);

  // Simpan ke localStorage ketika data berubah
  useEffect(() => {
    localStorage.setItem('leaveData', JSON.stringify(leaveData));
  }, [leaveData]);
  
  useEffect(() => {
    localStorage.setItem('leaveQuotas', JSON.stringify(leaveQuotas));
  }, [leaveQuotas]);

  // Function untuk menghitung jumlah hari kerja dalam rentang tanggal
  const calculateActualWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let workingDays = 0;
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Jika hari ini bukan akhir pekan atau hari libur, tambahkan ke working days
      if (!isNonWorkingDay(currentDate)) {
        workingDays++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return workingDays;
  };

  // Tambah data cuti baru
  const addLeave = (leave: Omit<LeaveData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Hitung jumlah hari kerja sesungguhnya
      const actualWorkingDays = calculateActualWorkingDays(leave.startDate || '', leave.endDate || '');
      
      // Generate ID baru dan timestamps
      const newLeave: LeaveData = {
        ...leave,
        // Pastikan duration menunjukkan hari kerja yang benar
        duration: actualWorkingDays,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Tambahkan ke state
      setLeaveData(prev => [...prev, newLeave]);

      // Update kuota cuti jika jenis cuti adalah tahunan
      if (leave.leaveType === 'Tahunan') {
        const quota = getEmployeeQuota(leave.employeeId, leave.year);
        updateLeaveQuota(leave.employeeId, leave.year, {
          annualUsed: (quota?.annualUsed || 0) + actualWorkingDays,
          annualRemaining: (quota?.annualRemaining || 12) - actualWorkingDays
        });
      }
    } catch (e) {
      setError('Error adding leave');
    }
  };

  // Update data cuti
  const updateLeave = (id: string, leaveUpdate: Partial<LeaveData>) => {
    try {
      // Temukan data cuti yang akan diupdate
      const leaveToUpdate = leaveData.find(leave => leave.id === id);
      if (!leaveToUpdate) {
        throw new Error(`Leave with ID ${id} not found`);
      }

      // Jika ada perubahan tanggal, hitung ulang hari kerja
      let actualWorkingDays = leaveToUpdate.duration;
      if (('startDate' in leaveUpdate || 'endDate' in leaveUpdate) && leaveUpdate.startDate && leaveUpdate.endDate) {
        actualWorkingDays = calculateActualWorkingDays(leaveUpdate.startDate, leaveUpdate.endDate);
        // Tambahkan durasi yang benar ke update
        leaveUpdate.duration = actualWorkingDays;
      } else if ('startDate' in leaveUpdate && !('endDate' in leaveUpdate) && leaveToUpdate.endDate) {
        // Hanya startDate yang berubah
        if (leaveUpdate.startDate) { // Ensure startDate is defined
          actualWorkingDays = calculateActualWorkingDays(leaveUpdate.startDate, leaveToUpdate.endDate);
          leaveUpdate.duration = actualWorkingDays;
        }
      } else if ('endDate' in leaveUpdate && !('startDate' in leaveUpdate) && leaveToUpdate.startDate) {
        // Hanya endDate yang berubah
        if (leaveUpdate.endDate) { // Ensure endDate is defined
          actualWorkingDays = calculateActualWorkingDays(leaveToUpdate.startDate, leaveUpdate.endDate);
          leaveUpdate.duration = actualWorkingDays;
        }
      }

      // Update data cuti
      const updatedLeaveData = leaveData.map(leave => {
        if (leave.id === id) {
          return {
            ...leave,
            ...leaveUpdate,
            updatedAt: new Date().toISOString()
          };
        }
        return leave;
      });

      setLeaveData(updatedLeaveData);

      // Jika ada perubahan durasi dan jenis cuti tahunan, perbarui kuota
      if (leaveToUpdate.leaveType === 'Tahunan' && 'duration' in leaveUpdate) {
        const oldDuration = leaveToUpdate.duration;
        const newDuration = actualWorkingDays;
        const difference = newDuration - oldDuration;

        if (difference !== 0) {
          const quota = getEmployeeQuota(leaveToUpdate.employeeId, leaveToUpdate.year);
          updateLeaveQuota(leaveToUpdate.employeeId, leaveToUpdate.year, {
            annualUsed: (quota?.annualUsed || 0) + difference,
            annualRemaining: (quota?.annualRemaining || 12) - difference
          });
        }
      }
    } catch (e) {
      setError('Error updating leave');
    }
  };

  // Hapus data cuti
  const deleteLeave = (id: string) => {
    // Get the leave before deleting
    const leaveToDelete = leaveData.find(leave => leave.id === id);
    
    setLeaveData(prevData => prevData.filter(leave => leave.id !== id));
    
    // Recalculate leave balance if the deleted leave was annual leave
    if (leaveToDelete && leaveToDelete.leaveType === 'Tahunan') {
      calculateLeaveBalance(leaveToDelete.employeeId, leaveToDelete.year);
    }
    
    // If big leave was deleted, restore annual leave quota
    if (leaveToDelete && leaveToDelete.leaveType === 'Besar') {
      const quota = getEmployeeQuota(leaveToDelete.employeeId, leaveToDelete.year);
      if (quota && quota.bigLeaveStatus) {
        updateLeaveQuota(leaveToDelete.employeeId, leaveToDelete.year, {
          annualQuota: 12,
          bigLeaveStatus: false,
          lastBigLeaveYear: undefined
        });
        calculateLeaveBalance(leaveToDelete.employeeId, leaveToDelete.year);
      }
    }
  };

  // Dapatkan semua cuti untuk satu pegawai
  const getEmployeeLeaves = (employeeId: string | number) => {
    return leaveData.filter(leave => leave.employeeId === employeeId);
  };
  
  // Mendapatkan kuota cuti pegawai
  const getEmployeeQuota = (employeeId: string | number, year: number): LeaveQuota | null => {
    const quota = leaveQuotas.find(q => q.employeeId === employeeId && q.year === year);
    return quota || null;
  };
  
  // Update kuota cuti
  const updateLeaveQuota = (employeeId: string | number, year: number, quotaUpdate: Partial<Omit<LeaveQuota, 'id' | 'employeeId' | 'year' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    
    setLeaveQuotas(prevQuotas => {
      // Check if quota exists
      const quotaExists = prevQuotas.some(q => q.employeeId === employeeId && q.year === year);
      
      if (quotaExists) {
        // Update existing quota
        return prevQuotas.map(quota => 
          (quota.employeeId === employeeId && quota.year === year) 
            ? { ...quota, ...quotaUpdate, updatedAt: now } 
            : quota
        );
      } else {
        // Create new quota if we have employee details
        const employee = leaveData.find(leave => leave.employeeId === employeeId);
        if (!employee) return prevQuotas;
        
        // Get service years if available from employee data or assume default
        const serviceYears = employee?.serviceYears ?? 0;
        
        const newQuota: LeaveQuota = {
          id: Date.now().toString(),
          employeeId,
          employeeName: employee.employeeName,
          employeeNip: employee.employeeNip,
          year,
          annualQuota: quotaUpdate.annualQuota ?? 12,
          annualUsed: 0, // Default to 0 for new quota
          annualRemaining: quotaUpdate.annualRemaining ?? 12,
          previousYearRemaining: quotaUpdate.previousYearRemaining ?? 0,
          totalAvailable: quotaUpdate.totalAvailable ?? (quotaUpdate.annualQuota ?? 12) + (quotaUpdate.previousYearRemaining ?? 0),
          serviceYears: serviceYears,
          bigLeaveEligible: serviceYears >= 5, // Eligible if service years >= 5
          bigLeaveStatus: quotaUpdate.bigLeaveStatus ?? false,
          lastBigLeaveYear: quotaUpdate.lastBigLeaveYear,
          sickLeaveUsed: 0, // Default to 0 for new quota
          maternityLeaveUsed: 0, // Default to 0 for new quota
          importantLeaveUsed: 0, // Default to 0 for new quota
          createdAt: now,
          updatedAt: now
        };
        
        return [...prevQuotas, newQuota];
      }
    });
  };
  
  // Hitung ulang sisa cuti
  const calculateLeaveBalance = (employeeId: string | number, year: number) => {
    // Get all annual leaves for this employee and year
    const annualLeaves = leaveData.filter(
      leave => leave.employeeId === employeeId && 
              leave.year === year && 
              leave.leaveType === 'Tahunan' &&
              leave.status !== 'Rejected'
    );
    
    // Calculate total days used
    const daysUsed = annualLeaves.reduce((total, leave) => total + leave.duration, 0);
    
    // Get or create quota for this employee and year
    let quota = getEmployeeQuota(employeeId, year);
    
    if (!quota) {
      // If no quota exists, create default quota
      const employee = leaveData.find(leave => leave.employeeId === employeeId);
      if (!employee) return;
      
      // Check for previous year remaining days
      const prevYearQuota = getEmployeeQuota(employeeId, year - 1);
      const prevYearRemaining = prevYearQuota ? Math.min(prevYearQuota.annualRemaining, 6) : 0;
      
      updateLeaveQuota(employeeId, year, {
        annualQuota: 12,
        annualRemaining: 12 - daysUsed,
        previousYearRemaining: prevYearRemaining,
        totalAvailable: 12 + prevYearRemaining - daysUsed
      });
    } else {
      // Update existing quota
      const annualRemaining = Math.max(0, quota.annualQuota - daysUsed);
      const totalAvailable = Math.max(0, annualRemaining + quota.previousYearRemaining);
      
      updateLeaveQuota(employeeId, year, {
        annualRemaining,
        totalAvailable
      });
    }
  };

  return (
    <LeaveContext.Provider 
      value={{
        leaveData,
        leaveQuotas,
        loading,
        error,
        addLeave,
        updateLeave,
        deleteLeave,
        getEmployeeLeaves,
        getEmployeeQuota,
        updateLeaveQuota,
        calculateLeaveBalance,
        calculateActualWorkingDays
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

// Custom hook untuk menggunakan leave context
export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
