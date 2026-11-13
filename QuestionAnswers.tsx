import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { letters } from "./choice-order";
import { choiceExplanationLabel, displayRationale, distinctStudyNote } from "./rationale-display";
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

export function ChoiceRationale({ q, index, className, letter }: {
  q: Question; index: number; className?: string; letter?: string;
}) {
  const option = q.options[index];
  return <p className={className}>
    <span className="choice-rationale-label">{letter && `${letter}. `}{choiceExplanationLabel(q, index)}</span>
    {displayRationale(option.rationale)}
    <OptionReference option={option.source ? option : { ...option, source: q.source }} />
  </p>;
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
            {(correct || chosen) && <div className="review-option-status">
              {correct && <span>Correct answer</span>}
              {chosen && <span>Your answer</span>}
            </div>}
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
