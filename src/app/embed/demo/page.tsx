import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = { title: "Demo widget", robots: { index: false } };

const placeholderWidths = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/4"];

export default function EmbedDemoPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <nav className="flex flex-wrap items-center gap-4 border-b border-line bg-panel px-6 py-4">
        <b className="font-display">blogsahamku.id</b>
        <span className="text-[0.82rem] text-muted">Artikel</span>
        <span className="text-[0.82rem] text-muted">Kalender dividen</span>
        <span className="text-[0.82rem] text-muted">Tentang</span>
      </nav>
      <main className="grid max-w-3xl gap-4 px-6 py-8">
        <h1 className="font-display text-2xl font-bold">Contoh website yang memasang widget</h1>
        <p className="text-muted">Halaman ini memuat satu tag script. Klik bubble hijau di pojok kanan bawah untuk membuka Tanya Saham AI.</p>
        {placeholderWidths.map((width, i) => (
          <div key={i} className={`h-3.5 rounded-md bg-panel-2 ${width}`} />
        ))}
        <div className="h-40 rounded-xl bg-panel-2" />
      </main>
      <Script src="/widget.js" strategy="afterInteractive" />
    </div>
  );
}
