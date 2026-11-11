import {useMemo,useState} from 'react';
import {ChevronDown,ExternalLink} from 'lucide-react';
import {clinicalCases} from './bank';
import {makeTopicGuide} from './pdf-guides';
import type {CurriculumTopic} from './curriculum';
import {useApp} from './store';
import './topic-review-notes.css';

export function TopicReviewNotes({topic}:{topic:CurriculumTopic}){
 const {bank,state}=useApp(),[visible,setVisible]=useState(3);
 const guide=useMemo(()=>{const personal=new Set(state.importedQuestions.map(q=>q.id));return makeTopicGuide(topic,bank.filter(q=>!personal.has(q.id)),clinicalCases);},[topic,bank,state.importedQuestions]);
 return <div className='topic-review-notes'>
  <h2>Clinical review notes</h2>
  <p className='fine-print'>{guide.sections.length} situations · {guide.questionCount} key decisions</p>
  {guide.sections.slice(0,visible).map((section,i)=><details key={i} open={i===0}>
   <summary><h3>{section.title}</h3><ChevronDown size={17}/></summary>
   <p className='case-scenario'>{section.scenario}</p>
   {section.summary&&<p className='clinical-takeaway'>{section.summary}</p>}
   <dl className='review-decisions'>
    {section.points.map(point=><div key={point.questionId} className={point.avoid?'avoid-point':undefined}>
     <dt>{point.objective}</dt>
     <dd>{point.text} <sup>[{point.reference}]</sup></dd>
    </div>)}
   </dl>
   <div className='review-sources'>
    {[...new Set(section.points.map(point=>point.reference))].map(reference=><a key={reference} href={guide.references[reference-1]} target='_blank' rel='noreferrer'><ExternalLink size={13}/> [{reference}] {guide.referenceLabels[reference-1]}</a>)}
   </div>
  </details>)}
  {visible<guide.sections.length&&<button className='btn' onClick={()=>setVisible(n=>n+3)}>Show more situations · {guide.sections.length-visible} remaining</button>}
 </div>;
}
