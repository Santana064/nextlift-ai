import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStrengthProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // Group by exercise type
    const strengthData = workouts.reduce((acc: any, w) => {
      if (!acc[w.type]) {
        acc[w.type] = [];
      }
      acc[w.type].push({
        date: w.createdAt,
        reps: w.reps || 0,
        duration: w.duration,
        formScore: w.formScore || 0
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: strengthData
    });
  } catch (error) {
    console.error('Get strength progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Simplified version - achievements aren't in schema
export const getAchievements = async (req: Request, res: Response) => {
  try {
    // Return empty array since achievements aren't in schema
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgressStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const workouts = await prisma.workout.findMany({
      where: { userId }
    });

    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    
    const workoutsWithForm = workouts.filter(w => w.formScore);
    const averageFormScore = workoutsWithForm.length > 0
      ? Math.round(workoutsWithForm.reduce((sum, w) => sum + (w.formScore || 0), 0) / workoutsWithForm.length)
      : 0;

    // Get unique exercise types
    const exerciseTypes = [...new Set(workouts.map(w => w.type))];

    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        averageFormScore,
        exerciseTypes,
        totalExerciseTypes: exerciseTypes.length
      }
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
