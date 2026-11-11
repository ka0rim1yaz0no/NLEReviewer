import {dateKey} from './engine.ts';
import type {State} from './engine.ts';

export type FocusSettings={focus:number;short:number;long:number;rounds:number;autoStart:boolean;sound:boolean;volume:number};
export type FocusTimer={mode:'pomodoro'|'stopwatch';phase:'focus'|'short'|'long';completed:number;elapsed:number;length:number;running:boolean;lastAt:number};
export type FocusSegment={start:number;end:number};
export const defaultFocusSettings:FocusSettings={focus:25,short:5,long:15,rounds:4,autoStart:false,sound:true,volume:50};
export function cleanFocusSettings(raw?:Partial<FocusSettings>):FocusSettings{
 const num=(n:unknown,fallback:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.round(Math.max(min,Math.min(max,n))):fallback;
 return {focus:num(raw?.focus,25,1,120),short:num(raw?.short,5,1,60),long:num(raw?.long,15,1,120),rounds:num(raw?.rounds,4,1,12),autoStart:raw?.autoStart===true,sound:raw?.sound!==false,volume:num(raw?.volume,50,0,100)};
}
export function freshFocusTimer(settings:FocusSettings,mode:FocusTimer['mode']='pomodoro',now=Date.now()):FocusTimer{
 return {mode,phase:'focus',completed:0,elapsed:0,length:settings.focus*60000,running:false,lastAt:now};
}
export function stopwatchGap(timer:FocusTimer,now:number):FocusSegment|null{
 return timer.running&&timer.mode==='stopwatch'&&now-timer.lastAt>=120000?{start:timer.lastAt,end:now}:null;
}
export function nextFocusPhase(timer:FocusTimer,settings:FocusSettings,now:number):FocusTimer{
 const completed=timer.completed+(timer.phase==='focus'?1:0);
 const phase=timer.phase==='focus'?(completed%settings.rounds===0?'long':'short'):'focus';
 return {...timer,phase,completed,elapsed:0,length:settings[phase]*60000,running:false,lastAt:now};
}
export function advanceFocusTimer(previous:FocusTimer,settings:FocusSettings,now=Date.now()){
 let timer={...previous},cursor=timer.lastAt;
 const segments:FocusSegment[]=[];let completedPhases=0;
 if(!timer.running||now<=cursor)return {timer:{...timer,lastAt:Math.max(cursor,now)},segments,completedPhases};
 if(timer.mode==='stopwatch'){
  timer.elapsed+=now-cursor;timer.lastAt=now;segments.push({start:cursor,end:now});return {timer,segments,completedPhases};
 }
 while(cursor<now&&timer.running){
  const passed=Math.min(now-cursor,Math.max(0,timer.length-timer.elapsed));
  if(timer.phase==='focus'&&passed>0)segments.push({start:cursor,end:cursor+passed});
  cursor+=passed;timer.elapsed+=passed;
  if(timer.elapsed>=timer.length){timer=nextFocusPhase(timer,settings,cursor);completedPhases++;timer.running=settings.autoStart;}
 }
 timer.lastAt=now;return {timer,segments,completedPhases};
}
export function focusCredits(segments:FocusSegment[],timezone:string):Record<string,number>{
 const credits:Record<string,number>={};
 for(const {start,end} of segments){
  let cursor=start;
  while(cursor<end){
   const day=dateKey(cursor,timezone);let boundary=end;
   if(dateKey(end-1,timezone)!==day){
    let low=cursor,high=Math.min(end,cursor+27*3600000);
    while(high-low>1){const middle=Math.floor((low+high)/2);if(dateKey(middle,timezone)===day)low=middle;else high=middle;}
    boundary=high;
   }
   credits[day]=(credits[day]||0)+(boundary-cursor)/1000;cursor=boundary;
  }
 }
 return credits;
}
export function applyStudyCredits(state:State,credits:Record<string,number>):State{
 const log={...state.studyLog};let added=0;
 for(const [day,value] of Object.entries(credits)){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(value)||value<=0)continue;log[day]=(log[day]||0)+value;added+=value;}
 return added?{...state,studyLog:log,studySeconds:state.studySeconds+added}:state;
}
