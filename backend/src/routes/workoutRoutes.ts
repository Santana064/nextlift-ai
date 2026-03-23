import { authenticateToken } from '../middleware/auth';
import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutHistory,
  getWorkoutStats
} from '../controllers/workoutController';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getWorkouts);
router.get('/history', getWorkoutHistory);
router.get('/stats', getWorkoutStats);
router.get('/:id', getWorkoutById);
router.post('/', createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
