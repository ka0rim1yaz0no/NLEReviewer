// Link availability and a reading cache, never an automated clinical sign-off.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const questions=JSON.parse(await readFile(new URL('./outputs/expansion/candidate-questions.json',import.meta.url),'utf8'));
const chapters=JSON.parse(await readFile(new URL('./outputs/reference-recheck/chapter-paragraphs.json',import.meta.url),'utf8'));
const urls=[...new Set(questions.map(q=>q.source))],results=[];
let cursor=0;
await mkdir(new URL('./outputs/expansion/references/',import.meta.url),{recursive:true});
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<urls.length){
  const url=urls[cursor++],id=url.match(/NBK\d+/)?.[0];
  if(id&&chapters[id]){results.push({url,available:true,method:'Previously retrieved official NLM Books-OAI chapter XML',chapterId:id});continue;}
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await response.arrayBuffer());
   const pdf=bytes.subarray(0,4).toString()==='%PDF',html=pdf?'':bytes.toString('utf8');
   const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim()||'';
   const challenge=/recaptcha|checking your browser|just a moment|human verification|attention required|access denied/i.test(title);
   const sha256=createHash('sha256').update(bytes).digest('hex');
   await writeFile(new URL(`./outputs/expansion/references/${sha256}.${pdf?'pdf':'html'}`,import.meta.url),bytes);
   results.push({url,status:response.status,available:response.ok&&!challenge,challenge,finalUrl:response.url,title,sha256,...(pdf?{format:'pdf'}:{})});
  }catch(error){results.push({url,available:false,error:error.message});}
 }
}));
results.sort((a,b)=>a.url.localeCompare(b.url));
await writeFile(new URL('./outputs/expansion/reference-links.json',import.meta.url),JSON.stringify({note:'Availability is not clinical validation.',references:results},null,2)+'\n');
console.log(JSON.stringify({references:urls.length,available:results.filter(r=>r.available).length,unresolved:results.filter(r=>!r.available)}));
