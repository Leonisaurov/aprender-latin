"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Home } from "@/components/latin/home";
import { Course } from "@/components/latin/course";
import { Theory, TablesView } from "@/components/latin/theory";
import { Vocab, Practice } from "@/components/latin/vocab";
import { Md } from "@/components/latin/md";
import { Laurel, Divider } from "@/components/latin/ui-bits";
import { theory, lessons, roman } from "@/lib/content";
import { useLatStore } from "@/lib/store";
import { Moon, Sun, ScrollText } from "lucide-react";

type View = "inicio" | "curso" | "teoria" | "vocab" | "practica" | "tablas" | "metodo";

const NAV: { key: View; label: string }[] = [
  { key: "inicio", label: "Inicio" },
  { key: "curso", label: "Curso" },
  { key: "teoria", label: "Teoría" },
  { key: "vocab", label: "Vocabulario" },
  { key: "practica", label: "Práctica" },
  { key: "tablas", label: "Tablas" },
  { key: "metodo", label: "Método" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // false en SSR, true en el cliente tras hidratar (sin setState en efecto)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/** Vista Método: capítulo 16 completo + mapa rápido. */
function MethodView() {
  const ch = theory.find((c) => c.num === 16)!;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-lat text-3xl font-semibold">Methodus · cómo mantener el latín vivo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aprender latín es fácil de empezar y fácil de abandonar. Este es el plan, los hábitos y las herramientas
          para que en tres meses estés leyendo fábulas sin traducir en la cabeza.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-lat text-4xl font-semibold text-primary">2 escuelas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Gramática-traducción (precisión morfológica) + método natura de Ørberg (adquisición real). Este curso es
            híbrido a propósito.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-lat text-4xl font-semibold text-primary">20-30 min</p>
          <p className="text-sm text-muted-foreground mt-1">
            Al día: leer en voz alta (5) · flashcards (10) · traducir o declinar (5) · relectura de lecciones viejas
            al revés (5) + autohabla.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-lat text-4xl font-semibold text-primary">3 meses</p>
          <p className="text-sm text-muted-foreground mt-1">
            Hasta leer fábulas y hablar sin diccionario. Después: <em className="font-lat">Famīlia Rōmāna</em>, Fedro,
            César, conventículos.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card px-5 py-6 sm:px-7">
        <Laurel className="h-8 w-16 text-gold/50 mb-2" />
        <Md>{ch.intro}</Md>
        {ch.sections.map((s, i) => (
          <div key={i} className="mt-5 border-t border-border pt-4">
            <h3 className="font-lat text-xl font-semibold text-primary mb-1">{s.head}</h3>
            <Md>{s.body}</Md>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [view, setView] = useState<View>("inicio");
  const [courseLesson, setCourseLesson] = useState<number | null>(null);
  const touch = useLatStore((s) => s.touch);

  useEffect(() => {
    touch();
  }, [touch]);

  const go = (v: string, lesson?: number) => {
    if (v === "curso" && lesson) setCourseLesson(lesson);
    if (v !== "curso") setCourseLesson(null);
    setView(v as View);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabecera */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between gap-2">
            <button onClick={() => go("inicio")} className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-lat font-semibold text-lg shadow-sm">
                L
              </span>
              <span className="text-left leading-tight">
                <span className="block font-lat text-lg font-semibold">Lingua Latīna</span>
                <span className="block text-[11px] text-muted-foreground -mt-0.5">de cero a experto · Rōma docet</span>
              </span>
            </button>
            <div className="flex items-center gap-1">
              <nav className="hidden md:flex items-center gap-0.5" aria-label="Secciones">
                {NAV.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => go(n.key)}
                    className={[
                      "rounded-full px-3.5 py-1.5 text-sm transition-colors min-h-[34px]",
                      view === n.key
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    ].join(" ")}
                  >
                    {n.label}
                  </button>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>
          {/* Nav móvil */}
          <nav className="md:hidden flex gap-1 overflow-x-auto thin-scroll pb-2" aria-label="Secciones móvil">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => go(n.key)}
                className={[
                  "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors min-h-[30px]",
                  view === n.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                ].join(" ")}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {view === "inicio" && <Home go={go} />}
        {view === "curso" && <Course open={courseLesson} setOpen={setCourseLesson} />}
        {view === "teoria" && <Theory />}
        {view === "vocab" && <Vocab />}
        {view === "practica" && <Practice />}
        {view === "tablas" && <TablesView />}
        {view === "metodo" && <MethodView />}
      </main>

      {/* Pie */}
      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center">
          <Laurel className="mx-auto h-7 w-14 text-gold/60" />
          <p className="font-lat text-primary text-lg">Latīnē loquendum est ut Latīnē discāmus.</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hay que hablar latín para aprender latín · {lessons.length} lecciones · pronunciación clásica restaurada
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center justify-center gap-1.5">
            <ScrollText className="h-3 w-3" />
            <button onClick={() => go("tablas")} className="underline underline-offset-2">Tabulae</button>
            {" · "}
            <button onClick={() => go("metodo")} className="underline underline-offset-2">Methodus</button>
            {" · "}Tu progreso se guarda en este navegador.
          </p>
        </div>
      </footer>
    </div>
  );
}
