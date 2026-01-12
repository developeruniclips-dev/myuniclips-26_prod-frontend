// src/components/ProtectedRoutes.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/temp";

const ProtectedRoute = ({ roles = [], children }) => {
  const { user } = useAuth();

  if (!user) {
    // user is not logged in
    return <Navigate to="/login" replace />;
  }

  // Check if user has at least one of the required roles
  const hasRole = user.roles?.some(role => roles.includes(role));

  if (!hasRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
