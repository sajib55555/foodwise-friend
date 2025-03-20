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
    console.log("Received request with:", { preferences, restrictions, nutritionalGoals, numberOfDays })
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      console.error("OpenAI API key is missing")
      throw new Error('OpenAI API key is not configured')
    }

    // Generate a fallback meal plan for demonstration purposes
    // This ensures users get a response even if the API call fails
    const fallbackMealPlan = generateFallbackMealPlan(numberOfDays || 7, preferences, nutritionalGoals)
    
    // Start a timer to track request duration
    const startTime = Date.now()
    
    try {
      // Set a faster timeout for the OpenAI API call
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
        console.log("OpenAI request timeout")
      }, 5000) // 5 second timeout
      
      console.log("Sending request to OpenAI API")
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Use the faster model
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert specializing in meal planning. 
              Generate a ${numberOfDays || 7}-day meal plan based on user preferences, dietary restrictions, and nutritional goals.
              For each day, include breakfast, lunch, dinner, and an optional snack.
              For each meal, include a name, brief description, list of ingredients, approximate calories, and key macronutrients (protein, carbs, fat).
              Format your response as a JSON object with days as keys and meal objects for each day.
              Be concise and efficient - focus on providing accurate nutrition information without lengthy descriptions.
              Example structure:
              {
                "days": {
                  "day1": {
                    "breakfast": {
                      "name": "Oatmeal with Berries",
                      "description": "Hearty oatmeal topped with fresh berries",
                      "ingredients": ["Oats", "Milk", "Berries", "Honey"],
                      "calories": 350,
                      "macros": { "protein": "8g", "carbs": "55g", "fat": "6g" }
                    },
                    "lunch": { ... },
                    "dinner": { ... },
                    "snack": { ... }
                  },
                  "day2": { ... },
                  ...
                }
              }`
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
          response_format: { type: "json_object" },
          temperature: 0.7, // Lower temperature for faster, more predictable responses
          max_tokens: 1500 // Limit token usage for faster response
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenAI API Error:", response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response from OpenAI API in", Date.now() - startTime, "ms")
      
      let mealPlan
      try {
        const content = data.choices[0].message.content
        console.log("Parsing content:", content.substring(0, 100) + "...") // Log start of content for debugging
        mealPlan = JSON.parse(content)
        console.log("Successfully parsed meal plan data")
        return new Response(
          JSON.stringify(mealPlan),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (e) {
        console.error('Error parsing OpenAI response:', e)
        // If parsing fails, return the fallback
        console.log("Returning fallback meal plan due to parsing error")
        return new Response(
          JSON.stringify(fallbackMealPlan),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      console.log("Returning fallback meal plan due to API error")
      // Return the fallback meal plan on API failure
      return new Response(
        JSON.stringify(fallbackMealPlan),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('General Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper function to generate a fallback meal plan with the requested number of days
function generateFallbackMealPlan(days = 7, preferences = 'Balanced', goals = 'Weight maintenance') {
  const fallbackPlan = {
    days: {}
  }
  
  // Protein adjustment based on preferences
  let proteinEmphasis = 1.0
  if (preferences === 'High Protein') proteinEmphasis = 1.5
  if (preferences === 'Low Carb') proteinEmphasis = 1.3
  
  // Calorie adjustment based on goals
  let calorieMultiplier = 1.0
  if (goals === 'Weight loss') calorieMultiplier = 0.8
  if (goals === 'Muscle gain') calorieMultiplier = 1.2
  
  const breakfastOptions = [
    {
      name: "Protein Oatmeal Bowl",
      description: "Hearty oatmeal with added protein powder and fruits",
      ingredients: ["Rolled oats", "Protein powder", "Banana", "Berries", "Almond milk", "Honey"],
      calories: Math.round(350 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(18 * proteinEmphasis)}g`, 
        carbs: "45g", 
        fat: "8g" 
      }
    },
    {
      name: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with fruits and granola",
      ingredients: ["Greek yogurt", "Mixed berries", "Granola", "Honey", "Chia seeds"],
      calories: Math.round(320 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(20 * proteinEmphasis)}g`, 
        carbs: "40g", 
        fat: "10g" 
      }
    },
    {
      name: "Veggie Egg Scramble",
      description: "Fluffy eggs with fresh vegetables and herbs",
      ingredients: ["Eggs", "Spinach", "Bell peppers", "Onions", "Feta cheese", "Whole grain toast"],
      calories: Math.round(380 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(22 * proteinEmphasis)}g`, 
        carbs: "30g", 
        fat: "20g" 
      }
    }
  ]
  
  const lunchOptions = [
    {
      name: "Mediterranean Salad Bowl",
      description: "Fresh salad with quinoa, chickpeas and feta",
      ingredients: ["Mixed greens", "Quinoa", "Chickpeas", "Cucumber", "Cherry tomatoes", "Feta cheese", "Olive oil dressing"],
      calories: Math.round(420 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(15 * proteinEmphasis)}g`, 
        carbs: "50g", 
        fat: "18g" 
      }
    },
    {
      name: "Grilled Chicken Wrap",
      description: "Lean protein with vegetables in a whole grain wrap",
      ingredients: ["Grilled chicken breast", "Whole grain wrap", "Avocado", "Lettuce", "Tomato", "Greek yogurt sauce"],
      calories: Math.round(450 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(30 * proteinEmphasis)}g`, 
        carbs: "40g", 
        fat: "15g" 
      }
    },
    {
      name: "Lentil Soup with Side Salad",
      description: "Hearty lentil soup with a fresh side salad",
      ingredients: ["Red lentils", "Carrots", "Celery", "Onions", "Vegetable broth", "Mixed greens", "Balsamic vinaigrette"],
      calories: Math.round(380 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(18 * proteinEmphasis)}g`, 
        carbs: "55g", 
        fat: "10g" 
      }
    }
  ]
  
  const dinnerOptions = [
    {
      name: "Baked Salmon with Vegetables",
      description: "Omega-rich salmon with roasted seasonal vegetables",
      ingredients: ["Salmon fillet", "Asparagus", "Sweet potatoes", "Olive oil", "Lemon", "Herbs"],
      calories: Math.round(460 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(35 * proteinEmphasis)}g`, 
        carbs: "30g", 
        fat: "22g" 
      }
    },
    {
      name: "Turkey Chili",
      description: "Lean turkey with beans and vegetables in a spicy stew",
      ingredients: ["Ground turkey", "Kidney beans", "Black beans", "Tomatoes", "Bell peppers", "Onions", "Spices"],
      calories: Math.round(420 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(32 * proteinEmphasis)}g`, 
        carbs: "40g", 
        fat: "12g" 
      }
    },
    {
      name: "Stir-Fried Tofu with Brown Rice",
      description: "Plant-based protein with vegetables and whole grains",
      ingredients: ["Tofu", "Brown rice", "Broccoli", "Carrots", "Snow peas", "Soy sauce", "Ginger"],
      calories: Math.round(400 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(20 * proteinEmphasis)}g`, 
        carbs: "50g", 
        fat: "12g" 
      }
    }
  ]
  
  const snackOptions = [
    {
      name: "Apple with Almond Butter",
      description: "Fresh fruit with protein-rich nut butter",
      ingredients: ["Apple", "Almond butter"],
      calories: Math.round(180 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(5 * proteinEmphasis)}g`, 
        carbs: "20g", 
        fat: "9g" 
      }
    },
    {
      name: "Protein Smoothie",
      description: "Refreshing fruit smoothie with added protein",
      ingredients: ["Banana", "Berries", "Protein powder", "Almond milk", "Ice"],
      calories: Math.round(200 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(20 * proteinEmphasis)}g`, 
        carbs: "25g", 
        fat: "3g" 
      }
    },
    {
      name: "Trail Mix",
      description: "Energizing mix of nuts, seeds and dried fruits",
      ingredients: ["Almonds", "Walnuts", "Pumpkin seeds", "Dried cranberries", "Dark chocolate chips"],
      calories: Math.round(190 * calorieMultiplier),
      macros: { 
        protein: `${Math.round(6 * proteinEmphasis)}g`, 
        carbs: "15g", 
        fat: "12g" 
      }
    }
  ]
  
  for (let i = 1; i <= days; i++) {
    fallbackPlan.days[`day${i}`] = {
      breakfast: breakfastOptions[i % breakfastOptions.length],
      lunch: lunchOptions[i % lunchOptions.length],
      dinner: dinnerOptions[i % dinnerOptions.length],
      snack: snackOptions[i % snackOptions.length]
    }
  }
  
  return fallbackPlan
}
