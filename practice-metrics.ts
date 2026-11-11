import { curriculum, questionsForTopic } from "./curriculum.ts";
import { answeredQuestionIds } from "./engine.ts";
import type { State } from "./engine.ts";
import type { Question } from "./types.ts";
import { vaultIsDue } from "./vault-schedule.ts";

export function practiceTopicRows(state:Pick<State,"attempts"|"sessions"|"vault"|"bookmarks"|"preferences"|"vaultReviews">,bank:readonly Question[]){
  const answered=answeredQuestionIds(state.attempts);
  const latest=new Map<string,State["attempts"][number]>();
  for(const attempt of state.attempts)if(attempt.at>=(latest.get(attempt.questionId)?.at??-Infinity))latest.set(attempt.questionId,attempt);
  const now=Date.now(),vault=new Set(state.vault.filter(id=>vaultIsDue(state,id,now))),saved=new Set(state.bookmarks);
  const flagged=new Set(state.sessions.flatMap(session=>session.flagged));
  return curriculum.map(topic=>{
    const questions=questionsForTopic(topic,bank);
    return {topic,questions,tried:questions.filter(q=>answered.has(q.id)).length,
      missedIds:questions.filter(q=>vault.has(q.id)&&latest.get(q.id)?.correct!==true).map(q=>q.id),
      flaggedIds:questions.filter(q=>flagged.has(q.id)).map(q=>q.id),
      savedIds:questions.filter(q=>saved.has(q.id)).map(q=>q.id)};
  });
}
