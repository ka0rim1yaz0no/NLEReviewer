// Authoring pipeline only. Preserve previously published keys and record
// exactly which question wording must be archived for older study sessions.
import {choiceReviewCases} from './choice-review-data.ts';
import {validateQuestions} from './bank.ts';
import {isSituational} from './collections.ts';
import type {Question} from './types.ts';

export const choiceReferenceUpdates:Record<string,string>={
 'https://www.ahrq.gov/patient-safety/settings/hospital/fall-prevention/toolkit/measure-program.html':'https://www.ahrq.gov/sites/default/files/publications2/files/fallpxtoolkit-update.pdf',
};
function refreshReference(q:Question){
 const checked=(url:string)=>choiceReferenceUpdates[url]||url;
 const source=checked(q.source);
 if(source===q.source&&!q.options.some(o=>(o.source&&checked(o.source)!==o.source)||(o.contextSource&&checked(o.contextSource)!==o.contextSource)))return q;
 return {...q,source,options:q.options.map(o=>({...o,...o.source&&{source:checked(o.source)},...o.contextSource&&{contextSource:checked(o.contextSource)}}))};
}
export function applyChoiceReview(base:Question[]){
 const oldById=new Map(base.map(q=>[q.id,q]));
 const changes=new Map<string,Question>();
 for(const group of choiceReviewCases)for(const [suffix,[prompt,key,...alternatives]] of Object.entries(group.items)){
  const id=group.id+'-'+suffix,old=oldById.get(id);
  if(!old||!isSituational(old)||changes.has(id)||!group.review||!prompt.endsWith('?'))throw Error('Invalid choice review: '+id);
  const ordered=[...alternatives];
  ordered.splice(old.correctIndex,0,key);
  const options=ordered.map(([text,rationale],i)=>({text,rationale,source:group.source,referenceId:id+':review-'+(i+1)}));
  changes.set(id,{...old,stem:group.scenario+'\n\n'+prompt,options,rationale:key[1],keyPoint:key[1],source:group.source,questionRevision:3});
 }
 const validated=new Map(validateQuestions([...changes.values()]).map(q=>[q.id,q]));
 return base.map(q=>isSituational(q)?refreshReference(validated.get(q.id)||q):q);
}
