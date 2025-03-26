import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Progress } from "@/components/ui/progress";
import { ChevronUp, ChevronDown, Bell, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoalItem {
  name: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  warning?: boolean;
}

const GoalProgressCard: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserGoals() {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error("Error fetching user goals:", error);
          return;
        }

        if (data && data.length > 0) {
          const formattedGoals: GoalItem[] = data.map(goal => {
            const isWarning = goal.target_date ? new Date(goal.target_date) < new Date() : false;
            const color = getGoalColor(goal.category);
            
            return {
              name: goal.title,
              current: Number(goal.current_value),
              goal: Number(goal.target_value),
              unit: goal.unit || '',
              color: color,
              warning: isWarning
            };
          });

          setGoals(formattedGoals);
        } else {
          setGoals([
            {
              name: "Daily Calorie Limit",
              current: 0,
              goal: 2000,
              unit: "kcal",
              color: "#f59e0b"
            },
            {
              name: "Protein Target",
              current: 0,
              goal: 80,
              unit: "g",
              color: "#3b82f6"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch user goals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserGoals();
  }, [user]);

  const getGoalColor = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'nutrition':
      case 'diet':
        return '#22c55e'; // green
      case 'weight':
        return '#f59e0b'; // amber
      case 'exercise':
      case 'fitness':
        return '#3b82f6'; // blue
      case 'sleep':
        return '#8b5cf6'; // purple
      case 'water':
        return '#0ea5e9'; // sky
      default:
        return '#64748b'; // slate
    }
  };

  const handleViewStatsClick = () => {
    navigate('/goals-tracker');
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {goals.length > 0 ? (
                goals.map((item, index) => (
                  <div key={index} className="space-y-1">
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
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No active goals found</p>
                  <p className="text-sm mt-1">Set goals to track your progress</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="rainbow-gradient" 
                  size="sm" 
                  className="gap-2 shadow-md"
                  onClick={handleViewStatsClick}
                >
                  <Sparkles className="h-4 w-4" />
                  View Detailed Stats
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalProgressCard;
