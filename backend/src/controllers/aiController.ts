import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCoachingAdvice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { question } = req.body;
    
    const response = {
      answer: "I'm your AI fitness coach! I can help with exercise form, nutrition advice, workout planning, and motivation. What would you like to know?",
      tips: [
        "Ask about specific exercises like squats or bench press",
        "Get nutrition advice for your goals",
        "Request a workout plan",
        "Get motivation when you need it"
      ]
    };
    
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('AI coaching error:', error);
    res.status(500).json({ message: 'Failed to get coaching advice' });
  }
};

export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const { goals, experience, daysPerWeek } = req.body;
    
    const exercises = [
      { name: "Squats", sets: 3, reps: 10, rest: 60 },
      { name: "Push-ups", sets: 3, reps: 12, rest: 45 },
      { name: "Pull-ups", sets: 3, reps: 8, rest: 60 },
      { name: "Planks", sets: 3, reps: "30 seconds", rest: 30 }
    ];
    
    const plan = {
      name: `${experience || 'Beginner'} ${daysPerWeek || 3}-Day Workout Plan`,
      goal: goals || 'General Fitness',
      exercises: exercises,
      tips: [
        "Start each workout with a 5-10 minute warmup",
        "Stay hydrated throughout your workout",
        "Focus on proper form over heavy weight",
        "Track your progress to see improvements"
      ]
    };
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({ message: 'Failed to generate workout plan' });
  }
};

export const analyzeForm = async (req: Request, res: Response) => {
  try {
    const analysis = {
      score: 85,
      feedback: [
        "Good depth on your movement",
        "Keep your back straight",
        "Great tempo"
      ],
      improvements: [
        "Engage your core more",
        "Control the descent"
      ]
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Form analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze form' });
  }
};

export const generateNutritionPlan = async (req: Request, res: Response) => {
  try {
    const { goals } = req.body;
    
    const plan = {
      dailyCalories: goals === 'weight_loss' ? 1800 : goals === 'weight_gain' ? 2500 : 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
      meals: [
        { name: "Breakfast", foods: ["Oatmeal with berries", "Protein shake"], calories: 400 },
        { name: "Lunch", foods: ["Grilled chicken", "Brown rice", "Broccoli"], calories: 500 },
        { name: "Dinner", foods: ["Salmon", "Sweet potato", "Asparagus"], calories: 550 },
        { name: "Snacks", foods: ["Greek yogurt", "Mixed nuts"], calories: 300 }
      ],
      tips: [
        "Drink plenty of water throughout the day",
        "Eat protein with every meal",
        "Prepare meals in advance"
      ]
    };
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Nutrition plan error:', error);
    res.status(500).json({ message: 'Failed to generate nutrition plan' });
  }
};
