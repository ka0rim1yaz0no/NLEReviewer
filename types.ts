export type Subject = "CROSS" | "NP1" | "NP2" | "NP3" | "NP4" | "NP5";
export type QuestionOption = { text: string; rationale: string; source?: string; referenceId?: string };
export type Question = { id: string; subject: Subject; topic: string; stem: string; options: QuestionOption[]; correctIndex: number; rationale: string; keyPoint: string; source: string; origin: string; collection?: "supplemental"; rationaleScope?: "shared"; sourceId?: string; sourceTopic?: string; format?: "concept" | "comparison" | "situational"; conceptId?: string; caseId?: string; clinicalObjective?: string; retired?: boolean };
export type Fact = { text: string; reason: string };
export type ClinicalCase = { subject: Subject; topic: string; title: string; scenario: string; facts: Fact[] };
export function parseCases(subject: Subject, raw: string): ClinicalCase[] {
  return raw.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const [topic, title, scenario, ...facts] = line.split("|");
    if (facts.length !== 5) throw new Error(`Expected five facts for ${title}, got ${facts.length}`);
    return { subject, topic, title, scenario, facts: facts.map(value => { const [text, reason] = value.split("~"); if (!reason) throw new Error(`Missing rationale: ${title}`); return { text, reason }; }) };
  });
}
