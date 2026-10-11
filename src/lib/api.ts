import type { ChatResponse, ChatSettings, Message, Settings, ToolCall } from "./types";

export async function askAssistant(messages: Message[], settings?: Settings | ChatSettings) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (settings && "geminiKey" in settings) {
    if (settings.geminiKey) headers["x-gemini-key"] = settings.geminiKey;
    if (settings.investsahamKey) headers["x-investsaham-key"] = settings.investsahamKey;
  }
  const conversation = messages.filter((m) => !m.error).map(({ role, text }) => ({ role, text }));
  const chatSettings = settings
    ? (({ model, temperature, tone, level, extra, memory, useMcp, useEbook }) => ({ model, temperature, tone, level, extra, memory, useMcp, useEbook }))(settings)
    : undefined;

  const res = await fetch("/api/chat", { method: "POST", headers, body: JSON.stringify({ conversation, settings: chatSettings }) });
  const data = (await res.json().catch(() => ({ error: "Server tidak mengirim JSON." }))) as ChatResponse;
  if ("error" in data) throw new Error(data.error);
  return data as { result: string; tools: ToolCall[] };
}

const TICKER = /\b[A-Z]{4}\b/;

export function sessionCodeFrom(text: string) {
  return text.toUpperCase().match(TICKER)?.[0] ?? "";
}
