import type {State} from './engine.ts';
export type VaultReview={due:number;successes:number;lastCorrect?:number};
export const vaultInterval=7*86400000;
export function updateVaultReview(state:State,id:string,correct:boolean,at:number):State{
 const schedule={...state.vaultReviews},remove=()=>{delete schedule[id];return {...state,vault:state.vault.filter(q=>q!==id),vaultReviews:schedule};};
 if(!state.preferences.spacedVault){if(correct)return remove();delete schedule[id];return {...state,vault:[...new Set([...state.vault,id])],vaultReviews:schedule};}
 if(!correct){schedule[id]={due:at+vaultInterval,successes:0};return {...state,vault:[...new Set([...state.vault,id])],vaultReviews:schedule};}
 if(!state.vault.includes(id))return state;
 const previous=schedule[id]||{due:at,successes:0};
 if(at<previous.due)return state;
 if(previous.successes>=1&&previous.lastCorrect!==undefined&&at-previous.lastCorrect>=vaultInterval)return remove();
 schedule[id]={due:at+vaultInterval,successes:1,lastCorrect:at};return {...state,vaultReviews:schedule};
}
export function vaultIsDue(state:State,id:string,now=Date.now()){return !state.preferences.spacedVault||!state.vaultReviews?.[id]||state.vaultReviews[id].due<=now;}
