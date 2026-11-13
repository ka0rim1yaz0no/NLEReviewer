import type {Question, RationalePart} from './types.ts';

// These exact editorial phrases add no clinical fact. Keep every clinical
// condition, value, exception, and contrast in the explanation.
const genericOpening=/^(?:This choice fits a different clinical priority\.|That explanation addresses a different set of findings\.)\s+/;
const genericEnding=/\s+(?:The finding should guide the next assessment or care decision\.|The response addresses the care need raised by the current cues\.|The instruction gives the recipient a way to respond to the risk described\.|This outcome measures the response the plan is intended to achieve\.|This explains why the proposed response addresses the main finding\.)$/;
export function displayRationale(text:string){
 return text.replace(genericOpening,'').replace(genericEnding,'').trim()||text;
}
export function unsafeDecision(q:Question){
 if(typeof q.unsafeAnswer==='boolean')return q.unsafeAnswer;
 return (q.id.startsWith('SIT-')&&q.clinicalObjective==='safety')||/^(CROSS|NP[1-5])-\d{3}-5$/.test(q.id);
}
export function choiceExplanationLabel(q:Question,i:number){
 return i!==q.correctIndex?'Why this choice does not fit':unsafeDecision(q)?'Why this action is unsafe':'Why this is the best answer';
}
export const rationaleVerdictLabels:Record<RationalePart['verdict'],string>={
 supported:'Supported by the findings',
 incorrect:'Does not match the findings',
 'needs-correction':'Needs correction',
 appropriate:'Appropriate care',
};
export function answerStatus(q:Question,index:number){
 if(index===q.correctIndex)return unsafeDecision(q)&&!q.options[index].rationaleParts?'Correct answer · Action to correct':'Correct answer';
 if(q.options[index].rationaleParts)return 'Incorrect combination';
 return unsafeDecision(q)?'Appropriate care option':'Incorrect answer';
}
export function answerExplanation(q:Question,index:number){
 const option=q.options[index];
 if(!option.rationaleParts)return displayRationale(option.rationale);
 return choiceRationaleParts(q,index).map(part=>part.label+' · '+rationaleVerdictLabels[part.verdict]+'. '+part.explanation).join('\n');
}
export function choiceRationaleParts(q:Question,index:number){
 const option=q.options[index],reasons=option.rationale.split('\n\n');
 return (option.rationaleParts??[]).map((part,i)=>({...part,explanation:displayRationale(reasons[i]),source:part.source||option.source||q.source}));
}
export function distinctStudyNote(q:Question){
 const summary=displayRationale(q.keyPoint).trim(),reason=displayRationale(q.rationale).trim();
 return summary&&summary!==reason&&!reason.includes(summary)?summary:'';
}
