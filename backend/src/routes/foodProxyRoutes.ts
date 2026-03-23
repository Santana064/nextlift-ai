import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { searchFoods, searchWorldwide } from '../controllers/foodProxyController';

const router = express.Router();
router.use(authenticateToken);

router.get('/search', searchFoods);
router.get('/search-worldwide', searchWorldwide);

export default router;
