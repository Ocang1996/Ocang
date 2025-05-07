import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import WorkUnit from '../models/WorkUnit.js';

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asn-dashboard';

// Clear data function
async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Count records before deletion
    const userCount = await User.countDocuments();
    const workUnitCount = await WorkUnit.countDocuments();
    const employeeCount = await Employee.countDocuments();
    
    console.log('Current database records:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Work Units: ${workUnitCount}`);
    console.log(`- Employees: ${employeeCount}`);
    
    // Prompt for confirmation
    console.log('\nWARNING: This operation will remove ALL data from the database.');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clear all collections
    await User.deleteMany({});
    await WorkUnit.deleteMany({});
    await Employee.deleteMany({});
    
    console.log('\nAll data has been removed from the database');
    
    // Keep one admin user
    await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      name: 'Administrator',
      role: 'superadmin'
    });
    console.log('Created default admin user: admin / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

// Run the clear data operation
clearData(); 