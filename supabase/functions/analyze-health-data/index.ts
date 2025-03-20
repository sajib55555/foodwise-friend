
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
    
    // Convert to base64 safely
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunks = [];
    const chunkSize = 32768; // Process in smaller chunks to avoid call stack issues
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, chunk));
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
    
    console.log("Received health data:", JSON.stringify(healthData));
    console.log("Received user name:", userName);

    // Generate personalized health analysis
    const analysisPrompt = generateAnalysisPrompt(healthData, userName || 'User');
    console.log("Analysis prompt:", analysisPrompt);

    // Generate OpenAI completion with timeout
    let analysis;
    try {
      const completion = await generateAnalysisWithTimeout(openai, analysisPrompt, 15000);
      analysis = completion.choices[0].message.content;
      console.log("Generated analysis:", analysis);
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

    // Process voice generation
    const voicePreference = healthData.voicePreference || 'nova';
    console.log("Voice preference:", voicePreference);
    
    // Generate speech from text
    let audioContent = null;
    let speechError = null;
    
    try {
      audioContent = await generateSpeech(OPENAI_API_KEY, analysis, voicePreference);
    } catch (error) {
      console.error("Speech generation error:", error);
      speechError = error.message;
    }

    // Return the response with text analysis and audio if available
    return new Response(
      JSON.stringify({
        textAnalysis: analysis,
        audioContent: audioContent,
        error: speechError // Will be null if speech generation succeeded
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
    
    Keep the response under 300 words and make it conversational as it will be read aloud.
  `;
}
