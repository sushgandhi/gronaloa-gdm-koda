
import { GoogleGenAI, Type } from "@google/genai";
import { HealthMetrics, MealLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper for retry logic on 503 errors
const generateWithRetry = async (model: string, params: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({ model, ...params });
    } catch (e: any) {
      // Check for 503 or overload messages
      const isOverloaded = e.message?.includes('503') || e.status === 503 || e.message?.includes('overloaded');
      
      if (isOverloaded && i < retries - 1) {
        const delay = 2000 * Math.pow(2, i); // 2s, 4s, 8s
        console.warn(`Model overloaded. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
};

export const analyzeMealImage = async (base64Image: string): Promise<Partial<MealLog>> => {
  const response = await generateWithRetry(
    'gemini-3-flash-preview',
    {
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Analyze this meal photo. Provide the name of the meal, estimated calories, protein, carbs, fats, and 3 healthier alternatives. Respond in JSON format." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "calories", "protein", "carbs", "fats", "alternatives"]
        }
      }
    }
  );

  return JSON.parse(response?.text || '{}');
};

export const generateDailyBriefing = async (
  metrics: HealthMetrics, 
  meals: MealLog[], 
  persona: string,
  offersText: string = "" // New parameter for Waitrose offers
) => {
  const prompt = `As ${persona}, a personal health assistant, provide a daily briefing based on these stats:
  Steps: ${metrics.steps}
  Sleep: ${metrics.sleepHours}h
  Calories Burned: ${metrics.caloriesBurned}
  Meals Logged Today: ${meals.map(m => m.name).join(', ')}

  I have also browsed the local Waitrose offers: 
  "${offersText}"
  
  Provide a friendly summary of today, a detailed plan for tomorrow (including specific activities), and 3 quick health tips. 
  
  ALSO: Based on the Waitrose offers provided, suggest ONE healthy dinner recipe that uses the ingredients on sale. 
  Fill the 'shoppingSuggestion' field with this deal.
  
  Respond in JSON.`;

  const response = await generateWithRetry(
    'gemini-3-flash-preview',
    {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            plan: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            shoppingSuggestion: {
              type: Type.OBJECT,
              properties: {
                store: { type: Type.STRING },
                itemOnSale: { type: Type.STRING },
                recipeName: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                savingsNote: { type: Type.STRING }
              },
              required: ["store", "itemOnSale", "recipeName", "ingredients", "savingsNote"]
            }
          },
          required: ["summary", "plan", "tips"]
        }
      }
    }
  );

  return JSON.parse(response?.text || '{}');
};

export const findNearbyHealthyOptions = async (lat: number, lng: number) => {
  // Maps Grounding is supported on 2.5 series.
  const response = await generateWithRetry(
    "gemini-2.5-flash",
    {
      contents: "Find the best healthy grocery stores and restaurants nearby. List them using bullet points. Use **bold text** for the place names and include a short reason why it's good.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        } as any
      },
    }
  );

  return {
    text: response?.text || "Could not fetch nearby locations.",
    sources: response?.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
