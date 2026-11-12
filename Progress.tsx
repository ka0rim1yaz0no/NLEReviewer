import {StudyTargets} from "./StudyTargets";
import {StudyHabits,StudyInsights} from "./StudyInsights";
import { useState } from "react";
import { ArrowRight, Award, BarChart3, BookOpen, Check, ChevronDown, Clock, Download, Flame, History, Layers3, Target, Trophy, Upload, User } from "lucide-react";
import { subjects, validateQuestions, normalizeQuestionStem } from "./bank";
import { curriculum, questionsForTopic } from "./curriculum";
import { addDays, dailyAnswerCounts, dateKey, firstAttempts, initialState, rating, sessionScore, streak, longestStreak } from "./engine";
import type { State } from "./engine";
import { completedMockSubjects, mockAttempts } from "./mock-progress";
import { download, supabase, useApp, validateBackup } from "./store";
import { Card, Empty, Heading, Link, Modal, Progress, RowLink, SearchBox, TextLink } from "./ui";
export function useStats(){const {state,bankMap}=useApp();const first=firstAttempts(state.attempts);const completedBoards=[1,2,3,4,5].filter(board=>mockAttempts(state.sessions,board).some(([,sections])=>completedMockSubjects(sections).length===5)).length;return {first,correct:first.filter(a=>a.correct).length,projected:rating(first,40),streak:streak(state.attempts,state.profile.timezone,state.gameRuns),longestStreak:longestStreak(state.attempts,state.profile.timezone,state.gameRuns),completedBoards,bySubject:subjects.map(s=>({...s,attempts:first.filter(a=>bankMap.get(a.questionId)?.subject===s.id)}))};}
const performanceViews = ["Subjects", "Trend", "Habits", "Mocks"] as const;

