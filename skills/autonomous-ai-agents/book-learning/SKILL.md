---
name: book-learning
description: |
  Ingest a book/PDF, distill it into durable skill knowledge, apply it
  in future tasks automatically. Reuses ocr-and-documents (extraction)
  + skill-creator pattern (persistence). Load whenever user provides a
  book/PDF to "learn from."
version: 1.0.0
metadata:
  loki:
    tags: [pdf, learning, memory, skill-creation]
    related_skills: [ocr-and-documents]
---

# Book Learning

## Pipeline
```
1. extract       -> ocr-and-documents skill (pymupdf/marker) -> raw text
2. distill        -> summarize per chapter/section into: concepts,
                      rules, formulas, examples (NOT verbatim text)
3. persist         -> write distilled notes into:
                      skills/<domain>/<book-slug>/SKILL.md
                      + references/<topic>.md for details
4. index          -> append one-line pointer to skills DESCRIPTION.md
                      so future sessions auto-discover it
5. apply          -> on next relevant task, load that skill like any
                      other (no need to re-read the PDF)
```

## Distillation rules
- Never store copyrighted full text — rules/formulas/worked-method
  summaries only, in your own words.
- One SKILL.md per book; split large books into references/*.md by
  chapter/topic, keep SKILL.md as an index.
- Tag with subject (e.g. jee-physics, trading-strategy) so it surfaces
  for the right future task.

## Command
```
learn_book(path_or_url, domain, output_skill_name)
  -> runs steps 1-4, reports: "<N> concepts saved to skills/<domain>/<name>/"
```

## Scope limit
This persists knowledge and lets Loki use it in later tasks. It does
not remove Loki's safety limits — distillation still refuses to
reproduce copyrighted passages verbatim and skips unsafe content
(e.g. weapons/CBRN synthesis detail) same as normal.
