import {normalizeQuestionStem,shuffled} from "./bank.ts";
import {curriculum,questionsForTopic} from "./curriculum.ts";
import {isDecisionQuestion,questionChoiceKey,questionFamily} from "./question-selection.ts";
import {updateVaultReview} from "./vault-schedule.ts";
import type {State} from "./engine.ts";
import type {Question,Subject} from "./types.ts";

export const soloModes=["rapid","match","type"] as const;
export const roomModes=["duel","ranked","challenge","quiz","code","cup"] as const;
export type SoloMode=typeof soloModes[number];
export type RoomMode=typeof roomModes[number];
export type GameMode=SoloMode|RoomMode;
export type GameRun={
 id:string;
 mode:GameMode;
 startedAt:number;
 finishedAt:number;
 score:number;
 right:number;
 answered:number;
 questionIds:string[];
};
export const gameTitles:Record<GameMode,string>={
 rapid:"Rapid Fire",match:"Match Up",type:"Type It",
 duel:"Live Match",ranked:"Ranked",challenge:"Friend Challenge",quiz:"Quiz Show",code:"Code Blue",cup:"Nightly Cup",
};
export const rapidSeconds=120;
export const rapidQuestionLimit=48;
export const matchBoardSize=4;
export const matchBoards=3;
export const typeQuestionCount=10;

export function isGameMode(value:unknown):value is GameMode{
 return [...soloModes,...roomModes].includes(value as GameMode);
}

export function parseRoomCode(value:string,origin:string){
 const input=value.trim();
 const code=input.replace(/\s+/g,"");
 if(/^[a-f0-9]{10}$/i.test(code))return code.toUpperCase();
 try{
  const link=new URL(input,origin);
  const match=/^\/play\/room\/([a-f0-9]{10})\/?$/i.exec(link.pathname);
  return link.origin===origin&&match?match[1].toUpperCase():null;
 }catch{return null;}
}

export function normalizeGameAnswer(value:string){
 return value.normalize("NFKC").toLocaleLowerCase("en").trim().replace(/[\s-]+/g," ").replace(/[.!?]$/,"");
}

export function checkTypedAnswer(value:string,answer:string){
 const expected=normalizeGameAnswer(answer);
 const acronym=answer.match(/\(([A-Z0-9]{2,8})\)\s*$/);
 const withoutAcronym=acronym?normalizeGameAnswer(answer.slice(0,acronym.index)):expected;
 const typed=normalizeGameAnswer(value);
 return !!typed&&(typed===expected||typed===withoutAcronym||!!acronym&&typed===normalizeGameAnswer(acronym[1]));
}

function recallChoices(question:Question){return question.recall?.choices??question.options.map(option=>option.text);}
export function recallAnswer(question:Question){return question.recall?.choices[question.correctIndex]??question.options[question.correctIndex].text;}
export function isRecallCard(question:Question){
 return question.format==="concept"&&recallChoices(question).every(text=>text.trim().length<=64)
  &&recallAnswer(question).trim().split(/\s+/).length<=5;
}

export function gamePrompt(question:Question){
 return question.recall?.prompt??(isRecallCard(question)?question.stem.split("\n\n").at(-1)||question.stem:question.stem);
}

