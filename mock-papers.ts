import {isSituational} from './collections.ts';
import {distinctQuestionSet,practicePool} from './question-selection.ts';
import type {QuestionHistory} from './question-selection.ts';
import type {Question,Subject} from './types.ts';

function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const emptyHistory:QuestionHistory={attempts:[],sessions:[],vault:[]};
const objectives=['recognition','action','teaching','safety','planning','evaluation','reasoning'];
const sectionSize=100;
function buildSection(eligible:Question[],cases:Question[][],singles:Question[],board:number):Question[]{
 if(eligible.length<sectionSize)return [];
 const unused=new Set(eligible.map(q=>q.id)),selected:Question[]=[];
 const preference=<T>(list:T[],perBoard:number)=>[
  ...list.slice((board-1)*perBoard,board*perBoard),
  ...list.slice(perBoard*5),
  ...list.slice(0,(board-1)*perBoard),
  ...list.slice(board*perBoard,perBoard*5),
 ];
 for(const qs of preference(cases,14)){
  if(selected.length>=sectionSize-2)break;
  if(qs.some(q=>!unused.has(q.id)))continue;
  const ordered=[...qs].sort((a,b)=>objectives.indexOf(a.clinicalObjective||'')-objectives.indexOf(b.clinicalObjective||''));
  if(distinctQuestionSet(ordered,false,selected).length===ordered.length)selected.push(...ordered);
 }
 const fillers=[...preference(singles,2).filter(q=>unused.has(q.id)),...eligible.filter(q=>!q.caseId),...eligible];
 const section=[...selected,...distinctQuestionSet(fillers,false,selected)].slice(0,sectionSize);
 return section.length===sectionSize?section:[];
}

// Allocate the preferred forms without sharing questions across boards.
export function mockQuestionIds(bank:readonly Question[],subject:Subject,board:number,personalIds:readonly string[]=[],history:QuestionHistory=emptyHistory):string[]{
 if(subject==='CROSS'||!Number.isInteger(board)||board<1||board>5)return [];
 const personal=new Set(personalIds);
 const pool=bank.filter(q=>!personal.has(q.id)&&q.subject===subject&&isSituational(q)),groups=new Map<string,Question[]>();
 for(const q of pool)if(q.caseId)groups.set(q.caseId,[...(groups.get(q.caseId)||[]),q]);
 const order=(a:string,b:string)=>hash(subject+':'+a)-hash(subject+':'+b)||a.localeCompare(b);
 const cases=[...groups].filter(([,qs])=>qs.length===7).sort(([a],[b])=>order(a,b)).map(([,qs])=>qs);
 const singles=pool.filter(q=>q.id.startsWith('EXP2-')).sort((a,b)=>order(a.id,b.id));
 const eligible=practicePool(pool,history,{allowRelated:true,bank});
 if(eligible.length<sectionSize)return [];
 const available=new Set(eligible.map(q=>q.id));
 let unallocated=history===emptyHistory?eligible:practicePool(pool,emptyHistory,{allowRelated:true,bank});
 for(let number=1;number<=board;number++){
  const form=buildSection(unallocated,cases,singles,number);
  if(number===board&&form.length===sectionSize&&form.every(q=>available.has(q.id)))return form.map(q=>q.id);
  const assigned=new Set(form.map(q=>q.id));
  unallocated=unallocated.filter(q=>!assigned.has(q.id));
 }
 return buildSection(eligible,cases,singles,board).map(q=>q.id);
}
