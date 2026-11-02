import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {questions,clinicalCases} from './author-bank.ts';
import {contentDigest} from './content-integrity.ts';
import {contentRelease,decodeContentRelease} from './content-release.ts';
const raw=Buffer.from(JSON.stringify({questions,cases:clinicalCases}));
const packed=gzipSync(raw,{level:9}).toString('base64');
const size=440000,pages=[];
for(let offset=0;offset<packed.length;offset+=size)pages.push({id:`page-${String(pages.length).padStart(4,'0')}`,kind:'page',data:packed.slice(offset,offset+size)});
const manifest={version:2,encoding:'gzip-base64',pages:pages.length,questionCount:questions.length,caseCount:clinicalCases.length,digest:await contentDigest(questions,clinicalCases),bytes:raw.length};
await decodeContentRelease(manifest,pages);
const destination=new URL(`./outputs/releases/${contentRelease}/`,import.meta.url);
await mkdir(destination,{recursive:true});
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const upsert=rows=>'insert into public.study_content_releases (release,id,kind,data) values\n'+rows.map(r=>`(${quote(contentRelease)},${quote(r.id)},${quote(r.kind)},${quote(JSON.stringify(r.data))}::jsonb)`).join(',\n')+'\non conflict (release,id) do update set kind=excluded.kind,data=excluded.data;\n';
const schema=await readFile(new URL('./protected-releases.sql',import.meta.url),'utf8');
await writeFile(new URL('release-00-schema.sql',destination),schema);
for(let i=0;i<pages.length;i++)await writeFile(new URL(`release-${String(i+1).padStart(2,'0')}-page.sql`,destination),upsert([pages[i]]));
// Never publish a manifest over missing or incorrectly pasted pages. The
// browser also verifies the full SHA-256 payload after decompression.
const expected=pages.map(p=>`(${quote(p.id)},${quote(createHash('md5').update(p.data).digest('hex'))})`).join(',\n');
const preflight=`begin;\ndo $release_check$\ndeclare matching_pages integer; total_pages integer;\nbegin\n select count(*) into total_pages from public.study_content_releases where release=${quote(contentRelease)} and kind='page';\n select count(*) into matching_pages from public.study_content_releases s join (values\n${expected}\n) expected(id,digest) on s.id=expected.id where s.release=${quote(contentRelease)} and s.kind='page' and md5(s.data #>> '{}')=expected.digest;\n if total_pages<>${pages.length} or matching_pages<>${pages.length} then raise exception 'The staged release is incomplete or differs from the prepared pages'; end if;\nend;\n$release_check$;\n`;
await writeFile(new URL('release-99-publish.sql',destination),preflight+upsert([{id:'manifest',kind:'manifest',data:manifest}])+`select data->>'questionCount' as questions,data->>'pages' as pages from public.study_content_releases where release=${quote(contentRelease)} and id='manifest';\ncommit;\n`);
await writeFile(new URL('release-fixture.json',destination),JSON.stringify({manifest,pages}));
console.log(JSON.stringify({release:contentRelease,...manifest,compressedBytes:packed.length,sqlPages:pages.length}));
