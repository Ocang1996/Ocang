import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getEmployees, getEmployeeById, updateEmployee as apiUpdateEmployee } from './employeeService';
import type { Employee as ApiEmployee } from './employeeService';
import { API_CONFIG } from './config';

// Employee data types
export interface Employee {
  id: number | string;
  name: string;
  nip: string;
  gender: 'male' | 'female';
  birthDate: string;
  employeeType: 'pns' | 'p3k' | 'nonAsn' | 'pppk' | 'honorer'; // Extended to match form values
  workUnit: string;
  position: string;
  rank?: string;
  class?: string;
  status: string; // Changed to string to handle both contexts
  photo?: string | null;
  educationLevel?: string;
  educationMajor?: string;
  educationInstitution?: string;
  graduationYear?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  positionHistory?: string;
  notes?: string;
  updatedAt?: string;
  createdAt?: string;
  // Added properties needed in other components
  appointmentDate?: string; // TMT Pengangkatan untuk ASN
  joinDate?: string; // Tanggal masuk kerja untuk NON ASN
  jobType?: string; // Jenis Jabatan (needed for retirement calculations)
}

// Mock data for employees when API is not available
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'Dr. Ahmad Fauzi, S.T., M.T.',
    nip: '197506152001121003',
    gender: 'male',
    birthDate: '1975-06-15',
    employeeType: 'pns',
    workUnit: 'Dinas Komunikasi dan Informatika',
    position: 'Kepala Bidang Pengembangan',
    rank: 'Pembina (IV/a)',
    status: 'Aktif',
    educationLevel: 's3',
    educationMajor: 'Teknik Informatika',
    educationInstitution: 'Universitas Indonesia',
    graduationYear: '2018',
    email: 'ahmad.fauzi@pemda.go.id',
    phoneNumber: '081234567890',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Indah Permata Sari, S.E.',
    nip: '198803242010012015',
    gender: 'female',
    birthDate: '1988-03-24',
    employeeType: 'pns',
    workUnit: 'Dinas Keuangan',
    position: 'Analis Keuangan',
    rank: 'Penata (III/c)',
    status: 'Aktif',
    educationLevel: 's1',
    educationMajor: 'Ekonomi',
    educationInstitution: 'Universitas Gadjah Mada',
    graduationYear: '2009',
    email: 'indah.permata@pemda.go.id',
    phoneNumber: '087654321098',
    createdAt: '2023-04-23T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'Ir. Budi Santoso, M.M.',
    nip: '197205102000031002',
    gender: 'male',
    birthDate: '1972-05-10',
    employeeType: 'pns',
    workUnit: 'Badan Perencanaan Pembangunan Daerah',
    position: 'Kepala Seksi Perencanaan',
    rank: 'Penata Tk. I (III/d)',
    status: 'Aktif',
    educationLevel: 's2',
    educationMajor: 'Manajemen',
    educationInstitution: 'Universitas Indonesia',
    graduationYear: '2005',
    email: 'budi.santoso@pemda.go.id',
    phoneNumber: '081122334455',
    createdAt: '2023-04-05T00:00:00.000Z'
  },
  {
    id: 4,
    name: 'Ratna Juwita, S.Sos.',
    nip: '199001152015042008',
    gender: 'female',
    birthDate: '1990-01-15',
    employeeType: 'pns',
    workUnit: 'Sekretariat Daerah',
    position: 'Pengadministrasi Umum',
    rank: 'Pengatur (II/c)',
    status: 'Cuti',
    educationLevel: 's1',
    educationMajor: 'Administrasi Publik',
    educationInstitution: 'Universitas Padjadjaran',
    graduationYear: '2013',
    email: 'ratna.juwita@pemda.go.id',
    phoneNumber: '082233445566',
    createdAt: '2023-03-17T00:00:00.000Z'
  },
  {
    id: 5,
    name: 'Drs. Hendra Wijaya',
    nip: '196912052000031001',
    gender: 'male',
    birthDate: '1969-12-05',
    employeeType: 'pns',
    workUnit: 'Inspektorat',
    position: 'Auditor Madya',
    rank: 'Pembina (IV/a)',
    status: 'Sakit',
    educationLevel: 's1',
    educationMajor: 'Akuntansi',
    educationInstitution: 'Universitas Indonesia',
    graduationYear: '1995',
    email: 'hendra.wijaya@pemda.go.id',
    phoneNumber: '081567890123',
    createdAt: '2023-02-28T00:00:00.000Z'
  }
];

