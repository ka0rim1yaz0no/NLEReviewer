"""Correct documented reference typos while preserving IDs and answer positions."""
from pathlib import Path
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
qpath=ROOT/'concept-questions.json';epath=ROOT/'concept-evidence.json'
questions=json.loads(qpath.read_text(encoding='utf-8'));facts=json.loads(epath.read_text(encoding='utf-8'));by_id={f['id']:f for f in facts}
corrections=json.loads((ROOT/'terminology-corrections.json').read_text(encoding='utf-8'))
changed=set()
for correction in corrections:
    f=by_id[correction['id']]
    assert f['term'] in (correction['previousTerm'],correction['term'])
    # Check the publisher's main text, independent of its misspelled glossary.
    source_text=''
    for path in (ROOT/'outputs/openrn').glob(f["bookSet"]+'-*.xml'):
        root=ET.fromstring(path.read_bytes())
        for element in root.iter():element.tag=element.tag.split('}')[-1]
        for record in root.findall('.//record'):
            identifier=''.join(record.find('header/identifier').itertext()).rsplit(':',1)[-1]
            if identifier==f['sourceId']:source_text=''.join(record.itertext())
    assert correction['term'].casefold() in source_text.casefold(),'Corrected spelling missing from reference text'
    for q in questions:
        if any(o['referenceId']==f['id'] for o in q['options']):
            changed.add(q['id'])
            for field in ('stem','rationale','keyPoint'):q[field]=q[field].replace(correction['previousTerm'],correction['term'])
            for option in q['options']:
                option['text']=option['text'].replace(correction['previousTerm'],correction['term'])
                option['rationale']=option['rationale'].replace(correction['previousTerm'],correction['term'])
    f['term']=correction['term'];f['canonical']=re.sub('[^a-z0-9]+',' ',correction['term'].casefold()).strip();f['terminologyCorrection']=correction
for path,records in [(qpath,questions),(epath,facts)]:path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
path=ROOT/'concept-review-report.json';report=json.loads(path.read_text(encoding='utf-8'));report['questionFileSha256']=hashlib.sha256(qpath.read_bytes()).hexdigest();report['evidenceFileSha256']=hashlib.sha256(epath.read_bytes()).hexdigest();report['terminologyCorrections']=len(corrections);report['terminologyCorrectedQuestionIds']=sorted(changed);path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'Corrected {len(corrections)} source typo in {len(changed)} questions; IDs, option order, and answer positions preserved.')
