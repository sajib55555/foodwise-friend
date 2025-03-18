
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import NutritionCharts from "@/components/nutrition/NutritionCharts";
import NutritionInsights from "@/components/nutrition/NutritionInsights";
import DetailedNutritionAnalysis from "@/components/nutrition/DetailedNutritionAnalysis";

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
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <Tabs 
          defaultValue="dashboard" 
          className="space-y-4" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
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
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Nutrition;
