import {references as ref} from './clinical-case-references.mjs';

export const legacySources={
 'CROSS-003':ref.identity,
 'CROSS-006':ref.insulin,
 'CROSS-016':ref.potassium,
 'CROSS-017':ref.opioid,
 'CROSS-019':ref.surgery,
 'NP1-039':ref.triageGuide,
 'NP2-049':ref.hemorrhage,
 'NP3-062':ref.wound,
 'NP3-067':ref.drain,
 'NP3-075':ref.catheter,
 'NP4-081':ref.hypoglycemia,
 'NP4-082':ref.hyperglycemic,
 'NP4-083':ref.feet,
 'NP5-113':ref.bls,
};

const lowGlucose='An adult who uses insulin is sweaty, shaky and hungry. Bedside glucose is 56 mg/dL. The adult is alert, can swallow safely and follows the usual oral hypoglycemia protocol.';
const lowGlucoseRecheck='Fifteen minutes after oral glucose, symptoms improve, but repeat glucose is 62 mg/dL and swallowing remains safe.';
export const updatedScenarios={
 'NP1-039':'Several casualties arrive at a safe receiving area. The number of patients exceeds available treatment resources.',
 'NP3-067':'A patient with a pleural drain develops new dyspnea and falling oxygen saturation immediately after transfer. The nurse finds that the drain was accidentally left clamped.',
 'NP3-075':'A patient with an indwelling urinary catheter has slowing urine flow during transport. The bag is held at bladder level and the tubing is visibly kinked. The closed connections remain intact.',
 'NP4-081':lowGlucose,
 'NP4-082':'An adult with diabetes has dehydration and deep, rapid breathing. Ketones and metabolic acidosis confirm DKA. Isotonic crystalloid is prescribed and the initial potassium result is pending.',
};
export const restoredCues={
 'NP4-081-1':lowGlucoseRecheck,
 'NP4-081-4':lowGlucoseRecheck,
 'NP5-113-2':'The adult has a definite pulse but is not breathing adequately.',
 'SIT-NP1-integrated-management-of-childhood-illness-imci-01-R2-action':'No stridor or wheeze is found.',
 'SIT-NP1-school-occupational-health-nursing-01-action':'The school nurse now measures glucose at 43 mg/dL. The child cannot follow directions or swallow safely. The authorized school plan includes glucagon.',
 'SIT-NP2-pediatric-respiratory-disorders-01-R2-action':'The toddler is still responsive.',
 'SIT-NP3-inflammatory-bowel-neuro-inflammatory-disorders-03-action':'A teammate suggests high-dose steroids before checking the source of the fever.',
 'SIT-NP3-pre-operative-phase-01-action':'The transport team has arrived.',
 'SIT-NP4-autonomic-dysreflexia-02-action':'The adult’s systolic pressure is markedly above their usual baseline.',
};
export const updatedPrompts={
 'NP4-081-1':'Which assessment of the initial episode and next action after the repeat reading belong together?',
 'NP4-081-4':'Which next action and teaching point should the nurse choose?',
};
export const updatedKeyPoints={
 'NP3-067':'Restore a functioning pleural drainage system promptly under the emergency protocol while assessing the patient and calling for help.',
 'NP4-081':'Treat low glucose promptly and recheck after 15 minutes. Repeat if glucose remains low and use the appropriate nonoral rescue route when swallowing is unsafe.',
 'NP4-082':'Treat volume loss and assess potassium as part of DKA care. Follow ketones and acid–base recovery to confirm resolution.',
};

