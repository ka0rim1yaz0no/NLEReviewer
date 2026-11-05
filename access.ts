export function needsUsername(path:string){return !["/login","/about","/help"].includes(path.split("?")[0]);}

// Use the canonical claimed username, never the editable profile display name.
export function canAccessPDFs(username:string,signedIn:boolean){
  return signedIn&&username.trim().toLowerCase()==="elaine";
}
