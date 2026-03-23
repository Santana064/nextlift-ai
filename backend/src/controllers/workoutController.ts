import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWorkouts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Failed to get workouts' });
  }
};

export const getWorkoutById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const workout = await prisma.workout.findFirst({
      where: { id, userId }
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ success: true, data: workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Failed to get workout' });
  }
};

export const createWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, exerciseName, reps, sets, weight, duration, calories, formScore, notes } = req.body;
    
    const workout = await prisma.workout.create({
      data: {
        userId,
        type,
        exerciseName,
        reps: reps || 0,
        sets: sets || 0,
        weight: weight ? parseFloat(weight) : null,
        duration,
        calories: calories || 0,
        formScore: formScore || 0,
        notes,
        completedAt: new Date()
      }
    });
    
    let prMessage = '';
    if (weight && reps) {
      const oneRM = weight * (1 + reps / 30);
      const previousPR = await getPersonalRecord(userId, exerciseName || type);
      
      if (!previousPR || oneRM > previousPR) {
        prMessage = `\n\n🏆 NEW PERSONAL RECORD! Estimated 1RM: ${Math.round(oneRM)}kg`;
      }
    }
    
    await updateStreak(userId);
    
    res.json({ 
      success: true, 
      data: workout,
      message: prMessage || 'Workout saved successfully!'
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Failed to create workout' });
  }
};

export const updateWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = req.body;
    
    const workout = await prisma.workout.findFirst({
      where: { id, userId }
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    const updated = await prisma.workout.update({
      where: { id },
      data
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Failed to update workout' });
  }
};

export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const workout = await prisma.workout.findFirst({
      where: { id, userId }
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    await prisma.workout.delete({ where: { id } });
    
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Failed to delete workout' });
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
    
    res.json({ success: true, data: workouts });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ message: 'Failed to get workout history' });
  }
};

export const getWorkoutStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const workouts = await prisma.workout.findMany({
      where: { userId }
    });
    
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const averageFormScore = workouts.length > 0
      ? Math.round(workouts.reduce((sum, w) => sum + (w.formScore || 0), 0) / workouts.length)
      : 0;
    
    const personalRecords = getPersonalRecords(workouts);
    const streak = await getCurrentStreak(userId);
    
    const byType = workouts.reduce((acc: any, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalDuration,
        totalCalories,
        averageFormScore,
        currentStreak: streak,
        workoutsByType: byType,
        personalRecords,
        recentWorkouts: workouts.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({ message: 'Failed to get workout stats' });
  }
};

function calculateOneRM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

async function getPersonalRecord(userId: string, exerciseName: string): Promise<number | null> {
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      exerciseName,
      weight: { not: null }
    }
  });
  
  let maxOneRM = 0;
  for (const w of workouts) {
    if (w.weight && w.reps) {
      const oneRM = calculateOneRM(w.weight, w.reps);
      if (oneRM > maxOneRM) maxOneRM = oneRM;
    }
  }
  
  return maxOneRM > 0 ? maxOneRM : null;
}

function getPersonalRecords(workouts: any[]): any[] {
  const records: Record<string, { weight: number; reps: number; oneRM: number; date: Date }> = {};
  
  for (const w of workouts) {
    if (w.weight && w.reps) {
      const exercise = w.exerciseName || w.type;
      const oneRM = calculateOneRM(w.weight, w.reps);
      
      if (!records[exercise] || oneRM > records[exercise].oneRM) {
        records[exercise] = {
          weight: w.weight,
          reps: w.reps,
          oneRM: oneRM,
          date: w.createdAt
        };
      }
    }
  }
  
  return Object.entries(records).map(([exercise, data]) => ({
    exercise,
    weight: data.weight,
    reps: data.reps,
    oneRM: Math.round(data.oneRM),
    date: data.date
  }));
}

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = await prisma.streak.findFirst({ where: { userId } });
  
  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, count: 1, lastActive: today }
    });
  } else {
    const lastActive = new Date(streak.lastActive);
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak = await prisma.streak.update({
        where: { id: streak.id },
        data: { count: streak.count + 1, lastActive: today }
      });
    } else if (diffDays > 1) {
      streak = await prisma.streak.update({
        where: { id: streak.id },
        data: { count: 1, lastActive: today }
      });
    }
  }
  return streak;
}

async function getCurrentStreak(userId: string) {
  const streak = await prisma.streak.findFirst({ where: { userId } });
  return streak?.count || 0;
}
