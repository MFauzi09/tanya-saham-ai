"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { askAssistant } from "@/lib/api";
import { newId, useStoredState } from "@/lib/storage";
import type { Message } from "@/lib/types";
import { Composer } from "./Composer";
import { MessageBubble, PendingBubble } from "./MessageBubble";

const GREETING: Message = { id: "greeting", role: "model", text: "Halo! Mau cek saham apa hari ini? Ketik kode emitennya, contoh **BBRI**." };

export function EmbedChat() {
  const [messages, setMessages] = useStoredState<Message[]>("tsa:embed", []);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const send = async (text: string) => {
    const conversation: Message[] = [...messages, { id: newId(), role: "user", text }];
    setMessages(conversation);
    setPending(true);
    const reply: Message = await askAssistant(conversation)
      .then(({ result, tools }) => ({ id: newId(), role: "model" as const, text: result, tools }))
      .catch((e: Error) => ({ id: newId(), role: "model" as const, text: e.message, error: true }));
    setMessages([...conversation, reply]);
    setPending(false);
  };

  return (
    <div className="flex h-dvh flex-col bg-panel">
      <header className="flex items-center gap-2.5 bg-gradient-to-r from-[#059669] to-[#1d4ed8] px-4 py-3 text-white">
        <span className="grid place-items-center rounded-lg bg-white px-1.5 py-1">
          <Image src="/logo-investsaham.webp" alt="InvestSaham" width={46} height={24} />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block font-display">Tanya Saham AI</b>
          <span className="text-[0.72rem] opacity-85">Gemini + MCP InvestSaham</span>
        </div>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="rounded-lg bg-white/15 px-2.5 py-1 text-[0.72rem] font-semibold hover:bg-white/25"
        >
          Chat baru
        </button>
        <button
          type="button"
          aria-label="Tutup chat"
          onClick={() => window.parent.postMessage({ type: "tsa:close" }, "*")}
          className="grid size-8 place-items-center rounded-lg bg-white/15 hover:bg-white/25"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="thin-scroll flex flex-1 flex-col gap-2.5 overflow-y-auto bg-chat-bg p-3.5">
        <MessageBubble message={GREETING} />
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </AnimatePresence>
        {pending && <PendingBubble usingMcp />}
      </div>
      <Composer onSend={send} disabled={pending} compact />
    </div>
  );
}
