import { normalizeQuestionStem } from "./bank.ts";
import { inCollection } from "./collections.ts";
import type { Collection } from "./collections.ts";
import { questionsForSelection } from "./curriculum.ts";
import type { PracticeDifficulty } from "./question-selection.ts";
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

export function practiceSetupPath(scope: PracticeScope & {
  difficulty?: PracticeDifficulty; exhausted?: boolean; count?: number; mode?: "tutor" | "exam";
  filter?: string; allowRelated?: boolean; perQuestion?: number; planTaskId?: string;
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
  if (scope.perQuestion) params.set("timer", String(scope.perQuestion));
  if (scope.planTaskId) params.set("task", scope.planTaskId);
  return `/practice/session?${params}`;
}
