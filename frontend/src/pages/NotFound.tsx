import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../routes';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6">404</div>
        <h1 className="text-3xl font-bold neon-text mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.DASHBOARD} className="btn-primary inline-block">
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
