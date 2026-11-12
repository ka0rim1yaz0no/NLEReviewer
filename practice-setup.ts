import { normalizeQuestionStem, shuffled } from "./bank.ts";
import { inCollection } from "./collections.ts";
import type { Collection } from "./collections.ts";
import { findCurriculumTopic, questionsForSelection } from "./curriculum.ts";
import { distinctQuestionSet, minimumStudyQuestions, practicePool } from "./question-selection.ts";
import type { PracticeDifficulty, QuestionHistory, SelectionOptions } from "./question-selection.ts";
import type { Question, Subject } from "./types.ts";

type PracticeScope = {
  collection: Collection;
  subject?: Subject;
  topics?: string[];
  keyword?: string;
};

const searchText = new WeakMap<Question, string>();
export function practiceQuestionPool(bank: readonly Question[], scope: PracticeScope & { ids?: string[] }) {
  const ids = scope.ids && new Set(scope.ids);
  const keyword = scope.keyword?.trim() || "";
  const query = normalizeQuestionStem(keyword);
  if (keyword && query.length < 2) return [];
  const terms = query ? query.split(" ") : [];

  return questionsForSelection(scope.topics || [], bank).filter(question => {
    if (!inCollection(question, scope.collection) || scope.subject && question.subject !== scope.subject || ids && !ids.has(question.id)) return false;
    if (!terms.length) return true;

    let searchable = searchText.get(question);
    if (searchable === undefined) {
      searchable = normalizeQuestionStem([question.topic, question.stem, ...question.options.map(option => option.text)].join(" "));
      searchText.set(question, searchable);
    }
    return terms.every(term => searchable.includes(term));
  });
}

type PracticeSessionScope = PracticeScope & Omit<SelectionOptions, "bank"> & {
  count?: number;
  ids?: string[];
  quick?: boolean;
  supplement?: boolean;
};

export function practiceSessionQuestions(
  bank: readonly Question[], history: QuestionHistory, scope: PracticeSessionScope, seed: number,
) {
  const count = Math.max(minimumStudyQuestions, Math.floor(scope.count || 0));
  const pool = practiceQuestionPool(bank, scope);
  const options = {...scope, bank};
  const review = scope.review || scope.filter === "missed" || scope.filter === "vault";
  const onePerCase = !scope.allowRelated && !review;
  let focused = distinctQuestionSet(shuffled(practicePool(pool, history, options), seed), onePerCase).slice(0, count);
  let followUp = false;
  if (!focused.length && scope.quick && !review && (!scope.filter || scope.filter === "unanswered")) {
    focused = distinctQuestionSet(shuffled(practicePool(pool, history, {...options, allowRelated: true}), seed), true).slice(0, count);
    followUp = focused.length > 0;
  }
  if (!focused.length || focused.length >= count || scope.supplement === false) {
    return {questions: focused, focusedCount: focused.length, followUp};
  }

  const preferredSubjects = new Set<Subject>(focused.map(q => q.subject));
  if (scope.subject) preferredSubjects.add(scope.subject);
  for (const key of scope.topics || []) {
    const topic = findCurriculumTopic(key);
    if (topic) preferredSubjects.add(topic.subject);
  }
  const preferredTopics = new Set(focused.map(q => `${q.subject}:${q.topic}`));
  const scopedIds = new Set((review ? focused : pool).map(q => q.id));
  const remaining = bank.filter(q => !scopedIds.has(q.id) && (inCollection(q, scope.collection) || inCollection(q, "nursing")));
  const fallback = practicePool(remaining, history, {
    bank,
    filter: !review && scope.filter === "all" ? "all" : "unanswered",
    difficulty: scope.difficulty,
    allowRelated: scope.allowRelated || followUp,
  });
  const sameCollection: [Question[], Question[], Question[]] = [[], [], []];
  const otherCollections: [Question[], Question[], Question[]] = [[], [], []];
  for (const q of shuffled(fallback, seed + 1)) {
    const [byTopic, bySubject, integrated] = inCollection(q, scope.collection) ? sameCollection : otherCollections;
    if (preferredTopics.has(`${q.subject}:${q.topic}`)) byTopic.push(q);
    else if (preferredSubjects.has(q.subject)) bySubject.push(q);
    else if (q.subject === "CROSS" || preferredSubjects.has("CROSS")) integrated.push(q);
  }
  const ordered = [...sameCollection.flat(), ...otherCollections.flat()];
  const added = distinctQuestionSet(ordered, !scope.allowRelated, focused).slice(0, count - focused.length);
  return {questions: [...focused, ...added], focusedCount: focused.length, followUp};
}

export function practiceSetupPath(scope: PracticeScope & {
  difficulty?: PracticeDifficulty; exhausted?: boolean; count?: number; mode?: "tutor" | "exam";
  filter?: string; allowRelated?: boolean; supplement?: boolean; perQuestion?: number; planTaskId?: string;
}) {
  const params = new URLSearchParams({ collection: scope.collection });
  if (scope.subject) params.set("np", scope.subject);
  for (const topic of scope.topics || []) params.append("topic", topic);
  if (scope.keyword?.trim()) params.set("keyword", scope.keyword.trim());
  if (scope.difficulty) params.set("difficulty", scope.difficulty);
  if (scope.exhausted) params.set("exhausted", "1");
  if (scope.count) params.set("count", String(scope.count));
  if (scope.mode === "exam") params.set("mode", "exam");
  if (scope.filter && scope.filter !== "unanswered") params.set("filter", scope.filter);
  if (scope.allowRelated) params.set("related", "1");
  if (scope.supplement === false) params.set("supplement", "0");
  if (scope.perQuestion) params.set("timer", String(scope.perQuestion));
  if (scope.planTaskId) params.set("task", scope.planTaskId);
  return `/practice/session?${params}`;
}
