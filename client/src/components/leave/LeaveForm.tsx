import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Grid, Paper, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id } from 'date-fns/locale';

interface LeaveFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jenis_cuti: '',
    tanggal_mulai: null,
    tanggal_selesai: null,
    keterangan: '',
  });

  const [totalHari, setTotalHari] = useState(0);

  const jenisCutiOptions = [
    { value: 'tahunan', label: 'Cuti Tahunan' },
    { value: 'sakit', label: 'Cuti Sakit' },
    { value: 'melahirkan', label: 'Cuti Melahirkan' },
    { value: 'penting', label: 'Cuti Penting' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const calculateTotalDays = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const handleDateChange = (field: string, value: Date | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    if (field === 'tanggal_mulai' || field === 'tanggal_selesai') {
      const start = field === 'tanggal_mulai' ? value : formData.tanggal_mulai;
      const end = field === 'tanggal_selesai' ? value : formData.tanggal_selesai;
      setTotalHari(calculateTotalDays(start, end));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      total_hari: totalHari,
    });
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Form Pengajuan Cuti
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="NIP"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nama Pegawai"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Jenis Cuti"
              value={formData.jenis_cuti}
              onChange={(e) => setFormData({ ...formData, jenis_cuti: e.target.value })}
              required
            >
              {jenisCutiOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <DatePicker
                label="Tanggal Mulai"
                value={formData.tanggal_mulai}
                onChange={(date) => handleDateChange('tanggal_mulai', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <DatePicker
                label="Tanggal Selesai"
                value={formData.tanggal_selesai}
                onChange={(date) => handleDateChange('tanggal_selesai', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Keterangan"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Total Hari: {totalHari} hari
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              {initialData ? 'Update Cuti' : 'Submit Cuti'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default LeaveForm; 