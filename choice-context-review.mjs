import {unsafeDecision} from './rationale-display.ts';
import {questionFamily} from './question-selection.ts';

const sentence=text=>/[.!?]$/.test(text)?text:text+'.';
const beforeContext=text=>text.split(' The cue to act on here is ')[0];
const cleanLead=text=>text.replace(/^Provide this instruction\. /,'').replace(/^Reassess for this result:\s*/,'');
const pairedIds=option=>option.referenceId?.split(':')??[];

function peerContext(question,option){
 const reference=pairedIds(option);
 if(reference.length!==2||reference[0]===questionFamily(question)||reference[0]===question.id||!option.contextSource)return '';
 if(!['problem','action','teaching','outcome','reason'].includes(reference[1]))return '';
 return option.contextSource;
}

function caseReason(question){
 const answer=question.options[question.correctIndex];
 const reason=beforeContext(answer.rationale)
  .replace(/\s+(?:The finding should guide the next assessment or care decision|The response addresses the care need raised by the current cues|The instruction gives the recipient a way to respond to the risk described|This outcome measures the response the plan is intended to achieve|This explains why the proposed response addresses the main finding)\.$/,'');
 return sentence(reason);
}

function separateContext(reason,question){
 return sentence(reason)+'\nCase reasoning: '+caseReason(question);
}

const kidneyGuideline='https://guidelines.ukkidney.org/hyperkalaemia/';
const labCase='SIT-CROSS-laboratory-values-01';
const electrolyteContext=[
 [/^Possible spurious hyperkalemia that still requires urgent verification$/, 'A suspected collection artifact, such as a visibly hemolyzed sample, calls for a carefully collected repeat sample alongside urgent assessment when potassium is critically high. This case gives no indication of hemolysis. Kidney failure, weakness, and new peaked T waves support treating severe hyperkalemia now.',kidneyGuideline],
 [/^Hemolysis can falsely elevate potassium/, 'Hemolysis can make the potassium result falsely high. Repeat sampling helps when specimen quality is in doubt. The new peaked T waves and weakness in this client with kidney failure support urgent treatment while the team assesses the result.',kidneyGuideline],
 [/^Assess the rhythm and report the change promptly$/, 'Rhythm assessment and rapid reporting are appropriate when symptoms first raise concern for a potassium disturbance. This client already has a severe potassium result and ECG changes. Activate the urgent treatment protocol while monitoring the rhythm.',kidneyGuideline],
 [/^Start urgent cardiac monitoring and activate the prescribed hyperkalemia response$/, 'Severe hyperkalemia with new peaked T waves can progress to a life-threatening dysrhythmia. Begin continuous monitoring and activate the emergency protocol so the team can protect the myocardium and treat the potassium elevation.',kidneyGuideline],
 [/^Hyperkalemia with risk of a lethal dysrhythmia$/, 'Kidney failure reduces potassium excretion. Weakness, potassium of 6.7 mmol/L, and new peaked T waves together support severe hyperkalemia with an immediate dysrhythmia risk.',kidneyGuideline],
 [/^Avoid potassium-containing salt substitutes/, 'This teaching is appropriate for ongoing risk reduction once the client is stable. Salt substitutes can add a substantial potassium load. The acute ECG changes still require immediate treatment.',kidneyGuideline],
 [/^Cardiac rhythm stabilizes as potassium returns/, 'Track the ECG and serial potassium after treatment. A steadier rhythm and a falling potassium show a response. Repeat checks are needed because potassium can rise again after temporary shifting measures.',kidneyGuideline],
 [/^Continue the scheduled potassium supplement/, 'Potassium replacement is used for documented hypokalemia when prescribed. With a high potassium result and new peaked T waves, another dose could worsen a dangerous dysrhythmia. Hold the supplement and activate the urgent hyperkalemia response.',kidneyGuideline],
];

function contextualReason(question,option){
 if(questionFamily(question)===labCase){
  const found=electrolyteContext.find(([pattern])=>pattern.test(cleanLead(option.text)));
  if(found)return {reason:found[1],source:found[2],caseSource:kidneyGuideline};
 }
}

