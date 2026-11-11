import {useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Award,Clock,Copy,Gamepad2,HeartPulse,Keyboard,Layers3,Radio,ShieldCheck,Swords,Trophy,Users,Zap} from "lucide-react";
import {callPlay,PlayRequestError,playErrorMessage as humanError} from "./play-api";
import {curriculum} from "./curriculum";
import {gameTitles,recordGameRun,roomModes,soloModes} from "./play-engine";
import type {GameMode,RoomMode,SoloMode} from "./play-engine";
import {ReviewQuestion} from "./Quiz";
import {GameTopics,SoloPlay} from "./SoloPlay";
import {useApp} from "./store";
import {PlayFriends} from "./PlayFriends";
import {PlayReminders} from "./PlayReminders";
import type {Subject} from "./types";
import {Card,Empty,Heading,Link,Modal,Progress,letters} from "./ui";

type Overview={
 season:string;
 cup?:{opensAt:number;startsAt:number;canJoin:boolean};
 rank:{tier:number;stars:number;matches:number;wins:number;losses:number}|null;
 leaders:{label:string;tier?:number;stars:number;wins:number;me?:boolean}[];
 rankPosition?:number|null;
 replaySharing?:boolean;
 openRooms:{code:string;mode:RoomMode;label:string;subject:string}[];
 recent:{code:string;mode:RoomMode;subject:string;ended:boolean}[];
};
type RankedResult={outcome:"void";season:string}|{
 outcome:"win"|"loss"|"draw";season:string;tier:number;stars:number;matches:number;
 starChange:number;bonus?:boolean;promoted:boolean;protected:boolean;forfeit:boolean;
};
type Room={
 code:string;mode:RoomMode;subject:Subject|"all";topic:string;owner:boolean;
 phase:"lobby"|"countdown"|"answer"|"reveal"|"finished";
 serverAt:number;startsAt:number|null;closesAt:number|null;expiresAt:number;
 finishedAt?:number|null;matchmakingAt?:number|null;rankedResult?:RankedResult|null;
 closed?:boolean;left?:boolean;searching?:boolean;rejoinable?:boolean;
 item:number;total:number;questionId:string|null;selected:number|null;correctIndex:number|null;stability:number;
 players:{label:string;me:boolean;host:boolean;left:boolean;points:number;right:number;simulated?:boolean;recorded?:boolean;
  status?:"waiting"|"playing"|"finished"|"left"|null}[];
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
const countdownText=(seconds:number)=>seconds<60?seconds+" s":
 Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0");
const manilaDate=new Intl.DateTimeFormat("en-PH",{
 timeZone:"Asia/Manila",weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",
});
const chatModes:RoomMode[]=["quiz","code","challenge"];
type CupResults={
 latest:{day:string;players:number;podium:{place:number;label:string;score:number;correct:number;me:boolean}[]}|null;
 weekStart:string;myWeekPoints:number;
 week:{position:number;label:string;points:number;wins:number;medals:number;me:boolean}[];
 previousChampion:{label:string;points:number;wins:number;medals:number;me:boolean}|null;
 hall:{position:number;label:string;wins:number;best:number;me:boolean}[];
};
const cupDate=new Intl.DateTimeFormat("en-PH",{month:"short",day:"numeric",timeZone:"UTC"});

function usePlayOverview(refreshMs=0){
 const [overview,setOverview]=useState<Overview|null>(null),[error,setError]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const request=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  let loading=false;
  async function load(){
   if(loading||request.signal.aborted)return;
   if(timer)clearTimeout(timer);
   loading=true;
   try{
    const data=await callPlay<Overview>("play_overview",{},request.signal);
    if(!request.signal.aborted){setOverview(data);setError("");}
   }catch(failure){if(!request.signal.aborted)setError(humanError(failure));}
   finally{
    loading=false;
    if(!request.signal.aborted&&refreshMs)timer=setTimeout(load,refreshMs);
   }
  }
  const resume=()=>{if(document.visibilityState==="visible")void load();};
  void load();
  window.addEventListener("online",resume);
  document.addEventListener("visibilitychange",resume);
  return()=>{
   request.abort();
   if(timer)clearTimeout(timer);
   window.removeEventListener("online",resume);
   document.removeEventListener("visibilitychange",resume);
  };
 },[retry,refreshMs]);
 return {overview,error,retry:()=>setRetry(value=>value+1)};
}

