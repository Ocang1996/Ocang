import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import WorkUnit from '../models/WorkUnit.js';

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asn-dashboard';

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Administrator',
    role: 'superadmin'
  },
  {
    username: 'kepegawaian',
    password: 'kepegawaian123',
    email: 'kepegawaian@example.com',
    name: 'Staff Kepegawaian',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    name: 'Pengguna Biasa',
    role: 'user'
  }
];

// Sample work units
const workUnits = [
  {
    name: 'Sekretariat Utama',
    code: 'SEKUT',
    description: 'Sekretariat Utama Instansi',
    level: 1,
    isActive: true
  },
  {
    name: 'Deputi Bidang Strategi',
    code: 'DPSTR',
    description: 'Deputi Bidang Strategi dan Kebijakan',
    level: 1,
    isActive: true
  },
  {
    name: 'Deputi Bidang Kebijakan',
    code: 'DPKEB',
    description: 'Deputi Bidang Kebijakan',
    level: 1,
    isActive: true
  }
];

// Function to generate random employees
const generateEmployees = (count: number, workUnitIds: mongoose.Types.ObjectId[]) => {
  const employees = [];
  const employeeTypes = ['pns', 'p3k', 'nonAsn'];
  const genders = ['male', 'female'];
  const educationLevels = ['sd', 'smp', 'sma', 'd1', 'd2', 'd3', 'd4', 's1', 's2', 's3'];
  const ranks = ['I/a', 'I/b', 'I/c', 'I/d', 'II/a', 'II/b', 'II/c', 'II/d', 'III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e'];
  const positions = ['Staff', 'Kepala Seksi', 'Kepala Bidang', 'Kepala Bagian', 'Direktur', 'Kepala Biro', 'Deputi', 'Sekretaris Utama'];
  const status = ['active', 'inactive', 'pending'];
  
  // Generate random date between start and end
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  for (let i = 0; i < count; i++) {
    const birthDate = randomDate(new Date(1960, 0, 1), new Date(2000, 0, 1));
    const joinDate = randomDate(new Date(2000, 0, 1), new Date());
    
    // Calculate retirement date (58 or 60 years from birth depending on position)
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const retirementAge = ['Direktur', 'Kepala Biro', 'Deputi', 'Sekretaris Utama'].includes(randomPosition) ? 60 : 58;
    const retirementDate = new Date(
      birthDate.getFullYear() + retirementAge,
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    employees.push({
      nip: `19${Math.floor(Math.random() * 99).toString().padStart(2, '0')}${Math.floor(Math.random() * 12).toString().padStart(2, '0')}${Math.floor(Math.random() * 28).toString().padStart(2, '0')}${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
      name: `Pegawai ${i + 1}`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      birthDate,
      joinDate,
      employeeType: employeeTypes[Math.floor(Math.random() * employeeTypes.length)],
      workUnit: workUnitIds[Math.floor(Math.random() * workUnitIds.length)].toString(),
      position: randomPosition,
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      educationLevel: educationLevels[Math.floor(Math.random() * educationLevels.length)],
      retirementDate,
      status: status[Math.floor(Math.random() * status.length)]
    });
  }
  
  return employees;
};

// Import data function
async function importData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await WorkUnit.deleteMany({});
    await Employee.deleteMany({});
    console.log('Cleared existing data');
    
    // Import users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Imported ${createdUsers.length} users`);
    
    // Import work units
    const createdWorkUnits = await WorkUnit.create(workUnits);
    console.log(`Imported ${createdWorkUnits.length} work units`);
    
    // Generate and import employees
    const workUnitIds = createdWorkUnits.map(unit => unit._id);
    const employees = generateEmployees(100, workUnitIds);
    const createdEmployees = await Employee.create(employees);
    console.log(`Generated and imported ${createdEmployees.length} employees`);
    
    console.log('Data import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Data import failed:', error);
    process.exit(1);
  }
}

// Run the import
importData(); 