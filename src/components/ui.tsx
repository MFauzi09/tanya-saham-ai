import Image from "next/image";
import type { ReactNode } from "react";

export function Logo({ height = 32 }: { height?: number }) {
  const width = Math.round(height * 1.9);
  return (
    <span className="inline-flex shrink-0" style={{ height }}>
      <Image src="/logo-investsaham.webp" alt="InvestSaham" width={width} height={height} className="h-full w-auto dark:hidden" priority />
      <Image src="/logo-investsaham-dark.webp" alt="InvestSaham" width={width} height={height} className="hidden h-full w-auto mix-blend-lighten dark:block" priority />
    </span>
  );
}

const iconPaths = {
  plus: "M12 5v14M5 12h14",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  close: "M18 6L6 18M6 6l12 12",
  pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  menu: "M3 6h18M3 12h18M3 18h18",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  check: "M20 6L9 17l-5-5",
} as const;

export type IconName = keyof typeof iconPaths;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function IconButton({ label, onClick, children, solid }: { label: string; onClick?: () => void; children: ReactNode; solid?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid size-9 shrink-0 place-items-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        solid ? "border-transparent bg-accent text-accent-ink hover:bg-accent-strong" : "border-line bg-panel text-fg hover:bg-panel-2"
      }`}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function TickerAvatar({ code }: { code: string }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-panel-2 font-mono text-[0.68rem] font-bold">
      {code || "TSA"}
    </span>
  );
}
