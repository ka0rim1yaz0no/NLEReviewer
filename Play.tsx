import {useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Award,Clock,Copy,Gamepad2,HeartPulse,Keyboard,Layers3,Radio,ShieldCheck,Swords,Trophy,Users,Zap} from "lucide-react";
import {timedRequest} from "./abort-utils";
import {curriculum} from "./curriculum";
import {gameTitles,recordGameRun,roomModes,soloModes} from "./play-engine";
import type {GameMode,RoomMode,SoloMode} from "./play-engine";
import {ReviewQuestion} from "./Quiz";
import {GameTopics,SoloPlay} from "./SoloPlay";
import {supabase,useApp} from "./store";
import type {Subject} from "./types";
import {Card,Empty,Heading,Link,Modal,Progress,letters} from "./ui";

type Overview={
 season:string;
 rank:{tier:number;stars:number;matches:number;wins:number;losses:number}|null;
 leaders:{label:string;stars:number;wins:number}[];
 openRooms:{code:string;mode:RoomMode;label:string;subject:string}[];
 recent:{code:string;mode:RoomMode;subject:string;ended:boolean}[];
};
type Room={
 code:string;mode:RoomMode;subject:Subject|"all";topic:string;owner:boolean;
 phase:"lobby"|"countdown"|"answer"|"reveal"|"finished";
 serverAt:number;startsAt:number|null;closesAt:number|null;expiresAt:number;
 item:number;total:number;questionId:string|null;selected:number|null;correctIndex:number|null;stability:number;
 players:{label:string;me:boolean;host:boolean;left:boolean;points:number;right:number}[];
 review:{id:string;choice:number;right:boolean}[];
 messages:{id:number;label:string;body:string;me:boolean}[];
};
const roomRoute=(code:string)=>"/play/room/"+code;
const ranks=["Spark","Ember","Flame","Lantern","Beacon"];
const gameIcons={rapid:Zap,match:Layers3,type:Keyboard,duel:Swords,ranked:Trophy,challenge:Users,quiz:Radio,code:HeartPulse,cup:Award};
const shortRules:Record<GameMode,string>={
 rapid:"Beat the clock and build a streak.",match:"Pair each clue with the right term.",type:"Recall the term without choices.",
 duel:"Answer the same questions against another student.",ranked:"Win stars across monthly seasons.",
 challenge:"Share a code and play the same round on your own time.",
 quiz:"Up to ten players. A fast correct answer earns more points.",
 code:"Work together to keep a simulated patient stable.",cup:"A scheduled group quiz with 15 questions.",
};
const playCode=(text:string)=>text.trim().toUpperCase().replace(/\s+/g,"");
const humanError=(error:unknown)=>error instanceof Error?error.message:"Online Play could not connect. Try again.";

async function callPlay<T>(name:string,args:Record<string,unknown>={},signal?:AbortSignal):Promise<T>{
 if(!supabase)throw new Error("Online Play needs a database connection.");
 const request=timedRequest(signal,9000);
 try{
  const {data,error}=await supabase.rpc(name,args).abortSignal(request.signal);
  if(error){
   if(error.code==="P0001"||error.code==="42501")throw new Error(error.message);
   throw new Error("Online Play could not connect. Try again.");
  }
  return data as T;
 }finally{request.dispose();}
}

function usePlayOverview(){
 const [overview,setOverview]=useState<Overview|null>(null),[error,setError]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const request=new AbortController();
  callPlay<Overview>("play_overview",{},request.signal).then(data=>{
   if(!request.signal.aborted){setOverview(data);setError("");}
  }).catch(failure=>{if(!request.signal.aborted)setError(humanError(failure));});
  return()=>request.abort();
 },[retry]);
 return {overview,error,retry:()=>setRetry(value=>value+1)};
}

