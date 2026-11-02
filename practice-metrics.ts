import { curriculum, questionsForTopic } from "./curriculum.ts";
import { firstAttempts } from "./engine.ts";
import type { State } from "./engine.ts";
import type { Question } from "./types.ts";

export function practiceTopicRows(state:Pick<State,"attempts"|"sessions"|"vault"|"bookmarks">,bank:readonly Question[]){
  const first=new Map(firstAttempts(state.attempts).map(a=>[a.questionId,a]));
  const latest=new Map<string,State["attempts"][number]>();
  for(const attempt of state.attempts)if(attempt.at>=(latest.get(attempt.questionId)?.at??-Infinity))latest.set(attempt.questionId,attempt);
  const vault=new Set(state.vault),saved=new Set(state.bookmarks);
  const flagged=new Set(state.sessions.flatMap(session=>session.flagged));
  return curriculum.map(topic=>{
    const questions=questionsForTopic(topic,bank);
    return {topic,questions,tried:questions.filter(q=>first.has(q.id)).length,
      missedIds:questions.filter(q=>vault.has(q.id)&&latest.get(q.id)?.correct===false).map(q=>q.id),
      flaggedIds:questions.filter(q=>flagged.has(q.id)).map(q=>q.id),
      savedIds:questions.filter(q=>saved.has(q.id)).map(q=>q.id)};
  });
}
