import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Export workouts as CSV
export const exportWorkoutsCSV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    let csv = 'Date,Exercise,Reps,Sets,Duration,Calories,Form Score\n';
    
    for (const w of workouts) {
      csv += `${new Date(w.createdAt).toISOString()},`;
      csv += `"${w.exerciseName || w.type}",`;
      csv += `${w.reps || 0},`;
      csv += `${w.sets || 0},`;
      csv += `${w.duration},`;
      csv += `${w.calories || 0},`;
      csv += `${w.formScore || 0}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=workouts.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

// Export nutrition as CSV
export const exportNutritionCSV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    let csv = 'Date,Name,Calories,Protein,Carbs,Fats\n';
    
    for (const m of meals) {
      csv += `${new Date(m.createdAt).toISOString()},`;
      csv += `"${m.name}",`;
      csv += `${m.calories},`;
      csv += `${m.protein},`;
      csv += `${m.carbs},`;
      csv += `${m.fats}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=nutrition.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

// Export as text report
export const exportPDF = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    let report = 'NEXTLIFT AI - Fitness Report\n';
    report += '='.repeat(50) + '\n\n';
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `User: ${user?.name || 'User'}\n\n`;
    
    report += 'WORKOUTS SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    
    report += `Total Workouts: ${totalWorkouts}\n`;
    report += `Total Duration: ${Math.floor(totalDuration / 60)} minutes\n`;
    report += `Total Calories: ${totalCalories}\n\n`;
    
    report += 'RECENT WORKOUTS\n';
    report += '-'.repeat(30) + '\n';
    workouts.slice(0, 10).forEach((w, i) => {
      report += `${i+1}. ${w.exerciseName || w.type} - ${w.reps || 0} reps, ${w.duration}s\n`;
    });
    
    report += '\nNUTRITION SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    report += `Total Meals: ${meals.length}\n`;
    report += `Total Calories: ${meals.reduce((sum, m) => sum + m.calories, 0)}\n\n`;
    
    report += 'RECENT MEALS\n';
    report += '-'.repeat(30) + '\n';
    meals.slice(0, 10).forEach((m, i) => {
      report += `${i+1}. ${m.name} - ${m.calories} kcal\n`;
    });
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=fitness-report.txt');
    res.send(report);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export report' });
  }
};
