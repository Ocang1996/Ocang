import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee as apiUpdateEmployee, 
  deleteEmployee as apiDeleteEmployee,
  uploadEmployeePhoto as apiUploadEmployeePhoto,
  PaginatedResponse,
  Employee as ApiEmployee
} from './employeeService';

// Employee data types - menggunakan definisi dari employeeService dengan tambahan
export interface Employee extends Omit<ApiEmployee, 'id'> {
  // ID bisa berupa number (dari data lama) atau string (dari Supabase)
  id: string | number;
  // Property untuk cache invalidation
  _cacheTimestamp?: number;
}

// Helper function to convert API employee to our context format
const convertApiEmployee = (apiEmployee: ApiEmployee): Employee => ({
  // Preserve all properties from the API employee
  ...(apiEmployee as unknown as Employee),
  // Ensure we always have an ID
  id: apiEmployee.id || Date.now().toString(),
  // Ensure type safety for dates
  birthDate: typeof apiEmployee.birthDate === 'string'
    ? apiEmployee.birthDate
    : apiEmployee.birthDate ? new Date(apiEmployee.birthDate).toISOString() : '',
  // Ensure proper handling of appointmentDate
  appointmentDate: typeof apiEmployee.appointmentDate === 'string'
    ? apiEmployee.appointmentDate
    : apiEmployee.appointmentDate ? new Date(apiEmployee.appointmentDate).toISOString() : undefined,
  // Ensure proper handling of joinDate
  joinDate: typeof apiEmployee.joinDate === 'string'
    ? apiEmployee.joinDate
    : apiEmployee.joinDate ? new Date(apiEmployee.joinDate).toISOString() : undefined,
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
  // Extract only the properties needed by the API
  const { 
    // Exclude context-specific properties
    id: _, 
    _cacheTimestamp: __,
    ...apiData 
  } = employee;
  
  // Process ID seperately if needed
  const apiEmployee: Partial<ApiEmployee> = {
    ...apiData,
    // Add ID explicitly if present (converting to string if needed)
    ...(employee.id !== undefined ? { id: employee.id.toString() } : {})
  };
  
  return apiEmployee;
  

};

interface EmployeeContextType {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  // Tambah pagination state
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Update method signatures
  fetchEmployees: (params?: {
    page?: number;
    limit?: number;
    employeeType?: string;
    gender?: string;
    workUnit?: string;
    status?: string;
    search?: string;
  }) => Promise<void>;
  fetchEmployeeById: (id: string | number) => Promise<Employee>;
  updateEmployeeData: (id: string | number, data: Partial<Employee>) => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id'>) => Promise<Employee>;
  deleteEmployee: (id: string | number) => Promise<void>;
  uploadEmployeePhoto: (id: string | number, photoFile: File) => Promise<{ photoUrl: string }>;
  setSelectedEmployee: (employee: Employee | null) => void;
  refreshData: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'error';
  // Tambah method setPagination untuk update pagination
  setPagination: (params: { page?: number; limit?: number }) => void;
}

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Simplified mock implementation
class EmployeeDataSync {
  private lastSyncTime: number = 0;

  constructor() {}
  
  // Simplified connect method
  connect() {
    // Just a stub
    this.lastSyncTime = Date.now();
  }

  // Simplified subscribe method
  subscribe(_: () => void) {
    // Just a stub
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  // Tambahkan state untuk pagination
  const [pagination, setPaginationState] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Untuk caching data
  const employeeCache = React.useRef<Record<string | number, Employee>>({});
  const listCache = React.useRef<{
    data: Employee[];
    params: string;
    timestamp: number;
  } | null>(null);
  
  // Update pagination
  const setPagination = useCallback((params: { page?: number; limit?: number }) => {
    setPaginationState(prev => ({
      ...prev,
      ...(params.page !== undefined ? { page: params.page } : {}),
      ...(params.limit !== undefined ? { limit: params.limit } : {})
    }));
  }, []);

  // Refetch data - used for manual refresh and after mutations
  const refreshData = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      await fetchEmployees();
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
    }
  }, []);
  
  // Fetch all employees with pagination and filtering
  const fetchEmployees = useCallback(async (params?: {
    page?: number;
    limit?: number;
    employeeType?: string;
    gender?: string;
    workUnit?: string;
    status?: string;
    search?: string;
  }) => {
    setLoading(true);
    try {
      // Gunakan parameter pagination jika diberikan, otherwise gunakan state
      const queryParams = {
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        ...(params?.employeeType && { employeeType: params.employeeType }),
        ...(params?.gender && { gender: params.gender }),
        ...(params?.workUnit && { workUnit: params.workUnit }),
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search })
      };
      
      // Generate cache key
      const cacheKey = JSON.stringify(queryParams);
      
      // Check cache first (valid for 60 seconds)
      const now = Date.now();
      if (listCache.current && 
          listCache.current.params === cacheKey && 
          now - listCache.current.timestamp < 60000) {
        setEmployees(listCache.current.data);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Fetch from Supabase
      const result: PaginatedResponse<ApiEmployee> = await getEmployees(queryParams);
      const formattedData = result.data.map(emp => convertApiEmployee(emp));
      
      // Update state
      setEmployees(formattedData);
      setPaginationState({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      });
      setError(null);
      
      // Update cache
      listCache.current = {
        data: formattedData,
        params: cacheKey,
        timestamp: now
      };
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);
  
  // Fetch single employee by ID
  const fetchEmployeeById = useCallback(async (id: string | number): Promise<Employee> => {
    try {
      // Check cache first (valid for 60 seconds)
      const now = Date.now();
      const cacheEntry = employeeCache.current[id];
      
      if (cacheEntry && cacheEntry._cacheTimestamp && 
          now - cacheEntry._cacheTimestamp < 60000) {
        return cacheEntry;
      }
      
      // Fetch from Supabase if not in cache or cache expired
      const data = await getEmployeeById(id.toString());
      const formattedData = convertApiEmployee(data);
      
      // Add timestamp for cache invalidation
      const dataWithTimestamp = {
        ...formattedData,
        _cacheTimestamp: now
      } as Employee;
      
      // Update cache
      employeeCache.current[id] = dataWithTimestamp;
      
      // If this is the currently selected employee, update it
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(dataWithTimestamp);
      }
      
      return dataWithTimestamp;
    } catch (err: any) {
      throw new Error(err.message || `Failed to fetch employee with ID ${id}`);
    }
  }, [selectedEmployee]);
  
  // Update employee data
  const updateEmployeeData = useCallback(async (id: string | number, data: Partial<Employee>) => {
    try {
      // Optimistically update UI
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, ...data, updatedAt: new Date().toISOString() } : emp
      ));
      
      // Update cache
      if (employeeCache.current[id]) {
        employeeCache.current[id] = { 
          ...employeeCache.current[id], 
          ...data, 
          updatedAt: new Date().toISOString(),
          _cacheTimestamp: Date.now() 
        };
      }
      
      // Convert to API format and send update to Supabase
      const apiData = convertToApiEmployee(data);
      await apiUpdateEmployee(id.toString(), apiData);
      
      // Success! Update the selectedEmployee if it's the one being edited
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(prev => prev ? { 
          ...prev, 
          ...data, 
          updatedAt: new Date().toISOString() 
        } : null);
      }
      
      // Invalidate list cache to force refresh on next fetch
      listCache.current = null;
    } catch (err: any) {
      // Revert optimistic update
      refreshData();
      throw new Error(err.message || `Failed to update employee with ID ${id}`);
    }
  }, [selectedEmployee, refreshData]);
  
  // Add new employee
  const addEmployee = useCallback(async (data: Omit<Employee, 'id'>): Promise<Employee> => {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Ensure required fields are present before sending to API
      if (!dataWithTimestamps.name) {
        throw new Error('Name is required');
      }

      // Handle convertToApiEmployee for the create operation
      const apiData = convertToApiEmployee(dataWithTimestamps);
      
      // Cast to satisfy TypeScript - we've already ensured required fields exist
      const createData = apiData as Omit<ApiEmployee, 'id' | 'createdAt' | 'updatedAt'>;
      const newEmployee = await createEmployee(createData);
      
      // Convert to our format
      const formattedData = convertApiEmployee(newEmployee);
      
      // Optimistically update UI
      setEmployees(prev => [...prev, formattedData]);
      
      // Invalidate list cache
      listCache.current = null;
      
      return formattedData;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add employee');
    }
  }, []);
  
  // Delete employee
  const deleteEmployee = useCallback(async (id: string | number) => {
    try {
      // Optimistically update UI
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      
      // Remove from cache
      if (employeeCache.current[id]) {
        delete employeeCache.current[id];
      }
      
      // If this is the selected employee, clear selection
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(null);
      }
      
      // Send delete request to Supabase
      await apiDeleteEmployee(id.toString());
      
      // Invalidate list cache
      listCache.current = null;
    } catch (err: any) {
      // Revert optimistic update
      refreshData();
      throw new Error(err.message || `Failed to delete employee with ID ${id}`);
    }
  }, [selectedEmployee, refreshData]);
  
  // Upload employee photo
  const uploadEmployeePhoto = useCallback(async (id: string | number, photoFile: File): Promise<{ photoUrl: string }> => {
    try {
      // Send upload request to Supabase
      const { photoUrl } = await apiUploadEmployeePhoto(id.toString(), photoFile);
      
      // Update employee data with the new photo URL
      await updateEmployeeData(id, { photo: photoUrl });
      
      return { photoUrl };
    } catch (err: any) {
      throw new Error(err.message || `Failed to upload photo for employee with ID ${id}`);
    }
  }, [updateEmployeeData]);

  // For initial data load
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  return (
    <EmployeeContext.Provider value={{
      employees,
      selectedEmployee,
      loading,
      error,
      pagination,
      fetchEmployees,
      fetchEmployeeById,
      updateEmployeeData,
      addEmployee,
      deleteEmployee,
      uploadEmployeePhoto,
      setSelectedEmployee,
      refreshData,
      syncStatus,
      setPagination
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook to use the employee context
export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  
  return context;
};

// Hapus kelas mock EmployeeDataSync karena kita sudah menggunakan Supabase
export const clearEmployeeCache = (): void => {
  // Helper untuk menghapus cache secara manual jika diperlukan
  const context = useContext(EmployeeContext);
  if (context) {
    context.refreshData();
  }
};