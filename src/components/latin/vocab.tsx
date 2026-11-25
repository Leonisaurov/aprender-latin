"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "./ui-bits";
import { Flashcards, SrsBar } from "./flashcards";
import { QuizRunner, buildLessonQuiz, buildPhraseQuiz, type QuizQ } from "./exercise";
import { allVocab, vocabCats, lessons, autoeval, PHRASES, type FlatVocab } from "@/lib/content";
import { useLatStore, srsStats } from "@/lib/store";
import { Search, SlidersHorizontal } from "lucide-react";

function matches(v: FlatVocab, q: string): boolean {
  const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const query = n(q);
  return n(v.la).includes(query) || n(v.es).includes(query) || n(v.der).includes(query);
}

export function Vocab() {
  const { srs } = useLatStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [scope, setScope] = useState<"todo" | "lecciones" | "nucleo">("todo");
  const [onlyDue, setOnlyDue] = useState(false);
  const stats = srsStats(srs);

  const pool = useMemo(() => {
    let base: FlatVocab[] = allVocab;
    if (scope === "lecciones") base = base.filter((v) => v.lesson !== null);
    if (scope === "nucleo") base = base.filter((v) => v.cat !== null);
    if (cat !== "todas") base = base.filter((v) => v.cat === cat);
    if (onlyDue) {
      const now = Date.now();
      base = base.filter((v) => !srs[v.id] || srs[v.id].due <= now);
    }
    if (q.trim()) base = base.filter((v) => matches(v, q));
    return base;
  }, [q, cat, scope, onlyDue, srs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-lat text-3xl font-semibold">Dictionārium · vocabulario núcleo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ~900 entradas: el vocabulario de las lecciones + el núcleo de alta frecuencia (con 800 lemas cubres la
            gran mayoría de cualquier página real: César, la Vulgata, una conversación).
          </p>
        </div>
        <SrsBar />
      </div>

      {/* Buscador y filtros */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en latín o español: aqua, noche, paterno…"
            className="pl-9 h-11"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {(["todo", "lecciones", "nucleo"] as const).map((s) => (
            <Button key={s} size="sm" variant={scope === s ? "default" : "outline"} onClick={() => setScope(s)}>
              {s === "todo" ? "Todo" : s === "lecciones" ? "De lecciones" : "Núcleo"}
            </Button>
          ))}
          <Button size="sm" variant={onlyDue ? "default" : "outline"} onClick={() => setOnlyDue((v) => !v)}>
            Solo pendientes ({stats.due})
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto thin-scroll">
          <button onClick={() => setCat("todas")} className={catBtn(cat === "todas")}>todas</button>
          {vocabCats.map((c) => (
            <button key={c.cat} onClick={() => setCat(c.cat)} className={catBtn(cat === c.cat)}>
              {c.cat} <span className="opacity-60">({c.entries.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Entrenador con el pool filtrado */}
      <div className="rounded-xl border border-primary/30 bg-accent/30 p-4 sm:p-5">
        <h3 className="font-lat text-xl font-semibold mb-1">Entrenador SRS</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {pool.length} palabras en la selección actual. La cola prioriza las vencidas y las nuevas; después se
          mezclan.
        </p>
        <Flashcards pool={pool} title={q || cat !== "todas" ? "Selección" : undefined} />
      </div>

      {/* Lista */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto thin-scroll">
          <table className="table-paradigm">
            <thead className="sticky top-0">
              <tr><th>Latín</th><th>Español</th><th>Derivada</th><th className="w-28">Mazo</th></tr>
            </thead>
            <tbody>
              {pool.slice(0, 300).map((v) => {
                const c = srs[v.id];
                return (
                  <tr key={v.id}>
                    <td className="font-lat text-[16px] text-primary whitespace-nowrap">{v.la}</td>
                    <td>{v.es}</td>
                    <td className="text-muted-foreground">{v.der || "—"}</td>
                    <td>
                      {c ? (
                        <Chip className={c.box >= 5 ? "border-laurel/50 text-laurel" : ""}>
                          caja {c.box}
                        </Chip>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">nueva</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pool.length > 300 && (
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Mostrando 300 de {pool.length} — afina la búsqueda o el filtro para ver más.
          </p>
        )}
      </div>
    </div>
  );
}

function catBtn(active: boolean) {
  return [
    "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors min-h-[30px]",
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent/50",
  ].join(" ");
}

/* ============ Práctica (interleaving) ============ */

export function Practice() {
  const { sections, quizScores } = useLatStore();
  const [session, setSession] = useState(0);
  const [openAuto, setOpenAuto] = useState(false);

  const questions = useMemo<QuizQ[]>(() => {
    // interleaving: mezcla vocab de lecciones ya trabajadas + frases de todas
    const seen = lessons.filter((l) => Object.keys(sections).some((k) => k.startsWith(`${l.num}:`))).map((l) => l.num);
    const pool = seen.length ? seen : [1];
    const qs: QuizQ[] = [];
    const seenPrompts = new Set<string>();
    const target = 12;
    let guard = 0;
    while (qs.length < target && guard++ < 200) {
      const ln = pool[Math.floor(Math.random() * pool.length)];
      const batch = Math.random() < 0.7 ? buildLessonQuiz(ln, 1) : buildPhraseQuiz(ln, 1);
      for (const q of batch) {
        if (seenPrompts.has(q.prompt)) continue;
        seenPrompts.add(q.prompt);
        qs.push(q);
      }
    }
    return qs;
  }, [sections, session]);

  const completed = lessons.filter((l) => lessonPctLocal(sections, quizScores, l.num) >= 60).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lat text-3xl font-semibold">Practica · repaso entrelazado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preguntas mezcladas de todas las lecciones que has tocado (vocabulario ES↔LA y frases del Colloquium).
          Estudiar mezclando temas —<em className="font-lat not-italic text-primary">interleaving</em>— retiene más
          que estudiar por bloques: fuerza al cerebro a comparar y elegir la forma correcta.
        </p>
      </div>

      <div className="rounded-xl border border-primary/30 bg-accent/30 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-lat text-xl font-semibold">Sesión de XII preguntas</h3>
          <Button size="sm" variant="outline" onClick={() => setSession((s) => s + 1)}>
            Nueva sesión
          </Button>
        </div>
        <QuizRunner key={session} questions={questions} title="Repaso entrelazado" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <button className="flex w-full items-center justify-between" onClick={() => setOpenAuto((v) => !v)}>
          <div className="text-left">
            <h3 className="font-lat text-xl font-semibold">Autoevaluātiō fīnālis · XXX preguntas</h3>
            <p className="text-sm text-muted-foreground">
              Si respondes 25 sin mirar tablas, dominas el curso. Progreso actual: {completed}/12 lecciones.
            </p>
          </div>
          <span className="text-primary text-sm font-medium">{openAuto ? "ocultar" : "mostrar"}</span>
        </button>
        {openAuto && (
          <ol className="mt-4 grid gap-1.5 sm:grid-cols-2 list-decimal pl-5 marker:text-primary/70 text-sm">
            {autoeval.map((q, i) => (
              <li key={i} className="leading-snug">{q}</li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Las respuestas están todas en los capítulos 02-06 y en las Tabulae: repásalas hasta lograr 25/30.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="font-lat text-xl font-semibold mb-2">Frases para vivir (banco conversacional)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Del capítulo 13: saludos, cortesía, la mesa, compras y citas para la vida. Léelas en voz alta.
        </p>
        <div className="max-h-72 overflow-y-auto thin-scroll space-y-1.5 pr-1">
          {PHRASES.slice(0, 40).map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-background px-3.5 py-2 grid gap-1 sm:grid-cols-2">
              <span className="font-lat text-primary text-[15px]">{p.la}</span>
              <span className="text-sm text-muted-foreground">{p.es}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">…y todas las demás en Teoría → cap. 13 · Frases para hablar.</p>
      </div>
    </div>
  );
}

function lessonPctLocal(sections: Record<string, true>, quizScores: Record<number, number>, lesson: number): number {
  let done = 0;
  for (const key of ["colloquium", "vocab", "grammatica", "lectio", "cultura", "pronuntia", "exercitia"]) {
    if (sections[`${lesson}:${key}`]) done++;
  }
  const q = quizScores[lesson] ? 1 : 0;
  return Math.round(((done + q * 0.5) / 7.5) * 100);
}
