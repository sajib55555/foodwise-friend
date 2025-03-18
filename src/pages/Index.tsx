
import React from "react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import NutritionSummary from "@/components/home/NutritionSummary";
import ActionButtons from "@/components/home/ActionButtons";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";

const Index = () => {
  return (
    <>
      <Header transparent />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
            <p className="text-muted-foreground">
              Track your nutrition and stay healthy
            </p>
          </motion.div>

          <div className="space-y-8">
            <NutritionSummary />
            <ActionButtons />
          </div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Index;
