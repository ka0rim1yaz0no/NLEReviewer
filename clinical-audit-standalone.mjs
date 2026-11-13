import {references as ref} from './clinical-audit-references.mjs';

export const standaloneCases={
 'CH-003':{source:ref.cDiff,reasons:[
  'Standard precautions apply to every patient. Recent antibiotics and at least three unexplained watery stools raise suspicion for C. difficile, so start contact precautions while testing is pending.',
  'Droplet precautions apply to respiratory infections transmitted by the droplet route. This illness requires contact precautions and dedicated toileting equipment or appropriate disinfection.',
  'Place the patient on contact precautions now, preferably in a single room with a dedicated toilet or commode. Collect unformed stool according to the testing protocol.',
  'Contact precautions are appropriate now. Sharing a commode after routine cleaning can spread spores. Use dedicated equipment or the facility’s approved sporicidal process before reuse.',
 ]},
 'CH-020':{source:ref.transfusion,reasons:[
  'Saline may be needed for resuscitation through appropriate separate access. Flushing the implicated tubing can deliver residual blood and interfere with preserving it for investigation.',
  'Sending the unit is appropriate, but the service also requested its tubing. Preserve both so the team can investigate a possible severe reaction.',
  'Keeping access for emergency treatment is appropriate. Use new or separate access as required and retain the implicated giving set without flushing or reusing it.',
  'Retain and label the unit and giving set according to the reaction protocol. Obtain or use suitable separate IV access for treatment and send requested samples without resuming the implicated transfusion.',
 ]},
 'CH-033':{source:ref.stroke,reasons:[
  'During the first 24 hours after IV thrombolysis, use the post-treatment limit and increase monitoring when systolic pressure exceeds 180 or diastolic exceeds 105 mm Hg. Both readings here warrant escalation and protocol-directed treatment.',
  'The 185/110 threshold concerns eligibility before IV thrombolysis. This patient is already in the post-treatment phase, which uses a lower blood-pressure limit.',
  'Continue neurological and blood-pressure checks even if the assessment is stable. The two verified readings are already above the post-treatment limits and should be acted on now.',
  'A lower target can apply for another diagnosis or an individualized order. Routine intensive reduction below 140 mm Hg after IV thrombolysis is not the recommended response to these readings.',
 ]},
 'CH-036':{source:ref.seizures,reasons:[
  'Five minutes is an emergency trigger for a continuous convulsion. Another convulsion before recovery is a separate indication for emergency help now.',
  'Calling for help is appropriate. Medication by mouth while convulsing risks aspiration. Use the prescribed emergency route under the applicable protocol.',
  'A brief isolated event followed by normal recovery may be managed under an individualized plan. Here awareness never returned before the next event, so treat the events as one emergency.',
  'Call for emergency assistance, protect the patient from injury and assess breathing. Document the sequence and absent recovery so responders can initiate the appropriate seizure protocol.',
 ]},
 'EXP2-NP1-communicable-diseases-basic-concepts':{source:ref.injection,reasons:[
  'A used syringe can contain blood or microorganisms even when it looks clean. Discard it after client use and prepare the next injection with new sterile equipment.',
  'Stop before a second client is exposed. Use a new sterile needle and syringe for that client and medication from a source that was accessed aseptically.',
  'Medication containers must be entered with sterile equipment. A new needle does not make a used syringe sterile, and using it to draw up medication can contaminate the vial.',
  'Clients with the same diagnosis still need their own sterile equipment. They can carry different or unrecognized bloodborne infections.',
 ]},
 'ORIG-NP5-altered-perception-01':{source:ref.stroke,reasons:[
  'Activate emergency stroke assessment immediately. Record when deficits began, or the last known well if onset is uncertain. That timing and early imaging help the stroke team decide which treatments are appropriate.',
  'Food and fluids can be offered when swallowing is safe. New deficits warrant a swallowing screen before oral intake because aspiration can occur without obvious choking.',
  'Resolution may shift assessment toward TIA or a rapidly improving stroke. It does not remove the need for urgent investigation and prevention.',
  'Routine follow-up is appropriate for stable chronic problems. Sudden speech and arm changes are time-sensitive and require emergency assessment now.',
 ]},
 'EXP2-NP4-cerebrovascular-accident-stroke':{source:ref.stroke,reasons:[
  '07:00 is the discovery time. Report it, but the deficits could have developed earlier while the person was unobserved.',
  '22:00 is the latest time a witness confirmed the person was at their usual neurological baseline. Give it as last known well and report 07:00 separately as discovery.',
  'Ambulance arrival belongs in the care timeline. It is after symptoms were discovered, so it cannot establish the last normal time.',
  'A text sent by the client or a witnessed conversation could help establish activity and baseline if the evidence is reliable. An automatically delivered reminder provides no observation of the person.',
 ]},
 'EXP2-NP5-high-acuity-emergency-situations':{source:ref.drowning,reasons:[
  'Provide compressions and rescue breaths after safe removal from the water. Start CPR promptly, then use the AED as soon as it can be added without delaying CPR. Use supplemental oxygen if available.',
  'Compression-only CPR is preferable to no CPR when a rescuer cannot provide breaths. Trained rescuers should include breaths after drowning because hypoxia commonly precedes arrest.',
  'Thrusts have a role in some foreign-body airway obstructions. They do not clear aspirated water and would delay effective CPR and ventilation here.',
  'Supplemental oxygen is useful when available. Provide effective rescue breaths with the available method immediately rather than waiting for oxygen equipment.',
 ]},
 'EXP2-NP2-pediatric-gastrointestinal-disorders':{source:ref.bilious,reasons:[
  'Green bile-stained emesis in a newborn needs urgent evaluation for obstruction, including malrotation with volvulus. Stop oral feeds and arrange emergency neonatal or surgical assessment.',
  'Small nonbilious spit-ups can be physiologic. Distinctly green vomiting and increasing distension are warning signs even after a single episode.',
  'Feeding adjustments can help uncomplicated reflux in a well infant. Continuing trial feeds delays the needed assessment for possible obstruction in this newborn.',
  'Pyloric stenosis classically presents with nonbilious vomiting. Green emesis warrants emergency evaluation without assigning a cause before assessment.',
 ]},
 'EXP2-NP3-upper-airway-disorders':{source:ref.laryngectomy,reasons:[
  'Face oxygen can reach the lungs when the upper airway is connected. After a confirmed total laryngectomy, the mouth and nose no longer lead to the lungs.',
  'A face mask can ventilate a patient with an intact upper airway. Ventilation for this client must be delivered at the stoma, so begin the stoma-directed response immediately.',
  'Apply oxygen to the neck stoma and call for skilled airway help. The permanent end stoma is the route to the lungs.',
  'Nasal oxygen is useful when there is continuity between the nose and lungs. This healed surgical stoma is the airway and needs the emergency oxygen.',
 ]},
 'EXP2-NP2-normal-labor-delivery':{source:ref.cord,reasons:[
  'Document the fluid appearance and time as part of intrapartum assessment. Clear fluid gives no information about the current fetal heart rate, so check fetal status promptly after rupture.',
  'Coached pushing belongs in an appropriate second-stage plan after assessing progress. Rupture of the membranes alone does not establish that stage.',
  'Listen to the fetal heart rate promptly after spontaneous rupture and assess the mother and baby. A new bradycardia after rupture warrants urgent evaluation including for cord prolapse.',
  'Record membrane rupture and assessment findings when they occur. Waiting until handover delays recognition and communication of any urgent findings.',
 ],choiceSources:[ref.cord,ref.labour,ref.cord,ref.labour]},
 'EXP2-NP2-complications-during-labor':{source:ref.fetal,reasons:[
  'Early decelerations generally accompany the contraction and recover by its end. They usually reflect head compression when the rest of the tracing is reassuring. Here the delayed nadir and later recovery support a late pattern.',
  'Accelerations are temporary rises in fetal heart rate and are usually reassuring. The tracing describes recurring decreases whose timing needs assessment.',
  'Variable decelerations can reflect cord compression and vary in timing relative to contractions. The repeated delayed dip and recovery here support late decelerations.',
  'The fetal heart rate reaches its low point after peak contraction and recovers after the contraction, consistent with late decelerations. Obtain prompt obstetric review and assess the full tracing, maternal findings and contraction pattern.',
 ]},
 'EXP2-NP1-maternal-child-health-mch-programs':{source:ref.newbornCare,reasons:[
  'Families may use ash traditionally, but it has no role in routine stump care and may introduce contamination. Explain the reason for clean, dry care respectfully and show how to keep the stump dry.',
  'A dry stump without signs of infection needs clean, dry care. Keep the diaper below the stump and seek prompt assessment if spreading redness, discharge or fever develops.',
  'Chlorhexidine can be appropriate under a newborn-care protocol for settings where harmful traditional substances are commonly used. There is no prescribed indication for antiseptic at every diaper change in this case.',
  'Dressings can protect some wounds when prescribed. A persistently wet covering interferes with clean, dry cord care in this healthy newborn.',
 ]},
};
