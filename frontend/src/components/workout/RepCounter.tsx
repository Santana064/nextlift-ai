import React from 'react';
import { motion } from 'framer-motion';

interface RepCounterProps {
  reps: number;
  targetReps: number;
  onRepDetected: () => void;
}

const RepCounter: React.FC<RepCounterProps> = ({ reps, targetReps, onRepDetected }) => {
  const progress = (reps / targetReps) * 100;
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Rep Counter</h3>
        <span className="text-3xl">🔄</span>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-teal-400 mb-2">{reps}</div>
        <div className="text-gray-400">/ {targetReps} reps</div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-teal-400 to-blue-400"
        />
      </div>
      
      <div className="text-center">
        {reps >= targetReps ? (
          <div className="text-green-400 font-bold text-lg">✓ Set Complete!</div>
        ) : (
          <div className="text-gray-300">
            {targetReps - reps} more to go
          </div>
        )}
      </div>
      
      {/* Manual Rep Button - moved here and made more subtle */}
      <button
        onClick={onRepDetected}
        className="mt-4 w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl text-sm text-gray-300 transition-all flex items-center justify-center gap-2"
      >
        <span>➕</span> Manual Rep (testing)
      </button>
    </motion.div>
  );
};

export default RepCounter;
