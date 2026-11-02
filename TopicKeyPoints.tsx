import type { Question } from "./types";

export function TopicKeyPoints({questions}:{questions:Question[]}){
  const points=[...new Map(questions.map(q=>[q.keyPoint||q.rationale,q])).values()];
  return <section className="topic-key-points">
    <h2>Key points to review</h2>
    {points.map(q=><div key={q.id} className="key-point">
      <p>{q.keyPoint||q.rationale}</p>
      {q.source&&<a href={q.source} target="_blank" rel="noreferrer">Read the source reference</a>}
    </div>)}
    <p className="fine-print">These are short review points from the available questions. Use the linked references for the full topic.</p>
  </section>;
}
