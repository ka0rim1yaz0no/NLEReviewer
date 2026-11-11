import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {clinicalCases,questions as prior} from './previous-authoring-bank.ts';
import {normalizeQuestionStem,validateQuestions} from './bank.ts';
import {isSituational} from './collections.ts';
import {questionFamily} from './question-selection.ts';

const readJSON=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const evidence=new Map((await readJSON('./situational-evidence.json')).filter(c=>!c.retired).map(c=>[c.id,c]));
const {cases:caseEdits,standalone:standaloneEdits}=await readJSON('./judgment-edits.json');
const priorById=new Map(prior.map(q=>[q.id,q]));
const active=prior.filter(isSituational);
const groups=Map.groupBy(active,questionFamily);
const legacy=new Map(clinicalCases.map((c,index)=>[c.subject+'-'+String(index+1).padStart(3,'0'),c]));
const fields=['problem','action','teaching','outcome','unsafe'];
const keyed=q=>q.options[q.correctIndex].text;
const sentence=s=>/[.!?][”"']?$/.test(s)?s:s+'.';
const lower=s=>/^[A-Z]{2}/.test(s)?s:s.charAt(0).toLowerCase()+s.slice(1);
const words=s=>normalizeQuestionStem(s).split(' ').filter(w=>w.length>2&&!stop.has(w)).map(w=>aliases.get(w)||w);
const stop=new Set('the and for from with before after have had who when this that their using during most should which what would health nursing nurse care client patient reports priority assess reassess without recommends recommended plan support possible risk current'.split(' '));
const routine=new Set('arrange confirm check follow notify report continue obtain immediate promptly urgent urgently appropriate assessment review prescribed'.split(' '));
const aliases=new Map(Object.entries({kidney:'renal',kidneys:'renal',infants:'infant',newborn:'infant',newborns:'infant',gestation:'pregnancy',pregnant:'pregnancy',breath:'respiration',breathing:'respiration',respiratory:'respiration',oxygenation:'oxygen',pulmonary:'lung',urinary:'urine',hypotensive:'hypotension',hypertensive:'hypertension',surgical:'surgery',perioperative:'surgery',preoperative:'surgery',postoperative:'surgery',hemorrhage:'bleeding',haemorrhage:'bleeding',seizures:'seizure',convulsion:'seizure',glucose:'glycemia',diabetes:'glycemia',diabetic:'glycemia',fluid:'fluids',vaccine:'vaccination',vaccines:'vaccination',immunization:'vaccination'}));

// Keep the published evidence and source repairs as the answer authority.
// Explicit case edits replace a repeated or unclear case as a whole.
const cases=[];
for(const [id,group] of groups){
 const old=legacy.get(id),modern=evidence.get(id);
 if(!old&&!modern)continue;
 const q=group[0];
 const base=modern||{
  id,subject:q.subject,topic:q.topic,topicSlug:q.topic,
  scenario:old.scenario,reason:old.facts[0].reason,
  ...Object.fromEntries(fields.map((field,index)=>[field,old.facts[index].text])),
 };
 const facts=old?Object.fromEntries(fields.map((field,index)=>[field,old.facts[index].reason])):{};
 const changes=caseEdits[id]||{};
 cases.push({...base,source:q.source,...changes,reasons:{...facts,...changes.reasons},isLegacy:!!old});
}
const byCase=new Map(cases.map(c=>[c.id,c]));
const corpus=cases.map(c=>new Set(words([c.scenario,c.problem,c.action,c.topic,c.reason].join(' '))));
const occurrences=new Map();
for(const bag of corpus)for(const token of bag)occurrences.set(token,(occurrences.get(token)||0)+1);
const weight=token=>Math.log(1+cases.length/(1+(occurrences.get(token)||0)));
function similarity(a,b){
 let overlap=0,union=0;
 for(const word of new Set([...a,...b])){
  const w=weight(word);
  union+=w;
  if(a.has(word)&&b.has(word))overlap+=w;
 }
 return union?overlap/union:0;
}
function sharedCoverage(a,b){
 let aSize=0,bSize=0,common=0;
 for(const token of a){const w=weight(token);aSize+=w;if(b.has(token))common+=w;}
 for(const token of b)bSize+=weight(token);
 return Math.min(aSize,bSize)?common/Math.min(aSize,bSize):0;
}
const tags=new Map(cases.map(c=>[c.id,{
 scenario:new Set(words(c.scenario)),problem:new Set(words(c.problem)),topic:new Set(words(c.topic)),
 action:new Set(words(c.action)),all:new Set(words([c.scenario,c.problem,c.action,c.topic,c.reason].join(' ')))
}]));
const related=new Map(cases.map(c=>{
 const a=tags.get(c.id);
 return [c.id,cases.filter(p=>p.id!==c.id).map(p=>{
  const b=tags.get(p.id);
  const score=5*similarity(a.scenario,b.scenario)+3*similarity(a.problem,b.problem)+1.5*similarity(a.action,b.action)+2*similarity(a.topic,b.topic)+similarity(a.all,b.all)+(c.topicSlug===p.topicSlug?0.8:0)+(p.subject===c.subject?0.12:0);
  return {p,score};
 }).sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id)).slice(0,80)];
}));

