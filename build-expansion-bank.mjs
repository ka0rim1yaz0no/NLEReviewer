// Original standalone scenarios. Never retrieves or transforms a paid question bank.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import catalog from './topic-catalog.json' with {type:'json'};
import sourceUpdates from './expansion-source-updates.json' with {type:'json'};
import {questions} from './author-bank.ts';
import {validateQuestions,normalizeQuestionStem} from './bank.ts';
const subjects=['CROSS','NP1','NP2','NP3','NP4','NP5'];
const rows=[];
for(const subject of subjects){
 const text=await readFile(new URL(`./expansion-${subject}.txt`,import.meta.url),'utf8');
 for(const [index,line] of text.split(/\r?\n/).entries()){
  if(!line.trim())continue;
  const parts=line.split(' | ').map(s=>s.trim());
  assert.equal(parts.length,8,`${subject}:${index+1}: expected eight fields`);
  const [slug,objective,stem,...tail]=parts,originalSource=tail.pop(),source=sourceUpdates[slug]??sourceUpdates[originalSource]??originalSource;
  const topic=catalog.find(t=>t.subject===subject&&t.slug===slug);
  assert.ok(topic,`Unknown topic: ${subject}:${slug}`);
  assert.match(source,/^https:\/\//);
  const id=`EXP2-${subject}-${slug}`,options=tail.map((entry,i)=>{
   const split=entry.indexOf('~');assert.ok(split>0,`${id}: choice ${i}`);
   const text=entry.slice(0,split),rationale=entry.slice(split+1);
   assert.ok(text.length>2&&rationale.length>=70,`${id}: incomplete choice ${i}`);
   return {text,rationale,source,referenceId:id+':'+(i===0?'key':'alternative-'+i)};
  });
  const correct=options[0],position=catalog.indexOf(topic)%4;
  options.splice(0,1);options.splice(position,0,correct);
  rows.push({id,subject,topic:topic.name,stem,options,correctIndex:position,rationale:correct.rationale,keyPoint:correct.text+'. '+correct.rationale,source,origin:'Original standalone nursing scenario authored 2026-11-03, informed by the linked reference. No BoardPal or official examination question was copied.',format:'situational',caseId:id,clinicalObjective:objective});
 }
}
assert.equal(rows.length,155);assert.equal(new Set(rows.map(q=>q.id)).size,155);
for(const topic of catalog)assert.equal(rows.filter(q=>q.subject===topic.subject&&q.topic===topic.name).length,1,topic.slug);
const candidate=validateQuestions(rows);
const existing=questions.filter(q=>!q.id.startsWith('EXP2-'));
assert.equal(validateQuestions([...existing,...candidate]).length,existing.length+155);
assert.equal(new Set(candidate.map(q=>normalizeQuestionStem(q.stem))).size,155);
await mkdir(new URL('./outputs/expansion/',import.meta.url),{recursive:true});
const json=JSON.stringify(candidate,null,2)+'\n',digest=createHash('sha256').update(json).digest('hex');
await writeFile(new URL('./outputs/expansion/candidate-questions.json',import.meta.url),json);
if(process.argv.includes('--install')){
 const review=JSON.parse(await readFile(new URL('./expansion-review.json',import.meta.url),'utf8'));
 assert.equal(review.candidateSha256,digest,'Candidate differs from the reviewed text');
 assert.equal(review.independentClinicianApproval,false,'Do not represent editorial review as clinician approval');
 assert.equal(review.reviewedQuestionIds.length,155);
 assert.deepEqual([...review.reviewedQuestionIds].sort(),candidate.map(q=>q.id).sort());
 const prior=JSON.parse(await readFile(new URL('./site-questions.json',import.meta.url),'utf8'));
 const priorOther=prior.filter(q=>!q.id.startsWith('EXP2-'));
 const priorExpansion=prior.filter(q=>q.id.startsWith('EXP2-'));
 if(priorExpansion.length)assert.deepEqual(priorExpansion,candidate,'Published scenarios are immutable');
 await writeFile(new URL('./site-questions.json',import.meta.url),JSON.stringify([...priorOther,...candidate],null,2)+'\n');
}
console.log(JSON.stringify({questions:candidate.length,topics:155,candidateSha256:digest,installed:process.argv.includes('--install')}));
