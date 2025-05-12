import { supabase } from './supabase';
import type { LeaveData, LeaveQuota } from './LeaveContext';

/**
 * Get all leave data with optional filtering
 */
export async function getLeaveData(filters?: {
  employeeId?: string | number;
  year?: number;
  status?: string;
  leaveType?: string;
}): Promise<LeaveData[]> {
  try {
    // Build query
    let query = supabase.from('leave_data').select('*');
    
    // Apply filters
    if (filters?.employeeId) {
      query = query.eq('employeeId', filters.employeeId);
    }
    
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.leaveType) {
      query = query.eq('leaveType', filters.leaveType);
    }
    
    // Execute query
    const { data, error } = await query.order('startDate', { ascending: false });
    
    if (error) throw error;
    
    return data as LeaveData[];
  } catch (error) {
    console.error('Error fetching leave data:', error);
    throw error;
  }
}

/**
 * Get leave data by ID
 */
export async function getLeaveById(id: string): Promise<LeaveData> {
  try {
    const { data, error } = await supabase
      .from('leave_data')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Leave data with ID ${id} not found`);
    
    return data as LeaveData;
  } catch (error) {
    console.error(`Error fetching leave data with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Add new leave data
 */
export async function addLeaveData(leaveData: Omit<LeaveData, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveData> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('leave_data')
      .insert([
        {
          ...leaveData,
          createdAt: now,
          updatedAt: now
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to add leave data');
    
    return data as LeaveData;
  } catch (error) {
    console.error('Error adding leave data:', error);
    throw error;
  }
}

/**
 * Update leave data
 */
export async function updateLeaveData(id: string, updateData: Partial<LeaveData>): Promise<LeaveData> {
  try {
    const { data, error } = await supabase
      .from('leave_data')
      .update({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Failed to update leave data with ID ${id}`);
    
    return data as LeaveData;
  } catch (error) {
    console.error(`Error updating leave data with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete leave data
 */
export async function deleteLeaveData(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('leave_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting leave data with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get leave quotas
 */
export async function getLeaveQuotas(filters?: {
  employeeId?: string | number;
  year?: number;
}): Promise<LeaveQuota[]> {
  try {
    // Build query
    let query = supabase.from('leave_quotas').select('*');
    
    // Apply filters
    if (filters?.employeeId) {
      query = query.eq('employeeId', filters.employeeId);
    }
    
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    
    // Execute query
    const { data, error } = await query.order('year', { ascending: false });
    
    if (error) throw error;
    
    return data as LeaveQuota[];
  } catch (error) {
    console.error('Error fetching leave quotas:', error);
    throw error;
  }
}

/**
 * Get leave quota by employee ID and year
 */
export async function getLeaveQuotaByEmployeeAndYear(employeeId: string | number, year: number): Promise<LeaveQuota | null> {
  try {
    const { data, error } = await supabase
      .from('leave_quotas')
      .select('*')
      .eq('employeeId', employeeId)
      .eq('year', year)
      .single();
    
    if (error) {
      // If not found, return null instead of throwing error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data as LeaveQuota;
  } catch (error) {
    console.error(`Error fetching leave quota for employee ${employeeId} and year ${year}:`, error);
    throw error;
  }
}

/**
 * Add or update leave quota
 */
export async function updateLeaveQuota(
  employeeId: string | number, 
  year: number, 
  quotaData: Partial<Omit<LeaveQuota, 'id' | 'employeeId' | 'year' | 'createdAt' | 'updatedAt'>>
): Promise<LeaveQuota> {
  try {
    // Check if the quota exists
    const existingQuota = await getLeaveQuotaByEmployeeAndYear(employeeId, year);
    
    const now = new Date().toISOString();
    
    if (existingQuota) {
      // Update existing quota
      const { data, error } = await supabase
        .from('leave_quotas')
        .update({
          ...quotaData,
          updatedAt: now
        })
        .eq('id', existingQuota.id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error(`Failed to update leave quota for employee ${employeeId} and year ${year}`);
      
      return data as LeaveQuota;
    } else {
      // Create new quota
      const { data, error } = await supabase
        .from('leave_quotas')
        .insert([
          {
            employeeId,
            year,
            ...quotaData,
            createdAt: now,
            updatedAt: now
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error(`Failed to create leave quota for employee ${employeeId} and year ${year}`);
      
      return data as LeaveQuota;
    }
  } catch (error) {
    console.error(`Error updating leave quota for employee ${employeeId} and year ${year}:`, error);
    throw error;
  }
}
