import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface WorkoutSummaryProps {
  workout: {
    id: string;
    type: string;
    duration: number;
    calories?: number;
    formScore?: number;
    notes?: string;
    createdAt: string;
  };
  onClose: () => void;
  onShare: () => void;
  onNewWorkout: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  workout,
  onClose,
  onShare,
  onNewWorkout
}) => {
  const navigate = useNavigate();

  // Format exercise name
  const exerciseName = workout.type.charAt(0).toUpperCase() + workout.type.slice(1);
  
  // Default values
  const reps = 10;
  const sets = 3;
  const calories = workout.calories || 45;
  const formScore = workout.formScore || 85;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">??</div>
          <h2 className="text-xl font-bold text-white">Workout Complete!</h2>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">{exerciseName}</span>
            <span className={`font-bold ${getScoreColor(formScore)}`}>{formScore}%</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">{formatDate(workout.createdAt)}</p>
          
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <div className="text-lg">??</div>
              <div className="text-white font-bold text-sm">{reps}</div>
              <div className="text-xs text-gray-400">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-lg">??</div>
              <div className="text-white font-bold text-sm">{sets}</div>
              <div className="text-xs text-gray-400">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-lg">??</div>
              <div className="text-white font-bold text-sm">{formatTime(workout.duration)}</div>
              <div className="text-xs text-gray-400">Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg">??</div>
              <div className="text-white font-bold text-sm">{calories}</div>
              <div className="text-xs text-gray-400">Cal</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
          >
            Close
          </button>
          <button
            onClick={onShare}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
          >
            Share
          </button>
          <button
            onClick={onNewWorkout}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
          >
            New
          </button>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate(`/analysis/${workout.id}`);
          }}
          className="mt-3 w-full text-xs text-teal-400 hover:text-teal-300"
        >
          View Analysis ?
        </button>
      </motion.div>
    </div>
  );
};

export default WorkoutSummary;
