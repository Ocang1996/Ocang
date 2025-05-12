import { Router, Request, Response } from 'express';
import { Leave } from '../models/Leave';
// import { supabase } from '../lib/supabase'; // Uncomment jika sudah ada supabase client
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET: Semua data cuti (admin)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  // TODO: Ambil data cuti dari Supabase
  res.json([]);
});

// GET: Data cuti pegawai tertentu (pegawai)
router.get('/:nip', authMiddleware, async (req: Request, res: Response) => {
  const { nip } = req.params;
  // TODO: Ambil data cuti berdasarkan NIP dari Supabase
  res.json([]);
});

// POST: Input data cuti (admin)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const data: Leave = req.body;
  // TODO: Validasi dan simpan ke Supabase
  res.status(201).json({ message: 'Cuti berhasil ditambahkan', data });
});

// PUT: Edit data cuti (admin)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Partial<Leave> = req.body;
  // TODO: Update data cuti di Supabase
  res.json({ message: 'Cuti berhasil diupdate', data });
});

// DELETE: Hapus data cuti (admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Hapus data cuti di Supabase
  res.json({ message: 'Cuti berhasil dihapus' });
});

export default router; 