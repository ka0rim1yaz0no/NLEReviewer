import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {setTimeout as pause} from 'node:timers/promises';
import {applicationReviewedQuestions,fullBankReviewedQuestions,choiceReviewedQuestions as questions,previousQuestions,judgmentQuestions,clinicalAuditQuestions,clinicalCases,activeQuestions as currentActive,decisionQuestions,decisionStudyQuestions,revisedStudyQuestions,rationaleQuestions,rationaleStudyQuestions,challengeQuestions,contextReviewedQuestions,contextReviewedAdditions} from './author-bank.ts';
import {canonicalBytes} from './canonical-json.ts';
import {contentDigest} from './content-integrity.ts';
import {processContentRelease} from './content-processing.ts';
import {timedRequest} from './abort-utils.ts';
import {makeTopicGuide} from './pdf-guides.ts';
import {curriculum,questionsForTopic} from './curriculum.ts';
import {isSituational} from './collections.ts';
import {quizShortcut} from './quiz-shortcuts.ts';
import {normalizeChoice,normalizeQuestionStem} from './bank.ts';
import {decodeContentRelease,releaseForArchive,additionsForArchive,firstJudgmentRelease,clinicalAuditRelease,choiceReviewRelease,fullBankReviewRelease,applicationReviewRelease,decisionRelease,decisionAdditionsRelease,rationaleRelease,rationaleAdditionsRelease,choiceContextRelease,choiceContextAdditionsRelease,currentQuestionRevision,questionNeedsArchive,isStudyAddition} from './content-release.ts';
import {referenceCorrections} from './clinical-reference-corrections.mjs';
import {questionChoiceKey,questionFamily} from './question-selection.ts';
import {bankReviews} from './bank-review-data.ts';
import {newStudyQuestions} from './authored-update.mjs';
import {playStudyCue,playStudyTone,studySoundsEnabled} from './study-sound.ts';
import {priorityReviewedQuestions,priorityReviewedAdditions,priorCaseQuestions,thirdCaseQuestions,fourthCaseQuestions,fifthCaseQuestions,sixthCaseQuestions,seventhCaseQuestions,eighthCaseQuestions,ninthCaseQuestions} from './author-bank.ts';
import {archivedQuestionRevision,priorityReviewRelease,priorityReviewAdditionsRelease} from './content-release.ts';
import {firstCaseReviewRelease,firstCaseReviewAdditionsRelease,secondCaseReviewRelease,thirdCaseReviewRelease,fourthCaseReviewRelease,fifthCaseReviewRelease,sixthCaseReviewRelease,seventhCaseReviewRelease,eighthCaseReviewRelease,ninthCaseReviewRelease} from './content-release.ts';
import {auditCases} from './clinical-audit-data.ts';
import {auditedReferenceUpdates} from './clinical-audit.ts';
import {choiceReviewCases} from './choice-review-data.ts';
import {choiceReferenceUpdates} from './choice-review.ts';
import {reasoningSummaries} from './reference-guide-summaries.ts';
import {displayRationale,choiceExplanationLabel,choiceRationaleParts,unsafeDecision} from './rationale-display.ts';
import {sessionChoiceOrder} from './choice-order.ts';
import {restoreRepetitionReview} from './repetition-review.ts';
import {sessionScore} from './engine.ts';
import {parseRoomCode} from './play-engine.ts';
import edits from './judgment-edits.json' with {type:'json'};
import evidence from './situational-evidence.json' with {type:'json'};
import referenceFacts from './concept-evidence.json' with {type:'json'};
test('Play accepts a copied room link or ten-character code and rejects unrelated input',()=>{
 const origin='https://reviewer.test';
 assert.equal(parseRoomCode(' 123ab cdef0 ',origin),'123ABCDEF0');
 assert.equal(parseRoomCode(origin+'/play/room/123abcdef0?ref=invite',origin),'123ABCDEF0');
 assert.equal(parseRoomCode('/play/room/123abcdef0/',origin),'123ABCDEF0');
 for(const invalid of ['123','ZZZZZZZZZZ','https://elsewhere.test/play/room/123abcdef0',origin+'/play/room/123abcdef0/extra','javascript:123abcdef0']){
  assert.equal(parseRoomCode(invalid,origin),null);
 }
});
const activeQuestions=questions.filter(q=>!q.retired);

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
  for(const q of expected){
   const point=points.find(p=>p.questionId===q.id),short=q.clinicalObjective==='reasoning'&&q.caseId&&reasoningSummaries[q.caseId.replace(/^SIT-/,'')];
   assert.ok(guide.referenceLabels[point.reference-1],q.id);
   if(short){assert.equal(point.text,short,q.id);assert.ok(point.text.length<q.options[q.correctIndex].text.length,q.id);}
   else assert.ok(point.text.toLowerCase().includes(q.options[q.correctIndex].text.toLowerCase()),q.id);
   assert.ok(point.objective.length>3);
  }
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
 for(const q of judgmentQuestions.filter(isSituational)){
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

test('every situational choice is traceable to its source vignette or its reviewed replacement',()=>{
 const source=url=>choiceReferenceUpdates[auditedReferenceUpdates[url]||url]||auditedReferenceUpdates[url]||url;
 const families=new Map(judgmentQuestions.filter(isSituational).map(q=>[questionFamily(q),source(q.source)]));
 const auditById=new Map([[2,auditCases],[3,choiceReviewCases]].flatMap(([revision,groups])=>groups.flatMap(audit=>Object.keys(audit.items).map(suffix=>[audit.id+'-'+suffix,{...audit,revision}]))));
 let choices=0;
 for(const q of activeQuestions.filter(isSituational)){
  const review=auditById.get(q.id);
  assert.equal(q.questionRevision,review?.revision,q.id);
  for(const [i,o] of q.options.entries()){
   const id=o.referenceId.slice(0,o.referenceId.lastIndexOf(':'));
   assert.equal(o.source,review?.source||families.get(id),o.referenceId);
   if(o.contextSource)assert.equal(o.contextSource,q.source,o.referenceId);
   const reason=displayRationale(o.rationale);
   assert.ok(reason.length>=25&&o.rationale.includes(reason),o.referenceId);
   assert.deepEqual(reason.match(/\d+(?:\.\d+)?/g),o.rationale.match(/\d+(?:\.\d+)?/g),o.referenceId);
   assert.equal(choiceExplanationLabel(q,i),i===q.correctIndex?(unsafeDecision(q)?'Why this action is unsafe':'Why this is the best answer'):'Why this choice does not fit');
   choices++;
  }
 }
 assert.equal(choices,20468);
});

test('corrected cases preserve prior revision content for saved quiz review',async()=>{
 assert.equal(releaseForArchive(1),firstJudgmentRelease);
 assert.equal(await contentDigest(judgmentQuestions,clinicalCases),'146ed234b0613d02e54057c67b9508dd3ff774f3632eeb8f6e40aa851ebe9eb6');
 const id='SIT-NP4-endocrine-emergencies-summary-04-action';
 const old=judgmentQuestions.find(q=>q.id===id),current=questions.find(q=>q.id===id);
 assert.equal(current.correctIndex,old.correctIndex);
 assert.match(current.options[current.correctIndex].text,/Hold the insulin/);
 assert.match(current.rationale,/above 3\.5 mmol\/L/);
 assert.notEqual(current.stem,old.stem);
 const raw=Buffer.from(JSON.stringify({questions:[old],cases:[]}));
 const pages=[{id:'page-0000',kind:'page',data:gzipSync(raw).toString('base64')}];
 const manifest={version:2,encoding:'gzip-base64',pages:1,bytes:raw.length,caseCount:0,questionCount:1,digest:await contentDigest([old],[])};
 const restored=await decodeContentRelease(manifest,pages,[id]);
 assert.deepEqual(restored.questions,[old]);
});

test('new clinical choice edits preserve the complete published audit release and grading positions',async()=>{
 assert.equal(releaseForArchive(2),clinicalAuditRelease);
 assert.equal(await contentDigest(clinicalAuditQuestions,clinicalCases),'94992879e35b98e3ca9c7138edc1b4c685a2fd2e597e591d3ee6ebb69abf9042');
 const previous=new Map(clinicalAuditQuestions.map(q=>[q.id,q]));
 for(const q of questions.filter(q=>q.questionRevision===3)){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.notEqual(q.stem,previous.get(q.id).stem,q.id);
  assert.ok(q.options.every(o=>o.source===q.source&&o.rationale.length>35),q.id);
 }
 const insulin=questions.find(q=>q.id==='CROSS-006-3');
 assert.match(insulin.options[insulin.correctIndex].text,/2 mL\/hour/);
 const magnesium=questions.find(q=>q.id==='NP2-043-2');
 assert.match(magnesium.stem,/respiratory rate is 8\/min/);
 assert.match(magnesium.options[magnesium.correctIndex].text,/Stop magnesium/);
});

test('the current bank has distinct stems, four distinct explained choices, and immutable saved answers',async()=>{
 const bank=[...currentActive,...revisedStudyQuestions];
 assert.equal(bank.length,9531+newStudyQuestions.length);
 assert.equal(new Set(bank.map(q=>normalizeQuestionStem(q.stem))).size,bank.length);
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 assert.equal(new Set(bank.map(questionChoiceKey)).size,bank.length);
 for(const q of bank){
  assert.ok(questionChoiceKey(q),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
  assert.equal(q.rationale,q.options[q.correctIndex].rationale,q.id);
  assert.ok(q.options.every(o=>o.rationale.length>=20&&new URL(o.source||q.source).protocol==='https:'),q.id);
 }
 const previous=new Map(questions.map(q=>[q.id,q]));
 const edits=new Map(bankReviews.map(e=>[e.id,e]));
 assert.equal(currentQuestionRevision,19);
 assert.equal(releaseForArchive(3),choiceReviewRelease);
 assert.equal(await contentDigest(questions,clinicalCases),'a85625fd219a1c591fdffbdab00376dabdacf1f45258d95c5215df0a2c697b93');
 for(const q of fullBankReviewedQuestions){
  const prior=previous.get(q.id),edit=edits.get(q.id);
  if(!edit){assert.deepEqual(q,prior,q.id);continue;}
  assert.equal(q.correctIndex,prior.correctIndex,q.id);
  assert.equal(q.options[q.correctIndex].text,edit.choices[0][0],q.id);
  assert.equal(q.source,edit.source,q.id);
  assert.equal(q.questionRevision,4,q.id);
  assert.equal(questionNeedsArchive(q,3),true,q.id);
 }
 for(const topic of curriculum)assert.ok(questionsForTopic(topic,bank).some(isSituational),topic.slug);
});

test('the PNLE application release preserves archived answers and scores shuffled choices by their original index',async()=>{
 assert.equal(releaseForArchive(4),fullBankReviewRelease);
 assert.equal(await contentDigest(fullBankReviewedQuestions,clinicalCases),'f1fa62b8cb7333d7b1ca6b3b3505eb2c20230ab035385b29de1a554eeaecadb0');
 const prior=new Map(fullBankReviewedQuestions.map(q=>[q.id,q]));
 const positionCounts=[0,0,0,0];
 const session={id:'application-check',questionRevision:5,questionIds:[],answers:{}};
 const bank=new Map();
 for(const q of [...applicationReviewedQuestions.filter(q=>!q.retired),...newStudyQuestions]){
  const original=prior.get(q.id);
  if(original){
   assert.equal(q.correctIndex,original.correctIndex,q.id);
   if(q.questionRevision===5)assert.ok(questionNeedsArchive(q,4),q.id);
   else assert.deepEqual(q,original,q.id);
  }
  const order=sessionChoiceOrder(session,q.id);
  assert.deepEqual([...order].sort(),[0,1,2,3],q.id);
  assert.deepEqual(sessionChoiceOrder({...session},q.id),order,q.id);
  assert.deepEqual(sessionChoiceOrder({...session,questionRevision:4},q.id),[0,1,2,3]);
  const displayPosition=order.indexOf(q.correctIndex);
  positionCounts[displayPosition]++;
  session.questionIds.push(q.id);bank.set(q.id,q);
  session.answers[q.id]={selected:order[displayPosition],submitted:true};
 }
 assert.ok(positionCounts.every(count=>count>2100&&count<2700),JSON.stringify(positionCounts));
 assert.equal(sessionScore(session,bank),session.questionIds.length);
});

test('every reference-based option traces to its Open RN fact or its documented correction',()=>{
 const facts=new Map(referenceFacts.map(fact=>[fact.id,fact]));
 const original=new Map(restoreRepetitionReview(fullBankReviewedQuestions.filter(q=>q.conceptId)).map(q=>[q.id,q]));
 const normalized=text=>normalizeQuestionStem(text).replaceAll('sodium glucose cotransporter 2 sglt2 inhibitors','sodium glucose co transporter 2 slt 2 inhibitors');
 for(const q of applicationReviewedQuestions.filter(q=>!q.retired&&q.conceptId)){
  const key=facts.get(q.conceptId);
  assert.equal(q.options[q.correctIndex].referenceId,key.id,q.id);
  const usesTwoCues=q.format==='comparison'&&normalized(q.options[q.correctIndex].text)===normalized(key.definition);
  if(usesTwoCues){
   assert.ok(referenceFacts.some(fact=>fact.poolId!==key.poolId&&fact.sourceId===key.sourceId&&fact.entryId===key.entryId&&fact.row===key.row&&normalized(q.stem).includes(normalized(fact.definition))),q.id);
  }
  for(const [index,option] of q.options.entries()){
   const fact=facts.get(option.referenceId);
   assert.ok(fact,q.id);
   if(usesTwoCues){
    assert.equal(fact.poolId,key.poolId,q.id);
    assert.equal(option.text,fact.definition,q.id);
    assert.equal(option.source,fact.source,q.id);
    assert.ok(option.rationale.includes(fact.term)&&option.rationale.includes(key.term),q.id);
    continue;
   }
   const previous=original.get(q.id).options[index];
   const matching=option.referenceId===previous.referenceId&&normalized(option.text)===normalized(previous.text)?previous:option;
   assert.equal(normalized(matching.text),normalized(fact.term),q.id);
   assert.equal(matching.source,fact.source,q.id);
   assert.ok(normalized(matching.rationale).includes(normalized(fact.definition)),q.id);
  }
 }
});

test('all remaining decisions are revised and saved core and expansion answers retain their original slots',async()=>{
 assert.equal(releaseForArchive(5),applicationReviewRelease);
 assert.equal(await contentDigest(applicationReviewedQuestions,clinicalCases),'bfe99d8bc5ef9c85e43075128afd8c915c89d79f0fc6b089b9b17b17a17d4118');
 const prior=new Map([...applicationReviewedQuestions,...newStudyQuestions].map(q=>[q.id,q]));
 const revised=[...decisionQuestions,...decisionStudyQuestions].filter(q=>!q.retired&&q.questionRevision===6);
 assert.equal(revised.length,7090+newStudyQuestions.length);
 assert.equal(new Set(revised.map(questionChoiceKey)).size,revised.length);
 for(const q of revised){
  assert.equal(q.correctIndex,prior.get(q.id).correctIndex,q.id);
  assert.notEqual(q.stem,prior.get(q.id).stem,q.id);
  assert.ok(questionNeedsArchive(q,5),q.id);
 }
 assert.ok(revisedStudyQuestions.every(q=>isStudyAddition(q.id)));
 assert.ok(applicationReviewedQuestions.every(q=>!isStudyAddition(q.id)));
});

test('the rationale release preserves grading slots and traces each paired decision to its own option and source',async()=>{
 assert.equal(releaseForArchive(6),decisionRelease);
 assert.equal(additionsForArchive(6),decisionAdditionsRelease);
 assert.equal(await contentDigest(decisionQuestions,clinicalCases),'ddf9138dc427aafc3d4c4220712be1a3603381014c1d9aa959c60afbe6203083');
 assert.equal(await contentDigest(decisionStudyQuestions,[]),'7007c4727243a5b9244b2117fad30e12834bf911c51a992d3a014cc27c2bbc70');
 const before=new Map([...decisionQuestions,...decisionStudyQuestions].map(q=>[q.id,q]));
 const source=new Map([...applicationReviewedQuestions,...newStudyQuestions].map(q=>[q.id,q]));
 let focused=0,pairs=0,contrasts=0;
 const rationaleActive=[...rationaleQuestions,...rationaleStudyQuestions].filter(q=>!q.retired);
 for(const q of rationaleActive){
  const previous=before.get(q.id);
  assert.equal(q.correctIndex,previous.correctIndex,q.id);
  if(q.questionRevision===7)assert.ok(questionNeedsArchive(q,6),q.id);
  assert.ok(!q.stem.startsWith('First situation\n'),q.id);
  if(previous.stem.startsWith('First situation\n'))focused++;
  const raw=source.get(q.id);
  for(const [index,choice] of q.options.entries()){
   const parts=choiceRationaleParts(q,index);
   if(!parts.length)continue;
   assert.equal(parts.length,2,q.id);
   assert.ok(parts.every(p=>p.explanation.trim()&&new URL(p.source).protocol==='https:'),q.id);
   const satisfies=parts.every(p=>p.verdict==='supported'||p.verdict==='needs-correction');
   assert.equal(satisfies,index===q.correctIndex,q.id);
   const [id,kind,first,peerId,second]=choice.referenceId.split(':');
   assert.equal(id,q.id);
   if(kind==='paired'){
    const peer=source.get(peerId);
    const expected=[[raw,Number(first)],[peer,Number(second)]];
    for(const [part,[item,slot]] of expected.entries()){
     const o=item.options[slot],key=slot===item.correctIndex;
     assert.equal(parts[part].verdict,unsafeDecision(item)?key?'needs-correction':'appropriate':key?'supported':'incorrect',q.id);
     assert.equal(parts[part].source,o.source||item.source,q.id);
     assert.ok(choice.text.split('\n')[part].endsWith(o.text),q.id);
    }
    pairs++;
   }else{
    assert.equal(kind,'contrast',q.id);
    const answers=[raw.options[raw.correctIndex],raw.options.find(o=>o.referenceId===first)];
    for(const [part,line] of choice.text.split('\n').entries()){
     const selected=raw.options.find(o=>line.endsWith(' — '+o.text));
     assert.ok(selected,q.id);
     assert.equal(parts[part].verdict,selected===answers[part]?'supported':'incorrect',q.id);
     assert.equal(parts[part].source,selected.source||raw.source,q.id);
     assert.ok(parts[part].explanation.includes(selected.text),q.id);
    }
    contrasts++;
   }
  }
 }
 assert.equal(focused,340);
 assert.equal(pairs,3681*4);
 assert.equal(contrasts,2569*4);
 const injection=rationaleActive.find(q=>q.id==='EXP2-NP1-communicable-diseases-basic-concepts');
 assert.match(injection.options[injection.correctIndex].text,/new sterile needle and syringe/);
 assert.match(injection.options[2].rationale,/contaminate the medication/);
 assert.doesNotMatch(JSON.stringify(injection),/refusal|Second situation/);
 const wound=rationaleActive.find(q=>q.id==='SIT-NP1-family-nursing-process-03-safety');
 assert.ok(unsafeDecision(wound));
 assert.match(wound.options[wound.correctIndex].rationale,/Document those barriers.*arrange accessible wound care/);
});

test('the clinical reference release preserves all keys and shows why the distractor fits elsewhere',async()=>{
 assert.equal(releaseForArchive(7),rationaleRelease);
 assert.equal(additionsForArchive(7),rationaleAdditionsRelease);
 assert.equal(await contentDigest(rationaleQuestions,clinicalCases),'1e46a816a4ae6597e401e9ff285c35772222811584ca5274986919c61b01c684');
 assert.equal(await contentDigest(rationaleStudyQuestions,[]),'9f1f02a94cf70e598c2c5f4e991cc115c944942d49705fef1f36566d5d1f9439');
 const previous=new Map([...rationaleQuestions,...rationaleStudyQuestions].map(q=>[q.id,q]));
 const items=[...contextReviewedQuestions.filter(q=>!q.retired),...contextReviewedAdditions];
 assert.equal(items.length,9608);
 assert.equal(new Set(items.map(questionChoiceKey)).size,items.length);
 const referenceItems=items.filter(q=>q.conceptId);
 let contextualParts=0;
 for(const q of items){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.equal(q.rationale,q.options[q.correctIndex].rationale,q.id);
  if(q.questionRevision===8)assert.ok(questionNeedsArchive(q,7),q.id);
  for(const [index,option] of q.options.entries()){
   const parts=choiceRationaleParts(q,index);
   for(const part of parts)if(part.explanation.includes('Case reasoning:')){
    assert.equal(part.verdict,'incorrect',q.id);
    assert.ok(part.caseSource?.startsWith('https://'),q.id);
    contextualParts++;
   }
   if(!q.conceptId)assert.equal(option.text,previous.get(q.id).options[index].text,q.id);
  }
 }
 assert.ok(contextualParts>5000);
 for(const correction of referenceCorrections){
  const q=referenceItems.find(item=>item.id===correction.id);
  if(q)assert.equal(q.source,correction.source,correction.id);
  assert.ok(referenceItems.some(item=>[item.stem,...item.options.flatMap(o=>[o.text,o.rationale])].some(text=>text.includes(correction.to))),correction.id);
  assert.ok(referenceItems.every(item=>![item.stem,item.keyPoint,...item.options.flatMap(o=>[o.text,o.rationale])].some(text=>text.includes(correction.from))),correction.id);
 }
 const potassium=items.find(q=>q.id==='SIT-CROSS-laboratory-values-01-action');
 assert.ok(potassium.options.some(o=>o.rationale.includes('This case gives no indication of hemolysis')));
 assert.match(potassium.rationale,/6\.7 mmol\/L|peaked T waves/);
});

test('the priority case review disambiguates clinical choices and preserves revision eight for saved answers',async()=>{
 assert.equal(releaseForArchive(8),choiceContextRelease);
 assert.equal(additionsForArchive(8),choiceContextAdditionsRelease);
 assert.equal(await contentDigest(contextReviewedQuestions,clinicalCases),'8fe44a67717b880de16261306966f49c40b89b16f7196ca2a68e1043f0e07d1b');
 assert.equal(await contentDigest(contextReviewedAdditions,[]),'ce246102f0072faf007512fe4ce776ff0d1771c943aded64b17fa7ad6f53bb6e');
 const prior=new Map([...contextReviewedQuestions,...contextReviewedAdditions].map(q=>[q.id,q]));
 for(const q of [...currentActive,...revisedStudyQuestions]){
  assert.equal(q.correctIndex,prior.get(q.id).correctIndex,q.id);
  if(q.questionRevision===9)assert.ok(questionNeedsArchive(q,8),q.id);
 }
 const items=new Map([...priorityReviewedQuestions,...priorityReviewedAdditions].map(q=>[q.id,q]));
 const teaching=items.get('SIT-NP2-postpartum-complications-03-R2-teaching');
 const option=teaching.options.find(o=>o.text.includes('home blood-pressure monitoring'));
 assert.ok(option);
 assert.match(option.rationale,/newly symptomatic client/);
 assert.doesNotMatch(teaching.options[teaching.correctIndex].text,/home blood-pressure monitoring/);
 const asystole=items.get('SIT-NP5-high-acuity-emergency-situations-01-R2-safety');
 assert.match(asystole.options[asystole.correctIndex].rationale,/early epinephrine/);
 assert.match(asystole.options[2].text,/Direct available staff/);
 assert.match(asystole.options[3].text,/whether CPR/);
 const magnesium=items.get('NP2-043-2');
 assert.match(magnesium.rationale,/calcium gluconate/);
 assert.ok(choiceRationaleParts(magnesium,magnesium.correctIndex).some(p=>p.source.includes('dailymed.nlm.nih.gov')));
 assert.match(items.get('EXP2-SKIN-064').rationale,/without assigning a skin stage/);
});

test('study sounds respect saved preferences and use different feedback in the same audio context',async()=>{
 const originalWindow=globalThis.window,notes=[];
 let created=0;
 class AudioTestContext{
  currentTime=0;state='suspended';destination={};
  constructor(){created++;}
  async resume(){this.state='running';}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  createOscillator(){
   return {frequency:{value:0},connect(){},disconnect(){},start(){notes.push(this.frequency.value);},stop(){}};
  }
 }
 try{
  globalThis.window={AudioContext:AudioTestContext};
  assert.equal(studySoundsEnabled({}),false);
  assert.equal(studySoundsEnabled({flashcardSound:true}),true);
  assert.equal(studySoundsEnabled({studySound:false,flashcardSound:true}),false);
  playStudyCue('correct');
  await Promise.resolve();
  playStudyCue('incorrect');
  playStudyTone(500);
  assert.equal(created,1);
  assert.equal(notes.length,5);
  assert.ok(notes[0]<notes[1]&&notes[2]>notes[3]);
  assert.equal(notes[4],500);
 }finally{
  if(originalWindow===undefined)delete globalThis.window;
  else globalThis.window=originalWindow;
 }
});

test('case findings and choice explanations agree while prior releases remain available for saved sessions',async()=>{
 assert.equal(archivedQuestionRevision(9),9);
 assert.equal(releaseForArchive(9),priorityReviewRelease);
 assert.equal(additionsForArchive(9),priorityReviewAdditionsRelease);
 assert.equal(archivedQuestionRevision(10),10);
 assert.equal(releaseForArchive(10),firstCaseReviewRelease);
 assert.equal(additionsForArchive(10),firstCaseReviewAdditionsRelease);
 assert.equal(archivedQuestionRevision(11),11);
 assert.equal(releaseForArchive(11),secondCaseReviewRelease);
 assert.equal(additionsForArchive(11),firstCaseReviewAdditionsRelease);
 assert.equal(await contentDigest(priorCaseQuestions,clinicalCases),'a360d5bbb00e11dbf835272280bad324a6273b8fa508c690d55ff7b001633386');
 assert.equal(await contentDigest(priorityReviewedQuestions,clinicalCases),'b7735ca30f4ef478dd2f4a06954cd95835cceba829dda4e4471814fd94d6ea11');
 assert.equal(await contentDigest(priorityReviewedAdditions,[]),'ec86e38e43e2981ef3f8f395da1ce8a40a43cabcf48cca227da8a05e2c136908');
 const previous=new Map([...priorityReviewedQuestions,...priorityReviewedAdditions].map(q=>[q.id,q]));
 const clinical=[...currentActive,...revisedStudyQuestions].filter(q=>!q.conceptId);
 assert.equal(clinical.length,5278);
 for(const q of clinical){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  if((q.questionRevision??0)>=10)assert.ok(questionNeedsArchive(q,9),q.id);
  if(q.questionRevision===11)assert.ok(questionNeedsArchive(q,10),q.id);
  for(const [i,choice] of q.options.entries()){
   const parts=choiceRationaleParts(q,i);
   if(!parts.length)continue;
   assert.equal(parts.length,2,q.id);
   assert.ok(parts.every(p=>p.explanation.trim()&&new URL(p.source).protocol==='https:'),q.id);
   assert.equal(parts.every(p=>p.verdict==='supported'||p.verdict==='needs-correction'),i===q.correctIndex,q.id);
   assert.equal(choice.text.split('\n').length,2,q.id);
  }
 }
 const byId=new Map(clinical.map(q=>[q.id,q]));
 const repeatGlucose=byId.get('NP4-081-4');
 assert.match(repeatGlucose.stem,/56 mg\/dL.*62 mg\/dL.*swallowing remains safe/);
 assert.equal(choiceRationaleParts(repeatGlucose,repeatGlucose.correctIndex)[0].label,'Next action');
 assert.match(repeatGlucose.rationale,/repeat fast-acting glucose/);
 assert.doesNotMatch(previous.get(repeatGlucose.id).stem,/62 mg\/dL/);
 const pleural=byId.get('NP3-067-2');
 assert.match(pleural.stem,/drain was accidentally left clamped/);
 assert.match(pleural.rationale,/correcting the inadvertent clamp/);
 assert.ok(choiceRationaleParts(pleural,pleural.correctIndex).every(p=>p.source.includes('aci.health.nsw.gov.au')));
 const thyroid=byId.get('SIT-NP4-thyroid-disorders-02-R2-teaching');
 assert.match(thyroid.options[thyroid.correctIndex].text,/at least four hours/);
 assert.ok(thyroid.options.some(o=>o.text.includes('continue to take it with both supplements')&&o.rationale.includes('still reduces absorption')));
 const thionamide=byId.get('SIT-NP4-thyroid-disorders-01-R2-action');
 assert.match(thionamide.options[thionamide.correctIndex].text,/Hold the next thionamide dose/);
 assert.ok(thionamide.options.every((o,i)=>choiceRationaleParts(thionamide,i).every((p,j)=>
  !o.text.split('\n')[j].includes('Hold the next thionamide dose')||p.verdict==='supported')));
 const hhs=byId.get('SIT-NP4-endocrine-emergencies-summary-02-action');
 assert.match(hhs.options[hhs.correctIndex].text,/gradual correction of osmolality/);
 assert.ok(hhs.options.some(o=>o.text.includes('without assessing osmolality')&&o.rationale.includes('urgent assessment of hyperosmolality')));
 const clozapine=byId.get('SIT-NP1-community-mental-health-program-03-action');
 assert.match(clozapine.rationale,/absolute neutrophil count/);
 const arrest=byId.get('CH-041');
 assert.match(arrest.rationale,/pulseless ventricular tachycardia.*prompt defibrillation/);
 assert.ok(arrest.options.some(o=>o.rationale.includes('tachycardias in a patient with a pulse')));
});

test('source-backed case updates keep archived answer positions and distinguish appropriate alternatives',()=>{
 const previous=new Map(priorCaseQuestions.map(q=>[q.id,q]));
 const latest=currentActive.filter(q=>q.questionRevision===12);
 assert.equal(latest.length,224);
 for(const q of latest){
  const archived=previous.get(q.id);
  assert.ok(questionNeedsArchive(q,11),q.id);
  assert.equal(archived.correctIndex,q.correctIndex,q.id);
  assert.equal(q.options.length,4,q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
  assert.ok(q.options.every(o=>o.source?.startsWith('https://')),q.id);
 }
 const byId=new Map(latest.map(q=>[q.id,q]));
 const dengue=byId.get('NP1-029-2');
 assert.match(dengue.stem,/severe abdominal pain and persistent vomiting as the fever starts to settle/);
 assert.match(dengue.options[dengue.correctIndex].text,/urgent hospital assessment/);
 assert.ok(dengue.options.some((o,i)=>choiceRationaleParts(dengue,i).some(p=>p.verdict==='incorrect'&&p.explanation.includes('when there are no warning signs'))));
 const prolapse=byId.get('NP2-046-5');
 assert.match(prolapse.stem,/75\/min.*loop of umbilical cord/);
 assert.match(prolapse.options[prolapse.correctIndex].text,/Attempt to push the cord back/);
 assert.ok(choiceRationaleParts(prolapse,prolapse.correctIndex).some(p=>p.verdict==='needs-correction'&&p.explanation.includes('lifting the presenting part')));
 const newborn=byId.get('NP2-052-2');
 assert.match(newborn.rationale,/IV dextrose under protocol/);
 assert.ok(newborn.options.some((o,i)=>choiceRationaleParts(newborn,i).some(p=>p.verdict==='incorrect'&&p.explanation.includes('evaporative loss'))));
 const postnatal=byId.get('NP2-050-3');
 assert.match(postnatal.stem,/Two days after birth/);
 assert.ok(postnatal.options.some((o,i)=>choiceRationaleParts(postnatal,i).some(p=>p.verdict==='incorrect'&&p.explanation.includes('assessment is needed now'))));
 const diabetic=byId.get('CH-032');
 assert.match(diabetic.rationale,/basal coverage while fasting/);
 assert.ok(diabetic.options.some(o=>o.rationale.includes('full basal dose may need adjustment')));
});

test('neurology and medication updates preserve the immediately preceding release',async()=>{
 assert.equal(archivedQuestionRevision(12),12);
 assert.equal(releaseForArchive(12),thirdCaseReviewRelease);
 assert.equal(await contentDigest(thirdCaseQuestions,clinicalCases),'7a43f7e4de4789e9e9b97b2cc9b6fafe0c1b4de597f75f573129488d837d883f');
 const previous=new Map(thirdCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===13);
 assert.ok(changed.length>=45);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,12),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('NP2-043-2').rationale,/airway and ventilation.*ordered antidote/s);
 assert.match(byId.get('NP2-058-2').rationale,/returned to baseline/);
 assert.match(byId.get('SIT-CROSS-laboratory-values-01-recognition').rationale,/6.7 mmol\/L.*severe hyperkalemia/);
 assert.match(byId.get('SIT-NP5-high-acuity-emergency-situations-01-R2-action').rationale,/give epinephrine promptly/);
 assert.match(byId.get('EXP2-NP4-seizure-disorders').rationale,/before conception.*Avoid abrupt cessation/s);
});

test('medication safety reviews distinguish symptomatic emergencies from preventive monitoring',async()=>{
 assert.equal(archivedQuestionRevision(13),13);
 assert.equal(releaseForArchive(13),fourthCaseReviewRelease);
 assert.equal(await contentDigest(fourthCaseQuestions,clinicalCases),'7f5bd9cfc250ce942705efb6f770130add7b421340fa18b979031c4978fc89c9');
 const previous=new Map(fourthCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===14);
 assert.equal(changed.length,64);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,13),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('NP5-109-2').rationale,/withholding the due dose.*urgent evaluation/s);
 assert.match(byId.get('NP5-111-2').rationale,/Remove further serotonergic exposure/);
 assert.match(byId.get('SIT-CROSS-pharmacology-drug-classes-04-action').rationale,/prioritize airway evaluation/);
 assert.match(byId.get('SIT-NP5-psychopharmacology-03-R2-action').rationale,/begin ECG monitoring/);
});

