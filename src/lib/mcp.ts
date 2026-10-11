export const INVESTSAHAM_MCP_URL = process.env.INVESTSAHAM_MCP_URL ?? "https://investsaham.com/api/mcp";

export type McpTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

type JsonRpcResponse<T> = { result?: T; error?: { message: string } };

async function rpc<T>(apiKey: string, method: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch(INVESTSAHAM_MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("API key InvestSaham ditolak. Cek lagi key di Setting.");
  if (!res.ok) throw new Error(`MCP InvestSaham error ${res.status}`);
  const raw = await res.text();
  const json = raw.trimStart().startsWith("{") ? raw : (raw.match(/^data: (.*)$/m)?.[1] ?? "{}");
  const body = JSON.parse(json) as JsonRpcResponse<T>;
  if (body.error) throw new Error(body.error.message);
  return body.result as T;
}

export async function listTools(apiKey: string) {
  const { tools } = await rpc<{ tools: McpTool[] }>(apiKey, "tools/list");
  return tools;
}

export async function callTool(apiKey: string, name: string, args: Record<string, unknown>) {
  const result = await rpc<{ content?: { type: string; text?: string }[]; isError?: boolean }>(apiKey, "tools/call", {
    name,
    arguments: args,
  });
  const text = (result.content ?? []).map((part) => part.text ?? "").join("\n");
  return { text, isError: Boolean(result.isError) };
}
