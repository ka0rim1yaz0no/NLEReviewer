import {gzipSync,gunzipSync,strToU8,strFromU8} from 'fflate';
import type {State,Session} from './engine.ts';
import {updateVaultReviews} from './vault-schedule.ts';
import {initialState} from './engine.ts';

const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function sameStudyState(a:State,b:State){return equal({...a,updatedAt:0},{...b,updatedAt:0});}
function dictionary<T>(base:Record<string,T>={},local:Record<string,T>={},remote:Record<string,T>={}):Record<string,T>{
 const result=new Map(Object.entries(remote));
 for(const key of new Set([...Object.keys(base),...Object.keys(local)])){
  if(equal(base[key],local[key]))continue;
  if(Object.hasOwn(local,key))result.set(key,local[key]);else result.delete(key);
 }
 return Object.fromEntries(result);
}
function setChanges<T>(base:readonly T[]=[],local:readonly T[]=[],remote:readonly T[]=[]):T[]{
 const result=new Set(remote),prior=new Set(base),current=new Set(local);
 for(const item of local)if(!prior.has(item))result.add(item);
 for(const item of base)if(!current.has(item))result.delete(item);
 return [...result];
}
function records<T extends {id:string}>(base:readonly T[],local:readonly T[],remote:readonly T[],conflict?:(base:T|undefined,local:T,remote:T)=>T):T[]{
 const initial=new Map(base.map(t=>[t.id,t])),current=new Map(local.map(t=>[t.id,t])),result=new Map(remote.map(t=>[t.id,t]));
 for(const [id,previous] of initial)if(!current.has(id))result.delete(id);
 for(const item of local){const old=initial.get(item.id),other=result.get(item.id);if(equal(old,item))continue;result.set(item.id,other&&conflict?conflict(old,item,other):item);}
 return [...result.values()];
}
function arrayDictionary<T>(base:Record<string,T[]>,local:Record<string,T[]>,remote:Record<string,T[]>){
 return Object.fromEntries([...new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])].map(key=>[key,setChanges(base[key],local[key],remote[key])]));
}
function sessionChanges(base:Session|undefined,local:Session,remote:Session):Session{
 const previous=base||{...remote,answers:{},flagged:[],eliminated:{},highlights:{},strokes:{},scratch:''};
 const next=dictionary(previous as unknown as Record<string,unknown>,local as unknown as Record<string,unknown>,remote as unknown as Record<string,unknown>) as unknown as Session;
 const finished=[local.finishedAt,remote.finishedAt].filter((at):at is number=>!!at);
 const questionIds=new Set(remote.questionIds);
 return {...next,questionIds:remote.questionIds,startedAt:Math.min(local.startedAt,remote.startedAt),finishedAt:finished.length?Math.min(...finished):undefined,
  answers:Object.fromEntries(Object.entries(dictionary(previous.answers,local.answers,remote.answers)).filter(([id])=>questionIds.has(id))),
  flagged:setChanges(previous.flagged,local.flagged,remote.flagged),
  eliminated:arrayDictionary(previous.eliminated,local.eliminated,remote.eliminated),
  highlights:arrayDictionary(previous.highlights,local.highlights,remote.highlights),
  strokes:arrayDictionary(previous.strokes,local.strokes,remote.strokes),
  cursor:Math.max(0,Math.min(remote.questionIds.length-1,next.cursor))};
}
/** Apply only local changes since base to the current remote state. */
export function mergeStudyStates(base:State,local:State,remote:State,now=Date.now()):State{
 const attempts=records(base.attempts,local.attempts,remote.attempts,(_b,a,b)=>a.at<b.at?a:b).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
 // A submitted response is immutable. Two devices submitting the same saved
 // session retain the earliest recorded response in both history and scoring.
 const recorded=new Map(attempts.map(a=>[a.sessionId+':'+a.questionId,a]));
 const sessions=records(base.sessions,local.sessions,remote.sessions,sessionChanges).map(session=>{
  const updates=session.questionIds.flatMap(id=>{
   const attempt=recorded.get(`${session.id}:${id}`);
   return attempt?[[id,{selected:attempt.selected,confidence:attempt.confidence,submitted:true}] as const]:[];
  });
  return updates.length?{...session,answers:{...session.answers,...Object.fromEntries(updates)}}:session;
 });
 const studyLog:Record<string,number>={...remote.studyLog};
 for(const day of new Set([...Object.keys(base.studyLog||{}),...Object.keys(local.studyLog||{})])){
  const delta=(local.studyLog?.[day]||0)-(base.studyLog?.[day]||0);if(delta)studyLog[day]=Math.max(0,(remote.studyLog?.[day]||0)+delta);
 }
 const cards={...remote.cards};
 for(const [id,card] of Object.entries(local.cards)){
  const previous=base.cards[id],other=remote.cards[id];if(equal(previous,card))continue;
  if(!other||equal(other,previous)||equal(other,card))cards[id]=card;
  else cards[id]={...(card.lastAt>=other.lastAt?card:other),reviews:(previous?.reviews||0)+Math.max(0,card.reviews-(previous?.reviews||0))+Math.max(0,other.reviews-(previous?.reviews||0))};
 }
 for(const id of Object.keys(base.cards))if(!local.cards[id])delete cards[id];
 let merged:State={...remote,
  profile:dictionary<unknown>(base.profile,local.profile,remote.profile) as State['profile'],
  preferences:dictionary<unknown>(base.preferences,local.preferences,remote.preferences) as State['preferences'],
  plan:equal(base.plan,local.plan)?remote.plan:local.plan,
  focusSettings:equal(base.focusSettings,local.focusSettings)?remote.focusSettings:local.focusSettings,
  attempts,sessions,vault:setChanges(base.vault,local.vault,remote.vault),
  vaultReviews:dictionary(base.vaultReviews,local.vaultReviews,remote.vaultReviews),
  bookmarks:setChanges(base.bookmarks,local.bookmarks,remote.bookmarks),read:setChanges(base.read,local.read,remote.read),
  notes:dictionary(base.notes,local.notes,remote.notes),cards,
  tasks:records(base.tasks,local.tasks,remote.tasks),customCards:records(base.customCards,local.customCards,remote.customCards),
  gameRuns:records(base.gameRuns||[],local.gameRuns||[],remote.gameRuns||[]),
  importedQuestions:records(base.importedQuestions,local.importedQuestions,remote.importedQuestions),
  studySeconds:Math.max(0,remote.studySeconds+local.studySeconds-base.studySeconds),studyLog,updatedAt:now};
 const baselineIds=new Set(base.attempts.map(a=>a.id)),newAttempts=attempts.filter(a=>!baselineIds.has(a.id));
 const replay=updateVaultReviews({...merged,vault:base.vault,vaultReviews:base.vaultReviews},newAttempts);
 const replayedVault=new Set(replay.vault);
 const pile=new Set(merged.vault),reviews={...merged.vaultReviews};
 for(const id of new Set(newAttempts.map(a=>a.questionId))){if(replayedVault.has(id))pile.add(id);else pile.delete(id);if(replay.vaultReviews?.[id])reviews[id]=replay.vaultReviews[id];else delete reviews[id];}
 merged={...merged,vault:[...pile],vaultReviews:reviews};
 return merged;
}

