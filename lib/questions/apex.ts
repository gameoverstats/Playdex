import type { QuestionType } from "@/components/guide/game-stepper";

export const apexQuestions: QuestionType[] = [
  { label: "How often do you play?", key: "playFrequency", type: "radio", options: ["Daily", "Weekly"] },
  { label: "Rank?", key: "currentRank", type: "select", options: ["Bronze", "Silver", "Gold"] },
  { label: "Focus areas?", key: "developmentAreas", type: "checkbox", options: ["Aim", "Rotation"] },
];