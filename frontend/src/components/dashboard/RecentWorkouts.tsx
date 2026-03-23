import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';

interface RecentWorkoutsProps {
  workouts: Array<{
    id: string;
    exerciseType: string;
    reps: number;
    sets: number;
    formScore: number;
    completedAt: string;
  }>;
}

export const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ workouts }) => {
  const workoutList = workouts || [];
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };
  
  if (workoutList.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-400">No workouts yet. Start your first workout!</p>
        <Link to={ROUTES.WORKOUT} className="btn-primary mt-4 inline-block">
          Start Workout
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-teal-400">📋</span>
        Recent Workouts
      </h3>
      <div className="space-y-3">
        {workoutList.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <div>
              <div className="font-medium text-white capitalize">{workout.exerciseType}</div>
              <div className="text-xs text-gray-400">
                {formatDate(workout.completedAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">
                {workout.reps} reps • {workout.sets} sets
              </div>
              <div className={`text-xs ${
                workout.formScore >= 90 ? 'text-green-400' :
                workout.formScore >= 80 ? 'text-teal-400' :
                workout.formScore >= 70 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                Score: {workout.formScore}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentWorkouts;

