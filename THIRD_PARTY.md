# Reference content, adaptations, and attribution

## Original situational case sets

The 4,340 records in `situational-questions.json` are newly written educational questions across 620 fictional situations. They do not reproduce BoardPal questions or official PNLE items. Each case and its alternative choices retain reference links. Nursing principles were checked against Open RN chapters listed below and the primary sources linked in `situational-evidence.json`, including WHO, CDC, NEI, NHS, NICE, the current AHA resuscitation guidance, and Philippine statutes published by LawPhil. Clinical facts inform original scenarios and explanations; these organizations do not endorse the reviewer. No blanket Creative Commons claim is made for external clinical guidance or legal websites. Source consistency and automated checks do not constitute independent clinical approval.

## Newly constructed Open RN questions

The 4,515 records in `concept-questions.json` are original multiple-choice designs constructed from reference definitions and explanatory tables in the following Open Resources for Nursing (Open RN) books. Existing textbook review questions, case-study question banks, and BoardPal questions were not imported. Reference descriptions are adapted under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Open RN; editors Kimberly Ernstmeyer and Elizabeth Christman; Chippewa Valley Technical College, Eau Claire, Wisconsin / WisTech Open:

- [Nursing Fundamentals, 2e (2024)](https://www.ncbi.nlm.nih.gov/books/NBK610815/)
- [Medical Terminology, 2e (2024)](https://www.ncbi.nlm.nih.gov/books/NBK607454/)
- [Health Alterations (2024)](https://www.ncbi.nlm.nih.gov/books/NBK613078/)
- [Nursing Health Promotion (2025)](https://www.ncbi.nlm.nih.gov/books/NBK615319/)
- [Mental Health and Community Concepts, 2e (2025)](https://www.ncbi.nlm.nih.gov/books/NBK616982/)
- [Nursing Pharmacology, 2e (2023)](https://www.ncbi.nlm.nih.gov/books/NBK595000/)
- [Nursing Management and Professional Concepts, 2e (2024)](https://www.ncbi.nlm.nih.gov/books/NBK610445/)
- [Nursing Advanced Skills (2023)](https://www.ncbi.nlm.nih.gov/books/NBK594492/)
- [Nursing Skills, 2e (2023)](https://www.ncbi.nlm.nih.gov/books/NBK596735/)
- [Nursing Assistant (2022)](https://www.ncbi.nlm.nih.gov/books/NBK599384/), also authored by Myra Reuter-Sandquist.

Changes: converted reference definitions and selected table relationships into four-choice questions; removed pronunciation guides and reference markers; selected alternative concepts; added answer and alternative explanations; assigned related reviewer topics. Each question identifies its source book, year, chapter, adaptation, and license. Every new choice has its own reference link. No endorsement by the original authors, editors, publisher, NLM, or NIH is implied.

Only content with a CC BY 4.0 license in its reference metadata was selected. Proprietary standardized diagnostic wording and other screened material are excluded. The source text was retrieved November 3, 2026 through the [documented NLM Books-OAI API](https://www.ncbi.nlm.nih.gov/sites/books/about/oai/?report=reader), using sequential requests. XML hashes and source-access details appear in `concept-review-report.json`. The raw cache is ignored and is not served by the app.

One source definition for radiofrequency ablation mixed cardiac conduction-system anatomy with tumor treatment. Before production deployment, its description and every alternative occurrence were replaced with newly worded, checked facts from the [National Cancer Institute Dictionary of Cancer Terms](https://www.cancer.gov/publications/dictionaries/cancer-terms/def/radiofrequency-ablation). The correction preserves question IDs and key positions; `reference-corrections.json` documents the source error and primary-reference check.

The glossary label “Ego synotic” was corrected to “Ego-syntonic,” matching the same chapter’s main text. The description and answer positions are unchanged; see `terminology-corrections.json`.

The evidence check establishes consistency with cited reference facts. It is not independent clinical approval. Some source content uses international terminology; Philippine laws and programs are covered by the separately authored topic questions and their official sources.

## Two corrected source items

The two published records in `supplemental-questions.json` were substantially
corrected from [openlifescienceai/medmcqa](https://huggingface.co/datasets/openlifescienceai/medmcqa),
training split, downloaded November 3, 2026. The published dataset-card metadata
identifies **Apache-2.0**. A copy is included as `apache-2.0.txt`, emitted as a
public build asset, and linked from the additions' answer attribution.

Citation: Ankit Pal, Logesh Kumar Umapathi, and Malaikannan Sankarasubbu.
*MedMCQA: A Large-scale Multi-Subject Multi-Choice Dataset for Medical domain
Question Answering*. Proceedings of Machine Learning Research 174:248–260,
2022. [Paper](https://proceedings.mlr.press/v174/pal22a.html).

The code repository's separate MIT license is not used as a substitute for the
Hugging Face data license. No endorsement by the dataset authors is implied.

## Published corrections

- `a89ad909-3924-4cf8-803b-f0b2530a84ce`: the source scenario and explanation disagreed about rash timing. Rewrote the scenario, changed option D and the key, and supplied per-choice explanations. References: [NHS roseola](https://www.nhs.uk/conditions/roseola/), [CDC measles](https://www.cdc.gov/measles/signs-symptoms/index.html), [CDC chickenpox](https://www.cdc.gov/chickenpox/signs-symptoms/index.html).
- `bf1f425b-d7e1-4ccf-98db-cc0fdd8237b2`: the source stem concerned absorption while its explanation concerned treatment resistance. Rewrote the scenario around adequate treatment trials and confirmed adherence, retained the clozapine key, and supplied per-choice explanations. Reference: [NICE CG178, recommendation 1.5.7.2](https://www.nice.org.uk/guidance/cg178/chapter/recommendations).

These changes are documented in `supplemental-corrections.json`, the individual
records' origin field, and their in-app source attribution. They were applied
before the collection's production publication. Source IDs are retained for
traceability; no previous production question IDs or keys were changed. These
checks are not independent professional clinical approval.

## Withheld research candidates

A 4,120-item screened candidate was prepared from the dataset. Clinical spot
checks found scenario/key mismatches, so the bulk candidate was **withheld from
student practice**. It is stored only in an ignored local review queue. The two
provisional bulk database releases are excluded by student row-level security;
the project owner retains their audit records. It is not counted as published
question content. The dataset's shared explanations do not establish a rationale
for each alternative, and structural validation does not establish correctness.

`import-medmcqa.py` documents deterministic screening, duplicate checks, topic
assignment, and the separation between the review queue and source-checked
additions. No BoardPal question text, answers, or rationales were fetched for
this work.
