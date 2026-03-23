import React from 'react';
import { motion } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetMuscles: string[];
  sets?: number;
  repsPerSet?: number;
}

interface ExerciseSelectorProps {
  exercises?: Exercise[];
  selectedExercise: Exercise | null;
  onSelectExercise: (exercise: Exercise) => void;
  disabled?: boolean;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ 
  exercises = [], 
  selectedExercise, 
  onSelectExercise, 
  disabled 
}) => {
  const exerciseList = exercises || [];
  
  if (exerciseList.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Selection prompt */}
      {!selectedExercise && !disabled && (
        <div className="mb-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-center">
          <p className="text-xs text-teal-400">Select an exercise to start</p>
        </div>
      )}
      
      {/* Exercise list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {exerciseList.map((exercise) => (
          <motion.button
            key={exercise.id}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onSelectExercise(exercise)}
            disabled={disabled}
            className={`w-full p-3 rounded-lg text-left transition ${
              selectedExercise?.id === exercise.id
                ? 'gradient-bg text-white'
                : 'bg-white/5 hover:bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{exercise.icon}</span>
              <div>
                <div className="font-medium">{exercise.name}</div>
                <div className="text-xs opacity-75">{exercise.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseSelector;
