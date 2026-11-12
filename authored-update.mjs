import {existsSync,readFileSync} from "node:fs";
import {validateQuestions} from "./bank.ts";

const sources={
 ps:"https://www.aad.org/public/diseases/psoriasis/what/symptoms",
 pst:"https://www.aad.org/public/diseases/psoriasis/insider/tips",
 ros:"https://www.aad.org/public/diseases/rosacea/what-is",
 rost:"https://www.aad.org/public/diseases/rosacea/triggers/tips",
 derm:"https://www.aad.org/public/diseases/eczema/types/contact-dermatitis",
 hives:"https://www.aad.org/public/diseases/a-z/hives-symptoms",
 ana:"https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines",
 vit:"https://www.aad.org/public/diseases/a-z/vitiligo-overview",
 kel:"https://www.aad.org/public/diseases/a-z/keloids-overview",
 aba:"https://www.ameriburn.org/burn-care-team/resources/guidelines-for-burn-patient-referral",
 wound:"https://msktc.org/burn/factsheets/wound-care-after-burn-injury",
 itch:"https://msktc.org/burn/factsheets/itchy-skin-after-burn-injury",
 scar:"https://msktc.org/burn/factsheets/scar-management-after-burn-injury",
 exercise:"https://msktc.org/burn/factsheets/exercise-after-burn-injury",
 rv:"https://www.who.int/publications/i/item/WHO-WER9628",
 melanoma:"https://www.aad.org/public/diseases/skin-cancer/types/common/melanoma/symptoms",
 nail:"https://www.aad.org/public/diseases/skin-cancer/types/common/melanoma/nail-melanoma",
 basal:"https://www.aad.org/public/diseases/skin-cancer/basal-cell-carcinoma",
 pressure:"https://npiap.com/resource/resmgr/online_store/npiap_pressure_injury_stages.pdf",
 healing:"https://npiap.com/resource/resmgr/npuap-position-statement-on-.pdf",
 isolation:"https://www.cdc.gov/infection-control/hcp/isolation-precautions/appendix-a-type-duration.html",
 scabies:"https://www.cdc.gov/scabies/php/public-health-strategy-crusted/index.html",
 necrotizing:"https://www.cdc.gov/group-a-strep/hcp/clinical-guidance/necrotizing-fasciitis.html",
 cooling:"https://www.nhs.uk/conditions/Burns-and-scalds/",
 electrical:"https://www.salisbury.nhs.uk/media/kgklfbxt/british-burn-association-first-aid-clinical-practice-guidelines.pdf",
};
const specificSources={
 3:sources.pst,
 5:"https://www.aad.org/public/diseases/psoriasis/treatment/treatment",
 14:"https://www.aad.org/public/diseases/rosacea/triggers/find",
 20:"https://www.aad.org/public/everyday-care/itchy-skin/poison-ivy/treat-rash",
 33:"https://www.niams.nih.gov/health-topics/vitiligo",
 36:"https://www.aad.org/public/diseases/a-z/keloids-treatment",
 37:"https://www.aad.org/public/diseases/a-z/keloids-treatment",
};
function readCases(name,expected){
 const file=new URL("./content-authoring/"+name,import.meta.url);
 if(!existsSync(file))return [];
 const rows=readFileSync(file,"utf8").trim().split(/\r?\n/).filter(Boolean);
 if(rows.length!==expected)throw Error("Unexpected case count in "+name);
 return rows;
}
const firstCases=readCases("skin-burns-items.txt",60);
const additionalCases=readCases("practice-expansion-items.txt",17);
if(firstCases.length&&firstCases.filter(row=>row.startsWith("rv|")).length!==3)throw Error("Expected three rotavirus items");

const rows=[...firstCases,...additionalCases];
export const newStudyQuestions=rows.length?validateQuestions(rows.map((line,index)=>{
 const fields=line.split("|").map(field=>field.trim());
 const [sourceKey,scenario,prompt,...answers]=fields;
 const [key,orientation]=sourceKey.split(":");
 const unsafeAnswer=orientation==="unsafe";
 const studyNote=answers[8];
 if(fields.length!==(unsafeAnswer?12:11)||fields.some(field=>!field)||orientation&&!unsafeAnswer)throw Error("Incomplete question "+(index+1));
 const source=specificSources[index+1]||sources[key];
 if(!source)throw Error("Missing source for question "+(index+1));
 const options=Array.from({length:4},(_,slot)=>({text:answers[slot*2],rationale:answers[slot*2+1],source}));
 const correctIndex=(index*3+1)%4;
 const correct=options.shift();
 options.splice(correctIndex,0,correct);
 const number=key==="rv"?index-56:index<firstCases.length?index+1:58+index-firstCases.length;
 const suffix=String(number).padStart(3,"0");
 const id=(key==="rv"?"EXP2-ROTAVIRUS-":"EXP2-SKIN-")+suffix;
 return {
  id,subject:key==="rv"?"NP1":"NP3",
  topic:key==="rv"?"Expanded Program on Immunization (EPI)":"Integumentary Disorders & Burn Care",
  stem:scenario+"\n\n"+prompt,options,correctIndex,rationale:correct.rationale,keyPoint:studyNote||correct.text,
  source,sourceTopic:key==="rv"?"Rotavirus vaccination":"Skin and burn nursing",
  origin:"Original NLEReviewer clinical practice",format:"situational",difficulty:"challenge",
  clinicalObjective:unsafeAnswer?"safety":"decision",...(unsafeAnswer?{unsafeAnswer:true}:{}),caseId:id,questionRevision:3,
 };
})):[];
