import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from "react";
import type {ReactNode} from "react";
import type {Session,User} from "@supabase/supabase-js";
import {studyLocation} from "./access";
import {timedRequest} from "./abort-utils";
import {applyStudyCredits} from "./focus-timer";
import {initialState} from "./engine";
import type {State} from "./engine";
import {installQuestionBank,questionMap,questions} from "./bank";
import {loadProtectedContent} from "./content-access";
import {formatQuestionForDisplay} from "./clinical-display";
import {identityChanging,lockProfile,profileLocked,readStudyIdentity,rememberedProfiles,rememberSession,supabase} from "./auth";
import type {StudyIdentity} from "./auth";
import {readProfileCache,writeProfileCache} from "./sync-state";
import type {CloudBase,ProfileCache} from "./sync-state";
import {hasPendingProgress,reconcileCloudProgress,synchronizeProgress} from "./progress-sync";
import {validateBackup} from "./validation";

export {supabase,validateBackup};

type Context={
 creditStudy:(profileId:string,credits:Record<string,number>)=>void;
 state:State;
 update:(fn:(state:State)=>State)=>boolean;
 user:User|null;
 profileId:string;
 username:string;
 sharedProfile:boolean;
 switchProfile:()=>Promise<void>;
 ready:boolean;
 sync:string;
 accessError:string;
 retryContent:()=>void;
 toast:(message:string)=>void;
 navigate:(path:string,options?:{replace?:boolean})=>void;
 path:string;
 bank:typeof questions;
 bankMap:Map<string,typeof questions[number]>;
};

const AppContext=createContext<Context|null>(null);
const emptyQuestions:typeof questions=[];
const emptyBankMap=new Map<string,typeof questions[number]>();
const blankCache=():ProfileCache=>({state:initialState(),base:null,pending:null});
const currentPath=()=>location.pathname+location.search;

export function useApp(){
 const context=useContext(AppContext);
 if(!context)throw new Error("App context is missing");
 return context;
}

function legacyCache(id:string):ProfileCache|null{
 try{
  const raw=localStorage.getItem("nle-reviewer:v1:"+id);
  return raw?{state:validateBackup(JSON.parse(raw)),base:null,pending:null}:null;
 }catch{return null;}
}

async function fetchCloudProgress(profileId:string,signal?:AbortSignal){
 if(!supabase)throw new Error("Study storage is unavailable.");
 const request=timedRequest(signal,8000);
 try{
  const {data,error}=await supabase.from("study_states").select("data,revision")
   .eq("user_id",profileId).abortSignal(request.signal).maybeSingle();
  if(error)throw error;
  return data;
 }finally{request.dispose();}
}

function parseCloudProgress(row:Awaited<ReturnType<typeof fetchCloudProgress>>):CloudBase{
 const revision=row?Number(row.revision):0;
 if(!Number.isSafeInteger(revision)||revision<0)throw new Error("Invalid cloud revision");
 return {revision,data:row?validateBackup(row.data):initialState()};
}

