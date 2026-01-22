
import { GoogleGenAI, Type } from "@google/genai";
import { SHLData, SimulationResult, Agent } from "../types";

// Initialize the GoogleGenAI instance using the environment's API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean Markdown code blocks from JSON strings
const cleanJson = (text: string): string => {
  if (!text) return '{}';
  // Remove ```json ... ``` or just ``` ... ``` fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  return cleaned.trim();
};

// Parse content from uploaded SHL reports into structured data.
export const parseSHLFile = async (fileName: string, content: string): Promise<Partial<SHLData>> => {
  const response = await ai.models.generateContent({
    model: 'gemma-3-27b-it',
    contents: `Parse this SHL report content and extract metrics. FileName: ${fileName}. Content: ${content}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          listening: { type: Type.NUMBER },
          speaking: { type: Type.NUMBER },
          reading: { type: Type.NUMBER },
          sales: { type: Type.NUMBER },
          cefr: { type: Type.STRING },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  
  try {
    return JSON.parse(cleanJson(response.text || '{}'));
  } catch (e) {
    console.error("Failed to parse SHL JSON", e);
    return {};
  }
};

// Analyze transcripts from voice or chat simulations to provide performance feedback.
export const analyzeSimulation = async (transcript: string, type: 'Voice' | 'Chat', nature: string): Promise<SimulationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemma-3-27b-it',
    contents: `Analyze this ${type} simulation transcript for a ${nature} agent: "${transcript}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          empathy: { type: Type.NUMBER, description: 'Score out of 100' },
          accuracy: { type: Type.NUMBER, description: 'Score out of 100' },
          compliance: { type: Type.NUMBER, description: 'Score out of 100' },
          status: { type: Type.STRING, description: 'PASS, CONDITIONAL, or FAIL' },
          feedback: { type: Type.STRING }
        },
        required: ['empathy', 'accuracy', 'compliance', 'status', 'feedback']
      }
    }
  });

  try {
    return JSON.parse(cleanJson(response.text || '{}'));
  } catch (e) {
    console.error("Failed to parse Simulation JSON", e);
    return {
      empathy: 0, accuracy: 0, compliance: 0, status: 'FAIL', feedback: 'Error analyzing transcript.'
    };
  }
};

// Generate personalized coaching recommendations based on an agent's specific metrics.
export const getAITrainingCoachFeedback = async (agent: Agent): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemma-3-27b-it',
    contents: `As an AI Training Coach for TP Skillence, provide professional analysis and coaching advice for the following agent:
    - Name: ${agent.name}
    - CEFR Level: ${agent.cefr}
    - Overall Performance: ${agent.overallAvg}%
    - Skills Profile: Writing (${agent.writing}%), Speaking (${agent.speaking}%), Listening (${agent.listening}%), Grammar (${agent.grammar}%), Analytical (${agent.analytical}%)
    - Primary Focus Area: ${agent.primaryOpportunity}
    
    Please provide actionable insights to help the agent bridge their performance gaps.`,
    config: {
      systemInstruction: "You are a world-class senior training coach for a BPO firm. Provide empathetic, professional, and highly actionable feedback in Markdown format.",
    }
  });
  return response.text || 'Unable to generate coaching feedback at this time.';
};
