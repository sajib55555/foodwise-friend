
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

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
  { name: "Protein", current: 92, goal: 100, unit: "g" },
  { name: "Carbs", current: 220, goal: 250, unit: "g" },
  { name: "Fat", current: 67, goal: 70, unit: "g" },
  { name: "Fiber", current: 22, goal: 30, unit: "g" },
  { name: "Sugar", current: 45, goal: 40, unit: "g" },
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
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Calorie Intake</CardTitle>
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
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  name="Goal"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Macronutrient Distribution</CardTitle>
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

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Today's Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {macroData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>
                    {item.current}/{item.goal} {item.unit}
                  </span>
                </div>
                <Progress 
                  value={(item.current / item.goal) * 100} 
                  className={item.name === "Sugar" && item.current > item.goal 
                    ? "bg-red-200" 
                    : "bg-blue-50"
                  } 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionInsights;
