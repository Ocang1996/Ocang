import api from './api';
import { API_CONFIG } from './config';

export interface WorkUnit {
  id?: string;
  name: string;
  code: string;
  description?: string;
  parentUnit?: string;
  level: number;
  isActive: boolean;
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
 * Get all work units with optional filtering and pagination
 */
export async function getWorkUnits(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  level?: number;
  search?: string;
}): Promise<PaginatedResponse<WorkUnit>> {
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
    
    return await api.get<PaginatedResponse<WorkUnit>>(
      API_CONFIG.ENDPOINTS.WORK_UNITS.GET_ALL,
      queryParams
    );
  } catch (error) {
    console.error('Error fetching work units:', error);
    throw error;
  }
}

/**
 * Get work unit by ID
 */
export async function getWorkUnitById(id: string): Promise<WorkUnit> {
  try {
    return await api.get<WorkUnit>(API_CONFIG.ENDPOINTS.WORK_UNITS.GET_BY_ID(id));
  } catch (error) {
    console.error(`Error fetching work unit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new work unit
 */
export async function createWorkUnit(workUnitData: Omit<WorkUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkUnit> {
  try {
    return await api.post<WorkUnit>(API_CONFIG.ENDPOINTS.WORK_UNITS.CREATE, workUnitData);
  } catch (error) {
    console.error('Error creating work unit:', error);
    throw error;
  }
}

/**
 * Update an existing work unit
 */
export async function updateWorkUnit(id: string, workUnitData: Partial<WorkUnit>): Promise<WorkUnit> {
  try {
    return await api.put<WorkUnit>(API_CONFIG.ENDPOINTS.WORK_UNITS.UPDATE(id), workUnitData);
  } catch (error) {
    console.error(`Error updating work unit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a work unit
 */
export async function deleteWorkUnit(id: string): Promise<void> {
  try {
    await api.delete(API_CONFIG.ENDPOINTS.WORK_UNITS.DELETE(id));
  } catch (error) {
    console.error(`Error deleting work unit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get top-level work units (no parent)
 */
export async function getTopLevelWorkUnits(): Promise<WorkUnit[]> {
  try {
    const response = await api.get<WorkUnit[]>(`${API_CONFIG.ENDPOINTS.WORK_UNITS.BASE}/top-level`);
    return response;
  } catch (error) {
    console.error('Error fetching top-level work units:', error);
    throw error;
  }
}

/**
 * Get child work units of a parent unit
 */
export async function getChildWorkUnits(parentId: string): Promise<WorkUnit[]> {
  try {
    const response = await api.get<WorkUnit[]>(`${API_CONFIG.ENDPOINTS.WORK_UNITS.BASE}/children/${parentId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching child work units for parent ID ${parentId}:`, error);
    throw error;
  }
} 