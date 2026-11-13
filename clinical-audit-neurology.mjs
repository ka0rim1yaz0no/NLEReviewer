import {references as ref} from './clinical-audit-references.mjs';

const rehabilitation='https://www.nice.org.uk/guidance/ng236/chapter/Recommendations';
const febrile='https://www.rch.org.au/clinicalguide/guideline_index/Febrile_seizure/';
const fever='https://www.nice.org.uk/guidance/ng143/chapter/recommendations';
const magnesium='https://www.ahrq.gov/patient-safety/settings/labor-delivery/perinatal-care/modules/strategies/medication/tool-safe-mgso4.html';
const neurological='https://aci.health.nsw.gov.au/ecat/adult/assessment/neurological';
const cerebralPerfusion='https://braintrauma.org/coma/guidelines/severe-tbi';
const withdrawal='https://www.nice.org.uk/guidance/ng217/chapter/principles-of-treatment-safety-monitoring-and-withdrawal';
const lamotrigine='https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=70cd448a-2921-4c69-bdf2-5a6ce883bd07';
const neuralTube='https://www.spinabifidaassociation.org/blog/neurosurgery-guideline/';
const potassium='https://guidelines.ukkidney.org/hyperkalaemia/6-summary-of-clinical-practice-guideline-for-hyperkalaemia/6-2-section-ii-hospital/';
const anticoagulation='https://www.acc.org/guidelines/guidelines/2020/07/14/08/32/management-of-bleeding-in-patients-on-oral-anticoagulants';

