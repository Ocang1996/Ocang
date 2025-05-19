import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmail, 
  signOut as authSignOut, 
  getCurrentUser, 
  getCurrentSession,
  User
} from './authService';
import { supabase } from './supabase';

// Definisikan tipe untuk auth events
type AuthChangeEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED';

// Definisikan tipe untuk session
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk refresh session
  const refreshSession = async () => {
      try {
      console.log('Refreshing auth session...');
      setLoading(true);
      
        const session = await getCurrentSession();
        setSession(session);
        
        if (session) {
          const userData = await getCurrentUser();
          setUser(userData);
        console.log('Session refreshed successfully');
      } else {
        console.log('No active session found during refresh');
        setUser(null);
      }
      
      setError(null);
      } catch (err: any) {
      console.error('Error refreshing session:', err);
      // Jangan set error, karena ini bisa terjadi saat refresh normal
      // Dan akan menyebabkan UI menampilkan error yang tidak perlu
    } finally {
      setLoading(false);
    }
  };

  // Setup listener untuk perubahan auth state
  useEffect(() => {
    // Gunakan solusi alternatif untuk menangani autentikasi
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (currentSession) {
          const userData = await getCurrentUser();
          setUser(userData);
          setSession(currentSession);
        }
      } catch (err) {
        console.error('Error checking initial session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Load initial session data
    checkSession();

    // Set up interval untuk check session (sebagai pengganti onAuthStateChange)
    const interval = setInterval(refreshSession, 5 * 60 * 1000); // check setiap 5 menit

    // Cleanup interval
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, session } = await signInWithEmail({ email, password });
      
      setUser(user);
      setSession(session);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      // Reset state setelah logout
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signIn,
        signOut,
        clearError,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
