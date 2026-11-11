export function needsUsername(path:string){return !["/login","/about","/help"].includes(path.split("?")[0]);}

export function studyLocation(path:string,origin:string){
  if(!path.startsWith("/")||path.startsWith("//"))return null;
  try{
    const destination=new URL(path,origin);
    return destination.origin===origin?destination:null;
  }catch{return null;}
}

export const priorityUsername="isabel";
export function isPriorityUsername(username:string){return username.trim().toLowerCase()===priorityUsername;}

// Use the canonical claimed username, never the editable profile display name.
export function canAccessPDFs(username:string,signedIn:boolean,shared:boolean){
  return signedIn&&shared&&isPriorityUsername(username);
}

export function profilePickerEntries<T extends {profileId:string;username:string;shared:boolean}>(profiles:T[]){
  const byOwner=new Map<string,T&{label:string}>();
  for(const profile of profiles){
    // A device can still remember either name from before the database rename.
    const label=profile.shared&&profile.username.trim().toLowerCase()==="elaine"?"Isabel"
      :!profile.shared&&isPriorityUsername(profile.username)?"Isabel (previous)":profile.username;
    byOwner.set(profile.profileId,{...profile,label});
  }
  return [...byOwner.values()];
}
