import {questionFamily} from './question-selection.ts';
import {displayRationale,unsafeDecision} from './rationale-display.ts';
import {legacyCases} from './clinical-audit-legacy.mjs';
import {infectionCases} from './clinical-audit-infection.mjs';
import {emergencyCases} from './clinical-audit-emergency.mjs';
import {standaloneCases} from './clinical-audit-standalone.mjs';
import {challengeCases} from './clinical-audit-challenges.mjs';
import {maternalCases,maternalAlternatives} from './clinical-audit-maternal.mjs';
import {additionalDirectCases,legacyNeurologyCases,neurologyCases,neurologyAlternatives} from './clinical-audit-neurology.mjs';
import {medicationDirectCases,medicationLegacyCases,medicationCases,medicationAlternatives} from './clinical-audit-medication.mjs';
import {cardiacDirectCases,cardiacLegacyCases,cardiacCases,cardiacAlternatives} from './clinical-audit-cardiac.mjs';
import {respiratoryCases,respiratoryLegacyCases,respiratoryDirectCases,respiratoryAlternatives} from './clinical-audit-respiratory.mjs';
import {endocrineCases,endocrineLegacyCases,endocrineDirectCases} from './clinical-audit-endocrine.mjs';
import {renalCases,renalLegacyCases,renalDirectCases} from './clinical-audit-renal.mjs';
import {perioperativeCases,perioperativeLegacyCases,perioperativeDirectCases} from './clinical-audit-perioperative.mjs';
import {neuromuscularCases,neuromuscularDirectCases,neuromuscularAlternatives,earlierCaseCorrections} from './clinical-audit-neuromuscular.mjs';
import {alternativeDecisions} from './clinical-audit-alternatives.mjs';
import {references as ref} from './clinical-audit-references.mjs';

const cases={...infectionCases,...emergencyCases};
const legacyReviews={...legacyCases,...maternalCases};
const alternatives={...alternativeDecisions,...maternalAlternatives};
const clinicalReviews={
 12:{selected:{...cases,...legacyReviews,...standaloneCases,...challengeCases},cases,legacy:legacyReviews,alternatives},
 13:{
  selected:{...neurologyCases,...legacyNeurologyCases,...additionalDirectCases},
  cases:{...cases,...neurologyCases},
  legacy:{...legacyReviews,...legacyNeurologyCases},
  alternatives:{...alternatives,...neurologyAlternatives},
 },
 14:{
  selected:{...medicationCases,...medicationLegacyCases,...medicationDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives},
 },
 15:{
  selected:{...cardiacCases,...cardiacLegacyCases,...cardiacDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives},
 },
 16:{
  selected:{...respiratoryCases,...respiratoryLegacyCases,...respiratoryDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases,...respiratoryCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases,...respiratoryLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives,...respiratoryAlternatives},
 },
 17:{
  selected:{...endocrineCases,...endocrineLegacyCases,...endocrineDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases,...respiratoryCases,...endocrineCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases,...respiratoryLegacyCases,...endocrineLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives,...respiratoryAlternatives},
 },
 18:{
  selected:{...renalCases,...renalLegacyCases,...renalDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases,...respiratoryCases,...endocrineCases,...renalCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases,...respiratoryLegacyCases,...endocrineLegacyCases,...renalLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives,...respiratoryAlternatives},
 },
 19:{
  selected:{...perioperativeCases,...perioperativeLegacyCases,...perioperativeDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases,...respiratoryCases,...endocrineCases,...renalCases,...perioperativeCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases,...respiratoryLegacyCases,...endocrineLegacyCases,...renalLegacyCases,...perioperativeLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives,...respiratoryAlternatives},
 },
 20:{
  selected:{...neuromuscularCases,...neuromuscularDirectCases},
  cases:{...cases,...neurologyCases,...medicationCases,...cardiacCases,...respiratoryCases,...endocrineCases,...renalCases,...perioperativeCases,...neuromuscularCases},
  legacy:{...legacyReviews,...legacyNeurologyCases,...medicationLegacyCases,...cardiacLegacyCases,...respiratoryLegacyCases,...endocrineLegacyCases,...renalLegacyCases,...perioperativeLegacyCases},
  alternatives:{...alternatives,...neurologyAlternatives,...medicationAlternatives,...cardiacAlternatives,...respiratoryAlternatives,...neuromuscularAlternatives},
  corrections:earlierCaseCorrections,
 },
};
const roles={recognition:'assessment',problem:'assessment',action:'action',teaching:'teaching',planning:'outcome',outcome:'outcome',reason:'reasoning',reasoning:'reasoning',safety:'safety'};
const legacyQuestion=/^(?:CROSS|NP[1-5])-\d{3}-([1-5])$/;
const legacyRole=['assessment','action','teaching','outcome','safety'];
const legacyNumbers={assessment:1,action:2,teaching:3,outcome:4,safety:5};
const customReference=/^(?:audit|review)-\d+$/;

