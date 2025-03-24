
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
    const { query, userId, format = 'text' } = await req.json();
    
    if (!query) {
      throw new Error('Query parameter is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user data
    let mealData = [];
    let weightData = [];
    let workoutData = [];
    let userData = null;

    // Get user's meal data
    const { data: meals, error: mealError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'meal_logged')
      .order('created_at', { ascending: false })
      .limit(20);

    if (mealError) {
      console.error('Error fetching meal data:', mealError);
    } else {
      mealData = meals;
    }

    // Get user's weight tracking data
    const { data: weights, error: weightError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'weight_logged')
      .order('created_at', { ascending: false })
      .limit(10);

    if (weightError) {
      console.error('Error fetching weight data:', weightError);
    } else {
      weightData = weights;
    }

    // Get user's workout data
    const { data: workouts, error: workoutError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'workout_logged')
      .order('created_at', { ascending: false })
      .limit(10);

    if (workoutError) {
      console.error('Error fetching workout data:', workoutError);
    } else {
      workoutData = workouts;
    }

    // Get user profile data
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    } else {
      userData = user;
    }

    // Prepare context for AI
    const context = {
      userData,
      recentMeals: mealData,
      recentWeightLogs: weightData,
      recentWorkouts: workoutData,
    };

    // Adjust the system message based on format (voice or text)
    let systemMessage = `You are a helpful nutrition and health assistant. I will help the user with their health, nutrition, and fitness questions.`;
    
    if (format === 'voice') {
      systemMessage += ` Since you're speaking to the user, keep responses concise (under 150 words) and conversational. Use a friendly tone and avoid long technical explanations.`;
    }
    
    systemMessage += ` Here's the user's data to reference:
    - User Profile: ${JSON.stringify(userData)}
    - Recent Meals: ${JSON.stringify(mealData.slice(0, 5))}
    - Recent Weight Logs: ${JSON.stringify(weightData.slice(0, 5))}
    - Recent Workouts: ${JSON.stringify(workoutData.slice(0, 5))}
    `;

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: query }
      ],
      max_tokens: format === 'voice' ? 250 : 800,
      temperature: 0.7,
    });

    // Return AI response
    return new Response(
      JSON.stringify({ 
        response: response.choices[0].message.content,
        context: {
          userDataAvailable: !!userData,
          mealsAvailable: mealData.length,
          weightsAvailable: weightData.length,
          workoutsAvailable: workoutData.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-health-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
