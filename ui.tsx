import { useEffect, useId, useRef } from "react";
import type { AriaAttributes, ReactNode, Ref, RefObject } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useApp } from "./store";
type LinkProps={
 to:string;
 children:ReactNode;
 className?:string;
 title?:string;
 label?:string;
 current?:AriaAttributes["aria-current"];
 onNavigate?:()=>void;
};
export function Link({to,children,className="",title,label,current,onNavigate}:LinkProps){
 const {navigate}=useApp();
 return <a href={to} className={className} title={title} aria-label={label} aria-current={current} onClick={event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  navigate(to);
  onNavigate?.();
 }}>{children}</a>;
}
export function Heading({title,description,action}:{title:string;description?:string;action?:ReactNode}) {return <div className="page-heading"><div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>;}
export function Card({children,className="",ref,tabIndex}:{children:ReactNode;className?:string;ref?:Ref<HTMLElement>;tabIndex?:number}) {return <section className={`card ${className}`} ref={ref} tabIndex={tabIndex}>{children}</section>;}
export function Progress({value,max=100,label}:{value:number;max?:number;label?:string}){
 const total=Math.max(1,max);
 const completed=Math.min(total,Math.max(0,value));
 return <div className="progress" role="progressbar" aria-label={label||"Progress"} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total}>
  <span style={{width:`${completed/total*100}%`}}/>
 </div>;
}
export function Empty({icon, title,description,action}:{icon?:ReactNode;title:string;description:string;action?:ReactNode}) {return <div className="empty">{icon&&<span className="empty-icon">{icon}</span>}<h3>{title}</h3><p>{description}</p>{action}</div>;}
export function SearchBox({value,onChange,placeholder="Search topics"}:{value:string;onChange:(s:string)=>void;placeholder?:string}){
 const input=useRef<HTMLInputElement>(null);
 return <div className="search">
  <Search size={17} aria-hidden="true"/>
  <input ref={input} type="search" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>
  {value&&<button type="button" className="icon-btn" aria-label="Clear search" onClick={()=>{onChange("");input.current?.focus();}}><X size={17}/></button>}
 </div>;
}
export function TextLink({to,children}:{to:string;children:ReactNode}) {return <Link to={to} className="text-link">{children}<ArrowRight size={15}/></Link>;}
export function RowLink({to,title,description,icon}:{to:string;title:string;description?:string;icon?:ReactNode}) {return <Link to={to} className="row-link">{icon&&<span className="tile-icon">{icon}</span>}<div><strong>{title}</strong>{description&&<small>{description}</small>}</div><ChevronRight size={17}/></Link>;}
export function Pagination({page,total,pageSize=10,onChange,focusTarget}:{
 page:number;total:number;pageSize?:number;onChange:(page:number)=>void;focusTarget:RefObject<HTMLElement|null>;
}){
 const focusAfterChange=useRef(false);
 useEffect(()=>{
  if(!focusAfterChange.current)return;
  focusAfterChange.current=false;
  focusTarget.current?.focus({preventScroll:true});
  focusTarget.current?.scrollIntoView({block:"start",behavior:"instant"});
 },[page,focusTarget]);
 function change(next:number){
  focusAfterChange.current=true;
  onChange(next);
 }
 if(total<=pageSize)return null;
 return <nav className="pagination" aria-label="Pages">
  <button type="button" className="btn small" disabled={page===0} onClick={()=>change(page-1)}><ChevronLeft size={15}/>Previous</button>
  <small role="status">{page*pageSize+1}–{Math.min(total,(page+1)*pageSize)} of {total}</small>
  <button type="button" className="btn small" disabled={(page+1)*pageSize>=total} onClick={()=>change(page+1)}>Next<ChevronRight size={15}/></button>
 </nav>;
}
export function Modal({title,onClose,children,drawer=false}:{title:string;onClose:()=>void;children:ReactNode;drawer?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 const heading=useId();
 useEffect(()=>{
  const dialog=ref.current;
  if(!dialog)return;
  const previous=document.activeElement;
  const overflow=document.body.style.overflow;
  dialog.showModal();
  document.body.style.overflow="hidden";
  return()=>{
   dialog.close();
   document.body.style.overflow=overflow;
   if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});
  };
 },[]);
 return <dialog ref={ref} className={drawer?"modal study-drawer":"modal"} aria-modal="true" aria-labelledby={heading} onCancel={event=>{
  event.preventDefault();
  onClose();
 }} onClick={event=>{
  if(event.target!==event.currentTarget)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)onClose();
 }}>
  <div className="section-head"><h2 id={heading}>{title}</h2><button type="button" aria-label={drawer?"Close menu":"Close dialog"} className="icon-btn" onClick={onClose}><X size={22}/></button></div>
  {children}
 </dialog>;
}
export { letters } from "./choice-order";
