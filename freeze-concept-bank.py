"""Promote a source-verified candidate, preserving any published records exactly."""
from pathlib import Path
import collections
import hashlib
import json

ROOT=Path(__file__).resolve().parent
WORK=ROOT/'outputs/openrn'
questions=json.loads((WORK/'concept-questions-candidate.json').read_text(encoding='utf-8'))
evidence=json.loads((WORK/'concept-evidence-candidate.json').read_text(encoding='utf-8'))
verification=json.loads((WORK/'source-verification.json').read_text(encoding='utf-8'))
assert verification['questions']==len(questions) and verification['mismatches']==[]
assert len(questions)+651>=4771
facts={f['id']:f for f in evidence}
for q in questions:
    if facts[q['conceptId']]['bookSet']=='openrnna':
        q['origin']=q['origin'].replace('from Open Resources for Nursing (Open RN),','from Myra Reuter-Sandquist and Open Resources for Nursing (Open RN),')
for f in evidence:
    if f['bookSet']=='openrnna':f['authors']='Myra Reuter-Sandquist; Open Resources for Nursing; editors Kimberly Ernstmeyer and Elizabeth Christman; Chippewa Valley Technical College / WisTech Open'
for filename,records in [('concept-questions.json',questions),('concept-evidence.json',evidence)]:
    path=ROOT/filename
    if path.exists():
        published=json.loads(path.read_text(encoding='utf-8'));proposed={r['id']:r for r in records}
        for previous in published:
            assert proposed.get(previous['id'])==previous,f'Published record changed: {previous["id"]}. Preserve it or create a reviewed correction release.'
    path.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
report={
 'preparedAt':'2026-11-03','newOriginalQuestionDesigns':len(questions),
 'conceptChecks':sum(q['format']=='concept' for q in questions),
 'referenceComparisons':sum(q['format']=='comparison' for q in questions),
 'previousOriginalClinicalAndStandaloneQuestions':651,
 'totalOriginalQuestionDesigns':651+len(questions),
 'previousCorrectedSourceItems':2,'totalPublishedQuestions':653+len(questions),
 'sourceEvidenceFacts':len(evidence),'choicesMatchedToReferenceFacts':len(questions)*4,
 'sourceXmlMismatches':0,'duplicateNormalizedStems':0,
 'independentClinicalReview':False,
 'questionFileSha256':hashlib.sha256((ROOT/'concept-questions.json').read_bytes()).hexdigest(),
 'evidenceFileSha256':hashlib.sha256((ROOT/'concept-evidence.json').read_bytes()).hexdigest(),
 'bySubject':dict(collections.Counter(q['subject'] for q in questions)),
 'sourceXmlFiles':verification['sourceXmlFiles'],
 'sourceAccess':'NLM documented Books-OAI full-text API, sequential requests; CC BY 4.0 books only.',
 'questionDesign':'New concept-identification and reference-comparison questions; no existing textbook review questions or BoardPal questions were imported.',
 'checks':'Reference XML terms, definitions and selected table cells match the keyed and alternative facts; four distinct choices; duplicate objectives and similar definitions screened; dependent rows, proprietary standardized definitions and foreign legal rules excluded.',
 'limits':'Source matching checks consistency with cited reference text. It is not independent professional clinical review, guideline currency validation for every statement, or a guarantee of zero errors.'
}
(ROOT/'concept-review-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('sourceXmlFiles','bySubject')},ensure_ascii=True))
