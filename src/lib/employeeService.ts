import { supabase } from './supabase';

export interface Employee {
  id?: string;
  nip?: string; // Wajib untuk PNS dan PPPK, tidak ada untuk NON ASN
  name: string;
  gender: 'male' | 'female';
  birthDate: string | Date;
  employeeType: 'pns' | 'pppk' | 'honorer';
  
  // Tanggal masuk kerja untuk NON ASN
  joinDate?: string | Date;
  
  // TMT Pengangkatan untuk PNS dan PPPK
  appointmentDate?: string | Date;

  workUnit: string;
  subUnit?: string;
  position: string;
  
  // Fields khusus PNS dan PPPK
  rank?: string;
  class?: string;
  positionHistory?: string;
  jobType?: string;

  // Data pendidikan
  educationLevel: 'sd' | 'smp' | 'sma' | 'd1' | 'd2' | 'd3' | 'd4' | 's1' | 's2' | 's3';
  educationMajor?: string;
  educationInstitution?: string;
  graduationYear?: string;
  
  // Informasi kontak
  email?: string;
  phoneNumber?: string;
  address?: string;
  
  // Data lainnya
  photo?: string | null;
  notes?: string;
  status: string;
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
 * Fungsi validasi data pegawai berdasarkan tipe
 */
function validateEmployeeData(employeeData: Partial<Employee>): void {
  const { employeeType } = employeeData;
  
  // Validasi umum
  if (!employeeData.name || employeeData.name.trim() === '') {
    throw new Error('Nama pegawai harus diisi');
  }
  
  // Validasi khusus berdasarkan tipe pegawai
  if (employeeType === 'pns' || employeeType === 'pppk') {
    // Validasi NIP untuk PNS/PPPK
    if (!employeeData.nip) {
      throw new Error('NIP harus diisi untuk pegawai PNS/PPPK');
    }
    
    if (!/^\d{18}$/.test(employeeData.nip)) {
      throw new Error('NIP harus terdiri dari 18 digit angka');
    }
    
    // Validasi TMT Pengangkatan
    if (!employeeData.appointmentDate) {
      throw new Error('TMT Pengangkatan harus diisi untuk pegawai PNS/PPPK');
    }
  } else if (employeeType === 'honorer') {
    // Validasi Tanggal Masuk Kerja untuk NON ASN
    if (!employeeData.joinDate) {
      throw new Error('Tanggal Masuk Kerja harus diisi untuk pegawai Honorer');
    }
  }
}

/**
 * Fungsi untuk preprocessing data pegawai sebelum disimpan
 */
function processEmployeeData(employeeData: Partial<Employee>): Partial<Employee> {
  const processedData = { ...employeeData };
  
  // Jika NON ASN, pastikan field khusus PNS/PPPK tidak ada
  if (employeeData.employeeType === 'honorer') {
    delete processedData.nip;
    delete processedData.rank;
    delete processedData.class;
    delete processedData.positionHistory;
    delete processedData.appointmentDate;
  }
  
  // Pastikan tanggal dalam format ISO string
  if (processedData.birthDate && !(typeof processedData.birthDate === 'string')) {
    processedData.birthDate = (processedData.birthDate as Date).toISOString();
  }
  
  if (processedData.joinDate && !(typeof processedData.joinDate === 'string')) {
    processedData.joinDate = (processedData.joinDate as Date).toISOString();
  }
  
  if (processedData.appointmentDate && !(typeof processedData.appointmentDate === 'string')) {
    processedData.appointmentDate = (processedData.appointmentDate as Date).toISOString();
  }
  
  return processedData;
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
    // Default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Build query
    let query = supabase.from('employees').select('*', { count: 'exact' });
    
    // Apply filters
    if (params?.employeeType) {
      query = query.eq('employeeType', params.employeeType);
    }
    
    if (params?.gender) {
      query = query.eq('gender', params.gender);
    }
    
    if (params?.workUnit) {
      query = query.eq('workUnit', params.workUnit);
    }
    
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,nip.ilike.%${params.search}%,position.ilike.%${params.search}%`);
    }
    
    // Execute query with pagination
    const { data, error, count } = await query
      .order('name')
      .range(start, end);
    
    if (error) throw error;
    
    // Calculate total pages
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: data as Employee[],
      total,
      page,
      limit,
      totalPages
    };
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
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Employee with ID ${id} not found`);
    
    return data as Employee;
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
    const now = new Date().toISOString();
    
    // Validasi data berdasarkan tipe pegawai
    validateEmployeeData(employeeData);
    
    // Preprocessing data sebelum disimpan
    const processedData = processEmployeeData(employeeData);
    
    // Insert ke database
    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          ...processedData,
          createdAt: now,
          updatedAt: now
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }
    
    if (!data) throw new Error('Failed to create employee: No data returned');
    
    return data as Employee;
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
    // Dapatkan data existing terlebih dahulu
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    const now = new Date().toISOString();
    
    // Gabungkan data existing dengan data yang diupdate
    const mergedData = { ...existingEmployee, ...employeeData };
    
    // Validasi data gabungan
    validateEmployeeData(mergedData);
    
    // Preprocessing data sebelum disimpan
    const processedData = processEmployeeData(mergedData);
    
    // Update di database
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...processedData,
        updatedAt: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }
    
    if (!data) throw new Error('Employee not found after update');
    
    return data as Employee;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
    // Create a unique file name
    const fileExt = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `${id}_${Date.now()}.${fileExt}`;
    const filePath = `employee-photos/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase
      .storage
      .from('photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase
      .storage
      .from('photos')
      .getPublicUrl(filePath) as { data: { publicUrl: string } };
    
    // Update employee record with photo URL
    await updateEmployee(id, { photo: data.publicUrl });
    
    return { photoUrl: data.publicUrl };
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
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get count by status
    const { data: statusData, error: statusError } = await supabase
      .from('employees')
      .select('status');
    
    if (statusError) throw statusError;
    
    // Get count by gender
    const { data: genderData, error: genderError } = await supabase
      .from('employees')
      .select('gender');
    
    if (genderError) throw genderError;
    
    // Get count by employee type
    const { data: typeData, error: typeError } = await supabase
      .from('employees')
      .select('employeeType');
    
    if (typeError) throw typeError;
    
    // Get count by work unit
    const { data: workUnitData, error: workUnitError } = await supabase
      .from('employees')
      .select('workUnit');
    
    if (workUnitError) throw workUnitError;
    
    // Calculate statistics
    const statusCounts = statusData.reduce((acc: Record<string, number>, item: { status: string }) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const genderCounts = genderData.reduce((acc: Record<string, number>, item: { gender: string }) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const typeCounts = typeData.reduce((acc: Record<string, number>, item: { employeeType: string }) => {
      acc[item.employeeType] = (acc[item.employeeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const workUnitCounts = workUnitData.reduce((acc: Record<string, number>, item: { workUnit: string }) => {
      acc[item.workUnit] = (acc[item.workUnit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalEmployees: totalCount || 0,
      activeEmployees: statusCounts['active'] || 0,
      inactiveEmployees: statusCounts['inactive'] || 0,
      pendingEmployees: statusCounts['pending'] || 0,
      maleEmployees: genderCounts['male'] || 0,
      femaleEmployees: genderCounts['female'] || 0,
      employeesByType: typeCounts,
      employeesByWorkUnit: workUnitCounts
    };
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    throw error;
  }
}