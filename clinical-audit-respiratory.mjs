import {references as ref} from './clinical-audit-references.mjs';

const asthma='https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf';
const childBls='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support';
const adultBls='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support';
const croup='https://www.rch.org.au/clinicalguide/guideline_index/Croup_laryngotracheobronchitis/';
const pediatricAirway='https://www.rch.org.au/clinicalguide/guideline_index/acute_upper_airway_obstruction/';
const enzymes='https://www.cff.org/medical-professionals/pancreatic-enzymes-clinical-care-guidelines';
const spacer='https://www.rch.org.au/kidsinfo/fact_sheets/Asthma_use_of_spacers/';
const peakFlow='https://www.nhs.uk/tests-and-treatments/peak-flow-test/';
const epistaxis='https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines';
const tracheostomy='https://tracheostomy.org.uk/storage/files/NTSP_GREEN_Tracheostomy_Algorithm.pdf';
const suction='https://www.aarc.org/wp-content/uploads/2022/10/cpg-artificial-airway-suctioning.pdf';
const sleepApnea='https://www.asahq.org/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-the-perioperative-management-of-patients-with-obstructive-sleep-apnea.pdf';
const ventilator='https://www.aarc.org/wp-content/uploads/2024/10/patient-ventilator-assessment-aarc-cpg.pdf';
const liberation='https://www.aarc.org/wp-content/uploads/2023/11/CPG2024SpontaneousBreathingTrial.pdf';
const noninvasive='https://thorax.bmj.com/content/71/Suppl_2/ii1';
const oxygen='https://www.aarc.org/wp-content/uploads/2022/10/cpg-clinical-mangement-adult-o2-acute-settings.pdf';
const devices='https://www.ncbi.nlm.nih.gov/books/NBK596733/';
const oximetry='https://www.fda.gov/consumers/consumer-updates/pulse-oximeter-basics';
const physiology='https://openstax.org/books/anatomy-and-physiology-2e/pages/22-3-the-process-of-breathing';
const copd='https://www.cuh.nhs.uk/patient-information/breathing-techniques-to-ease-breathlessness/';
const pneumonia='https://www.nice.org.uk/guidance/NG250/chapter/recommendations';
const dvt='https://www.nice.org.uk/guidance/NG158/chapter/recommendations';
const prophylaxis='https://www.nice.org.uk/guidance/ng89/chapter/Recommendations';
const pulmonaryHypertension='https://www.ishlt.org/docs/default-source/standards-guidelines/2022_endorsement_esc_ers_phguidelines.pdf';
const epoprostenol='https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/020444s023lbl.pdf';
const bactrim='https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/017377s085lbl.pdf';
const propranolol='https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=554c7446-8407-460e-b157-f860c5afbf12';
const thyroid='https://www.entuk.org/_userfiles/pages/files/guidelines/anae_15585.pdf';
const celiac='https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/eating-diet-nutrition';

