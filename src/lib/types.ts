export type Role = "user" | "model";

export type ToolCall = { name: string; args: Record<string, unknown> };

export type Message = {
  id: string;
  role: Role;
  text: string;
  tools?: ToolCall[];
  error?: boolean;
};

export type Session = {
  id: string;
  title: string;
  code: string;
  updatedAt: number;
  messages: Message[];
};

export type Tone = "formal" | "santai" | "mentor";
export type Level = "pemula" | "menengah" | "trader";

export type ChatSettings = {
  model: string;
  temperature: number;
  tone: Tone;
  level: Level;
  extra: string;
  memory: boolean;
  useMcp: boolean;
  useEbook: boolean;
};

export type Settings = ChatSettings & {
  geminiKey: string;
  investsahamKey: string;
};

export type User = { name: string; email: string; picture?: string };

export type ChatRequest = {
  conversation: { role: Role; text: string }[];
  settings?: Partial<ChatSettings>;
};

export type ChatResponse = { result: string; tools: ToolCall[] } | { error: string };

export const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"] as const;

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  model: "gemini-2.5-flash",
  temperature: 0.4,
  tone: "santai",
  level: "pemula",
  extra: "",
  memory: true,
  useMcp: true,
  useEbook: true,
};
