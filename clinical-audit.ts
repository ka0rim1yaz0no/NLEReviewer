// Used only by the bank export and release pipeline.
import {auditCases} from './clinical-audit-data.ts';
import {validateQuestions} from './bank.ts';
import {isSituational} from './collections.ts';
import type {Question} from './types.ts';

// Direct publisher editions for links that intermittently return access errors.
// The same change reaches the answer, its peer distractors, and context links.
export const auditedReferenceUpdates:Record<string,string>={
 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000513':'https://www.ahajournals.org/doi/pdf/10.1161/STR.0000000000000513',
 'https://www.samhsa.gov/mental-health/trauma-violence/trauma-informed-approaches-programs':'https://library.samhsa.gov/sites/default/files/pep23-06-05-005.pdf',
 'https://www.ahrq.gov/health-literacy/improve/precautions/tool5.html':'https://www.ahrq.gov/sites/default/files/publications2/files/health-literacy-universal-precautions-toolkit-3rd-edition.pdf',
 'https://ro9.doh.gov.ph/agency-mandate-and-functions/':'https://ro2.doh.gov.ph/mandates/',
};
const currentSource=(url:string)=>auditedReferenceUpdates[url]||url;
function updateLinks(q:Question){
 const source=currentSource(q.source);
 if(source===q.source&&!q.options.some(o=>o.source&&currentSource(o.source)!==o.source||o.contextSource&&currentSource(o.contextSource)!==o.contextSource))return q;
 return {...q,source,options:q.options.map(o=>({...o,...o.source&&{source:currentSource(o.source)},...o.contextSource&&{contextSource:currentSource(o.contextSource)}}))};
}
export function applyClinicalAudit(base:Question[]){
 const bank=new Map(base.map(q=>[q.id,q]));
 const reviewed=new Map<string,Question>();
 for(const audit of auditCases)for(const [suffix,[prompt,answer,...alternatives]] of Object.entries(audit.items)){
  const id=audit.id+'-'+suffix,old=bank.get(id);
  if(!old||!isSituational(old)||reviewed.has(id)||!audit.review.trim())throw new Error('Invalid clinical audit entry: '+id);
  const choices=[...alternatives];
  choices.splice(old.correctIndex,0,answer);
  const options=choices.map(([text,rationale],i)=>({text,rationale,source:audit.source,referenceId:id+':audit-'+(i+1)}));
  reviewed.set(id,{...old,stem:audit.scenario+'\n\n'+prompt,options,rationale:answer[1],keyPoint:answer[1],source:audit.source,questionRevision:2});
 }
 const updated=validateQuestions([...reviewed.values()]);
 const byId=new Map(updated.map(q=>[q.id,q]));
 return base.map(q=>isSituational(q)?updateLinks(byId.get(q.id)||q):q);
}
