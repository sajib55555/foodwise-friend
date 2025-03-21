
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
import SleepTracker from "@/components/home/SleepTracker";
import GoalTracker from "@/components/home/GoalTracker";
import AIHealthAssistant from "@/components/home/AIHealthAssistant";
import { Button } from "@/components/ui/button-custom";
import { Calendar, Dumbbell, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Common feature card gradient for consistency
  const featureCardGradient = "bg-gradient-to-br from-purple-500/10 via-indigo-500/8 to-blue-500/5";
  const featureCardBorder = "border border-purple-300/30 dark:border-purple-900/30";
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header title="" transparent={true} />
        <main className="flex-1 container mx-auto px-3 pb-20 pt-2 relative overflow-y-auto -webkit-overflow-scrolling-touch" style={{ height: 'auto', maxWidth: '95%' }}>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
          
          <motion.div 
            className="space-y-3 md:space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* App Logo and Tagline */}
            <motion.div 
              variants={itemVariants}
              className="text-center my-1 md:my-2"
            >
              <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600">
                NutriTrack
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm">Your personal health companion</p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ActionButtons />
            </motion.div>
            
            {/* AI Health Assistant with ID for scrolling - Made slightly smaller by adjusting scale */}
            <motion.div 
              variants={itemVariants} 
              id="ai-health-assistant"
              className="transform scale-95" // Added scale to reduce size by 5%
            >
              <AIHealthAssistant />
            </motion.div>
            
            {/* Navigation Buttons - Updated to be side by side in a centered flex container */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-2 md:gap-3 flex-wrap"
            >
              <Button
                onClick={() => navigate('/weekly-meal-planner')}
                variant="purple-gradient"
                className="gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                size={isMobile ? "sm" : "default"}
              >
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                Weekly Meal Planner
              </Button>
              
              <Button
                onClick={() => navigate('/workout')}
                variant="purple-gradient"
                className="gap-1 md:gap-2 shadow-md text-xs md:text-sm"
                size={isMobile ? "sm" : "default"}
              >
                <Dumbbell className="h-3 w-3 md:h-4 md:w-4" />
                Workout Tracker
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <NutritionSummary />
            </motion.div>
            
            {/* Responsive grid layout with consistent styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <motion.div 
                variants={itemVariants}
                id="water-tracker" 
                className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
              >
                <WaterTracker />
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
              >
                <ExerciseTracker />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <motion.div 
                variants={itemVariants}
                id="sleep-tracker"
                className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
              >
                <SleepTracker />
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
              >
                <GoalTracker />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <motion.div 
                variants={itemVariants}
                className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
              >
                <MealRecommendations />
              </motion.div>
              {/* Removed WorkoutSuggestions component */}
            </div>
            
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
            >
              <ReminderSystem />
            </motion.div>
            
            {/* Premium feature banner with the same purple-to-blue gradient */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl overflow-hidden shadow-xl border border-purple-200/50 dark:border-purple-800/20 hover:shadow-purple transition-all duration-300 mb-8"
            >
              <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-3 md:p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
                  <div className="text-white mb-3 md:mb-0">
                    <h3 className="text-sm md:text-xl font-bold flex items-center">
                      <Sparkles className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5" /> Unlock Premium Features
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm max-w-md mt-1 md:mt-2">
                      Get personalized meal plans, advanced analytics, and exclusive workouts
                    </p>
                  </div>
                  <Button
                    variant="premium"
                    size={isMobile ? "sm" : "lg"}
                    className="shadow-xl hover:shadow-purple-500/20 transition-all text-xs md:text-sm"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default Index;
