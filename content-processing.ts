import {decodeContentRelease} from "./content-release.ts";
import type {ReleaseManifest} from "./content-release";
import type {ContentRow} from "./content-integrity";
import {throwIfAborted} from './abort-utils.ts';
type VerifiedContent=Awaited<ReturnType<typeof decodeContentRelease>>;
export function processContentRelease(manifest:ReleaseManifest,pages:ContentRow[],signal?:AbortSignal,questionIds?:readonly string[]):Promise<VerifiedContent>{
 const locally=async()=>{throwIfAborted(signal);const content=await decodeContentRelease(manifest,pages,questionIds);throwIfAborted(signal);return content;};
 if(signal?.aborted)return Promise.reject(new DOMException('Study content loading was cancelled.','AbortError'));
 if(typeof Worker==="undefined")return locally();
 let worker:Worker;
 try{worker=new Worker(new URL("./content-worker.ts",import.meta.url),{type:"module"});}
 catch{return locally();}
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finish=()=>{if(settled)return false;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);worker.terminate();return true;};
  const abort=()=>{if(finish())reject(new DOMException('Study content loading was cancelled.','AbortError'));};
  const timer=setTimeout(()=>{if(finish())reject(new Error("Study content verification timed out. Your progress has been kept; please try again."));},45000);
  signal?.addEventListener('abort',abort,{once:true});
  if(signal?.aborted){abort();return;}
  worker.onmessage=(event:MessageEvent<{content?:VerifiedContent;error?:string}>)=>{
   if(!finish())return;if(event.data.error)reject(new Error(event.data.error));else if(event.data.content)resolve(event.data.content);else reject(new Error("The study verification response was incomplete."));
  };
  // Older browsers or a blocked worker can use the same integrity checks locally.
  worker.onerror=()=>{if(finish())locally().then(resolve,reject);};
  try{worker.postMessage({manifest,pages,questionIds});}catch{if(finish())locally().then(resolve,reject);}
 });
}
