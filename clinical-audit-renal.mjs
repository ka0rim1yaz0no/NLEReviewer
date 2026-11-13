const aki='https://www.nice.org.uk/guidance/ng148/chapter/Recommendations';
const potassium='https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=559a0a8c-a8fe-40a5-b196-21f9308780ab&version=23';
const highPotassium='https://www.ukkidney.org/wp-content/uploads/drupal-archive/documents/FINAL%20VERSION%20-%20UKKA%20CLINICAL%20PRACTICE%20GUIDELINE%20-%20MANAGEMENT%20OF%20HYPERKALAEMIA%20IN%20ADULTS%20-%20UPDATED%20JULY%202026_0.pdf';
const magnesium='https://sps.nhs.uk/articles/treating-acute-hypomagnesaemia-in-adults/';
const magnesiumToxicity='https://www.medicines.org.uk/emc/product/13169/smpc';
const calcium='https://www.gloshospitals.nhs.uk/media/documents/Emergency_Guidance_Acute_Hypocalcaemia_in_Adults.pdf';
const sodium='https://academic.oup.com/ejendo/article/170/3/G1/6668028';
const thyroid='https://www.entuk.org/_userfiles/pages/files/guidelines/anae_15585.pdf';
const catheter='https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html';
const nephrotic='https://www.rch.org.au/clinicalguide/guideline_index/Nephrotic_Syndrome/';
const psgn='https://www.rch.org.au/clinicalguide/guideline_index/Post-streptococcal_glomerulonephritis_(PSGN)/';
const hus='https://rph.health.wa.gov.au/sitecore/content/Hospitals/PCH/Home/For-health-professionals/Emergency-Department-Guidelines/Haemolytic-Uraemic-Syndrome';
const uti='https://cps.ca/en/documents/position/management-urinary-tract-infections';
const enuresis='https://cps.ca/en/documents/position/evaluation-and-management-of-enuresis-in-the-general-paediatric-setting';
const gases='https://site.thoracic.org/assemblies/cc/clinical-education/interpretation-of-abgs';
const ventilation='https://thorax.bmj.com/content/71/Suppl_2/ii1';
const fastBreathing='https://www.anzcor.org/home/first-aid/guideline-9-2-8-first-aid-management-of-rapid-breathing-including-panic-attack';
const access='https://www.kidney.org/sites/default/files/2026-07/2019-kdoqi-guideline-vascular-access.pdf';
const stoma='https://www.cuh.nhs.uk/patient-information/diet-and-fluid-advice-for-a-high-volume-stoma-or-fistula/';

