# Framework Reference Layer

Step 1 of the multi-assessment schema plan. This layer makes the Muscle-Meta
Matrix (MM) framework — 4 Pillars × 12 Categories, GMMBB axis, modifying
factors, population overlays, convergence patterns, and the two risk-scale
systems — queryable data instead of constants duplicated across frontend
and backend code.

## Source of truth

`config/framework-taxonomy.json`, aligned to `01-canonical/FRAMEWORK.md`
v2.1.0 (via the `muscle-meta-design` skill's `references/framework.md`
implementation of that kernel). If this layer and the canonical document
ever disagree, the document wins and this layer is the bug — bump
`frameworkVersion.versionTag` in the JSON and re-run the seed mutation.

## Canon corrections applied (2026-09-16)

The `muscle-meta-design` skill carries two decisions that override `framework.md`:

1. **Nothing is gated.** No gated pillar, category, lock, tease or Founding Member
   tier. The `pillars` table has no `gated` field and none should be added.
   Entitlements attach to *products* (a course, program, saved history, clinician
   report), never to a region of the framework.
2. **Categories are numbered C1-C12 continuously** with canonical `P#-C#` ids
   (stored as `categories.categoryId`). Strength is P1-C4, Endurance is P1-C5.

## Tables (`convex/schema.ts`)

| Table | Rows | Purpose |
|---|---|---|
| `frameworkVersions` | versioned | Tracks which taxonomy version is current |
| `pillars` | 4 | Exercise & Mobility, Nutrition & Metabolism, Recovery & Stress, Balance & Brain Health |
| `categories` | 12 | Asymmetric 5-2-3-2 split across pillars, ids P1-C1 … P4-C12 — never divide evenly by 12 |
| `constructs` | 9 | Measurement constructs scored *inside* a category (e.g. Bone Density inside Balance) — never rendered as category labels |
| `gmmbbAxes` | 5 | Gut 25% / Muscle 25% / Metabolic 20% / Bone 15% / Brain 15% — diagnostic lens, pentagon, not the pillar radar |
| `modifyingFactors` | 6 | Influence category scores; never displayed as additional pillars |
| `populationOverlays` | 6 | Pickleball, Osteoporosis, GLP-1, Post-Hospital, Perimenopause, Postmenopause — re-weight categories, stack, never add pillars/categories |
| `convergencePatterns` | 11 (5 confirmed, 6 pending) | Co-occurrence signatures (e.g. CP-04 Osteosarcopenia Compound Risk). Only patterns with confirmed canonical names from `framework.md` are populated — CP-03 and CP-07–CP-11 are seeded as `dataStatus: "pending_registry_data"` placeholders because their trigger logic lives in `01-canonical/CONVERGENCE-PATTERNS.md`, which this build does not have access to. **Do not invent trigger logic to fill these in** — pull the real registry first. |
| `crossCuttingNodes` | 0 (seeded empty) | Same situation as convergence patterns — registry lives in `01-canonical/CROSS-CUTTING-NODES.md`, not yet available. Table exists now so adding the data later is a seed update, not a schema migration. |
| `riskTiers` | 5 | **MM Health Score** — consumer-facing, 0–100, **higher is better** (Optimized → Critical) |
| `clinicalRiskBands` | 5 | Generic raw-instrument stratification — **higher is worse**, percent-of-max-score (Minimal → Critical). Used by non-consumer-facing clinical assessments (e.g. CCRAF). Deliberately a separate table/shape from `riskTiers` so the two scales can never be accidentally merged in a query or component — CCRAF's raw score must never be shown to a consumer under the MM Health Score tier system. |

## Seeding

```
npx convex run seedFramework:seedFrameworkTaxonomy
```

(or trigger it from the Convex dashboard once the project exists). The
mutation upserts by natural key (`pillarKey`, `categoryKey`, etc.), so
re-running it after editing `config/framework-taxonomy.json` syncs changes
rather than duplicating rows — same pattern as `seedSurveyContent` in
`convex/surveys.ts`.

## Reading the taxonomy

`convex/framework.ts` exposes one query per table plus `getFullTaxonomy`,
which fetches everything in one round trip for dashboard/scoring-engine
use. Frontend TypeScript types mirroring these shapes live in
`src/types/framework.ts`.

## What Step 1 deliberately does not do

- No changes to `surveys` / `surveyQuestions` / `surveyResults` yet — those
  extensions (`assessmentKey`, `constructKey`, `gmmbbWeights`, structured
  `pillarScores`/`gmmbbScores` on results) are Steps 2–3.
- No scoring logic reads this layer yet — `convex/results.ts` is untouched.
- No UI reads this layer yet — no radar, no pentagon, no dashboard.
- Convergence patterns CP-03/07–11 and all cross-cutting nodes are
  intentionally incomplete pending source documents this build doesn't
  have (see table above). This is the one open dependency blocking a
  *complete* pattern-detection implementation in later steps — flag it if
  you can get access to `01-canonical/CONVERGENCE-PATTERNS.md` and
  `01-canonical/CROSS-CUTTING-NODES.md`.

This keeps the foundation stable so Step 2 (generalizing the assessment
catalog and submission/result tables) builds on top of it without having
to revisit these tables.