export const legacyNeurologyCases={
 'NP2-043':{
  source:magnesium,
  keyPoint:'Suspected magnesium toxicity requires stopping the infusion, escalating and immediately addressing inadequate ventilation.',
  decisions:{
   1:{1:[null,'A respiratory rate of 8/min and absent patellar reflexes during magnesium infusion indicate suspected toxicity. Low urine output can reduce magnesium clearance and increase risk.'],
    3:['New severe headache and visual symptoms with preserved reflexes and breathing','Headache and visual changes warrant assessment for severe preeclampsia. The findings in this patient instead point to magnesium toxicity with inadequate ventilation, which requires immediate action.']},
   2:{0:['Turn down the magnesium rate and recheck ventilation after the infusion','A prescribed rate adjustment can be appropriate when review shows therapy can safely continue. At 8 breaths/min with absent reflexes, stop the infusion and support ventilation urgently.'],
    2:['Stop magnesium, activate emergency help, support ventilation and prepare protocol-directed calcium gluconate','This patient needs immediate cessation of magnesium, help with airway and ventilation, and the ordered antidote. Draw a magnesium level if indicated without delaying the response.']},
   3:{0:['Report a persistent headache, but wait to report shortness of breath until the next medication check','Persistent headache is an important preeclampsia warning sign. Shortness of breath or increasing sedation during magnesium therapy also needs immediate reporting.',ref.postnatal],
    1:['Wait until the infusion is completed to report changes in strength or breathing','Nonurgent concerns can be raised during scheduled review. New weakness, drowsiness or breathing problems during the infusion can signal toxicity and need immediate attention.'],
    3:[null,'New difficulty breathing, marked weakness or reduced alertness during magnesium treatment should be reported immediately. Objective respiratory and reflex monitoring remains essential.']},
   4:{0:[null,'Follow ventilation, oxygenation, reflexes and urine output after stopping magnesium and starting treatment. A sustained clinical response is needed before decreasing observation.'],
    2:['Oxygen saturation is normal on oxygen while breathing stays slow and reflexes are absent','Oximetry helps assess oxygenation. Supplemental oxygen can hide inadequate ventilation, and absent reflexes with ongoing bradypnea still require active monitoring and treatment.']},
   5:{1:[null,'Restarting is a prescriber decision after reassessment of the toxicity, renal clearance and seizure risk. The active respiratory depression makes immediate restart unsafe.'],
    2:[null,'Reporting respiratory rate, reflexes, urine output and magnesium dose and timing helps the emergency team assess severity and guide action. Do this while stopping the infusion and supporting breathing.']},
  },
 },
 'NP2-053':{
  source:ref.bilirubin,
  scenario:'At 12 hours after birth, a 38-week newborn has visible jaundice under good light. The newborn’s temperature and respiratory assessment are stable. The bilirubin has not yet been measured.',
  decisions:{
   1:{3:[null,'Visible jaundice before 24 hours needs prompt bilirubin measurement because early elevation may reflect hemolysis or another cause that requires assessment. Appearance alone cannot determine severity.']},
   3:{1:[null,'Confirm who will check bilirubin and when, based on the measured result, age and risk. Teach the family to report worsening jaundice, difficulty waking or poor feeding promptly.']},
   4:{0:[null,'Compare measured bilirubin with the treatment threshold for age in hours, gestational age and neurotoxicity risk. Use that result and feeding assessment to judge progress and set follow-up.']},
   5:{1:[null,'Bilirubin follow-up and feeding observation are appropriate after the initial evaluation. Prompt measurement is still needed now because jaundice appeared at 12 hours.'],
    3:[null,'Some jaundice appears after the first day during normal adaptation. At 12 hours it needs immediate measurement and review before a physiologic explanation can be accepted.']},
  },
 },
 'NP2-058':{
  source:febrile,
  decisions:{
   1:{0:[null,'A single short generalized seizure with full recovery in an 18-month-old with fever is consistent with a simple febrile seizure after assessment for other causes. Focal movements, prolonged seizure or incomplete recovery would change evaluation.']},
   2:{1:['Review the fever-medicine label and discharge without checking whether alertness returned','Checking the label prevents dosing errors and can be part of discharge teaching. Before discharge the nurse also needs to verify recovery and review the cause of fever and the return plan.'],
    3:[null,'Verify the child has returned to baseline and the febrile illness was appropriately evaluated. Before discharge, review seizure first aid, when to seek emergency help and follow-up for the illness.']},
   3:{0:['Give correctly measured doses for distress, but use the thermometer alone to decide when to seek help for another seizure','A correct dose can improve comfort. Emergency help for another seizure depends on breathing, duration and recovery, even if the measured temperature is low.',fever],
    2:[null,'Use an age- and weight-appropriate dose for discomfort when indicated. Teach safe positioning, timing the event and getting emergency help for a seizure lasting five minutes, breathing trouble or failure to recover.'],
    3:['Follow the treatment and recurrence plan for a confirmed febrile urinary tract infection','A child who has had a urinary infection needs advice about treatment and recurrence. This case calls for seizure first aid and fever comfort guidance after assessment of the illness.','https://www.nice.org.uk/guidance/ng224/chapter/Recommendations']},
   4:{1:[null,'Use teach-back to verify both comfort measures and a practical response to another seizure, including when to get emergency help. A low temperature after medicine is insufficient evidence of preparedness.'],
    2:['The caregiver measures the right dose but cannot describe when to get help for another convulsion','Accurate measurement is a useful medication check. The caregiver still needs to recognize emergency signs and demonstrate what to do for another convulsion.',fever]},
   5:{2:[null,'Fever medicine can be used for discomfort according to the prescribed or labeled schedule. Giving it specifically on a schedule to prevent febrile seizures has no reliable preventive benefit.',fever],
    3:[null,'A teach-back check before discharge is appropriate. Ask the caregiver to explain the home fever plan and show how they would respond to a recurrence.']},
  },
 },
};

