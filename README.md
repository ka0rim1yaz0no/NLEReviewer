# NLE Reviewer

A BoardPal-inspired nursing study app with username profiles, private progress, and no subscriptions or payments. The paid BoardPal question bank is not copied or connected to this app.

## Published content

**5,168 questions across all 155 catalog topics**, including **5,166 original question designs** and two previously published, substantially corrected source items:

| Question format | Count |
| --- | ---: |
| Clinical and standalone originals | 651 |
| Original source-based concept checks | 3,758 |
| Original reference-comparison questions | 757 |
| Corrected supplemental source items | 2 |

The original-design total exceeds the requested minimum of 4,771. The 651 prior originals consist of 600 questions within 120 five-part clinical scenarios and 51 individually authored topic questions. The 4,515 new items are newly constructed four-choice questions based on licensed Open RN reference definitions and explanatory tables, not existing textbook review questions. They test terminology, anatomy, mechanisms, findings, functions, and care principles. They are not 4,515 new clinical vignettes. Use the collection picker to study each format separately.

Every published item has four choices, a key, an answer explanation, and a rationale for every choice. Each new item's key and all alternatives are matched to specific source facts; its source book/chapter and adaptation credit are displayed in the answer review, with per-choice reference links. A second parser checked the 4,517 factual records against the cached reference XML, covering 18,060 choice explanations with zero extraction mismatches. Editorial review then caught one erroneous source definition; all three affected questions were corrected against the National Cancer Institute, documented in `reference-corrections.json`, and published in a new release. This verifies source consistency, **not independent professional clinical review** or the currency of every clinical statement. Independent clinical/editorial review remains pending.

The factual catalog retains all **155 reference topic names** and the observed **9,541-question distribution** (13–206 per topic), observed November 2, 2026. All topics have related practice; depth varies and some specialized topics still have only one item. Related questions can support multiple topics and count only once in the bank total. This app does not claim to match BoardPal's question content or per-topic depth.

`question-bank.json` contains all expanded published records. `concept-questions.json` freezes the new question designs; `concept-evidence.json` identifies the reference fact behind each key and alternative; `concept-review-report.json` records counts, checksums, source XML hashes, and review limits. See [THIRD_PARTY.md](THIRD_PARTY.md) for attribution and licensing.

A proposed 4,120-item MedMCQA research candidate remains withheld after spot-checks found scenario/key mismatches. It is not counted or available in practice. The two provisional bulk database releases and the superseded first concept-bank candidate remain excluded by row-level security. Only the two separately corrected source items are published from that dataset.

## Study features

- Tutor mode with immediate explanations; exam mode with deferred grading, blanks counted as incorrect, and full result review.
- Custom subject/topic sets, new/missed filters, timers, saved sessions, flags, elimination, confidence, highlights, pen annotations, scratch notes, bookmarks, and question notes.
- Counted Needs work, Not started, Flagged, and Saved topic filters; per-topic redo-miss sets; preserved first-try scores and a Vault for unresolved misses.
- Five mock variants, each with five 100-item, two-hour sections; a balanced 30-item diagnostic. These use and reshuffle the original nursing bank and are not independent official papers.
- All 155 topics connected to flashcards, spaced review, resource notes, the planner, and calendar export. Shared topic/resource notes, gathered My Notes, Anki text/TSV/CSV import, and legacy deck/resource links.
- History, performance, milestones, profile/settings, theme and text-size preferences, JSON backups, and authorized personal question imports.
- Username profiles backed by separate Supabase identities, isolated progress, cloud sync, retry controls, and a responsive mobile layout.
- Format filters for clinical/standalone questions, concept checks, reference comparisons, and the two corrected source items. Quick practice, diagnostics, mocks, topic decks, and daily flashcards mix original nursing designs and personal imports. Custom practice and flashcards can focus on one format.

Large sessions render at most 100 navigator buttons at a time. This keeps phone rendering bounded while every question remains reachable. The full bank is available to custom sets; counts are capped at the actual selection. Resource key points load 20 at a time. Question-library and result reviews render 10 at a time.

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
4. The browser checks the expanded question/case counts and a canonical SHA-256 digest before installing the bank. Missing, damaged, or incomplete content keeps saved progress intact and offers a retry. Students cannot modify shared content. Visitors and anonymous-auth identities without a claimed username cannot retrieve answers or notes.
5. Deploy the matching client release. Older deployments continue using the original `study_content` table, which remains intact. `seed-content.mjs` and `protected-content.sql` remain available for that legacy format. New compressed releases stage separately; publishing a manifest never exposes a half-loaded bank.

