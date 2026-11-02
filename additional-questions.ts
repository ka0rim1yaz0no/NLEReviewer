import catalog from "./topic-catalog.json" with { type: "json" };
import { shuffled } from "./bank.ts";
import type { Question, Subject } from "./types.ts";

// Independently authored questions. Only topic names come from the reference catalog.
// This authoring module must never be imported by the browser application.
function question(slug:string,stem:string,choices:[string,string][],source:string):Question {
  const topic=catalog.find(t=>t.slug===slug);
  if(!topic||choices.length!==4)throw new Error(`Invalid original topic question: ${slug}`);
  const correct=choices[0];
  const seed=[...slug].reduce((value,char)=>Math.imul(value,31)+char.charCodeAt(0)|0,17);
  const order=shuffled(choices,seed);
  return {id:`ORIG-${topic.subject}-${slug}-01`,subject:topic.subject as Subject,topic:topic.name,stem,options:order.map(([text,rationale])=>({text,rationale})),correctIndex:order.indexOf(correct),rationale:correct[1],keyPoint:correct[1],source,origin:"Original NLE Reviewer educational question, authored 2026-11-02 using the linked reference; not copied from BoardPal or an official examination."};
}

export const additionalQuestions:Question[]=[
  question("leprosy","At a rural clinic, an adult reports a persistent pale patch on the forearm. Which finding most strongly supports referral for possible Hansen disease?",[
    ["Definite loss of sensation within the patch","Loss of sensation in a pale or reddish skin patch is a cardinal sign of leprosy. Peripheral nerve involvement warrants assessment and early treatment to reduce disability."],
    ["Itching that disappears after the skin is moisturized","Itching alone is nonspecific. The distinguishing finding in this question is sensory loss within a persistent skin lesion."],
    ["A bruise that changes from purple to yellow","Color changes during bruise healing do not establish the characteristic skin and peripheral nerve involvement of leprosy."],
    ["Brief redness after pressure that resolves completely","Transient pressure-related redness is different from a persistent patch with definite sensory loss."]
  ],"https://www.who.int/news-room/fact-sheets/detail/leprosy"),
  question("ph-health-care-delivery-system-doh","A municipal health team asks which responsibility belongs to the Department of Health as the national technical authority. Which answer is most accurate?",[
    ["Develop national health policies, standards, and technical guidance","The DOH sets national policy and technical standards and supports other health providers. Local governments also have responsibilities for devolved basic health services."],
    ["Personally manage every barangay health station's daily roster","Day-to-day management of every local station is not the defining national technical role of the DOH."],
    ["Replace every local health office with a private insurer","Private financing does not replace the DOH's public policy, regulatory, and technical responsibilities."],
    ["Limit its work to collecting hospital admission fees","Fee collection is not the DOH's national mandate; its responsibilities include policy, regulation, specialized services, and technical assistance."]
  ],"https://ro2.doh.gov.ph/mandates/"),
  question("universal-health-care-uhc-sdgs","A Filipino citizen asks whether inclusion in the National Health Insurance Program under Republic Act 11223 requires first becoming seriously ill. Which response follows the Act?",[
    ["Every Filipino citizen is automatically included in the program","Section 5 of the Universal Health Care Act provides automatic inclusion of every Filipino citizen in the NHIP. This does not mean every possible service is unlimited or free."],
    ["Only people already admitted to a hospital are included","Hospital admission is not the population-coverage condition in Section 5; inclusion applies to every Filipino citizen."],
    ["Only employed citizens can be included","Employment status does not restrict automatic population inclusion to employed citizens alone."],
    ["Inclusion means all services at all facilities have no conditions","Automatic inclusion is different from an unlimited guarantee of every service. Service coverage and financing have their own provisions."]
  ],"https://lawphil.net/statutes/repacts/ra2019/ra_11223_2019.html"),
  question("community-health-nursing-process","A nurse is assigned to a community with low attendance at child health visits. Before choosing a program, which action best supports a sound community assessment?",[
    ["Combine local service data with residents' accounts of barriers and available resources","Community assessment combines data about health needs and resources with community participation. This supports priorities and interventions that fit the population."],
    ["Select the nurse's preferred intervention before collecting data","Choosing the intervention first may overlook the actual barriers, needs, and resources identified through assessment."],
    ["Use only the number of posters distributed last year","A count of posters measures one activity. It does not adequately describe attendance barriers or community health needs."],
    ["Ask one convenient resident to speak for the whole population","One person's views may be useful but cannot represent the range of experiences and data needed for a community assessment."]
  ],"https://www.health.state.mn.us/communities/practice/assessplan/lph/docs/communityassessmentplanninghb.pdf"),
  question("school-occupational-health-nursing","In a private factory, workers are told to buy the protective equipment required for their hazardous tasks. Which teaching best reflects Republic Act 11058?",[
    ["The employer must provide the necessary approved protective equipment free of charge","RA 11058 requires employers to provide necessary personal protective equipment free of charge when hazards require it. PPE supports, rather than replaces, other workplace controls."],
    ["Charging workers is acceptable if their wages are above minimum wage","The requirement to provide necessary PPE free of charge is not removed by paying above the minimum wage."],
    ["Protective equipment is needed only after an injury occurs","Protection should address identified workplace hazards before injury; waiting for harm defeats prevention."],
    ["A signed waiver removes the employer's safety responsibilities","A worker's signature does not replace the employer's duties to provide a safe workplace and required protection."]
  ],"https://lawphil.net/statutes/repacts/ra2018/ra_11058_2018.html"),
  question("community-mental-health-program","A barangay plans services consistent with the Philippine Mental Health Act. Which proposal best follows its community-care provisions?",[
    ["Integrate responsive primary mental health care into basic local health services with referral support","RA 11036 calls for primary mental health services to be integrated into basic services at city, municipal, and barangay levels, with appropriate community facilities and referral arrangements."],
    ["Require every person seeking help to be admitted to a psychiatric hospital","Community mental health care does not require inpatient admission for every person. Services should match needs and the appropriate level of care."],
    ["Publish a named list of service users at the barangay hall","Publicly identifying service users undermines confidentiality. Program reporting should protect their identities."],
    ["Exclude mental health from routine primary care consultations","Exclusion conflicts with the Act's direction to integrate mental health into basic health services."]
  ],"https://lawphil.net/statutes/repacts/ra2018/ra_11036_2018.html"),
  question("laws-nursing-practice-health-workforce","A nurse employed in a government rural health unit is studying legislation intended to improve public health workers' working conditions and well-being. Which law directly addresses this purpose?",[
    ["Republic Act 7305","RA 7305 is the Magna Carta of Public Health Workers. Its aims include improving their social and economic well-being, working conditions, and terms of employment."],
    ["Republic Act 9288","RA 9288 establishes the newborn screening system; it is not the Magna Carta of Public Health Workers."],
    ["Republic Act 7600","RA 7600 concerns rooming-in and breastfeeding practices, rather than the public health workforce's general employment conditions."],
    ["Republic Act 9003","RA 9003 addresses ecological solid waste management, not the Magna Carta of Public Health Workers."]
  ],"https://lawphil.net/statutes/repacts/ra1992/ra_7305_1992.html"),
  question("laws-disease-reporting-control","A health facility identifies a case meeting a DOH notifiable-disease case definition. Which response best reflects Republic Act 11332?",[
    ["Report accurately and immediately through the authorized surveillance process while protecting confidentiality","RA 11332 requires accurate, immediate reporting of DOH-designated notifiable diseases and health events. Authorized reporting and response systems must also provide data security and confidentiality."],
    ["Post the patient's name on social media to alert the public","Mandatory reporting is through authorized public health systems; it does not authorize unrestricted public disclosure of an individual's information."],
    ["Wait for the annual summary before informing surveillance staff","Delaying all reports until an annual summary conflicts with accurate and immediate reporting requirements."],
    ["Exclude private facilities because only government clinics report","The Act's reporting duties extend to specified public and private persons, facilities, institutions, and organizations."]
  ],"https://lawphil.net/statutes/repacts/ra2019/ra_11332_2019.html"),
  question("laws-health-financing-insurance","During medicine-access teaching, a patient asks how a prescription should identify a medicine under the Philippine Generics Act. Which explanation is correct?",[
    ["The prescription must use the generic name; a brand name may also be included","Section 6 of RA 6675 requires medical, dental, and veterinary practitioners to write prescriptions using the generic name. A brand name may be included if desired."],
    ["Only a brand name is required when the patient can afford it","Ability to pay does not remove the statutory requirement to use the generic name in prescribing."],
    ["Generic names apply only to prescriptions from government doctors","The prescribing requirement includes private practitioners, not only those in government service."],
    ["The patient must choose the most expensive brand for the prescription to be valid","The Act promotes generic terminology and informed choices; validity is not based on selecting the highest-priced brand."]
  ],"https://lawphil.net/statutes/repacts/ra1988/ra_6675_1988.html"),
  question("laws-maternal-child-reproductive-health","A parent says a healthy-looking newborn cannot need newborn screening. Which explanation best reflects Republic Act 9288?",[
    ["Screening is offered to identify certain heritable conditions before preventable complications occur","RA 9288 establishes a system offering newborn screening to detect certain heritable conditions early. A newborn's healthy appearance does not rule out a condition that may cause later harm."],
    ["Screening is reserved for newborns with visible birth defects","The screening opportunity is not restricted to babies who already show a visible abnormality."],
    ["A normal screening result guarantees lifelong freedom from every disease","Screening addresses selected conditions. It cannot guarantee that a child will never develop another illness."],
    ["Screening replaces all later child health visits","Newborn screening complements routine care; it does not replace follow-up, examination, immunization, or developmental monitoring."]
  ],"https://lawphil.net/statutes/repacts/ra2004/ra_9288_2004.html"),
  question("laws-ncd-environmental-occupational-nutrition","A community nutrition session discusses the central public health purpose of the ASIN law, Republic Act 8172. Which outcome is it designed to support?",[
    ["Prevention of iodine deficiency disorders through salt iodization","RA 8172 promotes salt iodization as a preventive measure against iodine deficiency disorders. This does not mean people should increase their total salt intake."],
    ["Treatment of all anemia by increasing salt intake","Iodization targets iodine deficiency, not every cause of anemia. Increasing salt intake is not its nutritional objective."],
    ["Replacement of every vitamin supplement with ordinary unfortified salt","Unfortified salt does not provide the intended iodine fortification and cannot replace all indicated supplements."],
    ["Elimination of all dietary sodium restrictions","An iodization policy does not remove individualized sodium limits or other dietary advice."]
  ],"https://lawphil.net/statutes/repacts/ra1995/ra_8172_1995.html"),
  question("normal-puerperium","One hour after an uncomplicated vaginal birth, a woman is comfortable and talking with her family. Which plan best supports routine early postnatal surveillance?",[
    ["Continue regular assessment of bleeding, uterine tone, fundal height, temperature, and pulse","WHO recommends regular assessment of these findings during the first 24 hours, starting in the first hour. Appearing comfortable does not replace maternal postnatal assessment."],
    ["Assess only breastfeeding because the birth was uncomplicated","Feeding support matters, but it does not replace maternal assessments for bleeding, uterine tone, and physiological changes."],
    ["Delay all maternal observations until the next morning","An uncomplicated birth does not remove the need for regular surveillance in the early postnatal period."],
    ["Use one normal pulse reading to rule out all later complications","One observation cannot exclude evolving bleeding or other problems. Ongoing assessment detects changes over time."]
  ],"https://www.ncbi.nlm.nih.gov/books/NBK579650/"),
  question("family-planning-methods","A patient choosing an oral contraceptive asks about protection from sexually transmitted infections. Which response is most accurate?",[
    ["The pill prevents pregnancy but does not protect against STIs; discuss correct, consistent condom use","Hormonal contraception does not protect against sexually transmitted infections. Correct and consistent condom use reduces STI risk, although it does not eliminate all risk."],
    ["The pill protects against HIV whenever it prevents ovulation","Preventing ovulation is a contraceptive mechanism; it does not create protection against HIV transmission."],
    ["An intrauterine device provides the same STI protection as a condom","An IUD is a contraceptive method and does not provide the STI risk reduction associated with condoms."],
    ["Using a condom once gives protection for the rest of the month","Condom protection depends on correct use for each sexual act, not a single use for an entire month."]
  ],"https://www.cdc.gov/contraception/hcp/usmec/how-to-use.html"),
  question("female-male-reproductive-systems","A patient asks what the term ovulation means. Which explanation should the nurse give?",[
    ["An egg is released from a mature ovarian follicle","Ovulation is release of an egg from an ovarian follicle. It is distinct from fertilization, implantation, and menstrual shedding."],
    ["The uterine lining is shed through the vagina","Shedding of the uterine lining describes menstruation, rather than release of an egg from the ovary."],
    ["A fertilized embryo attaches to the uterine lining","Attachment of the embryo to the uterine lining is implantation, a later process if fertilization has occurred."],
    ["A sperm cell joins with an egg","Joining of sperm and egg is fertilization. Ovulation releases the egg before fertilization can occur."]
  ],"https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo"),
  question("fertilization-genetics-fertility","Both partners are unaffected carriers of the same autosomal recessive condition. They ask about the chance that their next child will have the condition. Which explanation is correct?",[
    ["Each pregnancy has a 25% chance of an affected child","When both parents carry the same autosomal recessive condition, each pregnancy has a one-in-four chance of an affected child. Earlier pregnancy outcomes do not change the next pregnancy's probability."],
    ["The risk becomes zero after one affected child is born","Each pregnancy is a new inheritance event; the birth of an affected child does not use up the risk."],
    ["Every child must be affected because both parents are carriers","Two carriers can have affected children, unaffected carriers, or children who inherit neither altered copy."],
    ["The risk is 50% for an affected child in every pregnancy","With two carriers, 50% is the probability of an unaffected carrier child; the affected-child probability is 25%."]
  ],"https://medlineplus.gov/genetics/understanding/inheritance/riskassessment/"),
  question("ethico-moral-management-in-maternal-care","A woman in labor asks for an explanation before a nonurgent examination. Which nursing response best supports respectful maternity care?",[
    ["Explain the examination, protect privacy, and seek her informed agreement","Respectful maternity care includes information, privacy, dignity, and informed choice. An explanation and consent process remain relevant during labor."],
    ["Proceed without discussion because entering the labor ward permits every examination","Admission is not a substitute for respectful explanation and informed agreement to individual care procedures."],
    ["Explain the procedure only to accompanying relatives","Relatives may support care, but the woman should receive information and participate in decisions about her own care."],
    ["Promise that no examination can ever cause discomfort","An inaccurate guarantee is not informed communication. Explain expected sensations and available support honestly."]
  ],"https://iris.who.int/bitstream/handle/10665/134588/WHO_RHR_14.23_eng.pdf"),
  question("theories-of-growth-development","A four-year-old is preparing for a simple dressing change. Which teaching approach best fits the symbolic play characteristic of Piaget's preoperational stage?",[
    ["Use a doll and simple, concrete language to show what will happen","Preoperational children use symbols and play to learn. A doll demonstration and brief concrete explanations help connect unfamiliar care with understandable experiences."],
    ["Rely on an abstract lecture about probabilities of infection","Abstract probabilities exceed the teaching approach suited to this developmental stage and do not make the procedure concrete."],
    ["Provide only a long written explanation for independent study","A long written document does not match a preschool child's usual reading ability or learning needs."],
    ["Avoid all explanation because preschool children cannot understand anything about care","Preschool children can learn through developmentally appropriate play, language, and demonstration."]
  ],"https://www.ncbi.nlm.nih.gov/books/NBK615351/table/ch13.tab3/?report=objectonly"),
  question("adolescent-health","An adolescent wants a practical plan to support emotional well-being during a demanding school term. Which plan includes recognized protective habits?",[
    ["Maintain regular sleep, physical activity, coping skills, and supportive relationships","WHO identifies healthy sleep, regular exercise, coping and interpersonal skills, and supportive environments as important to adolescent mental well-being."],
    ["Replace sleep with energy drinks whenever schoolwork increases","Stimulants do not replace the protective role of adequate, regular sleep and may interfere with it."],
    ["Stop all contact with trusted friends to avoid emotional dependence","Supportive relationships are protective; routine isolation removes a potential source of help and connection."],
    ["Treat persistent emotional distress as something that never needs professional help","Persistent distress should not be dismissed. Adolescents benefit from access to appropriate mental health support."]
  ],"https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health"),
  question("pediatric-cardiovascular-disorders","An infant with tetralogy of Fallot develops a bluish color during feeding. Which explanation best describes the significance of this observation?",[
    ["The infant may be experiencing an episode of reduced oxygen in systemic blood","Tetralogy of Fallot can reduce the oxygen carried in blood to the body. Sudden cyanotic episodes may occur during feeding or crying and require prompt clinical assessment."],
    ["The color proves that oxygen delivery has improved","Cyanosis is a concern for reduced oxygenation, not evidence that oxygen delivery has improved."],
    ["The observation confirms a food allergy without further assessment","Color change during feeding is not enough to diagnose food allergy; the known cardiac defect makes oxygenation an immediate concern."],
    ["A congenital heart defect cannot cause symptoms after birth","Congenital means present at birth. Symptoms may be evident immediately or become apparent later."]
  ],"https://www.cdc.gov/heart-defects/about/tetralogy-of-fallot.html"),
  question("pediatric-hematologic-oncologic-disorders","A child with acute lymphoblastic leukemia has fatigue, recurrent infections, and easy bruising. Which explanation best connects these findings?",[
    ["Leukemia cells crowd normal marrow production, reducing functional blood cells","ALL can interfere with production of healthy red cells, white cells, and platelets. This helps explain anemia-related fatigue, infection risk, and bleeding or bruising."],
    ["An increased white cell count guarantees effective immunity","Leukemia cells may not function normally. A high total count does not guarantee effective protection against infection."],
    ["Bruising demonstrates an excess of functional platelets","Platelets help stop bleeding. Easy bruising may reflect inadequate platelet production or function, not an excess of effective platelets."],
    ["Fatigue means the child can safely stop further evaluation","Fatigue is a relevant clinical finding in leukemia and should be assessed with other symptoms and blood results."]
  ],"https://www.cancer.gov/types/leukemia/patient/child-all-treatment-pdq"),
  question("pediatric-integumentary-musculoskeletal-disorders","A child has dry, intensely itchy flexural patches diagnosed as atopic dermatitis. The parent asks if classmates can catch it. Which response is correct?",[
    ["Atopic dermatitis itself is not contagious","Atopic dermatitis is an inflammatory skin condition, not a contagious infection. Scratched or damaged skin can develop a separate infection that needs assessment."],
    ["Every child who touches the rash will develop eczema","Atopic dermatitis does not spread by touching the affected skin, although skin care and ordinary hygiene remain important."],
    ["All itching proves the child has a transmissible parasite","Itching has many causes. In this case the diagnosis is atopic dermatitis, and itching does not establish a parasitic infection."],
    ["Because it is not contagious, broken or draining skin never needs assessment","Lack of contagiousness does not rule out complications. Damaged skin can become infected and may need additional care."]
  ],"https://www.niams.nih.gov/health-topics/atopic-dermatitis"),
  question("legal-principles-collaboration-teamwork-in-pedia","A parent has given permission for a nonurgent procedure for a school-age child. The child looks worried and asks what will happen. What is the best next communication step?",[
    ["Explain in age-appropriate terms, invite questions, and seek the child's participation and assent as appropriate","Parental permission does not remove the value of informing and involving the child. Age-appropriate explanation and assent support participation; legal authority still follows applicable law and policy."],
    ["Tell the child that a parent's signature makes all questions unnecessary","A signature does not replace communication. Children should receive information appropriate to their understanding."],
    ["Ask the child to sign the adult legal consent form without explanation","An unexplained signature is not meaningful participation and does not establish the child's legal authority to consent."],
    ["Promise the procedure will be painless even when discomfort is expected","False reassurance undermines trust. Honest preparation and comfort measures better support the child and family."]
  ],"https://www.ahrq.gov/health-literacy/professional-training/informed-choice/audio-script-leaders.html"),
  question("classification-of-surgery","A stable patient is booked for a hernia repair several weeks in advance. Which term describes the operation's planned timing?",[
    ["Elective surgery","Elective surgery is planned in advance. The term describes scheduling and urgency; it does not mean the operation has no health benefit."],
    ["Emergency surgery","Emergency surgery is unplanned care requiring immediate hospital admission or urgent intervention; that is not the situation described."],
    ["Diagnostic surgery","Diagnostic describes a procedure's purpose in establishing a diagnosis, not whether its timing is planned."],
    ["Reconstructive surgery","Reconstructive describes restoration of form or function. It does not by itself describe whether an operation was scheduled in advance."]
  ],"https://www.rcseng.ac.uk/patient-care/having-surgery/types-of-surgery/"),
  question("pre-operative-phase","Before induction of anesthesia, the team notices that the patient names a different surgical site from the consent and operating list. What should happen next?",[
    ["Pause and resolve the discrepancy with the patient and responsible team before proceeding","The WHO checklist requires confirmation of identity, site, procedure, and consent before anesthesia. A discrepancy must be resolved, rather than carried forward into the operation."],
    ["Use the operating list as the only source of truth and continue","The list alone does not resolve a conflict involving the patient and consent. The team must clarify the correct procedure and site."],
    ["Wait until the patient is anesthetized before asking about the site","Verification before anesthesia allows the patient to participate and helps prevent a wrong-site procedure."],
    ["Change the consent form to match whichever site is easiest to prepare","A consent discrepancy requires proper clarification; convenience does not establish the correct or authorized operation."]
  ],"https://www.who.int/docs/default-source/patient-safety/9789241598590-eng-checklist.pdf"),
  question("ards","A patient with sepsis develops acute respiratory distress syndrome. Which statement best describes the main treatment goals?",[
    ["Improve oxygenation, provide breathing support as needed, and treat the underlying cause","ARDS care aims to improve oxygen levels and address the cause. Depending on severity, oxygen delivery and ventilatory support may be required, with prevention of complications."],
    ["Treat a normal chest radiograph without assessing oxygenation","ARDS care centers on the patient's respiratory status and cause; a presumed normal image cannot replace oxygenation assessment."],
    ["Avoid all breathing support because ventilation can never help ARDS","Ventilatory support can be necessary in ARDS. Its risks require careful management, rather than a blanket refusal of support."],
    ["Use antibiotics as a complete substitute for oxygen support in every case","Antibiotics may address an infection when indicated, but they do not replace needed oxygenation and breathing support."]
  ],"https://www.nhlbi.nih.gov/health/ards/treatment"),
  question("heart-anatomy-ecg-basics","A patient asks whether an electrocardiogram directly measures the amount of blood ejected with each heartbeat. Which explanation is best?",[
    ["An ECG records the heart's electrical activity, including rate, rhythm, and signal timing","An ECG records electrical signals generated during cardiac activity. It does not directly measure stroke volume, and its findings are interpreted with the clinical assessment and other tests."],
    ["An ECG directly measures the volume of each ventricular contraction","The ECG is an electrical recording. Direct measurement of ejected volume requires other assessment methods."],
    ["An ECG is a blood test that reports the hemoglobin concentration","Hemoglobin is measured from blood. An ECG uses electrodes to record cardiac electrical signals."],
    ["A normal ECG by itself excludes every type of heart disease","ECG findings must be considered with symptoms, history, examination, and other testing; one result cannot exclude every cardiac condition."]
  ],"https://medlineplus.gov/lab-tests/electrocardiogram/"),
  question("chronic-kidney-disease-ckd","A patient with chronic kidney disease plans to take over-the-counter ibuprofen every day for back pain. Which response best supports medication safety?",[
    ["Review the plan with the prescriber or pharmacist because NSAIDs can further harm kidney function","NSAIDs, including ibuprofen, can damage kidneys and cause acute kidney injury, especially in people with kidney disease. An individualized pain plan and medication review are needed."],
    ["Over-the-counter medicines cannot affect kidney function","Nonprescription status does not mean a medicine is harmless to the kidneys or free of interactions."],
    ["Taking twice the package dose protects the kidneys from pain-related stress","Increasing beyond recommended doses is unsafe and does not protect renal function."],
    ["Stop all prescribed kidney and blood pressure medicines before using ibuprofen","Unsupervised discontinuation can cause harm. The appropriate step is a medication review, rather than stopping prescribed therapy independently."]
  ],"https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/managing"),
  question("inflammatory-bowel-neuro-inflammatory-disorders","A patient newly diagnosed with ulcerative colitis asks which part of the gastrointestinal tract is directly affected. Which answer is most accurate?",[
    ["The inner lining of the large intestine","Ulcerative colitis causes chronic inflammation and ulcers in the inner lining of the large intestine. It is one form of inflammatory bowel disease."],
    ["Only the salivary glands","Ulcerative colitis is an inflammatory bowel disease, not a disorder limited to the glands producing saliva."],
    ["Only the gallbladder wall","The gallbladder is not the characteristic site of ulcerative colitis; the disease affects the large intestinal lining."],
    ["The heart's coronary arteries","Coronary arteries supply the heart. They are not the intestinal tissue affected by ulcerative colitis."]
  ],"https://www.niddk.nih.gov/health-information/digestive-diseases/ulcerative-colitis/definition-facts"),
  question("immunologic-connective-tissue-disorders","A patient with systemic lupus erythematosus says it is only a skin rash, so swelling around the eyes is unrelated. Which explanation best corrects this misunderstanding?",[
    ["Lupus can affect multiple organs, including the kidneys; new swelling needs assessment","SLE is a systemic autoimmune disease that can involve the skin, joints, kidneys, blood, and other organs. New swelling should be assessed rather than dismissed as unrelated."],
    ["Lupus can affect only the surface of the skin","Systemic lupus can involve internal organs as well as the skin. A skin-only explanation is incomplete."],
    ["Any swelling proves kidney failure without testing","Swelling has several possible causes. It calls for assessment and appropriate investigation, not an unsupported diagnosis."],
    ["The absence of joint pain rules out all lupus activity","Lupus manifestations vary. Lack of joint pain does not exclude disease activity in another organ."]
  ],"https://www.niams.nih.gov/health-topics/lupus"),
  question("basic-concepts-in-cancer","A pathology discussion uses the TNM system. What does the M component describe?",[
    ["Whether cancer has spread to distant parts of the body","In TNM staging, M describes distant metastasis. T describes the primary tumor's size or extent, and N describes regional lymph node involvement."],
    ["The microscopic appearance of tumor cells alone","Microscopic appearance relates to histology and grade. M in TNM refers to distant metastasis."],
    ["The patient's response to the first dose of morphine","Analgesic response is not a TNM component; M records distant spread of cancer."],
    ["The number of chemotherapy cycles already completed","Treatment cycles are recorded separately. They do not define the M component of TNM staging."]
  ],"https://www.cancer.gov/about-cancer/diagnosis-staging/staging"),
  question("site-specific-cancers","An adult reports repeated vaginal bleeding after intercourse and assumes it can wait until the next routine screening visit. What should the nurse emphasize?",[
    ["Arrange clinical evaluation of the symptom; routine screening is not a substitute for investigating it","Bleeding after sex can occur with cervical cancer or other conditions. It requires clinical assessment; a symptom should not simply be deferred to routine screening."],
    ["The symptom proves cervical cancer without any examination","The symptom is important but not diagnostic. Other causes are possible, and evaluation is necessary."],
    ["Screening schedules mean new symptoms never need an earlier visit","Routine screening is designed for scheduled preventive assessment; new symptoms may require evaluation before the next screening date."],
    ["The absence of severe pain makes further assessment unnecessary","Cervical disease may cause abnormal bleeding without severe pain. Lack of pain does not make recurrent bleeding safe to ignore."]
  ],"https://www.cancer.gov/types/cervical/symptoms"),
  question("pituitary-gland-disorders","An adult reports gradually increasing ring and shoe sizes, a deeper voice, and coarser facial features. Which hormonal pattern is most consistent with acromegaly?",[
    ["Excess growth hormone with increased IGF-I activity","Acromegaly results from prolonged excess growth hormone, usually from a pituitary tumor. Growth hormone stimulates IGF-I production, contributing to enlargement of tissues and bones."],
    ["An isolated lack of insulin as the explanation for all the enlargement","Insulin deficiency does not account for the characteristic progressive enlargement of hands, feet, and facial tissues in acromegaly."],
    ["A temporary absence of ovarian ovulation","Ovulation describes egg release and does not explain the characteristic adult tissue changes described."],
    ["A reduction in growth hormone as the cause of tissue overgrowth","Acromegaly is associated with excess growth hormone, not a deficiency of that hormone."]
  ],"https://www.niddk.nih.gov/health-information/endocrine-diseases/acromegaly"),
  question("parathyroid-disorders","A patient with primary hyperparathyroidism asks why both high blood calcium and bone thinning can occur. Which explanation is correct?",[
    ["Excess parathyroid hormone can increase release of calcium from bone into the blood","PTH raises blood calcium partly by increasing release of calcium from bone. Persistent excess can contribute to weakened bones and kidney stones."],
    ["PTH always lowers blood calcium by locking all calcium into bone","PTH normally helps raise blood calcium. Excess does not simply lock calcium into bone."],
    ["Bone thinning guarantees that blood calcium must also be low","Blood calcium and bone strength are not interchangeable measures. Excess PTH can produce high blood calcium while bone loses mineral."],
    ["The parathyroid glands produce the same hormones as the thyroid gland","The similarly named glands have different functions. Parathyroid glands produce PTH, which regulates calcium balance."]
  ],"https://www.niddk.nih.gov/health-information/endocrine-diseases/primary-hyperparathyroidism"),
  question("neuroanatomy-assessment-basics","An adult opens the eyes spontaneously, speaks coherently but is confused about the date, and obeys a two-part motor command. There are no interfering factors. Which Glasgow Coma Scale record is correct?",[
    ["E4 V4 M6, total 14","Spontaneous eye opening scores 4, confused but coherent verbal response scores 4, and obeying commands scores 6. Record the components as well as the total of 14."],
    ["E4 V5 M6, total 15","A verbal score of 5 requires orientation. Confusion about the date makes V4 the appropriate component here."],
    ["E3 V4 M6, total 13","Eye opening to sound scores 3, but this patient opens the eyes spontaneously, which scores 4."],
    ["E4 V4 M4, total 12","A motor score of 4 describes normal flexion to stimulation. Obeying commands is the higher motor response and scores 6."]
  ],"https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid.pdf"),
  question("multiple-sclerosis-ms","A patient with multiple sclerosis notices more fatigue during hot afternoons and asks how to plan daily activities. Which advice is most appropriate?",[
    ["Plan important activities for cooler periods, pace effort, and discuss new or persistent changes with the care team","Heat can bring on MS-related fatigue. Cooling and energy conservation can help, while new or persistent symptoms still require assessment for other causes or disease activity."],
    ["Use prolonged hot baths to eliminate heat-related fatigue","More heat may worsen symptoms in a heat-sensitive patient. This does not address the reported trigger."],
    ["Assume every future episode of fatigue is MS and never assess it","Fatigue may have other causes, including infection, sleep problems, medication effects, and other illness. Assessment remains important."],
    ["Stop all activity permanently, regardless of ability or rehabilitation goals","A paced, individualized plan supports function. Permanent avoidance of all activity is not the recommended response to heat sensitivity."]
  ],"https://www.nice.org.uk/guidance/ng220/chapter/Recommendations"),
  question("myasthenia-gravis-mg","A patient with myasthenia gravis develops much greater difficulty swallowing and new severe shortness of breath. Which action has priority?",[
    ["Obtain emergency assessment and prepare for airway and breathing support","Severe breathing or swallowing difficulty in myasthenia gravis can be life-threatening and needs urgent hospital treatment. Routine activity planning must wait until immediate safety is addressed."],
    ["Offer a large meal to test whether swallowing improves","A meal can increase aspiration risk when swallowing is severely impaired and does not address respiratory deterioration."],
    ["Arrange a routine appointment several weeks later","New severe breathing difficulty requires urgent assessment rather than a delayed routine appointment."],
    ["Ask the patient to exercise until the respiratory muscles become stronger","Exertion can worsen fatigable weakness and is not a safe response to acute respiratory compromise."]
  ],"https://www.nhs.uk/conditions/myasthenia-gravis/"),
  question("guillain-barr-syndrome-gbs","A patient admitted with Guillain-Barré syndrome develops worsening limb weakness and a weak cough. Which assessment area deserves immediate priority?",[
    ["Breathing effectiveness and ability to protect the airway","Guillain-Barré syndrome can affect breathing and swallowing as well as limb movement. A weak cough with worsening weakness raises concern for respiratory muscle involvement."],
    ["Preferred shoe style for discharge","Discharge preferences can wait while the team assesses a potentially serious change in breathing and airway protection."],
    ["The patient's long-term career plan before respiratory assessment","Long-term planning is valuable but does not take priority over immediate respiratory safety in an acutely weakening patient."],
    ["Only the intensity of tingling in one toe","Sensory symptoms are relevant, but focusing on one toe misses the more urgent possibility of respiratory involvement."]
  ],"https://www.nhs.uk/conditions/guillain-barre-syndrome/"),
  question("amyotrophic-lateral-sclerosis-als","A patient with ALS remains able to make decisions but has increasing difficulty speaking. Which care plan best supports participation?",[
    ["Assess communication needs and arrange suitable communication aids with the multidisciplinary team","ALS can affect speech, swallowing, and breathing. Communication support helps the person express choices and participate in care; speech difficulty alone does not establish loss of decision-making capacity."],
    ["Assume that inability to speak clearly means inability to make decisions","A motor speech problem does not by itself show loss of understanding or decision-making capacity. Assess and support communication."],
    ["Direct all questions to relatives without first involving the patient","Family support is useful, but the person should remain involved using an accessible communication method whenever possible."],
    ["Delay communication support until speech is completely lost","Planning before further decline allows the patient to learn and select suitable aids while communication is still possible."]
  ],"https://www.nhs.uk/conditions/motor-neurone-disease/"),
  question("metabolic-bone-disorders","An older adult with osteoporosis says no treatment is needed because the bones do not hurt. Which explanation is most accurate?",[
    ["Osteoporosis is often silent until a fracture; prevention and prescribed treatment still matter","Osteoporosis can reduce bone strength without early symptoms. Appropriate activity, nutrition, fall prevention, and prescribed therapy aim to reduce fracture risk."],
    ["Lack of pain proves that bone strength is normal","Pain is not a reliable early indicator of bone density or fracture risk. Osteoporosis often has no symptoms before a fracture."],
    ["Complete bed rest is the best lifelong way to strengthen bones","Prolonged inactivity can worsen strength and function. Activity should be safe and individualized rather than eliminated."],
    ["A fracture can occur only after a high-speed collision","Fragile bones may break after a minor fall or ordinary stress, not only after major trauma."]
  ],"https://www.niams.nih.gov/health-topics/osteoporosis"),
  question("inflammatory-infectious-bone-joint-disorders","An adult reports swollen joints in both hands and morning stiffness lasting over an hour. Which pattern is most consistent with rheumatoid arthritis?",[
    ["An inflammatory autoimmune process that often affects joints symmetrically","RA is an autoimmune inflammatory disease. Symmetric joint involvement, swelling, and prolonged morning stiffness are characteristic patterns, although diagnosis requires clinical evaluation."],
    ["A condition that by definition affects only one joint after a fall","RA is not defined as a single traumatic joint injury and often involves more than one joint in a symmetric pattern."],
    ["A disease that can never affect organs outside the joints","RA can have effects beyond joints, including in the lungs, heart, eyes, skin, and blood."],
    ["A temporary loss of joint fluid that always resolves without assessment","Persistent inflammatory joint symptoms merit assessment; they should not be dismissed as an automatically self-resolving fluid change."]
  ],"https://www.niams.nih.gov/health-topics/rheumatoid-arthritis"),
  question("spinal-other-msk-conditions","A patient with back pain from a herniated lumbar disc develops new numbness around the genitals and cannot pass urine. What is the priority advice?",[
    ["Seek emergency assessment immediately","New saddle-area numbness and urinary retention with back pain can indicate serious nerve compression. Immediate assessment is needed rather than routine home management."],
    ["Wait several weeks to see whether stretching resolves the symptoms","These neurological and bladder changes are emergency warning signs. Waiting risks delayed treatment of serious compression."],
    ["Reduce fluid intake and ignore the inability to urinate","Fluid restriction does not address the possible neurological cause of new urinary retention and should not delay emergency care."],
    ["Treat the symptoms as proof of uncomplicated muscle strain","New perineal numbness and bladder dysfunction are not findings to dismiss as a simple strain."]
  ],"https://www.nhs.uk/conditions/slipped-disc/"),
  question("eye-anatomy-assessment-refractive-disorders","A student can read a nearby book clearly but distant classroom writing looks blurred. Which refractive error most closely fits this description?",[
    ["Myopia","Myopia, or nearsightedness, makes distant objects look blurred. An eye examination is needed to assess vision and prescribe appropriate correction."],
    ["Presbyopia","Presbyopia typically causes age-related difficulty seeing close objects, rather than the described difficulty with distant writing in a student."],
    ["Hyperopia","Hyperopia is associated with difficulty focusing on nearby objects; myopia more directly fits clear near vision with blurred distance vision."],
    ["Retinal detachment established solely by this description","Distance blur alone does not establish retinal detachment. Sudden flashes, new floaters, or a curtain over vision require urgent assessment."]
  ],"https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors"),
  question("retinal-detachment-macular-degeneration","A patient reports a sudden shower of new floaters, flashes of light, and a dark curtain across part of one eye's vision. What is the best response?",[
    ["Arrange immediate ophthalmic or emergency evaluation","Sudden floaters, flashes, and a curtain or shadow can indicate retinal detachment. Prompt treatment may protect vision; this is not a routine glasses-prescription concern."],
    ["Book only a routine refraction visit next year","Possible retinal detachment is time-sensitive. A routine future visit would delay needed evaluation."],
    ["Reassure the patient that the symptoms always disappear without treatment","These symptoms may threaten vision and cannot safely be guaranteed to resolve spontaneously."],
    ["Recommend rubbing the eye until the curtain clears","Rubbing does not treat retinal detachment and should not delay urgent eye assessment."]
  ],"https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/retinal-detachment"),
  question("other-eye-conditions-surgery-care","Liquid household cleaner splashes into an adult's eye. There is no penetrating object. What should be started immediately while emergency help is arranged?",[
    ["Irrigate the eye with copious clean, non-hot water","For a strong chemical exposure, begin rinsing immediately and continue while seeking urgent medical help. Prompt removal of the chemical reduces ongoing contact; do not delay irrigation for a full history."],
    ["Keep the eye closed and wait for symptoms before rinsing","Waiting leaves the chemical in contact with the eye. Immediate irrigation is the priority."],
    ["Rub the eye firmly with a dry cloth","Rubbing may cause further damage and does not adequately remove the chemical."],
    ["Add a second household chemical to neutralize the first","Uncontrolled chemical neutralization can cause further injury. Use copious appropriate irrigation and emergency assessment."]
  ],"https://www.nhs.uk/conditions/eye-injuries/"),
  question("ear-anatomy-assessment-hearing-loss","An older adult with hearing loss struggles to understand discharge instructions in a noisy room. Which communication change is most helpful?",[
    ["Reduce background noise, face the patient, and speak clearly without shouting","Facing the patient provides visual cues, and less background noise makes speech easier to understand. Clear speech is more useful than shouting or turning away."],
    ["Shout the instructions from another room","Distance and lack of visual cues make understanding harder. Shouting is not a substitute for clear, accessible communication."],
    ["Keep the television loud to make the patient concentrate harder","Competing background sound can mask speech. Reducing noise supports communication."],
    ["Speak faster while looking down at the paperwork","Rapid speech and a hidden face remove useful cues and can make comprehension more difficult."]
  ],"https://www.nidcd.nih.gov/health/age-related-hearing-loss"),
  question("ear-disorders-surgery-care","A patient is being evaluated for Ménière's disease. Which symptom cluster is most consistent with this inner-ear disorder?",[
    ["Episodic vertigo, tinnitus, hearing loss, and a feeling of ear fullness","Ménière's disease affects the inner ear and can cause these symptoms. Vertigo may be severe enough to affect balance and increase fall risk."],
    ["Only painful swollen finger joints with morning stiffness","That pattern suggests an articular inflammatory problem, not the characteristic hearing and balance symptoms of Ménière's disease."],
    ["A painless curtain across vision with new flashes","This is an eye emergency pattern that may indicate retinal detachment, not the typical Ménière's symptom cluster."],
    ["Only thirst and large volumes of dilute urine","That pattern points toward a water-balance problem rather than an inner-ear hearing and balance disorder."]
  ],"https://www.nidcd.nih.gov/health/menieres-disease"),
  question("personality-disorders","A patient with borderline personality disorder asks about dialectical behavior therapy. Which goal should the nurse describe?",[
    ["Build mindfulness, emotion-regulation, and relationship skills while reducing self-destructive behavior","DBT was developed for borderline personality disorder. It teaches skills for awareness, managing intense emotions, reducing harmful behaviors, and improving relationships."],
    ["Produce a therapeutic seizure under general anesthesia","That describes electroconvulsive therapy, not the skills-based psychotherapy used in DBT."],
    ["Replace every future clinical assessment with a one-time personality test","DBT is an ongoing therapeutic approach. It does not eliminate the need for assessment or an individualized treatment plan."],
    ["Guarantee that distress will never occur again after one session","No single session can guarantee absence of future distress. DBT focuses on learning and practicing effective skills over time."]
  ],"https://www.nimh.nih.gov/health/publications/borderline-personality-disorder"),
  question("somatic-behavioral-therapies","A patient receiving modern electroconvulsive therapy asks why an anesthetic and a muscle relaxant are used. Which explanation is correct?",[
    ["The anesthetic prevents awareness of the procedure, and the muscle relaxant limits movement during the induced seizure","ECT uses electrical stimulation to induce therapeutic seizure activity. Anesthesia and a muscle relaxant support a controlled procedure performed by a trained team with physiological monitoring."],
    ["The medications are given so that no trained monitoring team is needed","The medications do not remove the need for trained clinicians and monitoring of breathing, circulation, and recovery."],
    ["The muscle relaxant is the only treatment and no brain stimulation occurs","ECT's therapeutic procedure involves electrical brain stimulation; the muscle relaxant supports procedural safety rather than replacing it."],
    ["The medications guarantee that memory effects are impossible","ECT can cause temporary confusion and memory problems. Anesthetic use does not eliminate these possible effects."]
  ],"https://www.nimh.nih.gov/health/topics/brain-stimulation-therapies/brain-stimulation-therapies"),
  question("altered-perception","During a conversation, a previously well adult suddenly develops slurred speech and weakness of one arm. Which response best addresses a possible acute stroke?",[
    ["Activate emergency stroke assessment immediately and note the symptom-onset time","Sudden speech difficulty and unilateral weakness are stroke warning signs. Immediate emergency assessment and recording when symptoms started support time-sensitive treatment decisions."],
    ["Wait until tomorrow because the person was well earlier today","Stroke symptoms can begin abruptly in someone who was previously well. Delay may reduce treatment opportunities."],
    ["Offer food and drink before arranging assessment","Swallowing may be impaired in stroke. Feeding is not the priority and should not delay emergency evaluation."],
    ["Cancel emergency assessment if symptoms disappear after a few minutes","Brief symptoms may represent a transient ischemic attack and still require urgent medical evaluation."]
  ],"https://www.cdc.gov/stroke/signs-symptoms/"),
  question("critical-care-equipment","A family member asks what the mechanical ventilator beside a patient in respiratory failure does. Which explanation is most accurate?",[
    ["It supports breathing by moving air into and out of the lungs","A mechanical ventilator supports ventilation when breathing is inadequate and can deliver oxygen through a tube or fitted mask. It does not by itself cure the underlying illness."],
    ["It filters waste products directly from the blood like dialysis","Blood filtration is a function of renal replacement equipment, not the ventilator's primary role."],
    ["It gives a defibrillation shock with every ordinary breath","Defibrillation delivers a therapeutic electrical shock for selected dangerous rhythms. It is not the function of a mechanical ventilator."],
    ["It guarantees that the patient cannot develop pneumonia","Ventilated patients can still develop pneumonia and need appropriate preventive and monitoring measures."]
  ],"https://www.nhlbi.nih.gov/health/ventilator"),
  question("collaboration-communication-in-critical-care","A nurse calls about a rapidly deteriorating ICU patient using SBAR. After Situation, Background, and Assessment, which statement best completes the communication?",[
    ["Please assess the patient at the bedside now; repeat back the agreed immediate plan","The Recommendation or Request states what is needed and when. Clear requests and repeat-back help the team confirm an accurate, shared plan during urgent communication."],
    ["I will omit what I need so the receiver has to infer the plan","An unstated request leaves the next action unclear. SBAR should support explicit, actionable communication."],
    ["I will read the complete admission record without describing the current problem","An exhaustive record does not replace a concise current situation, relevant background, assessment, and request."],
    ["I will assume the receiver heard correctly and end the call without clarification","Checking the response and agreed plan helps prevent misunderstanding, especially during critical communication."]
  ],"https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html"),
];
