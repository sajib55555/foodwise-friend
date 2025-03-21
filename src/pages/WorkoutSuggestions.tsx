
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import WorkoutSuggestions from "@/components/home/workout-suggestions";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkoutSuggestionsPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header title="Workout Suggestions" />
        <main className="flex-1 container mx-auto px-3 pb-20 pt-5 relative overflow-y-auto -webkit-overflow-scrolling-touch" style={{ height: 'auto', maxWidth: '95%' }}>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/5 rounded-full filter blur-3xl -z-10"></div>
          
          <motion.div 
            className="space-y-3 md:space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Description */}
            <div className="text-center mb-4">
              <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600">
                Personalized Workout Suggestions
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto">
                Discover workouts tailored to your fitness level and goals
              </p>
            </div>
            
            {/* Main content - Workout Suggestions */}
            <div className="max-w-3xl mx-auto">
              <WorkoutSuggestions />
            </div>
          </motion.div>
        </main>
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default WorkoutSuggestionsPage;
