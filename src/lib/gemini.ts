import { GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import { callTool, listTools } from "./mcp";
import { buildSystemInstruction } from "./prompt";
import type { ChatRequest, ChatSettings, ToolCall } from "./types";

const MAX_TOOL_ROUNDS = 4;
const MEMORY_WINDOW = 20;

type Keys = { gemini: string; investsaham?: string };

export async function runChat(conversation: ChatRequest["conversation"], settings: ChatSettings, keys: Keys) {
  const ai = new GoogleGenAI({ apiKey: keys.gemini });
  const mcpKey = settings.useMcp ? keys.investsaham : undefined;

  const functionDeclarations: FunctionDeclaration[] = mcpKey
    ? (await listTools(mcpKey)).map((tool) => ({
        name: tool.name,
        description: tool.description,
        parametersJsonSchema: tool.inputSchema,
      }))
    : [];

  const history = settings.memory ? conversation.slice(-MEMORY_WINDOW) : conversation.slice(-1);
  const contents: Content[] = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
  const config = {
    temperature: settings.temperature,
    systemInstruction: await buildSystemInstruction({ ...settings, useMcp: Boolean(mcpKey) }),
    tools: functionDeclarations.length ? [{ functionDeclarations }] : undefined,
  };

  const usedTools: ToolCall[] = [];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await ai.models.generateContent({ model: settings.model, contents, config });
    const calls = response.functionCalls ?? [];

    if (!calls.length || !mcpKey || round === MAX_TOOL_ROUNDS) {
      return { result: response.text ?? "Maaf, Gemini tidak mengirim jawaban.", tools: usedTools };
    }

    contents.push(response.candidates?.[0]?.content ?? { role: "model", parts: calls.map((functionCall) => ({ functionCall })) });

    const outputs = await Promise.all(
      calls.map(async (call) => {
        const args = (call.args ?? {}) as Record<string, unknown>;
        usedTools.push({ name: call.name ?? "tool", args });
        const output = await callTool(mcpKey, call.name ?? "", args).catch((e: Error) => ({ text: e.message, isError: true }));
        return { functionResponse: { id: call.id, name: call.name, response: output.isError ? { error: output.text } : { output: output.text } } };
      }),
    );
    contents.push({ role: "user", parts: outputs });
  }

  return { result: "Maaf, Gemini tidak mengirim jawaban.", tools: usedTools };
}
