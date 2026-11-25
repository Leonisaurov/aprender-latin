"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------- SRS Leitner ---------- */

export interface SrsCard {
  box: number; // 1..6
  due: number; // epoch ms
  seen: number;
}

const DAY = 86_400_000;
/** Intervalos Leitner por caja (días). */
export const BOX_DAYS = [0, 0.5, 1, 3, 7, 14, 30];

export function schedule(card: SrsCard, grade: "again" | "good" | "easy"): SrsCard {
  let box = card.box;
  if (grade === "again") box = 1;
  else if (grade === "good") box = Math.min(box + 1, 6);
  else box = Math.min(box + 2, 6);
  const due = Date.now() + (grade === "again" ? 0.4 * DAY : BOX_DAYS[box] * DAY);
  return { box, due, seen: card.seen + 1 };
}

/* ---------- Store ---------- */

export type LessonSectionKey =
  | "colloquium" | "vocab" | "grammatica" | "lectio" | "cultura" | "pronuntia" | "exercitia";

interface LatState {
  /* secciones de lección vistas */
  sections: Record<string, true>; // "3:lectio"
  /* mejores puntuaciones de quiz por lección */
  quizScores: Record<number, number>;
  /* SRS */
  srs: Record<string, SrsCard>;
  /* racha */
  streak: { last: string; count: number };
  /* marcar sección */
  markSection: (lesson: number, key: LessonSectionKey) => void;
  setQuizScore: (lesson: number, pct: number) => void;
  grade: (id: string, g: "again" | "good" | "easy") => void;
  resetSrs: () => void;
  touch: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useLatStore = create<LatState>()(
  persist(
    (set) => ({
      sections: {},
      quizScores: {},
      srs: {},
      streak: { last: "", count: 0 },
      markSection: (lesson, key) => {
        const t = today();
        set((st) => {
          const k = `${lesson}:${key}`;
          const had = !!st.sections[k];
          let streak = st.streak;
          if (!had) {
            if (streak.last === t) {
              /* ya contó hoy */
            } else {
              const yest = new Date(Date.now() - DAY).toISOString().slice(0, 10);
              streak = { last: t, count: streak.last === yest ? streak.count + 1 : 1 };
            }
          }
          return { sections: { ...st.sections, [k]: true }, streak };
        });
      },
      setQuizScore: (lesson, pct) =>
        set((st) => ({
          quizScores: { ...st.quizScores, [lesson]: Math.max(st.quizScores[lesson] ?? 0, pct) },
        })),
      grade: (id, g) =>
        set((st) => {
          const card = st.srs[id] ?? { box: 1, due: 0, seen: 0 };
          return { srs: { ...st.srs, [id]: schedule(card, g) } };
        }),
      resetSrs: () => set(() => ({ srs: {} })),
      touch: () =>
        set((st) => {
          const t = today();
          if (st.streak.last === t) return st;
          const yest = new Date(Date.now() - DAY).toISOString().slice(0, 10);
          return { streak: { last: t, count: st.streak.last === yest ? st.streak.count + 1 : 1 } };
        }),
    }),
    { name: "lingua-latina-v1" }
  )
);

/* ---------- Derivados ---------- */

export function lessonPct(
  sections: Record<string, true>,
  quizScores: Record<number, number>,
  lesson: number,
  total = 7
): number {
  let done = 0;
  for (const key of ["colloquium", "vocab", "grammatica", "lectio", "cultura", "pronuntia", "exercitia"]) {
    if (sections[`${lesson}:${key}`]) done++;
  }
  const q = quizScores[lesson] ? 1 : 0;
  return Math.round(((done + q * 0.5) / (total + 0.5)) * 100);
}

export function srsStats(srs: Record<string, SrsCard>) {
  const now = Date.now();
  const cards = Object.values(srs);
  const due = cards.filter((c) => c.due <= now).length;
  const learning = cards.filter((c) => c.box <= 2).length;
  const mastered = cards.filter((c) => c.box >= 5).length;
  return { total: cards.length, due, learning, mastered };
}
