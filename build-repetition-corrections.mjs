// Authoring-only: bounded, source-reviewed corrections, including historical
// records and every distractor explanation containing the affected statement.
import {readFile,writeFile} from 'node:fs/promises';
import {questions} from './author-bank.ts';
const blood='https://www.nhlbi.nih.gov/health/heart/blood-flow';
const parity='https://www.msdmanuals.com/professional/gynecology-and-obstetrics/approach-to-the-gynecologic-patient/obstetric-and-gynecologic-history';
const rules=[
 ['pulmonary-veins','ORN-99e5fb94c9fae74e381d','Arteries that carry oxygenated blood back to the left atrium.','Veins that return oxygenated blood from the lungs to the left atrium.',blood],
 ['pulmonary-arteries-exclusivity','ORN-a88599917f4d90c99229',' (Note that these are the only arteries in the body that carry deoxygenated blood.)','',blood],
 ['pulmonary-veins-exclusivity','ORN-973796ac5e34e97dc701',' (Note that these are the only veins in the body that carry oxygenated blood.)','',blood],
 ['basic-metabolic-panel','ORN-d79bd949aa73bfb4d7c5','Screen for electrolyte imbalances, liver, and renal functions','Assess electrolytes, blood glucose, and kidney function; a BMP does not include the liver tests added in a CMP','https://medlineplus.gov/lab-tests/basic-metabolic-panel-bmp/'],
 ['trali-overload','ORN-e962fbcce800da527745','Cyanosis, dyspnea, fever, hypoxemia, hypotension, and pulmonary edema that is not cardiac-related (i.e., due to fluid overload).','Acute respiratory distress with hypoxemia and noncardiogenic pulmonary edema after transfusion; fever, cyanosis, and hypotension may occur. Circulatory overload does not explain the pulmonary edema; assess for TACO and other transfusion reactions.','https://professionaleducation.blood.ca/en/transfusion/publications/transfusion-related-acute-lung-injury-trali'],
 ['antacids','ORN-9f80ae71ccbcd16e7ec5','May increase the risk of aspiration during surgery','Neutralize gastric acid. Prescribed antacids may be used before selected procedures to reduce gastric acidity; follow the anesthesia team\'s procedure-specific medication plan rather than a blanket withholding rule','https://www.nice.org.uk/guidance/NG192/chapter/recommendations'],
 ['pustules','ORN-f0aca50314297ca8a12b','Fluid- or pus-filled bumps on the skin, such as acne','Pus-filled bumps on the skin, as may occur with acne','https://medlineplus.gov/ency/article/003234.htm'],
 ['multipara','ORN-07356f2b2a80dcbe99c4','A woman who has given birth to more than one child.','A person with two or more completed pregnancies reaching the gestational threshold used for parity. Multiple infants in one delivery count as one pregnancy, and live birth is not required.',parity],
 ['multiparous','ORN-6a31c205b3e3f899a55a','A woman who has given birth more than once.','A person with two or more completed pregnancies reaching the gestational threshold used for parity. Multiple infants in one delivery count as one pregnancy, and live birth is not required.',parity],
 ['nulliparous','ORN-443de0b0b44f6cf33d4e','A woman who has never given birth to a live baby.','A person who has not completed a pregnancy at or beyond the gestational threshold used for parity; parity does not depend on whether an infant was born alive.',parity],
 ['nulliparous-clients','ORN-d5259691dcb0e7f0e823','Individuals who have never given birth.','People who have not completed a pregnancy at or beyond the gestational threshold used for parity; parity does not depend on whether an infant was born alive.',parity],
 ['primiparity','ORN-3823ab7414e4192a7fd4','The condition of being pregnant for the first time or having given birth to one child.','The condition of having completed one pregnancy at or beyond the gestational threshold used for parity, regardless of the number of infants or whether they were born alive. Being pregnant for the first time describes primigravidity.',parity],
 ['para','ORN-fed2b520ad2b3b604bd0','A term used in obstetrics to indicate the number of live births a woman has had.','The number of completed pregnancies reaching the gestational threshold used for parity, regardless of live birth. A multifetal delivery counts as one qualifying pregnancy.',parity],
 ['semilunar-typo','ORN-a4ae9bf78199e70a9c06','Values that open when blood flows out of the ventricles.','Valves that open when blood flows out of the ventricles.',blood]
].map(([id,questionId,from,to,source])=>({id,questionId,from,to,source}));
// Always regenerate from the pre-review payload, so corrections are reproducible.
const {restoreRepetitionReview}=await import('./repetition-review.ts');
const baseline=restoreRepetitionReview(questions),patches=[];
for(const q of baseline){
 const fields=[];
 for(const field of ['stem','rationale','keyPoint']){
  const from=q[field];let to=from;for(const r of rules)to=to.replaceAll(r.from,r.to);
  if(to!==from)fields.push({field,from,to});
 }
 const own=rules.find(r=>r.questionId===q.id);
 if(own&&q.source!==own.source)fields.push({field:'source',from:q.source,to:own.source});
 q.options.forEach((o,option)=>{
  let to=o.rationale;const used=rules.filter(r=>to.includes(r.from));for(const r of used)to=to.replaceAll(r.from,r.to);
  if(to!==o.rationale){fields.push({option,field:'rationale',from:o.rationale,to});const sources=[...new Set(used.map(r=>r.source))];if(sources.length!==1)throw Error('Review mixed-source explanation '+q.id);if(o.source!==sources[0])fields.push({option,field:'source',from:o.source,to:sources[0]});}
 });
 if(fields.length)patches.push({id:q.id,fields});
}
for(const rule of rules)if(!patches.some(p=>p.id===rule.questionId&&p.fields.some(f=>f.from.includes(rule.from))))throw Error('Unmatched correction '+rule.id);
await writeFile('repetition-corrections.json',JSON.stringify({reviewed:'2026-11-06',rules,patches},null,2)+'\n');
const retirements=JSON.parse(await readFile('repetition-retirements.json','utf8'));
const old=JSON.parse(await readFile('editorial-retirements.json','utf8'));
await writeFile('question-redirects.json',JSON.stringify(Object.fromEntries([...old,...retirements].filter(r=>r.replacedBy).map(r=>[r.id,r.replacedBy])),null,2)+'\n');
console.log(JSON.stringify({rules:rules.length,records:patches.length,fields:patches.reduce((n,p)=>n+p.fields.length,0)}));
