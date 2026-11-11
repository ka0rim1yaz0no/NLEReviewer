// Actual PDF/ZIP verification, not a copy of the layout implementation.
import {mkdir,writeFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {zipSync,unzipSync,strToU8} from 'fflate';
import assert from 'node:assert/strict';
import {questions,clinicalCases} from './author-bank.ts';
import {curriculum} from './curriculum.ts';
import {makeTopicGuide} from './pdf-guides.ts';
import {renderTopicPDF} from './pdf-renderer.ts';
await mkdir('outputs/pdf-library/generated',{recursive:true});
const files={},results=[];
for(const topic of curriculum){
 const guide=makeTopicGuide(topic,questions,clinicalCases),bytes=await renderTopicPDF(guide),doc=await PDFDocument.load(bytes);
 assert.ok(doc.getPageCount()>0,topic.slug);assert.ok(doc.getTitle().startsWith(topic.name.replace(/[\u2010-\u2015\u2212]/g,'-')),topic.slug);
 assert.equal(doc.getAuthor(),'For Elaine Only Reviewer');
 const name=`${topic.subject}/${topic.slug}.pdf`;files[name]=bytes;
 await writeFile(`outputs/pdf-library/generated/${topic.slug}.pdf`,bytes);
 results.push({slug:topic.slug,pages:doc.getPageCount(),bytes:bytes.length,sections:guide.sections.length,points:guide.sections.reduce((n,s)=>n+s.points.length,0),references:guide.references.length});
}
files['READ-ME.txt']=strToU8('Original topic review PDFs; publisher documents and BoardPal readers remain external links.');
const archive=zipSync(files,{level:6}),restored=unzipSync(archive);
assert.equal(Object.keys(restored).filter(n=>n.endsWith('.pdf')).length,curriculum.length);
for(const [name,bytes] of Object.entries(files))assert.deepEqual(restored[name],bytes,name);
await writeFile('outputs/pdf-library/all-topic-pdfs.zip',archive);
await writeFile('outputs/pdf-library/pdf-verification.json',JSON.stringify({topics:results.length,pages:results.reduce((n,r)=>n+r.pages,0),zipBytes:archive.length,verifiedArchive:true,results},null,2)+'\n');
console.log(JSON.stringify({topics:curriculum.length,pages:results.reduce((n,r)=>n+r.pages,0),zipBytes:archive.length,verifiedArchive:true}));
