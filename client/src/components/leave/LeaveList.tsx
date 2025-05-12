import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Box,
  IconButton,
  MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import leaveService, { LeaveData, LeaveStats } from '../../services/leaveService';

interface LeaveListProps {
  nip?: string;
  isAdmin?: boolean;
}

const LeaveList: React.FC<LeaveListProps> = ({ nip, isAdmin = false }) => {
  const [leaves, setLeaves] = useState<LeaveData[]>([]);
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    jatah: 12,
    terpakai: 0,
    sisa: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [nip]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let data: LeaveData[];
      if (nip) {
        data = await leaveService.getLeavesByNip(nip);
        const stats = await leaveService.getLeaveStats(nip);
        setLeaveStats(stats);
      } else {
        data = await leaveService.getAllLeaves();
      }
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'disetujui' | 'ditolak') => {
    try {
      await leaveService.updateLeaveStatus(id, newStatus);
      fetchData(); // Refresh data after status update
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = 
      leave.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.jenis_cuti.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'success';
      case 'ditolak':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  };

  return (
    <div>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Jatah Cuti
              </Typography>
              <Typography variant="h4">
                {leaveStats.jatah} hari
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cuti Terpakai
              </Typography>
              <Typography variant="h4">
                {leaveStats.terpakai} hari
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sisa Cuti
              </Typography>
              <Typography variant="h4">
                {leaveStats.sisa} hari
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Cari"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <TextField
          select
          label="Status"
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">Semua</MenuItem>
          <MenuItem value="menunggu">Menunggu</MenuItem>
          <MenuItem value="disetujui">Disetujui</MenuItem>
          <MenuItem value="ditolak">Ditolak</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NIP</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>Jenis Cuti</TableCell>
              <TableCell>Tanggal Mulai</TableCell>
              <TableCell>Tanggal Selesai</TableCell>
              <TableCell>Total Hari</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Keterangan</TableCell>
              {isAdmin && <TableCell>Aksi</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.nip}</TableCell>
                <TableCell>{leave.nama}</TableCell>
                <TableCell>{leave.jenis_cuti}</TableCell>
                <TableCell>{formatDate(leave.tanggal_mulai)}</TableCell>
                <TableCell>{formatDate(leave.tanggal_selesai)}</TableCell>
                <TableCell>{leave.total_hari}</TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={getStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{leave.keterangan}</TableCell>
                {isAdmin && leave.status === 'menunggu' && (
                  <TableCell>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleStatusChange(leave.id, 'disetujui')}
                    >
                      ✓
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleStatusChange(leave.id, 'ditolak')}
                    >
                      ✕
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LeaveList; 