export default function Play({route}:{route:string}){
 const segment=route.split("/")[2];
 if(route==="/play")return <PlayHome/>;
 if(segment==="history")return <GameHistory/>;
 if(segment==="room")return <GameRoom code={route.split("/")[3]||""}/>;
 if(soloModes.includes(segment as SoloMode))return <SoloPlay mode={segment as SoloMode}/>;
 if(roomModes.includes(segment as RoomMode))return <RoomSetup mode={segment as RoomMode}/>;
 return <Empty title="Game unavailable" description="Choose a game from Play." action={<Link className="btn" to="/play">Back to Play</Link>}/>;
}

function PlayHome(){
 const {state,update,navigate}=useApp();
 const {overview,error,retry}=usePlayOverview();
 const [code,setCode]=useState(""),[joining,setJoining]=useState(false),[joinError,setJoinError]=useState(""),[badges,setBadges]=useState(false);
 const runs=state.gameRuns||[];
 const xp=runs.reduce((sum,run)=>sum+20+Math.floor(run.score/100),0);
 const level=Math.floor(xp/125)+1;
 const lastSolo=[...runs].reverse().find(run=>soloModes.includes(run.mode as SoloMode));
 const resume=overview?.recent.find(room=>!room.ended);
 const earned=[
  ["First round",runs.length>0],["Five rounds",runs.length>=5],["Twenty rounds",runs.length>=20],
  ["Quick thinking",runs.some(run=>run.mode==="rapid"&&run.right>=10)],
  ["Perfect pairs",runs.some(run=>run.mode==="match"&&run.right===12)],
  ["Memory keeper",runs.some(run=>run.mode==="type"&&run.right===10)],
  ["Solo sampler",soloModes.every(mode=>runs.some(run=>run.mode===mode))],
  ["Team player",runs.some(run=>run.mode==="quiz"||run.mode==="code")],
  ["On the ladder",!!overview?.rank&&overview.rank.matches>=3],
  ["Beacon",overview?.rank?.tier===4],
  ["Night round",runs.some(run=>run.mode==="cup")],
 ] as const;
 async function join(value:string){
  setJoining(true);setJoinError("");
  try{navigate(roomRoute(await callPlay<string>("play_join",{p_code:playCode(value)})));}
  catch(failure){setJoinError(humanError(failure));}
  finally{setJoining(false);}
 }
 return <>
  <Heading title="Play" description="A quick way to recall what you’ve studied, on your own or with classmates." action={<Link className="btn" to="/play/history"><Clock size={17}/>Game history</Link>}/>
  <Card className="play-hero">
   <span className="game-emblem"><Gamepad2 size={36}/></span>
   <div><h2>Level {level}</h2><p>{xp.toLocaleString()} XP from your rounds</p>
    <Progress value={xp%125} max={125} label="XP to the next level"/></div>
   <div className="button-row">
    <Link className="btn primary" to={resume?roomRoute(resume.code):"/play/"+(lastSolo?.mode||"rapid")}>{resume?"Resume "+gameTitles[resume.mode]:lastSolo?"Play again: "+gameTitles[lastSolo.mode]:"Play Rapid Fire"}<ArrowRight size={16}/></Link>
    <button type="button" className="btn" onClick={()=>setBadges(true)}><Award size={16}/>Badges {earned.filter(([,done])=>done).length}/{earned.length}</button>
   </div>
  </Card>
  {error&&<Card className="game-notice"><p role="status">{error} You can still play solo.</p><button className="btn" onClick={retry}>Retry online rooms</button></Card>}
  <Card className="game-cup"><div><h2><Trophy size={20}/>Nightly Cup</h2><p>15 questions together. Lobby opens at 8:45 PM Philippine time.</p></div><Link to="/play/cup" className="btn">View the Cup</Link></Card>
  <GameGroup title="1 v 1" modes={["ranked","duel"]}/>
  <GameGroup title="With friends" modes={["quiz","code","challenge"]}/>
  <Card className="game-join">
   <form onSubmit={event=>{event.preventDefault();if(playCode(code))void join(code);}}>
    <label>Have a room code?<input value={code} onChange={event=>setCode(event.target.value)} maxLength={14} autoComplete="off" autoCapitalize="characters" placeholder="Enter code"/></label>
    <button className="btn primary" disabled={joining||!playCode(code)}>{joining?"Joining…":"Join room"}</button>
   </form>
   {joinError&&<p className="form-error" role="alert">{joinError}</p>}
   {!!overview?.openRooms.length&&<div className="game-rooms"><h3>Open rooms</h3>{overview.openRooms.map(room=>
    <button className="btn" key={room.code} disabled={joining} onClick={()=>void join(room.code)}>{gameTitles[room.mode]} · {room.label}</button>
   )}</div>}
  </Card>
  <GameGroup title="Solo" modes={[...soloModes]}/>
  <Card className="game-setup">
   <label className="game-check"><input type="checkbox" checked={state.preferences.playVault===true}
    onChange={event=>{const checked=event.target.checked;update(value=>({...value,preferences:{...value.preferences,playVault:checked}}));}}/>
    Save game misses to my Vault</label>
   <p className="fine-print">Finished games count toward your study streak. Your exam readiness score uses your practice answers.</p>
  </Card>
  {badges&&<Modal title="Game badges" onClose={()=>setBadges(false)}>
   <div className="game-badges">{earned.map(([name,done])=><span className={done?"earned":""} key={name}><Award size={17}/>{name}<small>{done?"Earned":"Locked"}</small></span>)}</div>
  </Modal>}
 </>;
}

