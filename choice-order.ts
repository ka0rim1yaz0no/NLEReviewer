import type {Session} from './engine.ts';

export const letters = ["A", "B", "C", "D"] as const;
const originalOrder=[0,1,2,3] as const;

// Persisted selections and keys use the source index. Only display order changes.
export function sessionChoiceOrder(session:Pick<Session,'id'|'questionRevision'>,questionId:string):readonly number[]{
 if((session.questionRevision??0)<5)return originalOrder;
 let seed=2166136261;
 for(const character of `${session.id}:${questionId}`)seed=Math.imul(seed^character.charCodeAt(0),16777619);
 const order:number[]=[...originalOrder];
 for(let index=order.length-1;index>0;index--){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  const other=(seed>>>0)%(index+1);
  [order[index],order[other]]=[order[other],order[index]];
 }
 return order;
}
