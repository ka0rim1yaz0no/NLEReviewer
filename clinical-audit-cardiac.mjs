import {references as ref} from './clinical-audit-references.mjs';

const bls='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support';
const cardioversion='https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-Electrical-Cardioversion-250514.pdf';
const monitoring='https://www.ahajournals.org/doi/pdf/10.1161/CIR.0000000000000527';
const rhythm='https://www.ahajournals.org/doi/10.1161/CIR.0000000000000628';
const acs='https://www.ahajournals.org/doi/10.1161/CIR.0000000000001309';
const heartWarning='https://www.heart.org/health-topics/heart-attack/warning-signs-of-a-heart-attack';
const congestion='https://www.nice.org.uk/guidance/cg187/chapter/recommendations';
const weight='https://www.heart.org/en/health-topics/heart-failure/living-with-heart-failure-and-managing-advanced-hf/physical-changes-to-report-for-heart-failure';
const digoxin='https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=e61d2108-d871-44c0-b12a-2e61fbb56967&type=display';
const warfarin='https://www.nhs.uk/medicines/warfarin/';
const vitaminK='https://www.cuh.nhs.uk/patient-information/dietary-advice-for-patients-taking-warfarin/';
const dvt='https://www.nice.org.uk/guidance/NG158/chapter/recommendations';
const sepsis='https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026';
const readiness='https://www.resus.org.uk/library/quality-standards-cpr/acute-care-equipment-and-drug-lists';
const aortic='https://professional.heart.org/en/-/media/PHD-Files-2/Science-News/2/2022/2022-Aortic-Disease-Guideline-Slide-Set.pdf';
const perfusion='https://openstax.org/books/medical-surgical-nursing/pages/11-1-concepts-of-oxygenation-and-perfusion';
const radial='https://www.dchft.nhs.uk/wp-content/uploads/2024/06/Discharge-Advice-following-Radial-Percutaneous-Coronary-Intervention-June-2024.pdf';
const shock='https://www.acc.org/Latest-in-Cardiology/Journal-Scans/2025/03/17/18/39/ACCs-First-Concise-Clinical-Guidance-Focuses-on-Evaluation-and-Management-of-Cardiogenic-Shock';

