
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";

interface MacroDistributionCardProps {
  protein?: number;
  carbs?: number;
  fat?: number;
  data?: any[]; // Added to support the data prop
}

const MacroDistributionCard: React.FC<MacroDistributionCardProps> = ({ 
  protein = 0, 
  carbs = 0, 
  fat = 0,
  data
}) => {
  // Process data if it's provided
  let proteinVal = protein;
  let carbsVal = carbs;
  let fatVal = fat;

  if (data && data.length > 0) {
    // If data is in format [{name: "Protein", current: 50, goal: 100}, ...]
    const proteinData = data.find(item => item.name === "Protein");
    const carbsData = data.find(item => item.name === "Carbs");
    const fatData = data.find(item => item.name === "Fat");
    
    if (proteinData) proteinVal = proteinData.current || 0;
    if (carbsData) carbsVal = carbsData.current || 0;
    if (fatData) fatVal = fatData.current || 0;
  }
  
  // Calculate total
  const total = proteinVal + carbsVal + fatVal;
  
  // Calculate percentages
  const proteinPercentage = total > 0 ? Math.round((proteinVal / total) * 100) : 0;
  const carbsPercentage = total > 0 ? Math.round((carbsVal / total) * 100) : 0;
  const fatPercentage = total > 0 ? Math.round((fatVal / total) * 100) : 0;
  
  // Prepare data for chart
  const chartData = [
    { name: "Protein", value: proteinVal, percentage: proteinPercentage, color: "#3b82f6" },
    { name: "Carbs", value: carbsVal, percentage: carbsPercentage, color: "#22c55e" },
    { name: "Fat", value: fatVal, percentage: fatPercentage, color: "#f59e0b" }
  ].filter(item => item.value > 0);
  
  // If no data, provide default empty state
  if (total === 0) {
    chartData.push(
      { name: "No Data", value: 1, percentage: 100, color: "#e5e7eb" }
    );
  }
  
  // Chart configuration
  const chartConfig = {
    protein: { color: "#3b82f6", label: "Protein" },
    carbs: { color: "#22c55e", label: "Carbs" },
    fat: { color: "#f59e0b", label: "Fat" },
    noData: { color: "#e5e7eb", label: "No Data" }
  };
  
  return (
    <Card variant="glass" className="overflow-hidden border-blue-100 dark:border-blue-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <PieChartIcon className="mr-2 h-4 w-4 text-blue-500" />
          Macro Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <ChartContainer className="h-44 w-full max-w-xs mx-auto" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="transparent"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}g`, ""]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col space-y-2 mt-4 sm:mt-0"
          >
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-medium">
                  {item.name !== "No Data" ? `${item.value}g (${item.percentage}%)` : ""}
                </span>
              </div>
            ))}
            
            {total > 0 && (
              <div className="pt-2 mt-2 border-t border-blue-100 dark:border-blue-800/30">
                <span className="text-sm font-medium">Total: {total}g</span>
              </div>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacroDistributionCard;
