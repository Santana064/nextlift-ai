export interface Exercise {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetMuscles: string[];
  sets?: number;
  repsPerSet?: number;
}

export const exercises: Exercise[] = [
  {
    id: 'squat',
    name: 'Squats',
    icon: '🏋️',
    description: 'Perfect for lower body strength',
    targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    sets: 3,
    repsPerSet: 10
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    icon: '🏋️‍♂️',
    description: 'Build chest and triceps',
    targetMuscles: ['Pectorals', 'Triceps', 'Shoulders'],
    sets: 3,
    repsPerSet: 8
  },
  {
    id: 'deadlift',
    name: 'Deadlifts',
    icon: '💪',
    description: 'Full body strength builder',
    targetMuscles: ['Hamstrings', 'Glutes', 'Back', 'Traps'],
    sets: 3,
    repsPerSet: 5
  },
  {
    id: 'pushup',
    name: 'Push-ups',
    icon: '🤸',
    description: 'Classic upper body exercise',
    targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    sets: 3,
    repsPerSet: 12
  },
  {
    id: 'pullup',
    name: 'Pull-ups',
    icon: '⬆️',
    description: 'Back and biceps builder',
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rear Deltoids'],
    sets: 3,
    repsPerSet: 8
  }
];

// Export the type and the data
export type { Exercise };
