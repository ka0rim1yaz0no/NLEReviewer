import {Component,lazy,Suspense,useCallback,useEffect,useRef,useState} from "react";
import type {ReactNode} from "react";
import poster from "./study-notebook-poster.webp";

const NotebookScene=lazy(()=>import("./NotebookScene"));

class SceneFallback extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onFailure();}
 render(){return this.state.failed?null:this.props.children;}
}

/** The decorative poster is always available; WebGL is an optional desktop enhancement. */
export function StudyNotebook({className}:{className?:string}){
 const surface=useRef<HTMLDivElement>(null),[enabled,setEnabled]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const show=useCallback(()=>setReady(true),[]),fallback=useCallback(()=>{setFailed(true);setReady(false);},[]);
 useEffect(()=>{
  const media=matchMedia("(min-width: 800px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  let cancel:()=>void=()=>{};
  const update=()=>{
   cancel();setEnabled(false);setReady(false);
   const network=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
   if(!media.matches||network?.saveData||!surface.current||failed)return;
   const element=surface.current;
   let cancelIdle:()=>void=()=>{};
   const reveal=()=>{
    if(typeof window.requestIdleCallback==="function"){const id=window.requestIdleCallback(()=>setEnabled(true),{timeout:1200});cancelIdle=()=>window.cancelIdleCallback(id);}
    else{const id=window.setTimeout(()=>setEnabled(true),180);cancelIdle=()=>window.clearTimeout(id);}
   };
   if(typeof IntersectionObserver==="undefined"){reveal();cancel=()=>cancelIdle();return;}
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();reveal();}});
   observer.observe(element);cancel=()=>{observer.disconnect();cancelIdle();};
  };
  update();media.addEventListener("change",update);return()=>{cancel();media.removeEventListener("change",update);};
 },[failed]);
 return <div ref={surface} className={`study-notebook ${className||""}`} data-live={enabled&&ready&&!failed?"true":undefined} aria-hidden="true">
  <span className="notebook-orbit"/><span className="notebook-spark spark-one"/><span className="notebook-spark spark-two"/>
  <img className="notebook-poster" src={poster} width={512} height={512} alt="" decoding="async"/>
  {enabled&&!failed&&<div className="notebook-canvas"><SceneFallback onFailure={fallback}><Suspense fallback={null}><NotebookScene surface={surface} onReady={show} onLost={fallback}/></Suspense></SceneFallback></div>}
 </div>;
}
