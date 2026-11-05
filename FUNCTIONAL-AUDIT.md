# BoardPal workflow comparison — November 5, 2026

This review used the signed-in BoardPal interface to inspect dashboard, custom-practice setup, study-plan settings, timer, flashcards, performance, history, mock-board catalog, Vault, and account settings. Resource and reference metadata from the preceding PDF review remain applicable. No BoardPal practice or mock session was started, no answer was submitted, no task was marked complete, and no study setting was saved there. Dismissing introductory walkthroughs only changed their presentation state.

This is a functional comparison and an implementation record, not a claim that the applications or their paid content are identical. BoardPal's question bank, answer rationales, sheet text, illustrations, and curated flashcards are not copied. The current reviewer still has 9,663 active questions, including 5,095 original situational questions across 155 topics. The protected clinical-content release is unchanged.

| Workflow | Observed reference behavior | Reviewer behavior after this change |
| --- | --- | --- |
| Dashboard | Daily tasks, unfinished-session links, subject practice, subject/rating/mock milestones | Retains daily tasks and resume links; adds calculated three-part study targets, five subject estimates, and the next incomplete mock link. |
| Practice | 155 topics; subject mixes; new, missed and flagged filters; per-topic retry | Retains these workflows plus question-collection filters and complete original question/alternative explanations. Counts reflect the actual reviewer bank. |
| Custom practice | Topic/subject selection, counts, practice/exam mode, per-question timer | Retained. Immediate tutor feedback and deferred exam grading remain covered by regression checks. |
| Mock boards | Five boards; five 100-item sections with a two-hour section clock; saved progress | New sections use fixed disjoint selections, preserving complete seven-part situations. Saved earlier sections retain their original IDs and answers. These are selections from the shared original bank, not copies of BoardPal papers. |
| Study-plan setup | Date range, daily time, rest days, section/focus choices, reading/cards steps | Adds equivalent configuration around the original content. Every selected topic is scheduled; insufficient time is reported, never hidden by dropping topics. |
| Study-plan operation | Calendar views, task actions, catch-up, rebalance, whole-plan/section progress, mock milestones, calendar export | Adds task editing/moving/skipping/restoring, load-balanced catch-up with undo, full-range rebalance, subject progress, mock-section tasks, and real-month navigation. Legacy/custom tasks survive. |
| Study timer | Configurable focus/short/long cycles, optional automatic phases, sound/volume, stopwatch, daily/weekly hours | Adds focus and break cycles, optional automatic phases, a soft tone with volume/preview, stopwatch, daily/7-day charts, and UID-checked accounting. Breaks are excluded. Timer pauses on leaving/reload/profile switch/timed assessment. |
| Vault | Immediate retry clearing and optional weekly spaced review with two successful spaced retries | Adds the optional seven-day schedule. Existing backlog remains due when first enabled. An early retry does not advance it; a new miss resets it. First-try history is preserved. |
| Flashcards | Due/new queue, weak-spot focus, topic selection, custom decks, Anki text import | Existing spaced-review engine and imports remain. The reviewer uses its own 155 topic decks and scenario cards, which differ from BoardPal's curated fact decks. |
| Topic readers | Structured online study notes and completion tracking | Fixes a legacy-only reader branch. All active original scenario notes now feed both topic details and resource readers, with explicit unsafe-action labels and linked sources. |
| Resources/PDFs | BoardPal online cram readers and publisher resources | Keeps 155 original PDF guides, 12 official PDF links, 2 publisher pages, and links to all 46 BoardPal online readers. PDF controls and the route are visible only to canonical username `elaine`, as requested. |
| Performance | First-try estimates, subject/topic breakdowns, activity calendar, personal bests, weak areas, confidence feedback | Retains first-try scoring and adds shared study targets, personal bests, a 26-week activity calendar, weak-topic practice links, and confident-mistake counts. Subject estimates require 10 first tries; the overall estimate requires 40. |
| History | Practice/mock/diagnostic filters and reopening earlier work | Retained. Saved session IDs, option positions, and answer keys are unchanged. |
| Account | Separate identity, profile/preferences, theme, study goals | Retains username-only Supabase profiles by the user's earlier instruction, isolated progress, backups, imports, and theme/reading preferences. Editable display names cannot grant PDF visibility. |

## Differences that remain

- BoardPal's curated paid questions, papers, reference sheets, and flashcard wording remain BoardPal content. The original question and note collections have different structure and per-topic depth. Clinical reference checks are not independent clinician approval.
- The reviewer uses a strict consecutive-day streak. It does not implement BoardPal's periodic streak-saver grace rule.
- The timer supplies one synthesized soft tone; BoardPal offers several sound choices and repeat/ring-duration options.
- The reviewer presents mock-section scores and completion milestones. It does not reproduce BoardPal's aggregate-board readiness tiers or their prediction model.
- Review confidence labels and minimum sample sizes are this reviewer's study-feedback rules, not verified equivalents of BoardPal's statistical methods.
- Subscription/payment, public ranking, testimonials, community/support messaging, push reminders, installation prompts, and product changelogs are outside the question/topic study scope selected earlier. No message, notification subscription, or external account setting was changed.

## Verification record

Automated coverage includes complete topic scheduling, unique stable task IDs, valid settings/rest days, overload reporting, preserved overrides, reversible catch-up, real-month navigation, folded UTF-8 calendar events, focus/break accounting, automatic timer cycles, Manila midnight splits, canonical username PDF visibility, fixed disjoint mock selections, weekly Vault reviews, and the existing question/answer/backup regressions.

Browser verification uses the existing `StudyCheckB` QA profile on the local preview and a separately named QA profile on production. It checks direct PDF denial, absent PDF/print links for other usernames, mobile layouts, complete topic-reader notes, task controls, planner settings/persistence, catch-up/undo, calendar/download behavior, timer cycles, profile isolation, and mock navigation. QA artifacts and the published deployment evidence are kept in ignored `outputs/functionality-review/`.

## Reference pages

- [Dashboard](https://www.nleboardpal.com/dashboard)
- [Practice](https://www.nleboardpal.com/practice) and [custom setup](https://www.nleboardpal.com/practice/session)
- [Study plan](https://www.nleboardpal.com/schedule)
- [Flashcards](https://www.nleboardpal.com/decks)
- [Mock boards](https://www.nleboardpal.com/mock)
- [Vault](https://www.nleboardpal.com/vault)
- [Performance](https://www.nleboardpal.com/performance) and [history](https://www.nleboardpal.com/history)
- [Resources](https://www.nleboardpal.com/resources) and [public cram-sheet catalog](https://www.nleboardpal.com/pnle/cram-sheets)
- [Settings](https://www.nleboardpal.com/settings)
