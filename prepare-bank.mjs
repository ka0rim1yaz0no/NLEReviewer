import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { questions, previousQuestions } from './author-bank.ts';
import { validateQuestions, normalizeQuestionStem } from './bank.ts';
import { curriculum } from './curriculum.ts';
import { auditQuestionBank } from './catalog-metrics.ts';

// Authoring command for content you own or may republish. Never fetches BoardPal content.
// Publishing questions here keeps their text outside students' Supabase progress snapshots.
const input=process.argv[2];
if(!input||input.startsWith('--'))throw new Error('Usage: node --experimental-strip-types prepare-bank.mjs authorized-questions.json [--check-only]');
const incoming=validateQuestions(JSON.parse(await readFile(input,'utf8')));
const existingIds=new Set(questions.map(q=>q.id)),existingStems=new Set([...questions,...previousQuestions].map(q=>normalizeQuestionStem(q.stem)));
for(const q of incoming){
  if(existingIds.has(q.id))throw new Error(`ID already published: ${q.id}. Published IDs must stay stable for saved sessions.`);
  if(existingStems.has(normalizeQuestionStem(q.stem)))throw new Error(`Duplicate published question: ${q.id}.`);
  const topic=curriculum.find(t=>t.subject===q.subject&&(t.name===q.topic||t.slug===q.topic));
  if(!topic)throw new Error(`Question ${q.id} must name an exact catalog topic or slug in its subject.`);
  if(!q.source||!q.origin.trim())throw new Error(`Question ${q.id} needs a source URL and provenance.`);
  q.topic=topic.name;
}
const report=auditQuestionBank([...questions,...incoming]);
console.log(`Validated ${incoming.length} additional questions. Resulting bank: ${report.availableUniqueQuestions} unique questions.`);
console.log(`Reference: ${report.referenceTotal}. Exact topic-count matches: ${report.matchingTopics}/${curriculum.length}.`);
if(!process.argv.includes('--check-only')){
  const outputIndex=process.argv.indexOf('--output');
  if(outputIndex>=0&&(!process.argv[outputIndex+1]||process.argv[outputIndex+1].startsWith('--')))throw new Error('--output needs a destination file.');
  const destination=outputIndex>=0?resolve(process.argv[outputIndex+1]):new URL('./site-questions.json',import.meta.url);
  if(typeof destination==='string'&&destination===resolve(input))throw new Error('Choose a different output file to preserve your source export.');
  const published=JSON.parse(await readFile(new URL('./site-questions.json',import.meta.url),'utf8'));
  await writeFile(destination,JSON.stringify([...published,...incoming],null,2)+'\n');
  console.log(`Prepared ${outputIndex>=0?destination:'site-questions.json'}. Run npm test and npm run build before deploying.`);
}
