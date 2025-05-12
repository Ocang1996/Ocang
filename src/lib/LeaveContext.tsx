import React, { createContext, useContext, useState, useEffect } from 'react';
import { isNonWorkingDay } from './dateUtils';
import { addDays } from 'date-fns';
import {
  getLeaveData,
  getLeaveQuotas,
  addLeaveData as apiAddLeaveData,
  updateLeaveData as apiUpdateLeaveData,
  deleteLeaveData as apiDeleteLeaveData,
  getLeaveQuotaByEmployeeAndYear,
  updateLeaveQuota as apiUpdateLeaveQuota
} from './leaveService';

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

// Data awal untuk contoh (kosong, akan diisi dari Supabase)
const initialLeaveData: LeaveData[] = [];

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

// Data awal jatah cuti (kosong, akan diisi dari Supabase)
const initialLeaveQuotas: LeaveQuota[] = [];

// Interface for context
export interface LeaveContextType {
  leaveData: LeaveData[];
  leaveQuotas: LeaveQuota[];
  loading: boolean;
  error: string | null;
  addLeave: (leave: Omit<LeaveData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLeave: (id: string, leave: Partial<LeaveData>) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;
  getEmployeeLeaves: (employeeId: string | number) => LeaveData[];
  getEmployeeQuota: (employeeId: string | number, year: number) => LeaveQuota | null;
  updateLeaveQuota: (employeeId: string | number, year: number, quotaUpdate: Partial<Omit<LeaveQuota, 'id' | 'employeeId' | 'year' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  calculateLeaveBalance: (employeeId: string | number, year: number) => Promise<void>;
  calculateActualWorkingDays: (startDate: string, endDate: string) => number;
}

// Create context
const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Provider component
export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveData, setLeaveData] = useState<LeaveData[]>(initialLeaveData);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveQuota[]>(initialLeaveQuotas);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const [leaveDataResult, leaveQuotasResult] = await Promise.all([
          getLeaveData(),
          getLeaveQuotas()
        ]);
        
