import {findCurriculumTopic} from "./curriculum";
import {useMemo,useState} from 'react';
import {ArrowRight,CalendarDays,Check,ChevronLeft,ChevronRight,Download,MoreHorizontal,Plus,RotateCcw,Undo2} from 'lucide-react';
import {subjects} from './bank';
import {dateKey,daysBetween} from './engine';
import type {StudyPlanSettings,Task} from './engine';
import type {Subject} from './types';
import {applyTaskOverrides,buildStudyPlan,calendarDates,exportStudyCalendar,shiftCalendar,spreadUnfinishedTasks,taskFinished,taskMinutes,undoTaskOverrides,validatePlanSettings,validDate} from './planning';
import type {PlanTopic} from './planning';
import {download,useApp} from './store';
import {useStartSession} from './Quiz';
import {Card,Empty,Heading,Modal,Progress} from './ui';
import './planner.css';

const shortDate=(date:string)=>new Date(date+'T12:00:00Z').toLocaleDateString('en-PH',{month:'short',day:'numeric',timeZone:'UTC'});
export const duration=(minutes:number)=>minutes>=60?`${Math.floor(minutes/60)}h${minutes%60?' '+minutes%60+'m':''}`:`${minutes}m`;
export function TaskRow({task,onManage}:{task:Task;onManage?:(task:Task)=>void}){
 const {state,update,navigate}=useApp(),start=useStartSession();
 function toggle(){update(s=>applyTaskOverrides(s,[{...task,done:!task.done,skipped:false}]));}
 function open(){
  if(task.skipped){onManage?.(task);return;}
  if(task.type==='read')navigate(`/resources/read?topic=${encodeURIComponent(task.subject+':'+task.topic)}`);
  else if(task.type==='practice'){const topic=findCurriculumTopic(task.subject+':'+task.topic);if(topic)navigate(`/practice/session?topic=${topic.slug}&count=${task.count||state.preferences.questionGoal}&related=1&difficulty=mixed`);else start({topics:[task.subject+':'+task.topic],count:task.count||state.preferences.questionGoal,title:task.topic+' practice',quick:true});}
  else if(task.type==='flashcards')navigate('/decks/review');
  else if(task.type==='vault')navigate('/vault');
  else if(task.type==='mock')navigate('/mock/'+task.mockBoard);
  else if(onManage)onManage(task);else toggle();
 }
 return <div className={`task ${task.done?'done':''} ${task.skipped?'skipped':''}`}>
  <button className='task-check' aria-label={`Mark ${task.title} ${task.done?'not done':'done'}`} aria-pressed={task.done} onClick={toggle}>{task.done&&<Check size={14}/>}</button>
  <button className='task-title' onClick={open}><span>{task.title}</span><small>{task.skipped?'Skipped':task.type==='practice'?`Up to ${task.count||state.preferences.questionGoal} questions · `:task.type==='flashcards'?`${state.preferences.flashcardGoal} cards · `:task.type==='mock'?'100 questions · ':''}{!task.skipped&&`~${duration(taskMinutes(task,state))}`}</small></button>
  {onManage?<button className='icon-btn task-manage' aria-label={`Manage ${task.title}`} onClick={()=>onManage(task)}><MoreHorizontal size={18}/></button>:!taskFinished(task)&&<ChevronRight size={15}/>}
 </div>;
}

