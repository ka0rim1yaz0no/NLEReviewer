import names from './study-reference-labels.json' with {type:'json'};
const labels:Record<string,string>=names;

export function referenceLabel(url:string,topic?:string):string{
 const title=labels[url];
 if(title)return title;
 if(topic?.trim())return topic.trim();
 try{return new URL(url).hostname.replace(/^www\./,'');}catch{return 'Source reference';}
}
