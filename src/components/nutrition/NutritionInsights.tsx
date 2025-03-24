
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Calendar, TrendingUp, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import CalorieIntakeCard from './components/CalorieIntakeCard';
import MacroDistributionCard from './components/MacroDistributionCard';
import GoalProgressCard from './components/GoalProgressCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const NutritionInsights = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user nutrition data from activity logs
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get meal logged activities from the past 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: mealLogs, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'meal_logged')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (!mealLogs || mealLogs.length === 0) {
          setWeeklyData([]);
          setMacroData([]);
          setIsLoading(false);
          return;
        }
        
        // Process meal logs to create weeklyData format
        const processedWeeklyData = processMealLogsToWeeklyData(mealLogs);
        setWeeklyData(processedWeeklyData);
        
        // Process meal logs to create macroData format
        const processedMacroData = processMealLogsToMacroData(mealLogs);
        setMacroData(processedMacroData);
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching nutrition data:', error.message);
        toast({
          title: 'Failed to load nutrition data',
          description: error.message,
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    };
    
    fetchNutritionData();
  }, [user, toast]);
  
  // Process meal logs into weekly data format
  const processMealLogsToWeeklyData = (mealLogs: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData: Record<string, any> = {};
    
    // Initialize with empty data for all days
    days.forEach(day => {
      dailyData[day] = {
        name: day,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        goal: 2000 // Default goal, should be from user settings
      };
    });
    
    // Fill in data from meal logs
    mealLogs.forEach(log => {
      const logDate = new Date(log.created_at);
      const dayName = days[logDate.getDay()];
      
      if (log.metadata && log.metadata.scanned_food) {
        const food = log.metadata.scanned_food;
        
        dailyData[dayName].calories += food.calories || 0;
        dailyData[dayName].protein += food.protein || 0;
        dailyData[dayName].carbs += food.carbs || 0;
        dailyData[dayName].fat += food.fat || 0;
      }
    });
    
    // Convert to array format
    return Object.values(dailyData);
  };
  
  // Process meal logs into macro data format
  const processMealLogsToMacroData = (mealLogs: any[]) => {
    // Get total macros from all logs
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    
    mealLogs.forEach(log => {
      if (log.metadata && log.metadata.scanned_food) {
        const food = log.metadata.scanned_food;
        
        totalProtein += food.protein || 0;
        totalCarbs += food.carbs || 0;
        totalFat += food.fat || 0;
        
        // Some scanned foods might have detailed nutrition
        if (food.nutrients) {
          totalFiber += food.nutrients.fiber || 0;
          totalSugar += food.nutrients.sugar || 0;
        }
      }
    });
    
    // Calculate averages (per day)
    const days = Math.min(7, mealLogs.length > 0 ? 7 : 1);
    const avgProtein = Math.round(totalProtein / days);
    const avgCarbs = Math.round(totalCarbs / days);
    const avgFat = Math.round(totalFat / days);
    const avgFiber = Math.round(totalFiber / days);
    const avgSugar = Math.round(totalSugar / days);
    
    // Create macro data array
    return [
      { name: "Protein", current: avgProtein, goal: 100, unit: "g", color: "#8884d8" },
      { name: "Carbs", current: avgCarbs, goal: 250, unit: "g", color: "#82ca9d" },
      { name: "Fat", current: avgFat, goal: 70, unit: "g", color: "#ffc658" },
      { name: "Fiber", current: avgFiber, goal: 30, unit: "g", color: "#8dd1e1" },
      { name: "Sugar", current: avgSugar, goal: 40, unit: "g", color: "#ff8042", warning: avgSugar > 40 }
    ];
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
          Nutrition Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30">
              <Calendar className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30">
              <Utensils className="h-4 w-4 mr-2" />
              Meals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : weeklyData.length > 0 ? (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CalorieIntakeCard data={weeklyData} />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <MacroDistributionCard data={macroData} />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <GoalProgressCard data={weeklyData} />
                </motion.div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No nutrition data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Log your meals to see insights here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends">
            {isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : weeklyData.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-2">Your Weekly Nutrition Trends</h3>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Calorie intake has been {getCalorieTrend(weeklyData)} your goal.</p>
                      <p className="mt-2">Protein intake is {getProteinTrend(macroData)}.</p>
                      <p className="mt-2">Carb intake is {getCarbTrend(macroData)}.</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No trend data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Log meals for several days to see trends.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="meals">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <RecentMeals />
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Helper functions for trend analysis
const getCalorieTrend = (data: any[]) => {
  const average = data.reduce((sum, day) => sum + day.calories, 0) / data.length;
  const goal = data[0]?.goal || 2000;
  
  if (average < goal * 0.85) return "consistently below";
  if (average > goal * 1.15) return "consistently above";
  return "close to";
};

const getProteinTrend = (data: any[]) => {
  const protein = data.find(item => item.name === "Protein");
  if (!protein) return "not tracked";
  
  const ratio = protein.current / protein.goal;
  if (ratio < 0.8) return "lower than recommended";
  if (ratio > 1.2) return "higher than recommended";
  return "at a good level";
};

const getCarbTrend = (data: any[]) => {
  const carbs = data.find(item => item.name === "Carbs");
  if (!carbs) return "not tracked";
  
  const ratio = carbs.current / carbs.goal;
  if (ratio < 0.8) return "lower than recommended";
  if (ratio > 1.2) return "higher than recommended";
  return "at a good level";
};

// Component to display recent meals
const RecentMeals = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRecentMeals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'meal_logged')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setMeals(data || []);
      } catch (error) {
        console.error('Error fetching recent meals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentMeals();
  }, [user]);
  
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }
  
  if (meals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No meal data available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Start logging your meals to see them here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Recent Meals</h3>
      {meals.map((meal, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium capitalize">{meal.metadata?.meal_type || 'Meal'}</h4>
                {meal.metadata?.food_items && (
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(meal.metadata.food_items) 
                      ? meal.metadata.food_items.join(', ') 
                      : meal.metadata.food_items}
                  </p>
                )}
                {meal.metadata?.scanned_food?.name && (
                  <p className="text-sm text-muted-foreground">
                    {meal.metadata.scanned_food.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(meal.created_at).toLocaleDateString()} at {new Date(meal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              {meal.metadata?.scanned_food && (
                <div className="text-right">
                  <p className="text-sm font-medium">{meal.metadata.scanned_food.calories || 0} cal</p>
                  <div className="flex text-xs text-muted-foreground space-x-2">
                    <span>P: {meal.metadata.scanned_food.protein || 0}g</span>
                    <span>C: {meal.metadata.scanned_food.carbs || 0}g</span>
                    <span>F: {meal.metadata.scanned_food.fat || 0}g</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NutritionInsights;
