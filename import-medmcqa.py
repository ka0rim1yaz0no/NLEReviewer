"""Prepare an attributed supplemental set; never fetches BoardPal content.

Input: the public openlifescienceai/medmcqa train parquet in outputs/.
The dataset card publishes the data under Apache-2.0. See THIRD_PARTY.md.
Filters are editorial screening, not independent clinical validation.
"""
import collections
import hashlib
import html
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent
catalog = json.loads((ROOT / 'topic-catalog.json').read_text(encoding='utf-8'))
topics = {t['slug']: t for t in catalog}
rules = []

def rule(slug, expression):
    assert slug in topics, slug
    rules.append((slug, re.compile(expression, re.I)))

# Specific subjects take precedence over broader system headings. Only question
# and source-topic text are used: a distractor mentioned in an explanation must
# not silently assign a question to an unrelated topic.
for slug, pattern in [
 ('tuberculosis', r'\btuberculos|\bBCG\b'),
 ('leprosy', r'\bleprosy\b|\blepra\b|\bHansen'),
 ('mosquito-borne-diseases', r'\bdengue\b|\bmalaria\b|\bchikungunya|\baedes\b|\banopheles'),
 ('neuro-related-cds', r'\brabies\b|\btetanus\b|\bpoliom'),
 ('integumentary-related-cds', r'\bmeasles\b|\bvaricella\b|\bchickenpox\b'),
 ('expanded-program-on-immunization-epi', r'\bvaccin|\bimmuni[sz]ation'),
 ('sanitation-environmental-health', r'\bwater purif|\bchlorinat|\bsewage\b|\bsanitation\b|\bwater pollution\b'),
 ('epidemiology-vital-statistics-demography', r'\bepidemiolog|\bincidence\b|\bprevalence\b|\bsensitivity\b|\bspecificity\b|\bcase.control\b|\bcohort\b|\bodds ratio\b|\brelative risk\b'),
 ('nursing-research', r'\brandomi[sz]|\bconfidence interval\b|\bstandard deviation\b|\bstatistic|\bnull hypothesis\b|\bclinical trial\b'),
 ('ostomies', r'\bcolostom|\bileostom|\bstoma\b'),
 ('adh-disorders', r'\bSIADH\b|\bdiabetes insipidus\b|\bantidiuretic hormone\b'),
 ('diabetes-mellitus', r'\bdiabet|\binsulin\b|\bhypoglyc'),
 ('thyroid-disorders', r'\bthyroid|\bthyrotox|\bGraves|\bmyxedema|\bmyxoedema'),
 ('parathyroid-disorders', r'\bparathyroid|\bparathormone'),
 ('adrenal-gland-disorders', r'\badrenal|\bAddison|\bCushing|\baldosteron|\bpheochromocyt'),
 ('pituitary-gland-disorders', r'\bpituitar|\bacromegal|\bgrowth hormone|\bprolactin'),
 ('parkinson-s-disease', r'\bParkinson'),
 ('myasthenia-gravis-mg', r'\bmyasthenia'),
 ('multiple-sclerosis-ms', r'\bmultiple sclerosis'),
 ('guillain-barr-syndrome-gbs', r'\bGuillain'),
 ('autonomic-dysreflexia', r'\bautonomic dysreflexia'),
 ('alzheimer-s-disease-dementia', r'\bAlzheimer|\bdementia'),
 ('amyotrophic-lateral-sclerosis-als', r'\bamyotrophic|\bmotor neuron disease'),
 ('seizure-disorders', r'\bseizure|\bepilep|\banticonvuls'),
 ('cerebrovascular-accident-stroke', r'\bstroke\b|\bcerebrovascular|\bsubarachnoid hemorrhage\b|\bsubarachnoid haemorrhage\b'),
 ('increased-intracranial-pressure-iicp', r'\bintracranial pressure|\bpapilledema|\bpapilloedema|\bcerebral herniation'),
 ('spinal-cord-injuries-sci', r'\bspinal cord inj|\bspinal shock|\bparapleg|\bquadripleg'),
 ('peripheral-neuropathies', r'\bperipheral neurop|\bcarpal tunnel|\bnerve palsy'),
 ('metabolic-bone-disorders', r'\bosteoporo|\bosteomal|\brickets|\bPaget.*bone'),
 ('inflammatory-infectious-bone-joint-disorders', r'\brheumatoid|\bosteoarthr|\bosteomyel|\bseptic arthr|\bgout\b'),
 ('musculoskeletal-trauma', r'\bfracture|\bdislocat|\bcompartment syndrome'),
 ('glaucoma-cataract', r'\bglaucoma|\bcataract'),
 ('retinal-detachment-macular-degeneration', r'\bretinal detach|\bmacular degener'),
 ('bronchial-asthma', r'\basthma|\bbronchospasm'),
 ('copd', r'\bCOPD\b|\bemphysema|\bchronic bronchitis'),
 ('ards', r'\bARDS\b|\bacute respiratory distress'),
 ('pneumonia-cap-hap-vap', r'\bpneumonia\b'),
 ('pneumothorax-hemothorax-chest-tubes', r'\bpneumothorax|\bhemothorax|\bhaemothorax|\bchest (tube|drain)'),
 ('pulmonary-embolism-pulmonary-hypertension', r'\bpulmonary embol|\bpulmonary hypertension'),
 ('acute-coronary-syndrome-acs', r'\bmyocardial infar|\bcoronary|\bangina\b'),
 ('peripheral-vascular-diseases-hypertension', r'\bhypertension\b|\bdeep vein throm|\bperipheral vascular|\bvaricose|\batherosclero'),
 ('acute-kidney-injury-aki', r'\bacute (kidney|renal) (injury|failure)|\bAKI\b'),
 ('chronic-kidney-disease-ckd', r'\bchronic (kidney|renal)|\bCKD\b|\buremi|\buraemi'),
 ('dialysis-hemodialysis-peritoneal', r'\bdialys|\bhemodial|\bhaemodial'),
 ('electrolyte-imbalances', r'\bhyperkale|\bhypokale|\bhyponatr|\bhypernatr|\bhypocalc|\bhypercalc|\belectrolyte'),
 ('acid-base-balance-abg', r'\bacidosis|\balkalosis|\bacid.base\b|\barterial blood gas'),
 ('iv-fluids', r'\bIV fluid|\bfluid therap|\bisotonic|\bhypertonic|\bhypotonic'),
 ('hematologic-disorders', r'\banemi|\banaemi|\bhemophili|\bhaemophili|\bthrombocyt|\bcoagulat|\bhemol|\bhaemol|\bhematolog|\bhaematolog|\bleukemia|\bleukaemia|\btransfusion'),
 ('inflammatory-bowel-neuro-inflammatory-disorders', r'\bCrohn|\bulcerative colitis|\binflammatory bowel|\bmeningitis'),
 ('immunologic-connective-tissue-disorders', r'\blupus\b|\bSLE\b|\bimmunoglobulin|\bcomplement system|\bautoimmun'),
 ('oncologic-emergencies', r'\btumou?r lysis|\bspinal cord compression|\bsuperior vena cava syndrome'),
 ('cancer-treatment-modalities', r'\bchemotherap|\bradiotherap|\bradiation therap|\bantineoplast'),
 ('basic-concepts-in-cancer', r'\bcarcinogen|\bneoplas|\bmetastas|\btumou?r marker|\bcancer staging'),
 ('site-specific-cancers', r'\bcarcinoma|\blymphoma|\bcancer\b|\bmalignan'),
 ('hepatobiliary-disorders', r'\bhepat|\bliver|\bcirrhos|\bpancreati|\bchole|\bgallbladder|\bgallstone|\bjaundice'),
 ('oral-esophageal-gastric-disorders', r'\besophag|\boesophag|\bgastr|\bpeptic|\bGERD\b|\bduoden'),
 ('gi-absorption-elimination', r'\bintestin|\bbowel|\bcolon|\brectal|\banal\b|\bappendic|\bdiarrh|\bconstipat|\bmalabsor|\bceliac|\bcoeliac'),
 ('malnutrition', r'\bmalnutri|\bvitamin|\bkwashiorkor|\bmarasmus|\bberiberi|\bpellagra|\bscurvy'),
 ('multi-system-problems-shock-sepsis', r'\bsepsis\b|\bseptic shock|\bhypovolemic|\bhypovolaemic|\bcardiogenic shock'),
 ('high-acuity-emergency-situations', r'\banaphylax|\bresuscitat|\bcardiac arrest|\btriage|\bcardiopulmonary'),
 ('altered-ventilatory-function', r'\bventilat|\brespiratory failure|\bintubat'),
 ('critical-care-equipment', r'\bdefibrillat|\bcentral venous pressure|\bpulmonary artery catheter'),
]: rule(slug, pattern)

