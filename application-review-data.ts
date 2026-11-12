import type {BankReview} from './bank-review-data.ts';

const ecg='https://www.ncbi.nlm.nih.gov/books/NBK594493/';
const perioperative='https://www.ncbi.nlm.nih.gov/books/NBK613066/';
const retina='https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/retinal-detachment';
const ckd='https://www.niddk.nih.gov/health-information/kidney-disease/keeping-kidneys-safe';
const als='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support';

export const applicationReviews:BankReview[]=[
 {
  id:'ORIG-NP2-fertilization-genetics-fertility-01',source:'https://www.ncbi.nlm.nih.gov/books/NBK5191/pdf/Bookshelf_NBK5191.pdf',
  scenario:'Both parents carry the same autosomal recessive pathogenic variant. Their adult daughter has an affected brother. Testing has ruled out the affected genotype in the daughter, but the report does not distinguish a carrier from a noncarrier.',
  prompt:'Before carrier testing, what is the daughter’s probability of being a carrier under these assumptions?',
  choices:[
   ['2 in 3','Among the four equally likely genotype combinations, two are carriers, one is affected, and one is an unaffected noncarrier. Excluding the affected combination leaves two carrier combinations among three possibilities.'],
   ['1 in 2','One half is the chance of inheriting one variant before the affected genotype is excluded. This question conditions on being unaffected.'],
   ['1 in 4','One quarter is the probability of inheriting both variants before the test result. The report has already excluded that possibility.'],
   ['3 in 4','Three quarters is the original probability of an unaffected genotype. That group contains both carriers and noncarriers.'],
  ],studyNote:'When an affected genotype is excluded, use only the remaining equally likely genotypes to calculate carrier probability.',
 },
 {
  id:'ORIG-NP1-leprosy-01',source:'https://www.who.int/news-room/fact-sheets/detail/leprosy',
  scenario:'A client with a faint patch that has preserved sensation returns for new trouble spreading the fingers. The ulnar nerve is thickened on examination. Weakness and reduced sensation follow its distribution.',
  prompt:'Which interpretation should guide the referral decision?',
  choices:[
   ['The thickened nerve and corresponding deficit warrant evaluation for Hansen disease','Peripheral nerve enlargement with sensory loss or weakness in the nerve’s distribution is a cardinal sign. Preserved sensation over a separate patch does not exclude nerve involvement.'],
   ['Preserved sensation in the patch outweighs the new nerve findings','Patch sensation is one way to assess for Hansen disease. The new concordant nerve abnormalities independently support evaluation.'],
   ['Only the color change is relevant until more patches appear','A count of skin lesions does not explain the new motor and sensory deficits. Peripheral nerve findings require attention even when the skin finding is nonspecific.'],
   ['Defer referral until a slit-skin smear identifies bacilli','A positive smear can support diagnosis. Clinical nerve signs can warrant referral without waiting for smear confirmation.'],
  ],studyNote:'Examine sensation and motor function in the distribution of an enlarged nerve, as well as sensation over skin lesions.',
 },
 {
  id:'ORIG-NP4-retinal-detachment-macular-degeneration-01',source:retina,
  scenario:'A client calls after cataract surgery with a sudden cluster of floaters and intermittent flashes. The client can still read text on a phone. A colleague suggests checking only visual acuity at the next routine appointment.',
  prompt:'Which assessment should the nurse help arrange now?',
  choices:[
   ['Urgent eye evaluation with a dilated retinal examination','Flashes and a sudden increase in floaters may occur with a retinal tear or detachment. Preserved reading vision does not rule it out. Dilation helps the clinician assess the retina.'],
   ['A refraction appointment to check the new lens prescription','A refraction assesses focusing errors. It does not evaluate a possible retinal tear behind the abrupt flashes and floaters.'],
   ['Central acuity testing alone at the routine postoperative visit','Reading vision can remain intact with limited detachment. The new symptoms warrant assessment of the retina before the routine visit.'],
   ['Wait for a dark curtain to develop before arranging a retinal examination','A curtain is an important sign but need not be present. Waiting for it can delay diagnosis of a tear or early detachment.'],
  ],studyNote:'Treat sudden new flashes or floaters after eye surgery as urgent even if central vision remains clear.',
 },
 {
  id:'ORIG-NP3-chronic-kidney-disease-ckd-01',source:ckd,
  scenario:'A client with chronic kidney disease takes lisinopril and a diuretic. After two days of diarrhea and poor intake, the client wants to start an over-the-counter cold remedy whose active ingredients include ibuprofen.',
  prompt:'What should the nurse prioritize in reviewing this plan?',
  choices:[
   ['Assess for volume depletion and arrange prompt medication review before the client uses the remedy','Fluid loss can lower renal perfusion. Adding an NSAID in this setting increases acute kidney injury risk. The team should review the symptoms and the full medication list.'],
   ['Use the remedy at the label dose because it is sold without a prescription','Nonprescription status does not remove the NSAID risk when kidney function and circulating volume are reduced.'],
   ['Take the remedy several hours apart from lisinopril to protect renal perfusion','Spacing doses does not remove the effect of volume depletion and NSAID exposure on renal perfusion.'],
   ['Substitute another cold remedy that contains naproxen','Naproxen is also an NSAID. Changing products without reviewing the active ingredients and the patient’s condition leaves the same concern.'],
  ],studyNote:'Check active ingredients in combination products. New fluid loss in CKD changes medication safety.',
 },
 {
  id:'ORIG-NP3-basic-concepts-in-cancer-01',source:'https://www.cancer.gov/about-cancer/diagnosis-staging/staging',
  scenario:'During initial staging of a solid tumor using TNM, the primary tumor measurements and regional lymph node findings are unchanged. A biopsy confirms that a new lesion in a distant organ came from the primary tumor.',
  prompt:'Which staging update should the nurse expect the team to document?',
  choices:[
   ['Update the M category to reflect confirmed distant metastasis','M describes distant spread. The finding belongs in that category even though the primary and regional node findings have not changed.'],
   ['Update only T because the total tumor burden has increased','T describes the primary tumor’s size or local extent. A separate distant lesion belongs in M.'],
   ['Update only N because any spread away from the primary is nodal involvement','N describes regional lymph node involvement. The new finding is a distant organ metastasis.'],
   ['Keep M0 until the primary tumor increases in size','A change in the primary tumor’s size is not required to document proven distant spread.'],
  ],studyNote:'Read T, N, and M as separate findings about the primary site, regional nodes, and distant spread.',
 },
 {
  id:'ORIG-NP3-ards-01',source:'https://doi.org/10.1164/rccm.202311-2011ST',
  scenario:'An intubated client with severe ARDS remains hypoxemic on lung-protective ventilation. The team confirms the diagnosis, reviews contraindications, and has a trained positioning team available.',
  prompt:'Which proposed adjunct is consistent with the guideline for severe ARDS?',
  choices:[
   ['Plan a prolonged prone-positioning session with the team while maintaining lung-protective settings','Prone positioning is recommended for severe ARDS. The team coordinates the turn, protects the airway and lines, and continues lung-protective ventilation.'],
   ['Increase tidal volume based on actual weight to expand more lung units','Lung-protective tidal volume is based on predicted body weight. Increasing it on the basis of actual weight can increase ventilator-induced injury.'],
   ['Use several brief turns as the equivalent of a prolonged prone session','Evidence for prone positioning in severe ARDS is based on prolonged sessions. Brief turns do not reproduce that intervention.'],
   ['Postpone positioning until the client has been extubated','The recommendation applies to selected patients with severe ARDS on mechanical ventilation. Extubation is not a prerequisite.'],
  ],studyNote:'For severe ARDS, coordinate prone positioning and retain lung-protective ventilation.',
 },
 {
  id:'ORIG-NP3-heart-anatomy-ecg-basics-01',source:als,
  scenario:'An adult collapses on the ward. The monitor shows an organized rhythm at 68/min, but the client is unresponsive, is not breathing normally, and has no definite pulse on a rapid check.',
  prompt:'Which response is supported by these bedside findings?',
  choices:[
   ['Activate the arrest response and start CPR for suspected pulseless electrical activity','Organized electrical activity can occur without an effective pulse. The clinical assessment supports cardiac arrest, and this rhythm is nonshockable unless it changes.'],
   ['Defibrillate immediately because any pulseless rhythm requires a shock','VF and pulseless VT are shockable. Organized electrical activity without a pulse calls for the nonshockable pathway.'],
   ['Give rescue breaths alone because the monitor displays a normal rate','Ventilation alone is appropriate when a definite pulse is present with inadequate breathing. The display cannot establish a pulse.'],
   ['Obtain a 12-lead ECG before beginning compressions to verify the rhythm','A diagnostic ECG would delay CPR after the bedside assessment has identified arrest.'],
  ],studyNote:'Use the patient’s breathing and pulse to recognize arrest. Electrical rhythm then guides the shock decision.',
 },
 {
  id:'ORN-3256520ba170dd987a3d',source:ecg,
  scenario:'The conduction tracing shows that an impulse passes through the AV node and bundle of His. Activation arrives through the left ventricular pathway on time and is delayed in the branch carrying the signal to the opposite ventricle.',
  prompt:'Which structure corresponds to the delay described?',
  choices:[
   ['Right bundle branch','After the bundle of His, the right branch carries impulses toward the right ventricle. Left-sided delivery is intact in the description.'],
   ['Left bundle branch','This pathway carries impulses to the left ventricle, which is activated on time in the tracing.'],
   ['Atrioventricular node','The impulse traversed the AV node before reaching the branching system. A delay there would precede both ventricular branches.'],
   ['Bundle of His before its division','The bundle of His precedes the split. The described delay is confined to one pathway after the split.'],
  ],studyNote:'Localize a conduction delay by identifying the last structure that delivered the signal normally.',
 },
 {
  id:'ORN-ff0e53527bc3b555f03b',source:perioperative,
  scenario:'A client has left the operating room. In the recovery area the nurse receives handoff about estimated blood loss, assesses breathing as sedation wears off, and evaluates the dressing for new drainage.',
  prompt:'Which phase and immediate nursing focus match this handoff?',
  choices:[
   ['Postoperative recovery and assessment for early complications','The procedure is complete. The early recovery phase prioritizes airway, breathing, circulation, and signs of complications such as bleeding.'],
   ['Preoperative preparation and confirmation of readiness for induction','Verification before induction belongs before the procedure. This client is already recovering from anesthesia.'],
   ['Intraoperative management and maintenance of the sterile field','Sterile field management applies while the procedure is in progress. This handoff concerns postoperative physiologic recovery.'],
   ['Preoperative teaching and rehearsal of expected recovery activities','Rehearsal can prepare a patient before surgery. The immediate priority now is direct recovery assessment.'],
  ],studyNote:'Identify the perioperative phase from where the patient is in the care sequence, then choose the priority assessment.',
 },
 {
  id:'ORN-1ff311c4029f471aee4e',source:'https://www.nhlbi.nih.gov/health/lungs/breathing-benefits',
  scenario:'A student observes airflow leaving the lungs during quiet breathing in a resting adult. The student compares the muscle movement with a forceful cough.',
  prompt:'Which mechanism best explains quiet exhalation?',
  choices:[
   ['The diaphragm relaxes and elastic recoil reduces lung volume','During quiet breathing, inspiratory muscles relax and recoil reduces chest and lung volume, allowing air to flow outward.'],
   ['The diaphragm contracts and moves downward to push air out','Downward diaphragm movement increases thoracic volume and supports inhalation.'],
   ['Active contraction of abdominal muscles is required for each quiet breath out','Abdominal muscle contraction assists forced exhalation. Quiet exhalation in a resting adult is normally passive.'],
   ['The rib cage lifts and expands as the air leaves','Rib cage expansion increases thoracic volume during inspiration. Quiet exhalation follows relaxation and recoil.'],
  ],studyNote:'Quiet expiration relies mainly on relaxation and recoil. Forced expiration can recruit abdominal muscles.',
 },
 {
  id:'EXP2-NP1-integrated-management-of-childhood-illness-imci',source:'https://iris.who.int/bitstream/handle/10665/258963/9789241512985-eng.pdf?sequence=1',
  scenario:'A 29-month-old with cough and wheezing initially breathes 46 times in a minute. Following the clinician’s inhaled bronchodilator trial, the calm child breathes 34 times in a full minute. There is no general danger sign, stridor, or chest indrawing on reassessment.',
  prompt:'Which respiratory classification follows the WHO IMCI chart at reassessment?',
  choices:[
   ['Cough or cold based on the findings after the trial','For a child this age, 40 breaths/min or more is fast breathing. IMCI uses the repeat count and assessment after the trial. The rate is now below that threshold, with no chest indrawing or severe sign.'],
   ['Pneumonia based on the initial count of 46 breaths/min','The initial rate is above the threshold for this age. With wheezing, the chart calls for reassessment after the trial before classification.'],
   ['Severe pneumonia because wheezing and initial fast breathing occurred together','In this chart, a general danger sign or stridor in a calm child supports the severe classification. The two initial findings alone do not meet that criterion.'],
   ['Pneumonia based on the average of the two respiratory counts','The chart uses the post-trial assessment. Averaging measurements taken before and after the intervention obscures the response.'],
  ],studyNote:'In this IMCI pathway, use the calm reassessment after the bronchodilator trial to classify the respiratory findings.',
 },
 {
  id:'ORIG-NP4-eye-anatomy-assessment-refractive-disorders-01',source:'https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors',
  scenario:'A 52-year-old has unchanged distance vision with the usual glasses but gradually holds print farther away to read it. The eye examination finds a loss of the lens’s ability to change shape for near work.',
  prompt:'Which explanation best accounts for the new difficulty?',
  choices:[
   ['Presbyopia from reduced near-focusing ability with age','The lens loses flexibility with age. Near focus can worsen even when the distance prescription remains suitable.'],
   ['New myopia from light focusing in front of the retina','Myopia generally blurs distance vision. The new change is difficulty accommodating for near work.'],
   ['Hyperopia from a shorter eye that focuses light behind the retina','Hyperopia can blur near objects, but the examination identifies a change in lens flexibility as the reason for the new symptom.'],
   ['Astigmatism from a change in corneal curvature','Astigmatism can distort vision because light focuses unevenly. The described change is reduced accommodation.'],
  ],studyNote:'Distinguish age-related loss of accommodation from changes in distance refraction.',
 },
 {
  id:'ORIG-NP4-parathyroid-disorders-01',source:'https://www.niddk.nih.gov/health-information/endocrine-diseases/primary-hyperparathyroidism',
  scenario:'A client with primary hyperparathyroidism receives cinacalcet. Follow-up blood calcium improves, but the bone-density study still shows low bone density. The client asks whether the blood result means the bones have recovered.',
  prompt:'Which explanation is most accurate?',
  choices:[
   ['The improved calcium shows a biochemical response. Bone density requires separate follow-up.','Cinacalcet lowers PTH and blood calcium. It does not improve bone density, so the two outcomes must be evaluated separately.'],
   ['Bone density can be recorded as improved once the calcium has responded','Serum calcium and bone density assess different outcomes. The follow-up scan still shows low density.'],
   ['The low bone density proves cinacalcet failed to lower PTH or calcium','Bone density is not a measure of the drug’s biochemical effect. The observed calcium response is compatible with continued low bone density.'],
   ['The bone-density result can be treated as a symptom that resolves with a lower calcium level','A low density measurement is a separate objective finding. It can persist after the serum calcium improves.'],
  ],studyNote:'Follow serum calcium and bone density as separate outcomes in primary hyperparathyroidism.',
 },
 {
  id:'ORN-731fa3e96826b80af52b',source:'https://www.ncbi.nlm.nih.gov/books/NBK615335/',
  scenario:'During a family visit, a parent describes strict rules and firm penalties. When the adolescent asks for the reason behind a rule, the parent ends the conversation and seldom responds to the adolescent’s concerns.',
  prompt:'Which parenting pattern best fits both the level of control and the response to the adolescent?',
  choices:[
   ['Authoritarian','The parent sets and enforces strict rules while showing low responsiveness to the adolescent. Both features support this pattern.'],
   ['Authoritative','Firm limits also occur with authoritative parenting, which pairs them with warmth and responsiveness. The second feature is missing here.'],
   ['Permissive','Permissive parenting typically includes responsiveness with few enforced limits. The described parent imposes strong limits.'],
   ['Uninvolved','Low responsiveness fits, but uninvolved parenting also has low control. The consistent penalties indicate high control in this case.'],
  ],studyNote:'Consider warmth and responsiveness as well as the extent to which the parent sets and enforces limits.',
 },
 {
  id:'ORN-814719e616ab38c7df01',source:'https://www.ncbi.nlm.nih.gov/books/NBK607442/',
  scenario:'The nurse reviews a circulation diagram with a student. One venous route returns blood from the head and upper limbs, and another returns blood from the legs. Both routes end in the right atrium.',
  prompt:'Which vessel brings blood from the first route into the heart?',
  choices:[
   ['Superior vena cava','The superior vena cava drains the upper body into the right atrium. The origin of the blood distinguishes it from the other systemic return route.'],
   ['Inferior vena cava','The inferior vena cava also drains into the right atrium. It returns blood from the lower body.'],
   ['Pulmonary vein','Pulmonary veins bring oxygenated blood from the lungs to the left atrium. They do not drain the head and upper limbs.'],
   ['Pulmonary artery','The pulmonary artery carries blood away from the right ventricle to the lungs, so it does not provide systemic venous return.'],
  ],studyNote:'Follow the route from its origin to its destination when identifying a major vessel.',
 },
 {
  id:'ORN-bc508bde996a7700569e',source:'https://www.ncbi.nlm.nih.gov/books/NBK615334/',
  scenario:'A clinic audit compares two prenatal visits. One occurred at 27 weeks and 6 days. The second occurred the following day, at 28 weeks and 0 days.',
  prompt:'How should the nurse classify the two visits by trimester?',
  choices:[
   ['The first visit is in the second trimester and the second visit is in the third','The second trimester includes 27 weeks and 6 days. At 28 weeks and 0 days the third trimester begins.'],
   ['Both visits are in the second trimester','The first visit belongs in the second trimester. The next visit crosses the boundary at 28 completed weeks.'],
   ['Both visits are in the third trimester','The first visit precedes 28 weeks. Rounding it to the next week would classify it incorrectly.'],
   ['The first visit is in the first trimester and the second visit is in the second','Both visits occur well after the first trimester. The relevant transition is from the second trimester to the third.'],
  ],studyNote:'Use completed weeks and days at the time of the visit to classify gestational age.',
 },
 {
  id:'ORN-c9448865522a53b3e04a',source:'https://www.ncbi.nlm.nih.gov/books/NBK613072/',
  scenario:'During review of a head injury, the radiology report describes a fracture through the upper lateral skull. The report distinguishes this site from the lower lateral bone beside the ear and from the posterior skull.',
  prompt:'Which bone corresponds to the site described?',
  choices:[
   ['Parietal bone','The paired parietal bones form much of the upper lateral skull, above the region of the temporal bones.'],
   ['Temporal bone','The temporal bone occupies a lower lateral area around the ear. The fracture site is above that area.'],
   ['Occipital bone','The occipital bone forms the posterior skull. The report places the fracture along the upper side.'],
   ['Frontal bone','The frontal bone forms the anterior skull and forehead. The report identifies the upper lateral region.'],
  ],studyNote:'Orient the skull by separating the upper lateral, lower lateral, anterior, and posterior regions.',
 },
 {
  id:'ORN-2778488efac69ef68433',source:'https://www.cancer.gov/types/pancreatic/treatment',
  scenario:'A client with a resectable tumor in the head of the pancreas is scheduled for a Whipple procedure. The client asks why the surgical consent mentions parts of the digestive tract next to the pancreas.',
  prompt:'Which explanation best matches the planned operation?',
  choices:[
   ['The operation removes the pancreatic head and nearby structures, including the duodenum, then reconnects the digestive tract','A Whipple procedure removes the tumor-bearing head and adjacent structures. The remaining organs are connected so digestion can continue.'],
   ['The operation removes the pancreatic tail and leaves the pancreatic head in place','Distal pancreatectomy removes the body or tail. This operation addresses a tumor in the pancreatic head.'],
   ['The operation removes the entire pancreas in every case','Total pancreatectomy is a different operation. A Whipple procedure can leave a portion of the pancreas.'],
   ['The operation bypasses the blocked area without removing the tumor','A bypass may relieve obstruction in some settings. The scheduled resection is intended to remove the affected pancreatic head and adjacent tissue.'],
  ],studyNote:'Distinguish a pancreatic head resection from a distal or total pancreatectomy and from a bypass.',
 },
];
