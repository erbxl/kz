import lessonData from "./lessons.json";

export type Word = {
  kazakh: string;
  latin: string;
  spanish: string;
  note: string;
};
export type Lesson = {
  id: number;
  unitId: number;
  title: string;
  description: string;
  glyph: string;
  color: string;
  words: Word[];
};

// IDs 1–3 remain unchanged so previously saved lessons and sessions still work.
export const lessons: Lesson[] = lessonData;
export const units = [
  { id: 1, title: "Primeros pasos" },
  { id: 2, title: "Conversaciones" },
  { id: 3, title: "Números y orden" },
  { id: 4, title: "Mi familia" },
  { id: 5, title: "Comer y beber" },
  { id: 6, title: "En casa" },
  { id: 7, title: "Por la ciudad" },
  { id: 8, title: "La naturaleza" },
  { id: 9, title: "Días y momentos" },
  { id: 10, title: "Acciones cotidianas" },
  { id: 11, title: "Describir y pedir ayuda" },
];

export function lessonNumber(id: number) {
  return String(id).padStart(2, "0");
}
