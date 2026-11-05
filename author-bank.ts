import foundations from "./foundations.ts";
import community from "./community.ts";
import maternal from "./maternal.ts";
import medsurg from "./medsurg.ts";
import neuro from "./neuro.ts";
import mental from "./mental.ts";
import { additionalQuestions } from "./additional-questions.ts";
import siteQuestions from "./site-questions.json" with { type: "json" };
import supplemental from "./supplemental-questions.json" with { type: "json" };
import retirements from "./editorial-retirements.json" with {type:"json"};
import concepts from "./concept-questions.json" with { type: "json" };
import situations from "./situational-questions.json" with { type: "json" };
import legacyReferences from "./legacy-case-references.json" with { type: "json" };
import recheck from "./rationale-reference-corrections.json" with { type: "json" };
import type { ClinicalCase, Question, Subject } from "./types.ts";
import { subjects, shuffled, validateQuestions, installQuestionBank } from "./bank.ts";
import { applyReferenceRepairs } from "./reference-repairs.ts";
import { applyRepetitionReview } from "./repetition-review.ts";
export { subjects, shuffled, validateQuestions } from "./bank.ts";
type LegacyClarification={scenario?:string;source?:string;reasons?:Record<string,string>};
const legacyClarifications:Record<string,LegacyClarification>=recheck.legacy;
export const clinicalCases: ClinicalCase[] = [...foundations, ...community, ...maternal, ...medsurg, ...neuro, ...mental].map((c,index)=>{
 const id=`${c.subject}-${String(index+1).padStart(3,"0")}`,change=legacyClarifications[id];
 return {...c,scenario:change?.scenario??c.scenario,facts:c.facts.map((f,kind)=>({...f,reason:change?.reasons?.[kind]??f.reason}))};
});
const caseIds=new Map(clinicalCases.map((c,index)=>[c,`${c.subject}-${String(index+1).padStart(3,"0")}`]));
const caseSource=(c:ClinicalCase)=>legacyClarifications[caseIds.get(c)!]?.source??(legacyReferences as Record<string,string>)[caseIds.get(c)!];
const prompts = [
  "Which assessment finding is most directly associated with this situation?",
  "Which nursing action best addresses the immediate care need in this situation?",
  "Which patient or caregiver teaching point is most appropriate?",
  "Which result most directly shows that the care goal has been met?",
  "Which statement about care in this situation requires correction?",
];
function legacyRationale(entry:ClinicalCase,kind:number){
 const fact=entry.facts[kind],finding=entry.facts[0],response=entry.facts[1];
 if(kind===4)return `This proposed statement requires correction. ${fact.reason} The appropriate care response is: ${response.text}. ${response.reason}`;
 if(kind===0||kind===3)return `${fact.reason} The relevant care response is: ${response.text}. ${response.reason}`;
 return `${fact.reason} The focused assessment context is: ${finding.text}. ${finding.reason}`;
}
export const originalQuestions: Question[] = clinicalCases.flatMap((entry, index) => entry.facts.map((fact, kind) => {
  const peers = shuffled(clinicalCases.filter(c => c.subject === entry.subject && c.title !== entry.title && c.facts[kind].text !== fact.text), (index + 17) * (kind + 53));
  const distractors = kind === 4
    ? [entry.facts[1], entry.facts[2], entry.facts[3]].map((f,i) => ({ text: f.text, rationale: `This is an appropriate statement, so it does not require correction. ${legacyRationale(entry,i+1)}`,source:caseSource(entry),referenceId:caseIds.get(entry)+":safe-plan" }))
    : peers.slice(0, 3).map(c => ({ text: c.facts[kind].text, rationale: `This choice is relevant to ${c.title.toLowerCase()}. Its clinical context is: ${c.scenario} ${c.facts[kind].reason} The question here concerns ${entry.title.toLowerCase()}: ${entry.scenario} ${fact.reason} This alternative does not best address the specific finding, care need, or outcome asked about in the present case.`,source:caseSource(c),contextSource:caseSource(entry),referenceId:caseIds.get(c)+":"+kind }));
  const rationale=legacyRationale(entry,kind);
  const correct = { text: fact.text, rationale,source:caseSource(entry),referenceId:caseIds.get(entry)+":"+kind };
  const options = shuffled([correct, ...distractors], index * 47 + kind * 97 + 5);
  return { id: `${entry.subject}-${String(index + 1).padStart(3, "0")}-${kind + 1}`, subject: entry.subject, topic: entry.topic, stem: `${entry.scenario} ${prompts[kind]}`, options, correctIndex: options.indexOf(correct), rationale, keyPoint: `${entry.title}: ${fact.text}. ${fact.reason}`, source: caseSource(entry), origin: "Original educational scenario; not copied from BoardPal or an official PNLE paper." };
}));
export const supplementalQuestions = validateQuestions(supplemental);
export const conceptQuestions = validateQuestions(concepts).map(q=>retirements.some(r=>r.id===q.id)?{...q,retired:true}:q);
export const situationalQuestions = validateQuestions(situations);
// Earlier question IDs, positions, and keys stay stable. The audited context
// clarifications and more specific reference links are documented separately.
export const questions: Question[] = applyRepetitionReview(applyReferenceRepairs([...originalQuestions, ...additionalQuestions, ...supplementalQuestions, ...conceptQuestions, ...(siteQuestions.length ? validateQuestions(siteQuestions) : []), ...situationalQuestions]));
export const activeQuestions=questions.filter(q=>!q.retired);
export const questionMap = new Map(questions.map(q => [q.id, q]));
export const topics = subjects.flatMap(subject => [...new Set(activeQuestions.filter(q => q.subject === subject.id).map(q => q.topic))].map(name => ({ id: `${subject.id}:${name}`, name, subject: subject.id, count: activeQuestions.filter(q => q.subject === subject.id && q.topic === name).length })));

installQuestionBank(questions,clinicalCases);
