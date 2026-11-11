import { useId, useState } from "react";
import { Layers3 } from "lucide-react";
import { normalizeQuestionStem } from "./bank";
import { displayRationale } from "./rationale-display";
import { useApp } from "./store";
import type { Question } from "./types";
import { Modal } from "./ui";

export function QuestionFlashcard({ question }: { question: Question }) {
  const { state, update, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [deck, setDeck] = useState("Practice review");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState("");
  const deckList = useId();
  const decks = [...new Set(state.customCards.map(card => card.deck))];

  function show() {
    setFront(question.stem);
    setBack(`${question.options[question.correctIndex].text}\n\n${displayRationale(question.rationale)}`);
    setError("");
    setOpen(true);
  }

  function save() {
    const card = { id: `custom-${crypto.randomUUID()}`, deck: deck.trim(), front: front.trim(), back: back.trim() };
    if (!card.deck || !card.front || !card.back) return;
    const title = normalizeQuestionStem(card.front);
    let duplicate = false;
    const saved = update(current => {
      duplicate = current.customCards.some(item => item.deck.toLowerCase() === card.deck.toLowerCase() && normalizeQuestionStem(item.front) === title);
      return duplicate ? current : { ...current, customCards: [...current.customCards, card] };
    });
    if (!saved) { setError("Reconnect to your study profile and try again."); return; }
    if (duplicate) { setError("This deck already has a card with that prompt."); return; }
    setOpen(false);
    toast(`Flashcard saved in ${card.deck}.`);
  }

  return <>
    <button type="button" className="text-button" onClick={show}><Layers3 size={15}/>Make a flashcard</button>
    {open && <Modal title="Make a flashcard" onClose={() => setOpen(false)}>
      <form className="flashcard-from-question" onSubmit={event => { event.preventDefault(); save(); }}>
        <label>Deck<input value={deck} onChange={event => setDeck(event.target.value)} list={deckList} maxLength={60} required/></label>
        <datalist id={deckList}>{decks.map(name => <option key={name} value={name}/>)}</datalist>
        <label>Prompt<textarea value={front} onChange={event => setFront(event.target.value)} required/></label>
        <label>Answer<textarea value={back} onChange={event => setBack(event.target.value)} required/></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="button-row end"><button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary" type="submit">Save flashcard</button></div>
      </form>
    </Modal>}
  </>;
}
