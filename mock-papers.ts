import {isSituational} from './collections.ts';
import {practicePool} from './question-selection.ts';
import type {QuestionHistory} from './question-selection.ts';
import type {Question,Subject} from './types.ts';

function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const emptyHistory:QuestionHistory={attempts:[],sessions:[],vault:[]};
const objectives=['recognition','action','teaching','safety','planning','evaluation','reasoning'];
const sectionSize=100;
// Keep the preferred form where possible. Replace used items with fresh ones,
// prioritizing full linked cases and reserving the other boards' preferred cases.
export function mockQuestionIds(bank:readonly Question[],subject:Subject,board:number,personalIds:readonly string[]=[],history:QuestionHistory=emptyHistory):string[]{
 if(subject==='CROSS'||!Number.isInteger(board)||board<1||board>5)return [];
 const personal=new Set(personalIds);
 const pool=bank.filter(q=>!personal.has(q.id)&&q.subject===subject&&isSituational(q)),groups=new Map<string,Question[]>();
 for(const q of pool)if(q.caseId)groups.set(q.caseId,[...(groups.get(q.caseId)||[]),q]);
 const order=(a:string,b:string)=>hash(subject+':'+a)-hash(subject+':'+b)||a.localeCompare(b);
 const cases=[...groups].filter(([,qs])=>qs.length===7).sort(([a],[b])=>order(a,b));
 const singles=pool.filter(q=>q.id.startsWith('EXP2-')).sort((a,b)=>order(a.id,b.id));
 const eligible=practicePool(pool,history,{allowRelated:true,bank});
 if(eligible.length<sectionSize)return [];
 const unused=new Set(eligible.map(q=>q.id)),selected:string[]=[];
 const preference=<T>(list:T[],perBoard:number)=>[
  ...list.slice((board-1)*perBoard,board*perBoard),
  ...list.slice(perBoard*5),
  ...list.slice(0,(board-1)*perBoard),
  ...list.slice(board*perBoard,perBoard*5),
 ];
 for(const [,qs] of preference(cases,14)){
  if(selected.length>=98)break;
  if(qs.some(q=>!unused.has(q.id)))continue;
  for(const q of [...qs].sort((a,b)=>objectives.indexOf(a.clinicalObjective||'')-objectives.indexOf(b.clinicalObjective||''))){
   unused.delete(q.id);selected.push(q.id);
  }
 }
 for(const q of [...preference(singles,2),...eligible.filter(q=>!q.caseId),...eligible]){
  if(selected.length===sectionSize)break;
  if(unused.delete(q.id))selected.push(q.id);
 }
 return selected;
}
