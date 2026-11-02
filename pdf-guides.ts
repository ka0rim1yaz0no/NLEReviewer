import type { Question, ClinicalCase } from './types.ts';
import type { CurriculumTopic } from './curriculum.ts';
import { questionsForTopic } from './curriculum.ts';
import { isSituational } from './collections.ts';

export type GuideSection={title:string;scenario:string;points:{text:string;reference:number;avoid:boolean}[]};
export type TopicGuide={title:string;subject:string;slug:string;questionCount:number;sections:GuideSection[];references:string[]};
export const pdfReferenceAliases:Record<string,string>={
 'https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf':'https://glasgowcomascale.org/downloads/GCS-Assessment-Aid-English.pdf?v=3'
};
export function makeTopicGuide(topic:CurriculumTopic,bank:readonly Question[],cases:readonly ClinicalCase[]):TopicGuide{
 const questions=questionsForTopic(topic,bank).filter(isSituational);
 const references:string[]=[],sections=new Map<string,GuideSection>(),seen=new Set<string>();
 const legacy=new Map(cases.map((c,i)=>[`${c.subject}-${String(i+1).padStart(3,'0')}`,c]));
 for(const q of questions){
  const avoid=/^(CROSS|NP[1-5])-\d{3}-5$/.test(q.id)||(q.id.startsWith('SIT-')&&q.clinicalObjective==='safety');
  const unsafeChoice=q.options[q.correctIndex].text.trim();
  const body=(avoid?(q.rationale.startsWith(unsafeChoice)?q.rationale:`${unsafeChoice}. ${q.rationale}`):(q.keyPoint||q.rationale)).trim();
  const point=(avoid?'AVOID / REQUIRES CORRECTION: ':'')+body,normalized=point.toLowerCase().replace(/\s+/g,' ');
  if(!point||seen.has(normalized))continue;
  seen.add(normalized);
  const caseId=q.caseId||q.id.match(/^(CROSS|NP[1-5])-\d{3}/)?.[0]||q.id;
  const context=legacy.get(caseId);
  if(!sections.has(caseId))sections.set(caseId,{title:context?.title||`Situation ${sections.size+1}`,scenario:context?.scenario||q.stem.split('\n\n')[0],points:[]});
  const source=pdfReferenceAliases[q.source]||q.source;
  if(!/^https:\/\//i.test(source))throw new Error('A topic reference is unavailable.');
  if(!references.includes(source))references.push(source);
  sections.get(caseId)!.points.push({text:point,reference:references.indexOf(source)+1,avoid});
 }
 if(!sections.size)throw new Error('No situational study notes are available for this topic.');
 return {title:topic.name,subject:topic.subject==='CROSS'?'Foundations & Fundamentals':topic.subject,slug:topic.slug,questionCount:questions.length,sections:[...sections.values()],references};
}

// Standard PDF fonts cover the bank's Latin text. Preserve the meaning of
// mathematical minus signs while using portable ASCII dashes in the export.
export function pdfText(value:string){return value.normalize('NFC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');}
