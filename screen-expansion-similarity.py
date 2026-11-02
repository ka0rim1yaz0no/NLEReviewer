"""Flag likely overlaps for editorial assessment; similarity is not a verdict."""
from pathlib import Path
from collections import Counter
import json,re,math
root=Path(__file__).resolve().parent
draft=json.loads((root/'outputs/expansion/candidate-questions.json').read_text(encoding='utf-8'))
old=[c for c in json.loads((root/'situational-evidence.json').read_text(encoding='utf-8')) if not c.get('retired')]
old += [c for c in json.loads((root/'outputs/reference-recheck/case-source-packets.json').read_text(encoding='utf-8')) if c.get('facts')]
stop=set('a an the and or to of for with in on at is are has have this that as by from before after client patient nurse care prescribed appropriate plan assess assessment review which what best should may can will must more such some when than not only adult reports response needs possible risk new following during about described'.split())
def tokens(s):return [w for w in re.findall('[a-z]+',s.lower()) if len(w)>2 and w not in stop]
def oldtext(c):return c['scenario']+' '+(' '.join(f['text'] for f in c['facts']) if c.get('facts') else c['problem']+' '+c['action'])
texts=[q['stem']+' '+q['options'][q['correctIndex']]['text'] for q in draft]+[oldtext(c) for c in old]
bags=[Counter(tokens(s)) for s in texts];df=Counter(w for b in bags for w in b)
vectors=[{w:(1+math.log(n))*math.log(1+len(bags)/(1+df[w])) for w,n in b.items()} for b in bags]
norms=[math.sqrt(sum(v*v for v in b.values())) for b in vectors]
result=[]
for i,q in enumerate(draft):
    matches=[]
    for j,c in enumerate(old,len(draft)):
        score=sum(v*vectors[j].get(w,0) for w,v in vectors[i].items())/(norms[i]*norms[j])
        matches.append({'score':round(score,3),'id':c['id'],'scenario':c['scenario'],'focus':c.get('problem') or c.get('title')})
    matches.sort(key=lambda x:x['score'],reverse=True)
    result.append({'id':q['id'],'stem':q['stem'],'matches':matches[:3]})
(root/'outputs/expansion/similarity.json').write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode('utf-8'))
new_pairs=[]
for i,q in enumerate(draft):
    for j in range(i+1,len(draft)):
        score=sum(v*vectors[j].get(w,0) for w,v in vectors[i].items())/(norms[i]*norms[j])
        new_pairs.append({'score':round(score,3),'first':q['id'],'second':draft[j]['id']})
new_pairs.sort(key=lambda p:p['score'],reverse=True)
(root/'outputs/expansion/new-pair-similarity.json').write_bytes(json.dumps(new_pairs[:30],indent=2).encode('utf-8'))
for row in sorted(result,key=lambda r:r['matches'][0]['score'],reverse=True)[:35]:
    m=row['matches'][0];print(f"{row['id']} | {m['score']} | {m['id']} | {m['scenario']}")
