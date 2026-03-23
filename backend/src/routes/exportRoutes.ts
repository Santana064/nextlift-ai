import { authenticateToken } from '../middleware/auth';
import express from 'express';
import { exportWorkoutsCSV, exportNutritionCSV, exportPDF } from '../controllers/exportController';

const router = express.Router();
router.use(authenticateToken);

router.get('/workouts/csv', exportWorkoutsCSV);
router.get('/nutrition/csv', exportNutritionCSV);
router.get('/pdf', exportPDF);

export default router;
