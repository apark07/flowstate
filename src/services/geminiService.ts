import {
  GoogleGenAI,
  Type,
  type Schema,
  GenerateContentResponse,
} from "@google/genai";
import type { Exercise } from "./exerciseService"; // Reuse the Exercise interface
 // Reuse the Exercise interface

// The client will automatically pick up VITE_GEMINI_API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// ------------------------------------------------
// 1. Structured Output Schema for Exercises
// ------------------------------------------------

// Define the JSON Schema for a single Exercise object
const ExerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique, short identifier for the exercise, e.g., 'squat', 'bpress'." },
    name: { type: Type.STRING, description: "The descriptive name of the exercise." },
    bodyPart: { type: Type.STRING, description: "The main body part targeted." },
    target: { type: Type.STRING, description: "The primary muscle group targeted." },
    equipment: { type: Type.STRING, description: "The equipment required, e.g., 'barbell', 'dumbbell', 'body weight'." },
    gifUrl: { type: Type.STRING, description: "A public, educational GIF URL showing the exercise form. Use a hosted placeholder URL if a real one is not available, e.g., 'https://yourdomain.com/exercises/default.gif'." },
    instructions: {
      type: Type.ARRAY,
      description: "A list of 3 to 5 step-by-step instructions for performing the exercise.",
      items: { type: Type.STRING },
    },
    secondaryMuscles: {
      type: Type.ARRAY,
      description: "A list of secondary muscle groups involved.",
      items: { type: Type.STRING },
    },
    difficulty: { type: Type.STRING, description: "The difficulty level, e.g., 'beginner', 'intermediate', 'advanced'." },
    category: { type: Type.STRING, description: "The type of exercise, e.g., 'strength', 'cardio', 'stretching'." },
    description: { type: Type.STRING, description: "A brief one-sentence description of the exercise." },
  },
  required: [
    "id",
    "name",
    "bodyPart",
    "target",
    "equipment",
    "gifUrl",
    "instructions",
    "secondaryMuscles",
    "difficulty",
    "category",
    "description",
  ],
};

// Define the final response structure: an array of Exercises
const ExercisesResponseSchema: Schema = {
  type: Type.ARRAY,
  items: ExerciseSchema,
};

// ------------------------------------------------
// 2. Core Fetching Functions
// ------------------------------------------------

/**
 * Generates structured exercise data using the Gemini API.
 * @param prompt - The text prompt instructing the model what exercises to generate.
 * @returns A promise that resolves to an array of Exercise objects.
 */
export const fetchStructuredExercises = async (
  prompt: string
): Promise<Exercise[]> => {
  try {
    const model = "gemini-2.5-flash"; // Fast and good for structured data

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: ExercisesResponseSchema,
      },
    });

    // The response.text() should be a valid JSON string adhering to ExercisesResponseSchema
    const jsonString = response.text().trim();
    const exercises: Exercise[] = JSON.parse(jsonString);

    return exercises;
  } catch (error) {
    console.error("Gemini API Error (Structured Fetch):", error);
    throw new Error("Failed to generate structured exercise data.");
  }
};

/**
 * Sends a conversational prompt to the Gemini API for the Flex AI Chatbot.
 * @param prompt - The user's message.
 * @returns A promise that resolves to the AI's text response.
 */
export const fetchChatResponse = async (prompt: string): Promise<string> => {
    try {
        const model = "gemini-2.5-flash"; // Fast for chat
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: [{ 
                role: "user", 
                parts: [{ text: `You are Flex AI, a friendly and motivational fitness coach. Respond to the user's request. Keep your answers concise and supportive. If the user asks for exercises, recommend 3-5 and encourage them to check the Exercise Library. \n\nUser: ${prompt}` }] 
            }],
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error (Chatbot):", error);
        return "I'm sorry, I'm having trouble connecting to my fitness brain right now. Please try again later.";
    }
};