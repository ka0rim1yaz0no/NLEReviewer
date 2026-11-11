import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {setTimeout as pause} from 'node:timers/promises';
import {questions,previousQuestions,clinicalCases,activeQuestions,challengeQuestions} from './author-bank.ts';
import {canonicalBytes} from './canonical-json.ts';
import {contentDigest} from './content-integrity.ts';
import {processContentRelease} from './content-processing.ts';
import {timedRequest} from './abort-utils.ts';
import {makeTopicGuide} from './pdf-guides.ts';
import {curriculum,questionsForTopic} from './curriculum.ts';
import {isSituational} from './collections.ts';
import {quizShortcut} from './quiz-shortcuts.ts';
import {normalizeQuestionStem} from './bank.ts';
import {decodeContentRelease} from './content-release.ts';
import edits from './judgment-edits.json' with {type:'json'};
import evidence from './situational-evidence.json' with {type:'json'};

test('canonical UTF-8 preserves published checksums, Unicode, escaping and key ordering',async()=>{
 const text='Café – Filipino 😊 / "quote"\n\t\\ \ud800';
 const input={z:text,n:[true,'a\nb',3],a:{b:1,a:null}};
 const expected=JSON.stringify({a:{a:null,b:1},n:[true,'a\nb',3],z:text});
 assert.deepEqual(Buffer.from(canonicalBytes(input)),Buffer.from(expected));
 assert.equal(await contentDigest(previousQuestions.slice(0,-challengeQuestions.length),clinicalCases),'d664c4d5ef0db424a4f3efaee304e629af4713125b791c6f4be42cbf79b57d15');
 assert.equal(activeQuestions.length,9531);
});
test('canonical verification remains available without TextEncoder.encodeInto',()=>{
 const Native=globalThis.TextEncoder;
 try{globalThis.TextEncoder=class{encode(text){return new Native().encode(text);}};
  assert.deepEqual(Buffer.from(canonicalBytes({z:'β',a:'😊'})),Buffer.from('{"a":"😊","z":"β"}'));
 }finally{globalThis.TextEncoder=Native;}
});
test('all 156 guides summarize each active question’s keyed decision',()=>{
 for(const topic of curriculum){
  const expected=questionsForTopic(topic,questions).filter(isSituational),guide=makeTopicGuide(topic,questions,clinicalCases),points=guide.sections.flatMap(s=>s.points);
  assert.deepEqual(points.map(p=>p.questionId).sort(),expected.map(q=>q.id).sort(),topic.slug);
  for(const q of expected){const point=points.find(p=>p.questionId===q.id);assert.ok(guide.referenceLabels[point.reference-1],q.id);assert.ok(point.text.toLowerCase().includes(q.options[q.correctIndex].text.toLowerCase()),q.id);assert.ok(point.objective.length>3);}
  assert.ok(points.reduce((sum,p)=>sum+p.text.length,0)<expected.reduce((sum,q)=>sum+q.rationale.length,0),topic.slug);
  for(const section of guide.sections){
   const group=expected.filter(q=>section.points.some(p=>p.questionId===q.id));
   if(group.length>1){
    assert.equal(section.scenario,group[0].stem.split('\n\n')[0],topic.slug);
    assert.ok(group.every(q=>q.stem.startsWith(section.scenario+'\n\n')),topic.slug);
   }
  }
 }
 const preop=makeTopicGuide(curriculum.find(t=>t.slug==='pre-operative-phase'),questions,clinicalCases);
 assert.equal(preop.questionCount,29);assert.equal(preop.sections.length,5);assert.equal(preop.sections.flatMap(s=>s.points).length,29);
 for(const section of preop.sections.filter(s=>s.points.length===7))assert.equal(new Set(section.points.map(p=>p.objective)).size,7);
});
test('quiz shortcuts leave dialogs, controls and browser modifier keys alone',()=>{
 const event=key=>({key,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,defaultPrevented:false}),page={interactive:false,dialog:false,tutor:true};
 for(const key of ['1','Enter','ArrowRight','ArrowLeft','h','p','s']){
  assert.equal(quizShortcut(event(key),{...page,dialog:true}),null,key);
  assert.equal(quizShortcut(event(key),{...page,interactive:true}),null,key);
  for(const modifier of ['ctrlKey','altKey','metaKey','shiftKey','defaultPrevented'])assert.equal(quizShortcut({...event(key),[modifier]:true},page),null,modifier+key);
 }
 for(let n=1;n<=4;n++)assert.deepEqual(quizShortcut(event(String(n)),page),{kind:'answer',index:n-1});
 assert.deepEqual(quizShortcut(event('ArrowRight'),page),{kind:'next'});
 assert.deepEqual(quizShortcut(event('Enter'),page),{kind:'submit'});
 assert.equal(quizShortcut(event('Enter'),{...page,tutor:false}),null);
});
async function fixture(){
 const q=questions.slice(0,3),c=clinicalCases.slice(0,1),raw=Buffer.from(JSON.stringify({questions:q,cases:c}));
 return {content:{questions:q,cases:c},manifest:{version:2,encoding:'gzip-base64',pages:1,questionCount:q.length,caseCount:c.length,digest:await contentDigest(q,c),bytes:raw.length},pages:[{id:'page-0000',kind:'page',data:gzipSync(raw).toString('base64')}]};
}
test('switching away cancels and terminates verification and ignores late worker responses',async()=>{
 const Native=globalThis.Worker,created=[];
 class Worker{constructor(){created.push(this);this.terminated=0;}postMessage(){}terminate(){this.terminated++;}}
 globalThis.Worker=Worker;
 try{
  const f=await fixture(),abort=new AbortController(),pending=processContentRelease(f.manifest,f.pages,abort.signal);
  const rejection=assert.rejects(pending,e=>e.name==='AbortError');abort.abort();await rejection;
  assert.equal(created[0].terminated,1);created[0].onmessage({data:{content:f.content}});created[0].onerror({});assert.equal(created[0].terminated,1);
  await assert.rejects(processContentRelease(f.manifest,f.pages,abort.signal),e=>e.name==='AbortError');assert.equal(created.length,1);
 }finally{globalThis.Worker=Native;}
});
test('worker failures use the same verified fallback while damaged payloads remain rejected',async()=>{
 const Native=globalThis.Worker,created=[];
 class Worker{constructor(){created.push(this);}postMessage(){}terminate(){this.terminated=true;}}
 globalThis.Worker=Worker;
 try{
  const f=await fixture(),pending=processContentRelease(f.manifest,f.pages);created[0].onerror({});assert.deepEqual(await pending,f.content);assert.equal(created[0].terminated,true);
  const corrupt=processContentRelease({...f.manifest,digest:'bad'},f.pages);created[1].onerror({});await assert.rejects(corrupt,/integrity/);
  const denied=processContentRelease(f.manifest,f.pages);created[2].onmessage({data:{error:'Question bank failed its integrity check.'}});await assert.rejects(denied,/integrity/);
 }finally{globalThis.Worker=Native;}
});
test('content request timeouts and parent cancellation are independent and dispose cleanly',async()=>{
 const parent=new AbortController(),a=timedRequest(parent.signal,1000),b=timedRequest(parent.signal,1000);a.dispose();parent.abort();assert.equal(a.signal.aborted,false);assert.equal(b.signal.aborted,true);b.dispose();
 const timeout=timedRequest(undefined,5);await pause(15);assert.equal(timeout.signal.aborted,true);timeout.dispose();
});

