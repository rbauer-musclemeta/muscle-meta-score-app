# Convex Functions Spec

## Purpose
Define the first-pass backend function map for the Muscle-Meta assessment app using Convex.

This spec covers:
- survey read operations
- submission lifecycle
- catabolic crisis scoring
- functional scorecard scoring
- pathway routing
- result object generation
- reassessment comparisons

---

## Function groups

### Survey read functions
These load survey content into the frontend.

#### `getSurveyBySlug`
**Type:** query

**Inputs**
- `slug: string`

**Returns**
- survey metadata
- ordered questions
- ordered options
- intro copy
- disclaimer copy

**Use**
- load `catabolic-crisis-screen-v1`
- load `functional-decline-muscle-risk-scorecard-v1`

---

#### `listActiveSurveys`
**Type:** query

**Inputs**
- none

**Returns**
- active survey list with title, slug, type, version

**Use**
- admin UI
- content validation
- multi-entry flows later

---

### Submission lifecycle functions

#### `startSubmission`
**Type:** mutation

**Inputs**
- `surveySlug: string`
- `userId?: Id<"users">`
- `entrySource?: string`
- `deviceType?: string`
- `appVersion?: string`

**Writes**
- `surveySubmissions`

**Returns**
- `submissionId`
- survey id
- started timestamp

**Use**
- create a submission before saving responses

---

#### `saveResponse`
**Type:** mutation

**Inputs**
- `submissionId: Id<"surveySubmissions">`
- `questionId: string`
- `selectedOptionId?: string`
- `selectedValue?: string | number`
- `selectedLabel?: string`
- `score?: number`

**Writes**
- insert or update a `surveyResponses` row for the question

**Returns**
- success state

**Use**
- autosave per question
- save on next button
- resume unfinished flows later

---

#### `completeSubmission`
**Type:** mutation

**Inputs**
- `submissionId: Id<"surveySubmissions">`

**Writes**
- marks submission complete

**Returns**
- completion metadata

**Use**
- final screen submit

---

## Catabolic crisis scoring functions

#### `scoreCatabolicCrisis`
**Type:** mutation or action

**Inputs**
- `submissionId: Id<"surveySubmissions">`

**Reads**
- `surveyResponses`
- survey definition if needed

**Computes**
- total score from the 3 scored catabolic questions
- risk band
- red flags
- dominant driver
- initial pathway routing
- primary and secondary CTA keys

**Writes**
- `surveyResults`
- `userPathways`

**Returns**
- catabolic result object

---

#### `applyCatabolicOverrideRules`
**Type:** internal helper

**Inputs**
- normalized response set
- current score band

**Rules**
- if medical event score >= 3, set minimum pathway = `active_catabolic_recovery`
- if weight/appetite/muscle-loss score >= 3, set minimum pathway = `active_catabolic_recovery`
- if activity drop score == 4, set minimum pathway = `active_catabolic_recovery`
- if driver = `multiple` and total score >= 6, set pathway = `high_risk_catabolic_crisis`

**Returns**
- final pathway state
- red flag messages
- escalation flags

---

#### `resolveCatabolicDriverPathway`
**Type:** internal helper

**Inputs**
- driver question answer
- final risk band

**Returns**
- driver-based pathway tag:
  - `post_illness_recovery`
  - `post_surgery_immobilization`
  - `sedentary_deconditioned_recovery`
  - `weight_loss_muscle_preservation`
  - `complex_catabolic_recovery`
  - `general_catabolic_recovery`

---

## Functional scorecard functions

#### `scoreFunctionalScorecard`
**Type:** mutation or action

**Inputs**
- `submissionId: Id<"surveySubmissions">`

**Reads**
- `surveyResponses`

**Computes**
- question-level scores
- category raw scores
- category labels
- pillar raw scores
- pillar normalization percentages
- total functional score
- overall result band
- lowest category
- highest category
- lowest pillar
- highest pillar

**Writes**
- `surveyResults`
- `resultCategoryScores`
- `resultPillarScores`
- optionally `userPathways`

**Returns**
- functional result object

---

#### `mapCategoryScores`
**Type:** internal helper

**Inputs**
- normalized response set

**Returns**
- category score map keyed by:
  - `joint_health`
  - `functional_independence`
  - `mobility`
  - `balance`
  - `recovery`
  - `endurance`
  - `strength`
  - `nutrition`
  - `lifestyle`
  - `brain_health`
  - `stress_management`
  - `metabolic_flexibility`

---

#### `mapPillarScores`
**Type:** internal helper

**Inputs**
- category score map

