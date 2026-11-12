import {normalizeQuestionStem} from './bank.ts';
import facts from './concept-evidence.json' with {type:'json'};
import corrections from './repetition-corrections.json' with {type:'json'};
import {canonicalQuestionId,questionChoiceKey} from './question-selection.ts';

const byId=new Map(facts.map(fact=>[fact.id,fact]));
const ignored=new Set('the and that this these those have from into which when with most also used use may can are has during including associated about than more only called such related between normal other person patient nurse client nursing'.split(' '));
const wordSet=text=>new Set(normalizeQuestionStem(text).split(' ').filter(word=>word.length>2&&!ignored.has(word)).map(word=>word.replace(/s$/,'')));
const terms=new Map(facts.map(fact=>[fact.id,wordSet(fact.term)]));
const definitions=new Map(facts.map(fact=>[fact.id,wordSet(fact.definition)]));
const intersection=(a,b)=>[...a].filter(word=>b.has(word)).length;
const similarity=(a,b)=>{const common=intersection(a,b);return common/Math.max(1,a.size+b.size-common);};
const contains=(body,phrase)=>` ${normalizeQuestionStem(body)} `.includes(` ${normalizeQuestionStem(phrase)} `);
const sentence=text=>/[.!?]$/.test(text)?text:text+'.';
const sourceFact=(option,fact)=>option&&fact&&option.text===fact.term&&option.source===fact.source&&contains(option.rationale,fact.definition);
const groupOf=fact=>fact.kind==='comparison'?fact.poolId:`${fact.sourceId}:${fact.subject}:${fact.topic}`;
const tableOf=fact=>`${fact.sourceId}:${fact.entryId}`;
const wordingCorrections=[
 {from:'Sodium-glucose co-transporter 2 SLT-2 inhibitors',to:'Sodium-glucose cotransporter 2 (SGLT2) inhibitors',source:'https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/209803s012lbl.pdf'},
 {from:'Recipient allergy to donor antigen (most often IgA).',to:'A severe allergic response to a transfused component. Anti-IgA accounts for a small subset of these reactions.',source:'https://professionaleducation.blood.ca/en/transfusion/publications/anaphylactic-transfusion-reactions-and-iga-deficiency'},
];
const allowed=fact=>![...corrections.rules,...wordingCorrections].some(rule=>fact.definition.includes(rule.from));
function correctSourceWording(question){
 let revised=question;
 for(const {from,to,source} of wordingCorrections){
  const fix=text=>text.replaceAll(from,to);
  const options=revised.options.map(option=>option.text.includes(from)||option.rationale.includes(from)
   ?{...option,text:fix(option.text),rationale:fix(option.rationale),contextSource:source}:option);
  if(![revised.stem,revised.keyPoint,revised.rationale].some(text=>text.includes(from))&&options.every((o,i)=>o===revised.options[i]))continue;
  revised={...revised,stem:fix(revised.stem),keyPoint:fix(revised.keyPoint),rationale:fix(revised.rationale),options,questionRevision:5};
 }
 return revised;
}

function relationStrength(key,peer){
 if(!peer)return 0;
 const a=definitions.get(key.id),b=definitions.get(peer.id);
 return similarity(a,b)+similarity(terms.get(key.id),terms.get(peer.id))*.24;
}

function eligiblePeer(question,key,peer){
 if(question.options.some(option=>canonicalQuestionId(option.referenceId)===canonicalQuestionId(peer.id)||normalizeQuestionStem(option.text)===peer.canonical))return false;
 if(peer.term.length>Math.max(42,key.term.length*1.7)||peer.term.length<3||peer.definition.length>520)return false;
 if(contains(key.term,peer.term)||contains(peer.term,key.term)||contains(question.stem,peer.term))return false;
 const keyDefinition=definitions.get(key.id),peerDefinition=definitions.get(peer.id);
 const overlap=similarity(keyDefinition,peerDefinition);
 if(intersection(keyDefinition,peerDefinition)<2||overlap>.53||contains(key.definition,peer.definition)||contains(peer.definition,key.definition))return false;
 return question.options.every(option=>{
  const prior=byId.get(option.referenceId);
  return !prior||!contains(prior.term,peer.term)&&!contains(peer.term,prior.term)&&similarity(definitions.get(prior.id),peerDefinition)<.61;
 });
}

function closerAlternative(question,key,peers,usedChoices){
 const alternatives=question.options.map((option,index)=>({index,score:relationStrength(key,byId.get(option.referenceId))}))
  .filter(({index})=>index!==question.correctIndex).sort((a,b)=>a.score-b.score||a.index-b.index);
 const weakest=alternatives[0];
 const ranked=peers.map(peer=>({peer,score:relationStrength(key,peer)}))
  .filter(({score})=>score>=Math.max(.14,weakest.score+.105))
  .sort((a,b)=>b.score-a.score||a.peer.id.localeCompare(b.peer.id));
 for(const {peer} of ranked){
  if(!eligiblePeer(question,key,peer))continue;
  const options=[...question.options];
  options[weakest.index]={text:peer.term,rationale:`${peer.term} refers to ${sentence(peer.definition)} The evidence in this question identifies ${key.term}.`,source:peer.source,referenceId:peer.id};
  if(!usedChoices.has(questionChoiceKey({...question,options})))return options;
 }
}

