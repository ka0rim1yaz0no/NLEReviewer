# For Elaine Only Reviewer

A BoardPal-inspired nursing study app with username profiles, private progress, and no subscriptions or payments. The paid BoardPal question bank is not copied or connected to this app.

## Published content

**5,095 situational nursing questions across all 155 topics**, in a bank of **9,663 active questions** (10,645 stored including 982 retired historical records):

| Question format | Count |
| --- | ---: |
| Existing questions in 120 five-part situations | 600 |
| New questions in 620 seven-part situations | 4,340 |
| Additional standalone situational scenarios, one per topic | 155 |
| Other earlier standalone originals | 51 |
| Source-based concept checks | 3,758 |
| Reference-comparison questions | 757 |
| Corrected supplemental source items | 2 |

The situational total exceeds the requested minimum of 4,771. Each of the 155 topics has four linked situations (28 questions) plus one standalone scenario. Each linked situation tests seven decisions: recognition, action, teaching, safety, planning, evaluation, and reasoning. The current collection includes 740 linked situations and 155 additional independent standalone vignettes; 5,095 is the question count. The standalone expansion adds a different applied decision to every topic. Cases cover bedside, community, family, professional, and critical-care decisions. No names-only or age-only variants are generated.

Every question has four distinct choices, one keyed answer, an answer explanation, and explanations for all alternatives. `situational-evidence.json` records the clinical findings, care need, safe response, teaching, desired outcome, unsafe proposal, clinical reasoning, and reference for each new situation. The answer key is checked against this authored evidence. References include Open RN nursing chapters, WHO, CDC, NIH/NEI, NHS, NICE, AHA, and Philippine statutes. Checks include all-topic coverage, complete per-choice explanations, unique situations and questions, balanced answer positions, ABG arithmetic, scoring, and preservation of every earlier record. The November 3 audit reviewed the evidence behind all 740 original case sets and checked all 4,940 question records. Reference and structural checking is **not independent professional clinical approval**; independent clinician review remains pending.

The 4,515 concept and comparison items remain available for focused review and existing saved sessions. Their reference evidence and corrections are preserved. They are not counted as situational questions. Earlier IDs, option positions, and answer keys remain stable. The two documented legacy context clarifications and more specific reference links are explicitly rolled back when checking the original release checksums; all other earlier content must still match.

The catalog retains the 155 reference topic names and observed 9,541-question reference distribution rechecked on November 3, 2026. BoardPal's paid question text is not copied, and this app does not claim the same per-topic counts or official PNLE content.

`question-bank.json` is a small export manifest; `question-bank.json.gz` contains the complete lossless JSON array, including 982 `retired:true` historical records. There are 10,645 stored records and 9,663 active questions. New practice and decks exclude historical records; saved sessions, results, bookmarks, and notes can still resolve them. Run `node export-bank.mjs --plain` to write an uncompressed array to `outputs/question-bank.json`, or export the active bank from the app's Settings. The gzip format keeps individual files within GitHub's browser upload limit. `situational-questions.json` freezes the new records, `situational-evidence.json` records case evidence, and `situational-review-report.json` records counts and review limits. The six `situations-*.txt` files and `build-situational-bank.mjs` are authoring-only. `build-audited-bank.mjs` preserves published option identities and key positions; replacements get new IDs. `--draft` writes only ignored outputs. Create and review a new immutable release before publishing further changes. See [THIRD_PARTY.md](THIRD_PARTY.md) for references and attribution.

A proposed 4,120-item MedMCQA research candidate remains withheld after spot-checks found scenario/key mismatches. It is not counted or available in practice. The two provisional bulk database releases and the superseded first concept-bank candidate remain excluded by row-level security. Only the two separately corrected source items are published from that dataset.

## Study features

- Tutor mode with immediate explanations; exam mode with deferred grading, blanks counted as incorrect, and full result review.
- Custom subject/topic sets, new/missed filters, timers, saved sessions, flags, elimination, confidence, highlights, pen annotations, scratch notes, bookmarks, and question notes.
- Counted Needs work, Not started, Flagged, and Saved topic filters; per-topic redo-miss sets; preserved first-try scores and a Vault for unresolved misses.
- Five mock variants, each with five 100-item, two-hour sections; a balanced 30-item diagnostic. New mock sections use fixed disjoint 100-item selections per subject: fourteen complete seven-part situations and two independent scenario questions. They remain selections from this app’s shared bank, not official papers. Earlier saved sessions retain their exact questions.
- All 155 topics connected to flashcards, spaced review, complete original resource notes, the full planner, and calendar export. Shared topic/resource notes, gathered My Notes, Anki text/TSV/CSV import, and legacy deck/resource links.
- History, performance, milestones, profile/settings, theme and text-size preferences, JSON backups, and authorized personal question imports.
- Username profiles backed by separate Supabase identities, isolated progress, cloud sync, retry controls, and a responsive mobile layout.
- Format filters for situational questions, earlier clinical/standalone items, concept checks, comparisons, and corrected source items. Quick practice, diagnostics, mocks, topic decks, and daily flashcards default to situational questions. Other formats remain available in custom selections.

