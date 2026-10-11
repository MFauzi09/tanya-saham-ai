"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { askAssistant, sessionCodeFrom } from "@/lib/api";
import { newId, STORAGE_KEYS, useStoredState } from "@/lib/storage";
import { DEFAULT_CHAT_SETTINGS, type Message, type Session, type Settings, type User } from "@/lib/types";
import { Composer, QUICK_PROMPTS } from "./Composer";
import { MessageBubble, PendingBubble } from "./MessageBubble";
import { SessionSidebar } from "./SessionSidebar";
import { Icon, IconButton, Skeleton, TickerAvatar } from "./ui";

const SettingsModal = lazy(() => import("./SettingsModal"));

export const DEFAULT_SETTINGS: Settings = { ...DEFAULT_CHAT_SETTINGS, geminiKey: "", investsahamKey: "" };
const NEW_SESSION_TITLE = "Sesi baru";

const createSession = (): Session => ({ id: newId(), title: NEW_SESSION_TITLE, code: "", updatedAt: Date.now(), messages: [] });

export default function ChatApp() {
  const router = useRouter();
  const [user, setUser, userReady] = useStoredState<User | null>(STORAGE_KEYS.user, null);
  const [sessions, setSessions, sessionsReady] = useStoredState<Session[]>(STORAGE_KEYS.sessions, []);
  const [activeId, setActiveId] = useStoredState<string>(STORAGE_KEYS.activeSession, "");
  const [settings, setSettings] = useStoredState<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const isPending = active ? pending.has(active.id) : false;

  useEffect(() => {
    if (userReady && !user) router.replace("/");
  }, [userReady, user, router]);

  useEffect(() => {
    if (sessionsReady && !sessions.length) {
      const first = createSession();
      setSessions([first]);
      setActiveId(first.id);
    }
  }, [sessionsReady, sessions.length, setSessions, setActiveId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, isPending]);

  const patchSession = (id: string, patch: (s: Session) => Session) => setSessions((all) => all.map((s) => (s.id === id ? patch(s) : s)));

  const newSession = () => {
    const session = createSession();
    setSessions((all) => [session, ...all]);
    setActiveId(session.id);
    setSidebarOpen(false);
  };

  const closeSession = (id: string) => {
    const rest = sessions.filter((s) => s.id !== id);
    setSessions(rest);
    if (id === active?.id) setActiveId(rest[0]?.id ?? "");
  };

  const send = async (text: string) => {
    if (!active) return;
    const id = active.id;
    const userMessage: Message = { id: newId(), role: "user", text };
    const conversation = [...active.messages, userMessage];
    const code = sessionCodeFrom(text);

    patchSession(id, (s) => ({
      ...s,
      messages: conversation,
      updatedAt: Date.now(),
      code: s.code || code || "TANYA",
      title: s.title === NEW_SESSION_TITLE ? (code ? `Analisa ${code}` : text.slice(0, 40)) : s.title,
    }));
    setPending((p) => new Set(p).add(id));

    const reply: Message = await askAssistant(conversation, settings)
      .then(({ result, tools }) => ({ id: newId(), role: "model" as const, text: result, tools }))
      .catch((e: Error) => ({ id: newId(), role: "model" as const, text: e.message, error: true }));

    patchSession(id, (s) => ({ ...s, messages: [...s.messages, reply], updatedAt: Date.now() }));
    setPending((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    router.replace("/");
  };

  if (!userReady || !sessionsReady || !user) return <ChatSkeleton />;

  return (
    <div className="flex h-dvh overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        activeId={active?.id}
        user={user}
        open={sidebarOpen}
        onPick={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={newSession}
        onClose={closeSession}
        onRename={(id, title) => patchSession(id, (s) => ({ ...s, title }))}
        onSettings={() => setSettingsOpen(true)}
        onLogout={logout}
        onDismiss={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-chat-bg">
        <header className="flex items-center gap-3 border-b border-line bg-panel px-4 py-2.5">
          <span className="md:hidden">
            <IconButton label="Buka daftar sesi" onClick={() => setSidebarOpen(true)}>
              <Icon name="menu" />
            </IconButton>
          </span>
          <TickerAvatar code={active?.code ?? ""} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display font-bold" title={active?.title}>
              {active?.title ?? "Tidak ada sesi"}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-up" />
                {settings.model}
              </span>
              <StatusChip on={settings.useMcp}>MCP InvestSaham</StatusChip>
              <StatusChip on={settings.useMcp}>Skill TA</StatusChip>
              <StatusChip on={settings.useEbook}>Ebook</StatusChip>
            </div>
          </div>
        </header>

        {!settings.geminiKey && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="border-b border-warn/30 bg-warn/10 px-4 py-2 text-left text-[0.8rem] text-warn hover:bg-warn/15"
          >
            API key Gemini belum diisi. Klik di sini untuk buka Setting. Server tetap jalan kalau <code className="font-mono">GEMINI_API_KEY</code> sudah ada di <code className="font-mono">.env.local</code>.
          </button>
        )}

        <div ref={scrollRef} className="thin-scroll flex flex-1 flex-col gap-2.5 overflow-y-auto px-[clamp(12px,4vw,48px)] py-5">
          {active?.messages.length ? (
            <>
              <AnimatePresence initial={false}>
                {active.messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </AnimatePresence>
              {isPending && <PendingBubble usingMcp={settings.useMcp} />}
            </>
          ) : (
            <EmptyChat onPick={send} />
          )}
        </div>

        {Boolean(active?.messages.length) && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                disabled={isPending}
                className="rounded-full border border-line bg-panel px-3 py-1 text-[0.8rem] hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <Composer onSend={send} disabled={isPending || !active} />
      </main>

      <AnimatePresence>
        {settingsOpen && (
          <Suspense fallback={null}>
            <SettingsModal
              settings={settings}
              onSave={(next) => {
                setSettings(next);
                setSettingsOpen(false);
              }}
              onClose={() => setSettingsOpen(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusChip({ on, children }: { on: boolean; children: string }) {
  return (
    <span className={`rounded-full border px-2 py-px font-semibold ${on ? "border-accent/40 text-accent" : "border-line text-muted line-through"}`}>
      {children}
    </span>
  );
}

function EmptyChat({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="m-auto flex max-w-md flex-col items-center gap-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-ink">
        <Icon name="chat" size={26} />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold text-balance">Mau cek saham apa hari ini?</h2>
        <p className="text-muted">Ketik kode emiten, minta screener, atau tanya konsep dari ebook InvestSaham.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} onClick={() => onPick(prompt)} className="rounded-full border border-line bg-panel px-3.5 py-1.5 hover:border-accent hover:text-accent">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-dvh" aria-busy="true" aria-label="Memuat chat">
      <div className="hidden w-[300px] flex-col gap-3 border-r border-line bg-panel p-3.5 md:flex">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-2.5">
            <Skeleton className="size-10 rounded-xl" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-chat-bg p-5">
        <Skeleton className="h-12 w-full max-w-lg" />
        <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
        <Skeleton className="h-40 w-2/3 rounded-2xl" />
      </div>
    </div>
  );
}
