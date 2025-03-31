import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Crown, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/contexts/ActivityLogContext";

const PREMIUM_MONTHLY_PRICE_ID = "price_1R8oc2Fk4w8hjVcVNXtH2BjR"; 

const Subscription = () => {
  const navigate = useNavigate();
  const { subscription, getSubscription, user } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [isLoading, setIsLoading] = useState(false);
  
  const isSubscribed = subscription?.status === "active";
  const isTrial = subscription?.status === "trial";
  const isExpired = subscription?.status === "expired" || subscription?.status === "canceled";
  
  const isTrialExpired = isTrial && subscription?.trial_ends_at && new Date(subscription.trial_ends_at) < new Date();

  const getExpiryDate = () => {
    if (!subscription) return null;
    
    if (isTrial && subscription.trial_ends_at) {
      return format(new Date(subscription.trial_ends_at), "MMM d, yyyy");
    }
    
    return null;
  };
  
  const getNextBillingDate = () => {
    if (!subscription || !isSubscribed) return null;
    
    if (subscription.next_billing_date) {
      return format(new Date(subscription.next_billing_date), "MMM d, yyyy");
    }
    
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    return format(nextBillingDate, "MMM d, yyyy");
  };

  const handleStartCheckout = async () => {
    try {
      setIsLoading(true);
      
      if (user) {
        try {
          await logActivity(
            'subscription_checkout_started',
            'User started subscription checkout process',
            { userId: user.id }
          );
        } catch (logError) {
          console.error('Error logging activity:', logError);
          // Continue with checkout even if logging fails
        }
      }
      
      const origin = window.location.origin;
      const successUrl = `${origin}/profile/subscription?success=true`;
      const cancelUrl = `${origin}/profile/subscription?canceled=true`;
      
      console.log("Initiating Stripe checkout...");
      
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: {
          action: 'create-checkout-session',
          data: {
            priceId: PREMIUM_MONTHLY_PRICE_ID,
            successUrl,
            cancelUrl
          }
        }
      });
      
      if (error) {
        console.error('Stripe function error:', error);
        throw new Error(error.message || "Failed to create checkout session");
      }
      
      if (data && data.url) {
        console.log("Redirecting to Stripe checkout URL:", data.url);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("No URL returned from Stripe function:", data);
        throw new Error("Failed to create checkout session. No URL returned.");
      }
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: error.message || "Failed to start the subscription process. Please try again.",
        action: (
          <div className="flex justify-center w-full mt-2">
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Log this activity
      if (user) {
        await logActivity(
          'subscription_management',
          'User accessed subscription management',
          { userId: user.id }
        );
      }
      
      const origin = window.location.origin;
      const returnUrl = `${origin}/profile/subscription`;
      
      console.log("Opening Stripe customer portal...");
      
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: {
          action: 'create-customer-portal',
          data: { returnUrl }
        }
      });
      
      if (error) {
        console.error('Stripe function error:', error);
        throw new Error(error.message || "Failed to access subscription management");
      }
      
      if (data && data.url) {
        console.log("Redirecting to Stripe customer portal URL:", data.url);
        // Redirect to Stripe customer portal
        window.location.href = data.url;
      } else {
        console.error("No URL returned from Stripe function for customer portal:", data);
        throw new Error("Failed to access subscription management portal. No URL returned.");
      }
      
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: error.message || "Failed to access subscription management. Please try again.",
        action: (
          <div className="flex justify-center w-full mt-2">
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Subscription Successful",
        description: "Your premium subscription is now active. Enjoy all the premium features!",
        variant: "default"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      
      getSubscription().then(() => {
        navigate("/");
      });
      
      if (user) {
        try {
          logActivity(
            'subscription_activated',
            'User successfully activated premium subscription',
            { userId: user.id }
          );
        } catch (logError) {
          console.error('Error logging activity:', logError);
        }
      }
    }
    
    if (canceled === 'true') {
      toast({
        title: "Subscription Canceled",
        description: "You have canceled the subscription process.",
        variant: "default"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (user) {
        try {
          logActivity(
            'subscription_canceled',
            'User canceled subscription checkout',
            { userId: user.id }
          );
        } catch (logError) {
          console.error('Error logging activity:', logError);
        }
      }
    }
  }, [toast, getSubscription, logActivity, user, navigate]);

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
                  {isTrial && !isTrialExpired && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30">
                      Trial
                    </Badge>
                  )}
                  {(isExpired || isTrialExpired) && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30">
                      Expired
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {isSubscribed && "You are currently on the Premium plan"}
                  {isTrial && !isTrialExpired && "You are currently on the Trial plan"}
                  {(isExpired || isTrialExpired) && "Your subscription has expired"}
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
                        {isSubscribed ? "Premium Plan" : isTrial && !isTrialExpired ? "Trial Plan" : "Free Plan"}
                      </h3>
                      {getExpiryDate() && !isTrialExpired && (
                        <p className="text-sm text-muted-foreground">
                          {isTrial ? "Trial ends on " : isExpired ? "Expired on " : "Next billing on "} 
                          {getExpiryDate()}
                        </p>
                      )}
                      {isTrialExpired && (
                        <p className="text-sm text-red-500 font-medium">
                          Trial ended on {getExpiryDate()}
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
                
                {(isExpired || isTrialExpired) && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/30">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400">Your access has expired</h4>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          You need to subscribe to the Premium Plan to continue using all features of the app.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="font-medium">Plan Features</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {(isSubscribed || (isTrial && !isTrialExpired)) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>Advanced Nutrition Analytics</span>
                    </div>
                    
                    <div className="flex items-center">
                      {(isSubscribed || (isTrial && !isTrialExpired)) ? (
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
                  
                  {isSubscribed && (
                    <div className="mt-2 text-sm">
                      <p className="text-center text-muted-foreground">
                        Your premium subscription is active. You have access to all premium features.
                      </p>
                    </div>
                  )}
                  
                  {isTrial && !isTrialExpired && (
                    <div className="mt-2 text-sm">
                      <p className="text-center text-muted-foreground">
                        Your trial ends on {getExpiryDate()}. Subscribe to continue enjoying premium features.
                      </p>
                    </div>
                  )}
                </div>
                
                {!isSubscribed && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={handleStartCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        {isExpired || isTrialExpired ? "Upgrade to Premium" : "Upgrade to Premium"}
                      </>
                    )}
                  </Button>
                )}
                
                {isSubscribed && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Manage Subscription"
                    )}
                  </Button>
                )}
                
                {isSubscribed && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/profile")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                  </Button>
                )}
                
                {!isSubscribed && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/landing")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Landing Page
                  </Button>
                )}
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
