"""Editorial topic rules for reference concepts; no random topic assignment."""
import re

# Precise term names take precedence over a broad source chapter.
SPECIFIC = [
 ('tuberculosis',r'\b(tubercul|mantoux|acid.fast bacill|isoniazid)'),
 ('leprosy',r'\b(leprosy|hansen)'),
 ('mosquito-borne-diseases',r'\b(dengue|malaria|chikungunya|zika)'),
 ('neuro-related-cds',r'\b(rabies|poliomyelitis|tetanus)'),
 ('integumentary-related-cds',r'\b(measles|rubella|varicella|chickenpox|roseola|impetigo)'),
 ('bronchial-asthma',r'\b(asthma|bronchospasm|status asthmaticus)'),
 ('copd',r'\b(copd|emphysema|chronic bronchitis|pulmonary rehabilitation)'),
 ('ards',r'\b(ards|acute respiratory distress)'),
 ('pneumonia-cap-hap-vap',r'\b(pneumonia|pneumonitis)'),
 ('pneumothorax-hemothorax-chest-tubes',r'\b(pneumothorax|hemothorax|chest tube|pleur|water.seal|suction control|thoracentesis)'),
 ('pulmonary-embolism-pulmonary-hypertension',r'\b(pulmonary embol|pulmonary hypertension)'),
 ('acute-coronary-syndrome-acs',r'\b(myocardial infarct|angina|acute coronary|stemi|nstemi|troponin|percutaneous coronary|coronary artery bypass)'),
 ('peripheral-vascular-diseases-hypertension',r'\b(atheroscler|arterioscler|hypertension|hypotension|aneurysm|varicos|venous insufficiency|peripheral arter|deep vein thrombo|thrombophlebitis|claudication|raynaud)'),
 ('dialysis-hemodialysis-peritoneal',r'\b(dialysis|hemodialysis|peritoneal dialysis|arteriovenous fistula)'),
 ('acute-kidney-injury-aki',r'\b(acute kidney|acute renal|acute tubular)'),
 ('chronic-kidney-disease-ckd',r'\b(chronic kidney|chronic renal|end.stage renal|uremia|uremic)'),
 ('acid-base-balance-abg',r'\b(acidosis|alkalosis|arterial blood gas|abg|bicarbonate|paco2|pao2|sao2|hco3)'),
 ('electrolyte-imbalances',r'\b(hypernatrem|hyponatrem|hyperkal|hypokal|hypercalcem|hypocalcem|hypermagnes|hypomagnes|hyperphosphat|hypophosphat|electrolyte)'),
 ('iv-fluids',r'\b(isotonic|hypotonic|hypertonic|crystalloid|colloid|fluid volume|fluid overload|hypervolem|hypovolem|third.spac|osmolality|osmolarity|osmotic|osmosis)'),
 ('oncologic-emergencies',r'\b(tumor lysis|superior vena cava syndrome|febrile neutropenia|spinal cord compression)'),
 ('cancer-treatment-modalities',r'\b(chemotherap|radiation therap|brachytherap|teletherap|immunotherap|oncologic surgery|external beam|cytotoxic)'),
 ('basic-concepts-in-cancer',r'\b(malignan|neoplas|carcinogen|oncogen|metastas|tumor suppress|benign tumor|cancer stag|cancer grad)'),
 ('site-specific-cancers',r'\b(cancer|carcinoma|sarcoma|melanoma|lymphoma|leukemia|myeloma|mesothelioma|neuroblastoma|retinoblastoma|wilms)'),
 ('hematologic-disorders',r'\b(anemia|anemias|thrombocyt|platelet|hemophilia|polycythemia|sickle.cell|transfus|blood product|fresh frozen|cryoprecipitate|hemolys|agranulocyt|neutropen|hematocrit|hemoglobin|leukocyt|leukopen)'),
 ('oral-esophageal-gastric-disorders',r'\b(esophag|gastritis|gastric|peptic|gerd|reflux|oral candid|stomatitis|achalasia|dysphagi|odynophagi|hiatal|barrett|dent|tooth|teeth|gingiv)'),
 ('hepatobiliary-disorders',r'\b(hepat|liver|gallbladder|cholecyst|cholelith|pancreatit|cirrhosis|biliar|bilirubin|jaundice|portal hyperten|ascites)'),
 ('ostomies',r'\b(ostomy|ostomies|stoma|colostom|ileostom|urostom)'),
 ('inflammatory-bowel-neuro-inflammatory-disorders',r'\b(crohn|ulcerative colitis|inflammatory bowel)'),
 ('gi-absorption-elimination',r'\b(appendic|peritonitis|ileus|diverticul|hernia|constipat|diarrh|fecal|faecal|stool|bowel|intestin|rectal|rectum|sigmoid|colon|duoden|jejun|ileum|hemorrhoid|malabsorp|celiac)'),
 ('adh-disorders',r'\b(siadh|diabetes insipidus|antidiuretic|vasopressin)'),
 ('adrenal-gland-disorders',r'\b(adrenal|addison|cushing|cortisol|aldosteron|pheochromocyt|glucocorticoid|mineralocorticoid)'),
 ('parathyroid-disorders',r'\b(parathyroid|parathormone|pth)'),
 ('thyroid-disorders',r'\b(thyroid|thyroxine|triiodothyronine|goiter|goitre|graves|myxedema|cretinism|hashimoto)'),
 ('pituitary-gland-disorders',r'\b(pituitary|acromegaly|gigantism|growth hormone|hypophys|dwarfism)'),
 ('diabetes-mellitus',r'\b(diabetes|diabetic|hyperglycem|hypoglycem|insulin|glucagon|glucometer|glycosylated|hemoglobin a1c|hba1c|ketoacidosis|hhs)'),
 ('increased-intracranial-pressure-iicp',r'\b(intracranial|cushing.s triad|cerebral edema|brain herniat|hydrocephal)'),
 ('cerebrovascular-accident-stroke',r'\b(stroke|cerebrovascular|ischemic penumbra|transient ischemic|aphasia|dysarthria|hemipleg|hemiparesis|carotid endarter)'),
 ('parkinson-s-disease',r'\b(parkinson|bradykinesia|levodopa|carbidopa)'),
 ('multiple-sclerosis-ms',r'\b(multiple sclerosis)'),
 ('myasthenia-gravis-mg',r'\b(myasthen|cholinergic crisis|acetylcholinesterase)'),
 ('guillain-barr-syndrome-gbs',r'\b(guillain.barre|guillain.barr)'),
 ('autonomic-dysreflexia',r'\b(autonomic dysreflexia)'),
 ('alzheimer-s-disease-dementia',r'\b(alzheimer|dementia|sundown)'),
 ('seizure-disorders',r'\b(seizure|epilep|ictal|aura|tonic.clonic|status epilepticus|anticonvuls)'),
 ('spinal-cord-injuries-sci',r'\b(spinal cord injury|spinal shock|quadripleg|tetrapleg|parapleg)'),
 ('peripheral-neuropathies',r'\b(neuropath|bell.s palsy|trigeminal neuralgia|carpal tunnel)'),
 ('amyotrophic-lateral-sclerosis-als',r'\b(amyotrophic|motor neuron disease)'),
 ('musculoskeletal-trauma',r'\b(fracture|sprain|strain|dislocation|compartment syndrome|amputat|traction|cast care|open reduction|external fixation|internal fixation)'),
 ('metabolic-bone-disorders',r'\b(osteopor|osteomal|rickets|paget|bone mineral density)'),
 ('inflammatory-infectious-bone-joint-disorders',r'\b(osteoarthrit|rheumatoid|gout|osteomyelit|bursitis|septic arthritis|ankylosing|synovitis)'),
 ('spinal-other-msk-conditions',r'\b(scoliosis|kyphosis|lordosis|spondyl|herniated disc|spinal stenosis|back pain)'),
 ('glaucoma-cataract',r'\b(glaucoma|cataract|intraocular pressure)'),
 ('retinal-detachment-macular-degeneration',r'\b(retinal detach|macular degenerat)'),
 ('ear-disorders-surgery-care',r'\b(otitis|meniere|labyrinthitis|mastoiditis|myringotom|tympanoplast|otoscleros|vestibular neuritis|cerumen impaction)'),
 ('ear-anatomy-assessment-hearing-loss',r'\b(ear|hearing|cochlea|tympanic|auditory|pinna|auricle|eustachian|tinnitus|deaf|presbycusis|otoscop|audiomet|weber|rinne)'),
 ('other-eye-conditions-surgery-care',r'\b(conjunctivit|keratitis|uveitis|blepharitis|hordeol|chalazi|strabismus|nystagmus|enucleation|corneal abras)'),
 ('eye-anatomy-assessment-refractive-disorders',r'\b(eye|visual|vision|retin|cornea|sclera|lens|iris|pupil|aqueous|vitreous|refraction|myopia|hyperopia|astigmat|presbyopia|emmetropia|snellen|ophthalmoscop)'),
 ('multi-system-problems-shock-sepsis',r'\b(shock|sepsis|septic|multiple organ|mods|sirs)'),
 ('critical-care-equipment',r'\b(ventilator|mechanical ventilation|hemodynamic monitor|arterial line|invasive monitor|defibrillat|cardioversion|iabp|intra.aortic balloon)'),
 ('high-acuity-emergency-situations',r'\b(cardiac arrest|resuscitat|anaphyl|asystole|pulseless|tension pneumothorax|ventricular fibrillation)'),
 ('eating-disorders',r'\b(anorexia nervosa|bulimia|binge.eating|refeeding|pica|avoidant.restrictive food)'),
 ('substance-use-disorders',r'\b(substance|alcohol|opioid use|intoxicat|withdrawal|addict|tolerance|naloxone|methadone|buprenorphine|naltrexone|disulfiram|acamprosate)'),
 ('schizophrenia-other-psychoses',r'\b(schizophren|psychosis|psychotic|delusion|hallucinat|catatoni|echolalia|echopraxia|alogia|avolition|clozapine)'),
 ('mood-disorders',r'\b(bipolar|depressi|mania|manic|anhedonia|dysthymi|cyclothymi|suicid)'),
 ('anxiety-anxiety-related-disorders',r'\b(anxiety|phobia|panic|obsessive|compulsive|agoraphobia)'),
 ('trauma-related-disorders',r'\b(post.traumatic|ptsd|trauma.informed|acute stress disorder|abuse|violence|neglect|maltreatment)'),
 ('personality-disorders',r'\b(personality disorder|borderline|antisocial|narcissistic|histrionic|schizotypal|schizoid)'),
 ('psychopharmacology',r'\b(antipsychotic|antidepressant|ssri|snri|tricyclic|maoi|lithium|serotonin syndrome|neuroleptic malignant|extrapyramidal|tardive dyskinesia|akathisia|benzodiazepine)'),
 ('cognitive-other-psychiatric-disorders',r'\b(delirium|attention.deficit|adhd|autism|neurodevelopment|intellectual disabil|dissociat|somatic symptom|conversion disorder)'),
]

