import {references as ref} from './clinical-audit-references.mjs';

// Each option below is keyed by the original question and by its zero-based
// choice. A rationale is reused when that exact decision is displayed again
// in the same case. A text override stays in its original answer slot.
export const legacyCases={
 'CROSS-001':{
  source:ref.standard,
  decisions:{
   1:{0:['The gloves used for care have no visible tear','Inspect gloves when exposure assessment calls for it. When gloves come off and the hands are visibly dirty, their condition does not change the need to wash.'],3:[null,'Visible soil requires soap and water. Gloves and alcohol rub alone do not remove material deposited on the hands.']},
   2:{0:[null,'Wash with soap and running water, rinse and dry. This removes visible material before the nurse touches shared equipment or another patient.'],2:['Use alcohol hand rub and resume care as soon as it dries','Alcohol rub is preferred for most routine healthcare hand hygiene when hands are not visibly soiled. Soap and water apply to this visible soil.']},
   3:{2:[null,'Perform hand hygiene before touching a patient and again after touching the patient or the surrounding equipment. After removing gloves, clean the hands again.'],3:['Perform hand hygiene only when gloves are unavailable','Gloves reduce direct exposure when indicated. Hands still need cleaning before appropriate care tasks and after glove removal.']},
   4:{0:[null,'No visible soil remains after washing, and drying completes handwashing. Keep using hand hygiene at each indicated contact.'],1:['The next pair of gloves fits over the remaining visible soil','Correctly fitted gloves protect during the next indicated task. They cannot substitute for removing visible soil before putting them on.']},
   5:{1:[null,'Cleaning hands before and after patient contact remains appropriate. For the current visibly soiled hands, use soap and water.'],3:[null,'Alcohol rub is appropriate in most routine care when hands are not visibly soiled. Used alone on these visibly dirty hands, it leaves material in place.']},
  },
 },
 'CROSS-002':{
  source:ref.asepsis,
  decisions:{
   1:{0:[null,'Moisture that crosses a porous drape can carry microorganisms from the underlying surface into the sterile field. Treat the affected field as contaminated.'],1:['The drape is above waist level and continuously in view','Height and visibility help maintain an intact field. They cannot restore sterility after moisture has passed through the material.']},
   2:{2:['Document the wet area, cover it with another drape and continue the procedure','Documenting a break can help the team review it. Covering a soaked field does not restore a safe surface or make supplies exposed to it sterile.'],3:[null,'Stop the sterile task. Discard the contaminated setup and reestablish a dry sterile field before continuing.']},
   3:{0:[null,'Maintain visibility and keep the field at a suitable working height. Use a dry barrier and replace it if moisture, a tear or unsterile contact compromises the field.'],3:['Keep the wet drape if the site remains above waist height','The height rule helps maintain access and visibility when the field is intact. A porous drape with moisture that has wicked through still needs to be replaced.']},
   4:{1:[null,'A dry, intact field maintained throughout care is an observable outcome of the corrected technique. Inspect the barrier and pause again if it is compromised.'],3:['The procedure continues without delay, but the same wet drape stays in place','Efficient setup is useful when asepsis is maintained. Continuing with a soaked drape leaves the contamination risk unaddressed.']},
   5:{1:[null,'Keeping sterile supplies in view and above waist level is appropriate. The team also needs a new dry field now because the current drape is wet through.'],2:[null,'A dry, intact drape can remain in use when aseptic technique is maintained. Moisture crossing this porous drape is a break in technique that requires replacement.']},
  },
 },
 'CROSS-007':{
  source:ref.adrenaline,
  decisions:{
   1:{1:[null,'Wheezing and hypotension with hives and lip swelling soon after the antibiotic indicate anaphylaxis with airway and circulatory involvement. Treat on clinical suspicion.'],2:[null,'A vasovagal episode can cause pallor, lightheadedness and hypotension, often with a slow pulse. Hives, lip swelling and wheeze after a drug exposure favor anaphylaxis.',ref.allergy]},
   2:{0:[null,'Stopping the suspected trigger is appropriate. Waiting afterward leaves the wheeze and shock untreated. Call for emergency help and give IM epinephrine promptly under protocol.'],2:[null,'Stop the infusion if immediately feasible, activate emergency help, and give IM epinephrine without delay. Support breathing and circulation and reassess for another dose if needed.']},
   3:{0:[null,'Documenting a rash is useful for a skin-only reaction. Include the antibiotic, timing, wheeze and low pressure here so subsequent teams recognize the severity.'],3:[null,'Once stable, explain the suspected drug and the breathing and circulatory signs. Make sure the reaction is documented and follow the agreed allergy evaluation and avoidance plan.',ref.allergy]},
   4:{0:[null,'Fading hives can reflect improvement of the skin component. Pressure of 82/48 still signals compromised circulation and calls for continued active treatment.'],2:[null,'Improving breathing and rising blood pressure together show an initial response. Continue repeated checks and observation because anaphylaxis can recur after initial recovery.',ref.allergy]},
   5:{1:[null,'An antihistamine may be used later for persistent skin symptoms. It will not correct the airway or circulatory compromise and should never delay IM epinephrine.',ref.allergy],2:[null,'Frequent reassessment of breathing and circulation is appropriate during active treatment. Those findings determine whether further support or epinephrine is needed.']},
  },
 },
 'NP1-027':{
  source:ref.tb,
  scenario:'A patient in a clinic waiting area reports a cough for several weeks, weight loss and drenching night sweats. The nurse suspects pulmonary tuberculosis and has access to separate rooms.',
  keyPoint:'Start airborne precautions promptly when infectious pulmonary TB is suspected. Arrange medical evaluation and testing without waiting for screening results.',
  decisions:{
   1:{1:[null,'A sustained cough with weight loss and night sweats is compatible with infectious pulmonary TB. It warrants immediate precautions and investigation without assuming the diagnosis is confirmed.',ref.tbTests],2:['A positive TB blood test with no symptoms and active disease excluded','A positive TB blood test can support TB infection after clinical evaluation. This symptomatic patient needs assessment for pulmonary disease and possible infectiousness.',ref.tbTests]},
   2:{0:['Send the patient back to the shared waiting area until a screening test returns','Screening tests can help assess infection. Waiting in a shared room leaves others exposed, and a test result alone cannot exclude infectious pulmonary TB.'],2:['Mask the patient, start airborne precautions and arrange prompt diagnostic evaluation','Separate the patient and use appropriate airborne isolation and respiratory protection. Arrange diagnostic assessment, including respiratory specimens when indicated.']},
   3:{1:['Use cough etiquette but stop the TB medicines once symptoms first improve','Cough etiquette helps reduce exposure. If treatment is prescribed, early symptom relief does not establish cure and does not justify stopping treatment.',ref.tbTreatment],3:[null,'Explain cough etiquette and the need to complete the prescribed regimen if TB disease is found. Discuss follow-up and follow the public health team’s instructions about contact and isolation.',ref.tbTreatment]},
   4:{1:['The cough is less frequent after one week, so all microbiological follow-up is canceled','Less coughing is reassuring but cannot establish completion or confirm the required response. Use clinical and bacteriologic follow-up as specified for the confirmed disease and regimen.',ref.tbTreatment],2:[null,'For confirmed pulmonary disease, completion and documented clinical and bacteriologic response support effective treatment. The TB team evaluates ongoing infectiousness using the applicable criteria.',ref.tbTreatment]},
   5:{1:[null,'Standard precautions remain necessary for all patients. Suspected or confirmed infectious pulmonary TB also requires airborne controls.'],2:[null,'Covering the cough and following a complete prescribed regimen help control spread. Continue airborne precautions and coordinate follow-up while infectiousness is assessed.']},
  },
 },
 'NP1-028':{
  source:ref.measles,
  scenario:'A child has fever, cough, runny nose and red, watery eyes. A rash began on the face and is spreading downward. The nurse is triaging the child before entry to a shared treatment area.',
  decisions:{
   1:{0:['Weeks of cough with night sweats and unexplained weight loss','That longer pattern can suggest pulmonary TB and require airborne precautions while it is evaluated. Fever with conjunctivitis, coryza and a descending rash suggests measles here.',ref.tbTests],2:['Fever, cough, coryza and conjunctivitis followed by a descending rash','This combination is characteristic of measles. Start precautions on suspicion and arrange confirmation through the appropriate clinical and public health pathway.']},
   2:{1:[null,'Separate and mask the child if tolerated, use an airborne infection isolation room when available and notify infection prevention and public health. Staff entering use appropriate respiratory protection.',ref.measlesIsolation],3:['Keep the child in the shared area to give oral fluids before applying precautions','Fluids are useful if the child can drink safely. Provide hydration care after immediate separation so a potentially airborne infection does not expose the waiting room.']},
   3:{0:[null,'Explain which contacts to avoid during the infectious period and how to notify healthcare services before arriving. Public health can advise susceptible contacts about post-exposure prevention.'],1:['Tell the family that vaccination after today’s assessment will immediately end this child’s infectious period','Vaccination can prevent disease and may be indicated for eligible exposed contacts. It does not shorten this child’s isolation by treating current measles.']},
   4:{2:['The fever falls, so exposure follow-up and hydration checks end','Improved fever supports clinical recovery. It does not show that susceptible contacts were protected or that the child is drinking adequately.'],3:[null,'Verify that contacts are identified and exposure is minimized while the child receives supportive care. Follow intake and urine output to detect dehydration.']},
   5:{0:[null,'A roommate who is susceptible could acquire measles. Use airborne separation and seek infection-prevention advice before any placement decision.',ref.measlesIsolation],3:[null,'Monitoring exposure risk and hydration is appropriate. The child needs supportive care while infection prevention and public health manage contacts.']},
  },
 },
 'NP1-029':{
  source:ref.dengue,
  scenario:'A patient with suspected dengue develops severe abdominal pain and persistent vomiting as the fever starts to settle. The patient returns to the clinic for reassessment.',
  keyPoint:'New severe abdominal pain or persistent vomiting as fever settles can signal the critical phase of dengue. Assess perfusion and escalate promptly.',
  decisions:{
   1:{0:['Falling temperature as proof of uncomplicated recovery','Defervescence can occur as an illness improves. In dengue, the critical phase often begins as fever settles. Severe abdominal pain and persistent vomiting change the risk assessment.'],3:[null,'Both findings are warning signs for progression to severe dengue. Check hemodynamic status and hydration and arrange urgent hospital assessment.']},
   2:{0:['Arrange urgent hospital assessment and monitor perfusion and urine output','Warning signs require inpatient evaluation. Check circulation, urine output and hematocrit trends and support the individualized fluid plan.'],1:['Send home with fluids and routine follow-up because the fever is falling','Outpatient oral hydration and close follow-up can apply when there are no warning signs and hydration is adequate. This patient has warning signs requiring escalation.']},
   3:{0:['Return only if fever rises again after it settles','Recurrent fever can be important, but waiting for it misses severe abdominal pain, vomiting, bleeding and other findings that require urgent help during defervescence.'],2:[null,'Explain the warning signs and when to seek immediate care. Use acetaminophen when appropriate and avoid aspirin or NSAIDs because of bleeding risk.'],3:['Focus only on avoiding floodwater when discussing dengue prevention','Floodwater precautions help prevent leptospirosis. They do not address dengue warning signs or mosquito-bite prevention.',ref.leptospirosis]},
   4:{0:[null,'Stable circulation and urine output with resolving warning signs support improvement. Continue checks and follow the hematocrit and fluid response according to severity.'],3:['Temperature normalizes while urine output and perfusion worsen','Normal temperature alone does not show resolution. Declining urine output or circulation suggests deterioration and warrants immediate reassessment.']},
   5:{1:[null,'Avoiding aspirin and NSAIDs and seeking immediate help for worsening symptoms are appropriate teaching for this patient.'],3:[null,'Ibuprofen treats fever in some conditions. In suspected dengue, increased bleeding risk makes it inappropriate. Acetaminophen may be used if appropriate.']},
  },
 },
 'NP1-030':{
  source:ref.rabies,
  scenario:'A patient arrives after an unprovoked bite from a dog suspected of rabies. A puncture broke the skin on the patient’s hand. The patient has no documented previous rabies vaccination.',
  decisions:{
   1:{0:[null,'The puncture allows saliva through the skin, a WHO category III exposure when the animal could be rabid. This calls for immediate wound care and urgent assessment for prophylaxis.'],1:['Contact limited to an animal licking intact skin','Licking intact skin is category I and does not call for rabies post-exposure prophylaxis after a reliable assessment. A bite that penetrates the skin is a different exposure.']},
   2:{1:['Give tetanus prophylaxis if due and use it as the only bite treatment','Tetanus prevention is considered in a bite assessment. It has no effect on rabies risk and cannot replace washing and urgent evaluation for rabies prophylaxis.'],3:['Wash the wound with soap and running water for about 15 minutes and arrange urgent animal-bite assessment','Flush and wash promptly, then arrange assessment and vaccination without waiting for symptoms. For this unvaccinated patient with a transdermal exposure, the provider also evaluates indicated immunoglobulin or an approved alternative.']},
   3:{0:[null,'Keep the appointments for the entire ordered prophylaxis course even after the skin heals. Healing does not tell whether rabies virus exposure occurred.'],1:['Stop the remaining rabies vaccine appointments once the puncture closes','Wound healing is encouraging, but it does not determine whether the scheduled vaccine doses are needed. Only the treating or public health team should alter the plan after reassessment.']},
   4:{1:[null,'Confirm that the wound received appropriate care and the prescribed prophylaxis doses were completed. Closure of the puncture alone is not a measure of adequate prophylaxis.'],2:['The puncture closes, but no post-exposure prophylaxis plan is documented','The wound can heal normally without preventing rabies. Verify the risk assessment, vaccination and indicated passive immunization plan.']},
   5:{2:[null,'Waiting for symptoms forfeits the opportunity for prevention. Rabies is nearly always fatal after clinical symptoms develop. Treat a credible transdermal exposure urgently.'],3:[null,'Reviewing wound care and verifying completion of the recommended prophylaxis series are appropriate follow-up after this exposure.']},
  },
 },
 'NP1-031':{
  source:ref.malaria,
  scenario:'A traveler from a malaria-endemic area develops fever and shaking chills. They report that the fever does not follow a predictable cycle and ask if testing can wait.',
  decisions:{
   1:{1:[null,'Fever and chills after travel in an endemic area warrant urgent malaria evaluation even without a regular fever cycle or a known mosquito bite.'],2:['Regular timing of fever as a requirement before suspecting malaria','A periodic fever pattern can occur with malaria. Early disease can be irregular, so waiting for periodicity can delay diagnosis.']},
   2:{2:[null,'Arrange urgent thick and thin blood smears and a severity assessment. Faster validated testing can support early decisions while microscopy establishes species and parasite burden.'],3:['Check perfusion and arrange routine follow-up without urgent parasite testing','Perfusion assessment helps identify severe illness. It cannot confirm or exclude malaria. This travel history with fever requires urgent diagnostic testing.']},
   3:{1:['Use mosquito protection while traveling, then skip the prescribed antimalarial course if the fever settles','Repellent and bed nets help prevent exposure and onward transmission. If malaria is diagnosed, improvement does not justify stopping an incomplete treatment course.',ref.malariaTreatment],3:[null,'Review mosquito precautions and complete the prescribed treatment if malaria is confirmed. Report recurrent fever and follow the team’s testing plan.',ref.malariaTreatment]},
   4:{0:[null,'Resolution of symptoms and a falling or cleared parasite burden where repeat microscopy is indicated support treatment response. Follow the plan for the identified species and severity.',ref.malariaTreatment],3:['Fever settles after an antipyretic, but parasitemia is unassessed','A lower temperature after a fever medicine measures relief. Malaria can still persist, so use follow-up findings and testing to judge response.']},
   5:{1:[null,'Fever patterns vary, particularly early in malaria. Excluding the disease because the temperature does not cycle can delay urgent testing.'],3:[null,'Reassessing symptoms and following the indicated parasite-monitoring plan are appropriate when testing confirms malaria.',ref.malariaTreatment]},
  },
 },
 'NP1-032':{
  source:ref.leptospirosis,
  scenario:'Several days after wading through floodwater, a resident develops fever and marked calf muscle pain. The patient cannot recall a visible cut or an animal bite.',
  decisions:{
   1:{2:[null,'Fever and prominent calf pain after floodwater exposure support suspicion of leptospirosis. Assess for other diagnoses and signs of organ involvement.'],3:['A recalled animal bite as a prerequisite for infection','Animal bites are relevant to some zoonoses. Leptospirosis can follow exposure to water or soil contaminated by animal urine, without a recalled bite.']},
   2:{1:[null,'Arrange prompt evaluation. Assess urine output, jaundice, breathing and perfusion. When clinical suspicion is high, early prescribed antibiotics should not wait for confirmatory results.'],2:['Arrange testing but defer urgent evaluation until jaundice develops','New jaundice is a warning sign for organ involvement. Its absence early on does not make assessment or timely treatment safe to defer.']},
   3:{0:[null,'Avoid potentially contaminated water where possible. If exposure cannot be avoided, wear waterproof protection and cover open wounds. Tell the clinician about exposure if fever develops.'],2:['Use boots only when an open cut is already visible','Waterproof protection applies even without an obvious wound. Exposure can occur through small abrasions, mucous membranes or water-softened skin.']},
   4:{0:['Fever improves, but the client develops oliguria and rising creatinine','Lower temperature may indicate one improvement. The new urine and kidney findings suggest organ involvement and require urgent reassessment.'],3:[null,'Adequate output and stable kidney measures indicate preserved renal function. Also monitor respiratory, liver and circulatory findings when the condition warrants it.']},
   5:{0:[null,'A lack of visible injury does not rule out a route of exposure. Evaluate the compatible symptoms after floodwater contact.'],2:[null,'Avoiding contaminated water, using waterproof gear when needed and protecting broken skin are appropriate prevention measures.']},
  },
 },
 'NP1-033':{
  source:ref.rehydration,
  scenario:'An alert adult with profuse watery diarrhea reports thirst and very little urine. The nurse finds delayed capillary refill. The adult can swallow, but stool losses are continuing.',
  decisions:{
   1:{0:['Normal temperature as evidence that circulatory volume is adequate','Temperature helps assess illness. An adult can lose substantial fluid without fever. Thirst, low urine output and delayed refill point to a perfusion problem.'],3:[null,'These findings suggest clinically important volume loss. Assess the degree of dehydration immediately and monitor circulation and mental status.']},
   2:{0:[null,'Assess and begin rehydration promptly. Give oral rehydration solution when safe and appropriate, and arrange IV rehydration under protocol if severe dehydration or shock is present.'],2:['Collect the stool specimen first and defer rehydration until it is sent','Stool testing can help identify the cause. Obtain it without delaying fluid treatment for this patient with evidence of poor perfusion.']},
   3:{2:[null,'Mix each oral rehydration packet with the exact volume of safe water specified. Continue the instructed replacement for ongoing losses and seek reassessment if urine, alertness or drinking declines.'],3:['Use a concentrated sweet drink as the only replacement for heavy stool losses','Safe fluids may help while oral rehydration solution is obtained. Highly sugary drinks can worsen diarrhea and do not provide the intended electrolyte balance.']},
   4:{0:[null,'Improving perfusion and urine output together are useful signs of rehydration. Follow ongoing losses and reassess for overload or persistent dehydration.'],3:['Stools are less frequent, but urine output and capillary refill remain poor','Stool frequency helps estimate losses. Continued oliguria and poor refill suggest inadequate restoration of perfusion despite fewer stools.']},
   5:{0:[null,'Prompt assessment and rehydration are appropriate. The choice of oral or IV treatment depends on severity and whether the patient can safely drink.'],3:[null,'Withholding oral intake may be necessary when the airway is unprotected. Withholding all replacement during diarrhea worsens dehydration. Use the appropriate route while diarrhea continues.']},
  },
 },
 'NP5-118':{
  source:ref.adrenaline,
  decisions:{
   1:{0:[null,'Removing the trigger limits further exposure. Continued wheeze and hypotension show ongoing anaphylaxis despite that step.'],2:[null,'Five minutes after one IM dose, ongoing wheeze and hypotension indicate a need for another dose and continued breathing and circulatory support.']},
   2:{2:[null,'Recording the first dose is necessary for safe timing. Ongoing respiratory and circulatory compromise require continued emergency treatment.'],3:[null,'Repeat IM epinephrine now under the stated protocol. Continue airway and circulatory support and give indicated IV crystalloid. Escalate if serious symptoms persist after two appropriate doses.']},
   3:{0:[null,'Explain that symptoms can return after initial improvement. Follow the individualized observation and emergency plan and arrange allergy follow-up.',ref.allergy],2:[null,'One prompt dose can resolve some reactions. Persistent symptoms after that dose need more treatment, and even after resolution the patient may need continued observation.',ref.allergy]},
   4:{1:[null,'Repeated measures showing adequate breathing and circulation support moving to monitored observation once the team agrees. Observation duration depends on the severity and treatment required.',ref.allergy],3:[null,'Documenting the repeat dose is appropriate. It cannot show that wheeze and shock resolved, so assess the clinical response before changing the observation plan.']},
   5:{0:[null,'Skin findings can be absent during severe anaphylaxis. Ongoing breathing or circulation problems determine the need to repeat epinephrine.'],1:[null,'Continue monitoring breathing and perfusion while giving indicated emergency treatment. Reassessment determines whether further escalation is needed.']},
  },
 },
};
