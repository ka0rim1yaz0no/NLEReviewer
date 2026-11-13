const crises='https://pmc.ncbi.nlm.nih.gov/articles/PMC11272983/';
const hypoglycemia='https://diabetesjournals.org/care/article-pdf/49/Supplement_1/S132/848848/dc26s006.pdf';
const diabetesKidney='https://kdigo.org/wp-content/uploads/2018/03/ADA-KDIGO-Consensus-Report-Diabetes-CKD-KI-2022.pdf';
const foot='https://professional.diabetes.org/sites/dpro/files/2026-06/dontletdiabetesgetonyourpatientsnerves_hcp_june26.pdf';
const insulin='https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/761412Orig1s000lbl.pdf';
const sickDay='https://www.cdc.gov/diabetes/living-with/managing-sick-days.html';
const adrenal='https://pmc.ncbi.nlm.nih.gov/articles/PMC5314805/';
const adrenalNICE='https://www.nice.org.uk/guidance/NG243/chapter/recommendations';
const steroid='https://academic.oup.com/ejendo/article-pdf/190/5/G25/57417666/lvae029.pdf';
const skin='https://woundsinternational.com/wp-content/uploads/2025/05/ISTAP25_CD_Skin-tears_WINT_web.pdf';
const pheo='https://pmc.ncbi.nlm.nih.gov/articles/PMC12819074/';
const hyperthyroid='https://journals.sagepub.com/doi/full/10.1089/thy.2016.0229';
const storm='https://pmc.ncbi.nlm.nih.gov/articles/PMC13506520/';
const myxedema='https://pmc.ncbi.nlm.nih.gov/articles/PMC13452032/';
const thyroid='https://www.entuk.org/_userfiles/pages/files/guidelines/anae_15585.pdf';
const levothyroxine='https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/021402s038lbl.pdf';
const sodium='https://academic.oup.com/ejendo/article/170/3/G1/6668028';
const avp='https://link.springer.com/content/pdf/10.1007/s11102-020-01083-7.pdf';
const pth='https://jsbmr.umin.jp/guide/pdf/Bilezikian-2022-Evaluation-and-management-of-primar.pdf';
const ckdMbd='https://kdigo.org/wp-content/uploads/2017/02/KDIGO_CKD_MBD_Guideline_r6.pdf';
const hypoPth='https://pmc.ncbi.nlm.nih.gov/articles/PMC10118814/';

