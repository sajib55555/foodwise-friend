
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Award } from "lucide-react";
import CustomTooltip from "./CustomTooltip";
import { weeklyData } from "../data/mock-nutrition-data";

const MacroDistributionCard: React.FC = () => {
  return (
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
  );
};

export default MacroDistributionCard;
