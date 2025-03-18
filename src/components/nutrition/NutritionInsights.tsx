
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { ChevronUp, ChevronDown, Sparkles, Bell, Award } from "lucide-react";
import { Button } from "@/components/ui/button-custom";

// Mock data for the nutrition insights
const weeklyData = [
  { name: "Mon", calories: 1800, protein: 85, carbs: 210, fat: 60, goal: 2000 },
  { name: "Tue", calories: 2100, protein: 90, carbs: 240, fat: 70, goal: 2000 },
  { name: "Wed", calories: 1950, protein: 100, carbs: 200, fat: 65, goal: 2000 },
  { name: "Thu", calories: 1750, protein: 95, carbs: 190, fat: 55, goal: 2000 },
  { name: "Fri", calories: 2200, protein: 110, carbs: 230, fat: 75, goal: 2000 },
  { name: "Sat", calories: 2400, protein: 105, carbs: 260, fat: 85, goal: 2000 },
  { name: "Sun", calories: 1900, protein: 88, carbs: 220, fat: 62, goal: 2000 },
];

const macroData = [
  { name: "Protein", current: 92, goal: 100, unit: "g", color: "#8884d8" },
  { name: "Carbs", current: 220, goal: 250, unit: "g", color: "#82ca9d" },
  { name: "Fat", current: 67, goal: 70, unit: "g", color: "#ffc658" },
  { name: "Fiber", current: 22, goal: 30, unit: "g", color: "#8dd1e1" },
  { name: "Sugar", current: 45, goal: 40, unit: "g", color: "#ff8042", warning: true },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 border rounded-md p-2 text-xs shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }}>
            {item.name}: {item.value} {item.name === "Calories" ? "kcal" : "g"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const NutritionInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" className="border border-green-200/30 dark:border-green-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <div className="mr-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              Weekly Calorie Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="goal"
                    name="Goal"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card variant="glass" className="border border-blue-200/30 dark:border-blue-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <div className="mr-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="h-3.5 w-3.5 text-white" />
              </div>
              Macronutrient Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  barSize={20}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="protein"
                    name="Protein"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="carbs"
                    name="Carbs"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="fat"
                    name="Fat"
                    fill="#ffc658"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card variant="glass" className="border border-purple-200/30 dark:border-purple-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <div className="mr-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-white" />
              </div>
              Today's Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {macroData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="flex items-center">
                      <span>{item.current}/{item.goal} {item.unit}</span>
                      {item.warning ? (
                        <ChevronUp className="h-4 w-4 ml-1 text-red-500" />
                      ) : item.current >= item.goal ? (
                        <ChevronUp className="h-4 w-4 ml-1 text-green-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1 text-amber-500" />
                      )}
                    </span>
                  </div>
                  <Progress 
                    value={(item.current / item.goal) * 100} 
                    className={
                      item.warning 
                        ? "bg-red-100 dark:bg-red-950/30" 
                        : item.current >= item.goal 
                        ? "bg-green-100 dark:bg-green-950/30" 
                        : "bg-blue-100 dark:bg-blue-950/30"
                    }
                    indicatorClassName={
                      item.warning 
                        ? "bg-red-500" 
                        : item.current >= item.goal 
                        ? "bg-green-500" 
                        : "bg-blue-500"
                    }
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button variant="rainbow-gradient" size="sm" className="gap-2 shadow-md">
                <Sparkles className="h-4 w-4" />
                View Detailed Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NutritionInsights;