psychiatry = [
 ('psychopharmacology',r'\blithium|\bantipsych|\bantidepress|\bSSRI\b|\bclozapine|\bhaloperidol'),
 ('substance-use-disorders',r'\balcohol|\baddict|\bopioid|\bsubstance|\bwithdrawal'),
 ('eating-disorders',r'\banorexia|\bbulimia|\bbinge eat'),
 ('mood-disorders',r'\bdepress|\bbipolar|\bmania\b|\bmanic'),
 ('schizophrenia-other-psychoses',r'\bschizophren|\bpsychosis|\bpsychotic|\bdelusion|\bhallucinat'),
 ('trauma-related-disorders',r'\btrauma|\bPTSD|\bpost.traumatic'),
 ('anxiety-anxiety-related-disorders',r'\banxiety|\bpanic|\bobsess|\bcompuls|\bphobia'),
 ('personality-disorders',r'\bpersonality'),
 ('cognitive-other-psychiatric-disorders',r'\bdelirium|\bcognitive|\bdementia'),
 ('somatic-behavioral-therapies',r'\bECT\b|\belectroconvulsive|\bbehavio.r therap|\bconditioning'),
 ('psychiatric-assessment-symptomatology',r'\bmental status|\bthought|\baffect|\bperception'),
]
maternal = [
 ('fertilization-genetics-fertility',r'\bfertil|\bgenetic|\binfertil|\bchromosom|\binheritance'),
 ('family-planning-methods',r'\bcontracept|\bfamily planning|\bIUD\b|\bIUCD\b'),
 ('postpartum-complications',r'\bpuerperal (sepsis|infection)|\bpostpartum (hemorrhage|haemorrhage)|\bpost.partum (hemorrhage|haemorrhage)|\buterine atony'),
 ('normal-puerperium',r'\bpuerper|\bpostpartum|\bpost.partum|\blactat|\bbreastfeed|\bbreast feed|\blochia'),
 ('complications-during-pregnancy',r'\bpreeclamp|\bpre.eclamp|\beclamp|\bplacenta previa|\babruptio|\bectopic|\bhyperemesis|\bgestational diabet'),
 ('complications-during-labor',r'\bdystocia|\bcord prolapse|\bshoulder dystocia|\bmalpresent|\bcephalopelvic'),
 ('normal-labor-delivery',r'\blabou?r|\bparturition|\bdelivery|\bfetal heart|\bfoetal heart'),
 ('normal-pregnancy',r'\bpregnan|\bantenatal|\bprenatal|\bgestation|\bplacenta|\bfetus|\bfoetus'),
 ('female-male-reproductive-systems',r'\bmenstr|\bovari|\bovulat|\buter|\bcervix|\bprostat|\btestis|\btestes|\bsemen'),
]
pediatric = [
 ('developmental-milestones',r'\bmilestone|\bdevelop|\bwalk|\bcrawl|\bsitting'),
 ('pediatric-cardiovascular-disorders',r'\bcardiac|\bheart|\bFallot|\bseptal defect|\bcyanotic'),
 ('pediatric-respiratory-disorders',r'\brespirat|\blung|\basthma|\bcroup|\bbronchiol|\bepiglott'),
 ('pediatric-gastrointestinal-disorders',r'\bdiarrh|\bintestin|\bjaundice|\bbilirubin|\bhepat|\bvomit|\bpyloric|\bintussus'),
 ('pediatric-hematologic-oncologic-disorders',r'\banemi|\banaemi|\bhemoglobin|\bhaemoglobin|\bleuk|\bhaemoph|\bhemoph|\bthrombocyt|\btumor|\btumour'),
 ('pediatric-neurologic-disorders',r'\bseizure|\bepilep|\bmening|\bcerebral|\bhydroceph|\bencephal'),
 ('pediatric-renal-disorders',r'\brenal|\bkidney|\bnephro|\burinar'),
 ('pediatric-integumentary-musculoskeletal-disorders',r'\bskin|\brash|\beczema|\bbone|\bfracture|\bjoint'),
 ('health-promotion-disease-prevention-pedia',r'\bnewborn|\bneonat|\bbreastfeed|\bimmuni|\bvaccin|\binfant'),
]

