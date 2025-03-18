
import React from "react";
import CalorieIntakeCard from "./components/CalorieIntakeCard";
import MacroDistributionCard from "./components/MacroDistributionCard";
import GoalProgressCard from "./components/GoalProgressCard";

const NutritionInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <CalorieIntakeCard />
      <MacroDistributionCard />
      <GoalProgressCard />
    </div>
  );
};

export default NutritionInsights;
