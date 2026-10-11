"use client";

import { motion } from "framer-motion";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/types";
import { Icon, Skeleton } from "./ui";

const markdown: Components = {
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
  h1: (props) => <h3 className="mb-2 font-display text-base font-bold" {...props} />,
  h2: (props) => <h3 className="mb-2 font-display text-base font-bold" {...props} />,
  h3: (props) => <h3 className="mb-2 font-display text-[0.95rem] font-bold" {...props} />,
  strong: (props) => <strong className="font-bold" {...props} />,
  code: (props) => <code className="rounded bg-panel-2 px-1 font-mono text-[0.82rem]" {...props} />,
  a: (props) => <a className="text-accent underline" target="_blank" rel="noopener noreferrer" {...props} />,
  table: (props) => (
    <div className="thin-scroll my-2 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse font-mono text-[0.8rem] tabular-nums" {...props} />
    </div>
  ),
  th: (props) => <th className="border-b border-line bg-panel-2 px-3 py-2 text-left text-label font-semibold uppercase text-muted" {...props} />,
  td: (props) => <td className="border-b border-line px-3 py-2 align-top last:border-b-0" {...props} />,
};

const bubbleMotion = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] as const },
};

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <motion.div {...bubbleMotion} className="max-w-[min(620px,86%)] self-end rounded-2xl rounded-tr-sm bg-bubble-user px-3.5 py-2.5 whitespace-pre-wrap break-words shadow-sm">
        {message.text}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...bubbleMotion}
      className={`max-w-[min(680px,92%)] min-w-0 self-start rounded-2xl rounded-tl-sm border bg-panel px-3.5 py-2.5 shadow-sm ${message.error ? "border-down/50 text-down" : "border-line"}`}
    >
      {message.tools?.length ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {message.tools.map((tool, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-0.5 font-mono text-[0.72rem] text-muted">
              <Icon name="tool" size={12} />
              {tool.name}({Object.values(tool.args).map((v) => JSON.stringify(v)).join(", ")})
            </span>
          ))}
        </div>
      ) : null}
      <div className="min-w-0 break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdown}>
          {message.text}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}

export function PendingBubble({ usingMcp }: { usingMcp: boolean }) {
  return (
    <motion.div {...bubbleMotion} className="w-[min(420px,80%)] self-start rounded-2xl rounded-tl-sm border border-line bg-panel px-3.5 py-3" aria-label="Menunggu jawaban">
      <div className="mb-3 flex items-center gap-2 font-mono text-[0.72rem] text-muted">
        <span className="typing-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        {usingMcp ? "Gemini membaca data MCP InvestSaham…" : "Gemini sedang menulis…"}
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-2.5 w-[90%]" />
        <Skeleton className="h-2.5 w-[70%]" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </motion.div>
  );
}
