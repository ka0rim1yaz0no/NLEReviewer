const lithium='https://sps.nhs.uk/monitorings/lithium-monitoring/';
const haloperidol='https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7d1a9689-23c8-44ef-a474-8c607e13d794';
const serotonin='https://www.medsafe.govt.nz/profs/PUArticles/SerotoninSyndromeToxicityReminder.htm';
const alcohol='https://www.asam.org/docs/default-source/quality-science/the_asam_clinical_practice_guideline_on_alcohol-1.pdf';
const crush='https://sps.nhs.uk/articles/choosing-medicines-formulations-in-swallowing-difficulties/';
const angioedema='https://www.aaem.org/statements/ed-patients-angioedema-secondary/';
const maoi='https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=df892a65-52e4-8eb2-e053-2a95a90aa25f';
const prolongedQt='https://pmc.ncbi.nlm.nih.gov/articles/PMC6702465/';
const movement='https://pmc.ncbi.nlm.nih.gov/articles/PMC11666347/';
const statins='https://www.medsafe.govt.nz/Profs/PUarticles/Statinmyop.htm';
const inhaler='https://www.nhs.uk/medicines/beclometasone-inhalers/side-effects-of-beclometasone-inhalers/';
const kidneys='https://kdigo.org/wp-content/uploads/2026/04/KDIGO-2024-CKD-Guideline.pdf';

