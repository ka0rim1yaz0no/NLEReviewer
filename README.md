# NLE Reviewer

A BoardPal-inspired nursing review application focused on useful study tools. A username profile is required to open study questions and rationales. No subscriptions, checkout, paywalls, or paid access tiers.

## Included

- **600 original questions** in 120 five-question scenarios across 61 topics. Fundamentals and NP1–NP5 each contain 100 questions.
- The **complete 155-topic reference catalog** and its observed **9,541-question distribution** (13–206 per topic), with the observed 12/32/22/29/37/23 subject structure, topic pages, notes, exact topic search, and custom multi-topic selection. Existing original questions are linked as related practice; missing content is labeled explicitly. Topic names do not imply the proprietary source question bank has been copied.
- Four choices per question, a correct answer, a rationale, and an explanation for each alternative. Questions cover recognition, action, teaching, evaluation, and safety.
- Tutor and exam modes; custom subject/topic selection; unanswered and missed filters; timers; persistent sessions; flags, elimination, confidence, highlighting, pen annotations, and scratch notes.
- Five mock variants, each containing five 100-item, two-hour sections. Variants reuse and reorder the subject bank, rather than claiming 2,500 independent questions.
- A balanced 30-question diagnostic; result review; first-try performance; history; saved questions and notes; study milestones.
- Flashcards with a spaced-review schedule; custom decks; Anki text/TSV/CSV import; topic notes; a study plan and calendar export.
- Username-only study profiles, per-profile local progress and Supabase cloud sync, JSON backups, and authorized question imports.

The source content is **not the proprietary BoardPal question bank** and is not an official PNLE paper. The question sets and short summaries require independent clinical/editorial review before production educational use. No BoardPal answers were submitted during reference inspection.

[question-bank.json](question-bank.json) contains all 600 expanded question records, including answer keys and every choice's rationale, for direct review without running the app.

## Run locally

```sh
npm install
npm run dev
npm test
npm run build
```

Open the URL printed by Vite. Direct routes such as `/practice`, `/questions`, `/decks`, and `/resources` work in development and on Vercel.

## Vercel

Import `ka0rim1yaz0no/NLEReviewer` into Vercel. The included `vercel.json` selects Vite, runs `npm run build`, serves `dist`, and rewrites app routes to `index.html`. No paid Vercel features are required.

## Supabase

1. Choose the intended Supabase project. Run `supabase.sql` and then `username-profiles.sql` once in its SQL Editor. Both tables have row-level security; signed-in profiles can access only records matching their Supabase user ID. Unauthenticated database access is revoked.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel and, for local development, in an ignored `.env.local`. Use the project's public publishable key. **Never use a service-role or secret key in browser code.**
3. Generate the protected bank with `node --experimental-strip-types seed-content.mjs`. Run the generated `outputs/protected-content-seed.sql` in Supabase SQL Editor. The `study_content` table permits reads only for signed-in identities with a claimed username; visitors and unclaimed anonymous-auth identities cannot read questions, answers, rationales, or topic notes. Students cannot edit the shared bank.
4. In Authentication → Sign In / Providers, enable **Allow anonymous sign-ins**. Each username profile receives a separate Supabase anonymous-auth identity in the `authenticated` database role. No email sender, email confirmation, password, or social provider is needed.
5. Redeploy after changing Vercel environment variables; Vite embeds public values at build time.

Usernames are case-insensitively unique and limited to 40 characters. This is a **pseudonymous, browser-remembered study profile**, not verified identity. The browser remembers each profile's private Supabase session; anyone using that same browser can reopen its remembered profiles. Knowing a username on a different browser does not grant access to its records. Choose a new username and import a backup to move progress to another browser, or return to the original browser. Clearing browser storage without a backup can lose access to the profile.

The active identity is kept separately in each tab, so opening a second student's profile in another tab does not replace the first tab's identity. Local snapshots are keyed by Supabase user ID, and every cloud read/write is protected by `auth.uid() = user_id`, never by a display name. Switching profiles saves the current workspace before opening the chooser. Backups contain study data, not authentication sessions. Cloud snapshots use the most recently updated state; concurrent edits to the same profile are last-write-wins. If sync is unavailable, local study continues and the status states the limitation. The app requires the configured Supabase connection and a username profile. Missing configuration keeps study routes closed. The public JavaScript bundle contains no question stems, answer keys, or clinical case payloads. Previously downloaded content and copies of the authoring source are outside this application access control.

Run `node --experimental-strip-types verify-backend.mjs` against a configured development project to verify unauthenticated denial, username uniqueness, and isolation of two signed-in profiles. This creates two small, clearly named QA profiles; it does not read or modify existing students' records.

## Question imports

Use Settings → Download sample format. Import a JSON array with unique `id`, a `subject` (`CROSS`, `NP1`–`NP5`), `topic`, `stem`, four `options` objects (`text`, `rationale`), `correctIndex` (0–3), and `rationale`. Optional fields are `keyPoint`, `source`, and `origin`. Import only content you are authorized to use. Settings can export the entire available bank. Duplicate stems are rejected even when their IDs or punctuation differ.

For a larger bank shared by all students, use `node --experimental-strip-types prepare-bank.mjs authorized-questions.json --check-only` to validate a batch. Questions must use exact catalog topics, complete per-choice rationales, a source URL, and provenance. Remove `--check-only` to append the validated batch to `site-questions.json`. Regenerate and apply `outputs/protected-content-seed.sql`, then run the checks and commit. The browser retrieves the shared content after username sign-in and checks its complete manifest and checksum before opening saved progress. Site-wide content stays outside private progress snapshots, so each answer does not re-upload the question bank. Existing published IDs are preserved. This tool does not create questions or fetch the paid reference bank.

`node --experimental-strip-types audit-bank.mjs` writes `question-coverage.json` with actual unique counts, exact topic assignments, related practice, duplicates, and reference targets. Add `--require-match` for a failing exit code while the actual bank differs from the reference distribution. The built-in 600 original questions do **not** fulfill the 9,541-question reference target. Counting the same related question under multiple topics does not increase the unique-question total.

## Reference and verification

The interface was informed by the accessible BoardPal dashboard, practice setup and question view, mock sections, planner, flashcards, resources, vault, performance, history, achievements, profile, and settings. Subscription/payment, shared ranking, testimonials, and support-message services were intentionally omitted.

The palette matches the reference's cream (#F5F0E8), forest (#1B3A2D), gold (#C8935A), with Gloock display and Instrument Sans body typography. The app is responsive, supports keyboard navigation and reduced motion, and has light, white, dark, and system appearances.

Automated tests cover bank structure and count, answer distribution, scoring idempotency, exam submission, blanks, first-try preservation, vault behavior, rating gates, dates, streaks, spaced reviews, and imports. Browser checks verify the actual study flows. Passing checks cannot guarantee the absence of every defect or validate all clinical claims.

Further reading: [Open RN library](https://www.ncbi.nlm.nih.gov/books/NBK590025/), [CDC standard precautions](https://www.cdc.gov/infection-control/hcp/basics/standard-precautions.html). Use current local protocols and official PRC materials for clinical and examination requirements.
