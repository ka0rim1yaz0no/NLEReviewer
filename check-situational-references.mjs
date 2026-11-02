// Public reference-link audit. HTTP availability is not clinical validation.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const evidence=JSON.parse(await readFile(new URL('./situational-evidence.json',import.meta.url),'utf8'));
const legacy=JSON.parse(await readFile(new URL('./legacy-case-references.json',import.meta.url),'utf8'));
const urls=[...new Set([...evidence.map(c=>c.source),...Object.values(legacy)])];
const cache=new URL('./outputs/openrn/',import.meta.url);
const xml=(await Promise.all((await readdir(cache)).filter(n=>n.endsWith('.xml')).map(n=>readFile(new URL(n,cache),'utf8')))).join('\n');
const results=[];
for(const url of urls.filter(u=>u.includes('ncbi.nlm.nih.gov'))){const id=url.match(/NBK\d+/)?.[0];if(id&&new RegExp(id+'\\b').test(xml))results.push({url,method:'cached official NLM Books-OAI reference XML',available:true});}
const cached=new Set(results.map(r=>r.url));
const pending=urls.filter(u=>!cached.has(u));
let cursor=0;
await mkdir(new URL('./outputs/situational-references/',import.meta.url),{recursive:true});
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<pending.length){
  const url=pending[cursor++];
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'NLEReviewer reference availability review'}});
   const html=await response.text(),digest=createHash('sha256').update(html).digest('hex');
   const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim()||'';
   await writeFile(new URL(digest+'.html',new URL('./outputs/situational-references/',import.meta.url)),html);
   results.push({url,method:'public reference HTTP request',status:response.status,available:response.ok,finalUrl:response.url,title,sha256:digest});
  }catch(error){results.push({url,method:'public reference HTTP request',available:false,error:error.message});}
 }
}));
results.sort((a,b)=>a.url.localeCompare(b.url));
await writeFile(new URL('./outputs/situational-reference-check.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),note:'Availability and traceability audit only; not independent professional clinical review.',references:results},null,2)+'\n');
console.log(JSON.stringify({references:results.length,available:results.filter(r=>r.available).length,unresolved:results.filter(r=>!r.available)}));