export const medicationLegacyCases={
 'NP5-109':{
  source:lithium,
  scenario:'An adult takes maintenance lithium. After two days of vomiting and poor fluid intake, the patient has a new coarse hand tremor and needs help walking because of unsteadiness. The next lithium dose is due.',
  decisions:{
   1:{3:[null,'New gastrointestinal symptoms with coarse tremor and ataxia suggest lithium toxicity, especially after dehydration. Urgent assessment is needed even if a level has not yet returned.']},
   2:{0:['Withhold lithium, obtain urgent clinical review and arrange lithium and renal testing','The signs justify withholding the due dose and seeking urgent evaluation. Check lithium, renal function and electrolytes and follow the clinical course. Do not delay the response for a routine trough sample.'],
    3:['Proceed with the dose and have a routine pharmacist review of a proposed analgesic','Review before adding an interacting analgesic can prevent toxicity in a stable patient. This patient already has signs of toxicity. A routine interaction review cannot replace withholding lithium and urgent assessment.']},
   3:{1:[null,'Maintain adequate fluid intake and avoid abrupt changes in dietary sodium when stable. Report vomiting, diarrhea, coarse tremor and unsteadiness promptly and check any new medicines with the treating team.'],
    3:['Wait until the next scheduled medicine visit to mention the vomiting and new tremor','A routine medicine review helps a stable patient discuss future interactions. Vomiting, tremor and ataxia during lithium therapy require urgent reporting now.']},
   4:{2:['Gait, tremor and hydration improve and lithium and kidney tests are reviewed serially','Follow the neurological and fluid findings along with serial lithium and kidney tests. A single acceptable value alone cannot establish recovery or justify restarting.'],
    3:['An analgesic plan is documented while the new gait changes and lithium level remain unassessed','Review of an analgesic is useful for preventing a prospective interaction. Persistent ataxia and unknown lithium and renal findings leave this suspected toxicity unresolved.']},
   5:{0:[null,'Withholding lithium and obtaining urgent assessment are appropriate because vomiting, coarse tremor and ataxia suggest toxicity. Evaluate renal function and electrolytes with the lithium level.'],
    3:[null,'Usual maintenance dosing applies when treatment remains clinically appropriate. Continuing lithium with vomiting and new ataxia risks worsening toxicity.']},
  },
 },
 'NP5-110':{
  source:haloperidol,
  scenario:'Two days after a haloperidol dose increase, an adult develops a temperature of 40°C, generalized sustained rigidity, confusion, sweating and labile blood pressure. No clonus is elicited.',
  decisions:{
   1:{2:[null,'High fever, generalized rigidity, mental-status change and autonomic instability after a dopamine-blocking drug suggest neuroleptic malignant syndrome. Evaluate and treat urgently while considering other medical causes.']},
   2:{2:['Treat a suspected food–MAOI interaction and continue the recently increased haloperidol','A severe pressure rise after tyramine exposure in a patient on an MAOI needs emergency assessment. The documented exposure here is haloperidol, and continuing it during suspected neuroleptic malignant syndrome is unsafe.',maoi],
    3:['Withhold the suspected antipsychotic, activate emergency care and support vital functions','Stop further exposure to the suspected drug and promptly escalate for stabilization, cooling, hydration and investigation of complications such as rhabdomyolysis or kidney injury.']},
   3:{0:[null,'Report high fever, new widespread stiffness or confusion promptly after an antipsychotic is started or changed. Those findings can signal a serious adverse reaction rather than an expected effect.']},
   4:{0:['Clonus resolves after the serotonergic medicines are held','Clonus is an important feature to reassess in serotonin toxicity. The current case centers on high fever and sustained generalized rigidity after haloperidol rather than resolution of undocumented clonus.',serotonin],
    1:[null,'Improving temperature, rigidity and mental state and stable organ function support a treatment response. Reassess hemodynamics, kidney function and evidence of muscle injury as ordered.']},
   5:{0:[null,'Mild movement symptoms can occur with antipsychotics and still warrant assessment. High fever and generalized rigidity with altered consciousness require withholding the suspected medicine and an emergency response.'],
    3:[null,'Following temperature, rigidity and markers of organ function is appropriate after the emergency response begins. Continue reassessment until the patient is stable.']},
  },
 },
 'NP5-111':{
  source:serotonin,
  scenario:'Within hours of a second serotonergic medicine being added, a patient becomes agitated and sweaty. Examination shows brisk reflexes and inducible ankle clonus. There has been no recent antipsychotic change.',
  decisions:{
   1:{1:[null,'Clonus with hyperreflexia, agitation and diaphoresis after a serotonergic change is strongly suggestive of serotonin toxicity. Escalate for evaluation while reviewing all recent medicines.']},
   2:{0:['Hold the suspected serotonergic medicines and activate urgent supportive assessment','Remove further serotonergic exposure, call for urgent help, and assess airway, circulation, temperature and neuromuscular findings. Worsening hyperthermia or rigidity requires emergency escalation.'],
    1:['Order a lithium level first and continue both serotonergic medicines until it returns','A lithium level is appropriate when symptoms and drug exposure suggest lithium toxicity. Waiting for that result while continuing the implicated medicines delays care for this serotonergic reaction.',lithium]},
   3:{3:[null,'Check all prescribed, over-the-counter and herbal products with the treating team before combining them. Report new clonus, agitation, sweating or fever when a serotonergic medicine changes.']},
   4:{0:[null,'Resolution of clonus with stable temperature, circulation and mental state supports recovery. Continue observation as directed because progression and duration depend on severity and the medicines involved.']},
   5:{1:[null,'Reviewing serotonergic interactions with the care team is appropriate. Include supplements, new prescriptions and nonprescription medicines before they are used together.'],
    2:[null,'A supplement can have its own indications, but an unreviewed serotonergic product can add to toxicity. Suspected toxicity requires urgent assessment and withholding the implicated agents.']},
  },
 },
 'NP5-112':{
  source:alcohol,
  scenario:'An adult with sustained heavy alcohol use stops drinking. Eighteen hours later the patient is tremulous, sweaty, anxious and tachycardic but is alert and can describe symptoms. Staff begin supervised assessment.',
  decisions:{
   1:{0:[null,'Autonomic activation and tremor after abrupt reduction in prolonged heavy alcohol use suggest withdrawal. Assess severity and risk for seizures or delirium while checking for other causes.'],
    3:['New gait ataxia with eye-movement abnormalities and confusion in a nutritionally vulnerable patient','That pattern raises concern for Wernicke encephalopathy and calls for urgent thiamine assessment and treatment. In this case the alert patient has tremor, sweating and tachycardia shortly after stopping alcohol, so withdrawal needs active assessment.']},
   2:{2:[null,'Assess withdrawal symptoms, vitals and risk for progression, using a validated approach when the patient can participate. Follow the monitored protocol. Benzodiazepines are first-line for moderate or severe withdrawal when appropriate.'],
    3:['Review the nutrition and thiamine plan without starting indicated withdrawal monitoring','Thiamine and nutrition are important in this population, especially with malnutrition or severe complications. They can be arranged concurrently and cannot substitute for withdrawal assessment and monitoring.']},
   3:{0:[null,'People with sustained heavy use or prior complicated withdrawal should seek medical guidance before an attempt to stop abruptly. Teach the need for supervision and urgent help for confusion, seizure or rapidly worsening symptoms.'],
    3:['Follow the nutrition plan and use new gait or eye symptoms as the only reason to seek help','Those findings need urgent evaluation for Wernicke encephalopathy. People at risk also need to report withdrawal signs such as worsening tremor, confusion or seizure rather than waiting for gait or eye symptoms.']},
   4:{1:['A supervised plan is written, but vital signs and withdrawal symptoms have not been reassessed','A documented plan is useful before or at the start of treatment. It does not show whether this symptomatic patient is responding. Recheck findings and watch for complications.'],
    3:[null,'Improving autonomic findings and withdrawal symptoms without seizures or confusion support initial response. Continue checks for recurrence or escalation based on severity and time since the last drink.']},
   5:{0:[null,'Monitoring symptoms and vital signs and using protocol-based treatment are appropriate. Escalate when symptoms worsen or the patient can no longer participate in the original assessment.'],
    2:[null,'A carefully selected low-risk patient can sometimes follow a supervised outpatient plan. Severe withdrawal can progress to seizures or delirium and needs close clinical observation and treatment.']},
  },
 },
};

