import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getStrengthProgress,
  getWorkoutHistory,
  getAchievements,
  getProgressStats
} from '../controllers/progressController';

const router = express.Router();
router.use(authenticateToken);

router.get('/strength', getStrengthProgress);
router.get('/history', getWorkoutHistory);
router.get('/achievements', getAchievements);
router.get('/stats', getProgressStats);

export default router;
