import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ChatSettings } from "./types";

const contentDir = path.join(process.cwd(), "src", "content");
const readContent = (file: string) => readFile(path.join(contentDir, file), "utf8");

const toneRules: Record<ChatSettings["tone"], string> = {
  formal: "Gunakan bahasa Indonesia formal dan sopan. Sapa pengguna dengan 'Anda'.",
  santai: "Gunakan bahasa Indonesia santai seperti teman ngobrol. Sapa pengguna dengan 'kamu'. Boleh pakai istilah trader lokal.",
  mentor: "Jawab seperti mentor yang sabar. Jelaskan alasan di balik setiap langkah dan beri satu pertanyaan balik untuk melatih pengguna.",
};

const levelRules: Record<ChatSettings["level"], string> = {
  pemula: "Pengguna masih pemula. Jelaskan istilah teknis dengan singkat saat pertama dipakai.",
  menengah: "Pengguna sudah paham istilah dasar seperti support, resistance, dan moving average.",
  trader: "Pengguna trader aktif. Langsung ke level harga, risk:reward, dan skenario.",
};

export async function buildSystemInstruction(settings: ChatSettings) {
  const [skill, ebook] = await Promise.all([
    settings.useMcp ? readContent("skill-investsaham-analisa.md") : "",
    settings.useEbook ? readContent("materi-ebook.md") : "",
  ]);

  return [
    "Kamu adalah Tanya Saham AI, asisten analisa saham Bursa Efek Indonesia.",
    "Topikmu hanya saham, pasar modal, dan edukasi investasi. Tolak dengan sopan pertanyaan di luar topik itu.",
    toneRules[settings.tone],
    levelRules[settings.level],
    settings.useMcp
      ? "Untuk pertanyaan tentang kode saham tertentu, selalu panggil tool get_asset_analysis dulu. Untuk mencari kandidat saham, panggil ihsg_screener. Ikuti skill berikut:\n\n" + skill
      : "Tool data pasar sedang mati. Jangan menyebut harga terkini. Jelaskan konsep saja.",
    settings.useEbook ? "Untuk pertanyaan konsep, pakai materi ebook berikut dan sebut babnya:\n\n" + ebook : "",
    settings.extra ? "Instruksi tambahan dari pengguna:\n" + settings.extra : "",
    "Tutup setiap analisa dengan satu baris: 'Bukan ajakan beli atau jual. Keputusan dan risiko ada di tangan kamu.'",
  ]
    .filter(Boolean)
    .join("\n\n");
}
