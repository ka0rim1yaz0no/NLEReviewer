import type { Question, ClinicalCase } from './types.ts';
import type { CurriculumTopic } from './curriculum.ts';
import { questionsForTopic } from './curriculum.ts';
import { isSituational } from './collections.ts';

export type GuideSection={title:string;scenario:string;summary?:string;points:{text:string;reference:number;avoid:boolean;questionId:string;objective:string}[]};
export type TopicGuide={title:string;subject:string;slug:string;questionCount:number;sections:GuideSection[];references:string[];referenceLabels:string[]};
export const pdfReferenceAliases:Record<string,string>={
 'https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf':'https://glasgowcomascale.org/downloads/GCS-Assessment-Aid-English.pdf?v=3'
};
const objectives:Record<string,string>={recognition:'Focused assessment',action:'Priority nursing action',teaching:'Patient teaching',safety:'Unsafe proposal',planning:'Expected outcome',evaluation:'Evaluation',reasoning:'Clinical reasoning',decision:'Best decision'};
function guideCaseId(q:Question){return q.caseId||q.id.match(/^(CROSS|NP[1-5])-\d{3}/)?.[0]||q.id;}
function sharedScenario(group:Question[]){
 const firstParagraph=group[0].stem.split('\n\n')[0];
 if(group.length===1||group.every(q=>q.stem.startsWith(firstParagraph+'\n\n')))return firstParagraph;
 let prefix=group[0].stem;
 for(const q of group.slice(1)){let i=0;while(i<prefix.length&&prefix[i]===q.stem[i])i++;prefix=prefix.slice(0,i);}
 // Strip a partially matched prompt word while preserving the shared vignette.
 return prefix.replace(/\S*$/,'').trim()||group[0].stem.split('\n\n')[0];
}
function sentence(value:string){return /[.!?]$/.test(value)?value:value+'.';}
export function makeTopicGuide(topic:CurriculumTopic,bank:readonly Question[],cases:readonly ClinicalCase[]):TopicGuide{
 const questions=questionsForTopic(topic,bank).filter(isSituational);
 const references:string[]=[],referenceLabels:string[]=[],sections=new Map<string,GuideSection>(),groups=new Map<string,Question[]>();
 for(const q of questions){const id=guideCaseId(q);groups.set(id,[...(groups.get(id)||[]),q]);}
 const legacy=new Map(cases.map((c,i)=>[`${c.subject}-${String(i+1).padStart(3,'0')}`,c]));
 for(const q of questions){
  const avoid=/^(CROSS|NP[1-5])-\d{3}-5$/.test(q.id)||(q.id.startsWith('SIT-')&&q.clinicalObjective==='safety');
  const answer=sentence(q.options[q.correctIndex].text.trim());
  const legacyKind=q.id.match(/^(?:CROSS|NP[1-5])-\d{3}-([1-5])$/)?.[1];
  const objective=objectives[q.clinicalObjective||'']||(legacyKind?['Focused assessment','Priority nursing action','Patient teaching','Expected outcome','Unsafe proposal'][Number(legacyKind)-1]:'Question review');
  const caseId=guideCaseId(q);
  const context=legacy.get(caseId),group=groups.get(caseId)!;
  const priority=avoid?group.find(item=>item.clinicalObjective==='action')||bank.find(item=>item.id===caseId+'-2'):undefined;
  const safeAction=priority?.options[priority.correctIndex].text.trim()||context?.facts[1]?.text;
  const point=avoid?`Avoid: ${answer} ${safeAction?`The appropriate response: ${sentence(safeAction)}`:q.rationale}`:answer;
  if(!sections.has(caseId))sections.set(caseId,{
   title:context?.title||`Situation ${sections.size+1}`,
   scenario:q.stem.includes('\n\n')?sharedScenario(group):context?.scenario||sharedScenario(group),
   summary:q.difficulty==='challenge'?q.keyPoint:undefined,
   points:[]
  });
  const source=pdfReferenceAliases[q.source]||q.source;
  if(!/^https:\/\//i.test(source))throw new Error('A topic reference is unavailable.');
  if(!references.includes(source)){
   references.push(source);
   referenceLabels.push(q.sourceTopic||new URL(source).hostname.replace(/^www\./,''));
  }
  sections.get(caseId)!.points.push({text:point,reference:references.indexOf(source)+1,avoid,questionId:q.id,objective});
 }
 if(!sections.size)throw new Error('No situational study notes are available for this topic.');
 return {title:topic.name,subject:topic.subject==='CROSS'?'Foundations & Fundamentals':topic.subject,slug:topic.slug,questionCount:questions.length,sections:[...sections.values()],references,referenceLabels};
}

// Standard PDF fonts cover the bank's Latin text. Preserve the meaning of
// mathematical minus signs while using portable ASCII dashes in the export.
export function pdfText(value:string){return value.normalize('NFC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');}
