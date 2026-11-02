"""Independently check candidate keys/explanations against cached source XML."""
from pathlib import Path
import collections
import hashlib
import importlib.util
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
WORK=ROOT/'outputs/openrn'
spec=importlib.util.spec_from_file_location('prep',ROOT/'prepare-openrn.py')
prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(prep)
questions=json.loads((WORK/'concept-questions-candidate.json').read_text(encoding='utf-8'))
facts=json.loads((WORK/'concept-evidence-candidate.json').read_text(encoding='utf-8'))
evidence={f['id']:f for f in facts}
records={};sources=[];entries={};licenses={}
for path in sorted(WORK.glob('openrn*-*.xml')):
    raw=path.read_bytes();root=ET.fromstring(raw)
    for element in root.iter():element.tag=element.tag.split('}')[-1]
    for record in root.findall('.//record'):
        identifier=prep.element_text(record.find('header/identifier')).rsplit(':',1)[-1]
        if identifier:
            records[identifier]=record
    sources.append({'file':path.name,'sha256':hashlib.sha256(raw).hexdigest()})
for identifier,record in records.items():
    licenses[identifier]=any('creativecommons.org/licenses/by/4.0' in ET.tostring(e,encoding='unicode') for e in record.findall('.//book-meta/permissions/license'))
    prep.remove_reference_markers(record)
    for element in record.iter():
        if 'id' in element.attrib:entries[(identifier,element.attrib['id'])]=element
errors=[]
for fact in facts:
    record=records.get(fact['sourceId'])
    if record is None:errors.append((fact['id'],'missing XML record'));continue
    licensed=licenses[fact['sourceId']]
    if not licensed:errors.append((fact['id'],'no CC BY 4.0 license'))
    entry=entries.get((fact['sourceId'],fact['entryId']))
    if entry is None:errors.append((fact['id'],'missing reference entry'));continue
    if fact['kind']=='definition':
        term=prep.clean_term(prep.element_text(entry.find('term')))
        description=prep.clean_definition(prep.element_text(entry.find('def')))
    else:
        rows=entry.findall('.//tbody/tr')
        row=rows[fact['row']]
        term=prep.clean_term(prep.cell_text(row[0]))
        description=prep.clean_definition(prep.cell_text(row[fact['column']]))
        description=re.sub(r'^'+re.escape(term)+r'\s*[:–—-]\s*','',description,flags=re.I)
    if prep.normalize(term)!=prep.normalize(fact['term']):errors.append((fact['id'],'source term mismatch',term,fact['term']))
    if prep.normalize(description)!=prep.normalize(fact['definition']):errors.append((fact['id'],'source description mismatch',description,fact['definition']))

assert len({q['id'] for q in questions})==len(questions)
assert len({prep.normalize(q['stem']) for q in questions})==len(questions)
assert len({q['conceptId'] for q in questions})==len(questions)
for q in questions:
    fact=evidence[q['conceptId']]
    assert len(q['options'])==4
    assert fact['definition'] in q['stem']
    assert q['options'][q['correctIndex']]['referenceId']==fact['id']
    assert q['rationale']==q['options'][q['correctIndex']]['rationale']
    for option in q['options']:
        source=evidence[option['referenceId']]
        assert option['text']==source['term'] and source['definition'] in option['rationale']
        assert option['source']==source['source']
        if q['format']=='comparison':assert source['poolId']==fact['poolId']

report={'questions':len(questions),'choicesWithMatchedReferenceFacts':4*len(questions),'evidenceFacts':len(facts),'sourceXmlFiles':sources,'mismatches':errors,'independentClinicalReview':False}
(WORK/'source-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='sourceXmlFiles'} if len(errors)<3 else {'questions':len(questions),'mismatches':len(errors),'firstMismatches':errors[:3]},ensure_ascii=True))
if errors:raise SystemExit('Source verification failed. Do not publish these candidates.')
