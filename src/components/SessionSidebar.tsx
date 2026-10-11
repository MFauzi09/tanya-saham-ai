"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Session, User } from "@/lib/types";
import { Icon, IconButton, Logo, TickerAvatar } from "./ui";

const SEARCH_DEBOUNCE_MS = 300;

const timeLabel = (ms: number) => {
  const date = new Date(ms);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

function SessionTitle({ session, onRename }: { session: Session; onRename: (title: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);

  const save = () => {
    const title = draft.trim();
    if (title && title !== session.title) onRename(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        maxLength={60}
        aria-label="Judul sesi"
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setDraft(session.title);
            setEditing(false);
          }
        }}
        className="w-full rounded-md border border-accent bg-panel px-1.5 py-0.5 font-display font-bold outline-none"
      />
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span
        className="truncate font-display font-bold"
        title={`${session.title} (klik dua kali untuk ganti judul)`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setDraft(session.title);
          setEditing(true);
        }}
      >
        {session.title}
      </span>
      <button
        type="button"
        aria-label={`Ganti judul ${session.title}`}
        title="Ganti judul"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(session.title);
          setEditing(true);
        }}
        className="shrink-0 rounded p-0.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-accent"
      >
        <Icon name="pencil" size={13} />
      </button>
    </div>
  );
}

type Props = {
  sessions: Session[];
  activeId?: string;
  user: User | null;
  open: boolean;
  onPick: (id: string) => void;
  onNew: () => void;
  onClose: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSettings: () => void;
  onLogout: () => void;
  onDismiss: () => void;
};

export function SessionSidebar({ sessions, activeId, user, open, onPick, onNew, onClose, onRename, onSettings, onLogout, onDismiss }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim().toLowerCase()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const visible = sessions.filter((s) => !debounced || `${s.title} ${s.code}`.toLowerCase().includes(debounced));

  return (
    <>
      {open && <button aria-label="Tutup daftar sesi" onClick={onDismiss} className="fixed inset-0 z-20 bg-black/40 md:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[min(320px,86vw)] flex-col border-r border-line bg-panel transition-transform duration-300 md:static md:w-[300px] md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
          <Logo height={30} />
          <span className="mr-auto font-display text-sm font-bold">Sesi</span>
          <IconButton label="Setting" onClick={onSettings}>
            <Icon name="settings" />
          </IconButton>
          <IconButton label="Sesi baru" onClick={onNew} solid>
            <Icon name="plus" />
          </IconButton>
        </div>

        <input
          id="session-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari sesi atau kode saham"
          aria-label="Cari sesi"
          className="mx-3.5 my-2.5 rounded-xl border border-line bg-panel-2 px-3 py-2 outline-none focus:border-accent"
        />

        <ul className="thin-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          <AnimatePresence initial={false}>
            {visible.map((session) => {
              const active = session.id === activeId;
              const last = session.messages.at(-1)?.text ?? "Belum ada pesan";
              return (
                <motion.li
                  key={session.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => onPick(session.id)}
                  aria-current={active}
                  className={`group relative grid cursor-pointer grid-cols-[40px_1fr_auto] items-center gap-2.5 rounded-xl p-2.5 hover:bg-panel-2 ${active ? "bg-panel-2" : ""}`}
                >
                  {active && <span className="absolute inset-y-3 left-0 w-[3px] rounded bg-accent" />}
                  <TickerAvatar code={session.code} />
                  <div className="min-w-0">
                    <SessionTitle session={session} onRename={(title) => onRename(session.id, title)} />
                    <p className="truncate text-[0.8rem] text-muted" title={last}>
                      {last}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[0.7rem] text-muted">
                    <span>{timeLabel(session.updatedAt)}</span>
                    <button
                      type="button"
                      aria-label={`Tutup sesi ${session.title}`}
                      title="Tutup sesi"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose(session.id);
                      }}
                      className={`rounded-md p-0.5 hover:bg-line hover:text-down focus-visible:opacity-100 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {!visible.length && <li className="px-3 py-6 text-center text-[0.82rem] text-muted">Tidak ada sesi yang cocok.</li>}
        </ul>

        <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-3">
          {user?.picture ? (
            <Image src={user.picture} alt="" width={32} height={32} className="size-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-amber-400 font-bold text-amber-950">{user?.name.at(0)?.toUpperCase() ?? "?"}</span>
          )}
          <div className="min-w-0 flex-1 text-[0.8rem]">
            <b className="block truncate">{user?.name}</b>
            <span className="block truncate text-muted" title={user?.email}>
              {user?.email}
            </span>
          </div>
          <IconButton label="Keluar" onClick={onLogout}>
            <Icon name="logout" size={15} />
          </IconButton>
        </div>
      </aside>
    </>
  );
}
