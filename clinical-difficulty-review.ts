import type {Question} from './types.ts';

const processSource='https://www.ncbi.nlm.nih.gov/books/NBK610818/#ptiv.sec8';
const evaluationLead='At the first reassessment after the planned care, the nurse records this result: ';
const evaluationEnd=' Which interpretation should guide follow-up?';
const stop=(text:string)=>text.replace(/[.!?]$/,'')+'.';

// The first finding is documented. The second is an independently observable
// part of the published goal that still needs evidence at the time of handoff.
const partialOutcomes:Record<string,[string,string]>={
 'SIT-CROSS-professional-ethics-legal-foundations-03':['The medication history is accurate','the client receives an appropriate reviewed plan'],
 'SIT-CROSS-dosage-calculation-medication-administration-03':['The allergy is assessed','a safe reviewed medication plan is documented'],
 'SIT-CROSS-dosage-calculation-medication-administration-04':['The tube remains patent','the intended medicines are delivered safely'],
 'SIT-CROSS-asepsis-iv-therapy-wound-care-02':['Further tissue exposure stops','the swelling is assessed and managed'],
 'SIT-CROSS-basic-needs-mobility-comfort-elimination-oxygenation-03':['The impaction is addressed','a comfortable regular bowel pattern returns'],
 'SIT-CROSS-pharmacology-drug-classes-03':['Oral symptoms resolve','the inhaler is used with correct preventive technique'],
 'SIT-CROSS-pharmacology-drug-classes-04':['The airway remains protected','the suspected medicine is urgently reviewed'],
 'SIT-NP1-tuberculosis-03':['The symptoms and medicines are reviewed promptly','a safe plan is established'],
 'SIT-NP1-care-of-families-normal-at-risk-02':['Care responsibilities are supported','the caregiver can attend necessary health care'],
 'SIT-NP1-care-of-families-normal-at-risk-03':['Medicines are securely stored','caregivers can describe poisoning prevention'],
 'SIT-NP1-primary-health-care-phc-02':['Ill clients receive care','the shared exposure source is addressed'],
 'SIT-NP1-expanded-program-on-immunization-epi-03':['The reaction history is reviewed','a safe product-specific plan is made'],
 'SIT-NP1-nutrition-programs-03':['The growth pattern is investigated','an individualized feeding and follow-up plan is established'],
 'SIT-NP1-community-mental-health-program-04':['The client receives assessment','a feasible support and recovery plan is arranged'],
 'SIT-NP1-integrated-management-of-childhood-illness-imci-03':['Respiratory severity is classified','appropriate care is arranged'],
 'SIT-NP1-laws-ncd-environmental-occupational-nutrition-04':['The duplicate is identified','the medicine plan is safely reconciled'],
 'SIT-NP2-female-male-reproductive-systems-03':['The infection is assessed','an appropriate treatment and follow-up plan begins'],
 'SIT-NP2-developmental-milestones-02':['The regression is evaluated','appropriate support is arranged'],
 'SIT-NP2-adolescent-health-02':['The cause and severity are assessed','an appropriate treatment plan is established'],
 'SIT-NP3-pre-operative-phase-02':['The team has an accurate medicine history','a safe perioperative strategy is documented'],
 'SIT-NP3-heart-anatomy-ecg-basics-04':['A reliable rhythm trace is restored','the patient’s actual status is confirmed'],
 'SIT-NP3-dialysis-hemodialysis-peritoneal-01':['The access is evaluated promptly','a safe treatment-access plan is established'],
 'SIT-NP3-cancer-treatment-modalities-04':['Possible toxicity is evaluated','a monitored treatment plan is established'],
 'SIT-NP4-malnutrition-01':['The client tolerates adequate intake','the weight trend is monitored'],
 'SIT-NP4-ostomies-03':['Effluent is contained','the surrounding skin begins to recover'],
 'SIT-NP4-adrenal-gland-disorders-03':['Further skin trauma is minimized','the wound is monitored'],
 'SIT-NP4-multiple-sclerosis-ms-04':['The new deficit receives appropriate evaluation','a tailored plan is established'],
 'SIT-NP4-autonomic-dysreflexia-03':['The acute episode is treated','the bowel plan is reviewed safely'],
 'SIT-NP4-autonomic-dysreflexia-04':['The possible trigger is removed','the physiological response is reassessed'],
 'SIT-NP4-eye-anatomy-assessment-refractive-disorders-02':['The cause of near-vision difficulty is assessed','appropriate correction is provided'],
 'SIT-NP4-other-eye-conditions-surgery-care-01':['Irrigation begins without delay','the eye receives urgent evaluation'],
 'SIT-NP5-personality-disorders-01':['Staff responses remain coordinated','the client knows what to expect'],
 'SIT-NP5-substance-use-disorders-03':['The withdrawal risk is assessed','a supervised plan is established'],
 'SIT-NP5-cognitive-other-psychiatric-disorders-03':['The cause of the change is investigated','the regimen is reviewed'],
 'SIT-NP5-altered-ventilatory-function-02':['Effective ventilation is restored','the cause is corrected'],
 'SIT-CROSS-asepsis-iv-therapy-wound-care-04-R2':['Moisture exposure decreases','the affected skin is reassessed for healing'],
 'SIT-NP2-postpartum-complications-03-R2':['The cause is evaluated','a suitable symptom and follow-up plan is established'],
 'SIT-NP2-ethico-moral-management-in-maternal-care-03-R2':['The client receives appropriate monitoring','the event is accurately addressed'],
 'SIT-NP4-malnutrition-04-R2':['Nutritional risk is recognized','an individualized plan is arranged'],
 'SIT-NP4-hepatobiliary-disorders-04-R2':['The new hypotension is evaluated','the postprocedure plan is implemented'],
 'SIT-NP4-adh-disorders-02-R2':['The rapid change is recognized','the team adjusts the plan safely'],
 'SIT-NP4-cerebrovascular-accident-stroke-01-R2':['The transient event receives timely assessment','a prevention plan is arranged'],
 'SIT-NP4-ear-disorders-surgery-care-01-R2':['The new deficit is assessed','the exposed eye is protected'],
};

