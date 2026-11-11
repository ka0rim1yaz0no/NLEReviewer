export function needsUsername(path:string){return !["/login","/about","/help"].includes(path.split("?")[0]);}

export const priorityUsername="isabel";
export function isPriorityUsername(username:string){return username.trim().toLowerCase()===priorityUsername;}

// Use the canonical claimed username, never the editable profile display name.
export function canAccessPDFs(username:string,signedIn:boolean,shared:boolean){
  return signedIn&&shared&&isPriorityUsername(username);
}
