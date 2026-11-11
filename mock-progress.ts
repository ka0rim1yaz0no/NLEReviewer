import type { Session } from "./engine.ts";

export const mockSubjects = ["NP1", "NP2", "NP3", "NP4", "NP5"] as const;
export const mockTimeLimit = 2 * 60 * 60;
export type MockClock = { remainingMs: number; changedAt: number; owner?: string };

export function mockAttemptNumber(session: Session) {
  return session.mockAttempt && Number.isSafeInteger(session.mockAttempt) && session.mockAttempt > 0 ? session.mockAttempt : 1;
}

export function validMockClock(session: Session) {
  const clock = session.mockClock;
  if (session.kind !== "mock" || !clock || !Number.isFinite(clock.changedAt) || !Number.isFinite(clock.remainingMs)) return undefined;
  return {
    changedAt: clock.changedAt,
    remainingMs: Math.min(fullDuration(session), Math.max(0, clock.remainingMs)),
    owner: !session.finishedAt && typeof clock.owner === "string" && clock.owner.length <= 64 ? clock.owner : undefined,
  };
}

export function mockAttempts(sessions: readonly Session[], board: number) {
  const attempts = new Map<number, Session[]>();
  for (const session of sessions) {
    if (session.kind !== "mock" || session.mockBoard !== board) continue;
    const attempt = mockAttemptNumber(session);
    const list = attempts.get(attempt) ?? [];
    list.push(session);
    attempts.set(attempt, list);
  }
  return [...attempts].sort(([first], [second]) => second - first);
}

export function completedMockSubjects(sections: readonly Session[]) {
  return mockSubjects.filter(subject => sections.some(session => session.subject === subject && !!session.finishedAt));
}

function fullDuration(session: Session) {
  return (session.timeLimit && Number.isFinite(session.timeLimit) && session.timeLimit > 0 ? session.timeLimit : mockTimeLimit) * 1000;
}

export function mockRemaining(session: Session, now: number) {
  const clock = session.mockClock;
  const duration = fullDuration(session);
  const remaining = clock
    ? clock.remainingMs - (clock.owner ? Math.max(0, now - clock.changedAt) : 0)
    : duration - Math.max(0, now - session.startedAt);
  return Math.min(duration, Math.max(0, remaining));
}

export function startMockClock(session: Session, owner: string, at: number): Session {
  if (session.finishedAt || session.mockClock?.owner === owner) return session;
  const remainingMs = mockRemaining(session, at);
  return { ...session, mockClock: { remainingMs, changedAt: at, owner } };
}

export function pauseMockClock(session: Session, at: number): Session {
  if (!session.mockClock?.owner) return session;
  return { ...session, mockClock: { remainingMs: mockRemaining(session, at), changedAt: at } };
}

export function mergeMockClock(first: MockClock | undefined, second: MockClock | undefined) {
  if (!first || !second) return first ?? second;
  const latest = first.changedAt > second.changedAt ? first : second;
  return { ...latest, remainingMs: Math.min(first.remainingMs, second.remainingMs) };
}

export function mockDuration(session: Session) {
  return session.mockClock && session.finishedAt
    ? fullDuration(session) - mockRemaining(session, session.finishedAt)
    : Math.max(0, (session.finishedAt ?? session.startedAt) - session.startedAt);
}
