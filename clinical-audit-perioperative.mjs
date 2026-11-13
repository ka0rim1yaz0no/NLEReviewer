const timing='https://www.ncepod.org.uk/classification.html';
const surgery='https://openstax.org/books/fundamentals-nursing/pages/31-summary';
const postop='https://openstax.org/books/medical-surgical-nursing/pages/27-1-postanesthesia-recovery-and-care';
const biopsy='https://www.cancer.gov/types/breast/diagnosis';
const cancer='https://www.cancer.gov/about-cancer/treatment/types/surgery';
const consent='https://www.facs.org/for-patients/preparing-for-surgery/informed-consent/';
const prevention='https://www.cancer.gov/types/breast/causes-risk-factors/prevention/preventive-breast-surgery';
const dislocation='https://www.orthoinfo.org/bodypart/shoulder/dislocated-shoulder/';
const openFracture='https://www.nice.org.uk/guidance/ng37/chapter/recommendations';
const bleeding='https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines';
const fatEmbolism='https://doi.org/10.1097/TA.0000000000004434';
const neurovascular='https://aci.health.nsw.gov.au/__data/assets/pdf_file/0004/458185/ACI-MSK-Neurovascular-assessment.pdf';
const amputation='https://www.veteranshealthlibrary.va.gov/RelatedItems/3%2C88864';
const arterial='https://www.aacn.org/docs/Photos/Procedure-59-4ihnnti3.pdf';
const pump='https://www.bd.com/documents/international/guides/directions-for-use/infusion/1000DF00498.pdf';
const library='https://www.ismp.org/system/files/resources/2020-10/ISMP176C-Smart%20Infusion%20Pumps-100620.pdf';
const readiness='https://www.resus.org.uk/library/quality-standards-cpr/acute-care-equipment-and-drug-lists';
const ventilator='https://www.nhlbi.nih.gov/health/ventilator';
const infiltration='https://www.royaldevon.nhs.uk/media/dgnlpvgi/foi-rdf1852-23-extravasation-injuries.pdf';
const skin='https://www.healthquality.va.gov/HEALTHQUALITY/guidelines/WRC/PIP/PIP-CPG_2026-Guideline_Final_20261020.pdf';
const moisture='https://www.ncbi.nlm.nih.gov/books/NBK622827/?report=reader';

