
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate analysis with timeout
async function generateAnalysisWithTimeout(openai: OpenAI, prompt: string, timeout: number = 10000) {
  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Analysis request timed out')), timeout);
  });

  // Create the analysis promise
  const analysisPromise = openai.chat.completions.create({
    model: "gpt-4o-mini", // Using the fastest recommended model
    messages: [
      {
        role: "system",
        content: "You are a health assistant that provides personalized health advice based on user data. Keep responses concise, clear, and actionable. Use a supportive and encouraging tone. Limit your response to 300 words maximum."
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 400, // Limiting token count for faster response
    temperature: 0.7,
  });

  // Race the two promises
  try {
    const result = await Promise.race([analysisPromise, timeoutPromise]);
    return result;
  } catch (error) {
    if (error.message === 'Analysis request timed out') {
      throw new Error('Analysis request timed out');
    }
    throw error;
  }
}

// Function to generate speech with dedicated error handling
async function generateSpeech(apiKey: string, text: string, voice: string) {
  try {
    console.log("Generating speech for text length:", text.length, "with voice:", voice);
    
    // Limit the text length to prevent potential buffer issues
    const truncatedText = text.slice(0, 4000);
    
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: truncatedText,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!speechResponse.ok) {
      const errorText = await speechResponse.text();
      console.error("OpenAI speech API error. Status:", speechResponse.status, "Response:", errorText);
      throw new Error(`Speech generation failed with status ${speechResponse.status}`);
    }

    // Get the audio as an array buffer
    const arrayBuffer = await speechResponse.arrayBuffer();
    
    // Process in smaller chunks to avoid memory issues
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunks = [];
    const chunkSize = 32768; // Process in smaller chunks to avoid call stack issues
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, [...chunk]));
    }
    
    const base64Audio = btoa(chunks.join(''));
    console.log("Successfully generated audio, length:", base64Audio.length);
    
    return base64Audio;
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set", textAnalysis: "I couldn't analyze your health data. The OpenAI API key is missing." }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Parse request data safely
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", textAnalysis: "I couldn't process your request due to invalid data format." }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { healthData, userName } = requestData;
    
    if (!healthData) {
      console.error("Health data is missing");
      return new Response(
        JSON.stringify({ error: "Health data is required", textAnalysis: "I need your health data to provide an analysis." }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log("Received health data for user:", userName || 'Anonymous');

    // Ensure all data fields exist
    const safeHealthData = {
      nutrition: healthData.nutrition || [],
      exercise: healthData.exercise || [],
      water: healthData.water || [],
      sleep: healthData.sleep || [],
      goals: healthData.goals || [],
      weight: healthData.weight || [],
      userProfile: healthData.userProfile || {},
      meals: healthData.meals || [],
      activityLog: healthData.activityLog || [],
      workouts: healthData.workouts || [],
      dailySteps: healthData.dailySteps || [],
      heartRate: healthData.heartRate || [],
      bloodPressure: healthData.bloodPressure || []
    };

    // Generate personalized health analysis
    const analysisPrompt = generateAnalysisPrompt(safeHealthData, userName || 'User');
    console.log("Analysis prompt created, length:", analysisPrompt.length);

    // Generate OpenAI completion with timeout - increased to 15 seconds
    let analysis;
    try {
      const completion = await generateAnalysisWithTimeout(openai, analysisPrompt, 12000);
      analysis = completion.choices[0].message.content;
      console.log("Generated analysis, length:", analysis.length);
    } catch (error) {
      console.error("OpenAI API error:", error);
      
      if (error.message === 'Analysis request timed out') {
        return new Response(
          JSON.stringify({ 
            error: "The analysis is taking too long to generate",
            textAnalysis: "I'm sorry, but your health analysis is taking longer than expected. Please try again later when our systems are less busy."
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${error.message}`,
          textAnalysis: "I couldn't analyze your health data at the moment. Please try again later."
        }),
        {
          status: 200, // Return 200 to avoid client-side error handling issues
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!analysis) {
      console.error("Failed to generate analysis");
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate analysis",
          textAnalysis: "I couldn't analyze your health data at the moment. Please try again later."
        }),
        {
          status: 200, // Return 200 to avoid client-side error handling issues
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate mock data when no real data is available
    if (
      (!safeHealthData.nutrition || safeHealthData.nutrition.length === 0) &&
      (!safeHealthData.exercise || safeHealthData.exercise.length === 0) &&
      (!safeHealthData.water || safeHealthData.water.length === 0) &&
      (!safeHealthData.sleep || safeHealthData.sleep.length === 0)
    ) {
      analysis = `Hello ${userName || 'there'}! I notice you haven't logged much health data yet. To get personalized insights, try tracking your meals, water intake, exercise, and sleep in the app. This will help me provide tailored recommendations for your health goals. In the meantime, remember to stay hydrated, aim for balanced meals, get regular exercise, and prioritize 7-8 hours of sleep daily. I'm here to help you on your health journey!`;
    }

    // Process voice generation
    const voicePreference = healthData.voicePreference || 'nova';
    console.log("Voice preference:", voicePreference);
    
    // Generate speech from text
    let audioContent = null;
    let speechError = null;
    
    try {
      // Prioritize speech generation for better user experience
      audioContent = await generateSpeech(OPENAI_API_KEY, analysis, voicePreference);
      console.log("Audio content generated successfully, length:", audioContent ? audioContent.length : 0);
    } catch (error) {
      console.error("Speech generation error:", error);
      speechError = error.message;
    }

    // Return the response with text analysis and audio if available
    return new Response(
      JSON.stringify({
        textAnalysis: analysis,
        audioContent: audioContent,
        error: speechError, // Will be null if speech generation succeeded
        autoPlay: true // Added flag to indicate auto-play preference
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        textAnalysis: "An unexpected error occurred. Please try again later."
      }),
      {
        status: 200, // Return 200 to avoid client-side error handling
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateAnalysisPrompt(healthData: any, userName: string): string {
  // Process water intake data better
  let waterConsumption = "No water intake data available";
  if (healthData.water && healthData.water.length > 0) {
    // Calculate average daily water intake
    const totalWater = healthData.water.reduce((sum: number, day: any) => sum + (day.total || 0), 0);
    const avgWater = totalWater / healthData.water.length;
    waterConsumption = `Average daily water intake: ${avgWater.toFixed(0)} ml`;
    
    // Get today's water intake if available
    const today = healthData.water.find((day: any) => {
      const dateStr = day.date;
      const today = new Date().toISOString().split('T')[0];
      return dateStr === today;
    });
    
    if (today) {
      waterConsumption += `. Today's water intake: ${today.total} ml`;
    }
  }

  // Process goals data better
  let goalsInfo = "No goals data available";
  if (healthData.goals && healthData.goals.length > 0) {
    const activeGoals = healthData.goals.filter((goal: any) => goal.status === 'in_progress');
    const completedGoals = healthData.goals.filter((goal: any) => goal.status === 'completed');
    
    goalsInfo = `Active goals: ${activeGoals.length}. Completed goals: ${completedGoals.length}. `;
    
    // Include details of active goals
    if (activeGoals.length > 0) {
      goalsInfo += "Active goals: ";
      activeGoals.forEach((goal: any, index: number) => {
        const progress = Math.round((goal.current_value / goal.target_value) * 100);
        goalsInfo += `${index + 1}) ${goal.title}: ${progress}% complete (${goal.current_value}/${goal.target_value} ${goal.unit}). `;
      });
    }
  }

  return `
    Analyze the following comprehensive health data for ${userName} and provide personalized health advice and recommendations:
    
    User Profile: ${JSON.stringify(healthData.userProfile)}
    Nutrition data: ${JSON.stringify(healthData.nutrition)}
    Meal data: ${JSON.stringify(healthData.meals)}
    Exercise data: ${JSON.stringify(healthData.exercise)}
    Workout data: ${JSON.stringify(healthData.workouts)}
    Water intake: ${JSON.stringify(healthData.water)}
    Water Summary: ${waterConsumption}
    Sleep data: ${JSON.stringify(healthData.sleep)}
    Weight data: ${JSON.stringify(healthData.weight)}
    Activity log: ${JSON.stringify(healthData.activityLog)}
    Daily steps: ${JSON.stringify(healthData.dailySteps)}
    Heart rate: ${JSON.stringify(healthData.heartRate)}
    Blood pressure: ${JSON.stringify(healthData.bloodPressure)}
    Goals: ${JSON.stringify(healthData.goals)}
    Goals Summary: ${goalsInfo}
    
    Provide a concise, personalized health update that:
    1. Addresses the user by name if available
    2. Comments on their nutritional intake (calories, protein, carbs, fat)
    3. Provides insights on exercise activity and workouts
    4. Mentions sleep quality if data is available
    5. Comments on weight trends if data is available
    6. Analyzes water intake and hydration status
    7. Reviews progress toward their health and fitness goals
    8. Includes any relevant information from their activity logs
    9. Gives specific, actionable recommendations for improvement
    10. Uses an encouraging tone
    
    Keep the response under 300 words and make it conversational as it will be read aloud.
  `;
}
