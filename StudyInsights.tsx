import {useMemo} from "react";
import {ArrowRight,Target} from "lucide-react";
import {addDays,dateKey,firstAttempts,longestStreak} from "./engine";
import {curriculum,questionsForTopic} from "./curriculum";
import {useApp} from "./store";
import {Card,Link} from "./ui";
import "./study-insights.css";

export function StudyInsights(){
 const {state,bank}=useApp();
 const first=useMemo(()=>firstAttempts(state.attempts),[state.attempts]);
 const weaknesses=useMemo(()=>curriculum.map(topic=>{
  const ids=new Set(questionsForTopic(topic,bank).map(question=>question.id));
  const attempts=first.filter(answer=>ids.has(answer.questionId));
  const wrong=attempts.filter(answer=>!answer.correct).length;
  return {topic,tried:attempts.length,wrong,accuracy:attempts.length?1-wrong/attempts.length:1};
 }).filter(topic=>topic.tried>=3&&topic.wrong>0)
  .sort((a,b)=>a.accuracy-b.accuracy||b.tried-a.tried).slice(0,5),[first,bank]);
 const wrong=first.filter(answer=>!answer.correct);
 const sureMisses=wrong.filter(answer=>["im sure","sure","confident","high"].includes(answer.confidence.replace(/[’']/g,"").toLowerCase())).length;
 return <div className="insights-grid">
  <Card>
   <div className="section-head"><h2>What to review next</h2><Target size={18} aria-hidden="true"/></div>
   {weaknesses.map(item=><Link key={item.topic.slug} className="insight-topic" to={`/practice/session?topic=${item.topic.slug}`}>
    <div><strong>{item.topic.name}</strong><small>{Math.round(item.accuracy*100)}% first-try accuracy · {item.wrong} misses</small></div><ArrowRight size={16}/>
   </Link>)}
   {!weaknesses.length&&<p className="insight-empty">Answer more questions to see which topics need review.</p>}
  </Card>
  <Card>
   <h2>Confidence and mistakes</h2>
   <div className="insight-count"><strong>{sureMisses}</strong><span>first-try misses marked confident</span></div>
   <div className="insight-count"><strong>{wrong.length-sureMisses}</strong><span>other first-try misses</span></div>
   <Link to="/vault" className="text-link">Review misses in the Vault<ArrowRight size={16}/></Link>
  </Card>
 </div>;
}

export function StudyHabits(){
 const {state}=useApp();
 const today=dateKey(Date.now(),state.profile.timezone);
 const daily=useMemo(()=>{
  const counts=new Map<string,number>();
  for(const answer of state.attempts){
   const day=dateKey(answer.at,state.profile.timezone);
   counts.set(day,(counts.get(day)||0)+1);
  }
  return counts;
 },[state.attempts,state.profile.timezone]);
 const bestDay=[...daily].filter(([day])=>day<=today).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0];
 const weeks=Array.from({length:26},(_,week)=>Array.from({length:7},(_,day)=>addDays(today,-181+week*7+day)));
 const activeDays=[...daily].filter(([day])=>day>=weeks[0][0]&&day<=today).length;
 return <>
  <Card className="personal-bests">
   <h2>Personal bests</h2>
   <div className="stat-pairs">
    <div><strong>{bestDay?.[1]||0}</strong><small>most answers in a day{bestDay?" · "+bestDay[0]:""}</small></div>
    <div><strong>{longestStreak(state.attempts,state.profile.timezone)}</strong><small>longest day streak</small></div>
    <div><strong>{daily.size}</strong><small>days with practice</small></div>
    <div><strong>{Object.keys(state.cards).length}</strong><small>different cards reviewed</small></div>
   </div>
  </Card>
  <Card className="study-calendar-card">
   <div className="section-head"><h2>Study calendar</h2><span className="tag">26 weeks</span></div>
   <div className="study-heatmap" role="img" aria-label={`Practice activity from ${weeks[0][0]} to ${today}. ${activeDays} active days.`}>
    {weeks.map((week,index)=><div key={index}>{week.map(day=>{
     const count=daily.get(day)||0;
     return <span key={day} className={`heat-level-${count===0?0:count<10?1:count<30?2:count<60?3:4}`} title={`${day}: ${count} answers`}/>;
    })}</div>)}
   </div>
   <div className="chart-legend"><span>{weeks[0][0]}</span><span>Less <i className="heat-level-0"/> <i className="heat-level-2"/> <i className="heat-level-4"/> More</span><span>{today}</span></div>
  </Card>
 </>;
}
