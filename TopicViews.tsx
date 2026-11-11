import type {PracticeDifficulty} from "./question-selection";
import {availablePractice,isDecisionQuestion} from "./question-selection";
import {TopicReviewNotes} from "./TopicReviewNotes";
import { CollectionPicker } from "./CollectionPicker";
import { inCollection, collectionCounts, isSituational, parseCollection } from "./collections";
import type { Collection } from "./collections";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Layers3 } from "lucide-react";
import { subjects } from "./bank";
import { referenceCount, referenceTotal, referenceObservedAt, auditQuestionBank, uniqueQuestionCount } from "./catalog-metrics";
import { download } from "./store";
import { casesForTopic, curriculum, findCurriculumTopic, questionsForTopic, questionsForSelection } from "./curriculum";
import { answeredQuestionIds, dailyAnswerCounts, dateKey, firstAttempts } from "./engine";
import { useApp } from "./store";
import { Card, Empty, Heading, Link, Progress, SearchBox, TextLink } from "./ui";
import { ReviewQuestion, useStartSession } from "./Quiz";
import { practiceTopicRows } from "./practice-metrics";
import { practiceQuestionPool, practiceSetupPath } from "./practice-setup";
import { TopicKeyPoints } from "./TopicKeyPoints";
export function Practice(){
  const {state,bank}=useApp(),start=useStartSession();
  const [search,setSearch]=useState(""),[filter,setFilter]=useState("all");
  const [keyword,setKeyword]=useState("");
  const [collection,setCollection]=useState<Collection>("situational");
  const selectedBank=useMemo(()=>bank.filter(q=>inCollection(q,collection)),[bank,collection]);
  const query=useDeferredValue(keyword.trim());
  const keywordQuestions=useMemo(()=>query.length>=2?practiceQuestionPool(bank,{collection,keyword:query}):[],[bank,collection,query]);
  const unusedMatches=useMemo(()=>keywordQuestions.length?availablePractice(keywordQuestions,state,{allowRelated:true,bank}):0,[keywordQuestions,state,bank]);
  const selectedIds=useMemo(()=>new Set(selectedBank.map(q=>q.id)),[selectedBank]);
  const answered=useMemo(()=>answeredQuestionIds(state.attempts),[state.attempts]);
  const first=useMemo(()=>firstAttempts(state.attempts).filter(a=>selectedIds.has(a.questionId)),[state.attempts,selectedIds]);
  const rows=useMemo(()=>practiceTopicRows(state,selectedBank),[state,selectedBank]);
  const unfinished=state.sessions.filter(s=>!s.finishedAt&&s.kind!=="mock").at(-1);
  const today=dateKey(Date.now(),state.profile.timezone),todayCount=dailyAnswerCounts(state.attempts,state.profile.timezone).get(today)??0;
  const searchQuery=search.trim().toLowerCase();
  const counts={all:rows.filter(r=>r.questions.length).length,needs:rows.filter(r=>r.missedIds.length).length,new:rows.filter(r=>r.questions.length&&!r.tried).length,flagged:rows.filter(r=>r.flaggedIds.length).length,saved:rows.filter(r=>r.savedIds.length).length};
  const filtered=rows.filter(r=>`${r.topic.name} ${subjects.find(s=>s.id===r.topic.subject)?.name}`.toLowerCase().includes(searchQuery)&&(filter==="all"&&(r.questions.length>0||searchQuery)||filter==="needs"&&r.missedIds.length>0||filter==="new"&&r.questions.length>0&&!r.tried||filter==="flagged"&&r.flaggedIds.length>0||filter==="saved"&&r.savedIds.length>0));
  return <>
    <Heading title="Practice Questions" description="Every answer comes with its rationale. That’s where the learning happens."/>
    <Card className="practice-intro">
      <div className="section-head"><h2>Today’s practice</h2><span className="tag">{todayCount} answered</span></div>
      <p>Make a nursing decision from the case clues, then review each choice. Quick sets start with new situations and use unanswered follow-ups once you’ve seen those cases.</p>
      <div className="button-row"><button className="btn primary" onClick={()=>start({collection,quick:true})}>{collection==="situational"?"Start challenge set":"Start mixed set"}<ArrowRight size={16}/></button><Link className="btn" to={practiceSetupPath({collection})}>Build a custom set</Link></div>
    </Card>
    {unfinished&&<Card className="resume-card"><div><strong>Pick up where you left off</strong><p>{unfinished.title} · {Object.values(unfinished.answers).filter(a=>a.selected>=0).length} of {unfinished.questionIds.length} answered</p></div><div className="button-row"><Link to={`/session/${unfinished.id}`} className="btn primary">Resume<ArrowRight size={15}/></Link>{unfinished.practiceSetup&&<Link to={unfinished.practiceSetup} className="btn">Build a fresh set</Link>}</div></Card>}
    <div className="section-head bank-head"><h2>Your question bank</h2><TextLink to="/topics">All {curriculum.length} topics</TextLink></div>
    <div className="legend"><span className="green-dot"/>{first.filter(a=>a.correct).length} correct <span className="red-dot"/>{first.filter(a=>!a.correct).length} wrong or skipped<TextLink to="/vault">Vault</TextLink></div>
    <p className="fine-print">{selectedBank.filter(q=>answered.has(q.id)).length.toLocaleString()} of {selectedBank.length.toLocaleString()} answered in this collection · {uniqueQuestionCount(bank).toLocaleString()} questions across {curriculum.length} topics.</p>
    <CollectionPicker bank={bank} value={collection} onChange={setCollection}/>
    <Card className="keyword-practice"><h2>Practice by keyword</h2>
      <p>Search topics, question text, and answer choices in this collection.</p>
      <SearchBox placeholder="Enter a practice keyword" value={keyword} onChange={setKeyword}/>
      <div className="button-row">
        <button className="btn primary" disabled={!unusedMatches||query!==keyword.trim()} onClick={()=>start({collection,keyword:query,difficulty:"mixed",quick:true})}>Start keyword set<ArrowRight size={16}/></button>
        {keywordQuestions.length>0&&query===keyword.trim()&&<Link className="btn" to={practiceSetupPath({collection,keyword:query,difficulty:"mixed",exhausted:!unusedMatches})}>Customize or review matches</Link>}
        <small role="status">{query.length>=2?`${keywordQuestions.length.toLocaleString()} matching ${keywordQuestions.length===1?"question":"questions"} · ${unusedMatches.toLocaleString()} unused`:"Enter at least two characters"}</small>
      </div>
    </Card>
    <SearchBox value={search} onChange={setSearch}/>
    <div className="tabs">{[["all",`Topics with questions ${counts.all}`],["needs",`To redo ${counts.needs}`],["new",`Not started ${counts.new}`],["flagged",`Flagged ${counts.flagged}`],["saved",`Saved ${counts.saved}`]].map(([id,label])=><button key={id} aria-pressed={filter===id} className={filter===id?"active":""} onClick={()=>setFilter(id)}>{label}</button>)}</div>
    <div className="subject-list">{subjects.map(subject=>{
      const topics=filtered.filter(r=>r.topic.subject===subject.id);
      if(!topics.length)return null;
      const subjectQuestions=selectedBank.filter(q=>q.subject===subject.id),size=subjectQuestions.length;
      return <details key={subject.id} className="subject-group" open={searchQuery||filter!=="all"?true:undefined}>
        <summary><span className="subject-code" style={{color:subject.color,background:subject.color+"16"}}>{subject.id==="CROSS"?"ALL":subject.short}</span><div><h3>{subject.name}</h3><small>{topics.length} {topics.length===1?"topic":"topics"} · {subjectQuestions.filter(q=>answered.has(q.id)).length.toLocaleString()} of {size.toLocaleString()} answered</small></div><ChevronDown size={18}/></summary>
        <div className="topic-rows">{size>0&&<Link className="text-button" to={practiceSetupPath({subject:subject.id,collection})}>Build a set from this subject<ArrowRight size={14}/></Link>}
          {topics.map(({topic:t,questions:qs,tried,missedIds,flaggedIds,savedIds})=>{
            const reviewIds=filter==="flagged"?flaggedIds:filter==="saved"?savedIds:filter==="needs"?missedIds:undefined;
            return <div className="topic-row practice-topic-row" key={t.slug}>
              <div className="topic-info"><Link to={`/topics/${t.slug}`} className="topic-name"><strong>{t.name}</strong></Link><small>{qs.length?`${qs.length} related ${qs.length===1?"question":"questions"} · ${tried} tried`:"No questions in this collection"}{missedIds.length>0&&` · ${missedIds.length} to redo`}{flaggedIds.length>0&&` · ${flaggedIds.length} flagged`}</small>{qs.length>0&&<Progress value={tried} max={qs.length}/>}</div>
              <div className="topic-actions">
                {missedIds.length>0&&<button className="btn small redo-misses" aria-label={`Redo ${missedIds.length} ${t.name} misses`} onClick={()=>start({collection,ids:missedIds,count:missedIds.length,review:true,title:t.name+" · redo misses"})}>Redo {missedIds.length} {missedIds.length===1?"miss":"misses"}</button>}
                {qs.length?<button aria-label={`Practice ${t.name}`} className="btn small" onClick={()=>start({collection,topics:[t.slug],ids:reviewIds,count:20,review:!!reviewIds,quick:true,title:t.name})}>Practice<ArrowRight size={14}/></button>:<Link to={practiceSetupPath({collection:"situational",topics:[t.slug]})} className="btn small">Practice situations<ChevronRight size={14}/></Link>}
              </div>
            </div>;
          })}
        </div>
      </details>;
    })}</div>
    {!filtered.length&&<Empty title="No matching topics" description="Try another search or filter."/>}<TextLink to="/questions">Browse questions and complete rationales</TextLink>
  </>;
}
export function Setup(){
  const {state,bank,path}=useApp(),start=useStartSession();
  const params=new URLSearchParams(path.split("?")[1]);
  const [subject,setSubject]=useState(()=>subjects.find(s=>s.id===params.get("np"))?.id);
  const [selected,setSelected]=useState(()=>params.getAll("topic").filter(Boolean).map(topic=>findCurriculumTopic(topic)?.slug||topic));
  const [search,setSearch]=useState("");
  const [keyword,setKeyword]=useState(params.get("keyword")||"");
  const taskId=params.get("task"),taskTopic=params.get("topic");
  const query=useDeferredValue(keyword.trim());
  const [count,setCount]=useState(Math.min(bank.length,Math.max(1,Math.floor(Number(params.get("count")))||10)));
  const [mode,setMode]=useState<"tutor"|"exam">(params.get("mode")==="exam"?"exam":"tutor");
  const [filter,setFilter]=useState<"unanswered"|"vault"|"all">(params.get("filter")==="missed"||params.get("filter")==="vault"?"vault":params.get("filter")==="all"?"all":"unanswered");
  const [timer,setTimer]=useState(()=>{const value=Number(params.get("timer"));return [60,90,120].includes(value)?value:0;});
  const [collection,setCollection]=useState<Collection>(parseCollection(params.get("collection")));
  const [difficulty,setDifficulty]=useState<PracticeDifficulty>(params.get("difficulty")==="mixed"?"mixed":"challenge");
  const [allowRelated,setAllowRelated]=useState(params.get("related")==="1");
  const supportsDifficulty=collection==="situational"||collection==="all"||collection==="nursing";
  const baseLevel=supportsDifficulty?difficulty:"mixed";
  const level=filter==="vault"?"mixed":baseLevel;
  const scopedBank=useMemo(()=>practiceQuestionPool(bank,{collection,subject,keyword:query}),[bank,collection,subject,query]);
  const pool=useMemo(()=>questionsForSelection(selected,scopedBank),[selected,scopedBank]);
  const selection={filter,allowRelated,difficulty:level,bank};
  const counts=useMemo(()=>({
    unanswered:availablePractice(pool,state,{allowRelated,difficulty:baseLevel,bank}),
    vault:availablePractice(pool,state,{filter:"vault"}),
    all:availablePractice(pool,state,{filter:"all",allowRelated,difficulty:baseLevel}),
  }),[pool,state,allowRelated,baseLevel,bank]);
  const available=counts[filter],setCountAvailable=Math.min(count,available);
  const unfinished=state.sessions.filter(session=>!session.finishedAt&&(session.kind==="practice"||session.kind==="exam")).slice(-3).reverse();
  const changeTopics=(slugs:string[],checked:boolean)=>setSelected(values=>checked?[...new Set([...values,...slugs])]:values.filter(slug=>!slugs.includes(slug)));
  const filters=[
    {id:"unanswered",title:"New questions",description:allowRelated?"Skip previously assigned questions":"Skip previously assigned questions and situations"},
    {id:"vault",title:"Redo",description:"Review questions due in your Vault"},
    {id:"all",title:"All questions",description:"Include new and familiar questions"},
  ] as const;
  return <>
    <Link to="/practice" className="back"><ArrowLeft size={15}/>Back to practice</Link>
    <Heading title="Custom set" description="Choose a subject, topic, or keyword and build a practice or exam set."/>
    {params.get("exhausted")==="1"&&filter==="unanswered"&&!available&&<Card className="practice-intro"><h2>No unused questions in this selection</h2><p>Choose All questions to review within this selection, or adjust the settings for a different set.</p></Card>}
    {unfinished.length>0&&<Card className="setup-resume">
      <h2>Pick up again</h2>
      {unfinished.map(session=><div className="setup-resume-row" key={session.id}>
        <div><strong>{session.title}</strong><small>{Object.values(session.answers).filter(answer=>answer.selected>=0).length} of {session.questionIds.length} answered</small></div>
        <Link to={`/session/${session.id}`} className="btn small">Resume<ArrowRight size={14}/></Link>
      </div>)}
    </Card>}
    <Card className="setup">
      <label>Subject<select value={subject||""} onChange={event=>{
        setSubject(subjects.find(s=>s.id===event.target.value)?.id);
        setSelected([]);
      }}><option value="">All subjects</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <h2>Topics</h2>
      <p>{subject?"Leave topics unselected to draw from this entire subject.":"Leave topics unselected to draw from all subjects. A specific topic can include related cases from another subject."}</p>
      <SearchBox value={search} onChange={setSearch}/>
      {subjects.filter(s=>!subject||subject===s.id).map(s=>{
        const topics=curriculum.filter(t=>t.subject===s.id&&`${t.name} ${s.name}`.toLowerCase().includes(search.trim().toLowerCase()));
        if(!topics.length)return null;
        const slugs=topics.map(t=>t.slug);
        return <details key={s.id} className="setup-subject" open={search.trim()||subject===s.id||topics.some(t=>selected.includes(t.slug))?true:undefined}>
          <summary><input aria-label={`Select all ${s.short} topics`} type="checkbox" checked={slugs.every(slug=>selected.includes(slug))} onClick={e=>e.stopPropagation()} onChange={e=>changeTopics(slugs,e.target.checked)}/><span className="subject-code">{s.id==="CROSS"?"ALL":s.short}</span><strong>{s.name}</strong><small>{topics.length} topics</small><ChevronDown size={16}/></summary>
          <div className="topic-checks">{topics.map(t=>{
            const size=questionsForTopic(t,scopedBank).filter(q=>level==="mixed"||isDecisionQuestion(q)).length;
            return <label key={t.slug}><input type="checkbox" checked={selected.includes(t.slug)} onChange={e=>changeTopics([t.slug],e.target.checked)}/><span>{t.name}<small className="topic-count">{size} {size===1?"question":"questions"} in this collection and level</small></span></label>;
          })}</div>
        </details>;
      })}
      <div className="section-head"><small>{selected.length===1?findCurriculumTopic(selected[0])?.name||selected[0]:selected.length?`${selected.length} topics selected`:"All topics selected"}</small>{selected.length>0&&<button className="text-button" onClick={()=>setSelected([])}>Clear selection</button>}</div>
      <h2>Question keyword</h2>
      <SearchBox value={keyword} onChange={setKeyword} placeholder="Filter questions by keyword"/>
      <h2>Question collection</h2>
      <CollectionPicker bank={bank} value={collection} onChange={setCollection}/>
      <h2>Which questions?</h2>
      <div className="select-cards">{filters.map(({id,title,description})=>
        <button key={id} aria-pressed={filter===id} className={filter===id?"selected":""} onClick={()=>setFilter(id)}><strong>{title} · {counts[id].toLocaleString()}</strong><small>{description}</small></button>
      )}</div>
      {supportsDifficulty&&filter!=="vault"&&<>
        <h2>Difficulty</h2>
        <div className="select-cards two">
          <button aria-pressed={level==="challenge"} className={level==="challenge"?"selected":""} onClick={()=>setDifficulty("challenge")}><strong>Challenge</strong><small>Priorities, safe actions, and clinical reasoning</small></button>
          <button aria-pressed={level==="mixed"} className={level==="mixed"?"selected":""} onClick={()=>setDifficulty("mixed")}><strong>Mixed</strong><small>All question types in the selected collection</small></button>
        </div>
      </>}
      {filter!=="vault"&&<label className="followup-choice"><input type="checkbox" checked={allowRelated} onChange={e=>setAllowRelated(e.target.checked)}/>Include follow-up questions from the same situation</label>}
      <h2>Question count</h2>
      <div className="button-row">{[10,20,30,50,100].map(n=><button key={n} aria-pressed={count===n} className={`btn ${count===n?"chosen":""}`} onClick={()=>setCount(n)}>{n}</button>)}<input aria-label="Custom number of questions" className="count-input" type="number" min="1" max={bank.length} value={count||""} onChange={e=>setCount(Math.min(bank.length,Math.max(0,Math.floor(Number(e.target.value)))))}/></div>
      <p className="fine-print" aria-live="polite">{available.toLocaleString()} available for these settings</p>
      {!available&&<p className="notice">{!pool.length?"No questions match this subject, topic, collection, and keyword.":filter==="vault"?"No questions in this selection are due in your Vault.":"Try Mixed difficulty, include follow-ups, or choose a different question filter."}</p>}
      <h2>Mode</h2>
      <div className="select-cards two">
        <button aria-pressed={mode==="tutor"} className={mode==="tutor"?"selected":""} onClick={()=>setMode("tutor")}><strong>Practice</strong><small>Rationale after each answer</small></button>
        <button aria-pressed={mode==="exam"} className={mode==="exam"?"selected":""} onClick={()=>setMode("exam")}><strong>Exam</strong><small>Rationales after you finish the set</small></button>
      </div>
      <h2>Per-question timer</h2>
      <div className="button-row">{[[0,"Off"],[60,"1:00"],[90,"1:30"],[120,"2:00"]].map(([n,label])=><button key={n} aria-pressed={timer===n} className={`btn ${timer===n?"chosen":""}`} onClick={()=>setTimer(Number(n))}>{label}</button>)}</div>
      <p className="fine-print">The timer pauses during rationales and shows overtime when time runs out.</p>
      <button className="btn primary full" disabled={!available||count<1||query!==keyword.trim()} onClick={()=>start({...selection,subject,topics:selected,keyword:query,count,mode,collection,perQuestion:timer,planTaskId:taskId&&selected.length===1&&selected[0]===taskTopic&&!query?taskId:undefined,title:!query&&selected.length===1?findCurriculumTopic(selected[0])?.name:undefined})}>Start {level==="challenge"?"challenge":"session"} · {setCountAvailable} {setCountAvailable===1?"question":"questions"}<ArrowRight size={16}/></button>
    </Card>
  </>;
}
export function Topics(){const {bank}=useApp();const [search,setSearch]=useState(""),[subject,setSubject]=useState("all"),[coverage,setCoverage]=useState("all");const counts=collectionCounts(bank);const hasSituations=(t:typeof curriculum[number])=>questionsForTopic(t,bank).some(isSituational);const covered=curriculum.filter(hasSituations).length;const filtered=curriculum.filter(t=>(subject==="all"||t.subject===subject)&&t.name.toLowerCase().includes(search.toLowerCase())&&(coverage==="all"||coverage==="available"&&hasSituations(t)||coverage==="pending"&&!hasSituations(t)));return <><Heading title="Topics" description={`Explore ${curriculum.length} topics across fundamentals and all five nursing practice areas.`}/><Card className="catalog-summary"><div><h2>{counts.situational.toLocaleString()} situational questions</h2><p>The reference catalog contains {referenceTotal.toLocaleString()} questions across {curriculum.length} topics. The reviewer has {uniqueQuestionCount(bank).toLocaleString()} questions, with situational practice in {covered} topics.</p><small>Reference counts observed {referenceObservedAt}.</small></div><Link to="/practice/session" className="btn primary">Build a custom set<ArrowRight size={16}/></Link></Card><div className="section-head"><p className="fine-print">Available practice and reference counts are shown separately. A related question can support more than one topic.</p><button className="text-button" onClick={()=>download("question-coverage.json",JSON.stringify(auditQuestionBank(bank),null,2))}>Download coverage report</button></div><SearchBox value={search} onChange={setSearch} placeholder={`Search all ${curriculum.length} topics`}/><div className="tabs"><button className={subject==="all"?"active":""} onClick={()=>setSubject("all")}>All subjects</button>{subjects.map(s=><button key={s.id} className={subject===s.id?"active":""} onClick={()=>setSubject(s.id)}>{s.short}</button>)}</div><div className="button-row coverage-filter"><button className={`btn small ${coverage==="all"?"chosen":""}`} onClick={()=>setCoverage("all")}>Every topic</button><button className={`btn small ${coverage==="available"?"chosen":""}`} onClick={()=>setCoverage("available")}>Practice available</button><button className={`btn small ${coverage==="pending"?"chosen":""}`} onClick={()=>setCoverage("pending")}>Awaiting content</button></div>{subjects.map(s=>{const list=filtered.filter(t=>t.subject===s.id);return list.length>0&&<section key={s.id} className="catalog-section"><div className="section-head"><h2><span className="subject-code">{s.short}</span>{s.name}</h2><small>{list.length} {list.length===1?"topic":"topics"}</small></div><div className="catalog-grid">{list.map(t=>{const related=questionsForTopic(t,bank),count=related.filter(isSituational).length;return <Link key={t.slug} to={`/topics/${t.slug}`} className="catalog-topic"><BookOpen size={19}/><div><strong>{t.name}</strong><small>{count?`${count} situational ${count===1?"question":"questions"}` : "Content not imported yet"}</small><small>Reference: {referenceCount(t)} questions</small></div><ChevronRight size={16}/></Link>;})}</div></section>;})}{!filtered.length&&<Empty title="No matching topics" description="Try another subject, search, or content filter."/>}</>;}
export function TopicDetail({slug}:{slug:string}){const {state,bank,update}=useApp(),start=useStartSession();const topic=findCurriculumTopic(slug);const [showQuestions,setShowQuestions]=useState(false),[questionPage,setQuestionPage]=useState(0);if(!topic)return <Empty title="Topic not found" description="Choose a topic from the full catalog." action={<Link to="/topics" className="btn">All topics</Link>}/>;const qs=questionsForTopic(topic,bank),situational=qs.filter(isSituational),cases=casesForTopic(topic),noteKey="catalog:"+topic.slug,newSituations=availablePractice(situational,state,{difficulty:"challenge",bank});
 const hasFollowups=!newSituations&&availablePractice(situational,state,{difficulty:"challenge",allowRelated:true,bank})>0;
 const setupPath=practiceSetupPath({collection:"situational",topics:[topic.slug]});
 return <><Link to="/topics" className="back"><ArrowLeft size={15}/>All topics</Link><Heading title={topic.name} description={`${topic.subject==="CROSS"?"Foundations & Fundamentals":topic.subject} · ${situational.length} situational questions · ${qs.length} total questions · reference: ${referenceCount(topic)} questions`}/>{qs.length?<Card className="catalog-summary"><div><h2>Practice clinical judgment</h2><p>Use one question per new situation. Open Custom set to study follow-up decisions, concepts, or familiar cases.{qs.some(q=>q.subject!==topic.subject)&&" Some related cases come from another nursing practice area."}</p></div>{newSituations?<button className="btn primary" onClick={()=>start({collection:"situational",topics:[topic.slug],count:20,title:topic.name})}>Start challenge · {Math.min(20,newSituations)} {newSituations===1?"question":"questions"}<ArrowRight size={16}/></button>:<Link className="btn primary" to={setupPath+(hasFollowups?"&related=1":"&filter=all&difficulty=mixed")}>{hasFollowups?"Choose follow-up questions":"Review this topic"}<ArrowRight size={16}/></Link>}<Link className="text-button" to={setupPath}>Build a custom set</Link></Card>:<Card><Empty icon={<Layers3/>} title="This topic is in your catalog." description="Its exact question content has not been imported into this workspace. Import an authorized export to add its questions, answers, and rationales." action={<Link to="/settings" className="btn">Import question content<ArrowRight size={16}/></Link>}/></Card>}{situational.length>0?<Card className="reader"><TopicReviewNotes topic={topic}/></Card>:qs.length>0&&<Card className="reader"><TopicKeyPoints questions={qs}/></Card>}<Card className="form-card"><h2>Your topic note</h2><textarea aria-label="Your topic note" value={state.notes[noteKey]||""} onChange={e=>update(s=>({...s,notes:{...s.notes,[noteKey]:e.target.value}}))} placeholder="Add your own key points, source references, and reminders…"/><button className="btn" onClick={()=>update(s=>({...s,read:s.read.includes(noteKey)?s.read.filter(id=>id!==noteKey):[...s.read,noteKey]}))}><Check size={15}/>{state.read.includes(noteKey)?"Marked reviewed":"Mark topic reviewed"}</button></Card>{qs.length>0&&<Card><div className="section-head"><h2>Questions & complete rationales</h2><button className="text-button" onClick={()=>setShowQuestions(!showQuestions)}>{showQuestions?"Hide questions":"Browse questions"}<ChevronDown size={15}/></button></div>{showQuestions?<>{qs.slice(questionPage*10,(questionPage+1)*10).map(q=><ReviewQuestion key={q.id} q={q}/>)}<div className="button-row"><button className="btn" disabled={!questionPage} onClick={()=>setQuestionPage(p=>p-1)}>Previous</button><small>Questions {questionPage*10+1}–{Math.min(qs.length,(questionPage+1)*10)} of {qs.length}</small><button className="btn" disabled={(questionPage+1)*10>=qs.length} onClick={()=>setQuestionPage(p=>p+1)}>Next</button></div></>:<p className="muted">Choose “Browse questions” to reveal this topic’s questions and answer review, or start a practice session to try them first.</p>}</Card>}</>;}
