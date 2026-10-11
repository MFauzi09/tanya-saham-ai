"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { User } from "@/lib/types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleCredential = { credential: string };
type GoogleId = {
  initialize: (config: { client_id: string; callback: (res: GoogleCredential) => void }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

function decodeGoogleUser(credential: string): User {
  const payload = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = JSON.parse(decodeURIComponent(escape(atob(payload)))) as { name: string; email: string; picture?: string };
  return { name: json.name, email: json.email, picture: json.picture };
}

export function LoginCard() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");

  const enter = (user: User) => {
    writeStorage(STORAGE_KEYS.user, user);
    router.push("/chat");
  };

  useEffect(() => {
    if (readStorage<User | null>(STORAGE_KEYS.user, null)) router.replace("/chat");
  }, [router]);

  const renderGoogle = () => {
    if (!GOOGLE_CLIENT_ID || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (res) => enter(decodeGoogleUser(res.credential)) });
    window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 320, locale: "id" });
  };

  const enterAsGuest = (e: FormEvent) => {
    e.preventDefault();
    const guest = name.trim() || "Tamu";
    enter({ name: guest, email: "Mode tamu, data hanya di browser ini" });
  };

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-4">
      {GOOGLE_CLIENT_ID && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={renderGoogle} />}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Masuk ke Tanya Saham AI</h2>
        <p className="text-muted">Riwayat sesi dan setting tersimpan di browser kamu.</p>
      </div>

      {GOOGLE_CLIENT_ID ? (
        <div ref={buttonRef} className="flex min-h-11 justify-center" />
      ) : (
        <p className="rounded-xl border border-dashed border-line p-3 text-[0.8rem] text-muted">
          Login Google aktif setelah <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> diisi di <code className="font-mono">.env.local</code>. Lihat README.
        </p>
      )}

      <div className="flex items-center gap-2.5 text-[0.75rem] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">atau</div>

      <form onSubmit={enterAsGuest} className="flex flex-col gap-3">
        <label htmlFor="guest-name" className="text-label font-semibold text-muted">
          Nama panggilan
        </label>
        <input
          id="guest-name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Rizky"
          className="rounded-xl border border-line bg-panel-2 px-3 py-2.5 outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-xl bg-accent px-4 py-2.5 font-bold text-accent-ink hover:bg-accent-strong">
          Masuk sebagai tamu
        </button>
      </form>
      <p className="text-[0.75rem] text-muted">Isi chat adalah edukasi, bukan ajakan beli atau jual saham.</p>
    </div>
  );
}
