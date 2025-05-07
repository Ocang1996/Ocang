import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, RefreshCcw } from 'lucide-react';

interface TwoFactorAuthProps {
  username: string;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

const TwoFactorAuth = ({ username, onVerify, onCancel }: TwoFactorAuthProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);
  const navigate = useNavigate();

  // Timer untuk countdown kode 2FA (biasanya 30 detik)
  useEffect(() => {
    if (remainingTime <= 0) {
      setRemainingTime(30);
      return;
    }

    const timer = setTimeout(() => {
      setRemainingTime(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remainingTime]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Mohon masukkan kode 6 digit dari Google Authenticator');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(verificationCode);
      
      if (success) {
        // Navigasi akan ditangani oleh AuthContext setelah login berhasil
        // Tidak perlu navigate('/dashboard') di sini
      } else {
        setError('Kode verifikasi tidak valid. Silakan coba lagi.');
        setVerificationCode('');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat verifikasi. Silakan coba lagi.');
      console.error('2FA verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTimer = () => {
    setRemainingTime(30);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex justify-center items-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <Smartphone size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Verifikasi Dua Faktor</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Masukkan kode 6 digit dari aplikasi Google Authenticator Anda
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kode Verifikasi
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Masukkan kode 6 digit"
                className="w-full px-3 py-3 text-lg text-center tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  <RefreshCcw size={14} className="mr-1" />
                  Segarkan
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Kode baru dalam: {remainingTime} detik
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-2.5 px-4 text-center bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-600"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 px-4 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Kembali ke Login
              </button>
            </div>
          </div>

          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            <p>Akun: <span className="font-medium text-gray-900 dark:text-white">{username}</span></p>
            <p className="mt-1">
              Tidak mempunyai akses ke aplikasi Google Authenticator?{' '}
              <button
                type="button"
                onClick={() => alert('Silakan hubungi administrator sistem untuk bantuan pemulihan akun.')}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Bantuan
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth; 