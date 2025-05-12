import { supabase, WorkUnit } from './supabase';

interface WorkUnitResponse {
  success: boolean;
  message: string;
  data?: WorkUnit | WorkUnit[];
}

export const workUnitService = {
  /**
   * Get all work units
   */
  async getAllWorkUnits(): Promise<WorkUnit[]> {
    try {
      const { data, error } = await supabase
        .from('work_units')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data as WorkUnit[];
    } catch (error) {
      console.error('Error fetching work units:', error);
      return [];
    }
  },

  /**
   * Get work unit by ID
   */
  async getWorkUnitById(id: string): Promise<WorkUnit | null> {
    try {
      const { data, error } = await supabase
        .from('work_units')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as WorkUnit;
    } catch (error) {
      console.error(`Error fetching work unit with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Create new work unit
   */
  async createWorkUnit(workUnit: Omit<WorkUnit, 'id' | 'created_at'>): Promise<WorkUnitResponse> {
    try {
      const { data, error } = await supabase
        .from('work_units')
        .insert(workUnit)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Unit kerja berhasil ditambahkan',
        data: data as WorkUnit,
      };
    } catch (error: any) {
      console.error('Error creating work unit:', error);
      
      // Handle duplicate code
      if (error.code === '23505' && error.message.includes('code')) {
        return {
          success: false,
          message: 'Kode unit kerja sudah digunakan',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Gagal menambahkan unit kerja',
      };
    }
  },

  /**
   * Update work unit
   */
  async updateWorkUnit(id: string, updates: Partial<WorkUnit>): Promise<WorkUnitResponse> {
    try {
      const { data, error } = await supabase
        .from('work_units')
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
        message: 'Unit kerja berhasil diperbarui',
        data: data as WorkUnit,
      };
    } catch (error: any) {
      console.error(`Error updating work unit with ID ${id}:`, error);
      
      // Handle duplicate code
      if (error.code === '23505' && error.message.includes('code')) {
        return {
          success: false,
          message: 'Kode unit kerja sudah digunakan',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Gagal memperbarui unit kerja',
      };
    }
  },

  /**
   * Delete work unit
   */
  async deleteWorkUnit(id: string): Promise<WorkUnitResponse> {
    try {
      // Check if work unit has employees
      const { count, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('work_unit_id', id);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        return {
          success: false,
          message: 'Tidak dapat menghapus unit kerja yang masih memiliki pegawai',
        };
      }

      // Check if work unit has children
      const { count: childCount, error: childError } = await supabase
        .from('work_units')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id);

      if (childError) {
        throw childError;
      }

      if (childCount && childCount > 0) {
        return {
          success: false,
          message: 'Tidak dapat menghapus unit kerja yang masih memiliki sub-unit',
        };
      }

      // Delete work unit
      const { error } = await supabase
        .from('work_units')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Unit kerja berhasil dihapus',
      };
    } catch (error: any) {
      console.error(`Error deleting work unit with ID ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Gagal menghapus unit kerja',
      };
    }
  },

  /**
   * Get hierarchical work units
   */
  async getWorkUnitHierarchy(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('work_units')
        .select('*')
        .order('level, name');

      if (error) {
        throw error;
      }

      // Build hierarchy
      const workUnits = data as WorkUnit[];
      const hierarchy: any[] = [];
      const map = new Map<string, any>();

      // First pass: create map of all items
      workUnits.forEach(unit => {
        map.set(unit.id, {
          ...unit,
          children: [],
        });
      });

      // Second pass: build hierarchy
      workUnits.forEach(unit => {
        const node = map.get(unit.id);
        
        if (unit.parent_id) {
          // This is a child node
          const parent = map.get(unit.parent_id);
          if (parent) {
            parent.children.push(node);
          } else {
            // Parent not found, add to root
            hierarchy.push(node);
          }
        } else {
          // This is a root node
          hierarchy.push(node);
        }
      });

      return hierarchy;
    } catch (error) {
      console.error('Error fetching work unit hierarchy:', error);
      return [];
    }
  },
};

export default workUnitService;
