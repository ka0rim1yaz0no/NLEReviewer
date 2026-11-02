import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {questions,originalQuestions,supplementalQuestions,subjects,validateQuestions,shuffled,clinicalCases} from './author-bank.ts';
import {inCollection,collectionCounts} from './collections.ts';
import {decodeContentRelease} from './content-release.ts';
import {gzipSync} from 'node:zlib';
import publishedQuestions from './site-questions.json' with { type: 'json' };
import {additionalQuestions} from './additional-questions.ts';
import {practiceTopicRows} from './practice-metrics.ts';
import {savedTopicNotes} from './saved-notes.ts';
import {contentDigest,validateProtectedContent} from './content-integrity.ts';
import {needsUsername} from './access.ts';
import {auditQuestionBank,findDuplicateQuestions,referenceTotal,referenceCount,referenceSubjectCount} from './catalog-metrics.ts';
import {initialState,recordAnswer,gradeSession,firstAttempts,rating,dateKey,addDays,daysBetween,streak,longestStreak,scheduleCard,parseFlashcardText,sessionScore} from './engine.ts';
import {validateBackup} from './validation.ts';
import {curriculum,questionsForTopic,casesForTopic,questionsForSelection,resourceKeys} from './curriculum.ts';
const bank=new Map(questions.map(q=>[q.id,q]));
function session(ids=[questions[0].id]){return {id:'test-session',title:'Test',kind:'exam',mode:'exam',questionIds:ids,answers:{},flagged:[],eliminated:{},cursor:0,startedAt:100,scratch:'',highlights:{},strokes:{}};}
test('the 600 original questions and every published addition have unique stems, choices, rationales, and valid keys',()=>{
  assert.equal(originalQuestions.length,600);assert.equal(questions.length,600+additionalQuestions.length+supplementalQuestions.length+publishedQuestions.length);assert.equal(clinicalCases.length,120);assert.equal(validateQuestions(questions).length,questions.length);
  assert.equal(new Set(questions.map(q=>q.stem)).size,questions.length);
  for(const s of subjects)assert.equal(originalQuestions.filter(q=>q.subject===s.id).length,100);
  for(const q of questions){assert.ok(q.rationale.length>20);assert.equal(q.options[q.correctIndex].rationale,q.rationale);assert.ok(q.options.every(o=>o.rationale.length>20));}
});
test('answer positions are distributed and deterministic',()=>{const counts=[0,0,0,0];originalQuestions.forEach(q=>counts[q.correctIndex]++);counts.forEach(n=>assert.ok(n>80&&n<240,JSON.stringify(counts)));assert.deepEqual(shuffled([1,2,3,4],5),shuffled([1,2,3,4],5));assert.equal(new Set(shuffled(questions,7).map(q=>q.id)).size,questions.length);});
test('a submitted answer is scored once even after resubmission',()=>{const q=questions[0],s=session();let state=recordAnswer(initialState(),s,q,{selected:q.correctIndex,confidence:'sure',submitted:true},1000);state=recordAnswer(state,s,q,{selected:2,confidence:'',submitted:true},2000);assert.equal(state.attempts.length,1);assert.equal(state.attempts[0].correct,true);});
test('misses enter the vault and a later correct retry clears them without changing first-try accuracy',()=>{const q=questions[0],s=session();let state=recordAnswer(initialState(),s,q,{selected:(q.correctIndex+1)%4,confidence:'',submitted:true},1000);assert.deepEqual(state.vault,[q.id]);state=recordAnswer(state,{...s,id:'retry'},q,{selected:q.correctIndex,confidence:'',submitted:true},2000);assert.deepEqual(state.vault,[]);assert.equal(firstAttempts(state.attempts).length,1);assert.equal(rating(firstAttempts(state.attempts)),40);});
test('exam answers are not scored until submission; blank answers count as incorrect',()=>{const q=questions[0],q2=questions[1],s=session([q.id,q2.id]);s.answers[q.id]={selected:q.correctIndex,submitted:false,confidence:''};let state={...initialState(),sessions:[s]};assert.equal(state.attempts.length,0);state=gradeSession(state,s,bank,3000);assert.equal(state.attempts.length,2);assert.equal(state.attempts.filter(a=>a.correct).length,1);assert.equal(state.sessions[0].finishedAt,3000);assert.equal(sessionScore(s,bank),1);assert.equal(gradeSession(state,s,bank,4000).attempts.length,2);});
test('rating gates prevent claims from insufficient data',()=>{assert.equal(rating([],40),null);const qs=questions.slice(0,40),s=session(qs.map(q=>q.id));let state=initialState();for(const q of qs)state=recordAnswer(state,s,q,{selected:q.correctIndex,confidence:'',submitted:true},1000);assert.equal(rating(state.attempts,40),100);assert.equal(rating(state.attempts.slice(0,39),40),null);});
test('Manila day boundaries, leap dates, and target offsets are correct',()=>{assert.equal(dateKey(Date.parse('2026-11-02T16:00:00Z'),'Asia/Manila'),'2026-11-03');assert.equal(dateKey(Date.parse('2026-11-02T15:59:59Z'),'Asia/Manila'),'2026-11-02');assert.equal(addDays('2028-02-28',1),'2028-02-29');assert.equal(daysBetween('2026-11-02','2027-02-20'),110);});
test('streak counts consecutive study days and allows a current unstudied day',()=>{const now=dateKey(), yesterday=addDays(now,-1),before=addDays(now,-2);const attempts=[yesterday,before].map((d,i)=>({id:String(i),questionId:'x',sessionId:'x',correct:true,confidence:'',selected:0,at:Date.parse(d+'T04:00:00Z')}));assert.equal(streak(attempts,'Asia/Manila'),2);});
test('flashcard reviews schedule harder cards sooner and extend successful intervals',()=>{const again=scheduleCard(undefined,'again',1000),hard=scheduleCard(undefined,'hard',1000),good=scheduleCard(undefined,'good',1000),easy=scheduleCard(undefined,'easy',1000);assert.ok(again.due<hard.due&&hard.due<good.due&&good.due<easy.due);assert.equal(again.due,61000);assert.ok(scheduleCard(good,'good',2000).interval>good.interval);});
test('CSV and Anki text import preserve quoted commas, quotes, and multiline fields',()=>{const a=parseFlashcardText('Front,Back\n"First, clue","Line one\nLine two"\nSecond,"A ""quoted"" answer"','My deck');assert.equal(a.length,2);assert.equal(a[0].front,'First, clue');assert.equal(a[0].back,'Line one\nLine two');assert.equal(a[1].back,'A "quoted" answer');assert.equal(parseFlashcardText('A\tB\nC\tD','Deck').length,2);assert.throws(()=>parseFlashcardText('Only one column','Deck'));assert.throws(()=>parseFlashcardText('"Unclosed,answer','Deck'));});
test('question import rejects duplicate IDs, duplicate choices, missing rationale, and invalid answers',()=>{const q=structuredClone(questions[0]);assert.throws(()=>validateQuestions([q,q]));assert.throws(()=>validateQuestions([{...q,correctIndex:4}]));assert.throws(()=>validateQuestions([{...q,options:[q.options[0],q.options[0],q.options[2],q.options[3]]}]));assert.throws(()=>validateQuestions([{...q,rationale:''}]));assert.throws(()=>validateQuestions([{...q,options:q.options.map((o,i)=>i?o:{text:o.text})}]));});
test('backups restore valid state and reject data that would break study flows',()=>{const state=initialState();assert.equal(validateBackup(state).version,1);assert.throws(()=>validateBackup({...state,customCards:[{id:'x',front:5}]}));assert.throws(()=>validateBackup({...state,sessions:[{...session(),cursor:99}]}));assert.throws(()=>validateBackup({...state,sessions:[{...session(),answers:{[questions[0].id]:{selected:9,submitted:true}}}]}));assert.throws(()=>validateBackup({...state,profile:{...state.profile,timezone:'not-a-timezone'}}));const clean=validateBackup({...state,preferences:{...state.preferences,flashcardGoal:999},notes:{bad:123,good:'Remember this'}});assert.equal(clean.preferences.flashcardGoal,100);assert.equal(clean.notes.bad,undefined);assert.equal(clean.notes.good,'Remember this');});
test('earned streak milestones survive a later missed day',()=>{const attempts=['2026-01-01','2026-01-02','2026-01-03','2026-01-06'].map((date,i)=>({id:String(i),questionId:'x',sessionId:'x',correct:true,confidence:'',selected:0,at:Date.parse(date+'T04:00:00Z')}));assert.equal(longestStreak(attempts,'Asia/Manila'),3);});
test('repeated exam submission preserves the first completion time',()=>{const s=session();let state={...initialState(),sessions:[s]};state=gradeSession(state,s,bank,3000);assert.equal(gradeSession(state,s,bank,9999).sessions[0].finishedAt,3000);});
test('the full 155-topic catalog preserves the observed subject organization',()=>{assert.equal(curriculum.length,155);assert.equal(new Set(curriculum.map(t=>t.slug)).size,155);for(const [subject,count]of Object.entries({CROSS:12,NP1:32,NP2:22,NP3:29,NP4:37,NP5:23}))assert.equal(curriculum.filter(t=>t.subject===subject).length,count);});
test('topic practice uses real unique question IDs and keeps original answer keys',()=>{const covered=new Set();for(const topic of curriculum){const related=questionsForTopic(topic,questions);assert.equal(new Set(related.map(q=>q.id)).size,related.length);for(const q of related){assert.ok(bank.has(q.id));assert.equal(q.correctIndex,bank.get(q.id).correctIndex);covered.add(q.id);}}assert.equal(covered.size,questions.length);const hand=curriculum.find(t=>t.slug==='asepsis-iv-therapy-wound-care');assert.ok(casesForTopic(hand).some(c=>c.title==='Hand hygiene'));assert.ok(questionsForTopic(hand,questions).some(q=>q.id==='CROSS-001-1'));});
test('original additions give all 155 catalog topics real practice with sourced per-choice explanations',()=>{
 assert.equal(additionalQuestions.length,51);assert.equal(new Set(additionalQuestions.map(q=>q.topic)).size,51);
 for(const q of additionalQuestions){assert.ok(curriculum.some(t=>t.subject===q.subject&&t.name===q.topic));assert.ok(q.source.startsWith('https://'));assert.ok(q.origin.startsWith('Original NLE Reviewer'));assert.ok(q.options.every(o=>o.rationale.length>20));assert.equal(q.rationale,q.options[q.correctIndex].rationale);}
 const report=auditQuestionBank(questions);assert.equal(report.availableUniqueQuestions,questions.length);assert.ok(report.topics.every(t=>t.relatedAvailableCount>0));assert.equal(report.matchesReferenceDistribution,false);
});
test('the initial 600 published questions, options, keys, and cases stay unchanged for saved student progress',async()=>{
 assert.equal(await contentDigest(originalQuestions,clinicalCases),'001a9c92f0dc8ffff584719670f3475228acaf37c0e5565ba8bd25d40d542552');
});
test('catalog flashcards and planner selections resolve real questions once and keep legacy decks and note keys usable',()=>{
 for(const topic of curriculum)assert.deepEqual(questionsForSelection([topic.subject+':'+topic.slug],questions).map(q=>q.id),questionsForTopic(topic,questions).map(q=>q.id));
 const overlapping=['CROSS:laboratory-values','NP3:electrolyte-imbalances'];const selected=questionsForSelection(overlapping,questions);assert.equal(new Set(selected.map(q=>q.id)).size,selected.length);assert.ok(selected.length>0);
 assert.deepEqual(questionsForSelection(['CROSS:Infection prevention'],questions),questions.filter(q=>q.subject==='CROSS'&&q.topic==='Infection prevention'));
 assert.equal(questionsForSelection(['NP1:not-a-topic'],questions).length,0);
 assert.deepEqual(resourceKeys('NP1','Leprosy'),{read:'catalog:leprosy',note:'catalog:leprosy'});assert.deepEqual(resourceKeys('NP1','leprosy'),resourceKeys('NP1','Leprosy'));
 assert.deepEqual(resourceKeys('CROSS','Infection prevention'),{read:'CROSS:Infection prevention',note:'sheet:CROSS:Infection prevention'});
});
test('My Notes includes catalog and legacy resource notes without duplicating question notes',()=>{
 const notes={'catalog:leprosy':'Remember sensory assessment','sheet:CROSS:Infection prevention':'My earlier resource note',[questions[0].id]:'My question note','catalog:missing':'Unresolved imported metadata','sheet:bad:Topic':'Unknown subject','catalog:ards':'   '};
 const result=savedTopicNotes(notes,questions);assert.equal(result.length,2);assert.equal(result[0].title,'Leprosy');assert.equal(result[0].subject,'NP1');assert.equal(result[0].to,'/resources/read?topic=NP1%3Aleprosy');assert.equal(result[1].text,'My earlier resource note');
});
test('practice topic filters separate flags, bookmarks, and unresolved misses and preserve first-try scores',()=>{
 const q=additionalQuestions.find(q=>q.topic==='Leprosy'),saved=additionalQuestions.find(q=>q.topic==='Ear Anatomy, Assessment & Hearing Loss');
 const s={...session([q.id,saved.id]),flagged:[saved.id]};
 let state={...initialState(),sessions:[s],bookmarks:[saved.id]};
 state=recordAnswer(state,s,q,{selected:(q.correctIndex+1)%4,confidence:'',submitted:true},1000);
 let rows=practiceTopicRows(state,questions),row=rows.find(r=>r.topic.slug==='leprosy'),hearing=rows.find(r=>r.topic.slug==='ear-anatomy-assessment-hearing-loss');
 assert.deepEqual(row.missedIds,[q.id]);assert.equal(row.tried,1);assert.equal(row.flaggedIds.length,0);assert.deepEqual(hearing.flaggedIds,[saved.id]);assert.deepEqual(hearing.savedIds,[saved.id]);assert.equal(hearing.missedIds.length,0);
 state=recordAnswer(state,{...s,id:'topic-retry'},q,{selected:q.correctIndex,confidence:'',submitted:true},2000);
 // A later flag may return the item to the Vault; a correct latest answer is not an unresolved miss.
 state={...state,vault:[q.id],attempts:[...state.attempts].reverse()};
 row=practiceTopicRows(state,questions).find(r=>r.topic.slug==='leprosy');assert.equal(row.missedIds.length,0);assert.equal(row.tried,1);assert.equal(firstAttempts(state.attempts).find(a=>a.questionId===q.id).correct,false);
});
test('authorized imports are found by exact catalog name or slug without borrowing unrelated questions',()=>{const topic=curriculum.find(t=>t.slug==='leprosy');assert.equal(questionsForTopic(topic,originalQuestions).length,0);const imported={...questions[0],id:'import-leprosy',subject:'NP1',topic:topic.name};assert.deepEqual(questionsForTopic(topic,[imported]).map(q=>q.id),['import-leprosy']);});

