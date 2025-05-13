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