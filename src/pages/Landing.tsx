
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { CheckCircle, Utensils, Activity, Calendar, ChevronsRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeIn } from "@/utils/transitions";
import PageTransition from "@/components/layout/PageTransition";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Utensils,
      title: "Meal Tracking",
      description: "Track your meals and nutrition intake with ease, get detailed breakdowns of macros and calories."
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description: "Monitor your health metrics including weight, BMI, and nutrient intake with intuitive charts."
    },
    {
      icon: Calendar,
      title: "Meal Planning",
      description: "Plan your meals in advance with our intuitive calendar and recipe suggestions based on your goals."
    }
  ];

  const pricingFeatures = [
    "Unlimited meal tracking",
    "Barcode scanner for quick logging",
    "Customizable nutrition goals",
    "Detailed nutrition reports",
    "Meal planning calendar",
    "Recipe suggestions",
    "Export your data anytime",
    "Priority customer support"
  ];

  return (
    <PageTransition>
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Your Personal <span className="text-primary">Nutrition</span> Assistant
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track your meals, monitor your health, and achieve your nutrition goals with our comprehensive health tracking platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {user ? (
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/")}
                  >
                    Go to Dashboard <ChevronsRight className="ml-1" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/auth")}
                    >
                      Start Free 14-Day Trial <ChevronsRight className="ml-1" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => navigate("/auth")}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Comprehensive Health Tracking</h2>
              <p className="text-muted-foreground mt-2">Everything you need to maintain a healthy lifestyle</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={index} variants={staggerItem}>
                    <Card variant="glass" className="h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 lg:px-8 bg-secondary/20">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground mt-2">Start with a 14-day free trial, then just £9.95/month</p>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="max-w-lg mx-auto"
            >
              <Card variant="glass" className="overflow-hidden border-primary/50">
                <div className="bg-primary text-primary-foreground p-4 text-center">
                  <h3 className="text-xl font-bold">Premium Plan</h3>
                  <p className="text-sm opacity-90">Everything you need for better nutrition</p>
                </div>
                <CardContent className="p-6 pt-8">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">£9.95</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-sm text-muted-foreground mt-1">after 14-day free trial</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {pricingFeatures.map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate("/")}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate("/auth")}
                    >
                      Start Your Free Trial
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    No credit card required for trial. Cancel anytime.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} NutriTrack. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </PageTransition>
  );
};

export default Landing;