// A different column of the same source table identifies the row. The answer
// then requires applying a second attribute, with peer values from that column.
function twoCueComparison(question,key,table,activeFacts){
 if(key.kind!=='comparison'||key.definition.length>220||!table||/Transfusion Reactions/.test(key.tableTitle))return;
 const peers=question.options.map(option=>byId.get(option.referenceId));
 if(peers.some((peer,index)=>!peer||peer.poolId!==key.poolId||peer.definition.length>220||!sourceFact(question.options[index],peer)))return;
 const cues=table.filter(fact=>activeFacts.has(fact.id)&&fact.row===key.row&&fact.column!==key.column&&fact.definition.length>=20&&fact.definition.length<=205
  &&!contains(fact.definition,key.term)&&!contains(fact.definition,key.definition)&&!contains(key.definition,fact.definition)
  &&similarity(definitions.get(fact.id),definitions.get(key.id))<.38
  &&!/^(Examples?|Additional Information|Description)$/i.test(fact.relation));
 for(const cue of cues){
  const clueWords=definitions.get(cue.id);
  const others=table.filter(fact=>fact.column===cue.column&&fact.row!==cue.row);
  if(others.some(fact=>contains(fact.definition,cue.definition)||similarity(clueWords,definitions.get(fact.id))>=.60))continue;
  if(peers.some(peer=>contains(cue.definition,peer.definition)))continue;
  if(peers.some((peer,index)=>peers.slice(index+1).some(other=>contains(peer.definition,other.definition)||contains(other.definition,peer.definition))))continue;
  const options=peers.map(peer=>({
   text:peer.definition,
   rationale:peer.id===key.id
    ?`The cue identifies ${key.term} under ${cue.relation.toLowerCase()}. Its ${key.relation.toLowerCase()} is ${sentence(key.definition)}`
    :`This is listed for ${peer.term}. The ${cue.relation.toLowerCase()} in the question identifies ${key.term}, so use that entry to determine its ${key.relation.toLowerCase()}.`,
   source:peer.source,referenceId:peer.id,
  }));
  return {
   stem:`${cue.relation}: ${sentence(cue.definition)}\n\nIn ${key.tableTitle}, which entry under “${key.relation}” corresponds to this finding?`,
   options,rationale:options[question.correctIndex].rationale,caseId:cue.id,
  };
 }
}

export function reviewReferenceDifficulty(bank){
 const groups=new Map(),tables=new Map(),activeFacts=new Set();
 const groupAdd=(map,id,fact)=>{const members=map.get(id)||[];members.push(fact);map.set(id,members);};
 for(const fact of facts)if(fact.kind==='comparison')groupAdd(tables,tableOf(fact),fact);
 for(const q of bank){
  const fact=byId.get(q.conceptId);
  if(!q.retired&&sourceFact(q.options[q.correctIndex],fact)&&allowed(fact)){
   groupAdd(groups,groupOf(fact),fact);activeFacts.add(fact.id);
  }
 }
 const usedChoices=new Set(bank.filter(q=>!q.retired).map(questionChoiceKey));
 const counts={reviewed:0,closerAlternatives:0,twoCueComparisons:0,answerCuesRemoved:0};
 const questions=bank.map(q=>{
  const fact=byId.get(q.conceptId);
  if(q.retired||!fact)return q;
  counts.reviewed++;
  if(!sourceFact(q.options[q.correctIndex],fact))return q;
  const comparison=twoCueComparison(q,fact,tables.get(tableOf(fact)),activeFacts);
  if(comparison){
   const changed={...q,...comparison,questionRevision:5};
   const choiceKey=questionChoiceKey(changed);
   if(choiceKey&&!usedChoices.has(choiceKey)){
    counts.twoCueComparisons++;usedChoices.add(choiceKey);return changed;
   }
  }
  const peers=groups.get(groupOf(fact))||[];
  const options=closerAlternative(q,fact,peers,usedChoices);
  const [heading,body]=q.stem.split('\n\n');
  const leaked=body&&fact.term.length>3&&contains(heading,fact.term);
  if(!options&&!leaked)return q;
  const stem=leaked
   ?(fact.kind==='comparison'?`Which ${fact.keyHeader.toLowerCase()} matches this ${fact.relation.toLowerCase()}?`:'Which term best matches this description?')+'\n\n'+body
   :q.stem;
  const revised={...q,stem,options:options??q.options,questionRevision:5};
  if(options)counts.closerAlternatives++;
  if(leaked)counts.answerCuesRemoved++;
  usedChoices.add(questionChoiceKey(revised));
  return revised;
 });
 return {questions:questions.map(q=>q.retired?q:correctSourceWording(q)),counts};
}
