import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import WorkoutSuggestions from "./pages/WorkoutSuggestions";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";
import { useEffect } from "react";
import { useToast } from "./hooks/use-toast";
import { Button } from "./components/ui/button-custom";
import { Crown } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }
  
  if (subscription?.status === "expired" || subscription?.status === "canceled") {
    toast({
      title: "Subscription expired",
      description: "Your trial or subscription has ended. Please upgrade to continue using premium features.",
      variant: "destructive",
      action: (
        <div className="flex justify-center w-full mt-2">
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium"
            onClick={() => navigate("/profile/subscription")}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      ),
    });
    return <Navigate to="/profile/subscription" replace />;
  }

  return <>{children}</>;
};

const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }
  
  if (subscription?.status !== "active") {
    toast({
      title: "Premium feature",
      description: "This feature requires an active premium subscription.",
      variant: "destructive",
      action: (
        <div className="flex justify-center w-full mt-2">
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium"
            onClick={() => navigate("/profile/subscription")}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      ),
    });
    return <Navigate to="/profile/subscription" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (subscription?.status === "trial" && subscription.trial_ends_at) {
      const trialEnd = new Date(subscription.trial_ends_at);
      const now = new Date();
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3 && daysLeft > 0) {
        toast({
          title: `Your trial ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
          description: "Upgrade to premium to continue enjoying all features.",
          variant: "default",
          action: (
            <div className="flex justify-center w-full mt-2">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                onClick={() => navigate("/profile/subscription")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          ),
        });
      }
    }
  }, [subscription, toast, navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

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
        <Route path="/workout-suggestions" element={
          <ProtectedRoute>
            <WorkoutSuggestions />
          </ProtectedRoute>
        } />
        <Route path="/goals-tracker" element={
          <ProtectedRoute>
            <GoalsTracker />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <GoalsTracker />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />
        } />

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
