import api from './api';
import { API_CONFIG } from './config';

export interface Employee {
  id?: string;
  nip: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string | Date;
  joinDate: string | Date;
  employeeType: 'pns' | 'p3k' | 'nonAsn';
  workUnit: string;
  subUnit?: string;
  position: string;
  rank?: string;
  class?: string;
  educationLevel: 'sd' | 'smp' | 'sma' | 'd1' | 'd2' | 'd3' | 'd4' | 's1' | 's2' | 's3';
  educationMajor?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  photo?: string;
  retirementDate?: string | Date;
  status: 'active' | 'inactive' | 'pending';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all employees with optional filtering and pagination
 */
export async function getEmployees(params?: {
  page?: number;
  limit?: number;
  employeeType?: string;
  gender?: string;
  workUnit?: string;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Employee>> {
  try {
    // Convert params to string values for API
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }
    
    // Note: API call without parameters will use mock data as per API_CONFIG.USE_BACKEND setting
    return await api.get<PaginatedResponse<Employee>>(
      API_CONFIG.ENDPOINTS.EMPLOYEES.GET_ALL
    );
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<Employee> {
  try {
    return await api.get<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.GET_BY_ID(id));
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  try {
    return await api.post<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.CREATE, employeeData);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    return await api.put<Employee>(API_CONFIG.ENDPOINTS.EMPLOYEES.UPDATE(id), employeeData);
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  try {
    await api.delete(API_CONFIG.ENDPOINTS.EMPLOYEES.DELETE(id));
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Upload employee photo
 */
export async function uploadEmployeePhoto(id: string, photoFile: File): Promise<{ photoUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return await api.upload<{ photoUrl: string }>(
      `${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}/${id}/photo`,
      formData
    );
  } catch (error) {
    console.error(`Error uploading photo for employee with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get employee statistics
 */
export async function getEmployeeStats(): Promise<{
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  pendingEmployees: number;
  maleEmployees: number;
  femaleEmployees: number;
  employeesByType: Record<string, number>;
  employeesByWorkUnit: Record<string, number>;
}> {
  try {
    return await api.get(API_CONFIG.ENDPOINTS.STATS.OVERVIEW);
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    throw error;
  }
} 