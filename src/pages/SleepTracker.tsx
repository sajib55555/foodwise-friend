
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import SleepTracker from "@/components/home/SleepTracker";

const SleepTrackerPage = () => {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header title="Sleep Tracker" />
        <main className="flex-1 container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <SleepTracker />
            </div>
          </motion.div>
        </main>
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default SleepTrackerPage;
