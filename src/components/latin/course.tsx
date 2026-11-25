"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Md } from "./md";
import { Laurel, Ring, Chip } from "./ui-bits";
import { Flashcards } from "./flashcards";
import { ExercitiaBlock, QuizRunner, buildLessonQuiz, buildPhraseQuiz } from "./exercise";
import { lessons, roman, SECTIONS, type Lesson, type SectionKey } from "@/lib/content";
import { useLatStore, lessonPct } from "@/lib/store";
import { ArrowLeft, BookOpenText, Check, Eye, EyeOff, GraduationCap, Volume2 } from "lucide-react";

/* ================= Lista de lecciones ================= */

function LessonCard({ lesson, onOpen, current }: { lesson: Lesson; onOpen: () => void; current: boolean }) {
  const { sections, quizScores } = useLatStore();
  const pct = lessonPct(sections, quizScores, lesson.num);
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      className={[
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5",
        current ? "border-primary shadow-sm" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="font-lat text-3xl font-semibold text-primary/80">{roman(lesson.num)}</span>
        <Ring value={pct} size={44} stroke={5} />
      </div>
      <h3 className="font-lat text-xl font-semibold leading-tight">{lesson.short}</h3>
      <p className="text-sm text-muted-foreground">{lesson.subtitle}</p>
      <p className="text-xs text-muted-foreground/80 line-clamp-2">{lesson.meta.gramatica}</p>
    </motion.button>
  );
}

function LessonList({ onOpen, current }: { onOpen: (n: number) => void; current: number }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-lat text-3xl font-semibold">El curso · XII lectionēs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Una lección por semana es el plan ideal; a tu ritmo, cada una es un día de la vida romana.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessons.map((l) => (
          <LessonCard key={l.num} lesson={l} onOpen={() => onOpen(l.num)} current={l.num === current} />
        ))}
      </div>
    </div>
  );
}

/* ================= Detalle de lección ================= */

function ColloquiumSection({ lesson }: { lesson: Lesson }) {
  const { markSection, sections } = useLatStore();
  const [hideEs, setHideEs] = useState(false);
  const [visible, setVisible] = useState(0);
  const done = !!sections[`${lesson.num}:colloquium`];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setHideEs((h) => !h)}>
          {hideEs ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
          {hideEs ? "Mostrar español" : "Ocultar español"}
        </Button>
        <Button size="sm" variant={done ? "outline" : "default"} onClick={() => markSection(lesson.num, "colloquium")}>
          {done ? "Leído en voz alta ✓" : <><Volume2 className="h-4 w-4 mr-1" /> Leído en voz alta</>}
        </Button>
        <span className="text-xs text-muted-foreground">
          Léelo en voz alta con pronunciación clásica antes de mirar el español.
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        {lesson.colloquium.map((row, i) => (
          <div
            key={i}
            className={[
              "grid gap-1 px-4 py-2.5 sm:grid-cols-2 sm:gap-6",
              i % 2 ? "bg-muted/40" : "bg-card",
            ].join(" ")}
          >
            <p className="font-lat text-[17px] leading-snug text-foreground">
              <span className="text-gold mr-1.5">—</span>{row.la}
            </p>
            <p className={["text-sm text-muted-foreground leading-snug", hideEs ? "blur-[5px] select-none" : ""].join(" ")}>
              {row.es}
            </p>
          </div>
        ))}
      </div>
      {lesson.colloquium_note && (
        <p className="rounded-lg border border-gold/40 bg-accent/40 px-4 py-2.5 text-sm text-accent-foreground">
          <span className="font-semibold">N.B. </span>{lesson.colloquium_note}
        </p>
      )}
      {visible === -1 && null}
    </div>
  );
}

