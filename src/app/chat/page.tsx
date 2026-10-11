import type { Metadata } from "next";
import ChatApp from "@/components/ChatApp";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };

export default function ChatPage() {
  return <ChatApp />;
}
