import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,BookOpen,Download,ExternalLink,FileText,X} from 'lucide-react';
import {strToU8,zip as packZip} from 'fflate';
import {useApp} from './store';
import {canAccessPDFs,priorityUsername} from './access';
import {clinicalCases,subjects} from './bank';
import {curriculum,findCurriculumTopic} from './curriculum';
import {makeTopicGuide} from './pdf-guides';
import type {CurriculumTopic} from './curriculum';
import {Card,Empty,Heading,Link,SearchBox} from './ui';
import catalog from './pdf-library-catalog.json';
import './pdf-library.css';

function saveFile(name:string,bytes:Uint8Array,type:string){
 const url=URL.createObjectURL(new Blob([Uint8Array.from(bytes).buffer],{type})),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
const pause=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
function packPDFs(files:Record<string,Uint8Array>,signal:AbortSignal){
 return new Promise<Uint8Array>((resolve,reject)=>{
  const cancelled=()=>new DOMException('Cancelled','AbortError');
  if(signal.aborted){reject(cancelled());return;}
  const stop=packZip(files,{level:6},(error,bytes)=>{
   signal.removeEventListener('abort',abort);
   if(error)reject(error);
   else resolve(bytes);
  });
  function abort(){stop();reject(cancelled());}
  signal.addEventListener('abort',abort,{once:true});
 });
}
export function PDFLibrary(){
 const {user,username,sharedProfile}=useApp();
 if(!canAccessPDFs(username,!!user,sharedProfile))return <Empty title='PDF library unavailable' description={`The PDF library is reserved for the ${priorityUsername} username.`} action={<Link to='/resources' className='btn'>Open study resources</Link>}/>;
 return <PriorityPDFLibrary key={user!.id}/>;
}
function PriorityPDFLibrary(){
 const {bank,state,toast,path}=useApp();
 const originalBank=useMemo(()=>{const personalIds=new Set(state.importedQuestions.map(q=>q.id));return bank.filter(q=>!personalIds.has(q.id));},[bank,state.importedQuestions]);
 const initialTopic=findCurriculumTopic(new URLSearchParams(path.split('?')[1]).get('topic')||'');
 const [tab,setTab]=useState('topics'),[subject,setSubject]=useState(initialTopic?.subject||'all'),[search,setSearch]=useState(initialTopic?.name||''),[page,setPage]=useState(0);
 const [job,setJob]=useState<{done:number;total:number;label:string}|null>(null),[error,setError]=useState('');
 const controller=useRef<AbortController|null>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort();};},[]);
 const matching=(name:string)=>name.toLowerCase().includes(search.trim().toLowerCase());
 const topics=useMemo(()=>curriculum.filter(t=>(subject==='all'||t.subject===subject)&&t.name.toLowerCase().includes(search.trim().toLowerCase())),[subject,search]);
 const references=catalog.references.filter(r=>(subject==='all'||r.subjects.includes(subject))&&matching(r.title+' '+r.publisher));
 const readers=catalog.boardpalReaders.filter(r=>(subject==='all'||r.subject===subject)&&matching(r.title));
 const length=tab==='topics'?topics.length:tab==='references'?references.length:readers.length;
 const start=page*20;
 const visibleTopics=useMemo(()=>tab==='topics'?topics.slice(start,start+20):[],[tab,topics,start]);
 const totals=useMemo(()=>new Map(visibleTopics.map(topic=>{
  const guide=makeTopicGuide(topic,originalBank,clinicalCases);
  return [topic.slug,{points:guide.questionCount,references:guide.references.length}];
 })),[visibleTopics,originalBank]);
 async function exportTopics(selection:CurriculumTopic[],zip=false){
  if(controller.current||!selection.length)return;
  const abort=new AbortController();controller.current=abort;setError('');setJob({done:0,total:selection.length,label:'Preparing your PDFs…'});
  try{
   const {renderTopicPDF}=await import('./pdf-renderer');const files:Record<string,Uint8Array>={};
   for(const [index,topic] of selection.entries()){
    if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
    const bytes=await renderTopicPDF(makeTopicGuide(topic,originalBank,clinicalCases));
    if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
    files[`${topic.subject}/${topic.slug}.pdf`]=bytes;
    setJob({done:index+1,total:selection.length,label:topic.name});await pause();
   }
   if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
   if(zip){
    files['READ-ME.txt']=strToU8('For Elaine Only Reviewer\nOriginal topic review PDFs.\nClinical references are included in each PDF. No personal progress, account details or personal notes are included.\nBoardPal subscription sheets and third-party publications are linked from the app, not copied into this archive.\nhttps://nlereviewer.vercel.app/resources/pdfs\n');
    setJob({done:selection.length,total:selection.length,label:'Packing your PDFs…'});
    await pause();
    const bytes=await packPDFs(files,abort.signal);
    if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
    saveFile(`topic-review-pdfs-${selection.length}.zip`,bytes,'application/zip');
   }else saveFile(`${selection[0].slug}.pdf`,Object.values(files)[0],'application/pdf');
   if(mounted.current)toast(zip?`${selection.length} topic PDFs downloaded.`:'Your topic PDF is ready.');
  }catch(e){if(mounted.current&&!abort.signal.aborted)setError('The PDF could not be prepared. Please try again.');}
  finally{controller.current=null;if(mounted.current)setJob(null);}
 }
 return <>
  <Link to='/resources' className='back'><ArrowLeft size={15}/>All resources</Link>
  <Heading title='PDF library' description='Download original topic reviews and open the reference publications behind your study material.'/>
  <Card className='pdf-library-intro'><div><FileText size={26}/><h2>Keep your review close.</h2><p>{curriculum.length} original topic PDFs, {catalog.references.filter(r=>r.kind==='pdf').length} official PDF references, and links to all 46 BoardPal readers.</p><p className='muted'>Topic PDFs summarize case clues and key nursing decisions, with links to the clinical sources. Publisher files and BoardPal readers open on their own sites.</p></div><button className='btn primary' disabled={!!job} onClick={()=>void exportTopics(curriculum,true)}><Download size={17}/>Download all {curriculum.length} topic PDFs</button></Card>
  {job&&<Card className='pdf-export-job' aria-live='polite'><div><strong>Preparing {job.done} of {job.total}</strong><p>{job.label}</p><progress aria-label='PDF export progress' value={job.done} max={job.total}/></div><button className='btn' onClick={()=>controller.current?.abort()}><X size={16}/>Cancel export</button></Card>}
  {error&&<p role='alert' className='form-error'>{error}</p>}
  <div className='tabs pdf-library-tabs' aria-label='Resource type'>{[['topics','Topic PDFs'],['references','Official references'],['boardpal','BoardPal readers']].map(([value,label])=><button key={value} aria-pressed={tab===value} className={tab===value?'active':''} onClick={()=>{setTab(value);setPage(0);}}>{label}</button>)}</div>
  <SearchBox value={search} onChange={value=>{setSearch(value);setPage(0);}} placeholder='Search PDF library'/>
  <div className='tabs' aria-label='Filter PDFs by subject'><button aria-pressed={subject==='all'} className={subject==='all'?'active':''} onClick={()=>{setSubject('all');setPage(0);}}>All subjects</button>{subjects.map(s=><button key={s.id} aria-pressed={subject===s.id} className={subject===s.id?'active':''} onClick={()=>{setSubject(s.id);setPage(0);}}>{s.short}</button>)}</div>
  <div className='section-head'><h2>{tab==='topics'?'Original topic PDFs':tab==='references'?'Publisher references':'BoardPal reader links'}</h2><small>{length} {length===1?'resource':'resources'}</small></div>
  {tab==='topics'&&topics.length>0&&<div className='pdf-selection-export'><p>Each download uses the current study material in your reviewer.</p><button className='btn small' disabled={!!job} onClick={()=>void exportTopics(topics,true)}><Download size={15}/>Download these {topics.length} PDFs</button></div>}
  {tab==='boardpal'&&<p className='pdf-library-note'>These are the 46 original online readers in BoardPal's catalog. BoardPal may require your subscription. Their sheet text is hosted by BoardPal.</p>}
  {tab==='references'&&<p className='pdf-library-note'>Open the publisher's PDF or download page. Editions are named where available; local clinical guidance may differ.</p>}
  <div className='pdf-library-grid'>
   {visibleTopics.map(t=><Card key={t.slug} className='pdf-library-card'><span className='tag'>{t.subject==='CROSS'?'Foundations':t.subject}</span><h3>{t.name}</h3><p>{totals.get(t.slug)?.points} review points · {totals.get(t.slug)?.references} references</p><div className='pdf-card-actions'><button className='btn' disabled={!!job} onClick={()=>void exportTopics([t])}><Download size={16}/>Download PDF</button><Link to={`/resources/read?topic=${t.subject}:${t.slug}`} className='text-button'><BookOpen size={15}/>Read topic</Link></div></Card>)}
   {tab==='references'&&references.slice(start,start+20).map(r=><Card key={r.id} className='pdf-library-card'><span className='tag'>{r.kind==='pdf'?'PDF':'Publisher download page'}</span><h3>{r.title}</h3><p>{r.publisher}{'pages'in r?` · ${r.pages} ${r.pages===1?'page':'pages'}`:''}</p><a className='btn' href={r.url} target='_blank' rel='noreferrer'><ExternalLink size={16}/>{r.kind==='pdf'?'Open publisher PDF':'Open publisher page'}</a></Card>)}
   {tab==='boardpal'&&readers.slice(start,start+20).map(r=><Card key={r.id} className='pdf-library-card'><span className='tag'>{r.subject==='CROSS'?'Foundations':r.subject}</span><h3>{r.title}</h3><p>BoardPal online reader</p><a className='btn' href={r.url} target='_blank' rel='noreferrer'><ExternalLink size={16}/>Open in BoardPal</a></Card>)}
  </div>
  {!length&&<Empty title='No matching resources' description='Try another subject or clear your search.'/>}
  {length>20&&<div className='pagination'><button className='btn' disabled={!page} onClick={()=>setPage(page-1)}>Previous</button><span>{start+1}–{Math.min(start+20,length)} of {length}</span><button className='btn' disabled={start+20>=length} onClick={()=>setPage(page+1)}>Next</button></div>}
 </>;
}
