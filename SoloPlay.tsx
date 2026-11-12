import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Clock,RotateCcw,Trophy,Volume2,VolumeX,Zap} from "lucide-react";
import {subjects} from "./bank";
import {curriculum} from "./curriculum";
import {checkTypedAnswer,gamePrompt,gameTitles,matchBoardSize,matchTiles,prepareSoloRound,rapidResult,rapidSeconds,recallAnswer,recordGameRun} from "./play-engine";
import type {GameRun,SoloMode} from "./play-engine";
import {ReviewQuestion} from "./Quiz";
import {useApp} from "./store";
import {playStudyTone} from "./study-sound";
import type {Question,Subject} from "./types";
import {Card,Heading,Link,Progress,letters} from "./ui";

export const soloDescriptions:Record<SoloMode,string>={
 rapid:"Start with two minutes. Correct answers add ten seconds, misses take ten away, and every three in a row raises your multiplier.",
 match:"Match the terms on three boards of four clues. Each board also includes extra tiles that look plausible.",
 type:"Recall the missing term on ten cards. Type it yourself and check it against the answer.",
};

export function GameTopics({subject,topic,setSubject,setTopic,allowTopic=true}:{
 subject:Subject|"all";topic:string;setSubject:(value:Subject|"all")=>void;setTopic:(value:string)=>void;allowTopic?:boolean;
}){
 const available=curriculum.filter(item=>subject==="all"||item.subject===subject);
 return <div className="game-topic-picker">
  <label>Subject<select value={subject} onChange={event=>{setSubject(event.target.value as Subject|"all");setTopic("");}}>
   <option value="all">Mixed subjects</option>
   {subjects.map(item=><option key={item.id} value={item.id}>{item.short} · {item.name}</option>)}
  </select></label>
  {allowTopic&&<label>Topic<select value={topic} onChange={event=>setTopic(event.target.value)}>
   <option value="">All topics</option>
   {[...available].sort((a,b)=>a.name.localeCompare(b.name)).map(item=><option key={item.slug} value={item.slug}>{item.name}</option>)}
  </select></label>}
 </div>;
}

type Mark={id:string;correct:boolean;selected?:number};
type Round={id:string;startedAt:number;deadline:number;questions:Question[];marks:Mark[];score:number;streak:number;supplemented:boolean};

