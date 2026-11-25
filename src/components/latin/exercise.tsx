"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "./ui-bits";
import { useLatStore } from "@/lib/store";
import { answerFor, normalize, type Lesson, PHRASES, allVocab, type FlatVocab } from "@/lib/content";
import { Check, ChevronRight, Eye, RotateCcw, X } from "lucide-react";

/* ================= Exercitia de una lección (autocorregidos con clave) ================= */

export function ExercitiaBlock({ lesson }: { lesson: Lesson }) {
  const { markSection, sections } = useLatStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, "ok" | "reveal">>({});
  const [freeSeen, setFreeSeen] = useState<Record<string, true>>({});

  const model = (letter: string, n: number) => answerFor(lesson.num, letter, n);

  const check = (key: string, letter: string, n: number) => {
    const m = model(letter, n);
    if (!m) return;
    const isOk = normalize(answers[key] ?? "") === normalize(m);
    setChecked((c) => ({ ...c, [key]: isOk ? "ok" : "reveal" }));
  };

  const allKeys = lesson.exercitia.flatMap((sec) => sec.items.map((it) => `${lesson.num}:${sec.letter}:${it.n}`));
  const graded = allKeys.filter((k) => checked[k] || freeSeen[k]).length;

  return (
    <div className="space-y-6">
      {lesson.exercitia.map((sec) => (
        <div key={sec.letter} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-lat text-sm font-semibold">
              {sec.letter}
            </span>
            <h4 className="font-lat text-lg font-semibold">{sec.title}</h4>
            {sec.note && <span className="text-xs text-muted-foreground">({sec.note})</span>}
          </div>
          <ol className="space-y-3">
            {sec.items.map((it) => {
              const key = `${lesson.num}:${sec.letter}:${it.n}`;
              const m = model(sec.letter, it.n);
              const state = checked[key];
              const isFree = it.n === 0 || !m;
              return (
                <li key={key} className="space-y-1.5">
                  <div className="flex gap-2 text-[15px]">
                    {it.n > 0 && <span className="text-primary font-semibold tabular-nums">{it.n}.</span>}
                    <span className={sec.letter === "A" || isFree ? "" : "font-lat"}>
                      {it.text}
                    </span>
                  </div>
                  {isFree ? (
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFreeSeen((f) => ({ ...f, [key]: true }))}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Respuesta modelo
                      </Button>
                      {freeSeen[key] && m && (
                        <p className="mt-2 rounded-md bg-accent/50 border border-gold/40 px-3 py-2 text-sm whitespace-pre-wrap">
                          {m}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex flex-col gap-1.5 sm:flex-row">
                        <Input
                          value={answers[key] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                          placeholder={sec.letter === "A" ? "Traduce al español…" : "Escribe en latín…"}
                          className="h-9 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") check(key, sec.letter, it.n);
                          }}
                        />
                        {state === undefined && (
                          <Button size="sm" className="h-9" onClick={() => check(key, sec.letter, it.n)}>
                            <Check className="h-4 w-4 mr-1" /> Comprobar
                          </Button>
                        )}
                        {state === "ok" && (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-laurel/15 px-3 text-sm font-medium text-laurel border border-laurel/40 self-center h-9">
                            <Check className="h-4 w-4" /> ¡Correcto!
                          </span>
                        )}
                        {state === "reveal" && (
                          <Button size="sm" variant="outline" className="h-9" onClick={() => check(key, sec.letter, it.n)}>
                            <RotateCcw className="h-4 w-4 mr-1" /> Reintentar
                          </Button>
                        )}
                      </div>
                      {state === "reveal" && m && (
                        <div className="rounded-md bg-accent/50 border border-gold/40 px-3 py-2 space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Respuesta modelo: </span>
                            <span className="font-lat text-[1.05em]">{m}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-laurel text-laurel"
                              onClick={() => setChecked((c) => ({ ...c, [key]: "ok" }))}
                            >
                              Mi versión era válida
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setChecked((c) => ({ ...c, [key]: "ok" }))}
                            >
                              Entendido, siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {graded}/{allKeys.length} ejercicios corregidos
        </span>
        <Button
          size="sm"
          variant={sections[`${lesson.num}:exercitia`] ? "outline" : "default"}
          onClick={() => markSection(lesson.num, "exercitia")}
        >
          {sections[`${lesson.num}:exercitia`] ? "Sesión hecha ✓" : <>Marcar como hecha <ChevronRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        En la traducción al latín puede haber soluciones equivalentes: si la tuya respeta casos y concordancia, dale a
        «Mi versión era válida». La clave comentada del curso está integrada aquí.
      </p>
    </div>
  );
}

/* ================= Quiz de opción múltiple (vocabulario + frases) ================= */

export interface QuizQ {
  prompt: string;
  promptLang: "la" | "es";
  options: string[];
  answer: number;
  source: string;
}

function pickOthers(bank: FlatVocab[], keep: FlatVocab, k: number, field: "es" | "la"): string[] {
  const set = new Set<string>();
  let guard = 0;
  while (set.size < k && guard++ < 200) {
    const c = bank[Math.floor(Math.random() * bank.length)];
    const v = field === "es" ? c.es : c.la.split(",")[0];
    if (v && v !== keep[field === "es" ? "es" : "la"].split(",")[0] && ![...set].includes(v)) set.add(v);
  }
  return [...set];
}

export function buildLessonQuiz(lessonNum: number, size = 8): QuizQ[] {
  const lessonVocab: FlatVocab[] = allVocab.filter((v) => v.lesson === lessonNum);
  const all: FlatVocab[] = allVocab;
  const qs: QuizQ[] = [];
  const shuffled = [...lessonVocab].sort(() => Math.random() - 0.5).slice(0, size);
  for (const v of shuffled) {
    const dir = Math.random() < 0.5 ? "es-la" : "la-es";
    const correct = dir === "es-la" ? v.la.split(",")[0] : v.es;
    const others = pickOthers(all, v, 3, dir === "es-la" ? "la" : "es");
    const options = [...others, correct].sort(() => Math.random() - 0.5);
    qs.push({
      prompt: dir === "es-la" ? v.es : v.la,
      promptLang: dir === "es-la" ? "es" : "la",
      options,
      answer: options.indexOf(correct),
      source: `vocab L${lessonNum}`,
    });
  }
  return qs;
}

export function buildPhraseQuiz(lessonNum: number, size = 4): QuizQ[] {
  const phrases = PHRASES.filter((p) => p.lesson === lessonNum);
  return phrases.slice(0, size).map((p) => {
    const distractors = [...PHRASES.filter((x) => x.la !== p.la)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((x) => x.es);
    const options = [...distractors, p.es].sort(() => Math.random() - 0.5);
    return {
      prompt: p.la,
      promptLang: "la",
      options,
      answer: options.indexOf(p.es),
      source: `frase L${lessonNum}`,
    };
  });
}

/** Runner genérico de quiz MC con feedback inmediato. */
export function QuizRunner({
  questions,
  title,
  onFinish,
}: {
  questions: QuizQ[];
  title: string;
  onFinish?: (pct: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">Este quiz no tiene preguntas disponibles.</p>;
  }

  const q = questions[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
        onFinish?.(Math.round(((i === q.answer ? correct + 1 : correct) / questions.length) * 100));
      } else {
        setIdx((x) => x + 1);
        setPicked(null);
      }
    }, 900);
  };

  const restart = () => {
    setIdx(0); setPicked(null); setCorrect(0); setDone(false);
  };

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
        <p className="font-lat text-3xl font-semibold text-primary">
          {pct >= 80 ? "Optimē!" : pct >= 50 ? "Bene!" : "Iterum!"}
        </p>
        <p className="text-2xl font-bold tabular-nums">{correct}/{questions.length}</p>
        <p className="text-sm text-muted-foreground">{title} completado</p>
        <Button size="sm" variant="outline" onClick={restart}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <Chip>
          {idx + 1}/{questions.length}
        </Chip>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(idx / questions.length) * 100}%` }}
        />
      </div>
      <p className={`text-xl ${q.promptLang === "la" ? "font-lat font-semibold text-primary" : "font-medium"}`}>
        {q.prompt}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const isAns = i === q.answer;
          const state =
            picked === null ? "idle" : isAns ? "good" : picked === i ? "bad" : "dim";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={[
                "rounded-lg border px-3.5 py-2.5 text-left text-[15px] transition-all min-h-[44px]",
                state === "idle" ? "border-border bg-background hover:border-primary/60 hover:bg-accent/40" : "",
                state === "good" ? "border-laurel bg-laurel/15 text-laurel font-medium" : "",
                state === "bad" ? "border-destructive bg-destructive/10 text-destructive" : "",
                state === "dim" ? "border-border opacity-50" : "",
              ].join(" ")}
            >
              <span className="font-lat">{o}</span>
              {state === "good" && <Check className="inline h-4 w-4 ml-2" />}
              {state === "bad" && <X className="inline h-4 w-4 ml-2" />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Fuente: {q.source}</p>
    </div>
  );
}
