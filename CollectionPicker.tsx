import { collectionCounts } from "./collections";
import type { Collection } from "./collections";
import type { Question } from "./types";
export function CollectionPicker({bank,value,onChange}:{bank:Question[];value:Collection;onChange:(value:Collection)=>void}){
 const counts=collectionCounts(bank);
 return <div className="collection-picker"><label>Question collection<select aria-label="Question collection" value={value} onChange={e=>onChange(e.target.value as Collection)}><option value="all">All collections · {counts.all.toLocaleString()}</option><option value="nursing">Original nursing & personal imports · {counts.nursing.toLocaleString()}</option><option value="supplemental">Source-checked additions · {counts.supplemental.toLocaleString()}</option></select></label>{value!=="nursing"&&counts.supplemental>0&&<p className="fine-print">Includes two source-checked corrections with per-choice explanations and primary references. These are not PNLE or BoardPal questions. Independent clinical review is still needed.</p>}</div>;
}
