// Authoring only. Never import clinical blueprints into the public application.
import {createHash} from 'node:crypto';
import {shuffled,validateQuestions} from './bank.ts';
export const objectives=['recognition','action','teaching','safety','planning','evaluation','reasoning'];
const seed=s=>parseInt(createHash('sha256').update(s).digest('hex').slice(0,8),16);
const lower=s=>s.charAt(0).toLowerCase()+s.slice(1);
const finish=s=>/[.!?][”"']?$/.test(s)?s:s+'.';
function choice(c,field){
 if(field==='action')return `${c.problem}: ${c.action}`;
 if(field==='teaching')return `${c.teaching} — to address ${lower(c.problem)}`;
 if(field==='outcome')return `${c.outcome} — the goal for ${lower(c.problem)}`;
 return c[field];
}
function specifications(c){return [
 {key:'recognition',field:'problem',prompt:'Which concern should guide the nurse’s focused assessment and priorities?',text:c.problem,why:`The findings support ${lower(c.problem)}. ${finish(c.reason)}`},
 {key:'action',field:'action',prompt:'Which nursing action best addresses the immediate need described?',why:`${finish(c.action)} This addresses the identified problem in this situation. ${finish(c.reason)}`},
 {key:'teaching',field:'teaching',prompt:'Once immediate care needs are addressed, which teaching is most relevant for this client, family, or care team?',why:`${finish(c.teaching)} This teaching addresses the specific risk or care need described. ${finish(c.reason)}`},
 {key:'safety',field:'unsafe',prompt:'The nurse reviews the proposed care plan. Which proposed action requires correction?',why:`${finish(c.unsafe)} This would conflict with safe care for the identified problem. The appropriate response is to ${lower(c.action)}. ${finish(c.reason)}`},
 {key:'planning',field:'outcome',prompt:'Which outcome most directly addresses the priority problem in the nursing care plan?',why:`${finish(c.outcome)} This is the desired response to care for the problem described. ${finish(c.reason)}`},
 {key:'evaluation',field:'problem',prompt:`Following care, the nurse observes this change: ${finish(c.outcome)} Which evaluation is best supported by that information?`,text:`Progress toward the planned goal for ${lower(c.problem)}`,why:`The observed response is consistent with progress toward the planned goal: ${finish(c.outcome)} It supports continued focused evaluation; it does not establish that all future risk has disappeared. ${finish(c.reason)}`},
 {key:'reasoning',field:'reason',prompt:`The plan includes this response: ${finish(c.action)} Which explanation best connects that response to the findings in the situation?`,why:`This explanation links the observed findings to the selected response. ${finish(c.reason)}`}
];}
function safePlans(c){return [
 {text:c.action,rationale:`This plan does not require correction. This is an appropriate response to the presenting problem. ${finish(c.reason)}`},
 {text:`Provide the relevant teaching when immediate needs are addressed: ${c.teaching}`,rationale:`This plan does not require correction. Teaching at an appropriate time supports the care plan. ${finish(c.reason)}`},
 {text:`Reassess and document progress toward this outcome: ${c.outcome}`,rationale:'This plan does not require correction. Reassessment and accurate documentation help determine whether the chosen care is achieving its intended effect.'}
].map(o=>({...o,source:c.source,referenceId:c.id+':safe-plan'}));}
function alternative(c,p,spec){
 const use=spec.key==='evaluation'?'This would evaluate a different care goal':'This option fits a different clinical context';
 return {text:spec.key==='evaluation'?`Progress toward the planned goal for ${lower(p.problem)}`:choice(p,spec.field),rationale:`${use}: ${finish(p.scenario)} ${finish(p.reason)} Here, the priority is ${lower(c.problem)}. ${finish(c.reason)} The alternative does not best match the specific question and findings.`,source:p.source,...(p.source!==c.source?{contextSource:c.source}:{}),referenceId:p.id+':'+spec.field};
}
function peers(c,field,cases){
 const eligible=p=>p.id!==c.id&&p[field].toLowerCase()!==c[field].toLowerCase();
 const ordered=[...shuffled(cases.filter(p=>eligible(p)&&p.topicSlug===c.topicSlug),seed(c.id+field)),...shuffled(cases.filter(p=>eligible(p)&&p.subject===c.subject&&p.topicSlug!==c.topicSlug),seed(field+c.id))];
 const seen=new Set([c[field].toLowerCase()]);return ordered.filter(p=>{const key=p[field].toLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
}
export function renderSituation(c,cases,previous=[]){
 const map=new Map(cases.map(p=>[p.id,p]));
 const result=specifications(c).map(spec=>{
  const old=previous.find(q=>q.clinicalObjective===spec.key);
  const correct={text:spec.text??choice(c,spec.field),rationale:spec.why,source:c.source,referenceId:c.id+':'+spec.key};
  let options;
  if(old){
   // Preserve every published position, peer identity, and answer key. Corrections
   // change the wording/evidence in place; they never reshuffle saved responses.
   const safe=safePlans(c);
   options=old.options.map((o,index)=>{
    if(index===old.correctIndex)return correct;
    if(spec.key==='safety')return safe[o.text.startsWith('Provide the relevant teaching')?1:o.text.startsWith('Reassess and document')?2:0];
    const id=o.referenceId?.split(':')[0],p=map.get(id);if(!p)throw Error('Missing archived peer '+o.referenceId);return alternative(c,p,spec);
   });
  }else{
   const wrong=spec.key==='safety'?safePlans(c):peers(c,spec.field,cases).map(p=>alternative(c,p,spec));
   if(wrong.length!==3)throw Error('Three distinct alternatives required: '+c.id+' '+spec.key);
   options=shuffled(wrong,seed(c.id+spec.key));options.splice(seed('answer-position:'+c.id+':'+spec.key)%4,0,correct);
  }
  return {...old,id:c.id+'-'+spec.key,subject:c.subject,topic:c.topic,stem:c.scenario+'\n\n'+spec.prompt,options,correctIndex:old?.correctIndex??options.indexOf(correct),rationale:correct.rationale,keyPoint:`${c.problem}: ${finish(c.reason)} Priority response: ${finish(c.action)}`,source:c.source,origin:old?.origin??'Original fictional NLE Reviewer case, authored and source-checked during the November 2026 content audit. Not an official PNLE item. Independent clinician approval has not been completed.',format:'situational',caseId:c.id,clinicalObjective:spec.key};
 });
 return validateQuestions(result);
}
