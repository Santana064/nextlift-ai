import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // ðŸ”„ Still checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  // âŒ Not logged in â†’ redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // âœ… Logged in
  return <>{children}</>;
};

export default ProtectedRoute;