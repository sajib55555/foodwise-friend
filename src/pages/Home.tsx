
import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import MobileNavbar from '@/components/layout/MobileNavbar';
import PageTransition from '@/components/layout/PageTransition';
import ActionButtons from '@/components/home/ActionButtons';
import NutritionSummary from '@/components/home/NutritionSummary';
import WaterTracker from '@/components/home/WaterTracker';
import GoalTracker from '@/components/home/GoalTracker';
import ExerciseTracker from '@/components/home/ExerciseTracker';
import SleepTracker from '@/components/home/SleepTracker';
import ReminderSystem from '@/components/home/ReminderSystem';
import AIHealthAssistant from '@/components/home/AIHealthAssistant';
import MealRecommendations from '@/components/home/MealRecommendations';
import WorkoutSuggestions from '@/components/home/workout-suggestions';

const Home = () => {
  return (
    <>
      <Header title="Dashboard" />
      <PageTransition>
        <main className="container mx-auto px-4 pb-24 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-full"
            >
              <ActionButtons />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <NutritionSummary />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <WaterTracker />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <GoalTracker />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ExerciseTracker />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SleepTracker />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="lg:col-span-2"
            >
              <ReminderSystem />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="lg:col-span-3"
            >
              <WorkoutSuggestions />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="lg:col-span-2"
            >
              <MealRecommendations />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <AIHealthAssistant />
            </motion.div>
          </div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Home;
