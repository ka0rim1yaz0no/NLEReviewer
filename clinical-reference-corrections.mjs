// Source corrections applied after older question releases have been generated.
// Keep the original answer slots and reference IDs for saved sessions.
const ecg='https://pmc.ncbi.nlm.nih.gov/articles/PMC5137383/';
const obstetricDefinitions='https://www.acog.org/practice-management/health-it-and-clinical-informatics/revitalize-obstetrics-data-definitions';
const severeBloodPressure='https://www.acog.org/womens-health/faqs/preeclampsia-and-high-blood-pressure-during-pregnancy';
const pushing='https://www.who.int/publications/i/item/9789241550215';
const ventricularArrhythmias='https://www.ahajournals.org/doi/pdf/10.1161/CIR.0000000000000548?download=true';
const supraventricularArrhythmias='https://academic.oup.com/eurheartj/article/41/5/655/5556821';
const adultResuscitation='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/';

export const referenceCorrections=[
 {id:'ORN-1ba90544d570f48f5993',term:['Sinoatrial blocks','Sinoatrial exit block'],
  from:'Failed conduction of the impulses beyond the SA node, resulting in prolonger PR intervals or dropped P waves on the ECG',
  to:'A sinus impulse fails to reach the atria, producing a missing P wave and a pause. In second-degree type II, the pause is a multiple of the usual P–P interval',source:ecg},
 {id:'ORN-aa4236443e4a604cb645',term:['Premature preterm rupture of membranes','Preterm prelabor rupture of membranes (PPROM)'],
  from:'Rupture of the amniotic sac before 37 weeks of pregnancy.',
  to:'Spontaneous rupture of the membranes before labor begins and before 37 completed weeks of pregnancy.',source:obstetricDefinitions},
 {id:'ORN-b5953652c1af9ccf5bdd',
  from:'Blood pressure levels equal to or greater than 160/110 mmHg, requiring immediate medical attention during pregnancy.',
  to:'During pregnancy, a systolic blood pressure of at least 160 mmHg or a diastolic blood pressure of at least 110 mmHg is severe-range. Either threshold warrants prompt assessment.',source:severeBloodPressure},
 {id:'ORN-aa871c5761b1462633f6',
  from:'The client inhales deeply and then holds their breath while bearing down and pushing and counting to ten. (, )',
  to:'During a contraction, the client holds their breath while bearing down. This describes the technique. Support the client’s own urge to push during the expulsive phase.',source:pushing},
 {id:'ORN-c2eb915e71d29845abe3',
  from:'The client inhales deeply and then slowly exhales as they bear down to push. (, )',
  to:'The client exhales while bearing down, keeping the glottis open. The nurse supports the client’s own urge to push during the expulsive phase.',source:pushing},
 {id:'ORN-3cd72f26ec0ac8db278a',
  from:'Ventricular rate over 120 beats per minute, causing rapidly worsening cardiac output.',
  to:'Three or more consecutive beats originate in the ventricles at a rate above 100 beats per minute. Sustained episodes can reduce cardiac output.',source:ventricularArrhythmias},
 {id:'ORN-3df561619ad6c56bdbd7',
  from:'Wide QRS complexes are the only components that are measurable.; P and T waves are not visible.',
  to:'A rapid wide-complex rhythm may show AV dissociation, capture beats, or fusion beats. These findings support ventricular origin when present.',source:supraventricularArrhythmias},
 {id:'ORN-652977ea1f6c6db10b67',
  from:'Narrow-complex tachycardias with a QRS interval of 0.1 second or less. P waves cannot be identified due to the fast ventricular rate.',
  to:'The usual narrow-complex pattern has a QRS duration of 120 milliseconds or less. P waves may be visible or hidden, depending on the mechanism.',source:supraventricularArrhythmias},
 {id:'ORN-9042387401aec2a9881f',
  from:'The impulse to the ventricle is fast with ventricular rates often over 160 beats per minute.',
  to:'The tachycardia involves tissue at or above the His bundle. It can originate in atrial tissue or involve the AV node in a re-entry circuit.',source:supraventricularArrhythmias},
 {id:'ORN-c59f7d8c21bce49c52a2',
  from:'There is electrical activity, but it is not strong enough to cause a contraction or a pulse.',
  to:'The monitor shows electrical activity with no palpable pulse or effective circulation. The ECG alone cannot establish a pulse.',source:adultResuscitation},
];

export function reviseReferenceText(value){
 let text=value;
 for(const {from,to,term} of referenceCorrections){
  text=text.replaceAll(from,to);
  if(term)text=text.replaceAll(term[0],term[1]);
 }
 return text.replace(/\s*\[\s*\]/g,'').replace(/\s*\(\s*,\s*\)/g,'')
  .replace(/Ventricular Tachycardia \(V-tach(?!\))/g,'Ventricular Tachycardia (V-tach)')
  .replace(/\.; (?=[A-Z])/g,'. ')
  .replace(/(?<!\.)\.\.(?!\.)/g,'.');
}

const definitionById=new Map(referenceCorrections.map(correction=>[correction.id,correction]));
const relatedDefinition=(choice)=>referenceCorrections.find(({from,term})=>choice.includes(from)||term&&choice.includes(term[0]));

function reviseOption(option){
 const {text,rationale}=option;
 const nextText=reviseReferenceText(text),nextRationale=reviseReferenceText(rationale);
 const refs=option.rationaleParts;
 const lines=text.split('\n'),reasons=rationale.split('\n\n');
 const parts=refs?.map((part,i)=>{
  const correction=relatedDefinition(lines[i]+'\n'+reasons[i].split(' This finding points to ')[0]);
  return correction?{...part,source:correction.source}:part;
 });
 const correction=!refs&&(definitionById.get(option.referenceId)||relatedDefinition(text));
 const source=correction?.source||option.source;
 if(nextText===text&&nextRationale===rationale&&source===option.source&&(!parts||parts.every((part,i)=>part===refs[i])))return option;
 return {...option,text:nextText,rationale:nextRationale,...source&&{source},...parts&&{rationaleParts:parts}};
}

export function applyClinicalReferenceCorrections(question){
 if(!question.conceptId||question.retired)return question;
 const tableKey=definitionById.get(question.conceptId);
 const cue=relatedDefinition(question.stem);
 const tablePrompt=question.stem.includes('which entry under');
 const options=question.options.map(original=>{
  const option=reviseOption(original);
  if(!tablePrompt||!tableKey&&!cue&&!definitionById.has(original.referenceId))return option;
  const contextSource=cue?.source||question.source;
  const rationale=option.rationale.includes(option.text)?option.rationale:option.text+' '+option.rationale;
  return {...option,rationale,contextSource};
 });
 const stem=reviseReferenceText(question.stem),keyPoint=reviseReferenceText(question.keyPoint);
 const source=tableKey?.source||question.source;
 const recall=question.recall&&{prompt:reviseReferenceText(question.recall.prompt),choices:question.recall.choices.map(reviseReferenceText)};
 const recallChanged=recall&&(recall.prompt!==question.recall.prompt||recall.choices.some((text,i)=>text!==question.recall.choices[i]));
 if(!recallChanged&&stem===question.stem&&keyPoint===question.keyPoint&&source===question.source&&options.every((option,i)=>option===question.options[i]))return question;
 return {...question,options,stem,keyPoint,source,rationale:options[question.correctIndex].rationale,...recall&&{recall},questionRevision:8};
}
