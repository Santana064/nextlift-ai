import { authenticateToken } from '../middleware/auth';
import express from 'express';
import { getUserAchievements } from '../controllers/achievementsController';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getUserAchievements);

export default router;
