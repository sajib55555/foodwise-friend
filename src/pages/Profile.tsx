
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { User, Settings, Bell, Shield, LogOut, Calendar, Crown, BadgeCheck, ChevronRight, Sparkles } from "lucide-react";
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
    { id: "personal", icon: User, label: "Personal Information", path: "/profile/personal", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" },
    { id: "preferences", icon: Settings, label: "Preferences", path: "/profile/preferences", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300" },
    { id: "notifications", icon: Bell, label: "Notifications", path: "/profile/notifications", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" },
    { id: "privacy", icon: Shield, label: "Privacy & Security", path: "/profile/privacy", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300" },
    { id: "subscription", icon: Calendar, label: "Subscription", path: "/profile/subscription", color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300" }
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
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/5 rounded-full filter blur-3xl -z-10"></div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="glass" className="overflow-hidden border border-purple-200/30 dark:border-purple-800/20">
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white rounded-full opacity-20"></div>
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white rounded-full opacity-20"></div>
                  </div>
                </div>
                <CardContent className="pt-0 relative -mt-10">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white dark:border-gray-800">
                      {subscription?.status === "active" ? (
                        <Crown className="h-8 w-8 text-white" />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-xl font-medium">{userData.name}</h2>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      {subscription?.status === "active" && (
                        <div className="mt-1 inline-flex items-center bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full text-xs text-purple-700 dark:text-purple-300">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Premium Member
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/20">
                      <p className="text-xs text-blue-600 dark:text-blue-300">Weight</p>
                      <p className="font-medium">{userData.weight}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg shadow-sm border border-green-100 dark:border-green-800/20">
                      <p className="text-xs text-green-600 dark:text-green-300">Height</p>
                      <p className="font-medium">{userData.height}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg shadow-sm border border-amber-100 dark:border-amber-800/20">
                      <p className="text-xs text-amber-600 dark:text-amber-300">Goal</p>
                      <p className="font-medium">{userData.goal}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800/20">
                      <p className="text-xs text-purple-600 dark:text-purple-300">Subscription</p>
                      <p className="font-medium">{getSubscriptionStatus()}</p>
                    </div>
                  </div>

                  <Button 
                    variant="purple-gradient" 
                    className="w-full mt-4 gap-2"
                    onClick={() => navigate("/profile/personal")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {menuItems.map((menuItem, index) => {
                const Icon = menuItem.icon;
                return (
                  <motion.div 
                    key={menuItem.id} 
                    variants={staggerItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      variant="glass-sm" 
                      className="cursor-pointer border border-purple-100/30 dark:border-purple-800/20 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all"
                      onClick={() => navigate(menuItem.path)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 mr-3 rounded-full ${menuItem.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium">{menuItem.label}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button 
                variant="outline" 
                className="w-full mt-4 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </motion.div>
          </div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Profile;
