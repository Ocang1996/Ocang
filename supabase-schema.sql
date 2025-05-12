-- Supabase Schema for ASN Dashboard Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This triggers creation of auth.users automatically
-- Trigger for creating user profile on auth registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role'::text);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Users table (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS) for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Work Units table
CREATE TABLE public.work_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.work_units(id),
  level INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for work_units
ALTER TABLE public.work_units ENABLE ROW LEVEL SECURITY;

-- Policies for work_units table
CREATE POLICY "Anyone can view work units" ON public.work_units
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage work units" ON public.work_units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Employees table (ASN)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nip TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  rank TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan')),
  birth_date DATE,
  education TEXT,
  join_date DATE,
  work_unit_id UUID REFERENCES public.work_units(id),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees table
CREATE POLICY "Anyone can view employees" ON public.employees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Storage bucket for employee photos and other files
CREATE POLICY "Public Access to Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can update their assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can delete their assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.role() = 'authenticated');
