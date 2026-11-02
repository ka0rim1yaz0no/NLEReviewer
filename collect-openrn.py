"""Retrieve licensed reference text through NLM's documented Books-OAI API.

Never crawls the Bookshelf website or obtains BoardPal questions. Requests are
sequential, as required by Books-OAI. Cached XML and extracted reference facts
stay in outputs/. This is reference preparation, not a question-bank import.
"""
from pathlib import Path
import collections
import gzip
import hashlib
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent
DEST=ROOT/'outputs/openrn'
DEST.mkdir(parents=True,exist_ok=True)
BOOKS=[
 ('openrnnf2e','Nursing Fundamentals, 2e','2024'),
 ('openrnmt2e','Medical Terminology, 2e','2024'),
 ('openrnha','Health Alterations','2024'),
 ('openrnnhp','Nursing Health Promotion','2025'),
 ('openrnmhcc2','Mental Health and Community Concepts, 2e','2025'),
 ('openrnnp','Nursing Pharmacology, 2e','2023'),
 ('openrnnmpc2e','Nursing Management and Professional Concepts, 2e','2024'),
 ('openrnas','Nursing Advanced Skills','2023'),
 ('openrnns2e','Nursing Skills, 2e','2023'),
 ('openrnna','Nursing Assistant','2022'),
]
def strip_namespaces(root):
 for element in root.iter():element.tag=element.tag.split('}')[-1]
 return root
def text(element):
 if element is None:return ''
 def prose(node):
  parts=[node.text or '']
  for child in node:
   if child.tag in ('break','br'):
    parts.extend(['; ',child.tail or '']);continue
   block=child.tag in ('p','list','list-item','def','title')
   parts.extend([' ' if block else '',prose(child),' ' if block else '',child.tail or ''])
  return ''.join(parts)
 return re.sub(r'\s+',' ',prose(element)).strip()
def request(params,path):
 if path.exists():return strip_namespaces(ET.fromstring(path.read_bytes()))
 url='https://api.ncbi.nlm.nih.gov/lit/oai/books/?'+urllib.parse.urlencode(params)
 req=urllib.request.Request(url,headers={'Accept-Encoding':'gzip, deflate','User-Agent':'NLEReviewer-reference-preparation/1.0'})
 with urllib.request.urlopen(req,timeout=60) as response:
  data=response.read()
  if response.headers.get('Content-Encoding')=='gzip':data=gzip.decompress(data)
 root=strip_namespaces(ET.fromstring(data))
 error=root.find('error')
 if error is not None:raise RuntimeError(f'{url}: {error.attrib} {text(error)}')
 path.write_bytes(data)
 return root
facts=[];manifest=[]
for slug,title,year in BOOKS:
 token=None;page=0;count=0
 while True:
  params={'verb':'ListRecords','set':slug,'metadataPrefix':'nbk_ftext'} if not token else {'verb':'ListRecords','resumptionToken':token}
  root=request(params,DEST/f'{slug}-{page}.xml')
  for record in root.findall('.//record'):
   header=record.find('header')
   if header is None or header.attrib.get('status')=='deleted':continue
   meta=record.find('metadata')
   if meta is None:continue
   license_elements=meta.findall('.//book-meta/permissions/license')
   if not any('creativecommons.org/licenses/by/4.0' in ET.tostring(e,encoding='unicode') for e in license_elements):continue
   record_id=text(header.find('identifier')).rsplit(':',1)[-1]
   chapter=text(meta.find('.//book-part-meta/title-group/title'))
   if not chapter:chapter=text(meta.find('.//book-title'))
   for entry in meta.findall('.//def-item'):
    term=text(entry.find('term'));definition=entry.find('def')
    if not term or definition is None:continue
    # Chapter links/citation markers are not part of a concept definition.
    for parent in definition.iter():
     for child in list(parent):
      if child.tag in ('xref','sup'):
       siblings=list(parent);index=siblings.index(child)
       tail=child.tail or '';parent.remove(child)
       if index:siblings[index-1].tail=(siblings[index-1].tail or '')+tail
       else:parent.text=(parent.text or '')+tail
    definition_text=text(definition)
    definition_text=re.sub(r'\(\s*\)|\[\s*\]','',definition_text).strip()
    if not definition_text:continue
    facts.append({'term':term,'definition':definition_text,'book':title,'bookSet':slug,'year':year,'chapter':chapter,'source':f'https://www.ncbi.nlm.nih.gov/books/NBK{record_id}/','sourceId':record_id,'entryId':entry.attrib.get('id',''),'license':'https://creativecommons.org/licenses/by/4.0/','authors':'Open Resources for Nursing; editors Kimberly Ernstmeyer and Elizabeth Christman; Chippewa Valley Technical College / WisTech Open'})
    count+=1
  resume=root.find('.//resumptionToken');token=resume.text if resume is not None else None
  page+=1
  if not token:break
  # The service already percent-encodes its continuation token.
  token=urllib.parse.unquote(token)
 manifest.append({'set':slug,'title':title,'year':year,'pages':page,'definitions':count})
 print(f'{title}: {count} reference definitions, {page} sequential requests',flush=True)
(DEST/'reference-definitions.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2),encoding='utf-8')
(DEST/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('TOTAL REFERENCE DEFINITIONS',len(facts),'UNIQUE TERM LABELS',len({f['term'].casefold() for f in facts}),flush=True)
