import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getFeed,
  createPost,
  likePost,
  addComment,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest
} from '../controllers/socialController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Post routes
router.get('/feed', getFeed);
router.post('/posts', createPost);
router.post('/posts/:postId/like', likePost);
router.post('/posts/:postId/comments', addComment);

// Friend routes
router.get('/friends', getFriends);
router.post('/friends/request', sendFriendRequest);
router.put('/friends/request/:friendshipId/accept', acceptFriendRequest);

export default router;