**Returns**
- pillar score map:
  - `exercise_mobility`
  - `nutrition_metabolism`
  - `recovery_stress`
  - `balance_brain_health`

**Pillar mapping**
- `exercise_mobility`
  - joint_health
  - functional_independence
  - mobility
  - endurance
  - strength
- `nutrition_metabolism`
  - nutrition
  - metabolic_flexibility
- `recovery_stress`
  - recovery
  - lifestyle
  - stress_management
- `balance_brain_health`
  - balance
  - brain_health

---

#### `normalizePillarScores`
**Type:** internal helper

**Inputs**
- pillar raw scores
- pillar max scores

**Returns**
- normalized percentages

**Formula**
`(pillarRawScore / pillarMaxScore) * 100`

---

#### `resolveFunctionalResultBand`
**Type:** internal helper

**Inputs**
- total functional score

**Returns**
- result label:
  - `resilient_reinforce_foundation`
  - `stable_early_weak_links`
  - `early_functional_decline_pattern`
  - `muscle_resilience_at_risk`
  - `higher_functional_decline_risk`

---

## Combined results and routing functions

#### `buildCombinedResult`
**Type:** mutation or action

**Inputs**
- `userId?: Id<"users">`
- `catabolicSubmissionId?: Id<"surveySubmissions">`
- `functionalSubmissionId?: Id<"surveySubmissions">`

**Purpose**
Merge catabolic crisis output and functional scorecard output into one frontend-ready result state.

**Returns**
- top result summary
- risk band
- pathway summary
- primary CTA
- secondary CTA
- alert messages
- category and pillar breakdowns
- next-step recommendation

---

#### `assignPrimaryPathway`
**Type:** internal helper

**Inputs**
- catabolic result
- functional result

**Rules**
- if catabolic pathway is `high_risk_catabolic_crisis`, it wins
- if catabolic pathway is `active_catabolic_recovery`, it overrides standard functional routing
- if no catabolic flag, route from weakest functional pillar/category
- if both are present, attach functional focus as secondary recommendation

**Returns**
- primary pathway
- secondary pathway
- CTA set

---

## Result read functions

#### `getResultBySubmissionId`
**Type:** query

**Inputs**
- `submissionId: Id<"surveySubmissions">`

**Returns**
- top-level result
- category scores
- pillar scores
- pathway rows
- CTA keys

---

#### `getLatestResultsForUser`
**Type:** query

**Inputs**
- `userId: Id<"users">`

**Returns**
- latest catabolic result
- latest functional result
- latest combined result if stored

---

#### `getDashboardSummary`
**Type:** query

**Inputs**
- `userId: Id<"users">`

**Returns**
- most recent scores
- current pathway
- trend summary
- next reassessment target

---

## Reassessment and trend functions

#### `createReassessmentComparison`
**Type:** mutation or action

**Inputs**
- `userId: Id<"users">`
- `baselineResultId: Id<"surveyResults">`
- `followupResultId: Id<"surveyResults">`
- `reassessmentType: string`

**Computes**
- score change
- pillar movement
- changed risk band
- progress summary

**Writes**
- `reassessments`

**Returns**
- comparison object

---

## Frontend result object builders

#### `buildCatabolicFrontendResult`
**Type:** internal helper

**Returns**
- title
- subtitle
- score line
- pathway badge
- summary body
- alert box data
- primary CTA
- secondary CTA

---

#### `buildFunctionalFrontendResult`
**Type:** internal helper

**Returns**
- title
- score line
- strongest area
- weakest pillar
- lowest category
- pillar cards
- category cards
- next step recommendation
- CTA set

---

#### `buildDashboardCardSet`
**Type:** internal helper

**Returns**
- overview card
- pathway card
- category and pillar summaries
- progress cards
- recommended actions list

---

## Recommended function order for V1

### Must-have
1. `getSurveyBySlug`
2. `startSubmission`
3. `saveResponse`
4. `completeSubmission`
5. `scoreCatabolicCrisis`
6. `scoreFunctionalScorecard`
7. `getResultBySubmissionId`

### Next layer
8. `buildCombinedResult`
9. `getLatestResultsForUser`
10. `createReassessmentComparison`

### Later
11. dashboard summary functions
12. PDF/report snapshot functions
13. admin reporting functions

---

## Implementation guidance

### Autosave
Prefer saving one response at a time to prevent data loss on mobile.

### Deterministic scoring
Score functions should be deterministic and version-aware.

### Survey version safety
A submission should always score against the survey version that generated it.

### Keep frontend dumb
Let Convex return frontend-ready result objects so the app UI stays simpler.

### Separate scoring from content copy where possible
Store labels and CTA keys centrally so copy changes do not require rewriting score math.