// A replacement is scoped to the original item and slot, leaving saved
// revisions and the original answer index intact.
export const choiceEdits={
 'CROSS-019-4':{
  3:['Two approved identifiers match, but the site marking still conflicts with the consent','Two approved identifiers help confirm the patient. The team must still resolve the site discrepancy and verify the intended procedure before proceeding.',ref.surgery],
 },
 'NP1-039-3':{
  2:['Tell each arriving person to choose a treatment station before being triaged','Directions to a station are appropriate once an assigned triage category or incident plan identifies it. Self-routing before triage can use scarce capacity out of priority order.',ref.triageGuide],
 },
 'NP1-039-4':{
  3:['Patient movement follows the incident plan, but initial triage ratings are never revisited','Coordinated movement supports the incident response. Ratings still need reevaluation because patient condition and resources can change.',ref.triageGuide],
 },
 'NP3-062-3':{
  1:['Wait until the next routine wound check to mention a sudden opening'],
 },
 'NP3-067-1':{
  1:['New dyspnea and falling saturation with an accidentally clamped pleural drain'],
 },
 'NP3-067-4':{
  1:['The client reports less dyspnea, but saturation remains low and the drain is still obstructed'],
 },
 'NP3-075-1':{
  1:['The drainage bag is level with the bladder and the tubing is kinked','A bag at bladder level and a visible kink impair gravity drainage. Maintain the closed system, lower the bag below the bladder and check for free flow.',ref.catheter],
 },
 'NP4-081-5':{
  2:['Reassess for glucose returning to the safe range and improvement in symptoms','Both the glucose value and symptoms help judge recovery. An improved value still below 70 mg/dL calls for further protocol-directed treatment.',ref.hypoglycemia],
 },
 'NP4-082-4':{
  1:['Circulation improves, blood ketones clear and pH or bicarbonate recovers'],
  2:['Blood pressure improves, but ketones and acidosis persist'],
 },
 'SIT-NP3-ards-03-recognition':{
  3:['An isolated oxygen-sensor error with unchanged ventilation','Check for sensor artifact when a saturation reading is inconsistent with assessment and ventilation. Here reduced delivered ventilation and high pressure also changed, so assess the patient and circuit immediately.',ref.ventilator],
 },
 'SIT-NP4-hepatobiliary-disorders-01-R2-safety':{
  0:['Increase lactulose to produce more watery stools despite dizziness'],
 },
 'SIT-NP4-thyroid-disorders-01-R2-action':{
  1:['Hold the next thionamide dose and arrange urgent assessment and a complete blood count with differential'],
 },
 'SIT-NP4-thyroid-disorders-02-R2-teaching':{
  0:['Take the standard levothyroxine tablet as prescribed and separate calcium and iron by at least four hours'],
  1:['Use the same levothyroxine product but continue to take it with both supplements','Consistent formulation helps with stable replacement. For this tablet, taking calcium and iron with it still reduces absorption. Use the verified separation schedule.',ref.levothyroxine],
 },
 'SIT-NP4-thyroid-disorders-04-teaching':{
  0:['Continue changing doses independently as long as calcium is taken separately','Separating calcium is useful when it is part of the regimen. It does not make independent levothyroxine dose changes safe. Agree on a consistent regimen and explain how to monitor after a change.',ref.thyroidMonitoring],
 },
 'SIT-NP4-endocrine-emergencies-summary-01-R2-action':{
  0:['Hold empagliflozin and initiate emergency DKA assessment despite glucose of 180 mg/dL'],
  1:['Treat as isolated hyperosmolar hyperglycemic state without checking the ketones and acidosis','Fluids and electrolyte monitoring matter in both crises. Isolated HHS does not explain the ketones and metabolic acidosis with glucose of 180 mg/dL. Assess and treat DKA.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-01-R2-planning':{
  0:['Consider recovery complete when osmolality and circulation improve, with acidosis still present','Osmolality and circulation help guide HHS recovery. In ketoacidosis, also demonstrate ketone clearance and acid–base recovery before ending the DKA pathway.',ref.hyperglycemic],
 },
 'SIT-NP4-alzheimer-s-disease-dementia-03-R2-recognition':{
  2:['Progression of dementia as the established cause of agitation','Dementia symptoms can change gradually. An abrupt change after a fall with focal guarding calls for immediate injury and pain assessment, along with assessment for delirium.',ref.delirium],
 },
};

export const targetedReasons={
 'NP3-075-2':{
  0:['Opening a closed system increases infection risk. A visible kink and bag at bladder level can be corrected without disconnecting the tubing.',ref.catheter],
  2:['Lower the bag below the bladder, remove the kink and reassess output. These steps restore gravity drainage while preserving the closed system.',ref.catheter],
 },
 'NP5-113-2':{
  0:['With a definite pulse and inadequate breathing, start rescue breathing and activate emergency help. Give naloxone when available without delaying ventilation. Reassess breathing and pulse.',ref.bls],
  2:['Chest compressions are indicated when cardiac arrest is suspected and no definite pulse is detected. This adult has a definite pulse and needs ventilation first.',ref.bls],
 },
 'SIT-NP1-community-mental-health-program-03-action':{
  0:['Routine blood testing fits a clinically stable client. New fever or throat symptoms while taking clozapine need prompt assessment for infection or neutropenia.',ref.clozapine],
  2:['The federal REMS reporting requirement ended in the United States. Prescribing guidance still calls for neutrophil monitoring, and new symptoms require timely clinical review.',ref.clozapine],
  3:['Dose increases can be considered by the prescriber if psychiatric symptoms warrant them. Fever signals a possible adverse effect or infection and calls for assessment before changing the dose.',ref.clozapine],
 },
 'SIT-NP1-school-occupational-health-nursing-01-action':{
  0:['Glucose of 43 mg/dL and unsafe swallowing support severe hypoglycemia needing help. Give the authorized glucagon, call emergency help, monitor breathing and follow the school response plan.',ref.school],
  3:['Insulin before a meal can apply under the usual plan once glucose is safe. At 43 mg/dL with impaired swallowing, additional insulin worsens the immediate problem.',ref.school],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-safety':{
  1:['Report the verified potassium of 2.9 mmol/L and new weakness now. These findings alter the safety of continued insulin and require an urgent response.',ref.hyperglycemic],
  2:['Continue rhythm and repeat electrolyte monitoring during correction. A safe potassium trend is needed before insulin is restarted.',ref.hyperglycemic],
  3:['Confirm the ordered potassium route, dilution and rate and monitor according to the protocol. Potassium replacement makes it possible to continue needed insulin more safely.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-recognition':{
  1:['Check glucose when weakness could represent hypoglycemia. Weakness alone cannot establish that diagnosis. The verified potassium of 2.9 mmol/L requires prompt action.',ref.hyperglycemic],
  2:['Potassium may start normal or high before DKA treatment despite total-body depletion. The verified current value is low and must guide insulin decisions.',ref.hyperglycemic],
  3:['DKA resolution depends on blood ketones and pH or bicarbonate. This result identifies a potassium complication during treatment.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-action':{
  0:['Continuing IV insulin can be appropriate once potassium is above the safe threshold. At 2.9 mmol/L, hold it per protocol and alert the team immediately.',ref.hyperglycemic],
  1:['Dextrose may be needed during insulin treatment as glucose falls. It does not correct hypokalemia or make an unchanged insulin rate safe at 2.9 mmol/L.',ref.hyperglycemic],
  3:['A new rhythm abnormality is an emergency. A verified potassium of 2.9 mmol/L while insulin is running is already enough to escalate, even before any rhythm change.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-teaching':{
  0:['Explain resolution after checking the ketone and acid–base goals. The low potassium here is a temporary safety reason to hold insulin and replace potassium.',ref.hyperglycemic],
  1:['An ongoing insulin plan depends on the type of diabetes and the team’s assessment. This acute complication calls for a temporary pause rather than permanent withdrawal.',ref.hyperglycemic],
  3:['Glucose guides dextrose and some insulin adjustments. A safe repeat potassium and a verified restart plan matter when insulin was held for hypokalemia.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-planning':{
  0:['Document finishing the infusion and obtain the required repeat potassium. Administration alone does not show that the serum level has recovered.',ref.hyperglycemic],
  1:['Less weakness is useful clinical information. A potassium of 3.1 mmol/L remains below the threshold for restarting insulin under this DKA pathway.',ref.hyperglycemic],
  3:['Glucose is useful to monitor during DKA treatment. It cannot compensate for a potassium of 2.9 mmol/L or show that insulin is safe to resume.',ref.hyperglycemic],
 },
 'SIT-NP4-endocrine-emergencies-summary-04-reasoning':{
  0:['Insulin shifts potassium into cells and is sometimes used for acute hyperkalemia. The same effect can worsen this client’s existing hypokalemia.',ref.hyperglycemic],
  2:['Early DKA can present with a high measured level even while total-body potassium is low. A measured value of 2.9 mmol/L signals a clinically important deficit.',ref.hyperglycemic],
  3:['Glucose control helps reduce osmotic diuresis. It does not immediately restore potassium from prior losses. Use prescribed replacement and verify the response.',ref.hyperglycemic],
 },
};
