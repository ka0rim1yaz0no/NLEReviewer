import {normalizeQuestionStem} from './bank.ts';
import {displayRationale,unsafeDecision} from './rationale-display.ts';
import {questionFamily,questionChoiceKey} from './question-selection.ts';
import facts from './concept-evidence.json' with {type:'json'};
import corrections from './repetition-corrections.json' with {type:'json'};

const factById=new Map(facts.map(fact=>[fact.id,fact]));
const key=q=>q.options[q.correctIndex];
const normalize=normalizeQuestionStem;
const sentence=text=>/[.!?]$/.test(text)?text:text+'.';
const legacyRoles=['recognition','action','teaching','planning','safety'];
const role=q=>q.clinicalObjective||legacyRoles[Number(q.id.match(/^(?:CROSS|NP[1-5])-\d{3}-([1-5])$/)?.[1])-1];
const stageNames={recognition:'Assessment',action:'Action',teaching:'Teaching',planning:'Expected outcome',reasoning:'Explanation',safety:'Proposal to question'};
const stages={
 recognition:['reasoning','Which assessment and explanation best fit the documented findings?'],
 action:['recognition','Which nursing action and priority assessment belong in this care plan?'],
 teaching:['action','Which teaching point and nursing action address the same priority?'],
 planning:['teaching','Which expected outcome and teaching point belong in the plan?'],
 reasoning:['safety','Which explanation fits the findings, and which proposal should the nurse question?'],
 safety:['recognition','Which pair identifies an unsafe proposal and the assessment it conflicts with?'],
};
const processSource='https://www.ncbi.nlm.nih.gov/books/NBK610818/#ptiv.sec8';

const ignored=new Set('which when before after from with that this what could should patient client nurse care case outcome needs possible plans condition reports indicates assesses change clinical situation treatment identify use'.split(' '));
const tokens=text=>new Set(normalize(text).split(' ').filter(word=>word.length>2&&!ignored.has(word)));
function overlap(a,b){
 const intersection=[...a].filter(word=>b.has(word)).length;
 return intersection/Math.max(1,a.size+b.size-intersection);
}

function choiceOrder(question,context){
 const target=tokens(key(question).text);
 return question.options.map((option,index)=>({index,score:overlap(tokens(option.text),context)+overlap(tokens(option.text),target)*.4}))
  .filter(option=>option.index!==question.correctIndex)
  .sort((a,b)=>b.score-a.score||a.index-b.index).map(option=>option.index);
}

function clinicalReason(option){
 // These repeated closing lines are already established by the prompt. The
 // explanation keeps the cited clinical reason and any qualifier in it.
 return displayRationale(option.rationale).replace(/\s+The cue to act on here is [^.!?]+[.!?]$/,'');
}

function pair(question,companion,stem,labels,usedSets,extra={}){
 const context=tokens(question.stem+' '+companion.stem);
 const firstOptions=choiceOrder(question,context),secondOptions=choiceOrder(companion,context);
 const textFor=([first,second])=>`${labels[0]} — ${question.options[first].text}\n${labels[1]} — ${companion.options[second].text}`;
 const combinations=firstOptions.flatMap((first,i)=>secondOptions.map((second,j)=>({first,second,rank:i+j}))).sort((a,b)=>a.rank-b.rank);
 const pairs=combinations.map(({first,second})=>[[question.correctIndex,second],[first,companion.correctIndex],[first,second]])
  .find(variant=>!usedSets.has(questionChoiceKey({...question,options:[...variant,[question.correctIndex,companion.correctIndex]].map(indices=>({text:textFor(indices)}))})));
 if(!pairs)throw Error(`No distinct paired choices for ${question.id}`);
 pairs.splice(question.correctIndex,0,[question.correctIndex,companion.correctIndex]);
 const options=pairs.map(([first,second])=>{
  const a=question.options[first],b=companion.options[second];
  const references=[...new Set([a.source||question.source,b.source||companion.source,a.contextSource,b.contextSource,question.source,companion.source].filter(Boolean))];
  const reasonA=clinicalReason(a),reasonB=clinicalReason(b);
  const fitsA=first===question.correctIndex,fitsB=second===companion.correctIndex;
  const rationale=fitsA&&fitsB&&reasonA===reasonB
   ?`Both parts fit. ${reasonA}`
   :`${labels[0]} ${fitsA?'fits':'does not fit'}. ${reasonA} ${labels[1]} ${fitsB?'fits':'does not fit'}. ${reasonB}`;
  return {
   text:textFor([first,second]),
   rationale,
   source:references[0],contextSource:references[1],additionalSources:references.slice(2),
   referenceId:`${question.id}:paired:${first}:${companion.id}:${second}`,
  };
 });
 const revised={...question,...extra,stem,options,rationale:options[question.correctIndex].rationale,questionRevision:6};
 usedSets.add(questionChoiceKey(revised));
 return revised;
}

