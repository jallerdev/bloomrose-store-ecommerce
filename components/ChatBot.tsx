"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Flower2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  /** Si false, no se renderiza (cuando el server no tiene ANTHROPIC_API_KEY). */
  enabled: boolean;
  /** Callback para que el WhatsApp FAB se oculte mientras este chat está abierto. */
  onOpenChange?: (open: boolean) => void;
}

const SYSTEM_GREETING: Message = {
  role: "assistant",
  content:
    "¡Hola! Soy Rosa 🌸, la asistente de Bloomrose. Cuéntame, ¿en qué te puedo ayudar? Puedo responderte sobre productos, envíos o devoluciones.",
};

const HIDE_PATHS = ["/admin", "/auth", "/checkout/pago"];

export function ChatBot({ enabled, onOpenChange }: Props) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([SYSTEM_GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  if (!mounted || !enabled) return null;
  const hide = HIDE_PATHS.some((p) => pathname?.startsWith(p));
  if (hide) return null;

  // Si estamos en una PDP, le pasamos el slug al backend para que
  // arme contexto del producto que se está viendo.
  const productSlug = pathname?.startsWith("/productos/")
    ? pathname.split("/")[2]
    : undefined;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== SYSTEM_GREETING),
          productSlug,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error ??
              "Tuve un problema. Por favor intenta de nuevo o contáctanos por WhatsApp.",
          },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "No pude conectarme. Revisa tu internet o escríbenos por WhatsApp.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 sm:bottom-24 sm:h-14 sm:w-14"
          aria-label="Abrir asistente Rosa"
          style={{
            // En desktop lo ponemos arriba del WhatsApp; en mobile lado a lado.
            bottom: "5.25rem",
          }}
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Panel del chat */}
      {open && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col border-t border-border bg-card shadow-2xl",
            "sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:w-[400px] sm:max-w-[calc(100vw-2.5rem)] sm:rounded-2xl sm:border",
          )}
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
                <Flower2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Rosa</p>
                <p className="text-[10px] text-muted-foreground">
                  Asistente Bloomrose
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </li>
              ))}
              {pending && (
                <li className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3 text-foreground">
                    <Dot delay={0} />
                    <Dot delay={150} />
                    <Dot delay={300} />
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              maxLength={1000}
              disabled={pending}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
