import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import {isPriorityUsername,priorityUsername} from "./access";
const env=import.meta.env;
const instanceKey=`nle-reviewer:auth:${crypto.randomUUID()}`;
const storageName=(key:string)=>key.replace(instanceKey,"nle-reviewer:active-auth:v2");
const tabStorage={getItem:(key:string)=>sessionStorage.getItem(storageName(key)),setItem:(key:string,value:string)=>sessionStorage.setItem(storageName(key),value),removeItem:(key:string)=>sessionStorage.removeItem(storageName(key))};
// The channel is unique even in duplicated tabs; session data survives a reload in this tab.
export const supabase=env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_PUBLISHABLE_KEY?createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{storage:tabStorage,storageKey:instanceKey,persistSession:true}}):null;
export type StudyIdentity={profileId:string;username:string;shared:boolean};
type RememberedProfile={id:string;username:string;profileId?:string;shared?:boolean;access_token:string;refresh_token:string};
const cacheKey="nle-reviewer:remembered-profiles:v1",lockKey="nle-reviewer:profile-lock:v1";
let transitioning=false;
export const identityChanging=()=>transitioning;
export function profileLocked(){return sessionStorage.getItem(lockKey)!=="unlocked";}
const normalize=(value:string)=>value.normalize("NFKC").trim();
function cachedProfiles():RememberedProfile[]{try{const value=JSON.parse(localStorage.getItem(cacheKey)||"[]");return Array.isArray(value)?value.filter(p=>p&&typeof p.id==="string"&&typeof p.username==="string"&&typeof p.access_token==="string"&&typeof p.refresh_token==="string"):[];}catch{return[];}}
export function rememberedProfiles(){return cachedProfiles().map(({id,username,profileId,shared})=>({id,username,profileId:profileId||id,shared:shared===true}));}
export function rememberSession(session:Session|null,username?:string,identity?:StudyIdentity){
 if(!session)return;const entries=cachedProfiles(),previous=entries.find(p=>p.id===session.user.id);if(!previous&&!username)return;
 const record={id:session.user.id,username:identity?.username||username||previous!.username,profileId:identity?.profileId||previous?.profileId||session.user.id,shared:identity?.shared??previous?.shared??false,access_token:session.access_token,refresh_token:session.refresh_token};
 // Save by device identity; a renamed profile may briefly share another cached display name.
 try{localStorage.setItem(cacheKey,JSON.stringify([...entries.filter(p=>p.id!==record.id),record]));}catch{/* The signed-in tab can still use its session. */}
}
function parseIdentity(row:unknown):StudyIdentity|null{
 const r=row as {profile_id?:unknown;username?:unknown;shared?:unknown}|undefined;
 return r&&typeof r.profile_id==="string"&&typeof r.username==="string"?{profileId:r.profile_id,username:r.username,shared:r.shared===true}:null;
}
export async function readStudyIdentity(user:User):Promise<StudyIdentity|null>{
 if(!supabase)return null;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await supabase.rpc("read_study_identity").abortSignal(controller.signal);
  if(!response.error)return parseIdentity(response.data?.[0]);
  // Rollout compatibility for private profiles before the migration is applied.
  if(!["PGRST202","42883"].includes(response.error.code))throw new Error("The study profile could not be checked. Try reconnecting.");
  const {data,error}=await supabase.from("study_profiles").select("username").eq("user_id",user.id).abortSignal(controller.signal).maybeSingle();
  if(error)throw new Error("Username profiles are unavailable. Check the database connection.");
  return typeof data?.username==="string"?{profileId:user.id,username:data.username,shared:false}:null;
 }finally{clearTimeout(timer);}
}
export async function readUsername(user:User){return (await readStudyIdentity(user))?.username||null;}
export function lockProfile(){sessionStorage.setItem(lockKey,"locked");window.dispatchEvent(new Event("nle-profile-change"));}
export async function openUsernameProfile(raw:string,rememberedId?:string):Promise<void>{
 if(!supabase)throw new Error("The study database has not been configured.");
 const username=normalize(raw);if(!username||username.length>40)throw new Error("Enter a username up to 40 characters.");
 transitioning=true;sessionStorage.setItem(lockKey,"locked");let success=false;
 try{
  const remembered=cachedProfiles().find(p=>rememberedId?p.id===rememberedId:p.username.toLowerCase()===username.toLowerCase());
  let opened=false;
  if(remembered){
   const result=await supabase.auth.setSession({access_token:remembered.access_token,refresh_token:remembered.refresh_token});
   if(!result.error&&result.data.session){
    const identity=await readStudyIdentity(result.data.session.user);
    if(identity){
     rememberSession(result.data.session,identity.username,identity);
     opened=!!rememberedId||identity.username.toLowerCase()===username.toLowerCase();
     if(!opened&&!isPriorityUsername(username))throw new Error(`This saved profile is now named ${identity.username}. Enter that username to open it.`);
    }
   }
   if(!opened&&!isPriorityUsername(username)&&(!remembered.shared||rememberedId))throw new Error("This browser’s saved profile session has expired. Use a backup to move your progress into a new profile.");
  }
  if(rememberedId&&!remembered)throw new Error("This profile is no longer saved on this browser. Enter its current username to try again.");
  if(!opened){
   let {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
   const existing=session?await readStudyIdentity(session.user):null;
   if(session&&existing&&existing.username.toLowerCase()===username.toLowerCase()){rememberSession(session,existing.username,existing);opened=true;}
   else{
    if(session&&existing)rememberSession(session,existing.username,existing);
    if(!session||existing){const result=await supabase.auth.signInAnonymously({options:{data:{study_username:username}}});if(result.error)throw new Error(/anonymous/i.test(result.error.message)?"Username sign-in needs Anonymous Sign-Ins enabled in Supabase.":result.error.message);session=result.data.session;}
    if(!session)throw new Error("Could not open a study profile. Try again.");
    const shared=await supabase.rpc("open_shared_study_profile",{p_username:username});
    if(shared.error&&!["PGRST202","42883"].includes(shared.error.code))throw new Error("The shared profile could not be opened. Check your connection and try again.");
    const identity=parseIdentity(shared.data?.[0]);
    if(identity){rememberSession(session,identity.username,identity);opened=true;}
    else{
     if(isPriorityUsername(username))throw new Error(`The shared ${priorityUsername} profile is temporarily unavailable. Try reconnecting.`);
     const {error:claimError}=await supabase.from("study_profiles").insert({user_id:session.user.id,username});
     if(claimError){if(claimError.code==="23505")throw new Error("That username belongs to a browser-saved profile. Open it on its original browser, or choose another username.");throw new Error("Could not save the username profile. Check the database connection.");}
     rememberSession(session,username,{profileId:session.user.id,username,shared:false});opened=true;
    }
   }
  }
  if(opened){sessionStorage.setItem(lockKey,"unlocked");success=true;}
 }finally{transitioning=false;if(success)window.dispatchEvent(new Event("nle-profile-change"));}
}
