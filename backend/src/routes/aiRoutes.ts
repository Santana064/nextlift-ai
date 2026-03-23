import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  generateWorkoutPlan,
  analyzeForm,
  getCoachingAdvice,
  generateNutritionPlan
} from '../controllers/aiController';

const router = express.Router();
router.use(authenticateToken);

router.post('/generate-workout', generateWorkoutPlan);
router.post('/analyze-form', analyzeForm);
router.post('/coaching-advice', getCoachingAdvice);
router.post('/nutrition-plan', generateNutritionPlan);

export default router;