test('cardiovascular case explanations distinguish verified pulses, contraindications and shock findings',async()=>{
 assert.equal(archivedQuestionRevision(14),14);
 assert.equal(releaseForArchive(14),fifthCaseReviewRelease);
 assert.equal(await contentDigest(fifthCaseQuestions,clinicalCases),'7307743099c3b51d03b166c13c125164c7e0efeb507ffcddb1969f5671e45e14');
 const previous=new Map(fifthCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===15);
 assert.equal(changed.length,106);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,14),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('SIT-NP3-heart-anatomy-ecg-basics-03-action').rationale,/prompt defibrillation/);
 assert.match(byId.get('SIT-NP3-heart-anatomy-ecg-basics-04-action').rationale,/correct lead contact/);
 assert.match(byId.get('SIT-NP3-acute-coronary-syndrome-acs-03-reasoning').rationale,/within 24 hours.*below 90 mm Hg/);
 assert.match(byId.get('SIT-NP5-altered-tissue-perfusion-02-R2-reasoning').rationale,/Critical deterioration with delayed synchronization/);
 assert.match(byId.get('EXP2-NP5-multi-system-problems-shock-sepsis').rationale,/low qSOFA score does not rule out sepsis/);
});

test('respiratory case reviews distinguish silent chest, sensor errors, and interrupted ventilation',async()=>{
 assert.equal(archivedQuestionRevision(15),15);
 assert.equal(releaseForArchive(15),sixthCaseReviewRelease);
 assert.equal(await contentDigest(sixthCaseQuestions,clinicalCases),'7546e773cf9c341baaedb907755ee359150204cdbc13c1b916a5adf5a3743bba');
 const previous=new Map(sixthCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===16);
 assert.equal(changed.length,146);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,15),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('NP3-063-1').rationale,/life-threatening finding/);
 assert.match(byId.get('CROSS-013-2').rationale,/check waveform and pulse agreement/);
 assert.match(byId.get('SIT-NP2-pediatric-respiratory-disorders-01-R2-reasoning').rationale,/five back blows then five abdominal thrusts/);
 assert.match(byId.get('SIT-NP5-altered-ventilatory-function-02-evaluation').rationale,/partial evidence/);
 assert.match(byId.get('SIT-NP5-altered-ventilatory-function-03-R2-action').rationale,/Stop the trial and restore the prescribed/);
 const matchedReasons=[
  ['SIT-NP3-bronchial-asthma-02-recognition',/symptom improvement does not justify stopping/,/reduces exacerbation risk even when symptoms are absent/],
  ['SIT-NP3-bronchial-asthma-04-recognition',/Nonselective beta blockade/,/Propranolol is nonselective/],
  ['SIT-NP2-pediatric-respiratory-disorders-02-R2-recognition',/Pancreatic enzyme replacement must be available/,/present as food is digested/],
 ];
 for(const [id,text,reason] of matchedReasons){
  const q=byId.get(id);
  assert.match(q.options[q.correctIndex].text,text,id);
  assert.match(q.rationale,reason,id);
 }
});

