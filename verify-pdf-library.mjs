// Actual PDF/ZIP verification, not a copy of the layout implementation.
import {mkdir,writeFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {zipSync,unzipSync,strToU8} from 'fflate';
import assert from 'node:assert/strict';
import {questions,clinicalCases} from './author-bank.ts';
import {newStudyQuestions} from './authored-update.mjs';
import {curriculum} from './curriculum.ts';
import {makeTopicGuide} from './pdf-guides.ts';
import {renderTopicPDF} from './pdf-renderer.ts';
import {questionFamily} from './question-selection.ts';
if(!newStudyQuestions.length)throw Error('Keep the private study additions in content-authoring/ before verifying the full PDF library.');
await mkdir('outputs/pdf-library/generated',{recursive:true});
const files={},results=[];
const bank=[...questions,...newStudyQuestions],byId=new Map(bank.map(q=>[q.id,q]));
for(const topic of curriculum){
 const guide=makeTopicGuide(topic,bank,clinicalCases),bytes=await renderTopicPDF(guide),doc=await PDFDocument.load(bytes);
 assert.ok(doc.getPageCount()>0,topic.slug);assert.ok(doc.getTitle().startsWith(topic.name.replace(/[\u2010-\u2015\u2212]/g,'-')),topic.slug);
 assert.equal(doc.getAuthor(),'For Elaine Only Reviewer');
 assert.equal(guide.practice.length,3,topic.slug);
 assert.equal(new Set(guide.practice.map(q=>questionFamily(byId.get(q.id)))).size,3,topic.slug);
 for(const q of guide.practice){
  const source=byId.get(q.id);
  assert.equal(q.correctIndex,source.correctIndex,q.id);
  assert.deepEqual(q.options.map(option=>option.text),source.options.map(option=>option.text),q.id);
  assert.ok(q.options.every(o=>o.rationale&&o.references.length&&o.references.every(ref=>guide.references[ref-1]?.startsWith('https://'))),q.id);
 }
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
