
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import MobileNavbar from '@/components/layout/MobileNavbar';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom';
import { Button } from '@/components/ui/button-custom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const MacroCalculator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain',
  });
  
  const [macros, setMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const [calculationMethod, setCalculationMethod] = useState('harris');
  
  // Load user data if available
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) return;
      
      setFormData({
        gender: data.gender || 'male',
        age: data.age ? data.age.toString() : '',
        weight: data.weight ? data.weight.toString() : '',
        height: data.height ? data.height.toString() : '',
        activityLevel: data.activity_level || 'moderate',
        goal: data.fitness_goal || 'maintain',
      });
    };
    
    loadUserData();
  }, [user]);
  
  const calculateMacros = () => {
    // Validate inputs
    if (!formData.age || !formData.weight || !formData.height) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight); // in kg
    const height = parseFloat(formData.height); // in cm
    
    // Calculate BMR based on selected method
    let bmr = 0;
    
    if (calculationMethod === 'harris') {
      // Harris-Benedict Equation
      if (formData.gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
    } else {
      // Mifflin-St Jeor Equation
      if (formData.gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }
    }
    
    // Apply activity multiplier
    let tdee = 0;
    switch (formData.activityLevel) {
      case 'sedentary':
        tdee = bmr * 1.2;
        break;
      case 'lightly_active':
        tdee = bmr * 1.375;
        break;
      case 'moderate':
        tdee = bmr * 1.55;
        break;
      case 'very_active':
        tdee = bmr * 1.725;
        break;
      case 'extra_active':
        tdee = bmr * 1.9;
        break;
      default:
        tdee = bmr * 1.55;
    }
    
    // Adjust based on goal
    let calories = tdee;
    switch (formData.goal) {
      case 'lose_weight':
        calories = tdee * 0.8; // 20% deficit
        break;
      case 'build_muscle':
        calories = tdee * 1.1; // 10% surplus
        break;
      case 'maintain':
      default:
        calories = tdee;
    }
    
    // Calculate macros
    let proteinPercentage, carbPercentage, fatPercentage;
    
    switch (formData.goal) {
      case 'lose_weight':
        proteinPercentage = 0.4; // 40%
        carbPercentage = 0.3; // 30%
        fatPercentage = 0.3; // 30%
        break;
      case 'build_muscle':
        proteinPercentage = 0.3; // 30%
        carbPercentage = 0.45; // 45%
        fatPercentage = 0.25; // 25%
        break;
      case 'maintain':
      default:
        proteinPercentage = 0.3; // 30%
        carbPercentage = 0.4; // 40%
        fatPercentage = 0.3; // 30%
    }
    
    const protein = Math.round((calories * proteinPercentage) / 4); // 4 calories per gram
    const carbs = Math.round((calories * carbPercentage) / 4); // 4 calories per gram
    const fat = Math.round((calories * fatPercentage) / 9); // 9 calories per gram
    
    setMacros({
      calories: Math.round(calories),
      protein,
      carbs,
      fat,
    });
    
    toast({
      title: 'Macros calculated',
      description: 'Your daily macronutrient targets have been calculated',
    });
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const saveMacros = async () => {
    if (!user) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to save your macros',
        variant: 'destructive',
      });
      return;
    }
    
    if (macros.calories === 0) {
      toast({
        title: 'No calculation',
        description: 'Please calculate your macros first',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.from('user_macros').upsert({
        user_id: user.id,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        calculation_method: calculationMethod,
        created_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      toast({
        title: 'Macros saved',
        description: 'Your macro targets have been saved to your profile',
      });
    } catch (error) {
      console.error('Error saving macros:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your macros. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <>
      <Header title="Macro Calculator" />
      <PageTransition>
        <main className="container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="calculator">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calculator" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Macro Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Calculation Method</Label>
                        <RadioGroup
                          value={calculationMethod}
                          onValueChange={setCalculationMethod}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="harris" id="harris" />
                            <Label htmlFor="harris">Harris-Benedict</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mifflin" id="mifflin" />
                            <Label htmlFor="mifflin">Mifflin-St Jeor</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <RadioGroup
                          value={formData.gender}
                          onValueChange={(value) => handleInputChange('gender', value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="gender-male" />
                            <Label htmlFor="gender-male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="gender-female" />
                            <Label htmlFor="gender-female">Female</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          placeholder="Enter your age"
                          min={16}
                          max={100}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          placeholder="Enter your weight in kg"
                          min={30}
                          max={250}
                          step="0.1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder="Enter your height in cm"
                          min={100}
                          max={250}
                          step="0.1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="activity">Activity Level</Label>
                        <Select
                          value={formData.activityLevel}
                          onValueChange={(value) => handleInputChange('activityLevel', value)}
                        >
                          <SelectTrigger id="activity">
                            <SelectValue placeholder="Select your activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                            <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                            <SelectItem value="extra_active">Extra Active (very intense daily exercise)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="goal">Goal</Label>
                        <Select
                          value={formData.goal}
                          onValueChange={(value) => handleInputChange('goal', value)}
                        >
                          <SelectTrigger id="goal">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lose_weight">Lose Weight</SelectItem>
                            <SelectItem value="maintain">Maintain Weight</SelectItem>
                            <SelectItem value="build_muscle">Build Muscle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button onClick={calculateMacros} className="w-full">
                      Calculate Macros
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="results" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Macro Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {macros.calories === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Calculate your macros on the Calculator tab to see your results.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold">{macros.calories}</div>
                              <div className="text-xs text-muted-foreground uppercase">Calories</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold">{macros.protein}g</div>
                              <div className="text-xs text-muted-foreground uppercase">Protein</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold">{macros.carbs}g</div>
                              <div className="text-xs text-muted-foreground uppercase">Carbs</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold">{macros.fat}g</div>
                              <div className="text-xs text-muted-foreground uppercase">Fat</div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium">Macro Distribution</h3>
                          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="bg-blue-500"
                              style={{ width: `${(macros.protein * 4 / macros.calories) * 100}%` }}
                            />
                            <div
                              className="bg-green-500"
                              style={{ width: `${(macros.carbs * 4 / macros.calories) * 100}%` }}
                            />
                            <div
                              className="bg-yellow-500"
                              style={{ width: `${(macros.fat * 9 / macros.calories) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center">
                              <div className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
                              <span>Protein {Math.round((macros.protein * 4 / macros.calories) * 100)}%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                              <span>Carbs {Math.round((macros.carbs * 4 / macros.calories) * 100)}%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500" />
                              <span>Fat {Math.round((macros.fat * 9 / macros.calories) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button onClick={saveMacros} className="w-full">
                          Save These Macros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default MacroCalculator;
