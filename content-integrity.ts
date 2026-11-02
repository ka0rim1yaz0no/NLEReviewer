import type { Question, ClinicalCase } from "./types.ts";
import { validateQuestions, subjects } from "./bank.ts";
export type ContentRow={id:string;kind:string;data:unknown};
function canonical(value:unknown):string{if(Array.isArray(value))return `[${value.map(canonical).join(",")}]`;if(value&&typeof value==="object")return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical((value as Record<string,unknown>)[key])}`).join(",")}}`;return JSON.stringify(value);}
export async function contentDigest(questions:Question[],cases:ClinicalCase[]){const result=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonical({questions,cases})));return [...new Uint8Array(result)].map(n=>n.toString(16).padStart(2,"0")).join("");}
export async function validateProtectedContent(rows:ContentRow[]){
 const ordered=[...rows].sort((a,b)=>a.id.localeCompare(b.id));
 const manifests=ordered.filter(r=>r.kind==="manifest");
 if(manifests.length!==1)throw new Error("The protected question-bank manifest is unavailable.");
 const manifest=manifests[0].data as {version:number;questionCount:number;caseCount:number;digest:string};
 if(!manifest||manifest.version!==1||!Number.isInteger(manifest.questionCount)||manifest.questionCount<1||!Number.isInteger(manifest.caseCount)||typeof manifest.digest!=="string")throw new Error("The protected question-bank manifest is invalid.");
 const raw=ordered.filter(r=>r.kind==="questions").flatMap(r=>{if(!Array.isArray(r.data))throw new Error("A question-bank page is invalid.");return r.data;});
 const rawCases=ordered.filter(r=>r.kind==="cases").flatMap(r=>{if(!Array.isArray(r.data))throw new Error("A topic-note page is invalid.");return r.data;});
 if(raw.length!==manifest.questionCount||rawCases.length!==manifest.caseCount)throw new Error("The question bank is incomplete. Your saved progress has been kept.");
 const questions=validateQuestions(raw);
 for(const c of rawCases){if(!c||typeof c!=="object"||!subjects.some(s=>s.id===c.subject)||![c.topic,c.title,c.scenario].every(v=>typeof v==="string"&&v.trim())||!Array.isArray(c.facts)||c.facts.length!==5||c.facts.some((f:unknown)=>!f||typeof f!=="object"||!("text" in f)||!("reason" in f)||typeof f.text!=="string"||typeof f.reason!=="string"))throw new Error("A protected topic note is invalid.");}
 const cases=rawCases as ClinicalCase[];
 if(await contentDigest(questions,cases)!==manifest.digest)throw new Error("The question bank failed its integrity check. Your saved progress has been kept.");
 return {questions,cases};
}
