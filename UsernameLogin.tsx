import {StudyNotebook} from "./StudyNotebook";
import bankSummary from "./bank-summary.json";
import { useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, User } from "lucide-react";
import { openUsernameProfile, rememberedProfiles, supabase } from "./auth";
import { priorityUsername, profilePickerEntries, studyLocation } from "./access";
import { useApp } from "./store";
import { Card, Link } from "./ui";
export default function UsernameLogin(){
 const {user,username,navigate,path}=useApp();
 const [name,setName]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const saved=profilePickerEntries(rememberedProfiles());
 async function enter(value:string,rememberedId?:string){
  setError("");setBusy(true);
  try{
   await openUsernameProfile(value,rememberedId);
   const target=new URLSearchParams(path.split("?")[1]).get("returnTo")||"/dashboard";
   const destination=studyLocation(target,location.origin);
   const safe=destination&&destination.origin===location.origin&&!destination.pathname.startsWith("/login");
   navigate(safe?destination.pathname+destination.search:"/dashboard",{replace:true});
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <div className="username-login">
  <div className="login-introduction study-banner">
   <p className="login-kicker"><BookOpen size={15}/>PNLE study space</p>
   <StudyNotebook className="login-notebook"/>
   <h1>Study for the PNLE</h1>
   <p className="login-description">Practice nursing decisions, learn why each choice works, and pick up where you left off.</p>
   <div className="login-benefits">
    <span><BookOpen size={17}/>{bankSummary.total.toLocaleString()} questions · {bankSummary.topics} topics</span>
    <span><User size={17}/>A separate profile for every student</span>
   </div>
  </div>
  <Card className="username-card">
   <span className="feature-icon" aria-hidden="true"><User size={23}/></span>
   <h2>{user?"Your study profile is ready.":"Sign in to study"}</h2>
   {user?<><p>Signed in as <strong>{username}</strong>.</p><Link className="btn primary full" to="/dashboard">Continue studying<ArrowRight size={16}/></Link></>:supabase?<>
    <p>Enter your username to open your study profile.</p>
    <form onSubmit={e=>{e.preventDefault();void enter(name);}}>
     <label>Username<input aria-label="Username" autoComplete="off" autoCapitalize="none" required maxLength={40} value={name} onChange={e=>setName(e.target.value)} placeholder="Your username" disabled={busy}/></label>
     {error&&<p className="login-error" role="alert">{error}</p>}
     <button className="btn primary full" disabled={busy||!name.trim()}>{busy?"Opening your profile…":"Start studying"}<ArrowRight size={16}/></button>
    </form>
    {saved.length>0&&<div className="remembered-profiles"><h3>Profiles on this browser</h3>{saved.map(p=><button key={p.profileId} disabled={busy} onClick={()=>void enter(p.username,p.id)}><span className="profile-initial" aria-hidden="true">{p.label.slice(0,2).toUpperCase()}</span><span>{p.label}</span><ChevronRight size={16}/></button>)}</div>}
    <p className="fine-print">Use <strong>{priorityUsername}</strong> on any device to open the shared progress and PDFs. Anyone entering this username can open that profile. Other profiles stay separate and are remembered on their original browser.</p>
   </>:<><p>The database connection needs to be configured before username sign-in is available.</p><Link to="/help" className="btn">View setup help</Link></>}
  </Card>
 </div>;
}
