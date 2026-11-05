"""Read-only semantic candidate screening; flags are never automatic verdicts."""
from pathlib import Path
from collections import Counter,defaultdict
import json,re,math

root=Path(__file__).resolve().parent
directory=root/'outputs/device-and-content-review'
cases=json.loads((directory/'cases.json').read_text(encoding='utf-8'))
questions=json.loads((directory/'questions.json').read_text(encoding='utf-8'))
stop=set('a an the and or to of for with in on at is are has have this that as by from before after client patient nurse care prescribed appropriate plan assess assessment review which what best should may can will must more such some when than not only adult reports response needs possible risk new following during about described requiring its their it all through under according most first'.split())
def tokens(text):return [word for word in re.findall('[a-z0-9]+',text.lower()) if len(word)>2 and word not in stop]
texts=[' '.join(c.get(key,'') for key in ('scenario','problem','action')) for c in cases]
bags=[Counter(tokens(text)) for text in texts]
df=Counter(word for bag in bags for word in bag)
vectors=[{word:(1+math.log(n))*math.log(1+len(bags)/(1+df[word])) for word,n in bag.items()} for bag in bags]
lengths=[math.sqrt(sum(v*v for v in vector.values())) for vector in vectors]
pairs=[]
for i,left in enumerate(cases):
 for j in range(i+1,len(cases)):
  score=sum(value*vectors[j].get(word,0) for word,value in vectors[i].items())/max(.00001,lengths[i]*lengths[j])
  if score>=.35:pairs.append({'score':round(score,4),'a':left['id'],'b':cases[j]['id'],'sameTopic':left['topic']==cases[j]['topic'],'aScenario':left['scenario'],'aAnswer':left.get('problem'),'bScenario':cases[j]['scenario'],'bAnswer':cases[j].get('problem')})
pairs.sort(key=lambda p:-p['score'])
(directory/'case-similarity-candidates.json').write_text(json.dumps(pairs,ensure_ascii=False,indent=2),encoding='utf-8')
# Review identical answers with near-identical prompts, including concepts and
# reference comparisons. Shared answers alone are not duplicate questions.
groups=defaultdict(list)
for q in questions:groups[' '.join(re.findall('[a-z0-9]+',q['options'][q['correctIndex']]['text'].lower()))].append(q)
answer_pairs=[]
for group in groups.values():
 for i,a in enumerate(group):
  for b in group[i+1:]:
   if a.get('caseId') and a.get('caseId')==b.get('caseId'):continue
   left,right=set(tokens(a['stem'])),set(tokens(b['stem']))
   score=len(left&right)/max(1,len(left|right))
   if score>=.65:answer_pairs.append({'score':round(score,4),'a':a['id'],'b':b['id'],'aStem':a['stem'],'bStem':b['stem'],'answer':a['options'][a['correctIndex']]['text']})
bodies=defaultdict(list)
for q in questions:
 if q.get('format') not in ('concept','comparison'):continue
 body=q['stem'].split('\n\n')[-1]
 if q['format']=='comparison' and ': ' in body:body=body.split(': ',1)[1]
 key=' '.join(re.findall('[a-z0-9]+',body.lower()))
 bodies[key].append(q)
body_pairs=[{'ids':[q['id'] for q in group],'body':key,'answers':[q['options'][q['correctIndex']]['text'] for q in group]} for key,group in bodies.items() if len(group)>1]
(directory/'fact-body-candidates.json').write_text(json.dumps(body_pairs,ensure_ascii=False,indent=2),encoding='utf-8')
answer_pairs.sort(key=lambda p:-p['score'])
(directory/'same-answer-candidates.json').write_text(json.dumps(answer_pairs,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'scenariosScreened':len(cases),'scenarioPairs':len(cases)*(len(cases)-1)//2,'caseCandidates':len(pairs),'sameAnswerCandidates':len(answer_pairs),'repeatedFactBodyGroups':len(body_pairs),'topCases':[{'score':p['score'],'a':p['a'],'b':p['b']} for p in pairs[:20]],'topAnswers':[{'score':p['score'],'a':p['a'],'b':p['b']} for p in answer_pairs[:12]]}))
