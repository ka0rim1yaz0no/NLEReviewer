export function throwIfAborted(signal?:AbortSignal){if(signal?.aborted)throw new DOMException('Study content loading was cancelled.','AbortError');}
export function timedRequest(parent:AbortSignal|undefined,milliseconds:number){
 const controller=new AbortController(),abort=()=>controller.abort();
 parent?.addEventListener('abort',abort,{once:true});if(parent?.aborted)abort();
 const timer=setTimeout(abort,milliseconds);
 return {signal:controller.signal,dispose(){clearTimeout(timer);parent?.removeEventListener('abort',abort);}};
}
