import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserAnalytics,
  getWorkoutAnalytics,
  getProgressAnalytics
} from '../controllers/analyticsController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/user', getUserAnalytics);
router.get('/workout/:workoutId', getWorkoutAnalytics);
router.get('/progress', getProgressAnalytics);

export default router;
