
import { GoogleGenAI, Type } from "@google/genai";
import { HealthMetrics, MealLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMealImage = async (base64Image: string): Promise<Partial<MealLog>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
  });

  return JSON.parse(response.text || '{}');
};

export const generateDailyBriefing = async (
  metrics: HealthMetrics,
  meals: MealLog[],
  persona: string
) => {
  const prompt = `As ${persona}, a personal health assistant, provide a daily briefing based on these stats:
  Steps: ${metrics.steps}
  Sleep: ${metrics.sleepHours}h
  Calories Burned: ${metrics.caloriesBurned}
  Meals Logged Today: ${meals.map(m => m.name).join(', ')}
  
  Provide a friendly summary of today, a detailed plan for tomorrow (including specific activities), and 3 quick health tips. Respond in JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          plan: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "plan", "tips"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const findNearbyHealthyOptions = async (lat: number, lng: number) => {
  // Using gemini-2.5-flash as Maps Grounding is supported on 2.5 series.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
