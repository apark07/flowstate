import {
  GoogleGenAI,
  Type,
  type Schema,
  GenerateContentResponse,
  Chat, // Import Chat
} from "@google/genai";
import type { Exercise } from "./exerciseService";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const ExerciseSchema: Schema = {
// ... ExerciseSchema definition remains the same
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

// ------------------------------------------------
// Conversational Chat Functions (Updated)
// ------------------------------------------------

// System Instruction for the Flex AI persona
const FLEX_AI_SYSTEM_INSTRUCTION = "You are Flex AI, a friendly, motivational, and highly knowledgeable fitness coach. Maintain a supportive and energetic tone. Keep your responses concise and action-oriented. Remember past messages to continue the conversation. If the user asks for exercises or plans, encourage them to check the Exercise Library or Track Progress sections.";

/**
 * Initializes a new persistent chat session with the Flex AI persona.
 * @returns A Chat session object from the Gemini SDK.
 */
export const startNewChat = (): Chat => {
    const model = "gemini-2.5-flash"; 
    
    // Create a new chat session with system instructions for memory retention
    return ai.chats.create({
        model: model,
        config: {
            systemInstruction: FLEX_AI_SYSTEM_INSTRUCTION,
        },
    });
};

// Removed the old fetchChatResponse since the new method uses the Chat object directly.
// The send logic is moved to FlexAIPage.tsx for session control.