export const medicationCases={
 'SIT-CROSS-pharmacology-core-principles-03':{
  source:crush,
  scenario:'A client who can swallow the prescribed texture of food asks to crush a newly dispensed tablet labeled extended release. The exact product and alternative formulations have not been checked, and renal function is stable.',
  assessment:'The immediate question is whether altering this dosage form changes drug release. Verify the specific product and swallowing requirements before modifying it.',
  action:'Pause administration and check the exact product with the pharmacist or prescriber. If the form cannot be used safely, obtain a prescribed alternative with an appropriate dose and schedule.',
  teaching:'Check with the pharmacist before crushing a modified-release product. Some capsules can be opened under product-specific directions, but any protected pellets must remain intact when required.',
  outcome:'Confirm the approved form, dose, interval and safe administration method. Observe or verify that the client can take it and understands how to continue the revised plan.',
  reasoning:'Crushing can remove a tablet’s release control, exposing the client to too much medicine at once or shortening the intended effect. Product-specific instructions determine whether it can be modified.',
  safety:'Some immediate-release products can be crushed after product-specific verification. Do not crush this long-acting product until its administration instructions and any alternatives are reviewed.',
  followUp:'Record the formulation review and observe whether the approved replacement can be swallowed and provided on the correct schedule. Clarify any incomplete prescription instructions first.',
  alternate:'Alertness and breathing are useful outcomes when monitoring a sedating drug reaction. This handoff concerns whether the replacement dosage form can be administered safely.',
  edits:{
   safety:{2:['Teach the client to check with a pharmacist before crushing a modified-release medicine','Product-specific verification helps prevent dose dumping or loss of the intended effect. Ask the client to demonstrate the agreed method.']},
  },
 },
 'SIT-CROSS-pharmacology-drug-classes-04':{
  source:angioedema,
  scenario:'Shortly after taking a newly prescribed ACE inhibitor, an adult develops progressive tongue swelling and difficulty swallowing. No hives are visible. The client can still speak, but the voice is changing.',
  assessment:'Progressive tongue swelling, difficulty swallowing and voice change indicate possible angioedema with a threatened airway. ACE inhibitor exposure supports the suspected cause, and the airway needs immediate assessment.',
  action:'Activate emergency help and prioritize airway evaluation and stabilization. Hold further ACE inhibitor doses, monitor closely and prepare for skilled airway management.',
  teaching:'Tongue, lip or throat swelling, trouble swallowing or voice change require immediate help. Once stable, teach avoidance of ACE inhibitors if the reaction is confirmed and ensure the reaction is documented.',
  outcome:'Confirm that the airway remains patent or is supported and that the medication reaction has been reviewed and documented before another dose can be given.',
  reasoning:'ACE inhibitor angioedema can progress in the upper airway. The combination of tongue swelling and voice change requires early airway assessment even before severe respiratory distress appears.',
  safety:'Medication rechallenge can be appropriate for selected low-risk situations only after specialist evaluation. A suspected airway-threatening ACE inhibitor reaction is unsafe to test with another dose.',
  evaluation:[
   'A patent or protected airway is important evidence. Confirm that the medication reaction was evaluated and the suspected drug plan addressed before marking the combined goal met.',
   'Document the confirmed airway finding now. Verify the medication review and ensure further exposure was prevented. Continue monitoring for progression as directed.',
   'An unmet goal requires evidence of failure. Airway protection is documented and the medication review status is still unknown. Record that partial progress and verify the drug plan.',
   'Documenting both findings together can be appropriate if both are already available. Record the airway status now and add the medication review when verified so the next team sees what remains.',
  ],
 },
 'SIT-NP5-psychopharmacology-01-R2':{
  source:lithium,
  scenario:'A stable adult takes maintenance lithium and asks about starting daily over-the-counter ibuprofen for joint pain. The adult has not taken it yet and reports no new tremor, vomiting or gait change.',
  assessment:'Ibuprofen can reduce lithium clearance and raise the lithium level. Assess planned frequency, current renal risks and other medicines before use.',
  action:'Contact the pharmacist or prescriber before the client starts regular ibuprofen. Confirm a suitable pain option and whether changes to renal and lithium monitoring are indicated.',
  teaching:'Check before taking NSAIDs or other nonprescription medicines with lithium. Report dehydration, persistent vomiting, new coarse tremor or unsteadiness promptly.',
  outcome:'Verify the client can explain the approved analgesic and any follow-up tests or symptom checks. Confirm the interaction risk was considered before regular use.',
  reasoning:'NSAIDs can reduce renal lithium clearance, which matters even when a drug is available without prescription. A reviewed alternative or monitoring plan lowers that risk.',
  safety:'Some nonprescription products can be used with lithium after an interaction review. Regular ibuprofen requires verification rather than assuming over-the-counter availability proves safety.',
  followUp:'Record the reviewed pain and monitoring plan, then confirm what the client actually used and whether required laboratory tests or symptom checks occurred.',
  alternate:'An ECG and electrolyte follow-up apply to marked QT prolongation. No arrhythmia warning sign is given here. Verify the analgesic decision and any indicated lithium monitoring.',
 },
 'SIT-NP5-psychopharmacology-02-R2':{
  source:maoi,
  scenario:'A client taking tranylcypromine develops sudden severe headache, palpitations and a blood pressure of 218/122 mm Hg after eating aged cheese. No second dose has been given.',
  assessment:'Severe headache and a marked pressure rise after a high-tyramine food while taking tranylcypromine raise concern for a hypertensive crisis. Assess urgently for organ injury.',
  action:'Activate emergency assessment and monitoring, hold the implicated medicine under protocol and communicate the exact drug, timing and food exposure. Assess neurological and circulatory status while help responds.',
  teaching:'Follow the medicine-specific food and drug interaction plan. Seek emergency help for sudden severe headache, chest symptoms or acute neurological changes while taking the medicine.',
  outcome:'Verify there was urgent evaluation and directed blood-pressure management with appropriate checks for neurological, cardiac or renal injury.',
  reasoning:'Nonselective monoamine oxidase inhibition can amplify the pressor effect of tyramine. Severe symptoms with this blood pressure call for emergency assessment instead of additional doses or a routine appointment.',
  safety:'Continue antidepressants only according to the established treatment plan when clinically safe. Another dose during suspected MAOI-associated hypertensive crisis can worsen risk and needs to be withheld pending urgent review.',
  followUp:'Document the suspected interaction and emergency treatment. Reassess pressure and signs of target organ injury and verify the medication and dietary plan before any restart.',
  alternate:'Airway reassessment and relief of muscle spasm are central in acute dystonia. This handoff concerns a hypertensive reaction after tranylcypromine and high-tyramine food.',
  edits:{
   action:{2:['Limit follow-up to an outpatient QT and electrolyte review while the severe headache continues','ECG and electrolyte review can matter when drug-related arrhythmia risk is suspected. This symptomatic severe pressure rise requires emergency assessment now.',prolongedQt]},
  },
 },
 'SIT-NP5-psychopharmacology-03-R2':{
  source:prolongedQt,
  scenario:'A client taking a QT-prolonging antipsychotic nearly faints. An ECG shows a corrected QT of 520 ms and bloodwork shows low potassium. The next dose is due and there is no reviewed plan yet.',
  assessment:'A QTc above 500 ms with presyncope and low potassium raises concern for imminent ventricular arrhythmia, including torsades de pointes. Immediate cardiac monitoring is indicated.',
  action:'Escalate urgently, begin ECG monitoring and verify potassium and magnesium. Hold the implicated dose under protocol pending urgent review and support ordered electrolyte correction.',
  teaching:'Report palpitations, fainting or new lightheadedness promptly and check with the team before adding QT-prolonging medicines. Review any electrolyte follow-up plan.',
  outcome:'Verify monitored rhythm stability, repeat QT assessment and correction of reversible risks. Confirm the prescriber and cardiac team reviewed the medication plan.',
  reasoning:'Marked QT prolongation and potassium depletion can promote a dangerous ventricular arrhythmia. Presyncope increases the urgency even if no sustained arrhythmia has been recorded yet.',
  safety:'Continuing an essential psychiatric medicine can be appropriate after documented risk assessment and monitoring. Ignoring QTc 520 ms with presyncope and hypokalemia bypasses urgent care.',
  followUp:'Record the ECG and electrolyte management already performed, then verify updated QTc, potassium and rhythm monitoring before marking the problem resolved.',
  alternate:'Relief of acute dystonia and protection of the airway fit a sustained drug-related spasm. The findings here require rhythm and electrolyte reassessment.',
 },
 'SIT-NP5-psychopharmacology-04-R2':{
  source:movement,
  scenario:'Soon after receiving a dopamine-blocking antipsychotic, an afebrile client develops sustained painful neck twisting, an upward fixed gaze and difficulty speaking. Staff are at the bedside.',
  assessment:'Sustained neck spasm and an upward fixed gaze after a dopamine-blocking drug suggest acute dystonia. Speech change raises concern for airway involvement and warrants rapid assessment.',
  action:'Assess airway and breathing immediately and activate help if compromised. Escalate for protocol-directed treatment of acute dystonia and review further doses of the suspected medicine.',
  teaching:'Seek urgent help for sustained spasms, throat tightness or difficulty speaking, swallowing or breathing after a drug dose. Review the reaction and follow-up plan with the prescriber once stable.',
  outcome:'Confirm that abnormal contractions resolve and that airway, speech and swallowing are safe. Observe for recurrence and document the drug reaction for future care.',
  reasoning:'Acute dystonia causes sustained involuntary contractions after dopamine blockade. Upper airway muscles can be involved, so the response starts with airway assessment and prompt treatment.',
  safety:'A medication change may be needed later under specialist guidance. Giving another dose of the suspected dopamine blocker can worsen the reaction and delays airway assessment.',
  followUp:'Record the initial response, reassess airway, speech and muscle contractions at the planned check, and verify that the team reviewed the suspected medicine before another dose.',
  alternate:'QT and electrolyte monitoring are central to drug-induced repolarization risk. This adverse reaction needs observation for recurrent sustained spasms and airway symptoms.',
 },
};

