import {Suspense,useEffect,useMemo,useRef} from "react";
import type {RefObject} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {useGLTF} from "@react-three/drei";
import {MathUtils} from "three";
import type {Group} from "three";
import modelUrl from "./study-notebook.glb?url";

type SceneProps={surface:RefObject<HTMLDivElement|null>;onReady:()=>void;onLost:()=>void};

function Notebook({surface,onReady,onLost}:SceneProps){
 const {scene}=useGLTF(modelUrl);
 const model=useMemo(()=>scene.clone(true),[scene]);
 const turn=useRef<Group>(null),target=useRef({x:0,y:0}),start=useRef(0);
 const invalidate=useThree(s=>s.invalidate),renderer=useThree(s=>s.gl);
 useEffect(()=>{
  const element=surface.current?.closest(".welcome,.login-introduction");
  const track=(event:Event)=>{
   const pointer=event as PointerEvent;
   if(pointer.pointerType!=="mouse"||!element)return;
   const rect=element.getBoundingClientRect();
   target.current={x:MathUtils.clamp((pointer.clientY-rect.top)/rect.height-.5,-.5,.5)*.20,y:MathUtils.clamp((pointer.clientX-rect.left)/rect.width-.5,-.5,.5)*.27};
   invalidate();
  };
  const reset=()=>{target.current={x:0,y:0};invalidate();};
  const lost=(event:Event)=>{event.preventDefault();onLost();};
  element?.addEventListener("pointermove",track,{passive:true});
  element?.addEventListener("pointerleave",reset);
  renderer.domElement.addEventListener("webglcontextlost",lost);
  start.current=performance.now();invalidate();onReady();
  return()=>{element?.removeEventListener("pointermove",track);element?.removeEventListener("pointerleave",reset);renderer.domElement.removeEventListener("webglcontextlost",lost);};
 },[invalidate,onReady,onLost,renderer,surface]);
 useFrame((_,delta)=>{
  const group=turn.current;
  if(!group)return;
  const elapsed=Math.max(0,(performance.now()-start.current)/1000);
  const drift=elapsed<1.65?Math.sin(elapsed/1.65*Math.PI)*.13:0;
  const x=target.current.x,y=target.current.y+drift;
  group.rotation.x=MathUtils.damp(group.rotation.x,x,8,Math.min(delta,.05));
  group.rotation.y=MathUtils.damp(group.rotation.y,y,8,Math.min(delta,.05));
  if(elapsed<1.65||Math.abs(group.rotation.x-x)+Math.abs(group.rotation.y-y)>.001)invalidate();
 });
 return <group ref={turn}><group rotation={[1.06,-.15,-.16]}><primitive object={model}/></group></group>;
}

function Framing(){
 const camera=useThree(s=>s.camera),height=useThree(s=>s.size.height),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{camera.zoom=Math.max(1,height/3.86);camera.updateProjectionMatrix();invalidate();},[camera,height,invalidate]);
 return null;
}

export default function NotebookScene(props:SceneProps){
 return <Canvas orthographic camera={{position:[0,0,7],near:.1,far:20}} dpr={[1,1.35]} frameloop="demand"
  gl={{alpha:true,antialias:true,powerPreference:"low-power"}} fallback={null}>
  <Framing/>
  <ambientLight intensity={1.65}/><directionalLight color="#fff3ee" position={[-3,5,6]} intensity={3}/>
  <directionalLight color="#fce5f0" position={[3,-1,3]} intensity={1.35}/>
  <Suspense fallback={null}><Notebook {...props}/></Suspense>
 </Canvas>;
}
