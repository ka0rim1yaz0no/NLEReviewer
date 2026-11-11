import {useState} from "react";
import {ArrowRight,NotebookPen,Pin,Plus} from "lucide-react";
import {useApp} from "./store";
import {Card,Empty,Heading,Link,Modal} from "./ui";

type Note={key:string;title:string;body:string;pinned:boolean;saved:number};
function wallNotes(notes:Record<string,string>):Note[]{
 return Object.entries(notes).flatMap(([key,value])=>{
  if(!/^wall:[a-f0-9-]{36}$/.test(key))return [];
  try{
   const note=JSON.parse(value);
   return typeof note?.title==="string"&&typeof note.body==="string"&&Number.isFinite(note.saved)?
    [{key,title:note.title.slice(0,80),body:note.body.slice(0,1500),pinned:note.pinned===true,saved:note.saved}]:[];
  }catch{return [];}
 }).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.saved-a.saved);
}

export function WallPreview(){
 const {state}=useApp();
 if(!state.preferences.showWall)return null;
 const pinned=wallNotes(state.notes).filter(note=>note.pinned).slice(0,3);
 return <Card className="wall-preview">
  <div className="section-head"><h2><Pin size={17}/>From My Wall</h2><Link to="/wall" className="text-link">Open wall<ArrowRight size={15}/></Link></div>
  {pinned.length?pinned.map(note=><Link to="/wall" key={note.key}><strong>{note.title}</strong><span>{note.body}</span></Link>):<p>Pin a note on your wall to keep it here.</p>}
 </Card>;
}

export function StudyWall(){
 const {state,update,toast}=useApp();
 const [draft,setDraft]=useState<Note>();
 const [remove,setRemove]=useState<Note>();
 const notes=wallNotes(state.notes);
 function persist(note:Note){
  return update(current=>({...current,notes:{...current.notes,[note.key]:JSON.stringify(note)}}));
 }
 function add(){
  setDraft({key:"wall:"+crypto.randomUUID(),title:"",body:"",pinned:false,saved:Date.now()});
 }
 return <>
  <Heading title="My Wall" description="Keep the study reminders you want to see again."
   action={<button className="btn primary" onClick={add}><Plus size={17}/>New note</button>}/>
  <Card className="wall-setting"><label><input type="checkbox" checked={state.preferences.showWall===true}
   onChange={event=>{const checked=event.target.checked;update(current=>({...current,preferences:{...current.preferences,showWall:checked}}));}}/>Show pinned notes on Home</label></Card>
  {notes.length?<div className="wall-grid">{notes.map(note=><Card key={note.key} className="wall-note">
   <div className="section-head"><h2>{note.title}</h2><button className="icon-btn" aria-label={note.pinned?"Unpin "+note.title:"Pin "+note.title}
    aria-pressed={note.pinned} onClick={()=>persist({...note,pinned:!note.pinned})}><Pin size={19} fill={note.pinned?"currentColor":"none"}/></button></div>
   <p>{note.body}</p><div className="button-row"><button className="text-button" onClick={()=>setDraft(note)}>Edit note</button>
    <button className="text-button" onClick={()=>setRemove(note)}>Remove</button></div>
  </Card>)}</div>:<Card><Empty icon={<NotebookPen/>} title="Make this wall yours" description="Try saving a one-sentence takeaway from today’s review."/></Card>}
  {draft&&<Modal title={notes.some(note=>note.key===draft.key)?"Edit note":"New note"} onClose={()=>setDraft(undefined)}>
   <form className="wall-form" onSubmit={event=>{
    event.preventDefault();
    const title=draft.title.trim(),body=draft.body.trim();
    if(title&&body&&persist({...draft,title,body,saved:Date.now()})){toast("Note saved.");setDraft(undefined);}
   }}>
    <label>Title<input value={draft.title} maxLength={80} required onChange={event=>setDraft({...draft,title:event.target.value})}/></label>
    <label>Study note<textarea value={draft.body} maxLength={1500} required rows={5} onChange={event=>setDraft({...draft,body:event.target.value})}/></label>
    <button className="btn primary" disabled={!draft.title.trim()||!draft.body.trim()}>Save note</button>
   </form>
  </Modal>}
  {remove&&<Modal title="Remove this note?" onClose={()=>setRemove(undefined)}>
   <p>{remove.title}</p><div className="button-row"><button className="btn" onClick={()=>setRemove(undefined)}>Keep note</button>
    <button className="btn primary" onClick={()=>{if(update(current=>({...current,notes:Object.fromEntries(Object.entries(current.notes).filter(([key])=>key!==remove.key))})))setRemove(undefined);}}>Remove note</button></div>
  </Modal>}
 </>;
}
