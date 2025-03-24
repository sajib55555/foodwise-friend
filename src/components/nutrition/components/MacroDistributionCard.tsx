
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MacroDistributionCardProps {
  protein?: number;
  carbs?: number;
  fat?: number;
  isLoading?: boolean;
}

const MacroDistributionCard: React.FC<MacroDistributionCardProps> = ({ 
  protein: propProtein, 
  carbs: propCarbs, 
  fat: propFat,
  isLoading = false
}) => {
  const [protein, setProtein] = useState(propProtein || 0);
  const [carbs, setCarbs] = useState(propCarbs || 0);
  const [fat, setFat] = useState(propFat || 0);
  const [loading, setLoading] = useState(isLoading);
  const { user } = useAuth();
  
  useEffect(() => {
    // Update component state when props change
    if (propProtein !== undefined) setProtein(propProtein);
    if (propCarbs !== undefined) setCarbs(propCarbs);
    if (propFat !== undefined) setFat(propFat);
    setLoading(isLoading);
  }, [propProtein, propCarbs, propFat, isLoading]);
  
  useEffect(() => {
    // Fetch user macros from database if not provided via props
    async function fetchUserMacros() {
      if (!user || (propProtein !== undefined && propCarbs !== undefined && propFat !== undefined)) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_macros')
          .select('protein, carbs, fat')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching user macros:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setProtein(data[0].protein || 0);
          setCarbs(data[0].carbs || 0);
          setFat(data[0].fat || 0);
        }
      } catch (err) {
        console.error("Failed to fetch user macros:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserMacros();
  }, [user, propProtein, propCarbs, propFat]);
  
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
  if (total === 0 && !loading) {
    data.push(
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
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <ChartContainer className="h-44 w-full max-w-xs mx-auto" config={chartConfig}>
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
        )}
      </CardContent>
    </Card>
  );
};

export default MacroDistributionCard;