Large sessions render at most 100 navigator buttons at a time. This keeps phone rendering bounded while every question remains reachable. The full bank is available to custom sets; counts are capped at the actual selection. Resource key points load 20 at a time. Question-library, topic-question, and result reviews render 10 at a time.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
```

Vite serves local development on port 5173; `npm run preview -- --port 4173` previews the production build. Vercel runs `npm run build`, serves `dist`, and rewrites app routes using `vercel.json`. No paid hosting features are required.

## Supabase and protected releases

1. Run `supabase.sql` and `username-profiles.sql`. They isolate records by `auth.uid() = user_id`; unauthenticated access is revoked.
2. Enable anonymous sign-ins in Supabase Authentication. Configure only the public project URL and publishable key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel and an ignored `.env.local`. Never embed a service-role/secret key in browser code.
3. Run `node --experimental-strip-types seed-release.mjs`. It writes a separate directory under `outputs/releases/<release-id>/` containing the schema, numbered compressed pages, and a publish file. Apply that directory's schema, its numbered pages, and `release-99-publish.sql` **last**. Use only the pages belonging to that release, as reported by the command.
4. The browser checks the expanded question/case counts and a canonical SHA-256 digest before installing the bank. A module worker performs decompression and verification away from the UI thread, with the same verified fallback for browsers without workers. Missing, damaged, or incomplete content keeps saved progress intact and offers a retry. Students cannot modify shared content. Visitors and anonymous-auth identities without a claimed username cannot retrieve answers or notes.
5. Deploy the matching client release. Older deployments continue using the original `study_content` table, which remains intact. `seed-content.mjs` and `protected-content.sql` remain available for that legacy format. New compressed releases stage separately; publishing a manifest never exposes a half-loaded bank.

The public JavaScript contains no question stems, keys, case payloads, or bank exports. The repository's authoring source contains answers and is outside the app's username gate; making the repository private is a separate account setting. Copies already downloaded are likewise outside this gate.

Username access is **pseudonymous and browser-remembered**, not verified identity. Anyone using the same browser can reopen remembered profiles. Knowing a username on another browser does not reveal its session or records. Export a backup before clearing storage or moving devices. The app does not promise cross-device recovery using a username alone.

Active identity is separate per tab; cloud reads/writes use the Supabase UID. Switching profiles saves and hides the prior workspace first. Backups contain study data, not authentication tokens. Concurrent edits to the same profile are last-write-wins. A failed cloud read does not overwrite cloud data with a stale local snapshot.

`node --experimental-strip-types verify-backend.mjs` creates clearly named QA profiles to check unsigned/unclaimed denial, username uniqueness, complete release integrity, denied shared-bank writes, withdrawn-release denial, and cross-profile isolation. It does not inspect existing students' records.

## Imports and editorial review

The November 3 audit replaced 135 semantically repeated case sets (945 linked questions) with distinct situations. It clarified sterile-drape strike-through, individual hip precautions, LAM criteria, third-stage labor care, the oxytocin response, newborn-screening refusal rules, scald first aid, tetralogy-of-Fallot positioning, the prescribed asthma regimen, nitrate/PDE5 precautions, hepatitis A contacts, and an intubation explanation. The initial 600 questions now have specific case and per-choice reference links. See `situational-audit-log.json`, `situational-clarifications.json`, `legacy-context-corrections.json`, and `situational-review-report.json` for scope and retirement mappings. Linked recognition/action/teaching/safety/planning/evaluation/reasoning questions intentionally share a vignette and are not duplicate questions.

Settings supports authorized JSON imports with unique IDs/stems, a subject (`CROSS`, `NP1`–`NP5`), topic, stem, four choices with explanations, `correctIndex` (0–3), and a rationale. Optional fields include a source URL, origin, and key point. Personal imports remain in that profile.

`node --experimental-strip-types prepare-bank.mjs authorized-questions.json --check-only` validates a proposed site-wide batch without changing the published bank. Without `--check-only`, it appends valid records to `site-questions.json`. Preserve published IDs, choice order, and keys; changes could invalidate saved answers. Generate a **new immutable release ID**, review it, stage its pages, and publish its manifest last. Structural validation is not clinical validation or permission to republish: obtain the provider's reuse rights before importing its content.

`audit-bank.mjs` writes actual unique counts, topic assignments, related coverage, duplicates, and reference targets. `--require-match` fails while the actual distribution differs from the 9,541-question reference. Regression checksums preserve the earlier records apart from the explicitly allowlisted context and reference adjustments; publication ledgers protect all 5,885 previously stored situational key positions and alternative identities, including archived and R2 replacement records. The original explanation baseline makes historical checksum comparisons explicit while the current explanations are checked against the reviewed evidence. Public counts are generated from the real authoring bank at build time.

For the withheld research candidate, `import-medmcqa.py` reads the public training parquet at `outputs/medmcqa-train.parquet` (pandas and pyarrow required). It writes the 4,120 screened candidates to **`outputs/supplemental-review.json`**, never directly to student practice. Only the two explicitly source-checked corrections enter `supplemental-questions.json`. Source data SHA-256: `b119434ba551517a6ec0ba1f7e0b4c029165ed284a4704f262ce37c791c493c5`. Filtering and duplicate checks cannot establish clinical correctness. New content needs primary-reference checks and independent clinical/editorial review.

## Original reference-question preparation

`collect-openrn.py` retrieves only CC BY 4.0 Open RN reference text through NLM’s documented Books-OAI API, using sequential requests and an ignored local XML cache. It never crawls paid content or imports a textbook question bank. `prepare-openrn.py` removes pronunciation aliases and duplicate definitions, screens unsuitable references, and selects explanatory table relations. `openrn-topic-map.py` assigns related catalog topics using explicit editorial rules.

`build-concept-bank.py` creates a candidate in `outputs/openrn/`; it does not publish. Choices come from related reference concepts, with synonym/overlap checks, stable concept IDs, and fact-specific explanations. `verify-openrn.py` re-parses the source XML and checks every candidate key and alternative against its definition or table cell. Foreign legal/accreditation rules, proprietary diagnostic wording, dependent table rows, uncertain mechanisms, and selected outdated terms are excluded.

After editorial checks, `freeze-concept-bank.py` promotes a source-verified candidate and refuses to change any already frozen record. Preserve existing IDs and options when adding questions; do not regenerate the live bank with a different distractor pool. A clinical correction requires a deliberate reviewed release that accounts for saved progress. `correct-reference-facts.py` applies the documented NCI correction to every keyed/alternative occurrence without shuffling choices. `format-reference-facts.py` preserves reference line breaks and copyedits comparison prompts and explanations without changing the reference words, choice labels, order, or keys. `correct-reference-terms.py` corrects the documented glossary typo in `terminology-corrections.json` to match the same chapter’s main text, preserving every ID and answer position. Generate a new immutable content release, stage all its pages, and publish its manifest last.

## Verification and limits

Automated checks cover bank structure, unique stems, answer keys, old-content checksums, scoring, retries, blanks, exam submission, backup/import validation, dates, streaks, scheduling, topic resolution, collection filters, username gating, compressed release integrity, and source corrections. Browser checks cover actual study flows and phone layout. Passing these checks does not guarantee zero defects or validate every clinical claim.

The interface was informed by the reference's dashboard, practice, mock sections, planner, cards, resources, Vault, performance, history, achievements, profile, and settings. Subscription/payment, shared ranking, testimonials, and support messaging were omitted. No answers were submitted on the user's BoardPal account.

The second November 3 reference recheck covers 4,940 active situational questions and all 19,760 choice explanations. Alternatives now explain their own clinical basis and the present case priority; when these use different sources, both links appear in the answer review. Five further overlapping cases (35 questions) were replaced with fresh R3 IDs. The active situational count remains 4,940 across all 155 topics. Focused changes include current CDC malaria links, magnesium-toxicity management, confirmed-hypertension context, specific pediatric references, 2025 AHA/AAP choking guidance, rhythm-specific cardioversion, and monitored verification of a hemolyzed critical potassium result. See `rationale-reference-corrections.json` and `rationale-review-report.json` for the exact scope, case IDs, sources, duplicate decisions, and limitations. Source reachability is recorded separately and does not establish clinical correctness. Independent clinician approval remains pending.

The November 3 standalone expansion adds 155 original scenario questions (one for every catalog topic), each with four choices and complete explanations. `expansion-review.json` records the exact reviewed candidate hash, all item IDs, reference checks, arithmetic, overlap adjudications, and a factual recheck of the reference site catalog and practice workflow. `expansion-CROSS.txt` and `expansion-NP1.txt` through `expansion-NP5.txt` are the original authoring inputs; `build-expansion-bank.mjs --install` requires the matching review hash. The added content is not copied from paid questions. Every one of the 10,488 previously stored question records and all earlier cases must retain the prior canonical digest. Independent clinician approval remains pending.

The final live library pass replaced two overlapping expansion items with new R2 IDs: GCS total calculation became documentation of a non-testable verbal component, and generic-name prescribing became application of tobacco minimum-age sales. The two briefly published originals remain archived for saved history; active totals remain 155 additional scenarios, 5,095 situational questions, and 9,663 total questions. All 155 first-expansion payloads remain verifiable apart from the two retirement flags.

## PDF library

`/resources/pdfs` is visible only to the authenticated, canonical `elaine` username (case-insensitive). The sidebar, Resources header, topic-reader download buttons, guide print buttons, and PDF FAQ follow the same rule. Other profiles get an unavailable page even with a direct URL. Changing the editable profile display name or restoring a backup cannot change the canonical username. An in-progress PDF export aborts when its authorized component unmounts. This is application visibility control; ordinary browser printing, already downloaded files, and public publisher websites remain outside that control. It offers an original scenario-linked PDF for every one of the 155 catalog topics, individual downloads, and a cancellable ZIP export of all topics or the current search/subject selection. PDFs include all distinct situational review points for that topic and clickable clinical references; they exclude retired content, personal notes, account details and progress. They are original reviewer notes, not BoardPal sheets or full question/alternative-answer exports. Files are generated only after authenticated study content loads; question material is not bundled into public assets or hosted as public static PDFs.

The same library links to 12 verified official publisher PDFs and two publisher download/index pages, including the PRC 2025 nursing examination blueprint. It also links to all 46 BoardPal readers on their original site, where subscription access may be required. No paid sheet or third-party PDF is rehosted or included in the original-topic ZIP. `pdf-library-catalog.json` records this public resource metadata. `verify-pdf-library.mjs` builds and checks all 155 original topic PDFs and a complete ZIP in ignored QA outputs; `verify-pdf-layout.py` (pdfplumber and pypdf) checks page numbering, link annotations and text margins; representative pages are rendered for visual inspection. Unsafe proposals carry explicit AVOID / REQUIRES CORRECTION labels and the safe response. Existing question content and the protected database release stay unchanged.


## November 5 functionality review

See [FUNCTIONAL-AUDIT.md](FUNCTIONAL-AUDIT.md) for the observed BoardPal workflows, changes, and remaining differences. The comparison did not submit answers, start sessions, mark tasks complete, or change study settings on BoardPal.

`planning.ts` generates an actual complete schedule for every selected topic and all five mock boards, with subject focus, optional steps, rest days, workload warnings, stable task IDs, reversible catch-up scheduling, task editing/moving/skipping, and a UTF-8-safe ICS export. A moved task is an override of the same ID, not a new task. Undo only reverts the rescheduling it applied and keeps later edits. Old manual tasks and completed overrides are preserved. `plan` is optional in version-1 backups; older profiles get stable defaults anchored to their saved exam date. Only the personal target controls this planner; it is not an official examination schedule.

`TopicReviewNotes.tsx` uses the same sourced guide model as the PDFs to show all active original situational notes, including the expanded cases. It replaces the earlier reader branch that displayed only legacy case notes when a topic had an earlier case. Unsafe keyed proposals have explicit AVOID / REQUIRES CORRECTION text and safe-response context. PDFs remain Elaine-only; on-screen study notes remain available to all signed-in students.

`StudyTimer.tsx` implements configurable focus/short-break/long-break cycles, optional automatic starts, a previewable soft tone and volume, stopwatch, and per-day/7-day focus-hour charts. Breaks never count toward study hours. Timers pause on leaving/reloading, profile switching, and opening a timed assessment. Timer settings and daily totals sync with that profile; the paused display is stored per UID in tab storage. The profile-switch path collects pending timer credits before saving, and ordinary credits check the active UID. Existing total study hours remain; daily history starts with sessions recorded after this update.

`mock-papers.ts` selects complete linked situations in a fixed order for each new section and disjoint IDs across the five new boards. It requires a complete 100-item section and refuses to start if the current content cannot supply it. It does not edit or migrate saved sessions. `StudyTargets` shares the same calculated milestones on the dashboard and performance page. Subject estimates require ten first tries, and the overall estimate requires forty. The performance page adds personal bests, a 26-week activity calendar, first-try weak-topic links, and confidence/mistake counts.

Vault offers an optional spaced review switch. The default keeps immediate clearing after a correct retry. In spaced mode new misses become due after seven days, and clearing takes two correct due reviews at least seven days apart; an early correct retry does not advance the schedule and a new miss resets it. Existing unscheduled backlog remains due when enabling the option. `vaultReviews` and `preferences.spacedVault` survive backup validation and profile sync. These learning changes do not alter first-try scoring or the shared question-bank release.