export function SoloPlay({mode}:{mode:SoloMode}){
 const {state,bank,update}=useApp();
 const [subject,setSubject]=useState<Subject|"all">("all");
 const [topic,setTopic]=useState("");
 const [round,setRound]=useState<Round|null>(null);
 const [clock,setClock]=useState(Date.now);
 const [typed,setTyped]=useState("");
 const [error,setError]=useState("");
 const recorded=useRef("");
 const nextInput=useRef<HTMLInputElement>(null);
 const prompt=useRef<HTMLHeadingElement>(null);
 const current=round?.questions[round.marks.length];
 const finished=!!round&&(!current||mode==="rapid"&&clock>=round.deadline);
 const sound=state.preferences.playSound===true;
 const right=round?.marks.filter(item=>item.correct).length??0;

 useEffect(()=>{
  if(!round||mode!=="rapid"||finished)return;
  const tick=setInterval(()=>setClock(Date.now()),200);
  return()=>clearInterval(tick);
 },[round?.id,mode,finished]);

 useEffect(()=>{
  if(!round||!finished||recorded.current===round.id)return;
  recorded.current=round.id;
  const summary:GameRun={id:round.id,mode,startedAt:round.startedAt,finishedAt:Date.now(),
   score:round.score,right,answered:round.marks.length,questionIds:round.marks.map(mark=>mark.id)};
  update(value=>recordGameRun(value,summary,round.marks.filter(mark=>!mark.correct).map(mark=>mark.id),value.preferences.playVault===true));
 },[finished,mode,round,right,update]);

 useEffect(()=>{
  if(finished||!current)return;
  if(mode==="type")nextInput.current?.focus({preventScroll:true});
  else if(mode==="rapid")prompt.current?.focus({preventScroll:true});
 },[current?.id,finished,mode]);

 function start(){
  const now=Date.now();
  const deck=prepareSoloRound(bank,mode,subject,topic,now,state.gameRuns||[]);
  if(!deck.questions.length){setError("Choose another topic or subject to find playable cards.");return;}
  setError("");setTyped("");setClock(now);
  setRound({id:crypto.randomUUID(),startedAt:now,deadline:now+rapidSeconds*1000,
   questions:deck.questions,marks:[],score:0,streak:0,supplemented:deck.supplemented});
 }

 function answer(question:Question,correct:boolean,selected?:number){
  const now=Date.now();
  if(!round||finished||round.questions[round.marks.length]?.id!==question.id)return;
  if(mode==="rapid"&&now>=round.deadline){setClock(now);return;}
  const gain=mode==="rapid"?rapidResult(correct,round.streak,round.deadline,now):{streak:0,score:correct?100:0,deadline:round.deadline};
  if(sound)playStudyTone(correct?660:270);
  setTyped("");setClock(now);
  setRound(previous=>{
   if(!previous||previous.questions[previous.marks.length]?.id!==question.id)return previous;
   return {...previous,deadline:gain.deadline,streak:gain.streak,score:previous.score+gain.score,
    marks:[...previous.marks,{id:question.id,correct,selected}]};
  });
 }

 const last=round?.marks.at(-1);
 return <>
  <Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link>
  <Heading title={gameTitles[mode]} description={round?undefined:soloDescriptions[mode]}
   action={<button type="button" className="btn" aria-pressed={sound} onClick={()=>update(value=>({...value,preferences:{...value.preferences,playSound:!sound}}))}>
    {sound?<Volume2 size={17}/>:<VolumeX size={17}/>}Sound {sound?"on":"off"}
   </button>}/>
  {!round?<Card className="game-setup">
   <h2>Choose what to review</h2>
   <GameTopics subject={subject} topic={topic} setSubject={setSubject} setTopic={setTopic}/>
   {error&&<p role="alert" className="form-error">{error}</p>}
   <button type="button" className="btn primary" onClick={start}>Start {gameTitles[mode]}<ArrowRight size={17}/></button>
  </Card>:finished?<div className="game-results">
   <Card className="game-result-banner">
    <Trophy size={32} aria-hidden="true"/>
    <h2>Round complete</h2>
    <strong>{round.score.toLocaleString()} points</strong>
    <p>{right} correct out of {round.marks.length} played</p>
    <div className="button-row">
     <button className="btn primary" onClick={()=>setRound(null)}><RotateCcw size={16}/>Play again</button>
     <Link to="/play/history" className="btn">Game history</Link>
    </div>
   </Card>
   {round.marks.some(mark=>!mark.correct)&&<Card><h2>Review your misses</h2>
    {round.marks.filter(mark=>!mark.correct).map(mark=>{
     const question=round.questions.find(item=>item.id===mark.id);
     return question?<ReviewQuestion key={mark.id} q={question} selected={mark.selected}/>:null;
    })}
   </Card>}
  </div>:<>
   {round.supplemented&&<p className="game-notice">This round also uses cards from the same subject so you have enough to play.</p>}
   <div className="game-score-bar">
    <span><Zap size={18} aria-hidden="true"/>{round.score.toLocaleString()} points</span>
    {mode==="rapid"?<><span><Clock size={18} aria-hidden="true"/>{Math.max(0,Math.ceil((round.deadline-clock)/1000))} s</span>
     <span>×{1+Math.floor(round.streak/3)} multiplier</span></>:<span>{round.marks.length} of {round.questions.length} answered</span>}
   </div>
   {mode==="match"?<MatchBoard key={round.marks.length} board={round.questions.slice(round.marks.length,round.marks.length+matchBoardSize)}
    index={Math.floor(round.marks.length/matchBoardSize)} seed={round.startedAt} onNext={(marks,score)=>{
     setRound(value=>value?.marks.length===round.marks.length?{...value,marks:[...value.marks,...marks],score:value.score+score}:value);
    }}/>:current&&<Card className="game-question">
     <div className="section-head"><span className="tag">{current.subject}</span><span>{round.marks.length+1} / {round.questions.length}</span></div>
     <Progress value={round.marks.length} max={round.questions.length} label="Round progress"/>
     {last&&<p role="status" className={last.correct?"game-correct":"game-incorrect"}>
      {last.correct?mode==="rapid"?"Correct · +10 s":"Correct":mode==="rapid"?"Miss · −10 s":"Review this answer after the round"}
     </p>}
     <h2 ref={prompt} tabIndex={-1}>{gamePrompt(current)}</h2>
     {mode==="rapid"?<div className="game-answer-grid">
      {current.options.map((option,index)=><button key={index} className="game-answer" onClick={()=>answer(current,index===current.correctIndex,index)}>
       <span>{letters[index]}</span>{option.text}
      </button>)}
     </div>:<form onSubmit={event=>{event.preventDefault();if(typed.trim())answer(current,checkTypedAnswer(typed,recallAnswer(current)));}}>
      <label>Your answer<input ref={nextInput} value={typed} onChange={event=>setTyped(event.target.value)} autoComplete="off" maxLength={100}/></label>
      <div className="button-row"><button className="btn primary" disabled={!typed.trim()}>Check answer</button>
       <button type="button" className="btn" onClick={()=>answer(current,false)}>Skip card</button></div>
     </form>}
    </Card>}
  </>}
 </>;
}

