
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button-custom";
import { CheckCircle, Plus, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Goal {
  id: number;
  title: string;
  progress: number;
  target: string;
  dueDate?: string;
}

const GoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { 
      id: 1, 
      title: "Lose 5 pounds", 
      progress: 60, 
      target: "5 lbs", 
      dueDate: "Aug 30" 
    },
    { 
      id: 2, 
      title: "Run 3 times a week", 
      progress: 33, 
      target: "3 days/week" 
    },
    { 
      id: 3, 
      title: "Drink 2L water daily", 
      progress: 80, 
      target: "2L/day" 
    },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass" className="border border-green-300/30 dark:border-green-800/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-teal-50/20 dark:from-green-900/10 dark:to-teal-900/5 z-0"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 font-bold">
                Goals Tracker
              </span>
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-2 relative z-10">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium flex items-center gap-1.5 text-green-800 dark:text-green-300">
                      <span>{goal.title}</span>
                      {goal.progress === 100 && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </h4>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="text-xs bg-white/50 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300">
                        {goal.target}
                      </Badge>
                      {goal.dueDate && (
                        <Badge variant="outline" className="text-xs bg-white/50 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300">
                          Due: {goal.dueDate}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {goal.progress}%
                  </span>
                </div>
                <Progress 
                  value={goal.progress} 
                  className="h-2 bg-white/70 dark:bg-white/10" 
                  indicatorClassName={`bg-gradient-to-r ${
                    goal.progress < 50 ? "from-green-400 to-green-500" : "from-green-500 to-teal-500"
                  }`}
                />
              </li>
            ))}
          </ul>
          
          <Button 
            variant="outline" 
            className="w-full mt-6 border-green-300 bg-white/70 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all shadow-sm"
            size="sm"
          >
            Add New Goal
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalTracker;