def first_match(entries, text):
    return next((slug for slug, pattern in entries if re.search(pattern,text,re.I)),None)

def assign(row):
    text = f"{clean(row['topic_name'])} {row['question']}"
    subject = row['subject_name']
    if subject == 'Psychiatry':
        return first_match(psychiatry,text)
    if subject == 'Gynaecology & Obstetrics':
        return first_match(maternal,text)
    if subject == 'Pediatrics':
        return first_match(pediatric,text)
    if subject == 'Pharmacology':
        return 'pharmacology-core-principles' if re.search(r'kinetic|dynamic|bioavailab|half.life|receptor|first.pass|absorption|metabolis|excretion|distribution',text,re.I) else 'pharmacology-drug-classes'
    found = next((slug for slug,pattern in rules if pattern.search(text)),None)
    if found:return found
    if subject == 'Ophthalmology':return 'eye-anatomy-assessment-refractive-disorders'
    if subject == 'ENT':
        if re.search(r'\bear\b|\bhearing|\bcochle|\bvestibul|\botitis|\btinnitus',text,re.I):return 'ear-disorders-surgery-care'
        if re.search(r'\blaryn|\bpharyn|\btonsil|\bsinus|\bnasal|\bnose',text,re.I):return 'upper-airway-disorders'
    if subject == 'Orthopaedics':return 'musculoskeletal-review-interventions'
    if re.search(r'\bECG\b|\belectrocardio|\bcardiac cycle|\bheart sound|\bheart block|\barrhythm',text,re.I):return 'heart-anatomy-ecg-basics'
    if re.search(r'\bcranial nerve|\bneuroanatom|\bbrain stem|\bbrainstem|\bneurologic|\bcerebell|\breflex',text,re.I):return 'neuroanatomy-assessment-basics'
    if subject == 'Microbiology' and re.search(r'\binfect|\bbacter|\bvirus|\bviral|\bparasite|\bfung',text,re.I):return 'infectious-disorders'
    return None