function evidence(value,source){
 if(!value)return;
 return typeof value==='string'?{rationale:value,source}:{rationale:value[0],source:value[1]??source};
}

function roleEvidence(family,role,review){
 const reviewed=review.cases[family];
 if(reviewed?.[role])return evidence(reviewed[role],reviewed.source);
 const alternative=family+':'+(role==='assessment'?'recognition':role);
 return evidence(review.alternatives[alternative]);
}

function optionText(text){
 return text?.replace(/^(?:Provide this instruction\. |Review this instruction at the appropriate time: |Reassess for this result: )/,'');
}

function baseDecision(item,slot,originals,review){
 const family=questionFamily(item),option=item.options[slot];
 const reviewed=review.cases[family],legacy=review.legacy[family];
 const refParts=option.referenceId?.split(':')??[];
 const [peer,rawRole]=refParts;
 const itemRole=item.clinicalObjective??item.id.split('-').at(-1);
 const legacyIndex=Number(item.id.match(legacyQuestion)?.[1]);
 const role=roles[rawRole]??roles[itemRole]??legacyRole[legacyIndex-1];
 const edit=legacy?.decisions[legacyIndex]?.[slot]??reviewed?.edits?.[itemRole]?.[slot];
 if(edit?.[1])return {text:edit[0],rationale:edit[1],source:edit[2]??reviewed?.source??legacy.source};
 const sameCase=peer===family||customReference.test(rawRole??'');
 let result;
 if(sameCase){
  // Audit-specific records can have arbitrary alternatives in the current
  // case. A per-role rationale only describes the original correct decision.
  if(!customReference.test(rawRole??'')||slot===item.correctIndex){
   result=roleEvidence(family,role,review);
  }
 }else{
  result=roleEvidence(peer,role,review);
  const peerNumber=legacyNumbers[role],peerLegacy=review.legacy[peer];
  if(!result&&peerLegacy){
   const peerItem=originals.get(peer+'-'+peerNumber);
   const peerKey=peerItem&&peerLegacy.decisions[peerNumber]?.[peerItem.correctIndex];
   result=peerKey&&{rationale:peerKey[1],source:peerKey[2]??peerLegacy.source};
  }
 }
 return result?{...result,text:edit?.[0],otherCase:!sameCase}:undefined;
}

function contextualFeedback(item,slot,verdict,prior,originals,review){
 const family=questionFamily(item);
 const current=review.cases[family]??review.legacy[family];
 const detail=baseDecision(item,slot,originals,review);
 const source=detail?.source??prior.source??item.source;
 let rationale=detail?.rationale??prior.rationale;
 if(verdict==='incorrect'&&current&&(detail?.otherCase||!detail)){
  const key=baseDecision(item,item.correctIndex,originals,review);
  const caseReason=key?.rationale??displayRationale(item.rationale);
  const principle=displayRationale(rationale.split(/\n(?:Case reasoning:|In this case,)/)[0]);
  rationale=principle+'\nIn this case, '+caseReason[0].toLowerCase()+caseReason.slice(1);
 }
 const caseSource=verdict==='incorrect'&&(detail?.otherCase||!detail)
  ?current?.source??prior.caseSource
  :undefined;
 return {text:detail?.text,rationale,source,caseSource:caseSource===source?undefined:caseSource};
}

function reviewPairedChoice(question,option,originals,review){
 const [id,kind,a,companion,b]=option.referenceId?.split(':')??[];
 if(kind!=='paired')throw Error('Expected linked case for '+question.id);
 const decisions=[[id,Number(a)],[companion,Number(b)]];
 const lines=option.text.split('\n'),rationales=option.rationale.split('\n\n');
 const reviewed=option.rationaleParts.map((part,index)=>{
  const [base,slot]=decisions[index],item=originals.get(base);
  if(!item)throw Error('Missing original case for '+question.id);
  return contextualFeedback(item,slot,part.verdict,{rationale:rationales[index],source:part.source??option.source,caseSource:part.caseSource},originals,review);
 });
 const rationaleParts=option.rationaleParts.map((part,index)=>{
  const {source,caseSource}=reviewed[index];
  return {label:part.label,verdict:part.verdict,source,caseSource};
 });
 const [source,contextSource,...additionalSources]=[...new Set(rationaleParts.flatMap(p=>[p.source,p.caseSource]).filter(Boolean))];
 return {...option,source,contextSource,additionalSources,rationaleParts,
  text:lines.map((line,index)=>reviewed[index].text?option.rationaleParts[index].label+' — '+reviewed[index].text:line).join('\n'),
  rationale:reviewed.map(part=>part.rationale).join('\n\n')};
}

