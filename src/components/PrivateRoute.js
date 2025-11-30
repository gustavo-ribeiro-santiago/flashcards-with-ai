import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Redirect to login if not authenticated
  return currentUser ? children : <Navigate to="/flashcards-with-ai/login" replace />;
}

export default PrivateRoute;
