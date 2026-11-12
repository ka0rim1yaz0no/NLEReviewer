import type {Question} from './types.ts';

// These exact editorial phrases add no clinical fact. Keep every clinical
// condition, value, exception, and contrast in the explanation.
const genericOpening=/^(?:This choice fits a different clinical priority\.|That explanation addresses a different set of findings\.)\s+/;
const genericEnding=/\s+(?:The finding should guide the next assessment or care decision\.|The response addresses the care need raised by the current cues\.|The instruction gives the recipient a way to respond to the risk described\.|This outcome measures the response the plan is intended to achieve\.|This explains why the proposed response addresses the main finding\.)$/;
export function displayRationale(text:string){
 return text.replace(genericOpening,'').replace(genericEnding,'').trim()||text;
}
export function unsafeDecision(q:Question){
 return q.unsafeAnswer===true||(q.id.startsWith('SIT-')&&q.clinicalObjective==='safety')||/^(CROSS|NP[1-5])-\d{3}-5$/.test(q.id);
}
export function choiceExplanationLabel(q:Question,i:number){
 return i!==q.correctIndex?'Why this choice does not fit':unsafeDecision(q)?'Why this action is unsafe':'Why this is the best answer';
}
export function distinctStudyNote(q:Question){
 const summary=displayRationale(q.keyPoint).trim(),reason=displayRationale(q.rationale).trim();
 return summary&&summary!==reason&&!reason.includes(summary)?summary:'';
}
