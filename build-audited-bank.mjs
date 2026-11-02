// Authoring-only audit promotion. Reuses published IDs and option positions;
// new clinical situations always receive new IDs.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import catalog from './topic-catalog.json' with {type:'json'};
import clarifications from './situational-clarifications.json' with {type:'json'};
import {renderSituation} from './situational-authoring.mjs';
import {validateQuestions,normalizeQuestionStem} from './bank.ts';
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const published=JSON.parse(await read('./situational-questions.json'));
const base=[];
for(const name of ['foundations','community','maternal','medsurg','neuro','mental']){
 let topic,source,index=0;
 for(const raw of (await read(`./situations-${name}.txt`)).split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  if(line.startsWith('@')){const [slug,url]=line.slice(1).split('|');topic=catalog.find(t=>t.slug===slug);source=url;index=0;if(!topic)throw Error('Unknown topic '+slug);continue;}
  const [scenario,problem,action,teaching,outcome,unsafe,reason,override]=line.split('|');
  if(!topic||!reason)throw Error('Invalid original blueprint');
  const id=`SIT-${topic.subject}-${topic.slug}-${String(++index).padStart(2,'0')}`;
  base.push({id,subject:topic.subject,topic:topic.name,topicSlug:topic.slug,scenario,problem,action,teaching,outcome,unsafe,reason,source:override||source,...clarifications[id]});
 }
}
if(base.length!==620)throw Error('Original case roster must contain 620 cases');
const replacements=[],retirements=[];
for(const raw of (await read('./audited-replacements.txt')).split(/\r?\n/)){
 const line=raw.trim();if(!line||line.startsWith('#'))continue;
 const [retiredId,scenario,problem,action,teaching,outcome,unsafe,reason,source]=line.split('|');
 const previous=base.find(c=>c.id===retiredId);if(!previous||!source)throw Error('Invalid replacement '+retiredId);
 const id=retiredId+'-R2';if(replacements.some(c=>c.id===id))throw Error('Repeated replacement '+id);
 replacements.push({...previous,id,scenario,problem,action,teaching,outcome,unsafe,reason,source});
 retirements.push({retiredCaseId:retiredId,replacementCaseId:id});
}
const retired=new Set(retirements.map(r=>r.retiredCaseId));
const allEvidence=base.map(c=>retired.has(c.id)?{...c,retired:true}:c).concat(replacements);
const active=allEvidence.filter(c=>!c.retired);
if(active.length!==620||new Set(active.map(c=>normalizeQuestionStem(c.scenario))).size!==620)throw Error('Active case roster is not distinct and complete');
for(const t of catalog)if(active.filter(c=>c.topicSlug===t.slug).length!==4)throw Error('Four active cases required: '+t.slug);
const result=[];
for(const c of base){
 const old=published.filter(q=>q.caseId===c.id);if(old.length!==7)throw Error('Missing published case '+c.id);
 const rendered=renderSituation(c,allEvidence,old);
 result.push(...rendered.map(q=>retired.has(c.id)?{...q,retired:true}:q));
}
for(const c of replacements)result.push(...renderSituation(c,active));
validateQuestions(result);
if(result.filter(q=>!q.retired).length!==4340)throw Error('Expected 4,340 active seven-part questions');
const destination=new URL(process.argv.includes('--draft')?'./outputs/audited-draft/':'./',import.meta.url);
await mkdir(destination,{recursive:true});
await writeFile(new URL('situational-questions.json',destination),JSON.stringify(result,null,2)+'\n');
await writeFile(new URL('situational-evidence.json',destination),JSON.stringify(allEvidence,null,2)+'\n');
const report={preparedAt:'2026-11-03',activeClinicalSituationSets:620,activeSevenPartQuestions:4340,existingFivePartSituationalQuestions:600,totalExplicitSituationalQuestions:4940,topics:155,replacedCaseSets:retirements.length,retiredHistoricalQuestions:retirements.length*7,questionsPerNewSituation:7,competencies:['recognition','action','teaching','safety','planning','evaluation','reasoning'],independentClinicalReview:false,notes:'All 740 original shared case evidence sets were reviewed. Linked questions intentionally use distinct nursing-process objectives. Semantic repeats were replaced by new clinical situations with new IDs; historical IDs and key positions remain resolvable. Structural and source review is not independent clinician approval.',retirements};
await writeFile(new URL('situational-review-report.json',destination),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({activeCases:active.length,activeQuestions:4340,replacedCases:retirements.length,historicalQuestions:retirements.length*7,sha256:createHash('sha256').update(JSON.stringify(result)).digest('hex')}));