The public JavaScript contains no question stems, keys, case payloads, or bank exports. The repository's authoring source contains answers and is outside the app's username gate; making the repository private is a separate account setting. Copies already downloaded are likewise outside this gate.

Username access is **pseudonymous and browser-remembered**, not verified identity. Anyone using the same browser can reopen remembered profiles. Knowing a username on another browser does not reveal its session or records. Export a backup before clearing storage or moving devices. The app does not promise cross-device recovery using a username alone.

Active identity is separate per tab; cloud reads/writes use the Supabase UID. Switching profiles saves and hides the prior workspace first. Backups contain study data, not authentication tokens. Concurrent edits to the same profile are last-write-wins. A failed cloud read does not overwrite cloud data with a stale local snapshot.

`node --experimental-strip-types verify-backend.mjs` creates clearly named QA profiles to check unsigned/unclaimed denial, username uniqueness, complete release integrity, denied shared-bank writes, withdrawn-release denial, and cross-profile isolation. It does not inspect existing students' records.

## Imports and editorial review

Settings supports authorized JSON imports with unique IDs/stems, a subject (`CROSS`, `NP1`–`NP5`), topic, stem, four choices with explanations, `correctIndex` (0–3), and a rationale. Optional fields include a source URL, origin, and key point. Personal imports remain in that profile.

`node --experimental-strip-types prepare-bank.mjs authorized-questions.json --check-only` validates a proposed site-wide batch without changing the published bank. Without `--check-only`, it appends valid records to `site-questions.json`. Preserve published IDs, choice order, and keys; changes could invalidate saved answers. Generate a **new immutable release ID**, review it, stage its pages, and publish its manifest last. Structural validation is not clinical validation or permission to republish: obtain the provider's reuse rights before importing its content.

`audit-bank.mjs` writes actual unique counts, topic assignments, related coverage, duplicates, and reference targets. `--require-match` fails while the actual distribution differs from the 9,541-question reference. Regression checksums preserve all 653 previously deployed records, including their choice order, keys, explanations, and IDs. Public counts are generated from the real authoring bank at build time.

For the withheld research candidate, `import-medmcqa.py` reads the public training parquet at `outputs/medmcqa-train.parquet` (pandas and pyarrow required). It writes the 4,120 screened candidates to **`outputs/supplemental-review.json`**, never directly to student practice. Only the two explicitly source-checked corrections enter `supplemental-questions.json`. Source data SHA-256: `b119434ba551517a6ec0ba1f7e0b4c029165ed284a4704f262ce37c791c493c5`. Filtering and duplicate checks cannot establish clinical correctness. New content needs primary-reference checks and independent clinical/editorial review.

## Original reference-question preparation

`collect-openrn.py` retrieves only CC BY 4.0 Open RN reference text through NLM’s documented Books-OAI API, using sequential requests and an ignored local XML cache. It never crawls paid content or imports a textbook question bank. `prepare-openrn.py` removes pronunciation aliases and duplicate definitions, screens unsuitable references, and selects explanatory table relations. `openrn-topic-map.py` assigns related catalog topics using explicit editorial rules.

`build-concept-bank.py` creates a candidate in `outputs/openrn/`; it does not publish. Choices come from related reference concepts, with synonym/overlap checks, stable concept IDs, and fact-specific explanations. `verify-openrn.py` re-parses the source XML and checks every candidate key and alternative against its definition or table cell. Foreign legal/accreditation rules, proprietary diagnostic wording, dependent table rows, uncertain mechanisms, and selected outdated terms are excluded.

After editorial checks, `freeze-concept-bank.py` promotes a source-verified candidate and refuses to change any already frozen record. Preserve existing IDs and options when adding questions; do not regenerate the live bank with a different distractor pool. A clinical correction requires a deliberate reviewed release that accounts for saved progress. `correct-reference-facts.py` applies the documented NCI correction to every keyed/alternative occurrence without shuffling choices. `format-reference-facts.py` preserves reference line breaks and copyedits comparison prompts and explanations without changing the reference words, choice labels, order, or keys. Generate a new immutable content release, stage all its pages, and publish its manifest last.

## Verification and limits

Automated checks cover bank structure, unique stems, answer keys, old-content checksums, scoring, retries, blanks, exam submission, backup/import validation, dates, streaks, scheduling, topic resolution, collection filters, username gating, compressed release integrity, and source corrections. Browser checks cover actual study flows and phone layout. Passing these checks does not guarantee zero defects or validate every clinical claim.

The interface was informed by the reference's dashboard, practice, mock sections, planner, cards, resources, Vault, performance, history, achievements, profile, and settings. Subscription/payment, shared ranking, testimonials, and support messaging were omitted. No answers were submitted on the user's BoardPal account.
