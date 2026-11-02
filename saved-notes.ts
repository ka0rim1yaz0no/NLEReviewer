import { findCurriculumTopic } from "./curriculum.ts";
import { subjects } from "./bank.ts";
import type { Question, Subject } from "./types.ts";

export function savedTopicNotes(notes:Record<string,string>,bank:readonly Question[]){
  const questionIds=new Set(bank.map(q=>q.id));
  return Object.entries(notes).flatMap(([key,text])=>{
    if(!text.trim()||questionIds.has(key))return [];
    if(key.startsWith("catalog:")){
      const topic=findCurriculumTopic(key.slice(8));
      return topic?[{key,text,title:topic.name,subject:topic.subject,to:`/resources/read?topic=${encodeURIComponent(topic.subject+":"+topic.slug)}`}]:[];
    }
    if(key.startsWith("sheet:")){
      const value=key.slice(6),split=value.indexOf(":"),subject=value.slice(0,split),title=value.slice(split+1);
      return title&&subjects.some(s=>s.id===subject)?[{key,text,title,subject:subject as Subject,to:`/resources/read?topic=${encodeURIComponent(value)}`}]:[];
    }
    return [];
  });
}
