
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Bell, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { Alert } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supported, permissionGranted, requestPermission } = useNotifications();
  
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [mealReminders, setMealReminders] = useState(false);
  const [waterReminders, setWaterReminders] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [appUpdates, setAppUpdates] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Load user notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching notification preferences:", error);
        return;
      }
      
      if (data) {
        setPushNotificationsEnabled(data.push_enabled);
        setMealReminders(data.meal_reminders);
        setWaterReminders(data.water_reminders);
        setWorkoutReminders(data.workout_reminders);
        setEmailNotificationsEnabled(data.email_enabled);
        setWeeklySummary(data.weekly_summary);
        setAppUpdates(data.app_updates);
      }
    };
    
    loadNotificationPreferences();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // If enabling push notifications, request permission
      if (pushNotificationsEnabled && !permissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          setPushNotificationsEnabled(false);
          setSaving(false);
          return;
        }
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Save notification preferences
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          push_enabled: pushNotificationsEnabled,
          meal_reminders: mealReminders,
          water_reminders: waterReminders,
          workout_reminders: workoutReminders,
          email_enabled: emailNotificationsEnabled,
          weekly_summary: weeklySummary,
          app_updates: appUpdates,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // If disabling all push notifications, disable individual reminders as well
      if (!pushNotificationsEnabled) {
        setMealReminders(false);
        setWaterReminders(false);
        setWorkoutReminders(false);
      }
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handlePushToggle = (checked: boolean) => {
    setPushNotificationsEnabled(checked);
    
    // If disabling all push notifications, disable individual reminders as well
    if (!checked) {
      setMealReminders(false);
      setWaterReminders(false);
      setWorkoutReminders(false);
    }
  };
  
  const handleEmailToggle = (checked: boolean) => {
    setEmailNotificationsEnabled(checked);
    
    // If disabling all email notifications, disable individual email settings as well
    if (!checked) {
      setWeeklySummary(false);
      setAppUpdates(false);
    }
  };

  return (
    <>
      <Header title="Notifications" showBackButton />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">App Notifications</h3>
                    
                    {!supported && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Notifications not supported</p>
                          <p className="text-xs">Your browser doesn't support notifications. Some features may not work properly.</p>
                        </div>
                      </Alert>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-all">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable all push notifications
                        </p>
                      </div>
                      <Switch 
                        id="push-all" 
                        checked={pushNotificationsEnabled}
                        onCheckedChange={handlePushToggle}
                        disabled={!supported}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="meal-reminders">Meal Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders for meal tracking
                        </p>
                      </div>
                      <Switch 
                        id="meal-reminders" 
                        checked={mealReminders}
                        onCheckedChange={setMealReminders}
                        disabled={!pushNotificationsEnabled || !supported}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="water-reminders">Water Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders to drink water
                        </p>
                      </div>
                      <Switch 
                        id="water-reminders" 
                        checked={waterReminders}
                        onCheckedChange={setWaterReminders}
                        disabled={!pushNotificationsEnabled || !supported}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="workout-reminders">Workout Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders for scheduled workouts
                        </p>
                      </div>
                      <Switch 
                        id="workout-reminders" 
                        checked={workoutReminders}
                        onCheckedChange={setWorkoutReminders}
                        disabled={!pushNotificationsEnabled || !supported}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-all">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable all email notifications
                        </p>
                      </div>
                      <Switch 
                        id="email-all" 
                        checked={emailNotificationsEnabled}
                        onCheckedChange={handleEmailToggle}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-summary">Weekly Summary</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly progress reports via email
                        </p>
                      </div>
                      <Switch 
                        id="weekly-summary" 
                        checked={weeklySummary}
                        onCheckedChange={setWeeklySummary}
                        disabled={!emailNotificationsEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-updates">App Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about new features
                        </p>
                      </div>
                      <Switch 
                        id="app-updates" 
                        checked={appUpdates}
                        onCheckedChange={setAppUpdates}
                        disabled={!emailNotificationsEnabled}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/profile")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Notifications;
