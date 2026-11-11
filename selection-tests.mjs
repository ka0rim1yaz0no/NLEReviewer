import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,activeQuestions,clinicalCases,challengeQuestions} from './author-bank.ts';
import {contentDigest} from './content-integrity.ts';
import {initialState,recordAnswer,gradeSession,sessionScore} from './engine.ts';
import {curriculum,questionsForTopic} from './curriculum.ts';
import {isSituational} from './collections.ts';
import {mockQuestionIds} from './mock-papers.ts';
import {selectPractice,availablePractice,questionFamily,diagnosticQuestionIds,flashcardQueue,canonicalQuestionId,isDecisionQuestion} from './question-selection.ts';
import {applyRepetitionReview,restoreRepetitionReview} from './repetition-review.ts';
import retirements from './repetition-retirements.json' with {type:'json'};
import corrections from './repetition-corrections.json' with {type:'json'};
const bank=new Map(questions.map(q=>[q.id,q]));
const session=ids=>({id:'selection-check',title:'Selection check',kind:'practice',mode:'tutor',questionIds:ids,answers:{},flagged:[],eliminated:{},cursor:0,startedAt:1,scratch:'',highlights:{},strokes:{}});
const situationBank=activeQuestions.filter(isSituational);
test('two fresh sets reserve different situations before any question is answered',()=>{
 const state=initialState(),a=selectPractice(situationBank,state,50,10);
 assert.equal(a.length,50);assert.equal(new Set(a.map(questionFamily)).size,50);
 state.sessions.push(session(a));const b=selectPractice(situationBank,state,50,20);
 assert.equal(b.length,50);const old=new Set(a.map(questionFamily));assert.ok(b.every(id=>!old.has(questionFamily(id))));assert.equal(state.attempts.length,0);
});
test('all 156 topic quick sets use each situation once and never backfill earlier situations',()=>{
 for(const t of curriculum){
  const pool=questionsForTopic(t,situationBank),state=initialState(),count=availablePractice(pool,state);
  const ids=selectPractice(pool,state,100,30);assert.equal(ids.length,count,t.slug);assert.ok(count>=5,t.slug);
  assert.equal(new Set(ids.map(questionFamily)).size,ids.length,t.slug);
  state.sessions.push(session(ids));assert.deepEqual(selectPractice(pool,state,20,31),[],t.slug);
  const followups=selectPractice(pool,state,100,31,{allowRelated:true});assert.equal(followups.length,pool.length-ids.length,t.slug);assert.ok(followups.every(id=>!ids.includes(id)));
  assert.ok(selectPractice(pool,state,20,31,{filter:'all'}).length>0,t.slug);
 }
});
test('cross-topic mappings and retired equivalent IDs share the same reservation',()=>{
 const retired=retirements.find(r=>r.id==='CROSS-010-1'),target=bank.get(retired.replacedBy);
 const state=initialState();state.sessions.push(session([retired.id]));
 assert.equal(questionFamily(retired.id),questionFamily(target));
 assert.deepEqual(selectPractice(activeQuestions.filter(q=>q.caseId===target.caseId),state,20,3),[]);
 const alias=retirements.find(r=>r.kind==='redundant-fact');state.sessions.push(session([alias.id]));
 assert.deepEqual(selectPractice([bank.get(canonicalQuestionId(alias.id))],state,20,3),[]);
});
test('explicit review keeps all selected missed follow-ups while excluding archived items',()=>{
 const linked=situationBank.filter(q=>q.caseId==='SIT-NP3-pre-operative-phase-01').slice(0,4),ids=linked.map(q=>q.id),state=initialState();
 state.sessions.push(session(ids));state.vault=ids;
 state.attempts=linked.slice(0,3).map((q,i)=>({id:String(i),sessionId:'selection-check',questionId:q.id,selected:(q.correctIndex+1)%4,correct:false,confidence:'',at:i+1}));
 state.attempts.push({...state.attempts[2],id:'corrected',correct:true,selected:linked[2].correctIndex,at:4});
 assert.equal(selectPractice(linked,state,20,5,{review:true}).length,4);
 assert.deepEqual(new Set(selectPractice(linked,state,20,5,{filter:'missed',difficulty:'challenge'})),new Set(ids.slice(0,2)));
 assert.equal(selectPractice([...linked,...linked,questions.find(q=>q.retired)],state,100,5,{review:true}).length,4);
});
test('diagnostics have six fresh distinct situations per NP and fail closed if one NP is exhausted',()=>{
 const state=initialState(),ids=diagnosticQuestionIds(activeQuestions,state,12);assert.equal(ids.length,30);assert.equal(new Set(ids.map(questionFamily)).size,30);
 for(const np of ['NP1','NP2','NP3','NP4','NP5'])assert.equal(ids.filter(id=>bank.get(id).subject===np).length,6);
 state.sessions.push(session(ids));const second=diagnosticQuestionIds(activeQuestions,state,13);assert.equal(second.length,30);assert.ok(second.every(id=>!new Set(ids.map(questionFamily)).has(questionFamily(id))));
 state.sessions.push(session(situationBank.filter(q=>q.subject==='NP1').map(q=>q.id)));assert.deepEqual(diagnosticQuestionIds(activeQuestions,state,14),[]);
});
test('mock papers intentionally retain linked follow-ups and fixed disjoint selections',()=>{
 for(const np of ['NP1','NP2','NP3','NP4','NP5']){const seen=new Set();for(let board=1;board<=5;board++){const ids=mockQuestionIds(activeQuestions,np,board,[]);assert.equal(ids.length,100);assert.equal(new Set(ids.map(questionFamily)).size,16);for(const id of ids){assert.ok(!seen.has(id));seen.add(id);}}}
});
test('flashcards prioritize due items then fresh situations, one card per case',()=>{
 const pool=situationBank.map(q=>({id:q.id,deck:q.topic,front:q.stem,back:q.rationale})),state=initialState(),now=100000;
 const first=flashcardQueue(pool,state,activeQuestions,new Set(),20,now);assert.equal(first.length,20);assert.equal(new Set(first.map(c=>questionFamily(c.id))).size,20);
 const due=first[0],waiting=first[1];state.cards[due.id]={due:now-1,interval:1,reviews:1,lastAt:1};state.cards[waiting.id]={due:now+1000,interval:1,reviews:1,lastAt:1};
 const next=flashcardQueue(pool,state,activeQuestions,new Set(),20,now);assert.equal(next[0].id,due.id);assert.ok(!next.some(c=>questionFamily(c.id)===questionFamily(waiting.id)));assert.equal(new Set(next.map(c=>questionFamily(c.id))).size,next.length);
 const custom=[{id:'c1',deck:'D',front:'Clinical cue',back:'Reason'},{id:'c2',deck:'D',front:'Clinical cue',back:'Reason'},{id:'c3',deck:'D',front:'Other cue',back:'Other reason'}];assert.equal(flashcardQueue(custom,initialState(),[],new Set(),20,now).length,2);assert.equal(custom.length,3);
});
test('the content cleanup is bounded and fully restores the prior published release',async()=>{
 assert.equal(retirements.length,169);assert.equal(new Set(retirements.map(r=>r.id)).size,169);
 for(const r of retirements){assert.ok(bank.get(r.id)?.retired,r.id);if(r.replacedBy)assert.ok(!bank.get(canonicalQuestionId(r.id))?.retired,r.id);}
 const previous=questions.slice(0,-challengeQuestions.length),prior=restoreRepetitionReview(previous);assert.equal(await contentDigest(prior,clinicalCases),'e8a750c63e3161668582134dc864076dd057bda723e82eed1b47fff53aebbd90');assert.deepEqual(applyRepetitionReview(prior),previous);
 for(const q of previous){const old=prior.find(p=>p.id===q.id);assert.equal(q.correctIndex,old.correctIndex,q.id);assert.deepEqual(q.options.map(o=>o.text),old.options.map(o=>o.text),q.id);}
 for(const q of activeQuestions.filter(q=>q.format==='concept'||q.format==='comparison')){const refs=q.options.map(o=>canonicalQuestionId(o.referenceId));assert.equal(new Set(refs).size,4,`Equivalent reference choices in ${q.id}`);}
 assert.equal(corrections.rules.length,14);assert.equal(corrections.patches.length,65);
 for(const r of corrections.rules){for(const q of questions){for(const value of [q.stem,q.rationale,q.keyPoint,...q.options.map(o=>o.rationale)])assert.ok(!value.includes(r.from),`${r.id}: ${q.id}`);}assert.match(r.source,/^https:\/\//);}
 const patch=corrections.patches.find(p=>p.fields.some(f=>f.option===undefined&&f.field==='stem'));
 const corrupt=structuredClone(prior.find(q=>q.id===patch.id));corrupt.stem='Unreviewed edit';assert.throws(()=>applyRepetitionReview([corrupt]),/no longer matches/);
});
test('archived history still grades with its original key without altering earlier attempts',()=>{
 const q=bank.get('CROSS-010-1'),s=session([q.id]);s.answers[q.id]={selected:q.correctIndex,submitted:true,confidence:''};
 const state={...initialState(),sessions:[s]};const graded=gradeSession(state,s,bank,10);assert.equal(sessionScore(s,bank),1);assert.equal(graded.attempts[0].correct,true);assert.equal(state.attempts.length,0);
});

test('Challenge covers every topic and gives fresh original judgment items priority',()=>{
 const state=initialState(),options={difficulty:'challenge'};
 for(const topic of curriculum){
  const pool=questionsForTopic(topic,activeQuestions),count=availablePractice(pool,state,options);
  const ids=selectPractice(pool,state,count,44,options);
  assert.ok(count>=5,topic.slug);
  assert.equal(ids.length,count,topic.slug);
  assert.ok(ids.every(id=>isDecisionQuestion(bank.get(id))),topic.slug);
  assert.equal(new Set(ids.map(questionFamily)).size,ids.length,topic.slug);
 }
 const first=selectPractice(situationBank,state,20,45,options);
 assert.equal(first.length,20);assert.ok(first.every(id=>bank.get(id).difficulty==='challenge'));
 state.sessions.push(session(first));
 const second=selectPractice(situationBank,state,20,46,options);
 assert.ok(second.every(id=>bank.get(id).difficulty==='challenge'&&!first.includes(id)));
});
