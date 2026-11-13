import assert from 'node:assert/strict';
import {applicationReviewedQuestions,decisionQuestions,decisionStudyQuestions,clinicalCases} from './author-bank.ts';
import {newStudyQuestions} from './authored-update.mjs';
import {contentDigest} from './content-integrity.ts';
import {normalizeChoice,normalizeQuestionStem} from './bank.ts';
import {questionChoiceKey,questionFamily} from './question-selection.ts';
import {displayRationale} from './rationale-display.ts';
import facts from './concept-evidence.json' with {type:'json'};

const published=[...applicationReviewedQuestions.filter(q=>!q.retired),...newStudyQuestions];
const prior=new Map(published.map(q=>[q.id,q]));
const bank=[...decisionQuestions.filter(q=>!q.retired),...decisionStudyQuestions];
const factsById=new Map(facts.map(fact=>[fact.id,fact]));
const families=Map.groupBy(published,questionFamily);
const processSource='https://www.ncbi.nlm.nih.gov/books/NBK610818/#ptiv.sec8';
const rationaleClaim=option=>displayRationale(option.rationale).split(' The cue to act on here is ')[0];
const sourced=(q,option)=>[option.source||q.source,option.contextSource,...(option.additionalSources||[])].filter(Boolean);
const cases={preserved:0,reference:0,paired:0,outcome:0};
const choiceCounts={preserved:0,reference:0,paired:0,outcome:0};
assert.equal(bank.length,9608);
assert.equal(new Set(bank.map(q=>normalizeQuestionStem(q.stem))).size,9608);
assert.equal(await contentDigest(applicationReviewedQuestions,clinicalCases),'bfe99d8bc5ef9c85e43075128afd8c915c89d79f0fc6b089b9b17b17a17d4118');
assert.equal(await contentDigest(newStudyQuestions,[]),'0c41264c3e221c505e22eab4456e99e4b48f2a39f8630c5affa1062440814c2e');

const revisedSets=new Set(),keysBySet=new Map(),urls=new Set(),factPairs=new Set();
for(const q of bank){
 const old=prior.get(q.id);
 assert.ok(old,q.id);
 assert.equal(q.correctIndex,old.correctIndex,q.id);
 assert.equal(q.options[q.correctIndex].rationale,q.rationale,q.id);
 assert.equal(new Set(q.options.map(o=>normalizeChoice(o.text))).size,4,q.id);
 assert.equal(new Set(q.options.map(o=>normalizeQuestionStem(o.rationale))).size,4,q.id);
 for(const option of q.options){
  assert.ok(option.rationale.length>20,q.id);
  const refs=sourced(q,option);
  assert.ok(refs.length,q.id);
  for(const source of refs){assert.equal(new URL(source).protocol,'https:',q.id);urls.add(source);}
 }
 const choiceSet=questionChoiceKey(q);
 const key=normalizeChoice(q.options[q.correctIndex].text);
 const keys=keysBySet.get(choiceSet)||new Set();
 assert.ok(!keys.has(key),`Repeated choices with the same key in ${q.id}`);
 keys.add(key);keysBySet.set(choiceSet,keys);
 if(q.questionRevision!==6){
  assert.equal(q.questionRevision,5,q.id);
  assert.deepEqual(q,old,q.id);
  cases.preserved++;choiceCounts.preserved+=4;
  continue;
 }
 assert.notEqual(q.stem,old.stem,q.id);
 assert.ok(!revisedSets.has(choiceSet),q.id);revisedSets.add(choiceSet);

 if(q.conceptId){
  const first=factsById.get(q.conceptId);
  const [,kind,secondId]=q.options[q.correctIndex].referenceId.split(':');
  const second=factsById.get(secondId);
  assert.equal(kind,'contrast',q.id);
  assert.ok(first&&second&&first.id!==second.id,q.id);
  const pairKey=[first.id,second.id].sort().join(':');
  assert.ok(!factPairs.has(pairKey),`Repeated reference pair in ${q.id}`);
  factPairs.add(pairKey);
  assert.ok(q.stem.includes(second.definition),q.id);
  assert.ok(old.options.some(o=>o.referenceId===second.id),q.id);
  const firstAnswer=old.options[old.correctIndex].text,secondAnswer=old.options.find(o=>o.referenceId===second.id).text;
  for(const [index,option] of q.options.entries()){
   const [a,b]=option.text.split('\n').map(line=>line.split(' — ').slice(1).join(' — '));
   assert.equal(a===firstAnswer&&b===secondAnswer,index===q.correctIndex,q.id);
   assert.ok(old.options.some(o=>o.text===a)&&old.options.some(o=>o.text===b),q.id);
   assert.ok(option.rationale.includes(firstAnswer)&&option.rationale.includes(secondAnswer),q.id);
   const refs=sourced(q,option);
   assert.ok(refs.includes(q.source)&&refs.includes(second.source),q.id);
   choiceCounts.reference++;
  }
  cases.reference++;
  continue;
 }

 if(q.options[q.correctIndex].referenceId.includes(':outcome:')){
  const caseItems=families.get(questionFamily(q));
  const plan=caseItems.find(item=>item.clinicalObjective==='planning');
  const action=caseItems.find(item=>item.clinicalObjective==='action');
  assert.equal(q.decisionSummary,plan.options[plan.correctIndex].text,q.id);
  assert.ok(q.stem.includes(q.decisionSummary)||q.stem.includes(action.options[action.correctIndex].text),q.id);
  assert.ok(q.options[q.correctIndex].text.includes(q.decisionSummary),q.id);
  for(const option of q.options){
   assert.equal(option.source,processSource,q.id);
   assert.equal(option.contextSource,old.source,q.id);
   choiceCounts.outcome++;
  }
  cases.outcome++;
  continue;
 }

 for(const [index,option] of q.options.entries()){
  const [id,kind,a,peerId,b]=option.referenceId.split(':');
  const peer=prior.get(peerId);
  assert.equal(kind,'paired',q.id);assert.equal(id,q.id);assert.ok(peer&&peer.id!==q.id,q.id);
  assert.equal(Number(a)===old.correctIndex&&Number(b)===peer.correctIndex,index===q.correctIndex,q.id);
  const aOption=old.options[Number(a)],bOption=peer.options[Number(b)];
  assert.ok(option.text.includes(aOption.text)&&option.text.includes(bOption.text),q.id);
  const rationale=normalizeQuestionStem(option.rationale);
  assert.ok(rationale.includes(normalizeQuestionStem(rationaleClaim(aOption))),q.id);
  assert.ok(rationale.includes(normalizeQuestionStem(rationaleClaim(bOption))),q.id);
  const refs=sourced(q,option);
  assert.ok(sourced(old,aOption).every(url=>refs.includes(url))&&sourced(peer,bOption).every(url=>refs.includes(url)),q.id);
  choiceCounts.paired++;
 }
 cases.paired++;
}
assert.equal(revisedSets.size,7167);
assert.equal(Object.values(choiceCounts).reduce((sum,count)=>sum+count,0),38432);
console.log(JSON.stringify({questions:bank.length,revised:revisedSets.size,choices:choiceCounts,questionTypes:cases,distinctCitedURLs:urls.size,unchangedGradingPositions:bank.length}));
