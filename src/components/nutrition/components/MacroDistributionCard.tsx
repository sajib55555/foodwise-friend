
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
}

const MacroDistributionCard: React.FC<MacroDistributionCardProps> = ({ 
  protein = 0, 
  carbs = 0, 
  fat = 0 
}) => {
  // Calculate total
  const total = protein + carbs + fat;
  
  // Calculate percentages
  const proteinPercentage = total > 0 ? Math.round((protein / total) * 100) : 0;
  const carbsPercentage = total > 0 ? Math.round((carbs / total) * 100) : 0;
  const fatPercentage = total > 0 ? Math.round((fat / total) * 100) : 0;
  
  // Prepare data for chart
  const data = [
    { name: "Protein", value: protein, percentage: proteinPercentage, color: "#3b82f6" },
    { name: "Carbs", value: carbs, percentage: carbsPercentage, color: "#22c55e" },
    { name: "Fat", value: fat, percentage: fatPercentage, color: "#f59e0b" }
  ].filter(item => item.value > 0);
  
  // If no data, provide default empty state
  if (total === 0) {
    data.push(
      { name: "No Data", value: 1, percentage: 100, color: "#e5e7eb" }
    );
  }
  
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
          <ChartContainer className="h-44 w-full max-w-xs mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="transparent"
                >
                  {data.map((entry, index) => (
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
            {data.map((item, index) => (
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