export const medicationAlternatives={
 'SIT-CROSS-pharmacology-drug-classes-01-R2:recognition':['Unexplained muscle symptoms with dark urine in a patient on a statin can signal muscle breakdown and warrant urgent review.',statins],
 'SIT-CROSS-pharmacology-drug-classes-01-R2:action':['Review the statin exposure and urgently assess substantial muscle symptoms with dark urine using appropriate muscle and kidney tests.',statins],
 'SIT-CROSS-pharmacology-drug-classes-01-R2:reasoning':['Severe muscle pain or weakness with dark urine warrants evaluation for rhabdomyolysis, which can injure the kidneys.',statins],
 'SIT-CROSS-pharmacology-drug-classes-03:teaching':['Rinse the mouth and spit after using an inhaled corticosteroid to reduce the risk of oral candidiasis. Follow device-specific guidance.',inhaler],
 'SIT-CROSS-pharmacology-drug-classes-03:outcome':['Assess whether suspected oral thrush has resolved and the patient understands rinsing and preventive inhaler technique.',inhaler],
 'SIT-CROSS-pharmacology-core-principles-04-R2:action':['Review the dose with a pharmacist or prescriber when changing kidney function can alter exposure to the prescribed drug.',kidneys],
 'SIT-CROSS-pharmacology-core-principles-04-R2:teaching':['Report potential adverse effects and confirm any dose changes with the care team after a kidney function or drug monitoring assessment.',kidneys],
 'SIT-CROSS-pharmacology-core-principles-01:recognition':['A renally cleared sedative may accumulate with reduced kidney function and repeated dosing, particularly if alertness and ventilation decline.',kidneys],
 'SIT-CROSS-pharmacology-core-principles-01:outcome':['After a suspected sedative adverse effect, track alertness and effective ventilation as well as the medication review.','https://www.apsf.org/article/monitoring-for-opioid-induced-respiratory-depression/'],
 'SIT-CROSS-pharmacology-core-principles-02:reasoning':['Medicines and herbal products may interact. Include the exact product and how it is used when reconciling medicines.','https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions'],
};

