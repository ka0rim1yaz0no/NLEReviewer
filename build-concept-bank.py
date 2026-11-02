"""Create and verify original question designs from licensed reference facts.

No LLM-generated medical keys and no existing third-party questions are used.
Every answer and alternative explanation is paired to a specific definition or
table cell from the reference preparation. This is a source consistency check,
not a claim of independent clinical review.
"""
from pathlib import Path
import collections
import difflib
import hashlib
import importlib.util
import json
import random
import re
from functools import lru_cache

ROOT=Path(__file__).resolve().parent
WORK=ROOT/'outputs/openrn'

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result
prep=module('reference_preparation',ROOT/'prepare-openrn.py')
mapping=module('topic_mapping',ROOT/'openrn-topic-map.py')
norm=lru_cache(maxsize=30000)(prep.normalize)

STOP=set('a an the of to and or in on for by with from is are that this these those as at be being was were has have can may which it its into through without when during also often such include includes including associated related characterized used type more most than not between'.split())
@lru_cache(maxsize=20000)
def words(text):return {w.rstrip('s') for w in norm(text).split() if w not in STOP and len(w)>2}
def similarity(a,b):
    aa,bb=words(a),words(b)
    return len(aa&bb)/len(aa|bb) if aa|bb else 0

def label_overlap(a,b):
    aa,bb=set(a.split()),set(b.split())
    return aa<=bb or bb<=aa

# Exclude descriptions that require guideline updates, institutional policy,
# copyrighted standardized diagnostic wording, or unclear standalone context.
# These candidates are retained in outputs/, never published or counted.
EXCLUDE_TERM=re.compile(r'^(risk for |readiness for enhanced |impaired |ineffective |deficient |interrupted |decreased cardiac output|excess fluid volume|activity intolerance|acute confusion|chronic confusion|disturbed |unilateral neglect|imbalanced nutrition|self.care deficit)',re.I)
EXCLUDE_EXACT={
 'sepsis','severe sepsis','septic shock','systemic inflammatory response syndrome',
 'midline peripheral catheters','normal flora','pain','dermis','fetal distress',
 'mild preeclampsia','cultural competence','race','races',
 'do not resuscitate','do not resuscitate order','do not intubate',
 'physician assisted suicide','physician assisted death','medical aid in dying',
 'chemical restraint','medical restraints','restraints','restraint',
 'living will','durable power of attorney','advance directive','advance directives',
 'nurse practitioner','licensed practical nurse','licensed vocational nurse',
 'certified nursing assistant','unlicensed assistive personnel',
 'homicidal ideation','protected health information','teamstepps','magnet recognition program',
 'pediatric autoimmune neuropsychiatric disorder associated with streptoccocal infection',
 'pediatric autoimmune neuropsychiatric disorder associated with streptococcal infection',
 'pandas','deductible','copayment','co payment','coinsurance',
 'basic patient situation','complex patient situation','basic nursing care','delegatee',
}

