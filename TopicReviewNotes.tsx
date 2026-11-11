import {useMemo,useState} from 'react';
import {ChevronDown,ExternalLink} from 'lucide-react';
import {clinicalCases} from './bank';
import {makeTopicGuide} from './pdf-guides';
import type {CurriculumTopic} from './curriculum';
import {useApp} from './store';
import {SearchBox} from './ui';
import './topic-review-notes.css';

function MatchText({text,query}:{text:string;query:string}){
 if(!query)return text;
 const lower=text.toLowerCase(),parts=[];
 let from=0,match=lower.indexOf(query);
 while(match!==-1){
  parts.push(text.slice(from,match),<mark key={match}>{text.slice(match,match+query.length)}</mark>);
  from=match+query.length;match=lower.indexOf(query,from);
 }
 return <>{parts}{text.slice(from)}</>;
}
export function TopicReviewNotes({topic}:{topic:CurriculumTopic}){
 const {bank,state}=useApp(),[visible,setVisible]=useState(3),[search,setSearch]=useState('');
 const guide=useMemo(()=>{const personal=new Set(state.importedQuestions.map(q=>q.id));return makeTopicGuide(topic,bank.filter(q=>!personal.has(q.id)),clinicalCases);},[topic,bank,state.importedQuestions]);
 const query=search.trim().toLowerCase();
 const sections=guide.sections.map((section,index)=>({section,index})).filter(({section})=>!query||
  [section.title,section.scenario,section.summary,...section.points.flatMap(point=>[point.objective,point.text])].some(value=>value?.toLowerCase().includes(query)));
 return <div className='topic-review-notes'>
  <h2>Clinical review notes</h2>
  <p className='fine-print'>{guide.sections.length} situations · {guide.questionCount} key decisions</p>
  {guide.sections.length>0&&<SearchBox value={search} onChange={value=>{setSearch(value);setVisible(3);}} placeholder="Find text in these notes"/>}
  {query&&<p className='fine-print' role='status'>{sections.length?sections.length+' matching '+(sections.length===1?'situation':'situations'):'No notes contain this text.'}</p>}
  {sections.slice(0,visible).map(({section,index},i)=><details key={topic.slug+':'+index} open={query?true:i===0}>
   <summary><h3><MatchText text={section.title} query={query}/></h3><ChevronDown size={17}/></summary>
   <p className='case-scenario'><MatchText text={section.scenario} query={query}/></p>
   {section.summary&&<p className='clinical-takeaway'><MatchText text={section.summary} query={query}/></p>}
   <dl className='review-decisions'>
    {section.points.map(point=><div key={point.questionId} className={point.avoid?'avoid-point':undefined}>
     <dt><MatchText text={point.objective} query={query}/></dt>
     <dd><MatchText text={point.text} query={query}/> <sup>[{point.reference}]</sup></dd>
    </div>)}
   </dl>
   <div className='review-sources'>
    {[...new Set(section.points.map(point=>point.reference))].map(reference=><a key={reference} href={guide.references[reference-1]} target='_blank' rel='noreferrer'><ExternalLink size={13}/> [{reference}] {guide.referenceLabels[reference-1]}</a>)}
   </div>
  </details>)}
  {visible<sections.length&&<button className='btn' onClick={()=>setVisible(n=>n+3)}>Show more situations · {sections.length-visible} remaining</button>}
 </div>;
}
