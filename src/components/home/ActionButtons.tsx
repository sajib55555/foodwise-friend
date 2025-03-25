
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { 
  PlusCircle, 
  UtensilsCrossed, 
  Salad, 
  Scale, 
  Dumbbell, 
  Target,
  Brain,
  Droplets,
  Moon,
  Bell,
  Utensils,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const ActionButtons = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Button sizing - increased by 20% from previous values
  const buttonSize = isMobile ? 'w-18 h-18' : 'w-30 h-30';
  const iconSize = isMobile ? 'h-7 w-7' : 'h-9 w-9';

  // Define color map for each action based on the screenshot
  const actionColors = {
    "Log Meal": "bg-purple-500 hover:bg-purple-600",
    "Food Scanner": "bg-blue-500 hover:bg-blue-600",
    "Meal Plans": "bg-green-500 hover:bg-green-600",
    "AI Assistant": "bg-indigo-500 hover:bg-indigo-600",
    "Water Intake": "bg-cyan-500 hover:bg-cyan-600",
    "Sleep Tracker": "bg-violet-500 hover:bg-violet-600",
    "Weight": "bg-amber-500 hover:bg-amber-600",
    "Workouts": "bg-pink-500 hover:bg-pink-600",
    "Goals": "bg-emerald-500 hover:bg-emerald-600",
    "Meal Reminders": "bg-rose-500 hover:bg-rose-600",
    "Meal Recommendations": "bg-orange-500 hover:bg-orange-600",
    "Workout Suggestions": "bg-blue-600 hover:bg-blue-700"
  };

  const actions = [
    { 
      icon: <PlusCircle className={iconSize} />, 
      label: "Log Meal", 
      onClick: () => navigate("/log-meal"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <UtensilsCrossed className={iconSize} />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Salad className={iconSize} />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Brain className={iconSize} />, 
      label: "AI Assistant", 
      onClick: () => document.getElementById('ai-health-assistant')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Droplets className={iconSize} />, 
      label: "Water Intake", 
      onClick: () => document.getElementById('water-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Moon className={iconSize} />, 
      label: "Sleep Tracker", 
      onClick: () => document.getElementById('sleep-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Scale className={iconSize} />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Dumbbell className={iconSize} />, 
      label: "Workouts", 
      onClick: () => navigate("/workout"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Target className={iconSize} />, 
      label: "Goals", 
      onClick: () => navigate("/goals-tracker"),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Bell className={iconSize} />, 
      label: "Meal Reminders", 
      onClick: () => document.getElementById('meal-reminders')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Utensils className={iconSize} />, 
      label: "Meal Recommendations", 
      onClick: () => document.getElementById('meal-recommendations')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-sm"
    },
    { 
      icon: <Activity className={iconSize} />, 
      label: "Workout Suggestions", 
      onClick: () => navigate("/workout-suggestions"),
      textColor: "text-white",
      shadow: "shadow-sm"
    }
  ];

  return (
    <Card variant="glass" className="border border-purple-200/30 dark:border-purple-800/20 pb-6">
      <CardContent className="p-3 md:p-8">
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-4' : 'grid-cols-4 gap-6'} md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4`}>
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <Button 
                variant="ghost"
                size="icon"
                className={`rounded-full mb-2 md:mb-3 ${action.textColor} ${actionColors[action.label]} hover:scale-105 transition-transform`}
                onClick={action.onClick}
                style={{ width: isMobile ? '4.5rem' : '7rem', height: isMobile ? '4.5rem' : '7rem' }}
              >
                {action.icon}
              </Button>
              <span className="text-[10px] md:text-sm font-medium text-center mt-1">{action.label}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
