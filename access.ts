export function needsUsername(path:string){return !["/login","/about","/help"].includes(path.split("?")[0]);}
