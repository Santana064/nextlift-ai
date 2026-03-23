import React from 'react';
import { motion } from 'framer-motion';

interface WorkoutControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  showCountdown: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
  weight?: number;
  onWeightChange?: (weight: number) => void;
  reps?: number;
  onRepsChange?: (reps: number) => void;
  sets?: number;
  onSetsChange?: (sets: number) => void;
}

const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  isRecording,
  isPaused,
  showCountdown,
  onStart,
  onPause,
  onResume,
  onStop,
  disabled,
  weight = 0,
  onWeightChange,
  reps = 0,
  onRepsChange,
  sets = 0,
  onSetsChange
}) => {
  const oneRM = weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0;

  return (
    <div className="space-y-4">
      {/* Weight Input */}
      {isRecording && onWeightChange && (
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
          <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWeightChange(Math.max(0, weight - 2.5))}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              -
            </button>
            <input
              type="number"
              value={weight}
              onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
              step="2.5"
              className="flex-1 text-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-xl font-bold focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => onWeightChange(weight + 2.5)}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Reps Input */}
      {isRecording && onRepsChange && (
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
          <label className="block text-sm text-gray-400 mb-2">Reps</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRepsChange(Math.max(0, reps - 1))}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              -
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
              className="flex-1 text-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-xl font-bold focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => onRepsChange(reps + 1)}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Sets Input */}
      {isRecording && onSetsChange && (
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
          <label className="block text-sm text-gray-400 mb-2">Sets</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetsChange(Math.max(1, sets - 1))}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              -
            </button>
            <input
              type="number"
              value={sets}
              onChange={(e) => onSetsChange(parseInt(e.target.value) || 1)}
              className="flex-1 text-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-xl font-bold focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => onSetsChange(sets + 1)}
              className="w-10 h-10 bg-gray-700 rounded-lg text-white text-xl hover:bg-gray-600 transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* 1RM Display */}
      {isRecording && weight > 0 && reps > 0 && (
        <div className="mt-3 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30 text-center">
          <p className="text-sm text-gray-400">Estimated 1RM</p>
          <p className="text-2xl font-bold text-teal-400">{oneRM} kg</p>
          <p className="text-xs text-gray-500">Based on {weight}kg × {reps} reps</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mt-4">
        {!isRecording && !showCountdown && (
          <button
            onClick={onStart}
            disabled={disabled}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            Start Workout
          </button>
        )}

        {isRecording && !showCountdown && (
          <>
            <button
              onClick={isPaused ? onResume : onPause}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onStop}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutControls;
