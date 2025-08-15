import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !user) {
    console.warn('ProtectedRoute: Redirecting to /login due to not authenticated and no user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    console.warn('ProtectedRoute: Waiting for user data, user=', user);
    return <div>Loading user data...</div>;
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    console.warn('ProtectedRoute: Invalid or missing roles prop, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = typeof user.roles === 'string' ? [user.roles] : Array.isArray(user.roles) ? user.roles : [];
  if (!roles.some(role => userRoles.includes(role))) {
    console.warn(`ProtectedRoute: User roles [${userRoles.join(', ')}] not in allowed roles [${roles.join(', ')}], redirecting to /`);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;