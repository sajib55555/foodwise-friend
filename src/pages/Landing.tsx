
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import Header from "@/components/layout/Header";
import { 
  CheckCircle, 
  Utensils, 
  Activity, 
  Calendar, 
  ChevronsRight, 
  BarChart3, 
  ShoppingCart, 
  Camera, 
  BellRing, 
  Heart, 
  Stars, 
  ZoomIn,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeIn } from "@/utils/transitions";
import PageTransition from "@/components/layout/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

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
    },
    {
      icon: BarChart3,
      title: "Nutrition Analytics",
      description: "Visualize your nutrition data with advanced charts and insights to optimize your diet."
    },
    {
      icon: ShoppingCart,
      title: "Grocery Lists",
      description: "Generate smart shopping lists based on your meal plans to streamline grocery shopping."
    },
    {
      icon: Camera,
      title: "Food Scanning",
      description: "Scan barcodes or take photos of your food for instant nutritional information."
    },
    {
      icon: BellRing,
      title: "Smart Reminders",
      description: "Get personalized reminders for meals, hydration, and healthy habits."
    },
    {
      icon: Heart,
      title: "AI Health Coach",
      description: "Receive AI-powered health recommendations and guidance tailored to your goals."
    }
  ];

  const testimonials = [
    {
      name: "Sarah J.",
      role: "Fitness Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
      quote: "NutriTrack has completely transformed my approach to nutrition. The meal tracking and AI recommendations helped me achieve my fitness goals faster than I thought possible!",
      stars: 5
    },
    {
      name: "Michael T.",
      role: "Busy Professional",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop",
      quote: "As someone with a hectic schedule, the meal planning and grocery list features save me hours each week. The barcode scanner makes logging food incredibly quick!",
      stars: 5
    },
    {
      name: "Emily R.",
      role: "Health Coach",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=150&h=150&auto=format&fit=crop", 
      quote: "I recommend NutriTrack to all my clients. The detailed nutrition analytics provides insights that help them understand their eating habits and make lasting changes.",
      stars: 5
    }
  ];

  const articles = [
    {
      title: "How Tracking Nutrition Improves Overall Health",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop",
      excerpt: "Research shows that consistent nutrition tracking can lead to better food choices and improved health outcomes. By understanding your personal nutrition data, you can make informed decisions..."
    },
    {
      title: "The Science Behind Effective Meal Planning",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=400&auto=format&fit=crop",
      excerpt: "Meal planning isn't just about convenience—it's a science-backed approach to nutrition. Studies indicate that planning meals in advance leads to more balanced nutrition intake and helps prevent impulsive eating decisions..."
    },
    {
      title: "Why AI-Powered Nutrition Advice Is Changing The Game",
      image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=400&auto=format&fit=crop",
      excerpt: "Artificial intelligence is revolutionizing personal nutrition. Unlike generic advice, AI can analyze your unique patterns and preferences to provide truly personalized recommendations that adapt as your health journey progresses..."
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
        <Header transparent={true} />
        
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

          {/* Hero Image */}
          <div className="mt-12 max-w-4xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-card rounded-2xl overflow-hidden shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop" 
                alt="Nutrition tracking dashboard" 
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
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
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={index} variants={staggerItem}>
                    <Card variant="glass" hover="lift" className="h-full">
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

        {/* App Screenshots Carousel */}
        <section className="py-20 px-4 lg:px-8 bg-secondary/10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Designed for a Seamless Experience</h2>
              <p className="text-muted-foreground mt-2">Intuitive interfaces that make nutrition tracking a breeze</p>
            </motion.div>

            <Carousel className="max-w-4xl mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-1">
                    <Card>
                      <CardContent className="p-0">
                        <img 
                          src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=900&auto=format&fit=crop" 
                          alt="Nutrition analytics dashboard" 
                          className="w-full h-auto rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <Card>
                      <CardContent className="p-0">
                        <img 
                          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=900&auto=format&fit=crop" 
                          alt="Meal planning calendar" 
                          className="w-full h-auto rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <Card>
                      <CardContent className="p-0">
                        <img 
                          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=900&auto=format&fit=crop" 
                          alt="Food tracking interface" 
                          className="w-full h-auto rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-4 lg:-left-12" />
              <CarouselNext className="right-4 lg:-right-12" />
            </Carousel>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">What Our Users Say</h2>
              <p className="text-muted-foreground mt-2">Join thousands of satisfied users who have transformed their health</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <Card variant="glass" className="h-full">
                    <CardContent className="p-6 flex flex-col">
                      <div className="flex-grow">
                        <div className="flex items-center mb-4">
                          {Array.from({ length: testimonial.stars }).map((_, i) => (
                            <Stars key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <p className="italic mb-6">"{testimonial.quote}"</p>
                      </div>
                      <div className="flex items-center pt-4 border-t">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-20 px-4 lg:px-8 bg-secondary/10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Nutrition Insights</h2>
              <p className="text-muted-foreground mt-2">Learn about the science behind better nutrition</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-3 gap-8"
            >
              {articles.map((article, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <Card variant="glass" hover="lift" className="h-full overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-medium mb-2">{article.title}</h3>
                      <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                      <Button variant="ghost" className="px-0">
                        Read more <ChevronsRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Why Choose NutriTrack?</h2>
              <p className="text-muted-foreground mt-2">Benefits that transform your health journey</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div 
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="flex flex-col justify-center"
              >
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <ZoomIn className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Personalized Insights</h3>
                      <p className="text-muted-foreground">Our AI analyzes your unique nutrition patterns to provide personalized recommendations that evolve with your progress, not generic advice.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Improved Health Outcomes</h3>
                      <p className="text-muted-foreground">Users report significant improvements in energy levels, sleep quality, and overall wellbeing after just 4 weeks of consistent tracking.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Sustainable Habits</h3>
                      <p className="text-muted-foreground">Our approach focuses on building lasting habits through small, achievable changes rather than drastic, unsustainable diets.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <img 
                  src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=800&auto=format&fit=crop" 
                  alt="Healthy lifestyle" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
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
              <p className="text-muted-foreground mt-2">Start with a 14-day free trial, then just £4.95/month</p>
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
                    <span className="text-4xl font-bold">£4.95</span>
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

        {/* CTA Section */}
        <section className="py-20 px-4 lg:px-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">Start Your Health Journey Today</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who have transformed their relationship with food and improved their health.
              </p>
              {!user && (
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="mx-auto"
                  >
                    Try NutriTrack Free for 14 Days <ChevronsRight className="ml-1" />
                  </Button>
                </div>
              )}
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
