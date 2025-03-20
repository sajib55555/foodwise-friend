
import React from "react";
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

const Notifications = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save notification settings and navigate back
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
                      <Switch id="push-all" defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="meal-reminders">Meal Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders for meal tracking
                        </p>
                      </div>
                      <Switch id="meal-reminders" defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="water-reminders">Water Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders to drink water
                        </p>
                      </div>
                      <Switch id="water-reminders" defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="workout-reminders">Workout Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders for scheduled workouts
                        </p>
                      </div>
                      <Switch id="workout-reminders" defaultChecked={true} />
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
                      <Switch id="email-all" defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-summary">Weekly Summary</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly progress reports via email
                        </p>
                      </div>
                      <Switch id="weekly-summary" defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="app-updates">App Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about new features
                        </p>
                      </div>
                      <Switch id="app-updates" defaultChecked={true} />
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
