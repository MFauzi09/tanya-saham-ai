import { GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import { callTool, listTools } from "./mcp";
import { buildSystemInstruction } from "./prompt";
import { GEMINI_MODELS, type ChatRequest, type ChatSettings, type ToolCall } from "./types";

const MAX_TOOL_ROUNDS = 4;
const MEMORY_WINDOW = 20;
const RETRY_DELAYS_MS = [1000, 2500];
const TRANSIENT_ERROR = /\b(503|429|500)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|fetch failed|ECONNRESET|ETIMEDOUT/i;
const BUSY_MESSAGE = "Server Gemini sedang sibuk. Coba kirim ulang sebentar lagi.";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetired = (e: unknown) => e instanceof Error && /NOT_FOUND|no longer available/i.test(e.message);
const isTransient = (e: unknown) => e instanceof Error && TRANSIENT_ERROR.test(e.message);

async function withFallback<T>(models: string[], call: (model: string) => Promise<T>): Promise<{ result: T; model: string }> {
  for (const model of models) {
    for (const delay of [...RETRY_DELAYS_MS, -1]) {
      try {
        return { result: await call(model), model };
      } catch (e) {
        if (isRetired(e)) break;
        if (!isTransient(e)) throw e;
        if (delay >= 0) await sleep(delay);
      }
    }
  }
  throw new Error(BUSY_MESSAGE);
}

type Keys = { gemini: string; investsaham?: string };

export async function runChat(conversation: ChatRequest["conversation"], settings: ChatSettings, keys: Keys) {
  const ai = new GoogleGenAI({ apiKey: keys.gemini });
  const requestedMcpKey = settings.useMcp ? keys.investsaham : undefined;
  const mcpTools = requestedMcpKey ? await listTools(requestedMcpKey).catch(() => []) : [];
  const mcpKey = mcpTools.length ? requestedMcpKey : undefined;

  const functionDeclarations: FunctionDeclaration[] = mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: tool.inputSchema,
  }));

  const history = settings.memory ? conversation.slice(-MEMORY_WINDOW) : conversation.slice(-1);
  const contents: Content[] = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
  const config = {
    temperature: settings.temperature,
    systemInstruction: await buildSystemInstruction({ ...settings, useMcp: Boolean(mcpKey) }),
    tools: functionDeclarations.length ? [{ functionDeclarations }] : undefined,
  };

  const usedTools: ToolCall[] = [];
  let models = [settings.model, ...GEMINI_MODELS.filter((m) => m !== settings.model && !m.includes("pro"))];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const { result: response, model } = await withFallback(models, (m) => ai.models.generateContent({ model: m, contents, config }));
    models = [model, ...models.filter((m) => m !== model)];
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