function GameGroup({title,modes}:{title:string;modes:GameMode[]}){
 return <section className="game-group">
  <h2>{title}</h2>
  <div className="game-grid">{modes.map(mode=>{
   const Icon=gameIcons[mode];
   return <Link key={mode} to={"/play/"+mode} className={"game-mode mode-"+mode}>
    <span className="tile-icon"><Icon size={22} aria-hidden="true"/></span>
    <span><strong>{gameTitles[mode]}</strong><small>{shortRules[mode]}</small></span><ArrowRight size={16} aria-hidden="true"/>
   </Link>;
  })}</div>
 </section>;
}

function RoomSetup({mode}:{mode:RoomMode}){
 const {navigate}=useApp();
 const {overview}=usePlayOverview();
 const [subject,setSubject]=useState<Subject|"all">("all"),[topic,setTopic]=useState("");
 const [discoverable,setDiscoverable]=useState(mode==="duel"),[rules,setRules]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const rank=overview?.rank;
 async function open(){
  setBusy(true);setError("");
  try{
   const topicSubject=curriculum.find(item=>item.slug===topic)?.subject;
   const code=await callPlay<string>("play_open",{p_mode:mode,p_subject:mode==="ranked"||mode==="cup"?"all":topicSubject||subject,
    p_topic:mode==="ranked"||mode==="cup"?"":topic,p_public:mode==="ranked"||discoverable});
   navigate(roomRoute(code));
  }catch(failure){setError(humanError(failure));}
  finally{setBusy(false);}
 }
 return <>
  <Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link>
  <Heading title={gameTitles[mode]} description={shortRules[mode]}/>
  {mode==="ranked"&&<Card className="game-setup">
   <div className="section-head"><h2>{rank&&rank.matches>=3?ranks[rank.tier]:"Placement matches"}</h2><button className="btn" onClick={()=>setRules(true)}>How ranking works</button></div>
   <p>{rank?.matches??0} matches · {rank?.wins??0} wins · {rank?.losses??0} losses {rank?"· "+rank.stars+" stars":""}</p>
   <div className="game-ranks">{ranks.map((tier,index)=><span className={rank?.tier===index?"active":""} key={tier}>{tier}</span>)}</div>
   <p className="fine-print">Season {overview?.season||"current"} · Matchmaking looks for learners near your tier.</p>
   {!!overview?.leaders.length&&<><h3>Beacon top 10</h3><ol>{overview.leaders.map((player,index)=><li key={index}>{player.label} · {player.stars} stars</li>)}</ol></>}
  </Card>}
  <Card className="game-setup">
   {mode==="cup"?<p>The lobby is open from 8:45 PM until the 9:00 PM start. Times are in the Philippines.</p>
    :mode==="ranked"?<p>Ten timed questions. Your first three matches place you on the ladder.</p>
    :<><h2>Choose a subject or topic</h2><GameTopics subject={subject} topic={topic} setSubject={setSubject} setTopic={setTopic}/>
     {mode!=="challenge"&&<label className="game-check"><input type="checkbox" checked={discoverable} onChange={event=>setDiscoverable(event.target.checked)}/>
      {mode==="duel"?"Find another player online":"List the room for other students"}</label>}</>}
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button type="button" className="btn primary" disabled={busy} onClick={()=>void open()}>
    {busy?"Opening…":mode==="ranked"||mode==="duel"&&discoverable?"Find a match":mode==="cup"?"Join tonight’s lobby":"Create room"}<ArrowRight size={17}/>
   </button>
  </Card>
  {rules&&<Modal title="How ranking works" onClose={()=>setRules(false)}>
   <p>Play three placement matches. Wins earn stars, and five stars move you up one tier. A tie leaves your stars alone.</p>
   <p>A loss normally costs one star. Getting seven answers right protects it. Once you reach a tier, you keep it for the rest of the season.</p>
   <p>Seasons follow the Manila calendar month. The next season starts two tiers below your last one.</p>
  </Modal>}
 </>;
}

