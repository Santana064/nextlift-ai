import { useState } from 'react';
import api from '../services/api';

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const analyzeForm = async (poseData: any, exerciseType: string) => {
    try {
      const response = await api.post('/ai/analyze-form', { poseData, exerciseType });
      return response.data.data;
    } catch (error) {
      return {
        formScore: 0,
        feedback: ['Unable to analyze form'],
        issues: [],
        suggestions: []
      };
    }
  };

  const getRealTimeFeedback = async (poseData: any, exerciseType: string) => {
    try {
      const response = await api.post('/ai/realtime-feedback', { poseData, exerciseType });
      return response.data.data.feedback;
    } catch (error) {
      return "Focus on your form";
    }
  };

  const analyzeWorkoutDeep = async (workoutData: any) => {
    try {
      const response = await api.post('/ai/analyze-workout', workoutData);
      return response.data.data;
    } catch (error) {
      return {
        formBreakdown: [],
        muscleActivation: {},
        recommendations: []
      };
    }
  };

  const generateImprovementPlan = async (workoutData: any, analysisData: any) => {
    try {
      const response = await api.post('/ai/improvement-plan', { workoutData, analysisData });
      return response.data.data;
    } catch (error) {
      return {
        tips: [],
        exercises: []
      };
    }
  };

  const generateWorkoutPlan = async (preferences: any) => {
    try {
      const response = await api.post('/ai/generate-workout', preferences);
      return response.data.data;
    } catch (error) {
      // Return mock workout if API fails
      return {
        name: 'Custom Workout',
        exercises: [
          { name: 'Squats', sets: 3, reps: 10, rest: 60 },
          { name: 'Push-ups', sets: 3, reps: 12, rest: 45 },
          { name: 'Rows', sets: 3, reps: 10, rest: 60 }
        ],
        duration: 45
      };
    }
  };

  const optimizeWorkout = async (workout: any, feedback: string) => {
    try {
      const response = await api.post('/ai/optimize-workout', { workout, feedback });
      return response.data.data;
    } catch (error) {
      return workout;
    }
  };

  const sendMessage = async (message: string, context: any) => {
    try {
      const response = await api.post('/ai/chat', { message, context });
      return response.data.data;
    } catch (error) {
      return {
        message: "I'm here to help! What would you like to know about fitness?",
        suggestions: ['Create workout', 'Nutrition advice', 'Form tips'],
        context: {}
      };
    }
  };

  const getWorkoutSuggestion = async (goals: any) => {
    try {
      const response = await api.post('/ai/workout-suggestion', { goals });
      return response.data.data.suggestion;
    } catch (error) {
      return "Try a full body workout with squats, push-ups, and rows.";
    }
  };

  const getNutritionAdvice = async (goals: any) => {
    try {
      const response = await api.post('/ai/nutrition-advice', { goals });
      return response.data.data.advice;
    } catch (error) {
      return "Focus on protein intake and stay hydrated.";
    }
  };

  const getMotivation = async () => {
    try {
      const response = await api.get('/ai/motivation');
      return response.data.data.quote;
    } catch (error) {
      return "The only bad workout is the one that didn't happen! 💪";
    }
  };

  return {
    loading,
    analyzeForm,
    getRealTimeFeedback,
    analyzeWorkoutDeep,
    generateImprovementPlan,
    generateWorkoutPlan,
    optimizeWorkout,
    sendMessage,
    getWorkoutSuggestion,
    getNutritionAdvice,
    getMotivation
  };
};
