import Image from "next/image";
import { LoginCard } from "@/components/LoginCard";

const sampleTickers = [
  { code: "BBCA", note: "Zona beli, TP1, TP2, stop loss" },
  { code: "TLKM", note: "Fase Wyckoff dan skor teknikal" },
  { code: "LQ45", note: "Screener harian per kategori" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between gap-8 overflow-hidden bg-hero p-10 text-emerald-50 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(16,185,129,.22),transparent_60%),radial-gradient(90%_70%_at_100%_100%,rgba(29,78,216,.3),transparent_60%)]" />
        <div className="relative flex items-center gap-3 font-display text-lg font-bold">
          <Image src="/logo-investsaham-dark.webp" alt="InvestSaham" width={110} height={58} className="mix-blend-lighten" priority />
          <span className="opacity-60">×</span>
          Tanya Saham AI
        </div>
        <div className="relative grid max-w-xl gap-4">
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.08] font-bold tracking-tight text-balance">
            Tanya level entry, target, dan stop loss saham IDX dalam bahasa sehari-hari.
          </h1>
          <p className="max-w-[46ch] text-[0.95rem] text-emerald-100/75">
            Jawaban dari Google Gemini, data pasar dari MCP InvestSaham, materi dari ebook Jangan Beli Saham Sebelum Baca Buku Ini.
          </p>
        </div>
        <ul className="relative grid gap-2">
          {sampleTickers.map((t) => (
            <li key={t.code} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[0.82rem]">
              <b className="font-mono">{t.code}</b>
              <span className="text-emerald-100/70">{t.note}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <LoginCard />
      </section>
    </div>
  );
}
