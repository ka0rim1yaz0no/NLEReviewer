import {writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {questions} from './author-bank.ts';
import {contentRelease} from './content-release.ts';
// The complete uncompressed array exceeds GitHub's browser-upload file limit.
// Store a lossless gzip export and a small descriptive manifest at the old path.
const json=Buffer.from(JSON.stringify(questions)),gzip=gzipSync(json,{level:9});
assert.deepEqual(JSON.parse(gunzipSync(gzip)),questions);
await writeFile(new URL('./question-bank.json.gz',import.meta.url),gzip);
await writeFile(new URL('./question-bank.json',import.meta.url),JSON.stringify({format:'gzip-json-array',file:'question-bank.json.gz',release:contentRelease,questionCount:questions.length,uncompressedBytes:json.length,sha256:createHash('sha256').update(json).digest('hex'),instructions:'Gunzip question-bank.json.gz to obtain the complete JSON question array. Or run node export-bank.mjs --plain for outputs/question-bank.json. The student app retrieves protected database releases, not this authoring export.'},null,2)+'\n');
if(process.argv.includes('--plain')){await mkdir(new URL('./outputs/',import.meta.url),{recursive:true});await writeFile(new URL('./outputs/question-bank.json',import.meta.url),json);}
console.log(`Verified lossless export: ${questions.length} questions; ${gzip.length} compressed bytes.`);
