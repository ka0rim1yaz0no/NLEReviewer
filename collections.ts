import type { Question } from "./types.ts";
export type Collection = "all" | "nursing" | "supplemental";
export function inCollection(question:Question,collection:Collection){return collection==="all"||(collection==="supplemental"?question.collection==="supplemental":question.collection!=="supplemental");}
export function collectionCounts(bank:readonly Question[]){const supplemental=bank.filter(q=>q.collection==="supplemental").length;return {all:bank.length,nursing:bank.length-supplemental,supplemental};}
