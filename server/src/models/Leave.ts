export interface Leave {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string; // Tahunan, Sakit, dll.
  start_date: string; // ISO date
  end_date: string; // ISO date
  duration: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  input_by: string;
  year: number;
  document_required: boolean;
  created_at: string;
  updated_at?: string;
} 