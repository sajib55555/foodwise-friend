
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fitnessLevel, goalType, duration, equipment, limitations } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a certified fitness trainer specializing in creating personalized workout plans.
            Generate a workout routine based on user preferences, fitness level, goals, available equipment, and any physical limitations.
            For each workout, include the name, description, list of exercises, estimated calories burned, and difficulty level.
            Format your response as a JSON array of workout objects.`
          },
          {
            role: 'user',
            content: `Generate workout suggestions with these parameters:
            - Fitness level: ${fitnessLevel || 'Beginner'}
            - Goal: ${goalType || 'General fitness'}
            - Duration: ${duration || '30 minutes'}
            - Available equipment: ${equipment || 'Minimal/None'}
            - Limitations/Considerations: ${limitations || 'None'}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    let workoutSuggestions

    try {
      workoutSuggestions = JSON.parse(data.choices[0].message.content)
    } catch (e) {
      console.error('Error parsing OpenAI response:', e)
      // If parsing fails, use a fallback structure
      workoutSuggestions = {
        workouts: [
          {
            name: "Full Body HIIT",
            description: "A high-intensity interval training workout targeting your entire body",
            exercises: ["Jumping jacks", "Squats", "Push-ups", "Mountain climbers", "Plank"],
            caloriesBurned: 300,
            difficulty: "Moderate",
            duration: "30 minutes"
          },
          {
            name: "Core Strengthening",
            description: "Focus on building a stronger core and abdominal muscles",
            exercises: ["Crunches", "Leg raises", "Plank variations", "Russian twists", "Bicycle crunches"],
            caloriesBurned: 200,
            difficulty: "Beginner",
            duration: "20 minutes"
          },
          {
            name: "Bodyweight Cardio",
            description: "An equipment-free cardio workout to get your heart rate up",
            exercises: ["High knees", "Burpees", "Jumping lunges", "Mountain climbers", "Squat jumps"],
            caloriesBurned: 350,
            difficulty: "Challenging",
            duration: "25 minutes"
          }
        ]
      }
    }

    return new Response(
      JSON.stringify(workoutSuggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