CHAPTERS = [
 ('pharmacokinetics|pharmacodynamics|autonomic nervous system','pharmacology-core-principles'),
 ('legal/ethical','professional-ethics-legal-foundations'),
 ('antimicrobials|analgesics|musculoskeletal system$|respiratory system$|cardiovascular & renal systems|gastrointestinal system$|central nervous system$|endocrine system$','pharmacology-drug-classes'),
 ('initiate iv|administer iv|manage central|iv therapy','asepsis-iv-therapy-wound-care'),
 ('administer blood','hematologic-disorders'),('nasogastric|feeding tubes|enteral tube','gi-absorption-elimination'),
 ('chest tube','pneumothorax-hemothorax-chest-tubes'),('ecg|cardiovascular assessment|cardiovascular system terminology|cardiovascular alterations','heart-anatomy-ecg-basics'),
 ('hematological alterations','hematologic-disorders'),('malignancy','basic-concepts-in-cancer'),
 ('perioperative','classification-of-surgery'),('respiratory alterations|respiratory system terminology|respiratory assessment|oxygen therapy|tracheostomy|oxygenation','altered-ventilatory-function'),
 ('endocrine alterations|endocrine system terminology','endocrine-emergencies-summary'),
 ('renal and urinary|urinary system terminology|elimination','altered-elimination'),
 ('nervous system alterations|nervous system terminology|neurological assessment','neuroanatomy-assessment-basics'),
 ('musculoskeletal system alterations|skeletal system terminology|muscular system terminology|musculoskeletal assessment|mobility','musculoskeletal-review-interventions'),
 ('gastrointestinal system alterations|digestive system terminology|abdominal assessment','gi-absorption-elimination'),
 ('leadership|transition to practice','leadership-management'),
 ('female reproductive|male reproductive|reproductive concepts|reproductive system alterations','female-male-reproductive-systems'),
 ('obstetrics terminology|antepartum','normal-pregnancy'),('labor & delivery','normal-labor-delivery'),
 ('high-risk perinatal','complications-during-pregnancy'),('postpartum','normal-puerperium'),
 ('healthy newborn|high-risk newborn','health-promotion-disease-prevention-pedia'),
 ('childhood respiratory','pediatric-respiratory-disorders'),('congenital heart','pediatric-cardiovascular-disorders'),
 ('other childhood disorders|planning care for the ill child','health-promotion-disease-prevention-pedia'),
 ('infancy through adolescence','developmental-milestones'),
 ('family dynamics','care-of-families-normal-at-risk'),('healthy diets|nutrition','nutrition-programs'),
 ('healthy lifestyle','care-of-population-groups-with-other-health-priorities'),('teaching & learning','health-education-quality-improvement'),
 ('mental health conditions|mental health concepts|foundational mental health','foundations-of-mental-health-nursing'),
 ('maladaptive coping|stress, coping','therapeutic-stress-models'),
 ('thought disorders','schizophrenia-other-psychoses'),('anxiety disorders','anxiety-anxiety-related-disorders'),
 ('depressive|bipolar','mood-disorders'),('eating disorders','eating-disorders'),('substance use','substance-use-disorders'),
 ('personality disorders','personality-disorders'),('psychotropic','psychopharmacology'),
 ('childhood and adolescence disorders','cognitive-other-psychiatric-disorders'),
 ('trauma, abuse','trauma-related-disorders'),('therapeutic communication|communication$','therapeutic-communication-relationship'),
 ('legal and ethical','professional-ethics-legal-foundations'),('application of the nursing process to mental','psychiatric-assessment-symptomatology'),
 ('community assessment','community-health-nursing-process'),('environmental health','sanitation-environmental-health'),('vulnerable populations','care-of-population-groups-with-other-health-priorities'),
 ('integumentary|wound care|aseptic|infection control','asepsis-iv-therapy-wound-care'),
 ('head and neck|eye and ear|sensory system terminology|sensory impairments','health-assessment-vital-signs'),
 ('general survey|health history|blood pressure|specimen collection','health-assessment-vital-signs'),
 ('math calculations|administration of.*medications|medication','dosage-calculation-medication-administration'),
 ('fluids and electrolytes','iv-fluids'),('nursing process','nursing-process-prioritization'),
 ('scope of practice','professional-adjustment-jurisprudence'),('safety','basic-needs-mobility-comfort-elimination-oxygenation'),
 ('care of the older adult|cognitive impairments','care-of-population-groups-with-other-health-priorities'),
 ('grief and loss|spirituality|diverse patients','therapeutic-communication-relationship'),
 ('comfort|sleep and rest|personal care|basic nursing care|rehabilitation','basic-needs-mobility-comfort-elimination-oxygenation'),
 ('infection$','communicable-diseases-basic-concepts'),('reporting and documentation|professionalism|communicate professionally','documentation-professional-development'),
 ('acute and chronic health','non-communicable-diseases'),('body systems|whole body|foundational concepts','health-assessment-vital-signs'),
]

