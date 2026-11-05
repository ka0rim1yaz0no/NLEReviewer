import corrections from './repetition-corrections.json' with {type:'json'};
import retirements from './repetition-retirements.json' with {type:'json'};
import type {Question} from './types.ts';
type Patch={id:string;fields:{option?:number;field:string;from:string;to:string}[]};
const byId=new Map((corrections.patches as Patch[]).map(p=>[p.id,p.fields]));
const retired=new Set(retirements.map(r=>r.id));
function change(q:Question,restore:boolean):Question{
 const fields=byId.get(q.id);
 if(!fields&&!retired.has(q.id))return q;
 const copy={...q,options:q.options.map(o=>({...o}))};
 for(const p of fields||[]){
  if(p.option===undefined){
   if(!['stem','rationale','keyPoint','source'].includes(p.field))throw Error('Invalid review field');
   const field=p.field as 'stem'|'rationale'|'keyPoint'|'source';
   if(restore&&copy[field]===p.from)continue;
   if(copy[field] !== (restore?p.to:p.from))throw Error(`Review patch no longer matches ${q.id} ${field}`);
   copy[field]=restore?p.from:p.to;
  }else{
   if(!Number.isInteger(p.option)||p.option<0||p.option>3||!['rationale','source'].includes(p.field))throw Error('Invalid review option field');
   const o=copy.options[p.option],field=p.field as 'rationale'|'source';
   if(restore&&o[field]===p.from)continue;
   if(o[field] !== (restore?p.to:p.from))throw Error(`Review patch no longer matches ${q.id} choice ${p.option}`);
   o[field]=restore?p.from:p.to;
  }
 }
 if(retired.has(q.id)){if(restore)delete copy.retired;else copy.retired=true;}
 return copy;
}
export const applyRepetitionReview=(questions:Question[])=>questions.map(q=>change(q,false));
export const restoreRepetitionReview=(questions:Question[])=>questions.map(q=>change(q,true));
