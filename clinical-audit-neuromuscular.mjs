const ms='https://www.nice.org.uk/guidance/ng220/resources/multiple-sclerosis-in-adults-management-pdf-66143828948677';
const heat='https://www.va.gov/MS/LEARN_ABOUT_MULTIPLE_SCLEROSIS/Keep_Cool_Multiple_Sclerosis_and_Heat_Tolerance.asp';
const bladder='https://www.nice.org.uk/guidance/cg148/chapter/Recommendations';
const baclofen='https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4585aafe-0af8-4786-a419-6a7e76671ca2';
const mgNew='https://pmc.ncbi.nlm.nih.gov/articles/PMC13352217/';
const mgEmergency='https://myasthenia.org/wp-content/uploads/2024/09/MGFA-brochure-Emergency-Mgt-First-Responders.pdf';
const mgCare='https://myasthenia.org/living-with-mg/after-your-diagnosis/general-mg-management/';
const mgSwallow='https://myasthenia.org/wp-content/uploads/2024/09/MGFA-brochure-Effects-of-MG-on-Voice-and-Speech.pdf';
const mgDrugs='https://myasthenia.org/understanding-mg/learn-more-about-mg-treatments/mg-brochures/cautionary-drugs/';
const gbs='https://onlinelibrary.wiley.com/doi/full/10.1111/ene.16073';
const clot='https://www.nice.org.uk/guidance/ng89/chapter/Recommendations';
const pressure='https://www.healthquality.va.gov/HEALTHQUALITY/guidelines/WRC/PIP/PIP-CPG_2026-Guideline_Final_20261020.pdf';
const als='https://www.nice.org.uk/guidance/ng42/resources/motor-neurone-disease-assessment-and-management-pdf-1837449470149';
const lems='https://n.neurology.org/content/neurology/97/11/e1168.full.pdf';
const cidp='https://onlinelibrary.wiley.com/doi/10.1111/jns.12455';
const parkinsons='https://www.aan.com/PressRoom/Home/PressRelease/4936';
const neuropathy='https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy';
const psgn='https://www.rch.org.au/clinicalguide/guideline_index/Post-streptococcal_glomerulonephritis_(PSGN)/';
const aki='https://www.nice.org.uk/guidance/ng148/chapter/Recommendations';
const catheter='https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html';
const prevention='https://www.cancer.gov/types/breast/causes-risk-factors/prevention/preventive-breast-surgery';
const consent='https://www.facs.org/for-patients/preparing-for-surgery/informed-consent/';