def curate(facts):
    selected=[];rejected=[]
    # A relation copied verbatim in two books is one objective, even if renamed.
    used_relations=set()
    for f in facts:
        reason=''
        if f['canonical'] in EXCLUDE_EXACT or EXCLUDE_TERM.search(f['term']):reason='editorial exclusion'
        if f['kind']=='definition' and re.search(r'\b(diagnostic and statistical|DSM|NANDA|American Nurses Association)\b',f['definition'],re.I):reason='standardized proprietary definition'
        if re.search(r'\b(in the next|see table|see figure|above|below|as described|as follows|following:)\b',f['definition'],re.I):reason='incomplete context'
        if re.search(r'\b(same milestones|same as|unchanged from|see also|refer to|the previous)\b',f['definition'],re.I):reason='dependent on another entry'
        if re.search(r'\b(TeamSTEPPS|Magnet.|U\.S\.|US Preventive|durable power|do.not.resuscitate|living will)\b',f['term'],re.I):reason='foreign legal or accreditation context'
        if 'autoimmune neuropsychiatric' in f['canonical']:reason='uncertain explanatory mechanism'
        if f['kind']=='comparison' and f['tableIndex'] in (374,387):reason='table requires clinical relabeling or guideline update'
        relation=norm(f['definition'])
        if relation in used_relations:reason='duplicate reference relation'
        if reason:rejected.append({'term':f['term'],'reason':reason});continue
        used_relations.add(relation)
        selected.append(f)
    # Exact/near-identical definitions under alternate labels are not separate
    # questions. Use rare-token indexing to audit candidates efficiently.
    postings=collections.defaultdict(list)
    for i,f in enumerate(selected):
        if f['kind']=='definition':
            for word in words(f['definition']):postings[word].append(i)
    removed=set();suspect=[]
    for i,f in enumerate(selected):
        if f['kind']!='definition' or i in removed:continue
        overlap=collections.Counter(j for w in words(f['definition']) if len(postings[w])<250 for j in postings[w] if j>i)
        for j,count in overlap.items():
            if j in removed or count<4:continue
            g=selected[j];score=similarity(f['definition'],g['definition'])
            name_score=difflib.SequenceMatcher(None,f['canonical'],g['canonical']).ratio()
            if score>=.82 or (score>=.58 and name_score>=.9):
                removed.add(j);rejected.append({'term':g['term'],'reason':'near-duplicate meaning','sameAs':f['term'],'score':round(score,3)})
            elif score>=.58:
                suspect.append({'a':f['term'],'b':g['term'],'score':round(score,3),'aDefinition':f['definition'],'bDefinition':g['definition']})
    unique=[];identities=set()
    for i,f in enumerate(selected):
        if i in removed:continue
        key=identity(f)
        if key in identities:
            rejected.append({'term':f['term'],'reason':'same concept and relation in comparison'});continue
        identities.add(key);unique.append(f)
    selected=unique
    (WORK/'editorial-exclusions.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2),encoding='utf-8')
    (WORK/'similar-meaning-review.json').write_text(json.dumps(suspect,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Editorial exclusions:',len(rejected),'remaining facts:',len(selected),'similar meanings to review:',len(suspect))
    return selected

def identity(f):
    if f['kind']=='definition':return 'definition:'+f['canonical']
    return 'relation:'+f['canonical']+':'+norm(f['tableTitle'])+':'+norm(f['relation'])

def fact_id(f):return 'ORN-'+hashlib.sha256(identity(f).encode()).hexdigest()[:20]

def chapter_name(value):
    value=re.sub(r'^Chapter \d+[: ]*','',value,flags=re.I)
    if value.isupper():value=value.title()
    return value

def reject_pair(f,g):
    if f['id']==g['id'] or f['canonical']==g['canonical']:return True
    a,b=f['canonical'],g['canonical']
    if label_overlap(a,b):return True
    if similarity(f['definition'],g['definition'])>.37:return True
    if re.search(r'\b'+re.escape(norm(g['term']))+r'\b',norm(f['definition'])):return True
    if re.search(r'\b'+re.escape(norm(f['term']))+r'\b',norm(g['definition'])):return True
    if (a[:3]==b[:3] or set(a.split())&set(b.split())) and difflib.SequenceMatcher(None,a,b).ratio()>.88:return True
    return False

def category(f):
    text=norm(f['definition'][:180]);term=f['canonical']
    if re.search(r'\b(physician|specialist|professional|practitioner|nurse who|worker|surgeon|therapist)\b',text):return 'role'
    if re.search(r'\b(procedure|surgery|surgical|test|testing|imaging|technique|examination|measurement|scan|removal|repair|incision)\b',text):return 'procedure'
    if re.search(r'\b(disease|disorder|condition|syndrome|infection|inflammation|abnormal|deficiency|injury|damage|cancer|tumor)\b',text):return 'condition'
    if re.search(r'\b(drug|medication|medicine|inhibitor|agonist|antagonist)\b',text):return 'medication'
    if re.search(r'\b(bone|ligament|muscle|organ|gland|tissue|layer|vessel|nerve|neuron|artery|vein|cell|structure|opening|cavity|membrane|duct)\b',text):return 'anatomy'
    if re.search(r'\b(movement|process|phase|stage|pattern|production|function|behavior|response|action)\b',text):return 'process'
    return 'concept'

def key_header(value):
    value=value.lower()
    return {'name of stage':'developmental stage','type of wbc':'white blood cell type','medications':'medication','components':'component','types of weight-bearing':'weight-bearing prescription','medical terms':'medical term'}.get(value,value)

def build(facts):
    catalog=json.loads((ROOT/'topic-catalog.json').read_text(encoding='utf-8'))
    topics={x['slug']:x for x in catalog}
    for f in facts:
        slug=mapping.topic_for(f)
        assert slug in topics,(f['term'],slug)
        f['topicSlug']=slug;f['subject']=topics[slug]['subject'];f['topic']=topics[slug]['name'];f['id']=fact_id(f)
        f['category']=category(f)
    # Freeze aliases first; two identical stable IDs are an editorial mistake.
    ids=collections.Counter(f['id'] for f in facts)
    if any(n!=1 for n in ids.values()):raise ValueError([k for k,n in ids.items() if n!=1])
    definitions=[f for f in facts if f['kind']=='definition']
    chapter_pool=collections.defaultdict(list);topic_pool=collections.defaultdict(list);comparison_pool=collections.defaultdict(list)
    for f in facts:
        if f['kind']=='definition':
            chapter_pool[f['bookSet']+':'+f['chapter']].append(f)
            topic_pool[f['topicSlug']].append(f)
        else:comparison_pool[f['poolId']].append(f)
    questions=[];unused=[];used_stems=set()
    for f in sorted(facts,key=lambda x:x['id']):
        rng=random.Random(int(hashlib.sha256(f['id'].encode()).hexdigest()[:16],16))
        if f['kind']=='comparison':
            candidates=[g for g in comparison_pool[f['poolId']] if not reject_pair(f,g)]
        else:
            # Prefer a single chapter, then related catalog topic, then book.
            # The last fallback is still a concept-identification question; its
            # references and terminology are explicit rather than invented.
            chapter=chapter_pool[f['bookSet']+':'+f['chapter']]
            related=topic_pool[f['topicSlug']]
            groups=[[g for g in chapter if g['category']==f['category']],[g for g in related if g['category']==f['category']],chapter,[g for g in definitions if g['bookSet']==f['bookSet'] and g['category']==f['category']]]
            candidates=[];seen=set()
            for group in groups:
                block=[g for g in group if g['id'] not in seen and not reject_pair(f,g)]
                rng.shuffle(block)
                candidates.extend(block);seen.update(g['id'] for g in block)
                if len(candidates)>=16:break
        rng.shuffle(candidates) if f['kind']=='comparison' else None
        alternatives=[]
        for g in candidates:
            if all(not reject_pair(g,h) for h in alternatives):alternatives.append(g)
            if len(alternatives)==3:break
        if len(alternatives)!=3:
            unused.append({'term':f['term'],'reason':'fewer than three unambiguous related alternatives','kind':f['kind']});continue
        if f['kind']=='definition':
            context=chapter_name(f['chapter'])
            context=f['book'] if 'glossary' in context.casefold() else context
            stem=f'In {context}, which concept matches this description?\n\n{f["definition"]}'
            rationale=f'{f["term"]} is the matching concept. In this reference context: {f["definition"]}'
        else:
            stem=f'Which entry in the reference comparison “{f["tableTitle"]}” matches this information?\n\n{f["relation"]}: {f["definition"]}'
            rationale=f'The matching entry is {f["term"]}. {f["relation"]}: {f["definition"]}'
        if norm(stem) in used_stems:
            unused.append({'term':f['term'],'reason':'duplicate stem','kind':f['kind']});continue
        used_stems.add(norm(stem))
        ordered=[f,*alternatives];rng.shuffle(ordered)
        options=[]
        for g in ordered:
            ending='' if g['definition'].endswith(('.','!','?')) else '.'
            explanation=rationale if g is f else f'{g["term"]}: {g["definition"]}{ending} The description in the question instead matches {f["term"]}.'
            options.append({'text':g['term'],'rationale':explanation,'source':g['source'],'referenceId':g['id']})
        questions.append({'id':f['id'],'subject':f['subject'],'topic':f['topic'],'stem':stem,'options':options,'correctIndex':ordered.index(f),'rationale':rationale,'keyPoint':f'{f["term"]}: {f["definition"]}','source':f['source'],'origin':f'Original NLE Reviewer {"concept check" if f["kind"]=="definition" else "comparison question"}; newly constructed choices and explanations based on {f["book"]} ({f["year"]}), {chapter_name(f["chapter"])}. Reference wording adapted from Open Resources for Nursing (Open RN), edited by Kimberly Ernstmeyer and Elizabeth Christman, Chippewa Valley Technical College / WisTech Open, under CC BY 4.0. Changes: converted reference facts to a four-choice question with answer and alternative explanations. No author endorsement is implied.','format':'concept' if f['kind']=='definition' else 'comparison','conceptId':f['id'],'sourceTopic':f['chapter']})
    evidence={f['id']:f for f in facts}
    # Cross-check every position and every alternative against its factual record.
    for q in questions:
        correct=evidence[q['conceptId']]
        assert q['options'][q['correctIndex']]['referenceId']==correct['id']
        assert q['options'][q['correctIndex']]['text']==correct['term']
        assert q['rationale']==q['options'][q['correctIndex']]['rationale']
        assert correct['definition'] in q['stem']
        assert len({evidence[o['referenceId']]['canonical'] for o in q['options']})==4
        for o in q['options']:
            g=evidence[o['referenceId']]
            assert o['text']==g['term'] and g['definition'] in o['rationale'] and o['source']==g['source']
    (WORK/'unused-facts.json').write_text(json.dumps(unused,ensure_ascii=False,indent=2),encoding='utf-8')
    (WORK/'concept-questions-candidate.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    used_ids={o['referenceId'] for q in questions for o in q['options']}
    (WORK/'concept-evidence-candidate.json').write_text(json.dumps([evidence[i] for i in sorted(used_ids)],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report={'newQuestions':len(questions),'definitionQuestions':sum(q['format']=='concept' for q in questions),'comparisonQuestions':sum(q['format']=='comparison' for q in questions),'bySubject':dict(collections.Counter(q['subject'] for q in questions)),'byTopic':dict(collections.Counter(q['topic'] for q in questions)),'answerPositions':dict(collections.Counter(q['correctIndex'] for q in questions)),'unusedFacts':len(unused),'sourceEvidenceFacts':len(used_ids),'independentClinicalReview':False}
    (WORK/'candidate-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='byTopic'}))
    return questions

if __name__=='__main__':
    definitions=json.loads((WORK/'definition-candidates.json').read_text(encoding='utf-8'))
    comparisons=json.loads((WORK/'comparison-candidates.json').read_text(encoding='utf-8'))
    build(curate(definitions+comparisons))
