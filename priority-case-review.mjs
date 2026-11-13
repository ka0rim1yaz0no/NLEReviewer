import {questionFamily} from './question-selection.ts';

const advancedLifeSupport='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/';
const basicLifeSupport='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support/';
const postDuralPuncture='https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2808365';
const stroke='https://www.ahajournals.org/doi/10.1161/STR.0000000000000513';
const burns='https://aci.health.nsw.gov.au/ecat/adult/burns';
const magnesium='https://www.ahrq.gov/patient-safety/settings/labor-delivery/perinatal-care/modules/strategies/medication/tool-safe-mgso4.html';
const magnesiumLabel='https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=752f55bb-c4ca-4545-94b3-3deea66888d4';
const pressureInjury='https://www.internationalguideline.com/classification';
const skinCare='https://www.nice.org.uk/guidance/cg179/chapter/Recommendations';
const nursingProcess='https://www.ncbi.nlm.nih.gov/books/NBK610818/#ptiv.sec8';

const asystole='SIT-NP5-high-acuity-emergency-situations-01-R2';
const smoke='SIT-NP5-high-acuity-emergency-situations-03';
const persistentDeficit='SIT-NP5-altered-perception-01';
const cardioversion='SIT-NP5-altered-tissue-perfusion-02-R2';
const positionalHeadache='SIT-NP2-postpartum-complications-03-R2';

