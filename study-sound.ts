type Tone=readonly [frequency:number,duration:number];
const cues={
 correct:[[523.25,.10],[659.25,.13]],
 incorrect:[[349.23,.11],[293.66,.13]],
 reveal:[[440,.08],[554.37,.11]],
} as const satisfies Record<string,readonly Tone[]>;
let audio:AudioContext|undefined;

export function studySoundsEnabled(preferences:{studySound?:boolean;flashcardSound?:boolean}){
 return preferences.studySound??preferences.flashcardSound??false;
}

function playTones(notes:readonly Tone[]){
 if(typeof window==="undefined")return;
 const Audio=window.AudioContext??(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Audio)return;
 try{
  if(!audio||audio.state==="closed")audio=new Audio();
  const context=audio;
  const start=()=>{
   let when=context.currentTime;
   for(const [frequency,duration] of notes){
    const tone=context.createOscillator(),gain=context.createGain();
    tone.type="sine";
    tone.frequency.value=frequency;
    gain.gain.setValueAtTime(.001,when);
    gain.gain.exponentialRampToValueAtTime(.055,when+.012);
    gain.gain.exponentialRampToValueAtTime(.001,when+duration);
    tone.connect(gain);
    gain.connect(context.destination);
    tone.onended=()=>{tone.disconnect();gain.disconnect();};
    tone.start(when);
    tone.stop(when+duration);
    when+=duration*.8;
   }
  };
  if(context.state==="running")start();
  else void context.resume().then(start).catch(()=>{});
 }catch{/* A blocked audio output never interrupts study. */}
}

export function playStudyTone(frequency:number,duration=.15){playTones([[frequency,duration]]);}
export function playStudyCue(cue:keyof typeof cues){playTones(cues[cue]);}