export const neuromuscularCases={
 'SIT-NP4-multiple-sclerosis-ms-01':{
  source:ms,
  scenario:'An adult with multiple sclerosis does shopping, laundry and meal preparation without a break on the same morning. Fatigue limits the final task. The room was cool, and the patient reports no new focal deficit, urinary symptoms or fever.',
  assessment:'Identify the pattern of fatigue, the effort required by each task, and effects on daily function. Check whether sleep, medicines, pain, mood or another condition could also be contributing.',
  action:'Agree on the task that matters most, schedule brief rests before exhaustion and review potentially treatable contributors. Plan manageable physical activity based on ability and preferences.',
  teaching:'Spread demanding tasks across periods of better energy. Take planned rests and ask for help with selected tasks. Report an unexplained change from baseline.',
  outcome:'Check whether the patient can complete the chosen tasks with manageable fatigue and whether another contributor requires assessment or care.',
  reasoning:'Fatigue in multiple sclerosis can fluctuate with effort and other factors. A symptom diary and paced tasks can show what helps, while assessment can identify another cause that needs treatment.',
  safety:'A graded activity program can support function. Requiring all demanding tasks without rest ignores the documented fatigue and can make routine activity less safe.',
  followUp:'Ask which prioritized tasks the patient completed, record fatigue before and after activity, and review sleep, medicines and other suspected contributors if difficulties persist.',
  alternate:'A plan for new neurologic deficits fits new visual, sensory or motor loss. This care plan follows task tolerance, pacing and contributing causes of fatigue.',
 },
 'SIT-NP4-multiple-sclerosis-ms-02':{
  source:heat,
  scenario:'An adult with multiple sclerosis experiences the usual right-leg heaviness within minutes of a hot bath. The symptom subsides after cooling, and strength returns to the usual baseline within an hour. There is no fever or new symptom.',
  assessment:'The short-lived return of a familiar deficit after heat exposure supports a heat-associated symptom flare. Verify the return to baseline and assess for infection or new symptoms if recovery is incomplete.',
  action:'Assist safe cooling and reassess strength and gait. Contact the clinical team promptly for a new, persistent or atypical deficit or signs of infection.',
  teaching:'Choose a cooler bath temperature and allow breaks to cool down. Discuss new, persistent or unusual symptoms rather than attributing all weakness to heat.',
  outcome:'Document the return to baseline after cooling and confirm the patient can identify symptoms that should trigger further review.',
  reasoning:'Raised temperature can temporarily interfere with conduction in nerves already affected by multiple sclerosis. This episode resolves on cooling, a pattern distinct from a sustained neurologic change.',
  safety:'Gradual exercise in tolerable conditions can support conditioning. Hotter baths can reproduce the symptoms and increase fall risk while the leg is weak.',
  followUp:'Compare strength, gait and symptom duration with baseline. Follow through on planned reassessment for recurrence, a prolonged deficit or signs of infection.',
  alternate:'Evaluation of emptying belongs with urgency, hesitancy or retention. Follow this event with a strength and gait check and document the response to cooling.',
 },
 'SIT-NP4-multiple-sclerosis-ms-03':{
  source:bladder,
  scenario:'An adult with multiple sclerosis reports urinary urgency, hesitancy and repeated small voids with a persistent feeling of incomplete emptying. No evaluation of residual urine has been done.',
  assessment:'Urgency suggests a storage symptom. Hesitancy, small voids and an incomplete-emptying sensation also raise concern for a voiding problem and support further assessment.',
  action:'Review voids, intake, medicines and possible infection symptoms. Obtain a postvoid residual measurement by bladder scan as ordered or under protocol and report concerning findings.',
  teaching:'Explain how to record intake and voids. Report inability to pass urine, painful bladder fullness, fever or new urinary symptoms promptly.',
  outcome:'Check whether urine is emptying adequately and whether the plan reflects the residual measurement, bladder symptoms and any infection findings.',
  reasoning:'Neurologic bladder dysfunction can impair both storage and emptying. The sensation of urgency alone cannot identify residual volume, so assess that objectively before choosing a plan.',
  safety:'Individualized fluid advice can help selected bladder symptoms. Blanket restriction without checking retention, hydration or infection leaves important causes unaddressed.',
  followUp:'Record the voiding pattern, postvoid residual and relevant infection findings. Confirm that the next assessment or management step addresses the results.',
  alternate:'A new persistent visual change merits prompt neurologic or eye assessment. This case follows lower urinary tract function and residual volume.',
 },
 'SIT-NP4-multiple-sclerosis-ms-04':{
  source:ms,
  scenario:'After several stable months, an adult with multiple sclerosis reports blurred vision and reduced color perception in one eye over 36 hours. The change is new and has persisted at normal temperature. There is no fever reported.',
  assessment:'Arrange prompt review of this new focal deficit. An inflammatory relapse or optic neuritis is possible, and assessment should also consider infection and other ocular or neurologic causes.',
  action:'Contact the clinical team promptly and arrange evaluation through the appropriate urgent pathway. Document onset and progression and screen for associated findings. Use emergency pathways for acute vision loss or other emergency signs.',
  teaching:'Report new vision loss or a persistent neurologic change promptly. Record when it began and tell the clinician about fever, infection symptoms or other new deficits.',
  outcome:'Verify that the visual deficit was assessed and that a specific plan and follow-up were communicated to the patient.',
  reasoning:'A new deficit lasting beyond 24 hours after a stable interval can support possible relapse once infection and other causes are assessed. A new visual change still needs timely review before its cause is confirmed.',
  safety:'A familiar heat-related symptom may settle as temperature normalizes. Waiting for this new, sustained vision change to resolve could delay evaluation and treatment of its cause.',
  evaluation:[
   'The completed assessment is one part of the goal. Mark the full goal met once the individualized plan and follow-up are confirmed.',
   'Record a goal as unmet when evidence shows an expected outcome failed. The handoff confirms that the visual change was evaluated and leaves the care plan unverified.',
   'An integrated entry may include both findings when available. Document the completed evaluation now and update the record when the care plan is verified.',
   'Document that the new deficit was assessed. Verify the clinician’s impression, the planned action and the follow-up communicated to the patient.',
  ],
 },
 'SIT-NP4-myasthenia-gravis-mg-01':{
  source:mgEmergency,
  scenario:'An inpatient with myasthenia gravis develops a weaker cough, pools saliva and becomes increasingly short of breath at rest. Oxygen saturation is 97% on room air.',
  assessment:'Worsening bulbar and respiratory muscle function raises concern for impending myasthenic crisis. A normal oxygen saturation may persist early despite weakening ventilation or airway protection.',
  action:'Activate emergency assessment, withhold oral intake while airway protection is uncertain and prepare breathing support. Obtain serial respiratory mechanics when feasible without delaying stabilization.',
  teaching:'Once urgent care is underway, explain that a weaker cough, inability to clear saliva and new breathlessness require immediate help even with an initially reassuring oxygen saturation.',
  outcome:'Confirm trends in cough strength, secretion handling and ventilation. Escalate inability to protect the airway, deteriorating mechanics or increasing respiratory effort.',
  reasoning:'Weakness of respiratory and bulbar muscles can compromise ventilation and airway protection before oxygen saturation falls. The combination of breathlessness at rest and pooled saliva makes this urgent.',
  safety:'Reassurance about fluctuating limb or eyelid weakness may be appropriate after assessment. Claiming that respiratory muscles are spared could delay emergency support for developing crisis.',
  followUp:'Reassess respiratory effort, ability to clear secretions and relevant measures such as forced vital capacity and inspiratory force. Confirm whether respiratory support is now required.',
  alternate:'Activity tolerance helps guide a stable patient’s daily schedule. This emergency assessment follows airway protection and ventilation.',
  edits:{
   recognition:{1:['Stable meal-related swallowing fatigue with preserved secretion handling','Pacing and swallow-team review can help when fatigue occurs during meals and recovers with rest. Pooled saliva and increasing breathlessness at rest indicate more urgent deterioration.']},
   reasoning:{0:['Meal-related chewing fatigue can improve after a rest when breathing and secretion handling remain stable','That pattern can guide a supervised eating plan. This patient has a weak cough, pooled saliva and breathlessness at rest, so assess ventilation and airway protection immediately.']},
   action:{2:['Continue oral feeding with rest breaks while assessing swallowing at the next meal','Meal scheduling and rest can help after a safe swallowing plan is established. Pooled secretions and dyspnea call for immediate airway assessment before further oral intake.']},
  },
 },
 'SIT-NP4-myasthenia-gravis-mg-02':{
  source:mgSwallow,
  scenario:'An adult with myasthenia gravis coughs near the end of a long meal and has difficulty finishing it. At rest the patient has a strong cough, handles saliva and reports no breathlessness. A swallow assessment and medication review are available.',
  assessment:'Swallowing muscles may tire over the meal. Check cough, voice, oral residue and breathing, and stop unsafe oral intake pending assessment.',
  action:'Pause the meal when swallowing becomes unsafe. Coordinate an individualized swallow and nutrition plan, with shorter meals at times of better strength and prescribed medicine timing reviewed by the team.',
  teaching:'Follow the assessed food texture and meal plan. Rest before eating, stop when coughing or fatigue makes swallowing unsafe, and seek help for persistent symptoms or difficulty handling saliva.',
  outcome:'Reassess intake, meal duration, cough, weight and tolerance of the plan. Verify enough nutrition can be given through the recommended safe route.',
  reasoning:'Prolonged chewing and swallowing can exhaust involved muscles. Matching meal timing and task demands to assessed swallowing function lowers risk while supporting adequate intake.',
  safety:'An adapted meal can be appropriate when swallowing remains safe. Extending the meal despite coughing and fatigue increases aspiration risk and calls for reassessment.',
  followUp:'Record how much the patient tolerated, repeat the swallowing and nutrition check, and review coughing or increasing effort with the care team.',
  alternate:'A medicine-risk review is appropriate before adding a new drug. The handoff for this plan records nutrition and swallowing progress, which need their own follow-up.',
  edits:{reasoning:{1:['Vision-related activity may become difficult as sustained use worsens eyelid or eye muscle weakness','Pace visual tasks when diplopia limits function. This patient instead loses safe swallowing during a meal, so the plan must address aspiration risk and nutrition.']}},
 },
 'SIT-NP4-myasthenia-gravis-mg-03':{
  source:mgDrugs,
  scenario:'An adult with myasthenia gravis has a new prescription from another clinician and wants to add a nonprescription sleep aid. Breathing, swallowing and strength are at baseline. The new products have not been checked against the patient’s medication list.',
  assessment:'Review the exact products, indications and other medicines for risk of worsening weakness, interactions or sedation before the patient adds them.',
  action:'Contact the pharmacist and prescriber with the complete list, including nonprescription preparations. Confirm which products can be used and what monitoring is needed. Maintain prescribed myasthenia therapy unless the treating team changes it.',
  teaching:'Tell each prescriber and pharmacist about myasthenia gravis before starting a new product. Seek urgent care for breathing, swallowing or rapidly worsening muscle weakness.',
  outcome:'Verify the reviewed list, documented medicine decisions, instructions for the patient and any checks for new weakness or sedation.',
  reasoning:'Some drugs can aggravate myasthenic weakness, while sedating products can add risk in selected patients. The indication, product and alternatives determine the decision.',
  safety:'Some nonprescription products may be suitable after review. Nonprescription status alone does not establish safety for a patient with myasthenia gravis.',
  followUp:'Confirm the team recorded the decision for each new medicine and that the patient knows the plan and urgent symptoms to report.',
  alternate:'Reviewing food intake and swallowing applies after a meal-related concern. This case requires confirmation of the medication decision and patient instructions.',
  edits:{safety:{0:['Assume that a nonprescription sleep aid is safe without checking its ingredients or interactions','Nonprescription products can be considered after the specific agent and patient’s risks are reviewed. Adding this sleep aid before review could worsen sedation or complicate recognition of muscle weakness.']}},
 },
 'SIT-NP4-myasthenia-gravis-mg-04':{
  source:mgCare,
  scenario:'An adult with stable myasthenia gravis reports familiar double vision after sustained activity late in the day. It resolves with rest. There is no choking, difficulty handling saliva or shortness of breath.',
  assessment:'The timing and improvement with rest support fatigable ocular weakness during daily activity. Verify the usual pattern and assess how diplopia affects mobility and safety.',
  action:'Plan demanding tasks for times of better strength with short breaks and assistance as needed. Adapt tasks where double vision creates a safety risk and report a change from the usual pattern.',
  teaching:'Rest when weakness appears and avoid driving or hazardous tasks during double vision. Seek urgent care for breathing or swallowing deterioration and report diplopia that is new or persistent.',
  outcome:'Check whether chosen tasks can be completed safely within the patient’s strength pattern and whether the diplopia pattern has changed.',
  reasoning:'Characteristic myasthenic weakness can worsen with sustained muscle use and improve with rest. The documented symptom returns to baseline, allowing activity and safety planning while monitoring for change.',
  safety:'An individualized activity program can maintain function. Pushing through sustained double vision without rest can impair safety and is unlikely to reverse fatigable weakness.',
  followUp:'Record which activities were completed, when double vision occurred, whether it resolved with rest and where help or adaptations were needed.',
  alternate:'Monitoring ventilation and airway protection is appropriate with new respiratory or bulbar symptoms. This follow-up addresses activity and safe function during familiar, reversible ocular weakness.',
 },
 'SIT-NP4-guillain-barr-syndrome-gbs-01':{
  source:gbs,
  scenario:'A hospitalized adult with Guillain-Barré syndrome has spreading weakness and a weaker cough. Forced vital capacity fell from 30 to 18 mL/kg over eight hours. Oxygen saturation is 96% on room air and blood pressure and heart rate remain near baseline.',
  assessment:'The weak cough and rapid decline to 18 mL/kg indicate a substantial risk of ventilatory failure. Escalate urgently and reassess airway protection and respiratory muscle strength.',
  action:'Activate the urgent response pathway and request critical-care assessment. Prepare airway support and monitor ventilation, cough and serial respiratory mechanics without delaying stabilization.',
  teaching:'Explain that difficulty clearing saliva or taking a deep breath needs immediate help. New weakness and a falling respiratory capacity matter even if the saturation reading appears normal.',
  outcome:'Confirm that airway protection and ventilation have been evaluated and that any needed ventilatory support was provided promptly. Continue serial checks for deterioration.',
  reasoning:'Respiratory muscle weakness lowers vital capacity and weakens the cough before obvious desaturation can occur. The decline and a value below 20 mL/kg warrant urgent assessment for ventilatory support.',
  safety:'Pulse oximetry is useful to monitor oxygenation. Deferring respiratory assessment until it falls can miss worsening ventilation or secretion clearance.',
  followUp:'Repeat and document forced vital capacity, cough and secretion handling as feasible, and verify the level of care and response to any support started.',
  alternate:'Skin and thrombosis prevention are important with prolonged weakness. This handoff calls for reassessing the respiratory decline and response to airway or breathing support.',
 },
 'SIT-NP4-guillain-barr-syndrome-gbs-02':{
  source:gbs,
  scenario:'During inpatient care for Guillain-Barré syndrome, a patient develops abrupt, repeatable swings in blood pressure and pulse, with brief faintness on sitting up. Cough, secretion handling and the latest respiratory mechanics are unchanged.',
  assessment:'Confirmed lability and faintness warrant assessment for autonomic instability. Verify measurements, check perfusion and evaluate other causes of sudden hemodynamic change.',
  action:'Assist the patient to a safe position, assess perfusion and alert the responsible team urgently. Use ECG and blood pressure monitoring as indicated and escalate persistent instability.',
  teaching:'Call for help before changing position. Report palpitations, dizziness or near-fainting promptly so staff can check perfusion and vital signs.',
  outcome:'Confirm changes are detected and managed promptly, with repeat pressure, pulse or rhythm, symptoms and perfusion documented.',
  reasoning:'Guillain-Barré syndrome can affect autonomic regulation and produce abrupt changes in heart rate or blood pressure. Verified swings warrant monitoring and assessment for other causes.',
  safety:'Anxiety can affect heart rate and blood pressure. It should be considered after evaluating documented cardiovascular instability and symptoms of reduced perfusion.',
  followUp:'Record the pressure and rhythm trend, symptoms and response to care. Repeat the monitored assessment because another episode may occur.',
  alternate:'Skin and clot-prevention checks remain appropriate for patients with restricted mobility. They do not measure response to the blood pressure and heart rate changes in this handoff.',
 },
 'SIT-NP4-guillain-barr-syndrome-gbs-03':{
  source:clot,
  scenario:'A medically stable inpatient with Guillain-Barré syndrome cannot turn or lift the heels without help. Skin is currently intact. Vital signs, swallowing and respiratory measurements are stable.',
  assessment:['Severe immobility increases pressure injury and venous thromboembolism risk. Examine the skin and assess mobility, bleeding risk and other factors that guide prevention.',pressure],
  action:'Carry out individualized repositioning, heel offloading and skin checks. Use the prescribed clot-prevention plan based on thrombosis and bleeding risks and review it as mobility changes.',
  teaching:['Use the call system for help with turning and activity. Report pressure discomfort or skin changes and new unilateral swelling or breathing difficulty promptly.',pressure],
  outcome:['Inspect skin at risk and document actual turning, offloading and any pressure changes. Reassess mobility and whether the current thrombosis prevention remains appropriate.',pressure],
  reasoning:'A patient unable to move independently accumulates risk from prolonged pressure and venous stasis. Prevention should begin with individualized assessments and continue during recovery.',
  safety:['A stable posture is needed for some procedures. Keeping the patient in one position because sensation is reduced can delay detection of injury and increases continued pressure exposure.',pressure],
  followUp:'Verify that turns and heel offloading happened and inspect the skin after care. Review mobility and implementation of the prescribed thrombosis prevention.',
  alternate:'Serial respiratory measurements and cough assessment matter with worsening breathing strength. This handoff is about prevention after immobility measures, with baseline breathing unchanged.',
 },
 'SIT-NP4-guillain-barr-syndrome-gbs-04-R2':{
  source:gbs,
  scenario:'After acute Guillain-Barré syndrome has stabilized, an adult starts rehabilitation. The patient can stand briefly with assistance and asks for a guarantee of independent walking next week because a friend recovered quickly.',
  assessment:'The patient needs an individualized prognosis and a plan based on current strength and function. One person’s recovery does not establish another patient’s timeline.',
  action:'Discuss the current functional findings and arrange an individualized rehabilitation plan with attainable short-term goals. Ask the treating team to explain expected variability and review milestones.',
  teaching:'Describe how the team will reassess strength, transfers, walking tolerance and fatigue. Explain that the next review can guide goals without promising a date or degree of recovery.',
  outcome:'Confirm the patient can describe the next functional milestone, needed assistance and why progress is assessed over time.',
  reasoning:'Recovery after Guillain-Barré syndrome can vary in pace and completeness. Repeated assessment and rehabilitation can adapt to changing strength, endurance and support needs.',
  safety:'Prognostic estimates can inform planning when the treating team relates them to the individual. A guaranteed date or degree of recovery from another person’s experience is unsupported.',
  followUp:'Record current function, assistance required and the patient’s expectations. Revisit the next milestone as the team assesses strength and fatigue.',
  alternate:'A pressure prevention check remains appropriate during severe immobility. This rehabilitation result addresses functional milestones and expectations and still requires follow-up.',
 },
 'SIT-NP4-amyotrophic-lateral-sclerosis-als-01':{
  source:als,
  scenario:'An adult with ALS reports morning headaches, increasing daytime sleepiness and breathlessness when lying flat. Resting oxygen saturation while seated is 96%, and the symptoms have progressed over the past two weeks.',
  assessment:'Morning headache, sleepiness and orthopnea suggest possible nocturnal hypoventilation. A normal seated daytime saturation does not rule out sleep-related respiratory impairment.',
  action:'Arrange prompt respiratory assessment, including symptoms and respiratory muscle function. Request evaluation for nocturnal testing and ventilatory support as appropriate. Escalate acute distress through the emergency pathway.',
  teaching:'Report new breathlessness when lying down, waking headaches, disturbed sleep or unusual daytime sleepiness. Seek urgent help for severe breathing difficulty.',
  outcome:'Verify that the respiratory evaluation addresses nocturnal symptoms and that the patient understands the testing and ventilatory support plan.',
  reasoning:'Respiratory muscle weakness can first impair ventilation during sleep or while supine. Symptoms may warrant overnight assessment even when the patient’s awake reading looks reassuring.',
  safety:'Resting saturation is useful for identifying hypoxemia. It cannot alone exclude overnight hypoventilation in a patient with sleep-related symptoms and progressive weakness.',
  followUp:'Recheck orthopnea, morning headache and daytime alertness, and verify respiratory test results and the agreed support plan.',
  alternate:'Checking communication access is useful when speech or hand movement limits participation. The handoff here calls for evaluation of sleep-related breathing symptoms and the respiratory plan.',
 },
 'SIT-NP4-amyotrophic-lateral-sclerosis-als-02':{
  source:als,
  scenario:'An adult with ALS spends longer at each meal but coughs repeatedly when swallowing and has lost 4 kg. The immediate concern is safe intake and nutrition. There is no reported breathlessness at rest or morning headache.',
  assessment:'Coughing with swallow and weight loss suggest bulbar swallowing impairment with nutritional and aspiration risk. Determine how the difficulty affects fluids, food, medicines and secretion handling.',
  action:'Coordinate a timely swallow and nutrition assessment. Verify safety before continuing oral intake and discuss suitable textures, assistance or enteral options with the patient and multidisciplinary team.',
  teaching:'Follow the individualized swallowing plan. Report recurrent choking, wet voice, reduced intake or further weight loss. Discuss feeding options early so decisions can reflect the patient’s wishes.',
  outcome:'Review swallowing safety, weight and intake using the agreed route and continue monitoring for aspiration, support needs and changing preferences.',
  reasoning:'Bulbar weakness can prolong meals and impair swallowing. Cough and weight loss together warrant attention to airway safety and the ability to meet nutritional needs.',
  safety:'Oral meals can continue with an appropriate individual plan when assessment supports safe intake. Persisting with exhausting meals despite coughing and weight loss can delay safer care.',
  followUp:'Document the route used, tolerated intake and safety findings. Track weight, meal effort and coughing or choking at the planned reassessment.',
  alternate:'Communication support helps patients express preferences. The reported outcome in this handoff concerns safe nutrition and requires reassessment of intake and swallowing.',
 },
 'SIT-NP4-amyotrophic-lateral-sclerosis-als-03':{
  source:als,
  scenario:'An adult with ALS can no longer be understood in conversation but reliably points to letters, compares the choices offered and consistently communicates preferences. The immediate goal is meaningful participation in daily care.',
  assessment:'The documented limitation is access to understandable communication. Support the patient’s own decisions and use the reliable existing method while assessing options for future access.',
  action:'Ask the patient which method works, provide an accessible letter board or another suitable aid and allow time for answers. Involve speech-language and assistive communication services.',
  teaching:'Practice the chosen method and agree on a reliable signal for urgent needs. Teach caregivers to ask directly, wait for a response and confirm what the patient intended.',
  outcome:'Verify that the patient can signal urgent needs and communicate a preference using the available aid, including when fatigued or with another caregiver.',
  reasoning:'Motor speech loss can limit expression despite preserved understanding and decision-making. Support communication before interpreting a difficult response as impaired capacity.',
  safety:'A decision-specific capacity assessment may be needed if understanding or reasoning is impaired despite support. Losing clear speech alone does not justify excluding the patient.',
  followUp:'Ask the patient to use the aid to express a choice and signal for help. Record whether it can be reached and used reliably and whether a backup method is needed.',
  alternate:'Assessment of ventilatory function is appropriate for respiratory symptoms and routine ALS care. This intervention needs a check of reliable communication and participation.',
 },
 'SIT-NP4-amyotrophic-lateral-sclerosis-als-04':{
  source:als,
  scenario:'An adult with ALS can still communicate clearly and asks to discuss future breathing support and personal treatment preferences. There is no acute breathing difficulty. The patient wants the preferences recorded while discussion is still easy.',
  assessment:'Identify the patient’s questions, preferred timing and whom to involve. This is a request for voluntary anticipatory planning before communication needs change.',
  action:'Offer a patient-led conversation with the multidisciplinary team about available support, benefits and burdens. Provide accessible information and record preferences through the applicable local process.',
  teaching:'Explain how to share and revisit preferences as needs change. Involve family or caregivers with the patient’s agreement and confirm how the team can access the plan.',
  outcome:'Confirm that documented preferences are informed, accessible, and open to review as the patient’s wishes, respiratory status or communication needs change.',
  reasoning:'Earlier discussion gives the patient time to understand choices and express values directly. Progressive weakness may later require different communication methods or ventilatory options.',
  safety:'A patient may choose to defer a conversation that feels premature. Deferring it against this patient’s expressed wishes risks losing an opportunity for supported decision-making.',
  followUp:'Record the preferences already shared, who has access and when to revisit them. Verify that the patient can update the plan and that decisions remain voluntary.',
  alternate:'Current respiratory testing guides ventilatory support when indicated. This handoff checks access to the documented wishes and a plan for reviewing them.',
 },
};

