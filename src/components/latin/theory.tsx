"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Md } from "./md";
import { Chip, Laurel } from "./ui-bits";
import { theory, tables } from "@/lib/content";
import { ChevronRight } from "lucide-react";

export function Theory({ initialChapter }: { initialChapter?: number }) {
  const [sel, setSel] = useState<number>(initialChapter ?? theory[0].num);
  const ch = theory.find((c) => c.num === sel) ?? theory[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-lat text-3xl font-semibold">Bibliothēca · teoría de referencia</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Los VII capítulos de gramática e historia + el banco de frases y el método. Consulta siempre que necesites;
          el índice interior te lleva a cada tabla.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Índice de capítulos */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto thin-scroll lg:overflow-visible lg:sticky lg:top-24 lg:self-start">
          {theory.map((c) => (
            <button
              key={c.num}
              onClick={() => setSel(c.num)}
              className={[
                "shrink-0 lg:shrink rounded-lg border px-3.5 py-2.5 text-left transition-colors min-w-[150px]",
                c.num === sel ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/40",
              ].join(" ")}
            >
              <span className="font-lat font-semibold text-base">
                {c.num >= 13 ? "" : `${c.num}. `}{c.short}
              </span>
              <p className={["text-xs leading-snug", c.num === sel ? "text-primary-foreground/80" : "text-muted-foreground"].join(" ")}>
                {c.subtitle}
              </p>
            </button>
          ))}
        </nav>

        {/* Contenido del capítulo */}
        <motion.article key={ch.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">
          <div className="rounded-xl border border-border bg-card px-5 py-6 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Capitulum {ch.num >= 13 ? "" : ch.num}</p>
            <h3 className="font-lat text-3xl font-semibold mt-1">{ch.short}</h3>
            <p className="text-muted-foreground">{ch.subtitle}</p>
            <Laurel className="h-8 w-16 text-gold/50 my-3" />
            <Md>{ch.intro}</Md>
            <div className="mt-6 space-y-2">
              {ch.sections.map((s, i) => (
                <details key={i} className="group rounded-lg border border-border bg-background open:bg-card" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-lat text-lg font-semibold text-foreground">
                    <span>{s.head}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90 text-muted-foreground" />
                  </summary>
                  <div className="px-4 pb-4">
                    <Md>{s.body}</Md>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}

export function TablesView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-lat text-3xl font-semibold">Tabulae · la chuleta definitiva</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Todo el latín en un apéndice: declinaciones, conjugaciones, pronombres, numerales, preposiciones y las 60
          partes principales más frecuentes. Tenla abierta mientras lees cualquier cosa.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card px-5 py-6 sm:px-7">
        <Chip className="mb-3">Apéndice 15</Chip>
        <Md>{tables.intro}</Md>
        {tables.sections.map((s, i) => (
          <div key={i} className="mt-5 border-t border-border pt-4 first:border-0">
            <h3 className="font-lat text-xl font-semibold text-primary mb-1">{s.head}</h3>
            <Md>{s.body}</Md>
          </div>
        ))}
      </div>
    </div>
  );
}
