import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import GoalTracker from "@/components/home/GoalTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Target, Plus, CheckCircle, CircleX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "react-router-dom";

interface Goal {
  id: number;
  title: string;
  progress: number;
  target: string;
  dueDate?: string;
}

const GoalsTracker = () => {
  const location = useLocation();
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
    { 
      id: 4, 
      title: "Meditate for 10 minutes", 
      progress: 45, 
      target: "10 min/day" 
    },
    { 
      id: 5, 
      title: "Reduce sugar intake", 
      progress: 25, 
      target: "20g/day" 
    },
  ]);
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    dueDate: ""
  });
  
  useEffect(() => {
    if (location.state && location.state.showAddGoal) {
      setShowAddGoal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target) {
      setGoals([
        ...goals, 
        {
          id: Date.now(),
          title: newGoal.title,
          target: newGoal.target,
          progress: 0,
          dueDate: newGoal.dueDate || undefined
        }
      ]);
      setNewGoal({ title: "", target: "", dueDate: "" });
      setShowAddGoal(false);
    }
  };
  
  const updateGoalProgress = (id: number, newProgress: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, progress: newProgress } : goal
    ));
  };
  
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header title="Goals Tracker" />
        <main className="flex-1 container mx-auto px-4 pb-20 pt-4">
          
          {/* Hero Section */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-700">
              Goals Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Track your progress, achieve your goals</p>
          </div>
          
          {/* Goals List */}
          <div className="space-y-4 mb-6">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-teal-200/30 dark:border-teal-800/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-teal-50/5 dark:from-teal-900/10 dark:to-teal-900/5 z-0"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-base font-medium flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                          <span>{goal.title}</span>
                          {goal.progress === 100 && <CheckCircle className="h-4 w-4 text-teal-600" />}
                        </h4>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-xs bg-white/50 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300">
                            {goal.target}
                          </Badge>
                          {goal.dueDate && (
                            <Badge variant="outline" className="text-xs bg-white/50 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300">
                              Due: {goal.dueDate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                          {goal.progress}%
                        </span>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteGoal(goal.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <CircleX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <Progress 
                        value={goal.progress} 
                        className="h-2 bg-white/70 dark:bg-white/10" 
                        indicatorClassName={`bg-gradient-to-r ${
                          goal.progress < 50 ? "from-teal-400 to-teal-500" : "from-teal-500 to-teal-600"
                        }`}
                      />
                      
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="ghost" 
                          size="xs"
                          className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 h-6"
                          onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                        >
                          -10%
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="xs"
                          className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 h-6"
                          onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                        >
                          +10%
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Add Goal Form */}
          {showAddGoal ? (
            <Card className="border border-teal-200/50 dark:border-teal-800/30 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-teal-700 dark:text-teal-300">Add New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block text-teal-700 dark:text-teal-300">Goal Title</label>
                  <Input 
                    placeholder="e.g., Run 5k" 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-teal-700 dark:text-teal-300">Target</label>
                  <Input 
                    placeholder="e.g., 5km or 30 min/day" 
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-teal-700 dark:text-teal-300">Due Date (Optional)</label>
                  <Input 
                    placeholder="e.g., Sep 30" 
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                    className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="teal-gradient" 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    onClick={handleAddGoal}
                  >
                    Add Goal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-teal-300"
                    onClick={() => setShowAddGoal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              variant="glass"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 border border-teal-200/50 dark:border-teal-800/30 text-teal-700 dark:text-teal-300 mb-6"
              onClick={() => setShowAddGoal(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Goal
            </Button>
          )}
          
          {/* Additional goal-related components */}
          <div className="mb-8">
            <GoalTracker />
          </div>
          
        </main>
        <MobileNavbar />
      </div>
    </PageTransition>
  );
};

export default GoalsTracker;