export function prepareSoloRound(
 bank:Question[], mode:SoloMode, subject:Subject|"all", topicSlug:string, seed:number, history:readonly GameRun[],
){
 const topic=curriculum.find(item=>item.slug===topicSlug);
 const target=mode==="rapid"?rapidQuestionLimit:mode==="match"?matchBoardSize*matchBoards:typeQuestionCount;
 const chosen:Question[]=[];
 const usedIds=new Set<string>(),usedStems=new Set<string>(),usedFamilies=new Set<string>(),usedAnswers=new Set<string>(),usedChoices=new Set<string>();
 const recent=new Set(history.filter(run=>run.mode===mode).slice(-8).flatMap(run=>run.questionIds));
 const eligible=(q:Question)=>!q.retired&&(mode==="rapid"?isDecisionQuestion(q):isRecallCard(q));
 const topics=topic?questionsForTopic(topic,bank):[];
 const subjectKey=topic?.subject??subject;
 const broader=subjectKey==="all"?bank:bank.filter(q=>q.subject===subjectKey);
 function add(items:Question[],offset:number){
  const options=shuffled(items.filter(eligible),seed+offset).sort((a,b)=>Number(recent.has(a.id))-Number(recent.has(b.id)));
  for(const q of options){
   if(chosen.length===target)break;
   const stem=normalizeQuestionStem(mode==="rapid"?q.stem:gamePrompt(q)),family=questionFamily(q),answer=normalizeGameAnswer(recallAnswer(q));
   if(usedIds.has(q.id)||usedStems.has(stem)||(mode==="rapid"?usedFamilies.has(family):usedAnswers.has(answer)))continue;
   const choices=mode==="rapid"?questionChoiceKey(q):"";
   if(mode==="rapid"&&(!choices||usedChoices.has(choices)))continue;
   if(mode==="match"&&!matchDistractors([...chosen.slice(chosen.length-chosen.length%matchBoardSize),q]))continue;
   chosen.push(q);
   usedIds.add(q.id);usedStems.add(stem);usedFamilies.add(family);usedAnswers.add(answer);
   if(choices)usedChoices.add(choices);
  }
 }
 add(topics,0);
 const topicCount=chosen.length;
 add(broader,1);
 return {questions:chosen,topicCount,supplemented:!!topic&&chosen.length>topicCount};
}

function matchDistractors(board:Question[]){
 const used=new Set(board.map(q=>normalizeGameAnswer(recallAnswer(q))));
 const labels:string[]=[];
 function find(index:number):boolean{
  if(index===board.length)return true;
  for(const text of recallChoices(board[index])){
   const key=normalizeGameAnswer(text);
   if(used.has(key))continue;
   used.add(key);labels.push(text);
   if(find(index+1))return true;
   used.delete(key);labels.pop();
  }
  return false;
 }
 return find(0)?labels:undefined;
}

export function matchTiles(board:Question[],seed:number){
 const correct=board.map(q=>({id:q.id+":key",label:recallAnswer(q),questionId:q.id}));
 const distractors=(matchDistractors(board)??[]).map((label,index)=>({id:board[index].id+":extra",label,questionId:""}));
 return shuffled([...correct,...distractors],seed);
}

export function rapidResult(correct:boolean,streak:number,deadline:number,now:number){
 const nextStreak=correct?streak+1:0;
 const multiplier=1+Math.floor(nextStreak/3);
 return {streak:nextStreak,multiplier,score:correct?100*multiplier:0,
  deadline:Math.max(now,deadline+(correct?10000:-10000))};
}

export function recordGameRun(state:State,run:GameRun,misses:readonly string[],saveMisses:boolean):State{
 if(!run.answered||state.gameRuns?.some(item=>item.id===run.id))return state;
 let next:State={...state,gameRuns:[...(state.gameRuns||[]),run]};
 if(saveMisses)for(const id of new Set(misses))next=updateVaultReview(next,id,false,run.finishedAt);
 return next;
}

export function validateGameRuns(raw:unknown,questionIds:Set<string>):GameRun[]{
 if(!Array.isArray(raw))return [];
 const ids=new Set<string>();
 return raw.flatMap(item=>{
  if(!item||typeof item.id!=="string"||item.id.length>80||ids.has(item.id)||!isGameMode(item.mode)
   ||!Number.isFinite(item.startedAt)||!Number.isFinite(item.finishedAt)||item.finishedAt<item.startedAt
   ||!Number.isInteger(item.score)||item.score<0||!Number.isInteger(item.right)||!Number.isInteger(item.answered)
   ||item.right<0||item.answered<1||item.right>item.answered||item.answered>rapidQuestionLimit
   ||!Array.isArray(item.questionIds)||item.questionIds.length>rapidQuestionLimit)return [];
  ids.add(item.id);
  const used=[...new Set(item.questionIds.filter((id:unknown)=>typeof id==="string"&&questionIds.has(id as string)))] as string[];
  return [{id:item.id,mode:item.mode,startedAt:item.startedAt,finishedAt:item.finishedAt,
   score:item.score,right:item.right,answered:item.answered,questionIds:used}];
 });
}
