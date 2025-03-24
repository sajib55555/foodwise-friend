
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
      gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
      textColor: "text-white",
      shadow: "shadow-purple"
    },
    { 
      icon: <UtensilsCrossed className={iconSize} />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      textColor: "text-white",
      shadow: "shadow-blue"
    },
    { 
      icon: <Salad className={iconSize} />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
      textColor: "text-white",
      shadow: "shadow-green"
    },
    { 
      icon: <Brain className={iconSize} />, 
      label: "AI Assistant", 
      onClick: () => {
        document.getElementById('ai-health-assistant')?.scrollIntoView({ behavior: 'smooth' });
        // Also scroll the voice assistant into view after a slight delay
        setTimeout(() => {
          document.getElementById('ai-voice-assistant')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      },
      gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      textColor: "text-white",
      shadow: "shadow-indigo"
    },
    { 
      icon: <Droplets className={iconSize} />, 
      label: "Water Intake", 
      onClick: () => navigate("/water-tracker"),
      gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600",
      textColor: "text-white",
      shadow: "shadow-cyan"
    },
    { 
      icon: <Moon className={iconSize} />, 
      label: "Sleep Tracker", 
      onClick: () => navigate("/sleep-tracker"),
      gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      textColor: "text-white",
      shadow: "shadow-indigo"
    },
    { 
      icon: <Scale className={iconSize} />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      gradient: "bg-gradient-to-br from-amber-400 to-amber-600",
      textColor: "text-white",
      shadow: "shadow-amber"
    },
    { 
      icon: <Dumbbell className={iconSize} />, 
      label: "Workouts", 
      onClick: () => navigate("/workout"),
      gradient: "bg-gradient-to-br from-pink-400 to-pink-600",
      textColor: "text-white",
      shadow: "shadow-pink"
    },
    { 
      icon: <Target className={iconSize} />, 
      label: "Goals", 
      onClick: () => navigate("/goals"),
      gradient: "bg-gradient-to-br from-teal-400 to-teal-600",
      textColor: "text-white",
      shadow: "shadow-teal"
    },
    { 
      icon: <Bell className={iconSize} />, 
      label: "Meal Reminders", 
      onClick: () => navigate("/meal-reminders"),
      gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
      textColor: "text-white",
      shadow: "shadow-orange"
    },
    { 
      icon: <Utensils className={iconSize} />, 
      label: "Meal Recommendations", 
      onClick: () => navigate("/meal-recommendations"),
      gradient: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      textColor: "text-white",
      shadow: "shadow-emerald"
    },
    { 
      icon: <Activity className={iconSize} />, 
      label: "Workout Suggestions", 
      onClick: () => navigate("/workout-suggestions"),
      gradient: "bg-gradient-to-br from-violet-400 to-violet-600",
      textColor: "text-white",
      shadow: "shadow-violet"
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
                className={`rounded-full mb-2 md:mb-3 ${action.textColor} ${action.gradient} ${action.shadow} hover:scale-105 transition-transform`}
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
