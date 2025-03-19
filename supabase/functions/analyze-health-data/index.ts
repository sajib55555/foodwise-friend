
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set" }),
        {
          status: 400,
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
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { healthData, userName } = requestData;
    
    if (!healthData) {
      console.error("Health data is missing");
      return new Response(
        JSON.stringify({ error: "Health data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log("Received health data:", JSON.stringify(healthData));
    console.log("Received user name:", userName);

    // Generate personalized health analysis
    const analysisPrompt = generateAnalysisPrompt(healthData, userName || 'User');
    console.log("Analysis prompt:", analysisPrompt);

    // Generate OpenAI completion
    let analysis;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using the recommended model
        messages: [
          {
            role: "system",
            content: "You are a health assistant that provides personalized health advice based on user data. Keep responses concise, clear, and actionable. Use a supportive and encouraging tone."
          },
          { role: "user", content: analysisPrompt }
        ],
        max_tokens: 500,
      });
      
      analysis = completion.choices[0].message.content;
      console.log("Generated analysis:", analysis);
    } catch (error) {
      console.error("OpenAI API error:", error);
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

    const voicePreference = healthData.voicePreference || 'nova';
    console.log("Voice preference:", voicePreference);

    // Generate speech from the analysis
    try {
      const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: analysis,
          voice: voicePreference,
          response_format: 'mp3',
        }),
      });

      if (!speechResponse.ok) {
        const errorText = await speechResponse.text();
        console.error("OpenAI speech API error. Status:", speechResponse.status, "Response:", errorText);
        
        // Parse error response if it's JSON
        let errorMessage = "Speech generation failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        // Return text analysis even if speech generation fails
        return new Response(
          JSON.stringify({ 
            textAnalysis: analysis,
            error: `Speech generation failed: ${errorMessage}`
          }),
          {
            status: 200, // Return 200 to avoid client-side error handling
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Convert audio buffer to base64
      const arrayBuffer = await speechResponse.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          textAnalysis: analysis 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error("Speech generation error:", error);
      // Return the text analysis even if speech generation fails
      return new Response(
        JSON.stringify({ 
          textAnalysis: analysis,
          error: `Speech generation failed: ${error.message}`
        }),
        {
          status: 200, // Return 200 to avoid client-side error handling
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
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
  // Safely extract data with fallbacks
  const nutrition = healthData.nutrition || [];
  const exercise = healthData.exercise || [];
  const water = healthData.water || [];
  const sleep = healthData.sleep || [];
  const goals = healthData.goals || [];

  return `
    Analyze the following health data for ${userName} and provide personalized health advice and recommendations:
    
    Nutrition data: ${JSON.stringify(nutrition)}
    Exercise data: ${JSON.stringify(exercise)}
    Water intake: ${JSON.stringify(water)}
    Sleep data: ${JSON.stringify(sleep)}
    Goals: ${JSON.stringify(goals)}
    
    Provide a concise, personalized health update that:
    1. Addresses the user by name if available
    2. Comments on their nutritional intake (calories, protein, carbs, fat)
    3. Provides insights on exercise activity
    4. Mentions sleep quality if data is available
    5. Gives specific, actionable recommendations for improvement
    6. Uses an encouraging tone
    
    Keep the response under 400 words and make it conversational as it will be read aloud.
  `;
}
