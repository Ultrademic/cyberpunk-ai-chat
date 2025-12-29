
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Message, Role, Persona } from "../types";

export class GeminiService {
  private chatSessions: Map<string, Chat> = new Map();

  private getClient() {
    // Creating instance right before call as per instructions for dynamic API keys
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private getChatSession(persona: Persona, sessionId: string, history: Message[] = []): Chat {
    if (!this.chatSessions.has(sessionId)) {
      const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const client = this.getClient();
      const chat = client.chats.create({
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
    } catch (error: any) {
      console.error("Stream error:", error);
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes("429") || errorMessage.includes("quota")) {
        yield `\n\n[FATAL_ERROR]: QUOTA_EXHAUSTED. The shared neural link is saturated. Use a personal API key in 'Matrix Config' to bypass limits.`;
      } else if (errorMessage.includes("Requested entity was not found")) {
        yield `\n\n[FATAL_ERROR]: INVALID_KEY_LINK. Please re-authorize your neural uplink in settings.`;
      } else {
        yield `\n\n[NEURAL_LINK_FAILURE]: ${errorMessage || 'UNEXPECTED_DISCONNECT'}`;
      }
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
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