const labels={problem:'recognition',action:'action',teaching:'teaching',outcome:'planning',unsafe:'safety'};
const role=q=>q.clinicalObjective||labels[fields[Number(q.id.at(-1))-1]];
const topicCue=c=>c.isLegacy?c.problem:lower(c.problem);
const rationale=(c,field)=>c.reasons[field]||c.reason;
const reference=(c,field)=>({source:c.source,referenceId:c.id+':'+field});
const prompts={
 recognition:'Which interpretation of the available cues should guide the nurse’s first decision?',
 action:'Which nursing action best addresses the priority indicated by these findings?',
 teaching:'Which teaching point best prepares the learner to respond to the risk in this situation?',
 safety:'Which proposed plan entry should the nurse revise before putting the plan into effect?',
 planning:'Which outcome should the nurse use to judge whether the plan addresses the priority need?',
};
const kinds={recognition:'problem',action:'action',teaching:'teaching',planning:'outcome',reasoning:'reason'};
function optionFor(c,field){
 if(field==='unsafe'&&/^Assume /i.test(c.unsafe))return 'Base the plan on the assumption that '+c.unsafe.slice(7);
 return c[field];
}
function distractors(c,field,correct,count,oldChoices=[]){
 const target=normalizeQuestionStem(correct),targetWords=new Set(words(correct));
 const meaningful=new Set([...targetWords].filter(token=>!routine.has(token)));
 const current=tags.get(c.id);
 const candidates=related.get(c.id).map(({p,score})=>{
  const text=optionFor(p,field),body=normalizeQuestionStem(text),tokens=new Set(words(text));
  const sameDecision=similarity(targetWords,tokens);
  const distinctTerms=new Set([...tokens].filter(token=>!routine.has(token)));
  const nearlySame=meaningful.size>=3&&distinctTerms.size>=3&&sharedCoverage(meaningful,distinctTerms)>.57;
  const peer=tags.get(p.id);
  const sharedProblem=[...current.problem].some(token=>peer.problem.has(token)&&(occurrences.get(token)||0)<32);
  const sharesResponse=field==='action'&&sharedProblem&&sharedCoverage(targetWords,tokens)>.32;
  const sizePenalty=Math.abs(Math.log((text.length+15)/(correct.length+15)));
  return {p,body,text,sameDecision,sharesResponse,nearlySame,score:score+sameDecision*.25-sizePenalty*.64};
 }).filter(item=>item.body!==target&&item.sameDecision<.57&&!item.sharesResponse&&!item.nearlySame)
   .sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id));
 const picked=[],used=new Set([target]);
 for(const item of candidates){
  if(used.has(item.body)||picked.some(entry=>similarity(new Set(words(entry.text)),new Set(words(item.text)))>.70))continue;
  picked.push(item);used.add(item.body);
  if(picked.length===count)break;
 }
 assert.equal(picked.length,count,`${c.id} ${field} alternatives`);
 if(oldChoices.length){
  const old=new Set(oldChoices.map(o=>normalizeQuestionStem(o.text)));
  if(picked.every(item=>old.has(item.body))){
   const novel=candidates.find(item=>!old.has(item.body)&&picked.slice(0,-1).every(entry=>similarity(new Set(words(entry.text)),new Set(words(item.text)))<=.70));
   assert.ok(novel,`No distinct alternative found for ${c.id} ${field}`);
   picked[picked.length-1]=novel;
  }
 }
 return picked;
}
function peerOption(c,p,text,field){
 const different=p.isLegacy?sentence(p.scenario):sentence(p.problem);
 const explanation=field==='reason'?'That explanation addresses a different set of findings.':'This choice fits a different clinical priority.';
 return {text,rationale:`${explanation} ${different} ${sentence(rationale(p,field))} The cue to act on here is ${sentence(topicCue(c))}`,...reference(p,field),...(p.source!==c.source?{contextSource:c.source}:{})};
}
function revisedSafety(c){
 return {
  prompt:prompts.safety,text:optionFor(c,'unsafe'),
  why:`${sentence(rationale(c,'unsafe'))} The safer response in this case is to ${sentence(lower(c.action))} ${c.isLegacy?sentence(rationale(c,'action')):''}`.trim(),
  alternatives:[
   {text:c.action,rationale:`${sentence(rationale(c,'action'))} This action addresses the priority indicated by the case.`,...reference(c,'action')},
   {text:`Review this instruction at the appropriate time: ${c.teaching}`,rationale:`${sentence(rationale(c,'teaching'))} This teaching complements the immediate care plan.`,...reference(c,'teaching')},
   {text:`Reassess for this result: ${c.outcome}`,rationale:`The proposed reassessment checks the desired response to care. ${sentence(rationale(c,'outcome'))}`,...reference(c,'outcome')},
  ],
 };
}
function revisedEvaluation(c){
 const [peer]=distractors(c,'problem',c.problem,1);
 const cue=topicCue(c);
 return {
  prompt:`At the first reassessment after the planned care, the nurse records this result: ${sentence(c.outcome)} Which interpretation should guide follow-up?`,
  text:`Document progress toward the goal for ${cue} and reassess as planned`,
  why:`${sentence(c.outcome)} This is the desired finding for the priority in the case. It supports progress at this check. Continue the planned reassessment to see whether the response is sustained. ${sentence(c.reason)}`,
  alternatives:[
   {text:`Close the focused follow-up for ${cue} based on this result`,rationale:`This result matches the expected direction of change. A single reassessment does not establish sustained resolution of the problem or remove the need for the planned check.`,...reference(c,'outcome')},
   {text:`Document the care as completed and leave the response for ${cue} unevaluated`,rationale:`The finding is already an outcome measure for this plan. The nurse can record progress toward the goal even while continuing to verify it.`,...reference(c,'action')},
   {text:`Use this finding to shift the follow-up goal to ${lower(peer.p.problem)}`,rationale:`The reassessment was meant to track ${cue}. It does not supply the findings needed to make ${lower(peer.p.problem)} the focus. ${sentence(c.reason)}`,...reference(c,'problem')},
  ],
 };
}
function reviseLinked(q,c){
 const objective=role(q),field=kinds[objective]||'unsafe';
 assert.ok(objective,q.id);
 let spec;
 if(objective==='safety')spec=revisedSafety(c);
 else if(objective==='evaluation')spec=revisedEvaluation(c);
 else {
  const text=optionFor(c,field);
  const prompt=objective==='reasoning'
   ?`The nurse proposes this response: ${sentence(c.action)} Which explanation best connects the cues to that decision?`
   :c.isLegacy&&objective==='recognition'?'Which finding carries the most weight in deciding how to respond in this case?':prompts[objective];
  const why=objective==='reasoning'
   ?`${sentence(c.reason)} This explains why the proposed response addresses the main finding.`
   :`${sentence(rationale(c,field))} ${objective==='action'?'The response addresses the care need raised by the current cues.':objective==='teaching'?'The instruction gives the recipient a way to respond to the risk described.':objective==='planning'?'This outcome measures the response the plan is intended to achieve.':'The finding should guide the next assessment or care decision.'}`;
  spec={text,prompt,why,alternatives:distractors(c,field,text,3,q.options).map(({p,text})=>peerOption(c,p,text,field))};
 }
 const options=[...spec.alternatives];
 options.splice(q.correctIndex,0,{text:spec.text,rationale:spec.why,...reference(c,objective)});
 return {...q,stem:c.scenario+'\n\n'+spec.prompt,options,rationale:spec.why,source:c.source,
  keyPoint:`${sentence(c.reason)} Priority response: ${sentence(c.action)}`};
}

