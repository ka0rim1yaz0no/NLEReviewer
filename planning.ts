import {addDays,dateKey,daysBetween,linkedPracticeComplete} from './engine.ts';
import type {State,StudyPlanSettings,Task} from './engine.ts';
import type {Subject} from './types.ts';

export type PlanTopic={subject:string;name:string;count?:number;slug?:string};
const sectionIds:Subject[]=['CROSS','NP1','NP2','NP3','NP4','NP5'];
export function validDate(value:unknown):value is string{
 return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
}
export function planSettings(state:State):StudyPlanSettings{
 return state.plan||{startDate:addDays(state.profile.examDate,-110),dailyMinutes:180,restDays:[],subjects:[...sectionIds],focus:[],reading:true,flashcards:true,mocks:true};
}
export function validatePlanSettings(value:unknown,endDate:string):StudyPlanSettings{
 const p=value as StudyPlanSettings;
 if(!p||!validDate(p.startDate)||!validDate(endDate)||daysBetween(p.startDate,endDate)<0||daysBetween(p.startDate,endDate)>730)throw new Error('Choose a start and target date no more than two years apart.');
 if(!Number.isInteger(p.dailyMinutes)||p.dailyMinutes<15||p.dailyMinutes>720)throw new Error('Choose 15 to 720 study minutes per day.');
 if(!Array.isArray(p.restDays)||p.restDays.some(d=>!Number.isInteger(d)||d<0||d>6)||new Set(p.restDays).size!==p.restDays.length||p.restDays.length===7)throw new Error('Keep at least one study day each week.');
 if(!Array.isArray(p.subjects)||!p.subjects.length||p.subjects.some(s=>!sectionIds.includes(s))||new Set(p.subjects).size!==p.subjects.length)throw new Error('Choose at least one nursing subject.');
 if(!Array.isArray(p.focus)||p.focus.some(s=>!p.subjects.includes(s))||new Set(p.focus).size!==p.focus.length)throw new Error('Focus subjects must be included in your plan.');
 if([p.reading,p.flashcards,p.mocks].some(v=>typeof v!=='boolean'))throw new Error('Choose the study steps to include.');
 const days=Array.from({length:daysBetween(p.startDate,endDate)+1},(_,i)=>addDays(p.startDate,i));
 if(!days.some(d=>!p.restDays.includes(new Date(d+'T12:00:00Z').getUTCDay())))throw new Error('The date range has no study days. Extend it or change your rest days.');
 return {startDate:p.startDate,dailyMinutes:p.dailyMinutes,restDays:[...p.restDays],subjects:[...p.subjects],focus:[...p.focus],reading:p.reading,flashcards:p.flashcards,mocks:p.mocks};
}
export function taskMinutes(task:Task,state:State){return task.minutes??(task.type==='read'?10:task.type==='practice'?Math.ceil((task.count||state.preferences.questionGoal)*1.2):task.type==='flashcards'?7:task.type==='mock'?120:task.type==='vault'?15:10);}
export function taskFinished(task:Task){return task.done||!!task.skipped;}
function orderedTopics(topics:PlanTopic[],settings:StudyPlanSettings){
 const order=[...settings.focus,...settings.subjects.filter(s=>!settings.focus.includes(s))];
 const buckets=order.map(s=>topics.filter(t=>t.subject===s));
 const result:PlanTopic[]=[];
 for(let i=0;buckets.some(b=>b.length>i);i++)for(const bucket of buckets)if(bucket[i])result.push(bucket[i]);
 return result;
}
export function buildStudyPlan(state:State,topics:PlanTopic[]){
 const settings=planSettings(state),end=state.profile.examDate;
 const span=Math.min(731,Math.max(0,daysBetween(settings.startDate,end)+1));
 const days=Array.from({length:span},(_,i)=>addDays(settings.startDate,i)).filter(d=>!settings.restDays.includes(new Date(d+'T12:00:00Z').getUTCDay()));
 const generated:Task[]=[],loads=days.map(()=>0);
 const add=(task:Task,index:number)=>{generated.push({...task,date:days[index]});loads[index]+=taskMinutes(task,state);};
 if(days.length){
  if(settings.mocks){
   const sections=settings.subjects.filter(s=>s!=='CROSS'),total=sections.length*5;
   for(let board=1;board<=5;board++)sections.forEach((subject,j)=>{
    const slot=(board-1)*sections.length+j,index=Math.min(days.length-1,Math.floor((slot+1)*days.length/(total+1)));
    add({id:`plan:mock:${board}:${subject}`,date:'',title:`Mock Board ${board} · ${subject}`,done:state.sessions.some(s=>s.mockBoard===board&&s.subject===subject&&!!s.finishedAt),type:'mock',subject,mockBoard:board,minutes:120,count:100},index);
   });
  }
  // Every selected topic gets its own reading/practice block. Assign blocks by
  // current load; never silently drop topics to make an overloaded plan fit.
  for(const topic of orderedTopics(topics,settings)){
   const id=encodeURIComponent(topic.subject+':'+topic.name),count=Math.max(1,Math.min(state.preferences.questionGoal,topic.count||state.preferences.questionGoal));
   const index=loads.indexOf(Math.min(...loads));
   if(settings.reading)add({id:`plan:read:${id}`,date:'',title:`Read: ${topic.name}`,done:!!topic.slug&&state.read.includes('catalog:'+topic.slug),type:'read',subject:topic.subject as Subject,topic:topic.name,minutes:10},index);
   const taskId=`plan:practice:${id}`;
   const practiced=state.sessions.some(s=>s.planTaskId===taskId&&linkedPracticeComplete(s)||
    !!s.finishedAt&&s.title===topic.name+' practice'&&s.questionIds.length>=count&&dateKey(s.finishedAt,state.profile.timezone)>=settings.startDate);
   add({id:taskId,date:'',title:`Study: ${topic.name}`,done:practiced,type:'practice',subject:topic.subject as Subject,topic:topic.name,minutes:Math.ceil(count*1.2),count},index);
  }
  for(const [index,date] of days.entries()){
   if(settings.flashcards)add({id:`plan:flash:${date}`,date,title:'Flashcards · due cards and weak spots',done:false,type:'flashcards',minutes:Math.max(3,Math.ceil(state.preferences.flashcardGoal/3)),count:state.preferences.flashcardGoal},index);
   if(index%7===6)add({id:`plan:vault:${date}`,date,title:'Weak spots · review unresolved misses',done:false,type:'vault',minutes:15},index);
  }
 }
 const overrides=new Map(state.tasks.map(t=>[t.id,t]));
 const ids=new Set(generated.map(t=>t.id));
 const tasks=[...generated.map(t=>overrides.get(t.id)||t),...state.tasks.filter(t=>!ids.has(t.id)&&(!t.id.startsWith('plan:')||t.done||t.type==='custom'))];
 const priority:Record<Task['type'],number>={read:0,practice:1,vault:2,flashcards:3,mock:4,custom:5};
 tasks.sort((a,b)=>a.date.localeCompare(b.date)||priority[a.type]-priority[b.type]||a.id.localeCompare(b.id));
 const minutesByDay=new Map<string,number>();
 for(const task of tasks.filter(t=>!taskFinished(t)))minutesByDay.set(task.date,(minutesByDay.get(task.date)||0)+taskMinutes(task,state));
 const overloaded=[...minutesByDay].filter(([date,n])=>date>=settings.startDate&&date<=end&&n>settings.dailyMinutes);
 return {settings,days,tasks,minutesByDay,overloaded,topicCount:topics.filter(t=>settings.subjects.includes(t.subject as Subject)).length};
}
export function planTasks(date:string,state:State,topics:PlanTopic[]){return buildStudyPlan(state,topics).tasks.filter(t=>t.date===date);}