// Helper function to convert API employee to our context format
const convertApiEmployee = (apiEmployee: ApiEmployee): Employee => ({
  id: apiEmployee.id || Date.now(), // Ensure we always have an ID
  name: apiEmployee.name,
  nip: apiEmployee.nip,
  gender: apiEmployee.gender,
  birthDate: typeof apiEmployee.birthDate === 'string' 
    ? apiEmployee.birthDate 
    : apiEmployee.birthDate?.toISOString() || '',
  employeeType: apiEmployee.employeeType,
  workUnit: apiEmployee.workUnit,
  position: apiEmployee.position,
  rank: apiEmployee.rank,
  class: apiEmployee.class,
  status: apiEmployee.status,
  photo: apiEmployee.photo,
  educationLevel: apiEmployee.educationLevel,
  educationMajor: apiEmployee.educationMajor,
  educationInstitution: (apiEmployee as any).educationInstitution as string | undefined,
  graduationYear: (apiEmployee as any).graduationYear as string | undefined,
  email: apiEmployee.email,
  phoneNumber: apiEmployee.phoneNumber,
  address: apiEmployee.address,
  positionHistory: (apiEmployee as any).positionHistory as string | undefined,
  notes: (apiEmployee as any).notes as string | undefined,
  updatedAt: typeof apiEmployee.updatedAt === 'string' 
    ? apiEmployee.updatedAt 
    : apiEmployee.updatedAt?.toISOString(),
  createdAt: typeof apiEmployee.createdAt === 'string' 
    ? apiEmployee.createdAt 
    : apiEmployee.createdAt?.toISOString()
});

// Helper function to convert context employee to API format
const convertToApiEmployee = (employee: Partial<Employee>): Partial<ApiEmployee> => {
  // Create a new object with the same properties but converted to API format
  const apiEmployee: Partial<ApiEmployee> = {
    ...(employee as any), // Use type assertion as a workaround
    // Convert id to string if it's a number
    id: typeof employee.id === 'number' ? String(employee.id) : employee.id as string | undefined
  };
  
  return apiEmployee;
};

interface EmployeeContextType {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  fetchEmployees: (filters?: any) => Promise<void>;
  fetchEmployeeById: (id: string | number) => Promise<Employee>;
  updateEmployeeData: (id: string | number, data: Partial<Employee>) => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id'>) => Promise<Employee>;
  setSelectedEmployee: (employee: Employee | null) => void;
  refreshData: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'error';
}

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Simplified mock implementation
class EmployeeDataSync {
  private lastSyncTime: number = 0;
  
  constructor() {}
  
  // Simplified connect method
  connect() {
    return () => {};
  }
  
  // Simplified subscribe method
  subscribe(_: () => void) {
    return () => {};
  }
  
  // Simplified trigger sync
  triggerSync() {
    this.lastSyncTime = Date.now();
  }
  
  // Get the last sync time
  getLastSyncTime() {
    return this.lastSyncTime;
  }
}