        setLeaveData(leaveDataResult);
        setLeaveQuotas(leaveQuotasResult);
        setError(null);
      } catch (e: any) {
        console.error('Error fetching leave data:', e);
        setError(e.message || 'Error loading leave data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveData();
  }, []);

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
  const addLeave = async (leave: Omit<LeaveData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      setLoading(true);
      
      // Hitung jumlah hari kerja sesungguhnya
      const actualWorkingDays = calculateActualWorkingDays(leave.startDate, leave.endDate);
      
      // Prepare data dengan hari kerja yang benar
      const leaveWithWorkingDays = {
        ...leave,
        duration: actualWorkingDays
      };

      // Simpan ke Supabase
      const newLeave = await apiAddLeaveData(leaveWithWorkingDays);
      
      // Update state
      setLeaveData(prev => [...prev, newLeave]);

      // Update kuota cuti jika jenis cuti adalah tahunan
      if (leave.leaveType === 'Tahunan') {
        await calculateLeaveBalance(leave.employeeId, leave.year);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error adding leave data:', err);
      setError(err.message || 'Error adding leave data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update data cuti
  const updateLeave = async (id: string, leaveUpdate: Partial<LeaveData>): Promise<void> => {
    try {
      setLoading(true);
      
      // Temukan data cuti yang akan diupdate
      const leaveToUpdate = leaveData.find(leave => leave.id === id);
      if (!leaveToUpdate) {
        throw new Error(`Leave with ID ${id} not found`);
      }

      // Jika ada perubahan tanggal, hitung ulang hari kerja
      let actualWorkingDays = leaveToUpdate.duration;
      if (('startDate' in leaveUpdate || 'endDate' in leaveUpdate)) {
        const startDate = leaveUpdate.startDate || leaveToUpdate.startDate;
        const endDate = leaveUpdate.endDate || leaveToUpdate.endDate;
        actualWorkingDays = calculateActualWorkingDays(startDate, endDate);
        // Tambahkan durasi yang benar ke update
        leaveUpdate.duration = actualWorkingDays;
      }
      
      // Update leave data di state
      const updatedLeave = { ...leaveToUpdate, ...leaveUpdate, updatedAt: new Date().toISOString() };
      setLeaveData(prevData => prevData.map(leave => leave.id === id ? updatedLeave : leave));
      
      // Kirim ke Supabase
      await apiUpdateLeaveData(id, updatedLeave);
      setError(null);
      
      // Update leave balance jika cuti tahunan
      if (leaveToUpdate.leaveType === 'Tahunan' || (leaveUpdate.leaveType === 'Tahunan')) {
        await calculateLeaveBalance(leaveToUpdate.employeeId, leaveToUpdate.year);
      }
    } catch (err: any) {
      console.error('Error updating leave data:', err);
      setError(err.message || 'Error updating leave data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hapus data cuti
  const deleteLeave = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Get the leave before deleting
      const leaveToDelete = leaveData.find(leave => leave.id === id);
      
      if (!leaveToDelete) {
        throw new Error(`Leave with ID ${id} not found`);
      }
      
      // Update state
      setLeaveData(prevData => prevData.filter(leave => leave.id !== id));
      
      // Send to Supabase
      await apiDeleteLeaveData(id);
      setError(null);
      
      // Recalculate leave balance if the deleted leave was annual leave
      if (leaveToDelete && leaveToDelete.leaveType === 'Tahunan') {
        await calculateLeaveBalance(leaveToDelete.employeeId, leaveToDelete.year);
      }
      
      // If big leave was deleted, restore annual leave quota
      if (leaveToDelete && leaveToDelete.leaveType === 'Besar') {
        const quota = getEmployeeQuota(leaveToDelete.employeeId, leaveToDelete.year);
        if (quota && quota.bigLeaveStatus) {
          await updateLeaveQuota(leaveToDelete.employeeId, leaveToDelete.year, {
            annualQuota: 12,
            bigLeaveStatus: false,
            lastBigLeaveYear: undefined
          });
        }
      }
    } catch (err: any) {
      console.error('Error deleting leave data:', err);
      setError(err.message || 'Error deleting leave data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dapatkan semua cuti untuk satu pegawai
  const getEmployeeLeaves = (employeeId: string | number): LeaveData[] => {
    return leaveData.filter(leave => leave.employeeId === employeeId);
  };

  // Mendapatkan kuota cuti pegawai
  const getEmployeeQuota = (employeeId: string | number, year: number): LeaveQuota | null => {
    const quota = leaveQuotas.find(q => q.employeeId === employeeId && q.year === year);
    return quota || null;
  };

  // Update kuota cuti
  const updateLeaveQuota = async (employeeId: string | number, year: number, quotaUpdate: Partial<Omit<LeaveQuota, 'id' | 'employeeId' | 'year' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    try {
      setLoading(true);
      
      // Find existing quota
      const existingQuota = getEmployeeQuota(employeeId, year);
      
      if (!existingQuota) {
        throw new Error(`No leave quota found for employee ${employeeId} in year ${year}`);
      }
      
      // Update in state
      const updatedQuota = { ...existingQuota, ...quotaUpdate, updatedAt: new Date().toISOString() };
      
      setLeaveQuotas(prevQuotas => 
        prevQuotas.map(q => 
          (q.employeeId === employeeId && q.year === year) ? updatedQuota : q
        )
      );
      
      // Send to Supabase
      await apiUpdateLeaveQuota(existingQuota.id, updatedQuota);
      setError(null);
      
    } catch (err: any) {
      console.error('Error updating leave quota:', err);
      setError(err.message || 'Error updating leave quota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hitung ulang sisa cuti
  const calculateLeaveBalance = async (employeeId: string | number, year: number): Promise<void> => {
    try {
      setLoading(true);
      
      // Get current quota
      const currentQuota = getEmployeeQuota(employeeId, year);
      
      if (!currentQuota) {
        throw new Error(`No leave quota found for employee ${employeeId} in year ${year}`);
      }
      
      // Get all annual leaves for this employee in this year
      const annualLeaves = leaveData.filter(leave => 
        leave.employeeId === employeeId && 
        leave.year === year && 
        leave.leaveType === 'Tahunan'
      );
      
      // Calculate total used days
      const annualUsed = annualLeaves.reduce((total, leave) => total + leave.duration, 0);
      
      // Calculate remaining days
      const annualRemaining = currentQuota.annualQuota - annualUsed;
      
      // Calculate total available (including previous year remaining)
      const totalAvailable = annualRemaining + currentQuota.previousYearRemaining;
      
      // Update quota
      await updateLeaveQuota(employeeId, year, {
        annualUsed,
        annualRemaining,
        totalAvailable
      });
      setError(null);
    } catch (err: any) {
      console.error('Error calculating leave balance:', err);
      setError(err.message || 'Error calculating leave balance');
    } finally {
      setLoading(false);
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
export const useLeave = (): LeaveContextType => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};

export default useLeave;
