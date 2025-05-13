// Script untuk menerapkan skema SQL ke Supabase
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Baca variabel lingkungan (tempatkan di .env atau isi langsung di sini)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'; // Gunakan SERVICE_ROLE key untuk operasi skema

// Buat client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Baca file skema SQL
const schemaSQL = fs.readFileSync('./supabase-schema.sql', 'utf8');

// Fungsi untuk menjalankan SQL
async function runSQL() {
  try {
    console.log('Applying schema to Supabase...');
    
    // Pecah SQL menjadi pernyataan terpisah
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Jalankan setiap pernyataan SQL
    for (const sql of statements) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: sql + ';' });
      
      if (error) {
        console.error('Error executing SQL:', error);
      }
    }
    
    console.log('Schema applied successfully!');
  } catch (error) {
    console.error('Failed to apply schema:', error);
  }
}

// Jalankan fungsi
runSQL(); 