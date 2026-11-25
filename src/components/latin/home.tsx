"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Laurel, Ring, Chip, Divider } from "./ui-bits";
import { SrsBar } from "./flashcards";
import { lessons, roman, WEEK_PLAN, QUOTES, SECTIONS } from "@/lib/content";
import { useLatStore, lessonPct, srsStats } from "@/lib/store";
import { BookOpenText, BrainCircuit, Flame, Mic, Repeat2, Target } from "lucide-react";

const METHOD_PILLARS = [
  {
    icon: BookOpenText,
    title: "Input comprensible",
    desc: "Diálogos y fábulas en latín fácil desde el día 1 (método natura de Ørberg): el contexto enseña, la gramática precisa.",
  },
  {
    icon: Repeat2,
    title: "Repetición espaciada",
    desc: "Vocabulario con algoritmo Leitner: cada tarjeta reaparece justo antes de que la olvides. Prohibido acumular deudas de repaso.",
  },
  {
    icon: BrainCircuit,
    title: "Recuerdo activo",
    desc: "Ejercicios autocorregidos y quizzes con feedback inmediato: recuperar de memoria fija mucho más que releer.",
  },
  {
    icon: Mic,
    title: "Habla desde el día 1",
    desc: "Cada Colloquium se lee en voz alta con pronunciación clásica. La boca aprende antes que el ojo.",
  },
];

export function Home({ go }: { go: (view: string, lesson?: number) => void }) {
  const { sections, quizScores, srs, streak } = useLatStore();
  const stats = srsStats(srs);

  const nextLesson = useMemo(() => {
    for (const l of lessons) {
      if (lessonPct(sections, quizScores, l.num) < 60) return l.num;
    }
    return 1;
  }, [sections, quizScores]);

  const completed = lessons.filter((l) => lessonPct(sections, quizScores, l.num) >= 60).length;
  const globalPct = Math.round(lessons.reduce((acc, l) => acc + lessonPct(sections, quizScores, l.num), 0) / lessons.length);
  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);
  const currentWeek = Math.min(completed + 1, 12);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-10 sm:px-10 sm:py-14 text-center">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden>
          <div className="absolute left-6 top-6 font-lat text-[120px] font-bold leading-none text-foreground">L</div>
          <div className="absolute right-8 bottom-2 font-lat text-[120px] font-bold leading-none text-foreground">L</div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Lingua Latīna · de cero a experto</p>
        <h1 className="mt-3 font-lat text-4xl sm:text-6xl font-semibold leading-tight">
          «Latīna lingua nōn mortua est:
          <br className="hidden sm:block" /> modo togam mūtāvit.»
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-[15px]">
          Un curso completo de latín clásico: XII lecciones vividas en Roma (el Foro, la taberna, la escuela, las
          Saturnales), fábulas de Esopo originales, toda la gramática de referencia, ~800 palabras núcleo y práctica
          con repetición espaciada. Con el 70-80 % del español heredado del latín, no empiezas de cero.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => go("curso", nextLesson)}>
            {completed > 0 ? <>Continuar con la Lección {roman(nextLesson)}</> : <>Empezar la Lección I · Salutatio</>}
          </Button>
          <Button size="lg" variant="outline" onClick={() => go("teoria")}>
            Ver la teoría de referencia
          </Button>
        </div>
        <Laurel className="mx-auto mt-6 h-10 w-24 text-gold/60" />
      </section>

      {/* Progreso */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <Ring value={globalPct} size={84} stroke={9} />
          <div>
            <p className="font-semibold">Curso completado</p>
            <p className="text-sm text-muted-foreground">{completed}/12 lecciones al 60 % o más</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gold">
              <Flame className="h-4 w-4" /> racha de {streak.count} día{streak.count === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-semibold mb-2 flex items-center gap-2"><Repeat2 className="h-4 w-4 text-primary" /> Mazo de vocabulario</p>
          <SrsBar />
          <p className="mt-2 text-xs text-muted-foreground">
            Vocabulario de lecciones (~250) + núcleo de alta frecuencia (~676). Estudia 10 min al día.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Hoja del día</p>
          <blockquote className="font-lat text-lg leading-snug text-primary">«{quote.la}»</blockquote>
          <p className="text-sm text-muted-foreground mt-1">«{quote.es}» · <span className="text-xs">{quote.src}</span></p>
        </div>
      </section>

      {/* Método */}
      <section>
        <Divider />
        <h2 className="text-center font-lat text-3xl font-semibold mt-2 mb-1">El método detrás del curso</h2>
        <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
          Curso híbrido a propósito: input comprensible + gramática y ejercicios. Los cuatro pilares que la ciencia
          del aprendizaje de idiomas considera decisivos:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD_PILLARS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5">
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan 12 semanas */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-lat text-3xl font-semibold">Plan de XII semanas</h2>
          <Chip>Semana actual: {currentWeek}</Chip>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          20-30 min diarios: leer en voz alta (5), flashcards (10), ejercicios (5), relectura (5) + autohabla.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WEEK_PLAN.map((w) => {
            const active = w.week === currentWeek;
            const past = w.week < currentWeek;
            return (
              <button
                key={w.week}
                onClick={() => go("curso", w.week)}
                className={[
                  "rounded-xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-accent/50" : past ? "border-laurel/40 bg-card" : "border-border bg-card",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-lat text-lg font-semibold">S {w.week} · {w.lesson}</span>
                  {past && <span className="text-laurel text-sm font-medium">✓</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{w.ref}</p>
                <p className="text-sm mt-0.5">{w.goal}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Estructura de lección */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-lat text-2xl font-semibold mb-1">Cada lección tiene 7 pasos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Siempre en este orden: escuchar boca primero, ojo después; recuerdo al final.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s, i) => (
            <li key={s.key} className="rounded-lg border border-border bg-background px-3.5 py-2.5">
              <span className="font-lat text-gold font-semibold mr-1.5">{i + 1}.</span>
              <span className="font-semibold">{s.label}</span>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
