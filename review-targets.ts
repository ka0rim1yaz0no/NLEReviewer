import {firstAttempts,rating} from './engine.ts';
import type {State} from './engine.ts';
import type {Question,Subject} from './types.ts';

const npIds:Subject[]=['NP1','NP2','NP3','NP4','NP5'];
export function studyTargets(state:State,bank:Map<string,Question>){
 const first=firstAttempts(state.attempts);
 const projected=rating(first,40);
 const sections=npIds.map(subject=>{const attempts=first.filter(a=>bank.get(a.questionId)?.subject===subject);return {subject,tried:attempts.length,score:rating(attempts,10)};});
 const boards=[1,2,3,4,5].map(board=>({board,finished:npIds.filter(subject=>state.sessions.some(s=>s.mockBoard===board&&s.subject===subject&&s.finishedAt)),active:state.sessions.find(s=>s.mockBoard===board&&!s.finishedAt)}));
 const completeBoards=boards.filter(b=>b.finished.length===5).length;
 const nextBoard=boards.find(b=>b.finished.length<5);
 const nextSubject=[...sections].filter(s=>s.score!==null&&s.score<60).sort((a,b)=>a.score!-b.score!)[0]||[...sections].filter(s=>s.score===null).sort((a,b)=>a.tried-b.tried)[0];
 const met={subjects:sections.every(s=>s.score!==null&&s.score>=60),mocks:completeBoards===5,rating:projected!==null&&projected>=75};
 return {projected,sections,boards,completeBoards,nextBoard,nextSubject,met,metCount:Object.values(met).filter(Boolean).length};
}