export function spreadUnfinishedTasks(state:State,tasks:Task[],today:string,settings:StudyPlanSettings,all=false):Task[]{
 const end=all?state.profile.examDate:[addDays(today,6),state.profile.examDate].sort()[0];
 const days=Array.from({length:Math.max(0,Math.min(731,daysBetween(today,end)+1))},(_,i)=>addDays(today,i)).filter(d=>d>=settings.startDate&&!settings.restDays.includes(new Date(d+'T12:00:00Z').getUTCDay()));
 if(!days.length)return [];
 const moving=tasks.filter(t=>!taskFinished(t)&&(all||t.date<today));
 const movingIds=new Set(moving.map(t=>t.id)),loads=days.map(d=>tasks.filter(t=>t.date===d&&!taskFinished(t)&&!movingIds.has(t.id)).reduce((n,t)=>n+taskMinutes(t,state),0));
 const groups=new Map<string,Task[]>();
 for(const t of moving){const key=t.topic&&['read','practice'].includes(t.type)?`${t.subject}:${t.topic}`:t.id;groups.set(key,[...(groups.get(key)||[]),t]);}
 const result:Task[]=[];
 for(const group of groups.values()){
  const index=loads.indexOf(Math.min(...loads));
  result.push(...group.map(t=>({...t,date:days[index]})));loads[index]+=group.reduce((n,t)=>n+taskMinutes(t,state),0);
 }
 return result;
}
export function applyTaskOverrides(state:State,tasks:Task[]):State{
 const ids=new Set(tasks.map(t=>t.id));return {...state,tasks:[...state.tasks.filter(t=>!ids.has(t.id)),...tasks]};
}
export function undoTaskOverrides(state:State,before:Task[],after:Task[]):State{
 const previous=new Map(before.map(t=>[t.id,t])),applied=new Map(after.map(t=>[t.id,t]));
 const tasks=state.tasks.flatMap(t=>{const changed=applied.get(t.id);if(!changed||JSON.stringify(t)!==JSON.stringify(changed))return [t];const old=previous.get(t.id);return old?[old]:[];});
 return {...state,tasks};
}
export function shiftCalendar(anchor:string,view:string,direction:number){
 if(view!=='month')return addDays(anchor,direction*(view==='day'?1:7));
 const d=new Date(anchor+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+direction);return d.toISOString().slice(0,10);
}
export function calendarDates(anchor:string,view:string){
 if(view==='day')return [anchor];
 const first=view==='month'?anchor.slice(0,8)+'01':anchor;
 const start=addDays(first,-new Date(first+'T12:00:00Z').getUTCDay());
 return Array.from({length:view==='month'?42:7},(_,i)=>addDays(start,i));
}
function foldCalendarLine(line:string){let result='',part='',bytes=0;for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>75){result+=part+'\r\n';part=' ';bytes=1;}part+=c;bytes+=size;}return result+part;}
export function exportStudyCalendar(tasks:Task[],now=Date.now()){
 const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
 const stamp=new Date(now).toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//For Elaine Only Reviewer//Study Plan//EN','CALSCALE:GREGORIAN'];
 for(const t of tasks.filter(t=>!t.skipped))lines.push('BEGIN:VEVENT',`UID:${encodeURIComponent(t.id)}@nlereviewer`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${t.date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(t.date,1).replaceAll('-','')}`,`SUMMARY:${escape(t.title)}`,`STATUS:${t.done?'CONFIRMED':'TENTATIVE'}`,'END:VEVENT');
 return [...lines,'END:VCALENDAR'].map(foldCalendarLine).join('\r\n')+'\r\n';
}
