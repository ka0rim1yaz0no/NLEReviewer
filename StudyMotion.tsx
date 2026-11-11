import {useEffect} from "react";
import type {RefObject} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP,ScrollTrigger);

export default function StudyMotion({scope,route,paused}:{scope:RefObject<HTMLElement|null>;route:string;paused:boolean}){
 useGSAP(()=>{
  const root=scope.current;if(!root)return;
  const media=gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)",()=>{
   const hero=root.querySelector(".welcome,.login-introduction,.page-heading");
   if(hero&&window.scrollY<40)gsap.fromTo(hero,{y:9,opacity:.9},{y:0,opacity:1,duration:.5,ease:"power2.out",clearProps:"transform,opacity"});
   const sections=[...root.querySelectorAll(".home-main > .card,.home-aside > .card,.topic-catalog > .card,.practice-intro,.subject-list > .subject-group,.resource-grid > .card")].slice(0,16);
   for(const section of sections){
    if(section.getBoundingClientRect().top<window.innerHeight*.94)continue;
    gsap.fromTo(section,{y:8,opacity:.91},{y:0,opacity:1,duration:.38,ease:"power2.out",clearProps:"transform,opacity",immediateRender:false,scrollTrigger:{trigger:section,start:"top 96%",once:true}});
   }
   const restore:Array<()=>void>=[];
   const counters=[...root.querySelectorAll<HTMLElement>("[data-study-count]")];
   for(const element of counters){
    const end=Number(element.dataset.studyCount);if(!Number.isFinite(end)||end<2)continue;
    const initial=element.textContent,counter={value:Math.floor(end*.65)};
    gsap.to(counter,{value:end,duration:.65,ease:"power2.out",onUpdate:()=>{
     // React owns the current value when a study attempt changes during the animation.
     if(Number(element.dataset.studyCount)===end)element.textContent=String(Math.round(counter.value));
    }});
    restore.push(()=>{if(Number(element.dataset.studyCount)===end)element.textContent=initial;});
   }
   return()=>restore.forEach(reset=>reset());
  });
  return()=>media.revert();
 },{scope,dependencies:[route],revertOnUpdate:true});

 useEffect(()=>{
  if(paused||!["/dashboard","/topics","/resources"].includes(route))return;
  const media=matchMedia("(min-width: 800px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  let release=()=>{};
  const configure=()=>{
   release();if(!media.matches)return;
   let active=true,destroy=()=>{};release=()=>{active=false;destroy();};
   void import("lenis").then(({default:Lenis})=>{
    if(!active)return;
    const scroll=new Lenis({autoRaf:false,smoothWheel:true,syncTouch:false,lerp:.14,prevent:node=>!!node.closest("[data-lenis-prevent],.modal,.side-menu,textarea,select")});
    const update=()=>ScrollTrigger.update();
    const tick=(seconds:number)=>scroll.raf(seconds*1000);
    scroll.on("scroll",update);gsap.ticker.add(tick);
    destroy=()=>{gsap.ticker.remove(tick);scroll.off("scroll",update);scroll.destroy();};
   }).catch(()=>{/* Native scrolling stays available if the optional chunk cannot load. */});
  };
  configure();media.addEventListener("change",configure);
  return()=>{release();media.removeEventListener("change",configure);};
 },[route,paused]);
 return null;
}
