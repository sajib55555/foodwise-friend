
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
      console.error('OpenAI API key is not configured')
      // Return fallback workout suggestions instead of throwing an error
      return new Response(
        JSON.stringify(generateFallbackWorkouts(fitnessLevel)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
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
              For duration, use the format "X minutes" where X is the number.
              For difficulty, use one of: "Beginner", "Moderate", "Advanced", or "Expert".
              Format your response as a JSON object with an array of workout objects under the key "workouts".
              Each workout must have the following structure:
              {
                "name": "Workout Name",
                "description": "Brief description",
                "exercises": ["exercise1", "exercise2", ...],
                "caloriesBurned": number,
                "difficulty": "Difficulty Level",
                "duration": "X minutes"
              }`
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

      // Set a timeout for the OpenAI request
      const timeoutId = setTimeout(() => {
        console.error('OpenAI request timed out, using fallback workouts')
        return new Response(
          JSON.stringify(generateFallbackWorkouts(fitnessLevel)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }, 8000) // 8 second timeout

      const data = await response.json()
      clearTimeout(timeoutId) // Clear the timeout once we have a response

      console.log("OpenAI raw response:", JSON.stringify(data))

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("Invalid response from OpenAI:", data)
        return new Response(
          JSON.stringify(generateFallbackWorkouts(fitnessLevel)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let parsedContent
      try {
        parsedContent = JSON.parse(data.choices[0].message.content)
        
        // Validate the structure of the response
        if (parsedContent && parsedContent.workouts && Array.isArray(parsedContent.workouts)) {
          // Check if each workout has the required structure and fix if needed
          const validatedWorkouts = parsedContent.workouts.map(workout => ({
            name: workout.name || "Unnamed Workout",
            description: workout.description || "A fitness workout routine",
            exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
            caloriesBurned: typeof workout.caloriesBurned === 'number' ? workout.caloriesBurned : 300,
            difficulty: workout.difficulty || "Beginner",
            duration: workout.duration || "30 minutes"
          }))
          
          return new Response(
            JSON.stringify({ workouts: validatedWorkouts }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          throw new Error("Invalid response structure")
        }
      } catch (e) {
        console.error('Error parsing or validating OpenAI response:', e)
        return new Response(
          JSON.stringify(generateFallbackWorkouts(fitnessLevel)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (error) {
      console.error('Error in OpenAI API request:', error)
      return new Response(
        JSON.stringify(generateFallbackWorkouts(fitnessLevel)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in workout suggestions generation:', error)
    return new Response(
      JSON.stringify(generateFallbackWorkouts("beginner")),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with fallback data instead of 500
      }
    )
  }
})

function generateFallbackWorkouts(fitnessLevel: string = "beginner") {
  const difficultyMap = {
    "beginner": "Beginner",
    "intermediate": "Moderate",
    "advanced": "Advanced",
    "expert": "Expert"
  }
  
  const difficulty = difficultyMap[fitnessLevel as keyof typeof difficultyMap] || "Beginner"
  
  const exerciseSets = {
    "beginner": ["Jumping jacks", "Wall sits", "Push-ups (knees)", "Abdominal crunches", "Chair step-ups", "Squats", "Tricep dips", "Plank", "High knees", "Lunges"],
    "intermediate": ["Burpees", "Push-ups", "Mountain climbers", "Russian twists", "Jump squats", "Tricep dips", "Side planks", "Bicycle crunches", "Jumping lunges", "Diamond push-ups"],
    "advanced": ["Plyometric push-ups", "Single-leg burpees", "Pistol squats", "Jump lunges with twist", "Tuck jumps", "Dragon flags", "Handstand push-ups", "Explosive squat jumps", "L-sits", "Scorpion push-ups"],
    "expert": ["Muscle-ups", "One-arm push-ups", "Planche push-ups", "Human flag", "Single-arm handstands", "Pistol squat jumps", "Full planche", "Ring muscle-ups", "Front lever", "Back lever"]
  }
  
  const calorieMap = {
    "beginner": 200,
    "intermediate": 350,
    "advanced": 450,
    "expert": 550
  }
  
  return {
    workouts: [
      {
        name: `${difficulty} Full Body Circuit`,
        description: `A complete full body workout designed for ${fitnessLevel} fitness levels to build strength and endurance.`,
        exercises: exerciseSets[fitnessLevel as keyof typeof exerciseSets]?.slice(0, 5) || exerciseSets.beginner.slice(0, 5),
        caloriesBurned: calorieMap[fitnessLevel as keyof typeof calorieMap] || 200,
        difficulty: difficulty,
        duration: "30 minutes"
      },
      {
        name: `${difficulty} Core Crusher`,
        description: `Target your abs and lower back for a stronger core with this ${fitnessLevel} workout.`,
        exercises: ["Plank", "Crunches", "Russian twists", "Mountain climbers", "Leg raises"],
        caloriesBurned: Math.round((calorieMap[fitnessLevel as keyof typeof calorieMap] || 200) * 0.8),
        difficulty: difficulty,
        duration: "20 minutes"
      },
      {
        name: `${difficulty} Cardio Blast`,
        description: `Get your heart rate up with this ${fitnessLevel} cardio routine that requires minimal equipment.`,
        exercises: ["High knees", "Jumping jacks", "Burpees", "Mountain climbers", "Jump rope"],
        caloriesBurned: Math.round((calorieMap[fitnessLevel as keyof typeof calorieMap] || 200) * 1.2),
        difficulty: difficulty,
        duration: "25 minutes"
      }
    ]
  }
}
