
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
      throw new Error('OPENAI_API_KEY is not set');
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
    const analysisPrompt = generateAnalysisPrompt(healthData, userName);
    console.log("Analysis prompt:", analysisPrompt);

    // Generate OpenAI completion
    let completion;
    try {
      completion = await openai.chat.completions.create({
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
    } catch (error) {
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const analysis = completion.choices[0].message.content;
    console.log("Generated analysis:", analysis);

    const voicePreference = healthData.voicePreference || 'nova';
    console.log("Voice preference:", voicePreference);

    // Generate speech from the analysis
    let speechResponse;
    try {
      speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
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
        const errorData = await speechResponse.json();
        console.error("OpenAI speech API error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to generate speech');
      }
    } catch (error) {
      console.error("Speech generation error:", error);
      // Return the text analysis even if speech generation fails
      return new Response(
        JSON.stringify({ 
          textAnalysis: analysis,
          error: `Speech generation failed: ${error.message}`
        }),
        {
          status: 200, // Return 200 to allow the app to at least show the text analysis
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
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
    Analyze the following health data for ${userName || 'the user'} and provide personalized health advice and recommendations:
    
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