function GameRoom({code}:{code:string}){
 const {bankMap,navigate,update,toast}=useApp();
 const [room,setRoom]=useState<Room|null>(null),[error,setError]=useState(""),[revision,setRevision]=useState(0);
 const [busy,setBusy]=useState(false),[choiceBusy,setChoiceBusy]=useState(false);
 const [clock,setClock]=useState(Date.now),[message,setMessage]=useState(""),[chat,setChat]=useState(false);
 const [leaving,setLeaving]=useState(false);
 const offset=useRef(0),recorded=useRef(false);
 const refresh=()=>setRevision(value=>value+1);
 const valid=/^[A-F0-9]{10}$/.test(code);
 useEffect(()=>{
  if(!valid)return;
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  async function poll(){
   try{
    const next=await callPlay<Room>("play_room",{p_code:code},controller.signal);
    if(controller.signal.aborted)return;
    offset.current=next.serverAt-Date.now();
    setClock(Date.now());setRoom(next);setError("");
    timer=setTimeout(poll,next.phase==="answer"||next.phase==="reveal"||next.phase==="countdown"?800:1900);
   }catch(failure){if(!controller.signal.aborted)setError(humanError(failure));}
  }
  void poll();
  return()=>{controller.abort();if(timer)clearTimeout(timer);};
 },[code,valid,revision]);
 useEffect(()=>{
  if(!room?.closesAt)return;
  const timer=setInterval(()=>setClock(Date.now()),200);
  return()=>clearInterval(timer);
 },[room?.closesAt]);
 useEffect(()=>{
  if(!room||room.phase!=="finished"||!room.review.length||!room.startsAt||recorded.current)return;
  const me=room.players.find(player=>player.me);
  if(!me)return;
  recorded.current=true;
  update(state=>recordGameRun(state,{id:"room:"+room.code,mode:room.mode,startedAt:room.startsAt!,finishedAt:room.serverAt,
   score:me.points,right:me.right,answered:room.review.length,questionIds:room.review.map(item=>item.id)},
   room.review.filter(item=>!item.right).map(item=>item.id),state.preferences.playVault===true));
 },[room,update]);

 async function action(value:"start"|"leave"|"join"){
  setBusy(true);setError("");
  try{
   const done=value==="join"?await callPlay<string>("play_join",{p_code:code}):await callPlay<boolean>("play_room_action",{p_code:code,p_action:value});
   if(!done)throw new Error("This room is not ready for that action.");
   if(value==="leave")navigate("/play");
   else refresh();
  }catch(failure){setError(humanError(failure));}
  finally{setBusy(false);}
 }
 async function select(index:number){
  if(!room||choiceBusy)return;
  setChoiceBusy(true);setError("");
  try{
   const accepted=await callPlay<boolean>("play_answer",{p_code:code,p_item:room.item,p_choice:index});
   if(!accepted)toast("That answer was already locked or the timer ended.");
   if(accepted)setRoom(current=>current&&current.item===room.item?{...current,selected:index}:current);
   refresh();
  }catch(failure){setError(humanError(failure));}
  finally{setChoiceBusy(false);}
 }
 async function share(){
  try{await navigator.clipboard.writeText(location.origin+roomRoute(code));toast("Room link copied.");}
  catch{toast("Share the room code shown above.");}
 }
 async function send(){
  if(!message.trim()||busy)return;
  setBusy(true);
  try{
   if(!await callPlay<boolean>("play_message",{p_code:code,p_body:message}))throw new Error("Wait a moment between messages. Links and contact details are filtered.");
   setMessage("");refresh();
  }catch(failure){setError(humanError(failure));}
  finally{setBusy(false);}
 }
 if(!valid)return <Empty title="Invalid room code" description="Open Play to enter a valid room code." action={<Link className="btn" to="/play">Play</Link>}/>;
 if(!room)return <><Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link><Heading title={"Game room "+code}/>
  <Card className="game-setup">
   <p role="status">{error||"Opening the room…"}</p>
   {error&&<div className="button-row"><button className="btn primary" disabled={busy} onClick={()=>void action("join")}>Join room</button><button className="btn" onClick={refresh}>Try again</button></div>}
  </Card></>;
 const question=room.questionId?bankMap.get(room.questionId):undefined;
 const seconds=room.closesAt?Math.max(0,Math.ceil((room.closesAt-clock-offset.current)/1000)):0;
 const chatAvailable=(room.phase==="lobby"||room.phase==="finished")&&["quiz","code","challenge"].includes(room.mode);
 const canStart=room.mode==="challenge"||room.owner&&["quiz","code","duel"].includes(room.mode)&&room.players.filter(p=>!p.left).length>=2;
 return <>
  <Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link>
  <Heading title={gameTitles[room.mode]} description={room.phase==="lobby"?"Room "+code:undefined}/>
  {error&&<p role="alert" className="form-error">{error} <button className="btn small" onClick={refresh}>Retry connection</button></p>}
  {room.phase==="lobby"?<Card className="game-setup">
   <h2>{room.mode==="ranked"?"Looking for a ranked match":"Waiting room"}</h2>
   <p>{room.mode==="ranked"?"The match starts when another learner near your tier joins the queue.":room.mode==="challenge"?"Send the link to a friend. Each of you can play the same round when ready.":"Share this code so your classmates can join."}</p>
   {room.mode!=="ranked"&&<div className="button-row"><code className="room-code">{code}</code><button className="btn" onClick={()=>void share()}><Copy size={16}/>Copy invite link</button></div>}
   {canStart&&<button className="btn primary" disabled={busy} onClick={()=>void action("start")}>Start round</button>}
  </Card>:room.phase==="countdown"?<Card className="game-setup"><h2>Get ready</h2><p role="status">{seconds} seconds to start</p></Card>
  :room.phase==="finished"?<Card className="game-result-banner"><Trophy size={32}/><h2>{room.mode==="code"?(room.stability>0?"Patient stabilized":"Round complete"):"Round results"}</h2>
   {room.mode==="challenge"&&room.players.length<2&&<><p>Share the invite link so your friend can play the same round.</p>
    <button className="btn" onClick={()=>void share()}><Copy size={16}/>Copy invite link</button></>}
   <div className="button-row"><Link className="btn primary" to={"/play/"+room.mode}>Set up a rematch</Link><Link className="btn" to="/play/history">Game history</Link></div>
  </Card>:<Card className="game-question">
   <div className="game-score-bar"><span>Question {room.item} / {room.total}</span><span><Clock size={18}/>{seconds} s</span>
    {room.mode==="code"&&<span><HeartPulse size={18}/>Stability {room.stability}%</span>}</div>
   {question?<><h2>{question.stem}</h2><div className="game-answer-grid">{question.options.map((option,index)=>
    <button key={index} className={`game-answer ${room.correctIndex===index?"correct":room.selected===index?"chosen":""}`}
     aria-pressed={room.selected===index} disabled={room.phase!=="answer"||room.selected!==null||choiceBusy||seconds===0}
     onClick={()=>void select(index)}><span>{letters[index]}</span>{option.text}</button>
   )}</div>{room.phase==="reveal"&&room.correctIndex!==null&&<p role="status" className="game-correct">{question.options[room.correctIndex].text}</p>}</>
    :<p role="status">Waiting for the next question…</p>}
  </Card>}
  <Card className="game-standings"><h2>{room.phase==="finished"?"Final scores":"Players"}</h2>
   <ol>{room.players.map((player,index)=><li key={index}><span>{player.label}{player.me?" (you)":""}{player.left?" · left":""}</span>
    <strong>{player.points.toLocaleString()} pts</strong></li>)}</ol>
  </Card>
  {chatAvailable&&<Card className="game-chat"><button className="btn" aria-expanded={chat} onClick={()=>setChat(!chat)}>{chat?"Hide room chat":"Open room chat"}</button>
   {chat&&<><ul>{room.messages.map(line=><li key={line.id}><strong>{line.label}</strong> {line.body}</li>)}</ul>
    <form onSubmit={event=>{event.preventDefault();void send();}}><label>Message<input maxLength={160} value={message} onChange={event=>setMessage(event.target.value)}/></label>
     <button className="btn" disabled={busy||!message.trim()}>Send</button></form></>}
  </Card>}
  {room.phase==="finished"&&room.review.some(item=>!item.right)&&<Card><h2>Review your misses</h2>
   {room.review.filter(item=>!item.right).map(item=>{const q=bankMap.get(item.id);return q?<ReviewQuestion key={item.id} q={q} selected={item.choice}/>:null;})}
  </Card>}
  {room.phase!=="finished"&&<button className="btn" onClick={()=>setLeaving(true)}>Leave room</button>}
  {leaving&&<Modal title="Leave this room?" onClose={()=>setLeaving(false)}>
   <p>{room.mode==="ranked"&&room.startsAt?"Leaving a started ranked match counts as a loss.":"You can start another game from Play."}</p>
   <div className="button-row"><button className="btn" onClick={()=>setLeaving(false)}>Stay</button>
    <button className="btn primary" disabled={busy} onClick={()=>void action("leave")}>Leave room</button></div>
  </Modal>}
 </>;
}