export const endocrineCases={
 'SIT-NP4-diabetes-mellitus-01-R2':{
  source:diabetesKidney,
  scenario:'A hospitalized adult with type 2 diabetes usually takes metformin. After a dehydrating illness, creatinine is still rising and the team documented acute kidney injury. The usual dose is due and the medicine orders have yet to be reviewed.',
  assessment:'Acute kidney injury can reduce metformin clearance, especially with dehydration or hypoperfusion. Check the latest renal trend and whether the acute-illness medication plan has been entered.',
  action:'Pause before administering the due metformin and follow the acute-illness hold and escalation protocol. Verify current renal function and the temporary diabetes plan with the prescriber.',
  teaching:'Discuss the individualized sick-day hold and restart instructions. Seek advice when vomiting, dehydration or serious illness develops and before restarting after acute kidney injury.',
  outcome:'The team documents whether metformin remains held, the interim glucose plan and when renal function and restart criteria will be reviewed.',
  reasoning:'Metformin can accumulate when kidney clearance falls during acute illness, raising the risk of associated lactic acidosis. A restart requires clinical recovery and reassessment of kidney function.',
  safety:'Metformin can be appropriate in a stable patient who meets renal criteria. Giving extra during acute kidney injury increases exposure and is unsafe.',
  followUp:'Document the medication decision and glucose plan, then check the renal trend, hydration and the team’s decision before giving metformin again.',
  alternate:'General sick-day education applies when the patient is able to participate. This check specifically documents the active kidney injury, the interim glucose plan and who will decide when metformin can resume.',
  edits:{
   recognition:{3:['Stable chronic kidney disease with routine metformin monitoring only','Routine renal monitoring fits a stable patient receiving an appropriate dose. Rising creatinine after acute illness changes the immediate medication decision.']},
   action:{1:['Review general sick-day instructions and give the unchanged dose before checking renal function','Sick-day instructions are useful once the acute plan is clarified. The current kidney injury needs review before administering the due dose.']},
   reasoning:{3:['A previously suitable metformin dose can be continued during the rise in creatinine without further review','A stable history can support routine treatment when renal criteria are met. The current renal change can alter clearance, so it requires a metformin-specific review.']},
  },
 },
 'SIT-NP4-diabetes-mellitus-02':{
  source:foot,
  scenario:'An adult with diabetic loss of protective sensation finds an intact plantar blister after walking barefoot. The blister is painless. There is no fever, spreading redness or drainage.',
  assessment:'Loss of protective sensation makes pain an unreliable indicator of tissue injury. Inspect the blister, surrounding skin, footwear, pressure points and the foot’s circulation.',
  action:'Reduce pressure on the injured area, assess skin integrity and circulation, and arrange prompt diabetic foot evaluation and protection. Escalate if spreading redness, drainage, color change or systemic symptoms develop.',
  teaching:'Inspect both feet daily, using a mirror or help if needed. Wear appropriate footwear indoors and outside, avoid walking barefoot and report new blisters or other skin breaks.',
  outcome:'Track wound size, skin condition, circulation and signs of infection. Confirm protective footwear and offloading are used according to the foot-care plan.',
  reasoning:'Peripheral neuropathy can hide minor or serious injury. Early visual and vascular assessment reduces the chance that pressure injury or infection progresses unnoticed.',
  safety:'Absence of pain can contribute to assessment when sensation is intact. It cannot identify a painless blister as harmless in a foot with loss of protective sensation.',
  followUp:'Record the first wound and perfusion findings and the planned follow-up. Verify whether protection is working and inspect for redness, drainage or deterioration.',
  alternate:'Correct insulin identification is a useful self-management outcome. This check concerns whether the foot injury is protected and healing without infection or ongoing pressure.',
 },
 'SIT-NP4-diabetes-mellitus-03':{
  source:insulin,
  scenario:'An adult uses a separate basal insulin pen and a rapid-acting mealtime pen. Before the breakfast dose the patient cannot verify which pen is which. Both pens have labels, and no dose has been given.',
  assessment:'The inability to distinguish two insulin products before an injection creates medication-error risk. Establish the exact product, strength, timing and intended dose before anyone injects.',
  action:'Pause the injection and verify the printed product name, strength, prescribed units and timing against the current prescription. Check glucose and what doses were already taken, then use teach-back.',
  teaching:'Read the printed name and strength before every dose and match them to the current schedule. Keep pens identifiable and ask the pharmacy or care team for help whenever the label or instruction is unclear.',
  outcome:'The patient uses the label and written order to identify each pen, states when it is due and demonstrates setting the correct dose. Confirm that glucose monitoring and backup instructions are understood.',
  reasoning:'Basal insulin and mealtime insulin have different time-action profiles. A product mix-up can cause a dangerous low glucose or leave meals or background needs uncovered.',
  safety:'Visual cues can help organize supplies. The pen nearest to hand, its color and a familiar cap cannot replace verifying the labeled product before giving a high-risk medicine.',
  followUp:'Ask the patient to show which label identifies each pen and demonstrate the verified dose and timing. Document the result before independent use.',
  alternate:'Injury assessment and prevention education fit a patient with a diabetic foot wound. This handoff requires verifying that the patient can identify the correct insulin before injecting.',
 },
 'SIT-NP4-diabetes-mellitus-04':{
  source:sickDay,
  scenario:'An adult with type 1 diabetes calls about vomiting and reduced intake and plans to stop checking glucose and skip all insulin until normal meals resume. Current glucose and ketones are unknown.',
  assessment:'Vomiting and poor intake during type 1 diabetes can lead to low glucose, dehydration or DKA. Ask about recent insulin, hydration, glucose and ketones and screen for emergency warning signs.',
  action:'Obtain glucose and ketone information promptly while assessing severity. Review the written sick-day plan and the insulin instructions with the diabetes team. Arrange urgent care if fluids cannot be kept down, ketones rise or severe symptoms appear.',
  teaching:'Continue the prescribed glucose and ketone checks and follow the sick-day plan for fluids and insulin. Basal insulin in type 1 diabetes generally continues even without meals, with dose changes guided by the care team.',
  outcome:'The patient knows how to track glucose and ketones, maintain hydration when safe, follow the adjusted plan and seek help. Review actual measurements and ability to tolerate fluids.',
  reasoning:'Illness can raise insulin requirements even when food intake falls. Glucose, ketones, vomiting and hydration guide action because intake alone cannot predict the direction of glucose change.',
  safety:'Monitoring can return to the routine schedule once the illness resolves and the care plan allows. Stopping checks during vomiting risks missing hypoglycemia or evolving ketoacidosis.',
  followUp:'Verify recent glucose and ketone results, urine output or hydration symptoms and whether planned insulin was given. Confirm access to urgent care if vomiting or abnormal readings persist.',
  alternate:'Correct pen selection is essential whenever more than one insulin is used. This follow-up needs glucose, ketones, intake and a documented response to ongoing vomiting.',
  edits:{reasoning:{1:['A person taking metformin may need to hold it during acute kidney injury','That principle applies when metformin is prescribed and acute kidney injury is present. This patient with type 1 diabetes needs current glucose and ketone checks and an insulin sick-day plan.',diabetesKidney]}},
 },
 'SIT-NP4-adrenal-gland-disorders-01-R2':{
  source:adrenalNICE,
  assessment:'The patient and supporter have the prescribed kit but cannot use it confidently. That gap can delay rescue treatment when oral steroids cannot be retained or a crisis is suspected.',
  action:'Review the written emergency plan, verify the kit contents and expiration, and demonstrate preparation and use with the actual product instructions. Ask both learners to demonstrate and explain whom they would call.',
  teaching:'Follow the individual emergency plan for severe illness or inability to retain oral glucocorticoid. Use the prescribed injection as trained, obtain emergency help and carry the steroid alert information.',
  outcome:'The patient and supporter correctly describe emergency triggers, demonstrate the injection and identify how to replace supplies and seek emergency care.',
  reasoning:'An emergency injection helps only if the patient or another person can recognize the need and give it in time. Training and emergency help remain necessary even when the kit is already available.',
  safety:'Demonstration and practice belong before an emergency. Waiting for collapse would delay treatment when the patient may be unable to participate.',
  followUp:'Document what each person demonstrated, check kit readiness and repeat teach-back at follow-up. Verify that they can state the emergency call plan.',
  alternate:'Skin protection is appropriate with fragile skin and wound risk. The follow-up here verifies that a supporter can recognize a suspected crisis and use the prescribed emergency kit.',
  edits:{recognition:{3:['An active adrenal crisis despite normal findings at the teaching visit','Suspect a current crisis with acute deterioration such as profound weakness, vomiting or hypotension. This case describes a gap in emergency preparedness before any of those findings develops.',adrenal]}},
 },
 'SIT-NP4-adrenal-gland-disorders-02':{
  source:steroid,
  scenario:'An adult has taken daily systemic prednisone for several months for inflammatory disease. The symptoms have improved, and the patient wants to stop tomorrow without a prescriber-directed plan.',
  assessment:'Several months of systemic glucocorticoid can suppress the adrenal stress response. Confirm the indication, current dose, duration and whether the underlying condition is controlled.',
  action:'Contact the prescriber to review whether tapering is appropriate and verify the schedule. Explain withdrawal and flare symptoms and what warrants urgent care. Continue the prescribed plan pending review.',
  teaching:'Avoid an abrupt self-directed stop of long-term treatment. Follow the written taper when ordered and report severe weakness, vomiting, dizziness or disease flare promptly.',
  outcome:'The patient can describe the agreed taper or maintenance plan, how to recognize concerning symptoms and who will review progress and adrenal recovery as needed.',
  reasoning:'Prolonged glucocorticoid exposure can suppress endogenous cortisol production. Taper the drug only when the treated disease allows, with individualized adjustments near physiologic doses.',
  safety:'A short systemic course under three to four weeks often does not require an adrenal taper. That principle does not apply to this unsupervised stop after several months.',
  followUp:'Record the verified dosing plan and symptoms during dose changes. Check for disease flare, glucocorticoid withdrawal or adrenal insufficiency at the next contact.',
  alternate:'Emergency-kit teaching fits someone with prescribed rescue treatment and crisis risk. This follow-up first checks the supervised plan for changing chronic prednisone and how the patient is tolerating it.',
 },
 'SIT-NP4-adrenal-gland-disorders-03':{
  source:skin,
  assessment:'The tear after adhesive removal is mechanical trauma on fragile skin. Check bleeding, flap viability, surrounding skin, discomfort and signs of infection.',
  action:'Assess the tear, control bleeding and cleanse gently. Protect viable tissue and use the ordered atraumatic dressing. Document the injury and adjust handling and adhesive use.',
  teaching:'Avoid pulling on fragile skin or abruptly removing adhesives. Use the planned removal method and report more bleeding, increasing pain, redness or drainage.',
  outcome:'Record tear size, flap condition and healing signs. Reassess after dressing changes and confirm protection from further tearing.',
  reasoning:'Glucocorticoid excess can cause skin thinning and bruising. Fragile skin is prone to mechanical injury, and atraumatic products and removal techniques reduce stripping.',
  safety:'Secure a dressing using products appropriate to the wound and skin. Strong adhesives pulled off quickly increase the risk of another tear here.',
  followUp:'Document the wound, skin flap and response to the new dressing. Verify healing and whether the revised technique prevents additional trauma.',
  evaluation:[
   'Document the confirmed reduction in trauma and check how the wound is being monitored. Obtain and record the next wound assessment to complete the evaluation.',
   'Marking the full target met requires both prevention of further trauma and evidence of wound monitoring. Only the first is known.',
   'An unmet finding requires evidence that a goal was missed. Here reduced trauma was observed and wound-monitoring status is unknown.',
   'A complete entry is appropriate once both findings are available. Record the known improvement now and obtain the missing wound assessment.',
  ],
 },
 'SIT-NP4-adrenal-gland-disorders-04':{
  source:pheo,
  scenario:'An adult with a known pheochromocytoma develops sudden severe headache, palpitations and a blood pressure of 224/122 mm Hg with new chest discomfort. The patient is still symptomatic.',
  assessment:'Marked symptomatic hypertension with a catecholamine-secreting tumor raises concern for a hypertensive crisis and acute organ injury. Assess symptoms, rhythm and perfusion urgently.',
  action:'Activate emergency assistance, minimize exertion and monitor blood pressure, rhythm and signs of organ injury. Prepare prescribed titratable treatment and monitored care under the specialist team.',
  teaching:'Severe headache with chest discomfort, palpitations or neurologic change warrants emergency assessment. Review the specialist treatment plan and seek help rather than trying exercise or self-adjusting medicines.',
  outcome:'Check blood pressure and symptoms during monitored treatment and reassess cardiac, neurologic and renal findings. Confirm the specialist follow-up plan after stabilization.',
  reasoning:'Excess catecholamine release can drive abrupt severe hypertension and injury. In pheochromocytoma, beta blockade before adequate alpha blockade can worsen vasoconstriction when used for rate control.',
  safety:'Activity can resume after stabilization with clinical guidance. Strenuous activity during the symptomatic pressure surge increases cardiovascular stress and delays emergency care.',
  followUp:'Record symptoms, blood-pressure trend, rhythm and initial response to treatment. Continue surveillance for organ injury and recurrence.',
  alternate:'Emergency-kit teaching applies to adrenal insufficiency. This acute episode requires blood pressure and organ-injury follow-up under the pheochromocytoma crisis plan.',
 },
 'SIT-NP4-parathyroid-disorders-01-R2':{
  source:pth,
  scenario:'On two tests three weeks apart, an adult’s albumin-adjusted calcium is 11.3 and 11.2 mg/dL, above the laboratory range. Intact PTH is also elevated. Kidney function is preserved. The patient assumes that a high PTH rules out a parathyroid cause.',
  assessment:'Repeated hypercalcemia with an inappropriately high PTH suggests PTH-dependent hypercalcemia and supports assessment for primary hyperparathyroidism.',
  action:'Review the calcium and PTH together, check supplement and medicine use, and facilitate ordered renal, vitamin D and urine assessments. Arrange specialist review to distinguish other PTH-dependent causes.',
  teaching:'Explain that high calcium should usually suppress PTH. An unsuppressed value can point toward the parathyroid glands, and related tests help determine the cause and treatment.',
  outcome:'Document the confirmed biochemical pattern, the evaluation of alternative causes and follow-up for renal and skeletal complications.',
  reasoning:'When calcium is high, an intact feedback system lowers PTH. Repeated hypercalcemia with elevated or inappropriately normal PTH is consistent with primary hyperparathyroidism, with other causes considered through the diagnostic workup.',
  safety:'A suppressed PTH usually prompts investigation of causes outside the parathyroid glands. Dismissing a parathyroid cause when the PTH is high during hypercalcemia reverses the feedback interpretation.',
  followUp:'Document the calcium and PTH trend and follow the planned diagnostic evaluation, including medicine review and relevant urine, bone and renal studies.',
  alternate:'Stone surveillance is appropriate when stones are known or suspected. The immediate follow-up here first confirms the cause of the abnormal calcium and PTH results.',
  edits:{recognition:{3:['PTH-independent hypercalcemia with normal feedback suppression','A PTH-independent cause is more likely when PTH is suppressed by high calcium. This patient has an elevated PTH despite repeated high calcium.']}},
 },
 'SIT-NP4-parathyroid-disorders-02':{
  source:pth,
  scenario:'An adult with established primary hyperparathyroidism has recurrent calcium kidney stones and a persistently elevated serum calcium. The patient has no current fever, difficulty passing urine or severe flank pain.',
  assessment:'Recurrent stones are a renal complication of primary hyperparathyroidism. Assess stone symptoms and current calcium and renal findings, and review the need for definitive endocrine management.',
  action:'Arrange review of renal function, calcium and the stone history, with imaging and stone workup as indicated. Nephrolithiasis is an indication to discuss parathyroidectomy with the specialist.',
  teaching:'Follow the prescribed fluid advice, including any fluid restriction for other conditions. Seek urgent care for severe pain, inability to pass urine or fever. Review supplements with the care team.',
  outcome:'Track stone symptoms, renal function, calcium and any recurrence under the agreed treatment. Confirm specialist follow-up so the source of the hypercalcemia is addressed.',
  reasoning:'Primary hyperparathyroidism can increase urinary calcium and stone risk. Stone prevention depends on individual assessment and treatment of the underlying disorder.',
  safety:'Calcium supplements may be ordered for specific indications such as hypocalcemia. New flank pain in this patient warrants assessment rather than taking large additional doses without review.',
  followUp:'Record current symptoms, calcium and renal findings and when stone risk and treatment options will be reassessed.',
  alternate:'A renal mineral and bone disorder plan applies to CKD-related secondary hyperparathyroidism. This patient has primary hyperparathyroidism with renal stones needing a disease-specific plan.',
  edits:{recognition:{2:['An incidental calcium result requiring only repeat laboratory confirmation, with no renal complication','Repeating calcium and PTH fits a patient whose biochemical diagnosis is uncertain. Recurrent calcium stones in established disease already identify a renal complication that needs assessment.']}},
 },
 'SIT-NP4-parathyroid-disorders-03-R2':{
  source:ckdMbd,
  scenario:'An adult with stage 4 chronic kidney disease has increasing PTH, persistently elevated phosphate and low-normal calcium. The adult asks to copy a relative’s treatment for primary hyperparathyroidism.',
  assessment:'The combination of kidney impairment, high phosphate and low-normal calcium supports evaluation for CKD-related secondary hyperparathyroidism. Interpret PTH as a trend with calcium and phosphate.',
  action:'Review serial calcium, phosphate and PTH together with the renal team. Assess modifiable factors such as persistently high phosphate, inadequate calcium and vitamin D deficiency.',
  teaching:'Explain that kidney disease alters phosphate and vitamin D handling. Treatment is chosen for the kidney stage and serial results, so another patient’s regimen may be unsuitable.',
  outcome:'The renal team identifies contributing factors, documents an individualized plan and monitors serial calcium, phosphate and PTH after intervention.',
  reasoning:'Reduced phosphate excretion and altered vitamin D activity in CKD can stimulate secondary PTH elevation. An elevated PTH alone does not establish the cause or select a treatment.',
  safety:'A primary hyperparathyroidism pathway can apply to persistent hypercalcemia with unsuppressed PTH after appropriate evaluation. Applying it solely because this patient’s PTH is high can miss CKD-related factors.',
  followUp:'Record the agreed kidney-specific approach and repeat calcium, phosphate and PTH as scheduled. Interpret results together before proposing changes.',
  alternate:'Recurrent stones warrant their own calcium and urinary evaluation. This case follows renal mineral and bone disease across several laboratory trends.',
  edits:{reasoning:{3:['Persistent elevation of calcium with unsuppressed PTH suggests a primary parathyroid disorder','This pattern can support primary hyperparathyroidism when documented. This adult’s calcium is low-normal and phosphate is elevated with advanced CKD, which favors a secondary process.',pth]}},
 },
 'SIT-NP4-parathyroid-disorders-04':{
  source:hypoPth,
  scenario:'An adult with chronic hypoparathyroidism takes prescribed calcium and calcitriol. After a mild muscle ache, the adult doubled both without advice. There is no breathing difficulty, sustained spasm or seizure.',
  assessment:'A nonspecific ache cannot establish low calcium. Review the extra doses, symptoms and laboratory monitoring, and assess for both low calcium and excess replacement.',
  action:'Tell the prescriber about the dose changes, assess symptoms and prepare for the ordered calcium and renal tests. Verify the next doses and when worsening symptoms would require emergency care.',
  teaching:'Take calcium and calcitriol as prescribed and use symptom and laboratory guidance from the treating team before changing the dose. Seek urgent care for severe spasm, trouble breathing or altered responsiveness.',
  outcome:'The intended dose is clarified and calcium is checked in the agreed target range. Follow urine calcium and kidney function when ordered because overreplacement can cause kidney complications.',
  reasoning:'Calcium and active vitamin D can treat chronic hypoparathyroidism but can also cause high blood or urine calcium. Symptoms alone cannot determine the safe dose.',
  safety:'An oral supplement can be appropriate at a prescribed dose. Assuming calcium supplements are harmless at any dose overlooks hypercalcemia and hypercalciuria, particularly with calcitriol.',
  followUp:'Verify the actual home doses, symptoms and calcium results after review. Confirm the patient knows when to call before making further changes.',
  alternate:'Stone evaluation matters if a stone is suspected and kidney monitoring may be part of replacement care. The first follow-up here addresses the extra doses and a safe calcium and calcitriol plan.',
 },
 'SIT-NP4-endocrine-emergencies-summary-01-R2':{
  source:crises,
  outcome:'Track blood ketones, venous acid-base results, glucose, fluid status and electrolytes during treatment. Ensure the SGLT2 inhibitor is withheld in the acute plan and reviewed before future use.',
  followUp:'Document repeat ketones, pH or bicarbonate, glucose and fluid response. The initial glucose of 180 mg/dL does not rule out SGLT2-associated DKA. Follow treatment until the criteria for resolution are met.',
  alternate:'Urgent potassium correction is necessary when potassium is dangerously low. Continue monitoring it within this plan, which must also follow the acidosis, ketones, fluid status and SGLT2 inhibitor review.',
 },
 'SIT-NP4-endocrine-emergencies-summary-02':{
  source:crises,
  scenario:'An older adult with diabetes has a glucose of 780 mg/dL, marked dehydration, an effective osmolality of 326 mOsm/kg, minimal blood ketones and a pH of 7.36. The patient is confused.',
  outcome:'Verify controlled improvement in osmolality and glucose, adequate perfusion and urine output and improving alertness without unsafe sodium or potassium changes.',
  followUp:'Document the serial osmolality, glucose, sodium, pressure, urine output and mental status. Continue ordered monitoring to detect overly rapid correction, electrolyte changes or persistent hypoperfusion.',
  alternate:'Following ketones and acidosis is central to DKA. The findings here favor HHS, so follow the rate of osmolality correction and recovery of circulation and mental status.',
 },
 'SIT-NP4-endocrine-emergencies-summary-03':{
  source:hypoglycemia,
  outcome:'Recheck glucose promptly after nonoral rescue according to protocol. Assess airway protection and return of consciousness and continue surveillance for recurrence.',
  followUp:'Document the nonoral rescue and reassess airway, breathing, glucose and mental status. Continue protocol-directed treatment for persistent hypoglycemia. Give oral carbohydrate only after safe swallowing returns.',
  alternate:'Ketone and acid-base monitoring fit suspected ketoacidosis. Here the documented emergency is severe hypoglycemia with loss of airway protection, so first confirm glucose and neurologic recovery.',
 },
 'SIT-NP4-endocrine-emergencies-summary-04':{
  source:crises,
  outcome:'Confirm repeat potassium above 3.5 mmol/L and a team-directed plan for restarting insulin. Continue repeat potassium and ECG assessment as indicated during DKA treatment.',
  followUp:'Document the repeat potassium and restart decision. Continue monitoring during insulin therapy because potassium can fall again. Resolution of weakness alone cannot substitute for the laboratory threshold.',
  alternate:'Symptoms can improve before potassium is safe. A verified value of 3.1 mmol/L still requires replacement and clinical review under the adult DKA pathway before insulin resumes.',
 },
 'SIT-NP4-thyroid-disorders-01-R2':{
  source:hyperthyroid,
  outcome:'Confirm the prescriber assessed new fever and sore throat and reviewed a CBC with differential before any further antithyroid drug exposure.',
  followUp:'Document the medication hold and measured neutrophil count, and confirm instructions about further treatment. Fever or sore throat during a thionamide can signal agranulocytosis and warrants urgent review.',
  alternate:'Separating interacting supplements can improve levothyroxine absorption. This case first requires urgent assessment for a serious blood-cell reaction to an antithyroid drug.',
 },
 'SIT-NP4-thyroid-disorders-02-R2':{
  source:levothyroxine,
  outcome:'The patient demonstrates a consistent schedule that separates the standard levothyroxine tablet from calcium and iron by at least four hours. Arrange thyroid laboratory follow-up after the administration change.',
  followUp:'Verify actual tablet timing and separation from supplements, then check the thyroid results at the prescribed interval. A corrected schedule does not immediately establish stable replacement.',
  alternate:'Regular dosing and follow-up are useful long-term. This visit also needs specific confirmation that calcium and iron no longer overlap with levothyroxine administration.',
 },
 'SIT-NP4-thyroid-disorders-03':{
  source:thyroid,
  action:'Call for emergency airway and surgical assistance. Assess breathing, give indicated oxygen and prepare to implement the thyroid-surgery hematoma emergency pathway if the airway is threatened.',
  teaching:'Report new neck pressure, swelling, voice change or difficulty breathing immediately. Staff should treat these symptoms urgently after thyroid surgery.',
  outcome:'Verify that trained responders have assessed airway patency, treated the suspected cause and documented breathing, oxygenation and ongoing monitoring.',
  safety:'A scheduled dressing review fits a stable postoperative patient. New neck swelling and stridor can signal an expanding hematoma with airway compromise, so emergency help cannot wait.',
  followUp:'Record the emergency response and reassess airway patency, oxygenation, work of breathing and neck swelling. Continue escalation if the airway response is incomplete.',
  alternate:'A levothyroxine schedule matters after stabilization and discharge. This handoff first needs evidence that the immediate surgical airway threat was addressed.',
 },
 'SIT-NP4-thyroid-disorders-04':{
  source:levothyroxine,
  outcome:'Confirm which formulation and dose are actually taken, identify administration barriers and follow the ordered thyroid tests after a stable period on the regimen.',
  followUp:'Document consistent use of the verified regimen and planned thyroid monitoring. Assess adherence, timing, interacting medicines and symptoms before further adjustment.',
  alternate:'Emergency airway assessment applies with postoperative neck swelling, stridor or distress. This case concerns consistent hormone replacement and laboratory follow-up.',
 },
};


