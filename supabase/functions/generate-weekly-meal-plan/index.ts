
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
    const { preferences, restrictions, nutritionalGoals, numberOfDays } = await req.json()
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
            Generate a ${numberOfDays || 7}-day meal plan based on user preferences, dietary restrictions, and nutritional goals.
            For each day, include breakfast, lunch, dinner, and an optional snack.
            For each meal, include a name, brief description, list of ingredients, approximate calories, and key macronutrients (protein, carbs, fat).
            Format your response as a JSON object with days as keys and meal objects for each day.`
          },
          {
            role: 'user',
            content: `Generate a meal plan with these parameters:
            - Preferences: ${preferences || 'Not specified'}
            - Dietary restrictions: ${restrictions || 'None'}
            - Nutritional goals: ${nutritionalGoals || 'Balanced diet'}
            - Number of days: ${numberOfDays || 7}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    let mealPlan

    try {
      mealPlan = JSON.parse(data.choices[0].message.content)
    } catch (e) {
      console.error('Error parsing OpenAI response:', e)
      // Fallback structure if parsing fails
      mealPlan = {
        days: {
          "day1": {
            breakfast: {
              name: "Balanced Oatmeal Bowl",
              description: "Hearty oatmeal with fruits and nuts",
              ingredients: ["Rolled oats", "Almond milk", "Banana", "Berries", "Walnuts", "Honey"],
              calories: 350,
              macros: { protein: "10g", carbs: "45g", fat: "12g" }
            },
            lunch: {
              name: "Mediterranean Salad",
              description: "Fresh salad with a Mediterranean twist",
              ingredients: ["Mixed greens", "Feta cheese", "Olives", "Cherry tomatoes", "Cucumber", "Olive oil"],
              calories: 350,
              macros: { protein: "12g", carbs: "20g", fat: "25g" }
            },
            dinner: {
              name: "Lemon Herb Grilled Chicken",
              description: "Tender grilled chicken with roasted vegetables",
              ingredients: ["Chicken breast", "Lemon", "Herbs", "Zucchini", "Bell peppers", "Olive oil"],
              calories: 450,
              macros: { protein: "35g", carbs: "20g", fat: "25g" }
            },
            snack: {
              name: "Greek Yogurt Parfait",
              description: "Creamy yogurt with honey and nuts",
              ingredients: ["Greek yogurt", "Honey", "Almonds", "Cinnamon"],
              calories: 200,
              macros: { protein: "15g", carbs: "15g", fat: "8g" }
            }
          },
          "day2": {
            breakfast: {
              name: "Veggie Egg Scramble",
              description: "Fluffy eggs with fresh vegetables",
              ingredients: ["Eggs", "Spinach", "Tomatoes", "Onions", "Avocado", "Whole grain toast"],
              calories: 400,
              macros: { protein: "20g", carbs: "25g", fat: "25g" }
            },
            lunch: {
              name: "Quinoa Power Bowl",
              description: "Protein-rich quinoa with roasted vegetables",
              ingredients: ["Quinoa", "Chickpeas", "Sweet potatoes", "Kale", "Tahini dressing"],
              calories: 450,
              macros: { protein: "15g", carbs: "60g", fat: "15g" }
            },
            dinner: {
              name: "Baked Salmon with Asparagus",
              description: "Omega-rich salmon with lemon and herbs",
              ingredients: ["Salmon fillet", "Asparagus", "Lemon", "Dill", "Olive oil"],
              calories: 420,
              macros: { protein: "35g", carbs: "10g", fat: "25g" }
            },
            snack: {
              name: "Apple with Almond Butter",
              description: "Fresh fruit with protein-rich nut butter",
              ingredients: ["Apple", "Almond butter"],
              calories: 180,
              macros: { protein: "5g", carbs: "20g", fat: "10g" }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify(mealPlan),
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
