import {flashcardQueue} from "./question-selection";
import {TopicReviewNotes} from "./TopicReviewNotes";
import {StudyPlanner} from "./Planner";
import {playStudyTone} from "./study-sound";
import { canAccessPDFs } from "./access";
import { inCollection, isSituational, parseCollection } from "./collections";
import type { Collection } from "./collections";
import { CollectionPicker } from "./CollectionPicker";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Download, Layers3, Plus, RotateCcw, Upload } from "lucide-react";
import { clinicalCases, subjects } from "./bank";
import { addDays, dateKey, daysBetween, firstAttempts, parseFlashcardText, scheduleCard } from "./engine";
import type { State, Task } from "./engine";
import { download, useApp } from "./store";
import { Card, Empty, Heading, Link, Modal, Progress, RowLink, SearchBox, TextLink } from "./ui";
import { useStartSession, QuestionProvenance } from "./Quiz";
import { TopicKeyPoints } from "./TopicKeyPoints";
import { curriculum, casesForTopic, findCurriculumTopic, questionsForTopic, questionsForSelection, resourceKeys } from "./curriculum";
export function Flashcards(){
  const {state,bank}=useApp();const [search,setSearch]=useState("");const originalBank=useMemo(()=>bank.filter(q=>inCollection(q,"situational")),[bank]);
  const today=dateKey(Date.now(),state.profile.timezone),count=Object.values(state.cards).filter(c=>dateKey(c.lastAt,state.profile.timezone)===today).length;
  const imported=[...new Map(state.importedQuestions.filter(q=>!findCurriculumTopic(q.subject+":"+q.topic)).map(q=>[q.subject+":"+q.topic,q])).values()];
  return <>
    <Card className="flash-intro study-banner">
     <div><h1>Flashcards</h1><p>Review due cards first, then recall new situations from your weak spots.</p>
      <Progress value={count} max={state.preferences.flashcardGoal} label="Flashcard daily goal"/>
      <small>{count} of {state.preferences.flashcardGoal} reviewed today</small>
      <div className="button-row"><Link className="btn primary" to="/decks/review">Start today’s session<ArrowRight size={16}/></Link>
       <Link className="btn" to="/decks/custom">Choose topics</Link></div></div>
     <div className="card-stack" aria-hidden="true"><div/><div/><div><Layers3 size={32}/></div></div>
    </Card>
    <div className="section-head"><h2>Decks</h2><small>{curriculum.length} topic decks</small></div>
    <SearchBox value={search} onChange={setSearch} placeholder="Search decks"/>
    <div className="subject-list">{subjects.map(s=>{
      const list=curriculum.filter(t=>t.subject===s.id&&`${t.name} ${s.name}`.toLowerCase().includes(search.toLowerCase()));
      const available=new Set(list.flatMap(t=>questionsForTopic(t,originalBank).map(q=>q.id))).size;
      return list.length>0&&<details className="subject-group" key={s.id} open={search?true:undefined}><summary><span className="subject-code" style={{color:s.color,background:s.color+"16"}}>{s.short}</span><div><h3>{s.name}</h3><small>{list.length} topic {list.length===1?"deck":"decks"} · {available} related cards</small></div><ChevronRight size={17}/></summary><div className="topic-rows">{list.map(t=>{const size=questionsForTopic(t,originalBank).length;return <RowLink key={t.slug} to={`/decks/review?topic=${encodeURIComponent(t.subject+":"+t.slug)}`} title={t.name} description={`${size} related ${size===1?"card":"cards"}`}/>;})}</div></details>;
    })}{imported.filter(q=>q.topic.toLowerCase().includes(search.toLowerCase())).map(q=><Card key={q.subject+q.topic}><RowLink to={`/decks/review?topic=${encodeURIComponent(q.subject+":"+q.topic)}`} title={q.topic} description="Your imported questions"/></Card>)}{[...new Set(state.customCards.map(c=>c.deck))].filter(d=>d.toLowerCase().includes(search.toLowerCase())).map(deck=><Card key={deck}><RowLink to={`/decks/review?deck=${encodeURIComponent(deck)}`} title={deck} description={`${state.customCards.filter(c=>c.deck===deck).length} of your own cards`}/></Card>)}</div>
    <p className="fine-print">Topic decks and the daily queue use situational nursing questions. Choose topics to select a different question format. Related topics can share a card. Reviewing it updates the same review schedule wherever it appears.</p>
    <Card className="soft-card"><div className="section-head"><div><h2>My decks</h2><p>Create your own cards or import an Anki text export.</p></div><Upload size={24} aria-hidden="true"/></div><div className="button-row"><Link to="/decks/import" className="btn">Import cards</Link><Link to="/decks/new" className="btn">Create a deck<Plus size={16}/></Link></div></Card>
  </>;
}
export function ChooseDeck(){
  const {bank,navigate}=useApp();const [selected,setSelected]=useState<string[]>([]),[collection,setCollection]=useState<Collection>("situational");const selectedBank=useMemo(()=>bank.filter(q=>inCollection(q,collection)),[bank,collection]);
  const available=questionsForSelection(selected,selectedBank).length;
  return <><Heading title="Choose your flashcards" description="Pick topics from the complete catalog."/><CollectionPicker bank={bank} value={collection} onChange={setCollection}/><Card>{subjects.map(s=><fieldset key={s.id}><legend>{s.short} · {s.name}</legend><div className="topic-checks">{curriculum.filter(t=>t.subject===s.id).map(t=>{const id=t.subject+":"+t.slug,size=questionsForTopic(t,selectedBank).length;return <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={e=>setSelected(v=>e.target.checked?[...v,id]:v.filter(k=>k!==id))}/><span>{t.name}<small className="topic-count">{size} related {size===1?"card":"cards"}</small></span></label>;})}</div></fieldset>)}<p className="fine-print">{available} unique cards in this selection. Due dates and your daily goal determine today’s queue.</p><button className="btn primary" disabled={!available} onClick={()=>navigate(`/decks/review?collection=${collection}&topics=${encodeURIComponent(selected.join("|"))}`)}>Start review{selected.length?` · ${selected.length} ${selected.length===1?"topic":"topics"}`:" · all topics"}<ArrowRight size={16}/></button></Card></>;
}
export function FlashcardReview(){const {state,bank,path,update,navigate}=useApp();const params=new URLSearchParams(path.split("?")[1]);const selection=params.has("topics")?(params.get("topics")||"").split("|").filter(Boolean):[params.get("topic")||""].filter(Boolean),deck=params.get("deck"),collection:Collection=parseCollection(params.get("collection"));const first=firstAttempts(state.attempts);const misses=new Set(first.filter(a=>!a.correct).map(a=>a.questionId));const [queue]=useState(()=>{const pool=deck?state.customCards.filter(c=>c.deck===deck):questionsForSelection(selection,bank).filter(q=>inCollection(q,collection)).map(q=>({id:q.id,deck:q.topic,front:q.stem,back:`${q.options[q.correctIndex].text}\n\n${q.rationale}`}));return flashcardQueue(pool,state,bank,misses,state.preferences.flashcardGoal);});const [index,setIndex]=useState(0),[flipped,setFlipped]=useState(false);const card=queue[index],sourceQuestion=bank.find(q=>q.id===card?.id);function flip(){if(!flipped&&state.preferences.flashcardSound)playStudyTone(550,.1);setFlipped(!flipped);}
function grade(value:"again"|"hard"|"good"|"easy"){if(!card||!flipped)return;update(s=>({...s,cards:{...s.cards,[card.id]:scheduleCard(s.cards[card.id],value)}}));setIndex(i=>i+1);setFlipped(false);}return <><Link to="/decks" className="back"><ArrowLeft size={15}/>Back to flashcards</Link><Heading title="A moment of recall." description={deck||selection.length?"Your selected deck":"Due cards and weak spots, one at a time."}/>{card&&<label className="game-check"><input type="checkbox" checked={state.preferences.flashcardSound===true} onChange={event=>{const checked=event.target.checked;update(current=>({...current,preferences:{...current.preferences,flashcardSound:checked}}));}}/>Sound on reveal</label>}{card?<>{sourceQuestion&&<QuestionProvenance q={sourceQuestion}/>}<div className="section-head"><small>{index+1} of {queue.length}</small><span className="tag">{state.cards[card.id]?"Due for review":"New card"}</span></div><Progress value={index} max={queue.length}/><button className={`flashcard ${flipped?"flipped":""}`} aria-label={flipped?"Flashcard answer":"Reveal flashcard answer"} onClick={flip}><span className="tag">{card.deck}</span><span className="flashcard-text">{flipped?card.back:card.front}</span><small>{flipped?"How well did you remember?":"Think it through. Tap to reveal."}</small></button>{flipped?<div className="grade-buttons">{[["again","Again","1 minute"],["hard","Hard","1+ days"],["good","Good","3+ days"],["easy","Easy","7+ days"]].map(([id,label,time])=><button key={id} className={`grade-${id}`} onClick={()=>grade(id as "again"|"hard"|"good"|"easy")}><strong>{label}</strong><small>{time}</small></button>)}</div>:<button className="btn primary full" onClick={flip}>Show answer</button>}<p className="fine-print center">The next interval grows with successful reviews. “Again” brings the card back sooner.</p></>:<Card><Empty icon={<Check size={28}/>} title={queue.length?"A little more knowledge, kept.":"You’re caught up."} description={queue.length?`You reviewed ${queue.length} ${queue.length===1?"card":"cards"}. Your next review dates are saved.`:"There are no due or new cards in this selection. Come back when cards are due, or choose another deck."} action={<Link to="/decks" className="btn primary">Back to decks<ArrowRight size={16}/></Link>}/></Card>}</>;}
export function CreateDeck({importing=false}:{importing?:boolean}){const {update,toast,navigate}=useApp();const [name,setName]=useState(""),[front,setFront]=useState(""),[back,setBack]=useState(""),[text,setText]=useState(""),[draft,setDraft]=useState<{front:string;back:string}[]>([]);function save(){if(!name.trim()){toast("Give your deck a name first.");return;}try{const cards=importing?parseFlashcardText(text,name.trim()):[...draft,...(front.trim()&&back.trim()?[{front:front.trim(),back:back.trim()}]:[])].map(c=>({...c,id:`custom-${crypto.randomUUID()}`,deck:name.trim()}));if(!cards.length){toast("Add at least one card with a front and back.");return;}update(s=>({...s,customCards:[...s.customCards,...cards]}));toast(`${cards.length} cards added to ${name.trim()}.`);navigate("/decks");}catch(error){toast((error as Error).message);}}return <><Link to="/decks" className="back"><ArrowLeft size={15}/>Back to flashcards</Link><Heading title={importing?"Import your flashcards":"Create a deck"} description={importing?"Use a tab-separated or CSV text export from Anki. Binary .apkg files need to be exported as text first.":"Save the facts, comparisons, and reminders you want to remember."}/><Card className="form-card"><label>Deck name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Drug antidotes" maxLength={100}/></label>{importing?<><label className="file-upload"><Upload size={20}/>Choose a .txt, .tsv, or .csv file<input type="file" accept=".txt,.tsv,.csv" onChange={async e=>{const f=e.target.files?.[0];if(f){if(f.size>2e6){toast("Choose a file smaller than 2 MB.");return;}setText(await f.text());}}}/></label><label>Or paste your cards<textarea rows={10} value={text} onChange={e=>setText(e.target.value)} placeholder={'Front\tBack\nWhat reverses an opioid overdose?\tNaloxone, with breathing support and emergency assessment.'}/></label><p className="muted">Two columns: front and back. Quoted cells and line breaks are supported.</p></>:<><label>Front<textarea value={front} onChange={e=>setFront(e.target.value)} placeholder="What do you want to recall?"/></label><label>Back<textarea value={back} onChange={e=>setBack(e.target.value)} placeholder="The answer and a useful explanation"/></label><button className="btn" disabled={!front.trim()||!back.trim()} onClick={()=>{setDraft(d=>[...d,{front:front.trim(),back:back.trim()}]);setFront("");setBack("");}}><Plus size={16}/>Add another card</button>{draft.length>0&&<p>{draft.length} cards ready to save</p>}</>}<button className="btn primary" onClick={save}>Save deck<Check size={16}/></button></Card></>;}
export function useTopicList(){const {bank,state}=useApp();const catalogTopics=curriculum.filter(t=>questionsForTopic(t,bank).length>0).map(t=>({subject:t.subject,name:t.name,slug:t.slug,count:questionsForTopic(t,bank).filter(q=>inCollection(q,"situational")).length}));const imported=[...new Map(state.importedQuestions.filter(q=>!findCurriculumTopic(q.subject+":"+q.topic)).map(q=>[q.subject+":"+q.topic,{subject:q.subject,name:q.topic}])).values()];return [...catalogTopics,...imported];}
export {TaskRow} from "./Planner";
export {planTasks} from "./planning";
export function Planner(){const topicList=useTopicList();return <StudyPlanner topicList={topicList}/>;}

export function Resources(){
  const {state,bank,user,username,sharedProfile}=useApp();const [search,setSearch]=useState(""),[subject,setSubject]=useState("all");
  const filtered=curriculum.filter(t=>(subject==="all"||t.subject===subject)&&t.name.toLowerCase().includes(search.toLowerCase()));
  const reviewed=curriculum.filter(t=>state.read.includes("catalog:"+t.slug)).length;
  const imported=[...new Map(state.importedQuestions.filter(q=>!findCurriculumTopic(q.subject+":"+q.topic)&&(subject==="all"||q.subject===subject)&&q.topic.toLowerCase().includes(search.toLowerCase())).map(q=>[q.subject+":"+q.topic,q])).values()];
  return <>
    <Card className="study-banner library-overview">
     <div><h1>Cram Sheets</h1><p>Review key nursing decisions and mark each topic when you finish.</p></div>
     <div className="library-progress">
      <strong>{reviewed} of {curriculum.length} topic notes completed</strong>
      <Progress value={reviewed} max={curriculum.length} label="Topic notes completed"/>
     </div>
     {canAccessPDFs(username,!!user,sharedProfile)&&<Link to="/resources/pdfs" className="btn"><Download size={16}/>PDF library</Link>}
    </Card>
    <nav className="library-shortcuts" aria-label="Cram Sheet tools">
     <Link to="/resources/notes"><BookOpen size={22} aria-hidden="true"/><strong>My Notes</strong></Link>
     <Link to="/resources/bookmarks"><Layers3 size={22} aria-hidden="true"/><strong>Bookmarks</strong></Link>
     <Link to="/resources/guide"><BookOpen size={22} aria-hidden="true"/><strong>Study guide</strong></Link>
    </nav>
    <div className="section-head"><h2 className="study-section-title">Library</h2><TextLink to="/topics">All {curriculum.length} topics</TextLink></div>
    <SearchBox value={search} onChange={setSearch} placeholder="Search resources"/>
    <div className="tabs"><button className={subject==="all"?"active":""} onClick={()=>setSubject("all")}>All</button>{subjects.map(s=><button key={s.id} className={subject===s.id?"active":""} onClick={()=>setSubject(s.id)}>{s.short}</button>)}</div>
    <div className="section-head"><h2>Topic notes</h2><small>{filtered.length} matching topics</small></div>
    <div className="resource-grid">{filtered.map(t=>{const questions=questionsForTopic(t,bank).filter(isSituational),situations=new Set(questions.map(q=>q.caseId||q.id.match(/^(CROSS|NP[1-5])-\d{3}/)?.[0]||q.id)).size;return <Link key={t.slug} to={`/resources/read?topic=${encodeURIComponent(t.subject+":"+t.slug)}`} className="resource-card"><div className="resource-book"><BookOpen size={28}/>{state.read.includes("catalog:"+t.slug)&&<span className="read-check"><Check size={13}/></span>}</div><span className="tag">{t.subject==="CROSS"?"Foundations":t.subject}</span><h3>{t.name}</h3><small>{`${situations} situation ${situations===1?"review":"reviews"}`} <ArrowRight size={15}/></small></Link>;})}{imported.map(q=><Link key={q.subject+q.topic} to={`/resources/read?topic=${encodeURIComponent(q.subject+":"+q.topic)}`} className="resource-card"><div className="resource-book"><BookOpen size={28}/></div><span className="tag">{q.subject}</span><h3>{q.topic}</h3><small>Your imported questions <ArrowRight size={15}/></small></Link>)}</div>
    {!filtered.length&&!imported.length&&<Empty title="No matching resources" description="Try a broader search or choose another subject."/>}
  </>;
}
export function ResourceReader({guide=false}:{guide?:boolean}){
  const {state,bank,path,update,navigate,user,username,sharedProfile}=useApp(),start=useStartSession();
  const params=new URLSearchParams(path.split("?")[1]);
  const key=params.get("topic")||"CROSS:Infection prevention";
  const returnTo=params.get("returnTo");
  const quizReturn=returnTo&&/^\/(session|results)\/[\w-]+$/.test(returnTo)?returnTo:undefined;
  const split=key.indexOf(":"),catalogTopic=findCurriculumTopic(key),subject=catalogTopic?.subject||key.slice(0,split),topic=catalogTopic?.name||key.slice(split+1);
  const keys=resourceKeys(subject,topic);
  const cases=catalogTopic?casesForTopic(catalogTopic):clinicalCases.filter(c=>c.subject===subject&&c.topic===topic);
  const questions=catalogTopic?questionsForTopic(catalogTopic,bank):bank.filter(q=>q.subject===subject&&q.topic===topic);
  const found=cases.length>0||questions.length>0;
  return <>
    <Link to={quizReturn||"/resources"} className="back"><ArrowLeft size={15}/>{quizReturn?"Back to your set":"All resources"}</Link>
    <Heading title={guide?"Make every study session count.":topic} description={guide?"A simple rhythm: recall, understand, revisit.":`${subject==="CROSS"?"Foundations & Fundamentals":subject} · original topic notes`} action={canAccessPDFs(username,!!user,sharedProfile)?guide?<button className="btn" onClick={()=>window.print()}><Download size={15}/>Print / save PDF</button>:catalogTopic?<Link className="btn" to={`/resources/pdfs?topic=${encodeURIComponent(catalogTopic.subject+":"+catalogTopic.slug)}`}><Download size={15}/>PDF downloads</Link>:<button className="btn" onClick={()=>window.print()}><Download size={15}/>Print / save PDF</button>:undefined}/>
    <Card className="reader">{guide?<>
      <h2>1. Try before you look.</h2><p>Read the situation carefully. Identify what the question asks: an assessment, a priority action, teaching, an outcome, or an unsafe statement. Choose an answer before revealing the explanation.</p>
      <h2>2. Explain why every choice fits or fails.</h2><p>Spend time on the rationale even when you are correct. A lucky answer is different from a well-understood answer. Use the confidence buttons to notice where the two differ.</p>
      <h2>3. Keep a short note.</h2><p>Write one sentence in your own words. Focus on the clue you missed, the principle that decides the answer, or the safety issue you need to remember.</p>
      <h2>4. Revisit what needs work.</h2><p>Your Vault collects misses and flags. Flashcards return on a schedule based on your self-rating. A correct retry helps you learn while your first-try rating remains an honest baseline.</p>
      <h2>5. Practice under time.</h2><p>Use exam mode to defer answers and rationales until submission. Use mock sections to build endurance. Treat estimates as study feedback, and use official PRC materials for the actual examination rules.</p>
      <Link to="/practice" className="btn primary">Try a practice set<ArrowRight size={16}/></Link>
    </>:found?<>
      {catalogTopic?<TopicReviewNotes topic={catalogTopic}/>:<TopicKeyPoints questions={questions}/>}
      {cases.length>0&&<div className="key-point"><strong>Read further</strong><p>These original study notes are a starting point. Check current nursing references and local protocols for full management and dosing guidance.</p><a href="https://www.ncbi.nlm.nih.gov/books/NBK590025/" target="_blank" rel="noreferrer">Open RN textbook library</a> · <a href="https://www.cdc.gov/infection-control/hcp/basics/standard-precautions.html" target="_blank" rel="noreferrer">CDC standard precautions</a></div>}
      <label>Your topic note<textarea aria-label="Your resource note" placeholder="Capture the part you want to remember…" value={state.notes[keys.note]||""} onChange={e=>update(s=>({...s,notes:{...s.notes,[keys.note]:e.target.value}}))}/></label>
      <div className="button-row"><button className="btn primary" onClick={()=>{update(s=>({...s,read:[...new Set([...s.read,keys.read])]}));navigate("/resources");}}><Check size={16}/>{state.read.includes(keys.read)?"Completed":"Mark as read"}</button><button className="btn" onClick={()=>start({collection:"all",topics:[catalogTopic?.slug||key],count:20,title:topic+" practice",quick:true})}>Practice this topic<ArrowRight size={16}/></button></div>
    </>:<Empty title="Topic not found" description="Choose a topic from the resource library."/>}</Card>
  </>;
}