TABLE_TOPICS = {
 6:'heart-anatomy-ecg-basics',7:'heart-anatomy-ecg-basics',8:'heart-anatomy-ecg-basics',9:'heart-anatomy-ecg-basics',
 11:'asepsis-iv-therapy-wound-care',12:'asepsis-iv-therapy-wound-care',17:'hematologic-disorders',18:'hematologic-disorders',20:'asepsis-iv-therapy-wound-care',21:'asepsis-iv-therapy-wound-care',
 25:'diabetes-mellitus',31:'site-specific-cancers',32:'oncologic-emergencies',33:'cancer-treatment-modalities',35:'immunologic-connective-tissue-disorders',39:'heart-anatomy-ecg-basics',
 48:'acute-kidney-injury-aki',49:'chronic-kidney-disease-ckd',50:'chronic-kidney-disease-ckd',55:'altered-elimination',59:'classification-of-surgery',60:'intra-operative-phase',62:'intra-operative-phase',63:'intra-operative-phase',64:'intra-operative-phase',65:'intra-operative-phase',67:'pre-operative-phase',68:'pre-operative-phase',70:'pre-operative-phase',73:'post-operative-phase',75:'neuroanatomy-assessment-basics',76:'neuroanatomy-assessment-basics',79:'parkinson-s-disease',80:'seizure-disorders',82:'multiple-sclerosis-ms',92:'musculoskeletal-review-interventions',96:'musculoskeletal-review-interventions',
 98:'leadership-management',99:'leadership-management',100:'leadership-management',101:'leadership-management',104:'gi-absorption-elimination',108:'hematologic-disorders',111:'hematologic-disorders',114:'hematologic-disorders',121:'substance-use-disorders',127:'psychiatric-assessment-symptomatology',148:'primary-health-care-phc',149:'psychopharmacology',151:'somatic-behavioral-therapies',154:'therapeutic-stress-models',155:'crisis-intervention',164:'therapeutic-communication-relationship',165:'therapeutic-communication-relationship',173:'sanitation-environmental-health',180:'psychopharmacology',187:'hematologic-disorders',190:'immunologic-connective-tissue-disorders',
 198:'altered-tissue-perfusion',199:'gi-absorption-elimination',200:'altered-elimination',201:'immunologic-connective-tissue-disorders',202:'altered-ventilatory-function',206:'trauma-related-disorders',207:'primary-health-care-phc',217:'basic-needs-mobility-comfort-elimination-oxygenation',227:'asepsis-iv-therapy-wound-care',236:'laboratory-values',239:'altered-elimination',240:'basic-needs-mobility-comfort-elimination-oxygenation',241:'basic-needs-mobility-comfort-elimination-oxygenation',242:'musculoskeletal-review-interventions',
 246:'nutrition-programs',247:'nutrition-programs',248:'nutrition-programs',249:'nutrition-programs',252:'malnutrition',259:'altered-ventilatory-function',261:'acid-base-balance-abg',269:'iv-fluids',271:'acid-base-balance-abg',276:'iv-fluids',278:'professional-ethics-legal-foundations',283:'health-education-quality-improvement',290:'normal-pregnancy',296:'female-male-reproductive-systems',301:'gi-absorption-elimination',302:'asepsis-iv-therapy-wound-care',303:'heart-anatomy-ecg-basics',304:'musculoskeletal-review-interventions',306:'asepsis-iv-therapy-wound-care',
 315:'normal-pregnancy',316:'normal-pregnancy',317:'complications-during-pregnancy',321:'normal-pregnancy',323:'normal-pregnancy',325:'normal-pregnancy',330:'care-of-families-normal-at-risk',332:'care-of-families-normal-at-risk',337:'complications-during-labor',338:'normal-labor-delivery',343:'complications-during-labor',351:'pediatric-neurologic-disorders',353:'pediatric-respiratory-disorders',360:'psychopharmacology',361:'mood-disorders',
 366:'theories-of-growth-development',368:'theories-of-growth-development',369:'theories-of-growth-development',370:'developmental-milestones',371:'developmental-milestones',374:'expanded-program-on-immunization-epi',380:'pediatric-cardiovascular-disorders',381:'pediatric-cardiovascular-disorders',387:'complications-during-pregnancy',390:'fertilization-genetics-fertility',396:'normal-puerperium',405:'professional-ethics-legal-foundations',413:'leadership-management',414:'collaboration-communication-in-critical-care',
 419:'pharmacology-drug-classes',426:'pharmacology-core-principles',427:'pharmacology-drug-classes',428:'pharmacology-core-principles',429:'pharmacology-core-principles',431:'pharmacology-drug-classes',432:'pharmacology-drug-classes',456:'asepsis-iv-therapy-wound-care',457:'asepsis-iv-therapy-wound-care',463:'neuroanatomy-assessment-basics',465:'dosage-calculation-medication-administration',466:'dosage-calculation-medication-administration',467:'acid-base-balance-abg',470:'altered-ventilatory-function',478:'dosage-calculation-medication-administration',479:'asepsis-iv-therapy-wound-care',481:'dosage-calculation-medication-administration',484:'asepsis-iv-therapy-wound-care'
}