def clean(value):
    return re.sub(r'\s+',' ',html.unescape(str(value))).strip() if isinstance(value,str) else ''

def normalized(value):
    return re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKC',value).lower()).strip()

# Reject missing-media questions, local foreign laws/programs, visibly damaged
# text, answer-combination items, historical incidence claims, and item-dependent
# option references. Do not manufacture an explanation where none was supplied.
bad = re.compile(r'\b(India|Indian|AIIMS|NEET|JIPMER|MCI|IPC|CrPC|MTP act|RNTCP|NACO|ICDS|UDHR|Harrison|Robbins)\b|\b(figure|pictured|diagram|photograph|image|shown below|shown above|following table|above table)\b|\b(aery|aeries|impoant|paicular|cailage|aerial|hea failure|sho term|Hyperophy|Dyplasia|prismatic hyperplasia|repoed|propey|paicular|poion|paicipate|impoance|sho|apa|staed)\b|\b(19[0-9]{2}|20[0-1][0-9])\b',re.I)
bad_option = re.compile(r'\b(all of|none of|both [a-d]|above|option [a-d]|[a-d] (and|&) [a-d])\b|^[a-d]{1,5}$',re.I)
df = pd.read_parquet(ROOT/'outputs/medmcqa-train.parquet')
candidates = collections.defaultdict(list)
baseline = json.loads((ROOT/'question-bank.json').read_text(encoding='utf-8'))
if isinstance(baseline, dict) and baseline.get('format') == 'gzip-json-array':
    import gzip
    baseline = json.loads(gzip.decompress((ROOT / baseline['file']).read_bytes()))
seen = {normalized(q['stem']) for q in baseline if not q['id'].startswith('MMCQA-')}
for position,row in enumerate(df.to_dict('records')):
    if row['choice_type'] != 'single' or row['subject_name'] in ('Dental','Forensic Medicine','Unknown'):continue
    question, explanation = clean(row['question']),clean(row['exp'])
    choices = [clean(row[k]) for k in ('opa','opb','opc','opd')]
    key = row['cop']
    if not isinstance(key,int) or key not in range(4):continue
    if not 45 <= len(question) <= 1000 or not 140 <= len(explanation) <= 2200:continue
    if bad.search(question+' '+explanation+' '+' '.join(choices)):continue
    if any(not 2 <= len(c) <= 220 or bad_option.search(c) for c in choices):continue
    if len({normalized(c) for c in choices}) != 4:continue
    if normalized(choices[key]) not in normalized(explanation):continue
    # Explicit printed answer letters must agree with the zero-based HF key.
    printed = re.search(r"\bans(?:wer)?\.?\s*(?:is\s*)?[:.\-]?\s*['\"(]?([a-d])['\")]",explanation,re.I)
    if printed and ord(printed[1].lower())-ord('a') != key:continue
    norm = normalized(question)
    if norm in seen:continue
    row.update(question=question,exp=explanation)
    slug = assign(row)
    if not slug:continue
    # Prefer complete explanatory text and clinical vignettes. Ordering is fixed.
    score = (8 if 250 <= len(explanation) <= 1400 else 0)+(5 if len(question)>90 else 0)+sum(3 for c in choices if normalized(c) in normalized(explanation))
    candidates[slug].append((score,row['id'],position,row,choices,norm))

