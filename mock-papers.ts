import {isSituational} from './collections.ts';
import {distinctQuestionSet,practicePool,questionFamily} from './question-selection.ts';
import type {QuestionHistory} from './question-selection.ts';
import type {Question,Subject} from './types.ts';

function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const emptyHistory:QuestionHistory={attempts:[],sessions:[],vault:[]};
const sectionSize=100;
function buildSection(eligible:Question[],subject:Subject,board:number):Question[]{
 const families=new Map(eligible.map(q=>[q.id,questionFamily(q)]));
 const familyDepth=new Map<string,number>();
 for(const family of families.values())familyDepth.set(family,(familyDepth.get(family)??0)+1);
 const rank=(q:Question)=>familyDepth.get(families.get(q.id)!)!;
 const order=new Map(eligible.map(q=>[q.id,hash(`${subject}:${board}:${q.id}`)]));
 // Consume deeper families first to retain enough distinct cases for later forms.
 const byFormOrder=(a:Question,b:Question)=>order.get(a.id)!-order.get(b.id)!||a.id.localeCompare(b.id);
 const ordered=[...eligible].sort((a,b)=>rank(b)-rank(a)||byFormOrder(a,b));
 const standalone=distinctQuestionSet(ordered.filter(q=>q.difficulty==='challenge'&&families.get(q.id)===q.id).sort(byFormOrder),true).slice(0,10);
 const section=[...standalone,...distinctQuestionSet(ordered,true,standalone)].slice(0,sectionSize).sort(byFormOrder);
 return section.length===sectionSize?section:[];
}

// Allocate the preferred forms without sharing questions across boards.
export function mockQuestionIds(bank:readonly Question[],subject:Subject,board:number,personalIds:readonly string[]=[],history:QuestionHistory=emptyHistory):string[]{
 if(subject==='CROSS'||!Number.isInteger(board)||board<1||board>5)return [];
 const personal=new Set(personalIds);
 const pool=bank.filter(q=>!personal.has(q.id)&&q.subject===subject&&isSituational(q));
 const eligible=practicePool(pool,history,{allowRelated:true,bank});
 if(eligible.length<sectionSize)return [];
 const available=new Set(eligible.map(q=>q.id));
 let unallocated=history===emptyHistory?eligible:practicePool(pool,emptyHistory,{allowRelated:true,bank});
 for(let number=1;number<=board;number++){
  const form=buildSection(unallocated,subject,number);
  if(number===board&&form.length===sectionSize&&form.every(q=>available.has(q.id)))return form.map(q=>q.id);
  const assigned=new Set(form.map(q=>q.id));
  unallocated=unallocated.filter(q=>!assigned.has(q.id));
 }
 return buildSection(eligible,subject,board).map(q=>q.id);
}
