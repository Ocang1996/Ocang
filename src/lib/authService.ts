import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLogin?: string;
  createdAt?: string;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(credentials: LoginCredentials): Promise<{ user: User | null; session: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    // Get user profile data if successfully signed in
    let user = null;
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        user = profileData as User;
        
        // Update last login time
        await supabase
          .from('users')
          .update({ lastLogin: new Date().toISOString() })
          .eq('id', data.user.id);
      }
    }

    return {
      user,
      session: data.session
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Sign up new user
 */
export async function signUp(userData: SignupData): Promise<{ user: User | null; session: any }> {
  try {
    // First create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        }
      }
    });

    if (error) throw error;

    // Create user profile record
    if (data.user) {
      const now = new Date().toISOString();
      const userProfile = {
        id: data.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        createdAt: now,
        updatedAt: now
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { user: null, session: data.session };
      }

      return {
        user: profileData as User,
        session: data.session
      };
    }

    return { user: null, session: data.session };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    throw error;
  }
}

/**
 * Get current user with profile data
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) return null;

    // Get user profile data
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Request password reset
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

/**
 * Get user login notifications/history
 */
export async function getUserLoginHistory(userId: string, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('userId', userId)
      .order('loginTime', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching login history:', error);
    throw error;
  }
}
