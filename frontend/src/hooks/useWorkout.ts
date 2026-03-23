import { useState } from 'react';
import api from '../services/api';
import { useToast } from './useToast';

export const useWorkout = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Workout session state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [workoutState, setWorkoutState] = useState({
    duration: 0,
    calories: 0,
    reps: 0,
    sets: 0
  });

  const startWorkout = (exercise: any) => {
    setIsRecording(true);
    setIsPaused(false);
    setCurrentExercise(exercise);
    setWorkoutState({ duration: 0, calories: 0, reps: 0, sets: 0 });
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
  };

  const stopWorkout = () => {
    setIsRecording(false);
    setIsPaused(false);
  };

  const resetWorkout = () => {
    setIsRecording(false);
    setIsPaused(false);
    setCurrentExercise(null);
    setWorkoutState({ duration: 0, calories: 0, reps: 0, sets: 0 });
  };

  const updateReps = (reps: number) => {
    setWorkoutState(prev => ({ ...prev, reps }));
  };

  const updateSets = (sets: number) => {
    setWorkoutState(prev => ({ ...prev, sets }));
  };

  // API Methods
  const saveWorkout = async (workoutData: any) => {
    try {
      setLoading(true);
      const response = await api.post('/workouts', {
        type: workoutData.exerciseType,
        exerciseName: workoutData.exerciseName,
        reps: workoutData.reps,
        sets: workoutData.sets,
        weight: workoutData.weight,
        duration: workoutData.duration,
        calories: workoutData.caloriesBurned,
        formScore: workoutData.formScore,
        notes: workoutData.notes
      });
      showToast('success', 'Workout saved!');
      return response.data.data;
    } catch (error) {
      console.error('Failed to save workout:', error);
      showToast('error', 'Failed to save workout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get workouts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutById = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/workouts/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutHistory = async (limit: number = 20) => {
    try {
      setLoading(true);
      const response = await api.get(`/workouts/history?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get workout history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecentWorkouts = async (limit: number = 5) => {
    return getWorkoutHistory(limit);
  };

  const getStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        averageFormScore: 0,
        currentStreak: 0,
        workoutsByType: {},
        personalRecords: []
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Session state
    isRecording,
    isPaused,
    currentExercise,
    workoutState,
    loading,
    
    // Session actions
    startWorkout,
    pauseWorkout,
    stopWorkout,
    resetWorkout,
    updateReps,
    updateSets,
    
    // API methods
    saveWorkout,
    getWorkouts,
    getWorkoutById,
    getWorkoutHistory,
    getRecentWorkouts,
    getStats
  };
};
