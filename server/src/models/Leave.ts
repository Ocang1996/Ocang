export interface Leave {
  id: string;
  nip: string; // NIP pegawai
  nama: string;
  jenis_cuti: string; // Tahunan, Sakit, dll.
  tanggal_mulai: string; // ISO date
  tanggal_selesai: string; // ISO date
  keterangan?: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  created_at: string;
  updated_at: string;
} 