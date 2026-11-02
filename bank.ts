import type { ClinicalCase, Question, Subject } from "./types.ts";
export const subjects: { id: Subject; name: string; short: string; description: string; color: string }[] = [
  { id: "CROSS", name: "Foundations & Fundamentals", short: "F&F", description: "The essentials behind every nursing decision", color: "#8c7960" },
  { id: "NP1", name: "Community Health Nursing", short: "NP1", description: "Health promotion, prevention, and community care", color: "#6c8a6c" },
  { id: "NP2", name: "MCN & Pedia", short: "NP2", description: "Maternal, newborn, and pediatric nursing", color: "#b7827c" },
  { id: "NP3", name: "Surgery & Med-Surg", short: "NP3", description: "Perioperative, cardiac, respiratory, and renal care", color: "#69849b" },
  { id: "NP4", name: "GI, Endocrine & Neuro", short: "NP4", description: "Digestive, hormonal, neurologic, and sensory care", color: "#b19156" },
  { id: "NP5", name: "Psych & Critical Care", short: "NP5", description: "Mental health, crisis, and emergency nursing", color: "#8f7e9f" },
];
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const result = [...items]; let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; const j = value % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}

// Populated only after a claimed username profile retrieves the protected database content.
export let questions:Question[]=[];
export let clinicalCases:ClinicalCase[]=[];
export let questionMap=new Map<string,Question>();
export let topics:{id:string;name:string;subject:Subject;count:number}[]=[];
export function installQuestionBank(next:Question[],cases:ClinicalCase[]){
 const all=next.length?validateQuestions(next):[];questions=all.filter(q=>!q.retired);clinicalCases=cases;
 questionMap=new Map(all.map(q=>[q.id,q]));
 topics=subjects.flatMap(subject=>[...new Set(questions.filter(q=>q.subject===subject.id).map(q=>q.topic))].map(name=>({id:`${subject.id}:${name}`,name,subject:subject.id,count:questions.filter(q=>q.subject===subject.id&&q.topic===name).length})));
}
export function validateQuestions(value: unknown, options:{allowDuplicateStems?:boolean}={}): Question[] {
  if (!Array.isArray(value) || !value.length || value.length > 20000) throw new Error("Import a JSON array containing 1–20,000 questions.");
  const ids = new Set<string>();
  const stems = new Set<string>();
  for (const q of value) {
    if (!q || typeof q.id !== "string" || !q.id.trim() || q.id.length > 160 || ids.has(q.id)) throw new Error("Every question needs a unique, nonempty id.");
    ids.add(q.id);
    if (!subjects.some(s => s.id === q.subject) || typeof q.topic !== "string" || !q.topic.trim() || typeof q.stem !== "string" || q.stem.length < 12 || typeof q.rationale !== "string" || !q.rationale.trim()) throw new Error(`Question ${q.id} needs a valid subject, topic, stem, and rationale.`);
    const stem = normalizeQuestionStem(q.stem);
    if (stems.has(stem)&&!options.allowDuplicateStems) throw new Error(`Question ${q.id} repeats another question stem. Rewording punctuation or changing IDs does not create a new question.`);
    stems.add(stem);
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o: unknown) => !o || typeof o !== "object" || !("text" in o) || !("rationale" in o) || typeof o.text !== "string" || !o.text.trim() || typeof o.rationale !== "string" || !o.rationale.trim())) throw new Error(`Question ${q.id} needs four choices with explanations.`);
    if (new Set(q.options.map((o: { text: string }) => o.text.toLowerCase().trim())).size !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`Question ${q.id} has duplicate choices or an invalid answer.`);
  }
  return value.map(q => {
    const {collection,rationaleScope,sourceId,sourceTopic,format,conceptId,caseId,clinicalObjective,retired,...rest}=q;
    const options=q.options.map((o:{text:string;rationale:string;source?:unknown;contextSource?:unknown;referenceId?:unknown})=>({text:o.text,rationale:o.rationale,...(typeof o.source==="string"&&/^https:\/\//.test(o.source)?{source:o.source}:{}),...(typeof o.contextSource==="string"&&/^https:\/\//.test(o.contextSource)?{contextSource:o.contextSource}:{}),...(typeof o.referenceId==="string"?{referenceId:o.referenceId}:{})}));
    return { ...rest, options, keyPoint: typeof q.keyPoint==="string"&&q.keyPoint.trim()?q.keyPoint:q.rationale, source: typeof q.source === "string" && /^https:\/\//.test(q.source) ? q.source : "", origin: typeof q.origin==="string"&&q.origin.trim()?q.origin:"Imported by you", ...(collection==="supplemental"?{collection}:{}),...(rationaleScope==="shared"?{rationaleScope}:{}),...(typeof sourceId==="string"?{sourceId}:{}),...(typeof sourceTopic==="string"?{sourceTopic}:{}),...(format==="concept"||format==="comparison"||format==="situational"?{format}:{}),...(typeof conceptId==="string"?{conceptId}:{}),...(typeof caseId==="string"?{caseId}:{}),...(typeof clinicalObjective==="string"?{clinicalObjective}:{}),...(retired===true?{retired:true}:{}) };
  });
}
export function normalizeQuestionStem(text:string){return text.normalize("NFKC").toLowerCase().replace(/[\p{P}\p{S}]/gu," ").replace(/\s+/g," ").trim();}
