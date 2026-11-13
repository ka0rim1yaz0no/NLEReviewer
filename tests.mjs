import {restoreRepetitionReview} from "./repetition-review.ts";
import retirements from "./editorial-retirements.json" with {type:"json"};
const retiredIds=new Set(retirements.map(r=>r.id));
import {applyReferenceRepairs,restoreReferenceRepairs,resolvedReference} from "./reference-repairs.ts";
import referencePatches from "./question-reference-patches.json" with {type:"json"};
import referenceResolutions from "./reference-resolutions.json" with {type:"json"};
const ectPriorCase='SIT-NP5-somatic-behavioral-therapies-01';
const beforeReferenceRepair=qs=>restoreReferenceRepairs(restoreRepetitionReview(qs.filter(q=>!challengeQuestions.some(added=>added.id===q.id)))).filter(q=>q.caseId!==ectPriorCase+'-R3').map(q=>{if(q.caseId!==ectPriorCase)return q;const copy={...q};delete copy.retired;return copy;});
const beforeEditorial=qs=>beforeReferenceRepair(qs).map(q=>{if(!retiredIds.has(q.id))return q;const copy={...q};delete copy.retired;return copy;});
import {vaultInterval,vaultIsDue,updateVaultReview} from "./vault-schedule.ts";
import {mockQuestionIds} from "./mock-papers.ts";
import {questionFamily} from "./question-selection.ts";
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {questions as revisedQuestions,previousQuestions as questions,originalQuestions,supplementalQuestions,conceptQuestions,situationalQuestions,challengeQuestions,subjects,validateQuestions,shuffled,clinicalCases} from './author-bank.ts';
import {inCollection,collectionCounts,parseCollection,isSituational} from './collections.ts';
import studyAdditions from './study-additions-summary.json' with {type:'json'};
import {decodeContentRelease,maximumReleaseBytes} from './content-release.ts';
import {processContentRelease} from './content-processing.ts';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {makeTopicGuide,pdfText} from './pdf-guides.ts';
import pdfCatalog from './pdf-library-catalog.json' with {type:'json'};
import publishedQuestions from './site-questions.json' with { type: 'json' };
import {additionalQuestions} from './additional-questions.ts';
import {practiceTopicRows} from './practice-metrics.ts';
import {savedTopicNotes} from './saved-notes.ts';
import {contentDigest,validateProtectedContent} from './content-integrity.ts';
import {canAccessPDFs,needsUsername,profilePickerEntries} from './access.ts';
import {buildStudyPlan,planSettings,validatePlanSettings,spreadUnfinishedTasks,applyTaskOverrides,undoTaskOverrides,shiftCalendar,calendarDates,exportStudyCalendar} from './planning.ts';
import {advanceFocusTimer,cleanFocusSettings,freshFocusTimer,focusCredits,applyStudyCredits} from './focus-timer.ts';
import {studyTargets} from './review-targets.ts';
import {auditQuestionBank,findDuplicateQuestions,referenceTotal,referenceCount,referenceSubjectCount} from './catalog-metrics.ts';
import {initialState,recordAnswer,gradeSession,firstAttempts,rating,dateKey,addDays,daysBetween,streak,longestStreak,scheduleCard,parseFlashcardText,sessionScore} from './engine.ts';
import {validateBackup} from './validation.ts';
import {curriculum,questionsForTopic,casesForTopic,questionsForSelection,resourceKeys} from './curriculum.ts';
const activeQuestions=questions.filter(q=>!q.retired);
const legacyCatalog=curriculum.filter(t=>t.slug!=='integumentary-disorders-burn-care');
const bank=new Map(questions.map(q=>[q.id,q]));
test('all 156 PDF guides include sourced active situational points and exclude archived records',()=>{
 for(const topic of curriculum){
  const guide=makeTopicGuide(topic,questions,clinicalCases);
  assert.ok(guide.sections.length>0,topic.slug);assert.ok(guide.references.length>0,topic.slug);
  const expected=questionsForTopic(topic,questions).filter(isSituational);
  assert.equal(guide.questionCount,expected.length,topic.slug);
  const points=guide.sections.flatMap(s=>s.points);assert.ok(points.length>0);
  for(const p of points){assert.ok(p.text.trim().length>0);assert.ok(guide.references[p.reference-1].startsWith('https://'));}
  for(const p of points.filter(p=>p.avoid))assert.ok(p.text.startsWith('Avoid: '));
  const retired=questions.filter(q=>q.retired&&q.topic===topic.name);
  for(const q of retired)assert.ok(!points.some(p=>p.text===q.keyPoint),q.id);
 }
 assert.equal(pdfText('A−B — C–D'),'A-B - C-D');
 const mobility=makeTopicGuide(curriculum.find(t=>t.slug==='basic-needs-mobility-comfort-elimination-oxygenation'),questions,clinicalCases);
 const unsafe=mobility.sections.flatMap(s=>s.points).find(p=>p.text.includes('Send the dizzy patient to walk alone'));
 assert.ok(unsafe?.avoid);assert.ok(unsafe.text.startsWith('Avoid: '));
 const labs=makeTopicGuide(curriculum.find(t=>t.slug==='laboratory-values'),questions,clinicalCases);
 const potassium=labs.sections.find(s=>s.points.some(p=>p.avoid&&p.text.includes('Administer an additional potassium supplement')));
 assert.ok(potassium);
 assert.ok(potassium.points.some(p=>p.avoid&&!p.text.includes('appropriate response')));
 assert.ok(potassium.points.some(p=>!p.avoid&&p.text.includes('Start urgent cardiac monitoring')));
});
test('PDF resources preserve all BoardPal reader links and distinguish files from publisher pages',()=>{
 assert.equal(pdfCatalog.boardpalReaders.length,47);assert.equal(new Set(pdfCatalog.boardpalReaders.map(r=>r.url)).size,47);
 assert.deepEqual(['CROSS','NP1','NP2','NP3','NP4','NP5'].map(s=>pdfCatalog.boardpalReaders.filter(r=>r.subject===s).length),[9,9,7,8,8,6]);
 assert.equal(pdfCatalog.references.filter(r=>r.kind==='pdf').length,12);
 for(const r of pdfCatalog.boardpalReaders)assert.match(r.url,/^https:\/\/www\.nleboardpal\.com\/(resources\/cram\/[a-f0-9-]+|pnle\/cram-sheets\/[a-z0-9-]+)$/);
 for(const r of pdfCatalog.references){assert.equal(new URL(r.url).protocol,'https:');if(r.kind==='pdf'){assert.match(r.url,/\.pdf(?:[?#]|$)/i);assert.ok(Number.isInteger(r.pages)&&r.pages>0);}}
 assert.ok(needsUsername('/resources/pdfs'));assert.ok(needsUsername('/resources/pdfs?topic=NP4:neuroanatomy-assessment-basics'));
});
test('the standalone expansion adds one reviewed scenario per topic without changing any prior payload',async()=>{
 const added=publishedQuestions.filter(q=>q.id.startsWith('EXP2-')&&!q.retired);
 const report=JSON.parse(await readFile(new URL('./expansion-review.json',import.meta.url),'utf8'));
 assert.equal(added.length,155);assert.equal(report.independentClinicianApproval,false);
 assert.equal(createHash('sha256').update(JSON.stringify(added,null,2)+'\n').digest('hex'),report.candidateSha256);
 assert.deepEqual(report.reviewedQuestionIds,added.map(q=>q.id));
 for(const topic of legacyCatalog)assert.equal(added.filter(q=>q.subject===topic.subject&&q.topic===topic.name).length,1,topic.slug);
 const positions=[0,0,0,0];
 for(const q of added){assert.ok(isSituational(q));positions[q.correctIndex]++;assert.equal(q.options.length,4);assert.ok(q.clinicalObjective);assert.ok(q.origin.includes('No BoardPal'));for(const o of q.options){assert.ok(o.rationale.length>=70);assert.match(o.source,/^https:\/\//);assert.ok(o.referenceId.startsWith(q.id+':'));}}
 assert.deepEqual(positions,[39,39,39,38]);
 assert.equal(validateQuestions(questions).length,10694);
 assert.equal(await contentDigest(beforeEditorial(questions.filter(q=>!q.id.startsWith('EXP2-'))),clinicalCases),report.previousContentDigest);
});
test('standalone calculation keys match the stated units and clinical quantities',()=>{
 const key=slug=>publishedQuestions.find(q=>(q.id.endsWith(slug)||q.id.endsWith(slug+'-R2'))).options[publishedQuestions.find(q=>(q.id.endsWith(slug)||q.id.endsWith(slug+'-R2'))).correctIndex].text;
 assert.ok(key('dosage-calculation-medication-administration').startsWith(String(Math.round(1000*15/(8*60)))));
 assert.equal(45/1000*100,4.5);assert.equal(key('epidemiology-vital-statistics-demography'),'4.5%');
 assert.equal(key('ards'),`${6*50} mL`);assert.equal(key('site-specific-cancers'),`${1800-1500} mL`);
 assert.match(key('neuroanatomy-assessment-basics'),/verbal component not testable/);
 assert.ok(key('altered-tissue-perfusion').startsWith(String((82+2*40)/3)));
 assert.ok(key('acid-base-balance-abg').includes('respiratory and metabolic acidosis'));
});
test('overlapping expansion items receive new IDs while every briefly published payload remains intact',async()=>{
 const report=JSON.parse(await readFile(new URL('./expansion-review.json',import.meta.url),'utf8'));
 const previous=report.previousExpansionQuestionIds.map(id=>{const q={...restoreReferenceRepairs([bank.get(id)])[0]};assert.ok(q.id,id);delete q.retired;return q;});
 assert.equal(previous.length,155);
 assert.equal(createHash('sha256').update(JSON.stringify(previous,null,2)+'\n').digest('hex'),report.previousExpansionCandidateSha256);
 for(const [id,change] of Object.entries(report.postPublicationReplacements)){
  assert.equal(bank.get(id).retired,true,id);assert.ok(!bank.get(id+change.replacementSuffix).retired,id);
  const before=bank.get(id),after=bank.get(id+change.replacementSuffix);
  assert.notEqual(before.stem,after.stem,id);assert.notEqual(before.options[before.correctIndex].text,after.options[after.correctIndex].text,id);
 }
});
// Roll back only the explicitly documented context/reference adjustments when
// checking the original release digests. All stems, options, keys, and facts
// outside this small allowlist must still match the deployed snapshots.
const legacyContext=JSON.parse(await readFile(new URL('./legacy-context-corrections.json',import.meta.url),'utf8'));
const legacyRationaleBaseline=JSON.parse(await readFile(new URL('./legacy-rationale-baseline.json',import.meta.url),'utf8'));
const legacyRationaleMap=new Map(legacyRationaleBaseline.questions.map(q=>[q.id,q]));
function beforeAudit(qs=originalQuestions){return beforeEditorial(qs).map(q=>{
 if(!originalQuestions.some(o=>o.id===q.id))return q;
 let stem=q.stem;for(const c of legacyContext)stem=stem.replace(c.current,c.previous);
 const baseline=legacyRationaleMap.get(q.id);
 return {...q,stem,rationale:baseline.rationale,keyPoint:baseline.keyPoint,source:'https://www.ncbi.nlm.nih.gov/books/NBK590025/',options:q.options.map(({source,contextSource,referenceId,...o},index)=>({...o,rationale:baseline.optionRationales[index]}))};
});}
const casesBeforeAudit=legacyRationaleBaseline.cases.map(c=>({...c,scenario:legacyContext.find(x=>x.current===c.scenario)?.previous??c.scenario}));
function session(ids=[questions[0].id]){return {id:'test-session',title:'Test',kind:'exam',mode:'exam',questionIds:ids,answers:{},flagged:[],eliminated:{},cursor:0,startedAt:100,scratch:'',highlights:{},strokes:{}};}
test('the 600 original questions and every published addition have unique stems, choices, rationales, and valid keys',()=>{
  assert.equal(originalQuestions.length,600);assert.equal(questions.length,600+additionalQuestions.length+supplementalQuestions.length+conceptQuestions.length+situationalQuestions.length+publishedQuestions.length+challengeQuestions.length);assert.equal(clinicalCases.length,120);assert.equal(validateQuestions(questions).length,questions.length);
  assert.equal(new Set(questions.map(q=>q.stem)).size,questions.length);
  for(const s of subjects)assert.equal(originalQuestions.filter(q=>q.subject===s.id).length,100);
  for(const q of questions){assert.ok(q.rationale.length>20);assert.equal(q.options[q.correctIndex].rationale,q.rationale);assert.ok(q.options.every(o=>o.rationale.length>20));}
});
test('answer positions are distributed and deterministic',()=>{const counts=[0,0,0,0];originalQuestions.forEach(q=>counts[q.correctIndex]++);counts.forEach(n=>assert.ok(n>80&&n<240,JSON.stringify(counts)));assert.deepEqual(shuffled([1,2,3,4],5),shuffled([1,2,3,4],5));assert.equal(new Set(shuffled(questions,7).map(q=>q.id)).size,questions.length);});
test('a submitted answer is scored once even after resubmission',()=>{const q=questions[0],s=session();let state=recordAnswer(initialState(),s,q,{selected:q.correctIndex,confidence:'sure',submitted:true},1000);state=recordAnswer(state,s,q,{selected:2,confidence:'',submitted:true},2000);assert.equal(state.attempts.length,1);assert.equal(state.attempts[0].correct,true);});
test('misses enter the vault and a later correct retry clears them without changing first-try accuracy',()=>{const q=questions[0],s=session();let state=recordAnswer(initialState(),s,q,{selected:(q.correctIndex+1)%4,confidence:'',submitted:true},1000);assert.deepEqual(state.vault,[q.id]);state=recordAnswer(state,{...s,id:'retry'},q,{selected:q.correctIndex,confidence:'',submitted:true},2000);assert.deepEqual(state.vault,[]);assert.equal(firstAttempts(state.attempts).length,1);assert.equal(rating(firstAttempts(state.attempts)),40);});
test('exam answers are not scored until submission; blank answers count as incorrect',()=>{const q=questions[0],q2=questions[1],s=session([q.id,q2.id]);s.answers[q.id]={selected:q.correctIndex,submitted:false,confidence:''};let state={...initialState(),sessions:[s]};assert.equal(state.attempts.length,0);state=gradeSession(state,s,bank,3000);assert.equal(state.attempts.length,2);assert.equal(state.attempts.filter(a=>a.correct).length,1);assert.equal(state.sessions[0].finishedAt,3000);assert.equal(sessionScore(s,bank),1);assert.equal(gradeSession(state,s,bank,4000).attempts.length,2);});

test('an unavailable question never creates a phantom correct answer',()=>{const q=questions[0],s=session([q.id,'missing-question']);assert.equal(sessionScore(s,bank),0);s.answers[q.id]={selected:q.correctIndex,submitted:false,confidence:''};assert.equal(sessionScore(s,bank),1);s.answers['missing-question']={selected:0,submitted:false,confidence:''};assert.equal(sessionScore(s,bank),1);});
test('rating gates prevent claims from insufficient data',()=>{assert.equal(rating([],40),null);const qs=questions.slice(0,40),s=session(qs.map(q=>q.id));let state=initialState();for(const q of qs)state=recordAnswer(state,s,q,{selected:q.correctIndex,confidence:'',submitted:true},1000);assert.equal(rating(state.attempts,40),100);assert.equal(rating(state.attempts.slice(0,39),40),null);});
test('Manila day boundaries, leap dates, and target offsets are correct',()=>{assert.equal(dateKey(Date.parse('2026-11-02T16:00:00Z'),'Asia/Manila'),'2026-11-03');assert.equal(dateKey(Date.parse('2026-11-02T15:59:59Z'),'Asia/Manila'),'2026-11-02');assert.equal(addDays('2028-02-28',1),'2028-02-29');assert.equal(daysBetween('2026-11-02','2027-02-20'),110);});
test('streak counts consecutive study days and allows a current unstudied day',()=>{const now=dateKey(), yesterday=addDays(now,-1),before=addDays(now,-2);const attempts=[yesterday,before].map((d,i)=>({id:String(i),questionId:'x',sessionId:'x',correct:true,confidence:'',selected:0,at:Date.parse(d+'T04:00:00Z')}));assert.equal(streak(attempts,'Asia/Manila'),2);});
test('flashcard reviews schedule harder cards sooner and extend successful intervals',()=>{const again=scheduleCard(undefined,'again',1000),hard=scheduleCard(undefined,'hard',1000),good=scheduleCard(undefined,'good',1000),easy=scheduleCard(undefined,'easy',1000);assert.ok(again.due<hard.due&&hard.due<good.due&&good.due<easy.due);assert.equal(again.due,61000);assert.ok(scheduleCard(good,'good',2000).interval>good.interval);});
test('CSV and Anki text import preserve quoted commas, quotes, and multiline fields',()=>{const a=parseFlashcardText('Front,Back\n"First, clue","Line one\nLine two"\nSecond,"A ""quoted"" answer"','My deck');assert.equal(a.length,2);assert.equal(a[0].front,'First, clue');assert.equal(a[0].back,'Line one\nLine two');assert.equal(a[1].back,'A "quoted" answer');assert.equal(parseFlashcardText('A\tB\nC\tD','Deck').length,2);assert.throws(()=>parseFlashcardText('Only one column','Deck'));assert.throws(()=>parseFlashcardText('"Unclosed,answer','Deck'));});
test('Anki imports skip export headers and metadata columns and detect separators outside quotes',()=>{
 const pairs=text=>parseFlashcardText(text,'Test deck').map(({front,back})=>[front,back]);
 assert.deepEqual(pairs('\uFEFF#separator:tab\r\n#html:false\r\n#guid column:1\r\n#tags column:4\r\nx123\tQuestion\tAnswer with, commas\tcard tag\r\n'),[['Question','Answer with, commas']]);
 assert.deepEqual(pairs('#separator:semicolon\n#columns:Front;Back\n"A; clue";"A\nlong answer"'),[['A; clue','A\nlong answer']]);
 assert.deepEqual(pairs('"A\tclue",Back\nSecond,Another answer'),[['A\tclue','Back'],['Second','Another answer']]);
 assert.throws(()=>pairs('#separator:tab\n#guid column:1\nignored\tMissing back'),/needs a front and back/);
});
test('question import rejects duplicate IDs, duplicate choices, missing rationale, and invalid answers',()=>{const q=structuredClone(questions[0]);assert.throws(()=>validateQuestions([q,q]));assert.throws(()=>validateQuestions([{...q,correctIndex:4}]));assert.throws(()=>validateQuestions([{...q,options:[q.options[0],q.options[0],q.options[2],q.options[3]]}]));assert.throws(()=>validateQuestions([{...q,rationale:''}]));assert.throws(()=>validateQuestions([{...q,options:q.options.map((o,i)=>i?o:{text:o.text})}]));});
test('backups restore valid state and reject data that would break study flows',()=>{const state=initialState();assert.equal(validateBackup(state).version,1);assert.throws(()=>validateBackup({...state,customCards:[{id:'x',front:5}]}));assert.throws(()=>validateBackup({...state,sessions:[{...session(),cursor:99}]}));assert.throws(()=>validateBackup({...state,sessions:[{...session(),answers:{[questions[0].id]:{selected:9,submitted:true}}}]}));assert.throws(()=>validateBackup({...state,profile:{...state.profile,timezone:'not-a-timezone'}}));const clean=validateBackup({...state,preferences:{...state.preferences,flashcardGoal:999},notes:{bad:123,good:'Remember this'}});assert.equal(clean.preferences.flashcardGoal,100);assert.equal(clean.notes.bad,undefined);assert.equal(clean.notes.good,'Remember this');});
test('earned streak milestones survive a later missed day',()=>{const attempts=['2026-01-01','2026-01-02','2026-01-03','2026-01-06'].map((date,i)=>({id:String(i),questionId:'x',sessionId:'x',correct:true,confidence:'',selected:0,at:Date.parse(date+'T04:00:00Z')}));assert.equal(longestStreak(attempts,'Asia/Manila'),3);});
test('repeated exam submission preserves the first completion time',()=>{const s=session();let state={...initialState(),sessions:[s]};state=gradeSession(state,s,bank,3000);assert.equal(gradeSession(state,s,bank,9999).sessions[0].finishedAt,3000);});
test('the full 156-topic catalog preserves the observed subject organization',()=>{assert.equal(curriculum.length,156);assert.equal(new Set(curriculum.map(t=>t.slug)).size,156);for(const [subject,count]of Object.entries({CROSS:12,NP1:32,NP2:22,NP3:30,NP4:37,NP5:23}))assert.equal(curriculum.filter(t=>t.subject===subject).length,count);});
test('topic practice uses real unique question IDs and keeps original answer keys',()=>{const covered=new Set();for(const topic of curriculum){const related=questionsForTopic(topic,questions);assert.equal(new Set(related.map(q=>q.id)).size,related.length);for(const q of related){assert.ok(bank.has(q.id));assert.equal(q.correctIndex,bank.get(q.id).correctIndex);covered.add(q.id);}}assert.equal(covered.size,questions.length);const hand=curriculum.find(t=>t.slug==='asepsis-iv-therapy-wound-care');assert.ok(casesForTopic(hand).some(c=>c.title==='Hand hygiene'));assert.ok(questionsForTopic(hand,questions).some(q=>q.id==='CROSS-001-1'));});
test('original additions give all 156 catalog topics real practice with sourced per-choice explanations',()=>{
 assert.equal(additionalQuestions.length,51);assert.equal(new Set(additionalQuestions.map(q=>q.topic)).size,51);
 for(const q of additionalQuestions){assert.ok(curriculum.some(t=>t.subject===q.subject&&t.name===q.topic));assert.ok(q.source.startsWith('https://'));assert.ok(q.origin.startsWith('Original NLE Reviewer'));assert.ok(q.options.every(o=>o.rationale.length>20));assert.equal(q.rationale,q.options[q.correctIndex].rationale);}
 const report=auditQuestionBank(questions);assert.equal(report.availableUniqueQuestions,questions.length);assert.ok(report.topics.every(t=>t.relatedAvailableCount>0));assert.equal(report.matchesReferenceDistribution,false);
});
test('the initial 600 questions preserve their payload except documented context and reference clarifications',async()=>{
 assert.equal(await contentDigest(beforeAudit(),casesBeforeAudit),'001a9c92f0dc8ffff584719670f3475228acaf37c0e5565ba8bd25d40d542552');
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

test('reference counts cover all 156 topics and match the observed 9,598-question distribution',()=>{
 assert.equal(referenceTotal,9598);assert.equal(referenceCount(curriculum.find(t=>t.slug==='laboratory-values')),186);assert.equal(referenceCount(curriculum.find(t=>t.slug==='nursing-process-prioritization')),206);
 assert.equal(curriculum.reduce((sum,t)=>sum+referenceCount(t),0),9598);
 assert.equal(subjects.reduce((sum,s)=>sum+referenceSubjectCount(s.id),0),9598);
 assert.equal(Math.min(...curriculum.map(referenceCount)),13);assert.equal(Math.max(...curriculum.map(referenceCount)),206);
});
test('a related question shown in multiple topics never increases the unique bank total',()=>{
 const report=auditQuestionBank(originalQuestions);assert.equal(report.availableUniqueQuestions,600);assert.equal(report.referenceTotal,9598);assert.equal(report.matchesReferenceDistribution,false);assert.equal(report.duplicateStems.length,0);
 assert.ok(report.topics.reduce((sum,t)=>sum+t.relatedAvailableCount,0)>report.availableUniqueQuestions);
 const t=curriculum.find(t=>t.slug==='leprosy'),q={...originalQuestions[0],id:'audit-exact',subject:t.subject,topic:t.name};const row=auditQuestionBank([q]).topics.find(row=>row.slug===t.slug);assert.equal(row.assignedCount,1);assert.equal(row.remaining,row.referenceCount-1);
});
test('different IDs, choice order, casing, and punctuation do not hide duplicate question stems',()=>{
 const q=originalQuestions[0],copy={...q,id:'new-id',stem:q.stem.toUpperCase().replaceAll('.', '!'),options:[...q.options].reverse(),correctIndex:3-q.correctIndex};
 assert.throws(()=>validateQuestions([q,copy]),/repeats another question stem/);assert.equal(findDuplicateQuestions([q,copy]).length,1);
 const legacy=validateBackup({...initialState(),importedQuestions:[copy]});assert.equal(legacy.importedQuestions[0].id,'new-id');const report=auditQuestionBank([q,copy]);assert.equal(report.availableUniqueQuestions,1);assert.equal(report.availableQuestionIds,2);
});

test('a 9,598-item structural fixture is fully audited without truncation or count inflation',()=>{
 // These are test fixtures only, never published educational question content.
 const fixtures=curriculum.flatMap(t=>Array.from({length:referenceCount(t)},(_,i)=>({...originalQuestions[0],id:`fixture-${t.slug}-${i}`,subject:t.subject,topic:t.name,stem:`AUTOMATED TEST FIXTURE ${t.slug} number ${i}; this is not educational content.`})));
 assert.equal(validateQuestions(fixtures).length,9598);const report=auditQuestionBank(fixtures);assert.equal(report.matchesReferenceDistribution,true);assert.equal(report.availableUniqueQuestions,9598);assert.equal(report.matchingTopics,156);assert.equal(report.duplicateStems.length,0);
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
 assert.equal(supplementalQuestions.length,2);assert.equal(questions.length,653+conceptQuestions.length+situationalQuestions.length+publishedQuestions.length+challengeQuestions.length);
 assert.deepEqual(collectionCounts(questions),{all:activeQuestions.length,nursing:activeQuestions.length-2,situational:5117,newSituational:4537,clinical:631,concept:activeQuestions.filter(q=>!q.retired&&q.format==='concept').length,comparison:activeQuestions.filter(q=>!q.retired&&q.format==='comparison').length,supplemental:2});
 for(const q of supplementalQuestions){assert.ok(q.id.startsWith('MMCQA-'));assert.equal(q.collection,'supplemental');assert.equal(q.rationaleScope,undefined);assert.ok(q.source.includes('nhs.uk')||q.source.includes('nice.org.uk'));assert.ok(q.origin.includes('Source-based correction:'));assert.ok(curriculum.some(t=>t.subject===q.subject&&t.name===q.topic));assert.ok(q.options.every(o=>o.rationale.length>40));}
 for(const q of [...originalQuestions,...additionalQuestions]){assert.ok(inCollection(q,'nursing'));assert.ok(!inCollection(q,'supplemental'));}
});
test('all 651 prior questions and keys are unchanged after the larger import',async()=>{assert.equal(await contentDigest(beforeAudit([...originalQuestions,...additionalQuestions]),casesBeforeAudit),'1c16de56f5474d9504440deb7fa4c0bc5108b85c29f4261852f993fc76b8ea56');});
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


test('at least 4,771 original question designs are published, with source facts for every new key and alternative',async()=>{
 const evidence=JSON.parse(await readFile(new URL('./concept-evidence.json',import.meta.url),'utf8'));
 const facts=new Map(evidence.map(f=>[f.id,f]));
 const objectives=new Set(),definitions=new Set();
 assert.ok(originalQuestions.length+additionalQuestions.length+conceptQuestions.length>=4771);
 assert.ok(conceptQuestions.length>=4120);
 for(const q of conceptQuestions){
  const f=facts.get(q.conceptId);assert.ok(f,q.id);
  assert.equal(q.id,q.conceptId);assert.ok(!objectives.has(q.conceptId));objectives.add(q.conceptId);
  assert.equal(q.options.length,4);assert.equal(q.options[q.correctIndex].referenceId,f.id);
  assert.equal(q.options[q.correctIndex].text,f.term);assert.equal(q.rationale,q.options[q.correctIndex].rationale);
  assert.ok(q.stem.endsWith(f.definition));assert.ok(q.rationale.includes(f.definition));
  assert.equal(q.source,f.source);assert.equal(f.license,'https://creativecommons.org/licenses/by/4.0/');
  assert.ok(curriculum.some(t=>t.subject===q.subject&&t.name===q.topic&&t.slug===f.topicSlug));
  assert.equal(q.format,f.kind==='definition'?'concept':'comparison');
  const optionConcepts=new Set();
  for(const o of q.options){const alternative=facts.get(o.referenceId);assert.ok(alternative);assert.equal(o.text,alternative.term);assert.ok(o.rationale.includes(alternative.definition));assert.equal(o.source,alternative.source);assert.ok(!optionConcepts.has(alternative.canonical));optionConcepts.add(alternative.canonical);if(q.format==='comparison')assert.equal(alternative.poolId,f.poolId);}
  if(q.format==='concept'){assert.ok(!definitions.has(f.canonical),'Repeated concept: '+f.canonical);definitions.add(f.canonical);}
 }
});

test('all 653 previously deployed questions retain their complete published payload',async()=>{
 assert.equal(await contentDigest(beforeAudit(questions.slice(0,653)),casesBeforeAudit),'f11fdd496ba4d91bcd96c81028b826e8454f32e89980e61f21f8e0e5906f74b7');
});

test('the full expanded bank survives the actual compressed multi-page release format',async()=>{
 const questions=revisedQuestions;
 const raw=Buffer.from(JSON.stringify({questions,cases:clinicalCases})),base64=gzipSync(raw,{level:9}).toString('base64');
 assert.ok(raw.length<maximumReleaseBytes,'Active and historical payload must fit the bounded release limit');
 const pages=[];for(let offset=0;offset<base64.length;offset+=440000)pages.push({id:`page-${String(pages.length).padStart(4,'0')}`,kind:'page',data:base64.slice(offset,offset+440000)});
 assert.ok(pages.length>1);const manifest={version:2,encoding:'gzip-base64',pages:pages.length,questionCount:questions.length,caseCount:clinicalCases.length,bytes:raw.length,digest:await contentDigest(questions,clinicalCases)};
 const loaded=await decodeContentRelease(manifest,[...pages].reverse());assert.deepEqual(loaded.questions,questions);assert.deepEqual(loaded.cases,clinicalCases);
 await assert.rejects(()=>decodeContentRelease(manifest,pages.slice(1)),/incomplete/);
});

test('format filters keep all questions reachable and custom flashcard URLs preserve the selected format',()=>{
 const counts=collectionCounts(questions);assert.equal(counts.clinical+counts.newSituational+counts.concept+counts.comparison+counts.supplemental,activeQuestions.length);
 for(const format of ['all','nursing','situational','clinical','concept','comparison','supplemental']){assert.equal(parseCollection(format),format);assert.equal(questions.filter(q=>inCollection(q,format)).length,counts[format]);}
 assert.equal(parseCollection(null),'situational');assert.equal(parseCollection('unknown'),'situational');
});

test('malformed format metadata and per-choice links are removed during import validation',()=>{
 const q={...originalQuestions[0],format:{bad:true},conceptId:{bad:true},options:originalQuestions[0].options.map(o=>({...o,source:'javascript:alert(1)',contextSource:'javascript:alert(2)',referenceId:{bad:true}}))};
 const [clean]=validateQuestions([q]);assert.equal(clean.format,undefined);assert.equal(clean.conceptId,undefined);for(const o of clean.options){assert.equal(o.source,undefined);assert.equal(o.contextSource,undefined);assert.equal(o.referenceId,undefined);}
});

test('the displayed public counts match the protected bank without including any question text',async()=>{
 const summary=JSON.parse(await readFile(new URL('./bank-summary.json',import.meta.url),'utf8'));
 assert.equal(summary.total,activeQuestions.length+studyAdditions.questionCount);assert.equal(summary.original,summary.total-supplementalQuestions.length);assert.equal(summary.topics,156);
 const current=collectionCounts(revisedQuestions);
 assert.equal(summary.concept,current.concept);assert.equal(summary.comparison,current.comparison);assert.equal(summary.clinical,current.clinical);assert.equal(summary.situational,current.situational+studyAdditions.questionCount);assert.equal(summary.newSituations,620);assert.equal(summary.standaloneSituational,155+studyAdditions.questionCount);assert.equal(summary.challenge,revisedQuestions.filter(q=>!q.retired&&q.difficulty==="challenge").length+studyAdditions.questionCount);assert.equal(summary.sourceCorrections,2);
 assert.ok(!JSON.stringify(summary).includes(questions[0].stem));
});


test('the source ablation error is corrected in every occurrence without changing choices or keys',async()=>{
 const [correction]=JSON.parse(await readFile(new URL('./reference-corrections.json',import.meta.url),'utf8'));
 const prior=JSON.parse(await readFile(new URL('./concept-questions.json',import.meta.url),'utf8'));
 const q=conceptQuestions.find(q=>q.id===correction.id);assert.ok(q);assert.equal(q.topic,'Cancer Treatment Modalities');assert.equal(q.source,correction.source);assert.ok(q.stem.endsWith(correction.definition));
 let affected=0;
 for(const q of prior){for(const o of q.options){assert.ok(!o.rationale.includes(correction.previousDefinition));if(o.referenceId===correction.id){affected++;assert.equal(o.source,correction.source);assert.ok(o.rationale.includes(correction.definition));}}assert.ok(!q.stem.includes(correction.previousDefinition));}
 assert.equal(affected,3);
});

test('reference table line breaks remain readable in questions and explanations',()=>{
 const mouth=conceptQuestions.find(q=>q.format==='comparison'&&q.options[q.correctIndex].text==='Mouth'&&q.stem.includes('Functions of the Digestive Organs'));
 assert.ok(mouth);assert.ok(mouth.stem.includes('Ingests food; Chews and mixes food'));assert.ok(!mouth.stem.includes('foodChews'));assert.ok(!mouth.rationale.includes('foodChews'));
});

test('at least 4,771 genuinely situational questions cover every topic with complete case evidence',async()=>{
 const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')).filter(c=>!c.retired);
 assert.equal(evidence.length,620);assert.equal(situationalQuestions.filter(q=>!q.retired).length,4340);
 assert.equal(questions.filter(isSituational).length,5117);
 const objectives=['recognition','action','teaching','safety','planning','evaluation','reasoning'].sort();
 assert.equal(new Set(evidence.map(c=>c.scenario.toLowerCase())).size,evidence.length);
 for(const topic of legacyCatalog){
  const cases=evidence.filter(c=>c.topicSlug===topic.slug);assert.equal(cases.length,4,topic.slug);
  assert.equal(situationalQuestions.filter(q=>!q.retired&&q.subject===topic.subject&&q.topic===topic.name).length,28,topic.slug);
 }
 const positions=[0,0,0,0];
 for(const c of evidence){
  const set=situationalQuestions.filter(q=>q.caseId===c.id);assert.equal(set.length,7,c.id);
  assert.deepEqual(set.map(q=>q.clinicalObjective).sort(),objectives);
  for(const field of ['scenario','problem','action','teaching','outcome','unsafe','reason'])assert.ok(typeof c[field]==='string'&&c[field].length>=15,c.id+' '+field);
  for(const q of set){
   assert.ok(q.stem.startsWith(c.scenario+'\n\n'));assert.equal(q.source,c.source);assert.equal(q.format,'situational');
   assert.equal(q.rationale,q.options[q.correctIndex].rationale);assert.ok(q.rationale.includes(c.reason),q.id);
   assert.ok(q.options.every(o=>o.rationale.length>50&&o.source?.startsWith('https://')&&o.referenceId),q.id);
   if(q.clinicalObjective==='safety')assert.equal(q.options[q.correctIndex].text,c.unsafe);
   if(q.clinicalObjective==='recognition')assert.equal(q.options[q.correctIndex].text,c.problem);
   if(q.clinicalObjective==='reasoning')assert.equal(q.options[q.correctIndex].text,c.reason);
   if(q.clinicalObjective==='evaluation'){assert.ok(q.stem.includes('Following care, the nurse observes this change: '+c.outcome));assert.ok(q.options[q.correctIndex].text.startsWith('Progress toward the planned goal for '));}
   positions[q.correctIndex]++;
  }
 }
 positions.forEach(n=>assert.ok(n>900&&n<1250,'Unbalanced answer positions: '+positions));
});

test('the four ABG case results are internally consistent with the acid-base equation and keyed disorder',async()=>{
 const cases=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')).filter(c=>c.topicSlug==='acid-base-balance-abg');
 assert.equal(cases.length,4);
 const expected=[['respiratory acidosis',7.26,60,26],['metabolic acidosis',7.29,30,14],['respiratory alkalosis',7.52,28,22],['metabolic alkalosis',7.49,46,34]];
 for(let i=0;i<cases.length;i++){
  const [disorder,pH,co2,bicarbonate]=expected[i];assert.ok(cases[i].problem.toLowerCase().includes(disorder));
  assert.ok(Math.abs(6.1+Math.log10(bicarbonate/(0.03*co2))-pH)<0.03,disorder);
  assert.ok(cases[i].scenario.includes(String(pH))&&cases[i].scenario.includes(String(co2))&&cases[i].scenario.includes(String(bicarbonate)));
 }
});

test('every earlier question retains its complete payload after the situational expansion',async()=>{
 assert.equal(await contentDigest(beforeAudit(questions.slice(0,5168)),casesBeforeAudit),'c3bec64f77352bebc63bb5a5de38be5614a73f88bd661846381977f05b0e369c');
});

test('situational questions use the existing tutor and exam grading rules without leaking early scores',()=>{
 const [q,q2]=situationalQuestions,s=session([q.id,q2.id]);s.answers[q.id]={selected:q.correctIndex,submitted:false,confidence:'sure'};
 let state={...initialState(),sessions:[s]};assert.equal(state.attempts.length,0);
 state=gradeSession(state,s,bank,3000);assert.equal(state.attempts.length,2);assert.equal(state.attempts.filter(a=>a.correct).length,1);
 assert.deepEqual(state.vault,[q2.id]);assert.equal(gradeSession(state,s,bank,4000).attempts.length,2);
});

test('the audit covers every original case and replaces semantic repeats without inflating active totals',async()=>{
 const log=JSON.parse(await readFile(new URL('./situational-audit-log.json',import.meta.url),'utf8'));
 const report=JSON.parse(await readFile(new URL('./situational-review-report.json',import.meta.url),'utf8'));
 assert.equal(log.reviewedCaseSets,740);assert.equal(log.reviewedSituationalQuestions,4940);assert.equal(new Set(log.reviewedCaseIds).size,740);
 assert.equal(log.independentClinicalReview,false);assert.equal(report.retirements.length,141);
 assert.equal(activeQuestions.length,9531);assert.equal(questions.filter(q=>q.retired).length,1163);assert.equal(activeQuestions.filter(isSituational).length,5117);
 for(const r of report.retirements){
  const old=questions.filter(q=>q.caseId===r.retiredCaseId),replacement=questions.filter(q=>q.caseId===r.replacementCaseId);
  assert.equal(old.length,7);assert.equal(replacement.length,7);assert.ok(old.every(q=>q.retired));assert.ok(replacement.every(q=>!q.retired));
  assert.notEqual(old[0].stem.split('\n\n')[0],replacement[0].stem.split('\n\n')[0]);
  for(const q of old)for(const format of ['all','nursing','situational','clinical','concept','comparison','supplemental'])assert.equal(inCollection(q,format),false);
  assert.ok(inCollection(old[0],'all',true),'Saved history and notes can still display retired records');
 }
});

test('all 4,940 previously published answer positions and alternative identities remain stable',async()=>{
 const ledger=JSON.parse(await readFile(new URL('./published-situational-keys.json',import.meta.url),'utf8'));
 assert.equal(ledger.length,4940);
 for(const prior of ledger){const q=bank.get(prior.id);assert.ok(q,prior.id);assert.equal(q.correctIndex,prior.correctIndex,prior.id);if(prior.references.some(Boolean))assert.deepEqual(q.options.map(o=>o.referenceId),prior.references,prior.id);}
});

test('each active and historical seven-part answer matches its clinical evidence and every alternative is traceable',async()=>{
 const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')),cases=new Map(evidence.map(c=>[c.id,c]));
 const fields={recognition:'problem',action:'action',teaching:'teaching',safety:'unsafe',planning:'outcome',evaluation:'problem',reasoning:'reason'};
 for(const q of situationalQuestions){
  const c=cases.get(q.caseId),field=fields[q.clinicalObjective],key=q.options[q.correctIndex];assert.ok(c,q.id);assert.ok(key.text.toLowerCase().includes(c[field].toLowerCase()),q.id);assert.ok(key.rationale.includes(c.reason),q.id);
  for(const [index,o] of q.options.entries()){
   const peer=cases.get(o.referenceId?.split(':')[0]);assert.ok(peer,q.id);assert.ok(o.source.startsWith('https://'));assert.ok(o.rationale.length>50);
   if(index!==q.correctIndex&&q.clinicalObjective!=='safety'){assert.ok(o.text.toLowerCase().includes(peer[field].toLowerCase()),q.id);assert.ok(o.rationale.includes(c.reason),q.id);assert.notEqual(peer.id,c.id,q.id);}
  }
 }
});

test('replacement arithmetic and clinical thresholds are independently checked',async()=>{
 const cases=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8'));
 const find=id=>cases.find(c=>c.id===id+'-R2');
 const dose=find('SIT-CROSS-dosage-calculation-medication-administration-02');assert.equal(18*10/3/30,2);assert.ok(dose.action.includes('2 mL'));assert.ok(dose.reason.includes('180 mg'));
 assert.equal((40/200)/(10/200),4);assert.ok(find('SIT-NP1-epidemiology-vital-statistics-demography-01').action.includes('ratio of 4'));
 assert.equal(5/100*100,5);assert.ok(find('SIT-NP1-epidemiology-vital-statistics-demography-02').action.includes('5 percent'));
 assert.ok(1.2-0.8>=0.3);assert.ok(find('SIT-NP3-acute-kidney-injury-aki-01').reason.includes('0.4 mg/dL'));
 assert.equal(82-28,54);assert.ok(find('SIT-NP4-increased-intracranial-pressure-iicp-01').action.includes('54 mmHg'));
 assert.equal(129-118,11);assert.ok(find('SIT-NP4-adh-disorders-02').reason.includes('11 mmol/L in 6 hours'));
 assert.ok(find('SIT-NP1-integrated-management-of-childhood-illness-imci-01').reason.includes('at least 40'));
});

test('retirement metadata is sanitized and installed content keeps historical lookup separate from new study selection',async()=>{
 const module=await import('./bank.ts');module.installQuestionBank(questions,clinicalCases);
 assert.equal(module.questions.length,9531);assert.equal(module.questionMap.size,questions.length);
 const retired=questions.find(q=>q.retired);assert.ok(module.questionMap.has(retired.id));assert.ok(!module.questions.some(q=>q.id===retired.id));
 const restored=validateBackup({...initialState(),sessions:[session([retired.id])]});restored.sessions[0].answers[retired.id]={selected:retired.correctIndex,submitted:false,confidence:''};
 assert.equal(sessionScore(restored.sessions[0],module.questionMap),1);
 assert.equal(validateQuestions([{...originalQuestions[0],retired:{bad:true}}])[0].retired,undefined);
});

test('browsers without workers use the same verified content path and reject damaged releases',async()=>{
 const q=originalQuestions.slice(0,2),c=clinicalCases.slice(0,1),raw=Buffer.from(JSON.stringify({questions:q,cases:c}));
 const pages=[{id:'page-0000',kind:'page',data:gzipSync(raw).toString('base64')}];
 const manifest={version:2,encoding:'gzip-base64',pages:1,questionCount:q.length,caseCount:c.length,bytes:raw.length,digest:await contentDigest(q,c)};
 assert.equal(typeof Worker,'undefined');assert.deepEqual((await processContentRelease(manifest,pages)).questions,q);
 await assert.rejects(()=>processContentRelease({...manifest,digest:'invalid'},pages),/integrity check/);
});


test('the reference recheck preserves all 5,885 previously stored situational answer identities',async()=>{
 const ledger=JSON.parse(await readFile(new URL('./published-reference-recheck-keys.json',import.meta.url),'utf8'));
 const changes=JSON.parse(await readFile(new URL('./rationale-reference-corrections.json',import.meta.url),'utf8'));
 assert.equal(ledger.length,5885);
 for(const previous of ledger){
  const q=bank.get(previous.id);assert.ok(q,previous.id);assert.equal(q.correctIndex,previous.correctIndex,previous.id);
  assert.deepEqual(q.options.map(o=>o.referenceId??null),previous.references,previous.id);
  for(const [index,option] of q.options.entries()){
   const [caseId,field]=option.referenceId.split(':');
   const evidenceField=field==='reasoning'?'reason':field;
   const allowed=changes.situations[caseId]?.[evidenceField]||(field==='safe-plan'&&changes.situations[caseId]?.action===option.text);
   if(!allowed)assert.equal(option.text,previous.texts[index],q.id+' option '+index);
  }
 }
});

test('every situational choice explains its own clinical basis and the case-specific answer',async()=>{
 const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8'));
 const cases=new Map(evidence.map(c=>[c.id,c]));
 const legacy=new Map(clinicalCases.map((c,i)=>[c.subject+'-'+String(i+1).padStart(3,'0'),c]));
 const selected=activeQuestions.filter(isSituational);assert.equal(selected.length*4,20468);
 for(const q of selected){
  assert.equal(q.options[q.correctIndex].rationale,q.rationale,q.id);
  for(const [index,o] of q.options.entries()){
   assert.ok(o.rationale.length>40,q.id);assert.ok(o.source?.startsWith('https://'),q.id);
   if(index===q.correctIndex)continue;
   if(q.id.startsWith('EXP2-')||q.difficulty==='challenge'){
    assert.equal(o.source,q.source,q.id);assert.ok(o.referenceId.startsWith(q.id+(q.difficulty==='challenge'?':choice-':':alternative-')),q.id);
    assert.notEqual(o.rationale,q.rationale,q.id);continue;
   }
   if(q.caseId&&q.clinicalObjective!=='safety'){
    const current=cases.get(q.caseId),peer=cases.get(o.referenceId.split(':')[0]);
    assert.ok(o.rationale.includes(peer.reason),q.id+' must explain the alternative');
    assert.ok(o.rationale.includes(current.reason),q.id+' must explain the current priority');
    assert.equal(o.source,resolvedReference(peer.source),q.id);
    assert.equal(o.contextSource,peer.source!==current.source?resolvedReference(current.source):undefined,q.id);
   }else if(!q.caseId&&!o.referenceId.endsWith(':safe-plan')){
    const [id,field]=o.referenceId.split(':'),peer=legacy.get(id);
    assert.ok(o.rationale.includes(peer.facts[Number(field)].reason),q.id);
    assert.ok(o.contextSource?.startsWith('https://'),q.id);
   }else assert.match(o.rationale,/does not require correction/i,q.id);
  }
 }
});

test('legacy clinical clarifications are explicitly bounded and the corrected-age calculation is independent',async()=>{
 const changes=JSON.parse(await readFile(new URL('./rationale-reference-corrections.json',import.meta.url),'utf8'));
 for(const [index,c] of clinicalCases.entries()){
  const baseline=legacyRationaleBaseline.cases[index],id=c.subject+'-'+String(index+1).padStart(3,'0'),change=changes.legacy[id];
  assert.equal(c.scenario,change?.scenario??baseline.scenario,id);
  assert.equal(c.title,baseline.title,id);assert.equal(c.subject,baseline.subject,id);assert.equal(c.topic,baseline.topic,id);
  c.facts.forEach((f,kind)=>{assert.equal(f.text,baseline.facts[kind].text,id);assert.equal(f.reason,change?.reasons?.[kind]??baseline.facts[kind].reason,id);});
 }
 assert.equal(16-(40-32),8);
 const corrected=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8')).find(c=>c.id==='SIT-NP2-developmental-milestones-04-R3');
 assert.ok(corrected.reason.includes('equals 8 weeks'));
 assert.ok(clinicalCases[36].scenario.includes('confirmed hypertension'));
 assert.ok(clinicalCases[42].facts[1].reason.includes('calcium gluconate'));
});


test('PDF visibility requires the signed-in shared Isabel identity',()=>{
 assert.equal(canAccessPDFs('isabel',true,true),true);assert.equal(canAccessPDFs(' Isabel ',true,true),true);
 for(const name of ['', 'Elaine', 'Isabel (previous)', 'isabel2', 'ReviewerCheck-1102', 'ｉｓａｂｅｌ'])assert.equal(canAccessPDFs(name,true,true),false,name);
 assert.equal(canAccessPDFs('isabel',false,true),false);
 assert.equal(canAccessPDFs('isabel',true,false),false);
});
test('remembered profile choices keep one entry per owner during the Isabel rename',()=>{
 const original={profileId:'priority',id:'owner-device',username:'Elaine',shared:true};
 const previous={profileId:'previous',id:'private-device',username:'Isabel',shared:false};
 const roaming={...original,id:'new-device',username:'Isabel'};
 assert.deepEqual(profilePickerEntries([original,previous]).map(p=>[p.id,p.label]),[['owner-device','Isabel'],['private-device','Isabel (previous)']]);
 assert.deepEqual(profilePickerEntries([original,previous,roaming]).map(p=>[p.id,p.label]),[['new-device','Isabel'],['private-device','Isabel (previous)']]);
});
const planTopics=curriculum.map(t=>({subject:t.subject,name:t.name,slug:t.slug,count:29}));
function plannedState(){const s=initialState();s.profile.examDate='2027-02-20';s.plan={...planSettings(s),startDate:'2026-11-05',restDays:[0,6]};return s;}

test('full study schedule covers every topic and all mock sections on eligible dates',()=>{
 const state=plannedState(),snapshot=structuredClone(state),plan=buildStudyPlan(state,planTopics);
 assert.equal(plan.topicCount,156);assert.equal(plan.tasks.filter(t=>t.type==='read').length,156);assert.equal(plan.tasks.filter(t=>t.type==='practice').length,156);assert.equal(plan.tasks.filter(t=>t.type==='mock').length,25);
 assert.equal(new Set(plan.tasks.map(t=>t.id)).size,plan.tasks.length);
 for(const task of plan.tasks){assert.ok(task.date>='2026-11-05'&&task.date<='2027-02-20');assert.ok(![0,6].includes(new Date(task.date+'T12:00:00Z').getUTCDay()));if(task.type==='practice')assert.equal(task.count,29);}
 for(const t of curriculum)assert.equal(plan.tasks.filter(task=>task.type==='practice'&&task.subject===t.subject&&task.topic===t.name).length,1,t.slug);
 assert.deepEqual(state,snapshot);
});

test('planner settings select actual subjects and steps and report overload instead of omitting topics',()=>{
 const state=plannedState();state.plan={...state.plan,subjects:['NP3'],focus:['NP3'],reading:false,flashcards:false,mocks:false,dailyMinutes:15,startDate:'2026-11-05',restDays:[]};state.profile.examDate='2026-11-05';
 const plan=buildStudyPlan(state,planTopics);assert.equal(plan.topicCount,30);assert.equal(plan.tasks.length,30);assert.equal(plan.overloaded.length,1);assert.ok(plan.tasks.every(t=>t.type==='practice'&&t.subject==='NP3'));
 const settings=planSettings(plannedState());
 for(const change of [{restDays:[0,1,2,3,4,5,6]},{subjects:[]},{focus:['bogus']},{dailyMinutes:NaN},{startDate:'2027-02-30'}])assert.throws(()=>validatePlanSettings({...settings,...change},'2027-02-20'));
 assert.throws(()=>validatePlanSettings({...settings,startDate:'2026-11-08',restDays:[0]},'2026-11-08'),/no study days/);
});

test('task moves, skips and legacy tasks persist without replacing answers or completed work',()=>{
 const state=plannedState(),plan=buildStudyPlan(state,planTopics),selected=plan.tasks.find(t=>t.type==='practice');
 state.tasks=[{...selected,date:'2026-12-15',skipped:true},{id:'2026-11-01:read',date:'2026-11-01',title:'Earlier task',done:true,type:'read'}];
 state.notes.kept='Existing note';const next=buildStudyPlan(state,planTopics);
 assert.deepEqual(next.tasks.find(t=>t.id===selected.id),state.tasks[0]);assert.ok(next.tasks.some(t=>t.id==='2026-11-01:read'&&t.done));assert.equal(state.notes.kept,'Existing note');
 state.read=['catalog:'+curriculum[0].slug];assert.ok(buildStudyPlan(state,planTopics).tasks.some(t=>t.type==='read'&&t.topic===curriculum[0].name&&t.done));
});

test('catch-up spreads overdue blocks, respects rest days, and undo keeps subsequent edits',()=>{
 const state=plannedState();state.plan.startDate='2026-11-02';
 const tasks=[{id:'read',date:'2026-11-02',title:'Read',type:'read',subject:'NP1',topic:'Test',done:false,minutes:10},{id:'study',date:'2026-11-02',title:'Study',type:'practice',subject:'NP1',topic:'Test',done:false,minutes:30},{id:'done',date:'2026-11-02',title:'Done',type:'custom',done:true},{id:'skip',date:'2026-11-02',title:'Skip',type:'custom',done:false,skipped:true}];
 const moves=spreadUnfinishedTasks(state,tasks,'2026-11-05',state.plan);assert.equal(moves.length,2);assert.equal(moves[0].date,moves[1].date);
 for(const t of moves){assert.ok(t.date>='2026-11-05'&&t.date<='2026-11-11');assert.ok(![0,6].includes(new Date(t.date+'T12:00:00Z').getUTCDay()));}
 const next=applyTaskOverrides(state,moves);assert.equal(new Set(next.tasks.map(t=>t.id)).size,next.tasks.length);
 const undone=undoTaskOverrides(next,state.tasks,moves);assert.deepEqual(undone.tasks,state.tasks);
 const changed=applyTaskOverrides(next,[{...moves[0],title:'Later edit'}]);assert.equal(undoTaskOverrides(changed,state.tasks,moves).tasks.find(t=>t.id==='read').title,'Later edit');
 assert.deepEqual(spreadUnfinishedTasks(state,tasks,'2027-03-01',state.plan),[]);
});

test('calendar navigation crosses real months and exported UTF-8 events fold safely',()=>{
 assert.equal(shiftCalendar('2027-01-31','month',1),'2027-02-01');assert.equal(shiftCalendar('2026-12-31','month',1),'2027-01-01');assert.equal(shiftCalendar('2027-03-01','month',-1),'2027-02-01');
 const dates=calendarDates('2028-02-29','month');assert.equal(dates.length,42);assert.ok(dates.includes('2028-02-29'));assert.equal(new Date(dates[0]+'T12:00:00Z').getUTCDay(),0);
 const text=exportStudyCalendar([{id:'custom-1',date:'2026-11-05',title:'Elaine, study; '+('ñ'.repeat(100))+'\nNext',type:'custom',done:false},{id:'skip',date:'2026-11-05',title:'Skip',type:'custom',done:false,skipped:true}],0);
 assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,1);assert.ok(text.includes('DTEND;VALUE=DATE:20261106'));assert.ok(text.includes('Elaine\\, study\\;'));
 for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
});

test('Pomodoro pauses at the next phase and never credits break or excess elapsed time',()=>{
 const settings=cleanFocusSettings({focus:25,autoStart:false}),timer={...freshFocusTimer(settings,'pomodoro',0),running:true};
 const result=advanceFocusTimer(timer,settings,3600000);assert.equal(result.timer.phase,'short');assert.equal(result.timer.running,false);assert.equal(result.timer.elapsed,0);assert.equal(result.timer.completed,1);
 assert.equal(result.segments.reduce((n,s)=>n+s.end-s.start,0),1500000);
 assert.equal(advanceFocusTimer(result.timer,settings,7200000).segments.length,0);
});

test('automatic focus cycles use short and long breaks and count only worked focus phases',()=>{
 const settings=cleanFocusSettings({focus:1,short:1,long:2,rounds:2,autoStart:true}),timer={...freshFocusTimer(settings,'pomodoro',0),running:true};
 const result=advanceFocusTimer(timer,settings,300000);assert.equal(result.timer.phase,'focus');assert.equal(result.timer.completed,2);assert.equal(result.timer.elapsed,0);assert.equal(result.completedPhases,4);assert.equal(result.timer.running,true);
 assert.equal(result.segments.reduce((n,s)=>n+s.end-s.start,0),120000);
 const partial=advanceFocusTimer(timer,settings,90000);assert.equal(partial.timer.phase,'short');assert.equal(partial.timer.elapsed,30000);assert.equal(partial.segments.reduce((n,s)=>n+s.end-s.start,0),60000);
});

test('stopwatch and clock reversal cannot credit the same interval twice',()=>{
 const settings=cleanFocusSettings(),timer={...freshFocusTimer(settings,'stopwatch',10000),running:true};
 const back=advanceFocusTimer(timer,settings,5000);assert.equal(back.timer.lastAt,10000);assert.equal(back.segments.length,0);
 const next=advanceFocusTimer(back.timer,settings,15000);assert.equal(next.timer.elapsed,5000);assert.equal(next.segments[0].end-next.segments[0].start,5000);
});

test('focus credits split at Manila midnight and preserve existing totals',()=>{
 const credits=focusCredits([{start:Date.parse('2026-11-05T15:59:30Z'),end:Date.parse('2026-11-05T16:00:30Z')}],'Asia/Manila');assert.deepEqual(credits,{'2026-11-05':30,'2026-11-06':30});
 const state=initialState();state.studySeconds=3600;state.studyLog={'2026-11-05':120};const next=applyStudyCredits(state,credits);assert.equal(next.studySeconds,3660);assert.deepEqual(next.studyLog,{'2026-11-05':150,'2026-11-06':30});assert.equal(state.studySeconds,3600);
 assert.deepEqual(applyStudyCredits(state,{'bad':2,'2026-11-05':NaN,'2026-11-06':-1}),state);
});

test('new planner and timer preferences round-trip through a backup and reject malformed tasks',()=>{
 const state=plannedState();state.focusSettings=cleanFocusSettings({focus:300,short:NaN,rounds:0});state.studyLog={'2026-11-05':120,invalid:3};
 const copy=validateBackup(state);assert.deepEqual(copy.plan,state.plan);assert.deepEqual(copy.studyLog,{'2026-11-05':120});assert.equal(copy.focusSettings.focus,120);assert.equal(copy.focusSettings.short,5);assert.equal(copy.focusSettings.rounds,1);
 assert.throws(()=>validateBackup({...state,tasks:[{id:'bad',title:'Bad',date:'2026-11-05',done:false,type:'custom',minutes:NaN}]}),/invalid task/);
});

test('study targets require independent subject baselines and distinct completed mock sections',()=>{
 const state=initialState(),map=new Map();let at=1;
 for(const subject of ['NP1','NP2','NP3','NP4','NP5'])for(let i=0;i<10;i++){const id=subject+'-'+i;map.set(id,{subject});state.attempts.push({id,questionId:id,at:at++,correct:true,selected:0,sessionId:'s',confidence:''});}
 let target=studyTargets(state,map);assert.equal(target.met.subjects,true);assert.equal(target.met.rating,true);assert.equal(target.metCount,2);assert.equal(target.met.mocks,false);
 for(let b=1;b<=5;b++)for(const subject of ['NP1','NP2','NP3','NP4','NP5'])state.sessions.push({id:`m${b}${subject}`,mockBoard:b,subject,finishedAt:1});
 target=studyTargets(state,map);assert.equal(target.metCount,3);assert.equal(target.completeBoards,5);assert.equal(target.nextBoard,undefined);
 state.attempts=state.attempts.filter(a=>!a.questionId.startsWith('NP5-'));target=studyTargets(state,map);assert.equal(target.met.subjects,false);assert.equal(target.nextSubject.subject,'NP5');assert.equal(target.nextSubject.score,null);
});


test('all five mock boards contain fixed, disjoint 100-item sections with distinct situations',()=>{
 for(const subject of ['NP1','NP2','NP3','NP4','NP5']){
  const all=[];
  for(let boardNumber=1;boardNumber<=5;boardNumber++){
   const ids=mockQuestionIds(activeQuestions,subject,boardNumber);assert.equal(ids.length,100);assert.deepEqual(ids,mockQuestionIds([...activeQuestions].reverse(),subject,boardNumber));
   assert.equal(new Set(ids.map(id=>questionFamily(bank.get(id)))).size,100);
   assert.ok(ids.every(id=>bank.get(id).subject===subject));all.push(...ids);
  }
  assert.equal(new Set(all).size,500);
 }
 assert.deepEqual(mockQuestionIds(activeQuestions,'CROSS',1),[]);assert.deepEqual(mockQuestionIds(activeQuestions,'NP1',0),[]);assert.deepEqual(mockQuestionIds(activeQuestions.slice(0,20),'NP1',1),[]);
});


test('optional spaced Vault requires two correct weekly reviews and resets after a miss',()=>{
 const q=questions[0];let state=initialState();state.preferences.spacedVault=true;
 const answer=(correct,at)=>{state=recordAnswer(state,{...session(),id:'spaced-'+at},q,{selected:correct?q.correctIndex:(q.correctIndex+1)%4,submitted:true,confidence:''},at);};
 answer(false,1000);assert.ok(state.vault.includes(q.id));assert.equal(vaultIsDue(state,q.id,1000+vaultInterval-1),false);
 answer(true,2000);assert.equal(state.vaultReviews[q.id].successes,0);assert.ok(state.vault.includes(q.id));
 answer(true,1000+vaultInterval);assert.equal(state.vaultReviews[q.id].successes,1);assert.ok(state.vault.includes(q.id));
 answer(true,1001+vaultInterval);assert.ok(state.vault.includes(q.id));
 answer(true,1000+2*vaultInterval);assert.ok(!state.vault.includes(q.id));assert.equal(firstAttempts(state.attempts)[0].correct,false);
 answer(false,1000+3*vaultInterval);assert.equal(state.vaultReviews[q.id].successes,0);assert.equal(vaultIsDue(state,q.id,1000+4*vaultInterval),true);
});

test('enabling spaced Vault keeps legacy backlog due and the off setting keeps immediate clearing',()=>{
 let state=initialState();state.vault=['legacy'];state.preferences.spacedVault=true;assert.equal(vaultIsDue(state,'legacy',100),true);
 state=updateVaultReview(state,'legacy',true,100);assert.equal(state.vaultReviews.legacy.successes,1);assert.ok(state.vault.includes('legacy'));
 state.preferences.spacedVault=false;state=updateVaultReview(state,'legacy',true,101);assert.deepEqual(state.vault,[]);assert.equal(state.vaultReviews.legacy,undefined);
});


test('personal imports cannot change a shared fixed mock selection',()=>{
 const existing=activeQuestions.filter(q=>q.subject==='NP1'&&q.caseId?.startsWith('SIT-')).slice(0,7);
 const personal=existing.map((q,i)=>({...q,id:'personal-'+i,caseId:'personal-case'}));
 const single={...activeQuestions.find(q=>q.subject==='NP1'&&q.id.startsWith('EXP2-')),id:'EXP2-personal-case',caseId:'personal-single'};
 const all=[...personal,single];
 for(let b=1;b<=5;b++)assert.deepEqual(mockQuestionIds([...activeQuestions,...all],'NP1',b,all.map(q=>q.id)),mockQuestionIds(activeQuestions,'NP1',b));
});


test('five duplicate digestive comparisons are retired without modifying any previous content or key',async()=>{
 assert.equal(retirements.length,5);assert.equal(await contentDigest(beforeEditorial(questions),clinicalCases),'6a5353e6b00778fff0f679dc7181e9416cc158c66bc5d2580ec8a14f2f79a652');
 for(const row of retirements){const q=bank.get(row.id),retained=bank.get(row.replacedBy);assert.ok(q.retired);assert.ok(!retained.retired);assert.equal(q.options[q.correctIndex].text,retained.options[retained.correctIndex].text);assert.ok(!activeQuestions.includes(q));}
 const bodies=new Set();for(const q of activeQuestions.filter(q=>q.format==='comparison')){const body=q.stem.split('\n\n').at(-1).replace(/^[^:]+: /,'').toLowerCase().replace(/[^a-z0-9]/g,'');assert.ok(!bodies.has(body),q.id);bodies.add(body);}
});


test('all 33 reference flags are resolved with reviewed provenance and only bounded URL changes',async()=>{
 assert.equal(referenceResolutions.previouslyUnresolved,33);assert.equal(referenceResolutions.resolved,33);assert.deepEqual(referenceResolutions.unresolved,[]);
 assert.equal(referenceResolutions.references.length,33);assert.equal(referenceResolutions.references.filter(r=>r.action==='replaced').length,8);
 assert.equal(referenceResolutions.retainedBrowserVerified,22);assert.equal(referenceResolutions.retainedHttpVerified,3);
 assert.equal(new Set(referencePatches.map(p=>p.id)).size,71);assert.equal(referencePatches.flatMap(p=>p.fields).length,167);
 const restored=beforeReferenceRepair(questions);
 assert.equal(restored.length,10645);
 assert.equal(await contentDigest(restored,clinicalCases),'3df2451b3a7c89695a9e7c5542eff92b0630dfe01ad644788dc354938fbbbf64');
 assert.deepEqual(applyReferenceRepairs(restoreReferenceRepairs(restoreRepetitionReview(questions))),restoreRepetitionReview(questions));
 for(const r of referenceResolutions.references){assert.match(r.currentUrl,/^https:\/\//);assert.ok(r.supportReview.length>80);assert.ok(r.verification.sha256||r.verification.snapshotSha256);}
 const replaced=new Set(referenceResolutions.references.filter(r=>r.action==='replaced').map(r=>r.previousUrl));
 for(const q of questions){assert.ok(!replaced.has(q.source),q.id);for(const o of q.options){assert.ok(!replaced.has(o.source),q.id);assert.ok(!replaced.has(o.contextSource),q.id);}}
 const patch=referencePatches.find(p=>p.fields.some(f=>f.option===undefined)),raw=structuredClone(restored.find(q=>q.id===patch.id));raw.source='https://example.invalid/unreviewed';
 assert.throws(()=>applyReferenceRepairs([raw]),/no longer matches/);
});

test('the ECT overlap is replaced by distinct relapse-prevention care while its saved history remains usable',()=>{
 const previous=questions.filter(q=>q.caseId===ectPriorCase),next=activeQuestions.filter(q=>q.caseId===ectPriorCase+'-R3');
 assert.equal(previous.length,7);assert.ok(previous.every(q=>q.retired));assert.equal(next.length,7);
 assert.equal(new Set(next.map(q=>q.clinicalObjective)).size,7);
 for(const q of next){assert.match(q.source,/rcpsych\.ac\.uk/);assert.match(q.stem,/acute course of electroconvulsive/);assert.match(q.rationale,/relapse|remission|continuation|follow-up/);}
 const state=validateBackup({...initialState(),sessions:[session(previous.map(q=>q.id))]});
 assert.deepEqual(state.sessions[0].questionIds,previous.map(q=>q.id));
});
