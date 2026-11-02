// Authoring-only audit. Does not retrieve or change student records.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {questions,originalQuestions,clinicalCases} from './author-bank.ts';
import {isSituational} from './collections.ts';
import {normalizeQuestionStem,validateQuestions} from './bank.ts';
const selected=questions.filter(isSituational);
validateQuestions(selected);
const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')).filter(c=>!c.retired);
const cases=[...clinicalCases.map((c,i)=>({id:`${c.subject}-${String(i+1).padStart(3,'0')}`,subject:c.subject,topic:c.topic,title:c.title,scenario:c.scenario,facts:c.facts,questionIds:originalQuestions.slice(i*5,i*5+5).map(q=>q.id),kind:'five-part'})),...evidence.map(c=>({...c,questionIds:selected.filter(q=>q.caseId===c.id).map(q=>q.id),kind:'seven-part'}))];
const issues=[],seen=new Map();
for(const q of selected){
 const key=normalizeQuestionStem(q.stem);if(seen.has(key))issues.push({kind:'duplicate-stem',ids:[seen.get(key),q.id]});seen.set(key,q.id);
 if(q.options[q.correctIndex].rationale!==q.rationale)issues.push({kind:'key-rationale-disagreement',id:q.id});
 if(q.options.some(o=>o.rationale.length<20)||!q.source)issues.push({kind:'incomplete-explanation-or-source',id:q.id});
}
const report={questionCount:selected.length,caseSetCount:cases.length,exactRepeatedStems:issues.filter(i=>i.kind==='duplicate-stem').length,structuralIssues:issues,note:'Structural consistency and duplicate screening are only one part of clinical/editorial review. Linked questions with different clinical objectives intentionally share their case vignette.'};
await mkdir(new URL('./outputs/situational-audit/',import.meta.url),{recursive:true});
await writeFile(new URL('./outputs/situational-audit/current-cases.json',import.meta.url),JSON.stringify(cases,null,2));
await writeFile(new URL('./outputs/situational-audit/current-questions.json',import.meta.url),JSON.stringify(selected));
await writeFile(new URL('./outputs/situational-audit/structure.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
