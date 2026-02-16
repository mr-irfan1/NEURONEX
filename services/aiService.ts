import { GoogleGenAI } from "@google/genai";

// In a real production environment, these calls would go to the FastAPI backend 
// which would then communicate with AWS Bedrock.
// For this frontend artifact, we use Gemini directly to demonstrate intelligence.

const getAIClient = () => {
  // strictly use the environment variable as per guidelines
  const key = process.env.API_KEY;
  
  if (!key) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const generateExplanation = async (topic: string, level: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable (Missing Key)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the concept of "${topic}" to a student at a "${level}" level. 
      Keep it concise (under 150 words) and use bullet points for key takeaways.`,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate explanation. Please try again.";
  }
};

export const generateQuiz = async (topic: string, content: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a short 3-question multiple choice quiz based on the following notes about "${topic}".
      
      Notes:
      ${content.substring(0, 1000)}...
      
      Format: 
      **Question 1:** [Question]
      A) [Option]
      B) [Option]
      C) [Option]
      **Correct Answer:** [Answer]
      `,
    });
    return response.text || "No quiz generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate quiz.";
  }
};

export const summarizeNotes = async (content: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following notes into a concise paragraph with key bullet points:
      
      ${content.substring(0, 2000)}`,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to summarize.";
  }
};

export const debugCode = async (code: string, language: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    // Coding is a complex task, so we use the Pro model
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following ${language} code for bugs, performance issues, and readability. 
      Provide a brief summary of issues and the corrected code block.
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      `,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to debug code.";
  }
};

export const simulateRun = async (code: string, language: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a code runner console. Execute the following ${language} code mentally and provide ONLY the console output.
      Do not explain the code. If there is an error, show the error message.
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      `,
    });
    return response.text || "No output generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to simulate code execution.";
  }
};

export const optimizeCode = async (code: string, language: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Optimize the following ${language} code for performance and readability. 
      Provide the optimized code and a brief explanation of changes.
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      `,
    });
    return response.text || "No optimization generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to optimize code.";
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the following ${language} code step-by-step in simple terms.
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      `,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to explain code.";
  }
};

export const generateLogicFlow = async (code: string, language: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a text-based flowchart or logical step-by-step process for the following ${language} code.
      Use ASCII art arrows (->) or numbered steps to visualize the logic flow clearly.
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      `,
    });
    return response.text || "No flow generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate flow.";
  }
};

export const chatWithTutor = async (history: { role: string; text: string }[], message: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "I'm offline right now.";

  try {
    // Construct chat history for context
    const prompt = `You are "Nova", a highly intelligent and encouraging AI tutor for coding and computer science students.
    
    Guidelines:
    1. Keep responses concise (2-4 sentences) unless a detailed explanation is requested.
    2. Use a friendly, professional, and motivating tone.
    3. If the user makes a mistake, guide them gently to the correct answer.
    4. You can provide code snippets if asked.
    
    Conversation History:
    ${history.map(h => `${h.role === 'user' ? 'Student' : 'Nova'}: ${h.text}`).join('\n')}
    
    Student: ${message}
    Nova:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "I didn't catch that.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Connection error.";
  }
};