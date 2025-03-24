
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import NutritionSummary from "@/components/home/NutritionSummary";
import ActionButtons from "@/components/home/ActionButtons";
import ExerciseTracker from "@/components/home/ExerciseTracker";
import AIHealthAssistant from "@/components/home/AIHealthAssistant";
import AIVoiceAssistant from "@/components/home/AIVoiceAssistant";
import { Button } from "@/components/ui/button-custom";
import { Calendar, Dumbbell } from "lucide-react";
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
            
            {/* AI Health Assistant and Voice Assistant in a grid */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-3">
              <div id="ai-health-assistant">
                <AIHealthAssistant />
              </div>
              <div id="ai-voice-assistant">
                <AIVoiceAssistant />
              </div>
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
            
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl p-3 md:p-6 ${featureCardGradient} ${featureCardBorder}`}
            >
              <ExerciseTracker />
            </motion.div>
          </motion.div>
        </main>
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default Index;
