"""Prepare newly designed concept MCQs from licensed Open RN reference facts.

This never imports a published question bank. The cached reference XML is from
NLM's documented Books-OAI API (see collect-openrn.py). Question choices, keys,
and all alternative explanations retain a traceable reference fact. Generation
is deterministic; published records are frozen in concept-questions.json.
"""
from pathlib import Path
import collections
import hashlib
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
import difflib

ROOT = Path(__file__).resolve().parent
WORK = ROOT / 'outputs/openrn'

def normalize(value):
    value = unicodedata.normalize('NFKD', value).casefold()
    value = ''.join(c for c in value if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()

def clean_term(value):
    # Pronunciation guides and acronym expansions are aliases, not new concepts.
    return re.sub(r'\s+', ' ', re.sub(r'\([^()]*\)', '', value)).strip(' ;,:.')

ALIASES = {
    'heart attack': 'myocardial infarction', 'cerebrovascular accident': 'stroke',
    'cva': 'stroke', 'mi': 'myocardial infarction', 'high blood pressure': 'hypertension',
    'low blood pressure': 'hypotension', 'down syndrome': 'trisomy 21',
    'down s syndrome': 'trisomy 21', 'down syndrome trisomy 21': 'trisomy 21',
    'alzheimer disease': 'alzheimer s disease', 'parkinson disease': 'parkinson s disease',
    'gastroesophageal reflux disease': 'gerd', 'gastroesophageal reflux': 'gerd',
    'chronic obstructive pulmonary disease': 'copd',
    'attention deficit hyperactivity disorder': 'adhd',
    'attention deficit hyperactivity disorder adhd': 'adhd',
    'amyotrophic lateral sclerosis': 'als', 'multiple sclerosis': 'ms',
    'systemic lupus erythematosus': 'sle', 'human immunodeficiency virus': 'hiv',
    'acquired immunodeficiency syndrome': 'aids',
    'body mass index': 'bmi', 'electrocardiogram': 'ecg', 'electrocardiography': 'ecg',
    'electroencephalogram': 'eeg', 'magnetic resonance imaging': 'mri',
    'computed tomography': 'ct scan', 'computerized tomography': 'ct scan',
    'healthcare associated infection': 'health care associated infection',
    'healthcare associated infections': 'health care associated infection',
    'nosocomial infection': 'health care associated infection',
    'nosocomial infections': 'health care associated infection',
    'pressure ulcer': 'pressure injury', 'pressure ulcers': 'pressure injury',
    'bed sore': 'pressure injury', 'bed sores': 'pressure injury',
    'bedsores': 'pressure injury', 'bedbound': 'bedridden',
    'healthcare': 'health care', 'per os': 'oral route',
    'active assist range of motion exercise': 'active assist range of motion',
    'sympathomimetics': 'adrenergic agonist',
    'laryngotracheobronchitis': 'croup',
    'spontaneous abortion': 'early pregnancy loss',
    'inflammatory phase of wound healing': 'inflammatory phase',
    'maladaptive coping responses': 'maladaptive coping',
    'serosanguinous drainage': 'serosanguineous',
    'prescriptions': 'prescription',
}

def canonical_term(value):
    key = normalize(clean_term(value))
    for a,b in [('anaemia','anemia'),('haemo','hemo'),('oedema','edema'),('apnoea','apnea'),('paediatric','pediatric'),('tumour','tumor'),('behaviour','behavior'),('healthcare','health care')]:
        key = key.replace(a,b)
    singulars = {'diseases':'disease','disorders':'disorder','syndromes':'syndrome','infections':'infection','reactions':'reaction','inhibitors':'inhibitor','blockers':'blocker','agents':'agent','medications':'medication','mechanisms':'mechanism','signs':'sign','symptoms':'symptom','interventions':'intervention','changes':'change','stages':'stage','injuries':'injury','ulcers':'ulcer','fractures':'fracture','cells':'cell','nerves':'nerve','muscles':'muscle','receptors':'receptor'}
    key = ' '.join(singulars.get(w,w) for w in key.split())
    return ALIASES.get(key,key)

def clean_definition(value):
    value = re.sub(r'[\u200b-\u200d\ufeff]', '', value)
    value = re.sub(r'\(\s*(?:Chapter|Table|Section)\s+[^)]*\)', '', value, flags=re.I)
    value = re.sub(r'\[\s*\d+(?:[,\s–-]+\d+)*\s*\]', '', value)
    value = re.sub(r'\s+', ' ', value).strip()
    value = re.sub(r'\s+([,.;:])', r'\1', value)
    value = re.sub(r'\s*\)\s*\(\s*$', '', value)
    value = re.sub(r'\(\s*\)|\[\s*\]', '', value)
    value = re.sub(r'([.;])[,;]+$', r'\1', value)
    value = value.rstrip(',; ')
    return value.strip()

FOREIGN = re.compile(r'(?:\b(?:Wisconsin|Medicare|Medicaid|HIPAA|NCLEX|NANDA|United States|federal law|state board|Nurse Practice Act|state law|Affordable Care|Americans with Disabilities|NCSBN|American Nurses Association|ANA Code|ANA Standards|Joint Commission|National Patient Safety Goals|Sentinel Event Alert|American Psychiatric Association)\b|\bU\.S\.)', re.I)
BAD = re.compile(r'\b(NANDA|ICNP|ICD-10|DSM-[IV5]|DSM-5|defined by the ANA|according to the ANA)\b', re.I)

def choose_definitions():
    raw = json.loads((WORK/'reference-definitions.json').read_text(encoding='utf-8'))
    excluded = collections.Counter()
    groups = collections.defaultdict(list)
    for original in raw:
        fact = {**original, 'term': clean_term(original['term']), 'definition': clean_definition(original['definition'])}
        term, definition = fact['term'], fact['definition']
        key = canonical_term(term)
        if not 2 <= len(term) <= 100 or len(term.split()) > 12:
            excluded['label'] += 1; continue
        if not 28 <= len(definition) <= 1000 or len(definition.split()) < 6:
            excluded['definition_length'] += 1; continue
        if FOREIGN.search(term+' '+definition) or BAD.search(term+' '+definition):
            excluded['foreign_or_proprietary'] += 1; continue
        if re.search(r'\b'+re.escape(normalize(term))+r'\b', normalize(definition)):
            excluded['answer_in_definition'] += 1; continue
        if re.match(r'^(see|same as|also called|also known as)\b', definition, re.I):
            excluded['redirect'] += 1; continue
        if '\ufffd' in term+definition or definition.count('(') != definition.count(')'):
            excluded['malformed_text'] += 1; continue
        groups[key].append(fact)
    chosen = []
    seen_definitions = set()
    for key, options in sorted(groups.items()):
        # The chapter occurrence supplies useful topic context. A longer glossary
        # duplicate is not a second learning objective.
        options.sort(key=lambda x: ('glossary' not in x['chapter'].casefold(), int(x['year']), min(len(x['definition']), 500)), reverse=True)
        fact = options[0]
        dk = normalize(fact['definition'])
        if dk in seen_definitions:
            excluded['identical_meaning'] += 1; continue
        seen_definitions.add(dk)
        chosen.append({**fact, 'canonical': key, 'kind': 'definition', 'aliases': sorted({clean_term(x['term']) for x in options})})
    (WORK/'definition-candidates.json').write_text(json.dumps(chosen, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Usable distinct definition concepts:', len(chosen), 'excluded occurrences:', dict(excluded))
    print('By book:', dict(collections.Counter(x['bookSet'] for x in chosen)))
    return chosen

def element_text(element):
    if element is None: return ''
    def prose(node):
        parts=[node.text or '']
        for child in node:
            if child.tag in ('break','br'):
                parts.extend(['; ',child.tail or '']);continue
            block=child.tag in ('p','list','list-item','def','title')
            parts.extend([' ' if block else '',prose(child),' ' if block else '',child.tail or ''])
        return ''.join(parts)
    return re.sub(r'\s+', ' ', prose(element)).strip()

def cell_text(element):
    paragraphs=element.findall('.//p')
    if len(paragraphs)>1:
        return '; '.join(element_text(p).rstrip(' ;') for p in paragraphs)
    return element_text(element)

def remove_reference_markers(root):
    for parent in root.iter():
        for child in list(parent):
            if child.tag in ('xref', 'sup', 'fn', 'table-wrap-foot'):
                siblings = list(parent)
                index = siblings.index(child)
                tail = child.tail or ''
                parent.remove(child)
                if index: siblings[index-1].tail = (siblings[index-1].tail or '') + tail
                else: parent.text = (parent.text or '') + tail

def inventory_tables():
    books = {x['set']: x for x in json.loads((WORK/'manifest.json').read_text(encoding='utf-8'))}
    tables = []
    for path in sorted(WORK.glob('openrn*-*.xml')):
        book_set = path.stem.rsplit('-', 1)[0]
        if book_set not in books: continue
        root = ET.fromstring(path.read_bytes())
        for element in root.iter(): element.tag = element.tag.split('}')[-1]
        remove_reference_markers(root)
        for record in root.findall('.//record'):
            identifier = element_text(record.find('header/identifier')).rsplit(':', 1)[-1]
            meta = record.find('metadata')
            if meta is None: continue
            if not any('creativecommons.org/licenses/by/4.0' in ET.tostring(e, encoding='unicode') for e in meta.findall('.//book-meta/permissions/license')): continue
            chapter = element_text(meta.find('.//book-part-meta/title-group/title'))
            for table in meta.findall('.//table-wrap'):
                rows = table.findall('.//tbody/tr')
                headers = [[element_text(c) for c in row] for row in table.findall('.//thead/tr')]
                cells = [[cell_text(c) for c in row] for row in rows]
                simple = all(int(c.attrib.get('rowspan', '1')) == 1 and int(c.attrib.get('colspan', '1')) == 1 for row in rows for c in row)
                if not headers or len(rows) < 4: continue
                tables.append({'bookSet': book_set, 'book': books[book_set]['title'], 'year': books[book_set]['year'], 'source': f'https://www.ncbi.nlm.nih.gov/books/NBK{identifier}/', 'sourceId': identifier, 'chapter': chapter, 'entryId': table.attrib.get('id', ''), 'title': clean_definition(element_text(table.find('caption'))), 'headers': headers, 'rows': cells, 'simple': simple})
    (WORK/'reference-tables.json').write_text(json.dumps(tables, ensure_ascii=False, indent=2), encoding='utf-8')
    lines = [f"{i:03} {len(t['rows']):3} {t['bookSet']:14} {'simple' if t['simple'] else 'SPANS ':6} {t['title']} | {t['headers']}" for i,t in enumerate(tables)]
    (WORK/'table-inventory.txt').write_text('\n'.join(lines), encoding='utf-8')
    print('Reference tables with >=4 rows:', len(tables), 'rows:', sum(len(t['rows']) for t in tables))
    return tables

# One column per objective. These are explanatory reference tables, never the
# books' review questions, sample exams, NANDA definitions, or proprietary scales.
# A second column is used only when it tests a different relation (e.g. a vitamin's
# function versus its deficiency), not as a paraphrase of the same definition.
TABLE_COLUMNS = {
    6:[1], 7:[1,3], 8:[1,3], 9:[1,3], 11:[1], 12:[1], 17:[3], 18:[1,3],
    20:[1], 21:[1], 25:[2], 31:[1], 32:[1], 33:[1], 35:[2], 39:[2],
    48:[1], 49:[1], 50:[1], 55:[2], 59:[1], 60:[1], 62:[1], 63:[1],
    64:[1], 65:[1], 67:[1], 68:[2], 70:[2], 73:[2], 75:[2], 76:[1],
    79:[1], 80:[1,2], 82:[1], 92:[1], 96:[1], 98:[1], 99:[1], 100:[1],
    101:[1], 104:[1], 108:[2], 111:[1,3], 114:[1], 121:[3], 127:[2],
    148:[1], 149:[1], 151:[1,2], 154:[2], 155:[2], 164:[2], 165:[2],
    173:[1], 180:[2], 187:[2], 190:[2], 198:[2], 199:[2], 200:[2],
    201:[2], 202:[2], 206:[2], 207:[1], 217:[1], 227:[1], 236:[2],
    239:[1], 240:[2], 241:[1], 242:[1], 246:[2,3], 247:[2,3],
    248:[2], 249:[2], 252:[3], 259:[1], 261:[1], 269:[2], 271:[1],
    276:[1], 278:[2], 283:[1], 290:[1,2], 296:[1], 301:[1], 302:[1],
    303:[1], 304:[1], 306:[1], 315:[1], 316:[1], 317:[1], 321:[1],
    323:[1], 325:[3], 330:[1], 332:[1], 337:[1], 338:[1], 343:[1],
    351:[1], 353:[1], 360:[1], 361:[1], 366:[2], 368:[2], 369:[2],
    370:[1,2,3], 371:[1,2], 374:[1], 380:[1], 381:[2], 387:[1],
    390:[1], 396:[1], 405:[1], 413:[1], 414:[1], 419:[2], 426:[1,2],
    427:[1], 428:[1,2], 429:[2], 431:[3], 432:[2], 456:[1], 457:[1],
    463:[1,2], 465:[1], 466:[1], 467:[1], 470:[1], 478:[1], 479:[1],
    481:[1], 484:[1]
}

def prepare_table_facts(tables, definitions):
    facts = []
    excluded = collections.Counter()
    # Identical relations from a second book are not new objectives.
    seen = {normalize(x['definition']) for x in definitions}
    for table_index, columns in TABLE_COLUMNS.items():
        table = tables[table_index]
        if not table['simple'] or len(table['headers']) != 1:
            excluded['complex_table'] += 1; continue
        headers = table['headers'][0]
        for column in columns:
            if column >= len(headers): raise ValueError((table_index,column))
            pool = []
            for row_index,row in enumerate(table['rows']):
                if len(row) != len(headers):
                    excluded['non_rectangular'] += 1; continue
                term = clean_term(row[0]); relation = clean_definition(row[column])
                term = re.sub(r'\s*\d+$', '', term).strip() if re.search(r'\]\s*\d+$',term) else term
                # Strip only the tested term when it begins its own explanation.
                relation = re.sub(r'^'+re.escape(term)+r'\s*[:–—-]\s*', '', relation, flags=re.I)
                if not 2<=len(term)<=100 or not 25<=len(relation)<=850 or len(relation.split())<5:
                    excluded['length'] += 1; continue
                if FOREIGN.search(term+' '+relation) or BAD.search(term+' '+relation):
                    excluded['foreign_or_proprietary'] += 1; continue
                if re.search(r'\b'+re.escape(normalize(term))+r'\b', normalize(relation)):
                    excluded['answer_leak'] += 1; continue
                if '\ufffd' in term+relation:
                    excluded['encoding'] += 1; continue
                if normalize(relation) in seen:
                    excluded['duplicate_relation'] += 1; continue
                fact = {**{k:table[k] for k in ('book','bookSet','year','chapter','source','sourceId','entryId')}, 'term':term, 'definition':relation, 'canonical':canonical_term(term), 'kind':'comparison', 'relation':headers[column], 'keyHeader':headers[0] or 'entry', 'tableTitle':re.sub(r'\[\s*\]','',table['title']).strip(' ,'), 'tableIndex':table_index, 'column':column, 'row':row_index, 'poolId':table['sourceId']+':'+table['entryId']+':'+str(column), 'license':'https://creativecommons.org/licenses/by/4.0/', 'authors':'Open Resources for Nursing; editors Kimberly Ernstmeyer and Elizabeth Christman; Chippewa Valley Technical College / WisTech Open'}
                pool.append(fact)
            # Four unambiguous alternatives must exist in the same comparison.
            if len({x['canonical'] for x in pool}) < 4:
                excluded['small_comparison'] += len(pool); continue
            for fact in pool:
                seen.add(normalize(fact['definition']))
                facts.append(fact)
    (WORK/'comparison-candidates.json').write_text(json.dumps(facts, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Usable table relations:', len(facts), 'excluded:', dict(excluded))
    return facts

if __name__ == '__main__':
    definitions = choose_definitions()
    tables = inventory_tables()
    prepare_table_facts(tables, definitions)