function evaluateOutcome(question,action,plan,scenario){
 const intervention=sentence(key(action).text);
 const goal=key(plan).text;
 const alternative=plan.options[choiceOrder(plan,tokens(scenario))[0]];
 const recorded=question.id.charCodeAt(question.id.indexOf('-evaluation')-1)%2===0;
 const stem=recorded
  ?`${scenario}\n\nAt the first follow-up the team reports this result: ${sentence(goal)} The plan calls for another check. Which evaluation connects the finding to the right priority and its limits?`
  :`${scenario}\n\nThe handoff documents this intervention: ${intervention} The outcome has yet to be reassessed. Which evaluation and follow-up are supported now?`;
 const best=recorded
  ?[`Record progress and repeat the check for this outcome: ${sentence(goal)}`,`The reported finding supports the priority at this assessment. The next comparison is needed to establish whether the response persists. ${displayRationale(key(plan).rationale)}`]
  :[`Document the intervention and reassess for this outcome: ${sentence(goal)}`,`The handoff shows that the intervention was performed. The intended outcome still needs its own assessment. ${displayRationale(key(plan).rationale)}`];
 const choices=recorded?[
  [`Sign off the planned follow-up for this outcome: ${sentence(goal)}`, 'The current finding can support progress. It cannot establish a later response or replace an outcome check that is already scheduled.'],
  [`Transfer follow-up to this outcome: ${sentence(alternative.text)}`,`That outcome addresses a different assessment. ${displayRationale(alternative.rationale)}`],
  [`Record the intervention alone: ${intervention}`, 'This handoff includes an actual outcome finding. The response belongs in the evaluation as evidence of progress at this check.'],
 ]:[
  [`Record this outcome as achieved on the basis of the intervention alone: ${sentence(goal)}`,'Documentation of completed care does not establish the resulting patient outcome. Record the intervention and obtain the planned reassessment findings.'],
  [`Document the intervention and reassess for this outcome: ${sentence(alternative.text)}`,`The documentation step is appropriate. The proposed outcome addresses a different priority. ${displayRationale(alternative.rationale)}`],
  ['Mark the original goal unmet because the handoff contains no reassessment result.', 'Missing observations leave the outcome undetermined. A follow-up assessment provides the evidence needed to judge progress.'],
 ];
 choices.splice(question.correctIndex,0,best);
 const options=choices.map(([text,rationale],index)=>({text,rationale,source:processSource,contextSource:question.source,
  ...(rationale.includes(displayRationale(alternative.rationale))&&alternative.source&&alternative.source!==question.source?{additionalSources:[alternative.source]}:{}),
  referenceId:`${question.id}:outcome:${index+1}`}));
 return {...question,stem,options,rationale:options[question.correctIndex].rationale,questionRevision:6,decisionSummary:goal};
}

const blockedWording=[...corrections.rules.map(rule=>rule.from),'most often IgA','Sodium-glucose co-transporter 2 SLT-2 inhibitors'];
const safeFact=fact=>fact&&!blockedWording.some(text=>fact.definition.includes(text)||fact.term.includes(text));
function referenceContrast(question){
 const fact=factById.get(question.conceptId);
 const alternatives=question.options.filter((_,index)=>index!==question.correctIndex);
 const peers=alternatives.map(option=>({option,fact:factById.get(option.referenceId)})).filter(peer=>safeFact(peer.fact))
  .filter(peer=>peer.fact.id!==fact.id&&peer.fact.kind===fact.kind&&(fact.kind!=='comparison'||peer.fact.poolId===fact.poolId));
 const evidence=question.stem.split('\n\n').at(-1).replace(fact.kind==='comparison'?new RegExp(`^${fact.relation.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')}:\\s*`):/^$/,'');
 const ranked=peers.filter(peer=>normalize(peer.fact.definition)!==normalize(evidence)).sort((a,b)=>Number(a.fact.definition.length>400)-Number(b.fact.definition.length>400)
  ||overlap(tokens(evidence),tokens(b.fact.definition))-overlap(tokens(evidence),tokens(a.fact.definition))||a.fact.definition.length-b.fact.definition.length);
 return {fact,evidence,alternatives,ranked};
}

