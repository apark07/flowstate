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
const FLEX_AI_SYSTEM_INSTRUCTION = "You are Flex AI, a friendly, motivational, and highly knowledgeable fitness coach. Maintain a supportive and energetic tone, but don't be afraid to tell someone off if they're doing something dangerous to themselves or others, including but not limited to ego-lifting (lifting weights heavier than the user can handle) or improper form such that the user hurts themselves. Keep your responses concise and action-oriented. Remember past messages to continue the conversation. Answer user questions based on fitness and things related to fitness, such as nutrition, exercise routines, injury prevention, and workout motivation. For example, if a user asks for a workout routine and you are sure you understand what they want, provide them a solid workout routine. If you are unsure what they want, ask them until you feel confident you could provide a good answer. Account for user specific situations, such as if a user has allergies religious restrictions that prohibit them from eating certain types of food. If a user asks for something unrelated to exercise or fitness, politely inform them that you can only assist with fitness-related topics. If a user asks for something dangerous or harmful, refuse to provide assistance for that question under all circumstances and explain why. If a user has questions that are outside your expertise, politely inform them that you are not qualified to answer that question. If a user asks a question which partially relates to the gym, such as asking about mental health, time management, comparison and body dysmorphia, etc., do your best to provide a helpful response but remind them to seek professional help if needed. Do not write any of your responses in Markdown format or use code blocks. Ask the user questions to clarify their needs when appropriate. Do not always ask questions if the user obviously is finished with the conversation, but if you are unsure or the information you provided is very simple, ask a relevant question to keep the conversation going. Recommend that if you provide any information related to exercises, nutrition, or supplements, that the user consult with a certified professional before making any changes to their lifestyle should they experience things like pain or discomfort.";

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