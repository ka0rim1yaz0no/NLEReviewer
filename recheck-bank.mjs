// Read-only recheck. This produces editorial evidence; it is not clinical approval.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {questions,activeQuestions,clinicalCases,validateQuestions} from './author-bank.ts';
import {normalizeQuestionStem} from './bank.ts';
import {isSituational,collectionCounts} from './collections.ts';
import {curriculum,questionsForTopic} from './curriculum.ts';
import {contentDigest} from './content-integrity.ts';
import {resolvedReference} from './reference-repairs.ts';

const directory=new URL('./outputs/device-and-content-review/',import.meta.url);
await mkdir(directory,{recursive:true});
validateQuestions(questions);
const issues=[],stems=new Map(),ids=new Set(),sources=new Map();
function source(url,id){if(!url||!/^https:\/\//.test(url))issues.push({kind:'missing-or-invalid-source',id,url});else sources.set(url,[...(sources.get(url)||[]),id]);}
for(const q of activeQuestions){
 if(ids.has(q.id))issues.push({kind:'duplicate-id',id:q.id});ids.add(q.id);
 const stem=normalizeQuestionStem(q.stem),previous=stems.get(stem);if(previous)issues.push({kind:'duplicate-stem',ids:[previous,q.id]});stems.set(stem,q.id);
 if(q.options.length!==4||new Set(q.options.map(o=>normalizeQuestionStem(o.text))).size!==4)issues.push({kind:'invalid-choices',id:q.id});
 if(q.rationale!==q.options[q.correctIndex]?.rationale)issues.push({kind:'key-rationale-disagreement',id:q.id});
 if(q.rationale.length<20||q.options.some(o=>o.rationale.length<20))issues.push({kind:'short-explanation',id:q.id});
 source(q.source,q.id);
 for(const [i,o] of q.options.entries()){source(o.source||q.source,q.id+':'+i);if(o.contextSource)source(o.contextSource,q.id+':context-'+i);}
}
const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')).filter(c=>!c.retired);
const legacyReferences=JSON.parse(await readFile(new URL('./legacy-case-references.json',import.meta.url),'utf8'));
const changes=JSON.parse(await readFile(new URL('./rationale-reference-corrections.json',import.meta.url),'utf8'));
const cases=[
 ...clinicalCases.map((c,i)=>{const id=c.subject+'-'+String(i+1).padStart(3,'0');return {id,kind:'five-part',subject:c.subject,topic:c.topic,title:c.title,scenario:c.scenario,problem:c.facts[0].text,action:c.facts[1].text,teaching:c.facts[2].text,outcome:c.facts[3].text,unsafe:c.facts[4].text,reason:c.facts.map(f=>f.reason).join(' '),source:resolvedReference(changes.legacy[id]?.source||legacyReferences[id])};}).filter(c=>activeQuestions.some(q=>q.id.startsWith(c.id+'-'))),
 ...evidence.map(c=>({...c,source:resolvedReference(c.source),kind:'seven-part'})),
 ...activeQuestions.filter(q=>q.id.startsWith('EXP2-')).map(q=>({id:q.id,kind:'standalone',subject:q.subject,topic:q.topic,scenario:q.stem,problem:q.options[q.correctIndex].text,action:'',reason:q.rationale,source:q.source}))
];
const coverage=curriculum.map(t=>{const qs=questionsForTopic(t,activeQuestions);return {subject:t.subject,topic:t.name,slug:t.slug,questions:qs.length,situational:qs.filter(isSituational).length};});
for(const topic of coverage)if(!topic.situational)issues.push({kind:'missing-topic',topic:topic.slug});
const review={date:'2026-11-06',storedQuestions:questions.length,activeQuestions:activeQuestions.length,counts:collectionCounts(activeQuestions),allChoices:activeQuestions.length*4,situationalChoices:activeQuestions.filter(isSituational).length*4,scenarioSets:cases.length,topicCount:coverage.length,uniqueSourceUrls:sources.size,issues,coverage,contentDigest:await contentDigest(questions,clinicalCases),bankFileSha256:createHash('sha256').update(await readFile(new URL('./question-bank.json.gz',import.meta.url))).digest('hex'),independentClinicianApproval:false,limits:'Structural and source-traceability checks do not establish the correctness of every clinical claim. Similarity requires editorial adjudication.'};
await writeFile(new URL('structure.json',directory),JSON.stringify(review,null,2)+'\n');
await writeFile(new URL('cases.json',directory),JSON.stringify(cases));
await writeFile(new URL('questions.json',directory),JSON.stringify(activeQuestions));
await writeFile(new URL('sources.json',directory),JSON.stringify([...sources].map(([url,ids])=>({url,uses:ids.length,questionIds:[...new Set(ids.map(id=>id.replace(/:(?:context-)?\d+$/,'')))]})),null,2));
console.log(JSON.stringify({activeQuestions:review.activeQuestions,choices:review.allChoices,situationalQuestions:review.counts.situational,scenarioSets:cases.length,topics:coverage.length,sourceUrls:sources.size,issues:issues.length,digest:review.contentDigest}));
if(issues.length)process.exitCode=1;