export function Performance({topicsOnly=false}:{topicsOnly?:boolean}){
 const {state,bank,bankMap}=useApp();
 const stats=useStats();
 const [view,setView]=useState<typeof performanceViews[number]>("Subjects");
 const [subject,setSubject]=useState("all");
 const [search,setSearch]=useState("");
 const today=dateKey(Date.now(),state.profile.timezone);
 const showTopics=topicsOnly||view==="Subjects";
 const topicList=showTopics?curriculum.filter(topic=>(subject==="all"||topic.subject===subject)&&topic.name.toLowerCase().includes(search.trim().toLowerCase())):[];
 const subjectsOptions=<><option value="all">All subjects</option>{subjects.map(item=><option key={item.id} value={item.id}>{item.short}</option>)}</>;
 const trend=state.sessions.filter(session=>session.finishedAt&&(subject==="all"||session.subject===subject)).slice(-15).map((session,index,series)=>{
  const accuracy=sessionScore(session,bankMap)/Math.max(1,session.questionIds.length);
  return {id:session.id,title:session.title,accuracy,x:30+index*750/Math.max(1,series.length-1),y:155-accuracy*140};
 });
 const days=Array.from({length:14},(_,index)=>addDays(today,index-13));
 const daily=dailyAnswerCounts(state.attempts,state.profile.timezone);
 const counts=days.map(day=>daily.get(day)??0);
 const max=Math.max(5,...counts);
 const firstById=new Map(stats.first.map(answer=>[answer.questionId,answer]));
 const tries=stats.first.length;
 const accuracy=tries?Math.round(stats.correct/tries*100)+"%":"—";

 return <>
  {topicsOnly?<Heading title="Topic Mastery" description="See first-try accuracy for every topic."/>:<>
   <Card className="study-banner performance-overview">
    <div className="performance-rating">
     <h1>Performance</h1>
     <small>Projected rating</small>
     <strong className="study-metric">{stats.projected?.toFixed(1)||"—"}</strong>
     {stats.projected===null
      ? <><Progress value={tries} max={40} label="First tries needed for a rating"/><small>{40-tries} more first-try answers unlock your estimate.</small></>
      : <><Progress value={Math.max(0,stats.projected-40)} max={35} label="Progress toward a 75 rating"/><small>Target 75 · estimated from {tries.toLocaleString()} first tries</small></>}
     <p className="fine-print">The projected rating uses 40 + (first-try accuracy × 60) as a study estimate. Official results come from the PRC.</p>
    </div>
    <dl className="study-summary-grid">
     <div><dt>Questions tried</dt><dd>{tries.toLocaleString()}</dd></div>
     <div><dt>First-try accuracy</dt><dd>{accuracy}</dd></div>
     <div><dt>Day streak</dt><dd>{stats.streak}</dd></div>
     <div><dt>Mock boards</dt><dd>{stats.completedBoards}/5</dd></div>
    </dl>
   </Card>
   <StudyTargets inPerformance/>
   <StudyInsights/>
   <div className="tabs study-view-tabs" aria-label="Performance details">
    {performanceViews.map(label=><button key={label} type="button" aria-pressed={view===label} className={view===label?"active":""} onClick={()=>setView(label)}>{label}</button>)}
   </div>
   {view==="Subjects"&&<Card className="performance-subjects">
    <div className="section-head"><h2>Subjects</h2><TextLink to="/performance/topics">All topics</TextLink></div>
    {stats.bySubject.map(item=>{
     const score=rating(item.attempts,10);
     const total=bank.filter(question=>question.subject===item.id).length;
     return <details key={item.id} className="performance-subject">
      <summary><span className="subject-code">{item.short}</span><strong>{item.name}</strong><span>{score?.toFixed(1)||"—"}</span><ChevronDown size={17} aria-hidden="true"/></summary>
      <div className="performance-subject-body">
       <small>{item.attempts.length.toLocaleString()} of {total.toLocaleString()} tried</small>
       <Progress value={item.attempts.length} max={total} label={item.name+" progress"}/>
       <TextLink to={"/practice/session?np="+item.id}>Practice {item.short}</TextLink>
      </div>
     </details>;
    })}
   </Card>}
   {view==="Trend"&&<Card>
    <div className="section-head"><h2>Practice accuracy over time</h2><select aria-label="Chart subject" value={subject} onChange={event=>setSubject(event.target.value)}>{subjectsOptions}</select></div>
    {trend.length?<div className="accuracy-chart">
     <svg viewBox="0 0 800 180" role="img" aria-label="Accuracy across completed sessions">
      <path d="M30 15 H780 M30 85 H780 M30 155 H780" stroke="var(--line)" fill="none"/>
      <polyline fill="none" stroke="var(--sage)" strokeWidth="3" points={trend.map(point=>point.x+","+point.y).join(" ")}/>
      {trend.map(point=><circle key={point.id} cx={point.x} cy={point.y} r="5" fill="var(--green)"><title>{point.title} · {Math.round(point.accuracy*100)}%</title></circle>)}
     </svg>
     <small>Each point is one completed session, ordered from oldest to newest.</small>
    </div>:<Empty icon={<BarChart3/>} title="Complete a practice set to see your trend" description="Your completed sessions will appear here." action={<Link to="/practice" className="btn small">Start practicing</Link>}/>}
   </Card>}
   {view==="Habits"&&<>
    <Card>
     <div className="section-head"><h2>Study habits</h2><span className="tag">Last 14 days</span></div>
     <div className="bar-chart" role="img" aria-label={"Daily question counts: "+days.map((day,index)=>day+" "+counts[index]).join(", ")}>
      {days.map((day,index)=><div className="bar-column" key={day} title={day+" · "+counts[index]+" answers"}>
       <span className="bar-value">{counts[index]||""}</span><div className="bar-track"><span style={{height:counts[index]/max*100+"%"}}/></div><small>{Number(day.slice(-2))}</small>
      </div>)}
     </div>
     <div className="chart-legend"><span>{counts.reduce((total,count)=>total+count,0)} answers in 14 days</span><span>{stats.streak} day streak</span></div>
    </Card>
    <StudyHabits/>
   </>}
   {view==="Mocks"&&<Card>
    <div className="section-head"><h2>Mock Board progress</h2><TextLink to="/mock">All mock boards</TextLink></div>
    {[1,2,3,4,5].map(board=>{
     const attempts=mockAttempts(state.sessions,board);
     const counts=attempts.map(([,sections])=>completedMockSubjects(sections).length);
     return <RowLink key={board} to={"/mock/"+board} title={"Mock Board #"+board}
      description={counts.includes(5)?"Completed":counts.length?counts[0]+" of 5 sections submitted":"Ready to start"} icon={<Trophy size={19}/>}/>;
    })}
   </Card>}
  </>}
  {showTopics&&<>
   <div className="section-head spaced-title"><h2>Topic accuracy</h2>
    <select aria-label="Filter subject" value={subject} onChange={event=>setSubject(event.target.value)}>{subjectsOptions}</select>
   </div>
   <SearchBox value={search} onChange={setSearch}/>
   <Card><div className="topic-table">
    <div className="table-head"><span>Topic</span><span>Tried</span><span>First-try accuracy</span></div>
    {topicList.map(topic=>{
     const questions=questionsForTopic(topic,bank);
     const attempts=questions.flatMap(question=>{
      const answer=firstById.get(question.id);
      return answer?[answer]:[];
     });
     const percent=attempts.length?Math.round(attempts.filter(answer=>answer.correct).length/attempts.length*100):null;
     return <Link className="table-row" key={topic.slug} to={"/topics/"+topic.slug}>
      <div><strong>{topic.name}</strong><small>{topic.subject==="CROSS"?"F&F":topic.subject}</small></div>
      <span>{attempts.length}/{questions.length}</span><span className={percent!==null&&percent<60?"danger":""}>{percent===null?"Not started":percent+"%"}</span>
     </Link>;
    })}
   </div>{!topicList.length&&<Empty title="No matching topics" description="Try another subject or search term."/>}</Card>
  </>}
 </>;
}
export function HistoryView(){
 const {state,bankMap}=useApp();
 const [filter,setFilter]=useState("all");
 const timezone=state.profile.timezone;
 const today=dateKey(Date.now(),timezone),yesterday=addDays(today,-1);
 const groups=new Map<string,typeof state.sessions>();
 for(const session of [...state.sessions].reverse()){
  const practice=filter==="practice"&&["practice","exam"].includes(session.kind);
  if(filter!=="all"&&!practice&&session.kind!==filter)continue;
  const day=dateKey(session.startedAt,timezone);
  const group=groups.get(day)||[];
  group.push(session);
  groups.set(day,group);
 }
 return <>
  <Card className="study-banner history-overview">
   <div><h1>History</h1><p>Open a saved set to resume it or review its answers.</p></div>
   <div className="vault-count"><strong className="study-metric">{state.sessions.length.toLocaleString()}</strong><span>sets saved</span></div>
  </Card>
  <div className="tabs study-view-tabs history-filters" aria-label="Filter saved sets">
   {[["all","All"],["practice","Practice"],["mock","Mock boards"],["diagnostic","Diagnostics"]].map(([id,label])=><button key={id}
    type="button" aria-pressed={filter===id} className={filter===id?"active":""} onClick={()=>setFilter(id)}>{label}</button>)}
   <Link to="/play/history" className="btn">Games</Link>
  </div>
  {[...groups].sort(([a],[b])=>b.localeCompare(a)).map(([day,sessions])=><section key={day} className="history-day">
   <div className="section-head">
    <h2>{day===today?"Today":day===yesterday?"Yesterday":new Date(day+"T12:00:00Z").toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric",timeZone:"UTC"})}</h2>
    <small>{sessions.length} {sessions.length===1?"set":"sets"}</small>
   </div>
   <Card>{sessions.map(session=>{
    const detail=session.finishedAt?Math.round(sessionScore(session,bankMap)/Math.max(1,session.questionIds.length)*100)+"% accuracy"
     :Object.values(session.answers).filter(answer=>answer.selected>=0).length+" answered · in progress";
    return <RowLink key={session.id} to={(session.finishedAt?"/results/":"/session/")+session.id} title={session.title}
     description={session.questionIds.length+" "+(session.questionIds.length===1?"question":"questions")+" · "+detail}
     icon={session.finishedAt?<Check size={20}/>:<Clock size={20}/>}/>;
   })}</Card>
  </section>)}
  {!groups.size&&<Empty icon={<History/>} title="No saved sets here" description="Complete a practice set, diagnostic, or mock section to see it here."
   action={<Link to="/practice" className="btn primary">Start practicing<ArrowRight size={16}/></Link>}/>}
 </>;
}
export function useBadges(){const {state}=useApp(),stats=useStats();return [
  {name:"First Step",description:"Try 10 different questions.",value:stats.first.length,target:10,icon:BookOpen},
  {name:"Plan in Motion",description:"Complete a task on your study plan.",value:state.tasks.filter(t=>t.done).length,target:1,icon:Target},
  {name:"Flashcard First",description:"Review 20 different flashcards.",value:Object.keys(state.cards).length,target:20,icon:Layers3},
  {name:"First Mock Board",description:"Complete all five sections of a mock.",value:stats.completedBoards,target:1,icon:Trophy},
  {name:"100 Questions",description:"Try 100 different questions.",value:stats.first.length,target:100,icon:Award},
  {name:"Streak Starter",description:"Answer questions 3 days in a row.",value:stats.longestStreak,target:3,icon:Flame},
  {name:"500 Questions",description:"Try 500 different questions.",value:stats.first.length,target:500,icon:Award},
  {name:"Seven Days",description:"Answer questions 7 days in a row.",value:stats.longestStreak,target:7,icon:Flame},
];}
export function Achievements(){
 const badges=useBadges();
 const earned=badges.filter(badge=>badge.value>=badge.target).length;
 const next=badges.filter(badge=>badge.value<badge.target).sort((a,b)=>b.value/b.target-a.value/a.target)[0];
 return <>
  <Card className="study-banner achievement-summary">
   <h1>Achievements</h1>
   <div className="vault-count"><strong className="study-metric">{earned}</strong><span>of {badges.length} badges earned</span></div>
   <Progress value={earned} max={badges.length} label="Badges earned"/>
   {next&&<div className="achievement-next">
    <next.icon size={26} aria-hidden="true"/>
    <div><small>Closest next</small><h2>{next.name}</h2><p>{next.description}</p>
     <Progress value={next.value} max={next.target} label={next.name+" progress"}/><small>{next.value} of {next.target}</small>
    </div>
   </div>}
  </Card>
  <div className="badge-grid">{badges.map(badge=><Card key={badge.name} className={badge.value>=badge.target?"badge earned":"badge"}>
   <span className="badge-icon"><badge.icon size={31} aria-hidden="true"/></span><h2>{badge.name}</h2><p>{badge.description}</p>
   {badge.value>=badge.target?<span className="tag"><Check size={13}/>Earned</span>:<>
    <Progress value={badge.value} max={badge.target} label={badge.name+" progress"}/><small>{badge.value} / {badge.target}</small>
   </>}
  </Card>)}</div>
 </>;
}
export function Profile(){
 const {state,user,username,sync}=useApp();
 const stats=useStats(),badges=useBadges();
 const name=state.profile.name||username||"Study profile";
 const target=new Date(state.profile.examDate+"T12:00:00Z").toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"});
 return <>
  <Card className="study-banner profile-overview">
   <div className="profile-identity">
    <div><h1>{name}</h1>{user&&<p>Username {username}</p>}
     <Link to="/schedule" className="text-link">Study target {target}<ArrowRight size={15}/></Link></div>
    <span className="avatar large" style={{background:state.profile.color}} aria-hidden="true">{state.profile.photo?<img src={state.profile.photo} alt=""/>:name.slice(0,2).toUpperCase()}</span>
   </div>
   <dl className="study-summary-grid">
    <div><dt>Projected rating</dt><dd>{stats.projected?.toFixed(1)||"—"}</dd></div>
    <div><dt>Day streak</dt><dd>{stats.streak}</dd></div>
    <div><dt>Questions tried</dt><dd>{stats.first.length.toLocaleString()}</dd></div>
    <div><dt>Mock boards</dt><dd>{stats.completedBoards}/5</dd></div>
   </dl>
   <Link to="/settings" className="btn">Edit profile</Link>
  </Card>
  <Card>
   <div className="section-head"><h2>Badges</h2><TextLink to="/achievements">See all</TextLink></div>
   <div className="mini-badges">{badges.map(badge=><span key={badge.name} title={badge.name+(badge.value>=badge.target?" · Earned":"")}
    className={badge.value>=badge.target?"earned":""}><badge.icon size={25}/></span>)}</div>
  </Card>
  <Card>
   <RowLink to="/settings" title="Settings" description="Profile, appearance, preferences, and backups"/>
   <RowLink to="/schedule" title="Study Plan" description={"Target "+target}/>
   <RowLink to="/help" title="Help & study guide" description="Practice, mock boards, and saved progress"/>
   <RowLink to="/about" title="About this reviewer" description="Study content and sources"/>
  </Card>
  <p className="fine-print center">{sync}</p>
 </>;
}
export function Settings(){
 const {state,update,bank,bankMap,user,username,sharedProfile,switchProfile,sync,toast,retryContent}=useApp();
 const [pending,setPending]=useState<State|null>(null);
 const [reset,setReset]=useState(false);

 function pref(key:string,value:unknown){
  update(current=>({...current,preferences:{...current.preferences,[key]:value}}));
 }

 async function backupImport(file:File){
  if(file.size>4e6){
   toast("Choose a backup smaller than 4 MB.");
   return;
  }
  try{setPending(validateBackup(JSON.parse(await file.text())));}
  catch(error){toast((error as Error).message);}
 }

 async function questionImport(file:File){
  if(file.size>4e6){
   toast("Choose a file smaller than 4 MB.");
   return;
  }
  try{
   const items=validateQuestions(JSON.parse(await file.text()));
   let message="";
   const imported=update(current=>{
    const existing=[...bankMap.values(),...current.importedQuestions];
    const ids=new Set(existing.map(question=>question.id));
    if(items.some(question=>ids.has(question.id))){
     message="Some IDs already exist. Give imported questions unique IDs.";
     return current;
    }
    const stems=new Set(existing.map(question=>normalizeQuestionStem(question.stem)));
    if(items.some(question=>stems.has(normalizeQuestionStem(question.stem)))){
     message="Some question stems already exist. Import questions with unique wording.";
     return current;
    }
    return {...current,importedQuestions:[...current.importedQuestions,...items]};
   });
   if(imported)toast(message||`${items.length} questions imported.`);
  }catch(error){toast((error as Error).message);}
 }
 return <><Heading title="Settings" description="Changes save as you make them."/><Card className="form-card"><h2>Your profile</h2><label>Display name<input maxLength={40} value={state.profile.name} onChange={e=>update(s=>({...s,profile:{...s.profile,name:e.target.value}}))}/></label><label>Full name <small>(optional)</small><input maxLength={100} value={state.profile.fullName} onChange={e=>update(s=>({...s,profile:{...s.profile,fullName:e.target.value}}))}/></label><label>Timezone<select value={state.profile.timezone} onChange={e=>update(s=>({...s,profile:{...s.profile,timezone:e.target.value}}))}>{["Asia/Manila","Asia/Singapore","Asia/Tokyo","Asia/Dubai","Asia/Riyadh","Europe/London","America/New_York","America/Los_Angeles","Australia/Sydney"].map(zone=><option key={zone}>{zone}</option>)}</select></label><label>Initials background</label><div className="color-options">{["#1b3a2d","#69849b","#8f7e9f","#b7827c","#8c7960"].map(color=><button key={color} aria-label={`Use avatar color ${color}`} aria-pressed={state.profile.color===color} style={{background:color}} onClick={()=>update(s=>({...s,profile:{...s.profile,color}}))}>{state.profile.color===color&&<Check size={17}/>}</button>)}</div></Card><Card className="form-card"><h2>Study preferences</h2><label>Daily question goal<input type="number" min={5} max={100} value={state.preferences.questionGoal} onChange={e=>pref("questionGoal",Math.max(5,Math.min(100,Number(e.target.value))))}/></label><label>Daily flashcard goal<input type="number" min={5} max={100} value={state.preferences.flashcardGoal} onChange={e=>pref("flashcardGoal",Math.max(5,Math.min(100,Number(e.target.value))))}/></label><label>Where explanations appear<select value={state.preferences.explanation} onChange={e=>pref("explanation",e.target.value)}><option value="below">Below the choices</option><option value="inside">Inside each choice</option></select></label><label>Cross-out button side<select value={state.preferences.crossSide} onChange={e=>pref("crossSide",e.target.value)}><option value="right">Right</option><option value="left">Left</option></select></label><label className="check-label"><input type="checkbox" checked={state.preferences.confidence} onChange={e=>pref("confidence",e.target.checked)}/>Show “How sure are you?” buttons</label></Card><Card><h2>Appearance</h2><div className="theme-options">{[["light","Light pink"],["white","Pure white"],["dark","Dark"],["system","System"]].map(([id,label])=><button key={id} aria-pressed={state.preferences.theme===id} className={state.preferences.theme===id?"selected":""} onClick={()=>pref("theme",id)}><span className={`theme-swatch ${id}`}><span/></span>{label}</button>)}</div></Card><Card className="form-card"><h2>Account & sync</h2><p>{sync}</p>{user?<><p>Username: {username}</p>{sharedProfile&&<p>Use this username on any browser or device to open the same progress and PDFs. Anyone entering this username can access this shared profile.</p>}<div className="button-row"><button className="btn" onClick={()=>void switchProfile()}>Switch profile</button><button className="btn" onClick={retryContent}>Reconnect sync</button></div></>:<><p>Choose a username to keep your answers, notes, and progress in a separate study profile.</p><Link className="btn" to="/login">Choose a study profile</Link></>}</Card><Card className="form-card"><h2>Your data, kept safe</h2><p>Export a backup before switching devices or clearing browser data. Importing a backup replaces this workspace’s saved progress.</p><div className="button-row"><button className="btn" onClick={()=>download(`nle-reviewer-backup-${dateKey()}.json`,JSON.stringify(state,null,2))}><Download size={16}/>Export backup</button><label className="btn file-button"><Upload size={16}/>Import backup<input aria-label="Import study backup" type="file" accept="application/json,.json" onChange={e=>{const f=e.target.files?.[0];if(f)void backupImport(f);e.target.value="";}}/></label></div><button className="text-button danger" onClick={()=>setReset(true)}>Reset progress in this workspace</button></Card><Card className="form-card"><h2>Question bank</h2><p>{bank.length} questions available. You can import an authorized export using the sample JSON structure. Every choice needs its own explanation.</p><div className="button-row"><button className="btn" onClick={()=>download("nle-question-format.json",JSON.stringify([{...bank[0],id:"my-import-001",origin:"Your authorized content"}],null,2))}>Download sample format</button><label className="btn file-button"><Upload size={16}/>Import questions<input aria-label="Import questions JSON" type="file" accept=".json" onChange={e=>{const f=e.target.files?.[0];if(f)void questionImport(f);e.target.value="";}}/></label><button className="btn" onClick={()=>download("nle-question-bank.json",JSON.stringify(bank,null,2))}><Download size={16}/>Export full bank</button></div></Card>{pending&&<Modal title="Replace this workspace with your backup?" onClose={()=>setPending(null)}><p>The backup has {pending.attempts.length} answers and {pending.sessions.length} sessions. Export your current progress first if you want to keep both copies.</p><div className="button-row end"><button className="btn" onClick={()=>setPending(null)}>Cancel</button><button className="btn primary" onClick={()=>{update(()=>pending);setPending(null);toast("Backup restored.");}}>Restore backup</button></div></Modal>}{reset&&<Modal title="Reset your study progress?" onClose={()=>setReset(false)}><p>This clears answers, sessions, notes, and review schedules in this workspace. Export a backup first to keep a recoverable copy.</p><div className="button-row end"><button className="btn" onClick={()=>setReset(false)}>Keep progress</button><button className="btn primary" onClick={()=>{update(s=>({...initialState(),profile:s.profile,preferences:s.preferences,importedQuestions:s.importedQuestions,customCards:s.customCards}));setReset(false);toast("Progress reset. Your profile and imported content were kept.");}}>Reset progress</button></div></Modal>}</>;}
export { default as Login } from "./UsernameLogin";
