import {applyStudyCredits} from "./focus-timer";
import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { initialState } from "./engine";
import type { State } from "./engine";
import { questions, questionMap, installQuestionBank } from "./bank";
import { loadProtectedContent } from "./content-access";
import { supabase, profileLocked, identityChanging, readStudyIdentity, rememberSession, rememberedProfiles, lockProfile } from "./auth";
import type {StudyIdentity} from "./auth";
import {readProfileCache,writeProfileCache,mergeStudyStates,mergeLegacyState,sameStudyState} from "./sync-state";
import type {ProfileCache,CloudBase} from "./sync-state";
import {synchronizeProgress} from "./progress-sync";
import {formatQuestionForDisplay} from "./clinical-display";
export { supabase } from "./auth";
export { validateBackup } from "./validation";
import { validateBackup } from "./validation";
type Context = { creditStudy:(profileId:string,credits:Record<string,number>)=>void; state:State; update:(fn:(state:State)=>State)=>void; user:User|null; profileId:string; username:string; sharedProfile:boolean; switchProfile:()=>Promise<void>; ready:boolean; sync:string; accessError:string; retryContent:()=>void; toast:(message:string)=>void; navigate:(path:string)=>void; path:string; bank:typeof questions; bankMap:Map<string,typeof questions[number]> };
const AppContext=createContext<Context|null>(null);
export const useApp=()=>{const context=useContext(AppContext);if(!context)throw new Error("App context is missing");return context;};
function legacyCache(id:string):State|null{try{const raw=localStorage.getItem("nle-reviewer:v1:"+id);return raw?validateBackup(JSON.parse(raw)):null;}catch{return null;}}
export function Provider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>(initialState),[user,setUser]=useState<User|null>(null),[profileId,setProfileId]=useState(""),[username,setUsername]=useState(""),[sharedProfile,setSharedProfile]=useState(false);
 const [accessError,setAccessError]=useState(""),[bankVersion,setBankVersion]=useState(0),[ready,setReady]=useState(!supabase),[sync,setSync]=useState(supabase?"Connecting…":"Saved on this device"),[path,setPath]=useState(location.pathname+location.search),[message,setMessage]=useState("");
 const identity=useRef(""),authIdentity=useRef(""),generation=useRef(0),switching=useRef(false),saving=useRef<Promise<void>|null>(null),writable=useRef(false),cache=useRef<ProfileCache>({state:initialState(),base:null,pending:null}),clientId=useRef(crypto.randomUUID()),sequence=useRef(0);
 const put=useCallback((next:ProfileCache)=>{cache.current=next;setState(next.state);if(identity.current){try{writeProfileCache(identity.current,next);}catch{setSync("Storage full · export a backup");throw new Error("Device storage is full. Export a backup before continuing.");}}},[]);
 const flush=useCallback(async()=>{
  if(!supabase||!identity.current||!writable.current||profileLocked())return;
  if(saving.current){await saving.current;return;}
  const target=identity.current,turn=generation.current;
  const alive=()=>identity.current===target&&generation.current===turn;
  const task=(async()=>{
   if(!cache.current.pending&&cache.current.base&&sameStudyState(cache.current.state,cache.current.base.data))return;
   setSync("Saving…");
   try{
    await synchronizeProgress(target,clientId.current,++sequence.current,()=>cache.current,put,async(profile,pending)=>{
     const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
     try{const {data,error}=await supabase!.rpc("save_study_progress",{p_profile_id:profile,p_expected_revision:pending.base.revision,p_data:pending.data,p_client_id:pending.clientId,p_sequence:pending.sequence}).abortSignal(controller.signal);
      if(error)throw new Error("Cloud sync is unavailable. Your changes are kept on this device.");const row=data?.[0];
      if(!row)throw new Error("The save could not be confirmed.");return {saved:row.saved===true,profileId:row.profile_id,revision:Number(row.revision),data:validateBackup(row.data)};
     }finally{clearTimeout(timer);}
    },alive);
    if(alive())setSync("Synced with Supabase");
   }catch(error){if(alive())setSync((error as Error).message);}
  })();saving.current=task;try{await task;}finally{if(saving.current===task)saving.current=null;}
 },[put]);
 const pull=useCallback(async()=>{
  if(!supabase||!identity.current||!writable.current||profileLocked()||saving.current)return;
  await flush();if(saving.current||cache.current.pending)return;
  const target=identity.current,turn=generation.current,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const {data,error}=await supabase.from("study_states").select("data,revision").eq("user_id",target).abortSignal(controller.signal).maybeSingle();
   if(error)throw error;if(target!==identity.current||turn!==generation.current||!data||saving.current||cache.current.pending)return;
   const remote={revision:Number(data.revision),data:validateBackup(data.data)},current=cache.current;
   if(current.base&&remote.revision!==current.base.revision){const next=sameStudyState(current.state,current.base.data)?remote.data:mergeStudyStates(current.base.data,current.state,remote.data);put({state:next,base:remote,pending:null});}
   setSync("Synced with Supabase");
  }catch{if(target===identity.current)setSync("Saved on this device · reconnect to sync");}finally{clearTimeout(timer);}
 },[flush,put]);
 useEffect(()=>{const handler=()=>setPath(location.pathname+location.search);window.addEventListener("popstate",handler);return()=>window.removeEventListener("popstate",handler);},[]);
 useEffect(()=>{if(!message)return;const t=setTimeout(()=>setMessage(""),4500);return()=>clearTimeout(t);},[message]);
 useEffect(()=>{
  if(!supabase)return;let active=true,contentRequest:AbortController|undefined;
  async function load(nextUser:User|null){
   if(!active)return;contentRequest?.abort();const request=new AbortController();contentRequest=request;
   const turn=++generation.current;setReady(false);setUser(null);setAccessError("");writable.current=false;authIdentity.current=nextUser?.id||"";
   function clear(){installQuestionBank([],[]);setBankVersion(v=>v+1);identity.current="";setProfileId("");setUsername("");setSharedProfile(false);cache.current={state:initialState(),base:null,pending:null};setState(cache.current.state);setSync("Choose your study profile");setReady(true);}
   if(!nextUser||profileLocked()){if(active&&turn===generation.current)clear();return;}
   let owner:StudyIdentity|null=null,offline=false;
   try{owner=await readStudyIdentity(nextUser);}catch{const remembered=rememberedProfiles().find(p=>p.id===nextUser.id);if(remembered)owner={profileId:remembered.profileId,username:remembered.username,shared:remembered.shared};offline=true;}
   if(!active||turn!==generation.current||request.signal.aborted)return;
   if(!owner){clear();return;}
   try{const content=await loadProtectedContent(request.signal);if(!active||turn!==generation.current)return;installQuestionBank(content.questions,content.cases);setBankVersion(v=>v+1);}
   catch(error){if(active&&turn===generation.current){installQuestionBank([],[]);setBankVersion(v=>v+1);identity.current=owner.profileId;setProfileId(owner.profileId);setUsername(owner.username);setSharedProfile(owner.shared);setUser(nextUser);setAccessError((error as Error).message);setSync("Study content unavailable · progress kept");setReady(true);}return;}
   const local=readProfileCache(owner.profileId,validateBackup),legacy=local?null:legacyCache(owner.profileId);
   let next:ProfileCache=local||{state:legacy||initialState(),base:null,pending:null};
   let status=offline?"Saved on this device · reconnect to sync":"Synced with Supabase",canWrite=false,loadError="";
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
   try{const {data,error}=await supabase!.from("study_states").select("data,revision").eq("user_id",owner.profileId).abortSignal(controller.signal).maybeSingle();
    if(error)throw error;
    const remote:CloudBase={revision:data?Number(data.revision):0,data:data?validateBackup(data.data):initialState()};
    if(!Number.isSafeInteger(remote.revision)||remote.revision<0)throw new Error("Invalid cloud revision");
    canWrite=true;
    if(!next.pending){let merged=local?.base?(sameStudyState(local.state,local.base.data)?remote.data:mergeStudyStates(local.base.data,local.state,remote.data)):legacy?mergeLegacyState(legacy,remote.data):remote.data;if(!data&&!local&&!legacy)merged={...merged,profile:{...merged.profile,name:owner.username}};next={state:merged,base:remote,pending:null};}
   }catch(error){status="Saved on this device · reconnect to sync";if(!local&&!legacy){loadError="Your cloud progress could not be loaded. Reconnect before studying so a second profile is not created.";}else if(error instanceof Error&&error.message==="Invalid cloud revision")loadError="The cloud backup could not be verified. Your existing progress has been kept.";}
   finally{clearTimeout(timeout);}
   if(active&&turn===generation.current){identity.current=owner.profileId;setProfileId(owner.profileId);setUsername(owner.username);setSharedProfile(owner.shared);setUser(nextUser);writable.current=canWrite;setAccessError(loadError);setSync(status);try{put(next);}catch{writable.current=false;}setReady(true);}
  }
  void supabase.auth.getSession().then(({data})=>load(data.session?.user||null)).catch(()=>{setReady(true);setSync("Connection unavailable · try reconnecting");});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{rememberSession(session);if(!identityChanging()&&(event==="SIGNED_OUT"||(event==="SIGNED_IN"&&session?.user.id!==authIdentity.current)))setTimeout(()=>void load(session?.user||null),0);});
  const change=()=>{if(profileLocked()){void load(null);return;}void supabase!.auth.getSession().then(({data})=>load(data.session?.user||null)).catch(()=>load(null));};window.addEventListener("nle-profile-change",change);
  return()=>{active=false;contentRequest?.abort();subscription.unsubscribe();window.removeEventListener("nle-profile-change",change);};
 },[put]);
 useEffect(()=>{if(!ready||!user||accessError||!writable.current)return;const task=setTimeout(()=>void flush(),900);return()=>clearTimeout(task);},[state,ready,user,accessError,flush]);
 useEffect(()=>{const focus=()=>{if(document.visibilityState==="visible")void pull();};window.addEventListener("focus",focus);window.addEventListener("online",focus);document.addEventListener("visibilitychange",focus);const interval=setInterval(focus,30000);return()=>{window.removeEventListener("focus",focus);window.removeEventListener("online",focus);document.removeEventListener("visibilitychange",focus);clearInterval(interval);};},[pull]);
 useEffect(()=>{const media=matchMedia("(prefers-color-scheme: dark)");const apply=()=>{document.documentElement.dataset.theme=state.preferences.theme==="system"?(media.matches?"dark":"light"):state.preferences.theme;};apply();media.addEventListener("change",apply);return()=>media.removeEventListener("change",apply);},[state.preferences.theme]);
 const navigate=useCallback((next:string)=>{if(!next.startsWith("/")||next.startsWith("//"))return;history.pushState({},"",next);setPath(next);window.scrollTo({top:0,behavior:"instant"});},[]);
 const update=useCallback((fn:(value:State)=>State)=>{const previous=cache.current.state,next=fn(previous);if(!user||accessError){setState({...previous,preferences:{...previous.preferences,theme:next.preferences.theme}});return;}try{put({...cache.current,state:{...next,updatedAt:Date.now()}});}catch(error){setMessage((error as Error).message);}},[user,accessError,put]);
 const creditStudy=useCallback((target:string,credits:Record<string,number>)=>{if(identity.current!==target||profileLocked())return;const previous=cache.current.state,next=applyStudyCredits(previous,credits);if(next!==previous)try{put({...cache.current,state:{...next,updatedAt:Date.now()}});}catch(error){setMessage((error as Error).message);}},[put]);
 async function switchProfile(){
  if(switching.current)return;switching.current=true;const credits:Record<string,number>={};
  if(user)window.dispatchEvent(new CustomEvent("nle-study-timer-pause",{detail:{userId:identity.current,credits}}));
  if(Object.keys(credits).length)creditStudy(identity.current,credits);
  setReady(false);setSync("Saving your profile…");
  try{await flush();if(cache.current.pending)setMessage("Progress is kept on this device; cloud sync will retry when you return.");}
  finally{lockProfile();navigate("/login");switching.current=false;}
 }
 const retryContent=()=>window.dispatchEvent(new Event("nle-profile-change"));
 const bank=useMemo(()=>{if(!user||accessError)return[];const ids=new Set(questionMap.keys());return [...questions,...state.importedQuestions.filter(q=>!q.retired&&!ids.has(q.id))].map(formatQuestionForDisplay);},[state.importedQuestions,bankVersion,user,accessError]);
 const bankMap=useMemo(()=>!user||accessError?new Map():new Map([...questionMap.values()].map(q=>{const display=formatQuestionForDisplay(q);return[display.id,display] as const;}).concat(bank.map(q=>[q.id,q] as const))),[bank,user,accessError]);
 return <AppContext.Provider value={{state,update,user,profileId,username,sharedProfile,creditStudy,switchProfile,ready,sync,accessError,retryContent,toast:setMessage,navigate,path,bank,bankMap}}>{children}{message&&<div role="status" className="toast">{message}</div>}</AppContext.Provider>;
}
export function download(name: string, text: string, type="application/json") { const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000); }