test('new judgment cases preserve four complete explanations, sources, and verified calculations',()=>{
 assert.equal(challengeQuestions.length,42);
 const positions=[0,0,0,0];
 for(const q of challengeQuestions){
  const [scenario,prompt]=q.stem.split('\n\n');
  assert.ok(scenario.length>55&&prompt?.endsWith('?'),q.id);
  assert.ok(isSituational(q)&&q.difficulty==='challenge',q.id);
  assert.equal(q.options.length,4,q.id);
  assert.equal(q.rationale,q.options[q.correctIndex].rationale,q.id);
  assert.ok(q.keyPoint.length>45&&q.keyPoint.length<250,q.id);
  assert.equal(new Set(q.options.map(o=>o.referenceId)).size,4,q.id);
  assert.ok(q.options.every(o=>o.rationale.length>35&&o.source===q.source&&o.referenceId.startsWith(q.id+':')),q.id);
  assert.equal(new URL(q.source).protocol,'https:',q.id);
  positions[q.correctIndex]++;
 }
 assert.deepEqual(positions,[11,11,10,10]);
 const keyed=id=>{const q=challengeQuestions.find(q=>q.id===id);return q.options[q.correctIndex].text;};
 assert.equal(keyed('CH-001'),'Withdraw 6 mL and program 120 mL/hour');
 assert.match(keyed('CH-025'),/^9%/);
 const burn=curriculum.find(t=>t.slug==='integumentary-disorders-burn-care');
 assert.equal(makeTopicGuide(burn,activeQuestions,clinicalCases).sections.length,6);
});