function partialEvaluation(question:Question,documented:string,pending:string):Question{
 const [scenario,prompt]=question.stem.split('\n\n');
 const target=prompt.slice(evaluationLead.length,-evaluationEnd.length);
 const documentedText=documented.replace(/^[A-Z]/,letter=>letter.toLowerCase());
 const pendingText=pending.replace(/^[A-Z]/,letter=>letter.toLowerCase());
 const key=`Record partial evidence for the target and verify whether ${stop(pendingText)}`;
 const correctWhy=`${stop(documented)} This supports progress on one component. The remaining component requires its own reassessment before the complete goal can be marked met.`;
 const choices:[string,string][]=[
  [`Mark the full target met when the handoff confirms that ${stop(documentedText)}`,
   'The documented finding supports one component of the goal. The other component is part of the goal itself and needs evidence before the complete goal is marked met.'],
  [`Record the target as unmet while it remains unclear whether ${stop(pendingText)}`,
   'The record supports progress on the documented component. An unverified second component does not establish that the target failed.'],
  [`Wait to record that ${documentedText} until both findings can be entered together.`,
   'The nurse can record the documented progress now and identify what still requires assessment. Waiting for complete information would leave the current finding out of the handoff.'],
 ];
 choices.splice(question.correctIndex,0,[key,correctWhy]);
 const options=choices.map(([text,rationale],index)=>({text,rationale,source:processSource,contextSource:question.source,referenceId:`${question.id}:partial-outcome-${index+1}`}));
 return {...question,stem:`${scenario}\n\nTarget for this check: ${target} The handoff confirms one finding: ${stop(documented)} It contains no findings for the other part of the target. What should the nurse enter for this evaluation?`,options,rationale:correctWhy,questionRevision:5};
}

const teachLead='Review this instruction at the appropriate time: ';
const reassessLead='Reassess for this result: ';
function parallelSafety(question:Question):Question{
 const options=question.options.map((option,index)=>{
  let text=option.text;
  if(index===question.correctIndex){
   text=text.replace(/^Base the plan on the assumption that /,'Proceed on the basis that ')
    .replace(/^Insist that (.+) for convenience$/,'Plan to have $1');
  }else{
   if(text.startsWith(teachLead))text='Provide this instruction. '+text.slice(teachLead.length);
   if(text.startsWith(reassessLead))text='Check whether '+text.slice(reassessLead.length).replace(/^[A-Z]/,letter=>letter.toLowerCase());
  }
  return text===option.text?option:{...option,text};
 });
 return options.every((option,index)=>option===question.options[index])?question:{...question,options,questionRevision:5};
}

export function applyClinicalDifficultyReview(bank:Question[]){
 return bank.map(question=>{
  if(question.retired)return question;
  if(question.id.startsWith('SIT-')&&question.id.endsWith('-safety')&&question.clinicalObjective==='safety'&&!question.questionRevision)return parallelSafety(question);
  const parts=question.caseId&&partialOutcomes[question.caseId];
  if(parts&&question.clinicalObjective==='evaluation'&&!question.questionRevision&&question.stem.split('\n\n')[1]?.startsWith(evaluationLead)&&question.stem.endsWith(evaluationEnd))return partialEvaluation(question,...parts);
  return question;
 });
}
