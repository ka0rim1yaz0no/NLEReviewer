import {questionFamily} from './question-selection.ts';
import {displayRationale} from './rationale-display.ts';
import {decisions} from './clinical-case-paired.mjs';
import {standaloneCases} from './clinical-case-standalone.mjs';
import {reviewedCases} from './clinical-case-situational.mjs';
import {choiceEdits,legacySources,restoredCues,targetedReasons,updatedKeyPoints,updatedPrompts,updatedScenarios} from './clinical-case-corrections.mjs';

const stageNames=['recognition','action','teaching','outcome','safety'];
const stageAliases={problem:'recognition',planning:'outcome',reason:'reasoning'};
const labels={recognition:'Assessment',action:'Action',teaching:'Teaching',outcome:'Expected outcome',reasoning:'Explanation',safety:'Proposal to question'};

function caseSource(family){
 return reviewedCases[family]?.source??legacySources[family];
}

function decisionReference(item,slot){
 const [family,stage]=item.options[slot].referenceId?.split(':')??[];
 if(stage&&!/^(audit|review)-\d+$/.test(stage))return [family,stageAliases[stage]??stage];
 const objective=item.clinicalObjective??stageNames[Number(item.id.at(-1))-1];
 return [questionFamily(item),stageAliases[objective]??objective];
}

function withSource(value,source){
 if(!value)return;
 return Array.isArray(value)?value:[value,source];
}

function editedDecision(item,slot){
 const family=questionFamily(item),option=item.options[slot];
 const [referenceFamily,stage]=decisionReference(item,slot);
 const edit=choiceEdits[item.id]?.[slot];
 const explicit=edit?.[1]??targetedReasons[item.id]?.[slot]??decisions[item.id]?.[slot];
 const isPeer=family!==referenceFamily;
 const auditedAlternative=family===referenceFamily&&slot!==item.correctIndex&&/:(audit|review)-\d+$/.test(option.referenceId??'');
 const caseReason=auditedAlternative?undefined:reviewedCases[referenceFamily]?.[stage];
 const authored=withSource(explicit,edit?.[2]??caseSource(family))
  ??withSource(caseReason,caseSource(referenceFamily));
 const source=authored?.[1]??caseSource(referenceFamily);
 if(!authored&&!source&&!edit)return;
 return {
  text:edit?.[0],reason:authored?.[0],source:source??option.source??item.source,
  // An explicitly rewritten alternative already explains its fit here.
  needsContext:isPeer&&!explicit&&Boolean(authored),
  stage,
 };
}

function plainRationale(reason){
 return displayRationale(reason).replace(/\s+The cue to act on here is [^.!?]+[.!?]$/,'');
}

function augmentDecision(decision,base,priorReason,part){
 if(!decision)return {reason:priorReason,part};
 let reason=decision.reason??priorReason;
 const family=questionFamily(base);
 const source=decision.source??part.source;
 const caseReference=caseSource(family)??part.caseSource;
 if(decision.needsContext&&part.verdict==='incorrect'){
  const key=editedDecision(base,base.correctIndex);
  const caseReason=key?.reason??plainRationale(base.options[base.correctIndex].rationale);
  if(caseReason!==reason)reason+='\nIn this case, '+caseReason[0].toLowerCase()+caseReason.slice(1);
 }
 return {reason,part:{label:part.label,verdict:part.verdict,source,
  ...(caseReference&&caseReference!==source&&part.verdict==='incorrect'&&{caseSource:caseReference}),
 }};
}

function reviewPair(question,option,originals){
 const [id,kind,first,peerId,second]=option.referenceId?.split(':')??[];
 if(kind!=='paired'||!option.rationaleParts)return option;
 const baseItems=[originals.get(id),originals.get(peerId)];
 if(baseItems.some(item=>!item))throw Error('Missing case decision for '+question.id);
 const slots=[Number(first),Number(second)];
 const parts=baseItems.map((base,index)=>editedDecision(base,slots[index]));
 if(parts.every(part=>!part))return option;
 const reasons=option.rationale.split('\n\n');
 const feedback=parts.map((part,index)=>{
  const original=option.rationaleParts[index];
  return augmentDecision(part,baseItems[index],reasons[index],{...original,source:original.source??option.source??question.source});
 });
 const lines=option.text.split('\n');
 const text=parts.map((part,index)=>{
  const nextAction=baseItems[index].id==='NP4-081-4'&&lines[index].startsWith(labels.outcome+' — ');
  const originalLabel=option.rationaleParts[index].label;
  const label=nextAction?'Next action':originalLabel;
  feedback[index].part={...feedback[index].part,label};
  if(part?.text)return label+' — '+part.text;
  return nextAction?lines[index].replace(/^Expected outcome/,label):lines[index];
 }).join('\n');
 const [source,contextSource,...additionalSources]=[...new Set(feedback.flatMap(({part})=>[part.source,part.caseSource]).filter(Boolean))];
 return {
  ...option,text,rationale:feedback.map(value=>value.reason).join('\n\n'),
  source:source??option.source,contextSource,additionalSources,
  rationaleParts:feedback.map(value=>value.part),
 };
}

function reviewDirect(question,option,index,original,standalone){
 if(standalone){
  const [reason,source]=withSource(standalone[1][index],standalone[0]);
  return {...option,rationale:reason,source,contextSource:undefined,additionalSources:undefined};
 }
 if(!original||original.options[index]?.referenceId!==option.referenceId||question.clinicalObjective==='evaluation')return option;
 const decision=editedDecision(original,index);
 if(!decision)return option;
 const {reason,part}=augmentDecision(decision,original,option.rationale,{
  verdict:index===question.correctIndex?'supported':'incorrect',
  source:option.source,caseSource:option.contextSource,
 });
 return {...option,text:decision.text??option.text,rationale:reason,source:part.source,contextSource:part.caseSource};
}

export function continueClinicalCaseReview(question,originals){
 if(question.retired||question.conceptId)return question;
 const family=questionFamily(question),standalone=standaloneCases[question.id],original=originals.get(question.id);
 const options=question.options.map((option,index)=>option.rationaleParts
  ?reviewPair(question,option,originals)
  :reviewDirect(question,option,index,original,standalone));
 const [intro,...prompts]=question.stem.split('\n\n');
 const singleCase=options[question.correctIndex].rationaleParts&&intro!=='First situation'&&!intro.startsWith('First situation\n');
 const cue=restoredCues[question.id];
 const scenario=singleCase?[updatedScenarios[family]??intro,cue].filter(Boolean).join(' '):intro;
 const stem=[scenario,...(updatedPrompts[question.id]?[updatedPrompts[question.id]]:prompts)].join('\n\n');
 if(stem===question.stem&&options.every((option,index)=>option===question.options[index]))return question;
 const correct=options[question.correctIndex];
 // The source shown under the case describes the actual condition, while
 // each decision carries its own citation.
 const source=standalone?.[0]??caseSource(family)??question.source;
 const keyPoint=updatedKeyPoints[family]??question.keyPoint;
 const revisedSummary=question.decisionSummary&&correct.text.split('\n')[0].replace(/^[^—]+ — /,'');
 return {...question,options,stem,source,keyPoint,rationale:correct.rationale,questionRevision:10,
  ...(revisedSummary&&{decisionSummary:revisedSummary})};
}
