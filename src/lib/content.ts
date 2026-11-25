import courseJson from "@/data/course.json";

/* ---------- Tipos ---------- */

export interface VocabEntry {
  la: string;
  es: string;
  der: string;
}

export interface ExItem {
  n: number;
  text: string;
}

export interface ExSection {
  letter: string;
  title: string;
  note: string;
  items: ExItem[];
}

export interface Lesson {
  num: number;
  short: string;
  subtitle: string;
  meta: { gramatica?: string; escenario?: string; lectura?: string };
  colloquium: { la: string; es: string }[];
  colloquium_note: string;
  vocab: VocabEntry[];
  grammatica: string;
  lectio: string;
  glossary: { la: string; es: string }[];
  cultura: string;
  pronuntia: string;
  exercitia: ExSection[];
}

export interface AnswerSection {
  items?: Record<string, string>;
  free?: string;
}

export interface TheoryChapter {
  num: number;
  short: string;
  subtitle: string;
  intro: string;
  sections: { head: string; body: string }[];
}

export interface VocabCat {
  cat: string;
  entries: { la: string; es: string; der: string; decl: string }[];
}

export interface TablesData {
  intro: string;
  sections: { head: string; body: string }[];
}

export interface CourseData {
  lessons: Lesson[];
  answers: Record<string, Record<string, AnswerSection>>;
  vocabCats: VocabCat[];
  theory: TheoryChapter[];
  tables: TablesData;
  autoeval: string[];
}

export const course = courseJson as unknown as CourseData;
export const lessons: Lesson[] = course.lessons;
export const answers = course.answers;
export const vocabCats: VocabCat[] = course.vocabCats;
export const theory: TheoryChapter[] = course.theory;
export const tables: TablesData = course.tables;
export const autoeval: string[] = course.autoeval;

/* ---------- Utilidades ---------- */

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

export function roman(n: number): string {
  return ROMAN[n] ?? String(n);
}

/** Normaliza texto para comparar respuestas: sin macrones, minúsculas, sin puntuación. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[«»"'’“”.!?,;:()\-—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerFor(lessonNum: number, letter: string, n: number): string | null {
  const sec = answers[String(lessonNum)]?.[letter];
  if (!sec) return null;
  if (n === 0) return sec.free ?? null;
  return sec.items?.[String(n)] ?? null;
}

/** Bank de citas para la frase del día (cap. 13 §10). */
export const QUOTES: { la: string; es: string; src: string }[] = [
  { la: "Carpe diem, quam minimum crēdula posterō.", es: "Aprovecha el día, confía lo mínimo en el mañana.", src: "Horacio, Od. I 11" },
  { la: "Festīnā lentē.", es: "Apúrate despacio.", src: "Suetonio, Aug. 25" },
  { la: "Dum spīrō, spērō.", es: "Mientras respiro, espero.", src: "Cicerón, Ad Att. IX 10" },
  { la: "Errāre hūmānum est.", es: "Equivocarse es humano.", src: "proverbio antiguo" },
  { la: "Vērba volant, scrīpta manent.", es: "Las palabras vuelan, lo escrito permanece.", src: "proverbio" },
  { la: "Mēns sāna in corpore sānō.", es: "Mente sana en cuerpo sano.", src: "Juvenal, Sát. X 356" },
  { la: "Audentēs Fortūna iuvat.", es: "La Fortuna ayuda a los audaces.", src: "Virgilio, En. X 284" },
  { la: "Per aspera ad astra.", es: "Por lo duro, a las estrellas.", src: "adaptación de Séneca" },
  { la: "Festina lente, sed carpe diem.", es: "Despacio con prisa, pero aprovecha el día.", src: "máxima del curso" },
  { la: "Latīnē loquendum est ut Latīnē discāmus.", es: "Hay que hablar latín para aprender latín.", src: "máxima del curso" },
];

/* Plan de 12 semanas (cap. 16 §2) */
export const WEEK_PLAN: { week: number; lesson: string; ref: string; goal: string }[] = [
  { week: 1, lesson: "L1 Salutatio", ref: "02 · pronunciación", goal: "leer en voz alta sin miedo" },
  { week: 2, lesson: "L2 Familia", ref: "03 · 1.ª-2.ª decl.", goal: "posesión, mihi est" },
  { week: 3, lesson: "L3 Taberna", ref: "03 · 3.ª decl. intro", goal: "presente 1.ª-2.ª" },
  { week: 4, lesson: "L4 Mercado", ref: "04 · adjetivos", goal: "3.ª declinación completa" },
  { week: 5, lesson: "L5 Escuela", ref: "05 · sistemas simples", goal: "imperfecto y perfecto" },
  { week: 6, lesson: "L6 Vía", ref: "04 · grados", goal: "comparativos + repaso 1-5" },
  { week: 7, lesson: "L7 Epistula", ref: "05 · futuro", goal: "relativo + numerales" },
  { week: 8, lesson: "L8 Médico", ref: "05 · pasiva", goal: "voz pasiva + deponentes" },
  { week: 9, lesson: "L9 Itinere", ref: "06 · finales", goal: "subjuntivo, condicionales" },
  { week: 10, lesson: "L10 Agrīs", ref: "06 · ACI, abl. absoluto", goal: "narrar en latín" },
  { week: 11, lesson: "L11 Saturnālia", ref: "05 · irregulares", goal: "participios + rebeldes" },
  { week: 12, lesson: "L12 Convīvium", ref: "todo", goal: "repaso + métrica + conversación" },
];

export const SECTIONS = [
  { key: "colloquium", label: "Colloquium", desc: "Diálogo para leer en voz alta" },
  { key: "vocab", label: "Vocabula", desc: "Tarjetas de vocabulario nuevo" },
  { key: "grammatica", label: "Grammatica", desc: "La gramática de la lección" },
  { key: "lectio", label: "Lectio", desc: "Fábula de Esopo + glosario" },
  { key: "cultura", label: "Cultura", desc: "Roma y su mundo" },
  { key: "pronuntia", label: "Pronūntia", desc: "Trampas de pronunciación" },
  { key: "exercitia", label: "Exercitia", desc: "Ejercicios autocorregidos" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

/* Vocabulario aplanado con id estable para el SRS */
export interface FlatVocab {
  id: string;
  la: string;
  es: string;
  der: string;
  lesson: number | null;
  cat: string | null;
}

export const flatLessonVocab: FlatVocab[] = lessons.flatMap((l) =>
  l.vocab.map((v, i) => ({ id: `lesson:${l.num}:${i}`, la: v.la, es: v.es, der: v.der, lesson: l.num, cat: null }))
);

export const flatCoreVocab: FlatVocab[] = vocabCats.flatMap((c) =>
  c.entries.map((v, i) => ({ id: `core:${c.cat}:${i}`, la: v.la, es: v.es, der: v.der, lesson: null, cat: c.cat }))
);

export const allVocab: FlatVocab[] = [...flatLessonVocab, ...flatCoreVocab];

/* Banco de frases del colloquium para quizzes de interleaving */
export const PHRASES: { la: string; es: string; lesson: number }[] = lessons.flatMap((l) =>
  l.colloquium
    .filter((c) => c.la.length > 8)
    .map((c) => ({ la: c.la, es: c.es, lesson: l.num }))
);
