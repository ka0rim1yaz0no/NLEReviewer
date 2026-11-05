import type {Question} from './types.ts';
// Restore separators lost between lines of source tables. No words or answer
// positions change, and the immutable source record remains untouched.
const labels:Record<string,string>={
 'Tricyclic AntidepressantsAmitriptyline Hydrochloride':'Tricyclic Antidepressants; Amitriptyline Hydrochloride',
 'Antiparkinson’s AgentCarbidopa/Levodopa':'Antiparkinson’s Agent; Carbidopa/Levodopa',
 'Dopamine AgonistsBromocriptine MesylatePergolideRopinirole HydrochloridePramipexole':'Dopamine Agonists; Bromocriptine Mesylate; Pergolide; Ropinirole Hydrochloride; Pramipexole',
 'Catechol-O-Methyltransferase InhibitorsEntacaponeTolcapone':'Catechol-O-Methyltransferase Inhibitors; Entacapone; Tolcapone',
 'Monoamine Oxidase Inhibitors SelegilineRasagilineZydis Selegiline HCL':'Monoamine Oxidase Inhibitors; Selegiline; Rasagiline; Zydis Selegiline HCL',
 'Sterile gauzeKerlix':'Sterile gauze; Kerlix',
 'Antiviral TherapyAmantadine Hydrochloride':'Antiviral Therapy; Amantadine Hydrochloride',
 'Anticholinergic TherapyTrihexyphenidyl HydrochlorideBenztropine Mesylate':'Anticholinergic Therapy; Trihexyphenidyl Hydrochloride; Benztropine Mesylate'
};
export function formatClinicalLabel(text:string){for(const [raw,display] of Object.entries(labels))text=text.replaceAll(raw,display);return text;}
export function formatQuestionForDisplay(question:Question):Question{
 if(question.format!=='comparison')return question;
 return {...question,stem:formatClinicalLabel(question.stem),rationale:formatClinicalLabel(question.rationale),keyPoint:formatClinicalLabel(question.keyPoint),options:question.options.map(option=>({...option,text:formatClinicalLabel(option.text),rationale:formatClinicalLabel(option.rationale)}))};
}
