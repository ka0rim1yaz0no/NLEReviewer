import {readFile,writeFile} from 'node:fs/promises';
import {questions as baseQuestions,revisedSituationalCount} from './author-bank.ts';
import {collectionCounts} from './collections.ts';
import catalog from './topic-catalog.json' with {type:'json'};
import {contentRelease} from './content-release.ts';
import studyAdditions from './study-additions-summary.json' with {type:'json'};
const additions=studyAdditions.questionCount;
const activeQuestions=baseQuestions.filter(question=>!question.retired);
const counts=collectionCounts(baseQuestions);
const summary={release:contentRelease,total:activeQuestions.length+additions,original:counts.nursing+additions,situational:counts.situational+additions,revisedSituational:revisedSituationalCount+additions,newSituational:counts.newSituational+additions,challenge:activeQuestions.filter(q=>q.difficulty==="challenge").length+additions,newSituations:new Set(activeQuestions.filter(q=>q.format==='situational'&&q.id.startsWith('SIT-')).map(q=>q.caseId)).size,standaloneSituational:activeQuestions.filter(q=>q.format==='situational'&&q.id.startsWith('EXP2-')).length+additions,clinical:counts.clinical,concept:counts.concept,comparison:counts.comparison,sourceCorrections:counts.supplemental,topics:catalog.length};
const file=new URL('./bank-summary.json',import.meta.url);
if(process.argv.includes('--check')){
 if(JSON.stringify(JSON.parse(await readFile(file,'utf8')))!==JSON.stringify(summary))throw new Error('Public question counts do not match the published authoring bank.');
}else await writeFile(file,JSON.stringify(summary,null,2)+'\n');
console.log(`Verified counts: ${summary.total} questions (${summary.original} original designs), ${summary.topics} topics.`);
