import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { initialState } from "./engine";
import type { State } from "./engine";
import { questions, installQuestionBank } from "./bank";
import { loadProtectedContent } from "./content-access";
import { supabase, profileLocked, identityChanging, readUsername, rememberSession, rememberedProfiles, lockProfile } from "./auth";
export { supabase } from "./auth";
export { validateBackup } from "./validation";
import { validateBackup } from "./validation";
const prefix = "nle-reviewer:v1:";
async function saveCloud(userId:string,data:State){if(!supabase)return null;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const result=await supabase.from("study_states").upsert({user_id:userId,data,updated_at:new Date().toISOString()}).abortSignal(controller.signal);return result.error;}catch{return new Error("Cloud connection unavailable");}finally{clearTimeout(timer);}}
function readState(key: string): State { try { const value = localStorage.getItem(prefix + key); return value ? validateBackup(JSON.parse(value)) : initialState(); } catch { return initialState(); } }
type Context = { state: State; update: (fn: (state: State)=>State)=>void; user: User | null; username: string; switchProfile:()=>Promise<void>; ready: boolean; sync: string; accessError:string; retryContent:()=>void; toast: (message: string)=>void; navigate: (path: string)=>void; path: string; bank: typeof questions; bankMap: Map<string, typeof questions[number]> };
const AppContext = createContext<Context | null>(null);
export const useApp = () => { const context = useContext(AppContext); if (!context) throw new Error("App context is missing"); return context; };
export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [username,setUsername]=useState("");
  const [accessError,setAccessError]=useState("");
  const [bankVersion,setBankVersion]=useState(0);
  const [cloudWritable,setCloudWritable]=useState(false);
  const [ready, setReady] = useState(!supabase);
  const [sync, setSync] = useState(supabase ? "Connecting…" : "Saved on this device");
  const [path, setPath] = useState(location.pathname + location.search);
  const [message, setMessage] = useState("");
  const lastSaved = useRef(0), identity = useRef("guest"), generation = useRef(0);
  const switching=useRef(false);
  useEffect(()=>{ const handler = ()=>setPath(location.pathname+location.search); window.addEventListener("popstate",handler); return ()=>window.removeEventListener("popstate",handler); },[]);
  useEffect(()=>{ if (!message) return; const t=setTimeout(()=>setMessage(""),4500);return ()=>clearTimeout(t); },[message]);
  useEffect(()=>{
    if (!supabase) return;
    let active = true;
    async function load(nextUser: User | null) {
      const turn = ++generation.current;
      setReady(false);setUser(null);setAccessError("");setCloudWritable(false);
      if(!nextUser||profileLocked()){if(active&&turn===generation.current){installQuestionBank([],[]);setBankVersion(v=>v+1);identity.current="guest";setUsername("");setState(initialState());setSync("Choose your study profile");setReady(true);}return;}
      let canonical:string|null=null,offline=false;
      try{canonical=await readUsername(nextUser);}catch{canonical=rememberedProfiles().find(p=>p.id===nextUser.id)?.username||null;offline=true;}
      if(!canonical){if(active&&turn===generation.current){installQuestionBank([],[]);setBankVersion(v=>v+1);identity.current="guest";setUsername("");setState(initialState());setSync("Choose a username to continue");setReady(true);}return;}
      try{const content=await loadProtectedContent();if(!active||turn!==generation.current)return;installQuestionBank(content.questions,content.cases);setBankVersion(v=>v+1);}
      catch(error){if(active&&turn===generation.current){installQuestionBank([],[]);setBankVersion(v=>v+1);setUsername(canonical);setUser(nextUser);setAccessError((error as Error).message);setSync("Study content unavailable · progress kept");setReady(true);}return;}
      let next = readState(nextUser.id), savedAt = 0;
      if(next.profile.name==="Future RN")next={...next,profile:{...next.profile,name:canonical}};
      let status = offline?"Saved on this device · connection unavailable":"Synced with Supabase";
      let writable=false,loadError="";
      {
        const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),8000);
        const { data, error } = await supabase!.from("study_states").select("data").eq("user_id",nextUser.id).abortSignal(controller.signal).maybeSingle();
        clearTimeout(timeout);
        if (error) status = "Saved on device · sync needs setup";
        else {writable=true;status="Synced with Supabase";if(data?.data){try { const remote = validateBackup(data.data); savedAt=remote.updatedAt; if (remote.updatedAt >= next.updatedAt) next=remote; } catch { writable=false;loadError="The cloud backup could not be verified. Your existing progress has been kept; try reconnecting or use a saved backup in a new profile.";status="Cloud backup needs attention"; }}}
      }
      if (active && turn === generation.current) {identity.current=nextUser.id;lastSaved.current=savedAt;setUsername(canonical);setUser(nextUser);setState(next);setCloudWritable(writable);setAccessError(loadError);setSync(status);setReady(true); }
    }
    supabase.auth.getSession().then(({data})=>load(data.session?.user || null)).catch(()=>{setReady(true);setSync("Saved on device · connection unavailable");});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{rememberSession(session);if(!identityChanging()&&(event==="SIGNED_IN"||event==="SIGNED_OUT"))setTimeout(()=>void load(session?.user||null),0);});
    const change=()=>{if(profileLocked()){void load(null);return;}void supabase!.auth.getSession().then(({data})=>load(data.session?.user||null)).catch(()=>load(null));};window.addEventListener("nle-profile-change",change);
    return ()=>{active=false;subscription.unsubscribe();window.removeEventListener("nle-profile-change",change);};
  },[]);
  useEffect(()=>{
    if (!ready) return;
    if(!user||accessError)return;
    try { localStorage.setItem(prefix+identity.current, JSON.stringify(state)); } catch { setSync("Storage full · export a backup"); }
    if (!user || !supabase || !cloudWritable || state.updatedAt === lastSaved.current) return;
    setSync("Saving…");
    const task=setTimeout(async()=>{ const target=identity.current; const error=await saveCloud(user.id,state); if(target!==identity.current)return; if(error)setSync("Saved on device · sync failed");else{lastSaved.current=state.updatedAt;setSync("Synced with Supabase");} },900);
    return ()=>clearTimeout(task);
  },[state,ready,user,accessError,cloudWritable]);
  useEffect(()=>{const media=matchMedia("(prefers-color-scheme: dark)");const apply=()=>{document.documentElement.dataset.theme=state.preferences.theme==="system"?(media.matches?"dark":"light"):state.preferences.theme;};apply();media.addEventListener("change",apply);return ()=>media.removeEventListener("change",apply);},[state.preferences.theme]);
  const navigate=useCallback((next: string)=>{if(!next.startsWith("/")||next.startsWith("//"))return;history.pushState({},"",next);setPath(next);window.scrollTo({top:0,behavior:"instant"});},[]);
  const update=useCallback((fn:(value:State)=>State)=>{setState(previous=>{const next=fn(previous);if(!user||accessError)return {...previous,preferences:{...previous.preferences,theme:next.preferences.theme}};return {...next,updatedAt:Date.now()};});},[user,accessError]);
  async function switchProfile(){if(switching.current)return;switching.current=true;setReady(false);setUser(null);setSync("Saving your profile…");try{if(user&&supabase&&!accessError){try{localStorage.setItem(prefix+user.id,JSON.stringify(state));}catch{/* The on-screen storage status remains available. */}if(cloudWritable&&state.updatedAt!==lastSaved.current){const error=await saveCloud(user.id,state);if(error)setMessage("Progress is saved on this device; cloud sync will retry when you return.");}}}finally{lockProfile();navigate("/login");switching.current=false;}}
  const retryContent=()=>{if(user&&!accessError){try{localStorage.setItem(prefix+user.id,JSON.stringify(state));}catch{setMessage("Storage is full. Export a backup before reconnecting.");return;}}window.dispatchEvent(new Event("nle-profile-change"));};
  const bank=useMemo(()=>{if(!user||accessError)return [];const ids=new Set(questions.map(q=>q.id));return [...questions,...state.importedQuestions.filter(q=>!ids.has(q.id))];},[state.importedQuestions,bankVersion,user,accessError]);
  const bankMap=useMemo(()=>new Map(bank.map(q=>[q.id,q])),[bank]);
  return <AppContext.Provider value={{state,update,user,username,switchProfile,ready,sync,accessError,retryContent,toast:setMessage,navigate,path,bank,bankMap}}>{children}{message&&<div role="status" className="toast">{message}</div>}</AppContext.Provider>;
}
export function download(name: string, text: string, type="application/json") { const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
