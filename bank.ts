import foundations from "./foundations.ts";
import community from "./community.ts";
import maternal from "./maternal.ts";
import medsurg from "./medsurg.ts";
import neuro from "./neuro.ts";
import mental from "./mental.ts";
import type { ClinicalCase, Question, Subject } from "./types.ts";
export const subjects: { id: Subject; name: string; short: string; description: string; color: string }[] = [
  { id: "CROSS", name: "Foundations & Fundamentals", short: "F&F", description: "The essentials behind every nursing decision", color: "#8c7960" },
  { id: "NP1", name: "Community Health Nursing", short: "NP1", description: "Health promotion, prevention, and community care", color: "#6c8a6c" },
  { id: "NP2", name: "MCN & Pedia", short: "NP2", description: "Maternal, newborn, and pediatric nursing", color: "#b7827c" },
  { id: "NP3", name: "Surgery & Med-Surg", short: "NP3", description: "Perioperative, cardiac, respiratory, and renal care", color: "#69849b" },
  { id: "NP4", name: "GI, Endocrine & Neuro", short: "NP4", description: "Digestive, hormonal, neurologic, and sensory care", color: "#b19156" },
  { id: "NP5", name: "Psych & Critical Care", short: "NP5", description: "Mental health, crisis, and emergency nursing", color: "#8f7e9f" },
];
export const clinicalCases: ClinicalCase[] = [...foundations, ...community, ...maternal, ...medsurg, ...neuro, ...mental];
const prompts = [
  "Which assessment finding is most directly associated with this situation?",
  "Which nursing action best addresses the immediate care need in this situation?",
  "Which patient or caregiver teaching point is most appropriate?",
  "Which result most directly shows that the care goal has been met?",
  "Which statement about care in this situation requires correction?",
];
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const result = [...items]; let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; const j = value % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export const questions: Question[] = clinicalCases.flatMap((entry, index) => entry.facts.map((fact, kind) => {
  const peers = shuffled(clinicalCases.filter(c => c.subject === entry.subject && c.title !== entry.title && c.facts[kind].text !== fact.text), (index + 17) * (kind + 53));
  const distractors = kind === 4
    ? [entry.facts[1], entry.facts[2], entry.facts[3]].map(f => ({ text: f.text, rationale: `This is an appropriate statement, so it does not require correction. ${f.reason}` }))
    : peers.slice(0, 3).map(c => ({ text: c.facts[kind].text, rationale: `This choice relates most directly to ${c.title.toLowerCase()}. For ${entry.title.toLowerCase()}, the best answer is: ${fact.text.toLowerCase()}. ${fact.reason}` }));
  const correct = { text: fact.text, rationale: fact.reason };
  const options = shuffled([correct, ...distractors], index * 47 + kind * 97 + 5);
  return { id: `${entry.subject}-${String(index + 1).padStart(3, "0")}-${kind + 1}`, subject: entry.subject, topic: entry.topic, stem: `${entry.scenario} ${prompts[kind]}`, options, correctIndex: options.indexOf(correct), rationale: fact.reason, keyPoint: `${entry.title}: ${fact.text}. ${fact.reason}`, source: "https://www.ncbi.nlm.nih.gov/books/NBK590025/", origin: "Original educational scenario; not copied from BoardPal or an official PNLE paper." };
}));
export const questionMap = new Map(questions.map(q => [q.id, q]));
export const topics = subjects.flatMap(subject => [...new Set(questions.filter(q => q.subject === subject.id).map(q => q.topic))].map(name => ({ id: `${subject.id}:${name}`, name, subject: subject.id, count: questions.filter(q => q.subject === subject.id && q.topic === name).length })));
export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || !value.length || value.length > 20000) throw new Error("Import a JSON array containing 1–20,000 questions.");
  const ids = new Set<string>();
  for (const q of value) {
    if (!q || typeof q.id !== "string" || !q.id.trim() || q.id.length > 160 || ids.has(q.id)) throw new Error("Every question needs a unique, nonempty id.");
    ids.add(q.id);
    if (!subjects.some(s => s.id === q.subject) || typeof q.topic !== "string" || !q.topic.trim() || typeof q.stem !== "string" || q.stem.length < 12 || typeof q.rationale !== "string" || !q.rationale.trim()) throw new Error(`Question ${q.id} needs a valid subject, topic, stem, and rationale.`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o: unknown) => !o || typeof o !== "object" || !("text" in o) || !("rationale" in o) || typeof o.text !== "string" || !o.text.trim() || typeof o.rationale !== "string" || !o.rationale.trim())) throw new Error(`Question ${q.id} needs four choices with explanations.`);
    if (new Set(q.options.map((o: { text: string }) => o.text.toLowerCase().trim())).size !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`Question ${q.id} has duplicate choices or an invalid answer.`);
  }
  return value.map(q => ({ ...q, keyPoint: q.keyPoint || q.rationale, source: typeof q.source === "string" && /^https:\/\//.test(q.source) ? q.source : "", origin: q.origin || "Imported by you" }));
}
