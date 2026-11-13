import {references as ref} from './clinical-audit-references.mjs';

const cauti='https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html';
const measures='https://www.ihi.org/library/model-for-improvement/establishing-measures';
const maternalWarnings='https://www.cdc.gov/hearher/maternal-warning-signs/';
const burnReferral='https://www.ameriburn.org/burn-care-team/resources/guidelines-for-burn-patient-referral';
const diabetes='https://pmc.ncbi.nlm.nih.gov/articles/PMC12690180/';
const delirium='https://www.nice.org.uk/guidance/cg103/chapter/Recommendations';

export const challengeCases={
 'CH-001':{source:'https://wtcs.pressbooks.pub/nursingdosagecalculations/',reasons:[
  'Convert 0.60 g to 600 mg, then divide by 100 mg/mL to obtain 6 mL. The order gives a final volume of 60 mL. Dividing by 0.5 hour yields 120 mL/hour.',
  'Six mL is the right withdrawal volume. A rate of 132 mL/hour would fit 66 mL over 30 minutes if the order required adding 6 mL of drug to 60 mL of diluent. Here the total is 60 mL.',
  'The 120 mL/hour rate delivers 60 mL in 30 minutes. At 100 mg/mL, 0.6 mL contains 60 mg, one tenth of the ordered dose.',
  'Six mL provides the ordered drug amount. At 60 mL/hour, a 60 mL infusion would take a full hour instead of 30 minutes.',
 ]},
 'CH-004':{source:measures,reasons:[
  'The combined rate fell from 5 to 2.5 per 1,000 patient-days. The lower-risk group also increased from 1 to about 1.67 per 1,000 patient-days, so this interpretation omits an increase.',
  'Counts describe workload. To compare risk over time, use patient-days. In the high-risk group the denominator fell from 1,000 to 200, and the rate rose from 9 to 10 per 1,000.',
  'Equal overall patient-days make the aggregate rates easy to compare. The risk mix changed sharply, so the aggregate cannot show whether care improved within either group.',
  'The high-risk rate rose from 9 to 10 and the lower-risk rate from 1 to about 1.67 per 1,000 patient-days. A shift toward lower-risk days drove the lower combined rate. Report both group rates without attributing causation to the program.',
 ]},
 'CH-005':{source:'https://www.ihi.org/library/model-for-improvement/testing-changes',reasons:[
  'A single observed discharge is a small Plan–Do–Study–Act test. Compare what happened with the team’s prediction, record effects on handoff and timing, then adapt and retest.',
  'Standardizing across wards can follow repeat testing across different conditions. Systemwide implementation before any observation makes problems harder to diagnose and correct.',
  'A survey can identify staff concerns to include in the test. Opinions cannot show how the prompt performs during real patient teaching and handoff.',
  'Ward-wide testing may make sense after smaller trials. Waiting a month for initial feedback delays detection of problems that one observed discharge could reveal.',
 ]},
 'CH-006':{source:cauti,reasons:[
  'Disinfecting a connector can be appropriate for certain planned procedures with intact equipment. Wiping separated ends after contact with bed linen cannot restore a closed sterile drainage system.',
  'Replace both the indwelling catheter and collection system aseptically after a disconnection or break in technique. The documented indication supports replacing the catheter rather than ending drainage.',
  'A new catheter alone leaves tubing that has been disconnected and potentially contaminated. Use sterile replacement equipment on both sides of the connection.',
  'Clamping has narrowly defined uses under specific orders. It neither corrects contamination nor maintains unobstructed drainage while waiting for the routine change.',
 ]},
 'CH-007':{source:'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-5-vaccine-storage-and-handling.html',reasons:[
  'Printed expiration applies to a product stored and used as labeled. Once this vial is mixed, its earlier four-hour limit controls.',
  'Appropriate temperature helps preserve the vaccine during its labeled use period. It does not extend the four-hour interval after reconstitution.',
  'Four hours after 08:10 is 12:10. At 12:30 the vial is beyond its stated use period. Discard it according to policy and prepare a replacement eligible for use.',
  'Use the event named in the manufacturer’s instructions. The case starts the clock at reconstitution, even if the first withdrawal happens later.',
 ]},
 'CH-008':{source:'https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section5.html',reasons:[
  'About 3.0 is the odds ratio: (19 ÷ 57) ÷ (10 ÷ 90). Odds ratios are useful in case-control designs, but this question supplies group risks and asks for their ratio.',
  '0.15 is the risk difference: 0.25 minus 0.10. That is a 15-percentage-point difference and answers a question about absolute risk.',
  '0.4 comes from dividing the unexposed risk by the exposed risk. It compares avoiding the dish with eating it. This question uses the opposite direction.',
  'The risk among people who ate the dish is 19 ÷ 76 = 0.25. Among those who did not, it is 10 ÷ 100 = 0.10. The exposed-to-unexposed risk ratio is 0.25 ÷ 0.10 = 2.5.',
 ]},
 'CH-009':{source:'https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section1.html',reasons:[
  'Use each group’s own person-time. A is 6 ÷ 1,200 × 1,000 = 5. B is 8 ÷ 2,400 × 1,000 ≈ 3.3. A has the higher incidence rate despite fewer cases.',
  'These estimates result from using the combined 3,600 person-days separately for each count. The combined denominator is appropriate only for an overall rate with the combined numerator.',
  'These are the approximate group rates with the labels reversed. Match the six cases to A’s 1,200 person-days and the eight cases to B’s 2,400.',
  'A’s 5 is correct. A rate near 6.7 for B would use 1,200 person-days. B contributed 2,400, so its rate is about 3.3 per 1,000.',
 ]},
 'CH-010':{source:ref.airborne,reasons:[
  'Room-based testing can avoid exposure during transport. When essential travel is needed, use tolerated patient source control even on a short route.',
  'Limit transport to the medically necessary test. Warn the receiving area so it can maintain airborne precautions, and have the patient wear a surgical or procedure mask if tolerated during transport.',
  'Patient source control during travel helps. Inform the receiving unit before departure so staff can prepare the room and respiratory precautions.',
  'Staff respiratory protection and patient source control serve different purposes. A surgical mask on staff alone leaves the patient’s respiratory emissions unaddressed and does not substitute for staff airborne precautions when indicated.',
 ]},
 'CH-012':{source:measures,reasons:[
  'Return within 30 days is the outcome the reminder program seeks to improve. It cannot tell whether staffing for other visits suffered.',
  'Script completion is a process measure of whether staff delivered the change as planned. It does not measure displaced work.',
  'Time spent on calls is a workload measure. It would identify displacement only if paired with data showing essential visits lost or delayed because of the calls.',
  'Time diverted from other essential visits directly measures the unintended cost the team identified. Track it alongside the return rate as a balancing measure.',
 ]},
 'CH-013':{source:maternalWarnings,reasons:[
  'A persistent severe headache with new flashing spots after delivery is an urgent maternal warning sign, including for postpartum hypertensive or neurologic emergencies. Arrange immediate assessment and report the timing of delivery and symptoms.',
  'Comparing swelling over time can help with stable follow-up. Its stability does not make new visual changes and severe headache safe until tomorrow.',
  'Blood pressure is an important part of the immediate assessment. A delayed home reading cannot safely determine whether this combination of warning signs requires care.',
  'Eye evaluation can be appropriate when a clinician identifies an isolated eye problem. Severe headache with new visual symptoms in the postpartum period needs emergency assessment first.',
 ]},
 'CH-014':{source:maternalWarnings,reasons:[
  'Repeat measurements can monitor swelling after evaluation. The postpartum timing with new one-sided pain and swelling warrants urgent assessment before watchful waiting.',
  'New unilateral calf swelling and tenderness in the postpartum period may reflect a deep vein thrombosis. Arrange urgent evaluation and advise against using massage as self-treatment. New chest pain or breathlessness requires emergency help.',
  'Massage may be used for some established musculoskeletal problems. It would delay evaluation of possible thrombosis and cannot determine the cause of new unilateral swelling.',
  'A routine visit can address a stable symptom with a known cause. New unilateral pain and swelling after delivery need prompt evaluation even if they do not worsen.',
 ]},
 'CH-017':{source:maternalWarnings,reasons:[
  'Two saturated pads in an hour plus lightheadedness a week after delivery raise concern for significant postpartum bleeding and impaired circulation. Arrange emergency assessment and report the estimated loss and symptom timing.',
  'Pad counts help quantify loss and can be communicated immediately. Waiting for two more hours risks deterioration given the current bleeding and dizziness.',
  'A scheduled callback may be appropriate for mild stable symptoms after initial evaluation. Temporary relief when lying down would not remove the urgency of this bleeding.',
  'Routine visits include guidance on expected lochia. Heavy bleeding with lightheadedness needs emergency evaluation rather than waiting for that visit.',
 ]},
 'CH-018':{source:ref.seizures,reasons:[
  'Sips by mouth can be offered after an alert person can swallow safely. A straw cannot address this child’s reduced alertness and cough with attempted drinking.',
  'Remove oral fluids, ensure the airway remains clear, monitor breathing and alertness, and escalate delayed recovery. The child is not yet alert enough for safe oral intake.',
  'Food can be appropriate after recovery and safe swallowing if needed. A snack during reduced alertness creates aspiration risk. If hypoglycemia is suspected, use the clinical assessment and appropriate protocol.',
  'A swallowing assessment can be appropriate when the child is sufficiently alert and assessment is indicated. A repeat oral trial now would recreate the risk already demonstrated by coughing.',
 ]},
 'CH-019':{source:'https://professionaleducation.blood.ca/en/transfusion/clinical-guide/transfusion-reactions',reasons:[
  'Recognize the timing as a possible transfusion reaction. Both circulatory overload and transfusion-related acute lung injury can present within two hours.',
  'A high baseline natriuretic peptide may reflect chronic cardiac disease. A rise after transfusion can support overload in context, but a single high pretransfusion value does not show an acute change.',
  'New hypertension, jugular venous distension and positive fluid balance together support raised filling pressures and transfusion-associated circulatory overload. The reaction still requires clinical investigation.',
  'Hypotension without new evidence of overload can occur with transfusion-related acute lung injury or other reactions. This pattern provides less support for circulatory overload.',
 ]},
 'CH-021':{source:'https://www.apsf.org/article/monitoring-for-opioid-induced-respiratory-depression/',reasons:[
  'Assess airway patency, respiratory rate and depth, ventilation and responsiveness immediately and activate the appropriate help. Supplemental oxygen may keep saturation high while ventilation falls.',
  'Routine oximetry is useful for stable monitoring. A value of 97% on oxygen does not explain new shallow breathing or reduced responsiveness.',
  'Oxygen can be titrated to an appropriate target after assessment and stabilization. Reducing it to see whether saturation falls delays evaluation of ventilation and may add hypoxemia.',
  'Oxygen supports oxygenation when indicated. It cannot replace assessment and support of ventilation. Shallow breathing with reduced responsiveness needs action now.',
 ]},
 'CH-022':{source:cauti,reasons:[
  'Freeing the tubing is appropriate. Confirm drainage afterward and measure output before documenting the kink as the sole cause.',
  'Remove the visible kink without disconnecting the system, keep the bag correctly positioned and reassess measured drainage. Little output after correction warrants further evaluation.',
  'Catheter irrigation may be ordered for a specific indication. The visible kink can be corrected without breaking the closed system, and routine irrigation adds avoidable risk.',
  'Additional fluid may be indicated if assessment identifies volume depletion. A fluid increase before checking a reversible mechanical problem does not establish the cause of low output.',
 ]},
 'CH-023':{source:measures,reasons:[
  'Readmission is an outcome measure. It follows a relevant result but does not establish whether a nurse performed the teaching step.',
  'Discharge turnaround time can reveal unintended delays as a balancing measure. It does not show use of teach-back.',
  'The proportion of eligible discharges with teach-back documented measures whether the step occurred under the new process. Use a clear definition of completion and validate documentation as needed.',
  'Understanding at follow-up is a patient outcome. It might reflect the teaching, but it cannot directly show how often staff performed the specified step.',
 ]},
 'CH-024':{source:ref.cDiff,reasons:[
  'A dry surface is useful for safe room access. Visible cleanliness and dryness do not establish that spores were addressed on surfaces and equipment.',
  'Cleaning visibly soiled floors is appropriate. Terminal cleaning for C. difficile also needs attention to high-touch surfaces and equipment with an effective sporicidal agent.',
  'Closing a room can prevent access while cleaning takes place. Time alone cannot replace environmental removal and disinfection of persistent C. difficile spores.',
  'Confirm terminal cleaning with an approved C. difficile sporicidal product, including high-touch surfaces and reusable equipment. Follow the product’s required contact time and facility procedure before reuse.',
 ]},
 'CH-025':{source:burnReferral,reasons:[
  'The adult anterior trunk counts for 18% and the anterior half of one arm for 4.5%. Exclude the superficial posterior redness. The 22.5% partial-thickness burn meets criteria for immediate burn-center consultation.',
  '18% represents the anterior trunk alone. The partial-thickness injury also covers the front of an arm and adds 4.5%, even though the referral decision would still be urgent.',
  '40.5% would include the full superficial posterior trunk along with the anterior burns. Superficial redness is excluded from the measured burn area.',
  '27% would count an entire arm plus the anterior trunk. The vignette describes only the anterior half of the arm.',
 ]},
 'CH-026':{source:'https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html',reasons:[
  'Arterial oxygen tension measures oxygen dissolved in blood and can be useful for pulmonary gas exchange. It can be normal despite carbon monoxide binding to hemoglobin.',
  'Request a venous or arterial sample for laboratory co-oximetry to measure carboxyhemoglobin. Interpret the level with the exposure, symptoms and time on oxygen because treatment can lower the measured level.',
  'Repeating pulse oximetry at another site can help check signal quality. A conventional two-wavelength device cannot reliably distinguish carboxyhemoglobin at either site.',
  'End-tidal carbon dioxide helps assess ventilation and airway management. It does not identify hemoglobin bound to carbon monoxide.',
 ]},
 'CH-027':{source:'https://aci.health.nsw.gov.au/__data/assets/pdf_file/0003/162633/ACI-Escharotomy-for-Burn-Patients.pdf',reasons:[
  'Routine neurovascular observation is appropriate while circulation remains stable. Worsening temperature, sensation, refill and Doppler signal can precede loss of a palpable pulse.',
  'An absent Doppler signal is an emergency finding. Waiting for complete signal loss would delay treatment of already deteriorating distal perfusion.',
  'Escalate these new neurovascular changes immediately. Continue serial checks while the burn team assesses the constricting eschar and whether urgent decompression is needed.',
  'Elevation may help control edema as part of the burn plan. It does not substitute for immediate escalation once distal perfusion changes.',
 ]},
 'CH-028':{source:'https://www.nice.org.uk/guidance/cg89/chapter/Recommendations',reasons:[
  'Document the caregiver’s explanation as reported. A symmetric stocking pattern with sharp borders needs safeguarding assessment even when an accidental account is given.',
  'Clarifying the account may form part of the multidisciplinary assessment. Reporting a concern does not require a changed story or proof.',
  'The distribution and borders raise concern for an immersion injury. A burn pattern alone cannot confirm how it occurred. Record objective findings and follow the safeguarding process.',
  'Continue burn care and document the pattern and history objectively. An immersion-like scald with bilateral sharply demarcated borders warrants following the local child safeguarding pathway.',
 ]},
 'CH-029':{source:burnReferral,reasons:[
  'Follow the facility’s immediate chemical-exposure procedure, identify the substance and seek specialist advice. Chemical injuries qualify for burn consultation even when the area looks small.',
  'Surface size helps characterize thermal burns and guides some treatment decisions. It does not capture the substance, depth or ongoing exposure risk of a chemical injury.',
  'Starting the exposure response is appropriate. The mechanism already supports specialist consultation. The area estimate can follow without delaying the call.',
  'Agent-specific care can apply once the product is identified and expert advice is available. Guessing a neutralizer may cause further injury and delays the approved exposure response.',
 ]},
 'CH-030':{source:burnReferral,reasons:[
  'Activate trauma care immediately, and obtain repeat observations as resuscitation progresses. Report the current pallor and hypotension at once because the team needs those findings before the repeat.',
  'Report unstable circulation and the suspected pelvic trauma immediately to the emergency team and coordinate burn expertise. Associated hemorrhage needs urgent assessment while thermal injury care proceeds.',
  'The burn area is useful in burn management and handoff. It can be calculated alongside or after initial stabilization and must not postpone the emergency response.',
  'Major burns can contribute to shock. Pelvic trauma plus pallor and hypotension also raise concern for hemorrhage that must be evaluated promptly.',
 ]},
 'CH-031':{source:diabetes,reasons:[
  'CGM trends can be useful during the admission under protocol. They do not exclude a current low blood glucose in a symptomatic patient with a discordant sensor reading.',
  'Checking the sensor can help troubleshoot a discrepancy. Obtain bedside glucose promptly before relying on a second sensor value, because current symptoms may require treatment.',
  'Check point-of-care glucose promptly and use the hospital hypoglycemia pathway if indicated. If glucose does not explain the symptoms, promptly assess other causes.',
  'Administer scheduled insulin under the confirmed inpatient plan after assessing glucose and symptoms. Giving it now based on the sensor alone could worsen an unrecognized low.',
 ]},
 'CH-032':{source:diabetes,reasons:[
  'Fasting generally changes prandial insulin needs. In type 1 diabetes, omitting basal insulin risks ketosis and diabetic ketoacidosis even if glucose is currently in range.',
  'Usual mealtime insulin applies to the planned carbohydrate intake or regimen. With food withheld, clarify basal and correction doses instead of automatically giving the usual meal dose.',
  'Separating prandial and basal insulin is appropriate. The usual full basal dose may need adjustment for the procedure and hypoglycemia risk, so confirm the order first.',
  'Clarify the unsafe blanket hold promptly. Type 1 diabetes needs ordered basal coverage while fasting, with point-of-care glucose monitoring and adjustments under the procedure plan.',
 ]},
 'CH-034':{source:'https://aaamedicines.org.uk/guidelines/central-nervous-system/parkinson-s-disease-in-acute-care/',reasons:[
  'Withholding unsafe oral administration is appropriate during the restriction. Silent omission can disrupt time-critical treatment and leave the next dose unplanned.',
  'Arrange a prompt medication review with the prescriber and pharmacist. A suitable formulation or route depends on the particular medicine, swallow restrictions and specialist advice.',
  'Some medicines can be dispersed or given through a suitable enteral route after review. Crushing a formulation without checking it can alter delivery, and oral administration here conflicts with the swallow restriction.',
  'Swallow assessment is important, and the medicine is due before the result. Escalate promptly so an approved interim route or treatment plan can be arranged.',
 ]},
 'CH-035':{source:ref.cDiff,reasons:[
  'Testing can be indicated when compatible unexplained diarrhea recurs. Formed stool after recovery is not appropriate for routine test-of-cure sampling and a positive result alone would not establish recurrence.',
  'A toxin assay can be part of an approved diagnostic algorithm for compatible symptoms. Changing the test does not create an indication for testing an asymptomatic patient.',
  'Clarify the order. When symptoms have resolved, clinical follow-up rather than repeat testing establishes recovery. Investigate new compatible diarrhea if it develops.',
  'Treatment may be indicated for symptomatic recurrence after appropriate evaluation. A previous positive result can reflect the treated episode and does not justify treatment on its own.',
 ]},
 'CH-037':{source:delirium,reasons:[
  'A new fluctuating change in attention and responsiveness suggests hypoactive delirium. Use the appropriate delirium assessment and look promptly for acute contributors, including illness and medication effects.',
  'Dementia may cause gradual cognitive decline and increases delirium risk. A change from yesterday with fluctuating attention calls for an acute assessment, including when dementia is already present.',
  'Depression can cause withdrawal and reduced conversation. The rapid onset and fluctuation in attention make delirium assessment the immediate priority.',
  'Agitation may occur in hyperactive delirium. A quiet, slowed patient can have hypoactive delirium, so do not wait for agitation to assess.',
 ]},
 'CH-038':{source:delirium,reasons:[
  'A calm environment and support for sleep can help. Removing clocks and familiar visual cues can worsen disorientation, particularly when sensory aids are already unavailable.',
  'Provide functioning glasses and hearing aids, add familiar orientation cues and reassess for contributing problems. These measures improve access to information while evaluation continues.',
  'Medication may be considered for specific severe distress or risk after appropriate de-escalation and assessment. Routine sedation can worsen confusion and leaves the modifiable sensory barriers in place.',
  'Gentle verbal reorientation can help. Restoring hearing and vision aids now makes those cues more usable and supports the patient’s own orientation.',
 ]},
 'CH-039':{source:'https://www.asam.org/docs/default-source/quality-science/the_asam_clinical_practice_guideline_on_alcohol-1.pdf',reasons:[
  'A zero means the symptom was assessed and found absent. A delirious patient’s inability to report it invalidates that assumption and can underestimate withdrawal severity.',
  'A patient unable to answer still needs close vital-sign, mental-status and safety monitoring. Use an ordered objective pathway while clinicians assess the cause.',
  'Escalate new disorientation and assess other causes. CIWA-Ar depends on reliable reporting. For suspected withdrawal delirium, follow the prescribed objective approach such as MINDS or appropriate sedation and delirium monitoring.',
  'A prior CIWA-Ar score is useful history from when the patient could participate. It does not represent current severity or safely guide dosing through an acute mental-status change.',
 ]},
};
