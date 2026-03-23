import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodayMeals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: { gte: today }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ message: 'Failed to get meals' });
  }
};

export const addMeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, calories, protein, carbs, fats, mealType, brand, source } = req.body;
    
    const meal = await prisma.meal.create({
      data: {
        userId,
        name,
        calories,
        protein,
        carbs,
        fats,
        mealType,
        brand,
        source,
        date: new Date()
      }
    });
    
    res.json({ success: true, data: meal });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ message: 'Failed to add meal' });
  }
};

export const deleteMeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const meal = await prisma.meal.findFirst({
      where: { id, userId }
    });
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    await prisma.meal.delete({ where: { id } });
    
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Failed to delete meal' });
  }
};

export const getTodayWater = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await prisma.waterEntry.findMany({
      where: {
        userId,
        date: { gte: today }
      }
    });
    
    const totalGlasses = entries.reduce((sum: number, e: any) => sum + e.amount, 0);
    
    res.json({ success: true, data: { total: totalGlasses, entries } });
  } catch (error) {
    console.error('Get water error:', error);
    res.status(500).json({ message: 'Failed to get water intake' });
  }
};

export const addWater = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount = 1 } = req.body;
    
    const entry = await prisma.waterEntry.create({
      data: {
        userId,
        amount,
        date: new Date()
      }
    });
    
    res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({ message: 'Failed to add water intake' });
  }
};

export const resetWater = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.waterEntry.deleteMany({
      where: {
        userId,
        date: { gte: today }
      }
    });
    
    res.json({ success: true, message: 'Water intake reset' });
  } catch (error) {
    console.error('Reset water error:', error);
    res.status(500).json({ message: 'Failed to reset water intake' });
  }
};
