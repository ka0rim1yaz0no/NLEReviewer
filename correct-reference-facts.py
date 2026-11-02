"""Apply documented primary-reference corrections without shuffling any choices."""
from pathlib import Path
import hashlib
import json
import collections

ROOT=Path(__file__).resolve().parent
qpath=ROOT/'concept-questions.json';epath=ROOT/'concept-evidence.json'
questions=json.loads(qpath.read_text(encoding='utf-8'))
evidence=json.loads(epath.read_text(encoding='utf-8'))
facts={f['id']:f for f in evidence}
catalog={t['slug']:t for t in json.loads((ROOT/'topic-catalog.json').read_text(encoding='utf-8'))}
corrections=json.loads((ROOT/'reference-corrections.json').read_text(encoding='utf-8'))
changed=[]
for correction in corrections:
    fact=facts[correction['id']]
    assert fact['term']==correction['term']
    assert fact['definition'] in (correction['previousDefinition'],correction['definition'])
    for q in questions:
        touched=False
        for option in q['options']:
            if option['referenceId']==fact['id']:
                option['rationale']=option['rationale'].replace(correction['previousDefinition'],correction['definition'])
                option['source']=correction['source'];touched=True
        if q['conceptId']==fact['id']:
            q['stem']=q['stem'].replace(correction['previousDefinition'],correction['definition'])
            q['stem']='In cancer treatment terminology, which concept matches this description?\n\n'+correction['definition']
            q['rationale']=q['rationale'].replace(correction['previousDefinition'],correction['definition'])
            q['keyPoint']=q['keyPoint'].replace(correction['previousDefinition'],correction['definition'])
            q['source']=correction['source']
            topic=catalog[correction['topicSlug']];q['subject']=topic['subject'];q['topic']=topic['name']
            q['origin']='Original NLE Reviewer concept check. A reference-definition error was corrected before production deployment using the National Cancer Institute Dictionary of Cancer Terms. The revised mechanism description is newly worded; the four-choice design is unchanged. This question was initially constructed from Open RN Medical Terminology, 2e (2024), edited by Kimberly Ernstmeyer and Elizabeth Christman, Chippewa Valley Technical College / WisTech Open, under CC BY 4.0. No author endorsement is implied.'
            q['sourceTopic']='National Cancer Institute Dictionary of Cancer Terms; documented correction of Open RN reference wording'
        if touched:changed.append(q['id'])
    fact['definition']=correction['definition'];fact['source']=correction['source']
    fact['sourceCorrection']=correction
    fact['topicSlug']=correction['topicSlug'];fact['subject']=catalog[correction['topicSlug']]['subject'];fact['topic']=catalog[correction['topicSlug']]['name']
for path,records in [(qpath,questions),(epath,evidence)]:path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
report_path=ROOT/'concept-review-report.json';report=json.loads(report_path.read_text(encoding='utf-8'))
report['questionFileSha256']=hashlib.sha256(qpath.read_bytes()).hexdigest()
report['evidenceFileSha256']=hashlib.sha256(epath.read_bytes()).hexdigest()
report['primaryReferenceCorrections']=len(corrections);report['correctedQuestionIds']=sorted(set(changed))
report['sourceVerificationNote']='The initial reference extraction matched its XML. Subsequent editorial review identified one error in the source wording. The corrected fact and every keyed/alternative occurrence use the documented NCI reference; see reference-corrections.json. Source matching is not independent clinical approval.'
report['bySubject']=dict(collections.Counter(q['subject'] for q in questions))
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'Applied {len(corrections)} documented correction(s) to {len(set(changed))} questions; all IDs, choice order, and key positions preserved.')