for items in candidates.values():items.sort(key=lambda item:(-item[0],item[1]))
selected=[]
token_index=collections.defaultdict(set)
selected_tokens=[]
stopwords=set('which of the following is are a an in on for with to patient has most the this and as at by who what when does from about year old man woman'.split())
def near_duplicate(stem):
    tokens=set(normalized(stem).split())-stopwords
    if not tokens:return True
    possible=set()
    for token in sorted(tokens,key=lambda token:(len(token_index[token]),token))[:3]:possible.update(token_index[token])
    for index in possible:
        other=selected_tokens[index]
        if len(tokens&other)/len(tokens|other)>=0.90:return True
    index=len(selected_tokens);selected_tokens.append(tokens)
    for token in tokens:token_index[token].add(index)
    return False
# Round-robin gives narrower topics a place before larger pools. A question has
# one exact topic; repeated related links never inflate the unique total.
while len(selected)<4120 and any(candidates.values()):
    for topic in catalog:
        items=candidates[topic['slug']]
        while items:
            item=items.pop(0)
            if item[-1] not in seen and not near_duplicate(item[3]['question']):
                seen.add(item[-1]);selected.append((topic,item));break
        if len(selected)==4120:break
if len(selected)!=4120:raise RuntimeError(f'Only {len(selected)} screened questions; do not pad the bank.')
output=[]
for topic,(_,source_id,position,row,choices,_) in selected:
    explanation=row['exp'];key=row['cop']
    output.append(dict(
      id='MMCQA-'+source_id, subject=topic['subject'],topic=topic['name'],
      stem=row['question'],correctIndex=key,rationale=explanation,
      options=[dict(text=c,rationale=explanation if i==key else 'The dataset keys '+choices[key]+'. It supplies a shared answer explanation, not a separate rationale for this alternative. Read the complete source explanation below.') for i,c in enumerate(choices)],
      keyPoint=choices[key]+': '+explanation,
      source=f'https://huggingface.co/datasets/openlifescienceai/medmcqa/viewer/default/train?row={position}',
      origin='MedMCQA â€” Ankit Pal, Logesh Kumar Umapathi, Malaikannan Sankarasubbu (2022); published dataset license Apache-2.0. Reformatted and mapped to this reviewer catalog. Not a BoardPal or PNLE item.',
      collection='supplemental',rationaleScope='shared',sourceId=source_id,
      sourceTopic=clean(row['topic_name']) or row['subject_name'],
    ))
corrections=json.loads((ROOT/'supplemental-corrections.json').read_text(encoding='utf-8'))
for question in output:
    correction=corrections.get(question['sourceId'])
    if correction:
        question.update({key:value for key,value in correction.items() if key!='correctionNote'})
        question.pop('rationaleScope',None)
        question['origin']+=' Source-based correction: '+correction['correctionNote']
(ROOT/'outputs/supplemental-review.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'),allow_nan=False),encoding='utf-8')
# Only explicitly source-checked corrections enter student practice. The bulk
# research dataset stays in the ignored review queue.
source_checked=[q for q in output if q['sourceId'] in corrections]
if len(source_checked)!=len(corrections):raise RuntimeError('A source-checked correction was missing; do not publish a partial selection.')
(ROOT/'supplemental-questions.json').write_text(json.dumps(source_checked,ensure_ascii=False,separators=(',',':'),allow_nan=False),encoding='utf-8')
report=dict(count=len(output),publishedSourceCheckedCount=len(source_checked),source='openlifescienceai/medmcqa train',sourceFileSHA256=hashlib.sha256((ROOT/'outputs/medmcqa-train.parquet').read_bytes()).hexdigest(),bySubject=dict(collections.Counter(q['subject'] for q in output)),byTopic=dict(collections.Counter(q['topic'] for q in output)),review='Automated editorial screening; independent clinical review remains required. Shared source explanations are not per-choice rationales.')
(ROOT/'outputs/supplemental-screening.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
