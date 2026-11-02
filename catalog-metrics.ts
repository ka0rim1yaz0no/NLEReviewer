import reference from "./reference-counts.json" with { type: "json" };
import { curriculum, questionsForTopic } from "./curriculum.ts";
import type { CurriculumTopic } from "./curriculum.ts";
import type { Question, Subject } from "./types.ts";
import { normalizeQuestionStem } from "./bank.ts";
export { normalizeQuestionStem } from "./bank.ts";

const counts: Record<string, number> = reference.counts;
export const referenceObservedAt = reference.observedAt;
export const referenceSource = reference.source;
export const referenceTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
export const referenceCount = (topic: Pick<CurriculumTopic, "slug">) => counts[topic.slug] || 0;
export const referenceSubjectCount = (subject: Subject) => curriculum.filter(t => t.subject === subject).reduce((sum, t) => sum + referenceCount(t), 0);
const uniqueCounts=new WeakMap<readonly Question[],number>();
export function uniqueQuestionCount(bank:readonly Question[]){let count=uniqueCounts.get(bank);if(count===undefined){count=new Set(bank.map(q=>normalizeQuestionStem(q.stem))).size;uniqueCounts.set(bank,count);}return count;}

export function findDuplicateQuestions(bank: Question[]) {
  const seen = new Map<string, string>();
  const duplicates: { id: string; duplicateOf: string }[] = [];
  for (const question of bank) {
    const key = normalizeQuestionStem(question.stem);
    const previous = seen.get(key);
    if (previous) duplicates.push({ id: question.id, duplicateOf: previous });
    else seen.set(key, question.id);
  }
  return duplicates;
}

// Related scenarios may appear under several topics; they never inflate the unique bank total.
export function auditQuestionBank(bank: Question[]) {
  const rows = curriculum.map(topic => {
    const exact = bank.filter(q => q.subject === topic.subject && (q.topic === topic.name || q.topic === topic.slug));
    const assignedCount=uniqueQuestionCount(exact);
    return { ...topic, referenceCount: referenceCount(topic), assignedCount, relatedAvailableCount: uniqueQuestionCount(questionsForTopic(topic, bank)), remaining: Math.max(0, referenceCount(topic) - assignedCount) };
  });
  const assigned=rows.reduce((sum,row)=>sum+row.assignedCount,0);
  const unique=uniqueQuestionCount(bank);
  const matching=rows.filter(row=>row.assignedCount===row.referenceCount).length;
  const duplicates=findDuplicateQuestions(bank);
  return {
    referenceSource, referenceObservedAt, referenceTotal,
    availableUniqueQuestions: unique,
    availableQuestionIds: new Set(bank.map(q=>q.id)).size,
    explicitlyAssignedQuestions: assigned,
    duplicateStems: duplicates,
    matchingTopics: matching,
    matchesReferenceDistribution: matching===curriculum.length && assigned===unique && unique===referenceTotal && !duplicates.length,
    topics: rows,
  };
}
