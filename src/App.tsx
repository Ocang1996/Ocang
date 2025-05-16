import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TestProtectedRoute from './components/auth/TestProtectedRoute';
import ProfilePage from './components/profile/ProfilePage';
import EmployeeList from './components/employees/EmployeeList';
import ReportsPage from './components/reports/ReportsPage';
import Settings from './components/settings/Settings';
import LandingPage from './components/landing/LandingPage';
import SettingsIndicator from './components/ui/SettingsIndicator';
import TwoFactorAuth from './components/auth/TwoFactorAuth';
import HelpPage from './components/help/HelpPage';
import ResetPassword from './components/auth/ResetPassword';
import LeavePage from './components/leave/LeavePage';
import SupabaseTestPage from './pages/SupabaseTestPage';
import SupabaseDebugPage from './pages/SupabaseDebugPage';
import { UserRole } from './types/auth';
import { initSessionTimeout } from './lib/sessionUtils';
import { AuthProvider } from './lib/AuthContext';
import { LeaveProvider } from './lib/LeaveContext';
import { SidebarProvider } from './lib/SidebarContext';
import { ThrottleProvider } from './components/settings/ThrottleProvider';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [requireTwoFA, setRequireTwoFA] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('asnToken');
    const storedRole = localStorage.getItem('userRole');
    
    // Check if username has been changed
    const usernameChanged = localStorage.getItem('username_changed');
    
    if (usernameChanged === 'true') {
      // Clear the flag
      localStorage.removeItem('username_changed');
      
      // Show notification
      alert('Username telah diubah. Silakan login kembali dengan username baru Anda.');
      
      // Force logout
      handleLogout();
      return;
    }
    
    if (token) {
      setIsAuthenticated(true);
      if (storedRole) {
        setUserRole(storedRole as UserRole);
      }
    }
  }, []);

  // Setup session timeout
  useEffect(() => {
    if (isAuthenticated) {
      // Inisialisasi session timeout dengan callback logout
      const cleanupSessionTimeout = initSessionTimeout(() => {
        // Tandai sesi sudah berakhir
        setSessionExpired(true);
        // Logout user
        handleLogout();
      });

      // Bersihkan event listener saat komponen unmount
      return cleanupSessionTimeout;
    }
  }, [isAuthenticated]);

  const handleLogin = (username: string, password: string, role: UserRole) => {
    // Reset session expired state
    setSessionExpired(false);
    
    // Menggunakan role yang diberikan dari halaman login yang sudah divalidasi
    // oleh fungsi authenticateUser
    if (username && password) {
      // Check if 2FA is enabled for this user
      const twoFAEnabled = checkIfTwoFAEnabled(username);
      
      if (twoFAEnabled) {
        // Don't authenticate yet, require 2FA verification first
        setPendingUser(username);
        setUserRole(role);
        setRequireTwoFA(true);
        return true;
      } else {
        // No 2FA required, complete login immediately
        completeLogin(username, role);
        return true;
      }
    }
    return false;
  };
  
  const checkIfTwoFAEnabled = (_username: string): boolean => {
    // This would typically be an API call to check if 2FA is enabled
    // For demo, check if it's enabled in localStorage based on settings
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        return settings?.account?.twoFactorEnabled || false;
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
    return false;
  };
  
  const completeLogin = (username: string, role: UserRole) => {
    // Set a dummy token and authenticate the user
    localStorage.setItem('asnToken', 'mock-jwt-token');
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    
    console.log('Login completed for:', username, 'with role:', role);
    
    setIsAuthenticated(true);
  };
  
  const handleVerifyTwoFA = async (code: string): Promise<boolean> => {
    // This would typically be an API call to verify the 2FA code
    // For demo purposes, accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Verification successful, complete login
      completeLogin(pendingUser, userRole);
      setRequireTwoFA(false);
      setPendingUser('');
      return true;
    }
    return false;
  };
  
  const handleCancelTwoFA = () => {
    // Cancel 2FA verification and return to login
    setRequireTwoFA(false);
    setPendingUser('');
  };

  const handleLogout = () => {
    localStorage.removeItem('asnToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    // Jangan hapus demoPassword agar pengguna bisa login dengan password yang baru
    setIsAuthenticated(false);
    setUserRole('user');
  };

  return (
    <ThrottleProvider defaultLevel="medium">
      <SidebarProvider>
        <AuthProvider>
          <LeaveProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {sessionExpired && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Sesi Anda Telah Berakhir</h2>
                  <p className="mb-4">Silakan login kembali untuk melanjutkan.</p>
                  <button 
                    onClick={() => setSessionExpired(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
            {requireTwoFA ? (
              <TwoFactorAuth 
                username={pendingUser}
                onVerify={handleVerifyTwoFA}
                onCancel={handleCancelTwoFA}
              />
            ) : (
              <Routes>
                <Route path="/" element={<LandingPage />} />
                
                <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : 
                  <Login onLogin={handleLogin} />
                } />
                
                <Route path="/register" element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : 
                  <Register />
                } />
                
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Dashboard route wrapped in ProtectedRoute */}
                <Route path="/dashboard" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard onLogout={handleLogout} userRole={userRole} />
                  </ProtectedRoute>
                } />
                
                {/* Employees route wrapped in ProtectedRoute */}
                <Route path="/employees" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <EmployeeList onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Profile route wrapped in ProtectedRoute */}
                <Route path="/profile" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <ProfilePage onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Reports route wrapped in ProtectedRoute */}
                <Route path="/reports" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <ReportsPage onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Settings route wrapped in ProtectedRoute */}
                <Route path="/settings" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Settings onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Help route wrapped in ProtectedRoute */}
                <Route path="/help" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <HelpPage onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Leave route wrapped in ProtectedRoute */}
                <Route path="/leave" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <LeavePage onLogout={handleLogout} />
                  </ProtectedRoute>
                } />
                
                {/* Supabase testing route - menggunakan TestProtectedRoute untuk bypass autentikasi */}
                <Route path="/supabase-test" element={
                  <TestProtectedRoute>
                    <SupabaseTestPage />
                  </TestProtectedRoute>
                } />
                
                {/* Supabase debug route */}
                <Route path="/supabase-debug" element={
                  <TestProtectedRoute>
                    <SupabaseDebugPage />
                  </TestProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
            {/* Show settings indicator except on login/register pages */}
            {isAuthenticated && <SettingsIndicator />}
            </div>
          </LeaveProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThrottleProvider>
  );
}

export default App;