export const respiratoryCases={
 'SIT-NP3-bronchial-asthma-01':{
  source:asthma,
  scenario:'An adult with asthma has loud wheezing and can speak only in words after using the home reliever as directed. Oxygen saturation is 89% on room air and breathing effort is increasing.',
  assessment:'Speech limited to words, marked breathing effort, hypoxemia and poor response to initial relief indicate a severe exacerbation. Assess mental status and air entry during emergency treatment.',
  action:'Activate urgent asthma care. Give inhaled bronchodilator treatment and oxygen titrated under the acute protocol, with ipratropium and early systemic corticosteroid as indicated. Monitor response while arranging escalation.',
  teaching:'After the immediate crisis is treated, rehearse the written action plan. Severe breathlessness or failure of the reliever to help requires urgent emergency care.',
  outcome:'Look for better air movement, ability to speak, less respiratory effort and adequate oxygenation. Worsening alertness or a quieter chest with poor air movement requires immediate escalation.',
  reasoning:'Being able to speak only in words with saturation of 89% indicates severe respiratory compromise in this setting. Persistent symptoms despite the home reliever require urgent treatment and repeated assessment.',
  safety:'A planned visit can suit a stable person with controlled symptoms. Speech limited by breathlessness and hypoxemia after reliever use make delaying acute assessment unsafe.',
  followUp:'Check speech, respiratory rate and effort, mentation, air entry and oxygenation after treatment. Record the response and escalate persistent or worsening abnormalities.',
  alternate:'Improved daily inhaler use can help prevent future attacks. The immediate follow-up here measures response to urgent treatment of hypoxemia and severe breathing difficulty.',
  edits:{
   recognition:{3:['Pneumonia as the primary cause of the current findings','Consider pneumonia when infection and focal findings support it. The current findings are prominent wheeze and poor response to a reliever in someone with asthma. Treat the severe breathing compromise while assessing other causes.',pneumonia]},
   reasoning:{3:['Fever and a new focal infiltrate would support a pneumonia diagnosis','Fever and imaging can support pneumonia, which can trigger breathing deterioration. No such findings are documented. Here limited speech and low saturation support immediate asthma treatment.',pneumonia]},
   action:{
    1:['Use the home warning-zone instructions alone and wait for outpatient review','A home action plan guides early worsening in someone able to manage safely outside an acute setting. The current speech limitation and hypoxemia warrant immediate clinical treatment.'],
    2:['Complete a routine review of possible new medicine triggers before giving emergency treatment','A medicine review fits symptoms that start after a new drug. It can follow urgent care when the patient has severe respiratory compromise.'],
    3:['Review maintenance inhaler technique before addressing the current oxygen level','Technique and adherence review help prevent attacks after stabilization. The patient first needs acute assessment, bronchodilator treatment and oxygen as indicated.'],
   },
  },
 },
 'SIT-NP3-bronchial-asthma-02':{
  source:asthma,
  scenario:'An adult prescribed a daily inhaled corticosteroid with a separate reliever stops the maintenance inhaler on symptom-free days. At a scheduled review the adult speaks normally and has no current breathlessness or wheeze.',
  assessment:'Intermittent use of a prescribed daily controller is an adherence and education issue. Check technique, symptoms, side effects, medication access and the patient’s understanding.',
  action:'Confirm the actual regimen. Ask why doses are missed, watch inhaler technique, use teach-back and reconcile the written plan with the prescriber. Assess control and exacerbation risk before recommending any change.',
  teaching:'For this prescribed daily regimen, use the controller on symptom-free days. Use the separate reliever as directed and discuss concerns or a different regimen with the prescriber.',
  outcome:'The patient correctly demonstrates both inhalers, explains their different roles and follows the daily schedule. Reassess symptom control and reliever use over time.',
  reasoning:'Inhaled corticosteroid treats underlying airway inflammation and reduces exacerbation risk even when symptoms are absent. Some patients have a different, clinician-prescribed as-needed ICS-containing regimen.',
  safety:'An asymptomatic patient may eventually qualify for clinician-supervised step-down. A symptom-free day alone gives no basis for stopping prescribed daily therapy.',
  followUp:'Document how the patient is using the daily controller and whether symptoms improved. Recheck technique, missed doses, nighttime symptoms and reliever use at follow-up.',
  alternate:'A safety review of a new medicine is appropriate when it may have triggered respiratory symptoms. This visit follows regular use of an established inhaler and subsequent symptom control.',
  edits:{
   recognition:{3:['Oral candidiasis as the documented reason for missing the inhaler','Oral soreness or plaques during inhaled steroid use warrant evaluation for candidiasis. This patient describes skipping treatment on well days and has no reported mouth symptoms.']},
   reasoning:{2:['Steroid deposited in the mouth can contribute to candidiasis when compatible symptoms are present','A clinician should review mouth symptoms, inhaler technique and preventive measures such as rinsing after prescribed use. Here the concern is regular use when asthma symptoms are absent.']},
  },
 },
 'SIT-NP3-bronchial-asthma-03':{
  source:asthma,
  scenario:'An adult tracks peak flow using a written asthma plan. For three days readings have repeatedly entered the personal warning range, and coughing has caused two nighttime awakenings. The adult speaks in full sentences at rest.',
  assessment:'A repeated fall into the personal warning range and new nighttime symptoms indicate worsening control. Check current severity and follow the written action thresholds even if one reading looks better.',
  action:'Follow the prescribed warning-zone instructions now and arrange prompt review. Ask about reliever response, recent triggers, symptoms and technique. Escalate immediately if severe features develop.',
  teaching:'Record peak flow and nighttime symptoms, and follow the thresholds and treatment steps in the personal plan. Seek emergency care for severe breathlessness or inadequate response to the prescribed reliever.',
  outcome:'Verify that the warning-zone steps were used and a clinician reviewed the deterioration. Follow symptom frequency, reliever use and peak flow relative to personal best.',
  reasoning:'Repeated warning-zone values and nighttime waking signal worsening asthma. A single better daytime measurement cannot erase that trend.',
  safety:'Routine monitoring alone can fit a stable pattern within the personal plan. Several low readings and nighttime waking call for action under the plan now.',
  followUp:'Check whether nighttime waking and reliever use have decreased and peak flow is moving toward the usual range after the intervention. Confirm the patient knows what to do if it worsens.',
  alternate:'A review focused on a new medicine is appropriate if symptoms began after starting it. Here the follow-up checks response to the documented peak-flow decline and nighttime symptoms.',
  edits:{action:{0:['Treat the reading as proof of a life-threatening attack before checking symptoms and current severity','The emergency pathway applies if acute assessment identifies severe findings. This patient is speaking comfortably at rest and needs the prescribed warning-zone response and prompt reassessment.']}},
 },
 'SIT-NP3-bronchial-asthma-04':{
  source:propranolol,
  scenario:'An adult with asthma develops new wheezing after starting propranolol. The patient speaks in full sentences with saturation of 97% and has no visible respiratory distress. The prescriber has yet to review these symptoms.',
  assessment:'Nonselective beta blockade can trigger bronchospasm in people with asthma. The timing makes the medicine an important possible cause while other triggers and current severity are assessed.',
  action:'Assess symptoms, work of breathing and oxygenation. Promptly tell the prescriber which medicine was started and when symptoms began, and verify what to do before the next dose. Escalate if breathing deteriorates.',
  teaching:'Report wheeze after new medicines, including beta-blocker eye drops. Review the agreed asthma plan and obtain urgent help for worsening breathing or a poor response to the prescribed reliever.',
  outcome:'Confirm that the prescriber reviewed the suspected adverse effect, the next dose and alternatives, and that breathing has been reassessed after the change.',
  reasoning:'Propranolol is nonselective and may worsen bronchospasm. The timing is a clinical clue. Beta-blocker decisions depend on the agent and indication, with individualized assessment of risks and benefits.',
  safety:'A medication may be continued after reviewing whether it fits the patient’s condition. Ignoring new wheeze because the drug was prescribed for a cardiovascular reason misses a known adverse effect.',
  followUp:'Document current air entry, symptoms, oxygenation and the updated medication plan. Reassess symptoms after the prescriber’s decision and teach which changes warrant urgent help.',
  alternate:'Maintaining controller adherence is useful in asthma. This review follows the timing of the new wheeze and the plan for a possible medicine-related reaction.',
  edits:{
   recognition:{3:['Respiratory infection as the only likely cause of the new wheeze','A respiratory infection can cause or trigger wheeze, especially with compatible fever or infectious symptoms. The medication timing warrants reviewing propranolol as a possible trigger in this case.',asthma]},
   reasoning:{2:['Missed maintenance inhaler doses can contribute to asthma symptoms when adherence has changed','A review of regular treatment is appropriate for poor asthma control. The new change documented here is starting propranolol, a medicine that can cause bronchospasm.',asthma]},
  },
 },
 'SIT-NP2-pediatric-respiratory-disorders-01-R2':{
  source:childBls,
  scenario:'A responsive 2-year-old suddenly chokes while eating. The child cannot cry or produce an effective cough and is becoming cyanotic. A trained responder is present.',
  assessment:'Sudden onset during eating with inability to cry or cough effectively indicates severe foreign-body airway obstruction. Cyanosis further raises the urgency.',
  action:'Activate emergency help and use repeated cycles of five back blows followed by five abdominal thrusts in this responsive child. If the child becomes unresponsive, start CPR with compressions as directed by the pediatric algorithm.',
  teaching:'Teach caregivers to recognize an ineffective cough, call for help and learn age-specific first aid. Reduce choking risk by supervising meals and preparing foods for the child’s age.',
  outcome:'Verify that effective breathing returns or that resuscitation is started promptly if the child becomes unresponsive. Reassess for ongoing symptoms and arrange the indicated evaluation.',
  reasoning:'The 2025 AHA and AAP sequence for a responsive child with severe obstruction uses five back blows then five abdominal thrusts. Infants require chest thrusts instead of abdominal thrusts.',
  safety:'Remove an object if it is visible and easy to reach. Blind sweeping can push it deeper or injure the airway and should be avoided.',
  followUp:'Record the response begun and the first signs of airway patency. Recheck breathing, color, responsiveness and signs of residual obstruction or injury.',
  alternate:'Feeding and hydration surveillance fits a gradually unwell infant. Airway patency and breathing are the immediate follow-up after sudden severe choking.',
 },
 'SIT-NP2-pediatric-respiratory-disorders-02-R2':{
  source:enzymes,
  assessment:'Taking all prescribed enzymes at bedtime leaves meals and snacks without the intended digestive support. Verify the prescribed dose and product, meal pattern, symptoms and growth trend.',
  action:'Review product-specific instructions with the family and CF team. Match each prescribed dose to the corresponding food intake and confirm technique by demonstration.',
  teaching:'Give the prescribed amount with the meals or snacks specified in the plan. Keep enteric-coated particles intact and follow the product-specific method if the child cannot swallow capsules.',
  outcome:'The family correctly demonstrates product handling and dosing with meals and snacks. Follow stool symptoms, intake and growth with the CF team.',
  reasoning:'Pancreatic enzyme replacement needs to be present as food is digested. A single bedtime dose without the meals or snacks it was prescribed for cannot substitute for those doses.',
  safety:'Some products allow the capsule to be opened and its intact beads given with a specified soft food. Crushing enteric-coated beads or combining the full day’s doses defeats safe administration.',
  followUp:'Record what the caregiver demonstrated and verify the plan is used for meals and snacks at home. Follow stool symptoms and growth because one demonstration cannot establish long-term response.',
  alternate:'Exercise and access to a reliever are appropriate asthma outcomes. Pancreatic enzyme follow-up measures timing, product handling and clinical signs of absorption.',
  edits:{reasoning:{3:['Continued gluten exposure can perpetuate malabsorption in diagnosed celiac disease','A gluten-free diet is the treatment for diagnosed celiac disease. This child has cystic fibrosis and documented incorrect enzyme timing. The question concerns coordinating the enzyme doses with meals and snacks.',celiac]}},
 },
 'SIT-NP2-pediatric-respiratory-disorders-03':{
  source:ref.bronchiolitis,
  scenario:'A 5-month-old with bronchiolitis is alert but has increasing retractions and nasal secretions, takes about half the usual feeds and has fewer wet diapers. There is no abrupt choking episode or stridor.',
  assessment:'Retractions and reduced intake with fewer wet diapers indicate both respiratory and hydration concerns. Check oxygenation, work of breathing, fatigue and the safety of continuing oral feeds.',
  action:'Assess respiratory severity and hydration promptly, including saturation, intake and output. Provide indicated oxygen and consider gentle upper-airway suction if secretions interfere with breathing or feeding. Prepare prescribed enteral or IV fluids when intake is inadequate.',
  teaching:'Seek help for worsening retractions or feeding, fewer wet diapers or unusual sleepiness. Apnea, cyanosis or severe difficulty breathing require emergency care.',
  outcome:'Reassess work of breathing, saturation, feed tolerance, intake and urine output. Escalate persistent hypoxemia, exhaustion or inability to maintain hydration safely.',
  reasoning:'Feeding can fall as respiratory effort rises in bronchiolitis. Upper-airway suction is targeted when secretions contribute to difficult breathing or feeding. Extra fluid support may be needed when oral intake is inadequate.',
  safety:'Small oral feeds can fit an infant who can safely coordinate breathing and feeding. Large feeds despite increasing distress require reassessment before further oral intake.',
  followUp:'Measure respiratory effort, oxygenation, alertness, feed tolerance and output after the support plan. Document whether the feeding route remains safe.',
  alternate:'Ability to exercise with an accessible plan is a useful long-term asthma goal. This infant has bronchiolitis and needs reassessment of breathing, feeding safety and hydration.',
 },
 'SIT-NP2-pediatric-respiratory-disorders-04-R2':{
  source:asthma,
  scenario:'A 10-year-old with exercise-triggered asthma wants to stop all sports after mild wheeze during running. The child is well at the visit. The clinician has prescribed a pre-exercise and symptom action plan.',
  assessment:'Exercise-related symptoms call for review of the prescribed prevention plan, symptom control and technique. Assess for other causes if symptoms persist despite appropriate use.',
  action:'Review and demonstrate the child’s exact pre-exercise and reliever instructions. Plan a gradual warm-up if appropriate, ensure medication access and arrange review if symptoms recur.',
  teaching:'Encourage appropriate activity with the reviewed plan and the prescribed reliever available. Stop activity and follow the plan if symptoms occur, and seek help if they are severe or do not settle as directed.',
  outcome:'The child takes part in suitable activities, can explain the agreed medicine timing and has ready access to help. Reassess exercise symptoms and activity tolerance.',
  reasoning:'Good asthma control and the prescribed pre-exercise strategy can allow safe activity. Persistent symptoms may reflect poor control, incorrect technique, or another condition and deserve review.',
  safety:'A well child can resume planned activity when symptoms are controlled. Continuing during worsening wheeze without access to the prescribed reliever is unsafe.',
  followUp:'Document the child’s participation, preparedness and symptoms during and after activity. Repeat the check before increasing intensity or changing the plan.',
  alternate:'Coordinating enzymes with meals is important in cystic fibrosis. The outcome here concerns activity tolerance and ready access to the asthma plan.',
 },
 'SIT-NP3-upper-airway-disorders-01':{
  source:tracheostomy,
  scenario:'An adult with a tracheostomy and a potentially patent upper airway has noisy breathing, visible secretions, rising respiratory effort and a falling oxygen saturation. The bedside emergency airway sign and equipment are available.',
  assessment:'Suspect tracheostomy obstruction or displacement when airflow declines. Visible secretions make obstruction plausible, and acute desaturation warrants checking patency immediately.',
  action:'Call for expert airway help, give oxygen to the face and stoma, and check patency under the emergency algorithm. Remove external attachments or the inner cannula as indicated and check if a suction catheter passes. If it cannot pass, follow the blocked or displaced tube pathway promptly.',
  teaching:'Teach the patient or caregiver to alert staff for noisy breathing, thicker secretions or increased effort. They should rehearse the prescribed emergency plan and know where to find the spare equipment.',
  outcome:'Confirm airflow and an effective breathing pattern by bedside assessment. Recheck effort and oxygenation, and record whether the tube obstruction or displacement was corrected.',
  reasoning:'A mucus plug or displaced tube can quickly stop effective breathing. A suction catheter that will not pass raises concern for blockage or displacement. Do not force it or blindly deliver ventilation through that tube.',
  safety:'Routine tracheostomy care fits a stable patient. A falling saturation and increasing effort require emergency patency assessment before deferring to scheduled care.',
  followUp:'Check that air moves through a patent airway and work of breathing and oxygenation have improved after intervention. Persistent distress or failure to establish patency requires the next emergency step.',
  alternate:'Continuous monitoring for recurrent sleep-related obstruction fits a patient with postoperative sleep apnea. This event requires reassessment of the tracheostomy airway after treatment.',
 },
 'SIT-NP3-upper-airway-disorders-02':{
  source:epistaxis,
  scenario:'An alert adult with an uncomplicated nosebleed leans backward and swallows blood. The patient can breathe easily, and there has been no facial trauma.',
  assessment:'Tilting the head back directs blood into the throat, where it can be swallowed or aspirated. Assess bleeding severity, airway symptoms and contributing factors such as anticoagulant use.',
  action:'Sit the patient upright, tilt the head slightly forward and pinch the soft lower part of the nose continuously for 10 to 15 minutes under the first-aid guideline. Have the patient breathe through the mouth and spit out blood.',
  teaching:'Lean forward and hold continuous pressure over the soft part of the nose. Seek assessment if bleeding persists after pressure, is heavy or causes lightheadedness or difficulty breathing.',
  outcome:'Confirm that the bleeding has stopped and the patient is breathing comfortably without ongoing blood draining into the throat. Reassess for recurrence or symptoms of significant loss.',
  reasoning:'Forward positioning limits swallowing blood, while continuous pressure directly compresses the usual anterior bleeding site. Pressing the bony bridge is ineffective for this purpose.',
  safety:'An upright position with the head forward is appropriate for a stable, alert person with a nosebleed. Leaning backward while bleeding increases swallowing and can conceal continuing blood loss.',
  followUp:'Document that bleeding stopped after compression, then check for renewed bleeding, blood in the throat and changes in breathing or vital signs.',
  alternate:'Apnea surveillance applies after sedation in a patient with sleep apnea. Here surveillance is for recurrent bleeding and airway symptoms following epistaxis first aid.',
  edits:{recognition:{3:['An anterior nosebleed requiring immediate packing before any direct pressure','Packing can be considered by a trained clinician when bleeding persists despite proper compression or the bleeding site cannot be identified. This alert patient has yet to try continuous pressure in a forward position.']}},
 },
 'SIT-NP3-upper-airway-disorders-03':{
  source:sleepApnea,
  scenario:'An adult with obstructive sleep apnea develops repeated obstructed breaths and intermittent desaturations while asleep after postoperative opioid analgesia. Breathing improves briefly with arousal.',
  assessment:'Recurrent obstruction during sleep after opioid use raises concern for postoperative airway compromise and possible ventilatory depression. Assess airway, ventilation, sedation level and oxygenation now.',
  action:'Stay with the patient, support airway positioning and obtain prompt clinical help. Assess breathing and sedation, use appropriate continuous monitoring and verify the ordered CPAP or other airway support before more sedating medication.',
  teaching:'Check with the care team before taking additional sedating medicines. Use prescribed sleep-apnea equipment as reviewed by the team and report excessive sleepiness, obstructed breathing or new breathing difficulty.',
  outcome:'Confirm adequate ventilation and oxygenation with observation during sleep, with fewer or no obstructive events after the indicated support. Continue the ordered monitoring while risk remains.',
  reasoning:'Obstructive sleep apnea increases vulnerability to airway collapse. Opioids can also depress ventilation. A transient improvement while awake cannot establish safety when obstruction returns during sleep.',
  safety:'Sedation or opioid treatment can be appropriate with a reviewed plan and adequate monitoring. Giving more before evaluating repeated obstructive breaths and desaturation can worsen respiratory compromise.',
  followUp:'Document the response while awake and asleep, including airway patency, respiratory rate, sedation and oxygenation. Escalate ongoing obstruction or inadequate ventilation.',
  alternate:'Tube patency checks fit a tracheostomy emergency. This patient needs follow-up of sedation and recurrent obstruction during sleep after postoperative analgesia.',
  edits:{
   recognition:{3:['Possible postoperative neck hematoma when new swelling and stridor are present','Neck swelling or stridor after thyroid surgery would raise urgent concern for a hematoma. This stem describes sleep-linked events after opioid use, with no neck findings reported.',thyroid]},
   reasoning:{3:['After neck surgery, new swelling can compromise the airway and needs immediate evaluation','A postoperative neck hematoma can narrow the airway and requires emergency assessment. This case gives recurrent obstruction during sleep after opioid treatment, so check airway, breathing and sedation immediately.',thyroid]},
  },
 },
 'SIT-NP3-upper-airway-disorders-04':{
  source:adultBls,
  scenario:'During a meal an alert adult suddenly coughs. The patient still moves air, can speak between coughs and coughs forcefully. A bystander proposes sweeping a finger through the mouth without seeing an object.',
  assessment:'An effective cough and preserved speech indicate airflow is still passing. Watch for a weak cough, inability to speak or cyanosis, which would signal progression to severe obstruction.',
  action:'Encourage the person to keep coughing, observe closely and be ready to use the emergency plan if coughing becomes ineffective. If unresponsive, follow the CPR pathway.',
  teaching:'Avoid blind finger sweeps. Remove an object only when it is clearly visible and accessible, and seek emergency help if breathing, coughing or responsiveness deteriorates.',
  outcome:'Verify that the person continues to move air and can speak without distress once the event resolves. Act immediately if the cough fails or consciousness changes.',
  reasoning:'A forceful cough can clear a partial obstruction. A blind sweep may push an object deeper. Escalate when signs indicate severe obstruction rather than interrupting an effective cough.',
  safety:'A clearly visible, reachable object may be removed when indicated. Sweeping the mouth without seeing an object risks worsening the obstruction.',
  followUp:'Record the cough and breathing response, then recheck ability to speak, breathing effort and alertness. Arrange evaluation when symptoms persist or the event required rescue maneuvers.',
  alternate:'A tracheostomy patient with a possibly plugged tube needs a tube-patency check. This adult with an effective cough needs direct observation for airway clearance or progression to severe choking.',
 },
 'SIT-NP5-altered-ventilatory-function-01':{
  source:noninvasive,
  scenario:'A spontaneously breathing adult with an acute respiratory illness is tiring despite supplemental oxygen. The patient uses accessory muscles and can say only two or three words at a time. There is no artificial airway or known recent sedative exposure.',
  assessment:'Accessory-muscle use, short phrases and exhaustion suggest the patient may soon fail to sustain ventilation. Evaluate mental status, breathing and oxygenation immediately and prepare for assisted ventilation if needed.',
  action:'Call for urgent respiratory support, assess airway and ventilation at the bedside and continue indicated oxygen. Prepare for blood gas assessment and escalation of support while monitoring the response.',
  teaching:'Report increasing effort, difficulty speaking or unusual sleepiness immediately. When exhaustion is evident, the team must respond even if the patient can no longer report symptoms.',
  outcome:'Reassess breathing pattern, consciousness, air movement, oxygenation and, when indicated, blood gases. Verify that ventilation is adequate after the support started.',
  reasoning:'Exhaustion and loss of speech capacity can precede ventilatory failure. Supplemental oxygen can improve saturation while carbon dioxide still rises, so direct assessment of ventilation is essential.',
  safety:'A less breathless, stable patient can be reassessed at planned intervals. The current inability to speak normally and increasing fatigue make waiting unsafe.',
  followUp:'Document mental status, respiratory pattern, saturation and the response to support. Obtain the indicated gas measurements and escalate ongoing fatigue or inadequate ventilation.',
  alternate:'Secretion assessment fits a patient with audible secretions and an ineffective cough. Here the central follow-up is whether urgent ventilatory support prevented progression of respiratory fatigue.',
 },
 'SIT-NP5-altered-ventilatory-function-02':{
  source:ventilator,
  scenario:'An invasively ventilated adult has a low-pressure alarm, loss of expected chest rise and a visibly disconnected breathing circuit. The endotracheal tube is secured.',
  assessment:'A visible circuit break with loss of chest rise indicates interrupted delivery of ventilator breaths. Assess the patient and tube while acting to restore ventilation.',
  action:'Call for help and immediately reconnect the obvious circuit separation if safe. Confirm effective ventilation. If ventilation does not promptly return, provide manual ventilation as trained and follow the emergency protocol.',
  teaching:'Teach caregivers to call staff immediately when the ventilator alarms or breathing changes. Trained staff must verify the patient’s ventilation and correct the cause before considering the event resolved.',
  outcome:'Verify chest movement, exhaled volume, saturation and capnography when available. Check that the disconnection is corrected and the circuit is secure before documenting full resolution.',
  reasoning:'An open connection interrupts the closed path that delivers positive pressure. The low-pressure alarm alerts staff to assess the patient and restore ventilation promptly.',
  safety:'A brief alarm pause can be used by trained staff during active troubleshooting if allowed by protocol. Silencing the alarm indefinitely without confirming ventilation is unsafe.',
  evaluation:[
   'Record that effective ventilation has returned. Mark the full goal achieved only once the cause is checked and the circuit is secure.',
   'Mark the target unmet if assessment shows ventilation or cause correction failed. Here ventilation is confirmed and correction of the cause is still unknown.',
   'A combined entry can be made when both findings are known. Record the confirmed return of ventilation now and identify the remaining check.',
   'Record the confirmed return of effective ventilation as partial evidence. Inspect the circuit and document separately whether the cause was corrected.',
  ],
  edits:{action:{
   0:['Observe for increasing fatigue before reconnecting the visibly separated circuit','Fatigue is important when a patient is breathing spontaneously or support is uncertain. Here the loss of breaths and visible separation require immediate restoration of ventilation.'],
   1:['Treat possible opioid depression before restoring the open circuit','Medication-related respiratory depression warrants urgent evaluation when compatible exposure and clinical findings are present. It cannot explain the visibly disconnected circuit or justify delaying ventilation.'],
   3:['Suction the tube first and leave the circuit disconnected until the next check','Suction can treat retained secretions when indicated. The observed circuit break and lost chest rise need correction and immediate verification of ventilation.'],
  }},
 },
 'SIT-NP5-altered-ventilatory-function-03-R2':{
  source:liberation,
  assessment:'Tachypnea, sweating and distress meeting the trial-stop criteria indicate intolerance of this spontaneous-breathing trial. Verify oxygenation, circulatory status and likely reversible causes.',
  action:'Stop the trial and restore the prescribed ventilatory support under the protocol. Notify the team, document the response and assess why the trial was not tolerated.',
  teaching:'Explain that breathing trials are supervised and can stop if breathing becomes too difficult. Tell the patient and family what support will resume and how readiness will be reassessed.',
  outcome:'Check that breathing effort, comfort, oxygenation and hemodynamics stabilize after the prescribed support resumes. Address reversible contributors before another readiness assessment.',
  reasoning:'A spontaneous-breathing trial tests whether a patient can sustain breathing with reduced support. Continuing once failure criteria are met adds strain without establishing readiness for extubation.',
  safety:'Complete a trial when the protocol is met and the patient tolerates it. Continuing despite documented failure just to reach a time limit delays support.',
  followUp:'Record the failure signs, the return to support and current respiratory stability. Review reversible contributors and plan another readiness assessment when indicated.',
  alternate:'Secretion clearance may be relevant if the assessment identifies retained secretions. This follow-up first confirms recovery after the stopped trial and evaluates readiness before another attempt.',
  edits:{action:{
   1:['Treat this as a new undifferentiated breathing problem and leave the failed trial running during assessment','Urgent breathing assessment fits a deteriorating patient. This patient already meets the trial-stop criteria, so return to support while completing that assessment.'],
   2:['Troubleshoot a presumed circuit separation before ending the trial','A separation requires prompt correction if observed. Here the protocol identifies clinical intolerance during the trial and supports restoring the prescribed assistance now.'],
   3:['Continue the trial and give airway clearance as the only response to the distress','Retained secretions warrant clearance when present. The trial itself must stop when its failure criteria are met, even if more than one problem is contributing.'],
  }},
 },
 'SIT-NP5-altered-ventilatory-function-04':{
  source:suction,
  scenario:'An adult breathing through a tracheostomy has visible thick secretions, coarse airway sounds and a weak cough. The tube is connected to the prescribed oxygen. There is no recent sedative administration or circuit disconnection.',
  assessment:'Visible secretions with coarse airway sounds and an ineffective cough support impaired secretion clearance. Check tube patency, breathing effort and oxygenation to gauge urgency.',
  action:'Assess patency immediately. Give prescribed assistance with coughing or perform trained suction when indicated, with preoxygenation per protocol. Recheck the patient and escalate sustained distress or inability to pass the catheter.',
  teaching:'Follow the agreed secretion-care and humidification plan and report thicker secretions, increasing effort or inability to clear mucus. Only trained caregivers should perform prescribed suction.',
  outcome:'Confirm reduced visible or audible secretions, improved airflow and effort and adequate oxygenation. Escalate if the airway remains obstructed or the patient deteriorates.',
  reasoning:'Supplemental oxygen may support oxygenation but cannot clear a secretion plug. Visible secretions and coarse sounds are indications to assess the need for suction of the artificial airway.',
  safety:'Continue indicated oxygen while correcting an airway problem. Relying on oxygen alone while secretions obstruct flow can delay needed clearance.',
  followUp:'Record whether secretions cleared and reassess breath sounds, work of breathing, saturation and need for further airway support.',
  alternate:'Return to ventilator support after a failed trial is an appropriate outcome in that setting. Here measure whether secretion clearance has restored airflow and reduced effort.',
 },
 'SIT-NP3-pulmonary-embolism-pulmonary-hypertension-01-R2':{
  source:epoprostenol,
  outcome:'Verify that the infusion resumed at the prescribed concentration and rate using the backup plan, and check oxygenation, pressure and symptoms after restoration.',
  followUp:'Record the time of interruption and restart, the verified rate and the patient’s first hemodynamic and respiratory findings. Continue monitoring because rebound symptoms can persist after restoration.',
  alternate:'A general review of worsening pulmonary hypertension is appropriate with new symptoms. This handoff specifically requires confirming uninterrupted delivery of essential epoprostenol and reassessing its effects.',
 },
 'SIT-NP3-pulmonary-embolism-pulmonary-hypertension-02':{
  source:bactrim,
  outcome:'Check that the prescriber and anticoagulation service arranged the antibiotic choice and INR follow-up. If trimethoprim-sulfamethoxazole is used, monitor INR and bleeding symptoms using the agreed plan.',
  followUp:'Document the confirmed interaction plan and scheduled INR check. Follow the actual INR and symptoms once treatment begins because the plan alone does not verify anticoagulation safety.',
  alternate:'A review of cardiopulmonary deterioration is useful when symptoms point to worsening pulmonary hypertension. This check follows a new warfarin interaction and its monitoring plan.',
 },
 'SIT-NP3-pulmonary-embolism-pulmonary-hypertension-03':{
  source:pulmonaryHypertension,
  outcome:'Reassess breathlessness, near-syncope, edema, oxygenation and circulation after the urgent review. Document the findings and actions for suspected worsening pulmonary hypertension and possible right-heart compromise.',
  followUp:'Confirm the patient’s current symptoms and hemodynamic status. Ensure the clinical team has reviewed near-syncope and edema and decided how to monitor or escalate care.',
  alternate:'An INR plan fits a new interacting medicine in someone taking warfarin. This patient has clinical signs of deterioration that need hemodynamic reassessment.',
 },
 'SIT-NP3-pulmonary-embolism-pulmonary-hypertension-04':{
  source:prophylaxis,
  action:'Explain the assessed clot and bleeding risks and review the agreed preventive measures, their benefits and risks, and safe mobilization. Respect refusal, document the reason and notify the team so the plan can be reviewed.',
  teaching:'Prevention starts according to risk because a clot can develop before symptoms. Report new painful swelling or sudden breathlessness and follow the prescribed prophylaxis and mobility plan.',
  outcome:'Document which preventive measures the patient accepts or cannot use, current mobility and any bleeding or VTE symptoms. Reassess risk and prevention as mobility or the clinical condition changes.',
  safety:'New painful unilateral swelling requires assessment for a possible existing clot. Waiting for pain before discussing prevention leaves the postoperative risk unaddressed.',
  followUp:'Document current participation, any remaining barriers or refusal, and the next check for mobility, bleeding and prevention adherence.',
  alternate:'Circulatory deterioration requires assessment if it develops. This follow-up measures participation and safety of the preventive plan during recovery from hip surgery.',
 },
};