test('reference counts cover all 155 topics and retain the observed 9,541-question distribution',()=>{
 assert.equal(referenceTotal,9541);assert.equal(referenceCount(curriculum.find(t=>t.slug==='laboratory-values')),186);assert.equal(referenceCount(curriculum.find(t=>t.slug==='nursing-process-prioritization')),206);
 assert.equal(curriculum.reduce((sum,t)=>sum+referenceCount(t),0),9541);
 assert.equal(subjects.reduce((sum,s)=>sum+referenceSubjectCount(s.id),0),9541);
 assert.equal(Math.min(...curriculum.map(referenceCount)),13);assert.equal(Math.max(...curriculum.map(referenceCount)),206);
});
test('a related question shown in multiple topics never increases the unique bank total',()=>{
 const report=auditQuestionBank(originalQuestions);assert.equal(report.availableUniqueQuestions,600);assert.equal(report.referenceTotal,9541);assert.equal(report.matchesReferenceDistribution,false);assert.equal(report.duplicateStems.length,0);
 assert.ok(report.topics.reduce((sum,t)=>sum+t.relatedAvailableCount,0)>report.availableUniqueQuestions);
 const t=curriculum.find(t=>t.slug==='leprosy'),q={...originalQuestions[0],id:'audit-exact',subject:t.subject,topic:t.name};const row=auditQuestionBank([q]).topics.find(row=>row.slug===t.slug);assert.equal(row.assignedCount,1);assert.equal(row.remaining,row.referenceCount-1);
});
test('different IDs, choice order, casing, and punctuation do not hide duplicate question stems',()=>{
 const q=originalQuestions[0],copy={...q,id:'new-id',stem:q.stem.toUpperCase().replaceAll('.', '!'),options:[...q.options].reverse(),correctIndex:3-q.correctIndex};
 assert.throws(()=>validateQuestions([q,copy]),/repeats another question stem/);assert.equal(findDuplicateQuestions([q,copy]).length,1);
 const legacy=validateBackup({...initialState(),importedQuestions:[copy]});assert.equal(legacy.importedQuestions[0].id,'new-id');const report=auditQuestionBank([q,copy]);assert.equal(report.availableUniqueQuestions,1);assert.equal(report.availableQuestionIds,2);
});