function VocabSection({ lesson }: { lesson: Lesson }) {
  const { markSection, sections, srs } = useLatStore();
  const pool = useMemo(
    () => lesson.vocab.map((v, i) => ({ id: `lesson:${lesson.num}:${i}`, la: v.la, es: v.es, der: v.der, lesson: lesson.num, cat: null })),
    [lesson]
  );
  const inDeck = pool.some((p) => srs[p.id]);
  const done = !!sections[`${lesson.num}:vocab`];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={done ? "outline" : "default"} onClick={() => markSection(lesson.num, "vocab")}>
          {done ? "Vocabulario estudiado ✓" : <>Marcar vocabulario como estudiado</>}
        </Button>
        {inDeck && <Chip>Ya está en tu mazo SRS</Chip>}
      </div>
      <Flashcards pool={pool} title={`Vocabula nova · Lección ${lesson.num}`} />
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="table-paradigm">
          <thead>
            <tr><th>Latín</th><th>Español</th><th>Derivada</th></tr>
          </thead>
          <tbody>
            {lesson.vocab.map((v, i) => (
              <tr key={i}>
                <td className="font-lat text-[16px] text-primary">{v.la}</td>
                <td>{v.es}</td>
                <td className="text-muted-foreground">{v.der || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarkableSection({
  lesson, skey, title, icon, children,
}: {
  lesson: Lesson; skey: SectionKey; title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  const { markSection, sections } = useLatStore();
  const done = !!sections[`${lesson.num}:${skey}`];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-lat text-xl font-semibold">
          <span className="text-primary">{icon}</span>{title}
        </h3>
        <Button size="sm" variant={done ? "outline" : "ghost"} className={done ? "border-laurel text-laurel" : "text-muted-foreground"} onClick={() => markSection(lesson.num, skey)}>
          {done ? "Hecho ✓" : "Marcar sección"}
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <Md>{children as unknown as string}</Md>
      </div>
    </div>
  );
}

function LectioSection({ lesson }: { lesson: Lesson }) {
  const { markSection, sections } = useLatStore();
  const done = !!sections[`${lesson.num}:lectio`];
  const [showGloss, setShowGloss] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-lat text-xl font-semibold">
          <BookOpenText className="h-5 w-5 text-primary" /> Lectio · {lesson.meta.lectura}
        </h3>
        <div className="flex gap-2">
          {lesson.glossary.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowGloss((s) => !s)}>
              Glosario
            </Button>
          )}
          <Button size="sm" variant={done ? "outline" : "default"} onClick={() => markSection(lesson.num, "lectio")}>
            {done ? "Leída ✓" : "Marcar lectura"}
          </Button>
        </div>
      </div>
      {showGloss && lesson.glossary.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-gold/40 bg-accent/40 p-3">
          {lesson.glossary.map((g, i) => (
            <Chip key={i} className="bg-card/80">
              <span className="font-lat text-primary">{g.la}</span>
              <span className="mx-1 text-gold">→</span>{g.es}
            </Chip>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <Md>{lesson.lectio}</Md>
      </div>
    </div>
  );
}

function ExercitiaSection({ lesson }: { lesson: Lesson }) {
  const { setQuizScore, quizScores } = useLatStore();
  const quiz = useMemo(() => buildLessonQuiz(lesson.num, 8).concat(buildPhraseQuiz(lesson.num, 2)), [lesson.num]);
  const best = quizScores[lesson.num];
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 font-lat text-xl font-semibold">
        <GraduationCap className="h-5 w-5 text-primary" /> Exercitia · práctica autocorregida
      </h3>
      <ExercitiaBlock lesson={lesson} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-lat text-lg font-semibold">Quiz exprés de la lección</h4>
          {best !== undefined && <Chip>Mejor puntuación: {best}%</Chip>}
        </div>
        <p className="text-xs text-muted-foreground">
          Vocabulario de esta lección + una frase del Colloquium. Feedback inmediato: recuperar de memoria es lo que
          fija el aprendizaje, mucho más que releer.
        </p>
        <QuizRunner questions={quiz} title={`Quiz L${lesson.num}`} onFinish={(pct) => setQuizScore(lesson.num, pct)} />
      </div>
    </div>
  );
}

function LessonDetail({ lesson, onBack, onGo }: { lesson: Lesson; onBack: () => void; onGo: (n: number) => void }) {
  const [sec, setSec] = useState<SectionKey>("colloquium");
  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={lesson.num}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Todas las lecciones
            </Button>
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">Lectiō {roman(lesson.num)}</p>
                <h2 className="font-lat text-3xl font-semibold">{lesson.short}</h2>
                <p className="text-muted-foreground">{lesson.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {lesson.meta.gramatica && <Chip><Check className="h-3 w-3" /> {lesson.meta.gramatica}</Chip>}
                  {lesson.meta.escenario && <Chip>{lesson.meta.escenario}</Chip>}
                </div>
              </div>
              <Laurel className="h-12 w-20 text-gold/50 hidden sm:block" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <SectionPill key={s.key} skey={s.key} label={s.label} active={sec === s.key} onClick={() => setSec(s.key)} lessonNum={lesson.num} />
            ))}
          </div>

          <motion.div key={sec} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {sec === "colloquium" && <ColloquiumSection lesson={lesson} />}
            {sec === "vocab" && <VocabSection lesson={lesson} />}
            {sec === "grammatica" && <MarkableSection lesson={lesson} skey="grammatica" title="Grammatica" icon={<BookOpenText className="h-5 w-5" />}>{lesson.grammatica}</MarkableSection>}
            {sec === "lectio" && <LectioSection lesson={lesson} />}
            {sec === "cultura" && <MarkableSection lesson={lesson} skey="cultura" title="Cultura Rōmāna" icon={<BookOpenText className="h-5 w-5" />}>{lesson.cultura}</MarkableSection>}
            {sec === "pronuntia" && <MarkableSection lesson={lesson} skey="pronuntia" title="Pronūntia" icon={<Volume2 className="h-5 w-5" />}>{lesson.pronuntia}</MarkableSection>}
            {sec === "exercitia" && <ExercitiaSection lesson={lesson} />}
          </motion.div>

          <LessonNav lesson={lesson} onBack={onBack} onGo={onGo} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectionPill({ skey, label, active, onClick, lessonNum }: { skey: SectionKey; label: string; active: boolean; onClick: () => void; lessonNum: number }) {
  const { sections } = useLatStore();
  const done = !!sections[`${lessonNum}:${skey}`];
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors min-h-[36px]",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/50",
      ].join(" ")}
    >
      {label} {done && <Check className="inline h-3.5 w-3.5 ml-0.5 text-laurel" />}
    </button>
  );
}

function LessonNav({ lesson, onBack, onGo }: { lesson: Lesson; onBack: () => void; onGo: (n: number) => void }) {
  const prev = lessons.find((l) => l.num === lesson.num - 1);
  const next = lessons.find((l) => l.num === lesson.num + 1);
  return (
    <div className="flex justify-between gap-3 pb-6">
      {prev ? (
        <Button variant="outline" size="sm" onClick={() => onGo(prev.num)}>
          ← {roman(prev.num)} · {prev.short}
        </Button>
      ) : <span />}
      {next && (
        <Button variant="outline" size="sm" onClick={() => onGo(next.num)}>
          {roman(next.num)} · {next.short} →
        </Button>
      )}
    </div>
  );
}

export function Course({ open, setOpen }: { open: number | null; setOpen: (n: number | null) => void }) {
  const lesson = lessons.find((l) => l.num === open);
  return lesson ? (
    <LessonDetail key={lesson.num} lesson={lesson} onBack={() => setOpen(null)} onGo={(n) => setOpen(n)} />
  ) : (
    <LessonList onOpen={(n) => setOpen(n)} current={-1} />
  );
}
