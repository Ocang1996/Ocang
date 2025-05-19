import { supabase, Employee } from './supabase';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmployeeFilter {
  search?: string;
  department?: string;
  rank?: string;
  status?: string;
  workUnitId?: string;
  page?: number;
  limit?: number;
}

export const employeeService = {
  /**
   * Get all employees with pagination and filters
   */
  async getEmployees(filters: EmployeeFilter = {}): Promise<PaginatedResponse<Employee>> {
    try {
      const {
        search = '',
        department,
        rank,
        status,
        workUnitId,
        page = 1,
        limit = 10,
      } = filters;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Start query
      let query = supabase.from('employees').select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,nip.ilike.%${search}%`);
      }
      if (department) {
        query = query.eq('department', department);
      }
      if (rank) {
        query = query.eq('rank', rank);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (workUnitId) {
        query = query.eq('work_unit_id', workUnitId);
      }

      // Apply pagination
      query = query.order('created_at', { ascending: false }).limit(limit).offset(offset);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data as Employee[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Employee;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Fungsi untuk mapping field employee ke format database (snake_case)
   */
  mapEmployeeToDb(employee: any) {
    let status = employee.status;
    if (status === 'Aktif') status = 'active';
    if (status === 'Tidak Aktif' || status === 'Nonaktif') status = 'inactive';
    if (status !== 'active' && status !== 'inactive') {
      throw new Error('Status harus "active" atau "inactive"!');
    }
    return {
      nip: employee.nip,
      name: employee.name,
      gender: employee.gender,
      birthdate: employee.birthDate ? employee.birthDate.split('T')[0] : undefined,
      joindate: employee.joinDate ? employee.joinDate.split('T')[0] : undefined,
      employeetype: employee.employeeType,
      workunit: employee.workUnitId || employee.workunit,
      subunit: employee.subunit,
      position: employee.position,
      rank: employee.rank,
      class: employee.class,
      educationlevel: employee.educationLevel,
      educationmajor: employee.educationMajor,
      email: employee.email,
      phonenumber: employee.phoneNumber,
      address: employee.address,
      photo: employee.photo_url || employee.photo || null,
      retirementdate: employee.retirementDate ? employee.retirementDate.split('T')[0] : undefined,
      status,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    } as Record<string, any>;
  },

  /**
   * Create new employee
   */
  async createEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<{ success: boolean; message: string; data?: Employee }> {
    try {
      const mappedEmployee = this.mapEmployeeToDb(employee);
      // Validasi field wajib
      const requiredFields = [
        'nip', 'name', 'gender', 'birthdate', 'joindate', 'employeetype', 'workunit', 'position', 'rank', 'status'
      ];
      for (const field of requiredFields) {
        if (!mappedEmployee[field] || mappedEmployee[field] === '') {
          return {
            success: false,
            message: `Field wajib '${field}' tidak boleh kosong!`,
          };
        }
      }
      // Logging data yang dikirim ke Supabase
      console.log('Data yang dikirim ke Supabase:', mappedEmployee);
      const { data, error } = await supabase
        .from('employees')
        .insert(mappedEmployee)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Data ASN berhasil ditambahkan',
        data: data as Employee,
      };
    } catch (error: any) {
      console.error('Error creating employee:', error);
      
      // Handle duplicate NIP
      if (error.code === '23505' && error.message.includes('nip')) {
        return {
          success: false,
          message: 'NIP sudah digunakan oleh ASN lain',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Gagal menambahkan data ASN',
      };
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<{ success: boolean; message: string; data?: Employee }> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Data ASN berhasil diperbarui',
        data: data as Employee,
      };
    } catch (error: any) {
      console.error(`Error updating employee with ID ${id}:`, error);
      
      // Handle duplicate NIP
      if (error.code === '23505' && error.message.includes('nip')) {
        return {
          success: false,
          message: 'NIP sudah digunakan oleh ASN lain',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Gagal memperbarui data ASN',
      };
    }
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Data ASN berhasil dihapus',
      };
    } catch (error: any) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Gagal menghapus data ASN',
      };
    }
  },

  /**
   * Upload employee photo
   */
  async uploadEmployeePhoto(file: File, employeeId: string): Promise<{ success: boolean; message: string; photoUrl?: string }> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          message: 'File harus berupa gambar (JPG, PNG, atau GIF)',
        };
      }

      // Max file size (5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          message: 'Ukuran file terlalu besar (maks. 5MB)',
        };
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
      const filePath = `employee-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // Update employee record with photo URL
      const photoUrl = urlData.publicUrl;
      await this.updateEmployee(employeeId, { photo_url: photoUrl });

      return {
        success: true,
        message: 'Foto berhasil diunggah',
        photoUrl,
      };
    } catch (error: any) {
      console.error('Error uploading employee photo:', error);
      return {
        success: false,
        message: error.message || 'Gagal mengunggah foto',
      };
    }
  },
};

export default employeeService;
