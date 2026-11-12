import redirects from './question-redirects.json' with {type:'json'};
import {normalizeChoice,normalizeQuestionStem,shuffled} from './bank.ts';
import {isSituational} from './collections.ts';
import {vaultIsDue} from './vault-schedule.ts';
import type {Question,Subject} from './types.ts';
import type {State,CustomCard} from './engine.ts';
const aliases:Record<string,string>=redirects;
export function canonicalQuestionId(id:string):string{
 const visited=new Set<string>();while(aliases[id]&&!visited.has(id)){visited.add(id);id=aliases[id];}return id;
}
function familyFromId(id:string){return id.replace(/^(CROSS|NP[1-5])-([0-9]{3})-[1-5]$/,'$1-$2').replace(/-(recognition|action|teaching|safety|planning|evaluation|reasoning)$/,'');}
export function questionFamily(q:Question|string):string{
 if(typeof q==='string')return familyFromId(canonicalQuestionId(q));
 const canonical=canonicalQuestionId(q.id);return canonical!==q.id?familyFromId(canonical):q.caseId||familyFromId(q.id);
}
export type QuestionHistory=Pick<State,'attempts'|'sessions'|'vault'>&Partial<Pick<State,'importedQuestions'|'preferences'|'vaultReviews'>>;
export type PracticeDifficulty='challenge'|'mixed';
export type SelectionOptions={filter?:string;allowRelated?:boolean;review?:boolean;difficulty?:PracticeDifficulty;bank?:readonly Question[]};
export const minimumStudyQuestions=80;
export const diagnosticSubjects=['NP1','NP2','NP3','NP4','NP5'] as const satisfies readonly Subject[];
export const diagnosticPerSubject=minimumStudyQuestions/diagnosticSubjects.length;
export const diagnosticMinutes=67;
const decisionObjectives=new Set(['action','planning','evaluation','reasoning','safety','decision']);
export function isDecisionQuestion(q:Question){
 return isSituational(q)&&(q.difficulty==='challenge'||decisionObjectives.has(q.clinicalObjective||'')||q.id.startsWith('EXP2-')||/^(CROSS|NP[1-5])-\d{3}-[24]$/.test(q.id));
}
export function practicePool(pool:readonly Question[],state:QuestionHistory,options:SelectionOptions={}):Question[]{
 const review=options.review||options.filter==='missed'||options.filter==='vault',filter=review?'all':options.filter||'unanswered';
 const now=Date.now();
 const due=options.filter==='vault'?new Set(state.vault.filter(id=>!state.preferences||vaultIsDue({preferences:state.preferences,vaultReviews:state.vaultReviews},id,now)).map(canonicalQuestionId)):undefined;
 const assigned=new Set<string>(),assignedStems=new Set<string>(),seenFamilies=new Set<string>();
 if(filter==='unanswered'){
  const known=new Map([...(options.bank||[]),...(state.importedQuestions||[]),...pool].map(q=>[q.id,q]));
  for(const prior of [...state.attempts.map(a=>a.questionId),...state.sessions.flatMap(s=>s.questionIds)]){
   const id=canonicalQuestionId(prior),q=known.get(id);
   assigned.add(id);
   seenFamilies.add(questionFamily(q||id));
   for(const version of new Set([q,known.get(prior)]))if(version)assignedStems.add(normalizeQuestionStem(version.stem));
  }
 }
 const latest=new Map<string,State['attempts'][number]>();
 if(options.filter==='missed')for(const attempt of state.attempts){
  const id=canonicalQuestionId(attempt.questionId);
  if((latest.get(id)?.at??-Infinity)<=attempt.at)latest.set(id,attempt);
 }
 const ids=new Set<string>(),stems=new Set<string>();
 return pool.filter(q=>{
  if(q.retired||!review&&options.difficulty==='challenge'&&!isDecisionQuestion(q))return false;
  if(options.filter==='missed'&&latest.get(canonicalQuestionId(q.id))?.correct!==false)return false;
  const id=canonicalQuestionId(q.id),stem=normalizeQuestionStem(q.stem);
  if(due&&!due.has(id))return false;
  if(filter==='unanswered'&&(assigned.has(id)||assignedStems.has(stem)||!options.allowRelated&&seenFamilies.has(questionFamily(q))))return false;
  if(ids.has(id)||stems.has(stem))return false;
  ids.add(id);stems.add(stem);
  return true;
 });
}
export function distinctSituations(pool:Question[]):Question[]{const families=new Set<string>();return pool.filter(q=>{const family=questionFamily(q);if(families.has(family))return false;families.add(family);return true;});}
const choiceKeys=new WeakMap<Question,string>();
export function questionChoiceKey(question:Question):string{
 const cached=choiceKeys.get(question);
 if(cached!==undefined)return cached;
 const choices=question.options.map(option=>normalizeChoice(option.text));
 const key=choices.length===4&&choices.every(Boolean)&&new Set(choices).size===4?choices.sort().join('\n'):'';
 choiceKeys.set(question,key);
 return key;
}
export function distinctQuestionSet(pool:readonly Question[],onePerCase=false,prior:readonly Question[]=[]):Question[]{
 const ids=new Set(prior.map(q=>canonicalQuestionId(q.id)));
 const stems=new Set(prior.map(q=>normalizeQuestionStem(q.stem)));
 const choices=new Set(prior.map(questionChoiceKey));
 const families=new Set(onePerCase?prior.map(questionFamily):[]);
 return pool.filter(q=>{
  const id=canonicalQuestionId(q.id),stem=normalizeQuestionStem(q.stem),choice=questionChoiceKey(q);
  const family=onePerCase?questionFamily(q):'';
  if(!choice||ids.has(id)||stems.has(stem)||choices.has(choice)||families.has(family))return false;
  ids.add(id);stems.add(stem);choices.add(choice);
  if(onePerCase)families.add(family);
  return true;
 });
}
export function availablePractice(pool:Question[],state:QuestionHistory,options:SelectionOptions={}):number{
 return distinctQuestionSet(practicePool(pool,state,options),!(options.allowRelated||options.review||options.filter==='missed'||options.filter==='vault')).length;
}
export function selectPractice(pool:Question[],state:QuestionHistory,count:number,seed:number,options:SelectionOptions={}):string[]{
 const eligible=shuffled(practicePool(pool,state,options),seed);
 const selected=distinctQuestionSet(eligible,!(options.allowRelated||options.review||options.filter==='missed'||options.filter==='vault'));
 return selected.slice(0,Math.max(0,Math.floor(count))).map(q=>q.id);
}
export function selectQuickPractice(pool:Question[],state:QuestionHistory,count:number,seed:number,options:Pick<SelectionOptions,'difficulty'|'bank'>={}){
 const fresh=selectPractice(pool,state,count,seed,options);
 if(fresh.length)return {ids:fresh,followUp:false};
 // A new decision can share a case, but never reuse an assigned question or stem.
 const unused=shuffled(practicePool(pool,state,{...options,allowRelated:true}),seed);
 const ids=distinctQuestionSet(unused,true).slice(0,Math.max(0,Math.floor(count))).map(q=>q.id);
 return {ids,followUp:ids.length>0};
}
export function diagnosticQuestionIds(bank:Question[],state:QuestionHistory,seed:number):string[]{
 const eligible=practicePool(bank.filter(isSituational),state,{bank});
 const selected:Question[]=[];
 for(const [i,subject] of diagnosticSubjects.entries()){
  const part=distinctQuestionSet(shuffled(eligible.filter(q=>q.subject===subject),seed+i),true,selected).slice(0,diagnosticPerSubject);
  if(part.length!==diagnosticPerSubject)return [];
  selected.push(...part);
 }
 return selected.map(q=>q.id);
}
export function flashcardQueue(pool:CustomCard[],state:Pick<State,'cards'>,bank:Question[],misses:Set<string>,count:number,now=Date.now()):CustomCard[]{
 const map=new Map(bank.map(q=>[q.id,q])),seenFamilies=new Set(Object.keys(state.cards).map(id=>questionFamily(map.get(id)||id)));
 const family=(c:CustomCard)=>questionFamily(map.get(c.id)||c.id);
 const seen=new Set<string>(),content=new Set<string>();
 return pool.filter(c=>!map.get(c.id)?.retired&&(!state.cards[c.id]||state.cards[c.id].due<=now)).sort((a,b)=>{
  const pa=state.cards[a.id],pb=state.cards[b.id];
  if(pa||pb){if(!pa)return 1;if(!pb)return -1;return pa.due-pb.due||Number(misses.has(b.id))-Number(misses.has(a.id));}
  return Number(seenFamilies.has(family(a)))-Number(seenFamilies.has(family(b)))||Number(misses.has(b.id))-Number(misses.has(a.id));
 }).filter(c=>{
  const key=family(c),body=normalizeQuestionStem(c.front)+'\n'+normalizeQuestionStem(c.back);
  if(seen.has(key)||content.has(body))return false;seen.add(key);content.add(body);return true;
 }).slice(0,count);
}
