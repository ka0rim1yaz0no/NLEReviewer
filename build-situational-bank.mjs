// Authoring-only. Never imported into the browser application.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import catalog from './topic-catalog.json' with {type:'json'};
import {shuffled,validateQuestions,normalizeQuestionStem} from './bank.ts';

const filenames=['foundations','community','maternal','medsurg','neuro','mental'].map(s=>`situations-${s}.txt`);
const cases=[];const seenTopics=new Set();
for(const filename of filenames){
 let text;try{text=await readFile(new URL(filename,import.meta.url),'utf8');}catch(error){if(process.argv.includes('--draft')&&error.code==='ENOENT')continue;throw error;}
 let topic,source,index=0;
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  if(line.startsWith('@')){
   const [slug,url]=line.slice(1).split('|');topic=catalog.find(t=>t.slug===slug);source=url;index=0;
   if(!topic||!/^https:\/\//.test(source)||seenTopics.has(slug))throw Error(`Invalid or repeated topic in ${filename}: ${slug}`);
   seenTopics.add(slug);continue;
  }
  if(!topic)throw Error('Missing topic heading');
  const fields=line.split('|');if(fields.length<7||fields.length>8)throw Error(`${topic.slug}: expected seven clinical fields and optional reference, got ${fields.length}`);
  const [scenario,problem,action,teaching,outcome,unsafe,reason,override]=fields;
  if(scenario.length<70||[problem,action,teaching,outcome,unsafe].some(s=>s.length<15)||reason.length<60)throw Error(`Incomplete clinical blueprint: ${topic.slug} ${index+1}`);
  index++;cases.push({id:`SIT-${topic.subject}-${topic.slug}-${String(index).padStart(2,'0')}`,subject:topic.subject,topic:topic.name,topicSlug:topic.slug,scenario,problem,action,teaching,outcome,unsafe,reason,source:override||source});
 }
}
if(!process.argv.includes('--draft')){
 if(seenTopics.size!==155||cases.length!==620)throw Error(`Need four cases in each of 155 topics; found ${cases.length} cases across ${seenTopics.size} topics.`);
 for(const t of catalog)if(cases.filter(c=>c.topicSlug===t.slug).length!==4)throw Error(`Expected four cases: ${t.slug}`);
}
if(new Set(cases.map(c=>normalizeQuestionStem(c.scenario))).size!==cases.length)throw Error('Repeated clinical situation');
const fields=['problem','action','teaching','outcome','reason'];
function peers(c,field){
 const same=cases.filter(p=>p.id!==c.id&&p.topicSlug===c.topicSlug&&p[field].toLowerCase()!==c[field].toLowerCase());
 const wider=cases.filter(p=>p.id!==c.id&&p.subject===c.subject&&p.topicSlug!==c.topicSlug&&p[field].toLowerCase()!==c[field].toLowerCase());
 const ordered=[...shuffled(same,seed(c.id+field)),...shuffled(wider,seed(field+c.id))];const seen=new Set([c[field].toLowerCase()]);
 return ordered.filter(p=>{const key=p[field].toLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
}
function seed(text){return parseInt(createHash('sha256').update(text).digest('hex').slice(0,8),16);}
function finish(text){return /[.!?][”"']?$/.test(text)?text:text+'.';}
function choice(profile,field){
 if(field==='action')return `${profile.problem}: ${profile.action}`;
 if(field==='teaching')return `${profile.teaching} — to address ${profile.problem.charAt(0).toLowerCase()+profile.problem.slice(1)}`;
 if(field==='outcome')return `${profile.outcome} — the goal for ${profile.problem.charAt(0).toLowerCase()+profile.problem.slice(1)}`;
 return profile[field];
}
const questions=[];
for(const c of cases){
 const specs=[
  {key:'recognition',field:'problem',prompt:'Which concern should guide the nurse’s focused assessment and priorities?',correct:c.problem,explanation:`The findings support ${c.problem.toLowerCase()}. ${finish(c.reason)}`},
  {key:'action',field:'action',prompt:'Which nursing action best addresses the immediate need described?',correct:c.action,explanation:`${finish(c.action)} This addresses the identified problem in this situation. ${finish(c.reason)}`},
  {key:'teaching',field:'teaching',prompt:'Once immediate care needs are addressed, which teaching is most relevant for this client, family, or care team?',correct:c.teaching,explanation:`${finish(c.teaching)} This teaching addresses the specific risk or care need described. ${finish(c.reason)}`},
  {key:'safety',field:'unsafe',prompt:'The nurse reviews the proposed care plan. Which proposed action requires correction?',correct:c.unsafe,explanation:`${finish(c.unsafe)} This would conflict with safe care for the identified problem. The appropriate response is to ${c.action.charAt(0).toLowerCase()+c.action.slice(1)}. ${finish(c.reason)}`},
  {key:'planning',field:'outcome',prompt:'Which outcome most directly addresses the priority problem in the nursing care plan?',correct:c.outcome,explanation:`${finish(c.outcome)} This is the desired response to care for the problem described. ${finish(c.reason)}`},
  {key:'evaluation',field:'problem',prompt:`Following care, the nurse observes this change: ${finish(c.outcome)} Which evaluation is best supported by that information?`,correct:`Progress toward the planned goal for ${c.problem.charAt(0).toLowerCase()+c.problem.slice(1)}`,explanation:`The observed response is consistent with progress toward the planned goal: ${finish(c.outcome)} It supports continued focused evaluation; it does not establish that all future risk has disappeared. ${finish(c.reason)}`},
  {key:'reasoning',field:'reason',prompt:`The plan includes this response: ${finish(c.action)} Which explanation best connects that response to the findings in the situation?`,correct:c.reason,explanation:`This explanation links the observed findings to the selected response. ${finish(c.reason)}`}
 ];
 for(const spec of specs){
  const correct={text:spec.key==='evaluation'?spec.correct:choice(c,spec.field),rationale:spec.explanation,source:c.source,referenceId:c.id+':'+spec.key};
  let wrong;
  if(spec.key==='safety'){
   wrong=[{text:c.action,why:`This is an appropriate response to the presenting problem. ${finish(c.reason)}`},{text:`Provide the relevant teaching when immediate needs are addressed: ${c.teaching}`,why:`Teaching at an appropriate time supports the care plan. ${finish(c.reason)}`},{text:`Reassess and document progress toward this outcome: ${c.outcome}`,why:'Reassessment and accurate documentation help determine whether the chosen care is achieving its intended effect.'}].map(o=>({text:o.text,rationale:`This plan does not require correction. ${o.why}`,source:c.source,referenceId:c.id+':safe-plan'}));
  }else{
   const matches=peers(c,spec.field);if(matches.length!==3)throw Error('Insufficient distinct alternatives for '+c.id+' '+spec.key);
   wrong=matches.map(p=>({text:spec.key==='evaluation'?`Progress toward the planned goal for ${p.problem.charAt(0).toLowerCase()+p.problem.slice(1)}`:choice(p,spec.field),rationale:`This option addresses ${p.problem.charAt(0).toLowerCase()+p.problem.slice(1)}. In the present situation, the relevant concern is ${c.problem.charAt(0).toLowerCase()+c.problem.slice(1)}. ${finish(c.reason)}`,source:p.source,referenceId:p.id+':'+spec.field}));
  }
  const options=shuffled(wrong,seed(c.id+spec.key));
  // Hash the answer position independently: low-bit LCG shuffling of four
  // items gives a noticeably uneven distribution when the key always starts first.
  options.splice(seed('answer-position:'+c.id+':'+spec.key)%4,0,correct);
  questions.push({id:c.id+'-'+spec.key,subject:c.subject,topic:c.topic,stem:c.scenario+'\n\n'+spec.prompt,options,correctIndex:options.indexOf(correct),rationale:correct.rationale,keyPoint:`${c.problem}: ${finish(c.reason)} Priority response: ${finish(c.action)}`,source:c.source,origin:'Original NLE Reviewer fictional clinical, community, or professional situation. Authored for nursing clinical-judgment practice using the cited reference. Not an actual patient record, a BoardPal question, or an official PNLE item. Reference checking is not independent professional clinical approval.',format:'situational',caseId:c.id,clinicalObjective:spec.key});
 }
}
validateQuestions(questions);
for(const field of fields)if(cases.some(c=>!c[field]))throw Error('Missing case evidence field '+field);
const destination=process.argv.includes('--draft')?'./outputs/situational-draft/':'./';
if(destination.includes('outputs')){const {mkdir}=await import('node:fs/promises');await mkdir(new URL(destination,import.meta.url),{recursive:true});}
await writeFile(new URL(destination+'situational-questions.json',import.meta.url),JSON.stringify(questions,null,2)+'\n');
await writeFile(new URL(destination+'situational-evidence.json',import.meta.url),JSON.stringify(cases,null,2)+'\n');
const report={preparedAt:'2026-11-03',clinicalSituationSets:cases.length,newSituationalQuestions:questions.length,existingFivePartSituationalQuestions:600,totalExplicitSituationalQuestions:questions.length+600,topics:seenTopics.size,questionsPerNewSituation:7,competencies:['recognition','action','teaching','safety','planning','evaluation','reasoning'],independentClinicalReview:false,notes:'Each authored situation supports seven different nursing-process decisions. The question count is not a count of independent patient vignettes. No names-only or age-only variants are generated. Keys and per-choice explanations are tied to their case evidence; clinical sources are recorded per situation.'};
await writeFile(new URL(destination+'situational-review-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
