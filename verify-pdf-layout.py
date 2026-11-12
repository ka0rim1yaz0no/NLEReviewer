"""Verify actual rendered PDF text geometry, numbering, and link annotations.

Run after verify-pdf-library.mjs. Requires pdfplumber and pypdf.
QA files remain under ignored outputs/; no study PDFs enter public assets.
"""
from pathlib import Path
import json
import pdfplumber
from pypdf import PdfReader

root=Path(__file__).resolve().parent
out=root/'outputs/pdf-library'
expected=json.loads((out/'pdf-verification.json').read_text(encoding='utf-8'))
issues=[]
pages=0
for result in expected['results']:
    path=out/'generated'/(result['slug']+'.pdf')
    doc=PdfReader(path)
    links=set()
    assert len(doc.pages)==result['pages'],path.name
    page_text=[page.extract_text() or '' for page in doc.pages]
    answers=next(i for i,text in enumerate(page_text) if '\nAnswer review\n' in text)
    assert answers>0 and 'Question 3' in ''.join(page_text[:answers]),path.name
    assert 'Best answer.' not in ''.join(page_text[:answers]),path.name
    assert ''.join(page_text[answers:]).count('Best answer.')==3,path.name
    for i,page in enumerate(doc.pages,1):
        assert f'{i} / {len(doc.pages)}' in page_text[i-1],(path.name,i)
        for annotation in page.get('/Annots',[]):
            action=annotation.get_object().get('/A',{})
            uri=action.get('/URI')
            if uri:
                assert str(uri).startswith('https://'),(path.name,uri)
                links.add(str(uri))
    assert len(links)==result['references'],path.name
    with pdfplumber.open(path) as document:
        for i,page in enumerate(document.pages,1):
            pages+=1
            for word in page.extract_words():
                if word['x0']<47.5 or word['x1']>page.width-47.5 or word['top']<20 or word['bottom']>page.height-20:
                    issues.append({'file':path.name,'page':i,'text':word['text'],'bounds':[word['x0'],word['x1'],word['top'],word['bottom']]})
report={'PDFs':len(expected['results']),'pages':pages,'textOutsideMargins':issues,'pageNumbering':'passed','referenceAnnotations':'passed'}
(out/'layout-verification.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
assert not issues,issues[:5]
print(json.dumps({'PDFs':len(expected['results']),'pages':pages,'textOutsideMargins':0,'pageNumbering':'passed','referenceAnnotations':'passed'}))
