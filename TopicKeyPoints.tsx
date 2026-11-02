import type { Question } from "./types";
import { useState } from "react";

export function TopicKeyPoints({questions}:{questions:Question[]}){
  const points=[...new Map(questions.map(q=>[q.keyPoint||q.rationale,q])).values()];
  const [visible,setVisible]=useState(20);
  return <section className="topic-key-points">
    <h2>Key points to review</h2>
    <p className="fine-print">{points.length} review points · showing {Math.min(visible,points.length)}</p>
    {points.slice(0,visible).map(q=><div key={q.id} className="key-point">
      <p>{q.keyPoint||q.rationale}</p>{q.collection==="supplemental"&&<small>Supplemental source explanation · independent clinical review needed</small>}
      {q.source&&<a href={q.source} target="_blank" rel="noreferrer">Read the source reference</a>}
    </div>)}
    {visible<points.length&&<button className="btn" onClick={()=>setVisible(n=>n+20)}>Show 20 more review points</button>}
    <p className="fine-print">These are short review points from the available questions. Use the linked references for the full topic.</p>
  </section>;
}
