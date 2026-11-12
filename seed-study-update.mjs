import {mkdir,writeFile} from "node:fs/promises";
import {gzipSync} from "node:zlib";
import {createHash} from "node:crypto";
import {questions as baseQuestions} from "./author-bank.ts";
import {newStudyQuestions} from "./authored-update.mjs";
import {validateQuestions} from "./bank.ts";
import {contentDigest} from "./content-integrity.ts";
import {decodeContentRelease,studyAdditionsRelease} from "./content-release.ts";
import {findCurriculumTopic} from "./curriculum.ts";
import {questionChoiceKey,questionFamily} from "./question-selection.ts";
import studyAdditions from "./study-additions-summary.json" with {type:"json"};

if(newStudyQuestions.length!==studyAdditions.questionCount)throw Error("The private case files must match the release question count.");
validateQuestions([...baseQuestions,...newStudyQuestions]);
const cases=[];
const payload=Buffer.from(JSON.stringify({questions:newStudyQuestions,cases}));
const page=gzipSync(payload,{level:9}).toString("base64");
const manifest={version:2,encoding:"gzip-base64",pages:1,questionCount:newStudyQuestions.length,caseCount:0,
 digest:await contentDigest(newStudyQuestions,cases),bytes:payload.length};
if(manifest.digest!==studyAdditions.digest||manifest.questionCount!==studyAdditions.questionCount)throw Error("The private authored cases do not match the planned release metadata.");
await decodeContentRelease(manifest,[{id:"page-0000",kind:"page",data:page}]);
const sqlValue=value=>"'"+value.replaceAll("'","''")+"'";
const gameRows=newStudyQuestions.map(q=>({
 id:q.id,subject:q.subject,topic:findCurriculumTopic(q.subject+":"+q.topic).slug,family:questionFamily(q),answer:q.correctIndex,
 choice_set:createHash("sha256").update(questionChoiceKey(q)).digest("hex"),
}));
const destination=new URL("./outputs/boardpal-update/",import.meta.url);
await mkdir(destination,{recursive:true});
await writeFile(new URL("publish-study-update.sql",destination),`begin;
insert into public.study_content_releases (release,id,kind,data) values
 (${sqlValue(studyAdditionsRelease)},'page-0000','page',${sqlValue(JSON.stringify(page))}::jsonb),
 (${sqlValue(studyAdditionsRelease)},'manifest','manifest',${sqlValue(JSON.stringify(manifest))}::jsonb)
on conflict (release,id) do update set kind=excluded.kind,data=excluded.data;
insert into reviewer_play.question_pool(id,subject,topic,family,answer,choice_set)
 select id,subject,topic,family,answer,choice_set from jsonb_to_recordset(${sqlValue(JSON.stringify(gameRows))}::jsonb)
 as q(id text,subject text,topic text,family text,answer smallint,choice_set text)
 on conflict(id) do update set answer=excluded.answer,choice_set=excluded.choice_set;
select data->>'questionCount' as questions,data->>'digest' as digest
 from public.study_content_releases where release=${sqlValue(studyAdditionsRelease)} and id='manifest';
commit;
`);
console.log(JSON.stringify({release:studyAdditionsRelease,questions:manifest.questionCount,digest:manifest.digest}));
