import {supabase} from "./auth";
import {validateProtectedContent} from "./content-integrity";
import type {ContentRow} from "./content-integrity";
import {contentRelease,priorQuestionRelease} from "./content-release";
import {processContentRelease} from "./content-processing";
import type {ReleaseManifest} from "./content-release";
import {throwIfAborted,timedRequest} from './abort-utils';
export async function loadProtectedContent(signal?:AbortSignal,archivedQuestionIds?:readonly string[]){
 throwIfAborted(signal);
 if(!supabase)throw new Error("The study database is not configured.");
 const release=archivedQuestionIds?priorQuestionRelease:contentRelease;
 const request=timedRequest(signal,15000);
 try{
  const {data,error}=await supabase.from("study_content_releases").select("data").eq("release",release).eq("id","manifest").abortSignal(request.signal).maybeSingle();
  throwIfAborted(signal);
  if(error&&!["PGRST205","42P01"].includes(error.code))throw new Error("The study release could not be checked. Try again when your connection is available.");
  if(data){
   const manifest=data.data as ReleaseManifest;
   if(!Number.isInteger(manifest.pages)||manifest.pages<1||manifest.pages>64)throw new Error("The study release manifest is invalid.");
   const pages:ContentRow[]=[];
   // Small requests keep mobile transfers bounded. Manifest publication is last,
   // so a partially staged release can never replace the previous question bank.
   for(let offset=0;offset<manifest.pages;offset+=2){
    throwIfAborted(signal);const pageRequest=timedRequest(signal,20000);
    try{const result=await supabase.from("study_content_releases").select("id,kind,data").eq("release",release).eq("kind","page").order("id").range(offset,offset+1).abortSignal(pageRequest.signal);throwIfAborted(signal);if(result.error)throw new Error("Study questions could not be loaded. Your progress has been kept. Please try again.");pages.push(...(result.data||[]));}finally{pageRequest.dispose();}
   }
   return await processContentRelease(manifest,pages,signal,archivedQuestionIds);
  }
 }finally{request.dispose();}
 if(archivedQuestionIds)throw new Error("Saved questions could not be loaded. Please try again.");
 // Backward-compatible fallback while a new release is being staged.
 const rows:ContentRow[]=[];
 for(let offset=0;offset<1000;offset+=100){
  throwIfAborted(signal);const legacyRequest=timedRequest(signal,12000);
  try{const {data,error}=await supabase.from("study_content").select("id,kind,data").order("id").range(offset,offset+99).abortSignal(legacyRequest.signal);throwIfAborted(signal);if(error)throw new Error("Study content could not be loaded. Check your connection and try again.");rows.push(...(data||[]));if((data||[]).length<100){const content=await validateProtectedContent(rows);throwIfAborted(signal);return content;}}
  finally{legacyRequest.dispose();}
 }
 throw new Error("The question-bank page limit was exceeded.");
}