function CupResultsButton(){
 const [open,setOpen]=useState(false);
 return <><button className="btn" onClick={()=>setOpen(true)}>Cup results</button>
  {open&&<Modal title="Nightly Cup results" onClose={()=>setOpen(false)}><CupResultsContent/></Modal>}
 </>;
}

function CupResultsContent(){
 const [results,setResults]=useState<CupResults|null>(null),[error,setError]=useState(""),[retry,setRetry]=useState(0);
 useEffect(()=>{
  const request=new AbortController();
  callPlay<CupResults>("play_cup_results",{},request.signal).then(
   data=>{if(!request.signal.aborted){setResults(data);setError("");}},
   failure=>{if(!request.signal.aborted)setError(humanError(failure));}
  );
  return()=>request.abort();
 },[retry]);
 if(error)return <><p role="status">{error}</p><button className="btn" onClick={()=>{setError("");setRetry(n=>n+1);}}>Retry results</button></>;
 if(!results)return <p role="status">Loading Cup results…</p>;
 return <div className="cup-results">
  {results.latest?<section><h3>Latest Cup · {cupDate.format(new Date(results.latest.day+"T12:00:00Z"))}</h3>
   <p>{results.latest.players} {results.latest.players===1?"player":"players"}</p><ol>{results.latest.podium.map(row=><li key={row.place}>
    <span>{row.label}{row.me?" (you)":""}</span><strong>{row.score.toLocaleString()} pts · {row.correct}/15</strong>
   </li>)}</ol></section>:<p>Results appear once players finish a Cup.</p>}
  {results.previousChampion&&<section><h3>Last week’s champion</h3><p>{results.previousChampion.label}{results.previousChampion.me?" (you)":""} · {results.previousChampion.points} points</p></section>}
  <section><h3>This week · {cupDate.format(new Date(results.weekStart+"T12:00:00Z"))}</h3>
   <p>First place earns 10 points, second earns 6, and third earns 4. Your total is {results.myWeekPoints}.</p>
   {results.week.length>0&&<ol>{results.week.map(row=><li key={row.position}><span>{row.label}{row.me?" (you)":""}</span><strong>{row.points} pts</strong></li>)}</ol>}
  </section>
  {results.hall.length>0&&<section><h3>All-time winners</h3><ol>{results.hall.map(row=><li key={row.position}>
   <span>{row.label}{row.me?" (you)":""}</span><strong>{row.wins} {row.wins===1?"win":"wins"} · best {row.best.toLocaleString()} pts</strong>
  </li>)}</ol></section>}
 </div>;
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
 const {overview,error,retry}=usePlayOverview(8000);
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
  <Card className="game-cup"><div><h2><Trophy size={20}/>Nightly Cup</h2><p>15 questions together. Lobby opens at 8:45 PM Philippine time.</p></div><div className="button-row"><Link to="/play/cup" className="btn">View the Cup</Link><CupResultsButton/><a className="btn" href="#play-reminders">Remind me</a></div></Card>
  <GameGroup title="1 v 1" modes={["ranked","duel"]}/>
  <GameGroup title="With friends" modes={["quiz","code","challenge"]}/>
  <Card className="game-join">
   <form onSubmit={event=>{event.preventDefault();if(playCode(code))void join(code);}}>
    <label>Have a room code?<input value={code} onChange={event=>setCode(event.target.value)} maxLength={14} autoComplete="off" autoCapitalize="characters" placeholder="Enter code"/></label>
    <button className="btn primary" disabled={joining||!playCode(code)}>{joining?"Joining…":"Join room"}</button>
   </form>
   {joinError&&<p className="form-error" role="alert">{joinError}</p>}
   {overview&&<div className="game-rooms">
    <div className="section-head"><h3>Open rooms</h3><button className="text-button" onClick={retry}>Refresh rooms</button></div>
    {overview.openRooms.length?overview.openRooms.map(room=>
     <button className="btn" key={room.code} disabled={joining} onClick={()=>void join(room.code)}>{gameTitles[room.mode]} · {room.label}</button>
    ):<p>No public rooms right now.</p>}
   </div>}
  </Card>
  <PlayFriends/>
  <PlayReminders/>
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
 const {navigate,path}=useApp();
 const {overview,error:overviewError,retry}=usePlayOverview(mode==="cup"?8000:0);
 const [subject,setSubject]=useState<Subject|"all">("all"),[topic,setTopic]=useState("");
 const [discoverable,setDiscoverable]=useState(()=>mode==="duel"&&!new URLSearchParams(path.split("?")[1]).has("private")),[rules,setRules]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const [replaySharing,setReplaySharing]=useState<boolean>(),[savingReplay,setSavingReplay]=useState(false);
 const opening=useRef<AbortController|undefined>(undefined);
 const rank=overview?.rank;
 const activeRoom=overview?.recent.find(room=>room.mode===mode&&!room.ended);
 const activeRanked=mode==="ranked"&&!!activeRoom;
 const cup=overview?.cup;
 useEffect(()=>()=>opening.current?.abort(),[]);
 async function changeReplaySharing(enabled:boolean){
  setSavingReplay(true);setError("");
  try{setReplaySharing(await callPlay<boolean>("play_replay_sharing",{p_enabled:enabled}));}
  catch(failure){setError(humanError(failure));}
  finally{setSavingReplay(false);}
 }
 async function open(){
  if(opening.current)return;
  const request=new AbortController();
  opening.current=request;
  setBusy(true);setError("");
  try{
   const topicSubject=curriculum.find(item=>item.slug===topic)?.subject;
   const code=await callPlay<string>("play_open",{p_mode:mode,p_subject:mode==="ranked"||mode==="cup"?"all":topicSubject||subject,
    p_topic:mode==="ranked"||mode==="cup"?"":topic,p_public:mode==="ranked"||discoverable},request.signal);
   if(!request.signal.aborted)navigate(roomRoute(code));
  }catch(failure){if(!request.signal.aborted)setError(humanError(failure));}
  finally{opening.current=undefined;if(!request.signal.aborted)setBusy(false);}
 }
 return <>
  <Link to="/play" className="back"><ArrowLeft size={16}/>Play</Link>
  <Heading title={gameTitles[mode]} description={shortRules[mode]}/>
  {mode==="ranked"&&<Card className="game-setup">
   <div className="section-head"><h2>{rank&&rank.matches>=3?ranks[rank.tier]:"Placement matches"}</h2><button className="btn" onClick={()=>setRules(true)}>How ranking works</button></div>
   {overviewError?<p role="status">The ladder could not load. <button className="text-button" onClick={retry}>Reload standings</button></p>
    :!overview?<p role="status">Loading the ladder…</p>
    :<p>{rank?.matches??0} matches · {rank?.wins??0} wins · {rank?.losses??0} losses · {rank?.stars??0} stars</p>}
   <div className="game-ranks">{ranks.map((tier,index)=><span className={rank?.tier===index?"active":""} key={tier}>{tier}</span>)}</div>
   {overview&&<p className="fine-print">Season {overview.season}{overview.rankPosition?` · #${overview.rankPosition} this season`:""}</p>}
   {!!overview?.leaders.length&&<><h3>Season top 10</h3><ol className="ranked-leaders">{overview.leaders.map((player,index)=><li key={index}>
    <span>{player.label}{player.me?" (you)":""}</span><strong>{ranks[player.tier??4]} · {player.stars} {player.stars===1?"star":"stars"}</strong>
   </li>)}</ol></>}
  </Card>}
  <Card className="game-setup">
   {mode==="cup"?<>
    <p>The lobby opens at 8:45 PM and the first question starts at 9:00 PM Philippine time.</p>
    {overviewError?<p role="status">The Cup schedule could not load. <button className="text-button" onClick={retry}>Reload schedule</button></p>
     :cup?<p role="status">{cup.canJoin?"The lobby is open.":!activeRoom?"Next lobby opens "+manilaDate.format(cup.opensAt)+" Philippine time.":""}</p>
     :<p role="status">Checking the Cup schedule…</p>}
   </>
    :mode==="ranked"?<p>Ten questions, 15 seconds each. If no player near your tier joins within 8 seconds, you’ll play a simulated opponent.</p>
    :<><h2>Choose a subject or topic</h2><GameTopics subject={subject} topic={topic} setSubject={setSubject} setTopic={setTopic}/>
     {mode!=="challenge"&&<label className="game-check"><input type="checkbox" checked={discoverable} onChange={event=>setDiscoverable(event.target.checked)}/>
      {mode==="duel"?"Find another player online":"List the room for other students"}</label>}</>}
   {mode==="duel"&&<>
    <p>When nobody joins the live queue, the match uses a shared replay or a simulated opponent.</p>
    {overview?.replaySharing!==undefined&&<label className="game-check"><input type="checkbox" disabled={savingReplay}
     checked={replaySharing??overview.replaySharing} onChange={event=>void changeReplaySharing(event.target.checked)}/>
     Share my finished rounds for future matches</label>}
   </>}
   {error&&<p className="form-error" role="alert">{error}</p>}
   <div className="button-row">
    {activeRoom&&!activeRanked&&<Link className={mode==="cup"?"btn primary":"btn"} to={roomRoute(activeRoom.code)}>Resume {gameTitles[mode]}<ArrowRight size={17}/></Link>}
    {(mode!=="cup"||!activeRoom)&&<button type="button" className="btn primary" disabled={busy||mode==="cup"&&!cup?.canJoin} onClick={()=>void open()}>
     {busy?"Connecting…":activeRanked?"Resume ranked match":mode==="ranked"||mode==="duel"&&discoverable?"Find a match":
      mode==="cup"?cup?.canJoin?"Join tonight’s lobby":"Lobby closed":"Create room"}<ArrowRight size={17}/>
    </button>}
    {mode==="cup"&&<CupResultsButton/>}
    {mode==="challenge"&&<Link className="btn" to="/play/duel?private=1">Invite a friend to play live</Link>}
   </div>
  </Card>
  {mode==="cup"&&<PlayReminders cupOnly/>}
  {rules&&<Modal title="How ranking works" onClose={()=>setRules(false)}>
   <p>Play three placement matches. After placement, a win earns one star and five stars move you up a tier. A draw leaves your stars alone.</p>
   <p>Earn two stars for a win with at least 8 correct in Spark or Ember, 9 in Flame or Lantern, or 10 in Beacon. Wins by forfeit earn one star.</p>
   <p>Live and simulated matches both count. Faster correct answers score more points. The higher score wins.</p>
   <p>A loss normally costs one star. Getting seven answers right protects it. Once you reach a tier, you keep it for the rest of the season.</p>
   <p>Ranked looks for players near your tier and skips accepted friends. Seasons follow the Manila calendar month. The next season starts two tiers below your last one.</p>
  </Modal>}
 </>;
}

