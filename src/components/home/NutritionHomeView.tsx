
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Utensils } from "lucide-react";
import CalorieIntakeCard from "@/components/nutrition/components/CalorieIntakeCard";
import MacroDistributionCard from "@/components/nutrition/components/MacroDistributionCard";
import GoalProgressCard from "@/components/nutrition/components/GoalProgressCard";
import TodaysFoodConsumption from "@/components/home/TodaysFoodConsumption";

const NutritionHomeView: React.FC = () => {
  const navigate = useNavigate();

  // Container animation settings
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" className="overflow-hidden border-green-100/40 dark:border-green-900/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center">
                <Utensils className="mr-2 h-4 w-4 text-green-500" />
                Nutrition Summary
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => navigate('/nutrition')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <CalorieIntakeCard />
              </motion.div>
              
              <motion.div variants={item}>
                <MacroDistributionCard />
              </motion.div>
              
              <motion.div variants={item}>
                <GoalProgressCard />
              </motion.div>
              
              <motion.div variants={item}>
                <TodaysFoodConsumption />
              </motion.div>
              
              <div className="flex justify-center mt-2">
                <Button
                  variant="green-gradient"
                  size="sm"
                  className="shadow-sm"
                  onClick={() => navigate('/nutrition')}
                >
                  View Detailed Nutrition
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NutritionHomeView;
