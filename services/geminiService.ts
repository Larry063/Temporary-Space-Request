import { GoogleGenAI } from "@google/genai";
import { SpaceRequest } from "../types";

const apiKey = process.env.API_KEY || '';
// In a real app, we handle missing keys gracefully, here we assume it's injected or we handle error later.

const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  analyzeSpaceRequest: async (request: Partial<SpaceRequest>): Promise<string> => {
    if (!apiKey) return "AI Analysis Unavailable: API Key missing.";

    try {
      const prompt = `
        You are an industrial facility manager AI assistant. 
        Analyze the following temporary space request for storage.
        
        Machine Name: ${request.machineName}
        Description: ${request.workCell}
        Dimensions: ${request.length}m x ${request.width}m x ${request.height}m
        Duration: From ${request.dateIn} to ${request.dateOut}
        
        Please provide a very brief (max 2 sentences) assessment:
        1. Does the size seem realistic for this type of machine?
        2. Any safety or storage stacking warnings based on the name/type?
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No analysis generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to complete AI analysis at this time.";
    }
  }
};