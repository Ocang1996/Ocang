import { supabase, User, UserRole } from './supabase';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User | null;
  token?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/**
 * Service untuk autentikasi menggunakan Supabase
 */
export const authService = {
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Login dengan Supabase Auth
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      // Dapatkan data user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Coba lagi dengan menggunakan user ID dari auth
        const { data: userData2, error: userError2 } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user?.id)
          .single();

        if (userError2) {
          throw new Error('Gagal mendapatkan data pengguna');
        }

        return {
          success: true,
          message: 'Login berhasil',
          user: userData2 as User,
          token: authData.session?.access_token,
        };
      }

      return {
        success: true,
        message: 'Login berhasil',
        user: userData as User,
        token: authData.session?.access_token,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login gagal. Periksa email dan password Anda.',
      };
    }
  },

  /**
   * Register user baru
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Default role adalah 'user' jika tidak disebutkan
      const role = data.role || 'user';

      // Register user melalui Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            name: data.name,
            role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Pendaftaran gagal: Tidak dapat membuat user');
      }

      // Verifikasi apakah user sudah terdaftar di tabel users
      // Jika trigger tidak berjalan dengan baik, kita buat manual
      const { data: userData, error: getUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      // Jika user belum ada di tabel users, buat secara manual
      if (getUserError || !userData) {
        // Buat record di table 'users'
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id,
          username: data.username,
          email: data.email,
          name: data.name,
          role,
        });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw new Error(`Gagal membuat profil pengguna: ${insertError.message}`);
        }
      }

      return {
        success: true,
        message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.',
        user: {
          id: authData.user.id,
          username: data.username,
          email: data.email,
          name: data.name,
          role,
          created_at: new Date().toISOString()
        } as User
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle error yang umum terjadi
      if (error.message && error.message.includes('duplicate key')) {
        if (error.message.includes('username')) {
          return {
            success: false,
            message: 'Username sudah digunakan.',
          };
        } else if (error.message.includes('email')) {
          return {
            success: false,
            message: 'Email sudah terdaftar.',
          };
        }
      }
      
      return {
        success: false,
        message: error.message || 'Pendaftaran gagal. Silakan coba lagi.',
      };
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Logout berhasil',
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || 'Logout gagal',
      };
    }
  },

  /**
   * Reset password (Forgot Password)
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Link reset password telah dikirim ke email Anda.',
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Gagal mengirim permintaan reset password.',
      };
    }
  },

  /**
   * Reset password dengan token
   */
  async resetPassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Password berhasil diubah. Silakan login dengan password baru Anda.',
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Gagal mengubah password.',
      };
    }
  },

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        return null;
      }
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', sessionData.session.user.email)
        .single();
        
      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
      
      return userData as User;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
};

export default authService;
