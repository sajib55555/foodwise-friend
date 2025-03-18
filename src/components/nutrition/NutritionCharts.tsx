
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

const NutritionCharts: React.FC = () => {
  // Sample data for weekly nutrition trends
  const weeklyData = [
    { day: "Mon", calories: 1850, protein: 85, carbs: 220, fat: 65 },
    { day: "Tue", calories: 1650, protein: 90, carbs: 180, fat: 60 },
    { day: "Wed", calories: 1720, protein: 95, carbs: 190, fat: 58 },
    { day: "Thu", calories: 1950, protein: 100, carbs: 210, fat: 70 },
    { day: "Fri", calories: 1820, protein: 88, carbs: 200, fat: 63 },
    { day: "Sat", calories: 2100, protein: 110, carbs: 240, fat: 72 },
    { day: "Sun", calories: 1950, protein: 105, carbs: 215, fat: 68 }
  ];

  // Sample data for macronutrient distribution
  const macroData = [
    { name: "Protein", value: 28 },
    { name: "Carbs", value: 45 },
    { name: "Fat", value: 27 }
  ];

  const lineChartConfig = {
    calories: { color: "#7c3aed" },
    protein: { color: "#3b82f6" },
    carbs: { color: "#22c55e" },
    fat: { color: "#f59e0b" }
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Nutrition Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calories" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calories">
            <div className="h-64">
              <ChartContainer config={lineChartConfig}>
                <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    name="Calories" 
                    stroke="#7c3aed" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="macros">
            <div className="h-64">
              <ChartContainer config={lineChartConfig}>
                <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    name="Protein" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    name="Carbs" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fat" 
                    name="Fat" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Last 7 days
          </span>
          <span className="text-purple-500 cursor-pointer">View detailed analytics →</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCharts;
