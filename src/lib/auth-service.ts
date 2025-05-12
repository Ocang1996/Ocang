import { supabase, User, UserRole } from './supabase';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User | null;
  token?: string;
}

interface RegisterData {
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
   * Login dengan email dan password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Ambil data profile user dari table profiles
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      return {
        success: true,
        message: 'Login berhasil',
        user: userData as User,
        token: data.session?.access_token,
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
      const { error: signUpError } = await supabase.auth.signUp({
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

      // Buat record di table 'users'
      const { error: insertError } = await supabase.from('users').insert({
        username: data.username,
        email: data.email,
        name: data.name,
        role,
      });

      if (insertError) {
        throw insertError;
      }

      return {
        success: true,
        message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle error yang umum terjadi
      if (error.message.includes('duplicate key')) {
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
   * Logout
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
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
