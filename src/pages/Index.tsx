
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
import WorkoutSuggestions from "@/components/home/workout-suggestions";
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
      <Header title="" transparent={true} />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-2 relative overflow-y-auto">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
        
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* App Logo and Tagline */}
          <motion.div 
            variants={itemVariants}
            className="text-center my-4"
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600">
              NutriTrack
            </h1>
            <p className="text-muted-foreground text-sm">Your personal health companion</p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ActionButtons />
          </motion.div>
          
          {/* AI Health Assistant moved to just after ActionButtons */}
          <motion.div variants={itemVariants}>
            <AIHealthAssistant />
          </motion.div>
          
          {/* Navigation Buttons - Updated to be side by side in a centered flex container */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4 flex-wrap"
          >
            <Button
              onClick={() => navigate('/weekly-meal-planner')}
              variant="purple-gradient"
              className="gap-2 shadow-md"
            >
              <Calendar className="h-4 w-4" />
              Weekly Meal Planner
            </Button>
            
            <Button
              onClick={() => navigate('/workout')}
              variant="purple-gradient"
              className="gap-2 shadow-md"
            >
              <Dumbbell className="h-4 w-4" />
              Workout Tracker
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <NutritionSummary />
          </motion.div>
          
          {/* Responsive grid layout with consistent styling */}
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
            <motion.div 
              variants={itemVariants} 
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <WaterTracker />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <ExerciseTracker />
            </motion.div>
          </div>
          
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <SleepTracker />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <GoalTracker />
            </motion.div>
          </div>
          
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <MealRecommendations />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder} ${!isMobile ? 'col-span-1' : ''}`}
            >
              <WorkoutSuggestions />
            </motion.div>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className={`rounded-2xl p-6 ${featureCardGradient} ${featureCardBorder}`}
          >
            <ReminderSystem />
          </motion.div>
          
          {/* Premium feature banner with the same purple-to-blue gradient */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl overflow-hidden shadow-xl border border-purple-200/50 dark:border-purple-800/20 hover:shadow-purple transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
                <div className="text-white mb-4 md:mb-0">
                  <h3 className="text-xl font-bold flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" /> Unlock Premium Features
                  </h3>
                  <p className="text-white/80 max-w-md mt-2">
                    Get personalized meal plans, advanced analytics, and exclusive workouts
                  </p>
                </div>
                <Button
                  variant="premium"
                  size="lg"
                  className="shadow-xl hover:shadow-purple-500/20 transition-all"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Index;
