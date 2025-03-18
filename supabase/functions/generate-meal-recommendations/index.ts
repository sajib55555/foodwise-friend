
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
    const { preferences, restrictions, nutritionalGoals } = await req.json()
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
            content: `You are a nutrition expert specializing in meal planning. 
            Generate 3 meal recommendations based on user preferences, dietary restrictions, and nutritional goals.
            For each meal, include a name, brief description, list of ingredients, approximate calories, and key macronutrients (protein, carbs, fat).
            Format your response as a JSON array of meal objects.`
          },
          {
            role: 'user',
            content: `Generate meal recommendations with these parameters:
            - Preferences: ${preferences || 'Not specified'}
            - Dietary restrictions: ${restrictions || 'None'}
            - Nutritional goals: ${nutritionalGoals || 'Balanced diet'}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    let mealRecommendations

    try {
      mealRecommendations = JSON.parse(data.choices[0].message.content)
    } catch (e) {
      console.error('Error parsing OpenAI response:', e)
      // If parsing fails, use a fallback structure
      mealRecommendations = {
        meals: [
          {
            name: "Balanced Protein Bowl",
            description: "A nutritious bowl with lean protein, complex carbs, and healthy fats",
            ingredients: ["Grilled chicken", "Quinoa", "Avocado", "Roasted vegetables", "Olive oil"],
            calories: 450,
            macros: { protein: "35g", carbs: "40g", fat: "15g" }
          },
          {
            name: "Mediterranean Salad",
            description: "Fresh salad with a Mediterranean twist",
            ingredients: ["Mixed greens", "Feta cheese", "Olives", "Cherry tomatoes", "Cucumber", "Olive oil"],
            calories: 350,
            macros: { protein: "12g", carbs: "20g", fat: "25g" }
          },
          {
            name: "Energizing Smoothie Bowl",
            description: "Nutrient-dense smoothie bowl that's perfect for breakfast",
            ingredients: ["Frozen banana", "Berries", "Plant protein", "Almond milk", "Chia seeds"],
            calories: 400,
            macros: { protein: "20g", carbs: "45g", fat: "10g" }
          }
        ]
      }
    }

    return new Response(
      JSON.stringify(mealRecommendations),
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