def topic_for(fact):
    if fact['kind']=='comparison': return TABLE_TOPICS[fact['tableIndex']]
    term = fact['canonical']
    chapter = fact['chapter'].casefold()
    child = fact['bookSet']=='openrnnhp' and any(x in chapter for x in ['childhood','ill child','newborn','congenital heart','infancy'])
    if child:
        for pattern,slug in [
          ('cardi|heart|septal|aortic|ductus|tetralogy|transposition','pediatric-cardiovascular-disorders'),
          ('respirat|pulmon|bronchi|asthma|croup|epiglott|pneumon|cystic fibrosis|surfactant','pediatric-respiratory-disorders'),
          ('renal|kidney|urinary|nephro|enuresis|hydroneph|vesicoureter','pediatric-renal-disorders'),
          ('hemat|hemophil|anemia|leukemia|cancer|tumor|sickle|thalassem','pediatric-hematologic-oncologic-disorders'),
          ('seizure|epilep|cerebral|mening|enceph|hydrocephal|neuro|spina bifida|down syndrome|trisomy|reye','pediatric-neurologic-disorders'),
          ('digest|gastro|bowel|colic|diarrh|constipat|intest|esophag|pylor|intussus|omphal|gastroschisis|hirschsprung|necrotizing|celiac|jaundice|bilirubin','pediatric-gastrointestinal-disorders'),
          ('skin|dermat|eczema|bone|muscle|fracture|scoliosis|hip dysplasia|clubfoot|cast|pavlik','pediatric-integumentary-musculoskeletal-disorders'),
        ]:
            if re.search(pattern,term):return slug
    # Chapter context protects specialized meanings (e.g. cardiac versus
    # reproductive "deceleration") from unrelated keyword matches.
    if fact['bookSet']=='openrnnhp' and any(x in chapter for x in ['reproductive','perinatal','antepartum','labor','postpartum']):
        if re.search('preterm|premature rupture|prelabor rupture|pre labour rupture|post.term pregnancy|cervical insufficiency|hydramnios|oligohydramnios|placental insufficiency|intrauterine growth restriction',term):return 'complications-during-pregnancy'
        if re.search('contracept|condom|diaphragm|spermicide|vasectomy|tubal ligation|family planning|intrauterine device|fertility awareness',term):return 'family-planning-methods'
        if re.search('fertiliz|infertili|genetic|chromosom|allele|dominant|recessive|gamete|zygote|blastocyst|morula|embryo|spermatogenesis|oogenesis|mendel|phenotype|genotype|mutation|trisomy|monosomy|carrier screen|in vitro|intrauterine insemin',term):return 'fertilization-genetics-fertility'
        if re.search('preeclamp|eclamp|gestational hypertension|hellp|placenta previa|abruption|ectopic|hydatid|hyperemesis|gestational diabetes|miscarriage|abortion|molar pregnancy|teratogen|chorioamnionitis',term):return 'complications-during-pregnancy'
        if 'labor' in chapter and re.search('dystocia|decelerat|tachysystole|prolapse|uterine rupture|fetal distress|shoulder|cephalopelvic|breech|malpresent|malposition|prolonged|arrest|precipitate|retained placenta|amnioinfusion',term):return 'complications-during-labor'
        if 'postpartum' in chapter and re.search('hemorrhag|atony|endometritis|mastitis|infection|subinvolution|thrombo|hematoma|depress|psychos',term):return 'postpartum-complications'
        if re.search('informed consent|autonomy|beneficence|ethical|collaborat',term):return 'ethico-moral-management-in-maternal-care'
    for slug,pattern in SPECIFIC:
        if re.search(pattern,term): return slug
    # Shared professional concepts in glossary-only chapters.
    for slug,pattern in [
      ('nursing-research','research|study design|qualitative|quantitative|randomized|evidence.based|hypothesis|sampling|validity|reliability|systematic review|meta.analysis|pico|literature review|statistical|confidence interval|informed assent|primary source|secondary source|peer.reviewed'),
      ('documentation-professional-development','document|charting|record|dar$|soapie|soap$|narrative note|flow sheet|continuing education|professional development|portfolio'),
      ('professional-ethics-legal-foundations','ethic|autonomy|beneficence|nonmaleficence|justice|fidelity|veracity|consent|confidential|privacy|advoca|accountab|negligence|malpractice|liability|tort|assault|battery|defamation|moral|paternalism|deontolog|utilitarian|consequential|law$|laws$|crime|duty of reasonable care'),
      ('health-education-quality-improvement','teach|learn|literacy|quality improvement|root cause|safety culture|just culture'),
      ('epidemiology-vital-statistics-demography',r'epidemio|incidence|prevalence|mortality|morbidity|pandemic|endemic|epidemic|outbreak|demograph|\brate$|cohort|risk ratio|case.control'),
      ('leadership-management','leader|manage|delegat|staffing|budget|conflict|organiz|teamwork|supervis|acuity|authority|power|chain of command|assignment|motivation|strategic|transaction|transformational'),
      ('asepsis-iv-therapy-wound-care','wound|skin|epiderm|dermis|integument|pressure injury|steril|asep|hand hygiene|catheter|iv |venous access|phlebitis|infiltration|extravas|dressing|infection control|granulat|epithelial|exudate|slough|eschar|dehiscence|macerat|serous|sanguineous|purulent'),
      ('dosage-calculation-medication-administration','dose|dosage|medication administration|oral route|sublingual|buccal|intramuscular|subcutaneous|intradermal|injection|medication reconciliation'),
      ('pharmacology-core-principles','pharmaco|absorp|bioavailability|half.life|agonist|antagonist|therapeutic index|adverse drug|drug interaction|first.pass|metabolism|excretion|protein binding|titrate'),
      ('health-assessment-vital-signs','assessment|auscultat|palpat|percussion|vital sign|temperature|blood pressure|pulse|heart rate|respiratory rate|health history|objective data|subjective data|general survey'),
      ('nursing-process-prioritization','nursing process|nursing diagnos|clinical judgment|clinical reasoning|clinical decision|priorit|outcome|planning|implementation|evaluation|cue$|cues$'),
      ('therapeutic-communication-relationship','communicat|listening|empathy|sympathy|rapport|therapeutic relationship|nonverbal|verbal|silence|clarification|reflection|culture|cultural|spiritual|grief|mourning|bereavement'),
      ('communicable-diseases-basic-concepts','infect|pathogen|bacter|virus|viral|fung|parasite|contag|reservoir|portal of|transmission|susceptib|coloniz|normal flora|incubation|prodromal'),
      ('expanded-program-on-immunization-epi','vaccin|immuniz|herd immunity|active immunity|passive immunity'),
      ('nutrition-programs','nutri|vitamin|mineral|protein|carbohydrate|fat$|fats$|calorie|diet|amino acid|trace element|folate|folic acid|riboflavin|niacin|thiamin|cobalamin|pyridoxine|zinc|selenium|iodine'),
      ('immunologic-connective-tissue-disorders','immun|allerg|hypersensitiv|antibody|antigen|autoimm|complement|cytokine|inflamm|lymph|spleen|spleen|thymus|interleukin'),
      ('theories-of-growth-development','erikson|piaget|kohlberg|developmental theory|psychosocial stage|sensorimotor|preoperational|concrete operational|formal operational'),
      ('developmental-milestones','milestone|gross motor|fine motor|growth|development'),
      ('care-of-families-normal-at-risk','family|parent|attachment|bonding|caregiver'),
      ('fertilization-genetics-fertility','chromosom|genetic|allele|mutation|genotype|phenotype|fertility|infertility'),
    ]:
        if re.search(pattern,term): return slug
    for pattern,slug in CHAPTERS:
        if re.search(pattern,chapter):return slug
    return {'openrnnmpc2e':'leadership-management','openrnnf2e':'basic-needs-mobility-comfort-elimination-oxygenation','openrnna':'basic-needs-mobility-comfort-elimination-oxygenation','openrnmt2e':'health-assessment-vital-signs'}.get(fact['bookSet'],'nursing-process-prioritization')
