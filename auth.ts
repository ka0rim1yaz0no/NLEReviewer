import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
const env=import.meta.env;
const instanceKey=`nle-reviewer:auth:${crypto.randomUUID()}`;
const storageName=(key:string)=>key.replace(instanceKey,"nle-reviewer:active-auth:v2");
const tabStorage={getItem:(key:string)=>sessionStorage.getItem(storageName(key)),setItem:(key:string,value:string)=>sessionStorage.setItem(storageName(key),value),removeItem:(key:string)=>sessionStorage.removeItem(storageName(key))};
// The channel is unique even in duplicated tabs; session data survives a reload in this tab.
export const supabase=env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_PUBLISHABLE_KEY?createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{storage:tabStorage,storageKey:instanceKey,persistSession:true}}):null;
type RememberedProfile={id:string;username:string;access_token:string;refresh_token:string};
const cacheKey="nle-reviewer:remembered-profiles:v1",lockKey="nle-reviewer:profile-lock:v1";
let transitioning=false;
export const identityChanging=()=>transitioning;
export function profileLocked(){return sessionStorage.getItem(lockKey)!=="unlocked";}
function cachedProfiles():RememberedProfile[]{try{const value=JSON.parse(localStorage.getItem(cacheKey)||"[]");return Array.isArray(value)?value.filter(p=>p&&typeof p.id==="string"&&typeof p.username==="string"&&typeof p.access_token==="string"&&typeof p.refresh_token==="string"):[];}catch{return[];}}
export function rememberedProfiles(){return cachedProfiles().map(({id,username})=>({id,username}));}
export function rememberSession(session:Session|null,username?:string){if(!session)return;const entries=cachedProfiles(),previous=entries.find(p=>p.id===session.user.id);if(!previous&&!username)return;const record={id:session.user.id,username:username||previous!.username,access_token:session.access_token,refresh_token:session.refresh_token};localStorage.setItem(cacheKey,JSON.stringify([...entries.filter(p=>p.id!==record.id),record]));}
export async function readUsername(user:User):Promise<string|null>{if(!supabase)return null;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const {data,error}=await supabase.from("study_profiles").select("username").eq("user_id",user.id).abortSignal(controller.signal).maybeSingle();if(error)throw new Error("Username profiles are unavailable. Check the Supabase profile table and connection.");return typeof data?.username==="string"?data.username:null;}finally{clearTimeout(timer);}}
export function lockProfile(){sessionStorage.setItem(lockKey,"locked");window.dispatchEvent(new Event("nle-profile-change"));}
export async function openUsernameProfile(raw:string):Promise<void>{
  if(!supabase)throw new Error("The study database has not been configured.");
  const username=raw.normalize("NFKC").trim();if(!username||username.length>40)throw new Error("Enter a username up to 40 characters.");
  transitioning=true;sessionStorage.setItem(lockKey,"locked");
  let success=false;
  try{
    const remembered=cachedProfiles().find(p=>p.username.toLowerCase()===username.toLowerCase());
    if(remembered){const {data,error}=await supabase.auth.setSession({access_token:remembered.access_token,refresh_token:remembered.refresh_token});if(error||!data.session)throw new Error("This browser’s saved profile session has expired. Use a backup to move your progress into a new profile.");const canonical=await readUsername(data.session.user);if(!canonical)throw new Error("The saved username profile is unavailable.");rememberSession(data.session,canonical);}
    else{
      let {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
      const existing=session?await readUsername(session.user):null;
      if(session&&existing&&existing.toLowerCase()===username.toLowerCase())rememberSession(session,existing);
      else{
        if(session&&existing)rememberSession(session,existing);
        if(!session||existing){const result=await supabase.auth.signInAnonymously({options:{data:{study_username:username}}});if(result.error)throw new Error(/anonymous/i.test(result.error.message)?"Username sign-in needs Anonymous Sign-Ins enabled in Supabase.":result.error.message);session=result.data.session;}
        if(!session)throw new Error("Could not create a study profile. Try again.");
        const {error:claimError}=await supabase.from("study_profiles").insert({user_id:session.user.id,username});
        if(claimError){if(claimError.code==="23505")throw new Error("That username is already in use on another browser. Choose a different username, or return using its original browser.");throw new Error("Could not save the username profile. Check the database connection and profile-table permissions.");}
        const refreshed=await supabase.auth.getSession();rememberSession(refreshed.data.session||session,username);
      }
    }
    sessionStorage.setItem(lockKey,"unlocked");success=true;
  }finally{transitioning=false;if(success)window.dispatchEvent(new Event("nle-profile-change"));}
}