export const neuromuscularAlternatives={
 'SIT-NP4-guillain-barr-syndrome-gbs-04:recognition':['Severe weakness and preserved alertness may require communication support. Check how the patient can signal and participate in care.',gbs],
 'SIT-NP4-guillain-barr-syndrome-gbs-04:reasoning':['Weakness may limit speech or movement even when awareness is preserved. Confirm understanding and provide an accessible response method.',gbs],
 'SIT-NP4-guillain-barr-syndrome-gbs-04:action':['Use an agreed signal, letter board or other accessible method when weakness limits speech or movement. Explain care and allow time for a response.',gbs],
 'SIT-NP4-guillain-barr-syndrome-gbs-04:teaching':['A reliable signal can help a patient with profound weakness report discomfort or ask for help. Practice it and confirm staff recognize it.',gbs],
 'SIT-NP4-guillain-barr-syndrome-gbs-04:outcome':['Test whether the patient can reliably signal needs and use the chosen method to participate in care despite weakness.',gbs],
};

export const neuromuscularDirectCases={
 'EXP2-NP4-amyotrophic-lateral-sclerosis-als':{
  source:als,
  reasons:[
   'Some people with ALS retain their usual cognition. New loss of judgment and marked behavior change still warrant clinical assessment.',
   'ALS can occur with frontotemporal dementia. A history from family helps identify changes, but diagnosis requires evaluation and consideration of other causes.',
   'Adjustment stress and frustration can affect behavior and merit support. The new changes in judgment and personality need review even if motor function has not changed.',
   'ALS can include cognitive or behavioral changes. Document the new findings and arrange assessment for possible ALS-associated changes and other treatable causes.',
  ],
 },
 'EXP2-NP4-guillain-barr-syndrome-gbs':{
  source:gbs,
  choiceSources:[gbs,gbs,cidp,gbs],
  reasons:[
   'Corticosteroids are used for selected inflammatory disorders. Evidence does not support oral corticosteroids as routine disease-directed treatment for Guillain-Barré syndrome.',
   'For eligible Guillain-Barré syndrome patients, IV immunoglobulin or plasma exchange can improve recovery by modifying the immune process. Corticosteroids have not shown comparable benefit and are not routine treatment.',
   'Corticosteroids may be appropriate for typical chronic inflammatory demyelinating polyradiculoneuropathy. That evidence does not transfer to acute Guillain-Barré syndrome.',
   'Respiratory and autonomic checks may be reduced when the team confirms stability and risk falls. Starting immunotherapy alone does not remove the need to monitor for deterioration.',
  ],
 },
 'EXP2-NP4-multiple-sclerosis-ms':{
  source:baclofen,
  reasons:[
   'A persistent lack of benefit may warrant a planned medication review. Spasms with agitation and hallucinations after abrupt baclofen cessation suggest a possible withdrawal syndrome.',
   'A prescriber can adjust a baclofen schedule when clinically needed. Independently doubling doses from an old supply can cause toxicity and delay urgent evaluation.',
   'A routine visit can review gradually worsening spasticity in a stable patient. Hallucinations and marked rebound spasms shortly after stopping baclofen warrant urgent assessment.',
   'Abrupt baclofen withdrawal can cause severe rebound spasticity, hallucinations or seizures. Arrange urgent clinical assessment and let the treating team direct any reintroduction or taper.',
  ],
 },
 'EXP2-NP4-myasthenia-gravis-mg':{
  source:mgNew,
  choiceSources:[mgNew,parkinsons,neuropathy,lems],
  reasons:[
   'Autoimmune myasthenia gravis impairs neuromuscular transmission at the postsynaptic side. Fluctuating ptosis and diplopia that worsen with sustained effort and recover after rest fit this pattern.',
   'Loss of dopaminergic signaling contributes to Parkinson motor symptoms such as bradykinesia and rigidity. That mechanism does not explain this pattern of fatigable ocular weakness.',
   'Distal sensory nerve disease can cause numbness, tingling and pain. An isolated sensory neuropathy would not explain eyelid and extraocular muscle weakness with preserved sensation.',
   'Reduced presynaptic release with facilitation after brief exercise supports Lambert–Eaton syndrome. The repeated use in this case worsens the ocular weakness, which favors myasthenia gravis.',
  ],
  choices:['Postsynaptic impairment of neuromuscular transmission'],
 },
 'ORIG-NP4-amyotrophic-lateral-sclerosis-als-01':{
  source:als,
  reasons:[
   'A capacity assessment may be necessary when a patient cannot understand or weigh a decision despite support. This patient retains decision-making ability and needs a way to express it.',
   'Match communication aids to the patient’s preferences and remaining motor abilities. Early multidisciplinary assessment helps preserve participation as speech changes.',
   'Communication equipment can be adapted again if speech or movement changes further. Delaying initial support leaves an existing barrier in place.',
   'Relatives can contribute information or help interpret a patient-approved signal. They should support the patient’s participation rather than become the sole respondents while the patient can decide.',
  ],
 },
 'ORIG-NP4-guillain-barr-syndrome-gbs-01':{
  source:gbs,
  reasons:[
   'Footwear and equipment choices belong in discharge or rehabilitation planning. A new weak cough during worsening weakness can signal an airway and ventilation problem that needs assessment now.',
   'Sensory symptoms can be tracked as part of the neurologic assessment. Focusing on one toe misses the weak cough and risk of ventilatory failure.',
   'Work and participation goals can guide rehabilitation once acute problems are stabilized. Breathing and airway protection take priority with new cough weakness.',
   'Check ventilation, ability to clear secretions and respiratory mechanics. Weakening cough can precede respiratory failure and warrants escalation.',
  ],
 },
 'ORIG-NP4-multiple-sclerosis-ms-01':{
  source:heat,
  choiceSources:[ms,heat,heat,ms],
  reasons:[
   'Multiple sclerosis can cause recurrent fatigue. A new or persistent change merits assessment for other contributing factors, including sleep, infection or medicines.',
   'Some patients can use comfortable-temperature bathing for relaxation. Prolonged hot baths may increase heat-associated symptoms in this patient.',
   'Use cooler times for demanding tasks, plan breaks and review changes that persist or feel different from the usual pattern. Cooling and pacing can help participation.',
   'Brief rest can help during a fatigue flare. Permanently giving up activity removes an opportunity for individualized exercise and may worsen deconditioning.',
  ],
 },
 'ORIG-NP4-myasthenia-gravis-mg-01':{
  source:mgEmergency,
  choiceSources:[mgEmergency,mgSwallow,mgEmergency,mgCare],
  reasons:[
   'Scheduled follow-up is appropriate for stable symptoms and long-term treatment. Severe new breathlessness and dysphagia require immediate assessment.',
   'A supervised swallowing assessment may guide oral intake once it is safe to proceed. A large meal during acute bulbar weakness puts airway protection at risk.',
   'Developing bulbar and respiratory weakness can signal impending myasthenic crisis. Activate emergency assessment and prepare airway and ventilation support.',
   'An individualized activity program can be considered during stability. Exercise cannot treat acute respiratory muscle failure and can exhaust the patient further.',
  ],
 },
};

export const earlierCaseCorrections={
 'SIT-NP2-pediatric-renal-disorders-01-safety':{
  source:psgn,
  reasons:[
   'Confirm pressure with the correct cuff and assess urine output, weight and volume status. Hematuria, oliguria and hypertension after a sore throat warrant prompt pediatric review.',
   'Reports of declining output, worsening edema, headache or breathlessness help detect complications. The family should follow the child’s prescribed fluid and salt plan.',
   'Additional oral fluid may help a child whose assessment shows volume depletion. This child has edema, hypertension and oliguria, so unlimited salt and fluid can aggravate overload until intake limits are individualized.',
   'Repeat pressure, fluid balance and renal assessments show whether the child is improving. Persistent hypertension, reduced renal function or worsening edema call for further review.',
  ],
 },
 'SIT-NP3-acute-kidney-injury-aki-03-safety':{
  source:catheter,
  choiceSources:[catheter,aki,catheter,catheter],
  reasons:[
   'Correct the external kink while keeping the drainage system closed. Keep the bag below bladder level, reassess comfort and verify free flow.',
   'Persistent oliguria and abnormal kidney tests after drainage is restored may require evaluation for acute or chronic kidney disease. A visibly kinked line and sudden absent drainage do not establish permanent renal failure.',
   'Teach a patient with an indwelling catheter to prevent traction and kinking and report bladder discomfort or absent drainage. These symptoms can help staff detect an obstruction promptly.',
   'Observe and measure urine after the kink is corrected, and check whether bladder discomfort improves. Escalate ongoing absent drainage or pain for further assessment.',
  ],
 },
 'SIT-NP3-classification-of-surgery-04-safety':{
  source:consent,
  choiceSources:[prevention,consent,prevention,consent],
  reasons:[
   'Preventive breast surgery can substantially reduce the risk in appropriately selected high-risk patients. Residual breast tissue can still develop cancer, so a guarantee of zero risk misstates the benefit.',
   'A private discussion lets the patient disclose pressure and ask about alternatives. Alert the surgeon before consent so benefits, risks, alternatives and the patient’s preferences can be reviewed.',
   'The patient can take time to ask how much risk may remain, how options compare and what surveillance is available. This decision is elective.',
   'Ask the patient to explain the options and expected risk reduction and to communicate a voluntary decision. An unresolved concern about coercion or understanding needs further review before proceeding.',
  ],
 },
};
