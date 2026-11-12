import {Volume2,VolumeX} from "lucide-react";
import {playStudyCue,studySoundsEnabled} from "./study-sound";
import {useApp} from "./store";

export function StudySoundToggle({toolbar=false}:{toolbar?:boolean}){
 const {state,update}=useApp();
 const enabled=studySoundsEnabled(state.preferences);
 function toggle(){
  const next=!enabled;
  if(update(current=>({...current,preferences:{...current.preferences,studySound:next}}))&&next)playStudyCue("reveal");
 }
 if(toolbar){
  const Icon=enabled?Volume2:VolumeX;
  return <button type="button" aria-label="Sound effects" aria-pressed={enabled} onClick={toggle}><Icon size={17}/><span>Sound</span></button>;
 }
 return <label className="check-label"><input type="checkbox" checked={enabled} onChange={toggle}/>Sound effects in practice and flashcards</label>;
}
