
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

  const actions = [
    { 
      icon: <PlusCircle className={iconSize} />, 
      label: "Log Meal", 
      onClick: () => navigate("/log-meal"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <UtensilsCrossed className={iconSize} />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Salad className={iconSize} />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Brain className={iconSize} />, 
      label: "AI Assistant", 
      onClick: () => document.getElementById('ai-health-assistant')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Droplets className={iconSize} />, 
      label: "Water Intake", 
      onClick: () => document.getElementById('water-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Moon className={iconSize} />, 
      label: "Sleep Tracker", 
      onClick: () => document.getElementById('sleep-tracker')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Scale className={iconSize} />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Dumbbell className={iconSize} />, 
      label: "Workouts", 
      onClick: () => navigate("/workout"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Target className={iconSize} />, 
      label: "Goals", 
      onClick: () => navigate("/goals-tracker"),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Bell className={iconSize} />, 
      label: "Meal Reminders", 
      onClick: () => document.getElementById('meal-reminders')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Utensils className={iconSize} />, 
      label: "Meal Recommendations", 
      onClick: () => document.getElementById('meal-recommendations')?.scrollIntoView({ behavior: 'smooth' }),
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <Activity className={iconSize} />, 
      label: "Workout Suggestions", 
      onClick: () => navigate("/workout-suggestions"),
      textColor: "text-white",
      shadow: "shadow-purple"
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
                className={`rounded-full mb-2 md:mb-3 ${action.textColor} bg-[#8B5CF6] hover:bg-[#7C3AED] ${action.shadow} hover:scale-105 transition-transform`}
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