export function Provider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>(initialState);
 const [user,setUser]=useState<User|null>(null);
 const [owner,setOwner]=useState<StudyIdentity|null>(null);
 const [accessError,setAccessError]=useState("");
 const [bankVersion,setBankVersion]=useState(0);
 const [ready,setReady]=useState(!supabase);
 const [sync,setSync]=useState(supabase?"Connecting…":"Choose your study profile");
 const [path,setPath]=useState(currentPath);
 const [message,setMessage]=useState("");

 const identity=useRef<StudyIdentity|null>(null);
 const authIdentity=useRef("");
 const generation=useRef(0);
 const switching=useRef(false);
 const saving=useRef<Promise<void>|null>(null);
 const pulling=useRef<AbortController|null>(null);
 const writable=useRef(false);
 const contentReady=useRef(false);
 const onDevice=useRef(true);
 const cache=useRef<ProfileCache>(blankCache());
 const clientId=useRef(crypto.randomUUID());
 const sequence=useRef(0);
 const profileId=owner?.profileId||"";
 const username=owner?.username||"";
 const sharedProfile=owner?.shared===true;

 const hasUnsavedMemory=useCallback(()=>{
  return !onDevice.current&&(!cache.current.base||hasPendingProgress(cache.current));
 },[]);

 const put=useCallback((next:ProfileCache)=>{
  cache.current=next;
  setState(next.state);
  if(!identity.current)return;
  try{
   writeProfileCache(identity.current.profileId,next);
   onDevice.current=true;
  }catch{
   onDevice.current=false;
   setSync(writable.current?"Device storage unavailable · syncing online":"Device storage unavailable · export a backup");
  }
 },[]);

 const flush=useCallback(async()=>{
  if(!supabase||!identity.current||!writable.current||profileLocked())return;
  const target=identity.current.profileId;
  const turn=generation.current;
  const alive=()=>identity.current?.profileId===target&&generation.current===turn&&!profileLocked();
  if(saving.current)await saving.current;
  if(!alive()||saving.current||!hasPendingProgress(cache.current))return;

  const task=(async()=>{
   setSync("Saving…");
   try{
    for(let batch=0;batch<3&&alive()&&hasPendingProgress(cache.current);batch++){
     await synchronizeProgress(target,clientId.current,++sequence.current,()=>cache.current,put,async(profile,pending)=>{
      const request=timedRequest(undefined,12000);
      try{
       const {data,error}=await supabase!.rpc("save_study_progress",{
        p_profile_id:profile,
        p_expected_revision:pending.base.revision,
        p_data:pending.data,
        p_client_id:pending.clientId,
        p_sequence:pending.sequence,
       }).abortSignal(request.signal);
       if(error)throw new Error("Cloud sync is unavailable. Your changes are kept on this device.");
       const row=data?.[0];
       if(!row)throw new Error("The save could not be confirmed.");
       return {saved:row.saved===true,profileId:row.profile_id,revision:Number(row.revision),data:validateBackup(row.data)};
      }finally{request.dispose();}
     },alive);
    }
    if(alive())setSync(hasPendingProgress(cache.current)?"New changes are awaiting cloud sync":"Synced with Supabase");
   }catch(error){
    if(alive())setSync(hasUnsavedMemory()?"Changes only in this tab · export a backup":(error as Error).message);
   }
  })();
  saving.current=task;
  try{await task;}finally{if(saving.current===task)saving.current=null;}
 },[put,hasUnsavedMemory]);

 const pull=useCallback(async()=>{
  if(!identity.current||!contentReady.current||profileLocked()||pulling.current||saving.current)return;
  const target=identity.current;
  const turn=generation.current;
  const controller=new AbortController();
  const alive=()=>!controller.signal.aborted&&identity.current?.profileId===target.profileId&&generation.current===turn&&!profileLocked();
  pulling.current=controller;
  try{
   if(writable.current)await flush();
   if(!alive()||saving.current||(writable.current&&cache.current.pending))return;
   const row=await fetchCloudProgress(target.profileId,controller.signal);
   if(!alive()||saving.current)return;

   const current=cache.current;
   const next=reconcileCloudProgress(current,parseCloudProgress(row),target.username);
   writable.current=true;
   if(next!==current)put(next);
   setAccessError("");
   if(hasPendingProgress(cache.current))await flush();
   else setSync("Synced with Supabase");
  }catch{
   if(alive())setSync(hasUnsavedMemory()?"Changes only in this tab · export a backup":"Saved on this device · reconnect to sync");
  }finally{
   if(pulling.current===controller)pulling.current=null;
  }
 },[flush,put,hasUnsavedMemory]);

 useEffect(()=>{
  const handlePop=()=>setPath(currentPath());
  window.addEventListener("popstate",handlePop);
  return()=>window.removeEventListener("popstate",handlePop);
 },[]);

 useEffect(()=>{
  if(!message)return;
  const timer=setTimeout(()=>setMessage(""),4500);
  return()=>clearTimeout(timer);
 },[message]);

 useEffect(()=>{
  if(!supabase)return;
  const client=supabase;
  let active=true;
  let contentRequest:AbortController|undefined;
  async function load(session:Session|null){
   if(!active)return;
   contentRequest?.abort();
   pulling.current?.abort();
   pulling.current=null;
   const request=new AbortController();
   contentRequest=request;
   const turn=++generation.current;
   const alive=()=>active&&turn===generation.current&&!request.signal.aborted;
   const nextUser=session?.user||null;
   setReady(false);
   setUser(null);
   setAccessError("");
   writable.current=false;
   contentReady.current=false;
   authIdentity.current=nextUser?.id||"";

   function clear(){
    installQuestionBank([],[]);
    setBankVersion(version=>version+1);
    identity.current=null;
    setOwner(null);
    cache.current=blankCache();
    onDevice.current=true;
    setState(cache.current.state);
    setSync("Choose your study profile");
    setReady(true);
   }
   if(!nextUser||profileLocked()){clear();return;}

   let nextOwner:StudyIdentity|null=null;
   try{
    nextOwner=await readStudyIdentity(nextUser);
    if(alive()&&nextOwner)rememberSession(session,nextOwner.username,nextOwner);
   }catch{
    const saved=rememberedProfiles().find(profile=>profile.id===nextUser.id);
    if(saved)nextOwner={profileId:saved.profileId,username:saved.username,shared:saved.shared};
   }
   if(!alive())return;
   if(!nextOwner){clear();return;}

   const [content,cloud]=await Promise.allSettled([
    loadProtectedContent(request.signal),
    fetchCloudProgress(nextOwner.profileId,request.signal),
   ]);
   if(!alive())return;
   const memory=identity.current?.profileId===nextOwner.profileId?cache.current:null;
   identity.current=nextOwner;
   setOwner(nextOwner);
   setUser(nextUser);

   if(content.status==="rejected"){
    installQuestionBank([],[]);
    setBankVersion(version=>version+1);
    cache.current=memory||blankCache();
    setState(cache.current.state);
    setAccessError((content.reason as Error).message);
    setSync("Study content unavailable · progress kept");
    setReady(true);
    return;
   }

   installQuestionBank(content.value.questions,content.value.cases);
   setBankVersion(version=>version+1);
   contentReady.current=true;
   const keepMemory=memory&&(memory.base||memory.pending||memory.state.updatedAt>0);
   const saved=keepMemory?memory:readProfileCache(nextOwner.profileId,validateBackup)||legacyCache(nextOwner.profileId);
   let next=saved||blankCache();
   if(!saved)next={...next,state:{...next.state,profile:{...next.state.profile,name:nextOwner.username}}};
   let status="Synced with Supabase";
   let loadError="";
   if(cloud.status==="fulfilled"){
    try{
     next=reconcileCloudProgress(saved,parseCloudProgress(cloud.value),nextOwner.username);
     writable.current=true;
    }catch{loadError="The cloud backup could not be verified. Your existing progress has been kept.";}
   }else if(!saved){
    loadError="Your cloud progress could not be loaded. Reconnect before studying.";
   }
   if(!writable.current)status=saved?"Saved on this device · reconnect to sync":"Waiting to reconnect";
   setAccessError(loadError);
   setSync(status);
   // Keep an existing backup intact when verification or the first read fails.
   if(loadError){
    cache.current=next;
    setState(next.state);
   }else put(next);
   setReady(true);
  }

  const reload=()=>client.auth.getSession().then(({data})=>load(data.session));
  void reload().catch(()=>{setReady(true);setSync("Connection unavailable · try reconnecting");});
  const {data:{subscription}}=client.auth.onAuthStateChange((event,session)=>{
   if(!identityChanging()){
    rememberSession(session);
    if(event==="SIGNED_OUT"||(event==="SIGNED_IN"&&session?.user.id!==authIdentity.current)){
     setTimeout(()=>void load(session),0);
    }
   }
  });
  const change=()=>{
   if(profileLocked())void load(null);
   else void reload().catch(()=>load(null));
  };
  window.addEventListener("nle-profile-change",change);
  return()=>{
   active=false;
   contentRequest?.abort();
   pulling.current?.abort();
   subscription.unsubscribe();
   window.removeEventListener("nle-profile-change",change);
  };
 },[put]);

 useEffect(()=>{
  if(!ready||!user||accessError||!writable.current)return;
  const timer=setTimeout(()=>void flush(),900);
  return()=>clearTimeout(timer);
 },[state,ready,user,accessError,flush]);

 useEffect(()=>{
  const refresh=()=>{if(document.visibilityState==="visible")void pull();};
  window.addEventListener("focus",refresh);
  window.addEventListener("online",refresh);
  document.addEventListener("visibilitychange",refresh);
  const interval=setInterval(refresh,30000);
  return()=>{
   window.removeEventListener("focus",refresh);
   window.removeEventListener("online",refresh);
   document.removeEventListener("visibilitychange",refresh);
   clearInterval(interval);
  };
 },[pull]);

 useEffect(()=>{
  const media=matchMedia("(prefers-color-scheme: dark)");
  const apply=()=>{document.documentElement.dataset.theme=state.preferences.theme==="system"?(media.matches?"dark":"light"):state.preferences.theme;};
  apply();
  media.addEventListener("change",apply);
  return()=>media.removeEventListener("change",apply);
 },[state.preferences.theme]);

 const navigate=useCallback((next:string,options?:{replace?:boolean})=>{
  const url=studyLocation(next,location.origin);
  if(!url)return;
  const path=url.pathname+url.search;
  const destination=path+url.hash;
  if(destination!==currentPath()+location.hash){
   if(options?.replace)history.replaceState(null,"",destination);
   else history.pushState(null,"",destination);
   setPath(path);
  }
  window.scrollTo({top:0,behavior:"instant"});
 },[]);

 useEffect(()=>{
  if(!user)return;
  const warn=(event:BeforeUnloadEvent)=>{
   if(hasUnsavedMemory()){event.preventDefault();event.returnValue="";}
  };
  window.addEventListener("beforeunload",warn);
  return()=>window.removeEventListener("beforeunload",warn);
 },[user,hasUnsavedMemory]);

 const update=useCallback((fn:(value:State)=>State)=>{
  if(!user||accessError||profileLocked()||authIdentity.current!==user.id){
   setState(previous=>{
    const theme=fn(previous).preferences.theme;
    return theme===previous.preferences.theme?previous:{...previous,preferences:{...previous.preferences,theme}};
   });
   return false;
  }
  const previous=cache.current.state;
  const next=fn(previous);
  if(next!==previous)put({...cache.current,state:{...next,updatedAt:Date.now()}});
  return true;
 },[user,accessError,put]);

 const creditStudy=useCallback((target:string,credits:Record<string,number>)=>{
  if(identity.current?.profileId!==target||profileLocked())return;
  const previous=cache.current.state;
  const next=applyStudyCredits(previous,credits);
  if(next!==previous)put({...cache.current,state:{...next,updatedAt:Date.now()}});
 },[put]);

 async function switchProfile(){
  if(switching.current)return;
  switching.current=true;
  const credits:Record<string,number>={};
  const target=identity.current?.profileId;
  if(user&&target){
   window.dispatchEvent(new CustomEvent("nle-study-timer-pause",{detail:{userId:target,credits}}));
   if(Object.keys(credits).length)creditStudy(target,credits);
  }
  setReady(false);
  setSync("Saving your profile…");
  try{
   await flush();
   if(hasUnsavedMemory()){
    setReady(true);
    setSync("Changes only in this tab · export a backup");
    setMessage("Reconnect to save your changes or export a backup from Settings before switching profiles.");
    return;
   }
   if(!cache.current.base||hasPendingProgress(cache.current)){
    setMessage("Progress is kept on this device. Cloud sync will retry when you return.");
   }
   lockProfile();
   navigate("/login",{replace:true});
  }finally{switching.current=false;}
 }

 const retryContent=()=>window.dispatchEvent(new Event("nle-profile-change"));
 const published=useMemo(()=>{
  if(!user||accessError)return null;
  const map=new Map([...questionMap.values()].map(question=>[question.id,formatQuestionForDisplay(question)] as const));
  return {map,active:questions.map(question=>map.get(question.id)!)};
 },[bankVersion,user,accessError]);
 const imports=state.importedQuestions.length?state.importedQuestions:emptyQuestions;
 const {bank,bankMap}=useMemo(()=>{
  if(!published)return {bank:emptyQuestions,bankMap:emptyBankMap};
  if(!imports.length)return {bank:published.active,bankMap:published.map};
  const added=imports.filter(question=>!question.retired&&!published.map.has(question.id)).map(formatQuestionForDisplay);
  return {
   bank:[...published.active,...added],
   bankMap:new Map([...published.map,...added.map(question=>[question.id,question] as const)]),
  };
 },[published,imports]);

 return <AppContext.Provider value={{state,update,user,profileId,username,sharedProfile,creditStudy,switchProfile,ready,sync,accessError,retryContent,toast:setMessage,navigate,path,bank,bankMap}}>
  {children}{message&&<div role="status" className="toast">{message}</div>}
 </AppContext.Provider>;
}

export function download(name:string,text:string,type="application/json"){
 const url=URL.createObjectURL(new Blob([text],{type}));
 const link=document.createElement("a");
 link.href=url;
 link.download=name;
 document.body.append(link);
 link.click();
 link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
