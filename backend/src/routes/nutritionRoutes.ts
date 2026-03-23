import { authenticateToken } from '../middleware/auth';
import express from 'express';
import {
  getTodayMeals,
  addMeal,
  deleteMeal,
  getTodayWater,
  addWater,
  resetWater
} from '../controllers/nutritionController';

const router = express.Router();
router.use(authenticateToken);

// Meal routes
router.get('/meals/today', getTodayMeals);
router.post('/meals', addMeal);
router.delete('/meals/:id', deleteMeal);

// Water routes
router.get('/water/today', getTodayWater);
router.post('/water', addWater);
router.delete('/water/reset', resetWater);

export default router;
