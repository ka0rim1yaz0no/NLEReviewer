// Public reference-link audit. HTTP availability is not clinical validation.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const urls=JSON.parse(await readFile(new URL('./outputs/device-and-content-review/sources.json',import.meta.url),'utf8')).map(s=>s.url);
const cache=new URL('./outputs/openrn/',import.meta.url);
const xml=(await Promise.all((await readdir(cache)).filter(n=>n.endsWith('.xml')).map(n=>readFile(new URL(n,cache),'utf8')))).join('\n');
const results=[];
for(const url of urls.filter(u=>u.includes('ncbi.nlm.nih.gov'))){const id=url.match(/NBK(\d+)/)?.[1];if(id&&xml.includes('oai:books.ncbi.nlm.nih.gov:'+id))results.push({url,method:'cached official NLM Books-OAI reference XML',available:true});}
const cached=new Set(results.map(r=>r.url));
const pending=urls.filter(u=>!cached.has(u));
let cursor=0;
await mkdir(new URL('./outputs/device-and-content-review/reference-cache/',import.meta.url),{recursive:true});
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<pending.length){
  const url=pending[cursor++];if(cursor%40===0)console.log(`Public references checked: ${cursor}/${pending.length}`);
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'user-agent':'NLEReviewer reference availability review'}});
   const bytes=Buffer.from(await response.arrayBuffer()),pdf=bytes.subarray(0,4).toString()==='%PDF';
   const html=pdf?'':bytes.toString('utf8'),digest=createHash('sha256').update(bytes).digest('hex');
   const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim()||'';
   await writeFile(new URL(digest+(pdf?'.pdf':'.html'),new URL('./outputs/device-and-content-review/reference-cache/',import.meta.url)),bytes);
   const accessChallenge=/recaptcha|checking your browser|just a moment|human verification|attention required/i.test(title);
   const emptyAppShell=title==='DSpace'&&html.includes('<ds-app');
   results.push({url,method:'public reference HTTP request',status:response.status,available:response.ok&&!accessChallenge&&!emptyAppShell,...(accessChallenge?{accessChallenge:true}:{}),...(emptyAppShell?{emptyAppShell:true}:{}),...(pdf?{format:'pdf'}:{}),finalUrl:response.url,title,sha256:digest});
  }catch(error){results.push({url,method:'public reference HTTP request',available:false,error:error.message});}
 }
}));
results.sort((a,b)=>a.url.localeCompare(b.url));
await writeFile(new URL('./outputs/device-and-content-review/reference-availability.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),note:'Availability and traceability audit only; not independent professional clinical review.',references:results},null,2)+'\n');
console.log(JSON.stringify({references:results.length,available:results.filter(r=>r.available).length,unresolved:results.filter(r=>!r.available).length}));
