"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { GEMINI_MODELS, type Level, type Settings, type Tone } from "@/lib/types";
import { Icon, IconButton } from "./ui";

const TABS = [
  { id: "keys", label: "API key" },
  { id: "model", label: "Model & gaya" },
  { id: "skills", label: "Skill & materi" },
  { id: "embed", label: "Embed" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TONES: { value: Tone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "santai", label: "Santai" },
  { value: "mentor", label: "Mentor" },
];

const LEVELS: { value: Level; label: string }[] = [
  { value: "pemula", label: "Pemula" },
  { value: "menengah", label: "Menengah" },
  { value: "trader", label: "Trader" },
];

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label font-semibold text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-[0.75rem] text-muted">{hint}</p>}
    </div>
  );
}

function KeyInput({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.trim())}
        className="min-w-0 flex-1 rounded-xl border border-line bg-panel-2 px-3 py-2 font-mono text-[0.82rem] outline-none focus:border-accent"
      />
      <IconButton label={visible ? "Sembunyikan key" : "Lihat key"} onClick={() => setVisible((v) => !v)}>
        <Icon name="eye" />
      </IconButton>
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex overflow-hidden rounded-xl border border-line">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 px-2 py-2 text-[0.82rem] font-semibold ${o.value === value ? "bg-accent text-accent-ink" : "hover:bg-panel-2"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line p-3">
      <div className="flex-1">
        <b className="block font-display">{title}</b>
        <span className="text-[0.78rem] text-muted">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-line"}`}
      >
        <span className={`absolute top-[3px] size-4 rounded-full bg-white transition-[left] ${checked ? "left-[21px]" : "left-[3px]"}`} />
      </button>
    </div>
  );
}

export default function SettingsModal({ settings, onSave, onClose }: { settings: Settings; onSave: (s: Settings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(settings);
  const [tab, setTab] = useState<TabId>("keys");
  const [origin] = useState(() => window.location.origin);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const snippet = `<script\n  src="${origin}/widget.js"\n  data-position="bottom-right"\n  data-color="#059669"\n  defer></script>`;

  const copy = () =>
    navigator.clipboard.writeText(snippet).then(
      () => setCopied(true),
      () => setCopied(false),
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="thin-scroll flex max-h-full w-full max-w-[640px] flex-col overflow-y-auto rounded-2xl border border-line bg-panel"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <h2 id="settings-title" className="mr-auto font-display text-lg font-bold">
            Setting
          </h2>
          <IconButton label="Tutup" onClick={onClose}>
            <Icon name="close" size={14} />
          </IconButton>
        </div>

        <div role="tablist" className="thin-scroll flex gap-1 overflow-x-auto border-b border-line px-5 pt-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 font-semibold ${tab === t.id ? "border-accent text-fg" : "border-transparent text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          {tab === "keys" && (
            <>
              <Field
                label="Google Gemini API key"
                htmlFor="gemini-key"
                hint={
                  <>
                    Ambil gratis di{" "}
                    <a className="text-accent underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                      aistudio.google.com/apikey
                    </a>
                    . Wajib, chatbot memakai Gemini.
                  </>
                }
              >
                <KeyInput id="gemini-key" value={draft.geminiKey} onChange={(v) => set("geminiKey", v)} placeholder="AIza..." />
              </Field>
              <Field
                label="InvestSaham MCP API key"
                htmlFor="investsaham-key"
                hint={
                  <>
                    Salin dari{" "}
                    <a className="text-accent underline" href="https://investsaham.com" target="_blank" rel="noopener noreferrer">
                      investsaham.com
                    </a>{" "}
                    menu Connect AI. Membuka tool <code className="font-mono">get_asset_analysis</code> dan <code className="font-mono">ihsg_screener</code>.
                  </>
                }
              >
                <KeyInput id="investsaham-key" value={draft.investsahamKey} onChange={(v) => set("investsahamKey", v)} placeholder="Bearer token InvestSaham" />
              </Field>
              <p className="rounded-xl bg-panel-2 p-3 text-[0.78rem] text-muted">
                Key disimpan di browser kamu (localStorage) dan dikirim ke server aplikasi ini hanya saat bertanya. Key tidak pernah disimpan di server.
              </p>
            </>
          )}

          {tab === "model" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Model" htmlFor="model">
                  <select
                    id="model"
                    value={draft.model}
                    onChange={(e) => set("model", e.target.value)}
                    className="rounded-xl border border-line bg-panel-2 px-3 py-2 outline-none focus:border-accent"
                  >
                    {GEMINI_MODELS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Temperature ${draft.temperature.toFixed(1)}`} htmlFor="temperature" hint="Rendah = lebih presisi, tinggi = lebih kreatif.">
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={draft.temperature}
                    onChange={(e) => set("temperature", Number(e.target.value))}
                    className="accent-[var(--accent)]"
                  />
                </Field>
              </div>
              <Field label="Gaya bahasa">
                <Segmented label="Gaya bahasa" options={TONES} value={draft.tone} onChange={(v) => set("tone", v)} />
              </Field>
              <Field label="Level pengguna">
                <Segmented label="Level pengguna" options={LEVELS} value={draft.level} onChange={(v) => set("level", v)} />
              </Field>
              <Field label="Instruksi tambahan" htmlFor="extra">
                <textarea
                  id="extra"
                  rows={3}
                  maxLength={1000}
                  value={draft.extra}
                  onChange={(e) => set("extra", e.target.value)}
                  placeholder="Contoh: selalu hitung jumlah lot untuk modal 10 juta."
                  className="rounded-xl border border-line bg-panel-2 px-3 py-2 outline-none focus:border-accent"
                />
              </Field>
              <ToggleRow
                title="Memory sesi"
                description="Bot ingat 20 pesan terakhir di sesi yang sama, termasuk emiten dan modal yang kamu sebut."
                checked={draft.memory}
                onChange={(v) => set("memory", v)}
              />
            </>
          )}

          {tab === "skills" && (
            <>
              <ToggleRow
                title="Technical Analysis Megaprofit"
                description="Memanggil MCP InvestSaham untuk harga, fase Wyckoff, zona beli, TP, stop loss, dan skor, lalu menjelaskannya dengan skill investsaham-analisa."
                checked={draft.useMcp}
                onChange={(v) => set("useMcp", v)}
              />
              <ToggleRow
                title="Materi ebook InvestSaham"
                description="Jawaban konsep memakai materi 'Jangan Beli Saham Sebelum Baca Buku Ini' dan menyebut babnya."
                checked={draft.useEbook}
                onChange={(v) => set("useEbook", v)}
              />
            </>
          )}

          {tab === "embed" && (
            <>
              <p className="text-[0.82rem] text-muted">
                Tempel sebelum <code className="font-mono">&lt;/body&gt;</code> di website mana pun. Bubble chat muncul di pojok kanan bawah. Widget memakai key dari
                environment server (<code className="font-mono">GEMINI_API_KEY</code>, <code className="font-mono">INVESTSAHAM_API_KEY</code>), bukan key di browser kamu.
              </p>
              <pre className="thin-scroll overflow-x-auto rounded-xl bg-[#0b1220] p-3.5 font-mono text-[0.78rem] text-emerald-200">{snippet}</pre>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copy} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink hover:bg-accent-strong">
                  {copied ? "Tersalin" : "Salin kode"}
                </button>
                <a href="/embed/demo" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line px-4 py-2 font-bold hover:bg-panel-2">
                  Lihat demo widget
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-2 font-bold hover:bg-panel-2">
            Batal
          </button>
          <button type="button" onClick={() => onSave(draft)} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink hover:bg-accent-strong">
            Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
