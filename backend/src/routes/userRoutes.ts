import express from 'express';
import { getUserProfile, getUserStats, updateUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.get('/stats', getUserStats);
router.put('/profile', updateUserProfile);

export default router;
