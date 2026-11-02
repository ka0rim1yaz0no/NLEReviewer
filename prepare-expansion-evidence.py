"""Prepare short passages for a human-style editorial read, not auto-approval."""
from pathlib import Path
from html.parser import HTMLParser
import json, re, math, hashlib
from collections import Counter

root=Path(__file__).resolve().parent
out=root/'outputs/expansion'
questions=json.loads((out/'candidate-questions.json').read_text(encoding='utf-8'))
chapters=json.loads((root/'outputs/reference-recheck/chapter-paragraphs.json').read_text(encoding='utf-8'))
references={r['url']:r for r in json.loads((out/'reference-links.json').read_text(encoding='utf-8'))['references']}
class Text(HTMLParser):
    def __init__(self):super().__init__();self.skip=0;self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style','svg','nav','header','footer'):self.skip+=1
        if not self.skip and tag in ('p','li','h1','h2','h3','h4','tr'):self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ('script','style','svg','nav','header','footer'):self.skip=max(0,self.skip-1)
        if not self.skip and tag in ('p','li','h1','h2','h3','h4','tr'):self.parts.append('\n')
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)
def clean(s):return re.sub(r'\s+',' ',s).strip()
stop=set('the a an and or to of for with in on at is are has have this that as by from before after client patient nurse care prescribed appropriate plan assess assessment review which what best should may can will must more such some when than not only'.split())
def words(s):return [t for t in re.findall('[a-z]+',s.lower()) if len(t)>2 and t not in stop]
packets=[]
for q in questions:
    row=references.get(q['source'],{});id=re.search(r'NBK\d+',q['source']);paragraphs=[]
    if id and id[0] in chapters:paragraphs=chapters[id[0]]
    elif row.get('sha256') and row.get('available'):
        if row.get('format')=='pdf':
            from pypdf import PdfReader
            raw='\n'.join(p.extract_text() or '' for p in PdfReader(out/'references'/(row['sha256']+'.pdf')).pages)
            paragraphs=[clean(p) for p in raw.split('\n') if len(clean(p))>50]
        else:
            parser=Text();parser.feed((out/'references'/(row['sha256']+'.html')).read_text(encoding='utf-8',errors='replace'))
            paragraphs=[clean(p) for p in ''.join(parser.parts).split('\n') if 65<=len(clean(p))<=8000]
    # Read explanatory text, not a textbook's embedded exercises or answer keys.
    paragraphs=[p for p in paragraphs if '?' not in p and not any(t in p for t in ('Correct answer:', 'Learning Activity', 'Answer Key', 'ANSWER KEY'))]
    query=Counter(words(q['stem']+' '+q['rationale']+' '+' '.join(o['text'] for o in q['options'])))
    bags=[Counter(words(p)) for p in paragraphs];df=Counter(w for b in bags for w in b)
    ranked=[]
    for p,b in zip(paragraphs,bags):
        score=sum((1+math.log(b[w]))*math.log(1+len(bags)/(1+df[w]))*min(2,query[w]) for w in query if w in b)/math.sqrt(max(1,len(b)))
        if score:ranked.append((score,p))
    ranked.sort(reverse=True)
    passages=[{'text':p,'sha256':hashlib.sha256(p.encode()).hexdigest()} for _,p in ranked[:3]]
    packets.append({'id':q['id'],'topic':q['topic'],'source':q['source'],'stem':q['stem'],'correct':q['options'][q['correctIndex']]['text'],'rationale':q['rationale'],'sourcePassages':passages})
(out/'evidence-packets.json').write_bytes(json.dumps(packets,ensure_ascii=False,indent=2).encode('utf-8'))
for start in range(0,len(packets),15):
    lines=[]
    for p in packets[start:start+15]:
        lines.extend(['\n'+p['id']+' | '+p['source'],p['stem'],'KEY: '+p['correct']])
        lines.extend('SOURCE: '+s['text'][:700] for s in p['sourcePassages'][:2])
        if not p['sourcePassages']:lines.append('SOURCE: Direct reading required')
    (out/f'evidence-{start//15+1:02}.txt').write_bytes(('\n'.join(lines)+'\n').encode('utf-8'))
print(json.dumps({'questions':len(packets),'withCachedPassages':sum(bool(p['sourcePassages']) for p in packets),'directReadingNeeded':[p['id'] for p in packets if not p['sourcePassages']]}))
