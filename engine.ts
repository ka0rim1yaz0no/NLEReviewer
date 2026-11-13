import {updateVaultReviews} from "./vault-schedule.ts";
import type {VaultReview} from "./vault-schedule.ts";
import type {FocusSettings} from "./focus-timer.ts";
import type { Question, Subject } from "./types.ts";
import type {GameRun} from "./play-engine.ts";
import {pauseMockClock} from "./mock-progress.ts";
import type {MockClock} from "./mock-progress.ts";
export type Answer = { selected: number; submitted: boolean; confidence: string };
export type Session = { id: string; title: string; kind: "practice" | "exam" | "mock" | "diagnostic"; mode: "tutor" | "exam"; questionRevision?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; questionIds: string[]; focusedQuestionCount?: number; answers: Record<string, Answer>; flagged: string[]; eliminated: Record<string, number[]>; cursor: number; startedAt: number; finishedAt?: number; timeLimit?: number; perQuestion?: number; mockBoard?: number; mockAttempt?: number; mockClock?: MockClock; practiceSetup?: string; planTaskId?: string; subject?: Subject; scratch: string; highlights: Record<string, string[]>; strokes: Record<string, string[]> };
export type Attempt = { id: string; sessionId: string; questionId: string; selected: number; correct: boolean; confidence: string; at: number };
export type CardProgress = { due: number; interval: number; reviews: number; lastAt: number };
export type CustomCard = { id: string; deck: string; front: string; back: string };
export type Task = { id: string; date: string; title: string; done: boolean; type: "read" | "practice" | "flashcards" | "custom" | "vault" | "mock"; subject?: Subject; topic?: string; skipped?: boolean; minutes?: number; count?: number; mockBoard?: number };
export type StudyPlanSettings = { startDate:string; dailyMinutes:number; restDays:number[]; subjects:Subject[]; focus:Subject[]; reading:boolean; flashcards:boolean; mocks:boolean };
export type State = { gameRuns?:GameRun[]; vaultReviews?:Record<string,VaultReview>; focusSettings?:FocusSettings; studyLog?:Record<string,number>; plan?:StudyPlanSettings; version: 1; updatedAt: number; profile: { name: string; fullName: string; color: string; photo: string; examDate: string; timezone: string }; preferences: { spacedVault?:boolean; playVault?:boolean; playSound?:boolean; studySound?:boolean; flashcardSound?:boolean; showWall?:boolean; calendarView?:"day"|"week"|"month"|"month-list"; theme: string; flashcardGoal: number; questionGoal: number; confidence: boolean; crossSide: string; explanation: string; textSize: number }; attempts: Attempt[]; sessions: Session[]; vault: string[]; bookmarks: string[]; notes: Record<string, string>; tasks: Task[]; cards: Record<string, CardProgress>; customCards: CustomCard[]; importedQuestions: Question[]; read: string[]; studySeconds: number };
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
export function dateKey(time = Date.now(), timezone = "Asia/Manila"): string {
  let formatter = dateFormatters.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
    dateFormatters.set(timezone, formatter);
  }
  const parts = formatter.formatToParts(time);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}
