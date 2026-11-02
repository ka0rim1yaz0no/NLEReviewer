import { readFile, writeFile } from 'node:fs/promises';
import { questions, validateQuestions } from './author-bank.ts';
import { auditQuestionBank } from './catalog-metrics.ts';

// Read-only audit: an optional authorized JSON bank can be checked without publishing it.
const positional=process.argv.slice(2).filter(arg=>!arg.startsWith('--'));
const input=positional[0];
const bank=input?validateQuestions(JSON.parse(await readFile(input,'utf8'))):questions;
const report=auditQuestionBank(bank);
const destination=positional[1]||'question-coverage.json';
await writeFile(destination,JSON.stringify(report,null,2)+'\n');
console.log(`Available unique questions: ${report.availableUniqueQuestions}`);
console.log(`Reference: ${report.referenceTotal} questions across ${report.topics.length} topics (observed ${report.referenceObservedAt})`);
console.log(`Topics matching the reference count: ${report.matchingTopics}/${report.topics.length}`);
console.log(`Duplicate stems: ${report.duplicateStems.length}`);
console.log(`Report: ${destination}`);
if(report.duplicateStems.length)process.exitCode=1;
if(process.argv.includes('--require-match')&&!report.matchesReferenceDistribution)process.exitCode=1;