const cases={
 [asystole]:{
  source:advancedLifeSupport,
  recognition:'A flat tracing across checked leads with verified connections supports true asystole in this pulseless client. Keep using the nonshockable arrest pathway.',
  reasoning:'Chest compressions support perfusion while the team gives early epinephrine per protocol and treats reversible causes. Defibrillation becomes appropriate if the rhythm becomes ventricular fibrillation or pulseless ventricular tachycardia.',
  action:'Continue high-quality CPR with minimal interruption and give epinephrine promptly per the arrest algorithm. Check for and address reversible causes while reassessing the rhythm at the scheduled checks.',
  safety:'A defibrillation shock treats ventricular fibrillation or pulseless ventricular tachycardia. With confirmed asystole, use CPR, early epinephrine per protocol, and assessment for reversible causes.',
  teaching:'Bystanders should activate the emergency response and follow the dispatcher’s CPR directions. In this ward arrest, direct available staff to bring the code equipment while the trained team continues CPR.',
  outcome:'Minimal interruptions indicate that the team is maintaining compressions while following the nonshockable rhythm algorithm. Continue reassessment for a rhythm change and return of circulation.',
  alternate:'The confirmed arrest rhythm and ongoing need for compressions determine the priority in this case.',
  evaluation:[
   'Sign-off is appropriate after the required evaluation is complete. Minimal interruptions at this check support progress, and the next rhythm check is still due.',
   'Record the quality of resuscitation at this check and reassess the rhythm on schedule. The team needs to identify a shockable rhythm or return of circulation as soon as it is present.',
   'An electrical injury calls for an ECG and assessment of deeper tissue injury after scene safety. Confirmed asystole calls for ongoing resuscitation and reassessment.',
   'Document CPR when it begins. The handoff also reports that interruptions were minimal, which is evidence about care quality and belongs in the evaluation.',
  ],
 },
 [cardioversion]:{
  source:advancedLifeSupport,
  recognition:'The unstable narrow-complex tachycardia is present with a pulse. The missing R-wave markers show that synchronization has yet to be confirmed.',
  reasoning:'Synchronized cardioversion is indicated for instability caused by this tachycardia. Aligning the shock with the QRS avoids delivery during the vulnerable part of ventricular repolarization.',
  action:'Work with the trained team to check synchronization mode and verify that the markers track each QRS. Follow the emergency rhythm protocol so the patient receives timely cardioversion.',
  safety:'An unsynchronized shock is appropriate for sustained polymorphic ventricular tachycardia or a shockable cardiac arrest rhythm. With this unstable regular narrow-complex rhythm and a pulse, use synchronized cardioversion.',
  teaching:'Explain the procedure and arrange sedation when feasible in an awake client. The instability makes timely cardioversion the priority if sedation would cause a delay.',
  outcome:'Verify that the synchronized treatment was delivered using the correct settings, then reassess rhythm and perfusion. Delivering the shock confirms the intervention, and reassessment shows its effect.',
  alternate:'The pulse, rhythm, and missing synchronization markers make preparation for synchronized cardioversion the priority here.',
  evaluation:[
   'Sign off when the required checks are complete. Verified delivery documents the treatment, and a repeat check still needs to assess rhythm and perfusion.',
   'A goal centered on oxygen-carrying capacity applies when anemia is identified. This follow-up checks the response to cardioversion.',
   'Record verified delivery as progress and perform the next check. Reassess rhythm, blood pressure and signs of perfusion after treatment.',
   'Record the device and treatment checks when performed. The reported treatment outcome and the planned clinical reassessment also belong in the record.',
  ],
 },
 [smoke]:{
  source:burns,
  recognition:'Soot, hoarseness and increasing breathing difficulty after fire exposure point to evolving inhalation injury. Visible burn size is a poor guide to airway swelling.',
  reasoning:'An injured upper airway can swell after smoke and heat exposure. Progressive hoarseness and dyspnea justify emergency airway assessment even if the skin burn is small.',
  action:'Escalate immediately for airway and respiratory assessment, provide oxygen under the emergency protocol, and prepare to assist the airway team as needed.',
  safety:'A small isolated skin burn can be assessed for outpatient care when airway warning signs are absent. Soot, hoarseness and worsening dyspnea after a fire indicate a threatened airway that requires emergency assessment.',
  teaching:'New hoarseness or difficulty breathing after smoke exposure warrants urgent help because airway swelling can develop or worsen after the exposure.',
  outcome:'Confirm that the airway team evaluated the patient promptly and continue checking airway patency and respiratory effort because swelling can progress.',
  alternate:'The fire exposure, soot and progressive breathing symptoms make airway injury the priority in this case.',
  evaluation:[
   'Mark the goal achieved when the reassessment confirms that the airway team evaluated the patient in time. The documented request for assessment alone leaves that outcome unknown.',
   'Rapid cooling is a priority for heat stroke with hyperthermia and altered mental status. This patient has soot, hoarseness and increasing respiratory effort after a fire.',
   'Mark a goal unmet when observed findings show it failed. Here the handoff lacks an airway reassessment, so obtain that finding before assigning an outcome.',
   'Record the request for emergency assessment and confirm that the airway was evaluated. Continue serial checks because respiratory symptoms can worsen as swelling progresses.',
  ],
 },
 [persistentDeficit]:{
  source:stroke,
  recognition:'Sweating improved when glucose rose to 105 mg/dL, but unilateral arm drift and speech difficulty persisted. These focal deficits require urgent stroke evaluation.',
  reasoning:'Hypoglycemia can mimic acute stroke. Focal deficits that remain after the low glucose is corrected raise concern for a concurrent stroke and need time-sensitive assessment.',
  action:'Activate the stroke pathway promptly. Report the last known well time, repeat glucose, and persistent focal deficits so the stroke team can evaluate treatment eligibility.',
  safety:'Serial glucose checks help detect recurrent hypoglycemia and should continue as indicated. They cannot replace emergency stroke assessment when focal deficits persist after glucose correction.',
  teaching:'Sudden one-sided weakness or speech difficulty warrants emergency assessment. The previously low glucose does not account for the persistent focal findings after correction.',
  outcome:'Verify that the stroke team has the symptom timeline and corrected glucose reading. Repeat the focused neurological assessment promptly to document any change in the deficits.',
  alternate:'Glucose has recovered, and new one-sided arm drift and speech difficulty persist. The remaining deficits make urgent stroke assessment the priority.',
  evaluation:[
   'Confirm that the stroke team received the key findings and that the neurological reassessment was performed before recording the goal as met. Calling the team documents the intervention.',
   'Sedation and a sedation target are relevant after sedative exposure. This client has persistent focal deficits after glucose correction, which require stroke reassessment.',
   'An observed failure to complete the intended reassessment can show the goal was unmet. A missing entry leaves its status unknown, so verify the result promptly.',
   'Record the stroke activation and verify the team received the timeline and repeat glucose. Reassess the arm drift and speech change while urgent stroke evaluation proceeds.',
  ],
 },
 [positionalHeadache]:{
  source:postDuralPuncture,
  recognition:'Headache that worsens upright and eases lying down after neuraxial anesthesia raises suspicion for a post-dural-puncture headache. Check blood pressure and neurological findings before settling on the cause.',
  reasoning:'The timing and positional pattern suggest a possible cerebrospinal fluid leak. Hypertension, visual symptoms, focal deficits, altered consciousness or seizures warrant urgent evaluation for other postpartum causes.',
  action:'Assess blood pressure, headache features and neurological findings and notify the obstetric and anesthesia teams. A changing headache or new neurological finding calls for urgent reassessment.',
  safety:'A familiar mild headache may receive symptom care after assessment. This new positional headache after neuraxial anesthesia needs vital signs, neurological assessment and clinician review before attributing it to a benign cause.',
  teaching:'Report the new positional headache to the care team now. Worsening pain, a change to nonpositional pain, visual symptoms or neurological changes call for urgent reassessment.',
  outcome:'After the cause has been evaluated, confirm that a symptom and follow-up plan is in place. Include whom to contact and which changes need urgent reassessment.',
  alternate:'The new positional headache after neuraxial anesthesia calls for blood-pressure and neurological assessment and obstetric or anesthesia review.',
  evaluation:[
   'Document the full goal as met once the cause has been evaluated and a symptom and follow-up plan is confirmed. This handoff supports the first component.',
   'Document an unmet goal if reassessment establishes that it was missed. An undocumented follow-up plan remains unconfirmed while the known evaluation can be recorded.',
   'A complete summary can be entered after both findings are known. Record the cause evaluation now and separately confirm the remaining care plan.',
   'The handoff confirms that the cause was evaluated. Record that progress and confirm the plan for symptom care, follow-up and warning signs before closing the goal.',
  ],
 },
};