export const endocrineLegacyCases={
 'NP4-084':{
  source:storm,
  scenario:'An adult with poorly controlled Graves disease develops a temperature of 40°C, a heart rate of 154/min and new agitation during an infection. The changes are rapidly progressing.',
  decisions:{
   1:{
    0:[null,'High fever, severe tachycardia and altered behavior in known thyrotoxicosis raise concern for thyroid storm. Evaluate organ function and the trigger while activating emergency treatment.'],
    2:[null,'Hypothermia with hypoventilation and reduced consciousness fits severe hypothyroid decompensation. This patient has hyperthermia and marked tachycardia in known hyperthyroidism.',myxedema],
   },
   2:{
    1:['Treat only with glucocorticoid and fluid replacement for presumed isolated adrenal crisis','Glucocorticoids and fluids can help in adrenal crisis and may form part of thyroid storm treatment. They alone do not address the thyroid hormone excess and cardiac risk in this case.'],
    2:[null,'Activate emergency care, assess airway and circulation, start cardiac and temperature monitoring and assist with ordered thyroid-storm treatment and cooling. Prepare prescribed antithyroid therapy and other agents. When iodide is indicated, its timing follows the antithyroid medicine.'],
   },
   3:{
    0:[null,'Teach medication adherence and prompt reporting of severe fever, palpitations, confusion or breathlessness after stabilization. Help the patient identify when to seek emergency assessment.'],
    3:[null,'Fluid restriction can be prescribed for a stable patient with inappropriate antidiuretic hormone activity and dilutional hyponatremia. Thyroid storm requires an individualized fluid plan and thyroid-specific follow-up.',sodium],
   },
   4:{
    2:[null,'Recovery of ventilation and temperature after cautious warming is tracked in myxedema coma. This patient is hyperthermic and needs response assessed after thyroid-storm treatment.',myxedema],
    3:[null,'Recheck temperature, rate and rhythm, blood pressure and mental status. Stabilization after acute treatment is meaningful when the precipitating illness is also being addressed.'],
   },
   5:{
    0:[null,'Anxiety can cause transient palpitations after urgent causes are excluded. The documented fever, marked tachycardia and agitation during thyrotoxicosis need emergency evaluation.'],
    2:[null,'Teaching new warning signs and the prescribed medication plan is appropriate after urgent treatment and stabilization.'],
   },
  },
 },
 'NP4-085':{
  source:myxedema,
  scenario:'An adult with long-untreated hypothyroidism has a temperature of 33.8°C, pulse of 43/min and respirations of 7/min. The patient opens the eyes briefly to voice and then drifts back to sleep.',
  decisions:{
   1:{
    1:[null,'Severe tachycardia, fever and agitation suggest thyroid storm in a person with thyrotoxicosis. The hypothermia, bradycardia and hypoventilation here instead signal severe hypothyroid decompensation.',storm],
    3:[null,'This combination raises concern for a myxedema crisis. A patient can be critically ill before becoming fully comatose. Hypoventilation and decreased alertness require emergency support.'],
   },
   2:{
    0:[null,'Activate emergency help, assess and support ventilation and monitor circulation, temperature and glucose. Prepare prescribed stress-dose glucocorticoid and thyroid hormone replacement under critical-care guidance.'],
    2:[null,'A thyroid-storm regimen fits severe thyrotoxicosis with hyperthermia and marked tachycardia. The documented hypothermia, bradycardia and slow breathing call for urgent ventilatory support and hypothyroid-crisis management.',storm],
   },
   3:{
    1:[null,'After recovery, review consistent thyroid replacement, monitoring and early reporting of worsening drowsiness or cold intolerance. Discuss how to obtain medical review before changing the dose.',levothyroxine],
    3:['Follow the antithyroid medicine teaching plan for Graves disease','People receiving antithyroid medication need teaching about adverse effects and signs of recurrence. This patient requires counseling on thyroid hormone replacement for hypothyroidism.',hyperthyroid],
   },
   4:{
    0:['Hypotension from an isolated adrenal crisis resolves after steroid and fluid treatment','Pressure and perfusion are monitored during adrenal crisis and matter here as well. This patient’s central recovery findings include adequate ventilation, improved alertness and improving hypothermia.',adrenal],
    1:['Marked fever and tachycardia resolve after treatment of thyroid storm','Temperature and rate are tracked in both conditions, but this client begins with hypothermia and bradycardia. The goal is recovery after treating severe hypothyroidism.',storm],
    2:[null,'Reassess ventilation, oxygenation, mental status, circulation and temperature during cautious treatment. Improving alertness alone is insufficient if ventilation remains depressed.'],
   },
   5:{
    2:[null,'Serial checks of breathing, alertness and temperature are appropriate during critical-care treatment because respiratory recovery may lag.'],
    3:[null,'Sedative medication can have a role for a defined indication under monitored care. Unprescribed sedation during severe hypoventilation and drowsiness can worsen respiratory depression.'],
   },
  },
 },
 'NP4-086':{
  source:adrenal,
  scenario:'An adult with known primary adrenal insufficiency has repeated vomiting, cannot retain the prescribed oral hydrocortisone and becomes weak and confused. Blood pressure is 76/42 mm Hg.',
  decisions:{
   1:{
    1:[null,'High fever, rapid pulse and agitation in thyrotoxicosis can indicate thyroid storm. In this patient inability to retain the replacement steroid and profound hypotension point to adrenal crisis.',storm],
    2:[null,'Vomiting with loss of steroid replacement and profound hypotension in known adrenal insufficiency supports suspected adrenal crisis. Treat promptly while obtaining indicated tests.'],
   },
   2:{
    1:[null,'Thyroid-storm therapy is appropriate when severe thyrotoxicosis is present. It does not address loss of glucocorticoid replacement and shock in this case.',storm],
    3:[null,'Activate emergency care and prepare immediate parenteral hydrocortisone and IV isotonic saline under protocol. Monitor blood pressure, perfusion, glucose and electrolytes and treat hypoglycemia as indicated.'],
   },
   3:{
    1:[null,'Adherence to antithyroid medication is important for a patient with hyperthyroidism. This patient needs a steroid sick-day plan and training for when oral doses cannot be retained.',hyperthyroid],
    2:[null,'After stabilization, review the written sick-day steroid plan, when to use the prescribed emergency injection and when to call for emergency care. Confirm patient and caregiver teach-back.',adrenalNICE],
   },
   4:{
    1:[null,'Reassess pressure, mentation, peripheral perfusion, urine output, glucose and electrolytes after treatment. Evaluate the cause of vomiting and ensure ongoing steroid coverage.'],
    2:['Marked fever, rapid heart rate and agitation resolve after thyroid-storm treatment','Those are useful outcomes during thyroid-storm treatment. The immediate adrenal crisis outcome here is restoration of perfusion while treating steroid deficiency and monitoring metabolic abnormalities.',storm],
   },
   5:{
    0:[null,'A clinician may stop selected short courses of systemic steroids without taper. A patient with known adrenal insufficiency needs ongoing replacement and an emergency plan for illness. Abruptly stopping the replacement is unsafe.',steroid],
    2:[null,'Reviewing the written sick-day and emergency injection plan is appropriate after urgent replacement therapy and stabilization.',adrenalNICE],
   },
  },
 },
 'NP4-087':{
  source:sodium,
  scenario:'An inpatient with confirmed syndrome of inappropriate antidiuresis has a serum sodium of 121 mmol/L and new confusion. The patient has no seizure and remains able to protect the airway. The team has ordered sodium and fluid management and frequent reassessment.',
  decisions:{
   2:{
    0:[null,'Check orientation, alertness, airway and other neurologic symptoms, then promptly notify the team and carry out the ordered treatment and sodium checks. Escalate worsening symptoms immediately.'],
    1:['Wait for the next planned sodium value before reporting new confusion','Serial sodium and fluid checks are appropriate for stable monitoring. New confusion at this sodium requires prompt neurologic assessment and clinical escalation now.'],
   },
   3:{
    0:[null,'Marked thirst and large dilute urine volumes can suggest a different water-balance problem after pituitary surgery. This case’s priority is confusion during documented hyponatremia.',avp],
    3:[null,'Once the patient can participate, review the prescribed fluid limit and when to report worsening confusion, headache or vomiting. Acute neurologic symptoms require immediate assessment even if the patient is following the fluid plan.'],
   },
   4:{
    0:[null,'Follow the measured sodium correction and repeat the neurologic assessment. A gradual, protocol-appropriate rise and improving mentation support response while helping avoid overcorrection.'],
    1:['Large volumes of dilute urine decrease after treatment for vasopressin deficiency','That outcome fits postoperative vasopressin deficiency with excessive dilute urine losses. This patient needs monitoring of hyponatremia, neurologic recovery and the safety of correction.',avp],
   },
  },
 },
 'NP4-088':{
  source:avp,
  scenario:'After pituitary surgery an adult produces more than 350 mL of urine each hour for three hours. Urine specific gravity is 1.002, serum sodium is 150 mmol/L and the patient is very thirsty. Current blood glucose is normal.',
  decisions:{
   1:{
    0:[null,'Sustained high urine output with very dilute urine, thirst and high sodium after pituitary surgery supports possible arginine vasopressin deficiency. Review intake, glucose and other explanations for polyuria.'],
    2:[null,'Fever, severe tachycardia and agitation in thyrotoxicosis can indicate thyroid storm. Here postoperative dilute urine losses and hypernatremia suggest a water-balance disorder.',storm],
   },
   2:{
    0:['Apply a fluid-restriction approach for low sodium before checking the serum result','Fluid restriction can fit selected patients with inappropriate antidiuresis and low sodium. This patient is losing free water and has high sodium and needs prompt water-balance assessment.',sodium],
    2:[null,'Notify the team promptly and trend hourly output, intake, serum sodium and urine concentration. Maintain appropriate access to water if safe and assist with prescribed fluid or desmopressin treatment.'],
    3:['Start steroid and fluid replacement for presumed adrenal shock before reporting the dilute urine output','Suspected adrenal crisis with hypotension calls for urgent steroid and fluid therapy. This case shows large dilute urine losses with hypernatremia, prompting immediate water-balance review.',adrenal],
   },
   3:{
    0:[null,'Report persistent thirst, large urine volumes, inability to drink enough, dizziness or confusion. Follow the specific drinking, medicine and monitoring plan while the postoperative pattern can change.'],
    1:[null,'A prescribed fluid limit can fit confirmed dilutional hyponatremia. Restricting water without reviewing these active losses and rising sodium can worsen dehydration.',sodium],
    3:[null,'Sick-day steroid teaching is important when adrenal insufficiency is present. The expected teaching here addresses excessive thirst and urine output and the postoperative fluid plan.',adrenalNICE],
   },
   4:{
    0:['Low sodium rises toward target after treatment of inappropriate antidiuresis','That outcome fits hyponatremia with excess water retention. This patient’s sodium is high, so follow its controlled correction while assessing whether urine losses and thirst improve.',sodium],
    3:[null,'Document fluid balance, urine concentration and a safe return of serum sodium toward the prescribed range. Continue monitoring for overreplacement, hyponatremia or a changing postoperative pattern.'],
   },
   5:{
    0:[null,'Fluid restriction can be part of treatment for confirmed water retention and low sodium. In this patient with large dilute losses and hypernatremia, restricting all water without an order can worsen the deficit.'],
    2:[null,'Prompt reporting of excessive thirst and urine output is appropriate alongside direct nursing measurement and clinician notification.'],
   },
  },
 },
};

