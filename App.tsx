import {StudyNotebook} from "./StudyNotebook";
import {isStudySession,MobileStudyDock,ReviewerFooter,ReviewerHeader,StudyMenu,studyPageTitle} from "./StudyNavigation";
import {StudyTargets} from "./StudyTargets";
import {StudyTimer} from "./StudyTimer";
import { PDFLibrary } from "./PDFLibrary";
import bankSummary from "./bank-summary.json";
import apacheLicense from "./apache-2.0.txt?url";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Award, BookOpen, CalendarDays, Check, ChevronRight, Flame, GraduationCap, Gamepad2, HeartPulse, Layers3, Play, ShieldCheck, Sparkles, Target, Vault } from "lucide-react";
import { subjects } from "./bank";
import { canAccessPDFs, needsUsername, priorityUsername } from "./access";
import { answeredQuestionIds, dailyAnswerCounts, dateKey, daysBetween, rating } from "./engine";
import { Provider, useApp, supabase } from "./store";
import { Card, Empty, Heading, Link, Modal, Progress, RowLink, TextLink } from "./ui";
import { BankBrowser, Diagnostic, Mocks, Results, SessionView, useStartSession, VaultView } from "./Quiz";
import { ChooseDeck, CreateDeck, FlashcardReview, Flashcards, planTasks, Planner, ResourceReader, Resources, TaskRow, useTopicList } from "./Study";
import { Achievements, HistoryView, Login, Performance, Profile, Settings, useBadges, useStats } from "./Progress";
import { Practice, Setup, Topics, TopicDetail } from "./TopicViews";
import {StudyWall,WallPreview} from "./StudyWall";
import {usePlayPresence} from "./play-presence";
const StudyMotion=lazy(()=>import("./StudyMotion"));
const PlayArea=lazy(()=>import("./Play"));
const motionRoutes=new Set(["/login","/dashboard","/topics","/resources","/practice"]);
function StudyCount({value}:{value:number}){return <><span className="study-count-readable">{value}</span><span aria-hidden="true" className="study-count" data-study-count={value}>{value}</span></>;}
function Dashboard(){const {state,bank}=useApp(),stats=useStats(),badges=useBadges(),topics=useTopicList(),start=useStartSession();const today=dateKey(Date.now(),state.profile.timezone),tasks=planTasks(today,state,topics),done=tasks.filter(t=>t.done).length;const hour=Number(new Intl.DateTimeFormat("en-GB",{hour:"numeric",hourCycle:"h23",timeZone:state.profile.timezone}).format(new Date()));const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";const last=state.sessions.filter(s=>!s.finishedAt).at(-1);const todayCount=dailyAnswerCounts(state.attempts,state.profile.timezone).get(today)??0,answeredIds=answeredQuestionIds(state.attempts);const nextBadge=badges.find(b=>b.value<b.target);return <><div className="welcome"><StudyNotebook className="welcome-notebook"/><Link to="/profile" className="avatar" title="Your profile" ><span style={{background:state.profile.color}}>{state.profile.name.slice(0,2).toUpperCase()}</span></Link><div><p className="welcome-kicker">Your nursing study space</p><h1>{greeting}, {state.profile.name||"Future RN"}!</h1><p className="welcome-summary">Choose a topic and build confidence with each case.</p><Link to="/practice" className="btn primary welcome-action">Practice questions<ArrowRight size={15}/></Link></div><span className="welcome-date">{new Date().toLocaleDateString("en-PH",{weekday:"long",month:"short",day:"numeric",timeZone:state.profile.timezone})}</span></div><div className="home-stats"><Link to="/achievements" className="stat streak-stat"><small><Flame size={14}/>Streak</small><strong><StudyCount value={stats.streak}/> {stats.streak===1?"day":"days"}<Check size={14}/></strong></Link><Link to="/schedule" className="stat target-stat"><small><CalendarDays size={14}/>Your target</small><strong><StudyCount value={Math.max(0,daysBetween(today,state.profile.examDate))}/> days <span>· {new Date(state.profile.examDate+"T12:00:00Z").toLocaleDateString("en-PH",{month:"short",day:"numeric"})}</span></strong></Link><Link to="/performance" className="stat"><small><Target size={14}/>Today’s practice</small><strong><StudyCount value={todayCount}/><span> / {state.preferences.questionGoal} questions</span></strong></Link><Link to="/mock" className="stat"><small><GraduationCap size={15}/>Mock boards</small><strong><StudyCount value={stats.completedBoards}/><span> / 5 completed</span></strong></Link></div><Link to="/play" className="home-play-link"><span className="tile-icon"><Gamepad2 size={21}/></span><div><strong>Play a quick round</strong><p>Solo recall, live matches, and group games</p></div><ArrowRight size={17}/></Link>{last&&<Link to={`/session/${last.id}`} className="resume-banner"><span className="tile-icon"><Play size={18}/></span><div><small>{Object.values(last.answers).filter(a=>a.selected>=0).length} of {last.questionIds.length} answered</small><strong>Continue {last.title.toLowerCase()}</strong></div><ArrowRight size={18}/></Link>}<WallPreview/><div className="home-grid"><div className="home-main"><Card className="today-card"><div className="section-head"><h2><CalendarDays size={18}/>Today’s Plan</h2><span className="tag">{done} / {tasks.length} done</span></div><Progress value={done} max={tasks.length}/><small className="muted">{tasks.length?Math.round(done/tasks.length*100):0}% of today complete. One step at a time.</small><div className="task-list">{tasks.map(t=><TaskRow key={t.id} task={t}/>)}</div><TextLink to="/schedule">Open your Study Plan</TextLink></Card>{!state.sessions.some(s=>s.kind==="diagnostic"&&s.finishedAt)&&<Link to="/diagnostic" className="diagnostic-banner"><span className="tile-icon"><Sparkles size={22}/></span><div><small>A good place to begin</small><h2>Find your starting point.</h2><p>30 questions across all five NPs. A clearer picture of what to study next.</p><strong>Take the 25-minute diagnostic <ArrowRight size={15}/></strong></div><ChevronRight size={19}/></Link>}<Card><div className="section-head"><h2>Study by subject</h2><TextLink to="/performance/topics">Topic Mastery</TextLink></div><p className="muted">Quick sets use situational nursing questions. Custom practice also offers concepts and comparisons.</p><div className="subject-tiles">{stats.bySubject.map(s=>{const pool=bank.filter(q=>q.subject===s.id),size=pool.length,answered=pool.filter(q=>answeredIds.has(q.id)).length,score=rating(s.attempts,10);return <button className="subject-tile" key={s.id} onClick={()=>start({subject:s.id,count:20,quick:true})}><span className="subject-code" style={{color:s.color,background:s.color+"16"}}>{s.short}</span><div><strong>{s.name}</strong><small>{answered} of {size} answered {score!==null&&`· ${score.toFixed(1)} rating`}</small><Progress value={answered} max={size}/></div><ChevronRight size={15}/></button>;})}</div></Card><Card className="daily-practice"><div><h2>A little practice goes a long way.</h2><p>Work through priorities, safety decisions, and clinical reasoning.</p></div><button className="btn primary" onClick={()=>start({quick:true})}>Start a challenge set<ArrowRight size={16}/></button></Card></div><aside className="home-aside"><StudyTargets/>{nextBadge&&<Link to="/achievements" className="next-badge"><Award size={24}/><div><small>Your next milestone</small><strong>{nextBadge.name}</strong><Progress value={nextBadge.value} max={nextBadge.target}/><small>{nextBadge.target-nextBadge.value} to go</small></div><ChevronRight size={16}/></Link>}<Card className="explore"><h2>Explore</h2><RowLink to="/questions" title="Question library" description="Read questions & rationales" icon={<BookOpen size={18}/>}/><RowLink to="/decks" title="Flashcards" description="Keep the important facts" icon={<Layers3 size={18}/>}/><RowLink to="/resources" title="Resources" description="Topic notes & quick references" icon={<BookOpen size={18}/>}/><RowLink to="/achievements" title="Achievements" description="Your progress, recognized" icon={<Award size={18}/>}/></Card><div className="quiet-note"><ShieldCheck size={19}/><p>Built for your study rhythm.<br/>Your progress stays yours.</p></div></aside></div></>;}
function Help({about=false}:{about?:boolean}){
 const {user,username,sharedProfile}=useApp();
 const faq=[
  ["Where do the questions come from?",`${bankSummary.total.toLocaleString()} questions are published across all ${bankSummary.topics} catalog topics: ${bankSummary.situational.toLocaleString()} situational questions, 51 other earlier standalone questions, ${bankSummary.concept.toLocaleString()} source-based concept checks, ${bankSummary.comparison} reference comparisons, and ${bankSummary.sourceCorrections} corrected source items. Every item has four choices, a key, and explanations for all choices. The situational collection includes 600 earlier linked questions, ${(bankSummary.newSituational-bankSummary.standaloneSituational).toLocaleString()} questions in ${bankSummary.newSituations} seven-part case sets, and ${bankSummary.standaloneSituational} additional standalone scenarios, one per topic. Linked cases test recognition, action, teaching, safety, planning, evaluation, and reasoning. Each case records its clinical reference. Concept and comparison questions use licensed Open RN reference facts. They are not copied BoardPal or official PNLE questions. Independent clinical review has not been completed. Topic depth varies.`],
  ["Can I choose the type of question?","Yes. Use Question collection in Practice, custom sets, the question library, or custom flashcards. Situational questions are the default for quick practice, diagnostics, mocks, and flashcards. You can also choose earlier clinical and standalone questions, concept checks, comparisons, or a mixed set. A concept check identifies a term; a comparison tests a specific mechanism, finding, function, or care principle."],
  ["How does practice mode work?","Choose an answer, optionally tag your confidence, then submit. You immediately see the correct answer, a rationale, and explanations for the alternatives. You can take notes and bookmark the question. New reference-based items include a source link for every choice."],
  ["How is exam mode different?","Answers and rationales stay hidden until you submit the session. You can change choices and move between questions before submitting. Unanswered questions count as incorrect in the result."],
  ["How does the full Study Plan work?","Plan settings maps every selected topic into your date range, with reading, practice, optional flashcards, and all five mock boards. Choose rest days, a daily time budget, and subjects to study first. The planner reports overloaded days instead of omitting topics. Manage a task to move, rename, skip, or restore it. Catch up spreads overdue tasks over the next week and offers undo. Rebalance spreads unfinished work over the remaining study days. Changing settings rebuilds unfinished generated tasks while keeping completed work and custom tasks."],
  ["How does the study timer work?","Pomodoro alternates focus, short breaks, and a long break after your chosen number of sprints. You can choose the lengths, automatic phase starts, and sound volume, or use the stopwatch. Only focus and stopwatch time count toward study hours. The daily chart records timed sessions from this update onward; earlier total hours are kept. The timer stays with you between study pages and pauses when you leave, reload, switch profiles, or open a timed mock or diagnostic."],
  ["Does a retry change my first-try rating?","No. Performance uses the earliest attempt on each question. By default, a successful retry clears the question from your Vault. If you turn on spaced Vault review, it takes two correct reviews at least seven days apart. Your original baseline never changes."],
  ["How are flashcards scheduled?","Again schedules the next review in one minute. Hard, Good, and Easy give increasingly longer intervals. Successful repeated reviews expand the interval. Imported text cards use the same scheduler."],
  ["Will I lose my work if I close the tab?","Your username profile saves progress on this browser and syncs with Supabase. Return using the same browser to reopen it. Export a backup before clearing browser data or moving devices. Each profile has separate answers; anyone using this browser can open its remembered profiles. The mock clock continues while the tab is closed."],
  ["Where are the PDFs?",`The PDF library is reserved for the ${priorityUsername} username. Open Resources → PDF library. Download an original topic review individually, or download all topic PDFs in one ZIP. Each guide includes short case summaries, key decisions, and clickable sources. Official publisher PDFs and BoardPal online readers open on their own sites. Your account details, personal notes, and study progress are not included in the PDF export.`],
  ["Can I import my own question bank?","Yes. In Settings, download the sample format and import an authorized JSON export. Each question must contain four distinct choices, a valid correctIndex, a rationale, and an explanation for every choice."],
  ["Does this include subscriptions or payments?","No. All built-in study features and questions are available without a subscription, paywall, or checkout."],
  ["Is the projected rating official?","No. It is an illustrative estimate: 40 + raw accuracy × 0.6. It is not an official PRC formula, a validated prediction, or a guarantee of passing."],
  ["Is this affiliated with BoardPal or PRC?","No. This is an independent study application inspired by the reference app’s useful workflows. Consult current official PRC materials for examination requirements."]
 ];
 return <><Heading title={about?"About For Elaine Only Reviewer":"Help & Support"} description={about?"A calmer place to practice, understand, and keep going.":"A little guidance for your next study session."}/>{about&&<Card className="reader"><h2>Your daily review companion</h2><p>Questions, answer rationales, topic notes, flashcards, mock practice, and study progress share one personal workspace. There are no subscriptions or payment features.</p><h2>Content and sources</h2><p>The expanded bank includes original question designs built from <a href="https://www.ncbi.nlm.nih.gov/books/NBK590025/" target="_blank" rel="noreferrer">Open RN nursing textbooks</a>, edited by Kimberly Ernstmeyer and Elizabeth Christman and published by Chippewa Valley Technical College / WisTech Open. Myra Reuter-Sandquist also authored Nursing Assistant. Reference wording is adapted under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. The situational cases and clinical decisions are original educational writing informed by the cited references. Other changes include converting definitions and table relationships into four-choice questions and adding answer and alternative explanations. Each item identifies its book, chapter, and reference. No author endorsement is implied.</p><p>The two corrected source items originate in <a href="https://huggingface.co/datasets/openlifescienceai/medmcqa" target="_blank" rel="noreferrer">MedMCQA</a> by Ankit Pal, Logesh Kumar Umapathi, and Malaikannan Sankarasubbu (2022), adapted under its published <a href={apacheLicense} target="_blank" rel="noreferrer">Apache 2.0 dataset license</a>. Their scenarios and per-choice explanations were substantially corrected using NHS, CDC, and NICE references. The larger research candidate was withheld after contradictory keys were found and is not included.</p><p>Source matching and automated checks do not replace independent clinical review. These are educational practice materials; use the linked references for full context and current guidance. The app does not connect to or submit anything on your BoardPal account.</p></Card>}<Card><RowLink to="/resources/guide" title="Start here — your study rhythm" description="Recall, understand, and revisit" icon={<BookOpen size={21}/>}/><RowLink to="/settings" title="Backups & imports" description="Keep a copy of your work" icon={<ShieldCheck size={21}/>}/></Card><h2 className="spaced-title">Frequently asked questions</h2><Card className="faq">{faq.filter(([question])=>question!=="Where are the PDFs?"||canAccessPDFs(username,!!user,sharedProfile)).map(([question,answer])=><details key={question}><summary>{question}<PlusIcon/></summary><p>{answer}</p></details>)}</Card></>;
}
function PlusIcon(){return <span className="plus-symbol">+</span>;}
function studyPage(route:string,path:string){
 const segment=route.split("/")[2];
 if(route==="/play"||route.startsWith("/play/"))return <Suspense fallback={<div className="loading" role="status">Opening Play…</div>}><PlayArea key={path} route={route}/></Suspense>;
 if(route.startsWith("/session/"))return <SessionView key={route} id={segment}/>;
 if(route.startsWith("/results/"))return <Results key={route} id={segment}/>;
 if(route.startsWith("/topics/"))return <TopicDetail key={route} slug={segment}/>;
 if(/^\/mock\/[1-5]$/.test(route))return <Mocks board={Number(segment)}/>;
 switch(route){
  case "/":
  case "/dashboard":return <Dashboard/>;
  case "/practice":return <Practice/>;
  case "/practice/session":return <Setup key={path}/>;
  case "/topics":return <Topics/>;
  case "/questions":return <BankBrowser/>;
  case "/vault":return <VaultView/>;
  case "/diagnostic":
  case "/welcome":return <Diagnostic/>;
  case "/mock":return <Mocks/>;
  case "/decks":return <Flashcards/>;
  case "/decks/review":return <FlashcardReview key={path}/>;
  case "/decks/custom":return <ChooseDeck/>;
  case "/decks/new":return <CreateDeck/>;
  case "/decks/import":return <CreateDeck importing/>;
  case "/schedule":return <Planner/>;
  case "/wall":return <StudyWall/>;
  case "/resources":return <Resources/>;
  case "/resources/pdfs":return <PDFLibrary key={path}/>;
  case "/resources/read":return <ResourceReader key={path}/>;
  case "/resources/guide":return <ResourceReader guide/>;
  case "/resources/bookmarks":return <BankBrowser saved/>;
  case "/resources/notes":return <BankBrowser notes/>;
  case "/performance":return <Performance/>;
  case "/performance/topics":return <Performance topicsOnly/>;
  case "/history":return <HistoryView/>;
  case "/achievements":return <Achievements/>;
  case "/profile":return <Profile/>;
  case "/settings":return <Settings/>;
  case "/login":return <Login/>;
  case "/help":return <Help/>;
  case "/about":return <Help about/>;
  default:return <Empty title="Page unavailable" description="Open the study notebook to find a page." action={<Link to="/dashboard" className="btn primary">Go home</Link>}/>;
 }
}

const tourSteps=[
 {title:"Your daily review, in one place",icon:CalendarDays,description:"Start with Today’s Plan, or choose a subject. The dashboard tracks your answers, streak, and progress."},
 {title:"Learn from every answer",icon:BookOpen,description:"Practice shows rationales after each answer. Exams show them after you submit. Flag questions, take notes, cross out choices, and revisit misses in the Vault."},
 {title:"Keep what you learn",icon:Layers3,description:"Review due flashcards, read topic notes, and use mock boards to build endurance. Settings lets you export a backup or import your own questions."},
];

function Shell(){
 const {state,path,ready,sync,user,profileId,navigate,accessError,retryContent,switchProfile}=useApp();
 const mainRef=useRef<HTMLElement>(null);
 const focusedPath=useRef(path);
 const [menu,setMenu]=useState(false);
 const [tour,setTour]=useState(-1);
 const route=path.split("?")[0].replace(/\/+$/,"")||"/";
 usePlayPresence(ready&&user&&!accessError?profileId:"",route);
 const allowed=!!user||!needsUsername(route);
 const sessionPage=isStudySession(route);
 const session=sessionPage?state.sessions.find(entry=>entry.id===route.split("/")[2]):undefined;
 const primaryRoute=sessionPage?(session?.kind==="mock"?"/mock":"/practice"):route==="/"?"/dashboard":"/"+route.split("/")[1];
 const gameScreen=route.startsWith("/play/")&&route!=="/play/history";
 const showDock=!!user&&ready&&!accessError&&!sessionPage&&!gameScreen&&route!=="/login"&&route!=="/decks/review";
 const step=tourSteps[tour];

 useEffect(()=>{
  if(ready&&!allowed)navigate("/login?returnTo="+encodeURIComponent(path),{replace:true});
 },[ready,allowed,path,navigate]);

 useEffect(()=>{setMenu(false);setTour(-1);},[path]);

 useEffect(()=>{
  document.title=studyPageTitle(route,session?.title)+" — For Elaine Only Reviewer";
 },[route,session?.title]);

 useEffect(()=>{
  if(ready&&allowed&&focusedPath.current!==path){
   focusedPath.current=path;
   mainRef.current?.focus({preventScroll:true});
  }
 },[path,ready,allowed]);

 return <div className={showDock?"reviewer-shell has-study-dock":"reviewer-shell"}>
  <a className="skip-link" href="#main">Skip to content</a>
  <ReviewerHeader route={route} active={primaryRoute} menuOpen={menu} onMenu={()=>setMenu(true)} onTour={()=>setTour(0)}/>
  <main id="main" tabIndex={-1} ref={mainRef} className={route.startsWith("/session/")?"main-shell session-shell":"main-shell"}>
   {!ready?<div className="loading" role="status"><span className="brand-mark" aria-hidden="true"><HeartPulse size={23}/></span><p>{sync==="Saving your profile…"?"Saving your study progress…":"Opening your study workspace…"}</p></div>
    :accessError?<Empty title="Study workspace unavailable" description={accessError} action={<div className="button-row">
     <button className="btn primary" onClick={retryContent}>Try again</button>
     <button className="btn" onClick={()=>void switchProfile()}>Switch profile</button>
    </div>}/>:allowed?studyPage(route,path):<Login/>}
   {ready&&!accessError&&allowed&&motionRoutes.has(route)&&<Suspense fallback={null}><StudyMotion scope={mainRef} route={route} paused={menu||!!step}/></Suspense>}
  </main>
  <ReviewerFooter/>
  {showDock&&<MobileStudyDock route={route} active={primaryRoute}/>}
  {user&&!accessError&&ready&&<StudyTimer key={user.id}/>}
  {menu&&<StudyMenu route={route} active={primaryRoute} onClose={()=>setMenu(false)} onTour={()=>setTour(0)}/>}
  {step&&<Modal title={step.title} onClose={()=>setTour(-1)}>
   <span className="tour-icon" aria-hidden="true"><step.icon size={34}/></span>
   <p>{step.description}</p>
   <div className="section-head"><small>{tour+1} of {tourSteps.length}</small>
    <button className="btn primary" onClick={()=>setTour(tour+1===tourSteps.length?-1:tour+1)}>{tour+1===tourSteps.length?"Let’s study":"Next"}<ArrowRight size={15}/></button>
   </div>
  </Modal>}
 </div>;
}
export default function App(){return <Provider><Shell/></Provider>;}
