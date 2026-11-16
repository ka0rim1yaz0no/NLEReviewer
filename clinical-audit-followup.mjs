const radial='https://library.nshealth.ca/Clinical-Practice-Nursing/Radial-Compression';
const rhythm='https://openstax.org/books/medical-surgical-nursing/pages/12-2-dysrhythmia';
const circulation='https://www.nhlbi.nih.gov/health/heart/blood-flow';
const cholecystectomy='https://www.gloshospitals.nhs.uk/your-visit/patient-information-leaflets/laparoscopic-cholecystectomy-removal-of-the-gallbladder/';
const cirrhosis='https://www.aasld.org/liver-fellow-network/core-series/back-basics/back-basics-outpatient-management-cirrhosis';
const ascites='https://pmc.ncbi.nlm.nih.gov/articles/PMC7788190/';
const cholangitis='https://www.asge.org/docs/default-source/default-document-library/piis0016510720351117.pdf';
const dementia='https://www.nice.org.uk/guidance/ng97/chapter/recommendations';
const delirium='https://www.nice.org.uk/guidance/cg103/chapter/Recommendations';
const wandering='https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/coping-alzheimers-behaviors-wandering-and';
const sleep='https://www.nia.nih.gov/health/sleep/managing-sleep-problems-alzheimers-disease';