const direct=new Map([
 ['ORIG-NP3-heart-anatomy-ecg-basics-01',{source:advancedLifeSupport,reasons:[
  'Defibrillation is indicated if the monitor shows ventricular fibrillation or pulseless ventricular tachycardia. An organized rhythm without a definite pulse supports the nonshockable pathway.',
  ['Ventilation without compressions is appropriate for abnormal or absent breathing with a definite pulse. The displayed rate of 68/min does not establish circulation.',basicLifeSupport],
  'Start CPR and activate the arrest response when the unresponsive client has abnormal breathing and no definite pulse on a rapid check. The organized rhythm suggests pulseless electrical activity.',
  ['A 12-lead ECG helps assess a stable or resuscitated patient when indicated. A diagnostic tracing must not delay compressions in this suspected cardiac arrest.',basicLifeSupport],
 ]}],
 ['CH-033',{source:stroke,reasons:[
  'During the first 24 hours after IV alteplase, the stroke protocol calls for increased monitoring and ordered treatment above 180 mm Hg systolic or 105 mm Hg diastolic. Both values exceed the limit even though the examination is stable.',
  'The 185/110 mm Hg threshold is relevant to eligibility before IV thrombolysis. Thirty minutes after the infusion, use the lower post-treatment ceiling.',
  'A repeat can clarify a questionable measurement. Here two properly obtained readings exceed the post-treatment limit, so escalate now and increase monitoring per protocol.',
  'A lower target may be ordered for a separate clinical indication. Routine intensive systolic lowering below 140 mm Hg after IV thrombolysis does not improve functional outcomes in mild to moderate stroke.',
 ]}],
 ['EXP2-SKIN-061',{source:pressureInjury,reasons:[
  'Stage 2 applies to partial-thickness skin loss caused by pressure or shear. Diffuse superficial erosions after watery stool are more consistent with incontinence-associated dermatitis.',
  'Deep tissue pressure injury is considered for persistent localized deep red, maroon or purple discoloration or a blood-filled blister over a pressure site. Immobility raises risk, while these diffuse erosions follow the area of stool exposure.',
  'Document the distribution and recent stool exposure, cleanse and protect the skin under the moisture care plan, and assess separately for localized pressure injury.',
  'Stage 1 describes a localized nonblanchable change in intact skin over a pressure site. These erosions are open and spread across stool-exposed skin. Use a moisture protection plan.',
 ]}],
 ['EXP2-SKIN-062',{source:pressureInjury,reasons:[
  'Stage 2 describes partial-thickness skin loss with exposed dermis or a compatible serum-filled blister. The intact, persistently maroon heel is consistent with deep tissue pressure injury.',
  'Persistent maroon discoloration and bogginess at a known pressure site can indicate deep tissue damage beneath intact skin. Offload the heel, document the findings, and arrange wound assessment.',
  ['Offloading and prompt reassessment protect the heel while the tissue injury evolves. Massage or rubbing can damage vulnerable skin and is inappropriate over a suspected pressure injury.',skinCare],
  'Stage 1 can present as localized nonblanchable erythema with intact skin. Persistent maroon color and bogginess over the loaded heel point to possible deeper injury.',
 ]}],
 ['EXP2-SKIN-064',{source:pressureInjury,reasons:[
  'Stage 2 can describe compatible loss of skin caused by a device. The injury here is on nasal mucosa, so skin staging does not apply.',
  'Unstageable describes a skin pressure injury with tissue loss whose depth is hidden by slough or eschar. A hard-to-see mucosal ulcer belongs in the mucosal injury category.',
  'Inspect and document the device’s contact points even when the external skin is intact. The visible internal ulcer represents a device-related mucosal injury.',
  'Document mucosal pressure injury at the inner nasal contact point and name the oxygen device. Record the findings and address ongoing device pressure without assigning a skin stage.',
 ]}],
 ['EXP2-SKIN-066',{source:pressureInjury,reasons:[
  'Visible redness can contribute to the assessment of lighter skin. Compare temperature, firmness, pain and color across nearby tissue when pigment makes redness difficult to see. The pressure site already shows a change.',
  'Relieve pressure immediately and compare the site with surrounding skin. Persistent discoloration, warmth and firmness over a loaded bony prominence raise concern for early pressure injury.',
  'Stage 3 requires full-thickness skin loss. The skin here is intact, so warmth and firmness support early assessment and offloading without assigning that stage.',
  'Record the location and appearance, and use the facility’s approved method to track the area. Continuing pressure at the trochanter delays the first intervention the findings call for.',
 ]}],
]);

