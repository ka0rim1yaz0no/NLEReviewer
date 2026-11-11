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
const input=new URL("./content-authoring/skin-burns-items.txt",import.meta.url);
const rows=existsSync(input)?readFileSync(input,"utf8").trim().split(/\r?\n/).filter(Boolean):[];
if(existsSync(input)&&(rows.length!==60||rows.filter(row=>row.startsWith("rv|")).length!==3))throw Error("Expected 57 Skin & Burns and three rotavirus items");

export const newStudyQuestions=rows.length?validateQuestions(rows.map((line,index)=>{
 const fields=line.split("|").map(field=>field.trim());
 if(fields.length!==11||fields.some(field=>!field))throw Error("Incomplete question "+(index+1));
 const [key,scenario,prompt,...answers]=fields;
 const source=specificSources[index+1]||sources[key];
 if(!source)throw Error("Missing source for question "+(index+1));
 const options=Array.from({length:4},(_,slot)=>({text:answers[slot*2],rationale:answers[slot*2+1],source}));
 const correctIndex=(index*3+1)%4;
 const correct=options.shift();
 options.splice(correctIndex,0,correct);
 const suffix=String(key==="rv"?index-56:index+1).padStart(3,"0");
 const id=(key==="rv"?"EXP2-ROTAVIRUS-":"EXP2-SKIN-")+suffix;
 return {
  id,subject:key==="rv"?"NP1":"NP3",
  topic:key==="rv"?"Expanded Program on Immunization (EPI)":"Integumentary Disorders & Burn Care",
  stem:scenario+"\n\n"+prompt,options,correctIndex,rationale:correct.rationale,keyPoint:correct.text,
  source,sourceTopic:key==="rv"?"Rotavirus vaccination":"Skin and burn nursing",
  origin:"Original NLEReviewer clinical practice",format:"situational",difficulty:"challenge",
  clinicalObjective:"decision",caseId:id,questionRevision:3,
 };
})):[];
