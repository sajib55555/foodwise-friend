
import React from "react";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Activity, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutStatsCardsProps {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
}

const WorkoutStatsCards: React.FC<WorkoutStatsCardsProps> = ({
  totalWorkouts,
  totalCalories,
  totalDuration
}) => {
  const isMobile = useIsMobile();
  
  const stats = [
    {
      title: "Total Workouts",
      value: totalWorkouts,
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      color: "bg-gradient-to-br from-purple-500/10 to-purple-500/5",
      textGradient: "text-gradient-purple",
      glassColor: "glass-purple pulse-glow-purple",
      iconBg: "bg-purple-100 dark:bg-purple-900/40"
    },
    {
      title: "Calories Burned",
      value: `${totalCalories} kcal`,
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      color: "bg-gradient-to-br from-orange-500/10 to-orange-500/5",
      textGradient: "text-gradient-amber",
      glassColor: "glass-amber pulse-glow-amber",
      iconBg: "bg-orange-100 dark:bg-orange-900/40"
    },
    {
      title: "Total Duration",
      value: `${totalDuration} min`,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
      textGradient: "text-gradient-blue",
      glassColor: "glass-blue pulse-glow-blue",
      iconBg: "bg-blue-100 dark:bg-blue-900/40"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="h-full"
        >
          <Card 
            variant="glass" 
            className={`h-full shadow-lg border border-white/20 dark:border-white/5 ${isMobile ? '' : 'hover:scale'}`}
            hover={isMobile ? "default" : "lift"}
          >
            <CardContent className={`p-5 flex ${isMobile ? 'flex-row items-center' : 'flex-col items-center'} gap-4`}>
              <div className={`${stat.iconBg} w-12 h-12 rounded-full flex items-center justify-center ${stat.glassColor}`}>
                {stat.icon}
              </div>
              <div className={`${isMobile ? 'text-left' : 'text-center'} space-y-1`}>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className={`text-2xl font-bold ${stat.textGradient}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default WorkoutStatsCards;
