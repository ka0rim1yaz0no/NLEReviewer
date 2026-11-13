import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { clarifyArchivedDecisions } from "./rationale-display.ts";

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

test("decision explanations distinguish safe care from an unsafe proposal and follow shuffled letters",()=>{
  const item={...q,questionRevision:7,options:q.options.map((option,index)=>({
    ...option,rationale:`The assessment explains choice ${index+1}.\n\nThe proposal explains choice ${index+1}.`,
    rationaleParts:[
      {label:"Assessment",verdict:index===2?"supported":"incorrect"},
      {label:"Proposal to question",verdict:index===2?"needs-correction":"appropriate"},
    ],
  }))};
  const html=render({q:item,selected:2,choiceOrder:[2,0,3,1],expanded:true});
  assert.match(html,/A\. Correct answer.*Assessment · Supported by the findings.*Proposal to question · Needs correction/);
  assert.match(html,/B\. Incorrect combination.*Assessment · Does not match the findings.*Proposal to question · Appropriate care/);
  assert.doesNotMatch(html,/Why this choice does not fit/);
  const preview=render({q:item,expanded:false});
  assert.doesNotMatch(preview,/Correct answer|Needs correction|Incorrect combination/);
});

test("archived questions label a proposal to correct and preserve the original choices and grade",()=>{
  const source="https://example.org/care-planning";
  const archived={...q,questionRevision:6,stem:"First situation\nAn outreach clinic. What should the nurse do?\n\nSecond situation\nThe family lacks transport. Which proposed plan entry should the nurse revise before putting the plan into effect?",
    options:q.options.map((option,index)=>({...option,
      text:`First — ${index<2?'Reuse the syringe':'Use a sterile syringe'}\nSecond — ${index%2===0?'Record refusal':'Discuss transport'}`,
      referenceId:`${q.id}:paired:${index<2?0:1}:wound:${index%2}`,
      rationale:`First ${index<2?'does not fit':'fits'}. Assess injection safety. Second ${index%2===0?'fits':'does not fit'}. Assess access to wound care.`,contextSource:source,
    }))};
  const companion={...q,id:"wound",questionRevision:7,options:[
    {text:"Record refusal",rationale:"Document the transport barrier and arrange accessible wound care.",source},
    {text:"Discuss transport",rationale:"Choose a schedule the family can follow.",source},
  ]};
  const updated=clarifyArchivedDecisions(archived,new Map([[companion.id,companion]]));
  assert.equal(updated.correctIndex,archived.correctIndex);
  assert.equal(updated.stem,archived.stem);
  assert.deepEqual(updated.options.map(option=>option.text),archived.options.map(option=>option.text));
  const html=render({q:updated,selected:2,choiceOrder:[2,0,3,1],expanded:true});
  assert.match(html,/A\. Correct answer.*Second · Needs correction.*Document the transport barrier and arrange accessible wound care/);
  assert.match(html,/D\. Incorrect combination.*Second · Appropriate care.*Choose a schedule the family can follow/);
  assert.doesNotMatch(html,/Second (?:fits|does not fit)/);
});
