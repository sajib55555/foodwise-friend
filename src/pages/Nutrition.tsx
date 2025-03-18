import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import NutritionCharts from "@/components/nutrition/NutritionCharts";
import NutritionInsights from "@/components/nutrition/NutritionInsights";
import DetailedNutritionAnalysis from "@/components/nutrition/DetailedNutritionAnalysis";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Heart, Leaf, Utensils, ArrowUpCircle, Sparkles } from "lucide-react";

// Mock nutrition data for demo purposes
const mockNutritionData = {
  name: "Mixed Berry Smoothie",
  servingSize: "16 oz (473ml)",
  calories: 320,
  protein: 8,
  carbs: 62,
  fat: 5,
  ingredients: [
    { name: "Mixed Berries", healthy: true },
    { name: "Banana", healthy: true },
    { name: "Greek Yogurt", healthy: true },
    { name: "Honey", healthy: true, warning: "Natural sugars" },
    { name: "Almond Milk", healthy: true }
  ],
  healthScore: 8.5,
  warnings: ["Contains natural sugars from honey and fruits"],
  recommendations: [
    "Excellent source of antioxidants from berries",
    "Good post-workout option",
    "Could add protein powder to increase protein content"
  ],
  vitamins: [
    { name: "Vitamin C", amount: "45% DV" },
    { name: "Vitamin A", amount: "12% DV" },
    { name: "Vitamin D", amount: "15% DV" },
    { name: "Vitamin B12", amount: "20% DV" }
  ],
  minerals: [
    { name: "Potassium", amount: "520mg" },
    { name: "Calcium", amount: "200mg" },
    { name: "Iron", amount: "2mg" },
    { name: "Zinc", amount: "1.2mg" }
  ],
  dietary: {
    vegan: false,
    vegetarian: true,
    glutenFree: true,
    dairyFree: false
  }
};

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <PageTransition>
      <Header title="Nutrition" />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card variant="glass" className="border border-green-200/30 dark:border-green-800/20">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Nutrition Tracking</h2>
                    <p className="text-sm text-muted-foreground">Monitor your nutritional intake and habits</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="green-gradient" size="sm" className="gap-1.5">
                    <Leaf className="w-4 h-4" />
                    Add Food
                  </Button>
                  <Button variant="glass-green" size="sm" className="gap-1.5">
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50">
                    <ArrowUpCircle className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <Tabs 
          defaultValue="dashboard" 
          className="space-y-4" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Dashboard</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Insights</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-200">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <NutritionCharts />
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <NutritionInsights />
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            <DetailedNutritionAnalysis nutritionData={mockNutritionData} />
          </TabsContent>
        </Tabs>
        
        {/* Premium feature banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 rounded-2xl overflow-hidden shadow-xl border border-green-200/50 dark:border-green-800/20"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full opacity-20"></div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
              <div className="text-white mb-4 md:mb-0">
                <h3 className="text-xl font-bold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" /> Advanced Nutrition Analysis
                </h3>
                <p className="text-white/80 max-w-md mt-2">
                  Get personalized recommendations and detailed insights about your nutrition
                </p>
              </div>
              <Button
                variant="premium"
                size="lg"
                className="shadow-xl hover:shadow-green-500/20 transition-all"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Nutrition;