export const endocrineDirectCases={
 'EXP2-NP4-adrenal-gland-disorders':{
  source:adrenalNICE,
  reasons:[
   'Low or inappropriately normal ACTH with low cortisol favors central adrenal insufficiency. Markedly elevated ACTH and hyperpigmentation instead support primary disease here.',
   'Low cortisol with high ACTH indicates poor adrenal response despite pituitary stimulation. Hyperpigmentation and the sodium and potassium findings support primary adrenal insufficiency.',
   'A cortisol-producing adrenal tumor typically produces cortisol excess with suppressed ACTH. This case shows cortisol deficiency with high ACTH.',
   'Isolated low aldosterone can contribute to hyperkalemia. It does not explain both deficient cortisol and the high ACTH and hyperpigmentation in this case.',
  ],
 },
 'EXP2-NP4-thyroid-disorders':{
  source:hyperthyroid,
  reasons:[
   'Radioiodine can be used for selected patients with hyperthyroidism once pregnancy is excluded. Iodine crosses the placenta, so the claimed maternal-only exposure is incorrect.',
   'Activity can be selected by the specialist in an eligible patient. A lower radioiodine activity does not make treatment appropriate during pregnancy.',
   'Obtain the information promptly because it changes eligibility and treatment planning before exposure. Waiting until after treatment would miss that safety check.',
   'Pause the radioactive iodine pathway and report the positive pregnancy test promptly. The specialist must confirm pregnancy status and discuss appropriate treatment alternatives.',
  ],
 },
 'EXP2-NP4-diabetes-mellitus':{
  source:insulin,
  reasons:[
   'Comfort can influence injection preferences when skin and technique are suitable. Reduced pain in a thickened lump says nothing about reliable absorption, which can be altered by repeated injections there.',
   'Avoid the affected tissue and review systematic rotation within appropriate sites with the diabetes team. Check glucose more often when moving to unaffected skin because absorption may increase and the dose may need review.',
   'Inspect and report persistent lumps and address site selection and technique. Forceful massage after injection neither treats the lump nor makes absorption reliable.',
   'Moving to unaffected tissue is appropriate. With unchanged dosing and routine monitoring alone, the patient could miss hypoglycemia when absorption improves.',
  ],
 },
 'EXP2-NP4-endocrine-emergencies-summary':{
  source:crises,
  reasons:[
   'IV insulin can transition when biochemical criteria for DKA resolution are met and the planned subcutaneous insulin has appropriate overlap. A glucose of 220 mg/dL alone does not establish resolution.',
   'Monitoring can be reduced as the protocol permits after stabilization. Persistent acidosis and ketonemia still require serial glucose, potassium and acid-base checks.',
   'The glucose can fall before DKA resolves. Under the adult protocol, add prescribed dextrose when glucose is below 250 mg/dL and adjust insulin so treatment can continue safely until ketoacidosis resolves.',
   'Insulin still treats ketonemia, but the infusion is adjusted and dextrose is generally needed at this glucose to reduce the risk of hypoglycemia while ketoacidosis is treated.',
  ],
 },
 'EXP2-NP4-parathyroid-disorders':{
  source:pth,
  reasons:[
   'Skeletal effects can occur even without bone pain. DXA measures bone mineral density and helps establish baseline risk and monitor change.',
   'Bone pain warrants evaluation if present. Its absence cannot exclude bone loss or fracture risk when primary hyperparathyroidism is established.',
   'Serial serum calcium tracks a biochemical feature of the disorder. It does not replace a measurement of skeletal density.',
   'PTH is measured in blood and interpreted with calcium and other tests. DXA instead measures bone mineral density.',
  ],
 },
 'ORIG-NP4-parathyroid-disorders-01':{
  source:pth,
  reasons:[
   'Cinacalcet can lower serum calcium without increasing bone mineral density. The laboratory response and the skeletal outcome require their own follow-up.',
   'Improved bone density can be recorded when repeat imaging shows it. The improved calcium documents a different outcome.',
   'Persistently low density supports reassessment of fracture risk and bone-directed treatment options. It does not negate a measured fall in serum calcium.',
   'Symptoms can be followed separately, but DXA gives an objective density measurement. A lower calcium does not make the remaining low density resolve.',
  ],
 },
};
