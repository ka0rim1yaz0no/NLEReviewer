import type {Subject} from './types.ts';

type Choice = [text:string,rationale:string];
export type BankReview = {
 id:string;
 source:string;
 scenario?:string;
 prompt:string;
 choices:[Choice,Choice,Choice,Choice];
 studyNote:string;
 subject?:Subject;
 topic?:string;
};

const face='https://www.ncbi.nlm.nih.gov/books/NBK615337/';
const faceCare='https://exxcellence.org/list-of-pearls/management-of-brow-face-and-compound-malpresentations/';
const remission='https://pmc.ncbi.nlm.nih.gov/articles/3767415/';
const oxygen='https://www.ncbi.nlm.nih.gov/books/NBK596733/';
const mobility='https://www.ncbi.nlm.nih.gov/books/NBK610826/';
const b6='https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/';
const tb='https://www.cdc.gov/tb/media/Core_Curriculum_TB_eBook.pdf';
const burns='https://www.ameriburn.org/burn-care-team/resources/guidelines-for-burn-patient-referral';
const co='https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html';
const childProtection='https://www.nice.org.uk/guidance/cg89/chapter/recommendations';
const bilirubin='https://publications.aap.org/pediatrics/article/150/3/e2022058859/188726/Clinical-Practice-Guideline-Revision-Management-of?autologincheck=redirected';
const perioperative='https://www.ncbi.nlm.nih.gov/books/NBK613066/';
const ms='https://www.nice.org.uk/guidance/ng220/chapter/Recommendations';
const catheter='https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html';
const ecg='https://www.ncbi.nlm.nih.gov/books/NBK594493/';
const ivFluids='https://www.ncbi.nlm.nih.gov/books/NBK591820/';
const sodium='https://academic.oup.com/ejendo/article/170/3/G1/6668028';
const families='https://www.ncbi.nlm.nih.gov/books/NBK615335/';
const literacy='https://www.ahrq.gov/health-literacy/improve/precautions/toolkit.html';
const clozapine='https://www.fda.gov/drugs/drug-safety-and-availability/fda-removes-risk-evaluation-and-mitigation-strategy-rems-program-antipsychotic-drug-clozapine';

