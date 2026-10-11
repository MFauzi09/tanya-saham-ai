"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "./ui";

export const QUICK_PROMPTS = ["Analisa teknikal BBCA", "Screener LQ45 hari ini", "Kapan harus cut loss?", "Bedanya support dan resistance"];

export function Composer({ onSend, disabled, compact }: { onSend: (text: string) => void; disabled?: boolean; compact?: boolean }) {
  const [text, setText] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-panel px-3 py-2.5">
      <textarea
        id={compact ? "embed-input" : "chat-input"}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={4000}
        placeholder={compact ? "Tulis pertanyaan…" : "Tanya soal saham, contoh: entry ADRO di mana?"}
        aria-label="Pesan"
        className="field-sizing-content max-h-32 min-w-0 flex-1 resize-none rounded-3xl border border-line bg-panel-2 px-4 py-2.5 outline-none focus:border-accent"
      />
      <button
        type="submit"
        aria-label="Kirim"
        disabled={disabled || !text.trim()}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
      >
        <Icon name="send" size={18} />
      </button>
    </form>
  );
}
