// Kita akan menggunakan definisi tipe untuk Supabase tanpa perlu mengimpor library
// Ini memungkinkan kode berjalan meskipun package belum diinstal

// Definisi tipe untuk Supabase Client
export interface SupabaseClient {
  from: (table: string) => any;
  auth: {
    signUp: (options: any) => Promise<any>;
    signInWithPassword: (credentials: any) => Promise<any>;
    signOut: () => Promise<any>;
    getSession: () => Promise<any>;
    resetPasswordForEmail: (email: string, options?: any) => Promise<any>;
    updateUser: (attributes: any) => Promise<any>;
  };
  storage: {
    from: (bucket: string) => any;
  };
  rpc: (functionName: string, params?: any) => Promise<{ data: any; error: any }>;
}

// Ambil environment variables dari .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key-for-testing';

// Perbaikan: Buat fungsi singleton untuk Supabase client dengan penanganan error yang lebih baik
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase;
  }

    try {
    // Log untuk debugging
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    
    // Cek apakah window.supabase tersedia (loaded from CDN)
    if (typeof window !== 'undefined' && (window as any).supabase) {
          const { createClient } = (window as any).supabase;
          _supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase client initialized from window.supabase');
      return _supabase;
    }
    
    // Jika tidak tersedia, gunakan mock client
    console.warn('Using mock Supabase client. Functionality will be limited.');
          _supabase = createMockClient();
          
    // Coba load dari CDN untuk penggunaan berikutnya
          if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.onload = () => {
        try {
              const { createClient } = (window as any).supabase;
              _supabase = createClient(supabaseUrl, supabaseAnonKey);
          console.log('Supabase client loaded and initialized from CDN');
        } catch (e) {
          console.error('Error creating Supabase client after CDN load:', e);
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load Supabase client from CDN:', e);
      };
      document.head.appendChild(script);
      }
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      _supabase = createMockClient();
  }
  
  // Memastikan _supabase tidak null
  return _supabase as SupabaseClient;
}

// Buat mock client untuk fallback (dibuat lebih sederhana dan handal)
function createMockClient(): SupabaseClient {
  console.log('Creating mock Supabase client');
  
  const mockResponse = (data: any = null) => Promise.resolve({ 
      data,
    error: null 
  });
  
  const mockQueryBuilder = {
    eq: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    offset: () => mockQueryBuilder,
    range: () => mockResponse([]),
    single: () => mockResponse(null),
    then: (callback: Function) => callback(mockResponse([]))
  };
  
  return {
    from: () => ({
      select: () => mockQueryBuilder,
      insert: () => ({
        select: () => ({
          single: () => mockResponse(null)
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => mockResponse(null)
          })
        })
      }),
      delete: () => ({
        eq: () => mockResponse(null)
      })
    }),
    auth: {
      signUp: () => mockResponse({ user: null, session: null }),
      signInWithPassword: () => mockResponse({ user: null, session: null }),
      signOut: () => mockResponse(null),
      getSession: () => mockResponse({ session: null }),
      resetPasswordForEmail: () => mockResponse(null),
      updateUser: () => mockResponse({ user: null })
    },
    storage: {
      from: () => ({
        upload: () => mockResponse(null),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    rpc: (functionName: string, params?: any) => {
      console.log(`Mock RPC called: ${functionName}`, params);
      return mockResponse(null);
    }
  };
}

// Ekspor instance Supabase client
export const supabase = getSupabaseClient();

// Tipe data untuk tabel users
export type UserRole = 'superadmin' | 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

// Tipe data untuk tabel employees (ASN)
export interface Employee {
  id: string;
  nip: string;
  name: string;
  position: string;
  department: string;
  rank: string;
  status: string;
  gender?: string;
  birth_date?: string;
  education?: string;
  join_date?: string;
  work_unit_id?: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

// Tipe data untuk tabel work_units
export interface WorkUnit {
  id: string;
  name: string;
  code: string;
  parent_id?: string;
  level: number;
  description?: string;
  created_at: string;
  updated_at?: string;
}
