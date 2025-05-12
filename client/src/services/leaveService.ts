import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface LeaveData {
  id: string;
  nip: string;
  nama: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan?: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  total_hari: number;
}

export interface LeaveStats {
  jatah: number;
  terpakai: number;
  sisa: number;
}

const leaveService = {
  // Get all leaves (admin)
  getAllLeaves: async (): Promise<LeaveData[]> => {
    const response = await axios.get(`${API_URL}/leave`);
    return response.data;
  },

  // Get leaves by NIP
  getLeavesByNip: async (nip: string): Promise<LeaveData[]> => {
    const response = await axios.get(`${API_URL}/leave/${nip}`);
    return response.data;
  },

  // Create new leave
  createLeave: async (leaveData: Omit<LeaveData, 'id' | 'status'>): Promise<LeaveData> => {
    const response = await axios.post(`${API_URL}/leave`, leaveData);
    return response.data;
  },

  // Update leave
  updateLeave: async (id: string, leaveData: Partial<LeaveData>): Promise<LeaveData> => {
    const response = await axios.put(`${API_URL}/leave/${id}`, leaveData);
    return response.data;
  },

  // Delete leave
  deleteLeave: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/leave/${id}`);
  },

  // Get leave stats
  getLeaveStats: async (nip: string): Promise<LeaveStats> => {
    const response = await axios.get(`${API_URL}/leave/stats/${nip}`);
    return response.data;
  },

  // Update leave status
  updateLeaveStatus: async (id: string, status: 'disetujui' | 'ditolak'): Promise<LeaveData> => {
    const response = await axios.patch(`${API_URL}/leave/${id}/status`, { status });
    return response.data;
  },
};

export default leaveService; 