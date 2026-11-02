import {supabase} from "./auth";
import {validateProtectedContent} from "./content-integrity";
import type {ContentRow} from "./content-integrity";
import {contentRelease,decodeContentRelease} from "./content-release";
import type {ReleaseManifest} from "./content-release";
export async function loadProtectedContent(){
 if(!supabase)throw new Error("The study database is not configured.");
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const {data,error}=await supabase.from("study_content_releases").select("data").eq("release",contentRelease).eq("id","manifest").abortSignal(controller.signal).maybeSingle();
  if(error&&!["PGRST205","42P01"].includes(error.code))throw new Error("The study release could not be checked. Try again when your connection is available.");
  if(data){
   const manifest=data.data as ReleaseManifest;
   if(!Number.isInteger(manifest.pages)||manifest.pages<1||manifest.pages>64)throw new Error("The study release manifest is invalid.");
   const pages:ContentRow[]=[];
   // Small requests keep mobile transfers bounded. Manifest publication is last,
   // so a partially staged release can never replace the previous question bank.
   for(let offset=0;offset<manifest.pages;offset+=2){
    const pageController=new AbortController(),pageTimer=setTimeout(()=>pageController.abort(),20000);
    try{const result=await supabase.from("study_content_releases").select("id,kind,data").eq("release",contentRelease).eq("kind","page").order("id").range(offset,offset+1).abortSignal(pageController.signal);if(result.error)throw new Error("Study questions could not be loaded. Your progress has been kept. Please try again.");pages.push(...(result.data||[]));}finally{clearTimeout(pageTimer);}
   }
   return await decodeContentRelease(manifest,pages);
  }
 }finally{clearTimeout(timer);}
 // Backward-compatible fallback while a new release is being staged.
 const rows:ContentRow[]=[];
 for(let offset=0;offset<1000;offset+=100){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{const {data,error}=await supabase.from("study_content").select("id,kind,data").order("id").range(offset,offset+99).abortSignal(controller.signal);if(error)throw new Error("Study content could not be loaded. Check your connection and try again.");rows.push(...(data||[]));if((data||[]).length<100)return await validateProtectedContent(rows);}
  finally{clearTimeout(timer);}
 }
 throw new Error("The question-bank page limit was exceeded.");
}