export const renalCases={
 'SIT-NP2-pediatric-renal-disorders-01':{
  source:psgn,
  scenario:'A child develops tea-colored urine, morning facial swelling and new hypertension about two weeks after a sore throat. Urine output has fallen since yesterday.',
  assessment:'Hematuria, edema, reduced urine output and high blood pressure after pharyngitis suggest an acute nephritic syndrome, including post-streptococcal glomerulonephritis.',
  action:'Check the blood pressure with the correct cuff, assess fluid status and urine output, and arrange prompt pediatric review. Prepare prescribed urine, renal and complement tests. Escalate signs of pulmonary edema or serious hypertension.',
  teaching:'Report decreasing urine, worsening swelling, severe headache, vision changes or shortness of breath promptly. Follow the specific fluid, salt and blood-pressure plan.',
  outcome:'Repeat the blood pressure and evaluate edema, output, weight and renal function. Continue specialist follow-up for persistent hypertension, reduced renal function or urinary abnormalities.',
  reasoning:'Glomerular inflammation can cause blood in the urine and reduce filtration. Salt and water retention can then contribute to edema and hypertension.',
  safety:'A mild isolated urine change can be assessed according to its own pathway. Hematuria with oliguria, edema and hypertension requires prompt medical assessment.',
  followUp:'Document the first examination and blood pressure, then review the urine and renal findings and repeat fluid and blood-pressure assessment.',
  alternate:'Urgent infection surveillance applies in a febrile child with nephrotic syndrome. This child’s follow-up focuses on nephritic findings, fluid status and hypertension after a recent infection.',
 },
 'SIT-NP2-pediatric-renal-disorders-02':{
  source:nephrotic,
  scenario:'A child with nephrotic syndrome taking prednisone develops a temperature of 39°C, increasing abdominal swelling and new abdominal pain. The family plans to wait several days for the routine visit.',
  assessment:'Fever and abdominal pain in nephrotic syndrome raise concern for serious infection, including peritonitis, particularly during immunosuppression. Assess for sepsis and altered effective circulation.',
  action:'Arrange urgent assessment now. Check vital signs, perfusion, respiratory status, abdominal symptoms and fluid balance, and follow the pediatric infection and nephrotic-syndrome pathways.',
  teaching:'Call promptly for fever, new abdominal pain, worsening swelling, breathing symptoms or reduced urine. Avoid waiting for a routine visit when those symptoms arise.',
  outcome:'Verify that infection and circulatory status were assessed promptly and indicated treatment is underway. Recheck temperature, perfusion, output and fluid status.',
  reasoning:'Nephrotic syndrome and immunosuppression can both raise the risk of severe infection. Edema can coexist with poor circulating volume, so assess perfusion during the infection workup.',
  safety:'Routine follow-up fits a stable child with an established care plan. New high fever and abdominal pain require urgent evaluation.',
  followUp:'Document the infection assessment and treatment response. Repeat vital signs, abdominal findings, circulation and fluid balance as planned.',
  alternate:'Blood pressure and renal monitoring are useful in nephritic disease and still matter here. The new fever and abdominal pain require specific follow-up of suspected infection as well.',
 },
 'SIT-NP2-pediatric-renal-disorders-03':{
  source:hus,
  scenario:'Several days after bloody diarrhea, a child develops pallor, new unexplained bruises and much less urine. The child was previously alert and active and is now listless.',
  assessment:'Pallor, bruising and oliguria after diarrhea raise concern for hemolytic uremic syndrome with anemia, low platelets and acute kidney injury.',
  action:'Escalate immediately for pediatric evaluation. Assess circulation, pressure, neurologic status and urine output, and prepare urgent blood and renal tests under the clinical plan.',
  teaching:'Seek emergency assessment for decreasing urine, pallor, bruising or altered alertness after diarrhea, even when the diarrhea itself has improved.',
  outcome:'Document the blood count, platelet count, renal function, electrolytes, urine output and blood pressure and whether needed specialist care was started.',
  reasoning:'Hemolysis can produce pallor and thrombocytopenia can cause bruising. Kidney injury can sharply reduce urine. The combination after a diarrheal illness is an emergency clue.',
  safety:'Home hydration and symptom monitoring can suit uncomplicated diarrhea when the child can drink and continues urinating. Pallor, bruising and oliguria require urgent assessment.',
  followUp:'Reassess output, perfusion, blood pressure, consciousness, anemia and platelets after the urgent review. Continue monitoring because renal and hematologic abnormalities may evolve.',
  alternate:'Nephritic care also includes pressure and fluid monitoring. Here the follow-up must additionally check hemolysis and platelet depletion after a diarrheal illness.',
 },
 'SIT-NP2-pediatric-renal-disorders-04':{
  source:uti,
  scenario:'A febrile infant is being evaluated for a urinary tract infection. The clinician orders urine for culture. A staff member proposes squeezing urine from the infant’s used diaper into a container.',
  assessment:'Urine from an ordinary used diaper can be contaminated. Confirm the intended collection method and urgency so that a culture is interpretable.',
  action:'Collect an appropriately obtained specimen, such as a clean catch when suitable or a catheterized or suprapubic sample when indicated. Collect before antibiotics if feasible without delaying urgent care in a very ill infant.',
  teaching:'Explain how an appropriate sample helps distinguish infection from contamination, and why catheter collection may be needed if a valid clean catch is impractical.',
  outcome:'Verify that the specimen was collected using an approved method, labeled and handled promptly. Interpret the culture with symptoms, urinalysis and the collection method.',
  reasoning:'A specimen from a used diaper cannot reliably identify organisms in the urinary tract. Clean catch, catheter urine or suprapubic aspiration can provide a culture sample when used appropriately.',
  safety:'Some noninvasive samples can be used for screening under a protocol. A culture from squeezed diaper urine cannot reliably confirm a urinary infection.',
  followUp:'Record the collection method and timing, then follow the actual urinalysis, culture and clinical findings. Reassess treatment when results are available.',
  alternate:'Monitoring fluid status and infection response is important after initial evaluation. This handoff also needs verification that the urine collection itself was suitable for culture.',
 },
 'SIT-NP3-acute-kidney-injury-aki-01-R2':{
  source:aki,
  scenario:'A creatinine result rises from 0.8 to 1.2 mg/dL over 36 hours. Measured urine output remains at least 0.7 mL/kg/hour, and current blood pressure has not fallen. A colleague believes the change cannot meet an AKI criterion without low output.',
  assessment:'A rise from 0.8 to 1.2 mg/dL is 0.4 mg/dL within 36 hours and is 1.5 times baseline. The creatinine change meets adult AKI criteria despite ongoing urine output.',
  action:'Report the creatinine trend and assess volume status, circulation, urinary symptoms, medication exposure and recent illness. Follow the plan for repeat tests and urine-output monitoring.',
  teaching:'Explain that AKI may occur while urine is still being passed. Attend follow-up tests and seek help for low urine, breathlessness or new fluid accumulation.',
  outcome:'The acute creatinine rise is recognized, reversible causes and complications are evaluated and repeat renal assessment is arranged.',
  reasoning:'Either an acute creatinine rise or sustained low urine output can support identification of AKI. Preserved output does not exclude a documented 0.4 mg/dL rise within 48 hours.',
  safety:'Urine output is valuable to monitor. Using it alone to dismiss a qualifying creatinine change can delay care.',
  followUp:'Document the repeat creatinine and fluid balance and check which reversible causes were considered. Escalate worsening results or new complications.',
  alternate:'Urgent renal treatment is appropriate with severe complications such as refractory hyperkalemia or pulmonary edema. The present follow-up addresses an acute creatinine rise even without oliguria.',
  edits:{
   recognition:{1:['AKI defined by sustained oliguria during low perfusion','Sustained low urine output with impaired circulation can support AKI. This patient’s output is preserved and the verified creatinine rise is the qualifying finding.']},
   action:{0:['Review one suspected drug and defer assessment of fluid status and other causes','A targeted medication review is appropriate when there is a plausible exposure. No drug is established here, so assess fluid, circulatory, obstructive and medicine-related causes.']},
   reasoning:{2:['Sustained urine output below 0.5 mL/kg/hour may fulfill the output criterion','That threshold is relevant when low output is sustained for the required time. This case meets a creatinine criterion without oliguria.']},
  },
 },
 'SIT-NP3-acute-kidney-injury-aki-02':{
  source:aki,
  scenario:'An adult receiving a medicine with recognized kidney toxicity has rising creatinine and decreasing urine output over two days. The next dose is due and the renal dosing plan has not been reviewed.',
  assessment:'The temporal change in kidney function raises concern for possible medicine-related AKI or accumulation. Assess volume and perfusion and rule out other contributors before attributing it to one cause.',
  action:'Report the renal trend and suspected exposure promptly. Verify the next dose with the prescriber or pharmacist under the medication-safety protocol and monitor output and renal and electrolyte results.',
  teaching:'Ask the patient to report over-the-counter medicines and supplements and seek advice before taking products that may affect kidney function during illness.',
  outcome:'Verify that the drug indication, dose and alternatives were reviewed, avoidable exposure was reduced and repeat renal function and output were assessed.',
  reasoning:'A potentially nephrotoxic exposure can contribute to AKI. Declining renal clearance can also raise exposure to some medicines, which makes a medicine-specific review important.',
  safety:'A prescribed dose can continue when its continued safety has been reviewed. Automatically repeating an unreviewed potentially nephrotoxic dose during a rising creatinine can cause avoidable harm.',
  followUp:'Confirm the actual medication decision and look for changes in creatinine, electrolytes and urine output. Reassess volume status and other possible causes.',
  alternate:'Emergency dialysis evaluation fits a severe refractory complication. The documented change here first requires review of the possible toxic exposure and renal trend.',
  edits:{
   recognition:{2:['Isolated drainage obstruction as the confirmed cause of the renal change','Consider mechanical drainage obstruction when there is sudden loss of flow, bladder fullness or a tubing problem. These findings have yet to be documented and the medicine exposure needs review.']},
   action:{0:['Report the creatinine trend for routine follow-up and give the next dose before reviewing the exposure','Routine follow-up can suit stable renal function. Here the change is acute and the next potentially nephrotoxic dose needs review before administration.']},
  },
 },
 'SIT-NP3-acute-kidney-injury-aki-03':{
  source:catheter,
  assessment:'Abrupt cessation of urine drainage with discomfort and a visible kink suggests mechanical outflow obstruction. Check for bladder fullness and correct the external cause promptly.',
  action:'Remove the external kink without opening the closed system, keep the bag below bladder level and reassess drainage and symptoms. Escalate persistent pain or failure to drain according to protocol.',
  teaching:'Ask the patient to report bladder discomfort or sudden lack of drainage and to avoid lying on or pulling the tubing. Keep the collection bag below the bladder.',
  outcome:'Verify that urine drains into the bag, measure the return and reassess bladder discomfort. If drainage does not return, report possible catheter blockage or retention promptly.',
  reasoning:'A kink can prevent urine from reaching the bag even while the kidneys produce it. Correct the visible external problem and assess the patient before assuming reduced renal production.',
  safety:'The bladder and drainage system should be assessed before manipulating a catheter. Giving fluid without addressing the kink, or breaking the closed system routinely, can add risk.',
  followUp:'Document whether urine flow returned and bladder discomfort improved. If either finding persists, obtain the indicated assessment for retention or catheter malfunction.',
  alternate:'Urgent renal care applies if systemic complications develop. The recorded intervention here needs a check that mechanical drainage was actually restored.',
 },
 'SIT-NP3-acute-kidney-injury-aki-04':{
  source:aki,
  scenario:'An adult with AKI develops worsening dyspnea, bilateral crackles and falling oxygen saturation. Potassium is 6.7 mmol/L on a nonhemolyzed sample and the ECG shows new peaked T waves.',
  assessment:['This combination suggests pulmonary edema and severe hyperkalemia with ECG effects. Both require immediate clinical escalation.',highPotassium],
  action:['Activate emergency care, monitor rhythm and breathing and give indicated oxygen. Prepare prescribed IV calcium to protect the heart when ECG changes are present, as well as treatment to shift and remove potassium. Obtain urgent renal and critical-care review.',highPotassium],
  teaching:'After stabilization, teach the patient to report breathlessness, reduced output, weakness or palpitations promptly and to follow the individualized medicine and renal follow-up plan.',
  outcome:'Reassess oxygenation, effort, rhythm, potassium and fluid status. Track treatment response and urgent renal replacement plans if refractory overload or hyperkalemia persists.',
  reasoning:['High potassium with new ECG changes threatens cardiac conduction. Low oxygenation with crackles and overload also warrants urgent treatment, including specialist assessment for kidney replacement when complications fail to respond.',highPotassium],
  safety:['Routine follow-up or dietary measures can be part of stable potassium management. They cannot replace immediate monitored treatment for severe hyperkalemia with ECG changes and possible pulmonary edema.',highPotassium],
  followUp:'Document response in oxygenation, work of breathing, rhythm and repeat potassium, and the timing of the renal plan. Continue surveillance for treatment effects and recurrent hyperkalemia.',
  alternate:'Nephrotoxic exposure should be reviewed, but this follow-up must first confirm treatment of hypoxemia and severe hyperkalemia and whether urgent dialysis is indicated.',
  edits:{
   recognition:{3:['Stable kidney dysfunction suitable for a routine medication review','Routine medication review fits clinically stable patients. Confirmed hyperkalemia with ECG changes and falling oxygenation requires immediate treatment of complications.']},
   action:{1:['Arrange routine review of creatinine and medications before starting monitored emergency care','Review the medication and creatinine history as part of the workup. It cannot delay treatment of potassium-related ECG changes and respiratory deterioration.']},
  },
 },
 'SIT-NP3-electrolyte-imbalances-01':{
  source:potassium,
  outcome:'Verify that a safe dose, dilution, route and infusion rate were prescribed and administered using controlled delivery when IV replacement was indicated. Recheck potassium and monitor rhythm as ordered.',
  followUp:'Document the corrected order and the actual route, rate and delivery device if IV replacement proceeded. Recheck potassium, renal function and signs of an adverse effect under the protocol.',
  alternate:'Serial neurologic checks fit a sodium correction plan. This event concerns safe potassium replacement and reassessment after preventing an IV push error.',
 },
 'SIT-NP3-electrolyte-imbalances-02':{
  source:calcium,
  scenario:'Several hours after total thyroidectomy, an adult reports tingling around the mouth and develops carpal spasms. The neck is soft without a rapidly growing swelling.',
  assessment:'New perioral tingling with carpal spasms after thyroid surgery suggests symptomatic hypocalcemia. Assess breathing, monitor ECG as indicated and obtain ordered calcium and magnesium measurements.',
  action:'Assess airway and breathing first, escalate symptoms promptly and assist with urgent calcium testing and prescribed replacement. Symptomatic severe hypocalcemia may need IV calcium and ECG monitoring.',
  teaching:'Report new tingling, cramps or spasms promptly. Difficulty breathing, sustained spasm, seizure or altered alertness needs emergency help.',
  outcome:'Confirm improved symptoms and a stable airway and rhythm, with follow-up calcium and magnesium results guiding additional treatment.',
  reasoning:'Parathyroid dysfunction after thyroid surgery can reduce calcium. Neuromuscular irritability can cause tingling, tetany and, in severe cases, laryngospasm.',
  safety:'Routine calcium checks can fit a stable asymptomatic patient. New spasms after thyroid surgery warrant prompt assessment before the scheduled check.',
  followUp:'Repeat assessment of spasms, airway, rhythm and calcium after the ordered care. Continue checks while symptoms or the risk of falling calcium persist.',
  alternate:'Depressed reflexes and slowed breathing after magnesium exposure call for a different toxicity assessment. Here reassess neuromuscular irritability and calcium after thyroid surgery.',
  edits:{
   recognition:{3:['An expanding postoperative neck hematoma as the cause of the carpal spasms','Rapid neck swelling or new stridor would support an airway emergency from a possible hematoma. This presentation gives a soft neck and neuromuscular irritability consistent with low calcium.',thyroid]},
   reasoning:{2:['New neck swelling after thyroid surgery can compress the airway','That finding would require urgent assessment for a hematoma. This case has carpal spasm and perioral tingling without growing swelling, so calcium-related assessment is indicated.',thyroid]},
  },
 },
 'SIT-NP3-electrolyte-imbalances-03':{
  source:magnesiumToxicity,
  scenario:'An adult with severe renal impairment has taken repeated doses of a magnesium-containing laxative. The patient is newly drowsy with markedly diminished reflexes and a respiratory rate of 9/min.',
  assessment:'Reduced renal clearance with recent magnesium exposure, depressed reflexes and slowed breathing raises concern for magnesium toxicity. Assess ventilation and circulation urgently.',
  action:'Stop further magnesium exposure, obtain emergency assistance and support breathing and circulation. Prepare urgent magnesium and renal testing and ECG monitoring. Severe toxicity may require ordered IV calcium and renal replacement.',
  teaching:'Review magnesium-containing laxatives, antacids and supplements with the renal team before use. Seek urgent care for new excessive sleepiness, weakness or slowed breathing.',
  outcome:'Reassess respiratory rate and effort, mentation, reflexes, blood pressure and rhythm. Follow magnesium and clearance measures until the patient is stable.',
  reasoning:'Kidney impairment can reduce magnesium excretion. Accumulation depresses neuromuscular and cardiac function, accounting for diminished reflexes and hypoventilation.',
  safety:'An over-the-counter product may be appropriate after reviewing the ingredients and renal function. Continuing magnesium during suspected accumulation can worsen respiratory and cardiovascular depression.',
  followUp:'Document exposure stopped, current ventilation and circulation and repeat magnesium testing. Escalate persistent symptoms or rising magnesium.',
  alternate:'Monitoring the rate of sodium correction fits a documented sodium disorder. Here immediate reassessment is for airway, circulation and magnesium toxicity.',
  edits:{
   recognition:{3:['Pulmonary fluid overload as the only explanation for the slowed breathing','Treat fluid overload when findings such as crackles, hypoxemia and excess volume support it. Depressed reflexes and slowed breathing after repeated magnesium doses point to possible toxicity.']},
   action:{2:['Start a treatment plan for low calcium before checking for magnesium toxicity or supporting ventilation','IV calcium may be ordered to counter serious magnesium effects and to treat selected hypocalcemia. This case first requires emergency breathing support and recognition of the magnesium exposure.']},
   reasoning:{3:['Kidney dysfunction can cause breathlessness from retained fluid when pulmonary edema is present','Fluid overload can impair oxygenation. Here magnesium ingestion, loss of reflexes and hypoventilation favor neuromuscular depression from accumulation.']},
  },
 },
 'SIT-NP3-electrolyte-imbalances-04':{
  source:sodium,
  scenario:'An adult with chronic hyponatremia is undergoing monitored correction. Sodium has increased from 114 to 119 mmol/L in four hours. The prescriber ordered frequent sodium and neurologic checks, but a staff member proposes increasing the infusion rate to reach normal by the end of the shift.',
  assessment:'The sodium has already risen 5 mmol/L in four hours. Trend the total correction and neurologic findings and review the planned limits with the team before making any change.',
  action:'Check the current order and latest sodium, reassess neurologic status and contact the team promptly to verify the rate. Never make an unapproved change aimed at immediate normalization.',
  teaching:'Explain why frequent blood draws and neurologic checks guide the pace of correction. Report new confusion, weakness, speech changes or other neurologic symptoms promptly.',
  outcome:'Document the sodium trend and neurologic status within the individualized safety plan. Escalate overly rapid correction or a worsening examination immediately.',
  reasoning:'Severe hyponatremia can cause neurologic symptoms. Excessively rapid correction of chronic hyponatremia increases osmotic demyelination risk, so track the cumulative rise rather than aiming to normalize the result quickly.',
  safety:'The treating team may adjust the rate based on urgent symptoms and serial results. Increasing the rate without review after a 5 mmol/L rise can exceed safe correction limits.',
  followUp:'Record the time and amount of sodium change, neurologic findings and what the team ordered. Continue serial testing and escalate an unexpectedly fast rise.',
  alternate:'Respiratory depression from magnesium toxicity requires monitoring and treatment when present. This case requires tracking sodium correction and the neurologic examination.',
  edits:{
   recognition:{3:['Fully corrected hyponatremia requiring no further laboratory checks','Laboratory checks may be spaced when the sodium and clinical status are safe and the team agrees. Sodium is still low and rising under active treatment.']},
   reasoning:{3:['A rise of 5 mmol/L by itself proves sodium correction is complete','A modest initial rise can be enough to address urgent symptoms. It does not establish full recovery or justify further acceleration. Use the cumulative trend and neurologic assessment.']},
  },
 },
 'SIT-NP3-acid-base-balance-abg-01':{
  source:gases,
  action:['Assess airway patency, respiratory rate and depth and alertness. Escalate promptly for ventilatory support and evaluate possible causes such as sedative effect or respiratory illness.',ventilation],
  teaching:'Call for help if the patient becomes increasingly drowsy or breathing becomes slow or shallow. Clinical assessment of ventilation remains important during oxygen therapy.',
  outcome:'Reassess depth and rate of breathing, alertness, PaCO₂ and pH after support. Saturation is also monitored but cannot show whether ventilation has improved.',
  safety:['Pulse oximetry helps assess oxygenation. A normal reading, especially on oxygen, cannot exclude high PaCO₂ in a drowsy, shallow-breathing patient.',ventilation],
  followUp:'Recheck ventilation at the bedside and repeat gases as ordered. A falling PaCO₂ with improving pH and alertness supports response if the patient can sustain breathing.',
  alternate:'Circulation and loss of bicarbonate are priorities with metabolic acidosis from diarrhea. This case shows high PaCO₂ and shallow breathing, so assess the response to ventilatory support.',
 },
 'SIT-NP3-acid-base-balance-abg-02':{
  source:gases,
  outcome:'After treatment for diarrheal losses, follow perfusion, output, bicarbonate, potassium and pH. The low PaCO₂ is compatible with respiratory compensation for bicarbonate of 14 mmol/L.',
  followUp:'Document the volume and electrolyte response and repeat acid-base assessment. Check for persistent diarrhea, ongoing losses or a failure of pH and bicarbonate to improve.',
  alternate:'Correcting chloride depletion after prolonged gastric suction can treat a metabolic alkalosis. This patient has metabolic acidosis from suspected diarrheal bicarbonate loss, so track that response.',
 },
 'SIT-NP3-acid-base-balance-abg-03':{
  source:gases,
  scenario:'An adult is breathing rapidly after sudden pain and fear. The assessment for other causes is still underway. The arterial pH is 7.52, PaCO₂ 28 mm Hg and bicarbonate 22 mmol/L.',
  assessment:'Alkalemia and low PaCO₂ indicate primary respiratory alkalosis. The pattern does not identify the cause, so assess oxygenation and screen for dangerous causes of tachypnea.',
  action:['Assess breathing, oxygenation, circulation and red flags and evaluate the cause. Provide calm support while watching for findings that call for urgent care.',fastBreathing],
  teaching:['Report persistent or recurrent rapid breathing, chest discomfort or faintness promptly. After assessment, review safe calming or breathing measures appropriate to the cause.',fastBreathing],
  outcome:'Confirm that breathing rate and symptoms improve, the cause is addressed and oxygenation remains adequate. Review repeat gases if clinically indicated.',
  reasoning:'Hyperventilation lowers PaCO₂ and raises pH. Pain or panic can be triggers, but hypoxemia, pulmonary embolism, infection and other causes may also produce this pattern.',
  safety:['Reassurance and calm coaching can fit when serious causes have been assessed. Paper-bag rebreathing can lower oxygen and delay appropriate care and should be avoided.',fastBreathing],
  followUp:'Reassess work of breathing, oxygenation, alertness and the evaluation of underlying causes. Record whether breathing normalizes and escalate symptoms or unexplained tachypnea.',
  alternate:'Rising PaCO₂ in hypoventilation requires ventilatory support. This patient has low PaCO₂ and tachypnea and needs evaluation of the cause and response to appropriate care.',
  edits:{
   recognition:{3:['Primary respiratory acidosis from hypoventilation','Hypoventilation can raise PaCO₂ and lower pH. These measured values show low PaCO₂ and high pH, consistent with respiratory alkalosis.']},
   reasoning:{2:['Slow ventilation causes carbon dioxide retention when ventilation is inadequate','That mechanism produces respiratory acidosis. Here rapid breathing has lowered carbon dioxide and raised pH. Assess what is driving the increase in breaths.']},
  },
 },
 'SIT-NP3-acid-base-balance-abg-04':{
  source:gases,
  action:'Review the need for ongoing suction with the team and quantify losses. Monitor volume status and chloride and potassium and assist with prescribed treatment.',
  teaching:'Report new weakness, palpitations or dizziness and follow the ordered monitoring and replacement plan while gastric losses continue.',
  outcome:'Track suction losses, volume status, chloride, potassium, bicarbonate and pH. Improving alkalemia should follow correction of the sustaining losses and deficits.',
  safety:'Gastric suction can be necessary for decompression when indicated. Increasing it solely to correct alkalemia can increase acid and chloride losses and worsen the disorder.',
  followUp:'Record suction output and repeat electrolytes and acid-base measurements. Reassess ongoing volume and chloride losses before further adjustments.',
  alternate:'Restoring fluid after diarrhea can address metabolic acidosis from bicarbonate loss. Gastric acid loss produces the documented alkalemia here, so the follow-up tracks gastric losses and electrolyte correction.',
 },
};

