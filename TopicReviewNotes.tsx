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
 return <div className='topic-review-notes'><h2>Situations and review notes</h2><p className='fine-print'>{guide.sections.length} situations · {guide.sections.reduce((n,s)=>n+s.points.length,0)} review points · {guide.questionCount} related situational questions</p>{guide.sections.slice(0,visible).map((section,i)=><details key={i} open><summary><h3>{section.title}</h3><ChevronDown size={17}/></summary><p className='case-scenario'>{section.scenario}</p>{section.points.map((point,j)=><div key={j} className={`key-point ${point.avoid?'avoid-point':''}`}><p>{point.text}</p><a href={guide.references[point.reference-1]} target='_blank' rel='noreferrer'><ExternalLink size={13}/>Clinical reference {point.reference}</a></div>)}</details>)}{visible<guide.sections.length&&<button className='btn' onClick={()=>setVisible(n=>n+3)}>Show more situations · {guide.sections.length-visible} remaining</button>}<p className='fine-print'>Original reviewer notes drawn from all active situational questions for this topic. Use the linked clinical references for full context. Independent clinician review remains pending.</p></div>;
}