export const cardiacLegacyCases={
 'NP3-068':{
  source:acs,
  scenario:'An adult reports 25 minutes of pressure across the center of the chest at rest, radiating to the left arm, with new sweating. The discomfort is ongoing at triage.',
  decisions:{
   1:{0:[null,'Persistent central pressure at rest with radiation and diaphoresis raises concern for acute coronary syndrome. Obtain emergency evaluation while considering other dangerous causes of acute chest pain.']},
   2:{2:['Activate the chest-pain pathway and facilitate a prompt 12-lead ECG','Obtain a 12-lead ECG promptly, with a goal of 10 minutes from presentation under the pathway. Reassess vitals and symptoms and prepare for serial testing if the first tracing is nondiagnostic.']},
   3:{0:[null,'Call emergency services for suspected heart attack symptoms rather than waiting to see if they pass or driving oneself. Report the onset, duration and associated symptoms.',heartWarning],
    1:['Monitor one-sided calf swelling at home and leave out the current chest symptoms when seeking advice','Calf swelling can be relevant to a venous clot assessment. It cannot substitute for reporting current prolonged chest pressure with diaphoresis and obtaining emergency care.',dvt]},
   4:{3:[null,'Confirm timely ECG and clinical assessment, completion of indicated serial testing and evaluation or treatment of ischemia. Symptom relief alone cannot exclude acute coronary syndrome.']},
   5:{0:[null,'Watchful waiting can fit selected stable symptoms after clinical assessment. Prolonged pressure at rest with sweating now warrants urgent assessment and ECG.'],
    2:[null,'Prompt emergency help for prolonged or recurrent pressure is appropriate. An episode can be serious even before a diagnostic ECG or troponin result.',heartWarning]},
  },
 },
 'NP3-069':{
  source:congestion,
  scenario:'A hospitalized patient with known heart failure has worsening shortness of breath when lying down, increasing bilateral crackles and a lower oxygen saturation than before. The patient is awake and can sit upright.',
  decisions:{
   1:{3:[null,'New orthopnea and increasing crackles support pulmonary congestion, especially with a decrease in oxygen saturation. Assess respiratory status promptly and escalate clinical deterioration.']},
   2:{0:[null,'Position upright if tolerated, assess work of breathing and oxygenation, and escalate the change. Give indicated oxygen or respiratory support and coordinate ordered treatment while reassessing.'],
    2:['Schedule evaluation of isolated unilateral calf swelling and defer the bedside respiratory assessment','Suspected DVT merits prompt assessment when a new unilateral swollen calf is present. Worsening dyspnea and declining oxygenation require immediate bedside assessment now.',dvt]},
   3:{1:[null,'Measure weight consistently and report the gain specified in the individualized plan, new dyspnea or the need for more pillows. Severe symptoms require immediate help.',weight]},
   4:{2:[null,'Assess breathing effort, oxygenation and congestion after therapy. Improving symptoms and lung findings are meaningful alongside blood pressure, urine output and renal monitoring as indicated.']},
   5:{1:[null,'Daily weights and early reporting are appropriate for recognizing fluid accumulation. Continue providing individualized thresholds and contact instructions.',weight],
    3:[null,'Intake goals depend on clinical status and orders. Encouraging unrestricted fluids in a congested patient with a prescribed restriction can worsen overload. Clarify the plan before changing it.']},
  },
 },
 'NP3-070':{
  source:digoxin,
  scenario:'An adult taking scheduled digoxin develops new nausea, yellow-green visual halos and a pulse of 46/min. The next dose is due. There is no current chest discomfort or dyspnea.',
  decisions:{
   1:{0:[null,'Nausea, altered color vision and bradycardia during digoxin use raise concern for toxicity. Check rhythm and clinical stability promptly and obtain the indicated laboratory assessment.']},
   2:{1:['Treat the symptoms as a chest-pain presentation while continuing the scheduled digoxin','Acute chest pressure can warrant a prompt ECG and coronary evaluation. Here digoxin exposure with visual changes and bradycardia calls for a prompt ECG, toxicity assessment and withholding the dose pending review.',acs],
    3:['Hold the scheduled digoxin, obtain urgent clinical review and prepare for ECG and laboratory assessment','Do not give the next dose during suspected toxicity without review. Assess perfusion and rhythm, and obtain indicated digoxin, renal and electrolyte tests. Report the timing of the dose for interpreting the level.']},
   3:{2:[null,'Teach the patient to report new nausea, vomiting, visual changes, an unusually slow pulse or faintness promptly. Follow individualized dosing and monitoring instructions.']},
   4:{1:[null,'Improving symptoms and stable rhythm support recovery. Review kidney function, electrolytes and digoxin levels when appropriate for the time since the last dose. Do not judge recovery from one number alone.']},
   5:{0:[null,'A missed dose should be managed using the medicine-specific instructions. Taking two doses together can raise exposure and is unsafe with current symptoms of possible toxicity.'],
    1:[null,'Withholding the scheduled dose with prompt rhythm and prescriber review is appropriate in this symptomatic patient. Use the prescribed toxicity protocol.']},
  },
 },
 'NP3-071':{
  source:warfarin,
  scenario:'An adult who recently began warfarin notices unusual bruises and longer bleeding after brushing the teeth. The bleeding has stopped. The patient asks about food and follow-up.',
  decisions:{
   1:{1:[null,'New bruising and prolonged minor bleeding during warfarin therapy warrant assessment, including bleeding severity, medication changes and recent INR. Ask about symptoms of more serious bleeding.']},
   2:{0:['Arrange assessment limited to possible leg thrombosis without checking bleeding or INR','Suspected DVT may need urgent assessment and ultrasound. This case instead supplies bleeding after starting warfarin, which needs review of severity, interacting factors and INR.',dvt],
    2:[null,'Assess the site and severity and look for other sources of bleeding, acute symptoms, medicine changes and the anticoagulation plan. Arrange the indicated INR testing and clinical review.']},
   3:{0:['Report only sudden breathlessness or chest pain and omit unusual bleeding','Sudden breathlessness or chest pain can indicate an emergency such as PE. A patient taking warfarin also needs to report abnormal bleeding, bruises or other medication concerns promptly.',dvt],
    3:[null,'Maintain a consistent intake of vitamin K foods and consult the anticoagulation team before major changes. Take the prescribed dose, attend INR checks and report abnormal bleeding.',vitaminK]},
   4:{0:[null,'A monitored INR in the patient-specific range and absence of clinically important bleeding support a suitable plan. Continue monitoring as advised because risk and dose requirements can change.']},
   5:{0:[null,'Assessing bleeding and checking the INR under the care plan are appropriate now. Report significant active bleeding or instability as an emergency.'],
    2:[null,'Vitamin K intake affects warfarin response. Aim for consistency and review major diet changes with the care team. Eliminating all vegetables is unnecessary.',vitaminK]},
  },
 },
 'NP3-072':{
  source:dvt,
  scenario:'After prolonged immobility, an adult develops a newly swollen, warm and painful calf on one side. The other leg is unchanged. The patient denies new chest pain and breathlessness.',
  decisions:{
   1:{0:[null,'New unilateral painful swelling after immobility raises concern for deep vein thrombosis. Use the clinical assessment and indicated diagnostic pathway before drawing a conclusion.']},
   2:{2:['Escalate for prompt DVT assessment and prepare for probability-based testing','Notify the team and support the DVT pathway using clinical probability, D-dimer and leg ultrasound as indicated. If indicated testing is delayed, follow the prescribed interim anticoagulation plan.'],
    3:['Limit the assessment to an acute coronary ECG pathway without evaluating the swollen leg','An acute chest-pain pathway applies to possible coronary ischemia. The patient has new unilateral calf findings and no chest symptoms, so the suspected DVT needs its own prompt evaluation.',acs]},
   3:{0:[null,'Sudden breathlessness, pleuritic chest pain, coughing blood or faintness can indicate PE and require urgent emergency assessment. Explain who to call if symptoms develop.'],
    3:['Report persistent central chest pressure only and wait to report sudden unexplained breathlessness','Persistent chest pressure needs urgent cardiac evaluation. Sudden dyspnea after a possible DVT also needs immediate evaluation for PE, including when chest pain is absent.']},
   4:{3:[null,'Improving local symptoms without new cardiopulmonary symptoms can support response after evaluation and treatment. Follow the anticoagulation or follow-up plan because local improvement alone cannot exclude a clot.']},
   5:{0:[null,'Massage may be used for selected muscular complaints after assessment. Here the cause could be DVT. Do not use massage to treat or triage it, and arrange prompt clinical assessment.'],
    1:[null,'Prompt clinical evaluation and indicated imaging are appropriate for new unilateral painful swelling after immobility. Continue observing for symptoms suggesting PE.']},
  },
 },
};