export const renalLegacyCases={
 'NP2-060':{
  source:nephrotic,
  scenario:'A child with nephrotic syndrome has marked edema. After a diuretic the child becomes tachycardic with cool extremities, capillary refill of four seconds and falling urine output.',
  decisions:{
   1:{
    0:[null,'Edema can coexist with intravascular depletion. New tachycardia, delayed refill, cool extremities and lower urine output after diuresis signal impaired perfusion.'],
    2:[null,'Remission is established with appropriate urine protein results and clinical follow-up. Worsening perfusion after a diuretic cannot be used as evidence of remission.'],
   },
   2:{
    0:[null,'A diuretic may be ordered for selected patients after volume status is assessed. Repeating it immediately in the presence of new poor perfusion can worsen intravascular depletion.'],
    1:[null,'Fluid restriction can be used in selected nephrotic patients after clinical assessment. Restricting all intake until a routine review delays urgent attention to signs of poor perfusion.'],
    2:[null,'Reassess circulation, vital signs, mental status and urine output and obtain urgent pediatric review. Verify fluid and diuretic orders before further treatment.'],
   },
   3:{
    0:[null,'Reduced urine, cool extremities and unusual weakness or sleepiness can indicate poor perfusion even when there is marked edema. Report those changes urgently.'],
    2:[null,'Use diuretics only as prescribed and reviewed. A fall in urine output can reflect poor circulating volume, so repeating the dose automatically can be harmful.'],
   },
   4:{
    1:[null,'Reduced edema can be desirable when circulation remains adequate. Increasing tachycardia and delayed refill indicate worsening perfusion even when swelling is lower.'],
    3:[null,'Improving refill, pulse, warmth and urine output support improved circulation. Continue monitoring oxygenation, edema and fluid balance during treatment.'],
   },
   5:{
    0:[null,'Diuresis can suit selected fluid-overloaded patients under review. Giving another dose based only on swelling overlooks the new signs of intravascular depletion.'],
    2:[null,'Immediate reassessment of vital signs, mentation and capillary refill is appropriate because perfusion has deteriorated. Report the findings and recent medication promptly.'],
   },
  },
 },
 'NP3-073':{
  source:aki,
  scenario:'An adult with large diarrheal fluid losses becomes dizzy and has a blood pressure below baseline. Urine output falls over several hours and creatinine is rising. There is no ostomy or dialysis access.',
  decisions:{
   1:{
    2:[null,'High ostomy losses can cause dehydration, electrolyte losses and AKI when an ostomy is present. This patient’s documented loss is diarrhea with impaired circulation.',stoma],
    3:[null,'Reduced urine and rising creatinine after significant fluid loss and a drop in pressure suggest kidney hypoperfusion. Assess and escalate while considering other causes.'],
   },
   2:{
    0:[null,'Assess vital signs, perfusion, intake and measured urine and stool losses. Review creatinine and electrolytes and follow the prescribed resuscitation and reassessment plan.'],
    2:[null,'Checking a thrill and protecting the access arm are appropriate when an arteriovenous dialysis access is present. Here the immediate assessment concerns fluid losses and kidney perfusion.',access],
   },
   5:{
    2:[null,'Repeat urine output and renal function checks after treating the cause are appropriate. Include hemodynamics and signs of fluid excess or recurrent losses.'],
    3:[null,'A patient with hypovolemia may need prescribed fluid resuscitation and reassessment. Unrestricted fluid for every instance of oliguria can worsen overload or miss obstruction and other causes.'],
   },
  },
 },
};

