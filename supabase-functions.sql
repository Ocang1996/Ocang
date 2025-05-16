-- Fungsi untuk mengeksekusi SQL
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Berikan izin kepada authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- Fungsi untuk memeriksa apakah tabel ada
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;

-- Berikan izin kepada authenticated users
GRANT EXECUTE ON FUNCTION public.check_table_exists TO authenticated;

-- Fungsi untuk memeriksa apakah kolom ada
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;

-- Berikan izin kepada authenticated users
GRANT EXECUTE ON FUNCTION public.check_column_exists TO authenticated;

-- Function to create employees table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_employees_table_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if employees table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'employees'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it
  IF NOT table_exists THEN
    -- Create employees table
    CREATE TABLE public.employees (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nip TEXT,
      name TEXT NOT NULL,
      gender TEXT CHECK (gender IN ('male', 'female')),
      birthDate DATE,
      employeeType TEXT CHECK (employeeType IN ('pns', 'pppk', 'honorer')),
      joinDate DATE,
      appointmentDate DATE,
      workUnit TEXT NOT NULL,
      subUnit TEXT,
      position TEXT NOT NULL,
      rank TEXT,
      class TEXT,
      positionHistory TEXT,
      jobType TEXT,
      educationLevel TEXT,
      educationMajor TEXT,
      educationInstitution TEXT,
      graduationYear TEXT,
      email TEXT,
      phoneNumber TEXT,
      address TEXT,
      photo TEXT,
      notes TEXT,
      status TEXT DEFAULT 'active',
      createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
      updatedAt TIMESTAMPTZ DEFAULT now()
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_employees_nip ON public.employees(nip);
    CREATE INDEX idx_employees_name ON public.employees(name);
    CREATE INDEX idx_employees_workunit ON public.employees(workUnit);
    
    -- Enable RLS on the employees table
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
    
    -- Add RLS policies
    CREATE POLICY "Anyone can view employees" ON public.employees
      FOR SELECT USING (true);
    
    CREATE POLICY "Authenticated users can create employees" ON public.employees
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can update employees" ON public.employees
      FOR UPDATE USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can delete employees" ON public.employees
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
  
  RETURN true;
END;
$$;

-- Function to fix RLS permissions on the employees table
CREATE OR REPLACE FUNCTION public.fix_employee_rls_permissions()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if employees table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'employees'
  ) INTO table_exists;
  
  -- If table exists, fix RLS policies
  IF table_exists THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view employees" ON public.employees;
    DROP POLICY IF EXISTS "Authenticated users can create employees" ON public.employees;
    DROP POLICY IF EXISTS "Authenticated users can update employees" ON public.employees;
    DROP POLICY IF EXISTS "Authenticated users can delete employees" ON public.employees;
    
    -- Enable RLS on the employees table (in case it's disabled)
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
    
    -- Add RLS policies
    CREATE POLICY "Anyone can view employees" ON public.employees
      FOR SELECT USING (true);
    
    CREATE POLICY "Authenticated users can create employees" ON public.employees
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can update employees" ON public.employees
      FOR UPDATE USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can delete employees" ON public.employees
      FOR DELETE USING (auth.role() = 'authenticated');
  ELSE
    -- If table doesn't exist, create it using the other function
    PERFORM public.create_employees_table_if_not_exists();
  END IF;
  
  RETURN true;
END;
$$; 