export const neurologyCases={
 'SIT-CROSS-laboratory-values-01':{
  source:potassium,
  scenario:'An adult with kidney failure develops new weakness. A promptly processed, nonhemolyzed specimen shows potassium of 6.7 mmol/L and the ECG shows new peaked T waves. The client has a pulse.',
  assessment:'A potassium of 6.7 mmol/L with new ECG changes marks severe hyperkalemia with a risk of dangerous arrhythmia. Findings in this nonhemolyzed sample need immediate action.',
  action:'Start continuous cardiac monitoring, escalate immediately and activate the ordered hyperkalemia pathway. Prepare protocol-directed cardiac protection and potassium-lowering treatment, and arrange urgent specialist input.',
  teaching:'Avoid potassium-containing salt substitutes unless the renal team approves them. Review medicines, supplements and diet with the team after the emergency treatment is underway.',
  outcome:'Recheck ECG findings and serum potassium after treatment to detect improvement or rebound. After insulin–glucose, check glucose as scheduled to detect treatment-related hypoglycemia.',
  reasoning:'High extracellular potassium disrupts cardiac electrical activity. ECG changes warrant immediate treatment to protect the heart while other measures redistribute or remove potassium.',
  safety:'Potassium replacement can apply to measured hypokalemia under an order. With severe hyperkalemia and ECG changes, withhold the supplement according to the emergency protocol and contact the team now.',
  followUp:'Document monitoring and treatment start. Verify trends in potassium and the ECG, and complete glucose checks if insulin–glucose was administered.',
  alternate:'Bleeding control and INR reassessment fit a patient with warfarin-related bleeding. This client needs ECG and potassium reassessment for hyperkalemia.',
 },
 'SIT-NP2-pediatric-neurologic-disorders-01-R2':{
  source:fever,
  scenario:'After a brief febrile seizure with full recovery, a child is alert and the source of fever has been assessed. The caregiver shows the nurse an intended schedule with extra doses of fever medicine to prevent another seizure. No extra doses have been given.',
  assessment:'The proposed schedule poses a medication dosing risk. Assess how the caregiver measures and times doses and correct the belief that more medicine prevents febrile seizures.',
  action:['Review the intended medicine, weight-based or prescribed dose, measuring device and intervals. Teach and demonstrate seizure first aid and emergency return signs before discharge.',febrile],
  teaching:'Use fever medicine for discomfort when appropriate and follow the exact dosing plan. Extra doses do not prevent a febrile seizure and can cause medication toxicity.',
  outcome:'Ask the caregiver to measure a dose with the proper device, state when the next dose could be given, and explain when to seek emergency help for another seizure.',
  reasoning:'Treating fever can improve comfort, but lowering the temperature with an antipyretic does not reliably prevent febrile convulsions. Too much medicine can cause harm.',
  safety:'A correctly measured recommended dose can relieve distress. Increasing the amount or shortening the interval risks toxicity without providing seizure prevention.',
  followUp:'Document the caregiver’s demonstration and recheck it at the scheduled follow-up. Ask them to explain how they will time another seizure, protect the airway and recognize when to get urgent help.',
  alternate:'Protecting exposed neural tissue fits an open spinal defect. Here the observation should assess the caregiver’s dosing and seizure first aid.',
  edits:{
   teaching:{2:['Use fever medicine only as directed for discomfort, and follow the seizure first-aid plan']},
  },
 },
 'SIT-NP4-increased-intracranial-pressure-iicp-04':{
  source:neurological,
  scenario:'A hospitalized adult being monitored for suspected raised intracranial pressure has a new generalized convulsion. It has stopped, but responsiveness is falling and breathing is irregular. No current cerebral perfusion pressure reading is available.',
  assessment:'Declining responsiveness and irregular breathing following a new seizure indicate acute deterioration. Check airway, ventilation and neurological status immediately while help responds.',
  action:'Activate emergency assistance, protect the patient, and assess and support airway and ventilation. Check glucose and document neurological findings and seizure timing without delaying care.',
  teaching:['Call staff immediately for another convulsion, breathing difficulty or failure to recover alertness. Keep the person safe and keep objects out of the mouth.',ref.seizures],
  outcome:'Verify adequate airway protection and ventilation or that appropriate support is in place. Follow serial responsiveness and neurological findings and investigate continued deterioration.',
  reasoning:'A new convulsion with worsening consciousness can threaten ventilation and reflect a serious intracranial problem. Stabilize respiration and assess the neurological change promptly instead of assuming ordinary recovery.',
  safety:['Protect the head and clear nearby hazards during a convulsion. Restraint and objects between the teeth can injure the patient and do not protect the airway.',ref.seizures],
  followUp:'Document the emergency assessment and reassess airway support, breathing and neurological trends. The examination having started does not establish that the patient has stabilized.',
  alternate:'An established below-target cerebral perfusion pressure warrants targeted management in an appropriately monitored patient. No value is available here. Follow immediate ventilation and neurological reassessment while the cause is evaluated.',
  edits:{
   action:{2:['Adjust the routine suctioning schedule and wait until the next check to reassess breathing','Suction according to clinical need, with appropriate preparation and monitoring, in a patient vulnerable to intracranial pressure changes. A schedule change cannot address irregular breathing with declining responsiveness.']},
  },
 },
 'SIT-NP4-cerebrovascular-accident-stroke-03':{
  source:rehabilitation,
  scenario:'During rehabilitation after a stroke, a client washes only the right side and leaves the left arm against the wheelchair edge. The pattern has been present since the stroke. The client can follow instructions and has no new neurological change.',
  assessment:'Missing objects and the affected side of the body during tasks suggests unilateral inattention. Assess how this affects safe wheelchair use, dressing and self-care.',
  action:'Check functional awareness and limb position. Use the rehabilitation plan’s scanning cues and protect the affected arm during wheelchair use and transfers.',
  teaching:'Teach the agreed scan toward the affected side. Have the client check arm position and the nearby environment before movement, using cues chosen by the rehabilitation team.',
  outcome:'Check whether the client attends to the affected side and positions the arm safely during actual mobility and self-care tasks. Document the amount of cueing still needed.',
  reasoning:'Inattention can impair awareness of part of the environment or body even when the person intends to cooperate. Specific scanning and positioning strategies support safe function.',
  safety:'A client may decline a task and should have that preference addressed respectfully. This repeated pattern on one side is a neurological finding that warrants assessment rather than an assumption of refusal.',
  followUp:'Observe the next transfer or self-care task. Record attention to the affected side, limb placement and the amount of cueing needed.',
  alternate:'An urgent assessment and prevention plan fit new transient focal deficits. This case describes stable poststroke inattention, so follow safety and scanning in daily activities.',
 },
 'SIT-NP4-cerebrovascular-accident-stroke-04':{
  source:rehabilitation,
  scenario:'A client in rehabilitation has established aphasia after a stroke. The client points to needed items when given time. The client becomes frustrated when staff raise their voices, ask several questions at once and finish each answer.',
  assessment:'The interaction creates a barrier for a client with aphasia. Assess how the client communicates and understands information with suitable aids and enough time.',
  action:'Speak in short, clear phrases at a normal volume, ask one question at a time and wait for a response. Use the agreed gestures, writing or communication aids and verify meaning.',
  teaching:'Teach the client and supporters to use the agreed communication aid or signal for more time. Respect the client’s preferred way to respond and confirm the message.',
  outcome:'Observe whether the client can express needs and take part in decisions using the chosen method. Reassess when the task or setting changes.',
  reasoning:'Aphasia can affect understanding or expression of language. Supported communication helps the client take part and gives the team better evidence of what the client understands.',
  safety:'Assess understanding and decision-making ability when needed using appropriate support. Speech difficulty by itself cannot establish impaired intelligence or lack of decision-making capacity.',
  followUp:'Record what the client communicated successfully and with which support. Check whether the method remains effective at the next interaction and revise the approach if needed.',
  alternate:'Scanning checks fit a patient with spatial inattention. In this interaction the outcome is whether the person can understand and express their needs through the chosen communication method.',
 },
 'SIT-NP4-seizure-disorders-04':{
  source:withdrawal,
  outcome:'Verify that a clinician reviewed the medication interruption and that the client can describe the agreed revised regimen and seizure-response plan.',
  followUp:'Record evidence that the client is following the agreed regimen. At the planned review, check adherence barriers, any further events and when the client should contact the epilepsy team. A single check cannot establish long-term seizure control.',
  alternate:'Immediate rescue and airway support apply during an ongoing or recurrent seizure. This follow-up evaluates the agreed medication and prevention plan after the breakthrough event.',
 },
 'SIT-NP4-seizure-disorders-01-R2':{
  source:lamotrigine,
  outcome:'Confirm urgent evaluation of the rash, mucosal symptoms and systemic signs and that the team recorded and acted on the suspected drug reaction.',
  followUp:'Record that an emergency evaluation occurred. Check the progression of skin, mucosal and systemic findings and confirm the plan for withholding the suspected drug and maintaining safe seizure treatment under specialist direction.',
  alternate:'Ongoing adherence and seizure counseling matter after the acute issue is addressed. The immediate follow-up concerns a potentially serious lamotrigine reaction with fever and mucosal lesions.',
 },
 'SIT-NP5-high-acuity-emergency-situations-01-R2':{
  source:ref.resuscitation,
  assessment:'The adult is in cardiac arrest and the team has confirmed asystole after checking the equipment and tracing. Follow the nonshockable branch of the arrest algorithm.',
  action:'Continue high-quality CPR, obtain IV or IO access as appropriate and give epinephrine promptly under the protocol. Minimize interruptions and identify and treat reversible causes.',
  teaching:'Direct an available staff member to activate emergency help and bring the code equipment. Use specific roles and confirmation so CPR and other tasks continue.',
  outcome:'Verify uninterrupted CPR except for brief designated checks and timely protocol actions. At reassessment look for a rhythm change or return of circulation, and act on the findings.',
  reasoning:'Asystole lacks a shockable rhythm. High-quality CPR and early epinephrine support circulation while the team reassesses the rhythm and treats possible causes.',
  safety:'Defibrillation applies to ventricular fibrillation or pulseless ventricular tachycardia. Repeated shocks for confirmed asystole interrupt the care the patient needs.',
  followUp:'Record the CPR and time-critical actions accomplished so far. At the next indicated rhythm check reassess the rhythm and possible signs of return of circulation. Appropriate CPR alone does not establish recovery.',
  alternate:'ECG and injury evaluation are priorities for a symptomatic electrical exposure with a pulse. In active cardiac arrest with confirmed asystole, the immediate outcome concerns CPR, nonshockable care and reassessment.',
  edits:{
   teaching:{3:['Assign a team member to activate the response and bring the code equipment']},
  },
 },
};

