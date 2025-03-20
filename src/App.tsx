
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AnimatePresence } from "framer-motion";

// Import pages
import Home from './pages/Home';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import Notifications from './pages/profile/Notifications';
import Settings from './pages/profile/Settings';
import Authentication from './pages/Authentication';
import Onboarding from './pages/Onboarding';
import MacroCalculator from './pages/MacroCalculator';
import WeeklyMealPlanner from './pages/WeeklyMealPlanner';
import NotFound from './pages/NotFound';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { ActivityLogProvider } from './contexts/ActivityLogContext';
import { ReminderProvider } from "./contexts/ReminderContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/notifications" element={<Notifications />} />
        <Route path="/profile/settings" element={<Settings />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/macro-calculator" element={<MacroCalculator />} />
        <Route path="/weekly-meal-planner" element={<WeeklyMealPlanner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ActivityLogProvider>
              <ReminderProvider>
                <AppRoutes />
                <Toaster />
              </ReminderProvider>
            </ActivityLogProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
