
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { query, userId } = await req.json();
    
    if (!query) {
      throw new Error('No query provided');
    }
    
    if (!userId) {
      throw new Error('No user ID provided');
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    // Fetch user's health data from Supabase
    let userData = await fetchUserData(supabaseUrl, supabaseKey, userId);
    
    // Format the context with user data
    const context = formatUserContext(userData);
    
    // Call OpenAI with the user data as context
    const openAIResponse = await callOpenAI(openAIApiKey, query, context);
    
    return new Response(
      JSON.stringify({ response: openAIResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to fetch user data from various Supabase tables
async function fetchUserData(supabaseUrl: string, supabaseKey: string, userId: string) {
  try {
    // Create basic fetch options
    const options = {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    };
    
    // Fetch user profile
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
      options
    );
    const profileData = await profileResponse.json();
    const profile = profileData.length > 0 ? profileData[0] : null;
    
    // Fetch user activity logs
    const logsResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_activity_logs?user_id=eq.${userId}&select=*&order=created_at.desc&limit=50`,
      options
    );
    const activityLogs = await logsResponse.json();
    
    // Fetch user goals
    const goalsResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_goals?user_id=eq.${userId}&select=*`,
      options
    );
    const goals = await goalsResponse.json();
    
    // Fetch meal data (filter activity logs for meal_logged type)
    const mealLogs = activityLogs.filter(log => log.activity_type === 'meal_logged');
    
    // Filter out workout data
    const workoutLogs = activityLogs.filter(log => log.activity_type === 'workout_logged');
    
    // Filter out weight data
    const weightLogs = activityLogs.filter(log => log.activity_type === 'weight_logged');
    
    // Return the compiled user data
    return {
      profile,
      activityLogs,
      mealLogs,
      workoutLogs,
      weightLogs,
      goals
    };
    
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
}

// Format user context for the AI
function formatUserContext(userData) {
  let context = "User Health Profile:\n";
  
  // Add profile data if available
  if (userData.profile) {
    context += `Name: ${userData.profile.full_name || 'Not specified'}\n`;
    context += `Weight: ${userData.profile.weight || 'Not specified'}\n`;
    context += `Height: ${userData.profile.height || 'Not specified'}\n`;
    context += `Goal: ${userData.profile.goal || 'Not specified'}\n\n`;
  }
  
  // Add recent meals if available
  if (userData.mealLogs && userData.mealLogs.length > 0) {
    context += "Recent Meals:\n";
    
    userData.mealLogs.slice(0, 10).forEach(meal => {
      const date = new Date(meal.created_at).toLocaleDateString();
      const mealType = meal.metadata?.meal_type || 'Meal';
      
      context += `- ${date}, ${mealType}: `;
      
      if (meal.metadata?.scanned_food) {
        const food = meal.metadata.scanned_food;
        context += `${food.name || 'Food'} (${food.calories || 0} cal, `;
        context += `P: ${food.protein || 0}g, C: ${food.carbs || 0}g, F: ${food.fat || 0}g)\n`;
      } else if (meal.metadata?.food_items) {
        const items = Array.isArray(meal.metadata.food_items) 
          ? meal.metadata.food_items.join(', ') 
          : meal.metadata.food_items;
        context += `${items}\n`;
      } else {
        context += "No details available\n";
      }
    });
    
    context += "\n";
  }
  
  // Add workout data if available
  if (userData.workoutLogs && userData.workoutLogs.length > 0) {
    context += "Recent Workouts:\n";
    
    userData.workoutLogs.slice(0, 5).forEach(workout => {
      const date = new Date(workout.created_at).toLocaleDateString();
      context += `- ${date}: ${workout.metadata?.workout_type || 'Workout'}, `;
      context += `Duration: ${workout.metadata?.duration || 'Not specified'}, `;
      context += `Intensity: ${workout.metadata?.intensity || 'Not specified'}\n`;
    });
    
    context += "\n";
  }
  
  // Add weight data if available
  if (userData.weightLogs && userData.weightLogs.length > 0) {
    context += "Weight History:\n";
    
    userData.weightLogs.slice(0, 5).forEach(log => {
      const date = new Date(log.created_at).toLocaleDateString();
      context += `- ${date}: ${log.metadata?.weight || 'Not specified'}\n`;
    });
    
    context += "\n";
  }
  
  // Add goals if available
  if (userData.goals && userData.goals.length > 0) {
    context += "User Goals:\n";
    
    userData.goals.forEach(goal => {
      context += `- ${goal.title}: ${goal.current_value}/${goal.target_value} ${goal.unit}, `;
      context += `Status: ${goal.status}, Target date: ${goal.target_date || 'Not specified'}\n`;
    });
  }
  
  return context;
}

// Call OpenAI API
async function callOpenAI(apiKey: string, query: string, context: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI health assistant for a nutrition and fitness app. 
            You have access to user's health data, including their nutrition intake, exercise, 
            weight, and goals. Provide personalized health advice based on this data.
            
            Here is the user's data:
            ${context}`
          },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message}`);
    }
    
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}