export function StudyPlanner({topicList}:{topicList:PlanTopic[]}){
 const {state,update,toast}=useApp();
 const today=dateKey(Date.now(),state.profile.timezone);
 const plan=useMemo(()=>buildStudyPlan(state,topicList),[state,topicList]);
 const [anchor,setAnchor]=useState(today),[view,setView]=useState('week');
 const [edit,setEdit]=useState<Task|null>(null),[taskTitle,setTaskTitle]=useState(''),[taskDate,setTaskDate]=useState(today),[adding,setAdding]=useState(false),[dayOpen,setDayOpen]=useState('');
 const [settingsOpen,setSettingsOpen]=useState(false),[draft,setDraft]=useState<StudyPlanSettings>(plan.settings),[target,setTarget]=useState(state.profile.examDate),[goal,setGoal]=useState(state.preferences.questionGoal),[error,setError]=useState('');
 const [undo,setUndo]=useState<{before:Task[];after:Task[]}|null>(null);
 const active=plan.tasks.filter(t=>!t.skipped),done=active.filter(t=>t.done).length;
 const dates=calendarDates(anchor,view),todayTasks=plan.tasks.filter(t=>t.date===today);
 const backlog=plan.tasks.filter(t=>t.date<today&&!taskFinished(t));
 const totalMinutes=active.reduce((n,t)=>n+taskMinutes(t,state),0);
 const weekStart=calendarDates(today,'week')[0],weekEnd=calendarDates(today,'week').at(-1)!;
 const weekTasks=active.filter(t=>t.date>=weekStart&&t.date<=weekEnd);
 const byDay=useMemo(()=>{const map=new Map<string,Task[]>();for(const task of plan.tasks)map.set(task.date,[...(map.get(task.date)||[]),task]);return map;},[plan.tasks]);
 function manage(task:Task){setDayOpen('');setEdit(task);setTaskTitle(task.title);setTaskDate(task.date);setError('');}
 function add(date:string){setAdding(true);setTaskDate(date);setTaskTitle('');setError('');}
 function closeTask(){setEdit(null);setAdding(false);setError('');}
 function spread(all=false){
  const moved=spreadUnfinishedTasks(state,plan.tasks,today,plan.settings,all);
  if(!moved.length){toast(all?'There are no future study days or unfinished tasks to rebalance.':'No overdue tasks can be moved into the next seven days.');return;}
  setUndo({before:state.tasks,after:moved});update(s=>applyTaskOverrides(s,moved));toast(`${moved.length} unfinished tasks spread across your study days.`);
 }
 function undoSpread(){if(!undo)return;update(s=>undoTaskOverrides(s,undo.before,undo.after));setUndo(null);toast('Catch-up scheduling undone; later task edits are kept.');}
 function saveTask(){
  if(!taskTitle.trim()||!validDate(taskDate)){setError('Enter a task title and a valid date.');return;}
  const task:Task=edit?{...edit,title:taskTitle.trim(),date:taskDate}:{id:crypto.randomUUID(),date:taskDate,title:taskTitle.trim(),done:false,type:'custom',minutes:10};
  update(s=>applyTaskOverrides(s,[task]));closeTask();
 }
 function applySettings(){
  try{
   const settings=validatePlanSettings(draft,target);if(!Number.isInteger(goal)||goal<5||goal>100)throw new Error('Choose a daily question goal from 5 to 100.');
   update(s=>({...s,plan:settings,profile:{...s.profile,examDate:target},preferences:{...s.preferences,questionGoal:goal},tasks:s.tasks.filter(t=>!t.id.startsWith('plan:')||taskFinished(t))}));
   setSettingsOpen(false);setUndo(null);toast('Your full study schedule is ready.');
  }catch(e){setError((e as Error).message);}
 }
 function openSettings(){setDraft(plan.settings);setTarget(state.profile.examDate);setGoal(state.preferences.questionGoal);setError('');setSettingsOpen(true);}
 const renderTasks=(tasks:Task[])=>tasks.length?tasks.map(t=><TaskRow key={t.id} task={t} onManage={manage}/>):<p className='muted'>Nothing scheduled.</p>;
 return <>
  <Heading title='Study Plan' description={`${Math.max(0,daysBetween(today,state.profile.examDate))} days to your target · ${plan.topicCount} topics mapped across ${plan.days.length} study days.`} action={<button className='btn' onClick={()=>spread(true)}><RotateCcw size={16}/>Rebalance unfinished tasks</button>}/>
  <button className='btn plan-settings-trigger' onClick={openSettings}><CalendarDays size={18}/><span><strong>Plan settings</strong><small>{shortDate(plan.settings.startDate)} – {shortDate(state.profile.examDate)} · {duration(plan.settings.dailyMinutes)} a day · {plan.settings.restDays.length} rest {plan.settings.restDays.length===1?'day':'days'} each week</small></span><ChevronRight size={18}/></button>
  {plan.overloaded.length>0&&<p className='notice' role='status'>Your full plan exceeds the daily time budget on {plan.overloaded.length} {plan.overloaded.length===1?'day':'days'}. All selected topics are included. Extend your target date, add study days, or adjust the included steps in Plan settings.</p>}
  {!plan.days.length&&<p className='notice'>This plan has no available study days. Open Plan settings to choose new dates and study days.</p>}
  {backlog.length>0&&<Card className='plan-catchup'><div><h2>{backlog.length} overdue {backlog.length===1?'task':'tasks'}</h2><p>Spread them across the next seven days, respecting your rest days.</p></div><button className='btn primary' onClick={()=>spread()}><RotateCcw size={16}/>Catch up</button></Card>}
  {undo&&<div className='plan-undo' role='status'><span>Unfinished tasks rescheduled.</span><button className='btn small' onClick={undoSpread}><Undo2 size={16}/>Undo scheduling</button></div>}
  <Card className='today-card'><div className='section-head'><h2>Today · {shortDate(today)}</h2><span className='tag'>{todayTasks.filter(t=>t.done).length} / {todayTasks.filter(t=>!t.skipped).length} done</span></div><p className='muted'>{duration(plan.minutesByDay.get(today)||0)} remaining</p>{renderTasks(todayTasks)}<button className='text-button' onClick={()=>add(today)}><Plus size={16}/>Add a task</button></Card>
  <Card className='plan-progress'><div className='section-head'><h2>Plan progress</h2><span className='tag'>{done} / {active.length} done</span></div><Progress value={done} max={active.length||1} label='Whole plan completion'/><p>{plan.topicCount} selected topics · about {duration(totalMinutes)} in the full plan</p><div className='plan-mock-markers'>{[1,2,3,4,5].map(board=>{const tasks=active.filter(t=>t.mockBoard===board);return tasks.length>0&&<button className='btn small' key={board} onClick={()=>{setAnchor(tasks[0].date);setView('week');}}>Mock {board}<small>{shortDate(tasks[0].date)} · {tasks.filter(t=>t.done).length}/{tasks.length} sections</small></button>;})}</div><details><summary>Whole plan and subjects<ChevronRight size={16}/></summary><p>This week: {weekTasks.filter(t=>t.done).length} of {weekTasks.length} tasks done.</p>{subjects.filter(s=>plan.settings.subjects.includes(s.id)).map(s=>{const tasks=active.filter(t=>t.subject===s.id);return <div className='plan-subject-progress' key={s.id}><span>{s.short}</span><Progress value={tasks.filter(t=>t.done).length} max={tasks.length||1} label={`${s.name} plan completion`}/><small>{tasks.filter(t=>t.done).length}/{tasks.length}</small></div>;})}</details></Card>
  <div className='calendar-toolbar'><div className='button-row'><button className='icon-btn' aria-label='Previous period' onClick={()=>setAnchor(shiftCalendar(anchor,view,-1))}><ChevronLeft size={20}/></button><button className='btn small' onClick={()=>setAnchor(today)}>Today</button><button className='icon-btn' aria-label='Next period' onClick={()=>setAnchor(shiftCalendar(anchor,view,1))}><ChevronRight size={20}/></button></div><strong>{view==='day'?shortDate(anchor):view==='month'?new Date(anchor+'T12:00:00Z').toLocaleDateString('en-PH',{month:'long',year:'numeric',timeZone:'UTC'}):`${shortDate(dates[0])} – ${shortDate(dates.at(-1)!)}`}</strong><div className='tabs compact'>{['day','week','month'].map(v=><button key={v} aria-pressed={view===v} className={view===v?'active':''} onClick={()=>setView(v)}>{v}</button>)}</div></div>
  {view==='month'&&<div className='plan-month-labels'>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><small key={d}>{d}</small>)}</div>}
  <div className={`plan-calendar view-${view}`}>{dates.map(date=>{const tasks=byDay.get(date)||[],rest=plan.settings.restDays.includes(new Date(date+'T12:00:00Z').getUTCDay()),remaining=tasks.filter(t=>!taskFinished(t)).length;return view==='month'?<button key={date} className={`plan-month-day ${date===today?'is-today':''} ${date.slice(0,7)!==anchor.slice(0,7)?'other-month':''}`} aria-label={`${date}, ${tasks.length} tasks, ${remaining} remaining${rest?', rest day':''}`} onClick={()=>setDayOpen(date)}><strong>{Number(date.slice(-2))}</strong><small>{tasks.length?`${remaining}/${tasks.length}`:rest?'Rest':'—'}</small>{tasks.some(t=>t.type==='mock')&&<span className='plan-mock-dot' aria-label='Mock section scheduled'/>}</button>:<section key={date} className={`plan-calendar-day ${date===today?'is-today':''}`}><div className='section-head'><h3>{new Date(date+'T12:00:00Z').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})}{date===today?' · today':''}</h3><button className='icon-btn' aria-label={`Add task on ${date}`} onClick={()=>add(date)}><Plus size={17}/></button></div>{tasks.length?<><small>{duration(plan.minutesByDay.get(date)||0)} remaining</small>{renderTasks(tasks)}</>:<p className='muted'>{rest?'Rest day':'Nothing scheduled.'}</p>}</section>;})}</div>
  <Card className='calendar-export'><div><h2>Keep your plan close.</h2><p>Import the calendar file into Google, Apple, or Outlook Calendar.</p></div><button className='btn' onClick={()=>download('elaine-study-plan.ics',exportStudyCalendar(plan.tasks.filter(t=>t.date>=today)),'text/calendar')}><Download size={16}/>Export calendar</button></Card>
  {dayOpen&&<Modal title={shortDate(dayOpen)} onClose={()=>setDayOpen('')}><div className='plan-day-tasks'>{renderTasks(byDay.get(dayOpen)||[])}</div><button className='btn' onClick={()=>{const date=dayOpen;setDayOpen('');add(date);}}><Plus size={16}/>Add a task</button></Modal>}
  {(adding||edit)&&<Modal title={edit?'Manage task':'Add a task'} onClose={closeTask}><div className='form-card'><label>Task title<input autoFocus value={taskTitle} maxLength={200} onChange={e=>setTaskTitle(e.target.value)}/></label><label>Scheduled date<input type='date' value={taskDate} onInput={e=>setTaskDate(e.currentTarget.value)} onChange={e=>setTaskDate(e.target.value)}/></label>{error&&<p role='alert' className='form-error'>{error}</p>}<div className='button-row'><button className='btn primary' onClick={saveTask}>Save task<Check size={16}/></button>{edit&&<button className='btn' onClick={()=>{update(s=>applyTaskOverrides(s,[{...edit,skipped:!edit.skipped,done:false}]));closeTask();}}>{edit.skipped?'Restore task':'Skip task'}</button>}</div></div></Modal>}
  {settingsOpen&&<Modal title='Plan settings' onClose={()=>setSettingsOpen(false)}><div className='form-card plan-form'><div className='settings-grid'><label>Start date<input type='date' value={draft.startDate} onInput={e=>setDraft({...draft,startDate:e.currentTarget.value})} onChange={e=>setDraft({...draft,startDate:e.target.value})}/></label><label>Personal target date<input type='date' value={target} onInput={e=>setTarget(e.currentTarget.value)} onChange={e=>setTarget(e.target.value)}/></label><label>Daily study minutes<input type='number' min={15} max={720} value={draft.dailyMinutes||''} onChange={e=>setDraft({...draft,dailyMinutes:Number(e.target.value)})}/></label><label>Questions per topic session<input type='number' min={5} max={100} value={goal||''} onChange={e=>setGoal(Number(e.target.value))}/></label></div><fieldset><legend>Include subjects</legend><div className='plan-checkboxes'>{subjects.map(s=><label key={s.id}><input type='checkbox' checked={draft.subjects.includes(s.id)} onChange={e=>{const selected=e.target.checked?[...draft.subjects,s.id]:draft.subjects.filter(id=>id!==s.id);setDraft({...draft,subjects:selected,focus:draft.focus.filter(id=>selected.includes(id))});}}/>{s.short} · {s.name}</label>)}</div></fieldset><fieldset><legend>Schedule these subjects first</legend><div className='plan-checkboxes'>{subjects.filter(s=>draft.subjects.includes(s.id)).map(s=><label key={s.id}><input type='checkbox' checked={draft.focus.includes(s.id)} onChange={e=>setDraft({...draft,focus:e.target.checked?[...draft.focus,s.id]:draft.focus.filter(id=>id!==s.id)})}/>{s.short}</label>)}</div></fieldset><fieldset><legend>Rest days</legend><div className='plan-rest-days'>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=><button className={`btn small ${draft.restDays.includes(i)?'chosen':''}`} aria-pressed={draft.restDays.includes(i)} key={d} onClick={()=>setDraft({...draft,restDays:draft.restDays.includes(i)?draft.restDays.filter(n=>n!==i):[...draft.restDays,i]})}>{d}</button>)}</div></fieldset><fieldset><legend>Study steps</legend><div className='plan-checkboxes'>{[['reading','Read topic notes'],['flashcards','Daily flashcards'],['mocks','Five mock boards']].map(([key,label])=><label key={key}><input type='checkbox' checked={draft[key as 'reading'|'flashcards'|'mocks']} onChange={e=>setDraft({...draft,[key]:e.target.checked})}/>{label}</label>)}</div></fieldset><p className='fine-print'>Applying settings rebuilds unfinished generated tasks. Finished tasks, skipped tasks, custom tasks, answers, and progress are kept. A short date range may exceed your daily time budget. The target date is personal; it is not an official exam schedule.</p>{error&&<p role='alert' className='form-error'>{error}</p>}<button className='btn primary' onClick={applySettings}>Build my full plan<ArrowRight size={16}/></button></div></Modal>}
 </>;
}