function distinctReferencePairs(questions){
 const candidates=new Map(questions.map(q=>[q.id,referenceContrast(q)]));
 const selected=new Map(),owners=new Map();
 // Move an earlier item to its next compatible peer when this is the only
 // way to avoid asking for the same findings in reverse order.
 function assign(id,visited){
  const {fact,ranked}=candidates.get(id);
  const options=ranked.map(peer=>({peer,pairKey:[fact.id,peer.fact.id].sort().join(':')}));
  options.sort((a,b)=>Number(owners.has(a.pairKey))-Number(owners.has(b.pairKey)));
  for(const {peer,pairKey} of options){
   if(visited.has(pairKey))continue;
   visited.add(pairKey);
   const owner=owners.get(pairKey);
   if(!owner||assign(owner,visited)){
    owners.set(pairKey,id);selected.set(id,peer);return true;
   }
  }
  return false;
 }
 for(const q of questions)if(!assign(q.id,new Set()))throw Error(`No unique compatible reference contrast for ${q.id}`);
 return new Map([...candidates].map(([id,item])=>[id,{...item,selected:selected.get(id)}]));
}

function compareFacts(question,{fact,evidence,alternatives,selected},usedSets){
 const second=selected.fact,peer=selected.option;
 const pairText=([first,last])=>`First — ${first.text}\nSecond — ${last.text}`;
 const other=alternatives.filter(option=>option!==peer);
 const variants=other.flatMap(first=>other.map(last=>[[key(question),last],[first,peer],[peer,key(question)]]));
 const choices=variants.find(variant=>{
  const candidate=[...variant,[key(question),peer]].map(pair=>({text:pairText(pair)}));
  return !usedSets.has(questionChoiceKey({...question,options:candidate}));
 });
 if(!choices)throw Error(`No distinct set of reference choices for ${question.id}`);
 choices.splice(question.correctIndex,0,[key(question),peer]);
 const describe=(choice,correct,position,definition)=>choice.text===correct.text
  ?`${position}. ${correct.text} fits this description. ${sentence(definition)}`
  :`${position}. ${correct.text} is the match. ${choice.rationale.split(' The description in the question instead matches ')[0]}`;
 const options=choices.map(([first,last],index)=>{
  const references=[...new Set([first.source||question.source,last.source||question.source,question.source,second.source,first.contextSource,last.contextSource].filter(Boolean))];
  return {text:pairText([first,last]),
   rationale:describe(first,key(question),'First',evidence)+' '+describe(last,peer,'Second',second.definition),
   source:references[0],contextSource:references[1],additionalSources:references.slice(2),
   referenceId:`${question.id}:contrast:${second.id}:${index+1}`};
 });
 const heading=fact.kind==='comparison'?`In the comparison of ${fact.tableTitle}, which entries match the two findings in order?`:'Which terms should the nurse use to distinguish the two findings in order?';
 return {...question,stem:`${heading}\n\nFirst finding — ${evidence}\nSecond finding — ${second.definition}`,
  options,rationale:options[question.correctIndex].rationale,questionRevision:6,
  ...(question.format==='concept'?{recall:{prompt:evidence,choices:question.options.map(option=>option.text)}}:{}),
  reviewCaseId:second.id};
}

function caseText(question){
 return question.stem.replace(/\n\n/g,' ');
}

