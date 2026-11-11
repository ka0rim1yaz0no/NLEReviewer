import type {Attempt,State} from './engine.ts';
export type VaultReview={due:number;successes:number;lastCorrect?:number};
export const vaultInterval=7*86400000;
export function updateVaultReview(state:State,id:string,correct:boolean,at:number):State{
 return updateVaultReviews(state,[{questionId:id,correct,at}]);
}
export function updateVaultReviews(state:State,attempts:readonly Pick<Attempt,"questionId"|"correct"|"at">[]):State{
 if(!attempts.length)return state;
 const vault=new Set(state.vault);
 const schedule=new Map(Object.entries(state.vaultReviews||{}));
 let changed=false;
 for(const {questionId:id,correct,at} of attempts){
  if(!state.preferences.spacedVault){
   if(correct)vault.delete(id);else vault.add(id);
   schedule.delete(id);
  }else if(!correct){
   vault.add(id);
   schedule.set(id,{due:at+vaultInterval,successes:0});
  }else{
   const previous=schedule.get(id);
   if(!vault.has(id)||previous&&at<previous.due)continue;
   if(previous?.successes&&previous.lastCorrect!==undefined&&at-previous.lastCorrect>=vaultInterval){
    vault.delete(id);
    schedule.delete(id);
   }else schedule.set(id,{due:at+vaultInterval,successes:1,lastCorrect:at});
  }
  changed=true;
 }
 return changed?{...state,vault:[...vault],vaultReviews:Object.fromEntries(schedule)}:state;
}
export function vaultIsDue(state:State,id:string,now=Date.now()){return !state.preferences.spacedVault||!state.vaultReviews?.[id]||state.vaultReviews[id].due<=now;}
