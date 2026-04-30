import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { buildStoreContext, buildSystemPrompt } from "@/lib/chat/system-prompt";
import { checkRateLimit } from "@/lib/chat/rate-limit";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
  productSlug: z.string().max(255).optional(),
});

// Modelo y tope de tokens. Haiku para latencia y costo bajos.
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 400;

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Chat no configurado" },
      { status: 503 },
    );
  }

  // Rate limit por IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = checkRateLimit(`chat:${ip}`, { max: 12, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof inputSchema>;
  try {
    const body = await request.json();
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Construir contexto dinámico server-side. La usuaria NO controla qué
  // datos de la DB se cargan: solo si pasa un slug, lo recogemos como
  // dato de producto (público). Nada más entra al modelo.
  const { categoriesText, productText } = await buildStoreContext(
    parsed.productSlug,
  );
  const systemPrompt = buildSystemPrompt({
    categoriesText,
    productText,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: parsed.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("[chat] anthropic error", err);
    return NextResponse.json(
      { error: "El asistente no está disponible ahora mismo." },
      { status: 502 },
    );
  }
}
