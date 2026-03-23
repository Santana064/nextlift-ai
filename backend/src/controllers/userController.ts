import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workouts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const averageFormScore = workouts.length > 0
      ? Math.round(workouts.reduce((sum, w) => sum + (w.formScore || 0), 0) / workouts.length)
      : 0;

    // Calculate streak (simplified)
    let currentStreak = 0;
    if (workouts.length > 0) {
      const today = new Date();
      const lastWorkout = new Date(workouts[0].createdAt);
      const diffDays = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) currentStreak = 1;
    }

    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalDuration,
        totalCalories,
        averageFormScore,
        currentStreak,
        workoutCount: workouts.length
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
