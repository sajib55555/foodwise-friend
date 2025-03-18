
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
import Nutrition from "./pages/Nutrition";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import LogMeal from "./pages/LogMeal";
import MealPlans from "./pages/MealPlans";
import WeightTracker from "./pages/WeightTracker";

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
        <Route path="/weight" element={
          <ProtectedRoute>
            <WeightTracker />
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
