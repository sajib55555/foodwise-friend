
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { PlusCircle, UtensilsCrossed, Salad, Scale, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const ActionButtons = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const actions = [
    { 
      icon: <PlusCircle className="h-5 w-5" />, 
      label: "Log Meal", 
      onClick: () => navigate("/log-meal"),
      gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
      shadow: "shadow-purple"
    },
    { 
      icon: <UtensilsCrossed className="h-5 w-5" />, 
      label: "Food Scanner", 
      onClick: () => navigate("/scan"),
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      shadow: "shadow-blue"
    },
    { 
      icon: <Salad className="h-5 w-5" />, 
      label: "Meal Plans", 
      onClick: () => navigate("/plans"),
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
      shadow: "shadow-green"
    },
    { 
      icon: <Scale className="h-5 w-5" />, 
      label: "Weight", 
      onClick: () => navigate("/weight"),
      gradient: "bg-gradient-to-br from-amber-400 to-amber-600",
      shadow: "shadow-amber"
    },
    { 
      icon: <Dumbbell className="h-5 w-5" />, 
      label: "Workouts", 
      onClick: () => navigate("/workout"),
      gradient: "bg-gradient-to-br from-pink-400 to-pink-600",
      shadow: "shadow-pink"
    }
  ];

  return (
    <Card variant="glass" className="border border-purple-200/30 dark:border-purple-800/20">
      <CardContent className="p-3 md:p-6">
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-5 gap-3'}`}>
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <Button 
                variant="ghost"
                size="icon"
                className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full mb-1 md:mb-2 text-white ${action.gradient} ${action.shadow} hover:scale-105 transition-transform`}
                onClick={action.onClick}
              >
                {action.icon}
              </Button>
              <span className="text-[10px] md:text-xs font-medium text-center">{action.label}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