// The keyed choice comes first here. Publication restores its original slot.
export const bankReviews:BankReview[]=[
 {
  id:'ORN-58aee781fca6b2663fcc',source:face,
  scenario:'The labor nurse receives a report of face presentation. The examiner identifies the chin in the quadrant between the maternal sacrum and the mother’s left hip. The face is the leading part.',
  prompt:'Which position should the nurse document?',
  choices:[
   ['Left mentum posterior','In a face presentation the chin is the landmark. Its location toward the sacrum and maternal left identifies left mentum posterior.'],
   ['Right mentum posterior','Posterior is correct, but the examiner located the chin on the mother’s left.'],
   ['Left mentum anterior','The left side is correct, but an anterior position places the chin toward the maternal pubis.'],
   ['Left occiput posterior','Occiput describes the landmark of a vertex presentation. Here the face leads and the chin determines the position.'],
  ],
  studyNote:'In face presentation, use the chin and the maternal pelvic quadrant to name the position.',
 },
 {
  id:'ORN-7d8c1adcdf9f9b256e81',source:faceCare,
  scenario:'At complete dilation, the obstetric clinician confirms persistent right mentum posterior face presentation. The head has not descended over serial assessments despite effective contractions. The fetal tracing is currently reassuring.',
  prompt:'Which next step should the nurse anticipate and prepare for?',
  choices:[
   ['Notify the obstetric team of the arrest and prepare for cesarean birth','A persistently posterior chin prevents the head from completing the movement needed to descend. The reassuring tracing does not resolve the mechanical obstruction.'],
   ['Plan vacuum-assisted birth once the tracing is reviewed','The leading face is unsuitable for routine vacuum placement, and vacuum does not correct a persistent posterior chin.'],
   ['Ask for oxytocin to increase the strength of contractions','The contractions are already effective. Strengthening them does not correct the position that blocks descent.'],
   ['Continue routine pushing until a fetal heart rate abnormality occurs','The lack of descent with confirmed persistent posterior position requires an obstetric decision even with a reassuring tracing.'],
  ],
  studyNote:'Persistent mentum posterior with absent descent needs obstetric escalation even when the fetal tracing is reassuring.',
 },
 {
  id:'ORN-5fcbf8a81faea91230fc',source:faceCare,
  scenario:'Ultrasound confirms right mentum anterior face presentation. The external fetal monitor provides a continuous, interpretable tracing. A team member offers an internal electrode to make the tracing easier to obtain during position changes.',
  prompt:'Which monitoring plan best fits the current findings?',
  choices:[
   ['Continue the interpretable external tracing and reposition the external transducer as needed','External monitoring provides surveillance without instrumenting the presenting face. Internal devices near the eyes and soft tissue need particular caution.'],
   ['Attach a fetal scalp electrode to the cheek because the chin is anterior','An anterior chin does not make placement on the presenting facial tissue appropriate. The external tracing is adequate.'],
   ['Place the internal electrode on the presenting part after the next vaginal examination','Repeating the examination does not remove the facial injury concern or create an indication for an internal electrode.'],
   ['Switch to intermittent listening solely because the chin is anterior','Position alone does not remove the fetal surveillance concerns of a face presentation. Use the interpretable external tracing.'],
  ],
  studyNote:'When a face presentation has an adequate external fetal tracing, continue external surveillance.',
 },
 {
  id:'ORN-737da0734b61a3686179',source:faceCare,
  scenario:'A laboring patient asks why the obstetric clinician is continuing to observe labor after confirming left mentum anterior face presentation. The fetus is descending and the tracing is reassuring.',
  prompt:'Which response accurately explains the plan?',
  choices:[
   ['The chin faces toward the front of the pelvis, so vaginal birth may be possible while progress and the fetal tracing remain reassuring','An anterior chin can pass beneath the pubic arch. Continued progress and fetal status guide whether observation remains appropriate.'],
   ['A face presentation requires cesarean birth even when the chin is anterior and the fetus is descending','An anterior mentum can permit vaginal delivery. Persistent posterior position and poor descent present a different problem.'],
   ['The chin should rotate toward the maternal sacrum before descent can continue','A persistent posterior chin can obstruct descent. Anterior position is the more favorable orientation for vaginal delivery.'],
   ['Once the chin is anterior, surveillance can stop because the delivery route is settled','An anterior position permits a trial of labor in suitable conditions. Ongoing progress and fetal status still determine the route.'],
  ],
  studyNote:'Mentum anterior may allow vaginal birth when descent and fetal status support it.',
 },
 {
  id:'ORN-b941115d235e02fbe129',source:face,
  scenario:'On assessment the obstetric clinician identifies the fetal mouth, nose, and chin as the leading structures. The chin is directed straight toward the maternal sacrum.',
  prompt:'Which combination of presentation and position matches those landmarks?',
  choices:[
   ['Face presentation, mentum posterior','Palpable facial landmarks establish a face presentation. The chin points posteriorly toward the sacrum.'],
   ['Vertex presentation, occiput posterior','A posterior occiput is located using the fetal skull sutures and fontanelles. The mouth and chin identify a face presentation.'],
   ['Face presentation, mentum anterior','The face presentation fits, but mentum anterior directs the chin toward the pubis.'],
   ['Brow presentation, frontal posterior','The brow is the leading part in brow presentation. A clearly presenting mouth and chin indicate more complete extension and a face presentation.'],
  ],
  studyNote:'A presenting mouth and chin indicate face presentation. The chin toward the sacrum indicates mentum posterior.',
 },
 {
  id:'ORN-ff975fdf3d5ec78a477a',source:faceCare,
  scenario:'Labor has slowed. On repeat examination, the clinician palpates the anterior fontanelle and orbital ridges as the presenting landmarks. The mouth and chin are out of reach.',
  prompt:'Which report best communicates the suspected presentation for confirmation?',
  choices:[
   ['Suspected brow presentation with partial extension','The anterior fontanelle and orbital ridges with no palpable mouth or chin favor brow presentation. Ultrasound or the obstetric assessment can confirm the position.'],
   ['Confirmed face presentation with mentum anterior','Face presentation requires identification of the face and chin. These findings cannot establish the chin’s direction.'],
   ['Vertex presentation with occiput anterior','Palpating an anterior fontanelle alone can occur in vertex. Leading orbital ridges and partial extension favor brow, and the occiput orientation is unconfirmed.'],
   ['Frank breech with the sacrum as the landmark','Frank breech has the buttocks as the presenting part. Orbital ridges identify a cephalic landmark.'],
  ],
  studyNote:'When the brow leads and the mouth and chin are not palpable, report possible brow presentation for confirmation.',
 },
 {
  id:'ORN-4daa0035a3b98e935ebc',source:remission,subject:'NP5',topic:'Substance Use Disorders',
  scenario:'A client previously met criteria for alcohol use disorder. At the outpatient follow-up, the client reports occasional cravings but no other substance-use disorder criteria for the past eight months.',
  prompt:'Which course specifier best fits the information available?',
  choices:[
   ['In early remission','Eight months is at least three months and less than twelve months. Craving is the exception that can persist during remission.'],
   ['In sustained remission','Sustained remission requires at least twelve months without criteria other than craving. Eight months is too short.'],
   ['No remission because craving persists','Craving alone does not exclude a remission specifier after the qualifying interval.'],
   ['In a controlled environment','The outpatient follow-up does not establish that access to alcohol is restricted by the setting. This descriptor does not follow from craving or elapsed time.'],
  ],
  studyNote:'For the remission specifier, craving is an exception. Early remission covers at least three months and less than twelve months.',
 },
 {
  id:'ORN-db4e23fc600591aa28c9',source:remission,subject:'NP5',topic:'Substance Use Disorders',
  scenario:'At a recovery clinic, a client with a documented prior stimulant use disorder says strong cravings still occur occasionally. The treatment record supports fourteen months with no other criteria. The client lives independently.',
  prompt:'Which statement is best supported for the team’s review?',
  choices:[
   ['Sustained remission is supported, with continued assessment of craving and recovery needs','The interval is at least twelve months without other criteria. Craving can persist and remains relevant to the care plan.'],
   ['Early remission continues until the client goes twelve months without any craving','Early versus sustained remission depends on the interval without the other criteria. Craving is an exception.'],
   ['The craving alone establishes a new active substance use disorder','One symptom alone does not establish a new active disorder, and the remission definition allows craving.'],
   ['A controlled-environment specifier is supported because the client receives outpatient treatment','Outpatient follow-up does not by itself establish restricted access to the substance.'],
  ],
  studyNote:'Assess craving during sustained remission. Craving alone does not reset the interval without other diagnostic criteria.',
 },
 {
  id:'ORN-79f0f7bcb103130a8bf9',source:oxygen,
  scenario:'A stable patient meets the ordered saturation target on 2 L/min through nasal prongs. The patient is cleared to eat and asks whether oxygen can continue during meals. A precise inspired oxygen concentration is not required.',
  prompt:'Which plan fits the order and the patient’s activity?',
  choices:[
   ['Continue the low-flow nasal cannula and reassess saturation during the meal','A cannula delivers the prescribed low flow while leaving the mouth free. Reassessment checks that the target is maintained during activity.'],
   ['Change to a simple face mask at the same 2 L/min during meals','A simple mask covers the mouth and requires more flow to flush exhaled gas. It is unsuitable at the cannula’s flow setting.'],
   ['Change to a fixed-concentration Venturi mask before each meal','The patient already meets the target without a fixed concentration. A face mask would also interfere with eating.'],
   ['Stop oxygen until the meal ends because the saturation is currently at target','The current saturation reflects oxygen therapy. Interrupting an active order could lower the saturation during activity.'],
  ],
  studyNote:'A low-flow nasal cannula can deliver prescribed oxygen while a stable, cleared patient eats.',
 },
 {
  id:'ORN-fe2b48e9ff69ca0a3c5c',source:oxygen,
  scenario:'A patient has an order for oxygen at 3 L/min by nasal cannula. The nurse finds a simple face mask connected at 3 L/min after an earlier equipment change. The mask label specifies a minimum flow of 6 L/min.',
  prompt:'What should the nurse do first while reassessing the patient?',
  choices:[
   ['Restore the prescribed cannula and reassess saturation and work of breathing','The mask is running below its minimum and can retain exhaled gas. Restoring the ordered device corrects the mismatch while the nurse reassesses oxygen needs.'],
   ['Keep the mask at 3 L/min if the displayed saturation is within target','A normal saturation does not show whether exhaled carbon dioxide is clearing from a low-flow mask.'],
   ['Increase the mask to 6 L/min and record it as equivalent to the cannula order','That flow meets the mask label but is a different delivery prescription. It is not equivalent to 3 L/min by cannula.'],
   ['Tighten the mask seal at 3 L/min and recheck the tubing','A tighter seal does not provide the flow needed to clear exhaled gas from a simple mask.'],
  ],
  studyNote:'Match the oxygen flow to the prescribed device. A simple mask must run at or above its labelled minimum.',
 },
 {
  id:'ORN-99e49b8c59af28365994',source:oxygen,
  scenario:'A patient with acute hypoxemia remains tachypneic on conventional oxygen. The team orders 45 L/min of warmed, humidified gas with the oxygen fraction set separately, while continuing to monitor for deterioration.',
  prompt:'Which device can deliver that order?',
  choices:[
   ['A heated high-flow nasal cannula system with an air–oxygen blender','The high-flow system supports the ordered flow, adjustable oxygen fraction, heating, and humidification.'],
   ['A standard nasal cannula with an added bubble humidifier','A standard low-flow cannula and bubble humidifier do not provide the ordered high gas flow or independently blended oxygen fraction.'],
   ['A Venturi mask with a fixed-percentage adaptor','A Venturi adaptor provides a specified oxygen concentration at its prescribed input flow. It is not the ordered heated high-flow nasal system.'],
   ['A nonrebreather mask with its reservoir inflated','A nonrebreather can deliver a high oxygen concentration, but it does not independently set a heated, humidified 45 L/min flow and oxygen fraction.'],
  ],
  studyNote:'Heated high-flow nasal oxygen allows separate settings for total gas flow and inspired oxygen fraction.',
 },
 {
  id:'ORN-1486e979f13a5fd0f218',source:mobility,
  scenario:'During a chair transfer, a patient pushes up and completes about three quarters of the movement. The nurse gives hands-on lifting help for the remainder. The unit’s assistance chart uses the proportion performed by the patient.',
  prompt:'Which entry best describes the amount of help actually provided?',
  choices:[
   ['Minimal assistance with the transfer','The patient performed about 75% of the movement and the helper supplied the remaining 25% as physical assistance.'],
   ['Contact guard only','Contact guarding protects balance without supplying the lifting effort documented here.'],
   ['Moderate assistance with the transfer','The unit describes moderate assistance when the patient and helper contribute about equally. This patient did more.'],
   ['Supervision with verbal cues','The nurse provided lifting assistance. Supervision alone understates the support used.'],
  ],
  studyNote:'Distinguish hands-on lifting assistance from steadying or verbal supervision when documenting a transfer.',
 },
 {
  id:'ORN-600d5f149171f0320a0f',source:mobility,
  scenario:'A patient previously transferred with the caregiver contributing about one quarter of the effort. At the next attempt the patient is alert and following instructions but can provide only about half the effort. The patient is safely back in bed.',
  prompt:'What should the nurse do before attempting the next transfer?',
  choices:[
   ['Document the increased assistance, reassess strength and balance, and update the transfer plan','The amount of help has increased from about 25% to 50%. Reassessment helps determine whether personnel or equipment should change.'],
   ['Keep the earlier assistance level because the patient can still follow directions','Following commands does not restore strength or reduce the physical assistance observed during the transfer.'],
   ['Document supervision because the nurse stopped the transfer before a fall','Supervision describes the support needed, not the absence of a fall. This patient required meaningful physical help.'],
   ['Use the previous one-helper plan with faster cueing to reduce time standing','Cueing cannot replace the added lifting and balance support. The change warrants reassessment before another attempt.'],
  ],
  studyNote:'Update the transfer plan when the patient’s share of the effort falls, even if the patient remains alert.',
 },
 {
  id:'ORN-84ce1821ac75067e781b',source:mobility,
  scenario:'On a unit using percentage-of-effort documentation, a patient can perform about one quarter of a bed-to-chair transfer. A colleague records “moderate assistance” because the patient participates and asks to repeat the move using the old plan.',
  prompt:'Which revision is most appropriate?',
  choices:[
   ['Record maximum assistance and reassess the equipment and staffing needed for a safe transfer','The caregiver supplies about 75% of the effort. The level is maximum assistance on this scale, and the team should match the transfer method to current ability.'],
   ['Record total assistance because the caregiver performs more than half the effort','The patient contributes about one quarter of the task. Total assistance would describe essentially no effective participation on this scale.'],
   ['Keep moderate assistance because the patient initiates part of the movement','Initiation does not establish that the patient performs half of the task. The documented effort points to a higher level of help.'],
   ['Record minimal assistance because the patient can stand briefly with support','Brief supported standing does not measure the whole transfer. The patient supplied only a quarter of its effort.'],
  ],
  studyNote:'Use the patient’s contribution to the whole transfer and confirm the safe handling plan.',
 },
 {
  id:'ORN-a2091b3b51dc370056f1',source:tb,
  scenario:'An adult with diabetes begins an isoniazid-containing latent tuberculosis regimen selected by the TB clinic. The patient asks which prescribed vitamin is intended to reduce the risk of treatment-associated peripheral neuropathy.',
  prompt:'Which supplement should the nurse verify on the treatment plan?',
  choices:[
   ['Pyridoxine (vitamin B6)','Diabetes increases neuropathy risk. The CDC TB guidance includes pyridoxine for people at increased risk who receive isoniazid.'],
   ['Cobalamin (vitamin B12)','Cobalamin is used when B12 deficiency warrants treatment. It is not the recommended supplement for isoniazid-associated neuropathy prevention.'],
   ['Thiamine (vitamin B1)','Thiamine addresses deficiency-related problems in other settings. The specific preventive supplement paired with isoniazid is pyridoxine.'],
   ['Folate (vitamin B9)','Folate has other indications and does not replace pyridoxine for this medication-related neuropathy risk.'],
  ],
  studyNote:'Check for prescribed pyridoxine when an isoniazid regimen is used in a patient at increased neuropathy risk.',
 },
 {
  id:'ORN-3229de22e1bdcd0427a3',source:b6,
  scenario:'A client reports progressive numbness and trouble with balance after taking several high-dose “nerve health” products for months. Medication review shows that each contains pyridoxine. The neurologic evaluation is in progress.',
  prompt:'Which information should the nurse highlight during the assessment?',
  choices:[
   ['Total vitamin B6 intake from all products may be contributing to sensory neuropathy','Prolonged excess pyridoxine from supplements can cause sensory neuropathy. The combined dose and duration matter for evaluating the symptoms.'],
   ['A higher pyridoxine dose should be tried because numbness proves deficiency','Numbness has several causes and may occur with pyridoxine excess. Increasing the dose without evaluation could worsen harm.'],
   ['The supplements can be excluded as a cause because vitamin B6 dissolves in water','Water solubility does not prevent chronic excessive pyridoxine intake from injuring sensory nerves.'],
   ['Only the dose listed on the newest product is relevant to the review','The other products also provide pyridoxine. Cumulative exposure is more informative than one label.'],
  ],
  studyNote:'Review cumulative supplement doses when evaluating new sensory symptoms. Excess pyridoxine can cause neuropathy.',
 },
 {
  id:'CH-025',source:burns,
  scenario:'An adult burn diagram shows blistered partial-thickness injury over the entire anterior trunk and the anterior surface of one arm. The entire posterior trunk has separate dry, blanching superficial redness. The nurse uses the adult Rule of Nines.',
  prompt:'Which estimate and next step are most appropriate?',
  choices:[
   ['22.5% counted TBSA and immediate burn-center consultation','The anterior trunk contributes 18% and the front of one arm contributes 4.5%. Superficial redness is excluded. The partial-thickness area meets the immediate-consultation criterion.'],
   ['18% counted TBSA and immediate burn-center consultation','The referral direction fits, but the estimate omits the burned anterior arm.'],
   ['40.5% counted TBSA and immediate burn-center consultation','This estimate adds the 18% posterior trunk. That area is superficial and does not enter the burn TBSA calculation.'],
   ['27% counted TBSA and immediate burn-center consultation','This counts the whole arm as 9%. Only its anterior surface has a partial-thickness injury.'],
  ],
  studyNote:'Count partial-thickness and deeper areas for burn TBSA. In this adult, the anterior trunk and front of one arm total 22.5%.',
 },
 {
  id:'CH-026',source:co,
  scenario:'A patient rescued from an enclosed building fire has headache, nausea, and slowed responses. The airway team is already evaluating the patient and oxygen has been started. A standard two-wavelength pulse oximeter displays 99%.',
  prompt:'Which measurement should the nurse prioritize requesting to assess carbon monoxide exposure?',
  choices:[
   ['Blood carboxyhemoglobin measured by laboratory co-oximetry','Conventional pulse oximetry cannot reliably distinguish oxyhemoglobin from carboxyhemoglobin. Co-oximetry directly measures the latter.'],
   ['Arterial oxygen tension alone','Arterial oxygen tension measures dissolved oxygen. It can be reassuring while carbon monoxide reduces the hemoglobin available to carry oxygen.'],
   ['Repeat conventional pulse oximetry at a second site','Changing the probe site does not remove the measurement limitation in the presence of carboxyhemoglobin.'],
   ['Continuous end-tidal carbon dioxide alone','Capnography evaluates ventilation. It does not measure carbon monoxide binding to hemoglobin.'],
  ],
  studyNote:'After enclosed-fire exposure, a normal conventional saturation does not rule out carbon monoxide poisoning.',
 },
 {
  id:'CH-028',source:childProtection,
  scenario:'A caregiver reports that a two-year-old splashed hot water on both feet. The nurse observes symmetric stocking-shaped scalds with a sharply defined upper border and no scattered splash marks. The child’s immediate burn care has begun.',
  prompt:'Which nursing action is most appropriate alongside the burn treatment?',
  choices:[
   ['Document the pattern and reported history objectively and activate the facility’s safeguarding assessment','The symmetric distribution and sharp borders raise concern for immersion when the history describes splashing. This warrants timely assessment without assuming the cause is proven.'],
   ['Record the event as an accidental splash because the caregiver’s account is available','A supplied history does not resolve a mismatch with the injury pattern. Both the account and objective findings need documentation.'],
   ['Delay raising a concern until the caregiver gives a different explanation','The observed discrepancy already warrants review. Waiting for a new history can delay protection and assessment.'],
   ['Record that abuse is confirmed from the shape of the burns','The pattern supports concern and escalation. It does not establish the final determination by itself.'],
  ],
  studyNote:'An immersion-like scald pattern that conflicts with the history warrants objective documentation and safeguarding review.',
 },
 {
  id:'CH-015',source:bilirubin,
  scenario:'A clinically stable 39-week newborn is 41 hours old and has never received phototherapy. The total serum bilirubin is 15.1 mg/dL and the team’s age-specific treatment threshold is 16.7 mg/dL. The family cannot return for bilirubin testing until three days after the planned discharge.',
  prompt:'Which plan should the nurse recommend during discharge rounds?',
  choices:[
   ['Discuss delaying discharge until timely bilirubin reassessment can be arranged','The measurement is 1.6 mg/dL below the threshold. That narrow margin calls for earlier reassessment than the available visit, so the team should address the follow-up gap.'],
   ['Discharge with the three-day visit because the current bilirubin is below the threshold','Being below the threshold does not establish that a three-day delay is safe. The distance below the threshold guides follow-up.'],
   ['Start phototherapy solely because the absolute bilirubin is above 15 mg/dL','Treatment decisions use the infant’s age-specific threshold and risk factors. An absolute cutoff of 15 mg/dL does not determine treatment in this case.'],
   ['Use the feeding assessment as the sole basis for discharge timing','Feeding is relevant to clinical judgment. It does not replace the bilirubin trend and indicated follow-up when the value is near the treatment threshold.'],
  ],
  studyNote:'Calculate the distance below the age-specific phototherapy threshold and resolve any gap in timely reassessment before discharge.',
 },
 {
  id:'CH-016',source:bilirubin,
  scenario:'An infant exceeded the phototherapy threshold during the birth hospitalization and started phototherapy at 30 hours of age. The direct antiglobulin test is positive. The team has just discontinued phototherapy.',
  prompt:'Which bilirubin follow-up plan should the nurse verify?',
  choices:[
   ['Measure serum bilirubin 6 to 12 hours after stopping treatment and repeat it the next day','Starting treatment before 48 hours and a positive direct antiglobulin test increase rebound risk. The AAP recommends the earlier serum check and a next-day repeat in this situation.'],
   ['Measure serum bilirubin the next day as the first and only check','A next-day check is important, but the early-start and hemolysis risk factors call for an additional earlier measurement.'],
   ['Replace the early serum measurement with a transcutaneous reading at 6 hours','The recommendation calls for an early serum measurement. A transcutaneous measurement soon after phototherapy is not interchangeable.'],
   ['Wait 48 hours because phototherapy was already discontinued below the threshold','Stopping below threshold does not remove rebound risk. Delaying the first check misses the recommended early reassessment.'],
  ],
  studyNote:'After early phototherapy or with hemolysis risk, verify the 6-to-12-hour serum bilirubin and the next-day repeat.',
 },
 {
  id:'SIT-NP3-pre-operative-phase-01-action',source:perioperative,
  prompt:'The transport team has arrived. Which action should the nurse take before the scheduled premedication?',
  choices:[
   ['Pause the sedative and ask the responsible clinician to resolve the client’s procedure questions','A signature does not settle the client’s expressed uncertainty. Clarification before sedation preserves the ability to participate in the decision.'],
   ['Give the sedative now and request clarification while the team transports the client','Sedation can impair participation. The questions should be resolved before giving the premedication.'],
   ['Review the procedure pamphlet with the client and proceed when the form is signed again','Written information may help, but another signature does not establish understanding of the unresolved risks, benefits, or alternatives.'],
   ['Ask the relative to confirm what the client understood and use the existing signature','A relative’s account does not substitute for addressing a capable client’s own questions and voluntary decision.'],
  ],
  studyNote:'Resolve unanswered procedure questions with the responsible clinician before sedating premedication.',
 },
 {
  id:'SIT-NP3-pre-operative-phase-01-evaluation',source:perioperative,
  prompt:'The responsible clinician returns to discuss the procedure. Which finding best supports proceeding with preparation?',
  choices:[
   ['The alert client explains the purpose, main risks, and alternatives in their own words and confirms the decision voluntarily','Teach-back and the client’s voluntary choice address the original concern about understanding before sedation.'],
   ['The client signs again and states that the surgeon can decide which procedure is done','A repeated signature does not show that the client understands or has voluntarily decided about the proposed procedure.'],
   ['The relative can explain the risks while the alert client still cannot explain the purpose','The original concern is the capable client’s understanding. Another person’s explanation does not resolve it.'],
   ['The transport team verifies the procedure name while the client asks for more time to decide','Identity and procedure checks support safety, but the client’s request for time means the consent concern is unresolved.'],
  ],
  studyNote:'Look for the capable client’s own explanation and voluntary decision before proceeding.',
 },
 {
  id:'SIT-NP3-inflammatory-bowel-neuro-inflammatory-disorders-03-action',source:ms,
  prompt:'A teammate suggests requesting high-dose steroids before checking the source of the fever. What is the best response?',
  choices:[
   ['Assess the suspected infection and compare neurologic findings with baseline before treating this as a relapse','Fever and infection can worsen prior MS symptoms. Assess for infection and new or persistent neurologic change before assuming a relapse requiring steroids.'],
   ['Request steroids immediately because any worsening of old weakness identifies a relapse','Worsening of old symptoms can accompany fever. The infection and other causes should be assessed before classifying the episode.'],
   ['Assume the neurologic symptoms are harmless and postpone evaluation until the next routine visit','The possible urinary infection requires assessment now, and persistent or new deficits may require additional neurologic review.'],
   ['Review the neurologic findings but exclude the fever from the handoff','Fever changes how the neurologic symptoms should be interpreted. The team needs both the baseline comparison and infection cues.'],
  ],
  studyNote:'Check for infection and compare with baseline before classifying worsening MS symptoms as a relapse.',
 },
 {
  id:'SIT-NP4-multiple-sclerosis-ms-02-action',source:ms,
  prompt:'Which observation and follow-up plan best distinguish the reported heat-related episode from a change that needs additional evaluation?',
  choices:[
   ['Reassess after cooling and seek review if weakness persists, changes pattern, or accompanies infection symptoms','Temporary familiar symptoms that improve when the trigger resolves differ from persistent or new deficits. Infection and other causes still matter when symptoms do not settle.'],
   ['Classify it as a confirmed relapse because the weakness recurred after a hot bath','Reappearance of familiar symptoms with heat does not by itself meet the clinical criteria for a relapse.'],
   ['Reassess only if the client develops a fever because cooling has already helped','New or persistent neurologic change can need review without fever. The course after cooling remains important.'],
   ['Advise the client to repeat the hot bath to determine whether the weakness can be reproduced','Reproducing the trigger can worsen symptoms and adds avoidable safety risk. Compare with baseline after safe cooling.'],
  ],
  studyNote:'Reassess familiar heat-related symptoms after cooling. Persistent or new findings need further assessment.',
 },
 {
  id:'NP3-075-2',source:catheter,
  prompt:'During transport, urine flow slows. The drainage bag was placed at bladder level and the tubing is visibly kinked. The closed connections remain intact. What should the nurse do first?',
  choices:[
   ['Lower the bag below the bladder, straighten the tubing, and reassess drainage','Correcting the dependent drainage and kink addresses the visible obstruction while maintaining the intact closed system.'],
   ['Disconnect the tubing and check whether urine drains directly from the catheter','The visible kink can be corrected without opening the system. Disconnecting it introduces avoidable contamination.'],
   ['Replace the catheter and collecting set because any reduction in flow means the system is contaminated','Replacement is indicated for a compromised system or another clinical indication. The connections are intact and the kink is a correctable cause.'],
   ['Collect a urine sample before changing the tubing position','Sampling does not correct the visible obstruction. Restore unobstructed drainage and reassess before deciding whether a specimen is indicated.'],
  ],
  studyNote:'Correct a visible kink and restore dependent drainage before opening an intact urinary catheter system.',
 },
 {
  id:'ORN-3daa4f4e17647e3da101',source:ecg,
  scenario:'On a rhythm strip, P waves occur at consistent 0.80-second intervals. Some are followed by QRS complexes and some are not. The intervals between successive R waves vary.',
  prompt:'Which rhythm description is supported by the measured intervals?',
  choices:[
   ['The atrial rhythm is regular and the ventricular rhythm is irregular','Consistent P–P spacing indicates a regular atrial rhythm. Varying R–R spacing indicates irregular ventricular activation.'],
   ['Both rhythms are regular because the P waves are evenly spaced','Regular P waves establish atrial regularity. The irregular R spacing still needs to be reported.'],
   ['The atrial rhythm is irregular because some P waves do not conduct','Conduction to the ventricles and atrial regularity are separate findings. The P waves themselves occur at even intervals.'],
   ['Ventricular regularity can be determined from the PR intervals alone','The PR interval describes atrioventricular conduction. Compare consecutive R waves to assess ventricular regularity.'],
  ],
  studyNote:'Use P–P intervals for atrial regularity and R–R intervals for ventricular regularity.',
 },
 {
  id:'ORN-9708c02a966728cfa0ee',source:ecg,
  scenario:'The ventricular rhythm is irregular on a strip with a marked six-second interval. Within that interval the nurse counts seven QRS complexes and nine P waves.',
  prompt:'Which estimate should the nurse document for the average ventricular rate?',
  choices:[
   ['About 70 beats/min','Seven ventricular complexes in six seconds multiplied by ten gives an estimated ventricular rate of 70 beats/min.'],
   ['About 90 beats/min','Counting nine P waves estimates the atrial rate. The ventricular rate uses the QRS complexes.'],
   ['About 140 beats/min','Multiplying the seven ventricular complexes by twenty treats the marked interval as three seconds. The interval is six seconds.'],
   ['Use the shortest R–R interval to report a single fixed ventricular rate','A short interval gives an instantaneous estimate. With irregular spacing, use the complexes over the full timed strip for the average.'],
  ],
  studyNote:'For an irregular rhythm, count the QRS complexes over a timed interval to estimate the average ventricular rate.',
 },
 {
  id:'ORN-09d4c89ce0f981be0231',source:ivFluids,
  scenario:'A patient with gastrointestinal fluid losses has a prescribed isotonic saline bolus. Four similar bags are available, including one labeled “5% dextrose in water.” The nurse compares the fluid labels with the order.',
  prompt:'Which bag matches the prescribed fluid?',
  choices:[
   ['0.9% sodium chloride','This concentration is an isotonic saline solution used for intravascular fluid replacement. It matches the explicit saline order.'],
   ['0.45% sodium chloride','This is hypotonic saline. It does not match a prescription for isotonic saline.'],
   ['5% dextrose in water','The bag may be described as isotonic before infusion. After dextrose is metabolized it behaves as free water, and it is not saline.'],
   ['3% sodium chloride','This concentration is hypertonic and used for specific indications with monitoring. It does not match the isotonic order.'],
  ],
  studyNote:'Verify both tonicity and composition. Dextrose in water does not act like isotonic saline after the dextrose is metabolized.',
 },
 {
  id:'ORN-21e280a4031a3915dead',source:sodium,
  scenario:'An adult with severe symptomatic hyponatremia has a sodium of 116 mmol/L. The emergency team starts a monitored 3% saline protocol. Symptoms improve and urine output rises substantially after the initial treatment.',
  prompt:'Which follow-up action matters most for safe management of the sodium correction?',
  choices:[
   ['Check serial sodium as ordered, track urine output, and report a faster-than-planned rise promptly','A water diuresis can accelerate correction. Sodium trends and close monitoring let the team adjust the protocol before excessive correction occurs.'],
   ['Continue the initial plan without checking sodium because symptoms improved','Improved symptoms do not show the rate of sodium correction. Excessive correction can still occur.'],
   ['Use blood pressure and urine volume as substitutes for serum sodium measurement','These assess aspects of circulation and fluid balance. They cannot quantify the serum sodium change.'],
   ['Request another hypertonic dose based only on the original sodium value','Repeat treatment depends on current symptoms, the measured sodium trend, and the correction target. The initial value alone is insufficient.'],
  ],
  studyNote:'Track sodium trends and urine output closely during hypertonic treatment. Rising urine output can signal faster correction.',
 },
 {
  id:'ORN-9f8cc2b0d2496acf5a1d',source:families,
  scenario:'A family has missed two visits to review an older adult’s care plan. During a home assessment, the caregiver explains that the bus route was cut and the available appointment times overlap with work. The caregiver accurately explains the plan and wants to continue it.',
  prompt:'Which action best addresses the priority identified in the assessment?',
  choices:[
   ['Work with the caregiver to arrange an accessible follow-up and verify that the plan fits the family’s schedule','The family demonstrates understanding and interest. The practical barriers are transportation and scheduling, which the follow-up plan can address.'],
   ['Repeat the full health teaching before discussing appointment access','The caregiver already demonstrates understanding. Teaching alone leaves the identified access barriers unresolved.'],
   ['Assume another family member can take over and schedule the same visit','Available support and caregiver roles should be confirmed with the family. Assuming someone else can attend may repeat the barrier.'],
   ['Use the missed visits alone to judge that the family cannot manage the home plan','Missed visits can reflect structural barriers. The home assessment provides separate evidence of understanding and strengths.'],
  ],
  studyNote:'Assess a family’s actual strengths and access barriers before deciding how to support follow-up.',
 },
 {
  id:'ORN-b578a98e5246487a7c4a',source:literacy,
  scenario:'Two caregivers will alternate days caring for a child with a new home medicine schedule. They obtained the medicine but give different answers when asked who will administer the evening dose on changeover days.',
  prompt:'Which action best confirms that the discharge plan can be followed safely?',
  choices:[
   ['Agree on a written handoff plan and have both caregivers explain who gives and records the dose','Teach-back from both caregivers checks that the responsibility and dose-recording plan are understood on changeover days.'],
   ['Ask one caregiver to sign for the instructions on behalf of both','A signature does not show that both caregivers understand the shared handoff plan.'],
   ['Review how to measure the dose without resolving who gives it','Accurate measurement matters, but unclear responsibility can still cause a missed or duplicated dose.'],
   ['Ask whether the instructions seem clear and proceed if both say yes','A yes-or-no question can miss different interpretations. Having the caregivers describe the plan tests understanding.'],
  ],
  studyNote:'Use teach-back to confirm who gives and records medicine when caregiving shifts between people.',
 },
 {
  id:'ORN-b8fe8c09253b4ae434f3',source:clozapine,
  scenario:'A client taking clozapine reports fever and painful swallowing. The nurse reviews a recent complete blood count with differential. The total white count is within the laboratory’s interval, but the absolute neutrophil count has fallen markedly below the treatment plan’s alert threshold.',
  prompt:'Which finding and action should take priority?',
  choices:[
   ['The low absolute neutrophil count and symptoms warrant urgent communication and infection assessment','Clozapine can cause severe neutropenia. The absolute neutrophil count, together with possible infection symptoms, guides escalation even if the total white count seems reassuring.'],
   ['The total white count rules out the medication-related concern, so routine follow-up is adequate','The total count includes other white cells. It does not rule out a low absolute neutrophil count or explain the fever.'],
   ['Review the clozapine supply before assessing symptoms because the count is within the total reference interval','Medication continuity matters, but possible infection with a low neutrophil count requires immediate attention.'],
   ['Use platelet count as the deciding measure for clozapine-related infection risk','Platelets inform bleeding assessment. The absolute neutrophil count is the relevant measure for this drug-related infection concern.'],
  ],
  studyNote:'For clozapine-related neutropenia, assess the absolute neutrophil count and symptoms rather than relying on the total white count.',
 },
];
