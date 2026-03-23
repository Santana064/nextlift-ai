import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Workout {
  id: string;
  exerciseName: string;
  reps: number;
  sets: number;
  duration: number;
  formScore: number;
  completedAt: string;
}

interface WorkoutHistoryProps {
  workouts: Workout[];
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ workouts }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700/50">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Workout History</h3>
        <p className="text-gray-400">Complete your first workout to see it here!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-6">Workout History</h3>
      
      <div className="space-y-3">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-teal-500/30 transition-all cursor-pointer"
            onClick={() => navigate(`/analysis/${workout.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-white">{workout.exerciseName}</div>
                <div className="text-xs text-gray-400">{formatDate(workout.completedAt)}</div>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(workout.formScore)}`}>
                {workout.formScore}%
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-gray-400">
              <span>🔄 {workout.reps} reps</span>
              <span>📊 {workout.sets} sets</span>
              <span>⏱️ {formatDuration(workout.duration)}</span>
            </div>
            
            <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getScoreColor(workout.formScore).replace('text', 'bg')} rounded-full`}
                style={{ width: `${workout.formScore}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutHistory;