const magnesiumReasons={
 'NP2-043-1':{
  1:['Magnesium is cleared by the kidneys. Falling urine output raises the risk of accumulation, and absent patellar reflexes with breathing at 8/min make toxicity an emergency.',magnesiumLabel],
  3:['Stable urine output is one sign the patient is tolerating the infusion. Falling output can reflect renal involvement and reduced magnesium clearance, so it does not indicate improved preeclampsia.',magnesiumLabel],
 },
 'NP2-043-2':{
  0:'A rate adjustment may be ordered during routine titration when assessment is reassuring. At 8 breaths/min with absent reflexes, stop the infusion and escalate immediately.',
  2:'Stop magnesium, call the emergency team, and support airway and breathing. Prepare protocol-directed calcium gluconate while the team evaluates the severe respiratory depression.',
 },
 'NP2-043-3':{
  0:'A severe headache can signal worsening preeclampsia and needs reporting. Slow breathing on magnesium is also urgent because it can signal toxicity.',
  1:'Routine questions can wait until after an infusion. New breathing difficulty, marked weakness or reduced alertness need immediate reporting because toxicity can progress during administration.',
  3:'Teach the patient and family to report breathing difficulty, marked weakness or reduced alertness promptly. Continue nursing checks of respirations, reflexes and urine output.',
 },
 'NP2-043-4':{
  0:'Adequate breathing and return of patellar reflexes show improvement after stopping magnesium and providing treatment. Continue close monitoring while the team confirms stability.',
  2:'Spacing assessments may be reasonable after the patient is stable. Persistently absent reflexes suggest ongoing toxicity and call for continued monitoring and reassessment.',
 },
 'NP2-043-5':{
  1:'Restarting seizure prophylaxis requires a clinician’s reassessment and a safe plan. Restarting before the respiratory depression and absent reflexes are evaluated may worsen toxicity.',
  2:'The current reflexes, urine output and amount of magnesium delivered help the emergency team assess toxicity and guide the response.',
 },
};

const evaluationSources={
 [asystole]:['','','https://www.rch.org.au/trauma-service/manual/Burns/',''],
 [cardioversion]:['','https://www.ncbi.nlm.nih.gov/books/NBK613075/','',''],
 [smoke]:['','https://www.cdc.gov/niosh/heat-stress/about/illnesses.html','',''],
 [persistentDeficit]:['','https://www.ncbi.nlm.nih.gov/books/NBK610835/','',''],
};
const reviewedChoiceText={
 [asystole]:{
  teaching:'Direct available staff to activate the emergency response and bring the code equipment',
  outcome:'Check whether CPR and nonshockable-rhythm treatment proceed with minimal interruption',
 },
 [cardioversion]:{teaching:'Explain the procedure and sedation plan to the client when this will not delay cardioversion'},
};
const headacheTeaching='SIT-NP2-postpartum-complications-04:teaching';
const headacheAlternatives={
 'SIT-NP2-postpartum-complications-04:problem':'Severe hypertension or new visual symptoms would increase concern for postpartum preeclampsia. Check blood pressure and neurological findings. The positional pattern after neuraxial anesthesia makes post-dural-puncture headache the leading consideration here.',
 [headacheTeaching]:'Home blood-pressure monitoring is appropriate in a postpartum hypertension follow-up plan. This newly symptomatic client needs instructions to report a changing headache or neurological warning signs and needs clinical assessment now.',
};
const strokeAlternatives={
 'SIT-NP5-altered-perception-03:action':'Airway and medication assessment is appropriate when responsiveness falls after a sedative. Here the sweating resolved after glucose correction and unilateral weakness and speech difficulty persisted. Activate the stroke pathway promptly.',
 'SIT-NP5-altered-perception-03:problem':'Consider sedation when there is reduced arousal after a sedative dose. Persistent one-sided weakness and speech difficulty after correcting glucose support urgent stroke evaluation.',
};

