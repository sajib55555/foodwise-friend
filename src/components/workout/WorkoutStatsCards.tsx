
import React from "react";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Activity, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
  const stats = [
    {
      title: "Total Workouts",
      value: totalWorkouts,
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-100 dark:bg-purple-950/30",
      textColor: "text-purple-700 dark:text-purple-300"
    },
    {
      title: "Calories Burned",
      value: `${totalCalories} kcal`,
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      color: "bg-orange-100 dark:bg-orange-950/30",
      textColor: "text-orange-700 dark:text-orange-300"
    },
    {
      title: "Total Duration",
      value: `${totalDuration} min`,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-950/30",
      textColor: "text-blue-700 dark:text-blue-300"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <h3 className="text-sm font-medium">{stat.title}</h3>
                <p className={`text-lg font-semibold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default WorkoutStatsCards;
