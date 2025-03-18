
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { ChevronUp, ChevronDown, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { macroData } from "../data/mock-nutrition-data";

const GoalProgressCard: React.FC = () => {
  return (
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
  );
};

export default GoalProgressCard;
