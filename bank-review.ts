import {validateQuestions} from './bank.ts';
import {bankReviews} from './bank-review-data.ts';
import {isSituational} from './collections.ts';
import type {Question} from './types.ts';

export function applyBankReview(bank:Question[]):Question[]{
 const byId=new Map(bank.map(q=>[q.id,q]));
 const revised=new Map<string,Question>();
 for(const {id,source,scenario,prompt,choices,studyNote,subject,topic} of bankReviews){
  const prior=byId.get(id);
  if(!prior||prior.retired||revised.has(id)||!prompt.endsWith('?'))throw new Error('Invalid question review for '+id);
  const wasSituational=isSituational(prior);
  if(!wasSituational&&!scenario)throw new Error('A new clinical case needs a scenario for '+id);
  if(scenario&&prior.caseId&&prior.caseId!==id)throw new Error('A linked case cannot change the scenario of one item: '+id);
  const [key,...alternatives]=choices;
  alternatives.splice(prior.correctIndex,0,key);
  const options=alternatives.map(([text,rationale],index)=>({text,rationale,source,referenceId:id+':bank-review-'+(index+1)}));
  const {conceptId,sourceId,sourceTopic,rationaleScope,unsafeAnswer,...question}=prior;
  revised.set(id,{
   ...question,subject:subject??prior.subject,topic:topic??prior.topic,
   stem:(scenario??prior.stem.split('\n\n')[0])+'\n\n'+prompt,
   options,rationale:key[1],keyPoint:studyNote,source,
   ...!wasSituational&&{format:'situational',caseId:id,clinicalObjective:'decision',origin:'Original NLEReviewer clinical practice'},
   difficulty:'challenge',questionRevision:4,
  });
 }
 return validateQuestions(bank.map(q=>revised.get(q.id)??q));
}