export const followupCases={
 'SIT-NP3-acute-coronary-syndrome-acs-01-R2':{
  source:radial,
  scenario:'After transradial coronary intervention, an adult has a compression device over the puncture site. The hand becomes cooler and more painful than on the initial assessment, with slower capillary refill. The puncture site is currently dry.',
  recognition:['Which complication should the nurse suspect?',
   ['Compromised distal hand perfusion','New unilateral coolness, pain and slower refill indicate a possible change in blood flow. A dry access site does not establish adequate distal circulation.'],
   ['Expected stable findings from every compression device','Some local pressure can be felt. New signs of impaired circulation require prompt assessment.'],
   ['External hemorrhage as the only problem','Examine for bleeding or hematoma. The puncture is dry, while the current distal signs suggest compromised perfusion.'],
   ['Normal perfusion established by the dry dressing','A dry dressing shows no visible external bleeding at the moment. Assess the hand separately.']],
  action:['What should the nurse do immediately?',
   ['Reassess distal circulation and the access site and notify the procedural team urgently','Compare color, temperature, capillary refill, sensation and available pulse or waveform with baseline. Follow the unit’s compression and escalation protocol.'],
   ['Remove all compression without arranging access-site bleeding control','A trained, protocol-based adjustment may be indicated. Abrupt removal without a plan can cause bleeding.'],
   ['Add more pressure despite worsening symptoms','More compression can be considered for bleeding under protocol. It may worsen perfusion in this case.'],
   ['Wait until the scheduled band removal before checking circulation','A new neurovascular change requires action now. Routine observation times do not override it.']],
  teaching:['Which new finding should the patient report at once while the device is in place?',
   ['Increasing hand pain, coolness, numbness, or bleeding','These can indicate an access complication and need reassessment. Ask for help before handling the device.'],
   ['The unchanged feel of a comfortably supported wrist','A baseline observation is useful. A new change in sensation, temperature or pain is more concerning.'],
   ['Only visible bleeding, even if the fingers become cold first','Bleeding should be reported, but distal ischemic symptoms are independently urgent.'],
   ['Only symptoms that start after discharge','The nurse should assess new symptoms during monitoring as well as teach discharge precautions.']],
  safety:['Which proposed response should the nurse correct?',
   ['Leave the device unchecked because the dressing is still dry','External hemostasis does not exclude distal compromise. Assess perfusion and notify the team promptly.'],
   ['Compare hand findings with the earlier assessment and the opposite side','Comparison helps detect and describe clinically important changes.'],
   ['Keep the patient from manipulating the band while trained staff respond','This protects both hemostasis and safe reassessment.'],
   ['Review access-site and distal observations after any protocol-guided adjustment','Both bleeding and perfusion can change when compression changes.']],
  planning:['Which endpoint reflects the purpose of patent hemostasis?',
   ['The puncture site is controlled and blood flow to the hand remains adequate','Compression aims to prevent bleeding while maintaining flow. Monitor and document both outcomes.'],
   ['The pressure device remains as tight as possible','Higher pressure can reduce arterial flow. Use the minimum effective settings under the device plan.'],
   ['The site looks dry regardless of hand color or refill','A dry puncture site is only one goal. Distal assessment remains necessary.'],
   ['The hand is warmer even though bleeding continues at the puncture','Improved hand findings are favorable. Hemostasis still needs trained intervention.']],
  evaluation:['Hand warmth and refill improve after a protocol-guided adjustment, but fresh blood appears at the puncture. What should the nurse do?',
   ['Address the bleeding under the protocol and continue distal perfusion checks','Perfusion has improved, but hemostasis is now incomplete. Report and manage both without blindly increasing compression.'],
   ['Record the goal as fully met because the hand is warmer','Warmth is one favorable observation. Fresh bleeding still requires attention.'],
   ['Ignore the puncture site until the next routine check','New bleeding after an adjustment warrants prompt assessment and the prescribed response.'],
   ['Ask the patient to remove the device and walk','Removal and mobility follow the procedural plan. New bleeding requires immediate staff assessment.']],
  reasoning:['Why does the protocol monitor both the puncture and the distal hand?',
   ['Pressure controls puncture bleeding but too much can restrict arterial flow','Both goals must be checked. Device position, swelling and distal changes can also prompt assessment for other complications.'],
   ['Any compression always improves flow to the fingers','Pressure can impede flow if too high. Use measured findings to assess the effect.'],
   ['Lack of visible bleeding guarantees the radial artery is patent','Bleeding control only means no external bleeding is seen. Check flow and neurovascular status separately.'],
   ['Distal circulation matters only after the compression device has been removed','Changes can begin while it is in place. Early detection may prevent harm.']],
 },
 'SIT-NP4-hepatobiliary-disorders-01-R2':{
  source:cirrhosis,
  scenario:'An adult receives lactulose for hepatic encephalopathy. The patient initially had profuse watery stools and dizziness. After treatment review, the patient has three soft stools in a day and is more alert, but still becomes dizzy when standing.',
  evaluation:['How should the nurse interpret this response?',
   ['Stool and alertness have improved, and the persistent dizziness still needs volume and safety assessment','Excess stool losses can cause hypovolemia. Check pressure, intake, output and ordered laboratory trends before concluding the plan is stable.'],
   ['Record full recovery because the stool goal was reached','The bowel response is encouraging. Orthostatic symptoms suggest an unresolved problem.'],
   ['Increase lactulose until watery stools return','The usual target is soft bowel movements, with the regimen individualized. Profuse diarrhea can worsen dehydration and encephalopathy risk.'],
   ['Hold all encephalopathy treatment indefinitely without notifying the clinician','Therapy may need adjustment, but follow the reviewed plan and promptly report the ongoing symptoms.']],
 },
 'SIT-NP4-hepatobiliary-disorders-02':{
  source:ascites,
  scenario:'An adult with cirrhosis and tense ascites was breathless when lying flat. After prescribed treatment, breathing is easier at rest and abdominal girth is smaller, but the patient still becomes breathless when reclining.',
  evaluation:['Which assessment is most appropriate?',
   ['Document partial improvement and reassess the remaining breathlessness and fluid trend','Less distention and easier breathing are positive. Persistent positional symptoms call for assessment of oxygenation, volume, and other contributors.'],
   ['Document full resolution because girth is smaller','Girth is one trend. It cannot establish that breathing and fluid status are stable.'],
   ['Increase diuretics independently whenever the patient is breathless','Diuretic adjustment depends on volume status, pressure, electrolytes and renal function. Seek clinical direction.'],
   ['Stop monitoring because ascites was already diagnosed','Ongoing clinical and laboratory reassessment helps evaluate response and adverse effects.']],
 },
 'SIT-NP4-hepatobiliary-disorders-03':{
  source:cholangitis,
  scenario:'An adult with fever, jaundice and right upper quadrant pain is being assessed urgently for acute cholangitis. Antibiotics have begun and temperature has fallen, but the patient becomes confused and hypotensive.',
  evaluation:['What should the nurse do?',
   ['Escalate possible sepsis and instability immediately while the team evaluates biliary source control','Fever improvement does not remove concern for shock. Reassess perfusion, follow emergency care and report the change promptly.'],
   ['Document recovery because the temperature decreased','A lower temperature is partial. New hypotension and confusion are more urgent.'],
   ['Wait for jaundice to clear before updating the team','Jaundice may not improve quickly. Circulatory and neurologic deterioration cannot wait.'],
   ['Proceed with routine discharge planning because antibiotics were administered','Treatment delivery is not evidence of stability. Continue urgent assessment and treatment.']],
 },
 'SIT-NP4-hepatobiliary-disorders-04-R2':{
  source:ascites,
  scenario:'An adult with cirrhosis becomes dizzy after 6.2 L of ascites is removed. Blood pressure is 86/50 mm Hg compared with 116/72 before drainage. The postprocedure albumin and monitoring orders have not yet been confirmed.',
  evaluation:['What must the nurse do before discharge is considered?',
   ['Pause discharge, escalate hypotension and verify the ordered postprocedure treatment and reassessment','New symptomatic hypotension requires prompt clinical review. Large-volume removal generally requires albumin under the treatment plan and monitoring for circulatory and renal effects.'],
   ['Discharge once the patient identifies the correct follow-up date','Education helps after clinical stability. The current pressure and symptoms require urgent assessment.'],
   ['Record the procedure as stable because abdominal girth improved','The procedure reduced girth, but that does not establish hemodynamic stability.'],
   ['Give a diuretic without review because fluid was removed','Diuretics can help ongoing ascites in selected situations. They can worsen current low circulating volume or hypotension.']],
 },
 'SIT-NP4-alzheimer-s-disease-dementia-01':{
  source:delirium,
  scenario:'An adult with previously stable dementia develops sudden inattention and fluctuating disorientation. A medication review is completed and the room is made quiet. The patient is still intermittently inattentive.',
  evaluation:['How should the nurse respond to this follow-up finding?',
   ['Continue delirium assessment and investigate and treat other reversible causes','A medication review and supportive environment are important. Persistent acute fluctuation warrants continued clinical evaluation.'],
   ['Attribute the change to expected dementia progression','Dementia progression tends to be slower. A sudden fluctuating change should trigger a delirium assessment.'],
   ['Document that delirium resolved because the room is quiet','A calmer environment can help. Persistent inattention shows the acute goal has not yet been met.'],
   ['Wait for agitation before any further assessment','Delirium can be hypoactive or mixed. Inattention and fluctuation are clinically important even without agitation.']],
 },
 'SIT-NP4-alzheimer-s-disease-dementia-02':{
  source:wandering,
  scenario:'A person with dementia repeatedly walks toward an unsecured exit while searching for a childhood home. A familiar caregiver redirects the person to a supervised walk, and distress decreases. The exit is still unsecured.',
  evaluation:['What should the nurse do after the supervised walk?',
   ['Continue supported movement and address the remaining exit risk','Redirection helped distress, but the environment still has a hazard. Review safe supervision and safeguards consistent with the setting’s rules.'],
   ['Document the goal as permanently met because the person is calmer','Distress can recur and the unsafe exit remains. Reassess the supportive plan.'],
   ['Restrict all walking indefinitely to prevent another approach','Safe, supported activity can meet movement needs. Use individualized precautions rather than blanket restriction.'],
   ['Remove supervision because the person followed redirection once','One response does not establish that future unsupervised movement is safe.']],
 },
 'SIT-NP4-alzheimer-s-disease-dementia-03-R2':{
  source:dementia,
  scenario:'A person with dementia becomes agitated after a fall and guards one hip. Reassurance reduces shouting, but guarding and pain during movement persist and the person cannot describe the symptoms clearly.',
  evaluation:['What should the nurse do next?',
   ['Continue assessment for injury and use an appropriate observational pain assessment','Guarding after a fall can indicate pain or injury. Use the patient’s report where possible, verify safe movement and escalate concerning findings.'],
   ['Record no injury because agitation decreased','Reassurance can reduce distress despite an unresolved injury. The persistent guarding warrants assessment.'],
   ['Give sedation as the only response to prevent further movement','Medicines may have specific indications, but sedation does not evaluate or treat the possible injury.'],
   ['Ask the patient to walk unaided to see whether guarding continues','Assess first and follow fall and injury precautions. Unassisted weight bearing can be unsafe with a possible hip injury.']],
 },
 'SIT-NP4-alzheimer-s-disease-dementia-04-R2':{
  source:sleep,
  scenario:'A person with dementia has increased evening distress, long daytime naps and little daytime activity. Staff make the bedtime area quieter and arrange daytime light and a familiar routine. Two evenings are calmer, but distress recurs on the third.',
  evaluation:['How should the nurse interpret the response?',
   ['Continue the personalized routine and track distress, sleep and possible triggers','Early improvement is useful but can fluctuate. Check pain, toileting, fatigue or other new contributors and adapt support.'],
   ['Declare the plan a failure because one difficult evening occurred','One episode does not outweigh the trend. Assess what changed and whether the plan can be improved.'],
   ['Choose a sedative solely because the distress returned once','Drugs may be considered in selected circumstances after assessment. Look first for unmet needs, triggers and safe non-drug measures.'],
   ['Keep lights and noise high all night to reproduce the daytime routine','Daytime light and activity can support the sleep cycle. Bedtime cues should support rest and comfort.']],
 },
};