function MatchBoard({board,index,seed,onNext}:{board:Question[];index:number;seed:number;onNext:(marks:Mark[],score:number)=>void}){
 const tiles=useMemo(()=>matchTiles(board,seed+index),[board,seed,index]);
 const [selected,setSelected]=useState("");
 const [pairs,setPairs]=useState<Record<string,string>>({});
 const [checked,setChecked]=useState(false);
 const [opened]=useState(Date.now);
 const [score,setScore]=useState(0);
 const marks=board.map(question=>({id:question.id,correct:tiles.find(tile=>tile.id===pairs[question.id])?.questionId===question.id}));
 function assign(id:string,tile:string){
  if(checked||!tiles.some(item=>item.id===tile))return;
  setPairs(current=>({...Object.fromEntries(Object.entries(current).filter(([,value])=>value!==tile)),[id]:tile}));
  setSelected("");
 }
 return <Card className="game-question match-board">
  <h2>Board {index+1} of 3</h2>
  <p>Pick a tile, then tap the clue it belongs with.</p>
  <div className="game-tiles" aria-label="Answer tiles">
   {tiles.map(tile=><button className="btn" key={tile.id} aria-pressed={selected===tile.id} disabled={checked||Object.values(pairs).includes(tile.id)}
    draggable={!checked&&!Object.values(pairs).includes(tile.id)} onDragStart={event=>event.dataTransfer.setData("text/plain",tile.id)}
    onClick={()=>setSelected(tile.id)}>{tile.label}</button>)}
  </div>
  <div className="game-clues">{board.map((question,i)=><div key={question.id} className="game-clue"
   onDragOver={event=>{if(!checked)event.preventDefault();}}
   onDrop={event=>{event.preventDefault();assign(question.id,event.dataTransfer.getData("text/plain"));}}>
   <p>{gamePrompt(question)}</p>
   <button className="btn" disabled={checked||(!selected&&!pairs[question.id])}
    onClick={()=>selected?assign(question.id,selected):setPairs(current=>Object.fromEntries(Object.entries(current).filter(([id])=>id!==question.id)))}>
    {tiles.find(tile=>tile.id===pairs[question.id])?.label||"Place tile"}
   </button>
   {checked&&<small className={marks[i].correct?"game-correct":"game-incorrect"}>
    {marks[i].correct?"Correct":`Answer: ${recallAnswer(question)}`}
   </small>}
  </div>)}</div>
  <div className="button-row">{checked?<button className="btn primary" onClick={()=>onNext(marks,score)}>{index===2?"See results":"Next board"}<ArrowRight size={16}/></button>
   :<><button className="btn primary" disabled={Object.keys(pairs).length<board.length} onClick={()=>{
    const correct=marks.filter(mark=>mark.correct).length;
    const elapsed=Math.floor((Date.now()-opened)/1000);
    setScore(correct*100+(correct===board.length?Math.max(0,120-elapsed):0));setChecked(true);
   }}><Check size={16}/>Check board</button>
    <button className="btn" onClick={()=>{setPairs({});setSelected("");}}>Clear placements</button></>}</div>
 </Card>;
}
