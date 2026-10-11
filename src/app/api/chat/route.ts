import { runChat } from "@/lib/gemini";
import { DEFAULT_CHAT_SETTINGS, GEMINI_MODELS, type ChatRequest, type ChatSettings } from "@/lib/types";

const MAX_TEXT_LENGTH = 4000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-gemini-key, x-investsaham-key",
};

const fail = (error: string, status: number) => Response.json({ error }, { status, headers: corsHeaders });

function sanitizeSettings(input: ChatRequest["settings"]): ChatSettings {
  const merged = { ...DEFAULT_CHAT_SETTINGS, ...input };
  return {
    ...merged,
    model: (GEMINI_MODELS as readonly string[]).includes(merged.model) ? merged.model : DEFAULT_CHAT_SETTINGS.model,
    temperature: Math.min(2, Math.max(0, Number(merged.temperature) || 0)),
    extra: String(merged.extra ?? "").slice(0, 1000),
  };
}

export function GET() {
  return Response.json({ serverHasGeminiKey: Boolean(process.env.GEMINI_API_KEY) }, { headers: corsHeaders });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;
  const conversation = body?.conversation;

  if (!Array.isArray(conversation) || !conversation.length) return fail("conversation harus berupa array dan tidak boleh kosong.", 400);
  const valid = conversation.every((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.length <= MAX_TEXT_LENGTH);
  if (!valid) return fail(`Setiap pesan butuh role user/model dan text maksimal ${MAX_TEXT_LENGTH} karakter.`, 400);

  const gemini = request.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY;
  const investsaham = request.headers.get("x-investsaham-key") || process.env.INVESTSAHAM_API_KEY;
  if (!gemini) return fail("API key Gemini belum diisi. Buka Setting lalu tempel key dari aistudio.google.com/apikey.", 401);

  try {
    const reply = await runChat(conversation, sanitizeSettings(body?.settings), { gemini, investsaham });
    return Response.json(reply, { headers: corsHeaders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    const status = /api key|API_KEY_INVALID|PERMISSION_DENIED/i.test(message) ? 401 : 500;
    return fail(status === 401 && !/InvestSaham/.test(message) ? "API key Gemini ditolak. Cek lagi key di Setting." : message, status);
  }
}
