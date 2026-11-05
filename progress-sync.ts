import type {State} from './engine.ts';
import {mergeStudyStates,sameStudyState} from './sync-state.ts';
import type {CloudBase,PendingSave,ProfileCache} from './sync-state.ts';

export type SaveReceipt={saved:boolean;profileId:string;revision:number;data:State};
export type SaveRequest=(profileId:string,pending:PendingSave)=>Promise<SaveReceipt>;
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
