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

function decisionVerdict(matches:boolean,asksForCorrection:boolean):RationalePart['verdict']{
 return asksForCorrection?(matches?'needs-correction':'appropriate'):(matches?'supported':'incorrect');
}

// Revision 6 embedded these original prompts in separate archived cases.
const archivedCorrectionPrompt=/\b(?:Which proposed plan entry should the nurse revise before putting the plan into effect|Which proposed identity check should be rejected|Which care plan should the nurse question)\?/i;
const legacyDecisionReason=/^First (fits|does not fit)\. ([\s\S]+?) Second (fits|does not fit)\. ([\s\S]+)$/;

export function clarifyArchivedDecisions(question:Question,currentBank:ReadonlyMap<string,Question>):Question{
 if(question.questionRevision!==6)return question;
 const reference=question.options[question.correctIndex].referenceId?.split(':');
 if(reference?.[1]!=='paired')return question;
 const latest=currentBank.get(question.id);
 const companion=currentBank.get(reference[3]);
 const separateCases=question.stem.startsWith('First situation\n');
 const [firstCase,secondCase]=question.stem.split('\n\n');
 const correctFirst=archivedCorrectionPrompt.test(firstCase),correctSecond=archivedCorrectionPrompt.test(secondCase);
 const options=question.options.map(option=>{
  const corrected=latest?.options.find(candidate=>candidate.referenceId===option.referenceId&&candidate.text===option.text);
  if(corrected?.rationaleParts)return {...option,rationale:corrected.rationale,rationaleParts:corrected.rationaleParts};
  if(!separateCases)return option;
  const reason=option.rationale.match(legacyDecisionReason);
  if(!reason)return option;
  const firstSource=option.source||question.source;
  const firstVerdict=decisionVerdict(reason[1]==='fits',correctFirst);
  const secondVerdict=decisionVerdict(reason[3]==='fits',correctSecond);
  const companionOption=companion?.questionRevision===7?companion.options[Number(option.referenceId?.split(':')[4])]:undefined;
  const revisedCompanion=companionOption?.text===option.text.split('\n')[1]?.replace(/^Second — /,'')?companionOption:undefined;
  const secondSource=revisedCompanion?.source||option.contextSource||firstSource;
  return {...option,rationale:`${reason[2]}\n\n${revisedCompanion?.rationale||reason[4]}`,
   rationaleParts:[{label:'First',verdict:firstVerdict,source:firstSource},{label:'Second',verdict:secondVerdict,source:secondSource}]};
 });
 return options.every((option,index)=>option===question.options[index])?question:{...question,options,rationale:options[question.correctIndex].rationale};
}

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
