import { useId, useState } from "react";
import { Check, ChevronDown, CircleAlert, X } from "lucide-react";
import { letters } from "./choice-order";
import { answerStatus, choiceRationaleParts, displayRationale, distinctStudyNote, rationaleVerdictLabels, unsafeDecision } from "./rationale-display";
import { referenceLabel } from "./study-references";
import type { ReactNode } from "react";
import type { Question, QuestionOption } from "./types";

function OptionReference({ option }: { option: QuestionOption }) {
  const sources = new Set([option.source, option.contextSource, ...(option.additionalSources ?? [])]);
  return <>{[...sources].map(source => {
    if (!source) return null;
    const label = referenceLabel(source);
    const context = source !== option.source && source === option.contextSource;
    return <a key={source} className="option-reference" href={source} target="_blank" rel="noreferrer"
      aria-label={context ? `Read case reference: ${label}` : `Read source: ${label}`}>
      {context ? `Case reference: ${label}` : label}
    </a>;
  })}</>;
}

export function ChoiceStatus({q,index,chosen}:{q:Question;index:number;chosen:boolean}){
  const correct=index===q.correctIndex;
  const unsafe=unsafeDecision(q)&&!q.options[index].rationaleParts;
  const appropriate=unsafe&&!correct;
  const Icon=correct&&unsafe?CircleAlert:correct||appropriate?Check:X;
  return <span className="review-option-status">
    <span className={correct&&unsafe?"choice-incorrect":correct?"choice-key":appropriate?"choice-appropriate":"choice-incorrect"}>
      <Icon size={14} aria-hidden="true"/>{answerStatus(q,index)}
    </span>
    {chosen&&<span>Your answer</span>}
  </span>;
}

export function ChoiceRationale({ q, index, className, letter }: {
  q: Question; index: number; className?: string; letter?: string;
}) {
  const option = q.options[index];
  const parts=choiceRationaleParts(q,index);
  const title=answerStatus(q,index);
  if(!parts.length)return <p className={className}>
    <span className="choice-rationale-label">{letter && `${letter}. `}{title}</span>
    {displayRationale(option.rationale)}
    <OptionReference option={option.source ? option : { ...option, source: q.source }} />
  </p>;
  return <div className={`choice-feedback ${className||""}`}>
    <strong className="choice-rationale-label">{letter && `${letter}. `}{title}</strong>
    <ul className="choice-feedback-parts">
      {parts.map(part=><li key={part.label}>
        <span className={`choice-verdict ${part.verdict}`}>
          {part.verdict==="needs-correction"?<CircleAlert size={14} aria-hidden="true"/>
            :part.verdict==="incorrect"?<X size={14} aria-hidden="true"/>:<Check size={14} aria-hidden="true"/>}
          <strong>{part.label} · {rationaleVerdictLabels[part.verdict]}</strong>
        </span>
        <p>{part.explanation}</p>
        <OptionReference option={{...option,source:part.source,contextSource:part.caseSource,additionalSources:undefined}}/>
      </li>)}
    </ul>
  </div>;
}

export function ReviewAnswers({ q, selected, expanded, onToggle, choiceOrder, children }: {
  q: Question; selected?: number; expanded?: boolean; onToggle?: () => void;
  choiceOrder?: readonly number[]; children?: ReactNode;
}) {
  const [opened, setOpened] = useState(selected !== undefined);
  const explanationsId = useId();
  const open = expanded ?? opened;
  const showKey = open || selected !== undefined;
  const order = choiceOrder ?? q.options.map((_, index) => index);
  const shared = q.rationaleScope === "shared";
  const studyNote = shared ? q.rationale : distinctStudyNote(q);
  const toggleText = selected === undefined ? "answer and explanations" : "explanations";

  return <>
    <ol className="review-options" role="list" aria-label="Answer choices">
      {order.map((index, position) => {
        const correct = showKey && index === q.correctIndex;
        const chosen = index === selected;
        const state = correct ? "correct" : chosen ? "wrong" : undefined;
        return <li key={index} className={state}>
          <span className="option-letter">{letters[position]}</span>
          <div className="review-option-content">
            <strong className="answer-choice-text">{q.options[index].text}</strong>
            {showKey&&<ChoiceStatus q={q} index={index} chosen={chosen}/>}
          </div>
        </li>;
      })}
    </ol>
    <button type="button" className="text-button review-explanation-toggle"
      aria-expanded={open} aria-controls={explanationsId} onClick={onToggle ?? (() => setOpened(!open))}>
      {open ? "Hide" : "Show"} {toggleText}<ChevronDown size={15} aria-hidden="true"/>
    </button>
    <div id={explanationsId} className="review-explanations" hidden={!open}>
      {open && <>
        {!shared && order.map((index, position) => <ChoiceRationale key={index} q={q} index={index} letter={letters[position]} />)}
        {studyNote && <div className="key-point">
          <strong>{shared ? "Source answer explanation" : "Study note"}</strong>
          <p>{studyNote}</p>
        </div>}
        {children}
      </>}
    </div>
  </>;
}
