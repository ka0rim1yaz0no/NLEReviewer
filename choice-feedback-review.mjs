import {normalizeQuestionStem,validateQuestions} from './bank.ts';
import {displayRationale,unsafeDecision} from './rationale-display.ts';
import {questionChoiceKey} from './question-selection.ts';

const injectionId='EXP2-NP1-communicable-diseases-basic-concepts';
const woundId='SIT-NP1-family-nursing-process-03-safety';
const injectionSource='https://www.cdc.gov/injection-safety/hcp/clinical-safety/';
const planningSource='https://www.ncbi.nlm.nih.gov/sites/books/NBK591807/#ch4.sec6';
const sentence=text=>/[.!?]$/.test(text)?text:text+'.';

function updateOptions(question,options){
 return {...question,options,rationale:options[question.correctIndex].rationale,questionRevision:7};
}

function injection(question){
 const choices=[
  ['Reuse the syringe if there is no visible blood in the barrel.',
   'Visual inspection cannot establish sterility. A syringe used on one client can be contaminated even when the barrel looks clean.'],
  ['Stop the injection and prepare it using a new sterile needle and syringe.',
   'A new sterile needle and syringe are needed for each client. Changing only the needle leaves the used syringe contaminated and can spread infection.'],
  ['Use the old syringe with a new needle to draw medication from the vial for the next client.',
   'Entering a vial with a syringe already used on a client can contaminate the medication and expose anyone who receives a dose from that vial.'],
  ['Limit use of the shared syringe to clients with the same diagnosis.',
   'Having the same diagnosis does not make injection equipment safe to share. A client can carry an unrecognized bloodborne infection.'],
 ];
 if(question.correctIndex!==1)throw Error('The injection correction must preserve the saved key position.');
 return {...updateOptions(question,choices.map(([text,rationale])=>({text,rationale,source:injectionSource}))),
  stem:'At an outreach clinic, a worker has injected one client. The worker changes the needle on the used syringe and is about to inject a second client. There is no visible blood in the syringe.\n\nWhat should the supervising nurse do now?',
  source:injectionSource,
  keyPoint:'Use a new sterile needle and syringe for every client. Keep used equipment away from medication containers.',
  decisionSummary:choices[1][0],unsafeAnswer:false,
 };
}

function carePlan(question){
 const explanations={
  action:'Arranging wound care the client can reach addresses both the transport and mobility barriers. Assess what help the client and family can realistically use.',
  teaching:'Discussing transport and caregiving needs before agreeing on a schedule helps the family and nurse choose a plan the client can follow.',
  outcome:'Checking whether the client actually receives the wound care tests whether the revised arrangement is working.',
  safety:'Lack of transport and limited mobility prevent the client from attending. Document those barriers and the client’s stated preferences, then work with the client and family to arrange accessible wound care.',
 };
 const options=question.options.map(option=>{
  const role=option.referenceId.split(':').at(-1);
  if(!explanations[role])throw Error('Unexpected wound-care option '+option.referenceId);
  return {...option,rationale:explanations[role],source:planningSource};
 });
 return {...updateOptions(question,options),source:planningSource,
  keyPoint:'Document access barriers and work with the client and family to arrange wound care the client can receive.'};
}

function directReason(option){
 const text=displayRationale(option.rationale)
  .replace(/\s+The cue to act on here is [^.!?]+[.!?]$/,'')
  .replace(/\s+This (?:action addresses the priority indicated by the case|teaching complements the immediate care plan)\.$/,'')
  .replace(/^The proposed reassessment checks the desired response to care\.\s+/,'');
 return text.trim();
}

function clinicalPart(question,index,label){
 const option=question.options[index],key=index===question.correctIndex;
 const unsafe=unsafeDecision(question);
 const verdict=unsafe?(key?'needs-correction':'appropriate'):(key?'supported':'incorrect');
 const rationale=directReason(option);
 const role=option.referenceId?.split(':').at(-1);
 let explanation=rationale;
 if(unsafe&&!key){
  const care={
   action:'This is an appropriate nursing response to the immediate problem.',
   teaching:'This instruction supports safer care once the immediate concern is addressed.',
   outcome:'This reassessment checks whether the plan is working.',
  }[role];
  if(care)explanation=rationale+' '+care;
 }
 return {label,verdict,explanation,source:option.source||question.source};
}

function withParts(option,parts){
 return {...option,rationale:parts.map(part=>part.explanation.replace(/\n\s*\n/g,'\n')).join('\n\n'),
  rationaleParts:parts.map(({label,verdict,source})=>({label,verdict,...(source!==option.source?{source}:{})}))};
}