function GameHistory(){
 const {state}=useApp();
 const {overview}=usePlayOverview();
 const [filter,setFilter]=useState<GameMode|"all">("all");
 const runs=(state.gameRuns||[]).filter(run=>filter==="all"||run.mode===filter).slice().sort((a,b)=>b.finishedAt-a.finishedAt);
 return <>
  <Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link>
  <Heading title="Game history" description="Your completed rounds and rooms you can reopen."/>
  {!!overview?.recent.length&&<Card className="game-setup"><h2>Recent rooms</h2><div className="button-row">
   {overview.recent.map(room=><Link key={room.code} className="btn" to={roomRoute(room.code)}>{gameTitles[room.mode]} · {room.code}</Link>)}
  </div></Card>}
  <Card className="game-setup">
   <label>Filter games<select value={filter} onChange={event=>setFilter(event.target.value as GameMode|"all")}>
    <option value="all">All games</option>{[...soloModes,...roomModes].map(mode=><option value={mode} key={mode}>{gameTitles[mode]}</option>)}
   </select></label>
   {runs.length?<ol className="game-history">{runs.map(run=><li key={run.id}><div><strong>{gameTitles[run.mode]}</strong><small>{new Date(run.finishedAt).toLocaleString("en-PH",{timeZone:state.profile.timezone,dateStyle:"medium",timeStyle:"short"})}</small></div>
    <span>{run.right}/{run.answered} · {run.score.toLocaleString()} pts</span></li>)}</ol>:<p>No completed games for this selection.</p>}
  </Card>
 </>;
}
