
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button-custom';
import { Card, CardContent } from '@/components/ui/card-custom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  'Welcome',
  'Personal Info',
  'Fitness Goals',
  'Dietary Preferences',
  'Activity Level',
  'Complete',
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    goal: 'lose_weight',
    dietType: 'balanced',
    activityLevel: 'moderate',
  });
  
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const handleComplete = async () => {
    try {
      // Save onboarding data to user profile
      const { error } = await supabase.from('user_profiles').upsert({
        user_id: user?.id,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        fitness_goal: formData.goal,
        diet_type: formData.dietType,
        activity_level: formData.activityLevel,
        onboarding_completed: true,
      });
      
      if (error) throw error;
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
        },
      });
      
      await refreshUser();
      
      toast({
        title: 'Onboarding completed',
        description: 'Your profile has been set up!',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your profile data. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to FitTrackr</h1>
            <p className="text-muted-foreground">
              Let's set up your profile to personalize your experience.
              This will help us provide you with the most relevant
              recommendations and tracking tools.
            </p>
            <Button onClick={handleNext} className="mt-4">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Personal Information</h1>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  placeholder="Enter your age"
                  min={16}
                  max={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateFormData('height', e.target.value)}
                  placeholder="Enter your height in cm"
                  min={100}
                  max={250}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  placeholder="Enter your weight in kg"
                  min={30}
                  max={250}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Fitness Goals</h1>
            <p className="text-muted-foreground">What's your primary fitness goal?</p>
            
            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => updateFormData('goal', value)}
              className="space-y-3"
            >
              <div>
                <RadioGroupItem value="lose_weight" id="lose_weight" className="peer sr-only" />
                <Label
                  htmlFor="lose_weight"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Lose Weight</div>
                    <div className="text-sm text-muted-foreground">
                      Reduce body fat and improve overall health
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="build_muscle" id="build_muscle" className="peer sr-only" />
                <Label
                  htmlFor="build_muscle"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Build Muscle</div>
                    <div className="text-sm text-muted-foreground">
                      Increase strength and muscle mass
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="maintain" id="maintain" className="peer sr-only" />
                <Label
                  htmlFor="maintain"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Maintain Weight</div>
                    <div className="text-sm text-muted-foreground">
                      Keep your current weight and improve fitness
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="improve_health" id="improve_health" className="peer sr-only" />
                <Label
                  htmlFor="improve_health"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Improve Overall Health</div>
                    <div className="text-sm text-muted-foreground">
                      Focus on wellness and feeling better
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dietary Preferences</h1>
            <p className="text-muted-foreground">
              Select your dietary preference to help us personalize your meal recommendations.
            </p>
            
            <RadioGroup
              value={formData.dietType}
              onValueChange={(value) => updateFormData('dietType', value)}
              className="space-y-3"
            >
              <div>
                <RadioGroupItem value="balanced" id="balanced" className="peer sr-only" />
                <Label
                  htmlFor="balanced"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Balanced</div>
                    <div className="text-sm text-muted-foreground">
                      Standard diet with a balanced mix of nutrients
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="vegetarian" id="vegetarian" className="peer sr-only" />
                <Label
                  htmlFor="vegetarian"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Vegetarian</div>
                    <div className="text-sm text-muted-foreground">
                      No meat, but includes dairy and eggs
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="vegan" id="vegan" className="peer sr-only" />
                <Label
                  htmlFor="vegan"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Vegan</div>
                    <div className="text-sm text-muted-foreground">
                      No animal products at all
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="low_carb" id="low_carb" className="peer sr-only" />
                <Label
                  htmlFor="low_carb"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Low Carb</div>
                    <div className="text-sm text-muted-foreground">
                      Reduced carbohydrate intake
                    </div>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="keto" id="keto" className="peer sr-only" />
                <Label
                  htmlFor="keto"
                  className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                >
                  <div>
                    <div className="font-medium">Keto</div>
                    <div className="text-sm text-muted-foreground">
                      Very low carb, high fat diet
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Activity Level</h1>
            <p className="text-muted-foreground">
              How active are you on a daily basis?
            </p>
            
            <div className="space-y-8">
              <RadioGroup
                value={formData.activityLevel}
                onValueChange={(value) => updateFormData('activityLevel', value)}
                className="space-y-3"
              >
                <div>
                  <RadioGroupItem value="sedentary" id="sedentary" className="peer sr-only" />
                  <Label
                    htmlFor="sedentary"
                    className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                  >
                    <div>
                      <div className="font-medium">Sedentary</div>
                      <div className="text-sm text-muted-foreground">
                        Little to no exercise, desk job
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem value="lightly_active" id="lightly_active" className="peer sr-only" />
                  <Label
                    htmlFor="lightly_active"
                    className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                  >
                    <div>
                      <div className="font-medium">Lightly Active</div>
                      <div className="text-sm text-muted-foreground">
                        Light exercise 1-3 days per week
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem value="moderate" id="moderate" className="peer sr-only" />
                  <Label
                    htmlFor="moderate"
                    className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                  >
                    <div>
                      <div className="font-medium">Moderately Active</div>
                      <div className="text-sm text-muted-foreground">
                        Moderate exercise 3-5 days per week
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem value="very_active" id="very_active" className="peer sr-only" />
                  <Label
                    htmlFor="very_active"
                    className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                  >
                    <div>
                      <div className="font-medium">Very Active</div>
                      <div className="text-sm text-muted-foreground">
                        Hard exercise 6-7 days per week
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem value="extra_active" id="extra_active" className="peer sr-only" />
                  <Label
                    htmlFor="extra_active"
                    className="flex cursor-pointer justify-between rounded-md border border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary"
                  >
                    <div>
                      <div className="font-medium">Extra Active</div>
                      <div className="text-sm text-muted-foreground">
                        Very hard exercise & physical job or training twice daily
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary p-3">
                <Check className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">All Set!</h1>
            <p className="text-muted-foreground">
              Your profile is complete. We'll use this information to personalize your experience.
              You can update these details anytime in your profile settings.
            </p>
            <Button onClick={handleComplete} className="mt-4">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStep
                        ? 'border-2 border-primary bg-background'
                        : 'border border-muted bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="mt-1 text-xs">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
