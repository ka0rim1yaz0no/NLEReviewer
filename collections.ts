import type { Question } from "./types.ts";
export type Collection = "all" | "nursing" | "situational" | "clinical" | "concept" | "comparison" | "supplemental";
export function parseCollection(value:string|null):Collection{return value==="all"||value==="nursing"||value==="clinical"||value==="concept"||value==="comparison"||value==="supplemental"?value:"situational";}
// Recognize the original 120 five-part cases without changing their saved payloads.
export function isSituational(question:Question){return question.collection!=="supplemental"&&(question.format==="situational"||!question.format&&/^(CROSS|NP[1-5])-\d{3}-[1-5]$/.test(question.id));}
export function inCollection(question:Question,collection:Collection){
 if(collection==="all")return true;
 if(collection==="situational")return isSituational(question);
 if(collection==="supplemental")return question.collection==="supplemental";
 if(collection==="concept"||collection==="comparison")return question.format===collection&&question.collection!=="supplemental";
 if(collection==="clinical")return !question.format&&question.collection!=="supplemental";
 return question.collection!=="supplemental";
}
export function collectionCounts(bank:readonly Question[]){const count=(collection:Collection)=>bank.filter(q=>inCollection(q,collection)).length;return {all:bank.length,nursing:count("nursing"),situational:count("situational"),newSituational:bank.filter(q=>q.format==="situational"&&q.collection!=="supplemental").length,clinical:count("clinical"),concept:count("concept"),comparison:count("comparison"),supplemental:count("supplemental")};}
