import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { initialState } from "./engine";
import type { State } from "./engine";
import { questions, validateQuestions } from "./bank";
const env = import.meta.env;
export const supabase = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY) : null;
export { validateBackup } from "./validation";
import { validateBackup } from "./validation";
const prefix = "nle-reviewer:v1:";
function readState(key: string): State { try { const value = localStorage.getItem(prefix + key); return value ? validateBackup(JSON.parse(value)) : initialState(); } catch { return initialState(); } }
type Context = { state: State; update: (fn: (state: State)=>State)=>void; user: User | null; ready: boolean; sync: string; toast: (message: string)=>void; navigate: (path: string)=>void; path: string; bank: typeof questions; bankMap: Map<string, typeof questions[number]> };
const AppContext = createContext<Context | null>(null);
export const useApp = () => { const context = useContext(AppContext); if (!context) throw new Error("App context is missing"); return context; };
export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(()=>readState("guest"));
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [sync, setSync] = useState(supabase ? "Connecting…" : "Saved on this device");
  const [path, setPath] = useState(location.pathname + location.search);
  const [message, setMessage] = useState("");
  const lastSaved = useRef(0), identity = useRef("guest"), generation = useRef(0);
  useEffect(()=>{ const handler = ()=>setPath(location.pathname+location.search); window.addEventListener("popstate",handler); return ()=>window.removeEventListener("popstate",handler); },[]);
  useEffect(()=>{ if (!message) return; const t=setTimeout(()=>setMessage(""),4500);return ()=>clearTimeout(t); },[message]);
  useEffect(()=>{
    if (!supabase) return;
    let active = true;
    async function load(nextUser: User | null) {
      const turn = ++generation.current;
      setReady(false); setUser(nextUser); identity.current = nextUser?.id || "guest";
      let next = readState(identity.current);
      let status = nextUser ? "Synced with Supabase" : "Saved on this device";
      if (nextUser) {
        const { data, error } = await supabase!.from("study_states").select("data").eq("user_id",nextUser.id).maybeSingle();
        if (error) status = "Saved on device · sync needs setup";
        else if (data?.data) { try { const remote = validateBackup(data.data); if (remote.updatedAt >= next.updatedAt) next=remote; } catch { status="Saved on device · invalid cloud backup"; } }
      }
      if (active && turn === generation.current) { lastSaved.current=next.updatedAt;setState(next);setSync(status);setReady(true); }
    }
    supabase.auth.getSession().then(({data})=>load(data.session?.user || null)).catch(()=>{setReady(true);setSync("Saved on device · connection unavailable");});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_IN" || event==="SIGNED_OUT") setTimeout(()=>void load(session?.user || null),0);});
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if (!ready) return;
    try { localStorage.setItem(prefix+identity.current, JSON.stringify(state)); } catch { setSync("Storage full · export a backup"); }
    if (!user || !supabase || state.updatedAt === lastSaved.current) return;
    setSync("Saving…");
    const task=setTimeout(async()=>{ const target=identity.current; const {error}=await supabase!.from("study_states").upsert({user_id:user.id,data:state,updated_at:new Date().toISOString()}); if(target!==identity.current)return; if(error)setSync("Saved on device · sync failed");else{lastSaved.current=state.updatedAt;setSync("Synced with Supabase");} },900);
    return ()=>clearTimeout(task);
  },[state,ready,user]);
  useEffect(()=>{ document.documentElement.dataset.theme = state.preferences.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : state.preferences.theme; },[state.preferences.theme]);
  function navigate(next: string) { if (!next.startsWith("/")) return; history.pushState({},"",next);setPath(next);window.scrollTo({top:0,behavior:"instant"}); }
  function update(fn: (value: State)=>State) { setState(previous=>({...fn(previous), updatedAt:Date.now()})); }
  const bank = [...questions, ...state.importedQuestions.filter(q=>!questions.some(base=>base.id===q.id))];
  return <AppContext.Provider value={{state,update,user,ready,sync,toast:setMessage,navigate,path,bank,bankMap:new Map(bank.map(q=>[q.id,q]))}}>{children}{message&&<div role="status" className="toast">{message}</div>}</AppContext.Provider>;
}
export function download(name: string, text: string, type="application/json") { const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }

