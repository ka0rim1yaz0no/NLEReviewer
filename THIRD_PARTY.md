# Source-based additions and attribution

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