export function dailyAnswerCounts(attempts: readonly Attempt[], timezone: string) {
  const days = new Map<string, number>();
  for (const attempt of attempts) {
    if (attempt.selected < 0) continue;
    const day = dateKey(attempt.at, timezone);
    days.set(day, (days.get(day) || 0) + 1);
  }
  return days;
}
export function answeredQuestionIds(attempts: readonly Attempt[]) {
  return new Set(attempts.filter(attempt => attempt.selected >= 0).map(attempt => attempt.questionId));
}
export function addDays(key: string, count: number): string { const d = new Date(`${key}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0, 10); }
export function daysBetween(a: string, b: string): number { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000); }
export function initialState(): State { return { version: 1, updatedAt: 0, profile: { name: "Future RN", fullName: "", color: "#1b3a2d", photo: "", examDate: addDays(dateKey(), 110), timezone: "Asia/Manila" }, preferences: { theme: "light", flashcardGoal: 20, questionGoal: 30, confidence: true, crossSide: "right", explanation: "below", textSize: 18 }, attempts: [], sessions: [], vault: [], bookmarks: [], notes: {}, tasks: [], cards: {}, customCards: [], importedQuestions: [], read: [], studySeconds: 0 }; }
export function firstAttempts(attempts: Attempt[]): Attempt[] { const seen = new Set<string>(); return [...attempts].sort((a,b) => a.at - b.at).filter(a => { if (seen.has(a.questionId)) return false; seen.add(a.questionId); return true; }); }
export function rating(attempts: Attempt[], minimum = 1): number | null { return attempts.length >= minimum ? 40 + attempts.filter(a => a.correct).length / attempts.length * 60 : null; }
function studyDays(attempts: Attempt[], timezone: string, games: readonly GameRun[]) {
  return new Set([...dailyAnswerCounts(attempts, timezone).keys(), ...games.map(game => dateKey(game.finishedAt, timezone))]);
}
export function streak(attempts: Attempt[], timezone: string, games:readonly GameRun[]=[]): number { const days=studyDays(attempts,timezone,games); let current = dateKey(Date.now(), timezone); if (!days.has(current)) current = addDays(current, -1); let count = 0; while (days.has(current)) { count++; current = addDays(current, -1); } return count; }
export function longestStreak(attempts: Attempt[], timezone: string, games:readonly GameRun[]=[]): number { const dates=[...studyDays(attempts,timezone,games)].sort();let best=0,current=0,previous="";for(const date of dates){current=previous&&daysBetween(previous,date)===1?current+1:1;best=Math.max(best,current);previous=date;}return best; }
function toAttempt(session: Session, question: Question, answer: Answer | undefined, at: number): Attempt {
  const selected = answer?.selected ?? -1;
  return { id: `${session.id}:${question.id}`, sessionId: session.id, questionId: question.id, selected, correct: selected === question.correctIndex, confidence: answer?.confidence || "", at };
}
export function linkedPracticeComplete(session: Session) {
  return !!session.planTaskId && (session.mode === "tutor" || !!session.finishedAt) && session.questionIds.every(id => {
    const answer = session.answers[id];
    return answer?.selected >= 0 && (session.mode === "exam" || answer.submitted);
  });
}
function finishLinkedTask(state: State, session: Session) {
  if (!linkedPracticeComplete(session) || !state.tasks.some(task => task.id === session.planTaskId && task.type === "practice" && !task.done && !task.skipped)) return state;
  return { ...state, tasks: state.tasks.map(task => task.id === session.planTaskId ? { ...task, done: true } : task) };
}
export function recordAnswer(state: State, session: Session, question: Question, answer: Answer, at = Date.now()): State {
  const attempt = toAttempt(session, question, answer, at);
  if (state.attempts.some(a => a.id === attempt.id)) return state;
  return finishLinkedTask({ ...updateVaultReviews(state, [attempt]), attempts: [...state.attempts, attempt] }, session);
}
export function sessionDeadline(session: Session) {
  const clock = session.mockClock;
  if (session.kind === "mock" && clock) return clock.owner ? clock.changedAt + clock.remainingMs : Infinity;
  const seconds = session.timeLimit;
  return seconds && Number.isFinite(seconds) && seconds > 0 ? session.startedAt + seconds * 1000 : Infinity;
}
export function gradeSession(state: State, session: Session, bank: Map<string, Question>, at = Date.now()): State {
  if (state.sessions.find(s=>s.id===session.id)?.finishedAt) return state;
  const finishedAt = Math.min(at, sessionDeadline(session));
  const finished = { ...pauseMockClock(session, finishedAt), finishedAt };
  const recorded = new Set(state.attempts.map(attempt => attempt.id));
  const attempts: Attempt[] = [];
  for (const id of session.questionIds) {
    const question = bank.get(id);
    if (!question) continue;
    const attempt = toAttempt(session, question, session.answers[id], finishedAt);
    if (recorded.has(attempt.id)) continue;
    recorded.add(attempt.id);
    attempts.push(attempt);
  }
  return finishLinkedTask({
    ...updateVaultReviews(state, attempts),
    attempts: attempts.length ? [...state.attempts, ...attempts] : state.attempts,
    sessions: state.sessions.map(s => s.id === session.id ? finished : s),
  }, finished);
}
export function scheduleCard(previous: CardProgress | undefined, grade: "again" | "hard" | "good" | "easy", now = Date.now()): CardProgress {
  const base = previous?.interval || 1;
  const interval = grade === "again" ? 1 / 1440 : grade === "hard" ? Math.max(1, base * 1.2) : grade === "good" ? Math.max(3, base * 2) : Math.max(7, base * 3);
  return { interval, due: now + interval * 86400000, reviews: (previous?.reviews || 0) + 1, lastAt: now };
}
export function isAnswerCorrect(session:Session,id:string,bank:Map<string,Question>):boolean{const question=bank.get(id),answer=session.answers[id];return !!question&&!!answer&&answer.selected===question.correctIndex;}
export function sessionScore(session: Session, bank: Map<string, Question>): number { return session.questionIds.filter(id => isAnswerCorrect(session,id,bank)).length; }
export function parseFlashcardText(text: string, deck: string): CustomCard[] {
  text = text.replace(/^\uFEFF/, "");
  const headers = text.match(/^(?:[ \t]*(?:#[^\r\n]*)?(?:\r\n|\r|\n))+/)?.[0] || "";
  text = text.slice(headers.length);
  const separators = new Map([["tab", "\t"], ["comma", ","], ["semicolon", ";"], ["space", " "], ["pipe", "|"], ["colon", ":"]]);
  const metadataColumns = new Set<number>();
  let delimiter: string | undefined;
  for (const line of headers.split(/\r\n|\r|\n/)) {
    const separator = line.trimStart().match(/^#separator:([^\r\n]*)/i)?.[1];
    if (separator !== undefined) {
      delimiter = separators.get(separator.trim().toLowerCase()) ?? [...separators.values()].find(value => separator === value || separator.trim() === value);
      if (!delimiter) throw new Error("Choose a supported separator for your flashcard export.");
    }
    const column = line.match(/^\s*#(?:guid|notetype|deck|tags) column:\s*(\d+)\s*$/i);
    if (column) metadataColumns.add(Number(column[1]) - 1);
  }
  if (!delimiter) {
    const found = new Set<string>();
    let quoted = false;
    for (const char of text) {
      if (char === '"') quoted = !quoted;
      else if (!quoted) {
        if (char === "\n" || char === "\r") break;
        if (["\t", ",", ";"].includes(char)) found.add(char);
      }
    }
    delimiter = found.has("\t") ? "\t" : found.has(",") || !found.has(";") ? "," : ";";
  }
  const rows: string[][] = [];
  let row: string[] = [], value = "", quoted = false;
  for (let i = 0; i <= text.length; i++) {
    const char = text[i] ?? "\n";
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      if (row.some(cell => cell.trim())) rows.push(row.filter((_, index) => !metadataColumns.has(index)));
      row = [];
      value = "";
    } else value += char;
  }
  if (quoted) throw new Error("A quoted cell is not closed.");
  if (/^(front|question)$/i.test(rows[0]?.[0]?.trim() || "") && /^(back|answer)$/i.test(rows[0]?.[1]?.trim() || "")) rows.shift();
  return rows.map((row, index) => {
    const front = row[0]?.trim(), back = row[1]?.trim();
    if (!front || !back) throw new Error(`Row ${index + 1} needs a front and back.`);
    return { id: `custom-${crypto.randomUUID()}`, deck, front, back };
  });
}