const direct={
 'ORN-3256520ba170dd987a3d':[rhythm,[
  ['Atrioventricular node','The AV node conducts the signal from the atria before it reaches the His bundle. The described delay is after conduction reaches the ventricular branches.'],
  ['Left bundle branch','This branch conducts toward the left ventricle. Activation on that side is on time in this case.'],
  ['Right bundle branch','The right bundle branch carries the signal from the His bundle toward the right ventricle. That is the delayed route here.'],
  ['Sinoatrial node','The SA node initiates the usual impulse in the right atrium. It does not carry the branch signal to the right ventricle.'],
 ]],
 'ORN-3daa4f4e17647e3da101':[rhythm,[
  ['Regular atrial rhythm with irregular ventricular rhythm','Consistent P-to-P intervals show regular atrial activation. Varying R-to-R intervals show irregular ventricular activation.'],
  ['Regular atrial and ventricular rhythms','This would require both P-to-P and R-to-R intervals to be consistent. The ventricular intervals vary.'],
  ['Irregular atrial rhythm with regular ventricular rhythm','This can occur in some rhythms with independent ventricular pacing or escape, but it reverses both observations here.'],
  ['Irregular atrial and ventricular rhythms','Both intervals would need to vary. The measured P-to-P interval is consistent.'],
 ]],
 'ORN-814719e616ab38c7df01':[circulation,[
  ['Inferior vena cava','It returns blood from much of the body below the diaphragm. The question asks about the route from the head and upper limbs.'],
  ['Superior vena cava','It returns systemic venous blood from the upper body to the right atrium.'],
  ['Pulmonary vein','Pulmonary veins return blood from the lungs to the left atrium. They do not drain the head or arms.'],
  ['Pulmonary artery','The pulmonary artery carries blood from the right ventricle to the lungs. It does not deliver systemic venous blood into the right atrium.'],
 ]],
 'ORN-9708c02a966728cfa0ee':[rhythm,[
  ['About 90 beats/min','Nine P waves in six seconds estimate an atrial rate of about 90. The question asks for the ventricular rate.'],
  ['About 70 beats/min','Seven QRS complexes in six seconds multiplied by ten give an estimated ventricular rate of 70. Use a longer strip when a more reliable average is needed.'],
  ['About 42 beats/min','Multiplying by six would not scale a six-second count to one minute. There are ten six-second intervals in a minute.'],
  ['About 160 beats/min','Adding P waves and QRS complexes counts atrial and ventricular events together. Use QRS complexes for ventricular rate.'],
 ]],
 'EXP2-NP4-hepatobiliary-disorders':[cholecystectomy,[
  ['An acute shoulder joint injury from a known local trauma','A local injury could cause tenderness or pain reproduced with shoulder movement. The assessment here supports referred discomfort.'],
  ['Referred shoulder-tip discomfort from insufflation gas','Gas used in laparoscopy can irritate the diaphragm and cause mild referred shoulder pain. Reassess if symptoms worsen or warning signs appear.'],
  ['Confirmed pulmonary embolism from the shoulder finding alone','New dyspnea, chest pain or instability would warrant urgent assessment. Isolated mild expected discomfort cannot confirm embolism.'],
  ['Definite wound infection despite the reassuring examination','Fever, wound changes or increasing abdominal pain would prompt evaluation. The scenario does not show those findings.'],
 ]],
 'EXP2-NP4-alzheimer-s-disease-dementia':[dementia,[
  ['Arrange automatic tube feeding because the person has advanced dementia','Enteral feeding is not routine in severe dementia. It may be indicated for a potentially reversible comorbidity after individual assessment.'],
  ['Continue unrestricted oral intake regardless of swallowing symptoms','Oral feeding may be appropriate with individualized assistance and risk discussion. Repeated swallowing difficulty warrants assessment.'],
  ['Explain that no feeding support can be provided at this stage','Comfort, safe assistance and oral care can still be addressed. Discuss the person’s preferences and goals with the team.'],
  ['Arrange swallowing assessment and discuss individualized feeding support and goals','Review the benefits and burdens of available approaches, reversible factors, and the person’s wishes. Decide with the care team and family as appropriate.'],
 ]],
};

export const followupDirectCases=Object.fromEntries(Object.entries(direct).map(([id,[source,choices]])=>[
 id,{source,choices:choices.map(([text])=>text),reasons:choices.map(([,reason])=>reason),
  choiceSources:choices.map(([, ,reference])=>reference??source)},
]));
