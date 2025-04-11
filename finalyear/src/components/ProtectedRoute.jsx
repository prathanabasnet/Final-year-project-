import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - loading:", loading);
  console.log("ProtectedRoute - user:", user);

  if (loading) {
    console.log("ProtectedRoute - Still loading, showing loading screen...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute - Redirecting to / because user is not authenticated");
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - User authenticated, rendering children...");
  return children;
}