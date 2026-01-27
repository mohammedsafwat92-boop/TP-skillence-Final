
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
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
    model: 'gemini-3-flash-preview',
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
export const analyzeSimulation = async (transcript: string, type: 'Voice' | 'Chat' | 'Email', nature: string): Promise<SimulationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
    model: 'gemini-3-flash-preview',
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

// Unified function to handle Chat, Email, and Voice simulations
export const runSimulationTurn = async (
  history: {role: 'user' | 'model', text: string}[], 
  context: string,
  mode: 'chat' | 'email' | 'voice'
): Promise<string> => {
  
  let systemInstruction = "";
  
  if (mode === 'email') {
    systemInstruction = "You are a customer communicating via Email. Your responses should be structured like emails (Subject line optional for replies, but clear body). Be formal or semi-formal depending on context. Sign off with a name.";
  } else if (mode === 'voice') {
    systemInstruction = "You are a customer on a live Phone Call. Your responses must be short, spoken-style, and strictly conversational. Do NOT use markdown, emojis, or bullet points. Act like you are speaking.";
  } else {
    // Chat
    systemInstruction = "You are a customer in a Live Chat session. Be quick, helpful, slightly informal but impatient if needed. Keep messages concise (under 40 words).";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `Scenario Context: ${context}` }] },
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    ],
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.9,
      maxOutputTokens: mode === 'email' ? 300 : 100, // Emails need more space
    }
  });
  
  return response.text || "...";
};

// Deprecated alias for backward compatibility if needed, but runSimulationTurn is preferred
export const generateCustomerResponse = async (history: {role: 'user' | 'model', text: string}[], context: string): Promise<string> => {
  return runSimulationTurn(history, context, 'chat');
};

/**
 * Connects to Gemini Live API for real-time audio simulation.
 */
export const connectToLiveSession = (
  context: string,
  initialMessage: string,
  callbacks: {
    onOpen: () => void;
    onAudioData: (base64Audio: string) => void;
    onClose: () => void;
    onError: (err: any) => void;
  }
) => {
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => {
        callbacks.onOpen();
        // Context and initial task are handled in systemInstruction to avoid text/plain input errors
      },
      onmessage: (message: LiveServerMessage) => {
        // Handle Audio
        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          callbacks.onAudioData(base64Audio);
        }

        // Handle interruption (server side)
        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
          console.log("Model interrupted");
        }
      },
      onclose: () => {
        callbacks.onClose();
      },
      onerror: (err) => {
        callbacks.onError(err);
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      // Combine context and initial prompt into system instruction for stability
      systemInstruction: `You are a customer in a roleplay simulation. ${context}. Keep your responses spoken, natural, and concise (under 15 seconds). React realistically to the agent. First, say exactly: "${initialMessage}" to start.`,
    },
  });

  return {
    sendAudioChunk: (base64PCM: string) => {
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64PCM
          }
        });
      });
    },
    disconnect: () => {
      sessionPromise.then(session => session.close());
    }
  };
};
