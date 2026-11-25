"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renderiza markdown del curso (tablas GFM incluidas) con el estilo del tema. */
export function Md({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-[15px] leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="font-lat text-2xl font-semibold text-primary mt-6 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-lat text-xl font-semibold text-foreground mt-5 mb-1.5">{children}</h4>
          ),
          p: ({ children }) => <p className="my-2.5">{children}</p>,
          em: ({ children }) => <em className="font-lat text-[1.12em] text-primary">{children}</em>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gold/70 bg-accent/40 px-4 py-2.5 my-3 rounded-r-md font-lat text-[1.05em]">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="my-2.5 space-y-1.5 pl-5 list-disc marker:text-primary/70">{children}</ul>,
          ol: ({ children }) => <ol className="my-2.5 space-y-1.5 pl-5 list-decimal marker:text-primary/70">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto thin-scroll my-3 rounded-lg border border-border">
              <table className="table-paradigm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th>{children}</th>,
          td: ({ children }) => <td>{children}</td>,
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-lat">{children}</code>
          ),
          hr: () => <hr className="my-5 border-border" />,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
