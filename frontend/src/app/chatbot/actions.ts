"use server"
// actions.ts (server-side logic)
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";


const apiKey = process.env.key2;

if (!apiKey) {
  throw new Error("API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);


interface SchemaType {
  type: string;
  description: string;
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "string" as any ,
      description: "The generated response from the AI model in normal text.",
  
    },
  },

});

// Action for handling the chat logic
export const getCareerGuidanceResponse = async (userInput: string, chatHistory: string) => {
  try {
    if (!userInput) {
      throw new Error("User input is required");
    }

    // Create the prompt with provided chat history and user input
    const prompt = `
      You are a knowledgeable and supportive AI career advisor. Your goal is to help students navigate their career choices, provide guidance, and assist them in making informed decisions about their future.

      Chat Log:
      ${chatHistory}

      User Input: "${userInput}"

      Instructions:
      - Analyze the user's situation based on the chat history.
      - Provide practical and personalized advice related to the user's career goals and aspirations  in normal text .
      - Offer information on different career paths, educational requirements, and potential job opportunities  in normal text .
      - Encourage and guide users positively and only response realted to the carrer and councelling related subject if user ask anything else just say that u can only give answer related to councelling  in normal text .
      - if the user is greeting them then greet them back with information about your purpose in normal text 
      - minimum response should atleast be a line and maximum a paragraph and make sure not to use special characters

      User Question: "${userInput}"
    `;

    // Generate the response from the AI model
    const result = await model.generateContent(prompt.trim());
    const response = result.response.text()
    .replace(/\\\d+\\:\s+/g, '')  // Removes numbered escape sequences
    .replace(/\\/g, '')           // Removes unnecessary backslashes
    .replace(/, /g, '\n\n')
    .replace(/{/g, '')
    .replace(/}/g, '')       // Adds proper new lines
  // .replCE;

    // Return the generated response
    return { response };
  } catch (error) {
    console.error("Error processing AI request:", error);
    throw new Error("Failed to generate response from AI.");
  }
};
