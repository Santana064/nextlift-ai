import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      }
    });
    
    const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
    
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: [userId, ...friendIds] }
      },
      include: {
        user: {
          select: { id: true, name: true }
        },
        likes: true,
        comments: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Failed to get feed' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content, workoutId } = req.body;
    
    const post = await prisma.post.create({
      data: {
        userId,
        content,
        workoutId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
    
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });
    
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ success: true, liked: false });
    } else {
      await prisma.like.create({
        data: { userId, postId }
      });
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    const { content } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
    
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        friend: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    const friends = friendships.map(f => 
      f.userId === userId ? f.friend : f.user
    );
    
    res.json({ success: true, data: friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Failed to get friends' });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { friendId } = req.body;
    
    if (userId === friendId) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }
    
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: 'PENDING'
      }
    });
    
    res.status(201).json({ success: true, data: friendship });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { friendshipId } = req.params;
    
    const friendship = await prisma.friendship.findFirst({
      where: { id: friendshipId, friendId: userId, status: 'PENDING' }
    });
    
    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const requests = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Failed to get friend requests' });
  }
};

export const shareWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { workoutId, content } = req.body;
    
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId }
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    const post = await prisma.post.create({
      data: {
        userId,
        content: content || `Just completed ${workout.exerciseName || workout.type} workout! 🔥`,
        workoutId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Share workout error:', error);
    res.status(500).json({ message: 'Failed to share workout' });
  }
};