export const renalDirectCases={
 'EXP2-NP2-pediatric-renal-disorders':{
  source:enuresis,
  reasons:[
   'Positive reinforcement may encourage behaviors the child can control, such as using the toilet before bed. Punishment for involuntary wetting does not teach bladder control.',
   'Regular daytime hydration and voiding are generally encouraged. Restricting all daytime fluid can contribute to dehydration and constipation.',
   'Adjusting the timing of drinks may be useful after assessment. A strict evening restriction alone can miss constipation or a related voiding pattern that a diary can help reveal now.',
   'Assess timing, daytime symptoms and constipation, and use a supportive bladder diary without blame. Discuss treatment if wetting causes distress or if additional findings suggest a different problem.',
  ],
 },
 'EXP2-NP3-acute-kidney-injury-aki':{
  source:aki,
  reasons:[
   'Twenty milliliters per hour for a 70-kg adult is about 0.29 mL/kg/hour. This is below 0.5 for eight hours, so assess promptly for AKI, perfusion and obstruction while the creatinine is pending.',
   'Creatinine is useful for evaluating acute changes. Sustained low urine output can also meet an AKI criterion, so waiting for the result would delay assessment.',
   'Serial measurements help identify transient changes. This low output has already persisted beyond six hours and warrants reporting and evaluation even though urine has continued.',
   'Chronic kidney disease requires evidence of persistent abnormal structure or function. A short period of oliguria cannot establish irreversible failure.',
  ],
 },
 'EXP2-NP3-acid-base-balance-abg':{
  source:gases,
  reasons:[
   'An isolated respiratory acidosis has high PaCO₂ and bicarbonate near baseline or increased depending on duration. Bicarbonate of 18 mmol/L points to an additional metabolic acidosis here.',
   'An isolated metabolic acidosis should produce compensatory lowering of PaCO₂. The measured value of 60 mm Hg instead adds a respiratory acidifying effect.',
   'Concurrent metabolic alkalosis would tend to raise bicarbonate. The bicarbonate is low here, supporting an additional metabolic acidosis.',
   'The blood is acidemic. PaCO₂ of 60 mm Hg and bicarbonate of 18 mmol/L each contribute to acidemia, identifying combined respiratory and metabolic acidosis.',
  ],
 },
 'EXP2-NP3-electrolyte-imbalances':{
  source:magnesium,
  reasons:[
   'Repeat a result if collection error or an unexpected value makes it suspect. Low magnesium can coexist with true low potassium and does not invalidate the potassium measurement.',
   'Isolated potassium replacement can be adequate when no other deficit persists. Magnesium depletion can promote renal potassium loss and make replacement alone ineffective.',
   'Low magnesium can sustain urinary potassium loss. Review and correct both deficits as prescribed while monitoring renal function, repeat levels and rhythm when indicated.',
   'Magnesium treatment addresses the deficiency but cannot remove the arrhythmia risk from significant potassium or magnesium abnormalities. Continue monitoring as the clinical plan requires.',
  ],
 },
};
