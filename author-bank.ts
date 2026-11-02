import foundations from "./foundations.ts";
import community from "./community.ts";
import maternal from "./maternal.ts";
import medsurg from "./medsurg.ts";
import neuro from "./neuro.ts";
import mental from "./mental.ts";
import { additionalQuestions } from "./additional-questions.ts";
import siteQuestions from "./site-questions.json" with { type: "json" };
import supplemental from "./supplemental-questions.json" with { type: "json" };
import concepts from "./concept-questions.json" with { type: "json" };
import type { ClinicalCase, Question, Subject } from "./types.ts";
import { subjects, shuffled, validateQuestions, installQuestionBank } from "./bank.ts";
export { subjects, shuffled, validateQuestions } from "./bank.ts";
export const clinicalCases: ClinicalCase[] = [...foundations, ...community, ...maternal, ...medsurg, ...neuro, ...mental];
const prompts = [
  "Which assessment finding is most directly associated with this situation?",
  "Which nursing action best addresses the immediate care need in this situation?",
  "Which patient or caregiver teaching point is most appropriate?",
  "Which result most directly shows that the care goal has been met?",
  "Which statement about care in this situation requires correction?",
];
export const originalQuestions: Question[] = clinicalCases.flatMap((entry, index) => entry.facts.map((fact, kind) => {
  const peers = shuffled(clinicalCases.filter(c => c.subject === entry.subject && c.title !== entry.title && c.facts[kind].text !== fact.text), (index + 17) * (kind + 53));
  const distractors = kind === 4
    ? [entry.facts[1], entry.facts[2], entry.facts[3]].map(f => ({ text: f.text, rationale: `This is an appropriate statement, so it does not require correction. ${f.reason}` }))
    : peers.slice(0, 3).map(c => ({ text: c.facts[kind].text, rationale: `This choice relates most directly to ${c.title.toLowerCase()}. For ${entry.title.toLowerCase()}, the best answer is: ${fact.text.toLowerCase()}. ${fact.reason}` }));
  const correct = { text: fact.text, rationale: fact.reason };
  const options = shuffled([correct, ...distractors], index * 47 + kind * 97 + 5);
  return { id: `${entry.subject}-${String(index + 1).padStart(3, "0")}-${kind + 1}`, subject: entry.subject, topic: entry.topic, stem: `${entry.scenario} ${prompts[kind]}`, options, correctIndex: options.indexOf(correct), rationale: fact.reason, keyPoint: `${entry.title}: ${fact.text}. ${fact.reason}`, source: "https://www.ncbi.nlm.nih.gov/books/NBK590025/", origin: "Original educational scenario; not copied from BoardPal or an official PNLE paper." };
}));
export const supplementalQuestions = validateQuestions(supplemental);
export const conceptQuestions = validateQuestions(concepts);
// Keep the first 653 records, their IDs, option order, and keys immutable.
export const questions: Question[] = [...originalQuestions, ...additionalQuestions, ...supplementalQuestions, ...conceptQuestions, ...(siteQuestions.length ? validateQuestions(siteQuestions) : [])];
export const questionMap = new Map(questions.map(q => [q.id, q]));
export const topics = subjects.flatMap(subject => [...new Set(questions.filter(q => q.subject === subject.id).map(q => q.topic))].map(name => ({ id: `${subject.id}:${name}`, name, subject: subject.id, count: questions.filter(q => q.subject === subject.id && q.topic === name).length })));

installQuestionBank(questions,clinicalCases);