function reviewFollowUp(question,option,index,reviewed,originals,review){
 if(reviewed.evaluation){
  return {...option,rationale:reviewed.evaluation[index],source:ref.process,contextSource:reviewed.source};
 }
 const prompt=question.stem.split('\n\n').at(-1);
 const recorded=prompt.startsWith('At the first follow-up');
 if(!recorded&&!prompt.startsWith('The handoff documents this intervention:'))throw Error('Unknown follow-up format for '+question.id);
 const target=evidence(reviewed.outcome,reviewed.source);
 let rationale;
 if(index===question.correctIndex){
  rationale=(recorded?'The handoff confirms the first finding. ':'The handoff confirms the intervention, and the outcome still needs assessment. ')+reviewed.followUp;
 }else if(/^(?:Transfer follow-up|Document the intervention and reassess) /.test(option.text)){
  rationale=reviewed.alternate;
  if(!rationale){
   const plan=originals.get(question.id.replace(/-evaluation$/,'-planning'));
   const alternate=plan.options.find(o=>option.text.includes(optionText(o.text)));
   const [peer]=alternate?.referenceId?.split(':')??[];
   rationale=(roleEvidence(peer,'outcome',review)?.rationale??displayRationale(option.rationale.split('Case reasoning:')[0]))
    +' The current follow-up instead checks whether the intervention addressed the findings that led to this plan.';
  }
 }else if(option.text.startsWith('Record the intervention alone:')){
  rationale='Record the intervention when it is performed. This handoff also includes an outcome finding. Document that evidence and continue the planned reassessment. '+target.rationale;
 }else if(option.text.startsWith('Sign off the planned follow-up')){
  rationale='Consider closing a goal once the required outcome and stability are confirmed. This is an initial check, and the next observation is still scheduled. '+target.rationale;
 }else if(option.text.startsWith('Record this outcome as achieved')){
  rationale='The outcome can be marked achieved once it is observed. Completing the intervention alone does not show that the intended result occurred. '+target.rationale;
 }else{
  rationale='Mark a goal unmet when assessment shows the required result failed. This handoff lacks a reassessment, so record the result as undetermined and obtain the needed findings.';
 }
 return {...option,rationale,source:ref.process,contextSource:target.source};
}

function reviewSingleChoice(question,index,reviewed,originals,review){
 const option=question.options[index];
 if(reviewed.reasons)return {...option,text:reviewed.choices?.[index]??option.text,rationale:reviewed.reasons[index],source:reviewed.choiceSources?.[index]??reviewed.source,contextSource:undefined,additionalSources:undefined};
 if(question.clinicalObjective==='evaluation')return reviewFollowUp(question,option,index,reviewed,originals,review);
 const original=originals.get(question.id);
 const actual=original?.options[index];
 if(!actual||actual.referenceId!==option.referenceId)throw Error('Reordered source decisions for '+question.id);
 const key=index===question.correctIndex,unsafe=unsafeDecision(question);
 const part=contextualFeedback(original,index,unsafe?key?'needs-correction':'appropriate':key?'supported':'incorrect',
  {rationale:option.rationale,source:option.source,caseSource:option.contextSource},originals,review);
 return {...option,text:part.text??option.text,rationale:part.rationale,source:part.source,contextSource:part.caseSource,additionalSources:undefined};
}

export function reviewClinicalCases(question,originals,revision){
 const review=clinicalReviews[revision];
 const correction=review.corrections?.[question.id];
 if(question.retired||question.conceptId||(!correction&&question.questionRevision>=10))return question;
 const family=questionFamily(question);
 const reviewed=correction??review.selected[question.id]??review.selected[family];
 if(!reviewed)return question;
 const options=question.options.map((option,index)=>option.rationaleParts
  ?reviewPairedChoice(question,option,originals,review)
  :reviewSingleChoice(question,index,reviewed,originals,review));
 const stem=reviewed.scenario?question.stem.replace(/^[\s\S]*?\n\n/,reviewed.scenario+'\n\n'):question.stem;
 const answer=options[question.correctIndex];
 const keyPoint=reviewed.keyPoint??evidence(reviewed.reasoning,reviewed.source)?.rationale??question.keyPoint;
 const decisionSummary=question.decisionSummary&&question.clinicalObjective!=='evaluation'
  ?answer.text.split('\n')[0].replace(/^[^—]+ — /,''):question.decisionSummary;
 return {...question,stem,source:reviewed.source,options,rationale:answer.rationale,keyPoint,decisionSummary,questionRevision:revision};
}
