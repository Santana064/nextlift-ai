import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 2, ease: "linear" },
            scale: { repeat: Infinity, duration: 1, ease: "easeInOut" }
          }}
          className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-400 text-lg">Loading NEXTLIFT AI...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
