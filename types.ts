export type Subject = "CROSS" | "NP1" | "NP2" | "NP3" | "NP4" | "NP5";
export type Question = { id: string; subject: Subject; topic: string; stem: string; options: { text: string; rationale: string }[]; correctIndex: number; rationale: string; keyPoint: string; source: string; origin: string };
export type Fact = { text: string; reason: string };
export type ClinicalCase = { subject: Subject; topic: string; title: string; scenario: string; facts: Fact[] };
export function parseCases(subject: Subject, raw: string): ClinicalCase[] {
  return raw.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const [topic, title, scenario, ...facts] = line.split("|");
    if (facts.length !== 5) throw new Error(`Expected five facts for ${title}, got ${facts.length}`);
    return { subject, topic, title, scenario, facts: facts.map(value => { const [text, reason] = value.split("~"); if (!reason) throw new Error(`Missing rationale: ${title}`); return { text, reason }; }) };
  });
}
