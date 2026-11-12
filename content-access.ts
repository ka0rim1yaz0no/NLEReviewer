import {supabase} from "./auth";
import {validateProtectedContent} from "./content-integrity";
import type {ContentRow} from "./content-integrity";
import {contentRelease,isStudyAddition,priorStudyAdditionsRelease,releaseForArchive,studyAdditionsRelease} from "./content-release";
import {processContentRelease} from "./content-processing";
import type {ArchivedQuestionRevision,ReleaseManifest} from "./content-release";
import {throwIfAborted,timedRequest} from './abort-utils';
import studyAdditions from "./study-additions-summary.json";
async function readRelease(release:string,signal?:AbortSignal,ids?:readonly string[]){
 throwIfAborted(signal);
 if(!supabase)throw new Error("The study database is not configured.");
 const request=timedRequest(signal,15000);
 try{
  const {data,error}=await supabase.from("study_content_releases").select("data").eq("release",release).eq("id","manifest").abortSignal(request.signal).maybeSingle();
  throwIfAborted(signal);
  if(error&&!["PGRST205","42P01"].includes(error.code))throw new Error("The study release could not be checked. Try again when your connection is available.");
  if(data){
   const manifest=data.data as ReleaseManifest;
   if(!Number.isInteger(manifest.pages)||manifest.pages<1||manifest.pages>64)throw new Error("The study release manifest is invalid.");
   if(release===studyAdditionsRelease&&(manifest.questionCount!==studyAdditions.questionCount||manifest.digest!==studyAdditions.digest))
    throw new Error("The latest study update does not match this app release. Reload and try again.");
   const pages:ContentRow[]=[];
   // Small requests keep mobile transfers bounded. Manifest publication is last,
   // so a partially staged release can never replace the previous question bank.
   for(let offset=0;offset<manifest.pages;offset+=2){
    throwIfAborted(signal);const pageRequest=timedRequest(signal,20000);
    try{const result=await supabase.from("study_content_releases").select("id,kind,data").eq("release",release).eq("kind","page").order("id").range(offset,offset+1).abortSignal(pageRequest.signal);throwIfAborted(signal);if(result.error)throw new Error("Study questions could not be loaded. Your progress has been kept. Please try again.");pages.push(...(result.data||[]));}finally{pageRequest.dispose();}
   }
   return await processContentRelease(manifest,pages,signal,ids);
  }
 }finally{request.dispose();}
}
export async function loadProtectedContent(signal?:AbortSignal,archive?:{ids:readonly string[];revision:ArchivedQuestionRevision}){
 if(!supabase)throw new Error("The study database is not configured.");
 if(archive){
  const coreIds=archive.ids.filter(id=>!isStudyAddition(id)),additionIds=archive.ids.filter(isStudyAddition);
  const parts=[{release:releaseForArchive(archive.revision),ids:coreIds},{release:priorStudyAdditionsRelease,ids:additionIds}];
  const saved=await Promise.all(parts.filter(part=>part.ids.length).map(({release,ids})=>readRelease(release,signal,ids)));
  if(saved.some(part=>!part))throw new Error("Saved questions could not be loaded. Please try again.");
  return {questions:saved.flatMap(part=>part?.questions||[]),cases:[]};
 }
 const [core,additions]=await Promise.all([readRelease(contentRelease,signal),readRelease(studyAdditionsRelease,signal)]);
 if(core){
  if(!additions)throw new Error("The latest study update is unavailable. Your progress has been kept. Please try again.");
  const coreIds=new Set(core.questions.map(question=>question.id));
  if(additions.questions.some(question=>coreIds.has(question.id)))throw new Error("A study update contains a repeated question ID.");
  return {questions:[...core.questions,...additions.questions],cases:[...core.cases,...additions.cases]};
 }
 // Backward-compatible fallback while a new release is being staged.
 const rows:ContentRow[]=[];
 for(let offset=0;offset<1000;offset+=100){
  throwIfAborted(signal);const legacyRequest=timedRequest(signal,12000);
  try{const {data,error}=await supabase.from("study_content").select("id,kind,data").order("id").range(offset,offset+99).abortSignal(legacyRequest.signal);throwIfAborted(signal);if(error)throw new Error("Study content could not be loaded. Check your connection and try again.");rows.push(...(data||[]));if((data||[]).length<100){const content=await validateProtectedContent(rows);throwIfAborted(signal);return content;}}
  finally{legacyRequest.dispose();}
 }
 throw new Error("The question-bank page limit was exceeded.");
}
