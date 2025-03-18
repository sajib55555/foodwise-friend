
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Crown, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Subscription = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  
  const isSubscribed = subscription?.status === "active";
  const isTrial = subscription?.status === "trial";
  const isExpired = subscription?.status === "expired" || subscription?.status === "canceled";
  
  const getExpiryDate = () => {
    if (!subscription) return null;
    
    if (isTrial && subscription.trial_ends_at) {
      return format(new Date(subscription.trial_ends_at), "MMM d, yyyy");
    }
    
    if (subscription.ends_at) {
      return format(new Date(subscription.ends_at), "MMM d, yyyy");
    }
    
    return null;
  };
  
  const getNextBillingDate = () => {
    if (!subscription || !isSubscribed) return null;
    
    // This is placeholder logic - in a real app, you'd get this from the subscription object
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    return format(nextBillingDate, "MMM d, yyyy");
  };

  return (
    <>
      <Header title="Subscription" showBackButton />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Plan</CardTitle>
                  {isSubscribed && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30">
                      Active
                    </Badge>
                  )}
                  {isTrial && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
                      Trial
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30">
                      Expired
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {isSubscribed && "You are currently on the Premium plan"}
                  {isTrial && "You are currently on the Trial plan"}
                  {isExpired && "Your subscription has expired"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 border border-purple-200 dark:border-purple-800/30">
                  <div className="flex items-center">
                    <div className="mr-4 h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isSubscribed ? "Premium Plan" : isTrial ? "Trial Plan" : "Free Plan"}
                      </h3>
                      {getExpiryDate() && (
                        <p className="text-sm text-muted-foreground">
                          {isTrial ? "Trial ends on " : isExpired ? "Expired on " : "Next billing on "} 
                          {getExpiryDate()}
                        </p>
                      )}
                      {isSubscribed && getNextBillingDate() && (
                        <p className="text-sm text-muted-foreground">
                          Next billing on {getNextBillingDate()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Plan Features</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {(isSubscribed || isTrial) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>Advanced Nutrition Analytics</span>
                    </div>
                    
                    <div className="flex items-center">
                      {(isSubscribed || isTrial) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>Custom Meal Plans</span>
                    </div>
                    
                    <div className="flex items-center">
                      {isSubscribed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>AI-Powered Health Insights</span>
                    </div>
                    
                    <div className="flex items-center">
                      {isSubscribed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>Unlimited Food Scanning</span>
                    </div>
                  </div>
                </div>
                
                {!isSubscribed && (
                  <Button className="w-full btn-premium">
                    <Crown className="mr-2 h-4 w-4" />
                    {isExpired ? "Renew Subscription" : "Upgrade to Premium"}
                  </Button>
                )}
                
                {isSubscribed && (
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/profile")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Subscription;
