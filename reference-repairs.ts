import patches from "./question-reference-patches.json" with {type:"json"};
import resolutions from "./reference-resolutions.json" with {type:"json"};
import type {Question} from "./types.ts";

type ReferencePatch={id:string;fields:{option?:number;field:string;from:string;to:string}[]};
const byId=new Map((patches as ReferencePatch[]).map(p=>[p.id,p.fields]));
const replacements=new Map(resolutions.references.filter(r=>r.action==="replaced").map(r=>[r.previousUrl,r.currentUrl]));

export const resolvedReference=(url:string)=>replacements.get(url)??url;

// Restrict this repair to reviewed URL fields. Historical stems, choice order,
// answer keys and explanations keep their published meanings.
function repair(q:Question,restore:boolean):Question{
 const fields=byId.get(q.id);if(!fields)return q;
 const copy={...q,options:q.options.map(o=>({...o}))};
 for(const change of fields){
  if(change.field!=="source"&&change.field!=="contextSource")throw new Error("Invalid reference repair field.");
  if(change.option===undefined){
   if(change.field!=="source")throw new Error("Invalid question reference repair.");
   const expected=restore?change.to:change.from;
   // Raw authoring arrays already contain the historical URL.
   if(restore&&copy.source===change.from)continue;
   if(copy.source!==expected)throw new Error(`Reference repair no longer matches ${q.id}.`);
   copy.source=restore?change.from:change.to;
  }else{
   if(!Number.isInteger(change.option)||change.option<0||change.option>3)throw new Error("Invalid reference repair option.");
   const option=copy.options[change.option],field=change.field;
   if(!option)throw new Error(`Reference repair option missing in ${q.id}.`);
   if(restore&&option[field]===change.from)continue;
   if(option[field] !== (restore?change.to:change.from))throw new Error(`Reference repair no longer matches ${q.id} choice ${change.option}.`);
   option[field]=restore?change.from:change.to;
  }
 }
 return copy;
}
export const applyReferenceRepairs=(questions:Question[])=>questions.map(q=>repair(q,false));
export const restoreReferenceRepairs=(questions:Question[])=>questions.map(q=>repair(q,true));
