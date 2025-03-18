
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { User, Settings, Bell, Shield, LogOut, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/utils/transitions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Profile = () => {
  const { user, profile, subscription, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing");
  };

  const menuItems = [
    { id: "personal", icon: User, label: "Personal Information", path: "/profile/personal" },
    { id: "preferences", icon: Settings, label: "Preferences", path: "/profile/preferences" },
    { id: "notifications", icon: Bell, label: "Notifications", path: "/profile/notifications" },
    { id: "privacy", icon: Shield, label: "Privacy & Security", path: "/profile/privacy" },
    { id: "subscription", icon: Calendar, label: "Subscription", path: "/profile/subscription" }
  ];

  const getSubscriptionStatus = () => {
    if (!subscription) return "Unknown";
    if (subscription.status === "trial") {
      return subscription.trial_ends_at 
        ? `Trial (ends ${format(new Date(subscription.trial_ends_at), "MMM d, yyyy")})`
        : "Trial";
    }
    return subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
  };

  // Placeholder data when profile isn't loaded yet
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "loading@example.com",
    weight: profile?.weight || "Not set",
    height: profile?.height || "Not set",
    goal: profile?.goal || "Not set",
    preferences: profile?.preferences || ["Not set"]
  };

  return (
    <>
      <Header title="Profile" showBackButton />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <div className="space-y-6">
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-medium">{userData.name}</h2>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{userData.weight}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">{userData.height}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="font-medium">{userData.goal}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Subscription</p>
                    <p className="font-medium">{getSubscriptionStatus()}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {menuItems.map((menuItem) => {
                const Icon = menuItem.icon;
                return (
                  <motion.div key={menuItem.id} variants={staggerItem}>
                    <Card 
                      variant="glass-sm" 
                      className="cursor-pointer"
                      onClick={() => navigate(menuItem.path)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3 rounded-full bg-muted/70 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{menuItem.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Button 
              variant="outline" 
              className="w-full mt-4 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Profile;
