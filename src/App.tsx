import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BMICalculatorPage from "./pages/BMICalculatorPage";
import ExercisesPage from "./pages/ExercisesPage";
import TrackProgress from "./pages/TrackProgress";
import WorkoutPlans from "./pages/WorkoutPlans";

// Protected Route wrapper
function ProtectedRoute({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

// Public Route wrapper (redirect to home if already authenticated)
function PublicRoute({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  return !isAuthenticated ? <>{children}</> : <Navigate to="/home" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "logged in" : "logged out");
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-indigo-600 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bmi"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <BMICalculatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ExercisesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-progress"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TrackProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-plans"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <WorkoutPlans />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;