export const perioperativeCases={
 'SIT-NP3-classification-of-surgery-01':{
  source:timing,
  scenario:'An adult with a perforated abdominal viscus has a pressure of 78/42 mm Hg despite initial resuscitation. The decision is made to operate now while circulatory support continues.',
  assessment:'This is an immediate life-saving operation. Hemodynamic deterioration from perforation makes delay unsafe, and resuscitation can continue alongside preparation for surgery.',
  action:'Activate the urgent surgical pathway, monitor perfusion, assist ordered resuscitation and coordinate immediate transfer. Communicate current instability, treatments and remaining safety checks.',
  teaching:'Explain briefly why surgery is needed now and what the team is doing to stabilize circulation. Use the applicable emergency consent policy while limiting avoidable delays.',
  outcome:'Verify timely transfer and operative preparation, airway and hemodynamic support and communication of the emergency and treatments.',
  reasoning:'Timing is classified by the threat and how long intervention can safely wait. A perforation with shock requires immediate action, even though the operation may also be described by its therapeutic purpose.',
  safety:'Scheduling is appropriate when the patient can safely wait. Evidence of profound circulatory deterioration means this operation cannot be moved to a routine elective date.',
  followUp:'Verify current blood pressure and perfusion, level of support and whether operative care and the emergency handoff occurred without avoidable delay.',
  alternate:'Voluntary deliberation and risk discussion are important for elective prevention. Here assess immediate operative readiness, perfusion and completion of the emergency process.',
  edits:{action:{2:['Postpone preparation until a routine elective visit to discuss preventive options','An elective consultation can allow extended discussion of preventive alternatives. This perforation with shock requires immediate treatment and the applicable emergency consent process.']}},
 },
 'SIT-NP3-classification-of-surgery-02':{
  source:biopsy,
  scenario:'An adult is scheduled for an image-guided core biopsy of an abnormal breast lesion. The patient believes taking the cores guarantees that any cancer is cured.',
  assessment:'The primary purpose is diagnostic tissue sampling. The patient needs to understand what the pathology result may show and how it will inform later treatment.',
  action:'Review the purpose and the result follow-up plan and use teach-back. Direct questions about risks, alternatives or additional treatment to the clinician doing the procedure before consent.',
  teaching:'A core biopsy samples the lesion for pathology. The result helps identify the diagnosis and inform treatment. Even if abnormal tissue is sampled, that procedure alone gives no assurance of a cure.',
  outcome:'The patient explains the diagnostic purpose, how the result will be shared and why further assessment or treatment may still be needed.',
  reasoning:'Diagnostic procedures answer a clinical question by examining tissue. Therapeutic removal and cure depend on the disease, treatment plan and extent.',
  safety:'Definitive surgery can be intended to cure selected localized cancers. Calling this diagnostic biopsy a guaranteed cure can undermine informed consent.',
  followUp:'Record what the patient correctly explained about the biopsy. Before proceeding, confirm understanding of treatment limits and how pathology results will be communicated.',
  alternate:'Discussing future risk reduction fits a proposed preventive operation. This case needs documented understanding that the scheduled procedure collects tissue for diagnosis.',
  edits:{
   recognition:{2:['A decision about definitive cancer surgery after diagnosis has already been confirmed','Planning definitive surgery is appropriate once diagnosis and relevant findings are known. This patient is awaiting the biopsy that helps establish those findings.']},
   action:{1:['Arrange counseling for preventive surgery and leave the question about the biopsy unanswered','Counseling about preventing future disease fits selected high-risk patients. Here clarify why tissue is being sampled and what the result can establish.']},
   reasoning:{3:['Definitive treatment can remove a known localized tumor when that is the intended procedure','Complete removal can be the goal of selected cancer surgery. A core biopsy is performed to obtain diagnostic tissue and gives no assurance of a cure.']},
  },
 },
 'SIT-NP3-classification-of-surgery-03':{
  source:cancer,
  scenario:'An adult with metastatic cancer is offered an operation to relieve a bowel obstruction. The surgeon documented that the goal is symptom relief. The family believes the operation is intended to remove all cancer.',
  assessment:'This is palliative surgery because the documented goal is to relieve symptoms of obstruction. Assess how the patient understands expected benefit, burdens and alternatives.',
  action:'Help arrange a discussion with the surgeon about what symptoms may improve, the likely burdens, alternatives and what matters to the patient. Confirm the patient’s questions are answered.',
  teaching:'Explain the intended relief from obstruction and what recovery may involve. The recorded plan does not aim to eradicate cancer throughout the body.',
  outcome:'The patient describes the proposed symptom benefit, limitations and alternatives and makes a decision that matches their own priorities.',
  reasoning:'The purpose is determined by the intended effect, not whether an operation is extensive. Surgery can relieve symptoms in advanced cancer even when cure is not feasible.',
  safety:'Curative intent is appropriate for selected cancers when complete disease control is possible. Promising eradication conflicts with the documented goal in this case.',
  followUp:'Ask the patient to explain the intended symptom relief and limitations and record their decision or remaining questions before proceeding.',
  alternate:'Risk-reduction decisions concern preventing future disease in selected people. This discussion concerns relieving an existing obstruction and whether that benefit fits the patient’s goals.',
  edits:{
   action:{0:['Discuss risk-reduction surgery for preventing future disease and omit the current obstruction goals','Prevention discussions fit a person considering a risk-reducing operation. Here the purpose is to address an existing obstruction, and the patient needs a clear benefit and burden discussion.']},
   planning:{0:['The patient states how a preventive operation reduces the future chance of developing cancer','Risk reduction is an appropriate outcome when counseling about preventive surgery. This case requires understanding of the expected relief and limitations of treatment for an existing obstruction.']},
  },
 },
 'SIT-NP3-classification-of-surgery-04':{
  source:consent,
  scenario:'An adult with an inherited high risk for breast cancer is considering risk-reducing surgery. During an elective preoperative visit the patient reports family pressure and says alternatives have yet to be explained.',
  assessment:'The operation aims to reduce future risk, but the patient needs information and freedom from pressure. A signed form alone does not resolve those concerns.',
  action:'Offer a private opportunity to talk and alert the surgeon that the patient has unresolved questions and feels pressured. Pause the elective consent process until benefits, harms, alternatives and preferences have been reviewed.',
  teaching:['Explain that risk-reducing surgery lowers rather than eliminates risk. Ask about the expected benefit, limitations, and alternatives such as surveillance when appropriate.',prevention],
  outcome:'The patient can explain the options and realistic risk changes and can freely state a decision, including choosing additional time before signing.',
  reasoning:'Informed consent includes understanding the purpose, risks and alternatives and making a voluntary choice. A family preference cannot substitute for the patient’s own decision.',
  safety:'Family involvement can be helpful with the patient’s agreement. Proceeding with unresolved concerns about coercion or alternatives can undermine valid consent.',
  followUp:'Document what the patient understands, the voluntary decision and any remaining questions. Confirm that the clinician addressed alternatives before the elective procedure.',
  alternate:'Symptom relief is the goal of palliative surgery for an existing problem. This patient needs follow-up on future risk reduction, alternatives and freedom to decide.',
  edits:{
   action:{0:['Discuss only relief of symptoms from an established cancer and proceed without reviewing alternatives or the reported pressure','Symptom-focused counseling fits an established condition when palliation is the goal. Here address preventive alternatives and the patient’s ability to choose freely.']},
   reasoning:{3:['An immediate life-saving operation may need the emergency decision pathway when delay threatens survival','The emergency pathway is appropriate for a time-critical clinical threat. This elective prevention decision allows time to review alternatives and address family pressure.']},
  },
 },
 'SIT-NP4-musculoskeletal-trauma-01-R2':{
  source:dislocation,
  scenario:'After a fall, an adult has a visibly deformed painful shoulder and cannot move the arm normally. The patient is alert, and distal circulation and sensation have yet to be checked. A bystander offers to pull on the arm.',
  assessment:'Deformity and inability to move after trauma suggest dislocation, with fracture also possible. Assess distal perfusion and sensation and seek urgent skilled evaluation.',
  action:'Support the arm in its position of comfort, assess distal motor, sensory and circulatory status and arrange urgent medical evaluation. Reduction should be performed by an appropriately trained clinician.',
  teaching:'Avoid pulling on the extremity or trying to reduce it. Report new numbness, increasing pain, coldness or hand weakness immediately.',
  outcome:'Document distal status before and after immobilization and any clinician-performed reduction. Verify pain, alignment and the follow-up plan.',
  reasoning:'An unassessed forceful maneuver can worsen a fracture or injure nerves or vessels. The reduction and imaging plan depends on the clinical assessment.',
  safety:'Reduction can be appropriate for trained clinicians in an equipped setting. A forceful attempt by a bystander before assessment is unsafe.',
  followUp:'Record the initial and repeat pulses, refill, sensation and movement and confirm that the patient reached the appropriate trauma pathway.',
  alternate:'An individualized care plan can follow assessment of other limb injuries. This case needs specific evidence that the shoulder was protected and distal function was checked.',
 },
 'SIT-NP4-musculoskeletal-trauma-02':{
  source:openFracture,
  scenario:'After a road collision, an adult has an open lower-leg fracture with ongoing external bleeding and visible bone. The trauma team is responding.',
  assessment:'An open fracture with bleeding requires trauma assessment, hemorrhage control and examination for distal neurovascular injury. Exposed tissue also raises infection and contamination concerns.',
  action:['Activate trauma care and control bleeding per protocol without pushing exposed bone back into the wound. Once bleeding is addressed, protect the wound, assess and document distal function and prepare prescribed antibiotics and surgical care.',bleeding],
  teaching:'Explain that the limb and wound need protection and urgent treatment. Ask the patient to report new numbness, increasing pain or a cold or weak foot.',
  outcome:'After initial treatment, reassess bleeding, circulation and distal function and confirm the wound is protected and antibiotics and surgical evaluation were arranged.',
  reasoning:'Life-threatening bleeding takes priority. The open wound also needs prompt infection prevention and specialist management because the bone and tissues are exposed to contamination.',
  safety:'Trained clinicians may align and stabilize an injured limb when indicated by protocol. Pushing exposed bone into the wound as first aid risks additional injury and contamination.',
  followUp:'Document hemorrhage control, wound coverage, distal findings and antibiotic and surgical steps. Repeat checks for renewed bleeding or worsening limb perfusion.',
  alternate:'Respiratory and neurologic support applies if fat embolism syndrome develops. This initial open injury requires reassessment of hemorrhage, contamination and distal function.',
  edits:{action:{1:['Immobilize the limb and check distal function before addressing the active bleeding','Immobilization and distal assessment are important after immediate hazards are addressed. With an actively bleeding open fracture, hemorrhage control takes priority.',bleeding]}},
 },
 'SIT-NP4-musculoskeletal-trauma-03':{
  source:fatEmbolism,
  scenario:'About 24 hours after a femoral shaft fracture, an adult becomes suddenly breathless and confused. Oxygen saturation is falling and new petechiae appear over the upper chest.',
  assessment:'New hypoxemia, altered mentation and petechiae after a long-bone fracture raise concern for fat embolism syndrome. Other causes of acute deterioration still require evaluation.',
  action:'Activate emergency assessment, support oxygenation and ventilation and monitor hemodynamics and mental status. Prepare for higher-level care and investigation of other urgent causes.',
  teaching:'Teach the patient or family to report new breathing difficulty, confusion or rash after a major fracture promptly. Current deterioration needs clinical response now.',
  outcome:'Reassess oxygenation, work of breathing, mental status and circulation while the underlying cause is investigated and supportive treatment continues.',
  reasoning:'Fat embolism syndrome can produce respiratory, neurologic and skin findings after a major fracture. The cluster helps raise suspicion but cannot alone confirm the diagnosis.',
  safety:'Routine fracture checks are appropriate once the patient is stable. Waiting on the next scheduled review despite hypoxemia and confusion delays emergency care.',
  followUp:'Document oxygen requirement, breathing effort, consciousness and perfusion after initial care. Escalate any failure to stabilize.',
  alternate:'Bleeding and contamination follow-up fits an open fracture. The new priority here is respiratory and neurologic deterioration after the fracture.',
 },
 'SIT-NP4-musculoskeletal-trauma-04':{
  source:neurovascular,
  scenario:'After a new forearm cast, an adult reports increasing pain and numb fingers. The fingers are cooler than on the other hand and capillary refill is delayed. A radial pulse is still palpable.',
  assessment:'Cool fingers, delayed refill, pain and paresthesia indicate possible compromised distal circulation or nerve function. A palpable pulse does not exclude early compartment syndrome.',
  action:'Assess pain, sensation, movement, color, warmth, refill and pulses and obtain urgent orthopedic review. Follow the pathway for relieving external restriction under appropriate supervision.',
  teaching:'Report increasing pain, numbness, weakness, swelling or coolness promptly. Follow cast instructions and avoid waiting for the fingers to become pulseless.',
  outcome:'Document repeat distal circulation and nerve findings after urgent evaluation and any cast treatment. Escalate signs that persist or worsen.',
  reasoning:'A restrictive cast and swelling can impair blood flow or raise tissue pressure. Deteriorating distal findings need immediate evaluation even when a pulse is still present.',
  safety:'Proper cast adjustment or release belongs with trained clinicians. Inserting a sharp object can damage skin and cannot safely address new distal neurovascular changes.',
  followUp:'Record the findings before and after the team’s response. Repeat neurovascular checks and document any changes in pain, movement, sensation and perfusion.',
  alternate:'Pressure relief with repeated neurovascular checks is appropriate when the team identifies a need for release. The handoff gives a neurovascular outcome but does not document that a release was performed. Confirm what the team did and repeat the examination.',
  edits:{planning:{3:['Relief of elevated compartment pressure after a documented decompression','Relieved pressure and preserved function are treatment outcomes once decompression is indicated and performed. This care plan first calls for urgent distal assessment and protection while the cause is evaluated.']}},
 },
 'SIT-NP5-critical-care-equipment-01-R2':{
  source:arterial,
  scenario:'After raising the head of the bed, a nurse finds the arterial transducer well below its prescribed reference level. The displayed pressure rises abruptly while the patient’s examination and cuff pressure remain similar.',
  assessment:'The transducer position can produce a falsely high pressure. Assess the patient and waveform and compare with a reliable reference measurement before acting on the new reading.',
  action:'Re-level the transducer to the prescribed reference after repositioning. Verify the zero and waveform as required by protocol and compare pressure with the patient’s clinical findings.',
  teaching:'Explain that moving the bed can affect the measured number when the transducer does not move to the same reference height. Ask staff to check it after position changes.',
  outcome:'Confirm that the transducer is at the prescribed level and the tracing and repeat measurement are credible in the clinical context. Document the correction.',
  reasoning:'The fluid column adds hydrostatic pressure when the transducer sits below reference. That produces an artificially high value even when the patient’s blood pressure has not changed.',
  safety:'Treat a clinically verified severely high pressure promptly under protocol. Titrating therapy from this single uncorrected reading risks treating an artifact.',
  followUp:'Document the reference level and repeat arterial and comparison readings. Verify that treatment decisions use the corrected measurement and bedside assessment.',
  alternate:'Resolving tubing occlusion is an infusion-pump outcome. This event requires a correctly leveled and clinically consistent arterial pressure.',
  edits:{recognition:{3:['A verified new increase in the patient’s systemic arterial pressure','A true increase should be evaluated when reliable measurements and clinical findings support it. Here the transducer is too low and cuff pressure and examination are stable.']}},
 },
 'SIT-NP5-critical-care-equipment-02-R2':{
  source:pump,
  scenario:'A pump delivering an IV medicine stops with a downstream occlusion alarm. A closed clamp is visible downstream, and the IV site has no new pain or swelling. A trainee proposes opening the clamp toward the patient before checking how to release stored pressure on this model.',
  assessment:'Downstream resistance can leave compressed fluid in the line. Assess the patient, site, tubing and medicine and identify the device-specific method before clearing the obstruction.',
  action:'Stop or hold delivery, assess the IV and tubing and follow the model’s instructions and local protocol to isolate or manage stored pressure. Escalate if delivery of an essential drug is interrupted.',
  teaching:'Explain why an occlusion alarm needs assessment before flow restarts. The required steps and any bolus-reduction feature depend on the pump and line setup.',
  outcome:'Verify safe pressure management, a patent approved IV route and correct medication and rate before restarting. Observe the patient and site afterward.',
  reasoning:'Opening a pressurized line toward the patient can deliver extra medicine as a bolus. Follow the manufacturer’s procedure for the specific pump and set.',
  safety:'Restoring flow promptly matters for essential medicines. Opening an occluded pressurized line straight toward the patient before controlling stored pressure is unsafe.',
  followUp:'Document the cause, pressure-management steps, checked IV site and verified delivery. Monitor the patient for a missed dose or unintended bolus when indicated.',
  alternate:'Replacing a failed defibrillator restores emergency readiness. This check concerns safe handling of an occluded infusion and verified drug delivery.',
  edits:{reasoning:{2:['A leaking vasoconstrictor infusion can injure surrounding tissue when extravasation occurs','A painful, swollen infusion site would require assessment for extravasation. This case documents a visible closed clamp and a clear site, so follow the device procedure for residual line pressure before resuming.']}},
 },
 'SIT-NP5-critical-care-equipment-04':{
  source:readiness,
  assessment:'A failed readiness check creates an immediate resuscitation equipment gap. Verify the unit has immediate access to a functioning alternative and notify the responsible team.',
  action:'Arrange and verify a working replacement or approved immediate backup. Identify the faulty device as out of service and report it for repair using local procedures.',
  teaching:'Tell relevant staff where the verified replacement is located and how to report a readiness failure. Document the original check and corrective action.',
  outcome:'A functioning device and essential accessories are immediately available and the team can locate them. The equipment failure is recorded and handed over for resolution.',
  reasoning:'Timely defibrillation depends on tested equipment being available before an emergency. A repair request alone cannot restore coverage.',
  safety:'A device can return to service after required checks pass. Leaving a failed defibrillator as the designated emergency device can delay a shock.',
  followUp:'Confirm actual readiness of the replacement, including the device’s required test and supplies, and communicate its location at handoff.',
  alternate:'Confirming that an infusion resumed safely matters after an occlusion. The reported event here concerns immediate defibrillator availability.',
 },
 'SIT-CROSS-asepsis-iv-therapy-wound-care-02':{
  source:infiltration,
  scenario:'During a peripheral infusion of plain 0.9% sodium chloride, the site becomes swollen, cool and painful and the fluid stops flowing freely.',
  assessment:'Cool swelling and slowing of a nonvesicant infusion suggest infiltration. Check pain, the extent of swelling and distal color, warmth, sensation and refill.',
  action:'Stop the infusion immediately, identify the fluid and assess the limb and site. Follow the nonvesicant infiltration pathway for removing the cannula and management. If the agent is uncertain or potentially harmful, follow its extravasation guidance before removing the device.',
  teaching:'Ask the patient to report new pain, swelling, tightness, leakage or numbness around an infusion. Explain that the site will be assessed before IV treatment continues.',
  outcome:'Verify that further exposure stopped, then reassess swelling, skin, pain and distal circulation and document the treatment and follow-up checks.',
  reasoning:'The fluid has likely leaked outside the vein. Flushing or forcing more fluid through a suspect line can increase exposure and tissue pressure.',
  safety:'Flushing can confirm patency during routine care of a functioning IV when the site is normal. A swollen, painful and cool site needs the infusion stopped and assessed before any further use.',
  evaluation:[
   'Stopping the infusion confirms the first target. Mark the full goal achieved only after the swelling and distal findings have been assessed and appropriately managed.',
   'Record the target unmet only with evidence that an expected result failed. Here further tissue exposure stopped and the response of the swelling is still unknown.',
   'A combined result can be documented once reassessment is available. Record the stopped infusion now and note the outstanding site check.',
   'Record that further exposure stopped, then check edema, pain, skin and distal perfusion and document management of the site.',
  ],
 },
 'SIT-CROSS-asepsis-iv-therapy-wound-care-04-R2':{
  source:moisture,
  scenario:'An adult with frequent urinary leakage develops diffuse moist redness and several superficial areas of irritation across the perineum and adjacent folds. No localized lesion overlies a bony prominence.',
  assessment:'The distribution and repeated urine exposure support possible incontinence-associated dermatitis. Assess moisture exposure, skin damage and infection findings and check separately for pressure risk.',
  action:'Assess skin and incontinence, cleanse gently after episodes and apply an appropriate barrier product under the care plan. Change wet products promptly and assess for additional causes if healing is poor.',
  teaching:'Report persistent wetness, pain or worsening redness. Clean gently and use the recommended barrier without harsh scrubbing.',
  outcome:'Compare moisture exposure, discomfort, skin integrity and lesion extent with baseline. Reassess for new infection or coexisting pressure injury.',
  reasoning:'Urine exposure can injure the skin barrier over a broad moist area. Pressure injury can coexist, so use distribution, skin findings and pressure history to guide care.',
  safety:'Use pressure-injury staging when the assessment supports skin damage from pressure or shear. Calling all diffuse perineal moisture injury pressure-related can lead to an unsuitable care plan.',
  evaluation:[
   'Reduced moisture is one confirmed finding. The full target also needs evidence that skin healing was reassessed.',
   'Record reduced moisture as partial progress. Check the documented skin reassessment and examine erythema, irritation, comfort and any skin breakdown.',
   'A goal can be marked unmet when an assessment shows failure. The handoff reports less moisture and gives no result for the skin check.',
   'Record the confirmed reduction in moisture now. Add the skin findings when the planned reassessment has been performed.',
  ],
 },
};