function sourceAndReason(value,source){
 const [reason,reference]=Array.isArray(value)?value:[value,source];
 return {reason,source:reference};
}

function caseRationale(family,item,slot){
 const option=item.options[slot];
 const selected=option.referenceId?.split(':')??[];
 const own=cases[family];
 const matchedCase=cases[selected[0]];
 if(item.id.startsWith('NP2-043-')){
  const reason=magnesiumReasons[item.id]?.[slot];
  return reason&&sourceAndReason(reason,magnesium);
 }
 const targeted=family===positionalHeadache?headacheAlternatives[option.referenceId]:family===persistentDeficit?strokeAlternatives[option.referenceId]:undefined;
 if(targeted)return {reason:targeted,source:option.source||item.source,caseSource:own.source};
 if(!matchedCase&&!own)return;
 const role=selected[1];
 const selectedRole={problem:'recognition',reason:'reasoning',planning:'outcome'}[role]??role;
 const reason=matchedCase?.[selectedRole];
 if(reason&&selected[0]===family)return {reason,source:matchedCase.source};
 if(!own&&!reason)return;
 const context=own?.alternate??item.options[item.correctIndex].rationale.split(' The cue to act on here is ')[0];
 const otherCase=reason??option.rationale
  .replace(/^(?:This choice fits a different clinical priority|That explanation addresses a different set of findings)\.\s+/,'')
  .split(' The cue to act on here is ')[0];
 return {reason:otherCase+'\n'+context,source:matchedCase?.source||option.source||item.source,caseSource:own?.source||item.source};
}

export function reviewPriorityCases(question,originals){
 if(question.retired||question.conceptId)return question;
 const family=questionFamily(question),reviewed=cases[family],standalone=direct.get(question.id);
 const options=question.options.map((option,index)=>{
  if(standalone){
   const {reason,source}=sourceAndReason(standalone.reasons[index],standalone.source);
   return {...option,rationale:reason,source};
  }
  const [id,kind,slot,other,otherSlot]=option.referenceId?.split(':')??[];
  if(kind==='paired'&&option.rationaleParts){
   const reasons=option.rationale.split('\n\n');
   const decisions=[[originals.get(id),Number(slot)],[originals.get(other),Number(otherSlot)]];
   const pair=decisions.map(([item,index])=>caseRationale(family,item,index));
   if(pair.every(value=>!value))return option;
   const text=family===positionalHeadache?option.text.split('\n').map((line,i)=>{
    const [item,index]=decisions[i];
    return item.options[index].referenceId===headacheTeaching
     ?'Teaching — Review the home blood-pressure monitoring plan for diagnosed postpartum hypertension'
     :line;
   }).join('\n'):option.text;
   return {...option,text,rationale:pair.map((value,i)=>value?.reason??reasons[i]).join('\n\n'),
    rationaleParts:option.rationaleParts.map((part,i)=>pair[i]?{label:part.label,verdict:part.verdict,source:pair[i].source,...pair[i].caseSource&&{caseSource:pair[i].caseSource}}:part)};
  }
  if(reviewed&&question.clinicalObjective==='evaluation'){
   const source=evaluationSources[family]?.[index]||nursingProcess;
   return {...option,rationale:reviewed.evaluation[index],source,contextSource:reviewed.source};
  }
  const original=originals.get(question.id);
  const update=original?.options[index]?.referenceId===option.referenceId&&caseRationale(family,original,index);
  if(!update)return option;
  const text=question.clinicalObjective==='safety'?reviewedChoiceText[family]?.[kind]:undefined;
  return {...option,text:text??option.text,rationale:update.reason,source:update.source,...update.caseSource&&{contextSource:update.caseSource}};
 });
 if(options.every((option,index)=>option===question.options[index]))return question;
 const source=standalone?.source||reviewed?.source||question.source;
 const rationale=options[question.correctIndex].rationale;
 const keyPoint=reviewed?reviewed.reasoning:question.keyPoint;
 return {...question,options,source,rationale,keyPoint,questionRevision:9};
}
