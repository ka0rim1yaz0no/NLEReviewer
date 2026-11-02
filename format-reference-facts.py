"""Preserve reference line breaks as separators without changing choices/keys."""
from pathlib import Path
import hashlib
import importlib.util
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('prep',ROOT/'prepare-openrn.py')
prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(prep)
qpath=ROOT/'concept-questions.json';epath=ROOT/'concept-evidence.json'
questions=json.loads(qpath.read_text(encoding='utf-8'));facts=json.loads(epath.read_text(encoding='utf-8'))
entries={}
for path in sorted((ROOT/'outputs/openrn').glob('openrn*-*.xml')):
    root=ET.fromstring(path.read_bytes())
    for element in root.iter():element.tag=element.tag.split('}')[-1]
    prep.remove_reference_markers(root)
    for record in root.findall('.//record'):
        identifier=prep.element_text(record.find('header/identifier')).rsplit(':',1)[-1]
        for element in record.iter():
            if element.attrib.get('id'):entries[(identifier,element.attrib['id'])]=element
changed=0
squash=lambda s:re.sub(r'[^a-z0-9]','',s.casefold())
for fact in facts:
    if fact.get('sourceCorrection'):continue
    entry=entries[(fact['sourceId'],fact['entryId'])]
    if fact['kind']=='definition':description=prep.clean_definition(prep.element_text(entry.find('def')))
    else:
        row=entry.findall('.//tbody/tr')[fact['row']]
        description=prep.clean_definition(prep.cell_text(row[fact['column']]))
        description=re.sub(r'^'+re.escape(fact['term'])+r'\s*[:–—-]\s*','',description,flags=re.I)
    assert squash(description)==squash(fact['definition']),(fact['id'],'Formatting would change reference words',description,fact['definition'])
    if description!=fact['definition']:
        old=fact['definition'];fact['definition']=description;changed+=1
        for q in questions:
            if q['conceptId']==fact['id']:
                for field in ('stem','rationale','keyPoint'):q[field]=q[field].replace(old,description)
            for option in q['options']:
                if option['referenceId']==fact['id']:option['rationale']=option['rationale'].replace(old,description)
by_id={f['id']:f for f in facts}
for q in questions:
    f=by_id[q['conceptId']]
    if q['format']=='comparison':
        q['stem']=f'Which entry in the reference comparison “{f["tableTitle"]}” matches this information?\n\n{f["relation"]}: {f["definition"]}'
        q['rationale']=f'The matching entry is {f["term"]}. {f["relation"]}: {f["definition"]}'
    for option in q['options']:
        g=by_id[option['referenceId']]
        if g['id']==f['id']:option['rationale']=q['rationale']
        else:
            ending='' if g['definition'].endswith(('.','!','?')) else '.'
            option['rationale']=f'{g["term"]}: {g["definition"]}{ending} The description in the question instead matches {f["term"]}.'
for path,records in [(qpath,questions),(epath,facts)]:path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
report_path=ROOT/'concept-review-report.json';report=json.loads(report_path.read_text(encoding='utf-8'))
report['questionFileSha256']=hashlib.sha256(qpath.read_bytes()).hexdigest();report['evidenceFileSha256']=hashlib.sha256(epath.read_bytes()).hexdigest()
report['formattingReview']='XML line-break elements are preserved as readable separators. Comparison prompts and alternative explanations were copyedited before production deployment. No IDs, option labels, order, or key positions were changed.'
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'Formatted {changed} reference descriptions; copyedited {len(questions)} questions; IDs, choices and key positions preserved.')
