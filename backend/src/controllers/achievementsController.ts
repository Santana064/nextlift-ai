import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get user stats
    const workouts = await prisma.workout.findMany({ where: { userId } });
    const meals = await prisma.meal.findMany({ where: { userId } });
    
    // Use findFirst instead of findUnique - THIS IS THE FIX
    const streak = await prisma.streak.findFirst({ where: { userId } });
    
    const workoutCount = workouts.length;
    const currentStreak = streak?.count || 0;
    const maxFormScore = Math.max(...workouts.map(w => w.formScore || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const mealCount = meals.length;
    const uniqueMealDays = new Set(meals.map(m => new Date(m.date).toDateString())).size;
    
    const allAchievements = [
      { id: 'first_workout', name: 'First Steps', description: 'Complete your first workout', icon: '🎯', unlocked: workoutCount >= 1 },
      { id: 'workout_10', name: 'Getting Serious', description: 'Complete 10 workouts', icon: '💪', unlocked: workoutCount >= 10 },
      { id: 'workout_50', name: 'Workout Warrior', description: 'Complete 50 workouts', icon: '⚔️', unlocked: workoutCount >= 50 },
      { id: 'workout_100', name: 'Century Club', description: 'Complete 100 workouts', icon: '🏆', unlocked: workoutCount >= 100 },
      { id: 'streak_7', name: 'Weekly Warrior', description: '7 day streak', icon: '🔥', unlocked: currentStreak >= 7 },
      { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '🌟', unlocked: currentStreak >= 30 },
      { id: 'form_master', name: 'Form Master', description: 'Achieve 90% form score', icon: '🎯', unlocked: maxFormScore >= 90 },
      { id: 'calorie_burner', name: 'Calorie Burner', description: 'Burn 5000 calories total', icon: '🔥', unlocked: totalCalories >= 5000 },
      { id: 'first_meal', name: 'Fuel Up', description: 'Log your first meal', icon: '🍽️', unlocked: mealCount >= 1 },
      { id: 'nutrition_30', name: 'Nutrition Tracker', description: 'Log meals for 30 days', icon: '🥗', unlocked: uniqueMealDays >= 30 }
    ];
    
    res.json({ success: true, data: allAchievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Failed to get achievements' });
  }
};
