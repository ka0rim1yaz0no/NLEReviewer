import type { Question } from "./types.ts";
export type Collection = "all" | "nursing" | "clinical" | "concept" | "comparison" | "supplemental";
export function parseCollection(value:string|null):Collection{return value==="all"||value==="clinical"||value==="concept"||value==="comparison"||value==="supplemental"?value:"nursing";}
export function inCollection(question:Question,collection:Collection){
 if(collection==="all")return true;
 if(collection==="supplemental")return question.collection==="supplemental";
 if(collection==="concept"||collection==="comparison")return question.format===collection&&question.collection!=="supplemental";
 if(collection==="clinical")return !question.format&&question.collection!=="supplemental";
 return question.collection!=="supplemental";
}
export function collectionCounts(bank:readonly Question[]){const supplemental=bank.filter(q=>q.collection==="supplemental").length,concept=bank.filter(q=>inCollection(q,"concept")).length,comparison=bank.filter(q=>inCollection(q,"comparison")).length;return {all:bank.length,nursing:bank.length-supplemental,clinical:bank.length-supplemental-concept-comparison,concept,comparison,supplemental};}