test('a 9,541-item structural fixture is fully audited without truncation or count inflation',()=>{
 // These are test fixtures only, never published educational question content.
 const fixtures=curriculum.flatMap(t=>Array.from({length:referenceCount(t)},(_,i)=>({...originalQuestions[0],id:`fixture-${t.slug}-${i}`,subject:t.subject,topic:t.name,stem:`AUTOMATED TEST FIXTURE ${t.slug} number ${i}; this is not educational content.`})));
 assert.equal(validateQuestions(fixtures).length,9541);const report=auditQuestionBank(fixtures);assert.equal(report.matchesReferenceDistribution,true);assert.equal(report.availableUniqueQuestions,9541);assert.equal(report.matchingTopics,155);assert.equal(report.duplicateStems.length,0);
});

test('malformed optional import metadata cannot become invalid React or flashcard content',()=>{
 const q={...originalQuestions[0],keyPoint:{bad:true},origin:{bad:true},source:42};const [clean]=validateQuestions([q]);assert.equal(clean.keyPoint,q.rationale);assert.equal(clean.origin,'Imported by you');assert.equal(clean.source,'');
});

test('every question, answer, rationale, note, and study route requires a username',()=>{
 for(const path of ['/','/dashboard','/questions','/topics','/topics/laboratory-values','/session/x','/results/x','/practice/session?mode=exam','/decks','/resources/read','/resources/bookmarks','/history','/settings','/profile','/mock/1'])assert.equal(needsUsername(path),true,path);
 for(const path of ['/login','/login?returnTo=%2Fquestions','/help','/about'])assert.equal(needsUsername(path),false,path);
});
test('protected content survives database JSON key ordering and rejects incomplete or altered answers',async()=>{
 const q=originalQuestions.slice(0,5),c=clinicalCases.slice(0,1),manifest={version:1,questionCount:q.length,caseCount:c.length,digest:await contentDigest(q,c)};
 const rows=[{id:'questions-0000',kind:'questions',data:q},{id:'cases-0000',kind:'cases',data:c},{id:'manifest',kind:'manifest',data:manifest}];
 function reorder(v){if(Array.isArray(v))return v.map(reorder);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).reverse().map(([k,value])=>[k,reorder(value)]));return v;}
 const loaded=await validateProtectedContent(reorder(rows));assert.deepEqual(loaded.questions,q);assert.deepEqual(loaded.cases,c);
 await assert.rejects(()=>validateProtectedContent(rows.filter(row=>row.kind!=='questions')),/incomplete/);
 const tampered=structuredClone(rows);tampered[0].data[0].correctIndex=(tampered[0].data[0].correctIndex+1)%4;await assert.rejects(()=>validateProtectedContent(tampered),/integrity check/);
 await assert.rejects(()=>validateProtectedContent([]),/manifest/);
});


