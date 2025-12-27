
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Message, Role, Persona } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, Chat> = new Map();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private getChatSession(persona: Persona, sessionId: string, history: Message[] = []): Chat {
    if (!this.chatSessions.has(sessionId)) {
      const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: persona.systemInstruction,
          temperature: 0.9,
          topP: 0.95,
          history: geminiHistory,
        },
      });
      this.chatSessions.set(sessionId, chat);
    }
    return this.chatSessions.get(sessionId)!;
  }

  async *sendMessageStream(sessionId: string, persona: Persona, message: string, history: Message[] = []) {
    try {
      const chat = this.getChatSession(persona, sessionId, history);
      const stream = await chat.sendMessageStream({ message });
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error) {
      console.error("Stream error:", error);
      yield `\n[NEURAL_LINK_FAILURE]: ${error instanceof Error ? error.message : 'UNEXPECTED_DISCONNECT'}`;
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      // Re-initialize to ensure latest API key context
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  }

  resetSession(sessionId: string) {
    this.chatSessions.delete(sessionId);
  }
}

export const geminiService = new GeminiService();