export const neurologyAlternatives={
 'SIT-CROSS-laboratory-values-04-R2:recognition':['Laboratory artifact is possible after a hemolyzed draw and calls for a properly collected repeat sample and assessment. This sample was not hemolyzed and has supporting ECG changes.',potassium],
 'SIT-CROSS-laboratory-values-04-R2:reasoning':['Hemolysis can raise measured potassium and a normal ECG cannot exclude severe hyperkalemia. A credible high result with new ECG changes warrants urgent treatment while additional testing proceeds.',potassium],
 'SIT-CROSS-laboratory-values-02:teaching':['Fluid intake may need adjustment for the cause of a sodium or fluid disorder. Follow the prescribed plan rather than changing intake without review.','https://www.nice.org.uk/guidance/cg174/chapter/Recommendations'],
 'SIT-CROSS-laboratory-values-03:outcome':['For warfarin-related bleeding, assess hemostasis and follow INR as indicated by the reversal and subsequent anticoagulation plan.',anticoagulation],
 'SIT-NP2-pediatric-respiratory-disorders-02-R2:reasoning':['For pancreatic insufficiency in cystic fibrosis, prescribed enzymes are timed with food to aid digestion. Adjust the regimen with the specialist team.','https://www.cff.org/medical-professionals/pancreatic-enzymes-clinical-care-guidelines'],
 'SIT-NP2-pediatric-neurologic-disorders-03:recognition':['An open myelomeningocele requires protection of exposed neural tissue from drying, pressure and contamination.',neuralTube],
 'SIT-NP2-pediatric-neurologic-disorders-03:action':['Protect exposed neural tissue with the prescribed dressing and position to avoid pressure while arranging neonatal and neurosurgical care.',neuralTube],
 'SIT-NP2-pediatric-neurologic-disorders-03:teaching':['Teach caregivers to avoid pressure on the exposed lesion and follow the neonatal team’s handling instructions until definitive care.',neuralTube],
 'SIT-NP2-pediatric-neurologic-disorders-03:outcome':['Maintaining protection of exposed tissue is appropriate while waiting for surgery for an open myelomeningocele.',neuralTube],
 'SIT-NP2-pediatric-neurologic-disorders-04-R2:recognition':['Arrange formal audiology after bacterial meningitis once the child is fit to test, as directed in the follow-up plan.','https://www.nice.org.uk/guidance/NG240/chapter/recommendations'],
 'SIT-NP4-increased-intracranial-pressure-iicp-02:reasoning':['Maintain prescribed head and neck alignment in appropriate patients with raised intracranial pressure to help venous drainage. This cannot replace immediate assessment of irregular breathing and worsening consciousness.',neurological],
 'SIT-NP4-increased-intracranial-pressure-iicp-03:recognition':['Consider inadequate oxygenation and procedural stimulation when changes occur during suctioning. There is no documented suction episode causing this new deterioration.',neurological],
 'SIT-NP4-increased-intracranial-pressure-iicp-01-R2:recognition':['A measured cerebral perfusion pressure below the prescribed target needs review and management. There is no current pressure measurement to explain the acute change.',cerebralPerfusion],
 'SIT-NP4-increased-intracranial-pressure-iicp-01-R2:teaching':['Arterial and intracranial pressures help the team evaluate cerebral perfusion when those values are measured. This instruction applies to discussing monitoring and does not substitute for reporting new symptoms.',cerebralPerfusion],
 'SIT-NP4-increased-intracranial-pressure-iicp-01-R2:outcome':['Reassessment against the individualized pressure target applies when a low cerebral perfusion pressure has been measured.',cerebralPerfusion],
};

