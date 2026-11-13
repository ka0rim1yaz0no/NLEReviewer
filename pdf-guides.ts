import type { Question, ClinicalCase } from './types.ts';
import type { CurriculumTopic } from './curriculum.ts';
import { questionsForTopic } from './curriculum.ts';
import { isSituational } from './collections.ts';
import { reasoningSummaries } from './reference-guide-summaries.ts';
import { referenceLabel } from './study-references.ts';
import { answerExplanation, unsafeDecision } from './rationale-display.ts';
import { distinctQuestionSet, questionFamily } from './question-selection.ts';

export type GuideSection={title:string;scenario:string;summary?:string;points:{text:string;reference:number;avoid:boolean;questionId:string;objective:string}[]};
export type GuideQuestion={id:string;stem:string;correctIndex:number;objective:string;options:{text:string;rationale:string;references:number[]}[]};
export type TopicGuide={title:string;subject:string;slug:string;questionCount:number;sections:GuideSection[];practice:GuideQuestion[];references:string[];referenceLabels:string[];blueprintReference:number};
export const pdfReferenceAliases:Record<string,string>={
 'https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf':'https://glasgowcomascale.org/downloads/GCS-Assessment-Aid-English.pdf?v=3'
};
const objectives:Record<string,string>={recognition:'Focused assessment',action:'Priority nursing action',teaching:'Patient teaching',safety:'Safe nursing action',planning:'Expected outcome',evaluation:'Evaluation',reasoning:'Clinical reasoning',decision:'Best decision'};
const prcBlueprint='https://www.prc.gov.ph/sites/default/files/2025-16%20annex%20A%20nurse.pdf';
function guideCaseId(q:Question){return q.caseId||q.id.match(/^(CROSS|NP[1-5])-\d{3}/)?.[0]||q.id;}
function guideObjective(q:Question){
 const legacyKind=q.id.match(/^(?:CROSS|NP[1-5])-\d{3}-([1-5])$/)?.[1];
 return unsafeDecision(q)?'Unsafe proposal':objectives[q.clinicalObjective||'']||(legacyKind?['Focused assessment','Priority nursing action','Patient teaching','Expected outcome'][Number(legacyKind)-1]:'Clinical judgment');
}
function sharedScenario(group:Question[]){
 const firstParagraph=group[0].stem.split('\n\n')[0];
 if(group.length===1||group.every(q=>q.stem.startsWith(firstParagraph+'\n\n')))return firstParagraph;
 let prefix=group[0].stem;
 for(const q of group.slice(1)){let i=0;while(i<prefix.length&&prefix[i]===q.stem[i])i++;prefix=prefix.slice(0,i);}
 // Strip a partially matched prompt word while preserving the shared vignette.
 return prefix.replace(/\S*$/,'').trim()||group[0].stem.split('\n\n')[0];
}
function sentence(value:string){return /[.!?]$/.test(value)?value:value+'.';}
function practiceQuestions(topic:CurriculumTopic,questions:Question[]){
 const exact=(q:Question)=>q.subject===topic.subject&&(q.topic===topic.name||q.topic===topic.slug);
 const priority=(q:Question)=>Number(exact(q))*4+Number(questionFamily(q)===q.id)*2+Number(q.difficulty==='challenge');
 const ranked=[...questions].sort((a,b)=>priority(b)-priority(a));
 const chosen:Question[]=[];
 for(const q of ranked){
  if(chosen.length===3)break;
  if(chosen.some(prior=>guideObjective(prior)===guideObjective(q)))continue;
  if(distinctQuestionSet([q],true,chosen).length)chosen.push(q);
 }
 return [...chosen,...distinctQuestionSet(ranked,true,chosen).slice(0,3-chosen.length)];
}
export function makeTopicGuide(topic:CurriculumTopic,bank:readonly Question[],cases:readonly ClinicalCase[]):TopicGuide{
 const questions=questionsForTopic(topic,bank).filter(isSituational);
 const references:string[]=[],referenceLabels:string[]=[],sections=new Map<string,GuideSection>(),groups=new Map<string,Question[]>();
 for(const q of questions){const id=guideCaseId(q);groups.set(id,[...(groups.get(id)||[]),q]);}
 const legacy=new Map(cases.map((c,i)=>[`${c.subject}-${String(i+1).padStart(3,'0')}`,c]));
 function cite(url:string,heading?:string){
  const source=pdfReferenceAliases[url]||url;
  if(!/^https:\/\//i.test(source))throw new Error('A topic reference is unavailable.');
  const previous=references.indexOf(source);
  if(previous>=0)return previous+1;
  references.push(source);
  referenceLabels.push(heading||referenceLabel(source));
  return references.length;
 }
 for(const q of questions){
  const avoid=unsafeDecision(q);
  const answer=sentence((q.decisionSummary||q.options[q.correctIndex].text).trim());
  const objective=guideObjective(q);
  const caseId=guideCaseId(q);
  const context=legacy.get(caseId),group=groups.get(caseId)!;
  const priority=avoid?group.find(item=>item.clinicalObjective==='action')||bank.find(item=>item.id===caseId+'-2'):undefined;
  const safeAction=priority?.decisionSummary||priority?.options[priority.correctIndex].text.trim()||context?.facts[1]?.text;
  const actionAlreadyListed=priority&&group.some(item=>item.id===priority.id);
  const shortReason=q.clinicalObjective==='reasoning'&&q.caseId?reasoningSummaries[q.caseId.replace(/^SIT-/,'')]:undefined;
  const point=avoid?`Avoid: ${answer}${!actionAlreadyListed&&safeAction?` The appropriate response: ${sentence(safeAction)}`:''}`:shortReason||answer;
  if(!sections.has(caseId))sections.set(caseId,{
   title:context?.title||`Situation ${sections.size+1}`,
   scenario:q.stem.includes('\n\n')?sharedScenario(group):context?.scenario||sharedScenario(group),
   summary:q.difficulty==='challenge'?q.keyPoint:undefined,
   points:[]
  });
  const reference=cite(q.source,referenceLabel(q.source,q.sourceTopic));
  sections.get(caseId)!.points.push({text:point,reference,avoid,questionId:q.id,objective});
 }
 if(!sections.size)throw new Error('No situational study notes are available for this topic.');
 const practice=practiceQuestions(topic,questions).map(q=>({
  id:q.id,stem:q.stem,correctIndex:q.correctIndex,objective:guideObjective(q),
  options:q.options.map((option,index)=>({
   text:option.text,rationale:answerExplanation(q,index),
   references:[...new Set([option.source||q.source,option.contextSource,...(option.additionalSources||[]),
    ...(option.rationaleParts||[]).flatMap(part=>[part.source,part.caseSource])].filter((url):url is string=>!!url).map(url=>cite(url)))],
  })),
 }));
 const blueprintReference=cite(prcBlueprint,'PRC Enhanced Tables of Specifications for the Nurses Licensure Examination');
 return {title:topic.name,subject:topic.subject==='CROSS'?'Foundations & Fundamentals':topic.subject,slug:topic.slug,questionCount:questions.length,sections:[...sections.values()],practice,references,referenceLabels,blueprintReference};
}

// Standard PDF fonts cover the bank's Latin text. Preserve the meaning of
// mathematical minus signs while using portable ASCII dashes in the export.
export function pdfText(value:string){return value.normalize('NFC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');}