function pairOption(question,other,option){
 const [id,kind,first,secondId,second]=option.referenceId.split(':');
 if(id!==question.id||kind!=='paired'||secondId!==other.id)throw Error('Paired reference mismatch in '+question.id);
 const a=question.options[Number(first)],b=other.options[Number(second)];
 const lines=option.text.split('\n');
 const labels=lines.map(line=>line.split(' — ')[0]);
 if(lines.length!==2||!a||!b||lines[0]!==labels[0]+' — '+a.text||lines[1]!==labels[1]+' — '+b.text){
  throw Error('Paired choice text differs from its source in '+question.id);
 }
 const rationaleParts=[clinicalPart(question,Number(first),labels[0]),clinicalPart(other,Number(second),labels[1])];
 return withParts(option,rationaleParts);
}

function factDefinition(option){
 const explanation=option.rationale.split(' The description in the question instead matches ')[0];
 const prefix=option.text+': ';
 if(!explanation.startsWith(prefix))throw Error('Cannot separate the source fact for '+option.referenceId);
 return explanation.slice(prefix.length);
}

function comparisonOptions(question,base){
 const keyed=question.options[question.correctIndex];
 const secondId=keyed.referenceId.split(':')[2];
 const first=base.options[base.correctIndex],second=base.options.find(o=>o.referenceId===secondId);
 if(!second||first===second)throw Error('Cannot recover both reference findings for '+question.id);
 return question.options.map(option=>{
  const lines=option.text.split('\n');
  const parts=lines.map((line,index)=>{
   const label=index===0?'First finding':'Second finding',target=index===0?first:second;
   const text=line.slice(line.indexOf(' — ')+3);
   const selected=base.options.find(o=>o.text===text);
   if(!selected)throw Error('Comparison option differs from its reference in '+question.id);
   const matched=selected===target;
   const own=selected===first
    ?selected.rationale.replace(/^(?:The matching entry is .*?\. |.*? is the matching concept\. In this reference context: )/,'')
    :factDefinition(selected);
   const explanation=sentence(selected.text+' — '+own)+(matched?'':' This finding points to '+target.text+'.');
   return {label,verdict:matched?'supported':'incorrect',explanation,source:selected.source||question.source};
  });
  return withParts(option,parts);
 });
}

function restoreSingle(question){
 const options=question.options.map(option=>({...option,rationale:directReason(option)}));
 return {...updateOptions(question,options),unsafeAnswer:unsafeDecision(question)};
}

function cleanDirect(question){
 const unsafe=unsafeDecision(question);
 const options=question.options.map((option,index)=>{
  const role=option.referenceId?.split(':').at(-1);
  let rationale=directReason(option),text=option.text;
  if(unsafe&&index!==question.correctIndex){
   if(role==='teaching')text=text.replace(/^Provide this instruction\. /,'Teach the client to ').replace(/^(Teach the client to )([A-Z])/,(_,lead,letter)=>lead+letter.toLowerCase());
   const part=clinicalPart(question,index,'');
   rationale=part.explanation;
  }
  return rationale===option.rationale&&text===option.text?option:{...option,text,rationale};
 });
 return options.every((option,index)=>option===question.options[index])?question:updateOptions(question,options);
}

export function correctQuestionFeedback(published,sourceQuestions){
 const originals=new Map(sourceQuestions.map(q=>[q.id,q]));
 const counts={focused:0,linked:0,comparison:0,outcome:0,direct:0,individual:0,preserved:0};
 const questions=published.map(question=>{
  if(question.retired)return question;
  if(question.id===injectionId){counts.individual++;return injection(question);}
  if(question.id===woundId){counts.individual++;return carePlan(question);}
  const kind=question.options[question.correctIndex].referenceId?.split(':')[1];
  const base=originals.get(question.id);
  if(!base||base.correctIndex!==question.correctIndex)throw Error('A source key differs for '+question.id);
  if(kind==='paired'){
   if(question.stem.startsWith('First situation\n')){counts.focused++;return restoreSingle(base);}
   const other=originals.get(question.options[question.correctIndex].referenceId.split(':')[3]);
   if(!other||normalizeQuestionStem(base.stem.split('\n\n')[0])!==normalizeQuestionStem(other.stem.split('\n\n')[0])){
    throw Error('Linked decisions do not share the same scenario in '+question.id);
   }
   counts.linked++;
   return updateOptions(question,question.options.map(option=>pairOption(base,other,option)));
  }
  if(kind==='contrast'){
   counts.comparison++;
   return updateOptions(question,comparisonOptions(question,base));
  }
  const revised=cleanDirect(question);
  if(revised===question)counts.preserved++;
  else if(kind==='outcome')counts.outcome++;
  else counts.direct++;
  return revised;
 });
 const active=questions.filter(q=>!q.retired);
 if(active.some(q=>!questionChoiceKey(q)))throw Error('A revised question has repeated or missing choices.');
 return {questions:questions.length?validateQuestions(questions):[],counts};
}