export const cardiacCases={
 'SIT-NP3-heart-anatomy-ecg-basics-01':{
  source:ref.resuscitation,
  scenario:'An adult has an ECG and palpable pulse rate of 38/min, a pressure of 76/42 mm Hg and new confusion. Breathing is present.',
  assessment:'The verified slow pulse with hypotension and confusion indicates symptomatic bradycardia and impaired perfusion. The findings warrant an urgent bradycardia response.',
  action:'Activate the emergency team, support airway and breathing, monitor rhythm and perfusion and obtain IV access. Prepare protocol-directed treatment for persistent unstable bradycardia while assessing causes.',
  teaching:'Call staff promptly for faintness, weakness or confusion with an unusually slow pulse. During current instability, the team should assess immediately rather than relying on patient reporting.',
  outcome:'Verify that bradycardia-related poor perfusion was addressed. Recheck rate and rhythm, blood pressure, mental status and response to the specific treatment.',
  reasoning:'Bradycardia may be tolerated in some people. A verified rate of 38/min with hypotension and acute confusion indicates clinically important hypoperfusion.',
  safety:'Observation can be appropriate for stable, asymptomatic bradycardia after assessment. The current hypotension and confusion make a wait-only approach unsafe.',
  followUp:'Reassess rate, rhythm, pressure and responsiveness after the intervention. A monitor having been applied does not demonstrate improvement.',
  alternate:'Rhythm and hemodynamic stabilization should be tracked in both arrhythmias. The plan here specifically follows correction of the verified slow rate and signs of poor perfusion.',
  edits:{
   action:{2:['Correct possible electrode artifact and wait even though the palpable pulse is 38/min','Restoring a loose electrode is appropriate when artifact is suspected. Here the slow pulse was confirmed and is accompanied by hypotension and confusion. Emergency assessment cannot wait.',monitoring]},
   planning:{0:['The rapid ventricular rate slows after treatment of an unstable tachyarrhythmia','This would fit a monitored tachyarrhythmia with a fast rate. Here stabilization depends on assessing and treating the slow pulse and compromised perfusion.']},
   teaching:{0:['Use a palpitations log and report only a fast pulse while ignoring new faintness at a low rate','A diary can support follow-up for stable intermittent palpitations. Faintness with verified bradycardia and hypotension calls for reporting and urgent assessment now.']},
  },
 },
 'SIT-NP3-heart-anatomy-ecg-basics-02':{
  source:ref.resuscitation,
  scenario:'An adult reports palpitations and ischemic chest discomfort. The monitor shows an irregular narrow-complex rhythm at 168/min, the palpable pulse is rapid and the pressure is 78/46 mm Hg.',
  assessment:'A confirmed rapid rhythm with hypotension and ischemic symptoms indicates an unstable tachyarrhythmia. Assess whether the rhythm is causing the instability and activate emergency treatment.',
  action:'Activate urgent help, assess rhythm and perfusion, and prepare the trained team for synchronized cardioversion when instability is due to the tachyarrhythmia. Do not delay indicated treatment for routine tests.',
  teaching:'Report palpitations with chest discomfort, faintness or worsening breathlessness immediately. These can accompany unstable tachyarrhythmia and need urgent assessment.',
  outcome:'After indicated treatment, reassess rhythm, pressure, consciousness and ischemic symptoms. Document response and monitor for recurrence or deterioration.',
  reasoning:'An irregular rhythm can be chronic, but marked tachycardia with new hypotension or ischemic discomfort can impair perfusion and requires urgent evaluation and treatment.',
  safety:'A known stable arrhythmia may be reviewed on its usual schedule. Persistent pain and low pressure with a fast rhythm call for an immediate response even when a rhythm looks familiar.',
  followUp:'Record the intervention and the first rhythm and perfusion findings. Repeat checks and document whether chest discomfort or the rapid rhythm recurs.',
  alternate:'A bradycardia plan fits a verified slow pulse with poor perfusion. This case calls for following the response to treatment of an unstable fast rhythm.',
  edits:{
   recognition:{3:['Suspected coronary ischemia as the only priority, without evaluating the documented rapid rhythm','Coronary ischemia is important to assess when chest discomfort occurs. In this case the confirmed rapid rhythm with hypotension also requires immediate evaluation and rhythm-specific treatment.',acs]},
   planning:{0:['A rate of 38/min is corrected under the unstable bradycardia pathway','That outcome applies to a documented slow pulse with impaired perfusion. This patient needs reassessment after treatment for a rapid unstable rhythm.']},
  },
 },
 'SIT-NP3-heart-anatomy-ecg-basics-03':{
  source:ref.resuscitation,
  scenario:'An adult is unresponsive and gasping. A trained clinician finds no definite pulse on a rapid check, and the connected monitor shows ventricular fibrillation.',
  assessment:'Unresponsiveness, abnormal breathing and no definite pulse indicate cardiac arrest. The verified ventricular fibrillation is a shockable rhythm.',
  action:'Activate the arrest team, start high-quality CPR and deliver prompt defibrillation when the defibrillator is ready. Resume compressions immediately after the shock and follow the rhythm protocol.',
  teaching:['Call for help and get the AED for a person who is unresponsive and not breathing normally. Trained staff assess briefly for a pulse and start CPR if no definite pulse is felt.',bls],
  outcome:'Verify timely compressions and shock delivery with minimal interruption. Reassess rhythm and signs of circulation at designated checks and continue appropriate treatment.',
  reasoning:'Ventricular fibrillation does not produce effective circulation. Defibrillation can terminate this rhythm, and compressions support perfusion while the defibrillator is prepared or between checks.',
  safety:'Saving a tracing can aid documentation when immediate care is underway. Do not delay CPR or a shock for printing or reviewing a strip once cardiac arrest and ventricular fibrillation are established.',
  followUp:'Confirm how quickly compressions and shock were delivered. Continue resuscitation and document the next rhythm and any return of circulation when assessed under the algorithm.',
  alternate:'Rhythm and perfusion response also matter after treating an unstable tachyarrhythmia with a pulse. In VF arrest, the plan must follow compressions, defibrillation and the next arrest rhythm or circulation check.',
  edits:{
   recognition:{3:['A lead-related alarm in a responsive adult whose regular pulse has been confirmed','With a responsive patient and a confirmed pulse, check electrodes and trace for artifact. No definite pulse and abnormal breathing in this case indicate arrest.',monitoring]},
   action:{0:['Repair or replace the leads before beginning chest compressions','Correcting a lead fault can restore a reliable tracing and can occur during the team response. Here cardiac arrest has been identified clinically, so start CPR without waiting.',bls]},
   planning:{2:['A fast pulse and pressure stabilize after synchronized cardioversion for a pulse-present rhythm','That is a response to cardioversion of selected tachyarrhythmias with circulation. This patient is pulseless in VF and needs reassessment under the arrest pathway.']},
  },
 },
 'SIT-NP3-heart-anatomy-ecg-basics-04':{
  source:monitoring,
  scenario:'Telemetry reports ventricular tachycardia at 180/min. At the bedside, the client is alert and comfortable with a regular pulse of 78/min and stable pressure. One electrode is partly detached.',
  assessment:'The rate on telemetry differs greatly from the verified pulse and there is a loose electrode. Artifact is likely, and the bedside findings and corrected tracing need confirmation.',
  action:'Assess the client and palpate the pulse, then correct lead contact and check the tracing in another lead or by 12-lead ECG if it remains uncertain. Escalate any verified rhythm abnormality or deterioration.',
  teaching:'Report symptoms and any detached electrodes. Remain available for bedside reassessment when a monitor alarm occurs so the team can compare findings with the tracing.',
  outcome:'Document the confirmed pulse, symptoms and pressure and the restored interpretable rhythm. Verify whether the corrected tracing matches the clinical findings.',
  reasoning:'Loose or poorly attached electrodes can create motion or contact artifact that looks like an arrhythmia. Verify patient status and signal quality before treating the strip as an actual rhythm.',
  safety:'Emergency rhythm medicines may apply to a verified arrhythmia when clinically indicated. Giving them for a poorly reproduced strip in a symptom-free patient with a much slower regular pulse can cause harm.',
  evaluation:[
   'An interpretable tracing satisfies the equipment part of the target. Confirm the patient’s symptoms, pulse and hemodynamic findings before closing the full goal.',
   'Record that a reliable trace was restored. Verify and record bedside pulse, symptoms and pressure, and compare them with the corrected rhythm.',
   'An unmet target requires information showing a required result failed. One finding was documented and patient confirmation is still unknown. Complete the bedside assessment.',
   'A combined entry is fine if both findings are already available. Record the verified tracing now so the next team knows which patient assessment is still needed.',
  ],
  edits:{
   recognition:{2:['An irregular palpable pulse that persists after telemetry contact is corrected','A confirmed irregular pulse requires direct rhythm assessment. The pulse is regular at 78/min here, and a detached electrode can explain the monitor discrepancy.']},
   action:{2:['Give emergency rhythm treatment based on the alarm without confirming the patient’s actual rate','Rhythm treatment is appropriate for a confirmed arrhythmia when indicated. The observed pulse and monitor disagree, so bedside verification and lead correction come first.']},
  },
 },
 'SIT-NP3-acute-coronary-syndrome-acs-02':{
  source:acs,
  scenario:'In the emergency department, a patient still has pressure-like chest discomfort after an initial nondiagnostic 12-lead ECG. The first high-sensitivity troponin was drawn shortly after symptoms began. The patient asks to leave.',
  assessment:'Persistent symptoms can reflect acute ischemia despite a nondiagnostic initial ECG or early troponin. Reassess and continue the established acute chest-pain pathway.',
  action:'Reassess symptoms and vitals, obtain serial ECGs and high-sensitivity troponin measurements as indicated, and inform the team of ongoing symptoms. Explain the reason before disposition.',
  teaching:'Report continuing or recurrent pressure, breathlessness or sudden sweating immediately. Explain that serial tests may detect findings that were absent early.',
  outcome:'Confirm timely repeat evaluation and document symptoms, serial ECG and troponin findings and the risk-based disposition plan. Assess unresolved pain rather than relying on one test.',
  reasoning:'Changes in ischemia and myocardial injury can become detectable over time. Persistent symptoms after an initial nondiagnostic result warrant serial assessment.',
  safety:'Some low-risk patients can be discharged after an appropriate pathway and documented follow-up. One nondiagnostic ECG while pressure continues cannot exclude all acute coronary events.',
  followUp:'Record the completed serial assessments and confirm what remains due. Reassess for ongoing pain or deterioration and verify that disposition reflects the full findings.',
  alternate:'Medication interaction checks are important before a nitrate. This handoff concerns ongoing ischemic symptoms after a nondiagnostic first test, so follow serial assessments and disposition criteria.',
 },
 'SIT-NP3-acute-coronary-syndrome-acs-03':{
  source:acs,
  scenario:'An adult with ongoing suspected ischemic chest pain has a systolic pressure of 86 mm Hg and reports taking sildenafil four hours ago. A nitroglycerin dose is due under the chest-pain order set.',
  assessment:'Hypotension and recent sildenafil both make the planned nitrate unsafe. The active chest pain still requires urgent evaluation and a safe alternative plan.',
  action:'Withhold the nitrate under protocol and urgently report current pressure, ongoing pain and sildenafil timing. Continue the acute chest-pain assessment and assist with alternative treatment as ordered.',
  teaching:'Tell the team about recent PDE5 inhibitors and the exact time taken, including medications used for erectile dysfunction or pulmonary hypertension. Report faintness and chest symptoms promptly.',
  outcome:'Confirm that the unsafe dose was avoided, pressure and symptoms were reassessed and the acute team selected a plan appropriate to both the patient’s condition and the interaction.',
  reasoning:'A nitrate can add to the blood-pressure-lowering effect of recent sildenafil. The combination within 24 hours and systolic pressure below 90 mm Hg are independent reasons to hold it and escalate.',
  safety:'Nitrates can relieve ischemic discomfort in selected patients with acceptable hemodynamics and no contraindication. This client has both hypotension and recent sildenafil exposure.',
  followUp:'Document the dose hold, timing of sildenafil and clinical notification. Recheck pain, pressure and the orders for an alternative treatment rather than assuming pain resolved.',
  alternate:'Cardiac rehabilitation addresses recovery after stabilization. This evaluation concerns the immediate nitrate contraindication and the ongoing chest-pain response.',
 },
 'SIT-NP3-acute-coronary-syndrome-acs-04':{
  source:acs,
  scenario:'After treatment for myocardial infarction, a stable adult is being evaluated for discharge. There has been no recurrent pain or circulatory instability. The patient says complete bed rest for several months is the safest recovery plan.',
  assessment:'The client needs an assessed rehabilitation and secondary prevention plan. Stability supports a discussion of graded activity rather than months of self-imposed bed rest.',
  action:'Arrange referral to cardiac rehabilitation and discuss the individualized activity plan, precautions and follow-up before discharge. Confirm any temporary restrictions from the treating team.',
  teaching:'Follow the graded activity plan and discuss new chest discomfort, shortness of breath or faintness promptly. Check the safe activity level with the rehabilitation team as needed.',
  outcome:'Verify that the patient understands safe activity, when to seek help and how to access rehabilitation. Next assess actual participation and risk-reduction measures.',
  reasoning:'Cardiac rehabilitation combines prescribed activity with education and risk reduction after an acute coronary event once clinically appropriate. Extended inactivity without evaluation can hinder recovery.',
  safety:'Temporary rest may be needed during active instability or because of procedural restrictions. Indefinite rest for this stable patient bypasses assessment and rehabilitation.',
  followUp:'Document what the patient can explain and any activity already tolerated. Check rehabilitation referral completion, barriers and participation at the next contact.',
  alternate:'A medication-interaction check applies during a nitrate decision for ongoing pain. This stable patient needs follow-up of rehabilitation and secondary prevention.',
  edits:{
   teaching:{1:['Use repeated urgent ECGs for active recurrent chest pressure as the complete discharge activity plan','Recurrent ischemic symptoms would need urgent reassessment and serial testing as indicated. The stated need is a rehabilitation plan for a stable patient and includes activity guidance and return precautions.']},
  },
 },
 'SIT-NP5-multi-system-problems-shock-sepsis-01':{
  source:sepsis,
  scenario:'An adult with suspected infection has persistent hypotension, new confusion and a rising lactate after initial evaluation. There is no clear source yet. The nurse recognizes impaired perfusion.',
  assessment:'Suspected infection plus acute hypoperfusion and altered mentation requires urgent assessment for sepsis-related shock. Do not wait for microbiologic proof or a completed diagnostic definition before escalating.',
  action:'Activate the sepsis response. Obtain blood cultures promptly if this does not delay treatment and support immediate prescribed antimicrobials and monitored resuscitation. Reassess fluid response and prepare indicated vasopressors.',
  teaching:'Seek urgent help for new confusion, fainting, severe breathlessness or rapidly worsening illness during suspected infection. Recovery or temporary reduction of fever does not establish safe circulation.',
  outcome:'Trend pressure, capillary refill, mental status, urine output and lactate in context after treatment. These measures help show whether organ perfusion is improving.',
  reasoning:'Hypotension and signs of organ hypoperfusion during infection can progress quickly. Prompt antimicrobials and individualized resuscitation address time-sensitive risk while the source is evaluated.',
  safety:'Cultures help direct antibiotics and should be collected promptly when possible. Waiting for identification before escalation or treatment of possible septic shock delays urgent care.',
  followUp:'Document antimicrobial and resuscitation timing, then reassess circulation and organ function using serial bedside findings and lactate when indicated.',
  alternate:'Antibiotic start time is an important process measure. It provides no direct evidence that tissue perfusion recovered. Reassess pressure, capillary refill, alertness, urine output and appropriate laboratory trends.',
  edits:{
   action:{0:[null,'Taking cultures is appropriate before antimicrobials when it can be done promptly. Waiting for the organism’s identity delays urgent antimicrobial treatment and resuscitation in suspected septic shock.']},
   planning:{1:[null,'Temperature can help monitor infection and response to an antipyretic. A lower reading cannot show whether the patient’s circulation and organ perfusion have improved.']},
  },
 },
 'SIT-NP5-multi-system-problems-shock-sepsis-03':{
  source:shock,
  scenario:'After an acute myocardial infarction, a client has a pressure of 78/46 mm Hg, cool extremities, worsening dyspnea, bilateral crackles and decreasing urine output.',
  assessment:'Hypotension and signs of hypoperfusion with pulmonary congestion after myocardial infarction suggest cardiogenic shock. Urgent assessment should also look for other causes and myocardial infarction complications.',
  action:'Activate the cardiac shock response, support airway and oxygenation as indicated, and monitor circulation closely. Prepare for urgent ECG and bedside cardiac assessment and ordered circulatory support.',
  teaching:'Alert the team immediately for recurrent chest discomfort, worsening breathlessness or faintness after infarction. Later review the plan for obtaining emergency help if symptoms recur.',
  outcome:'Reassess perfusion, pressure, urine output, mental status and respiratory congestion after treatment. Confirm urgent evaluation of the cause and response to prescribed support.',
  reasoning:'Reduced cardiac output can produce cool extremities and oliguria while elevated filling pressures cause pulmonary congestion. Treatment depends on the cause and monitored response.',
  safety:'Some shock states respond to fluid when there is evidence of volume loss or fluid responsiveness. With pulmonary congestion and suspected pump failure, an unmonitored large fluid load can worsen breathing.',
  followUp:'Record the emergency cardiac evaluation and circulatory support. Reassess perfusion and oxygenation with serial findings to check whether output and congestion are improving.',
  alternate:'Prompt antimicrobials and source control apply when signs support infection-associated shock. The priority in this vignette is evaluating pump failure and organ perfusion after infarction.',
 },
 'SIT-NP5-critical-care-equipment-03':{
  source:bls,
  assessment:'Unresponsiveness requires immediate bedside assessment for arrest even if an electrode is detached. The displayed flat line alone cannot determine circulation.',
  action:'Call for help, assess breathing and pulse promptly and start CPR if breathing is absent or abnormal and there is no definite pulse within 10 seconds. Have another responder restore leads without delaying patient care.',
  teaching:'Explain that staff check responsiveness, breathing and circulation when a monitor alarms. A lead problem may affect the tracing but cannot explain the patient’s condition without assessment.',
  outcome:'Verify direct findings and document whether CPR was indicated and initiated. Recheck the restored ECG and the patient at the appropriate interval so true arrest is not missed.',
  reasoning:'A detached electrode can produce an apparent flat line. Clinical unresponsiveness needs an immediate breathing and pulse check to determine whether to start resuscitation.',
  safety:'Fixing a lead promptly is appropriate when a patient is confirmed responsive or others are already assessing and treating them. Do not spend minutes troubleshooting before checking this patient.',
  followUp:'Record what breathing and pulse checks showed, which treatment was started and whether the restored tracing agreed with the clinical findings. Reassess circulation under the appropriate pathway.',
  alternate:'Resolving a pump occlusion concerns infusion pressure and safe delivery. This handoff needs verification of responsiveness, breathing and circulation and whether an arrest response occurred.',
 },
 'SIT-NP5-altered-tissue-perfusion-02-R2':{
  source:cardioversion,
  assessment:'Unstable regular narrow-complex tachycardia with a pulse calls for urgent synchronized cardioversion. Missing R-wave markers mean that synchronization has not yet been verified.',
  action:'Have the trained team promptly correct the synchronization and verify R-wave markers while preparing cardioversion. If synchronization cannot be obtained promptly and the patient becomes critical, follow the guideline’s emergency shock instruction.',
  teaching:'Explain the urgent treatment and sedation plan briefly when feasible. Sedation and explanation should not delay an immediately necessary procedure.',
  outcome:'Confirm the mode, synchronization when used and treatment delivered. At the next check reassess rhythm, pulse, pressure and responsiveness rather than inferring recovery from a shock.',
  reasoning:'For this rhythm, synchronizing with the R wave reduces the risk of delivering energy during ventricular repolarization. Critical deterioration with delayed synchronization is an emergency exception under the trained protocol.',
  safety:'Unsynchronized shocks are appropriate in specific settings such as VF, pulseless VT or critical deterioration if synchronization delays treatment. That does not make an unsynchronized shock equivalent for every pulse-present rhythm.',
  followUp:'Record the delivered treatment and settings. Recheck rhythm and perfusion and continue the prescribed monitoring. If another synchronized shock is needed, verify synchronization again.',
  alternate:'A normal saturation can coexist with low oxygen content in severe anemia and warrants separate evaluation when anemia is present. This handoff concerns rhythm and perfusion after cardioversion.',
 },
};

