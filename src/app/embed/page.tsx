import type { Metadata } from "next";
import { EmbedChat } from "@/components/EmbedChat";

export const metadata: Metadata = { title: "Widget", robots: { index: false } };

export default function EmbedPage() {
  return <EmbedChat />;
}
