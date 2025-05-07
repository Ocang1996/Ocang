import express from 'express';
import {
  getOverviewStats,
  getEmployeeTypeStats,
  getGenderDistributionStats,
  getAgeDistributionStats,
  getWorkUnitDistributionStats,
  getRetirementPredictionStats,
  getEducationLevelStats,
  getRankDistributionStats,
  getPositionDistributionStats,
  getRetirementBupStats
} from '../controllers/statsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all stats routes
router.use(authMiddleware);

// Overview statistics
router.get('/overview', getOverviewStats);

// Employee type distribution
router.get('/employee-types', getEmployeeTypeStats);

// Gender distribution
router.get('/gender-distribution', getGenderDistributionStats);

// Age distribution
router.get('/age-distribution', getAgeDistributionStats);

// Work unit distribution
router.get('/work-unit-distribution', getWorkUnitDistributionStats);

// Retirement prediction
router.get('/retirement-prediction', getRetirementPredictionStats);

// Education levels
router.get('/education-levels', getEducationLevelStats);

// Rank distribution
router.get('/rank-distribution', getRankDistributionStats);

// Position distribution
router.get('/position-distribution', getPositionDistributionStats);

// Retirement BUP
router.get('/retirement-bup', getRetirementBupStats);

export default router; 