export const cardiacAlternatives={
 'SIT-NP3-post-operative-phase-02:reasoning':['New blood loss with circulatory change after surgery may indicate hemorrhage and requires an urgent response. Here the documented slow rhythm and absence of a bleeding cue guide the immediate pathway.','https://openstax.org/books/medical-surgical-nursing/pages/27-4-postoperative-nursing-care-plan'],
 'SIT-NP5-multi-system-problems-shock-sepsis-04-R2:action':['Maintain spinal precautions and coordinate monitored perfusion support in a patient with suspected acute spinal cord injury. Evaluate for hemorrhage and other causes of hypotension.','https://pmc.ncbi.nlm.nih.gov/articles/PMC10964888/'],
 'SIT-CROSS-health-assessment-vital-signs-02:reasoning':['An irregular pulse can produce disagreement between automated and manual readings. Check the pulse and tracing directly to establish the rhythm.',monitoring],
 'SIT-NP3-acute-coronary-syndrome-acs-01-R2:action':['A cool, painful hand after radial access needs prompt neurovascular assessment and review of the access site and compression with the procedure team.',radial],
 'SIT-NP3-acute-coronary-syndrome-acs-01-R2:teaching':['After radial access, new hand pain, numbness, coldness or bleeding calls for prompt advice and assessment.',radial],
 'SIT-NP5-critical-care-equipment-04:recognition':['A failed defibrillator readiness check requires a working replacement and fault reporting before the next emergency.',readiness],
 'SIT-NP5-critical-care-equipment-04:reasoning':['Regular equipment checks identify faults before an arrest. Replace failed equipment promptly and document the service plan.',readiness],
 'SIT-NP5-critical-care-equipment-04:teaching':['Teach the local process for getting backup emergency equipment and reporting a failed readiness check.',readiness],
 'SIT-NP5-critical-care-equipment-01-R2:action':['If a pressure reading changes after repositioning, reassess the patient and relevel the arterial transducer to the prescribed reference before acting on an unverified value.','https://www.lhsc.on.ca/critical-care-trauma-centre/standard-of-care-arterial-line-monitoring'],
 'SIT-NP5-critical-care-equipment-02-R2:outcome':['For an infusion occlusion, verify patency or replacement of the line, appropriate pump settings and safe delivery before assuming the problem is solved.','https://www.fda.gov/medical-devices/infusion-pumps/infusion-pump-risk-reduction-strategies-clinicians'],
 'SIT-NP5-altered-tissue-perfusion-01-R2:action':['Abrupt severe chest or back pain with a new pulse difference can signal acute aortic syndrome. Escalate urgently and describe onset and pulse findings.',aortic],
 'SIT-NP5-altered-tissue-perfusion-01-R2:teaching':['Sudden severe chest or back pain requires emergency assessment, especially with a pulse or perfusion change.',aortic],
 'SIT-NP5-altered-tissue-perfusion-04-R2:reasoning':['Pulse oximetry estimates the fraction of hemoglobin carrying oxygen. It cannot establish oxygen content when the amount of hemoglobin is very low.',perfusion],
 'SIT-NP5-altered-tissue-perfusion-04-R2:outcome':['When symptomatic anemia is severe, assess oxygen delivery, hemodynamic status and the anemia’s cause even when saturation is high.',perfusion],
 'SIT-NP5-altered-elimination-04:recognition':['Feeding intolerance can require assessment for aspiration and gastrointestinal problems, including changes in breathing or elimination.','https://openstax.org/books/medical-surgical-nursing/pages/19-3-parenteral-and-enteral-nutrition'],
 'SIT-NP5-multi-system-problems-shock-sepsis-02-R2:recognition':['After chest trauma, hypotension with signs of impaired filling can indicate obstructive shock from tamponade and needs emergency assessment.',ref.resuscitation],
 'SIT-NP5-multi-system-problems-shock-sepsis-02-R2:reasoning':['Pericardial pressure can limit cardiac filling and cause obstructive shock. Urgent assessment and cause-directed treatment are needed when the findings support tamponade.',ref.resuscitation],
 'SIT-NP5-multi-system-problems-shock-sepsis-02-R2:teaching':['Breathing difficulty, faintness or deteriorating circulation after chest trauma needs urgent assessment for intrathoracic complications.',ref.resuscitation],
};

