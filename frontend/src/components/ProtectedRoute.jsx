import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedPositions = [], 
  redirectPath = '/sign-in' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, always redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If route requires specific positions and user's position is not allowed
  if (allowedPositions.length > 0 && !allowedPositions.includes(user.position)) {
    // Redirect to appropriate dashboard based on user's position
    const redirectTo = user.position === 'tech' ? '/tech/dashboard' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute; 