const caseCorrections=new Map([
 ['EXP2-NP1-communicable-diseases-basic-concepts',{
  source:'https://www.cdc.gov/injection-safety/hcp/clinical-safety/',
  rationale:[
   'A clean-looking syringe can still contain blood or microorganisms. A syringe used on a client belongs in the sharps container. Prepare the next injection with fresh sterile equipment.',
   'Stop before the second client is exposed. Use a new sterile needle and syringe and medication from a container that has been accessed aseptically. Replacing the needle leaves the previously used syringe contaminated.',
   'Withdraw medication with a new sterile needle and syringe. Entering a vial with a syringe already used on a client can contaminate the medication and expose anyone who later receives a dose from it.',
   'Assign sterile equipment to each injection, regardless of diagnosis. Clients with the same condition can carry different or unrecognized bloodborne infections.',
  ],
 }],
 ['EXP2-NP4-endocrine-emergencies-summary',{
  source:'https://link.springer.com/article/10.1007/s00125-024-06183-8',
  rationale:[
   'Stop IV insulin only when ketoacidosis has resolved and the team has arranged a safe transition, including overlap with subcutaneous insulin when indicated. At 220 mg/dL, this client still has ketonemia and acidosis, so glucose improvement alone cannot guide that decision.',
   'Reduce the frequency of checks only when the protocol and the client’s condition allow. Active DKA treatment still changes glucose and potassium. Continue the ordered glucose, electrolyte and acid–base monitoring.',
   'Continue insulin to suppress ketone production. Add dextrose and adjust the insulin infusion per the prescribed protocol to prevent hypoglycemia while ketosis and acidosis resolve.',
   'An earlier phase of DKA treatment may use insulin without added dextrose while glucose is still high. At 220 mg/dL, continuing the same rate without dextrose risks hypoglycemia while the client still needs insulin for ketosis.',
  ],
 }],
 ['EXP2-SKIN-063',{
  source:'https://www.internationalguideline.com/woundhealing',
  rationale:[
   'The heel eschar is dry, firmly adherent and has no signs of infection. Leave it intact, offload the heel, and monitor the site. Debridement may be considered after specialist assessment if infection develops or the tissue is no longer stable.',
   'Offloading is appropriate while the heel is exposed to pressure in bed. Float the heel and reassess the skin so the plan prevents additional pressure and detects changes in the eschar.',
   'Describe the visible tissue and document the pressure injury as unstageable while eschar obscures its depth. Stable heel eschar can remain in place while the nurse documents the findings.',
   'New drainage, surrounding redness or softening warrants prompt reassessment. Those changes can indicate that the eschar is no longer stable or that infection is developing.',
  ],
 }],
 ['SIT-NP1-family-nursing-process-03-safety',{
  source:'https://www.ncbi.nlm.nih.gov/sites/books/NBK591807/#ch4.sec6',
  rationale:{
   action:'Arrange an accessible wound-care visit when mobility and transport limit access. Discuss options with the client and family so the plan is feasible.',
   teaching:'Discuss transport and caregiving when planning the schedule. This is appropriate because it identifies barriers before the client agrees to the plan.',
   outcome:'At follow-up, check whether the client actually receives wound care. This evaluates whether the adjusted plan overcame the access barriers.',
   safety:'Document refusal when a client with decision-making capacity declines after receiving and understanding the relevant information. This client describes transport and mobility barriers. Document those barriers and arrange accessible wound care.',
  },
 }],
]);

function withoutPreamble(reason){
 return reason.replace(/^(?:This choice fits a different clinical priority|That explanation addresses a different set of findings)\.\s+/,'');
}

export function applyChoiceContext(question,originals){
 if(question.retired||question.conceptId)return question;
 const original=originals.get(question.id);
 const reviewedCase=caseCorrections.get(question.id);
 const options=question.options.map((option,index)=>{
  if(reviewedCase){
   const role=option.referenceId?.split(':').at(-1);
   const rationale=Array.isArray(reviewedCase.rationale)?reviewedCase.rationale[index]:reviewedCase.rationale[role];
   if(!rationale)throw Error('Missing reviewed explanation for '+question.id);
   return {...option,rationale,source:reviewedCase.source};
  }
  const [id,kind,first,peerId,second]=pairedIds(option);
  if(kind==='paired'){
   const reasons=option.rationale.split('\n\n');
   const pair=[[originals.get(id),Number(first)],[originals.get(peerId),Number(second)]];
   const changes=pair.map(([item,slot],position)=>{
    const base=item.options[slot];
    const reviewed=contextualReason(item,base);
    if(reviewed)return reviewed;
    const context=slot!==item.correctIndex&&!unsafeDecision(item)&&peerContext(item,base);
    if(context){
     const alternate=withoutPreamble(reasons[position]);
     if(alternate.includes(caseReason(item)))return;
     return {reason:separateContext(alternate,item),caseSource:context};
    }
   });
   if(changes.every(change=>!change))return option;
   return {...option,rationale:reasons.map((reason,position)=>changes[position]?.reason||reason).join('\n\n'),
    rationaleParts:option.rationaleParts.map((part,position)=>{
     const change=changes[position];
     return change?{...part,...change.source&&{source:change.source},caseSource:change.caseSource}:part;
    })};
  }
  const reviewed=question.id===labCase+'-safety'&&contextualReason(question,option);
  if(reviewed)return {...option,rationale:reviewed.reason,source:reviewed.source};
  if(index===question.correctIndex||unsafeDecision(question)||!original)return option;
  const context=peerContext(original,option);
  if(!context||option.rationale.includes(caseReason(original)))return option;
  return {...option,rationale:separateContext(withoutPreamble(option.rationale),original)};
 });
 if(options.every((option,index)=>option===question.options[index]))return question;
 return {...question,options,rationale:options[question.correctIndex].rationale,
  ...(reviewedCase&&{source:reviewedCase.source}),questionRevision:8};
}
