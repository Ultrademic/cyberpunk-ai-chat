
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  image?: string; // Base64 image data
  isAscii?: boolean; // Flag to render as ASCII
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  avatar: string;
  color: string;
}

export interface Session {
  id: string;
  name: string;
  personaId: string;
  lastUpdate: number;
  isStatic?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  topic: string;
  persona: Persona;
}