export const respiratoryAlternatives={
 'SIT-NP5-altered-ventilatory-function-03:recognition':['Recent sedative exposure with slow or shallow breathing can suggest drug-related ventilatory depression. Check the medication history and the respiratory pattern before attributing this deterioration to a drug.',sleepApnea],
 'SIT-NP5-altered-ventilatory-function-03:reasoning':['Opioids and sedatives can cause excessive sleepiness and reduced ventilation. Look for a compatible exposure and onset. Oxygen saturation can look acceptable during hypoventilation when supplemental oxygen is running.',sleepApnea],
 'SIT-NP5-altered-ventilatory-function-03:action':['Airway support and treatment for suspected medication-related hypoventilation apply when the examination and drug history support it. Urgent bedside support can begin while its cause is assessed.',sleepApnea],
 'SIT-NP5-altered-ventilatory-function-03:teaching':['Report new excessive sleepiness or slowed breathing after a sedating medicine, and review sedating combinations with the prescribing team.',sleepApnea],
 'SIT-NP5-altered-ventilatory-function-03:outcome':['Reassess ventilation and consciousness after intervention for suspected drug-related depression. Improvement must be sustained under the monitoring plan.',sleepApnea],
 'SIT-NP2-pediatric-respiratory-disorders-01:recognition':['Stridor at rest with retractions can signal upper-airway narrowing. This infant’s bronchiolitis presents with nasal secretions and lower-airway effort, so reassess feeding and hydration as well.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-01:reasoning':['Observe a child with stridor calmly and minimize agitation. Increasing retractions during bronchiolitis require respiratory reassessment and an intake and output check.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-01:action':['Urgent upper-airway assessment is appropriate when stridor at rest is present. Here assess oxygenation and hydration together, and treat deterioration promptly.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-01:teaching':['Stridor at rest in a child warrants urgent evaluation. In this bronchiolitis case counsel the caregiver to watch effort, feeding, wet diapers and alertness.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-01:outcome':['Reduced stridor and work of breathing are meaningful after treatment of upper-airway narrowing. Here document breathing effort and the safety and adequacy of intake.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-02:recognition':['Drooling with trouble swallowing and a tripod posture raises concern for a critical upper-airway illness. These findings differ from the poor intake and retractions described in this bronchiolitis case.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-02:reasoning':['Agitation and throat manipulation can worsen severe upper-airway obstruction. The infant’s documented risks here are respiratory fatigue and dehydration.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-02:action':['A child with drooling, tripod posture and severe upper-airway compromise needs an emergency airway team. In this case prioritize assessing respiratory severity and feeding safety.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-02:teaching':['Drooling with new breathing or swallowing difficulty is an emergency finding. For this infant teach the bronchiolitis return signs, including poor feeding and apnea.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-02:outcome':['An experienced team maintaining the airway is an appropriate outcome when severe obstruction is suspected. This infant also needs objective evidence that hydration is adequate.',pediatricAirway],
 'SIT-NP2-pediatric-respiratory-disorders-04:recognition':['Wheezing that becomes quiet while a child tires can indicate severely limited airflow in asthma. Here retractions and reduced intake are documented during bronchiolitis.',asthma],
 'SIT-NP2-pediatric-respiratory-disorders-04:reasoning':['Less wheeze can reflect low airflow if respiratory effort or alertness worsens. This infant needs an assessment of breathing, intake and urine output.',asthma],
 'SIT-NP2-pediatric-respiratory-disorders-04:action':['A severe asthma pattern calls for urgent asthma treatment. Routine bronchodilators are outside usual bronchiolitis care, which focuses on breathing, oxygen and hydration support.',asthma],
 'SIT-NP2-pediatric-respiratory-disorders-04:teaching':['Exhaustion and inability to speak normally can indicate severe asthma in a child old enough to speak. This infant’s relevant signs include worsening effort, apnea and poor intake.',asthma],
 'SIT-NP2-pediatric-respiratory-disorders-04:outcome':['Air entry and work of breathing should be reassessed after severe asthma treatment. This bronchiolitis review must also document feeding safety and hydration.',asthma],
};

export const respiratoryLegacyCases={
 'CROSS-013':{
  source:devices,
  scenario:'A comfortably breathing adult’s displayed oxygen saturation suddenly drops from 96% to 84% during repositioning. The oximeter waveform deteriorates and the finger probe is partly displaced. The patient is alert with no new respiratory distress.',
  decisions:{
   1:{
    2:['A newly irregular palpable pulse requiring a rhythm assessment','A new irregular palpable pulse warrants direct assessment. This case documents a poor oximeter waveform after the sensor moved, with no new irregular pulse.'],
    3:[null,'The abrupt drop with a poor waveform and displaced sensor suggests a measurement problem. Assess the patient and restore a reliable signal before relying on the displayed value.',oximetry],
   },
   2:{
    0:[null,'Assess airway, breathing and symptoms at the bedside. Re-seat the sensor or choose a suitable site, check waveform and pulse agreement and repeat the reading. Escalate if a low value persists or the patient deteriorates.'],
    3:['Activate emergency support for confirmed severe respiratory compromise before trying to correct the reading','Urgent help is essential for signs of respiratory compromise or a verified severe desaturation. This patient is breathing comfortably and a displaced probe needs correction during the direct assessment.'],
   },
   3:{
    2:[null,'Ask the patient to report breathing changes promptly and alert staff if the probe slips. Symptoms need direct assessment even when the displayed saturation looks reassuring.'],
    3:[null,'Mobility and prescribed VTE prevention fit a clot-prevention plan. They do not address the immediate question of whether this oximeter reading is valid.',prophylaxis],
   },
   4:{
    0:[null,'Verify a steady waveform, pulse agreement and a repeat reading that fits the clinical assessment. A persistent unexplained reading merits further assessment.',oximetry],
    2:['Breathing becomes less labored after treatment of confirmed respiratory distress','Breathing effort and oxygenation are outcome measures after treating hypoxemia. This patient started with comfortable breathing and first needs confirmation of a valid measurement.'],
   },
   5:{
    1:[null,'Teaching about reporting breathing changes and sensor displacement is appropriate once the immediate bedside assessment and equipment check are underway.'],
    3:[null,'A verified low result with suitable clinical findings can guide protocol-directed treatment. Treating this isolated display before checking the patient and the poor sensor signal is unsafe.'],
   },
  },
 },
 'NP2-055':{
  source:croup,
  scenario:'A 3-year-old has a barking cough, hoarseness, stridor at rest and moderate retractions. The child can swallow saliva and begins to settle on a caregiver’s lap.',
  decisions:{
   1:{
    0:[null,'Drooling, marked difficulty swallowing and a tripod posture can indicate a more serious upper-airway process. This child’s barking cough, hoarseness and ability to swallow support croup with clinically important stridor.',pediatricAirway],
    1:[null,'A barky cough and inspiratory stridor suggest croup. Stridor at rest and retractions are important for grading severity and deciding how urgently to assess and treat.'],
   },
   2:{
    2:[null,'Keep the child calm in a position of comfort and assess airway severity. Arrange prescribed corticosteroid and consider nebulized epinephrine as indicated by severity and the protocol. Obtain urgent airway help if the child deteriorates.'],
    3:[null,'Food-linked pancreatic enzyme teaching applies to a child with CF who has a prescription for enzyme replacement. It does not treat this child’s stridor or retractions.',enzymes],
   },
   3:{
    0:['Use calming and positioning measures at home without seeking help if stridor remains at rest','Calming and position of comfort help reduce agitation. Stridor at rest or increasing effort still needs urgent evaluation.'],
    3:[null,'Seek urgent assessment for stridor at rest or increasing retractions. Call emergency help for marked difficulty breathing, cyanosis or reduced responsiveness.'],
   },
   4:{
    0:[null,'Reassess stridor at rest, retractions, air entry and alertness after treatment. After nebulized epinephrine, observe for recurrence for the period specified by the local protocol.'],
    3:[null,'Demonstrating enzyme timing is a suitable outcome for CF teaching. This child’s outcome is measured by breathing effort, air entry and stridor.',enzymes],
   },
   5:{
    0:[null,'A calm observation of work of breathing, alertness and stridor helps assess severity without increasing agitation.'],
    2:[null,'Positioning for an examination can be appropriate in stable patients who tolerate it. Forcing a distressed child with upper-airway narrowing to lie down may worsen obstruction.'],
   },
  },
 },
 'NP2-056':{
  source:pediatricAirway,
  scenario:'A child develops fever and severe throat pain, drools because swallowing is difficult and sits leaning forward to breathe. The voice is muffled and there is no barking cough.',
  decisions:{
   1:{
    0:[null,'Drooling with severe swallowing difficulty, a muffled voice and tripod positioning suggests a threatened upper airway, including possible epiglottitis. The airway takes priority over diagnostic confirmation.'],
    2:[null,'Poor intake with fewer wet diapers is important in illnesses such as bronchiolitis. Here inability to swallow saliva and a tripod posture point to a threatened upper airway.',ref.bronchiolitis],
   },
   2:{
    0:['Use calm observation alone and wait for a routine croup review before calling for airway help','Keeping a child calm is appropriate in suspected upper-airway obstruction, including croup. This presentation also requires immediate skilled airway assistance.'],
    1:[null,'Call for experienced emergency airway help, allow the child to remain upright in a position of comfort and minimize agitation. Avoid throat manipulation in an unprepared setting.'],
   },
   3:{
    0:[null,'Explain to the caregiver why the child should remain calm and in the chosen position. Keep assessment minimally distressing while trained airway staff respond.'],
    3:[null,'Age-appropriate food preparation and first-aid training reduce choking risk. This case describes fever, painful swallowing and drooling requiring medical airway care rather than routine choking-prevention education.',childBls],
   },
   4:{
    1:['The caregiver demonstrates age-specific choking first aid after an acute foreign-body event','Demonstrating first aid is appropriate after teaching a caregiver about foreign-body choking. The immediate outcome here is maintained ventilation by a trained airway team.',childBls],
    3:[null,'Confirm that an experienced team maintains a patent airway and stable oxygenation and ventilation. Maintain close observation because deterioration can be rapid.'],
   },
   5:{
    0:[null,'An experienced airway team can assess the throat in a controlled setting with rescue capability. A tongue-depressor exam in an unprepared setting may provoke worsening obstruction.'],
    2:[null,'Keeping the child calm in the position of choice is appropriate while emergency airway support is mobilized.'],
   },
  },
 },
 'NP3-063':{
  source:asthma,
  scenario:'An adult undergoing emergency treatment for asthma is tiring. Wheezing has nearly disappeared, but bilateral air entry is now minimal and the patient can say only one word per breath.',
  decisions:{
   1:{
    1:[null,'A nearly silent chest with minimal air movement and worsening fatigue indicates severe airflow obstruction. This is a life-threatening finding even though the wheeze is quieter.'],
    3:[null,'Sudden breathlessness and tachycardia after immobility suggest possible pulmonary embolism. Here the prominent cue is worsening air movement during a treated asthma attack.',dvt],
   },
   2:{
    1:['Check oxygen saturation and wait for the next scheduled asthma dose before escalating','Oxygen assessment and prescribed treatment are appropriate. This patient also needs an emergency response and preparation for assisted ventilation now because air entry and speech are failing.'],
    2:[null,'Activate emergency help and continue protocol-directed acute treatment with close assessment of oxygenation, effort and alertness. Prepare for urgent advanced respiratory support.'],
   },
   3:{
    1:[null,'Clot prevention and safe mobility matter when immobility or VTE risk is present. The teaching after stabilization here addresses early warning signs and when to seek emergency asthma help.',prophylaxis],
    3:[null,'After the emergency, review the asthma action plan and treatment response. Severe trouble speaking or poor relief from prescribed rescue treatment calls for emergency care.'],
   },
   4:{
    0:[null,'Meaningful improvement includes better air entry, improved speech and alertness, reduced effort and adequate oxygenation. Less wheeze by itself cannot establish recovery.'],
    1:[null,'A falling fever is useful when tracking pneumonia. This patient’s immediate asthma outcome is improved airflow and respiratory effort.',pneumonia],
   },
   5:{
    1:[null,'Action-plan teaching is appropriate after acute stabilization, with emphasis on severe symptoms and what to do when relief is inadequate.'],
    2:[null,'Less wheeze may reflect improvement when air entry, effort and alertness improve together. Here the chest is becoming quiet as airflow and speech worsen, which calls for emergency escalation.'],
   },
  },
 },
 'NP3-064':{
  source:copd,
  scenario:'An adult with stable COPD develops familiar breathlessness during a supervised corridor walk. At rest the symptoms start to improve, saturation remains in the prescribed range, and there is no new chest pain or wheeze.',
  decisions:{
   3:{
    0:[null,'For familiar exertional breathlessness, pause and breathe out gently and slowly through pursed lips. Reassess for symptoms that do not recover as usual.'],
    3:[null,'An asthma action plan applies to a patient with asthma and the corresponding treatment. This stable COPD visit focuses on breathlessness recovery and pacing.',asthma],
   },
   4:{
    1:['Oxygenation and circulation stabilize after urgent treatment of an acute embolism','Circulatory and oxygenation stabilization are priorities during acute PE treatment. This patient is stable during rehab, with familiar breathlessness that improves with rest.',dvt],
    3:[null,'Less breathlessness and a slower, controlled breathing pattern after the technique support the goal. Check how quickly the patient recovers before resuming activity.'],
   },
  },
 },
 'NP3-065':{
  source:pneumonia,
  scenario:'An adult with fever, productive cough, a focal infiltrate and an antibiotic prescription is being treated for community-acquired pneumonia. The nurse is planning follow-up and teaching for recovery.',
  decisions:{
   3:{
    1:[null,'Take the prescribed antibiotic for the directed duration and review adverse effects, infection-control measures and when to seek help if symptoms worsen. Plan for reassessment as instructed.'],
    2:[null,'An asthma action plan guides people with asthma in preventing and responding to exacerbations. It cannot substitute for prescribed pneumonia treatment or return instructions.',asthma],
   },
   4:{
    0:[null,'Monitor fever, respiratory effort, oxygenation and symptoms for improvement. Some cough and fatigue can persist after other signs improve. Worsening or slow recovery warrants reassessment.'],
    3:['Rapid return of air entry after rescue bronchodilator treatment as the only measure of recovery','An immediate improvement in air entry helps assess response to asthma rescue treatment. Pneumonia follow-up also needs fever, oxygenation and the symptom trajectory.',asthma],
   },
  },
 },
 'NP3-066':{
  source:dvt,
  scenario:'An adult suddenly develops dyspnea and pleuritic chest pain after hip surgery. The team begins treatment for a confirmed pulmonary embolism. The nurse plans reassessment and later teaching.',
  decisions:{
   3:{
    2:[null,'After stabilization, review prescribed anticoagulation, bleeding precautions and the individually approved mobility plan. Teach the patient to seek immediate help for recurrent sudden dyspnea, chest pain or faintness.'],
    3:[null,'An asthma plan applies when asthma-directed assessment and treatment are indicated. A confirmed postoperative pulmonary embolism requires clot treatment and recurrence and bleeding education.',asthma],
   },
   4:{
    1:[null,'Reassess oxygenation, work of breathing, heart rate, blood pressure and symptoms while following the PE treatment plan. Monitor for deterioration or treatment-related bleeding.'],
    2:[null,'Resolution of fever is useful in follow-up of pneumonia. The proximal treatment goals after PE are stable circulation and oxygenation with improved symptoms.',pneumonia],
   },
  },
 },
};

export const respiratoryDirectCases={
 'ORN-1ff311c4029f471aee4e':{
  source:physiology,
  reasons:[
   'Diaphragm contraction moves it down during inspiration, increasing thoracic volume and drawing air in. A quiet breath out follows relaxation.',
   'When the inspiratory muscles relax, elastic recoil reduces thoracic and lung volume. The resulting pressure gradient moves air out during quiet breathing.',
   'Abdominal muscles assist forced exhalation, such as a cough. Quiet exhalation at rest is mainly passive.',
   'Rib elevation expands the chest during inspiration. During quiet exhalation the rib cage recoils toward its resting position.',
  ],
 },
 'ORN-79f0f7bcb103130a8bf9':{
  source:devices,
  reasons:[
   'A low-flow cannula can remain in place during a meal. Continue the prescribed flow and observe comfort, work of breathing and saturation rather than assuming the target remains met.',
   'A simple mask is an option when greater conventional oxygen delivery is ordered and the device has adequate flow. Two liters per minute is below typical minimum mask flow, and the mask interferes with eating.',
   'A Venturi device is useful when a specified oxygen concentration is needed. Here the prescribed cannula meets the target and can stay in place for the meal.',
   'A supervised trial off oxygen fits a patient assessed as ready to wean under the prescription or protocol. Saturation at target on oxygen cannot establish that the patient will maintain it without support.',
  ],
 },
 'ORN-99e49b8c59af28365994':{
  source:oxygen,
  reasons:[
   'Conventional nasal cannulas provide low flow. Adding a bubble humidifier does not give a conventional system the controlled high flow and heating in the order.',
   'A heated high-flow nasal system can deliver the prescribed flow and independently set oxygen fraction. Reassess tachypnea, effort and oxygenation and escalate deterioration.',
   'A Venturi adaptor is useful when a conventional fixed oxygen concentration is prescribed. It does not provide the ordered heated, actively humidified nasal delivery with separate flow and concentration settings.',
   'A nonrebreather can supply high-concentration oxygen for a patient who is breathing spontaneously. Its reservoir setup does not deliver the specified heated nasal flow.',
  ],
  choiceSources:[devices,oxygen,devices,devices],
 },
 'ORN-fe2b48e9ff69ca0a3c5c':{
  source:devices,
  reasons:[
   'Saturation near target is one measure of response. A mask below its indicated minimum flow can retain exhaled gas, so an acceptable reading does not make the setup safe.',
   'Return to the prescribed cannula if the patient is stable enough for the ordered device. Confirm saturation and work of breathing, and obtain urgent review if the ordered support is insufficient.',
   'Six liters per minute meets this mask’s listed minimum, but a mask and cannula deliver different oxygen concentrations. A change needs a clinical indication and the corresponding order or protocol.',
   'Checking the tubing and fit is useful after selecting an appropriate device and flow. Tightening a mask cannot correct insufficient flow through it.',
  ],
 },
 'EXP2-NP2-pediatric-respiratory-disorders':{
  source:spacer,
  reasons:[
   'Several puffs can be prescribed, each delivered separately. Loading them together can reduce the amount that reaches the lungs.',
   'Check the mask or mouthpiece seal before pressing the inhaler so the child can breathe in the aerosol from the chamber.',
   'Give one puff, then have the child inhale promptly as instructed. Waiting before breathing allows more aerosol to settle inside the spacer.',
   'Give and inhale one puff at a time, using the prescribed breathing method for the child and device. Then repeat for any remaining prescribed puffs.',
  ],
 },
 'EXP2-NP3-bronchial-asthma':{
  source:peakFlow,
  reasons:[
   'Record each trial if the diary has space for raw results. The lowest of three acceptable efforts is not the peak-flow result for the session.',
   'An average can summarize a different type of measurement. This peak-flow procedure records the best acceptable blow rather than the mean.',
   'The middle value is one valid trial, but this procedure uses the highest acceptable effort. Repeat a blow when the technique was poor.',
   'Record 390 L/min. It is the highest of the three technically acceptable efforts after the meter was reset for each blow.',
  ],
 },
 'EXP2-NP3-pulmonary-embolism-pulmonary-hypertension':{
  source:dvt,
  reasons:[
   'A positive D-dimer supports further investigation when indicated by the pathway. It does not identify a clot by itself. Follow clinical probability and the indicated imaging plan.',
   'Pulmonary vascular imaging such as CT pulmonary angiography can identify clot location. A blood test for fibrin breakdown cannot localize it.',
   'In selected low-probability cases a negative result helps rule out PE. A positive result can occur in several conditions and needs interpretation in context.',
   'Repeat a sample if the laboratory identifies a specimen or processing problem. Two positive results cannot replace the indicated imaging pathway for suspected PE.',
  ],
 },
 'EXP2-NP5-altered-ventilatory-function':{
  source:noninvasive,
  reasons:[
   'Correcting mask fit can help a suitable patient who is alert and can clear the airway. Tightening the mask during active vomiting increases aspiration risk.',
   'Pressure adjustments can be useful during supervised ventilation when the patient can protect the airway. Lower pressure cannot make the mask safe during this event.',
   'Routine reassessment can fit a stable patient tolerating the treatment. Active vomiting with impaired airway protection warrants immediate intervention.',
   'Remove the mask promptly, call for urgent help and protect the airway with positioning and suction as indicated. Assess oxygenation and ventilation and prepare for a definitive airway if needed.',
  ],
 },
};
