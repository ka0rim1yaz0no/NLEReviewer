type KeyEvent=Pick<KeyboardEvent,'key'|'ctrlKey'|'altKey'|'metaKey'|'shiftKey'|'defaultPrevented'>;
type Shortcut={kind:'answer';index:number}|{kind:'submit'|'next'|'previous'|'highlight'|'pen'|'scratch'};
export function quizShortcut(event:KeyEvent,context:{interactive:boolean;dialog:boolean;tutor:boolean}):Shortcut|null{
 if(context.dialog||context.interactive||event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return null;
 if(/^[1-4]$/.test(event.key))return {kind:'answer',index:Number(event.key)-1};
 if(event.key==='Enter')return context.tutor?{kind:'submit'}:null;
 const commands:Record<string,Shortcut['kind']>={ArrowRight:'next',ArrowLeft:'previous',h:'highlight',p:'pen',s:'scratch'};
 const kind=commands[event.key]||commands[event.key.toLowerCase()];
 return kind&&kind!=='answer'?{kind}:null;
}
