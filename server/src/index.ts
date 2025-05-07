import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import statsRoutes from './routes/stats.js';
import userRoutes from './routes/users.js';
import workUnitRoutes from './routes/workUnits.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/work-units', workUnitRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asn-dashboard';

// Flag to indicate if we're running without MongoDB for development
let isRunningWithoutMongoDB = false;

// Try to connect to MongoDB, but if it fails, still start the server for development purposes
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startServer();
  })
  .catch((error: Error) => {
    console.error('Error connecting to MongoDB:', error.message);
    console.warn('WARNING: Starting server without MongoDB connection. API calls requiring database will fail.');
    isRunningWithoutMongoDB = true;
    startServer();
  });

// Function to start the Express server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    if (isRunningWithoutMongoDB) {
      console.log('--------------------------------------------------------');
      console.log('RUNNING IN DEVELOPMENT MODE WITHOUT MONGODB CONNECTION');
      console.log('To use with a database, please:');
      console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('2. OR Create a free MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register');
      console.log('3. Configure MONGO_URI in .env file');
      console.log('--------------------------------------------------------');
    }
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 