test('endocrine reviews distinguish metabolic recovery from isolated readings and compare the appropriate emergency treatments',async()=>{
 assert.equal(archivedQuestionRevision(16),16);
 assert.equal(releaseForArchive(16),seventhCaseReviewRelease);
 assert.equal(await contentDigest(seventhCaseQuestions,clinicalCases),'b787516e167c4fa64d0864120380bf1f12b0986b8695bc466cff8da5867a5ed7');
 const previous=new Map(seventhCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===17);
 assert.equal(changed.length,121);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,16),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('NP4-086-2').rationale,/immediate parenteral hydrocortisone and IV isotonic saline/);
 assert.match(byId.get('NP4-088-2').rationale,/possible arginine vasopressin deficiency/);
 assert.match(byId.get('SIT-NP4-diabetes-mellitus-01-R2-action').rationale,/Pause before administering the due metformin/);
 assert.match(byId.get('EXP2-NP4-endocrine-emergencies-summary').rationale,/dextrose when glucose is below 250 mg\/dL.*until ketoacidosis resolves/);
 assert.match(byId.get('SIT-NP4-endocrine-emergencies-summary-04-evaluation').options[1].rationale,/3.1 mmol\/L still requires replacement/);
});

test('renal case reviews distinguish acute changes and misleading signs from confirmed kidney and electrolyte risks',async()=>{
 assert.equal(archivedQuestionRevision(17),17);
 assert.equal(releaseForArchive(17),eighthCaseReviewRelease);
 assert.equal(await contentDigest(eighthCaseQuestions,clinicalCases),'c81d1c4b9eb9e279b103cf9ddc471aa7d407533764aae0911287bf353758ef60');
 const previous=new Map(eighthCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===18);
 assert.equal(changed.length,96);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,17),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('NP2-060-2').rationale,/Edema can coexist with intravascular depletion/);
 assert.match(byId.get('SIT-NP3-acute-kidney-injury-aki-01-R2-recognition').rationale,/0.4 mg\/dL within 36 hours/);
 assert.match(byId.get('SIT-NP3-electrolyte-imbalances-02-recognition').rationale,/carpal spasms.*symptomatic hypocalcemia/);
 assert.match(byId.get('SIT-NP3-electrolyte-imbalances-04-recognition').rationale,/risen 5 mmol\/L in four hours/);
 assert.match(byId.get('EXP2-NP3-acid-base-balance-abg').rationale,/combined respiratory and metabolic acidosis/);
});