export const additionalDirectCases={
 'EXP2-NP4-seizure-disorders':{source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11175651/',reasons:[
  'Arrange prompt specialist review before conception. Valproate has important fetal risks, and a supervised change, if feasible, must also protect seizure control. Avoid abrupt cessation and discuss the preconception plan with the specialist.',
  'Withholding a medicine may be needed for an acute serious drug reaction under urgent clinical guidance. Pregnancy planning alone does not make sudden valproate withdrawal safe because seizures may recur.',
  'Continued treatment can be appropriate while specialist review is arranged. Antiseizure medicines differ in fetal risk, so continuing without discussing pregnancy would miss a chance to plan.',
  'An immediate referral is also important after a positive pregnancy test. Preconception review gives the team time to consider an appropriate alternative and assess seizure control before pregnancy.',
 ]},
 'EXP2-NP2-complications-during-pregnancy':{source:'https://www.cuh.nhs.uk/patient-information/-guidance-on-the-use-of-routine-antenatal-anti-d-prophylaxis-raadp-and-postnatal-care-for-rhd-negative-women/',reasons:[
  'Vaginal bleeding still needs a separate assessment and treatment directed at its cause. Anti-D prophylaxis acts on the sensitization risk, without treating the source of bleeding.',
  'Anti-D immunoglobulin reduces the chance that an unsensitized RhD-negative patient will form antibodies after exposure to fetal RhD-positive cells. The clinician has assessed this bleeding episode as one requiring prophylaxis.',
  'Once immune anti-D is already present, obstetric and fetal monitoring may be indicated. Prophylactic anti-D cannot undo established sensitization.',
  'Fetal anemia from existing maternal red-cell antibodies requires specialist assessment and may need separate treatment. Prophylaxis reduces the chance of sensitization before that complication develops.',
 ]},
 'EXP2-NP2-normal-puerperium':{source:'https://openstax.org/books/maternal-newborn-nursing/pages/20-1-physiologic-changes-during-the-postpartum-period',reasons:[
  'Nipple stimulation releases oxytocin, which can cause uterine afterpains as the uterus shrinks. Brief feed-related cramps with stable vital signs and a firm fundus fit that response.',
  'Severe persistent pain with deterioration can warrant urgent assessment for an obstetric emergency. Brief uterine contractions during breastfeeding are an expected part of involution in this stable case.',
  'Persistent heavy bleeding, fever or poor involution can prompt evaluation for retained tissue. Brief cramps linked to feeding with stable bleeding and a firm fundus do not establish that diagnosis.',
  'Assess for a full bladder when there is difficulty voiding, suprapubic fullness or fundal displacement. The firm fundus and timing with breastfeeding point instead to afterpains.',
 ]},
 'EXP2-NP2-postpartum-complications':{source:'https://www.bfmed.org/assets/ABM%20Protocol%20%2336.pdf',reasons:[
  'A feeding plan may need temporary adjustment for pain or an individual clinical indication. Mastitis usually does not require permanent cessation of feeding or expression.',
  'Arrange assessment of the localized inflammation and systemic signs. Support feeding as tolerated or expression only as appropriate to usual needs or comfort, and tailor further care to the clinical course.',
  'Expression may help when a feed is missed or to relieve discomfort. Pumping to empty after every feed can increase milk production and worsen swelling and inflammation.',
  'Gentle touch may be used for comfort or with a clinician’s guidance. Forceful deep massage can injure tissue and worsen inflammation.',
 ]},
 'ORIG-NP4-other-eye-conditions-surgery-care-01':{source:'https://www.nhs.uk/conditions/eye-injuries/',reasons:[
  'A clean cloth can blot skin away from the eye if needed. Rubbing the globe after a chemical splash can cause more injury and delays dilution.',
  'Protecting an eye from manipulation while waiting for help applies to some penetrating injuries. For a nonpenetrating chemical splash, irrigate immediately even if symptoms seem mild.',
  'Start copious irrigation with clean non-hot water immediately, holding the lids open with gentle flow if possible. Continue rinsing while emergency advice or assessment is arranged.',
  'Specific decontamination advice can depend on the product and belongs with the treating team. Adding a household chemical can cause additional injury. Use abundant clean water right away.',
 ]},
};