function GameRoom({code}:{code:string}){
 const {bankMap,navigate,update,toast}=useApp();
 const [room,setRoom]=useState<Room|null>(null),[error,setError]=useState(""),[revision,setRevision]=useState(0);
 const [connection,setConnection]=useState<{message:string;retrying:boolean;needsJoin:boolean}|null>(null);
 const [busy,setBusy]=useState(false),[choiceBusy,setChoiceBusy]=useState(false);
 const [clock,setClock]=useState(Date.now),[message,setMessage]=useState(""),[chat,setChat]=useState(false);
 const [leaving,setLeaving]=useState(false);
 const offset=useRef(0),recorded=useRef(false);
 const answerPending=useRef(false),roomActionPending=useRef(false);
 const questionHeading=useRef<HTMLHeadingElement>(null);
 const refresh=()=>setRevision(value=>value+1);
 const valid=/^[A-F0-9]{10}$/.test(code);
 const deadline=room?.closesAt??room?.matchmakingAt??(room?.searching?room.expiresAt:undefined);
 const seconds=deadline?Math.max(0,Math.ceil((deadline-clock-offset.current)/1000)):0;
 const questionId=room?.questionId;
 useEffect(()=>{
  if(!valid)return;
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  let inFlight=false,stopped=false,failures=0;
  const reconnect=()=>{
   if(document.visibilityState==="visible")void poll();
  };
  async function poll(){
   if(controller.signal.aborted||inFlight||stopped)return;
   if(timer)clearTimeout(timer);
   inFlight=true;
   let delay=0;
   const sentAt=Date.now();
   try{
    const next=await callPlay<Room>("play_room",{p_code:code},controller.signal);
    if(controller.signal.aborted)return;
    const receivedAt=Date.now();
    offset.current=next.serverAt-receivedAt+Math.min((receivedAt-sentAt)/2,500);
    setClock(receivedAt);
    setRoom(previous=>{
     if(previous?.item===next.item&&previous.selected!==null&&next.selected===null&&next.phase==="answer"){
      return {...next,selected:previous.selected};
     }
     return next;
    });
    setConnection(null);
    failures=0;
    const finished=next.phase==="finished";
    const keepWatching=next.closed===false&&(next.mode==="challenge"||next.rejoinable||next.left);
    const watchingChat=chat&&chatModes.includes(next.mode)&&!next.left;
    stopped=finished&&!keepWatching&&!watchingChat;
    const timed=next.phase==="answer"||next.phase==="reveal"||
     next.phase==="countdown"&&(next.mode!=="cup"||(next.closesAt??0)-next.serverAt<8000);
    delay=finished?3500:timed||next.mode==="ranked"||next.searching?800:1900;
   }catch(failure){
    if(controller.signal.aborted)return;
    const retrying=!(failure instanceof PlayRequestError)||failure.retryable;
    const needsJoin=failure instanceof PlayRequestError&&failure.needsJoin;
    setConnection({message:humanError(failure),retrying,needsJoin});
    stopped=!retrying;
    delay=Math.min(4000,1000*++failures);
   }finally{
    inFlight=false;
    if(!controller.signal.aborted&&!stopped&&delay>0)timer=setTimeout(poll,delay);
   }
  }
  void poll();
  window.addEventListener("online",reconnect);
  document.addEventListener("visibilitychange",reconnect);
  return()=>{
   controller.abort();
   if(timer)clearTimeout(timer);
   window.removeEventListener("online",reconnect);
   document.removeEventListener("visibilitychange",reconnect);
  };
 },[code,valid,revision,chat]);
 useEffect(()=>{
  if(!deadline)return;
  const timer=setInterval(()=>setClock(Date.now()),200);
  return()=>clearInterval(timer);
 },[deadline]);
 useEffect(()=>{
  if(!questionId)return;
  questionHeading.current?.focus({preventScroll:true});
  questionHeading.current?.closest(".game-question")?.scrollIntoView({block:"start",behavior:"instant"});
 },[questionId]);
 useEffect(()=>{
  if(!room||room.phase!=="finished"||!room.review.length||!room.startsAt||recorded.current)return;
  const me=room.players.find(player=>player.me);
  if(!me)return;
  recorded.current=update(state=>recordGameRun(state,{id:"room:"+room.code,mode:room.mode,startedAt:room.startsAt!,finishedAt:room.finishedAt??room.serverAt,
   score:me.points,right:me.right,answered:room.review.length,questionIds:room.review.map(item=>item.id)},
   room.review.filter(item=>!item.right).map(item=>item.id),state.preferences.playVault===true));
 },[room,update]);

 async function action(value:"start"|"leave"|"join"|"cancel"){
  if(roomActionPending.current)return;
  roomActionPending.current=true;
  setBusy(true);setError("");
  try{
   const done=value==="join"?await callPlay<string>("play_join",{p_code:code}):await callPlay<boolean>("play_room_action",{p_code:code,p_action:value});
   if(value==="cancel"){
    if(done)navigate("/play/"+(room?.mode??"duel"));
    else refresh();
    return;
   }
   if(!done)throw new Error("This room is not ready for that action.");
   if(value==="leave"){
    setLeaving(false);
    if((room?.mode==="ranked"||room?.mode==="duel")&&room.startsAt)refresh();
    else navigate(room?.mode==="ranked"?"/play/ranked":"/play");
   }else refresh();
  }catch(failure){setError(humanError(failure));}
  finally{roomActionPending.current=false;setBusy(false);}
 }
 async function select(index:number){
  if(!room||room.phase!=="answer"||room.selected!==null||answerPending.current||seconds===0)return;
  answerPending.current=true;
  setChoiceBusy(true);setError("");
  try{
   const accepted=await callPlay<boolean>("play_answer",{p_code:code,p_item:room.item,p_choice:index});
   if(!accepted)toast("That answer was already locked or the timer ended.");
   if(accepted)setRoom(current=>current&&current.item===room.item?{...current,selected:index}:current);
   refresh();
  }catch(failure){setError(humanError(failure));refresh();}
  finally{answerPending.current=false;setChoiceBusy(false);}
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
   <p role="status">{error||(!connection?"Opening the room…":connection.retrying?"Reconnecting to the room…":connection.message)}</p>
   {connection&&<div className="button-row">
    {connection.needsJoin&&<button className="btn primary" disabled={busy} onClick={()=>void action("join")}>Join room</button>}
    <button className="btn" onClick={refresh}>Retry connection</button>
   </div>}
  </Card></>;
 const question=room.questionId?bankMap.get(room.questionId):undefined;
 const ranked=room.mode==="ranked";
 const opponent=ranked||room.mode==="duel"?room.players.find(player=>!player.me):undefined;
 const closedLobby=room.phase==="finished"&&!room.startsAt&&room.closed!==false;
 const awaitingFriend=room.mode==="challenge"&&room.phase==="finished"&&room.closed===false&&!room.left;
 const cupLobby=room.mode==="cup"&&room.phase==="countdown";
 const chatAvailable=!room.left&&(room.phase==="lobby"||room.phase==="finished")&&chatModes.includes(room.mode);
 const canStart=room.mode==="challenge"||room.owner&&["quiz","code","duel"].includes(room.mode)&&room.players.filter(p=>!p.left).length>=2;
 return <>
  <Link to={ranked?"/play/ranked":"/play"} className="back"><ArrowLeft size={16}/>{ranked?"Ranked ladder":"Play"}</Link>
  <Heading title={gameTitles[room.mode]} description={
   opponent?(opponent.simulated?"Simulated opponent":opponent.recorded?"Recorded round by "+opponent.label:"Live match with "+opponent.label)
    :!ranked&&room.phase==="lobby"?"Room "+code:undefined
  }/>
  {connection&&<Card className="game-notice">
   <p role="status">{connection.retrying?"Reconnecting…":connection.message} {connection.retrying&&room.startsAt&&"The match clock keeps running."}</p>
   <button className="btn small" onClick={refresh}>Retry connection</button>
  </Card>}
  {error&&<p role="alert" className="form-error">{error} <button className="btn small" onClick={refresh}>Retry connection</button></p>}
  {room.phase==="lobby"?<Card className="game-setup">
   <h2>{ranked?"Looking for a ranked match":room.searching?"Looking for a live match":"Waiting room"}</h2>
   {ranked?<>
    <p>Searching for a live player near your tier.</p>
    <p className="ranked-queue-time" role="timer">{seconds>0?("Simulated opponent available in "+seconds+"s"):"Preparing a match…"}</p>
    <button className="btn" disabled={busy} onClick={()=>void action("cancel")}>Cancel search</button>
   </>:<>
    <p>{room.mode==="challenge"?"Send the link to a friend. Each of you can play the same round when ready."
     :room.searching?"A live player can join while the queue is open. You can also share the invite link."
     :room.owner&&!canStart?"Share the invite link. You can start once another player joins.":"The host can start when everyone is ready."}</p>
    {room.searching&&<p className="ranked-queue-time" role="timer">{seconds?`Finding a player · ${countdownText(seconds)}`:"Preparing a match…"}</p>}
    <div className="button-row"><code className="room-code">{code}</code><button className="btn" onClick={()=>void share()}><Copy size={16}/>Copy invite link</button></div>
    <div className="button-row">
     {room.searching&&<button className="btn" disabled={busy} onClick={()=>void action("cancel")}>Cancel search</button>}
     {canStart&&!room.searching&&<button className="btn primary" disabled={busy} onClick={()=>void action("start")}>Start round</button>}
    </div>
   </>}
  </Card>:room.phase==="countdown"?<Card className="game-setup">
   <h2>{cupLobby?"Nightly Cup lobby":ranked||room.mode==="duel"?"Match found":"Get ready"}</h2>
   <p role="timer">Starts in {countdownText(seconds)}</p>
   {cupLobby&&<div className="button-row"><code className="room-code">{code}</code>
    <button className="btn" onClick={()=>void share()}><Copy size={16}/>Copy lobby link</button></div>}
  </Card>
  :room.phase==="finished"?<Card className="game-result-banner"><Trophy size={32}/>
   {ranked?<RankedMatchResult result={room.rankedResult} expired={closedLobby}/>
    :<h2>{room.rejoinable?"You left the lobby":closedLobby?"Room closed":awaitingFriend?"Your round is complete":roomResultTitle(room)}</h2>}
   {awaitingFriend&&<p>Your friend can still play. The final scores will appear when both rounds end.</p>}
   {room.mode==="code"&&!closedLobby&&!room.left&&<p>Final patient stability {room.stability}%</p>}
   {awaitingFriend&&room.players.length<2&&<>
    <button className="btn" onClick={()=>void share()}><Copy size={16}/>Copy invite link</button></>}
   <div className="button-row">
    {room.rejoinable&&<button className="btn primary" disabled={busy} onClick={()=>void action("join")}>Rejoin lobby</button>}
    <Link className={room.rejoinable?"btn":"btn primary"} to={"/play/"+room.mode}>{ranked?"Back to Ranked":room.mode==="cup"?"Back to Nightly Cup":"Back to "+gameTitles[room.mode]}</Link>
    <Link className="btn" to="/play/history">Game history</Link>
   </div>
  </Card>:<Card className="game-question online-game-question">
   <div className="game-score-bar"><span>Question {room.item} / {room.total}</span><span role="timer"><Clock size={18}/>{seconds} s</span>
    {room.mode==="code"&&<span><HeartPulse size={18}/>Stability {room.stability}%</span>}</div>
   {question?<><h2 ref={questionHeading} tabIndex={-1}>{question.stem}</h2><div className="game-answer-grid">{question.options.map((option,index)=>
    <button key={index} className={`game-answer ${room.correctIndex===index?"correct":room.selected===index?"chosen":""}`}
     aria-pressed={room.selected===index} disabled={room.phase!=="answer"||room.selected!==null||choiceBusy||seconds===0}
     onClick={()=>void select(index)}><span>{letters[index]}</span>{option.text}</button>
   )}</div>{room.phase==="reveal"&&room.correctIndex!==null&&<p role="status" className="game-correct">Correct answer: {question.options[room.correctIndex].text}</p>}
   {room.phase==="answer"&&room.selected!==null&&<p role="status">Answer locked</p>}</>
    :<p role="status">This question could not load. <button className="text-button" onClick={()=>location.reload()}>Reload questions</button></p>}
  </Card>}
  {!closedLobby&&<Card className="game-standings"><h2>{room.phase==="finished"?room.closed===false?"Current scores":"Final scores":"Players"}</h2>
   <ol>{room.players.map((player,index)=><li key={index}>
    <span>{player.label}{player.me?" (you)":""}{player.recorded?" · replay":""}{player.left?" · left":
     player.status==="finished"?" · finished":player.status==="playing"?" · playing":
      player.status==="waiting"?room.closed?" · did not start":" · waiting":""}</span>
    <strong>{player.points.toLocaleString()} pts {room.phase==="finished"&&<small>· {player.right}/{room.total} correct</small>}</strong></li>)}</ol>
  </Card>}
  {chatAvailable&&<Card className="game-chat"><button className="btn" aria-expanded={chat} onClick={()=>setChat(!chat)}>{chat?"Hide room chat":"Open room chat"}</button>
   {chat&&<><ul>{room.messages.map(line=><li key={line.id}><strong>{line.label}</strong> {line.body}</li>)}</ul>
    <form onSubmit={event=>{event.preventDefault();void send();}}><label>Message<input maxLength={160} value={message} onChange={event=>setMessage(event.target.value)}/></label>
     <button className="btn" disabled={busy||!message.trim()}>Send</button></form></>}
  </Card>}
  {room.phase==="finished"&&room.review.some(item=>!item.right)&&<Card><h2>Review your misses</h2>
   {room.review.filter(item=>!item.right).map(item=>{const q=bankMap.get(item.id);return q?<ReviewQuestion key={item.id} q={q} selected={item.choice}/>:null;})}
  </Card>}
  {room.phase!=="finished"&&!room.searching&&(!ranked||room.phase!=="lobby")&&<button className="btn" onClick={()=>setLeaving(true)}>Leave room</button>}
  {leaving&&<Modal title="Leave this room?" onClose={()=>setLeaving(false)}>
   <p>{room.mode==="ranked"&&room.startsAt?"Leaving a started ranked match counts as a loss.":"You can start another game from Play."}</p>
   <div className="button-row"><button className="btn" onClick={()=>setLeaving(false)}>Stay</button>
    <button className="btn primary" disabled={busy} onClick={()=>void action("leave")}>Leave room</button></div>
  </Modal>}
 </>;
}

function roomResultTitle(room:Room){
 if(room.left)return "You left the round";
 if(room.mode==="code")return room.stability>0?"Patient stabilized":"Patient stability reached zero";
 if(room.mode==="duel"){
  const you=room.players.find(player=>player.me);
  const other=room.players.find(player=>!player.me);
  if(you&&other){
   if(other.left||you.points>other.points)return "You won";
   return you.points===other.points?"Draw":"Match lost";
  }
 }
 return "Round results";
}

function RankedMatchResult({result,expired}:{result:RankedResult|null|undefined;expired:boolean}){
 if(expired)return <><h2>Search ended</h2><p>Open Ranked to find another match.</p></>;
 if(!result)return <h2>Round results</h2>;
 if(result.outcome==="void")return <><h2>Match closed</h2><p>No answers were submitted. Your ladder score is unchanged.</p></>;
 const title=result.outcome==="win"?"You won":result.outcome==="loss"?"Match lost":"Draw";
 return <>
  <h2>{title}</h2>
  {result.forfeit&&<p>{result.outcome==="win"?"Your opponent forfeited.":"You forfeited the match."}</p>}
  {result.promoted&&<p>Promoted to {ranks[result.tier]}.</p>}
  {result.bonus&&<p>Bonus win · 2 stars earned</p>}
  {result.protected&&<p>Your seven or more correct answers protected your star.</p>}
  {result.matches<=3?<p>{Math.min(result.matches,3)} of 3 placements completed{result.matches===3?" · "+ranks[result.tier]:""}</p>
   :<p>{ranks[result.tier]} · {result.stars} {result.stars===1?"star":"stars"}
    {result.starChange!==0&&!result.bonus&&" ("+(result.starChange>0?"+":"")+result.starChange+")"}</p>}
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