test('perioperative case reviews distinguish urgent patient risks from measurement, equipment and documentation errors',async()=>{
 assert.equal(archivedQuestionRevision(18),18);
 assert.equal(releaseForArchive(18),ninthCaseReviewRelease);
 assert.equal(await contentDigest(ninthCaseQuestions,clinicalCases),'751aa95bdb4d7740dc965f7959bdf9c62d54205c06dd1ea7b91572bf8615cf40');
 const previous=new Map(ninthCaseQuestions.map(q=>[q.id,q]));
 const changed=currentActive.filter(q=>q.questionRevision===19);
 assert.equal(changed.length,104);
 for(const q of changed){
  assert.equal(q.correctIndex,previous.get(q.id).correctIndex,q.id);
  assert.ok(questionNeedsArchive(q,18),q.id);
  assert.equal(new Set(q.options.map(o=>normalizeChoice(o.rationale))).size,4,q.id);
 }
 const byId=new Map(changed.map(q=>[q.id,q]));
 assert.match(byId.get('SIT-NP4-musculoskeletal-trauma-04-recognition').rationale,/palpable pulse does not exclude early compartment syndrome/);
 assert.match(byId.get('SIT-NP5-critical-care-equipment-01-R2-recognition').rationale,/falsely high pressure/);
 assert.match(byId.get('SIT-NP5-critical-care-equipment-01-R2-recognition').options[3].rationale,/transducer is too low/);
 assert.match(byId.get('SIT-CROSS-asepsis-iv-therapy-wound-care-02-evaluation').rationale,/further exposure stopped/);
 assert.match(byId.get('EXP2-NP5-critical-care-equipment').rationale,/hard limit blocks out-of-range programming/);
 assert.match(byId.get('EXP2-CROSS-asepsis-iv-therapy-wound-care').rationale,/fits stage 3/);
});
