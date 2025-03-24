
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { OpenAI } from 'https://esm.sh/openai@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, format = 'text', isHealthAdvisor = false } = await req.json();
    
    if (!query) {
      throw new Error('Query parameter is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Processing health data analysis request. Health Advisor mode: ${isHealthAdvisor}`);

    // Initialize OpenAI client
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user data with better error handling
    let mealData = [];
    let weightData = [];
    let workoutData = [];
    let sleepData = [];
    let waterData = [];
    let userData = null;

    try {
      console.log('Fetching user profile data');
      // Get user profile data
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        userData = user;
        console.log('Successfully retrieved user profile');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Continue execution even if user profile fetch fails
    }

    try {
      console.log('Fetching meal data');
      // Get user's meal data
      const { data: meals, error: mealError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'meal_logged')
        .order('created_at', { ascending: false })
        .limit(30);  // Increased limit for better analysis

      if (mealError) {
        console.error('Error fetching meal data:', mealError);
      } else {
        mealData = meals || [];
        console.log(`Retrieved ${mealData.length} meal records`);
      }
    } catch (error) {
      console.error('Failed to fetch meal data:', error);
      // Continue execution even if meal data fetch fails
    }

    try {
      console.log('Fetching weight data');
      // Get user's weight tracking data
      const { data: weights, error: weightError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'weight_logged')
        .order('created_at', { ascending: false })
        .limit(20);  // Increased limit to see trends

      if (weightError) {
        console.error('Error fetching weight data:', weightError);
      } else {
        weightData = weights || [];
        console.log(`Retrieved ${weightData.length} weight records`);
      }
    } catch (error) {
      console.error('Failed to fetch weight data:', error);
      // Continue execution
    }

    try {
      console.log('Fetching workout data');
      // Get user's workout data
      const { data: workouts, error: workoutError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'workout_logged')
        .order('created_at', { ascending: false })
        .limit(20);

      if (workoutError) {
        console.error('Error fetching workout data:', workoutError);
      } else {
        workoutData = workouts || [];
        console.log(`Retrieved ${workoutData.length} workout records`);
      }
    } catch (error) {
      console.error('Failed to fetch workout data:', error);
      // Continue execution
    }

    try {
      console.log('Fetching sleep data');
      // Get user's sleep data
      const { data: sleep, error: sleepError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'sleep_logged')
        .order('created_at', { ascending: false })
        .limit(14);  // Two weeks of sleep data

      if (sleepError) {
        console.error('Error fetching sleep data:', sleepError);
      } else {
        sleepData = sleep || [];
        console.log(`Retrieved ${sleepData.length} sleep records`);
      }
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      // Continue execution
    }

    try {
      console.log('Fetching water intake data');
      // Get user's water intake data
      const { data: water, error: waterError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'water_logged')
        .order('created_at', { ascending: false })
        .limit(14);  // Two weeks of water data

      if (waterError) {
        console.error('Error fetching water data:', waterError);
      } else {
        waterData = water || [];
        console.log(`Retrieved ${waterData.length} water intake records`);
      }
    } catch (error) {
      console.error('Failed to fetch water data:', error);
      // Continue execution
    }

    // Prepare context for AI
    const context = {
      userData,
      recentMeals: mealData,
      recentWeightLogs: weightData,
      recentWorkouts: workoutData,
      recentSleepData: sleepData,
      recentWaterData: waterData
    };

    // Calculate nutritional insights with defensive programming
    let nutritionalInsights = {};
    if (mealData.length > 0) {
      console.log('Calculating nutritional insights');
      
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let mealCount = 0;
      
      mealData.forEach(meal => {
        if (meal.metadata?.scanned_food) {
          const food = meal.metadata.scanned_food;
          totalCalories += food.calories || 0;
          totalProtein += food.protein || 0;
          totalCarbs += food.carbs || 0;
          totalFat += food.fat || 0;
          mealCount++;
        }
      });
      
      if (mealCount > 0) {
        nutritionalInsights = {
          averageDailyCalories: Math.round(totalCalories / (mealData.length / 3)), // Assuming 3 meals per day
          averageProtein: Math.round(totalProtein / mealCount),
          averageCarbs: Math.round(totalCarbs / mealCount),
          averageFat: Math.round(totalFat / mealCount),
          mealFrequency: mealData.length / 7, // Meals per day over last week
        };
      }
      
      console.log('Nutritional insights calculated:', nutritionalInsights);
    }

    // Adjust the system message based on format and mode
    let systemMessage = `You are a professional healthcare AI advisor with expertise in nutrition, fitness, and overall wellness.`;
    
    if (isHealthAdvisor) {
      systemMessage = `You are Dr. Health AI, a comprehensive health and wellness advisor with medical expertise. You analyze the user's health data to provide personalized health recommendations and insights. Your tone is professional but warm, like a knowledgeable doctor who cares about their patient's wellbeing.
      
      For each health assessment you perform, you should:
      1. Analyze the user's nutrition patterns (calories, macros, meal timing)
      2. Evaluate their exercise habits and make recommendations
      3. Review their sleep and water intake
      4. If they have weight tracking data, provide context on their progress
      5. Offer 2-3 specific, actionable recommendations for health improvement
      
      Always be encouraging and highlight positive trends while gently suggesting improvements.`;
    }
    
    if (format === 'voice') {
      systemMessage += ` Since you're speaking to the user, keep responses concise (under 200 words) and conversational. Use a friendly, encouraging tone and focus on the most important health insights.`;
    }
    
    // Limit the data sent to prevent token limit issues
    systemMessage += ` Here's the user's health data to reference:
    - User Profile: ${JSON.stringify(userData)}
    - Recent Meals: ${JSON.stringify(mealData.slice(0, 5))}
    - Recent Weight Logs: ${JSON.stringify(weightData.slice(0, 5))}
    - Recent Workouts: ${JSON.stringify(workoutData.slice(0, 5))}
    - Recent Sleep Data: ${JSON.stringify(sleepData.slice(0, 3))}
    - Recent Water Intake: ${JSON.stringify(waterData.slice(0, 3))}
    - Nutritional Insights: ${JSON.stringify(nutritionalInsights)}
    `;

    console.log('Sending request to OpenAI');

    // Try-catch specifically for OpenAI call
    try {
      // Get response from OpenAI with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for faster response
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: isHealthAdvisor ? 
            "Please provide me with a health assessment based on my data. Include insights about my nutrition, exercise, and other health metrics." : 
            query 
          }
        ],
        max_tokens: format === 'voice' ? 250 : 600, // Reducing token count for faster responses
        temperature: 0.7,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Successfully received response from OpenAI');

      // Return AI response
      return new Response(
        JSON.stringify({ 
          response: response.choices[0].message.content,
          context: {
            userDataAvailable: !!userData,
            mealsAvailable: mealData.length,
            weightsAvailable: weightData.length,
            workoutsAvailable: workoutData.length,
            sleepDataAvailable: sleepData.length,
            waterDataAvailable: waterData.length,
            nutritionalInsights
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAIError) {
      console.error('OpenAI API Error:', openAIError);
      
      // Provide a fallback response if OpenAI fails
      let fallbackResponse = "I'm sorry, but I couldn't analyze your health data at this moment. ";
      
      if (mealData.length > 0) {
        fallbackResponse += "Based on your recent meals, I can see you've been tracking your nutrition. Keep up the good work! ";
      }
      
      if (workoutData.length > 0) {
        fallbackResponse += "It's great that you've been logging your workouts. Regular exercise is key to good health. ";
      }
      
      fallbackResponse += "Please try again later for a more detailed analysis.";
      
      return new Response(
        JSON.stringify({ 
          response: fallbackResponse,
          error: "OpenAI processing error",
          context: {
            userDataAvailable: !!userData,
            mealsAvailable: mealData.length,
            weightsAvailable: weightData.length,
            workoutsAvailable: workoutData.length,
            sleepDataAvailable: sleepData.length,
            waterDataAvailable: waterData.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-health-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I couldn't process your health data at this time. Please try again later."
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