export const medicationDirectCases={
 'EXP2-CROSS-pharmacology-drug-classes':{source:'https://sps.nhs.uk/monitorings/doacs-direct-oral-anticoagulants-monitoring/',reasons:[
  'Apixaban is a direct factor Xa inhibitor. Routine INR targets do not guide dosing. Check renal function, blood counts, liver function, adherence, bleeding and interactions according to the treatment plan.',
  'INR can guide a warfarin adjustment when interpreted with the individualized target. Increasing apixaban because an INR is below 2 can increase bleeding risk without a valid indication.',
  'Fixed-dose treatment can remove the need for routine INR titration. Regular clinical and laboratory follow-up remains important to assess safety and confirm an appropriate dose.',
  'aPTT can be used in some unfractionated heparin protocols. It is not a routine measure for setting apixaban dose, which depends on indication and patient-specific factors.',
 ]},
 'EXP2-NP5-psychopharmacology':{source:movement,reasons:[
  'Acute dystonia causes sustained involuntary contractions, such as neck twisting or an upward fixed gaze, and can occur soon after a drug change. Pacing with an internal urge to move is a different pattern.',
  'Tardive dyskinesia usually presents after longer dopamine-blocking exposure with involuntary repetitive movements, often involving the mouth or tongue. The case instead describes a new inner restlessness.',
  'Akathisia causes subjective restlessness and movement such as pacing or shifting after starting or increasing an antipsychotic. Report it promptly and assess its effect on the client and the treatment plan.',
  'Drug-induced parkinsonism typically involves slowed movement, stiffness or tremor. These findings differ from feeling compelled to move and being unable to sit still.',
 ]},
};
