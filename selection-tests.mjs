import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,previousQuestions,activeQuestions,clinicalCases,challengeQuestions} from './author-bank.ts';
import {contentDigest} from './content-integrity.ts';
import {normalizeQuestionStem,validateQuestions} from './bank.ts';
import {initialState,recordAnswer,gradeSession,sessionScore,dailyAnswerCounts,sessionDeadline,linkedPracticeComplete} from './engine.ts';
import {curriculum,questionsForTopic} from './curriculum.ts';
import {isSituational} from './collections.ts';
import {practiceQuestionPool,practiceSessionQuestions,practiceSetupPath} from './practice-setup.ts';
import {completedMockSubjects,mergeMockClock,mockAttempts,mockRemaining,pauseMockClock,startMockClock} from './mock-progress.ts';
import {mockQuestionIds} from './mock-papers.ts';
import {selectPractice,selectQuickPractice,availablePractice,questionFamily,diagnosticQuestionIds,distinctQuestionSet,questionChoiceKey,flashcardQueue,canonicalQuestionId,isDecisionQuestion} from './question-selection.ts';
import {applyRepetitionReview,restoreRepetitionReview} from './repetition-review.ts';
import {newStudyQuestions} from './authored-update.mjs';
import {checkTypedAnswer,matchTiles,prepareSoloRound,rapidResult,recordGameRun} from './play-engine.ts';
import {freshFocusTimer,cleanFocusSettings,stopwatchGap} from './focus-timer.ts';
import retirements from './repetition-retirements.json' with {type:'json'};
import corrections from './repetition-corrections.json' with {type:'json'};
const bank=new Map(questions.map(q=>[q.id,q]));
const session=ids=>({id:'selection-check',title:'Selection check',kind:'practice',mode:'tutor',questionIds:ids,answers:{},flagged:[],eliminated:{},cursor:0,startedAt:1,scratch:'',highlights:{},strokes:{}});
const situationBank=activeQuestions.filter(isSituational);
test('the supplemental release preserves prior cases and adds 17 original skin and wound cases',{skip:!newStudyQuestions.length},async()=>{
 const all=[...activeQuestions,...newStudyQuestions];
 assert.equal(new Set(all.map(q=>normalizeQuestionStem(q.stem))).size,all.length);
 assert.equal(await contentDigest(newStudyQuestions.slice(0,60),[]),'eb2f42f9186d8ccbb85ee7712fce992362b8a7d5fd19bfb8ba4ca9f2f78d8460');
 assert.equal(newStudyQuestions.filter(q=>q.subject==='NP3'&&q.topic==='Integumentary Disorders & Burn Care').length,74);
 const skin=curriculum.find(t=>t.slug==='integumentary-disorders-burn-care');
 assert.equal(distinctQuestionSet(questionsForTopic(skin,all),true).length,80);
 assert.equal(newStudyQuestions.filter(q=>q.subject==='NP1'&&q.topic==='Expanded Program on Immunization (EPI)').length,3);
 const positions=[0,0,0,0];
 for(const q of newStudyQuestions){
  positions[q.correctIndex]++;
  assert.equal(q.options.length,4,q.id);
  assert.equal(q.rationale,q.options[q.correctIndex].rationale,q.id);
  assert.equal(new Set(q.options.map(o=>o.rationale)).size,4,q.id);
  assert.ok(q.options.every(o=>o.rationale.length>20&&o.source?.startsWith('https://')),q.id);
 }
 assert.deepEqual(positions,[19,20,19,19]);
});
test('solo games choose a full round without repeating a case or recall term',()=>{
 const all=[...activeQuestions,...newStudyQuestions];
 for(const subject of ['all','CROSS','NP1','NP2','NP3','NP4','NP5']){
  const rapid=prepareSoloRound(all,'rapid',subject,'',142,[]).questions;
  assert.equal(rapid.length,48,subject);
  assert.equal(new Set(rapid.map(questionFamily)).size,48,subject);
  const typed=prepareSoloRound(all,'type',subject,'',71,[]).questions;
  assert.equal(typed.length,10,subject);
  assert.equal(new Set(typed.map(q=>q.options[q.correctIndex].text.toLowerCase().trim())).size,10,subject);
  const match=prepareSoloRound(all,'match',subject,'',118,[]).questions;
  assert.equal(match.length,12,subject);
  for(let at=0;at<12;at+=4){
   const tiles=matchTiles(match.slice(at,at+4),95+at);
   assert.equal(tiles.length,8,subject);
   assert.equal(new Set(tiles.map(tile=>tile.label)).size,8,subject);
   assert.equal(tiles.filter(tile=>tile.questionId).length,4,subject);
  }
 }
});
test('Play updates its own history without writing attempts or duplicating runs',()=>{
 const state=initialState(),questionId=activeQuestions[0].id;
 const run={id:'test-rapid',mode:'rapid',startedAt:100,finishedAt:1000,score:0,right:0,answered:1,questionIds:[questionId]};
 const finished=recordGameRun(state,run,[questionId],true);
 assert.deepEqual(finished.attempts,state.attempts);assert.equal(finished.sessions,state.sessions);
 assert.deepEqual(finished.gameRuns,[run]);assert.ok(finished.vault.includes(questionId));
 assert.equal(recordGameRun(finished,run,[questionId],true),finished);
 assert.equal(rapidResult(true,2,35000,10000).score,200);
 assert.equal(rapidResult(false,3,35000,10000).deadline,25000);
 assert.equal(rapidResult(false,3,15000,10000).deadline,10000);
 assert.equal(checkTypedAnswer('  cpr  ','Cardiopulmonary resuscitation (CPR)'),true);
 assert.equal(checkTypedAnswer('respiration','Cardiopulmonary resuscitation (CPR)'),false);
});
test('a suspended stopwatch offers long gaps for confirmation and leaves Pomodoro unaffected',()=>{
 const settings=cleanFocusSettings();
 const stopwatch={...freshFocusTimer(settings,'stopwatch',5000),running:true};
 assert.equal(stopwatchGap(stopwatch,124999),null);
 assert.deepEqual(stopwatchGap(stopwatch,125000),{start:5000,end:125000});
 assert.equal(stopwatchGap({...stopwatch,running:false},125000),null);
 assert.equal(stopwatchGap({...stopwatch,mode:'pomodoro'},125000),null);
});
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
  const followups=selectPractice(pool,state,100,31,{allowRelated:true});
  assert.ok(followups.every(id=>!ids.includes(id)),t.slug);
  assert.equal(new Set(followups.map(id=>questionChoiceKey(bank.get(id)))).size,followups.length,t.slug);
  assert.ok(selectPractice(pool,state,20,31,{filter:'all'}).length>0,t.slug);
 }
});
test('subject shortcuts include their entire collection while topics can include related subjects',()=>{
 const full=[...activeQuestions,...newStudyQuestions];
 const scope={collection:'situational',subject:'NP3'};
 const subjectPool=practiceQuestionPool(full,scope);
 assert.deepEqual(subjectPool,full.filter(q=>q.subject==='NP3'&&isSituational(q)));
 const topic='pneumothorax-hemothorax-chest-tubes';
 const relatedTopic=curriculum.find(t=>t.slug===topic);
 assert.ok(relatedTopic);
 assert.deepEqual(practiceQuestionPool(full,{collection:'situational',topics:[topic]}),questionsForTopic(relatedTopic,full).filter(isSituational));
 assert.deepEqual(practiceQuestionPool(full,{...scope,topics:[topic]}),subjectPool.filter(q=>questionsForTopic(relatedTopic,full).includes(q)));
});
test('keyword practice matches choices and retains a narrow scope after exhaustion',()=>{
 const [base,other]=situationBank;
 const exact={...base,options:base.options.map((option,i)=>i===0?{...option,text:'Unique-breathing clue'}:option)};
 const scope={collection:'situational',subject:base.subject,keyword:' UNIQUE breathing '};
 const pool=practiceQuestionPool([exact,other],scope),state=initialState();
 assert.deepEqual(pool.map(q=>q.id),[base.id]);
 state.sessions.push(session([base.id]));
 assert.deepEqual(selectQuickPractice(pool,state,20,1).ids,[]);
 assert.equal(availablePractice(pool,state,{filter:'all'}),1);
 const url=new URL(practiceSetupPath({...scope,topics:['first','second'],difficulty:'mixed',exhausted:true,count:10}),'https://reviewer.test');
 assert.equal(url.searchParams.get('keyword'),'UNIQUE breathing');
 assert.equal(url.searchParams.get('np'),base.subject);
 assert.equal(url.searchParams.get('collection'),'situational');
 assert.deepEqual(url.searchParams.getAll('topic'),['first','second']);
 assert.equal(url.searchParams.get('exhausted'),'1');
});
test('timed completion keeps saved answers, records the deadline, and excludes blanks from daily totals',()=>{
 const [q,blank]=situationBank;
 const active={...session([q.id,blank.id]),mode:'exam',kind:'mock',startedAt:Date.parse('2026-11-11T15:59:00Z'),timeLimit:30};
 active.answers[q.id]={selected:q.correctIndex,submitted:false,confidence:'sure'};
 const deadline=sessionDeadline(active),state={...initialState(),sessions:[active]};
 const graded=gradeSession(state,active,bank,deadline+120000);
 assert.equal(graded.sessions[0].finishedAt,deadline);
 assert.equal(graded.attempts.length,2);
 assert.ok(graded.attempts.every(a=>a.at===deadline));
 assert.equal(graded.attempts[0].correct,true);
 assert.equal(graded.attempts[1].selected,-1);
 assert.deepEqual(graded.vault,[blank.id]);
 assert.deepEqual([...dailyAnswerCounts(graded.attempts,'Asia/Manila')],[['2026-11-11',1]]);
 assert.equal(gradeSession(graded,active,bank,deadline+180000),graded);
});
test('mock clocks pause off-screen and preserve time used during a resume on a different device',()=>{
 const [q]=situationBank;
 const started={...session([q.id]),kind:'mock',mode:'exam',startedAt:1000,timeLimit:60,mockClock:{remainingMs:60000,changedAt:1000}};
 const first=startMockClock(started,'phone',10000);
 assert.equal(sessionDeadline(first),70000);
 const paused=pauseMockClock(first,25000);
 assert.equal(mockRemaining(paused,86425000),45000);
 const resumed=startMockClock(paused,'laptop',86425000);
 assert.equal(sessionDeadline(resumed),86470000);
 assert.deepEqual(mergeMockClock(paused.mockClock,resumed.mockClock),resumed.mockClock);
 assert.deepEqual(mergeMockClock(resumed.mockClock,paused.mockClock),resumed.mockClock);
 const state={...initialState(),sessions:[resumed]};
 const finished=gradeSession(state,resumed,bank,86479000).sessions[0];
 assert.equal(finished.finishedAt,86470000);
 assert.equal(finished.mockClock.owner,undefined);
 assert.equal(finished.mockClock.remainingMs,0);
});
test('mock retakes keep the previous sections distinct',()=>{
 const subjects=['NP1','NP2','NP3','NP4','NP5'];
 const earlier=subjects.map((subject,i)=>({...session([situationBank[i].id]),id:'earlier-'+i,kind:'mock',mockBoard:1,subject,finishedAt:300}));
 const latest={...earlier[0],id:'later',mockAttempt:2,finishedAt:undefined};
 const grouped=mockAttempts([...earlier,latest],1);
 assert.deepEqual(grouped.map(([number])=>number),[2,1]);
 assert.equal(completedMockSubjects(grouped[0][1]).length,0);
 assert.equal(completedMockSubjects(grouped[1][1]).length,5);
});
test('Redo draws the due Vault questions including a game miss without a practice attempt',()=>{
 const [due,later,unseen]=situationBank;
 const state=initialState();
 state.vault=[due.id,later.id];state.preferences.spacedVault=true;
 state.vaultReviews={[later.id]:{due:Date.now()+60000,successes:0}};
 const pool=[due,later,unseen];
 assert.equal(availablePractice(pool,state,{filter:'vault'}),1);
 assert.deepEqual(selectPractice(pool,state,10,1,{filter:'vault'}),[due.id]);
});
test('a linked tutor set completes its moved plan task only when all answers are submitted',()=>{
 const [q1,q2]=situationBank,taskId='plan:practice:qa';
 const active={...session([q1.id,q2.id]),planTaskId:taskId};
 const state={...initialState(),sessions:[active],tasks:[{id:taskId,type:'practice',date:'2026-11-14',title:'Study session',done:false}]};
 const first={...active,answers:{[q1.id]:{selected:0,submitted:true,confidence:''}}};
 const partial=recordAnswer(state,first,q1,first.answers[q1.id],100);
 assert.equal(partial.tasks[0].done,false);
 const second={...first,answers:{...first.answers,[q2.id]:{selected:1,submitted:true,confidence:''}}};
 assert.equal(linkedPracticeComplete(second),true);
 const full=recordAnswer(partial,second,q2,second.answers[q2.id],150);
 assert.equal(full.tasks[0].done,true);
 assert.equal(full.tasks[0].date,state.tasks[0].date);
});
test('Match Up uses a different distractor for every clue even when choices overlap',()=>{
 const text=[['First','Shared','Alternative','Second'],['Second','Shared','First','Third'],['Third','Only third','First','Second'],['Fourth','Only fourth','First','Third']];
 const board=text.map((row,i)=>({...situationBank[i],correctIndex:0,options:row.map(label=>({text:label,rationale:''}))}));
 const tiles=matchTiles(board,512);
 assert.equal(tiles.length,8);
 assert.equal(new Set(tiles.map(tile=>tile.label)).size,8);
 assert.equal(tiles.filter(tile=>tile.questionId).length,4);
});
test('cross-topic mappings and retired equivalent IDs share the same reservation',()=>{
 const retired=retirements.find(r=>r.id==='CROSS-010-1'),target=bank.get(retired.replacedBy);
 const state=initialState();state.sessions.push(session([retired.id]));
 assert.equal(questionFamily(retired.id),questionFamily(target));
 assert.deepEqual(selectPractice(activeQuestions.filter(q=>q.caseId===target.caseId),state,20,3),[]);
 const alias=retirements.find(r=>r.kind==='redundant-fact');state.sessions.push(session([alias.id]));
 assert.deepEqual(selectPractice([bank.get(canonicalQuestionId(alias.id))],state,20,3),[]);
});
test('quick practice continues with different questions from familiar cases before exhaustion',()=>{
 for(const topic of curriculum){
  const pool=questionsForTopic(topic,situationBank).filter(isDecisionQuestion),state=initialState();
  const options={difficulty:'challenge',bank:questions};
  const fresh=selectQuickPractice(pool,state,100,40,options);
  assert.equal(fresh.followUp,false,topic.slug);
  assert.ok(fresh.ids.length>0,topic.slug);
  const assigned=new Set(),stems=new Set();
  let next=fresh;
  while(next.ids.length){
   assert.equal(new Set(next.ids.map(questionFamily)).size,next.ids.length,topic.slug);
   for(const id of next.ids){const stem=normalizeQuestionStem(bank.get(id).stem);assert.ok(!assigned.has(id)&&!stems.has(stem),id);assigned.add(id);stems.add(stem);}
   state.sessions.push(session(next.ids));
   next=selectQuickPractice(pool,state,100,41,options);
   assert.equal(next.followUp,!!next.ids.length,topic.slug);
  }
  assert.equal(availablePractice(pool,state,{...options,allowRelated:true}),0,topic.slug);
 }
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
test('diagnostics have 16 fresh distinct situations per NP and fail closed if one NP is exhausted',()=>{
 const state=initialState(),ids=diagnosticQuestionIds(activeQuestions,state,12);assert.equal(ids.length,80);assert.equal(new Set(ids.map(questionFamily)).size,80);
 assert.equal(new Set(ids.map(id=>questionChoiceKey(bank.get(id)))).size,80);
 for(const np of ['NP1','NP2','NP3','NP4','NP5'])assert.equal(ids.filter(id=>bank.get(id).subject===np).length,16);
 state.sessions.push(session(ids));const second=diagnosticQuestionIds(activeQuestions,state,13);assert.equal(second.length,80);assert.ok(second.every(id=>!new Set(ids.map(questionFamily)).has(questionFamily(id))));
 state.sessions.push(session(situationBank.filter(q=>q.subject==='NP1').map(q=>q.id)));assert.deepEqual(diagnosticQuestionIds(activeQuestions,state,14),[]);
});
test('mock papers preserve linked cases, use disjoint boards, and exclude repeated sets of choices',()=>{
 for(const np of ['NP1','NP2','NP3','NP4','NP5']){const seen=new Set();for(let board=1;board<=5;board++){
  const ids=mockQuestionIds(activeQuestions,np,board,[]);
  assert.equal(ids.length,100);
  const families=ids.map(questionFamily);
  assert.ok(new Set(families).size>=16&&new Set(families).size<100);
  assert.equal(new Set(ids.map(id=>questionChoiceKey(bank.get(id)))).size,100);
  for(const id of ids){assert.ok(!seen.has(id));seen.add(id);}
 }}
});
test('fresh practice, diagnostics and all 25 mock sections share the same assignment history',()=>{
 const state=initialState(),seen=new Set(),stems=new Set();
 const reserve=(ids,count)=>{
  assert.equal(ids.length,count);
  for(const id of ids){
   const stem=normalizeQuestionStem(bank.get(id).stem);
   assert.ok(!seen.has(id)&&!stems.has(stem),id);
   seen.add(id);stems.add(stem);
  }
  state.sessions.push({...session(ids),id:`selection-${state.sessions.length}`});
 };
 reserve(diagnosticQuestionIds(activeQuestions,state,53),80);
 for(const np of ['NP1','NP2','NP3','NP4','NP5']){
  const preferred=mockQuestionIds(activeQuestions,np,3);
  const known=new Set(preferred.slice(0,5));
  const pool=situationBank.filter(q=>q.subject===np);
  reserve(selectPractice(pool.filter(q=>known.has(q.id)),state,5,54,{allowRelated:true,bank:activeQuestions}),preferred.slice(0,5).filter(id=>!seen.has(id)).length);
  for(const board of [3,5,1,4,2])reserve(mockQuestionIds(activeQuestions,np,board,[],state),100);
  reserve(selectPractice(pool,state,20,55,{allowRelated:true,bank:activeQuestions}),20);
 }
});
test('an equivalent stem under a different ID is excluded from a fresh set, even across pools',()=>{
 const original=situationBank.find(q=>q.subject==='NP2');
 const copy={...original,id:'personal-copy',stem:original.stem.toUpperCase()+'!!'};
 const state=initialState();state.sessions.push(session([original.id]));
 assert.deepEqual(selectPractice([copy],state,1,4,{allowRelated:true,bank:[original,copy]}),[]);
 assert.deepEqual(selectPractice([copy],state,1,4,{filter:'all'}),[copy.id]);
});
test('mock sections use only unused items and refuse to start below 100',()=>{
 const pool=situationBank.filter(q=>q.subject==='NP3'),state=initialState();
 const remaining=distinctQuestionSet(pool).slice(-100),remainingIds=new Set(remaining.map(q=>q.id));
 state.sessions.push(session(pool.filter(q=>!remainingIds.has(q.id)).map(q=>q.id)));
 const section=mockQuestionIds(activeQuestions,'NP3',1,[],state);
 assert.equal(section.length,100);
 assert.deepEqual(new Set(section),new Set(remaining.map(q=>q.id)));
 state.sessions.push(session(section.slice(0,1)));
 assert.deepEqual(mockQuestionIds(activeQuestions,'NP3',1,[],state),[]);
});
test('every topic can start a fresh 80-question set with distinct stems, cases, and choices',()=>{
 const fullBank=[...activeQuestions,...newStudyQuestions],state=initialState();
 for(const topic of curriculum){
  const plan=practiceSessionQuestions(fullBank,state,{topics:[topic.slug],collection:'situational',difficulty:'challenge',quick:true},23);
  assert.equal(plan.questions.length,80,topic.slug);
  assert.equal(distinctQuestionSet(plan.questions,true).length,80,topic.slug);
  assert.ok(plan.focusedCount>0,topic.slug);
  const scopedIds=new Set(questionsForTopic(topic,fullBank).map(q=>q.id));
  assert.ok(plan.questions.slice(0,plan.focusedCount).every(q=>scopedIds.has(q.id)),topic.slug);
 }
});
test('short focused review sets keep the selected items first and can be kept strictly scoped',()=>{
 const state=initialState(),original=situationBank.find(q=>q.subject==='NP4');
 const reordered={...original,id:'reordered-options',stem:original.stem+' What will the nurse do?',options:[...original.options].reverse(),correctIndex:3-original.correctIndex};
 const fullBank=[...activeQuestions,reordered],scope={ids:[original.id,reordered.id],collection:'situational',review:true,count:6};
 const full=practiceSessionQuestions(fullBank,state,scope,17);
 assert.equal(full.focusedCount,1);
 assert.equal(full.questions.length,80);
 assert.equal(distinctQuestionSet(full.questions).length,80);
 assert.ok(full.questions.every(q=>q.subject===original.subject));
 assert.equal(practiceSessionQuestions(fullBank,state,{...scope,supplement:false},17).questions.length,1);
 state.vault=[original.id];
 const vault=practiceSessionQuestions(fullBank,state,{collection:'situational',filter:'vault'},17);
 assert.equal(vault.focusedCount,1);
 assert.equal(vault.questions.length,80);
 assert.equal(vault.questions[0].id,original.id);
 const malformed={...original,options:original.options.map((o,i)=>i===1?{...o,text:'  '+original.options[0].text+'!'}:o)};
 assert.throws(()=>validateQuestions([malformed]),/duplicate choices/);
});
test('small clinical and corrected-source collections can start complete sets with relevant nursing questions',()=>{
 const state=initialState();
 for(const scope of [{collection:'clinical',subject:'NP5'},{collection:'supplemental'}]){
  const plan=practiceSessionQuestions(activeQuestions,state,scope,17);
  const matchIds=new Set(practiceQuestionPool(activeQuestions,scope).map(q=>q.id));
  assert.equal(plan.questions.length,80);
  assert.equal(distinctQuestionSet(plan.questions,true).length,80);
  assert.ok(plan.focusedCount>0&&plan.focusedCount<80);
  assert.ok(plan.questions.slice(0,plan.focusedCount).every(q=>matchIds.has(q.id)));
 }
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
 const previous=previousQuestions.slice(0,-challengeQuestions.length),prior=restoreRepetitionReview(previous);assert.equal(await contentDigest(prior,clinicalCases),'e8a750c63e3161668582134dc864076dd057bda723e82eed1b47fff53aebbd90');assert.deepEqual(applyRepetitionReview(prior),previous);
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

test('Challenge covers every topic and rotates through the full decision pool',()=>{
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
 assert.equal(first.length,20);assert.ok(first.every(id=>isDecisionQuestion(bank.get(id))));
 assert.ok(first.some(id=>!id.startsWith('CH-')));
 state.sessions.push(session(first));
 const second=selectPractice(situationBank,state,20,46,options);
 assert.ok(second.every(id=>isDecisionQuestion(bank.get(id))&&!first.some(previous=>questionFamily(previous)===questionFamily(id))));
});
