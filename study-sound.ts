export function playStudyTone(frequency:number,duration=.15){
 if(typeof AudioContext==="undefined")return;
 try{
  const audio=new AudioContext(),tone=audio.createOscillator(),gain=audio.createGain();
  tone.frequency.value=frequency;
  gain.gain.setValueAtTime(.065,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
  tone.connect(gain);gain.connect(audio.destination);
  tone.onended=()=>{void audio.close().catch(()=>{});};
  tone.start();tone.stop(audio.currentTime+duration);
  if(audio.state==="suspended")void audio.resume().catch(()=>audio.close().catch(()=>{}));
 }catch{/* Sound is optional. */}
}
