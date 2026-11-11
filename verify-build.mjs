import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {questions,clinicalCases} from './author-bank.ts';
async function files(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)]))).flat();}
const assets=await files(fileURLToPath(new URL('./dist',import.meta.url)));
const text=(await Promise.all(assets.filter(path=>path.endsWith('.js')).map(path=>readFile(path,'utf8')))).join('\n');
if(questions.some(q=>text.includes(q.stem))||clinicalCases.some(c=>text.includes(c.scenario)))throw new Error('Protected study content was embedded in public JavaScript.');
if(assets.some(path=>/concept-(?:questions|evidence)\.json$|situational-(?:questions|evidence)\.json$|situations-.*\.txt$|audited-replacements\.txt$|situational-clarifications\.json$|question-bank\.json(?:\.gz)?$|site-questions\.json$|challenge-questions\.json$|judgment-questions\.json\.gz$|judgment-edits\.json$|supplemental-questions\.json$|protected-content-seed\.sql$|release-fixture\.json$/.test(path)))throw new Error('A protected question-bank file was copied to public assets.');
console.log('PASS: public production assets contain no question stems, clinical cases, or bank exports.');
