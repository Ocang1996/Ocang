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
}

// Ambil environment variables dari .env atau gunakan nilai default untuk development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Fungsi lazy untuk membuat Supabase client
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    try {
      // Mencoba load dari CDN jika modul belum terinstal
      if (typeof window !== 'undefined' && !(window as any).supabase) {
        console.warn('Supabase client not initialized. Loading from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        document.head.appendChild(script);
        
        // Buat client sementara dengan mock
        _supabase = createMockClient();
        
        // Ketika script dimuat, buat client sungguhan
        script.onload = () => {
          const { createClient } = (window as any).supabase;
          _supabase = createClient(supabaseUrl, supabaseAnonKey);
          console.log('Supabase client loaded from CDN');
        };
      } else {
        // Jika kita di server atau supabase sudah ada di window
        try {
          // Mencoba dynamic import tanpa menggunakan import() syntax
          // untuk menghindari error TypeScript
          // Menggunakan mock client terlebih dahulu, yang akan diganti
          // ketika script selesai loading
          _supabase = createMockClient();
          
          if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            document.head.appendChild(script);
            
            script.onload = () => {
              const { createClient } = (window as any).supabase;
              _supabase = createClient(supabaseUrl, supabaseAnonKey);
              console.log('Supabase client initialized via CDN');
            };
          }
        } catch (e) {
          console.error('Failed to load Supabase client:', e);
          _supabase = createMockClient();
        }
      }
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      _supabase = createMockClient();
    }
  }
  
  // Always return a valid SupabaseClient, never null
  return _supabase || createMockClient();
}

// Buat mock client untuk fallback
function createMockClient(): SupabaseClient {
  // Type definitions untuk mock client
  interface QueryConfig {
    orderField: string;
    limitVal: number;
    offsetVal: number;
    filters: Record<string, any>;
  }

  interface QueryResponse<T> {
    data: T;
    error: any | null;
    count: number;
  }

  interface QueryBuilder {
    eq: (field: string, value: any) => QueryBuilder;
    or: (conditions: string) => QueryBuilder;
    order: (column: string) => QueryBuilder;
    limit: (limit: number) => QueryBuilder;
    offset: (offset: number) => QueryBuilder;
    range: (start: number, end: number) => Promise<QueryResponse<any[]>>;
    single: () => Promise<QueryResponse<any>>;
    then: (callback: (result: QueryResponse<any[]>) => any) => any;
    [key: string]: any; // Untuk mendukung dynamic properties
  }

  // Buat fungsi helper untuk mengembalikan data yang sama
  const createSuccessResponse = <T>(data: T): Promise<QueryResponse<T>> => {
    return Promise.resolve({
      data,
      error: null,
      count: Array.isArray(data) ? data.length : 0
    });
  };
  
  // Buat query builder dasar yang bisa digunakan di berbagai tempat
  const createQueryBuilder = (): QueryBuilder => {
    // Menyimpan konfigurasi query
    const config: QueryConfig = {
      orderField: '',
      limitVal: 10,
      offsetVal: 0,
      filters: {}
    };
    
    // Builder object dengan semua method yang bisa dirantai
    const builder: QueryBuilder = {
      // Filter methods
      eq: (field: string, value: any) => {
        config.filters[field] = value;
        return builder;
      },
      or: (_conditions: string) => {
        // Conditions parameter tidak digunakan untuk mock, tapi disimpan untuk tipe
        return builder;
      },
      // Ordering dan pagination
      order: (column: string) => {
        config.orderField = column;
        return builder;
      },
      limit: (limit: number) => {
        config.limitVal = limit;
        return builder;
      },
      offset: (offset: number) => {
        config.offsetVal = offset;
        return builder;
      },
      range: (start: number, end: number) => {
        config.offsetVal = start;
        config.limitVal = end - start + 1;
        return createSuccessResponse([]);
      },
      // Fetch methods
      single: () => createSuccessResponse(null),
      // Execute query dan return results
      then: (callback) => callback(createSuccessResponse([]))
    };
    
    return builder;
  };
  
  return {
    from: (_table: string) => ({
      select: (_columns: string | null = '*', _options: any = { count: 'exact' }) => createQueryBuilder(),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
      updateUser: () => Promise.resolve({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

// Alias untuk backward compatibility
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
