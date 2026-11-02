"""Editorial candidate screening only; similarity is not a duplicate verdict."""
import json, math, re
from collections import Counter
from pathlib import Path
directory = Path(__file__).parent / "outputs" / "situational-audit"
cases = json.loads((directory / "current-cases.json").read_text(encoding="utf-8"))
stop = set("a an the and or to of for with in on at is are has have this that as by from before after client patient nurse care prescribed appropriate plan assess assessment review new possible requiring without current its their it all through under according".split())
tokens = []
for case in cases:
    facts = case.get("facts", [])
    text = " ".join([case["scenario"], case.get("problem", facts[0]["text"] if facts else ""), case.get("action", facts[1]["text"] if facts else "")])
    tokens.append(Counter(word for word in re.findall(r"[a-z]+", text.lower()) if word not in stop))
df = Counter(word for bag in tokens for word in bag)
vectors = [{word: (1 + math.log(count)) * math.log(1 + len(cases) / df[word]) for word, count in bag.items()} for bag in tokens]
lengths = [math.sqrt(sum(weight * weight for weight in vector.values())) for vector in vectors]
pairs = []
for i, left in enumerate(cases):
    for j in range(i + 1, len(cases)):
        right = cases[j]
        if not (left["id"].endswith("-R2") or right["id"].endswith("-R2")):
            continue
        score = sum(weight * vectors[j].get(word, 0) for word, weight in vectors[i].items()) / (lengths[i] * lengths[j])
        if score >= 0.35:
            pairs.append({"similarity": round(score, 3), "a": left["id"], "b": right["id"], "aScenario": left["scenario"], "bScenario": right["scenario"]})
pairs.sort(key=lambda pair: -pair["similarity"])
(directory / "replacement-similarity-candidates.json").write_text(json.dumps(pairs, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(pairs, indent=2, ensure_ascii=False))