// Provider component
export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  // Initialize the sync service
  const [dataSync] = useState(() => new EmployeeDataSync());
  
  // Fetch all employees from the API
  const fetchEmployees = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setSyncStatus('syncing');
      setError(null);
      
      try {
        // Try to get data from API first
        // Check if we should even try to connect to the backend
        if (API_CONFIG.USE_BACKEND) {
          const response = await getEmployees();
          
          // Convert API employees to our format
          const convertedEmployees: Employee[] = (response.data || []).map(convertApiEmployee);
          
          setEmployees(convertedEmployees);
        } else {
          // USE_BACKEND is false, use mock data directly
          throw new Error('Using mock data - backend disabled');
        }
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        
        // If API fails, use mock data (filtered if needed)
        let filteredMockEmployees = [...mockEmployees];
        
        if (filters) {
          if (filters.workUnit && filters.workUnit !== 'all') {
            filteredMockEmployees = filteredMockEmployees.filter(e => 
              e.workUnit === filters.workUnit
            );
          }
          
          if (filters.status && filters.status !== 'all') {
            filteredMockEmployees = filteredMockEmployees.filter(e => 
              e.status === filters.status
            );
          }
          
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredMockEmployees = filteredMockEmployees.filter(e => 
              e.name.toLowerCase().includes(searchLower) || 
              e.nip.includes(searchLower) ||
              e.position.toLowerCase().includes(searchLower)
            );
          }
        }
        
        setEmployees(filteredMockEmployees);
      }
      
      setSyncStatus('idle');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
      setSyncStatus('error');
      console.error('Error fetching employees:', err);
      
      // Even if there's an error in our error handling, still show the mock data
      setEmployees(mockEmployees);
    } finally {
      // Ensure loading state is set to false regardless of outcome
      setLoading(false);
    }
  }, []);
  
  // Fetch a single employee by ID
  const fetchEmployeeById = useCallback(async (id: string | number): Promise<Employee> => {
    try {
      setLoading(true);
      setError(null);
      
      let employee: Employee;
      
      try {
        // Try to get from API first
        const apiEmployee = await getEmployeeById(String(id));
        employee = convertApiEmployee(apiEmployee);
      } catch (apiError) {
        console.warn(`API call for employee ID ${id} failed, using mock data:`, apiError);
        
        // If API fails, find in mock data
        const mockEmployee = mockEmployees.find(e => String(e.id) === String(id));
        
        if (!mockEmployee) {
          throw new Error(`Employee with ID ${id} not found`);
        }
        
        employee = mockEmployee;
      }
      
      // If we already have the selected employee, update it
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(employee);
      }
      
      // Also update the employee in the employees array
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? employee : emp)
      );
      
      return employee;
    } catch (err: any) {
      setError(err.message || `Failed to fetch employee with ID ${id}`);
      console.error(`Error fetching employee with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee]);
  
  // Update an employee's data
  const updateEmployeeData = useCallback(async (id: string | number, data: Partial<Employee>) => {
    try {
      setLoading(true);
      setSyncStatus('syncing');
      setError(null);
      
      let updatedEmployee: Employee;
      
      try {
        // Convert to API format
        const apiData = convertToApiEmployee(data);
        const apiUpdatedEmployee = await apiUpdateEmployee(String(id), apiData);
        
        // Convert back to our format
        updatedEmployee = convertApiEmployee(apiUpdatedEmployee);
      } catch (apiError) {
        console.warn(`API update for employee ID ${id} failed, updating mock data:`, apiError);
        
        // If API fails, update in mock data
        const existingEmployeeIndex = employees.findIndex(e => String(e.id) === String(id));
        
        if (existingEmployeeIndex === -1) {
          throw new Error(`Employee with ID ${id} not found`);
        }
        
        // Create updated employee by merging existing data with updates
        updatedEmployee = {
          ...employees[existingEmployeeIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Update in local state
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? { ...emp, ...updatedEmployee } : emp)
      );
      
      // If this is the selected employee, update it
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee({ ...selectedEmployee, ...updatedEmployee });
      }
      
      // Notify all listeners about the change
      dataSync.triggerSync();
      
      setSyncStatus('idle');
    } catch (err: any) {
      setError(err.message || `Failed to update employee with ID ${id}`);
      setSyncStatus('error');
      console.error(`Error updating employee with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, dataSync, employees]);
  
  // Add a new employee
  const addEmployee = useCallback(async (data: Omit<Employee, 'id'>) => {
    try {
      // Set status loading
      setLoading(true);
      setSyncStatus('syncing');
      
      // Buat objek pegawai baru dengan ID unik
      const newEmployee: Employee = {
        ...data,
        id: Date.now(), // Timestamp sebagai ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Log employee yang akan ditambahkan
      console.log('Adding new employee:', {
        employeeType: newEmployee.employeeType,
        name: newEmployee.name,
        timestamp: new Date().toISOString()
      });
      
      // Simpan ke state dengan pendekatan immutability yang lebih baik dan sinkron
      setEmployees(prevEmployees => {
        const newEmployees = [...prevEmployees, newEmployee];
        console.log(`Employee added, new total: ${newEmployees.length}`, {
          employeeId: newEmployee.id,
          employeeType: newEmployee.employeeType,
          employeeCount: {
            total: newEmployees.length,
            byType: {
              pns: newEmployees.filter(e => e.employeeType === 'pns').length,
              p3k: newEmployees.filter(e => e.employeeType === 'p3k').length,
              nonAsn: newEmployees.filter(e => e.employeeType === 'nonAsn').length
            }
          },
          timestamp: new Date().toISOString()
        });
        return newEmployees;
      });
      
      // Force langsung update UI tanpa delay
      setSyncStatus('idle');
      
      // Triger sync sesudahnya, tapi jangan menunggu
      Promise.resolve().then(() => {
        dataSync.triggerSync();
      });
      
      // Set status kembali ke idle
      setLoading(false);
      
      // Kembalikan pegawai yang baru dibuat
      return newEmployee;
    } catch (err: any) {
      // Tangani error
      const errorMsg = err.message || 'Failed to add employee';
      setError(errorMsg);
      setSyncStatus('error');
      console.error('Error adding employee:', err);
      setLoading(false);
      
      // Teruskan error ke caller
      throw new Error(errorMsg);
    }
  }, [dataSync]);
  
  // Function to refresh all data
  const refreshData = useCallback(async () => {
    try {
      // Set status to syncing
      setSyncStatus('syncing');
      
      // Refresh the employee list
      await fetchEmployees();
      
      // Set status back to idle
      setSyncStatus('idle');
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setSyncStatus('error');
    }
  }, [fetchEmployees]);
  
  // Subscribe to initialization only once
  useEffect(() => {
    // Initial data load
    fetchEmployees();
    
    // No need for complicated sync mechanism in this simple implementation
  }, [fetchEmployees]);
  
  // Create the context value
  const contextValue: EmployeeContextType = {
    employees,
    selectedEmployee,
    loading,
    error,
    fetchEmployees,
    fetchEmployeeById,
    updateEmployeeData,
    addEmployee,
    setSelectedEmployee,
    refreshData,
    syncStatus
  };
  
  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook to use the employee context
export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
}; 