
import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Notifications = () => {
  const navigate = useNavigate();
  
  // Track the notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    pushAll: true,
    mealReminders: true,
    waterReminders: true,
    workoutReminders: true,
    emailAll: false,
    weeklySummary: false,
    appUpdates: true
  });
  
  const handleToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save notification settings - in a real app would call an API here
    toast.success("Notification settings saved", {
      description: "Your preferences have been updated"
    });
    
    // Navigate back to profile
    navigate("/profile");
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
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-all">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable all push notifications
                        </p>
                      </div>
                      <Switch 
                        id="push-all" 
                        checked={notificationSettings.pushAll}
                        onCheckedChange={() => handleToggle('pushAll')}
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
                        checked={notificationSettings.mealReminders}
                        onCheckedChange={() => handleToggle('mealReminders')}
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
                        checked={notificationSettings.waterReminders}
                        onCheckedChange={() => handleToggle('waterReminders')}
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
                        checked={notificationSettings.workoutReminders}
                        onCheckedChange={() => handleToggle('workoutReminders')}
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
                        checked={notificationSettings.emailAll}
                        onCheckedChange={() => handleToggle('emailAll')}
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
                        checked={notificationSettings.weeklySummary}
                        onCheckedChange={() => handleToggle('weeklySummary')}
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
                        checked={notificationSettings.appUpdates}
                        onCheckedChange={() => handleToggle('appUpdates')}
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
                    <Button type="submit" className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
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
