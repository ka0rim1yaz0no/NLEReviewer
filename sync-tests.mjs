import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {initialState} from './engine.ts';
import {mergeStudyStates,mergeLegacyState,sameStudyState,readProfileCache,writeProfileCache} from './sync-state.ts';
import {synchronizeProgress} from './progress-sync.ts';
import {formatQuestionForDisplay} from './clinical-display.ts';
import {questions,originalQuestions} from './author-bank.ts';
import {validateBackup} from './validation.ts';
const copy=structuredClone;
const session=()=>({id:'shared-session',title:'QA',kind:'practice',mode:'tutor',questionIds:originalQuestions.slice(0,2).map(q=>q.id),answers:{},flagged:[],eliminated:{},cursor:0,startedAt:100,scratch:'',highlights:{},strokes:{}});
test('concurrent answers, notes and focus time merge without mutating either device',()=>{
 const base={...initialState(),sessions:[session()],studySeconds:60,studyLog:{'2026-11-05':60}},a=copy(base),b=copy(base);
 const [q1,q2]=originalQuestions;
 a.sessions[0].answers[q1.id]={selected:0,submitted:true,confidence:'sure'};b.sessions[0].answers[q2.id]={selected:1,submitted:true,confidence:'unsure'};
 a.attempts=[{id:'shared-session:'+q1.id,sessionId:'shared-session',questionId:q1.id,selected:0,correct:q1.correctIndex===0,confidence:'sure',at:200}];
 b.attempts=[{id:'shared-session:'+q2.id,sessionId:'shared-session',questionId:q2.id,selected:1,correct:q2.correctIndex===1,confidence:'unsure',at:210}];
 a.studySeconds=90;a.studyLog['2026-11-05']=90;b.studySeconds=105;b.studyLog['2026-11-05']=105;a.notes.left='device one';b.notes.right='device two';
 const before=[copy(a),copy(b)],merged=mergeStudyStates(base,a,b,300);
 assert.equal(merged.attempts.length,2);assert.equal(Object.keys(merged.sessions[0].answers).length,2);assert.equal(merged.studySeconds,135);assert.equal(merged.studyLog['2026-11-05'],135);assert.deepEqual(merged.notes,{left:'device one',right:'device two'});assert.deepEqual([a,b],before);
 assert.doesNotThrow(()=>validateBackup(merged));
});
test('the earliest submission remains authoritative when two devices answer one saved item',()=>{
 const base={...initialState(),sessions:[session()]},a=copy(base),b=copy(base),q=originalQuestions[0];
 const attempt={id:'shared-session:'+q.id,sessionId:'shared-session',questionId:q.id,correct:true,confidence:'sure'};
 a.attempts=[{...attempt,selected:q.correctIndex,at:200}];b.attempts=[{...attempt,selected:(q.correctIndex+1)%4,correct:false,at:300}];
 a.sessions[0].answers[q.id]={selected:q.correctIndex,submitted:true,confidence:'sure'};b.sessions[0].answers[q.id]={selected:(q.correctIndex+1)%4,submitted:true,confidence:'sure'};
 const merged=mergeStudyStates(base,a,b);assert.equal(merged.attempts.length,1);assert.equal(merged.attempts[0].selected,q.correctIndex);assert.equal(merged.sessions[0].answers[q.id].selected,q.correctIndex);
});
test('deleting a note or bookmark does not erase unrelated remote additions',()=>{
 const base={...initialState(),notes:{old:'remove'},bookmarks:['old']},a={...copy(base),notes:{},bookmarks:[]},b={...copy(base),notes:{old:'remove',new:'keep'},bookmarks:['old','new']};
 const next=mergeStudyStates(base,a,b);assert.deepEqual(next.notes,{new:'keep'});assert.deepEqual(next.bookmarks,['new']);
});
test('a stale tab does not restore unchanged sessions or tasks deleted on another device',()=>{
 const base={...initialState(),sessions:[session()],tasks:[{id:'task',title:'Read',date:'2026-11-05',done:false,type:'read'}]},local=copy(base),remote={...copy(base),sessions:[],tasks:[]};
 local.notes.new='Unrelated local edit';const merged=mergeStudyStates(base,local,remote);assert.deepEqual(merged.sessions,[]);assert.deepEqual(merged.tasks,[]);assert.equal(merged.notes.new,'Unrelated local edit');
});
test('upgrading an older cache preserves both histories without doubling historic time',()=>{
 const a=initialState(),b=initialState();a.studySeconds=120;b.studySeconds=90;a.studyLog={'2026-11-05':120};b.studyLog={'2026-11-05':90};a.notes.a='A';b.notes.b='B';
 const result=mergeLegacyState(a,b);assert.equal(result.studySeconds,120);assert.equal(result.studyLog['2026-11-05'],120);assert.deepEqual(result.notes,{a:'A',b:'B'});
});
test('a lost acknowledgement replays the same receipt and never doubles focus time',async()=>{
 const base=initialState(),local={...copy(base),studySeconds:30};let cache={state:local,base:{revision:1,data:base},pending:null},server={revision:1,data:base},calls=0;const receipts=new Set();
 const request=async(profile,pending)=>{calls++;const key=pending.clientId+':'+pending.sequence;if(!receipts.has(key)){assert.equal(pending.base.revision,server.revision);server={revision:server.revision+1,data:copy(pending.data)};receipts.add(key);throw new Error('Connection lost after commit');}return{saved:true,profileId:profile,...copy(server)};};
 const id=randomUUID();await assert.rejects(synchronizeProgress(id,randomUUID(),1,()=>cache,c=>cache=c,request));assert.ok(cache.pending);
 await synchronizeProgress(id,randomUUID(),1,()=>cache,c=>cache=c,request);assert.equal(calls,2);assert.equal(cache.pending,null);assert.equal(server.revision,2);assert.equal(cache.state.studySeconds,30);assert.ok(sameStudyState(cache.state,cache.base.data));
});
test('revision conflicts merge remote edits and edits made while saving exactly once',async()=>{
 const base=initialState(),local={...copy(base),studySeconds:20,notes:{a:'one'}},remote={...copy(base),studySeconds:40,notes:{b:'two'}};
 let cache={state:local,base:{revision:1,data:base},pending:null},calls=0;
 await synchronizeProgress(randomUUID(),randomUUID(),1,()=>cache,c=>cache=c,async(profile,pending)=>{
  if(++calls===1){cache={...cache,state:{...cache.state,studySeconds:25,notes:{...cache.state.notes,c:'while saving'}}};return{saved:false,profileId:profile,revision:2,data:remote};}
  assert.equal(pending.data.studySeconds,60);return{saved:true,profileId:profile,revision:3,data:pending.data};
 });
 assert.equal(cache.state.studySeconds,65);assert.equal(cache.base.data.studySeconds,60);assert.deepEqual(cache.state.notes,{b:'two',a:'one',c:'while saving'});assert.equal(cache.pending,null);
});
test('a wrong-profile receipt cannot replace the currently open workspace',async()=>{
 const base=initialState();let cache={state:{...copy(base),notes:{a:'keep'}},base:{revision:1,data:base},pending:null};
 await assert.rejects(synchronizeProgress(randomUUID(),randomUUID(),1,()=>cache,c=>cache=c,async()=>({saved:true,profileId:randomUUID(),revision:2,data:initialState()})),/profile could not be verified/);assert.equal(cache.state.notes.a,'keep');assert.ok(cache.pending);
});
test('compressed cache stores state and pending receipt atomically and rejects corrupt data',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const state=validateBackup(initialState()),base={revision:1,data:state},pending={clientId:randomUUID(),sequence:1,snapshot:state,base,data:state};writeProfileCache('qa',{state,base,pending});assert.equal(values.size,1);assert.deepEqual(readProfileCache('qa',validateBackup),{state,base,pending});values.set([...values.keys()][0],'damaged');assert.equal(readProfileCache('qa',validateBackup),null);delete globalThis.localStorage;
});
test('display separators preserve every word, choice position and source record',()=>{
 const alnum=text=>text.toLowerCase().replace(/[^a-z0-9]/g,'');let changed=0;
 for(const q of questions){const raw=copy(q),display=formatQuestionForDisplay(q);assert.deepEqual(q,raw);assert.equal(display.id,q.id);assert.equal(display.correctIndex,q.correctIndex);for(let i=0;i<4;i++){assert.equal(alnum(display.options[i].text),alnum(q.options[i].text));assert.equal(alnum(display.options[i].rationale),alnum(q.options[i].rationale));}if(JSON.stringify(display)!==JSON.stringify(q))changed++;}
 assert.ok(changed>=8);
});
