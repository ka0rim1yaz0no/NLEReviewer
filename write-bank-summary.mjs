import {readFile,writeFile} from 'node:fs/promises';
import {questions,activeQuestions} from './author-bank.ts';
import {collectionCounts} from './collections.ts';
import catalog from './topic-catalog.json' with {type:'json'};
import {contentRelease} from './content-release.ts';
const counts=collectionCounts(questions);
const summary={release:contentRelease,total:activeQuestions.length,original:counts.nursing,situational:counts.situational,newSituational:counts.newSituational,newSituations:new Set(activeQuestions.filter(q=>q.format==='situational'&&q.id.startsWith('SIT-')).map(q=>q.caseId)).size,standaloneSituational:activeQuestions.filter(q=>q.format==='situational'&&q.id.startsWith('EXP2-')).length,clinical:counts.clinical,concept:counts.concept,comparison:counts.comparison,sourceCorrections:counts.supplemental,topics:catalog.length};
const file=new URL('./bank-summary.json',import.meta.url);
if(process.argv.includes('--check')){
 if(JSON.stringify(JSON.parse(await readFile(file,'utf8')))!==JSON.stringify(summary))throw new Error('Public question counts do not match the published authoring bank.');
}else await writeFile(file,JSON.stringify(summary,null,2)+'\n');
console.log(`Verified counts: ${summary.total} questions (${summary.original} original designs), ${summary.topics} topics.`);
