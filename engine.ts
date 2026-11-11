import {updateVaultReview} from "./vault-schedule.ts";
import type {VaultReview} from "./vault-schedule.ts";
import type {FocusSettings} from "./focus-timer.ts";
import type { Question, Subject } from "./types.ts";
import type {GameRun} from "./play-engine.ts";
export type Answer = { selected: number; submitted: boolean; confidence: string };
export type Session = { id: string; title: string; kind: "practice" | "exam" | "mock" | "diagnostic"; mode: "tutor" | "exam"; questionRevision?: 1 | 2 | 3; questionIds: string[]; answers: Record<string, Answer>; flagged: string[]; eliminated: Record<string, number[]>; cursor: number; startedAt: number; finishedAt?: number; timeLimit?: number; perQuestion?: number; mockBoard?: number; subject?: Subject; scratch: string; highlights: Record<string, string[]>; strokes: Record<string, string[]> };
export type Attempt = { id: string; sessionId: string; questionId: string; selected: number; correct: boolean; confidence: string; at: number };
export type CardProgress = { due: number; interval: number; reviews: number; lastAt: number };
export type CustomCard = { id: string; deck: string; front: string; back: string };
export type Task = { id: string; date: string; title: string; done: boolean; type: "read" | "practice" | "flashcards" | "custom" | "vault" | "mock"; subject?: Subject; topic?: string; skipped?: boolean; minutes?: number; count?: number; mockBoard?: number };
export type StudyPlanSettings = { startDate:string; dailyMinutes:number; restDays:number[]; subjects:Subject[]; focus:Subject[]; reading:boolean; flashcards:boolean; mocks:boolean };
export type State = { gameRuns?:GameRun[]; vaultReviews?:Record<string,VaultReview>; focusSettings?:FocusSettings; studyLog?:Record<string,number>; plan?:StudyPlanSettings; version: 1; updatedAt: number; profile: { name: string; fullName: string; color: string; photo: string; examDate: string; timezone: string }; preferences: { spacedVault?:boolean; playVault?:boolean; playSound?:boolean; flashcardSound?:boolean; showWall?:boolean; calendarView?:"day"|"week"|"month"|"month-list"; theme: string; flashcardGoal: number; questionGoal: number; confidence: boolean; crossSide: string; explanation: string; textSize: number }; attempts: Attempt[]; sessions: Session[]; vault: string[]; bookmarks: string[]; notes: Record<string, string>; tasks: Task[]; cards: Record<string, CardProgress>; customCards: CustomCard[]; importedQuestions: Question[]; read: string[]; studySeconds: number };
export function dateKey(time = Date.now(), timezone = "Asia/Manila"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(time));
}
export function addDays(key: string, count: number): string { const d = new Date(`${key}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0, 10); }
export function daysBetween(a: string, b: string): number { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000); }
export function initialState(): State { return { version: 1, updatedAt: 0, profile: { name: "Future RN", fullName: "", color: "#1b3a2d", photo: "", examDate: addDays(dateKey(), 110), timezone: "Asia/Manila" }, preferences: { theme: "light", flashcardGoal: 20, questionGoal: 30, confidence: true, crossSide: "right", explanation: "below", textSize: 18 }, attempts: [], sessions: [], vault: [], bookmarks: [], notes: {}, tasks: [], cards: {}, customCards: [], importedQuestions: [], read: [], studySeconds: 0 }; }
export function firstAttempts(attempts: Attempt[]): Attempt[] { const seen = new Set<string>(); return [...attempts].sort((a,b) => a.at - b.at).filter(a => { if (seen.has(a.questionId)) return false; seen.add(a.questionId); return true; }); }
export function rating(attempts: Attempt[], minimum = 1): number | null { return attempts.length >= minimum ? 40 + attempts.filter(a => a.correct).length / attempts.length * 60 : null; }
export function streak(attempts: Attempt[], timezone: string, games:readonly GameRun[]=[]): number { const days = new Set([...attempts.map(a=>dateKey(a.at,timezone)),...games.map(game=>dateKey(game.finishedAt,timezone))]); let current = dateKey(Date.now(), timezone); if (!days.has(current)) current = addDays(current, -1); let count = 0; while (days.has(current)) { count++; current = addDays(current, -1); } return count; }
export function longestStreak(attempts: Attempt[], timezone: string, games:readonly GameRun[]=[]): number { const dates=[...new Set([...attempts.map(a=>dateKey(a.at,timezone)),...games.map(game=>dateKey(game.finishedAt,timezone))])].sort();let best=0,current=0,previous="";for(const date of dates){current=previous&&daysBetween(previous,date)===1?current+1:1;best=Math.max(best,current);previous=date;}return best; }
export function recordAnswer(state: State, session: Session, question: Question, answer: Answer, at = Date.now()): State {
  const id = `${session.id}:${question.id}`;
  if (state.attempts.some(a => a.id === id)) return state;
  const correct = answer.selected === question.correctIndex;
  return { ...updateVaultReview(state,question.id,correct,at), attempts: [...state.attempts, { id, sessionId: session.id, questionId: question.id, selected: answer.selected, correct, confidence: answer.confidence, at }] };
}
export function gradeSession(state: State, session: Session, bank: Map<string, Question>, at = Date.now()): State {
  if (state.sessions.find(s=>s.id===session.id)?.finishedAt) return state;
  let next = state;
  for (const id of session.questionIds) { const q = bank.get(id); if (!q) continue; const answer = session.answers[id] ?? { selected: -1, submitted: true, confidence: "" }; next = recordAnswer(next, session, q, answer, at); }
  return { ...next, sessions: next.sessions.map(s => s.id === session.id ? { ...session, finishedAt: at } : s) };
}
export function scheduleCard(previous: CardProgress | undefined, grade: "again" | "hard" | "good" | "easy", now = Date.now()): CardProgress {
  const base = previous?.interval || 1;
  const interval = grade === "again" ? 1 / 1440 : grade === "hard" ? Math.max(1, base * 1.2) : grade === "good" ? Math.max(3, base * 2) : Math.max(7, base * 3);
  return { interval, due: now + interval * 86400000, reviews: (previous?.reviews || 0) + 1, lastAt: now };
}
export function isAnswerCorrect(session:Session,id:string,bank:Map<string,Question>):boolean{const question=bank.get(id),answer=session.answers[id];return !!question&&!!answer&&answer.selected===question.correctIndex;}
export function sessionScore(session: Session, bank: Map<string, Question>): number { return session.questionIds.filter(id => isAnswerCorrect(session,id,bank)).length; }
export function parseFlashcardText(text: string, deck: string): CustomCard[] {
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false;
  const delimiter = text.includes("\t") ? "\t" : ",";
  for (let i=0;i<=text.length;i++) { const char = text[i] ?? "\n"; if (char === '"') { if (quoted && text[i+1] === '"') { value += '"'; i++; } else quoted = !quoted; } else if (char === delimiter && !quoted) { row.push(value); value = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[i+1] === "\n") i++; row.push(value); if (row.some(v=>v.trim())) rows.push(row); row=[];value=""; } else value += char; }
  if (quoted) throw new Error("A quoted cell is not closed.");
  return rows.filter((r,i) => !(i===0 && /^(front|question)$/i.test(r[0].trim()))).map((r,i) => { if (r.length<2 || !r[0].trim() || !r[1].trim()) throw new Error(`Row ${i+1} needs a front and back.`); return { id: `custom-${crypto.randomUUID()}`, deck, front: r[0].trim(), back: r[1].trim() }; });
}
