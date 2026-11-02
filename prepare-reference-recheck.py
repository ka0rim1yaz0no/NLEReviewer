"""Prepare source passages for editorial review, never auto-approve clinical facts.

Uses official cached NLM Books-OAI XML and previously retrieved public reference
pages. A lexical match is a reading aid, not evidence of clinical correctness.
"""
import json, math, re, hashlib
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'outputs' / 'reference-recheck'
OUT.mkdir(parents=True, exist_ok=True)
cases = json.loads((ROOT/'outputs/situational-audit/current-cases.json').read_text(encoding='utf-8'))
legacy = json.loads((ROOT/'legacy-case-references.json').read_text(encoding='utf-8'))
references = json.loads((ROOT/'situational-reference-audit.json').read_text(encoding='utf-8'))['references']
refs = {r['url']:r for r in references}
namespace = {'o':'http://www.openarchives.org/OAI/2.0/','b':'https://jats.nlm.nih.gov/ns/extensions/bits/2.0/'}
chapters = {}
clean = lambda text: re.sub(r'\s+', ' ', text).strip()
for file in (ROOT/'outputs/openrn').glob('*.xml'):
    tree = ET.fromstring(file.read_text(encoding='utf-8'))
    for record in tree.findall('.//o:record', namespace):
        identifier = record.find('.//o:identifier', namespace)
        if identifier is None: continue
        body = record.find('.//b:body', namespace)
        if body is None: continue
        paragraphs = []
        for element in body.iter():
            if element.tag.split('}')[-1] not in ('p','table-wrap'): continue
            text = clean(' '.join(element.itertext()))
            if 60 <= len(text) <= 4500 and not any(token in text for token in ('Correct answer:', 'Learning Activities', 'Flashcards')):
                paragraphs.append(text)
        chapters['NBK'+identifier.text.rsplit(':',1)[-1]] = list(dict.fromkeys(paragraphs))

class PageText(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip=0; self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style','svg','nav','header','footer'): self.skip+=1
        if not self.skip and tag in ('p','li','h1','h2','h3','tr','section','article'):self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style','svg','nav','header','footer'):self.skip=max(0,self.skip-1)
        if not self.skip and tag in ('p','li','h1','h2','h3','tr','section','article'):self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip:self.parts.append(data)

stop=set('a an the and or to of for with in on at is are has have this that as by from before after client patient nurse care prescribed appropriate plan assess assessment review new possible requiring without current its their it all through under according nursing health should may can will must more such some when which not only'.split())
def words(text):return [x for x in re.findall('[a-z]+',text.lower()) if x not in stop and len(x)>2]
html_cache={}
def source_paragraphs(url):
    chapter=re.search(r'NBK\d+',url)
    if chapter and chapter[0] in chapters:return chapters[chapter[0]],'official NLM Books-OAI chapter XML'
    row=refs.get(url,{})
    file=ROOT/'outputs/situational-references'/str(row.get('sha256','')+'.html')
    if file.exists() and row.get('available'):
        if url not in html_cache:
            parser=PageText();parser.feed(file.read_text(encoding='utf-8',errors='replace'))
            html_cache[url]=[clean(t) for t in ''.join(parser.parts).split('\n') if 60<=len(clean(t))<=5000]
        return html_cache[url],'cached official public reference page'
    return [],'direct reference reading required'

(OUT/'chapter-paragraphs.json').write_bytes(json.dumps(chapters,ensure_ascii=False).encode('utf-8'))

prepared=[]
for case in cases:
    url=case.get('source') or legacy[case['id']]
    paragraphs,method=source_paragraphs(url)
    facts=case.get('facts',[])
    query=case['scenario']+' '+(' '.join(f['text']+' '+f['reason'] for f in facts) if facts else ' '.join(case[k] for k in ('problem','action','teaching','reason')))
    tokens=Counter(words(query)); bags=[Counter(words(p)) for p in paragraphs]; df=Counter(w for b in bags for w in b)
    ranked=[]
    for paragraph,bag in zip(paragraphs,bags):
        score=sum((1+math.log(bag[w]))*math.log(1+len(bags)/(1+df[w]))*min(2,tokens[w]) for w in tokens if w in bag)/math.sqrt(max(1,len(bag)))
        if score>0:ranked.append((score,paragraph))
    ranked.sort(reverse=True)
    passages=[{'score':round(score,3),'text':p,'sha256':hashlib.sha256(p.encode()).hexdigest()} for score,p in ranked[:3]]
    prepared.append({**case,'source':url,'sourceMethod':method,'sourcePassages':passages})
(OUT/'case-source-packets.json').write_text(json.dumps(prepared,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
for start in range(0,len(prepared),25):
    output=[]
    for case in prepared[start:start+25]:
        output += [f"\n{case['id']} | {case.get('title') or case['topic']} | {case['source']}",case['scenario']]
        if case.get('facts'):
            output += [f"{i+1}. {f['text']} — {f['reason']}" for i,f in enumerate(case['facts'])]
        else:output += [f"{k}: {case[k]}" for k in ('problem','action','teaching','outcome','unsafe','reason')]
        output += [f"SOURCE {i+1}: {p['text'][:360]}" for i,p in enumerate(case['sourcePassages'][:2])]
        if not case['sourcePassages']:output.append('SOURCE: DIRECT READING NEEDED')
    (OUT/f"batch-{start//25+1:02}.txt").write_text('\n'.join(output)+'\n',encoding='utf-8')
print(json.dumps({'cases':len(prepared),'withCachedPassages':sum(bool(c['sourcePassages']) for c in prepared),'needsDirectReading':[c['id'] for c in prepared if not c['sourcePassages']]}))
