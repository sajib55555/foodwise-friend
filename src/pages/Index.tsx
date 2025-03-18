
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import NutritionSummary from "@/components/home/NutritionSummary";
import ActionButtons from "@/components/home/ActionButtons";
import WaterTracker from "@/components/home/WaterTracker";
import ExerciseTracker from "@/components/home/ExerciseTracker";
import ReminderSystem from "@/components/home/ReminderSystem";
import MealRecommendations from "@/components/home/MealRecommendations";
import WorkoutSuggestions from "@/components/home/WorkoutSuggestions";
import { Button } from "@/components/ui/button-custom";
import { Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <PageTransition>
      <Header title="Dashboard" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ActionButtons />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex justify-end"
          >
            <Button
              onClick={() => navigate('/weekly-meal-planner')}
              variant="purple-outline"
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Weekly Meal Planner
            </Button>
          </motion.div>
          
          <NutritionSummary />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WaterTracker />
            <ExerciseTracker />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MealRecommendations />
            <WorkoutSuggestions />
          </div>
          
          <ReminderSystem />
        </div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Index;