/** Upgrade caches that predate revision tracking without summing historical time twice. */
export function mergeLegacyState(local:State,remote:State):State{
 if(sameStudyState(local,remote))return remote;
 const primary=local.updatedAt>remote.updatedAt?local:remote;
 const merged=mergeStudyStates(initialState(),local,remote,Math.max(local.updatedAt,remote.updatedAt));
 const cards={...merged.cards};
 for(const [id,card] of Object.entries(cards)){const a=local.cards[id],b=remote.cards[id];if(a&&b)cards[id]={...(a.lastAt>b.lastAt?a:b),reviews:Math.max(a.reviews,b.reviews)};}
 return {...merged,profile:primary.profile,preferences:primary.preferences,plan:primary.plan,focusSettings:primary.focusSettings,cards,
 studySeconds:Math.max(local.studySeconds,remote.studySeconds),studyLog:Object.fromEntries([...new Set([...Object.keys(local.studyLog||{}),...Object.keys(remote.studyLog||{})])].map(d=>[d,Math.max(local.studyLog?.[d]||0,remote.studyLog?.[d]||0)]))};
}

export type CloudBase={revision:number;data:State};
export type PendingSave={clientId:string;sequence:number;snapshot:State;base:CloudBase;data:State};
export type ProfileCache={state:State;base:CloudBase|null;pending:PendingSave|null};
const prefix='nle-reviewer:profile-cache:v2:';
export function writeProfileCache(profileId:string,value:ProfileCache){
 const packed=gzipSync(strToU8(JSON.stringify(value)),{level:3});let binary='';for(const byte of packed)binary+=String.fromCharCode(byte);
 // State, baseline and pending receipt are one atomic local-storage record.
 localStorage.setItem(prefix+profileId,btoa(binary));
}
export function readProfileCache(profileId:string,validate:(raw:unknown)=>State):ProfileCache|null{
 try{
  const packed=localStorage.getItem(prefix+profileId);if(!packed)return null;
  const value=JSON.parse(strFromU8(gunzipSync(Uint8Array.from(atob(packed),c=>c.charCodeAt(0)))));
  const base=(raw:CloudBase)=>{if(!raw||!Number.isSafeInteger(raw.revision)||raw.revision<0)throw new Error('Invalid sync revision');return {revision:raw.revision,data:validate(raw.data)};};
  const pending=value.pending;
  if(pending&&(!/^[a-f0-9-]{36}$/i.test(pending.clientId)||!Number.isSafeInteger(pending.sequence)||pending.sequence<1))return null;
  return {state:validate(value.state),base:value.base?base(value.base):null,pending:pending?{clientId:pending.clientId,sequence:pending.sequence,snapshot:validate(pending.snapshot),base:base(pending.base),data:validate(pending.data)}:null};
 }catch{return null;}
}