export const cardiacDirectCases={
 'ORIG-NP3-heart-anatomy-ecg-basics-01':{source:ref.resuscitation,reasons:[
  'A shock treats ventricular fibrillation or pulseless ventricular tachycardia. An organized electrical rhythm without a pulse is treated as pulseless electrical activity, a nonshockable rhythm.',
  'Rescue breathing alone can be appropriate when there is a definite pulse but breathing is absent. This adult has no definite pulse, and the displayed rate does not establish circulation.',
  'Start the emergency response and CPR immediately for pulseless electrical activity. Follow the nonshockable algorithm, including indicated early epinephrine and evaluation for reversible causes.',
  'A 12-lead ECG can help investigate rhythm or ischemia after immediate stabilization. It must not delay compressions after clinical arrest is recognized.',
 ]},
 'EXP2-NP3-heart-anatomy-ecg-basics':{source:rhythm,reasons:[
  'Mobitz I commonly shows progressively longer PR intervals before a P wave fails to conduct. Here the interval is fixed and every P wave conducts.',
  'All P waves conduct to a QRS, and the PR interval is consistently longer than 0.20 seconds. The delay fits first-degree AV block even if the sinus rate varies with breathing.',
  'Mobitz II has intermittent nonconducted P waves with stable PR intervals in conducted beats, under the diagnostic criteria. The strip has no dropped QRS complexes.',
  'Respiratory sinus arrhythmia can explain variation in P-to-P timing. It does not account for the consistently prolonged PR interval, which shows AV conduction delay.',
 ]},
 'EXP2-NP3-acute-coronary-syndrome-acs':{source:acs,reasons:[
  'A fibrinolytic can break down clot fibrin in selected patients under a reperfusion protocol. Aspirin does not directly dissolve an existing coronary clot.',
  'Warfarin reduces synthesis of vitamin K-dependent clotting factors. Aspirin acts on platelets and is used for a different purpose in acute coronary syndrome.',
  'Aspirin inhibits platelet activation and aggregation by reducing thromboxane production. This limits platelet-driven coronary thrombosis after contraindications have been reviewed.',
  'Heparin principally acts through antithrombin to inhibit clotting factors. It may be ordered separately in acute coronary syndrome and does not share aspirin’s platelet mechanism.',
 ]},
 'EXP2-NP5-multi-system-problems-shock-sepsis':{source:sepsis,reasons:[
  'A score can help identify higher-risk patients. A result below a threshold cannot exclude sepsis when infection and signs of organ dysfunction are present.',
  'Repeated observations can help track change. New oliguria and other deterioration call for clinical reassessment now, without waiting for a score to cross a threshold.',
  'The findings used in qSOFA can raise concern individually or together. Sepsis may present before all appear, and other findings such as reduced urine output still matter.',
  'Continue prompt assessment and escalation using the full clinical picture and local sepsis pathway. A low qSOFA score does not rule out sepsis or remove the need to investigate possible organ dysfunction.',
 ]},
};
