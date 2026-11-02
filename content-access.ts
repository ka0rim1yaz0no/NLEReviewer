import {supabase} from "./auth";
import {validateProtectedContent} from "./content-integrity";
import type {ContentRow} from "./content-integrity";
export async function loadProtectedContent(){
 if(!supabase)throw new Error("The study database is not configured.");
 const rows:ContentRow[]=[];
 for(let offset=0;offset<1000;offset+=100){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{const {data,error}=await supabase.from("study_content").select("id,kind,data").order("id").range(offset,offset+99).abortSignal(controller.signal);if(error)throw new Error("Study content could not be loaded. Check your connection and try again.");rows.push(...(data||[]));if((data||[]).length<100)return await validateProtectedContent(rows);}
  finally{clearTimeout(timer);}
 }
 throw new Error("The question-bank page limit was exceeded.");
}
