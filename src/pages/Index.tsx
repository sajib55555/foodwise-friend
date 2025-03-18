
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import NutritionSummary from "@/components/home/NutritionSummary";
import ActionButtons from "@/components/home/ActionButtons";
import WaterTracker from "@/components/home/WaterTracker";
import ExerciseTracker from "@/components/home/ExerciseTracker";
import ReminderSystem from "@/components/home/ReminderSystem";

const Index = () => {
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
          
          <NutritionSummary />
          
          <WaterTracker />
          
          <ExerciseTracker />
          
          <ReminderSystem />
        </div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Index;
