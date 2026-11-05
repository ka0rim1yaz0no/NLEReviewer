import {isSituational} from './collections.ts';
import type {Question,Subject} from './types.ts';

function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
// Fixed selections for a content release: keep seven-part situations together
// and never reuse an item in another new mock board for the same subject.
export function mockQuestionIds(bank:readonly Question[],subject:Subject,board:number,personalIds:readonly string[]=[]):string[]{
 if(subject==='CROSS'||!Number.isInteger(board)||board<1||board>5)return [];
 const personal=new Set(personalIds);
 const pool=bank.filter(q=>!personal.has(q.id)&&q.subject===subject&&isSituational(q)),groups=new Map<string,Question[]>();
 for(const q of pool)if(q.caseId)groups.set(q.caseId,[...(groups.get(q.caseId)||[]),q]);
 const order=(a:string,b:string)=>hash(subject+':'+a)-hash(subject+':'+b)||a.localeCompare(b);
 const cases=[...groups].filter(([,qs])=>qs.length===7).sort(([a],[b])=>order(a,b));
 const singles=pool.filter(q=>q.id.startsWith('EXP2-')).sort((a,b)=>order(a.id,b.id));
 if(cases.length<70||singles.length<10)return [];
 const objectives=['recognition','action','teaching','safety','planning','evaluation','reasoning'];
 const selected=cases.slice((board-1)*14,board*14).flatMap(([,qs])=>[...qs].sort((a,b)=>objectives.indexOf(a.clinicalObjective||'')-objectives.indexOf(b.clinicalObjective||'')).map(q=>q.id));
 return [...selected,...singles.slice((board-1)*2,board*2).map(q=>q.id)];
}
