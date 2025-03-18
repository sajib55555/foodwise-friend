import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLog } from "@/contexts/ActivityLogContext";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  target_date: string | null;
  status: string;
}

const GoalTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useActivityLog();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_value: 0,
    unit: "",
    category: "fitness",
    target_date: ""
  });
  const [open, setOpen] = useState(false);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setGoals(data || []);
    } catch (error: any) {
      console.error("Error fetching goals:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching goals",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user) return;
    
    try {
      if (!newGoal.title || !newGoal.target_value || !newGoal.unit) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill out all required fields.",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from("user_goals")
        .insert([
          {
            user_id: user.id,
            title: newGoal.title,
            description: newGoal.description || null,
            target_value: newGoal.target_value,
            current_value: 0,
            unit: newGoal.unit,
            category: newGoal.category,
            target_date: newGoal.target_date || null,
            status: "in_progress"
          },
        ])
        .select();
        
      if (error) throw error;
      
      setGoals([...(data || []), ...goals]);
      
      logActivity('goal_created', `Created new goal: ${newGoal.title}`, {
        goal_title: newGoal.title,
        target_value: newGoal.target_value,
        unit: newGoal.unit,
        category: newGoal.category
      });
      
      toast({
        title: "Goal created",
        description: "Your new goal has been created successfully.",
      });
      
      setNewGoal({
        title: "",
        description: "",
        target_value: 0,
        unit: "",
        category: "fitness",
        target_date: ""
      });
      setOpen(false);
      fetchGoals();
    } catch (error: any) {
      console.error("Error creating goal:", error.message);
      toast({
        variant: "destructive",
        title: "Error creating goal",
        description: error.message,
      });
    }
  };

  const handleUpdateProgress = async (id: string, value: number) => {
    if (!user) return;
    
    try {
      const goalToUpdate = goals.find(goal => goal.id === id);
      if (!goalToUpdate) return;
      
      const newValue = goalToUpdate.current_value + value;
      const status = newValue >= goalToUpdate.target_value ? "completed" : "in_progress";
      const wasCompleted = goalToUpdate.status !== "completed" && status === "completed";
      
      const { error } = await supabase
        .from("user_goals")
        .update({ 
          current_value: newValue,
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
      
      const { error: progressError } = await supabase
        .from("goal_progress")
        .insert([{
          goal_id: id,
          value: value,
          notes: `Manual update of ${value} ${goalToUpdate.unit}`
        }]);
        
      if (progressError) throw progressError;
      
      setGoals(goals.map(goal => {
        if (goal.id === id) {
          return {
            ...goal,
            current_value: newValue,
            status
          };
        }
        return goal;
      }));
      
      if (wasCompleted) {
        logActivity('goal_completed', `Completed goal: ${goalToUpdate.title}`, {
          goal_id: id,
          goal_title: goalToUpdate.title
        });
      } else {
        logActivity('goal_updated', `Updated progress on goal: ${goalToUpdate.title}`, {
          goal_id: id,
          goal_title: goalToUpdate.title,
          progress_value: value,
          current_value: newValue,
          target_value: goalToUpdate.target_value
        });
      }
      
      toast({
        title: wasCompleted ? "Goal completed!" : "Progress updated",
        description: wasCompleted 
          ? `Congratulations on completing your goal: ${goalToUpdate.title}!` 
          : `Added ${value} ${goalToUpdate.unit} to your goal.`,
      });
    } catch (error: any) {
      console.error("Error updating goal progress:", error.message);
      toast({
        variant: "destructive",
        title: "Error updating progress",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const categories = [
    { value: "fitness", label: "Fitness" },
    { value: "nutrition", label: "Nutrition" },
    { value: "health", label: "Health" },
    { value: "weight", label: "Weight" },
    { value: "hydration", label: "Hydration" },
    { value: "sleep", label: "Sleep" },
    { value: "other", label: "Other" }
  ];

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Goals Tracker
          </div>
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="purple-ghost">
              <Plus className="h-4 w-4 mr-1" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Run 100km this month"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter any details about your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    placeholder="100"
                    value={newGoal.target_value || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="km, kg, cups, etc."
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="target_date">Target Date (Optional)</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No goals set yet. Create your first goal to start tracking progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                  </div>
                  {getStatusBadge(goal.status)}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <Progress value={calculateProgress(goal.current_value, goal.target_value)} className="h-2" />
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => handleUpdateProgress(goal.id, 1)}
                  >
                    +1 {goal.unit}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => handleUpdateProgress(goal.id, 5)}
                  >
                    +5 {goal.unit}
                  </Button>
                  {goal.status !== "completed" && (
                    <Button 
                      size="sm" 
                      variant="purple" 
                      className="text-xs ml-auto"
                      onClick={() => handleUpdateProgress(goal.id, goal.target_value - goal.current_value)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTracker;
