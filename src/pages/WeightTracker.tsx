
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import WeightHistoryList from "@/components/weight/WeightHistoryList";
import WeightChart from "@/components/weight/WeightChart";
import WeightStatsCards from "@/components/weight/WeightStatsCards";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const WeightTracker = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightEntries, setWeightEntries] = useState<{
    id: string;
    weight: number;
    date: string;
    formattedDate: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { logActivity } = useActivityLog();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    async function fetchWeightData() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'weight_logged')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedEntries = data.map(entry => {
            const metadata = entry.metadata || {};
            const dateObj = new Date(entry.created_at);
            
            return {
              id: entry.id,
              weight: Number(metadata.weight_value) || 0,
              date: format(dateObj, 'yyyy-MM-dd'),
              formattedDate: format(dateObj, 'MMM d')
            };
          });
          
          setWeightEntries(formattedEntries);
        }
      } catch (error) {
        console.error('Error fetching weight data:', error);
        toast({
          title: "Failed to load weight history",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWeightData();
  }, [user, toast]);

  const handleAddWeight = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to log your weight",
        variant: "destructive",
      });
      return;
    }
    
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight value.",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");
    const formattedDateStr = format(today, "MMM d");
    
    // Log to user_activity_logs
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert([
        {
          user_id: user.id,
          activity_type: 'weight_logged',
          description: `Logged weight: ${weightValue} kg`,
          metadata: {
            weight_value: weightValue,
            date: dateStr
          }
        }
      ])
      .select();
      
    if (error) {
      console.error('Error logging weight:', error);
      toast({
        title: "Failed to save weight",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }
    
    // Also update the user's profile with the latest weight
    await supabase
      .from('profiles')
      .update({ weight: weightValue.toString() })
      .eq('id', user.id);
    
    const newEntry = {
      id: data?.[0]?.id || Date.now().toString(),
      weight: weightValue,
      date: dateStr,
      formattedDate: formattedDateStr,
    };
    
    setWeightEntries([newEntry, ...weightEntries]);
    setWeight("");
    setAddDialogOpen(false);
    
    logActivity('weight_logged', `Logged weight: ${weightValue} kg`, {
      weight_value: weightValue,
      date: dateStr
    });
    
    toast({
      title: "Weight Added",
      description: "Your weight has been successfully recorded.",
    });
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    const entryToDelete = weightEntries.find(entry => entry.id === id);
    
    if (!entryToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setWeightEntries(weightEntries.filter(entry => entry.id !== id));
      
      logActivity('weight_deleted', `Deleted weight entry: ${entryToDelete.weight} kg`, {
        weight_value: entryToDelete.weight,
        date: entryToDelete.date
      });
      
      toast({
        title: "Entry Deleted",
        description: "Weight entry has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      toast({
        title: "Failed to delete entry",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <PageTransition>
      <Header title="Weight Tracker" showBackButton />
      <main className="container mx-auto px-4 pb-24 pt-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WeightStatsCards weightEntries={weightEntries} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Weight Progress</CardTitle>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="purple" className="h-8">
                        <Plus className="h-4 w-4 mr-1" /> Add Weight
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Weight Entry</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            placeholder="Enter your weight"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleAddWeight}
                          className="w-full"
                          variant="purple"
                        >
                          Add Entry
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Track your weight over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                ) : weightEntries.length > 0 ? (
                  <WeightChart weightEntries={weightEntries} />
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No weight entries found</p>
                    <p className="text-sm mt-1">Add a weight entry to see your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <WeightHistoryList 
              weightEntries={weightEntries} 
              onDelete={handleDeleteEntry} 
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default WeightTracker;
