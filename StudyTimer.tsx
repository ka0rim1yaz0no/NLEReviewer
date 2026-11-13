import {useEffect,useRef,useState} from 'react';
import {Clock,Pause,Play,RotateCcw,SkipForward,Volume2,X} from 'lucide-react';
import {addDays,dateKey} from './engine';
import {advanceFocusTimer,cleanFocusSettings,focusCredits,freshFocusTimer,nextFocusPhase,stopwatchGap} from './focus-timer';
import type {FocusSegment,FocusSettings,FocusTimer} from './focus-timer';
import {useApp} from './store';
import {Card,Modal} from './ui';
import './study-timer.css';

const phaseName={focus:'Focus',short:'Short break',long:'Long break'};
const clock=(ms:number)=>{const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
export function StudyTimer(){
 const {state,profileId,update,toast,creditStudy,path}=useApp();
 const settings=cleanFocusSettings(state.focusSettings),settingsRef=useRef(settings);settingsRef.current=settings;
 const [open,setOpen]=useState(false),[timer,setTimer]=useState(()=>freshFocusTimer(settings)),[gap,setGap]=useState<FocusSegment|null>(null);
 const timerRef=useRef(timer),pending=useRef<FocusSegment[]>([]),lastCredit=useRef(Date.now()),audio=useRef<AudioContext|null>(null);
 const persistKey=`nle-reviewer:focus-timer:v1:${profileId}`;
 const profile=useRef({id:profileId,timezone:state.profile.timezone});profile.current={id:profileId,timezone:state.profile.timezone};
 function persist(next:FocusTimer){try{sessionStorage.setItem(persistKey,JSON.stringify({...next,running:false}));}catch{/* Timer still works if browser storage is unavailable. */}}
 function install(next:FocusTimer){timerRef.current=next;setTimer(next);persist(next);}
 async function unlockAudio(){try{audio.current??=new AudioContext();await audio.current.resume();}catch{/* A blocked sound never stops the timer. */}}
 function ring(){
  if(!settingsRef.current.sound||settingsRef.current.volume<=0||!audio.current||audio.current.state!=='running')return;
  const ctx=audio.current,start=ctx.currentTime,gain=ctx.createGain();gain.connect(ctx.destination);gain.gain.setValueAtTime(Math.min(.22,settingsRef.current.volume/500),start);gain.gain.exponentialRampToValueAtTime(.001,start+1.2);
  for(const [i,f] of [660,880,660].entries()){const oscillator=ctx.createOscillator();oscillator.frequency.value=f;oscillator.type='sine';oscillator.connect(gain);oscillator.start(start+i*.22);oscillator.stop(start+i*.22+.2);}
 }
 function flush(){
  if(pending.current.length){creditStudy(profile.current.id,focusCredits(pending.current,profile.current.timezone));pending.current=[];}
  lastCredit.current=Date.now();
 }
 function tick(now=Date.now(),notify=true){
  const skipped=stopwatchGap(timerRef.current,now);
  if(skipped){
   const paused={...timerRef.current,running:false,lastAt:now};
   install(paused);flush();
   if(notify){setGap(skipped);setOpen(true);}
   return paused;
  }
  const result=advanceFocusTimer(timerRef.current,settingsRef.current,now);pending.current.push(...result.segments);install(result.timer);
  if(result.completedPhases&&notify){ring();toast(`${phaseName[result.timer.phase]} ${result.timer.running?'started':'is ready'}.`);}
  if(now-lastCredit.current>=15000||result.completedPhases)flush();
  return result.timer;
 }
 useEffect(()=>{
  try{const raw=JSON.parse(sessionStorage.getItem(persistKey)||'null') as FocusTimer|null;if(raw&&['pomodoro','stopwatch'].includes(raw.mode)&&['focus','short','long'].includes(raw.phase)&&Number.isFinite(raw.elapsed)&&raw.elapsed>=0&&Number.isFinite(raw.length)&&raw.length>0&&Number.isInteger(raw.completed)&&raw.completed>=0){install({...raw,elapsed:raw.mode==='pomodoro'?Math.min(raw.elapsed,raw.length):raw.elapsed,running:false,lastAt:Date.now()});}}catch{/* Start a fresh timer if its saved display is damaged. */}
  const interval=setInterval(()=>{if(timerRef.current.running)tick();},500);
  const pauseForLeave=()=>{const next=tick(Date.now(),false);install({...next,running:false});flush();};
  const switchHandler=(event:Event)=>{
   const detail=(event as CustomEvent<{userId:string;credits:Record<string,number>}>).detail;if(detail.userId!==profile.current.id)return;
   const now=Date.now();
   const safe=stopwatchGap(timerRef.current,now)?{...timerRef.current,running:false}:timerRef.current;
   const result=advanceFocusTimer(safe,settingsRef.current,now);pending.current.push(...result.segments);install({...result.timer,running:false});setGap(null);
   Object.assign(detail.credits,focusCredits(pending.current,profile.current.timezone));pending.current=[];
  };
  window.addEventListener('pagehide',pauseForLeave);window.addEventListener('nle-study-timer-pause',switchHandler);
  return ()=>{clearInterval(interval);window.removeEventListener('pagehide',pauseForLeave);window.removeEventListener('nle-study-timer-pause',switchHandler);flush();if(audio.current){void audio.current.close();audio.current=null;}};
 },[]);
 function toggle(){void unlockAudio();const now=Date.now();if(stopwatchGap(timerRef.current,now)){tick(now);return;}const next=tick(now);install({...next,running:!next.running,lastAt:now});if(next.running)flush();}
 function resolveGap(count:boolean){
  if(gap&&count){
   pending.current.push(gap);install({...timerRef.current,elapsed:timerRef.current.elapsed+gap.end-gap.start});flush();
  }
  setGap(null);
 }
 function reset(mode=timerRef.current.mode){tick(Date.now(),false);flush();install(freshFocusTimer(settingsRef.current,mode));}
 function skip(){const next=tick(Date.now(),false);flush();const following=next.phase==='focus'?{...next,phase:'short' as const,elapsed:0,length:settingsRef.current.short*60000,lastAt:Date.now()}:nextFocusPhase(next,settingsRef.current,Date.now());install({...following,running:next.running});}
 function preference<K extends keyof FocusSettings>(key:K,value:FocusSettings[K]){update(s=>({...s,focusSettings:cleanFocusSettings({...cleanFocusSettings(s.focusSettings),[key]:value})}));}
 const today=dateKey(Date.now(),state.profile.timezone),days=Array.from({length:7},(_,i)=>addDays(today,i-6));
 const logs=days.map(d=>state.studyLog?.[d]||0),max=Math.max(60,...logs),week=logs.reduce((a,b)=>a+b,0);
 const route=path.split('?')[0].replace(/\/+$/,'');
 const inGame=route.startsWith('/play/')&&route!=='/play/history';
 const inTimedAssessment=inGame||route.startsWith('/session/')&&state.sessions.some(s=>route==='/session/'+s.id&&!s.finishedAt&&['mock','diagnostic'].includes(s.kind));
 useEffect(()=>{if(inTimedAssessment){const next=tick(Date.now(),false);install({...next,running:false});flush();setOpen(false);}},[inTimedAssessment]);
 if(inTimedAssessment)return null;
 return <div className='study-timer focus-timer'><button aria-label='Study timer' aria-expanded={open} className={`timer-trigger ${timer.running?'running':''}`} onClick={()=>setOpen(!open)}><Clock size={18}/>{timer.running&&<span>{clock(timer.mode==='stopwatch'?timer.elapsed:timer.length-timer.elapsed)}</span>}</button>{open&&<Card><div className='section-head'><h2>Study timer</h2><button className='icon-btn' aria-label='Close timer' onClick={()=>setOpen(false)}><X size={18}/></button></div><div className='tabs compact' aria-label='Timer mode'>{[['pomodoro','Pomodoro'],['stopwatch','Stopwatch']].map(([value,label])=><button key={value} aria-pressed={timer.mode===value} className={timer.mode===value?'active':''} onClick={()=>reset(value as FocusTimer['mode'])}>{label}</button>)}</div><p className='focus-phase'>{timer.mode==='stopwatch'?'Count up':phaseName[timer.phase]}</p><div className='clock-digits' role='timer' aria-label={timer.mode==='stopwatch'?'Stopwatch elapsed time':`${phaseName[timer.phase]} time remaining`}>{clock(timer.mode==='stopwatch'?timer.elapsed:timer.length-timer.elapsed)}</div>{timer.mode==='pomodoro'&&<p className='fine-print center'>{timer.completed} focus {timer.completed===1?'sprint':'sprints'} completed · long break every {settings.rounds}</p>}<div className='button-row'><button className='btn primary' onClick={toggle}>{timer.running?<Pause size={16}/>:<Play size={16}/>} {timer.running?'Pause':'Start'}</button>{timer.mode==='pomodoro'&&<button className='btn' aria-label='Skip to next phase' onClick={skip}><SkipForward size={16}/></button>}<button className='btn' aria-label='Reset timer cycle' onClick={()=>reset()}><RotateCcw size={16}/></button></div><div className='focus-hours'><h3>Study hours</h3><p>Today {Math.floor(logs.at(-1)!/60)}m · 7 days {Math.floor(week/60)}m</p><div className='focus-hours-chart' role='img' aria-label={`Focus study minutes in the last 7 days: ${days.map((d,i)=>d+': '+Math.floor(logs[i]/60)).join(', ')}`}>{days.map((d,i)=><div key={d} title={`${d}: ${Math.floor(logs[i]/60)} minutes`}><span style={{height:`${Math.max(2,logs[i]/max*55)}px`}}/><small>{new Date(d+'T12:00:00Z').toLocaleDateString('en',{weekday:'narrow',timeZone:'UTC'})}</small></div>)}</div><small>{(state.studySeconds/3600).toFixed(1)} total study hours · breaks excluded</small></div><details className='focus-settings'><summary>Timer settings</summary><div className='focus-setting-grid'>{[['focus','Focus minutes',120],['short','Short break minutes',60],['long','Long break minutes',120],['rounds','Sprints per cycle',12]].map(([key,label,max])=><label key={key}>{label}<input aria-label={String(label)} type='number' min={1} max={max} value={settings[key as 'focus'|'short'|'long'|'rounds']} onChange={e=>preference(key as 'focus',Number(e.target.value))}/></label>)}</div><label className='focus-checkbox'><input type='checkbox' checked={settings.autoStart} onChange={e=>preference('autoStart',e.target.checked)}/>Start the next phase automatically</label><label className='focus-checkbox'><input type='checkbox' checked={settings.sound} onChange={e=>preference('sound',e.target.checked)}/>Sound when a phase ends</label><label>Volume<input aria-label='Timer sound volume' type='range' min={0} max={100} value={settings.volume} onChange={e=>preference('volume',Number(e.target.value))}/></label><button className='btn small' onClick={async()=>{await unlockAudio();ring();}}><Volume2 size={16}/>Preview sound</button><p className='fine-print'>Length changes apply to the next phase. The timer continues between study pages and pauses when you reload, leave the app, switch profiles, or open a timed mock or diagnostic.</p></details></Card>}{gap&&<Modal title="Count the time while the timer was away?" onClose={()=>resolveGap(false)}>
  <p>The stopwatch paused after a gap of {clock(gap.end-gap.start)}. Add that time only if you were still studying.</p>
  <div className="button-row"><button className="btn" onClick={()=>resolveGap(false)}>Skip this time</button><button className="btn primary" onClick={()=>resolveGap(true)}>Count study time</button></div>
 </Modal>}</div>;
}
