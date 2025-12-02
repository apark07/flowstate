import {
  GoogleGenAI,
  Type,
  type Schema,
  GenerateContentResponse,
} from "@google/genai";
import type { Exercise } from "./exerciseService";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

const ExercisesResponseSchema: Schema = {
  type: Type.ARRAY,
  items: ExerciseSchema,
};

/**
 * Generates structured exercise data using the Gemini API.
 */
export const fetchStructuredExercises = async (
  prompt: string
): Promise<Exercise[]> => {
  let jsonString = '';
  try {
    const model = "gemini-2.5-flash";

    const finalPrompt = `${prompt} IMPORTANT: You MUST respond ONLY with the JSON array that adheres to the provided schema. Do NOT include any conversational text, explanations, or Markdown formatting like \`\`\`json.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: ExercisesResponseSchema,
      },
    });

    if (response.text === undefined) {
        throw new Error("Model failed to return text content (response.text is undefined).");
    }
    jsonString = response.text.trim(); 
    
    const exercises: Exercise[] = JSON.parse(jsonString);

    return exercises;
  } catch (error) {
    console.error("Gemini API Error (Structured Fetch):", error);
    throw new Error(`Failed to generate structured exercise data. Raw output: ${jsonString.substring(0, 100)}... Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Sends a conversational prompt to the Gemini API for the Flex AI Chatbot.
 */
export const fetchChatResponse = async (prompt: string): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: [{ 
                role: "user", 
                parts: [{ text: `You are Flex AI, a friendly and motivational fitness coach. Respond to the user's request. Keep your answers concise and supportive. If the user asks for exercises, recommend 3-5 and encourage them to check the Exercise Library. \n\nUser: ${prompt}` }] 
            }],
        });
        
        if (response.text === undefined) {
             return "I'm sorry, Flex AI couldn't generate a response. The content was blocked or unavailable.";
        }
        return response.text;
    } catch (error) {
        console.error("Gemini API Error (Chatbot):", error);
        return "I'm sorry, I'm having trouble connecting to my fitness brain right now. Please try again later.";
    }
};