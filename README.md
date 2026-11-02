# NLE Reviewer

A BoardPal-inspired nursing review application focused on useful study tools. No subscriptions, checkout, paywalls, or paid access tiers.

## Included

- **600 original questions** in 120 five-question scenarios across 61 topics. Fundamentals and NP1–NP5 each contain 100 questions.
- Four choices per question, a correct answer, a rationale, and an explanation for each alternative. Questions cover recognition, action, teaching, evaluation, and safety.
- Tutor and exam modes; custom subject/topic selection; unanswered and missed filters; timers; persistent sessions; flags, elimination, confidence, highlighting, pen annotations, and scratch notes.
- Five mock variants, each containing five 100-item, two-hour sections. Variants reuse and reorder the subject bank, rather than claiming 2,500 independent questions.
- A balanced 30-question diagnostic; result review; first-try performance; history; saved questions and notes; study milestones.
- Flashcards with a spaced-review schedule; custom decks; Anki text/TSV/CSV import; topic notes; a study plan and calendar export.
- Local progress, JSON backups, authorized question imports, and optional Supabase authentication and per-user cloud sync.

The source content is **not the proprietary BoardPal question bank** and is not an official PNLE paper. The question sets and short summaries require independent clinical/editorial review before production educational use. No BoardPal answers were submitted during reference inspection.

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

1. Choose the intended Supabase project. Run `supabase.sql` once in its SQL Editor. The table has row-level security; authenticated users can access only their own state. Anonymous database access is revoked.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel and, for local development, in an ignored `.env.local`. Use the project's public publishable key. **Never use a service-role or secret key in browser code.**
3. Set the Supabase Auth Site URL to the deployed URL and allow `<deployed-url>/dashboard` and `http://127.0.0.1:5173/dashboard` as redirects. Email magic-link sign-in works with the project's email provider.
4. GitHub sign-in is optional. Enable the GitHub provider in Supabase and configure the GitHub OAuth application before using the button.
5. Redeploy after changing Vercel environment variables; Vite embeds public values at build time.

Guest and authenticated workspaces are stored separately. Signing in does not silently upload a different person's guest progress. To move guest progress into an account, export it, sign in, and restore the backup. Cloud snapshots use the most recently updated state; simultaneous edits on different devices are last-write-wins. Keep backups before editing across multiple devices. If sync is unavailable, local study continues and the status states the limitation.

## Question imports

Use Settings → Download sample format. Import a JSON array with unique `id`, a `subject` (`CROSS`, `NP1`–`NP5`), `topic`, `stem`, four `options` objects (`text`, `rationale`), `correctIndex` (0–3), and `rationale`. Optional fields are `keyPoint`, `source`, and `origin`. Import only content you are authorized to use. Settings can export the entire available bank.

## Reference and verification

The interface was informed by the accessible BoardPal dashboard, practice setup and question view, mock sections, planner, flashcards, resources, vault, performance, history, achievements, profile, and settings. Subscription/payment, shared ranking, testimonials, and support-message services were intentionally omitted.

The palette matches the reference's cream (#F5F0E8), forest (#1B3A2D), gold (#C8935A), with Gloock display and Instrument Sans body typography. The app is responsive, supports keyboard navigation and reduced motion, and has light, white, dark, and system appearances.

Automated tests cover bank structure and count, answer distribution, scoring idempotency, exam submission, blanks, first-try preservation, vault behavior, rating gates, dates, streaks, spaced reviews, and imports. Browser checks verify the actual study flows. Passing checks cannot guarantee the absence of every defect or validate all clinical claims.

Further reading: [Open RN library](https://www.ncbi.nlm.nih.gov/books/NBK590025/), [CDC standard precautions](https://www.cdc.gov/infection-control/hcp/basics/standard-precautions.html). Use current local protocols and official PRC materials for clinical and examination requirements.
