import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let ReviewAnswers;
before(async () => {
  server = await createServer({
    configFile: false,
    appType: "custom",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, ws: false },
  });
  ({ ReviewAnswers } = await server.ssrLoadModule("/QuestionAnswers.tsx"));
});
after(async () => { await server?.close(); });

const q = {
  id: "QA-CHOICE-DISPLAY",
  correctIndex: 2,
  rationale: "Reason for the correct choice.",
  keyPoint: "Reason for the correct choice.",
  source: "https://example.org/reference",
  options: ["First action", "Second action", "Third action\nSecond finding", "Fourth action"]
    .map((text, index) => ({ text, rationale: `Choice explanation ${index + 1}.` })),
};
const render = props => renderToStaticMarkup(createElement(ReviewAnswers, { q, ...props }));
const choices = html => html.match(/<ol\b[^>]*aria-label="Answer choices"[^>]*>[\s\S]*?<\/ol>/)?.[0];

test("results keep all four choices, their letters, and answer markers when explanations are hidden", () => {
  const props = { selected: 1, choiceOrder: [3, 0, 2, 1] };
  const collapsed = render({ ...props, expanded: false });
  const expanded = render({ ...props, expanded: true });
  const list = choices(collapsed);
  assert.ok(list);
  assert.equal(list, choices(expanded));
  assert.deepEqual([...list.matchAll(/class="option-letter">([A-D])</g)].map(match => match[1]), ["A", "B", "C", "D"]);
  assert.deepEqual([...list.matchAll(/class="answer-choice-text">([^<]*)</g)].map(match => match[1]),
    props.choiceOrder.map(index => q.options[index].text));
  assert.match(list, /class="correct"[\s\S]*?Third action\nSecond finding[\s\S]*?Correct answer/);
  assert.match(list, /class="wrong"[\s\S]*?Second action[\s\S]*?Your answer/);
  assert.doesNotMatch(collapsed, /Choice explanation \d\./);
  assert.deepEqual([...expanded.matchAll(/Choice explanation (\d)\./g)].map(match => Number(match[1])), [4, 1, 3, 2]);
  assert.equal((expanded.match(/href="https:\/\/example\.org\/reference"/g) ?? []).length, 4);
});

test("bank previews show the choices with the key hidden, and shared rationales remain available", () => {
  const preview = render({});
  assert.equal((choices(preview)?.match(/class="answer-choice-text"/g) ?? []).length, 4);
  assert.doesNotMatch(preview, /Correct answer|Your answer|Choice explanation \d\./);

  const shared = { ...q, rationaleScope: "shared" };
  const result = render({ q: shared, selected: -1, expanded: true });
  assert.match(result, /Correct answer/);
  assert.doesNotMatch(result, /Your answer|Choice explanation \d\./);
  assert.match(result, /Source answer explanation.*Reason for the correct choice/);
});
