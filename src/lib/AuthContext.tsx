import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmail, 
  signOut as authSignOut, 
  getCurrentUser, 
  getCurrentSession,
  User
} from './authService';

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await getCurrentSession();
        setSession(session);
        
        if (session) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err: any) {
        console.error('Error loading auth data:', err);
        setError(err.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, session } = await signInWithEmail({ email, password });
      
      setUser(user);
      setSession(session);
      setLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      throw err;
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      setUser(null);
      setSession(null);
      setLoading(false);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Sign out failed');
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
        clearError
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
