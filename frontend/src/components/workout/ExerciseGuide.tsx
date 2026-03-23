import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseGuideProps {
  exercise: {
    id: string;
    name: string;
    icon: string;
    description: string;
    targetMuscles: string[];
    sets?: number;
    repsPerSet?: number;
  };
  onClose: () => void;
}

export const ExerciseGuide: React.FC<ExerciseGuideProps> = ({ exercise, onClose }) => {
  // Exercise-specific tips
  const getExerciseTips = (exerciseId: string) => {
    const tips: Record<string, string[]> = {
      squat: [
        "Keep your chest up and back straight",
        "Go down until thighs are parallel to ground",
        "Push through your heels",
        "Keep knees in line with toes"
      ],
      bench_press: [
        "Keep shoulders blades retracted",
        "Lower bar to mid-chest",
        "Elbows at 45-degree angle",
        "Drive through heels"
      ],
      deadlift: [
        "Keep back straight throughout",
        "Bar should stay close to shins",
        "Drive through heels",
        "Lock out at the top"
      ],
      pushup: [
        "Keep body in straight line",
        "Lower chest to ground",
        "Elbows at 45 degrees",
        "Engage core throughout"
      ],
      pullup: [
        "Start from dead hang",
        "Pull chest to bar",
        "Squeeze shoulder blades",
        "Control the descent"
      ]
    };
    return tips[exerciseId] || [
      "Maintain proper form",
      "Control the movement",
      "Breathe steadily",
      "Focus on mind-muscle connection"
    ];
  };

  const tips = getExerciseTips(exercise.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{exercise.icon}</span>
                <h2 className="text-2xl font-bold neon-text">{exercise.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4">{exercise.description}</p>

            {/* Target Muscles */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Target Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, i) => (
                  <span key={i} className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-sm">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Sets & Reps */}
            {exercise.sets && exercise.repsPerSet && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommended</h3>
                <p className="text-white">
                  {exercise.sets} sets × {exercise.repsPerSet} reps
                </p>
              </div>
            )}

            {/* Form Tips */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Form Tips</h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-teal-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full btn-primary mt-2"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseGuide;