function standaloneContrast(question,bySubject,singleTopics,usedCompanions,usedPairs,usedSets){
 const topic=`${question.subject}:${question.topic}`;
 const own=questionFamily(question);
 const family=peer=>questionFamily(peer);
 const used=usedCompanions.get(topic)||new Set();
 const reserved=singleTopics.get(topic)||new Set();
 const candidates=(bySubject.get(question.subject)||[]).filter(peer=>peer.id!==question.id&&peer.topic!==question.topic&&family(peer)!==own&&!reserved.has(family(peer)));
 const keys=peer=>[own,family(peer)].sort().join(':');
 const words=tokens(question.stem+' '+key(question).text);
 const ranked=candidates.map(peer=>({peer,score:overlap(words,tokens(peer.stem+' '+key(peer).text))
  +Number(peer.stem.length<330)*.15+Number(role(peer)===role(question))*.06
  -Number(used.has(family(peer)))*2-Number(usedPairs.has(keys(peer)))*2}));
 ranked.sort((a,b)=>b.score-a.score||a.peer.id.localeCompare(b.peer.id));
 const companion=ranked.find(({peer})=>normalize(key(peer).text)!==normalize(key(question).text)&&overlap(words,tokens(peer.stem))<.66)?.peer;
 if(!companion)throw Error(`No distinct second decision for ${question.id}`);
 usedPairs.add(keys(companion));
 used.add(family(companion));usedCompanions.set(topic,used);
 return pair(question,companion,`First situation\n${caseText(question)}\n\nSecond situation\n${caseText(companion)}\n\nWhich pair answers both nursing questions?`,['First','Second'],usedSets,{
  reviewCaseId:family(companion),decisionSummary:key(question).text,
 });
}

export function reviewRemainingQuestions(bank,companions=bank,priorRevisions=[]){
 const active=companions.filter(q=>!q.retired);
 const groups=Map.groupBy(active,questionFamily);
 const singles=active.filter(q=>!q.conceptId&&groups.get(questionFamily(q)).length===1);
 const singleTopics=new Map([...Map.groupBy(singles,q=>`${q.subject}:${q.topic}`)].map(([topic,items])=>[topic,new Set(items.map(questionFamily))]));
 const bySubject=Map.groupBy(active.filter(q=>!q.conceptId&&role(q)!=='evaluation'),q=>q.subject);
 const usedPairs=new Set(),usedCompanions=new Map();
 for(const q of priorRevisions.filter(q=>!q.retired&&!q.conceptId&&q.reviewCaseId)){
  const topic=`${q.subject}:${q.topic}`;
  const used=usedCompanions.get(topic)||new Set();
  used.add(q.reviewCaseId);usedCompanions.set(topic,used);
 }
 const usedSets=new Set([...active.filter(q=>q.questionRevision===5),...priorRevisions.filter(q=>!q.retired)].map(questionChoiceKey));
 const referencePairs=distinctReferencePairs(bank.filter(q=>!q.retired&&q.questionRevision!==5&&q.conceptId));
 const counts={reference:0,linked:0,evaluation:0,standalone:0};
 const questions=bank.map(question=>{
  if(question.retired||question.questionRevision===5)return question;
  if(question.conceptId){
   counts.reference++;
   const revised=compareFacts(question,referencePairs.get(question.id),usedSets);
   usedSets.add(questionChoiceKey(revised));
   return revised;
  }
  const family=groups.get(questionFamily(question))||[];
  const byRole=new Map(family.map(q=>[role(q),q]));
  const scenario=question.stem.split('\n\n')[0];
  const objective=role(question);
  const action=byRole.get('action'),plan=byRole.get('planning');
  if(objective==='evaluation'&&action&&plan){counts.evaluation++;return evaluateOutcome(question,action,plan,scenario);}
  const [other,prompt]=objective==='recognition'&&!byRole.has('reasoning')
   ?['planning','Which assessment finding and expected outcome should the nurse connect in this plan?']
   :stages[objective]??[];
  const companion=byRole.get(other);
  if(companion&&companion.id!==question.id){
   counts.linked++;
   return pair(question,companion,`${scenario}\n\n${prompt}`, [stageNames[objective],stageNames[other]],usedSets,{decisionSummary:key(question).text});
  }
  counts.standalone++;
  return standaloneContrast(question,bySubject,singleTopics,usedCompanions,usedPairs,usedSets);
 });
 const revised=questions.filter(q=>q.questionRevision===6);
 const sets=Map.groupBy(revised,questionChoiceKey);
 const repeated=[...sets.values()].filter(group=>group.length>1);
 if(repeated.length||sets.has(''))throw Error(`The revised bank has ${repeated.length} repeated choice sets, including ${JSON.stringify(repeated.slice(0,8).map(group=>group.map(q=>q.id)))}`);
 return {questions,counts};
}
