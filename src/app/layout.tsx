import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./styles/motion.scss";

const bodyFont = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const displayFont = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const monoFont = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Tanya Saham AI", template: "%s · Tanya Saham AI" },
  description: "Chatbot analisa saham IDX dengan Google Gemini dan MCP InvestSaham.",
  icons: { icon: "/logo-investsaham.webp" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[0.9rem] leading-relaxed">{children}</body>
    </html>
  );
}