test('every active situational item has revised choices, an intact answer position, and four sourced explanations',()=>{
 const previous=new Map(previousQuestions.map(q=>[q.id,q]));
 const revised=activeQuestions.filter(isSituational);
 assert.equal(revised.length,5117);
 assert.equal(Object.keys(edits.standalone).length,197);
 assert.equal(new Set(activeQuestions.map(q=>normalizeQuestionStem(q.stem))).size,activeQuestions.length);
 for(const q of questions){
  const original=previous.get(q.id);
  assert.ok(original,q.id);
  if(!isSituational(q)){assert.deepEqual(q,original,q.id);continue;}
  assert.equal(q.correctIndex,original.correctIndex,q.id);
  assert.equal(q.caseId,original.caseId,q.id);
  assert.equal(q.topic,original.topic,q.id);
  const originalChoices=new Set(original.options.map(option=>normalizeQuestionStem(option.text)));
  assert.ok(q.options.some((option,i)=>i!==q.correctIndex&&!originalChoices.has(normalizeQuestionStem(option.text))),q.id);
  assert.equal(new Set(q.options.map(option=>normalizeQuestionStem(option.text))).size,4,q.id);
  assert.equal(new Set(q.options.map(option=>normalizeQuestionStem(option.rationale))).size,4,q.id);
  assert.equal(q.rationale,q.options[q.correctIndex].rationale,q.id);
  assert.equal(q.source,q.options[q.correctIndex].source,q.id);
  assert.ok(q.options.every(o=>o.rationale.length>25&&o.referenceId&&new URL(o.source).protocol==='https:'),q.id);
 }
 for(const topic of curriculum)assert.ok(questionsForTopic(topic,revised).length>0,topic.slug);
 const pediatric=revised.find(q=>q.id==='NP2-058-2'),adult=revised.find(q=>q.id==='NP4-096-2');
 assert.match(pediatric.options[pediatric.correctIndex].text,/before discharge/);
 assert.match(adult.options[adult.correctIndex].text,/protect the head/i);
 const stroke=revised.find(q=>q.id==='SIT-NP5-altered-perception-01-action');
 assert.match(stroke.options[stroke.correctIndex].text,/stroke assessment/);
});

test('saved sessions can recover original choices from the verified prior release',async()=>{
 const previousDigest='bb2459522baefdb95afcbc7931116464a56308ffccc61f28d38e1494b6f24300';
 assert.equal(await contentDigest(previousQuestions,clinicalCases),previousDigest);
 const older=previousQuestions.find(q=>q.id==='NP2-058-2'),revised=questions.find(q=>q.id===older.id);
 assert.notEqual(older.stem,revised.stem);
 const rows=[previousQuestions[0],older],raw=Buffer.from(JSON.stringify({questions:rows,cases:[]}));
 const pages=[{id:'page-0000',kind:'page',data:gzipSync(raw).toString('base64')}];
 const manifest={version:2,encoding:'gzip-base64',pages:1,bytes:raw.length,caseCount:0,questionCount:2,digest:await contentDigest(rows,[])};
 const archive=await decodeContentRelease(manifest,pages,[older.id]);
 assert.deepEqual(archive.questions,[older]);
 await assert.rejects(()=>decodeContentRelease(manifest,pages,['unavailable-id']),/saved questions are unavailable/);
});

test('linked answer keys and explanations agree with their clinical evidence or documented correction',()=>{
 const caseEvidence=new Map(evidence.filter(c=>!c.retired).map(c=>[c.id,{...c,...edits.cases[c.id]}]));
 const prior=new Map(previousQuestions.map(q=>[q.id,q]));
 const fields={recognition:'problem',action:'action',teaching:'teaching',planning:'outcome',safety:'unsafe',reasoning:'reason'};
 const lower=value=>/^[A-Z]{2}/.test(value)?value:value.charAt(0).toLowerCase()+value.slice(1);
 for(const q of activeQuestions.filter(isSituational)){
  const answer=q.options[q.correctIndex].text;
  if(caseEvidence.has(q.caseId)){
   const c=caseEvidence.get(q.caseId);
   assert.ok(c,q.id);
   assert.ok(q.stem.startsWith(c.scenario+'\n\n'),q.id);
   assert.ok(q.rationale.includes(c.reason),q.id);
   const expected=q.clinicalObjective==='evaluation'
    ?`Document progress toward the goal for ${lower(c.problem)} and reassess as planned`
    :c[fields[q.clinicalObjective]];
   const actual=q.clinicalObjective==='safety'?answer.replace(/^Base the plan on the assumption that /,'Assume '):answer;
   assert.equal(actual,expected,q.id);
  }else if(edits.standalone[q.id]){
   const editorial=edits.standalone[q.id];
   assert.equal(answer,editorial.answer||prior.get(q.id).options[q.correctIndex].text,q.id);
   assert.equal(q.options[editorial.replace].rationale,editorial.why,q.id);
  }else{
   const [id,kind]=q.id.split(/-(?=\d$)/),index=Number(kind)-1;
   const c=clinicalCases[Number(id.split('-').at(-1))-1];
   const updated=edits.cases[id];
   const field=['problem','action','teaching','outcome','unsafe'][index];
   const expected=updated?.[field]||c.facts[index].text;
   const actual=index===4?answer.replace(/^Base the plan on the assumption that /,'Assume '):answer;
   assert.equal(actual,expected,q.id);
   assert.ok(q.rationale.includes(updated?.reasons?.[field]||c.facts[index].reason),q.id);
  }
 }
});