test('only the two explicitly source-checked corrections are published from the research dataset',()=>{
 assert.equal(supplementalQuestions.length,2);assert.equal(questions.length,653+publishedQuestions.length);
 assert.deepEqual(collectionCounts(questions),{all:questions.length,nursing:651+publishedQuestions.length,supplemental:2});
 for(const q of supplementalQuestions){assert.ok(q.id.startsWith('MMCQA-'));assert.equal(q.collection,'supplemental');assert.equal(q.rationaleScope,undefined);assert.ok(q.source.includes('nhs.uk')||q.source.includes('nice.org.uk'));assert.ok(q.origin.includes('Source-based correction:'));assert.ok(curriculum.some(t=>t.subject===q.subject&&t.name===q.topic));assert.ok(q.options.every(o=>o.rationale.length>40));}
 for(const q of [...originalQuestions,...additionalQuestions]){assert.ok(inCollection(q,'nursing'));assert.ok(!inCollection(q,'supplemental'));}
});
test('all 651 prior questions and keys are unchanged after the larger import',async()=>{assert.equal(await contentDigest([...originalQuestions,...additionalQuestions],clinicalCases),'1c16de56f5474d9504440deb7fa4c0bc5108b85c29f4261852f993fc76b8ea56');});
test('compressed releases verify order, counts, payload integrity, and publication completeness',async()=>{
 const q=originalQuestions.slice(0,4),c=clinicalCases.slice(0,1),raw=Buffer.from(JSON.stringify({questions:q,cases:c})),base64=gzipSync(raw).toString('base64'),split=Math.floor(base64.length/2);
 const pages=[{id:'page-0000',kind:'page',data:base64.slice(0,split)},{id:'page-0001',kind:'page',data:base64.slice(split)}];
 const manifest={version:2,encoding:'gzip-base64',pages:2,questionCount:4,caseCount:1,bytes:raw.length,digest:await contentDigest(q,c)};
 const loaded=await decodeContentRelease(manifest,[...pages].reverse());assert.deepEqual(loaded.questions,q);assert.deepEqual(loaded.cases,c);
 await assert.rejects(()=>decodeContentRelease(manifest,pages.slice(0,1)),/incomplete/);
 await assert.rejects(()=>decodeContentRelease({...manifest,digest:'wrong'},pages),/integrity check/);
 await assert.rejects(()=>decodeContentRelease({...manifest,questionCount:5},pages),/incomplete/);
 await assert.rejects(()=>decodeContentRelease(manifest,[pages[0],{...pages[1],data:'broken'}]),/decoded/);
 await assert.rejects(()=>decodeContentRelease(manifest,[pages[0],{...pages[1],id:'page-0000'}]),/page is invalid/);
});

