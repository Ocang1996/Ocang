import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi tidak cocok');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password berhasil direset. Silakan login.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Token tidak valid atau sudah kadaluarsa.');
      }
    } catch (err) {
      setError('Gagal mengirim permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:bg-gray-900 dark:bg-none">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-emerald-200 dark:border-emerald-800">
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              placeholder="Password baru"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              placeholder="Konfirmasi password"
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
            {loading ? 'Menyimpan...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 