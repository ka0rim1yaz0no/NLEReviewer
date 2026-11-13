import {references as ref} from './clinical-case-references.mjs';

// The slots are the original decisions. A linked question can draw on the same
// decision in more than one displayed choice.
export const decisions={
 'CROSS-003-1':{
  1:'A shared name cannot resolve a date-of-birth mismatch. Verify two approved, person-specific identifiers against the intended order before any dose is given.',
  3:'A commonly prescribed drug can be appropriate for many patients. Its frequency on the ward provides no evidence about the identity of this patient.',
 },
 'CROSS-003-2':{
  2:'Pause the dose and have the discrepancy resolved through the approved identification process. Compare two approved identifiers with the corrected patient record and intended order before resuming.',
  3:'An authorized record correction may be needed after identity is established. Copying the wristband date into the record first could conceal that the record or the band belongs to someone else.',
 },
 'CROSS-003-3':{
  1:'A prompted yes-or-no response is weaker than asking the patient to state their identifiers. The shared name in this case would still leave the mismatch unresolved.',
  3:'Ask a patient who can respond to state the approved identifiers. Compare them with the band and intended order, then use the facility’s process to resolve anything that differs.',
 },
 'CROSS-003-4':{
  1:'Name is one permissible identifier under policy. Because these patients share a name, also resolve the birth-date discrepancy before charting verification as complete.',
  2:'Verify that two approved identifiers now connect this patient to the intended order. Proceed with the remaining medication checks only after the identity discrepancy is resolved.',
 },
 'CROSS-003-5':{
  1:'A bed number helps staff locate a patient. It is not person-specific and cannot replace the second identifier for this medication order.',
  3:'Repeating the two-identifier comparison after clarifying the record is appropriate. It verifies that the resolution links the person and the intended medication order.',
 },
 'CROSS-006-1':{
  0:'The protocol and label specify different concentrations. At the same programmed flow, the 2 units/mL bag would deliver twice the intended insulin dose.',
  1:'Units/hour expresses dose per time. Units/mL expresses concentration. Use both to calculate mL/hour only after the concentration meets the verified protocol.',
 },
 'CROSS-006-2':{
  0:'The programmed flow rate applies to the approved 1 unit/mL preparation. Using it with the 2 units/mL bag would deliver 4 units/hour instead of 2 units/hour.',
  3:'Keep the discrepant bag disconnected. Verify the order and obtain the approved 1 unit/mL preparation before using the protocol’s calculated rate.',
 },
 'CROSS-006-3':{
  0:'For the verified bag, divide the ordered 2 units/hour by 1 unit/mL. The pump rate is 2 mL/hour. This calculation applies only after correcting the bag mismatch.',
  1:'At 1 mL/hour, the approved bag gives 1 unit/hour. A concentration of 1 unit/mL does not mean the pump should use the number one as the rate.',
 },
 'CROSS-006-4':{
  1:'Multiplying 1 unit/mL by 2 mL/hour confirms 2 units/hour. Verify the approved bag, the programmed rate and all required insulin checks before starting.',
  2:'With this concentration, 1 mL/hour would deliver 1 unit/hour. It would be correct only for a different ordered dose or a different verified protocol.',
 },
 'CROSS-006-5':{
  0:'Comparing the label and validated protocol before connecting the tubing is appropriate. The discrepancy is the reason to obtain the approved preparation.',
  2:'An alternative concentration would require a verified order and a compatible validated protocol. Connecting this discrepant bag during clarification could deliver an unintended dose.',
 },
 'CROSS-016-1':{
  0:'Muscle weakness can occur at either potassium extreme. The repeat nonhemolyzed value of 6.3 mmol/L and new ventricular ectopy take priority over the original reason for replacement.',
  2:'The verified elevation and new ventricular ectopy indicate clinically important hyperkalemia while potassium is still being infused. Act promptly to prevent worsening dysrhythmia.',
 },
 'CROSS-016-2':{
  0:'A prescribed rate adjustment can be used during monitored routine replacement. Confirmed hyperkalemia with new ectopy calls for stopping the potassium and arranging emergency assessment now.',
  1:'Stop the potassium source, assess circulation and rhythm, and activate the urgent hyperkalemia response. The repeat specimen and ECG changes justify acting before a scheduled lab draw.',
 },
 'CROSS-016-3':{
  0:'Palpitations or new weakness during IV replacement warrant an immediate report. Both can accompany a dangerous potassium change and require rhythm and laboratory assessment.',
  2:'Potassium intake should follow the confirmed result and individualized plan. A potassium-containing salt substitute could aggravate the measured hyperkalemia in this case.',
 },
 'CROSS-016-4':{
  0:'Fewer palpitations are useful to report, but continued ectopy and an elevated repeat potassium show that the dangerous finding is still present.',
  3:'A falling repeat potassium and rhythm stabilization provide evidence of response. Keep monitoring for persistent or recurrent hyperkalemia per the treatment plan.',
 },
 'CROSS-016-5':{
  0:'Potassium chloride concentrate requires dilution and controlled infusion when replacement is indicated. A rapid IV push can cause arrest and is especially dangerous with verified hyperkalemia.',
  1:'Stopping the infusion and assessing circulation while help arrives is appropriate. It limits further potassium delivery and supports rapid treatment of the dysrhythmia risk.',
 },
 'CROSS-017-1':{
  2:'Check the prescribed interval before any repeat dose. It shows when a dose can be considered, while sedation and ventilation determine whether it is safe to give now.',
  3:'Drifting off during conversation is excessive opioid-related sedation even when the person can be awakened. Supplemental oxygen may maintain saturation while ventilation begins to deteriorate.',
 },
 'CROSS-017-2':{
  0:'Defer more opioid, assess depth and quality of breathing and level of alertness, and seek prompt review. Escalate per protocol if ventilation or responsiveness worsens.',
  1:'The respiratory rate is one part of reassessment. Repeating the opioid based on this rate would miss the concerning sedation and the limits of a saturation measured on oxygen.',
 },
 'CROSS-017-3':{
  0:'A pain score helps guide analgesia alongside a safety assessment. Severe pain in someone who repeatedly falls asleep does not establish that more opioid is safe.',
  2:'Tell the patient and observers to report difficulty staying awake or slow, shallow breathing while the team continues its own monitoring. These clues can precede serious respiratory depression.',
 },
 'CROSS-017-4':{
  0:'Sustained conversation and adequate breathing on repeated checks support recovery from excessive sedation. Reassess before any change to the analgesic plan.',
  1:'Responding briefly to stimulation is an assessment finding. Drifting off again during conversation shows that sedation remains excessive.',
 },
 'CROSS-017-5':{
  2:'An opioid-sparing option can be appropriate after clinical review while sedation and ventilation are monitored. It addresses pain without immediately adding another sedating dose.',
  3:'The allowed interval and pain rating inform the plan when the safety assessment is reassuring. The repeated loss of alertness here makes another dose unsafe pending review.',
 },
 'CROSS-019-1':{
  0:['Visible bowel through a separated postoperative incision indicates evisceration. The current case instead presents conflicting documentation of the operative side.',ref.wound],
  1:'A site mark that disagrees with consent is an unresolved wrong-site risk. Flag it before sedation or the procedure and use the team’s verification process.',
 },
 'CROSS-019-2':{
  2:'Stop preparation for the procedure and reconcile the consent, planned site and mark with the responsible team and the patient when possible. Complete the formal time-out before starting.',
  3:'Upright positioning may help an alert patient with dyspnea when appropriate. It does not reconcile conflicting operative-site information in this scenario.',
 },
 'CROSS-019-3':{
  0:['Avoiding strain and reporting a sudden separation matter during postoperative wound care. This patient is still undergoing pre-procedure site verification.',ref.wound],
  3:'Involve the patient in confirming the intended procedure and site before sedation when possible. The team still needs to reconcile the mark and written consent.',
 },
 'CROSS-019-4':{
  2:'The team should agree on the correct patient, procedure and site and resolve any mismatch before starting. The time-out documents that final agreement.',
  3:['Two identifiers confirm the person for the order. The team must also independently resolve the difference between the consent and the site mark.',ref.identity],
 },
 'CROSS-019-5':{
  1:'Proceed only after the conflicting site information is resolved and the team verifies the site in the time-out. Ignoring the conflict exposes the patient to wrong-site surgery.',
  2:'Patient participation before sedation is appropriate and adds another verification step. The responsible team must complete its own pre-procedure verification.',
 },
 'NP1-039-2':{
  1:'Scene safety comes first when responders might enter a hazardous area. The case describes patients who have already reached the treatment area, where clinical triage is the immediate task.',
  2:'When patient volume exceeds capacity, apply the adopted mass-casualty triage criteria and repeat assessment as condition or resources change.',
 },
 'NP1-039-3':{
  2:'Follow the referral and resource coordination plan when assigning facilities, transport and staff. Instructions to people awaiting care should focus on responder directions and reporting changes.',
  3:'Tell people awaiting assessment how to follow responder directions and report deteriorating symptoms. New findings should trigger re-triage rather than waiting on the original category alone.',
 },
 'NP1-039-4':{
  0:'Repeat triage when detailed assessment must wait and when a patient changes. A consistent framework helps compare priority under the same criteria.',
  3:'Following the incident plan supports logistics and allocation of resources. Follow-up on individual triage requires evidence that patients are reassessed and reprioritized when indicated.',
 },
 'NP2-049-1':{
  0:'Modest blood loss with stable observations may be consistent with normal recovery. Here 340 mL is accompanied by ongoing bleeding, pulse 116/min and pressure 92/56, which trigger the WHO first-response criteria.',
  2:'Infection can cause postpartum fever, uterine tenderness or systemic illness. The immediate heavy bleeding, abnormal vital signs and boggy fundus in this case favor atony as the working cause.',
  3:'Measured blood loss above 300 mL with abnormal hemodynamic signs meets the WHO threshold for activating the first response. The boggy fundus supports atony while other sources are assessed.',
 },
 'NP2-049-2':{
  0:'Call for help and begin the hemorrhage bundle promptly. Treat poor tone, organize the indicated uterotonic, tranexamic acid and IV fluids, and evaluate for a bleeding source with escalation.',
  3:'Massage is appropriate for a poorly contracted uterus. Temporary firmness does not show hemorrhage has resolved if bleeding or instability persists, so continue the bundle and reassessment.',
 },
 'NP2-049-3':{
  2:'After treatment, renewed heavy bleeding or lightheadedness warrants urgent help. Continue objective bleeding and vital-sign checks while arranging evaluation.',
  3:'A firm fundus can occur after tone improves or when the bleeding has another source. Faintness with continued bleeding is a warning sign even when the uterus feels firm.',
 },
 'NP2-049-4':{
  0:'A sustained firm fundus, decreasing measured bleeding and improving pulse and pressure together support response. Recheck to detect recurrent bleeding or deterioration.',
  1:'Firmness indicates that tone has improved. Rising blood loss and tachycardia suggest persistent hemorrhage, which can come from another source and requires escalation.',
 },
 'NP2-049-5':{
  0:'Objective measurement is appropriate during treatment. Combine the trend with tone, vital signs and the clinical response as the team addresses the bleeding source.',
  3:'The WHO pathway can trigger at 300 mL with an abnormal hemodynamic sign. The current measured loss, hypotension and ongoing bleeding make waiting for 500 mL unsafe.',
 },
 'NP3-062-1':{
  0:'Bowel visible through a separated abdominal incision identifies evisceration and exposes tissue to drying and injury. Call for urgent surgical assessment.',
  2:['A site-mark and consent mismatch calls for a stop in pre-procedure verification. Here the priority finding is exposed bowel after incision separation.',ref.surgery],
 },
 'NP3-062-2':{
  0:'Airway intervention takes priority if the patient cannot maintain the airway or ventilate. With exposed bowel and no airway failure described, summon surgical help and protect the tissue while assessing vital functions.',
  3:'Cover the exposed bowel with sterile dressings moistened with sterile 0.9% saline and call for immediate surgical help. Keep the patient NPO and avoid tension on the wound.',
 },
 'NP3-062-3':{
  1:'Routine wound checks suit an intact incision without new symptoms. A sudden opening needs immediate evaluation. Teach measures to limit strain and explain how to obtain urgent help.',
  2:'Teach the patient to avoid straining and to report a sudden pulling or opening sensation promptly. These findings can mark wound separation and require clinical assessment.',
 },
 'NP3-062-4':{
  1:'Maintaining moist sterile coverage until the surgical team treats the wound protects exposed tissue. Continue monitoring for deterioration while the team prepares definitive care.',
  2:['Confirming patient, site and procedure is required when preparing for surgery. It gives no information about whether the eviscerated tissue has been protected now.',ref.surgery],
 },
 'NP3-062-5':{
  1:'Reporting separation and avoiding strain are appropriate instructions. In the emergency, protect the bowel and arrange surgical care before further teaching.',
  2:'Returning exposed bowel is part of definitive surgical management. At the bedside protect it with sterile saline-moistened dressings and obtain urgent help without attempting replacement.',
 },
 'NP3-067-1':{
  1:'New dyspnea and a falling saturation after a drain is accidentally clamped suggest impaired pleural drainage. Assess for further respiratory or circulatory compromise.',
  2:'Prolonged expiration can accompany airflow obstruction. It would not explain the immediate decline associated with a clamp closing this pleural drain.',
 },
 'NP3-067-2':{
  0:'A radiograph can help assess tube position or lung expansion when ordered. Waiting for routine imaging leaves a deteriorating patient with an accidental obstruction.',
  2:'Assess breathing and call for urgent help while correcting the inadvertent clamp under the emergency drain protocol. Reassess saturation, ventilation and drain function promptly.',
 },
 'NP3-067-3':{
  2:'Antibiotic adherence and respiratory hygiene are appropriate for a prescribed infection plan. This episode calls for maintaining and monitoring a functioning pleural drain.',
  3:['Keeping the drainage system upright below the chest supports drainage during routine movement. Seek urgent help with worsening breathing and avoid routinely clamping the tube.',ref.drainTransfer],
 },
 'NP3-067-4':{
  0:'Improved breathing and a patent drainage system help show that correcting the obstruction worked. Continued deterioration needs immediate reassessment even after flow is restored.',
  1:'Less dyspnea can support a response to treatment. Persistent hypoxemia and obstructed drainage still require immediate reassessment and cannot establish that the drain problem resolved.',
  3:'A falling fever can help show recovery from an infection. Here assess the breathing response and verify that the drain is patent after the clamp is corrected.',
 },
 'NP4-081-1':{
  1:'High temperature and marked tachycardia with agitation suggest a different acute condition, such as thyrotoxicosis. Sweating and tremor with measured low glucose support hypoglycemia here.',
  3:'Adrenergic symptoms such as sweating and tremor can occur as glucose falls. A documented low value identifies the need to follow the hypoglycemia plan.',
 },
 'NP4-081-2':{
  0:'This adult is alert and can swallow safely at 56 mg/dL. Give fast-acting glucose and recheck in 15 minutes to decide whether another treatment is needed.',
  2:'Mealtime insulin can be appropriate with a meal according to the verified regimen. Giving it while glucose is 56 mg/dL can worsen the low level. Treat and reassess first.',
 },
 'NP4-081-3':{
  0:'Oral glucose applies to a person alert enough to swallow. When swallowing is unsafe, use the prescribed emergency treatment and summon help because oral intake risks aspiration.',
  1:'Keeping fast-acting glucose available supports timely self-treatment if alert and able to swallow. Recheck after treatment and use the emergency plan if help is needed.',
  3:'Monitoring can be spaced according to the recovery plan after the low glucose has resolved. A first dose does not establish recovery, so recheck after the recommended interval.',
 },
 'NP4-081-4':{
  0:'Once glucose reaches the recovery target and the symptoms improve, follow the ongoing meal and monitoring plan. A reading of 62 mg/dL is still low and needs another treatment.',
  1:'Mealtime or correction insulin may be indicated later under the individual plan. A rise to 62 mg/dL is still hypoglycemia, so insulin now could reverse the improvement.',
  2:'At the 15-minute reassessment, 62 mg/dL remains below 70 despite symptom improvement. Because swallowing is still safe, repeat fast-acting glucose and reassess again.',
  3:'Further monitoring after recovery follows the individual plan. At 62 mg/dL, treat again and recheck at the prescribed interval. Confusion is a late sign and should prompt assessment of swallowing safety.',
 },
 'NP4-082-1':{
  0:['Reduced foot sensation calls for a diabetic foot assessment. It does not explain deep breathing, dehydration, ketones and low pH in this confirmed acute DKA.',ref.feet],
  2:'Deep compensatory respirations together with ketones and metabolic acidosis support DKA in a person with diabetes. These findings establish why fluid and biochemical monitoring are urgent.',
 },
 'NP4-082-2':{
  2:'A falling glucose shows one treatment effect and can occur before acidosis resolves. Follow blood ketones plus pH or bicarbonate to judge DKA resolution.',
  3:'Start the prescribed isotonic fluid and obtain the pending potassium promptly. Verify the potassium before insulin because insulin can bring a low level down further and provoke dysrhythmia.',
 },
 'NP4-082-3':{
  1:'A prescribed fluid limit may be needed in fluid-overload states. In confirmed DKA with dehydration, follow the individualized resuscitation plan and monitor fluid response.',
  2:'Teach the sick-day insulin, glucose and ketone plan after stabilization. Include when to contact the team or seek urgent help for vomiting, ketosis or inability to hydrate.',
 },
 'NP4-082-4':{
  1:'Expected recovery includes improved volume status and biochemical resolution. Confirm clearance of ketosis plus recovery of pH or bicarbonate before transitioning from DKA treatment.',
  2:'Improved pressure and perfusion show response to fluids. The DKA goal also requires resolution of ketosis and acidosis, which stable blood pressure alone cannot show.',
 },
 'NP4-082-5':{
  0:'Glucose tracks part of the response. Stopping assessment when glucose improves risks leaving clinically important ketosis and acidosis untreated.',
  3:'Monitoring volume status, ketones and acid–base recovery is appropriate. It covers the effects that may lag behind the glucose decline.',
 },
 'NP4-083-1':{
  1:'Reduced protective sensation can leave pressure areas or minor injuries unnoticed. Assess the feet and teach daily surveillance to prevent ulcers.',
  2:['Hypothermia, reduced consciousness and hypoventilation can support severe decompensated hypothyroidism. The case describes chronic loss of protective sensation from diabetes.', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13452032/'],
 },
 'NP4-083-2':{
  0:'Inspect skin and footwear and assess protective sensation and circulation. These findings guide prevention and referral for a patient whose injuries may be painless.',
  1:['The DKA protocol applies to acute ketoacidosis. Peripheral neuropathy does not establish a hyperglycemic crisis, so concentrate on the indicated foot assessment.',ref.hyperglycemic],
 },
 'NP4-083-3':{
  2:['A sick-day glucocorticoid plan applies to patients with adrenal insufficiency who have been given those instructions. The scenario calls for foot injury prevention due to neuropathy.','https://www.nice.org.uk/guidance/ng243/chapter/Recommendations'],
  3:'Daily inspection and well-fitting shoes are appropriate because loss of protective sensation can hide pressure damage or injury. Arrange assistance when the patient cannot inspect safely.',
 },
 'NP4-083-4':{
  0:'Skin that remains intact without ulcers or infection is the intended prevention outcome. Continue surveillance even when the feet do not hurt.',
  1:['Improved acidosis and hydration are expected after successful treatment of a metabolic crisis. The follow-up for diabetic neuropathy assesses skin integrity, sensation and injury risk.',ref.hyperglycemic],
 },
};