export const perioperativeLegacyCases={
 'CROSS-005':{
  source:skin,
  scenario:'An inpatient unable to turn without help has a localized nonblanchable red area over the sacrum. The skin is intact and there is no diffuse perineal moisture injury.',
  decisions:{
   1:{
    0:['General immobility risk without localized skin injury','Immobility increases the risk of pressure injury and thrombosis. This assessment already shows a localized nonblanchable change, so document and address it directly.'],
    2:['Unmet caregiver support needs during home discharge planning','Caregiver resources matter when a home plan depends on them. This inpatient already has a focal sacral change requiring immediate pressure relief and reassessment.'],
    3:[null,'Localized nonblanchable redness on intact skin over a bony prominence is consistent with stage 1 pressure injury when linked to pressure. Check color, temperature, firmness and pain, including where redness is difficult to see.'],
   },
   2:{
    0:[null,'Offload the sacrum, help the patient reposition and reassess the skin. Adjust the repositioning schedule and pressure redistribution surfaces to clinical needs.'],
    2:['Complete only the routine immobility checklist and postpone pressure relief until the next scheduled turn','Routine skin, mobility and thrombosis prevention are appropriate, but existing nonblanchable skin change calls for pressure relief now.'],
   },
   3:{
    0:[null,'Calling for help before transferring is appropriate for fall prevention. The skin teaching here also needs daily inspection, keeping skin protected from moisture and asking for help to reposition.'],
    2:[null,'Review inspection, clean dry skin and when to report changes. Arrange help with repositioning and avoiding pressure over the affected area.'],
   },
   4:{
    0:[null,'Document whether skin remains intact and whether redness, local temperature or pain improve or worsen after offloading. Continue pressure prevention even after improvement.'],
    2:[null,'Safe transfer without dizziness is useful when checking orthostatic tolerance or falls risk. It does not establish whether pressure relief protected the sacrum.'],
   },
   5:{
    1:[null,'Teaching inspection and skin protection is appropriate alongside repositioning and immediate offloading.'],
    3:[null,'Massage may be used for selected purposes away from compromised skin. Rubbing a persistently red bony area can damage tissue and should be avoided.'],
   },
  },
 },
 'NP3-061':{
  source:postop,
  scenario:'In the postanesthesia care unit, a recently extubated patient has decreased alertness, snoring respirations and reduced air movement. The anesthesia team has been called and airway support has begun.',
  decisions:{
   3:{
    1:[null,'When alert enough to participate, ask the patient to report difficulty breathing immediately. Staff must continue direct airway and ventilation assessment while alertness is reduced.'],
    3:[null,'A question about comfort and function is appropriate during procedure counseling. Acute postanesthesia care first tracks airway patency, ventilation and alertness.',consent],
   },
   4:{
    0:[null,'Look for improved air entry, effective breathing and stable oxygenation after airway support. Reassess alertness and breathing frequently as anesthetic effects resolve.'],
    3:[null,'An informed voluntary decision is an outcome of preoperative consent. It cannot measure response to airway support after anesthesia.',consent],
   },
  },
 },
};

