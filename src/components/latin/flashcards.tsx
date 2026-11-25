"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chip } from "./ui-bits";
import { useLatStore, srsStats, BOX_DAYS } from "@/lib/store";
import type { FlatVocab } from "@/lib/content";
import { RotateCcw, Sparkles } from "lucide-react";

/**
 * Entrenador de flashcards con repetición espaciada (Leitner).
 * La cola prioriza: vencidas → nuevas → el resto (repaso anticipado).
 */
export function Flashcards({ pool, title }: { pool: FlatVocab[]; title?: string }) {
  const { srs, grade } = useLatStore();
  const [mode, setMode] = useState<"la-es" | "es-la">("la-es");
  const [sessionKey, setSessionKey] = useState(0);

  const queue = useMemo(() => {
    const now = Date.now();
    const due: FlatVocab[] = [];
    const fresh: FlatVocab[] = [];
    const rest: FlatVocab[] = [];
    for (const v of pool) {
      const c = srs[v.id];
      if (!c) fresh.push(v);
      else if (c.due <= now) due.push(v);
      else rest.push(v);
    }
    const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
    return [...shuffle(due), ...shuffle(fresh), ...shuffle(rest)].slice(0, 12);
  }, [pool, srs, sessionKey]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const stats = srsStats(srs);

  if (pool.length === 0) {
    return <p className="text-muted-foreground text-sm">No hay tarjetas en este mazo todavía.</p>;
  }

  const card = queue[idx % queue.length];
  if (!card) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="font-lat text-xl text-primary">Nihil ad hōram! Nada pendiente ahora mismo.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Vuelve más tarde: tus tarjetas vencidas reaparecen según sus intervalos.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSessionKey((k) => k + 1); setIdx(0); setFlipped(false); }}>
          <RotateCcw className="h-4 w-4 mr-1" /> Repasar igualmente
        </Button>
      </div>
    );
  }

  const cur = srs[card.id];
  const front = mode === "la-es" ? card.la : card.es;
  const back = mode === "la-es" ? card.es : card.la;

  const handle = (g: "again" | "good" | "easy") => {
    grade(card.id, g);
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {title && <span className="font-semibold text-foreground">{title}</span>}
          <Chip>{pool.length} tarjetas en el mazo</Chip>
          <Chip>{stats.due} vencidas hoy</Chip>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant={mode === "la-es" ? "default" : "outline"} onClick={() => setMode("la-es")}>
            Latín → Español
          </Button>
          <Button size="sm" variant={mode === "es-la" ? "default" : "outline"} onClick={() => setMode("es-la")}>
            Español → Latín
          </Button>
        </div>
      </div>

      <div className="flip-scene h-64 cursor-pointer select-none" onClick={() => setFlipped((f) => !f)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${card.id}-${idx}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <div className={`flip-inner relative h-full w-full ${flipped ? "flipped" : ""}`}>
              {/* Reverso */}
              <div className="flip-face flip-back absolute inset-0 rounded-xl border border-gold/50 bg-accent/60 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <p className="font-lat text-3xl font-semibold text-foreground">{back}</p>
                {card.der && <p className="mt-2 text-sm text-muted-foreground">derivada: {card.der}</p>}
                {mode === "es-la" && card.la.includes(",") && (
                  <p className="mt-1 text-xs text-muted-foreground">{card.la}</p>
                )}
                <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">toca la tarjeta para volver</p>
              </div>
              {/* Frente */}
              <div className="flip-face absolute inset-0 rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <p className="font-lat text-4xl font-semibold text-primary leading-snug">{front}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  {card.lesson !== null && <Chip>Lección {card.lesson}</Chip>}
                  {card.cat && <Chip>{card.cat}</Chip>}
                  {cur && <Chip>caja {cur.box} · repaso en {Math.max(0, Math.ceil((cur.due - Date.now()) / 86400000))} d</Chip>}
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-wide text-muted-foreground">toca la tarjeta para girar</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="destructive" className="h-11" onClick={() => handle("again")}>
          Otra vez
        </Button>
        <Button variant="default" className="h-11" onClick={() => handle("good")}>
          Bien
        </Button>
        <Button variant="outline" className="h-11 border-laurel text-laurel hover:bg-laurel hover:text-laurel-foreground" onClick={() => handle("easy")}>
          Fácil
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Otra vez → en 10 min · Bien → sube una caja · Fácil → sube dos. Cajas (días): {BOX_DAYS.slice(1).join(", ")}
      </p>
    </div>
  );
}

/** Barra compacta de estadísticas SRS. */
export function SrsBar() {
  const { srs, resetSrs } = useLatStore();
  const stats = srsStats(srs);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Chip><Sparkles className="h-3 w-3" /> {stats.total} en tu mazo</Chip>
      <Chip>{stats.learning} aprendiendo</Chip>
      <Chip className="border-laurel/50 text-laurel">{stats.mastered} dominadas</Chip>
      {stats.total > 0 && (
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={resetSrs}>
          reiniciar mazo
        </Button>
      )}
    </div>
  );
}
