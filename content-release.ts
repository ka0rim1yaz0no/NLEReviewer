import { gunzipSync } from "fflate";
import { validateProtectedContent } from "./content-integrity.ts";
import type { ContentRow } from "./content-integrity.ts";
import { isSituational } from "./collections.ts";
import type { Question } from "./types.ts";
import studyAdditions from "./study-additions-summary.json" with {type:"json"};
// Immutable release: stage all pages before publishing its manifest. Older
// deployments continue using study_content and never see half a release.
export const contentRelease="2026-11-13-pnle-decisions-1";
export const studyAdditionsRelease=studyAdditions.release;
export const priorStudyAdditionsRelease="2026-11-13-practice-expansion-2";
export const priorQuestionRelease="2026-11-11-challenge-pink-2";
export const firstJudgmentRelease="2026-11-11-situational-judgment-1";
export const clinicalAuditRelease="2026-11-11-clinical-audit-1";
export const choiceReviewRelease="2026-11-11-choice-reference-review-1";
export const fullBankReviewRelease="2026-11-13-full-bank-review-1";
export const applicationReviewRelease="2026-11-13-pnle-application-2";
export const currentQuestionRevision=6;
export type ArchivedQuestionRevision=0|1|2|3|4|5;
export function releaseForArchive(revision:ArchivedQuestionRevision){
 return [priorQuestionRelease,firstJudgmentRelease,clinicalAuditRelease,choiceReviewRelease,fullBankReviewRelease,applicationReviewRelease][revision];
}
export function isStudyAddition(id:string){return /^EXP2-(?:SKIN|ROTAVIRUS)-\d{3}$/.test(id);}
export function questionNeedsArchive(question:Question,revision:ArchivedQuestionRevision){
 return (question.questionRevision??(isSituational(question)?1:0))>revision;
}
export type ReleaseManifest={version:2;encoding:"gzip-base64";pages:number;questionCount:number;caseCount:number;digest:string;bytes:number};
export const maximumReleaseBytes=50_000_000;
export async function decodeContentRelease(manifest:ReleaseManifest,pages:ContentRow[],questionIds?:readonly string[]){
 // Includes historical records so saved answers keep their original keys.
 if(!manifest||manifest.version!==2||manifest.encoding!=="gzip-base64"||!Number.isInteger(manifest.pages)||manifest.pages<1||manifest.pages>64||!Number.isInteger(manifest.bytes)||manifest.bytes<1||manifest.bytes>maximumReleaseBytes)throw new Error("The study release manifest is invalid.");
 if(pages.length!==manifest.pages)throw new Error("The study release is incomplete. Your saved progress has been kept.");
 const ordered=[...pages].sort((a,b)=>a.id.localeCompare(b.id));
 for(let i=0;i<ordered.length;i++){const page=ordered[i];if(page.id!==`page-${String(i).padStart(4,"0")}`||page.kind!=="page"||typeof page.data!=="string"||page.data.length>500_000)throw new Error("A study release page is invalid.");}
 const base64=ordered.map(p=>p.data).join("");
 if(base64.length>16_000_000||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw new Error("The compressed study release is invalid.");
 let raw:unknown;
 try{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const decoded=gunzipSync(bytes);if(decoded.length!==manifest.bytes)throw new Error("size");raw=JSON.parse(new TextDecoder().decode(decoded));}catch{throw new Error("The study release could not be decoded. Your saved progress has been kept.");}
 if(!raw||typeof raw!=="object"||!("questions"in raw)||!("cases"in raw))throw new Error("The study release payload is invalid.");
 const content=await validateProtectedContent([{id:"questions-0000",kind:"questions",data:raw.questions},{id:"cases-0000",kind:"cases",data:raw.cases},{id:"manifest",kind:"manifest",data:{...manifest,version:1}}]);
 if(!questionIds)return content;
 const selected=new Set(questionIds),questions=content.questions.filter(q=>selected.has(q.id));
 if(questions.length!==selected.size)throw new Error("Some saved questions are unavailable. Try again.");
 return {questions,cases:[]};
}
