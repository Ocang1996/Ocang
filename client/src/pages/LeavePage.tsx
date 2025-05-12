import React, { useState } from 'react';
import { Container, Typography, Box, Button, Alert, Snackbar } from '@mui/material';
import LeaveForm from '../components/leave/LeaveForm';
import LeaveList from '../components/leave/LeaveList';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an auth context
import leaveService from '../services/leaveService';

const LeavePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth(); // Get current user from auth context
  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (data: any) => {
    try {
      if (data.id) {
        await leaveService.updateLeave(data.id, data);
        setSuccess('Data cuti berhasil diperbarui');
      } else {
        await leaveService.createLeave(data);
        setSuccess('Data cuti berhasil ditambahkan');
      }
      setShowForm(false);
    } catch (error) {
      setError('Terjadi kesalahan saat menyimpan data cuti');
      console.error('Error submitting leave:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manajemen Cuti Pegawai
        </Typography>

        {isAdmin && (
          <Box sx={{ mb: 3 }}>
            {!showForm ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
              >
                Tambah Cuti Baru
              </Button>
            ) : (
              <LeaveForm
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            )}
          </Box>
        )}

        <LeaveList
          nip={!isAdmin ? user?.nip : undefined}
          isAdmin={isAdmin}
        />

        <Snackbar
          open={!!error || !!success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default LeavePage; 