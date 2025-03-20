
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Scan from "./pages/Scan";
import Profile from "./pages/Profile";
import PersonalInfo from "./pages/profile/PersonalInfo";
import Preferences from "./pages/profile/Preferences";
import Notifications from "./pages/profile/Notifications";
import Privacy from "./pages/profile/Privacy";
import Subscription from "./pages/profile/Subscription";
import Nutrition from "./pages/Nutrition";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import LogMeal from "./pages/LogMeal";
import MealPlans from "./pages/MealPlans";
import WeightTracker from "./pages/WeightTracker";
import WorkoutTracker from "./pages/WorkoutTracker";
import WeeklyMealPlanner from "./pages/WeeklyMealPlanner";
import GoalsTracker from "./pages/GoalsTracker";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/scan" element={
          <ProtectedRoute>
            <Scan />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/personal" element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        } />
        <Route path="/profile/preferences" element={
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        } />
        <Route path="/profile/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/profile/privacy" element={
          <ProtectedRoute>
            <Privacy />
          </ProtectedRoute>
        } />
        <Route path="/profile/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />
        <Route path="/nutrition" element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        } />
        <Route path="/log-meal" element={
          <ProtectedRoute>
            <LogMeal />
          </ProtectedRoute>
        } />
        <Route path="/plans" element={
          <ProtectedRoute>
            <MealPlans />
          </ProtectedRoute>
        } />
        <Route path="/weekly-meal-planner" element={
          <ProtectedRoute>
            <WeeklyMealPlanner />
          </ProtectedRoute>
        } />
        <Route path="/weight" element={
          <ProtectedRoute>
            <WeightTracker />
          </ProtectedRoute>
        } />
        <Route path="/workout" element={
          <ProtectedRoute>
            <WorkoutTracker />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <GoalsTracker />
          </ProtectedRoute>
        } />

        {/* Redirect home page to landing if not logged in, otherwise to dashboard */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />
        } />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ActivityLogProvider>
              <AppRoutes />
            </ActivityLogProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
