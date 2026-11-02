import {decodeContentRelease} from "./content-release.ts";
import type {ReleaseManifest} from "./content-release";
import type {ContentRow} from "./content-integrity";
type VerifiedContent=Awaited<ReturnType<typeof decodeContentRelease>>;
export function processContentRelease(manifest:ReleaseManifest,pages:ContentRow[]):Promise<VerifiedContent>{
 if(typeof Worker==="undefined")return decodeContentRelease(manifest,pages);
 let worker:Worker;
 try{worker=new Worker(new URL("./content-worker.ts",import.meta.url),{type:"module"});}
 catch{return decodeContentRelease(manifest,pages);}
 return new Promise((resolve,reject)=>{
  const finish=()=>{clearTimeout(timer);worker.terminate();};
  const timer=setTimeout(()=>{finish();reject(new Error("Study content verification timed out. Your progress has been kept; please try again."));},45000);
  worker.onmessage=(event:MessageEvent<{content?:VerifiedContent;error?:string}>)=>{
   finish();if(event.data.error)reject(new Error(event.data.error));else if(event.data.content)resolve(event.data.content);else reject(new Error("The study verification response was incomplete."));
  };
  // Older browsers or a blocked worker can use the same integrity checks locally.
  worker.onerror=()=>{finish();decodeContentRelease(manifest,pages).then(resolve,reject);};
  worker.postMessage({manifest,pages});
 });
}