function splitStem(stem){
 if(stem.includes('\n\n'))return stem;
 const matches=[...stem.matchAll(/(?<=[.!?]["'”’]?)\s+(?=(?:Which|What|How|When|Why|Using|At what|Of the)[\s,])/gi)];
 const position=matches.at(-1)?.index;
 return position===undefined?stem:stem.slice(0,position)+'\n\n'+stem.slice(position).trimStart();
}
function reviseStandalone(q,edit){
 assert.ok(edit,`Missing editorial alternative for ${q.id}`);
 const {replace,text,why,stem,answer,rationale,source,otherOptions={}}=edit;
 assert.ok(Number.isInteger(replace)&&replace>=0&&replace<=3&&replace!==q.correctIndex,q.id);
 const options=q.options.map((option,index)=>{
  if(index===replace)return {text,rationale:why,source:source||q.source,referenceId:q.id+':reviewed-alternative'};
  if(index===q.correctIndex)return {...option,text:answer||option.text,rationale:rationale||option.rationale,source:source||option.source};
  if(otherOptions[index])return {...option,...otherOptions[index]};
  return option;
 });
 return {...q,stem:splitStem(stem||q.stem),options,rationale:options[q.correctIndex].rationale,source:source||q.source};
}

const allowDraft=process.argv.includes('--draft');
const revised=active.map(q=>{
 const c=byCase.get(questionFamily(q));
 if(c)return reviseLinked(q,c);
 if(allowDraft&&!standaloneEdits[q.id])return q;
 return reviseStandalone(q,standaloneEdits[q.id]);
});
assert.ok(Object.keys(caseEdits).every(id=>byCase.has(id)),'Unknown case edit');
assert.ok(Object.keys(standaloneEdits).every(id=>priorById.has(id)&&!byCase.has(questionFamily(priorById.get(id)))),'Unknown standalone edit');
validateQuestions(revised);
const output=allowDraft?'./outputs/judgment-review/draft.json':'./judgment-questions.json.gz';
const json=Buffer.from(JSON.stringify(revised));
await writeFile(new URL(output,import.meta.url),allowDraft?json:gzipSync(json,{level:9}));
console.log(JSON.stringify({revised:revised.filter((q,i)=>q!==active[i]).length,linkedCases:cases.length,standalone:Object.keys(standaloneEdits).length,bytes:json.length,output}));
