import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user with their workouts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workouts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workouts = user.workouts || [];
    
    // Calculate basic stats
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    
    // Average form score
    const workoutsWithForm = workouts.filter(w => w.formScore);
    const averageFormScore = workoutsWithForm.length > 0
      ? Math.round(workoutsWithForm.reduce((sum, w) => sum + (w.formScore || 0), 0) / workoutsWithForm.length)
      : 0;

    // Workouts by exercise type
    const workoutsByType = workouts.reduce((acc: any, w) => {
      const type = w.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = workouts.filter(w => 
      new Date(w.createdAt) >= thirtyDaysAgo
    );

    // Calculate streak
    let currentStreak = 0;
    if (workouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Sort workouts by date
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Check if there's a workout today or yesterday
      const lastWorkout = new Date(sortedWorkouts[0].createdAt);
      lastWorkout.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak = 1;
        
        // Count consecutive days
        let currentDate = new Date(lastWorkout);
        for (let i = 1; i < sortedWorkouts.length; i++) {
          const workoutDate = new Date(sortedWorkouts[i].createdAt);
          workoutDate.setHours(0, 0, 0, 0);
          
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          
          if (workoutDate.getTime() === prevDate.getTime()) {
            currentStreak++;
            currentDate = new Date(workoutDate);
          } else {
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalWorkouts,
          totalMinutes,
          totalCalories,
          averageFormScore,
          currentStreak,
          workoutsThisMonth: recentWorkouts.length
        },
        workoutsByType,
        recentWorkouts: recentWorkouts.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkoutAnalytics = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const userId = (req as any).user.id;

    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId
      }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Get previous workouts of same type for comparison
    const previousWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        type: workout.type,
        id: { not: workoutId },
        createdAt: { lt: workout.createdAt }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        current: workout,
        previous: previousWorkouts,
        comparison: {
          betterThanLast: previousWorkouts.length > 0 
            ? (workout.formScore || 0) > (previousWorkouts[0]?.formScore || 0)
            : null,
          improvement: previousWorkouts.length > 0
            ? ((workout.formScore || 0) - (previousWorkouts[0]?.formScore || 0))
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get workout analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgressAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { exerciseType, period = '30days' } = req.query;

    let days = 30;
    if (period === '7days') days = 7;
    if (period === '90days') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        ...(exerciseType ? { type: exerciseType as string } : {}),
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date for chart data
    const chartData = workouts.reduce((acc: any[], w) => {
      const date = new Date(w.createdAt).toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      
      if (existing) {
        existing.formScore = Math.round((existing.formScore + (w.formScore || 0)) / 2);
        existing.calories += w.calories || 0;
        existing.duration += w.duration;
        existing.reps += w.reps || 0;
      } else {
        acc.push({
          date,
          formScore: w.formScore || 0,
          calories: w.calories || 0,
          duration: w.duration,
          reps: w.reps || 0
        });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        chartData,
        summary: {
          totalWorkouts: workouts.length,
          averageFormScore: workouts.length > 0
            ? Math.round(workouts.reduce((sum, w) => sum + (w.formScore || 0), 0) / workouts.length)
            : 0,
          totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
          totalMinutes: workouts.reduce((sum, w) => sum + w.duration, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