test('the contradictory source rash item is corrected before production publication',()=>{
 const q=supplementalQuestions.find(q=>q.sourceId==='a89ad909-3924-4cf8-803b-f0b2530a84ce');assert.equal(q.options[q.correctIndex].text,'Roseola');assert.equal(q.correctIndex,3);assert.equal(q.rationaleScope,undefined);assert.ok(q.origin.includes('Source-based correction:'));assert.ok(q.options.every(o=>o.rationale.length>40));
});

test('the ambiguous absorption item now tests the documented clozapine recommendation',()=>{
 const q=supplementalQuestions.find(q=>q.sourceId==='bf1f425b-d7e1-4ccf-98db-cc0fdd8237b2');assert.equal(q.options[q.correctIndex].text,'Clozapine');assert.ok(q.stem.includes('Adherence is confirmed'));assert.ok(q.stem.includes('two sequential antipsychotic trials'));assert.ok(!q.stem.includes('poor oral absorption'));
});

test('the authorized-import CLI starts, validates a new batch, rejects bad imports, and never publishes during check-only',async(t)=>{
 const directory=new URL('./outputs/',import.meta.url);
 await mkdir(directory,{recursive:true});
 const fixture=new URL(`import-cli-${crypto.randomUUID()}.json`,directory);
 t.after(()=>unlink(fixture));
 const target=new URL('./site-questions.json',import.meta.url),before=await readFile(target,'utf8');
 const q={id:'QA-IMPORT-ONLY',subject:curriculum[0].subject,topic:curriculum[0].slug,stem:'AUTOMATED IMPORT TEST FIXTURE ONLY. This is not an educational question.',options:['A','B','C','D'].map(text=>({text:`Fixture option ${text}`,rationale:'Automated fixture explanation only; never publish this item.'})),correctIndex:0,rationale:'Automated fixture explanation only; never publish this item.',source:'https://example.org/test-fixture',origin:'Automated structural fixture; never publish.'};
 function run(){return spawnSync(process.execPath,['--experimental-strip-types',fileURLToPath(new URL('./prepare-bank.mjs',import.meta.url)),fileURLToPath(fixture),'--check-only'],{cwd:fileURLToPath(new URL('./',import.meta.url)),encoding:'utf8'});}
 await writeFile(fixture,JSON.stringify([q]));
 let result=run();assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Validated 1 additional questions/);assert.match(result.stdout,new RegExp(`Resulting bank: ${questions.length+1} unique questions`));
 for(const [value,message]of [[{...q,id:questions[0].id},/ID already published/],[{...q,stem:questions[0].stem},/Duplicate published question/],[{...q,topic:'QA-NOT-A-CATALOG-TOPIC'},/exact catalog topic/],[{...q,options:q.options.slice(0,3)},/four choices/]]){
  await writeFile(fixture,JSON.stringify([value]));result=run();assert.notEqual(result.status,0);assert.match(result.stderr,message);
 }
 assert.equal(await readFile(target,'utf8'),before,'Check-only must leave the published bank untouched.');
});
