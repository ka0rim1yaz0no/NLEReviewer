import {mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {activeQuestions} from "./author-bank.ts";
import {findCurriculumTopic} from "./curriculum.ts";
import {isDecisionQuestion,questionChoiceKey,questionFamily} from "./question-selection.ts";

const rows=activeQuestions.filter(isDecisionQuestion).map(q=>({
 id:q.id,subject:q.subject,topic:findCurriculumTopic(q.subject+":"+q.topic)?.slug||"",
 family:questionFamily(q),answer:q.correctIndex,choice_set:createHash("sha256").update(questionChoiceKey(q)).digest("hex"),
}));
const byTopic=new Map();
for(const row of rows){
 const key=row.subject+":"+row.topic+":"+row.family;
 if(!byTopic.has(key))byTopic.set(key,row);
}
const items=[...byTopic.values()];
for(const subject of ["CROSS","NP1","NP2","NP3","NP4","NP5"]){
 if(new Set(items.filter(q=>q.subject===subject).map(q=>q.family)).size<15)throw Error("Insufficient game questions for "+subject);
}
const dir=new URL("./outputs/play-seed/",import.meta.url);
await mkdir(dir,{recursive:true});
const batchSize=240;
for(let index=0;index<items.length;index+=batchSize){
 const batch=items.slice(index,index+batchSize);
 const json=JSON.stringify(batch).replaceAll("'","''");
 const statement=`insert into reviewer_play.question_pool (id,subject,topic,family,answer,choice_set)
 select id,subject,topic,family,answer,choice_set from jsonb_to_recordset('${json}'::jsonb)
 as q(id text,subject text,topic text,family text,answer smallint,choice_set text)
 on conflict(id) do update set subject=excluded.subject,topic=excluded.topic,family=excluded.family,answer=excluded.answer,choice_set=excluded.choice_set;
 select count(*) as playable_questions from reviewer_play.question_pool;
`;
 await writeFile(new URL(`pool-${String(Math.floor(index/batchSize)+1).padStart(2,"0")}.sql`,dir),statement);
}
console.log(JSON.stringify({questions:items.length,batches:Math.ceil(items.length/batchSize)}));
