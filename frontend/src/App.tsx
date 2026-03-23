import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingPage from './pages/LoadingPage';
import Navbar from './components/layout/Navbar';
import { ROUTES } from './routes';
import './index.css';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workout = lazy(() => import('./pages/Workout'));
const ManualWorkout = lazy(() => import('./pages/ManualWorkout'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Progress = lazy(() => import('./pages/Progress'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const Social = lazy(() => import('./pages/Social'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Test = lazy(() => import('./pages/Test'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <Navbar />
                <Suspense fallback={<LoadingPage />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    
                    {/* Protected routes */}
                    <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path={ROUTES.WORKOUT} element={<ProtectedRoute><Workout /></ProtectedRoute>} />
                    <Route path="/manual-workout" element={<ProtectedRoute><ManualWorkout /></ProtectedRoute>} />
                    <Route path={`${ROUTES.ANALYSIS}/:id?`} element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                    <Route path={ROUTES.PROGRESS} element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                    <Route path={ROUTES.NUTRITION} element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
                    <Route path={ROUTES.CHAT} element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path={ROUTES.SOCIAL} element={<ProtectedRoute><Social /></ProtectedRoute>} />
                    <Route path={ROUTES.TEST} element={<ProtectedRoute><Test /></ProtectedRoute>} />
                    
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