export const perioperativeDirectCases={
 'EXP2-CROSS-asepsis-iv-therapy-wound-care':{
  source:skin,
  reasons:[
   'Deep tissue pressure injury can present as persistent deep red, maroon or purple discoloration or a blood-filled blister. Clearly visible adipose in an open full-thickness injury supports a different stage.',
   'Stage 4 involves exposed or directly palpable deeper structures such as fascia, muscle, tendon or bone. None is described in the visible wound bed.',
   'Visible adipose in full-thickness skin loss, with no exposed or directly palpable deeper structures, fits stage 3. Keep documenting the wound bed and reassess for change.',
   'Use unstageable when slough or eschar obscures the extent of a full-thickness injury. The wound base is visible here.',
  ],
 },
 'EXP2-NP3-classification-of-surgery':{
  source:surgery,
  reasons:[
   'A diagnostic operation obtains information such as tissue pathology. The contracture release is planned to restore hand use.',
   'Prophylactic surgery aims to reduce future disease risk in an appropriate patient. It does not describe the primary goal of correcting existing scar-related loss of movement.',
   'Reconstructive surgery can restore form or function after injury. This operation aims to release restrictive scar tissue and improve grip.',
   'Palliative surgery targets symptom relief when that is the chief goal. The main stated goal here is restoration of movement and hand function.',
  ],
 },
 'EXP2-NP4-musculoskeletal-trauma':{
  source:amputation,
  reasons:[
   'Cushioning can protect selected pressure points as directed. Sustained knee flexion still threatens later extension after transtibial amputation.',
   'Prolonged knee flexion can lead to flexion contracture, interfering with gait and prosthetic use. Follow the rehabilitation team’s positioning and range-of-motion plan.',
   'The knee remains important for transfers, walking and prosthetic use. Preserve its movement within the prescribed healing and exercise plan.',
   'Gentle guided motion can prevent stiffness when cleared. Forceful unsupervised stretching through severe pain risks injury and calls for clinical review.',
  ],
 },
 'EXP2-NP5-critical-care-equipment':{
  source:library,
  reasons:[
   'A message can be informational on some devices. This hard limit specifically prevents entry outside the configured boundary.',
   'A hard limit blocks out-of-range programming in the selected drug library. Recheck the order, drug, concentration, units and library with the appropriate staff rather than bypassing the limit.',
   'An authorized clinician may override selected soft limits with review under local rules. A hard limit is configured to prevent the entry in that mode.',
   'Accepting an alert after clinical justification describes an overridable warning when policy allows it. Here the configured hard limit blocks the entry.',
  ],
 },
 'ORIG-NP3-classification-of-surgery-01':{
  source:timing,
  reasons:[
   'Immediate or emergency surgery is required when delay threatens life, limb or an organ. This patient is stable and booked weeks ahead.',
   'Reconstructive describes a purpose such as restoring form or function. The question asks how the operation was scheduled.',
   'Diagnostic surgery describes obtaining information. A planned hernia repair is classified here by when it can be done safely.',
   'An elective operation is arranged in advance when delay to the agreed date is clinically acceptable. This scheduled repair fits elective timing.',
  ],
 },
 'ORIG-NP5-critical-care-equipment-01':{
  source:ventilator,
  reasons:[
   'Dialysis can remove waste and excess fluid from the blood. A ventilator provides breathing support when the patient cannot ventilate adequately.',
   'Mechanical ventilation supports delivery of breaths and removal of carbon dioxide. The settings and oxygen concentration are adjusted to the patient’s needs.',
   'A ventilator can support gas exchange. It does not prevent all lung infections, and staff continue measures to reduce ventilator-associated complications.',
   'A defibrillator gives a shock when indicated for selected rhythms. A ventilator assists breathing and does not deliver electrical shocks.',
  ],
 },
 'ORN-ff0e53527bc3b555f03b':{
  source:postop,
  reasons:[
   'Preparation for induction occurs before anesthesia and surgery. This handoff follows the operation and describes recovery assessment.',
   'Intraoperative efforts include monitoring in the operating room and maintaining the sterile field. This client has already arrived in recovery.',
   'Teaching about recovery activities can start before the operation and continue later. This immediate assessment concerns breathing, circulation and the surgical site after anesthesia.',
   'Postanesthesia care is early postoperative care. Check airway and breathing, hemodynamic response to blood loss and the wound or dressing for complications.',
  ],
 },
};
