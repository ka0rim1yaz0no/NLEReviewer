import type {State} from './engine.ts';
import {mergeLegacyState,mergeStudyStates,sameStudyState} from './sync-state.ts';
import type {CloudBase,PendingSave,ProfileCache} from './sync-state.ts';

export type SaveReceipt={saved:boolean;profileId:string;revision:number;data:State};
export type SaveRequest=(profileId:string,pending:PendingSave)=>Promise<SaveReceipt>;

export function hasPendingProgress(cache:ProfileCache){
 return !!cache.pending||(!!cache.base&&!sameStudyState(cache.state,cache.base.data));
}

/** Reconcile a fresh read without replacing an in-flight save or unsynced work. */
export function reconcileCloudProgress(local:ProfileCache|null,remote:CloudBase,username:string):ProfileCache{
 if(local?.base&&remote.revision<local.base.revision){
  throw new Error('The cloud backup could not be verified. Your existing progress has been kept.');
 }
 if(local?.pending||local?.base?.revision===remote.revision)return local;
 if(!local){
  const state=remote.revision===0?{...remote.data,profile:{...remote.data.profile,name:username}}:remote.data;
  return {state,base:remote,pending:null};
 }
 if(remote.revision===0&&!local.base)return {...local,base:remote};
 const state=local.base
  ?(sameStudyState(local.state,local.base.data)?remote.data:mergeStudyStates(local.base.data,local.state,remote.data))
  :mergeLegacyState(local.state,remote.data);
 return {state,base:remote,pending:null};
}

/** A pending operation keeps its original ID through retries and reloads. */
export async function synchronizeProgress(profileId:string,clientId:string,sequence:number,read:()=>ProfileCache,checkpoint:(cache:ProfileCache)=>void,request:SaveRequest,alive:()=>boolean=()=>true){
 let cache=read();
 if(!cache.base)throw new Error('Reconnect before syncing this profile.');
 if(!cache.pending&&sameStudyState(cache.state,cache.base.data))return;
 let pending=cache.pending||{clientId,sequence,snapshot:cache.state,base:cache.base,data:cache.state};
 checkpoint({...cache,pending});
 for(let retry=0;retry<5;retry++){
  if(!alive())throw new Error('Study profile changed before saving.');
  const receipt=await request(profileId,pending);
  if(!alive())return;
  if(receipt.profileId!==profileId||!Number.isSafeInteger(receipt.revision)||receipt.revision<1)throw new Error('The saved profile could not be verified.');
  const base:CloudBase={revision:receipt.revision,data:receipt.data};
  cache=read();
  if(receipt.saved){
   // Include edits made during the request, once, on top of the acknowledged save.
   const state=sameStudyState(cache.state,pending.snapshot)?receipt.data:mergeStudyStates(pending.snapshot,cache.state,receipt.data);
   checkpoint({state,base,pending:null});return;
  }
  pending={...pending,base,data:mergeStudyStates(pending.base.data,pending.data,receipt.data)};
  checkpoint({...cache,pending});
 }
 throw new Error('Another device is saving. Your changes are kept here; sync will retry.');
}
