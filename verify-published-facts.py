"""Check frozen source facts, keys, and alternatives against official XML.

Documented NCI and glossary spelling corrections are checked explicitly. This
does not substitute for an independent clinical review of the source claims.
"""
from pathlib import Path
import hashlib,importlib.util,json,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('prepare',root/'prepare-openrn.py')
prepare=importlib.util.module_from_spec(spec);spec.loader.exec_module(prepare)
facts=json.loads((root/'concept-evidence.json').read_text(encoding='utf-8'))
questions=json.loads((root/'concept-questions.json').read_text(encoding='utf-8'))
records={};entries={};sources=[];errors=[]
for path in sorted((root/'outputs/openrn').glob('openrn*-*.xml')):
 raw=path.read_bytes();tree=ET.fromstring(raw)
 for element in tree.iter():element.tag=element.tag.split('}')[-1]
 for record in tree.findall('.//record'):
  identifier=prepare.element_text(record.find('header/identifier')).rsplit(':',1)[-1]
  records[identifier]=record
  prepare.remove_reference_markers(record)
  for element in record.iter():
   if element.attrib.get('id'):entries[(identifier,element.attrib['id'])]=element
 sources.append({'file':path.name,'sha256':hashlib.sha256(raw).hexdigest()})
def comparable(text):return re.sub(r'\s+',' ',text).strip().casefold()
corrected=[];formatting=[]
for fact in facts:
 record=records.get(fact['sourceId'])
 if record is None:errors.append([fact['id'],'missing XML source']);continue
 if not any('creativecommons.org/licenses/by/4.0' in ET.tostring(e,encoding='unicode') for e in record.findall('.//book-meta/permissions/license')):errors.append([fact['id'],'missing source license'])
 entry=entries.get((fact['sourceId'],fact['entryId']))
 if entry is None:errors.append([fact['id'],'missing entry']);continue
 if fact.get('sourceCorrection'):
  correction=fact['sourceCorrection']
  if fact['definition']!=correction['definition'] or fact['source']!=correction['source']:errors.append([fact['id'],'documented primary-source correction differs'])
  corrected.append({'id':fact['id'],'kind':'primary-source correction','source':fact['source']});continue
 if fact['kind']=='definition':
  term=prepare.clean_term(prepare.element_text(entry.find('term')))
  definition=prepare.clean_definition(prepare.element_text(entry.find('def')))
 else:
  row=entry.findall('.//tbody/tr')[fact['row']]
  term=prepare.clean_term(prepare.cell_text(row[0]))
  definition=prepare.clean_definition(prepare.cell_text(row[fact['column']]))
  definition=re.sub(r'^'+re.escape(term)+r'\s*[:–—-]\s*','',definition,flags=re.I)
 if fact.get('terminologyCorrection'):
  correction=fact['terminologyCorrection']
  if term!=correction['previousTerm'] or fact['term']!=correction['term'] or correction['term'].casefold() not in ''.join(record.itertext()).casefold():errors.append([fact['id'],'spelling correction cannot be verified'])
  corrected.append({'id':fact['id'],'kind':'publisher main-text spelling','source':fact['source']})
 elif comparable(term)!=comparable(fact['term']):
  if re.sub(r'[^a-z0-9]','',term.casefold())==re.sub(r'[^a-z0-9]','',fact['term'].casefold()):formatting.append({'id':fact['id'],'sourceTerm':term,'publishedTerm':fact['term']})
  else:errors.append([fact['id'],'term mismatch',term,fact['term']])
 if comparable(definition)!=comparable(fact['definition']):errors.append([fact['id'],'definition mismatch',definition,fact['definition']])
by_id={f['id']:f for f in facts}
for q in questions:
 fact=by_id[q['conceptId']]
 if fact['definition'] not in q['stem']:errors.append([q['id'],'prompt does not contain its source fact'])
 if q['options'][q['correctIndex']]['referenceId']!=fact['id']:errors.append([q['id'],'key reference differs'])
 if q['options'][q['correctIndex']]['rationale']!=q['rationale']:errors.append([q['id'],'key and rationale disagree'])
 for index,option in enumerate(q['options']):
  f=by_id.get(option['referenceId'])
  if not f or option['text']!=f['term'] or f['definition'] not in option['rationale'] or option['source']!=f['source']:errors.append([q['id'],index,'option source fact differs'])
report={'factsChecked':len(facts),'questionKeysChecked':len(questions),'choiceExplanationsChecked':len(questions)*4,'sourceXmlFiles':sources,'documentedExceptions':corrected,'formattingDifferences':formatting,'mismatches':errors,'independentClinicianApproval':False,'scope':'Frozen source-text, key, and rationale consistency; not independent clinical certification.'}
path=root/'outputs/device-and-content-review/published-fact-verification.json'
path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='sourceXmlFiles'},ensure_ascii=True))
if errors:raise SystemExit(1)
