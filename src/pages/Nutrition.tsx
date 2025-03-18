
import React from "react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "recharts";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion } from "framer-motion";

const Nutrition = () => {
  // Mock data for charts - in a real app, this would come from API/state
  const caloriesData = [
    { name: "Mon", calories: 1850 },
    { name: "Tue", calories: 1650 },
    { name: "Wed", calories: 1720 },
    { name: "Thu", calories: 1950 },
    { name: "Fri", calories: 1820 },
    { name: "Sat", calories: 2100 },
    { name: "Sun", calories: 1950 }
  ];
  
  const nutritionBreakdown = [
    { name: "Proteins", value: 28, color: "#3b82f6" },
    { name: "Carbs", value: 45, color: "#22c55e" },
    { name: "Fats", value: 27, color: "#f59e0b" }
  ];

  // Mock meal data
  const todayMeals = [
    { name: "Breakfast", calories: 450, time: "8:30 AM", protein: 18, carbs: 45, fat: 15 },
    { name: "Lunch", calories: 680, time: "12:45 PM", protein: 32, carbs: 65, fat: 22 },
    { name: "Snack", calories: 220, time: "3:30 PM", protein: 8, carbs: 25, fat: 10 },
    { name: "Dinner", calories: 520, time: "7:15 PM", protein: 28, carbs: 48, fat: 18 }
  ];

  return (
    <>
      <Header title="Nutrition" showBackButton />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="breakdown" className="flex-1">Breakdown</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Weekly Calories</CardTitle>
                  </CardHeader>
                  <CardContent className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={caloriesData}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          domain={[1000, 2500]}
                        />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="#0ea5e9" 
                          fillOpacity={1} 
                          fill="url(#colorCalories)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Today's Meals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {todayMeals.map((meal, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{meal.calories} kcal</p>
                            <p className="text-xs text-muted-foreground">
                              P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="breakdown">
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Detailed nutrition breakdown content goes here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Meal History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Historical meal tracking data goes here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Nutrition;
