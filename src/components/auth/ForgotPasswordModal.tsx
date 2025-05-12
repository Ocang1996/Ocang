import { useState } from 'react';
import authService from '../../lib/auth-service';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Email harus diisi');
      return;
    }
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess('Link reset password telah dikirim ke email Anda.');
      } else {
        setError(response.message || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error('Error in forgot password:', err);
      setError('Gagal mengirim permintaan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl">×</button>
        <h2 className="text-xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">Lupa Kata Sandi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              placeholder="Masukkan email Anda"
              autoFocus
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 